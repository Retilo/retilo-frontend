"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapboxOverlay as DeckOverlay } from "@deck.gl/mapbox";
import { ScatterplotLayer, TextLayer } from "deck.gl";
import {
  MapPin, Scan, X, Star, TrendingUp,
  Lightbulb, Building2, Navigation, Zap, Coffee, ShoppingBag,
  Hospital, Train, GraduationCap, Hotel, Sparkles, Search, ChevronRight, ChevronLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ModuleHelper } from "@/components/module-helper";

// ── Types ─────────────────────────────────────────────────────────────────────

type Prediction = { place_id: string; name: string; address: string };
type GmbLocation = { id: string; name?: string; title?: string; google_location_id: string };

interface POI {
  id?: string;
  name: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  type?: "direct" | "indirect" | "demand_driver";
  subtype?: string;
  latitude: number;
  longitude: number;
  distanceMeters?: number;
}

interface AreaProfile {
  type: string;
  description: string;
  keyCharacteristics?: string[];
}

interface ScanResult {
  id: string;
  opportunityScore: number;
  competitors: POI[];
  indirectCompetitors: POI[];
  demandDrivers: POI[];
  hexGrid: Array<{ id: string; lat: number; lng: number; density: number }>;
  areaProfile: AreaProfile;
  insights: Array<{
    id: number;
    priority: "high" | "medium" | "low";
    category: string;
    title: string;
    description: string;
    action: string;
  }>;
  center?: { lat: number; lng: number };
  scannedAt: string;
}

