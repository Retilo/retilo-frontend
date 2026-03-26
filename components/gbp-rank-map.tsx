"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { Map as MaplibreMap } from "maplibre-gl"
import type { MapboxOverlay } from "@deck.gl/mapbox"
import type { PickingInfo } from "deck.gl"
import { cn } from "@/lib/utils"

interface RankPoint {
  lat: number
  lng: number
  rank: number
}

type TooltipState = {
  x: number
  y: number
  point: RankPoint
} | null

interface GBPRankMapProps {
  points: RankPoint[]
  className?: string
}

function getRankColor(rank: number): [number, number, number, number] {
  if (rank <= 3) return [34, 197, 94, 220]
  if (rank <= 10) return [234, 179, 8, 220]
  return [239, 68, 68, 220]
}

function getRankLabel(rank: number): string {
  if (rank <= 3) return "Top 3"
  if (rank <= 10) return "Top 10"
  return "10+"
}

function getRankBadgeStyle(rank: number): React.CSSProperties {
  if (rank <= 3) return { background: "oklch(0.55 0.18 145)", color: "#fff" }
  if (rank <= 10) return { background: "oklch(0.62 0.18 75)", color: "#fff" }
  return { background: "oklch(0.55 0.22 25)", color: "#fff" }
}

const CARTO_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
const PINK = "oklch(0.58 0.24 350)"
const CARD_BG = "oklch(1 0 0)"
const CARD_BORDER = "oklch(0.91 0.008 350)"
const TEXT = "oklch(0.14 0.008 270)"
const TEXT_MUTED = "oklch(0.55 0.008 270)"

export function GBPRankMap({ points, className }: GBPRankMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MaplibreMap | null>(null)
  const overlayRef = useRef<MapboxOverlay | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState>(null)
  const [mounted, setMounted] = useState(false)

  const center = useCallback((): [number, number] => {
    if (!points.length) return [78.48, 17.38]
    const avgLng = points.reduce((s, p) => s + p.lng, 0) / points.length
    const avgLat = points.reduce((s, p) => s + p.lat, 0) / points.length
    return [avgLng, avgLat]
  }, [points])

  const buildLayers = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (ScatterplotLayer: any) => [
      new ScatterplotLayer({
        id: "rank-points",
        data: points,
        getPosition: (d: RankPoint) => [d.lng, d.lat],
        getFillColor: (d: RankPoint) => getRankColor(d.rank),
        getRadius: 120,
        radiusMinPixels: 10,
        radiusMaxPixels: 28,
        pickable: true,
        stroked: true,
        getLineColor: [255, 255, 255, 180],
        lineWidthMinPixels: 2,
        onHover: (info: PickingInfo) => {
          if (info.object) {
            setTooltip({ x: info.x, y: info.y, point: info.object as RankPoint })
          } else {
            setTooltip(null)
          }
        },
      }),
    ],
    [points]
  )

  useEffect(() => {
    setMounted(true)
  }, [])

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
        zoom: 11,
        attributionControl: false,
      })

      map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right")
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right")

      map.on("load", async () => {
        const layers = await buildLayers(ScatterplotLayer)
        const overlay = new MapboxOverlay({ interleaved: false, layers })
        // maplibre-gl is API-compatible with mapbox-gl for addControl
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map.addControl(overlay as any)
        overlayRef.current = overlay
        mapRef.current = map
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

  useEffect(() => {
    if (!overlayRef.current || !mounted) return
    const update = async () => {
      const { ScatterplotLayer } = await import("deck.gl")
      const layers = await buildLayers(ScatterplotLayer)
      overlayRef.current?.setProps({ layers })
    }
    update()
  }, [points, mounted, buildLayers])

  return (
    <div className={cn("relative w-full h-full rounded-2xl overflow-hidden", className)}>
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {!mounted && (
        <div
          className="absolute inset-0 animate-pulse rounded-2xl"
          style={{ background: "oklch(0.95 0.005 350)" }}
        />
      )}

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-50 rounded-xl px-3 py-2.5 shadow-xl text-xs"
          style={{
            left: tooltip.x + 14,
            top: tooltip.y - 60,
            background: CARD_BG,
            border: `1px solid ${CARD_BORDER}`,
            minWidth: 140,
          }}
        >
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <span className="font-semibold" style={{ color: TEXT }}>GBP Rank</span>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
              style={getRankBadgeStyle(tooltip.point.rank)}
            >
              #{tooltip.point.rank}
            </span>
          </div>
          <div className="space-y-0.5">
            <div style={{ color: TEXT_MUTED }}>
              <span className="font-medium">Lat:</span> {tooltip.point.lat.toFixed(5)}
            </div>
            <div style={{ color: TEXT_MUTED }}>
              <span className="font-medium">Lng:</span> {tooltip.point.lng.toFixed(5)}
            </div>
            <div className="pt-1">
              <span
                className="text-[10px] font-semibold"
                style={{
                  color:
                    tooltip.point.rank <= 3
                      ? "oklch(0.50 0.18 145)"
                      : tooltip.point.rank <= 10
                        ? "oklch(0.55 0.18 75)"
                        : "oklch(0.52 0.22 25)",
                }}
              >
                {getRankLabel(tooltip.point.rank)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div
        className="absolute bottom-4 left-4 z-10 rounded-xl px-3 py-2.5 text-xs space-y-1.5"
        style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
      >
        <div className="font-semibold mb-1" style={{ color: TEXT }}>Ranking</div>
        {[
          { color: "#22c55e", label: "Rank 1–3" },
          { color: "#eab308", label: "Rank 4–10" },
          { color: "#ef4444", label: "Rank 10+" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
            <span style={{ color: TEXT_MUTED }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Points count badge */}
      <div
        className="absolute top-4 left-4 z-10 rounded-xl px-3 py-1.5 text-xs font-semibold"
        style={{ background: `${PINK}18`, border: `1px solid ${PINK}30`, color: PINK }}
      >
        {points.length} grid {points.length === 1 ? "point" : "points"}
      </div>
    </div>
  )
}
