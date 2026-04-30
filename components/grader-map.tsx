"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const CARTO_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

export interface GraderMapMarker {
  lat: number;
  lng: number;
  /** "business" = large branded pin; "competitor" = small grey pin */
  type: "business" | "competitor";
  label?: string;
}

interface GraderMapProps {
  markers: GraderMapMarker[];
  className?: string;
  zoom?: number;
  /** Pulsing scan-ring animation around the business marker */
  scanning?: boolean;
}

export function GraderMap({ markers, className, zoom = 13, scanning = false }: GraderMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("maplibre-gl").Map | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !containerRef.current || mapRef.current) return;

    const business = markers.find((m) => m.type === "business");
    const center: [number, number] = business
      ? [business.lng, business.lat]
      : [0, 0];

    let destroyed = false;

    async function init() {
      const maplibregl = (await import("maplibre-gl")).default;
      if (destroyed || !containerRef.current) return;

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: CARTO_STYLE,
        center,
        zoom,
        attributionControl: false,
        interactive: true,
      });

      map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

      map.on("load", () => {
        if (destroyed) return;

        for (const marker of markers) {
          const el = document.createElement("div");

          if (marker.type === "business") {
            el.style.cssText = `
              width: 36px; height: 36px;
              background: hsl(var(--primary));
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 10px rgba(0,0,0,0.25);
              cursor: pointer;
              display: flex; align-items: center; justify-content: center;
            `;
            el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
          } else {
            el.style.cssText = `
              width: 28px; height: 28px;
              background: #64748b;
              border: 2px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 6px rgba(0,0,0,0.2);
              cursor: pointer;
              display: flex; align-items: center; justify-content: center;
            `;
            el.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>`;
          }

          if (marker.label) {
            const popup = new maplibregl.Popup({ offset: 20, closeButton: false, closeOnClick: false })
              .setText(marker.label);
            new maplibregl.Marker({ element: el })
              .setLngLat([marker.lng, marker.lat])
              .setPopup(popup)
              .addTo(map);
            popup.addTo(map);
          } else {
            new maplibregl.Marker({ element: el })
              .setLngLat([marker.lng, marker.lat])
              .addTo(map);
          }
        }
      });

      mapRef.current = map;
    }

    init();

    return () => {
      destroyed = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Find business pin position for pulse overlay (we render it in DOM, not canvas)
  const business = markers.find((m) => m.type === "business");

  return (
    <div className={cn("relative w-full rounded-2xl overflow-hidden border bg-muted", className)}>
      {/* Skeleton until mounted */}
      {!mounted && <div className="absolute inset-0 animate-pulse bg-muted" />}

      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Scanning pulse ring (CSS only, centered on map) */}
      {scanning && business && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary/40 animate-ping absolute inset-0 scale-150" />
            <div className="w-16 h-16 rounded-full border-2 border-primary/20 animate-ping absolute inset-0 scale-[2.5]" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      )}

      {/* Legend */}
      {markers.some((m) => m.type === "competitor") && (
        <div className="absolute bottom-4 left-4 z-10 rounded-xl px-3 py-2 text-xs bg-background/90 border shadow-sm space-y-1.5 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary border border-white" />
            <span className="text-foreground font-medium">Your business</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-500 border border-white" />
            <span className="text-muted-foreground">Competitor</span>
          </div>
        </div>
      )}
    </div>
  );
}
