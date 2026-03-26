"use client"

// GBP Ranking Map
// Trigger.dev-style async scan with polling
// POST /v1/gmb/rank/scan     → start scan, returns scanId
// GET  /v1/gmb/rank/status/:scanId → poll until completed
// GET  /v1/gmb/rank/latest?locationId=&keyword= → fetch last result

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  MapPin, RefreshCw, TrendingUp, Award, AlertCircle,
  Search, ScanLine, ChevronDown, Check, Loader2, Zap,
} from "lucide-react"
import dynamic from "next/dynamic"
import { DashboardPageLayout } from "@/components/dashboard/page-layout"
import { api } from "@/lib/api"
import { useRankScan } from "@/hooks/use-rank-scan"

const PINK = "oklch(0.58 0.24 350)"
const CARD_BG = "oklch(1 0 0)"
const CARD_BORDER = "oklch(0.91 0.008 350)"
const INPUT_BG = "oklch(0.97 0.004 350)"
const INPUT_BORDER = "oklch(0.90 0.008 350)"
const TEXT = "oklch(0.14 0.008 270)"
const TEXT_MUTED = "oklch(0.55 0.008 270)"
const TEXT_FAINT = "oklch(0.65 0.008 270)"
const GREEN = "oklch(0.50 0.18 145)"
const YELLOW = "oklch(0.55 0.18 75)"
const RED = "oklch(0.52 0.22 25)"

const GBPRankMap = dynamic(
  () => import("@/components/gbp-rank-map").then((m) => m.GBPRankMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full rounded-2xl animate-pulse" style={{ background: "oklch(0.95 0.005 350)" }} />
    ),
  }
)