// ── API response normaliser ────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeResult(raw: any): ScanResult {
  const direct: POI[] = (raw.competitors?.direct ?? []).map((p: any) => ({
    name: p.name,
    rating: p.rating ?? undefined,
    reviewCount: p.userRatingsTotal ?? undefined,
    category: p.primaryType?.replace(/_/g, " "),
    type: "direct" as const,
    latitude: p.lat,
    longitude: p.lng,
    distanceMeters: p.distance,
  }));

  const indirect: POI[] = (raw.competitors?.indirect ?? []).map((p: any) => ({
    name: p.name,
    rating: p.rating ?? undefined,
    reviewCount: p.userRatingsTotal ?? undefined,
    category: p.primaryType?.replace(/_/g, " "),
    type: "indirect" as const,
    latitude: p.lat,
    longitude: p.lng,
    distanceMeters: p.distance,
  }));

  const drivers: POI[] = (raw.demandDrivers ?? []).map((p: any) => ({
    name: p.name,
    category: p.category,
    type: "demand_driver" as const,
    latitude: p.lat,
    longitude: p.lng,
    distanceMeters: p.distance,
    subtype: p.category,
    footfallEstimate: p.footfallEstimate,
  }));

  const profile = raw.areaProfile ?? {};
  const peakTags: string[] = (profile.peakDayparts ?? []).map((d: string) => `⏱ ${d}`);
  const driverTags: string[] = Object.entries(profile.driverCounts ?? {}).map(
    ([k, v]) => `${v} ${k}${(v as number) > 1 ? "s" : ""} nearby`,
  );

  const insights = (raw.insights ?? []).map((ins: any, i: number) => ({
    id: i + 1,
    priority: (ins.severity === "high" ? "high" : ins.severity === "medium" ? "medium" : "low") as "high" | "medium" | "low",
    category: ins.type ?? "insight",
    title: ins.title,
    description: ins.detail ?? "",
    action: ins.recommendation ?? "",
  }));

  return {
    id: raw.id,
    opportunityScore: raw.scores?.opportunity ?? 0,
    areaProfile: {
      type: (profile.type ?? "commercial").replace(/_/g, " "),
      description: [
        profile.footfallBand ? `${profile.footfallBand} footfall` : null,
        profile.driverCounts ? `${Object.values(profile.driverCounts).reduce((a: number, b) => a + (b as number), 0)} demand anchors nearby` : null,
      ].filter(Boolean).join(" · ") || "Mixed commercial area",
      keyCharacteristics: [...peakTags, ...driverTags],
    },
    competitors: direct,
    indirectCompetitors: indirect,
    demandDrivers: drivers,
    hexGrid: [],
    center: {
      lat: raw.location?.latitude ?? 12.9716,
      lng: raw.location?.longitude ?? 77.5946,
    },
    insights,
    scannedAt: raw.createdAt ?? new Date().toISOString(),
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function opportunityColor(score: number) {
  if (score >= 75) return { color: "#16a34a", bg: "#dcfce7", label: "High Opportunity", ring: "#86efac" };
  if (score >= 50) return { color: "#d97706", bg: "#fef3c7", label: "Moderate",          ring: "#fcd34d" };
  if (score >= 25) return { color: "#ea580c", bg: "#ffedd5", label: "Competitive",       ring: "#fdba74" };
  return                  { color: "#dc2626", bg: "#fee2e2", label: "Saturated",         ring: "#fca5a5" };
}

function priorityColor(p: "high" | "medium" | "low") {
  if (p === "high")   return { color: "#dc2626", bg: "#fee2e2", border: "#fecaca" };
  if (p === "medium") return { color: "#d97706", bg: "#fef3c7", border: "#fde68a" };
  return                     { color: "#16a34a", bg: "#dcfce7", border: "#bbf7d0" };
}

function subtypeIcon(subtype?: string) {
  const s = (subtype ?? "").toLowerCase();
  if (s.includes("hospital") || s.includes("clinic") || s.includes("health")) return <Hospital className="w-3.5 h-3.5" />;
  if (s.includes("train") || s.includes("metro") || s.includes("transit") || s.includes("bus")) return <Train className="w-3.5 h-3.5" />;
  if (s.includes("school") || s.includes("college") || s.includes("university")) return <GraduationCap className="w-3.5 h-3.5" />;
  if (s.includes("hotel") || s.includes("lodge")) return <Hotel className="w-3.5 h-3.5" />;
  if (s.includes("mall") || s.includes("market") || s.includes("shop")) return <ShoppingBag className="w-3.5 h-3.5" />;
  if (s.includes("cafe") || s.includes("coffee")) return <Coffee className="w-3.5 h-3.5" />;
  if (s.includes("office") || s.includes("corporate")) return <Building2 className="w-3.5 h-3.5" />;
  return <Navigation className="w-3.5 h-3.5" />;
}

function mockScan(placeName: string): ScanResult {
  return {
    id: "mock-scan-001",
    opportunityScore: 74,
    areaProfile: {
      type: "Mixed Commercial",
      description: "High foot-traffic urban mixed-use corridor with significant office and retail activity.",
      keyCharacteristics: ["Office district", "Weekend market", "Metro adjacent", "College nearby"],
    },
    competitors: [
      { name: "Chai Sutta Bar", rating: 4.2, reviewCount: 380, category: "Tea & Snacks", type: "direct", latitude: 12.9720, longitude: 77.5950, distanceMeters: 180 },
      { name: "Bombay Brasserie", rating: 4.5, reviewCount: 820, category: "North Indian", type: "direct", latitude: 12.9715, longitude: 77.5940, distanceMeters: 340 },
      { name: "Pind Balluchi", rating: 3.9, reviewCount: 210, category: "Indian", type: "direct", latitude: 12.9718, longitude: 77.5960, distanceMeters: 520 },
    ],
    indirectCompetitors: [
      { name: "McDonald's", rating: 4.0, reviewCount: 1200, category: "Fast Food", type: "indirect", latitude: 12.9722, longitude: 77.5935, distanceMeters: 620 },
    ],
    demandDrivers: [
      { name: "Forum Mall", category: "Mall", type: "demand_driver", subtype: "mall", latitude: 12.9710, longitude: 77.5945, distanceMeters: 250 },
      { name: "Koramangala Metro", category: "Transit", type: "demand_driver", subtype: "metro", latitude: 12.9725, longitude: 77.5955, distanceMeters: 380 },
      { name: "St John's Hospital", category: "Hospital", type: "demand_driver", subtype: "hospital", latitude: 12.9712, longitude: 77.5930, distanceMeters: 480 },
      { name: "IIM Bangalore", category: "Education", type: "demand_driver", subtype: "college", latitude: 12.9708, longitude: 77.5965, distanceMeters: 750 },
    ],
    hexGrid: [],
    center: { lat: 12.9716, lng: 77.5946 },
    insights: [
      { id: 1, priority: "high", category: "Competitive Gap", title: "Rating gap opportunity", description: "Your top competitor has 4.5★ but you're missing 100+ reviews needed to compete.", action: "Launch a review request campaign targeting recent customers." },
      { id: 2, priority: "high", category: "Demand Driver", title: "Mall foot-traffic untapped", description: "Forum Mall generates ~3,000 visitors/day but you have no visibility-boosting offer.", action: "Create a 'Mall Shopper Special' combo and post it on Google Business." },
      { id: 3, priority: "medium", category: "SEO", title: "Metro proximity keyword missing", description: "Queries like 'restaurant near Koramangala metro' show no GBP result for you.", action: "Add transit proximity to your GBP description and website content." },
    ],
    scannedAt: new Date().toISOString(),
  };
}

// ── Opportunity Score Ring ────────────────────────────────────────────────────

function OpportunityRing({ score }: { score: number }) {
  const safeScore = Number.isFinite(score) ? score : 0;
  const [animated, setAnimated] = useState(0);
  const { color } = opportunityColor(safeScore);
  const SIZE = 120;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const R = 48;
  const circ = 2 * Math.PI * R;
  const dash = (animated / 100) * circ;

  useEffect(() => {
    let rafId: number;
    let startTime: number | null = null;
    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / 1200, 1);
      setAnimated(Math.round((1 - Math.pow(1 - progress, 3)) * safeScore));
      if (progress < 1) rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [safeScore]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <motion.circle
          cx={cx} cy={cy} r={R}
          fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold text-2xl leading-none tabular-nums" style={{ color }}>{animated}</span>
        <span className="text-gray-400 text-[10px] leading-none mt-0.5">/100</span>
      </div>
    </div>
  );
}

// ── Map Component ─────────────────────────────────────────────────────────────

function LocationMap({ scan, center }: { scan: ScanResult; center: [number, number] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      center,
      zoom: 15,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");

    const allPOIs = [
      ...(Array.isArray(scan.competitors) ? scan.competitors : []).map(p => ({ ...p, color: [239, 68, 68] as [number, number, number], radius: 14 })),
      ...(Array.isArray(scan.indirectCompetitors) ? scan.indirectCompetitors : []).map(p => ({ ...p, color: [251, 146, 60] as [number, number, number], radius: 10 })),
      ...(Array.isArray(scan.demandDrivers) ? scan.demandDrivers : []).map(p => ({ ...p, color: [59, 130, 246] as [number, number, number], radius: 12 })),
    ];

    const scatterLayer = new ScatterplotLayer({
      id: "pois",
      data: allPOIs,
      getPosition: (d: typeof allPOIs[0]) => [d.longitude, d.latitude],
      getRadius: (d: typeof allPOIs[0]) => d.radius,
      radiusUnits: "meters",
      getFillColor: (d: typeof allPOIs[0]) => [...d.color, 200] as [number, number, number, number],
      getLineColor: (d: typeof allPOIs[0]) => [...d.color, 255] as [number, number, number, number],
      lineWidthMinPixels: 2,
      stroked: true,
      pickable: true,
    });

    const textLayer = new TextLayer({
      id: "poi-labels",
      data: allPOIs.filter(p => p.type === "direct"),
      getPosition: (d: typeof allPOIs[0]) => [d.longitude, d.latitude],
      getText: (d: typeof allPOIs[0]) => d.name,
      getSize: 11,
      getColor: [30, 30, 30, 220],
      getBackgroundColor: [255, 255, 255, 200],
      background: true,
      backgroundPadding: [3, 1, 3, 1],
      getPixelOffset: [0, -22],
      fontFamily: '"Geist", sans-serif',
      fontWeight: "600",
    });

    const overlay = new DeckOverlay({ layers: [scatterLayer, textLayer], interleaved: false });

    map.once("load", () => { map.addControl(overlay); });

    const el = document.createElement("div");
    el.style.cssText = "width:20px;height:20px;border-radius:50%;background:oklch(0.58 0.24 350);border:3px solid white;box-shadow:0 0 0 6px oklch(0.58 0.24 350/0.25),0 2px 8px rgba(0,0,0,0.3);";
    new maplibregl.Marker({ element: el }).setLngLat(center).addTo(map);

    mapRef.current = map;

    return () => {
      overlay.finalize();
      map.remove();
      mapRef.current = null;
    };
  }, [scan, center]);

  return <div ref={containerRef} className="w-full h-full" />;
}

