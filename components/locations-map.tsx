"use client"

// LocationsMap — plots all connected GMB locations on a map so a brand can see
// its entire footprint at a glance. Pins are colored by rating; click a pin to
// select the matching location card. Uses the free CARTO basemap (no API key).

import { useEffect, useRef, useState, useCallback } from "react"
import type { Map as MaplibreMap } from "maplibre-gl"
import type { MapboxOverlay } from "@deck.gl/mapbox"
import type { PickingInfo } from "deck.gl"
import { cn } from "@/lib/utils"

export interface MapLocation {
  id: number | string
  google_location_id?: string
  title: string
  lat: number
  lng: number
  average_rating?: number | null
  total_review_count?: number | null
  address?: string | null
}

type TooltipState = {
  x: number
  y: number
  loc: MapLocation
} | null

interface LocationsMapProps {
  locations: MapLocation[]
  selectedId?: number | string | null
  onSelect?: (loc: MapLocation) => void
  className?: string
}

const CARTO_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
const PINK = "oklch(0.58 0.24 350)"
const CARD_BG = "oklch(1 0 0)"
const CARD_BORDER = "oklch(0.91 0.008 350)"
const TEXT = "oklch(0.14 0.008 270)"
const TEXT_MUTED = "oklch(0.55 0.008 270)"
const TEXT_FAINT = "oklch(0.65 0.008 270)"

// Color a pin by rating. Locations with no reviews yet get a neutral tone.
function ratingColor(loc: MapLocation): [number, number, number, number] {
  const r = loc.average_rating ?? 0
  const hasReviews = (loc.total_review_count ?? 0) > 0
  if (!hasReviews || r <= 0) return [148, 163, 184, 220] // slate — not rated yet
  if (r >= 4.5) return [34, 197, 94, 230]
  if (r >= 3.5) return [234, 179, 8, 230]
  return [239, 68, 68, 230]
}

function ratingSwatch(loc: MapLocation): string {
  const r = loc.average_rating ?? 0
  const hasReviews = (loc.total_review_count ?? 0) > 0
  if (!hasReviews || r <= 0) return "#94a3b8"
  if (r >= 4.5) return "#22c55e"
  if (r >= 3.5) return "#eab308"
  return "#ef4444"
}