// ── Location dropdown ───────────────────────────────────────────────
function LocationSelect({ locations, value, onChange, disabled }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = locations.find((l) => l.google_location_id === value)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={ref} className="relative" style={{ minWidth: 220, maxWidth: 280 }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition-all disabled:opacity-50"
        style={{ background: INPUT_BG, border: `1px solid ${open ? PINK : INPUT_BORDER}`, color: TEXT }}
      >
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: selected ? PINK : TEXT_FAINT }} />
        <span className="flex-1 truncate" style={{ color: selected ? TEXT : TEXT_FAINT }}>
          {selected ? selected.title : "Select location…"}
        </span>
        <ChevronDown
          className="w-3.5 h-3.5 flex-shrink-0 transition-transform"
          style={{ color: TEXT_FAINT, transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      {open && locations.length > 0 && (
        <div
          className="absolute z-50 mt-1.5 w-full rounded-xl overflow-hidden shadow-lg"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          {locations.map((loc) => (
            <button
              key={loc.google_location_id}
              type="button"
              onClick={() => { onChange(loc.google_location_id); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors hover:bg-[oklch(0.97_0.005_350)]"
            >
              <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: PINK, opacity: loc.google_location_id === value ? 1 : 0 }} />
              <div className="min-w-0">
                <div className="truncate text-[13px] font-medium" style={{ color: TEXT }}>{loc.title}</div>
                {loc.email && <div className="truncate text-[11px]" style={{ color: TEXT_FAINT }}>{loc.email}</div>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Progress bar ────────────────────────────────────────────────────
function ScanProgress({ progress, status }) {
  const labels = {
    pending: "Queuing scan…",
    running: `Scanning grid… ${progress}%`,
    completed: "Scan complete",
    failed: "Scan failed",
  }
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs" style={{ color: TEXT_MUTED }}>
        <div className="flex items-center gap-1.5">
          {status === "completed"
            ? <Check className="w-3 h-3" style={{ color: GREEN }} />
            : <Loader2 className="w-3 h-3 animate-spin" style={{ color: PINK }} />
          }
          <span>{labels[status]}</span>
        </div>
        <span className="font-semibold tabular-nums" style={{ color: TEXT }}>{progress}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "oklch(0.92 0.005 350)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: status === "completed" ? GREEN : status === "failed" ? RED : PINK,
          }}
        />
      </div>
    </div>
  )
}

// ── Stat card ───────────────────────────────────────────────────────
function StatCard({ Icon, label, value, sub, iconBg, iconColor }) {
  return (
    <div className="rounded-2xl p-5 flex items-start gap-4" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
        <Icon className="w-4 h-4" style={{ color: iconColor }} />
      </div>
      <div>
        <div className="text-[11px] font-medium mb-0.5" style={{ color: TEXT_MUTED }}>{label}</div>
        <div className="text-xl font-bold tracking-tight" style={{ color: TEXT }}>{value}</div>
        {sub && <div className="text-[11px] mt-0.5" style={{ color: TEXT_FAINT }}>{sub}</div>}
      </div>
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────
export default function RankingPage() {
  const router = useRouter()

  // Location + keyword state
  const [locations, setLocations] = useState([])
  const [locationId, setLocationId] = useState("")
  const [keyword, setKeyword] = useState("")
  const [locationsLoading, setLocationsLoading] = useState(true)

  // "Load Latest" state (separate from scan)
  const [latestPoints, setLatestPoints] = useState([])
  const [latestLoading, setLatestLoading] = useState(false)
  const [latestError, setLatestError] = useState(null)
  const [lastFetched, setLastFetched] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchedKeyword, setSearchedKeyword] = useState("")

  // Trigger.dev-style async scan hook
  const scan = useRankScan()

  // Which points to show on the map: scan result takes priority when completed
  const displayPoints = scan.status === "completed" && scan.points.length > 0
    ? scan.points
    : latestPoints

  const canSearch = locationId && keyword.trim().length > 0

  // Load locations — auto-select first
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/v1/gmb/locations")
        const list = res.data?.data ?? res.data?.locations ?? []
        setLocations(list)
        if (list.length > 0) setLocationId(list[0].google_location_id)
      } catch (err) {
        if (err.response?.status === 401) router.replace("/auth")
      } finally {
        setLocationsLoading(false)
      }
    }
    load()
  }, [router])

  // When location changes, fetch recent scans to auto-populate keyword + load last result
  useEffect(() => {
    if (!locationId) return
    const load = async () => {
      try {
        const res = await api.get("/v1/gmb/rank/scans", { params: { locationId } })
        const scans = res.data?.data ?? res.data?.scans ?? res.data ?? []
        const latest = Array.isArray(scans) ? scans[0] : null
        if (latest?.keyword) {
          setKeyword(latest.keyword)
          // Auto-fetch the latest result with this keyword
          setHasSearched(true)
          setSearchedKeyword(latest.keyword)
          setLatestLoading(true)
          try {
            const r = await api.get("/v1/gmb/rank/latest", {
              params: { locationId, keyword: latest.keyword }
            })
            const data = r.data?.data ?? r.data
            setLatestPoints(data?.points ?? [])
            setLastFetched(new Date())
          } catch {
            setLatestPoints([])
          } finally {
            setLatestLoading(false)
          }
        }
      } catch {
        // Scan history unavailable — user will enter keyword manually
      }
    }
    load()
  }, [locationId])

  // Fetch latest (no polling)
  const fetchLatest = useCallback(async () => {
    if (!canSearch) return
    setLatestLoading(true)
    setLatestError(null)
    setHasSearched(true)
    setSearchedKeyword(keyword.trim())
    try {
      const res = await api.get("/v1/gmb/rank/latest", {
        params: { locationId, keyword: keyword.trim() }
      })
      const data = res.data?.data ?? res.data
      setLatestPoints(data?.points ?? [])
      setLastFetched(new Date())
    } catch (err) {
      if (err.response?.status === 401) { router.replace("/auth"); return }
      if (err.response?.status === 404) {
        setLatestPoints([])
        setLastFetched(new Date())
      } else {
        setLatestError(err.response?.data?.message ?? err.message ?? "Failed to load")
      }
    } finally {
      setLatestLoading(false)
    }
  }, [canSearch, locationId, keyword, router])

  // Start scan (async + polling via hook)
  const handleRunScan = useCallback(() => {
    if (!canSearch || scan.isRunning) return
    setHasSearched(true)
    setSearchedKeyword(keyword.trim())
    scan.startScan(locationId, keyword)
  }, [canSearch, scan, locationId, keyword])

  // When scan completes, sync to lastFetched
  useEffect(() => {
    if (scan.status === "completed") setLastFetched(new Date())
  }, [scan.status])

  const isLoading = latestLoading || scan.isRunning
  const showProgress = scan.status === "running" || scan.status === "pending"

  // Derived stats
  const top3    = displayPoints.filter((p) => p.rank <= 3).length
  const top10   = displayPoints.filter((p) => p.rank > 3 && p.rank <= 10).length
  const outside = displayPoints.filter((p) => p.rank > 10).length
  const avgRank = displayPoints.length
    ? (displayPoints.reduce((s, p) => s + p.rank, 0) / displayPoints.length).toFixed(1)
    : "—"

  return (
    <DashboardPageLayout
      title="GBP Ranking Map"
      subtitle="See how your business ranks across a geographic grid for any keyword"
    >
      <div className="p-6 space-y-5">

        {/* ── Search bar ──────────────────────────── */}
        <div
          className="flex flex-wrap items-center gap-3 p-4 rounded-2xl"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          <LocationSelect
            locations={locations}
            value={locationId}
            onChange={setLocationId}
            disabled={locationsLoading || scan.isRunning}
          />

          <div className="flex-1 relative" style={{ minWidth: 200 }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: TEXT_FAINT }} />
            <input
              type="text"
              placeholder="Keyword — e.g. best pizza near me"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchLatest()}
              disabled={scan.isRunning}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none transition-all disabled:opacity-50"
              style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }}
              onFocus={(e) => (e.target.style.borderColor = PINK)}
              onBlur={(e) => (e.target.style.borderColor = INPUT_BORDER)}
            />
          </div>

          {/* Load latest */}
          <button
            onClick={fetchLatest}
            disabled={!canSearch || isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
            style={{
              background: canSearch ? `${PINK}15` : "oklch(0.94 0.003 270)",
              border: `1px solid ${canSearch ? `${PINK}35` : "oklch(0.89 0.005 270)"}`,
              color: canSearch ? PINK : TEXT_FAINT,
            }}
          >
            {latestLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Load Latest
          </button>

          {/* Run scan */}
          <button
            onClick={handleRunScan}
            disabled={!canSearch || isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
            style={{ background: PINK, color: "#fff" }}
          >
            {scan.isRunning
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Zap className="w-3.5 h-3.5" />
            }
            {scan.isRunning ? "Scanning…" : "Run Scan"}
          </button>
        </div>

        {/* ── Scan progress bar ────────────────────── */}
        {showProgress && (
          <div
            className="p-4 rounded-2xl"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
          >
            <ScanProgress progress={scan.progress} status={scan.status} />
          </div>
        )}

        {/* ── Scan error ───────────────────────────── */}
        {scan.status === "failed" && scan.error && (
          <div
            className="flex items-center gap-3 p-4 rounded-2xl text-sm"
            style={{ background: `${RED}0f`, border: `1px solid ${RED}30`, color: RED }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{scan.error}</span>
            <button
              onClick={scan.reset}
              className="text-xs font-semibold underline underline-offset-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ── Stats ───────────────────────────────── */}
        {hasSearched && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              Icon={TrendingUp} label="Average Rank"
              value={isLoading ? "—" : avgRank}
              sub={`across ${displayPoints.length} points`}
              iconBg={`${PINK}14`} iconColor={PINK}
            />
            <StatCard
              Icon={Award} label="Top 3"
              value={isLoading ? "—" : top3} sub="rank 1–3"
              iconBg={`${GREEN}20`} iconColor={GREEN}
            />
            <StatCard
              Icon={MapPin} label="Top 10"
              value={isLoading ? "—" : top10} sub="rank 4–10"
              iconBg={`${YELLOW}20`} iconColor={YELLOW}
            />
            <StatCard
              Icon={AlertCircle} label="Outside Top 10"
              value={isLoading ? "—" : outside} sub="rank 10+"
              iconBg={`${RED}15`} iconColor={RED}
            />
          </div>
        )}

        {/* ── Map / states ─────────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: `1px solid ${CARD_BORDER}`,
            height: hasSearched ? "calc(100vh - 420px)" : "calc(100vh - 260px)",
            minHeight: 380,
          }}
        >
          {!hasSearched ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${PINK}12` }}>
                <MapPin className="w-7 h-7" style={{ color: PINK }} />
              </div>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: TEXT }}>Select a location and keyword</p>
                <p className="text-xs" style={{ color: TEXT_MUTED }}>
                  Hit <strong>Load Latest</strong> to see cached results, or <strong>Run Scan</strong> to trigger a live grid scan.
                </p>
              </div>
            </div>
          ) : latestError ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <AlertCircle className="w-8 h-8" style={{ color: RED }} />
              <p className="text-sm font-medium" style={{ color: TEXT }}>{latestError}</p>
              <button
                onClick={fetchLatest}
                className="text-xs font-medium px-3 py-1.5 rounded-xl"
                style={{ background: `${PINK}14`, border: `1px solid ${PINK}30`, color: PINK }}
              >
                Try again
              </button>
            </div>
          ) : scan.isRunning ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center animate-pulse"
                style={{ background: `${PINK}12` }}
              >
                <ScanLine className="w-7 h-7" style={{ color: PINK }} />
              </div>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: TEXT }}>Scanning grid…</p>
                <p className="text-xs" style={{ color: TEXT_MUTED }}>
                  Checking every grid point for <strong>&ldquo;{searchedKeyword}&rdquo;</strong>.
                  This can take up to 90 seconds.
                </p>
              </div>
            </div>
          ) : displayPoints.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${PINK}12` }}>
                <ScanLine className="w-7 h-7" style={{ color: PINK }} />
              </div>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: TEXT }}>No results yet</p>
                <p className="text-xs" style={{ color: TEXT_MUTED }}>
                  No scan found for this location + keyword. Run a scan to generate your first grid.
                </p>
              </div>
              <button
                onClick={handleRunScan}
                disabled={!canSearch}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                style={{ background: PINK, color: "#fff" }}
              >
                <Zap className="w-3.5 h-3.5" /> Run Scan
              </button>
            </div>
          ) : (
            <GBPRankMap points={displayPoints} className="w-full h-full" />
          )}
        </div>

        {/* Footer */}
        {lastFetched && searchedKeyword && (
          <p className="text-[11px]" style={{ color: TEXT_FAINT }}>
            Showing results for{" "}
            <span className="font-semibold" style={{ color: TEXT_MUTED }}>
              &ldquo;{searchedKeyword}&rdquo;
            </span>{" "}
            · last updated {lastFetched.toLocaleTimeString()}
            {scan.status === "completed" && (
              <span className="ml-2 font-medium" style={{ color: GREEN }}>· Fresh scan</span>
            )}
          </p>
        )}
      </div>
    </DashboardPageLayout>
  )
}