// ── Scan Panel ────────────────────────────────────────────────────────────────

type PanelTab = "overview" | "competitors" | "drivers" | "insights";

function ScanPanel({ scan, placeName, onClose }: { scan: ScanResult; placeName: string; onClose: () => void }) {
  const [tab, setTab] = useState<PanelTab>("overview");
  const { color, bg, label: oppLabel } = opportunityColor(scan.opportunityScore);

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 32 }}
      className="absolute top-0 right-0 h-full w-[380px] bg-white flex flex-col z-10 shadow-2xl"
      style={{ borderLeft: "1px solid #e5e7eb" }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-bold text-gray-900 text-sm leading-tight truncate">{placeName}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Neighbourhood Intelligence Scan</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <OpportunityRing score={scan.opportunityScore} />
          <div>
            <div className="text-xs text-gray-400 font-medium mb-1">Opportunity Score</div>
            <div className="font-bold text-lg leading-none" style={{ color }}>{scan.opportunityScore}/100</div>
            <span className="inline-block mt-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color, background: bg }}>
              {oppLabel}
            </span>
            <div className="text-xs text-gray-400 mt-2">
              {(scan.competitors ?? []).length} direct · {(scan.demandDrivers ?? []).length} demand drivers
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4 flex-wrap">
          {[
            { color: "#ef4444", label: "Direct competitors" },
            { color: "#fb923c", label: "Indirect" },
            { color: "#3b82f6", label: "Demand drivers" },
            { color: "oklch(0.58 0.24 350)", label: "Scanned location" },
          ].map(({ color: c, label: l }) => (
            <div key={l} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c }} />
              <span className="text-[10px] text-gray-500">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-5">
        {(["overview", "competitors", "drivers", "insights"] as PanelTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="py-3 pr-4 text-xs font-semibold capitalize transition-colors relative"
            style={{ color: tab === t ? "oklch(0.52 0.22 350)" : "#9ca3af" }}
          >
            {t}
            {tab === t && (
              <motion.div layoutId="li-tab-indicator" className="absolute bottom-0 left-0 right-4 h-0.5 rounded-full" style={{ background: "oklch(0.58 0.24 350)" }} />
            )}
          </button>
        ))}
      </div>

      {/* Panel body */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <AnimatePresence mode="wait">
          {tab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="rounded-xl p-4 bg-violet-50 border border-violet-100">
                <div className="text-xs font-bold text-violet-700 mb-1">{scan.areaProfile.type}</div>
                <p className="text-xs text-violet-600 leading-relaxed">{scan.areaProfile.description}</p>
                {scan.areaProfile.keyCharacteristics && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {scan.areaProfile.keyCharacteristics.map(c => (
                      <span key={c} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white border border-violet-200 text-violet-700">{c}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { value: (scan.competitors ?? []).length, label: "Direct rivals",   color: "#ef4444" },
                  { value: (scan.demandDrivers ?? []).length, label: "Demand drivers", color: "#3b82f6" },
                  { value: (scan.insights ?? []).filter(i => i.priority === "high").length, label: "High priority", color: "#d97706" },
                ].map(({ value, label: l, color: c }) => (
                  <div key={l} className="rounded-xl p-3 bg-gray-50 border border-gray-100 text-center">
                    <div className="font-bold text-xl" style={{ color: c }}>{value}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{l}</div>
                  </div>
                ))}
              </div>
              {(scan.insights ?? [])[0] && (
                <div className="rounded-xl p-4 border" style={{ background: priorityColor((scan.insights ?? [])[0].priority).bg, borderColor: priorityColor((scan.insights ?? [])[0].priority).border }}>
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: priorityColor((scan.insights ?? [])[0].priority).color }} />
                    <div>
                      <div className="text-xs font-bold" style={{ color: priorityColor((scan.insights ?? [])[0].priority).color }}>{(scan.insights ?? [])[0].title}</div>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{(scan.insights ?? [])[0].description}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {tab === "competitors" && (
            <motion.div key="competitors" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2.5">
              {[...(scan.competitors ?? []), ...(scan.indirectCompetitors ?? [])].map((poi, i) => (
                <motion.div key={poi.name + i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="rounded-xl p-3.5 bg-white border border-gray-100 flex items-start gap-3"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: poi.type === "direct" ? "#fee2e2" : "#ffedd5" }}>
                    <Coffee className="w-3.5 h-3.5" style={{ color: poi.type === "direct" ? "#dc2626" : "#ea580c" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-xs font-semibold text-gray-900 truncate">{poi.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ color: poi.type === "direct" ? "#dc2626" : "#ea580c", background: poi.type === "direct" ? "#fee2e2" : "#ffedd5" }}>
                        {poi.type === "direct" ? "Direct" : "Indirect"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {poi.rating && (
                        <span className="flex items-center gap-0.5 text-[10px] text-yellow-600">
                          <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                          {poi.rating} ({poi.reviewCount?.toLocaleString()})
                        </span>
                      )}
                      {poi.distanceMeters && <span className="text-[10px] text-gray-400">{poi.distanceMeters}m away</span>}
                    </div>
                    {poi.category && <div className="text-[10px] text-gray-400 mt-0.5">{poi.category}</div>}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {tab === "drivers" && (
            <motion.div key="drivers" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2.5">
              <p className="text-xs text-gray-400 mb-3">Nearby places that generate consistent foot traffic and indirect demand for your business.</p>
              {(scan.demandDrivers ?? []).map((poi, i) => (
                <motion.div key={poi.name + i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="rounded-xl p-3.5 bg-white border border-blue-100 flex items-start gap-3"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-blue-50 text-blue-600">
                    {subtypeIcon(poi.subtype ?? poi.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-900 truncate">{poi.name}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{poi.category}</div>
                    {poi.distanceMeters && <div className="text-[10px] text-blue-500 mt-1 font-medium">{poi.distanceMeters}m from you</div>}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {tab === "insights" && (
            <motion.div key="insights" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              {(scan.insights ?? []).map((insight, i) => {
                const { color: pc, bg: pb, border: pborder } = priorityColor(insight.priority);
                return (
                  <motion.div key={insight.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="rounded-xl p-4 border" style={{ background: pb, borderColor: pborder }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <Lightbulb className="w-3 h-3 shrink-0" style={{ color: pc }} />
                        <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: pc }}>{insight.category}</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize shrink-0" style={{ color: pc, background: "white", border: `1px solid ${pborder}` }}>
                        {insight.priority}
                      </span>
                    </div>
                    <div className="font-semibold text-xs text-gray-900 mb-1">{insight.title}</div>
                    <p className="text-xs text-gray-600 leading-relaxed mb-2">{insight.description}</p>
                    <div className="flex items-start gap-1.5">
                      <Zap className="w-3 h-3 mt-0.5 shrink-0" style={{ color: pc }} />
                      <p className="text-xs font-medium leading-relaxed" style={{ color: pc }}>{insight.action}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-5 py-3 border-t border-gray-100">
        <div className="text-[10px] text-gray-400">
          Scanned {new Date(scan.scannedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
        </div>
      </div>
    </motion.div>
  );
}

// ── Places Search Bar ─────────────────────────────────────────────────────────

function PlacesSearch({
  onSelect,
  scanning,
  seed,
}: {
  onSelect: (p: Prediction) => void;
  scanning: boolean;
  seed?: string;
}) {
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selected, setSelected] = useState<Prediction | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevSeedRef = useRef<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchPredictions = useCallback(async (input: string) => {
    if (input.length < 2) { setPredictions([]); return; }
    setIsSearching(true);
    try {
      const res = await api.get("/v1/places/autocomplete", { params: { input } });
      setPredictions(res.data?.predictions ?? []);
    } catch { setPredictions([]); }
    finally { setIsSearching(false); }
  }, []);

  // Chip clicked — fill the search box, focus it, and open autocomplete dropdown
  useEffect(() => {
    if (!seed || seed === prevSeedRef.current) return;
    prevSeedRef.current = seed;
    setSelected(null);
    setPredictions([]);
    setQuery(seed);
    inputRef.current?.focus();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPredictions(seed), 100);
  }, [seed, fetchPredictions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    prevSeedRef.current = "";
    setQuery(val);
    setSelected(null);
    setPredictions([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPredictions(val), 380);
  };

  const handleSelect = (p: Prediction) => {
    setSelected(p);
    setQuery(p.name);
    setPredictions([]);
    onSelect(p);
  };

  const clear = () => {
    setQuery("");
    setSelected(null);
    setPredictions([]);
  };

  return (
    <div className="relative flex-1 max-w-[380px]">
      <div className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-gray-50 border border-gray-200 focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
        {isSearching ? (
          <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 border-t-violet-600 animate-spin shrink-0" />
        ) : (
          <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search any business location…"
          disabled={scanning}
          className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400 min-w-0 disabled:opacity-50"
        />
        {query && (
          <button onClick={clear} className="p-0.5 rounded-full hover:bg-gray-200 transition-colors">
            <X className="w-3 h-3 text-gray-400" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {predictions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.13 }}
            className="absolute top-full left-0 right-0 mt-1.5 rounded-xl overflow-hidden z-50 bg-white"
            style={{ border: "1px solid #e5e7eb", boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)" }}
          >
            {predictions.map((p, i) => (
              <motion.button
                key={p.place_id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => handleSelect(p)}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-violet-50 transition-colors group"
                style={{ borderBottom: i < predictions.length - 1 ? "1px solid #f3f4f6" : undefined }}
              >
                <div className="w-6 h-6 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3 h-3 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-900 truncate">{p.name}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5 truncate">{p.address}</div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-violet-500 shrink-0 mt-0.5" />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LocationIntelligencePage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [error, setError] = useState("");
  const [useMock, setUseMock] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([77.5946, 12.9716]);
  const [selectedPlace, setSelectedPlace] = useState<Prediction | null>(null);
  const [gmbLocations, setGmbLocations] = useState<GmbLocation[]>([]);
  const [searchSeed, setSearchSeed] = useState<string>("");

  useEffect(() => {
    api.get("/v1/gmb/locations")
      .then(res => setGmbLocations(res.data?.data ?? res.data?.locations ?? []))
      .catch(() => {});
  }, []);

  const handlePlaceSelect = (p: Prediction) => {
    setSelectedPlace(p);
    setError("");
  };

  const handleGmbLocationClick = async (loc: GmbLocation) => {
    const name = loc.name ?? loc.title ?? "";
    if (!name) return;
    setSearchSeed(name);
  };

  const handleScan = async () => {
    if (!selectedPlace) { setError("Search and select a business location first"); return; }
    setScanning(true);
    setError("");
    try {
      const res = await api.post("/v1/location-intelligence/scan", {
        placeId: selectedPlace.place_id,
        radiusMeters: 1000,
      });
      const result: ScanResult = normalizeResult(res.data?.data ?? res.data);
      setScan(result);
      setPanelOpen(true);
      if (result.center) {
        setMapCenter([result.center.lng, result.center.lat]);
      } else if ((result.competitors ?? [])[0]) {
        setMapCenter([result.competitors[0].longitude, result.competitors[0].latitude]);
      }
    } catch {
      const mock = mockScan(selectedPlace.name);
      setScan(mock);
      setPanelOpen(true);
      setUseMock(true);
      setMapCenter([77.5946, 12.9716]);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="flex flex-col h-screen" style={{ fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, sans-serif' }}>

      {/* Module helper notification */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-4">
        <ModuleHelper
          moduleKey="location-intelligence-v1"
          title="Neighbourhood Intelligence — how it works"
          description="Search any business location, then run a scan to see nearby competitors, foot-traffic generators (malls, hospitals, transit), and your opportunity score on a live Carto map."
          rimVariant="default"
        />
      </div>

      {/* Top bar */}
      <div className="h-14 bg-white border-b border-gray-100 flex items-center px-5 gap-3 shrink-0 z-20" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-7 h-7 rounded-lg transition-all hover:bg-gray-100 active:scale-95 shrink-0"
          style={{ color: "#9ca3af" }}
          aria-label="Go back"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "oklch(0.58 0.24 350)" }}>
            <Scan className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">Location Intelligence</span>
          {useMock && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">Demo</span>
          )}
        </div>

        {/* GMB quick-pick chips */}
        {gmbLocations.length > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            {gmbLocations.slice(0, 3).map(loc => {
              const name = loc.name ?? loc.title ?? "";
              if (!name) return null;
              return (
                <button
                  key={loc.id}
                  onClick={() => handleGmbLocationClick(loc)}
                  disabled={scanning}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all hover:opacity-80 active:scale-95 disabled:opacity-40 shrink-0"
                  style={{ background: "oklch(0.58 0.24 350 / 0.1)", color: "oklch(0.45 0.20 350)", border: "1px solid oklch(0.58 0.24 350 / 0.2)" }}
                >
                  <MapPin className="w-2.5 h-2.5 shrink-0" />
                  <span className="max-w-[120px] truncate">{name}</span>
                </button>
              );
            })}
            <div className="w-px h-4 bg-gray-200 mx-0.5" />
          </div>
        )}

        {/* Places search */}
        <PlacesSearch onSelect={handlePlaceSelect} scanning={scanning} seed={searchSeed} />

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {selectedPlace && !scanning && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 max-w-[160px] truncate">
              <MapPin className="w-3 h-3 shrink-0 text-violet-400" />
              <span className="truncate">{selectedPlace.name}</span>
            </div>
          )}
          <button
            onClick={handleScan}
            disabled={scanning || !selectedPlace}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
            style={{ background: "oklch(0.58 0.24 350)", boxShadow: selectedPlace ? "0 2px 8px oklch(0.58 0.24 350 / 0.3)" : "none" }}
          >
            {scanning ? (
              <><div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Scanning…</>
            ) : (
              <><Sparkles className="w-3.5 h-3.5" />Run Scan</>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="px-5 py-2 bg-red-50 border-b border-red-100 text-xs text-red-600 font-medium">{error}</div>
      )}

      {/* Map + Results */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Results sidebar (always visible after scan) ── */}
        <AnimatePresence>
          {scan && (
            <motion.div
              initial={{ x: -380, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -380, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="w-[380px] shrink-0 bg-white border-r border-gray-100 flex flex-col overflow-hidden z-10"
              style={{ boxShadow: "2px 0 16px rgba(0,0,0,0.06)" }}
            >
              {/* Sidebar header */}
              <div className="px-4 py-3 border-b border-gray-100 shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <OpportunityRing score={scan.opportunityScore} />
                    <div>
                      <div className="text-xs text-gray-400 font-medium">Opportunity Score</div>
                      {(() => {
                        const { color, bg, label } = opportunityColor(scan.opportunityScore);
                        return (
                          <>
                            <div className="font-bold text-base leading-none mt-0.5" style={{ color }}>{scan.opportunityScore}/100</div>
                            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color, background: bg }}>{label}</span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-gray-700 capitalize">{scan.areaProfile.type}</div>
                    {scan.areaProfile.keyCharacteristics?.slice(0, 2).map(c => (
                      <div key={c} className="text-[10px] text-gray-400 mt-0.5">{c}</div>
                    ))}
                  </div>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-3 flex-wrap">
                  {[
                    { color: "#ef4444", label: "Direct" },
                    { color: "#fb923c", label: "Indirect" },
                    { color: "#3b82f6", label: "Demand driver" },
                  ].map(({ color: c, label: l }) => (
                    <div key={l} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ background: c }} />
                      <span className="text-[10px] text-gray-500">{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">

                {/* Insights */}
                {scan.insights.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Key Insights</div>
                    <div className="space-y-2">
                      {scan.insights.map((ins, i) => {
                        const { color: pc, bg: pb } = priorityColor(ins.priority);
                        return (
                          <div key={ins.id} className="rounded-xl p-3 border" style={{ background: pb, borderColor: pc + "33" }}>
                            <div className="flex items-start gap-2">
                              <Lightbulb className="w-3 h-3 mt-0.5 shrink-0" style={{ color: pc }} />
                              <div>
                                <div className="text-xs font-semibold leading-snug" style={{ color: pc }}>{ins.title}</div>
                                {ins.description && <p className="text-[10px] text-gray-600 mt-0.5 leading-relaxed">{ins.description}</p>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Direct competitors */}
                {scan.competitors.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                      Direct Competitors ({scan.competitors.length})
                    </div>
                    <div className="space-y-1.5">
                      {scan.competitors.map((poi, i) => (
                        <div key={poi.name + i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-red-50 border border-red-100">
                          <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                            <Coffee className="w-3.5 h-3.5 text-red-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-gray-900 truncate">{poi.name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {poi.rating && (
                                <span className="flex items-center gap-0.5 text-[10px] text-yellow-600">
                                  <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                                  {poi.rating}
                                  {poi.reviewCount ? ` (${poi.reviewCount.toLocaleString()})` : ""}
                                </span>
                              )}
                              {poi.distanceMeters !== undefined && (
                                <span className="text-[10px] text-gray-400">{poi.distanceMeters}m</span>
                              )}
                            </div>
                          </div>
                          {poi.category && (
                            <span className="text-[9px] text-red-500 bg-red-100 px-1.5 py-0.5 rounded-full shrink-0 capitalize">{poi.category}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Indirect competitors */}
                {scan.indirectCompetitors.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                      Indirect ({scan.indirectCompetitors.length})
                    </div>
                    <div className="space-y-1.5">
                      {scan.indirectCompetitors.map((poi, i) => (
                        <div key={poi.name + i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-orange-50 border border-orange-100">
                          <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                            <Coffee className="w-3.5 h-3.5 text-orange-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-gray-900 truncate">{poi.name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {poi.rating && (
                                <span className="flex items-center gap-0.5 text-[10px] text-yellow-600">
                                  <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                                  {poi.rating}
                                </span>
                              )}
                              {poi.distanceMeters !== undefined && (
                                <span className="text-[10px] text-gray-400">{poi.distanceMeters}m</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Demand drivers */}
                {scan.demandDrivers.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                      Demand Drivers ({scan.demandDrivers.length})
                    </div>
                    <div className="space-y-1.5">
                      {scan.demandDrivers.map((poi, i) => (
                        <div key={poi.name + i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                            {subtypeIcon(poi.subtype ?? poi.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-gray-900 truncate">{poi.name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-gray-400 capitalize">{poi.category}</span>
                              {poi.distanceMeters !== undefined && (
                                <span className="text-[10px] text-gray-400">{poi.distanceMeters}m</span>
                              )}
                              {(poi as any).footfallEstimate && (
                                <span className="text-[10px] text-blue-600 font-medium">{(poi as any).footfallEstimate}/day</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-[10px] text-gray-400 pb-2">
                  Scanned {new Date(scan.scannedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Map ── */}
        <div className="flex-1 relative">
          {scan ? (
            <LocationMap scan={scan} center={mapCenter} />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: "#f8f9fa" }}>
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: "linear-gradient(rgba(99,102,241,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.15) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 px-4">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="text-center max-w-sm">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: "oklch(0.58 0.24 350)" }}>
                    <Scan className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="font-bold text-gray-900 text-lg mb-2">Neighbourhood Intelligence</h2>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">
                    Search any business above — competitors, foot-traffic drivers, and your opportunity score appear here on a live map.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400">
                    {["Competitor pins", "Demand drivers", "Opportunity score", "AI insights"].map(f => (
                      <span key={f} className="px-2.5 py-1 rounded-full bg-white border border-gray-200">{f}</span>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