export function LocationsMap({ locations, selectedId, onSelect, className }: LocationsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MaplibreMap | null>(null)
  const overlayRef = useRef<MapboxOverlay | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState>(null)
  const [mounted, setMounted] = useState(false)

  // Only locations that actually have coordinates can be mapped.
  const points = locations.filter(
    (l) => typeof l.lat === "number" && typeof l.lng === "number" && !Number.isNaN(l.lat) && !Number.isNaN(l.lng)
  )

  const center = useCallback((): [number, number] => {
    if (!points.length) return [78.9629, 20.5937] // India centroid fallback
    const avgLng = points.reduce((s, p) => s + p.lng, 0) / points.length
    const avgLat = points.reduce((s, p) => s + p.lat, 0) / points.length
    return [avgLng, avgLat]
  }, [points])

  const fitToPoints = useCallback(
    async (map: MaplibreMap) => {
      if (points.length === 0) return
      const maplibregl = (await import("maplibre-gl")).default
      if (points.length === 1) {
        map.jumpTo({ center: [points[0].lng, points[0].lat], zoom: 13 })
        return
      }
      const bounds = new maplibregl.LngLatBounds()
      points.forEach((p) => bounds.extend([p.lng, p.lat]))
      map.fitBounds(bounds, { padding: 64, maxZoom: 14, duration: 0 })
    },
    [points]
  )

  const buildLayers = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (ScatterplotLayer: any) => [
      // Highlight ring under the selected pin
      new ScatterplotLayer({
        id: "location-selected-ring",
        data: points.filter((p) => p.id === selectedId),
        getPosition: (d: MapLocation) => [d.lng, d.lat],
        getFillColor: [232, 62, 140, 60],
        getRadius: 260,
        radiusMinPixels: 22,
        radiusMaxPixels: 44,
        pickable: false,
        stroked: false,
      }),
      new ScatterplotLayer({
        id: "location-points",
        data: points,
        getPosition: (d: MapLocation) => [d.lng, d.lat],
        getFillColor: (d: MapLocation) => ratingColor(d),
        getRadius: 140,
        radiusMinPixels: 11,
        radiusMaxPixels: 30,
        pickable: true,
        stroked: true,
        lineWidthMinPixels: 2,
        getLineColor: (d: MapLocation) =>
          d.id === selectedId ? [232, 62, 140, 255] : [255, 255, 255, 200],
        // deck.gl needs updateTriggers to recompute accessors when selection changes
        updateTriggers: {
          getLineColor: selectedId,
        },
        onHover: (info: PickingInfo) => {
          if (info.object) {
            setTooltip({ x: info.x, y: info.y, loc: info.object as MapLocation })
          } else {
            setTooltip(null)
          }
        },
        onClick: (info: PickingInfo) => {
          if (info.object && onSelect) onSelect(info.object as MapLocation)
        },
      }),
    ],
    [points, selectedId, onSelect]
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialise the map once.
  useEffect(() => {
    if (!mounted || !mapContainerRef.current || mapRef.current) return

    const init = async () => {
      const maplibregl = (await import("maplibre-gl")).default
      const { MapboxOverlay } = await import("@deck.gl/mapbox")
      const { ScatterplotLayer } = await import("deck.gl")

      const [lng, lat] = center()

      const map = new maplibregl.Map({
        container: mapContainerRef.current!,
        style: CARTO_STYLE,
        center: [lng, lat],
        zoom: points.length ? 4 : 3,
        attributionControl: false,
      })

      map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right")
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right")
      map.getCanvas().style.cursor = "default"

      map.on("load", async () => {
        const layers = await buildLayers(ScatterplotLayer)
        const overlay = new MapboxOverlay({ interleaved: false, layers })
        // maplibre-gl is API-compatible with mapbox-gl for addControl
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map.addControl(overlay as any)
        overlayRef.current = overlay
        mapRef.current = map
        await fitToPoints(map)
      })
    }

    init()

    return () => {
      overlayRef.current?.finalize()
      mapRef.current?.remove()
      mapRef.current = null
      overlayRef.current = null
    }
  }, [mounted]) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-draw layers when points or selection change.
  useEffect(() => {
    if (!overlayRef.current || !mounted) return
    const update = async () => {
      const { ScatterplotLayer } = await import("deck.gl")
      const layers = await buildLayers(ScatterplotLayer)
      overlayRef.current?.setProps({ layers })
    }
    update()
  }, [mounted, buildLayers])

  // When a location is selected elsewhere (e.g. a card is expanded), pan to it.
  useEffect(() => {
    if (!mapRef.current || selectedId == null) return
    const target = points.find((p) => p.id === selectedId)
    if (target) mapRef.current.easeTo({ center: [target.lng, target.lat], duration: 500 })
  }, [selectedId]) // eslint-disable-line react-hooks/exhaustive-deps

  const unmappedCount = locations.length - points.length

  return (
    <div className={cn("relative w-full h-full rounded-2xl overflow-hidden", className)}>
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {!mounted && (
        <div className="absolute inset-0 animate-pulse rounded-2xl" style={{ background: "oklch(0.95 0.005 350)" }} />
      )}

      {/* Empty state — mounted but nothing to plot */}
      {mounted && points.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="rounded-xl px-4 py-3 text-xs text-center max-w-[240px]"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, color: TEXT_MUTED }}
          >
            No mapped locations yet. Sync from Google to pull each location&apos;s coordinates.
          </div>
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-50 rounded-xl px-3 py-2.5 shadow-xl text-xs"
          style={{
            left: tooltip.x + 14,
            top: tooltip.y - 8,
            background: CARD_BG,
            border: `1px solid ${CARD_BORDER}`,
            minWidth: 160,
            maxWidth: 240,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ratingSwatch(tooltip.loc) }} />
            <span className="font-semibold truncate" style={{ color: TEXT }}>{tooltip.loc.title}</span>
          </div>
          <div className="flex items-center gap-2 mb-0.5" style={{ color: TEXT_MUTED }}>
            {(tooltip.loc.total_review_count ?? 0) > 0 ? (
              <>
                <span className="font-medium" style={{ color: TEXT }}>★ {(tooltip.loc.average_rating ?? 0).toFixed(1)}</span>
                <span>· {tooltip.loc.total_review_count} reviews</span>
              </>
            ) : (
              <span>No reviews yet</span>
            )}
          </div>
          {tooltip.loc.address && (
            <div className="line-clamp-2" style={{ color: TEXT_FAINT }}>{tooltip.loc.address}</div>
          )}
        </div>
      )}

      {/* Legend */}
      <div
        className="absolute bottom-4 left-4 z-10 rounded-xl px-3 py-2.5 text-xs space-y-1.5"
        style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
      >
        <div className="font-semibold mb-1" style={{ color: TEXT }}>Rating</div>
        {[
          { color: "#22c55e", label: "4.5+" },
          { color: "#eab308", label: "3.5–4.4" },
          { color: "#ef4444", label: "Below 3.5" },
          { color: "#94a3b8", label: "Not rated" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
            <span style={{ color: TEXT_MUTED }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Count badge */}
      <div
        className="absolute top-4 left-4 z-10 rounded-xl px-3 py-1.5 text-xs font-semibold"
        style={{ background: `${PINK}18`, border: `1px solid ${PINK}30`, color: PINK }}
      >
        {points.length} {points.length === 1 ? "location" : "locations"}
        {unmappedCount > 0 && (
          <span className="ml-1 font-medium opacity-70">· {unmappedCount} unmapped</span>
        )}
      </div>
    </div>
  )
}
