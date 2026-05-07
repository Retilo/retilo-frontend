"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  RefreshCw, Zap, TrendingUp, TrendingDown, Minus, Sun,
  CloudRain, Calendar, Sparkles, ChevronDown, ChevronLeft, MapPin, X, Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ModuleHelper } from "@/components/module-helper";

// ── Types ─────────────────────────────────────────────────────────────────────

interface DemandDriver {
  type: "weather" | "holiday" | "festival" | "sports" | "movie" | "other";
  label: string;
  impact: number;
}

interface TodayDemand {
  multiplier: number;
  label: string;
  drivers: DemandDriver[];
  recommendation: string;
  generatedAt: string;
}

interface ForecastDay {
  date: string;
  multiplier: number;
  label: string;
  drivers: DemandDriver[];
  recommendation?: string;
}

interface Location {
  id: string | number;
  name?: string;
  title?: string;
  google_location_id: string;
  lat?: number | null;
  lng?: number | null;
}

// ── API Normalizers ───────────────────────────────────────────────────────────

function normalizeDriverType(t: string): DemandDriver["type"] {
  if (t === "weather")  return "weather";
  if (t === "holiday")  return "holiday";
  if (t === "festival") return "festival";
  if (t === "sports")   return "sports";
  if (t === "movie")    return "movie";
  return "other";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeDemandDay(raw: any) {
  const multiplier: number = raw.compositeMultiplier ?? raw.multiplier ?? 1;
  const drivers: DemandDriver[] = (raw.drivers ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((d: any): DemandDriver => ({
      type: normalizeDriverType(d.type),
      label: d.signal ?? d.label ?? d.type,
      // factor - 1 gives signed decimal impact (e.g. 1.15 → +0.15, 0.95 → -0.05)
      impact: typeof d.impact === "number" ? d.impact : (d.factor != null ? d.factor - 1 : 0),
    }))
    .filter((d: DemandDriver) => Math.abs(d.impact) > 0.001); // drop zero-impact entries
  return { multiplier, drivers, recommendation: raw.recommendation ?? "" };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function demandColor(multiplier: number) {
  if (multiplier >= 1.6) return { color: "#dc2626", bg: "#fee2e2", label: "Peak",        ring: "#fca5a5" };
  if (multiplier >= 1.3) return { color: "#ea580c", bg: "#ffedd5", label: "High",        ring: "#fdba74" };
  if (multiplier >= 1.1) return { color: "#d97706", bg: "#fef3c7", label: "Above avg",   ring: "#fcd34d" };
  if (multiplier >= 0.9) return { color: "#16a34a", bg: "#dcfce7", label: "Baseline",    ring: "#86efac" };
  if (multiplier >= 0.7) return { color: "#2563eb", bg: "#dbeafe", label: "Below avg",   ring: "#93c5fd" };
  return                        { color: "#6b7280", bg: "#f3f4f6", label: "Slow",        ring: "#d1d5db" };
}

function driverIcon(type: DemandDriver["type"]) {
  switch (type) {
    case "weather":  return "🌦";
    case "holiday":  return "🎉";
    case "festival": return "🪔";
    case "sports":   return "🏏";
    case "movie":    return "🎬";
    default:         return "✦";
  }
}

function formatMultiplier(m: number) {
  return `${m.toFixed(2)}×`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });
}

function formatShortDay(dateStr: string) {
  const d = new Date(dateStr);
  return { day: d.toLocaleDateString("en-IN", { weekday: "short" }), date: d.getDate() };
}

// ── Radial Gauge ──────────────────────────────────────────────────────────────

function DemandGauge({ multiplier, label: demandLabel }: { multiplier: number; label: string }) {
  const [animated, setAnimated] = useState(0);
  const { color, ring } = demandColor(multiplier);

  useEffect(() => {
    let rafId: number;
    let startTime: number | null = null;
    const duration = 1200;
    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimated(eased * multiplier);
      if (progress < 1) rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [multiplier]);

  const SIZE = 200;
  const cx = SIZE / 2;
  const cy = SIZE / 2 + 20;
  const R = 82;
  const startAngle = -200;
  const endAngle = 20;
  const totalAngle = endAngle - startAngle;

  const MAX_MULTIPLIER = 2.0;
  const pct = Math.min(animated / MAX_MULTIPLIER, 1);
  const currentAngle = startAngle + totalAngle * pct;

  function polarToXY(angleDeg: number, r: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arcPath(from: number, to: number, r: number) {
    const s = polarToXY(from, r);
    const e = polarToXY(to, r);
    const large = Math.abs(to - from) > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const TICKS = [0, 0.5, 1.0, 1.5, 2.0];
  const pctChange = Math.round((multiplier - 1) * 100);
  const isAbove = pctChange >= 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={SIZE} height={SIZE - 15} viewBox={`0 0 ${SIZE} ${SIZE - 15}`}>
        {/* Track */}
        <path
          d={arcPath(startAngle, endAngle, R)}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Color zones */}
        {[
          { from: startAngle, to: startAngle + totalAngle * 0.35, color: "#93c5fd" },
          { from: startAngle + totalAngle * 0.35, to: startAngle + totalAngle * 0.55, color: "#86efac" },
          { from: startAngle + totalAngle * 0.55, to: startAngle + totalAngle * 0.7,  color: "#fcd34d" },
          { from: startAngle + totalAngle * 0.7,  to: startAngle + totalAngle * 0.85, color: "#fdba74" },
          { from: startAngle + totalAngle * 0.85, to: endAngle,                        color: "#fca5a5" },
        ].map((zone, i) => (
          <path
            key={i}
            d={arcPath(zone.from, zone.to, R)}
            fill="none"
            stroke={zone.color}
            strokeWidth="14"
            strokeLinecap="round"
            opacity={0.35}
          />
        ))}
        {/* Active fill */}
        <motion.path
          d={arcPath(startAngle, currentAngle, R)}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        {/* Needle dot */}
        {(() => {
          const tip = polarToXY(currentAngle, R);
          return (
            <motion.circle
              cx={tip.x} cy={tip.y} r="7"
              fill={color}
              stroke="white"
              strokeWidth="2.5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 300 }}
            />
          );
        })()}
        {/* Tick labels */}
        {TICKS.map((val) => {
          const a = startAngle + totalAngle * (val / MAX_MULTIPLIER);
          const p = polarToXY(a, R + 22);
          return (
            <text key={val} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central"
              style={{ fontSize: 10, fill: "#9ca3af", fontFamily: "inherit" }}>
              {val}×
            </text>
          );
        })}
        {/* Center display */}
        <text x={cx} y={cy - 10} textAnchor="middle" dominantBaseline="central"
          style={{ fontSize: 34, fontWeight: 800, fill: color, fontFamily: "inherit" }}>
          {animated.toFixed(2)}×
        </text>
        <text x={cx} y={cy + 20} textAnchor="middle"
          style={{ fontSize: 12, fontWeight: 600, fill: "#6b7280", fontFamily: "inherit" }}>
          {demandLabel}
        </text>
      </svg>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="flex items-center gap-1.5 text-sm font-semibold"
        style={{ color }}
      >
        {isAbove ? <TrendingUp className="w-4 h-4" /> : pctChange === 0 ? <Minus className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        {isAbove ? "+" : ""}{pctChange}% vs baseline
      </motion.div>
    </div>
  );
}

// ── 7-Day Forecast Bar ────────────────────────────────────────────────────────

function ForecastBar({ day, index, isToday }: { day: ForecastDay; index: number; isToday: boolean }) {
  const { color, ring } = demandColor(day.multiplier);
  const MAX_MULTIPLIER = 2.0;
  const heightPct = Math.min(day.multiplier / MAX_MULTIPLIER, 1);
  const { day: dayLabel, date } = formatShortDay(day.date);
  const topDrivers = day.drivers.slice(0, 3);
  const [hovered, setHovered] = useState(false);

  return (
    <div className="flex flex-col items-center gap-2 flex-1 relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {/* Event chips above bar */}
      <div className="flex flex-col items-center gap-1 min-h-[40px] justify-end">
        {topDrivers.slice(0, 2).map((d, i) => (
          <span key={i} className="text-base leading-none" title={d.label}>{driverIcon(d.type)}</span>
        ))}
      </div>

      {/* Bar */}
      <div className="w-full flex items-end justify-center" style={{ height: 120 }}>
        <motion.div
          className="w-8 rounded-t-lg relative"
          style={{ background: isToday ? color : `${color}88`, border: isToday ? `2px solid ${color}` : `1px solid ${ring}` }}
          initial={{ height: 0 }}
          animate={{ height: `${Math.max(heightPct * 120, 12)}px` }}
          transition={{ duration: 0.8, delay: 0.1 + index * 0.07, ease: "easeOut" }}
        >
          {isToday && (
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full" style={{ background: color }} />
          )}
        </motion.div>
      </div>

      {/* Day label */}
      <div className="text-center">
        <div className="text-xs font-semibold" style={{ color: isToday ? color : "#374151" }}>{dayLabel}</div>
        <div className="text-[10px] text-gray-400">{date}</div>
      </div>

      {/* Multiplier */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 + index * 0.07 }}
        className="text-xs font-bold tabular-nums"
        style={{ color }}
      >
        {formatMultiplier(day.multiplier)}
      </motion.div>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 z-20 left-1/2 -translate-x-1/2 rounded-xl p-3 shadow-lg min-w-[160px]"
            style={{ background: "white", border: `1px solid ${ring}`, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
          >
            <div className="font-bold text-xs text-gray-800 mb-1">{formatDate(day.date)}</div>
            <div className="text-xs font-bold mb-2" style={{ color }}>{formatMultiplier(day.multiplier)} — {day.label}</div>
            <div className="space-y-1">
              {day.drivers.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span>{driverIcon(d.type)}</span>
                  <span>{d.label}</span>
                  <span className="ml-auto font-medium" style={{ color: d.impact > 0 ? "#16a34a" : "#dc2626" }}>
                    {d.impact > 0 ? "+" : ""}{Math.round(d.impact * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Driver Breakdown ──────────────────────────────────────────────────────────

function DriverBreakdown({ drivers }: { drivers: DemandDriver[] }) {
  if (!drivers.length) return null;
  const total = drivers.reduce((s, d) => s + Math.abs(d.impact), 0);
  return (
    <div className="space-y-3">
      {drivers.map((d, i) => {
        const isPositive = d.impact >= 0;
        const pct = total > 0 ? Math.abs(d.impact) / total : 0;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            className="flex items-center gap-3"
          >
            <span className="text-xl shrink-0">{driverIcon(d.type)}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700 truncate">{d.label}</span>
                <span className="text-xs font-bold tabular-nums ml-2 shrink-0" style={{ color: isPositive ? "#16a34a" : "#dc2626" }}>
                  {isPositive ? "+" : ""}{Math.round(d.impact * 100)}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: isPositive ? "#16a34a" : "#dc2626" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.06, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Mock data (used when API hasn't returned yet) ─────────────────────────────

function mockToday(): TodayDemand {
  return {
    multiplier: 1.32,
    label: "High",
    drivers: [
      { type: "sports",   label: "IPL Match tonight",       impact: 0.18 },
      { type: "weather",  label: "Clear weather expected",   impact: 0.08 },
      { type: "holiday",  label: "Saturday weekend",         impact: 0.06 },
    ],
    recommendation: "Stock up on popular items and consider adding extra staff for evening rush.",
    generatedAt: new Date().toISOString(),
  };
}

function mockForecast(): ForecastDay[] {
  const days = 7;
  const today = new Date();
  const multipliers = [1.32, 0.94, 1.12, 1.48, 0.88, 1.72, 2.01];
  const labels = ["High", "Below avg", "Above avg", "High", "Below avg", "Peak", "Peak"];
  const driverSets: DemandDriver[][] = [
    [{ type: "sports", label: "IPL tonight", impact: 0.18 }, { type: "weather", label: "Clear", impact: 0.08 }],
    [],
    [{ type: "festival", label: "Eid celebrations", impact: 0.12 }],
    [{ type: "movie", label: "New blockbuster release", impact: 0.25 }, { type: "holiday", label: "Holiday", impact: 0.12 }],
    [],
    [{ type: "holiday", label: "Diwali", impact: 0.48 }, { type: "festival", label: "Diwali celebrations", impact: 0.20 }],
    [{ type: "holiday", label: "Diwali Day 2", impact: 0.40 }, { type: "festival", label: "Post-Diwali", impact: 0.30 }],
  ];
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      date: d.toISOString().split("T")[0],
      multiplier: multipliers[i],
      label: labels[i],
      drivers: driverSets[i],
    };
  });
}

// ── Coordinates Picker Modal ──────────────────────────────────────────────────

type PlacePrediction = { place_id: string; name: string; address: string };

function CoordinatesPicker({
  locationId,
  locationName,
  onSave,
  onClose,
}: {
  locationId: string;
  locationName: string;
  onSave: (lat: number, lng: number) => void;
  onClose: () => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlacePrediction[]>([]);
  const [searching, setSearching] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize map immediately — don't block on geolocation
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const DEFAULT_CENTER: [number, number] = [77.5946, 12.9716];

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      center: DEFAULT_CENTER,
      zoom: 13,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");

    const el = document.createElement("div");
    el.style.cssText = `
      width:32px;height:32px;border-radius:50%;
      background:oklch(0.58 0.24 350);
      border:3px solid white;
      box-shadow:0 2px 12px rgba(0,0,0,0.3);
      cursor:grab;
    `;

    const marker = new maplibregl.Marker({ element: el, draggable: true })
      .setLngLat(DEFAULT_CENTER)
      .addTo(map);

    const updateCoords = () => {
      const { lng, lat } = marker.getLngLat();
      setCoords({ lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) });
    };

    marker.on("dragend", updateCoords);
    map.on("click", (e) => {
      marker.setLngLat(e.lngLat);
      updateCoords();
    });

    map.once("load", updateCoords);

    mapRef.current = map;
    markerRef.current = marker;

    // After map loads, pan to browser geolocation if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const center: [number, number] = [pos.coords.longitude, pos.coords.latitude];
          mapRef.current?.flyTo({ center, zoom: 15, duration: 1200 });
          markerRef.current?.setLngLat(center);
          setCoords({ lat: parseFloat(pos.coords.latitude.toFixed(6)), lng: parseFloat(pos.coords.longitude.toFixed(6)) });
        },
        () => { /* keep default */ },
        { timeout: 4000 },
      );
    }

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setSearchResults([]);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (val.length < 2) return;
    searchDebounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get("/v1/places/autocomplete", { params: { input: val } });
        setSearchResults(res.data?.predictions ?? []);
      } catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 350);
  };

  const handleSearchSelect = async (p: PlacePrediction) => {
    setSearchQuery(p.name);
    setSearchResults([]);
    try {
      const res = await api.get("/v1/places/details", { params: { placeId: p.place_id } });
      // API returns { code, data: { place_id, name, address, lat, lng } }
      const detail = res.data?.data;
      const lat = detail?.lat;
      const lng = detail?.lng;
      if (lat && lng) {
        const center: [number, number] = [lng, lat];
        mapRef.current?.flyTo({ center, zoom: 16, duration: 1000 });
        markerRef.current?.setLngLat(center);
        setCoords({ lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) });
      }
    } catch { /* map stays, user drags marker */ }
  };

  const handleSave = async () => {
    if (!coords) return;
    setSaving(true);
    try {
      await api.patch(`/v1/gmb/locations/${locationId}/coordinates`, coords);
      onSave(coords.lat, coords.lng);
    } catch {
      onSave(coords.lat, coords.lng);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl" style={{ background: "white" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Pin your store on the map</h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{locationName} — search, then drag the marker to fine-tune</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-4 py-3 border-b border-gray-100 relative">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
            {searching
              ? <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 border-t-violet-500 animate-spin shrink-0" />
              : <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            }
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search area or street to navigate the map…"
              className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(""); setSearchResults([]); }} className="p-0.5 rounded-full hover:bg-gray-200">
                <X className="w-3 h-3 text-gray-400" />
              </button>
            )}
          </div>

          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute left-4 right-4 top-full mt-1 bg-white rounded-xl overflow-hidden z-50"
                style={{ border: "1px solid #e5e7eb", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
              >
                {searchResults.slice(0, 5).map((p, i) => (
                  <button
                    key={p.place_id}
                    onClick={() => handleSearchSelect(p)}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-violet-50 transition-colors"
                    style={{ borderBottom: i < searchResults.length - 1 ? "1px solid #f3f4f6" : undefined }}
                  >
                    <MapPin className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-900 truncate">{p.name}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5 truncate">{p.address}</div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Map */}
        <div ref={mapContainerRef} style={{ height: 300 }} />

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50">
          <div className="text-xs text-gray-500 font-mono">
            {coords ? `${coords.lat}, ${coords.lng}` : "Move the marker to your store…"}
          </div>
          <button
            onClick={handleSave}
            disabled={!coords || saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-50 active:scale-95"
            style={{ background: "oklch(0.58 0.24 350)" }}
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            {saving ? "Saving…" : "Save & Generate"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DemandPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [today, setToday] = useState<TodayDemand | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [useMock, setUseMock] = useState(false);
  const [showCoordsPicker, setShowCoordsPicker] = useState(false);

  const loadLocations = useCallback(async () => {
    try {
      const res = await api.get("/v1/gmb/locations");
      const locs: Location[] = res.data?.data ?? res.data?.locations ?? [];
      setLocations(locs);
      if (locs.length > 0) {
        setSelectedLocationId(id => id || String(locs[0].id));
      } else {
        // No GMB locations connected — show mock
        setUseMock(true);
        setToday(mockToday());
        setForecast(mockForecast());
        setLoading(false);
      }
    } catch {
      setUseMock(true);
      setToday(mockToday());
      setForecast(mockForecast());
      setLoading(false);
    }
  }, []);

  const loadDemand = useCallback(async (locationId: string) => {
    if (!locationId) return;
    setLoading(true);
    setError("");
    setUseMock(false);
    try {
      const [todayRes, forecastRes] = await Promise.all([
        api.get("/v1/demand-signals/today", { params: { locationId } }),
        api.get("/v1/demand-signals/forecast", { params: { locationId, days: 7 } }),
      ]);
      const rawToday = todayRes.data?.data ?? null;
      if (rawToday) {
        const n = normalizeDemandDay(rawToday);
        setToday({
          multiplier: n.multiplier,
          label: demandColor(n.multiplier).label,
          drivers: n.drivers,
          recommendation: n.recommendation,
          generatedAt: rawToday.updatedAt ?? new Date().toISOString(),
        });
      } else {
        setToday(null);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawForecast: any[] = forecastRes.data?.data ?? [];
      setForecast(rawForecast.map(raw => {
        const n = normalizeDemandDay(raw);
        return {
          date: raw.date,
          multiplier: n.multiplier,
          label: demandColor(n.multiplier).label,
          drivers: n.drivers,
          recommendation: n.recommendation,
        };
      }));
    } catch {
      setUseMock(true);
      setToday(mockToday());
      setForecast(mockForecast());
    } finally {
      setLoading(false);
    }
  }, []);

  const doRefresh = useCallback(async (lat: number, lng: number) => {
    setRefreshing(true);
    try {
      await api.post("/v1/demand-signals/refresh", { lat, lng, locationId: selectedLocationId });
      await loadDemand(selectedLocationId);
    } catch {
      await loadDemand(selectedLocationId);
    } finally {
      setRefreshing(false);
    }
  }, [selectedLocationId, loadDemand]);

  const handleRefresh = () => {
    if (!selectedLocationId) return;
    const loc = locations.find(l => String(l.id) === String(selectedLocationId));
    if (loc?.lat && loc?.lng) {
      doRefresh(loc.lat, loc.lng);
    } else {
      // No coordinates stored — open the map picker
      setShowCoordsPicker(true);
    }
  };

  const handleCoordsSaved = (lat: number, lng: number) => {
    setLocations(prev => prev.map(l => String(l.id) === String(selectedLocationId) ? { ...l, lat, lng } : l));
    setShowCoordsPicker(false);
    doRefresh(lat, lng);
  };

  // Load locations once on mount; don't pre-fill mock until we know there are no locations
  useEffect(() => { loadLocations(); }, []);
  // Load demand whenever locationId changes (loadLocations sets it, or user switches)
  useEffect(() => {
    if (selectedLocationId) loadDemand(selectedLocationId);
  }, [selectedLocationId, loadDemand]);

  const selectedLocation = locations.find(l => String(l.id) === String(selectedLocationId));
  const todayForecast = forecast[0];
  const futureForecast = forecast;

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.985 0.003 350)", fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between max-w-6xl mx-auto">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-7 h-7 rounded-lg transition-all hover:bg-black/6 active:scale-95 shrink-0"
              style={{ color: "oklch(0.55 0.008 270)" }}
              aria-label="Go back"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
            </button>
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "oklch(0.58 0.24 350)" }}>
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">Demand Signals</h1>
            {useMock && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">Demo data</span>
            )}
          </div>
          <p className="text-gray-400 text-sm">Weather · Holidays · Festivals · Events → composite demand multiplier</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Location selector */}
          {locations.length > 0 && (
            <div className="relative">
              <select
                value={selectedLocationId}
                onChange={e => setSelectedLocationId(e.target.value)}
                className="appearance-none pl-8 pr-8 py-2 text-sm font-medium text-gray-700 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-200 cursor-pointer"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
              >
                {locations.map(l => (
                  <option key={l.id} value={l.id}>{(l as any).name ?? (l as any).title ?? l.id}</option>
                ))}
              </select>
              <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-60"
            style={{ background: "oklch(0.58 0.24 350)", boxShadow: "0 2px 8px oklch(0.58 0.24 350 / 0.3)" }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Module helper */}
      <div className="px-6 max-w-6xl mx-auto mb-2">
        <ModuleHelper
          moduleKey="demand-signals-v1"
          title="Reading your demand multiplier"
          description="1.3× means 30% above your baseline. Powered by weather, public holidays, Indian festivals, cricket matches, and movie releases — refreshed daily for your location."
          rimVariant="default"
        />
      </div>

      <div className="px-6 max-w-6xl mx-auto pb-12">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-violet-600 animate-spin" />
          </div>
        ) : !useMock && today === null ? (
          /* Backend has no demand index yet — prompt user to generate */
          <div className="flex flex-col items-center justify-center h-64 gap-5 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "oklch(0.58 0.24 350 / 0.12)" }}>
              <Zap className="w-7 h-7" style={{ color: "oklch(0.52 0.22 350)" }} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-1">No forecast generated yet</h3>
              <p className="text-sm text-gray-400 max-w-xs">Hit <strong>Refresh</strong> to compute today's demand multiplier from weather, festivals, and events for this location.</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-60"
              style={{ background: "oklch(0.58 0.24 350)", boxShadow: "0 2px 8px oklch(0.58 0.24 350 / 0.3)" }}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Generating…" : "Generate Forecast"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left column: Gauge + Drivers ── */}
            <div className="flex flex-col gap-6">
              {/* Today's demand gauge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-white p-6 flex flex-col items-center gap-4"
                style={{ border: "1px solid #f3f4f6", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
              >
                <div className="flex items-center gap-2 self-start">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Today's Demand</span>
                </div>
                {today && (
                  <DemandGauge multiplier={today.multiplier} label={today.label} />
                )}
                {today?.recommendation && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="w-full rounded-xl p-3 bg-violet-50 border border-violet-100"
                  >
                    <div className="flex items-start gap-2">
                      <Zap className="w-3.5 h-3.5 text-violet-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-violet-700 leading-relaxed">{today.recommendation}</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Driver breakdown */}
              {today?.drivers && today.drivers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="rounded-2xl bg-white p-5"
                  style={{ border: "1px solid #f3f4f6", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">What's driving demand</span>
                  </div>
                  <DriverBreakdown drivers={today.drivers} />
                </motion.div>
              )}
            </div>

            {/* ── Right column: 7-day forecast ── */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl bg-white p-6"
                style={{ border: "1px solid #f3f4f6", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">7-Day Demand Forecast</span>
                  <span className="ml-auto text-[10px] text-gray-400">Hover each day for details</span>
                </div>

                {/* Color legend */}
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  {[
                    { label: "Slow",       color: "#6b7280" },
                    { label: "Below avg",  color: "#2563eb" },
                    { label: "Baseline",   color: "#16a34a" },
                    { label: "Above avg",  color: "#d97706" },
                    { label: "High",       color: "#ea580c" },
                    { label: "Peak",       color: "#dc2626" },
                  ].map(({ label: l, color: c }) => (
                    <div key={l} className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                      <span className="text-[10px] text-gray-500">{l}</span>
                    </div>
                  ))}
                </div>

                {/* Bars */}
                <div className="flex items-end gap-2">
                  {futureForecast.map((day, i) => {
                    const todayStr = new Date().toISOString().split("T")[0];
                    return (
                      <ForecastBar key={day.date} day={day} index={i} isToday={day.date === todayStr} />
                    );
                  })}
                </div>
              </motion.div>

              {/* Demand scale explainer */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="rounded-2xl bg-white p-5"
                style={{ border: "1px solid #f3f4f6", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Reading the multiplier</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { range: "< 0.8×", label: "Slow day",     tip: "Consider promos or off-peak deals",  color: "#6b7280", bg: "#f3f4f6" },
                    { range: "0.8–1.1×", label: "Baseline",   tip: "Normal staffing & inventory",        color: "#16a34a", bg: "#dcfce7" },
                    { range: "1.1–1.3×", label: "Above avg",  tip: "Small buffer stock recommended",     color: "#d97706", bg: "#fef3c7" },
                    { range: "1.3–1.6×", label: "High",       tip: "Extra staff + inventory prep",       color: "#ea580c", bg: "#ffedd5" },
                    { range: "1.6–2.0×", label: "Peak",       tip: "Full capacity, limit wait times",    color: "#dc2626", bg: "#fee2e2" },
                    { range: "> 2.0×",  label: "Extreme",    tip: "Special event prep, pre-orders",     color: "#7c3aed", bg: "#ede9fe" },
                  ].map(({ range, label: l, tip, color, bg }) => (
                    <div key={range} className="rounded-xl p-3" style={{ background: bg }}>
                      <div className="font-bold text-xs" style={{ color }}>{range}</div>
                      <div className="font-semibold text-xs mt-0.5" style={{ color }}>{l}</div>
                      <div className="text-[10px] text-gray-500 mt-1 leading-relaxed">{tip}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>

      {/* Coordinates picker modal */}
      {showCoordsPicker && (() => {
        const loc = locations.find(l => String(l.id) === String(selectedLocationId));
        if (!loc) return null;
        return (
          <CoordinatesPicker
            locationId={String(loc.id)}
            locationName={(loc.name ?? loc.title) || String(loc.id)}
            onSave={handleCoordsSaved}
            onClose={() => setShowCoordsPicker(false)}
          />
        );
      })()}
    </div>
  );
}
