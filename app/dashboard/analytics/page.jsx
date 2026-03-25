"use client"

// Analytics page — health scores, ratings, sentiment, business metrics
// API: GET /v1/gmb/analytics/overview, /ratings, /metrics/summary

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts"
import {
  TrendingUp, Star, MessageSquare, ChevronDown,
  Eye, Navigation, Phone, Globe, Calendar,
  Search, Map, Smartphone, Monitor,
} from "lucide-react"
import { DashboardPageLayout } from "@/components/dashboard/page-layout"
import { api } from "@/lib/api"

const PINK = "oklch(0.58 0.24 350)"
const CARD_BG = "oklch(1 0 0)"
const CARD_BORDER = "oklch(0.91 0.008 350)"
const TEXT = "oklch(0.14 0.008 270)"
const TEXT_MUTED = "oklch(0.55 0.008 270)"
const TEXT_FAINT = "oklch(0.65 0.008 270)"
const INPUT_BG = "oklch(0.96 0.005 350)"
const INPUT_BORDER = "oklch(0.90 0.008 350)"

// ── Tooltip ────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs shadow-lg" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
      {label && <div className="mb-1" style={{ color: TEXT_MUTED }}>{label}</div>}
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color ?? TEXT }}>
          {p.name}: <span className="font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Score ring ─────────────────────────────────────────────────────
function ScoreRing({ score, size = 100 }) {
  const r = 38
  const circ = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, score ?? 0))
  const dash = (pct / 100) * circ
  const color =
    pct >= 70 ? "oklch(0.52 0.18 160)" :
    pct >= 40 ? "oklch(0.62 0.18 55)" :
                "oklch(0.58 0.22 25)"

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" stroke="oklch(0 0 0 / 8%)" strokeWidth="8" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
    </svg>
  )
}

// ── Metric icon map ────────────────────────────────────────────────
const METRIC_META = {
  BUSINESS_IMPRESSIONS_DESKTOP_SEARCH: { label: "Desktop Search", icon: Search,      accent: PINK },
  BUSINESS_IMPRESSIONS_MOBILE_SEARCH:  { label: "Mobile Search",  icon: Smartphone,  accent: PINK },
  BUSINESS_IMPRESSIONS_DESKTOP_MAPS:   { label: "Desktop Maps",   icon: Monitor,     accent: "oklch(0.52 0.20 160)" },
  BUSINESS_IMPRESSIONS_MOBILE_MAPS:    { label: "Mobile Maps",    icon: Map,         accent: "oklch(0.52 0.20 160)" },
  BUSINESS_CONVERSATIONS:              { label: "Conversations",  icon: MessageSquare, accent: "oklch(0.58 0.20 55)" },
  BUSINESS_DIRECTION_REQUESTS:         { label: "Direction Reqs", icon: Navigation,  accent: "oklch(0.55 0.22 30)" },
  CALL_CLICKS:                         { label: "Call Clicks",    icon: Phone,       accent: "oklch(0.55 0.22 30)" },
  WEBSITE_CLICKS:                      { label: "Website Clicks", icon: Globe,       accent: "oklch(0.52 0.20 280)" },
  BUSINESS_BOOKINGS:                   { label: "Bookings",       icon: Calendar,    accent: "oklch(0.52 0.20 280)" },
}

// ── Metric bento card ──────────────────────────────────────────────
function MetricBentoCard({ metric }) {
  const meta = METRIC_META[metric.metric_type] ?? { label: metric.metric_type.replace(/_/g, " "), icon: Eye, accent: PINK }
  const Icon = meta.icon
  const total = parseInt(metric.total ?? 0)
  const avg = parseFloat(metric.daily_avg ?? 0).toFixed(1)

  return (
    <div
      className="relative group rounded-2xl p-5 overflow-hidden transition-all duration-300 cursor-default hover:shadow-sm hover:-translate-y-px"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(ellipse 70% 50% at 50% 110%, ${meta.accent}10 0%, transparent 70%)` }}
      />
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${meta.accent}12`, color: meta.accent }}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: TEXT_FAINT }}>{avg}/day</span>
      </div>
      <div className="text-2xl font-bold mb-1" style={{ color: TEXT }}>{total.toLocaleString()}</div>
      <div className="text-xs leading-snug" style={{ color: TEXT_MUTED }}>{meta.label}</div>
    </div>
  )
}

// ── Skeleton card ──────────────────────────────────────────────────
function SkeletonCard({ className = "" }) {
  return (
    <div className={`rounded-2xl p-5 animate-pulse ${className}`} style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
      <div className="h-4 rounded w-2/3 mb-3" style={{ background: "oklch(0.92 0.005 350)" }} />
      <div className="h-8 rounded w-1/3 mb-2" style={{ background: "oklch(0.92 0.005 350)" }} />
      <div className="h-3 rounded w-1/2" style={{ background: "oklch(0.94 0.004 350)" }} />
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const router = useRouter()
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState("")
  const [overview, setOverview] = useState(null)
  const [ratings, setRatings] = useState(null)
  const [metricsSummary, setMetricsSummary] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!localStorage.getItem("retilo_token")) { router.replace("/auth"); return }
    api.get("/v1/gmb/locations")
      .then(res => {
        const locs = res.data.data ?? []
        setLocations(locs)
        if (locs.length > 0) setSelectedLocation(locs[0].google_location_id)
      })
      .catch(() => setLoading(false))
  }, [router])

  useEffect(() => {
    if (!selectedLocation) return
    setLoading(true)
    const params = { locationId: selectedLocation }
    const end = new Date().toISOString().split("T")[0]
    const start = new Date(Date.now() - 90 * 864e5).toISOString().split("T")[0]

    Promise.all([
      api.get("/v1/gmb/analytics/overview", { params: { ...params, startDate: start, endDate: end } }),
      api.get("/v1/gmb/analytics/ratings", { params: { ...params, startDate: start, endDate: end, groupBy: "week" } }),
      api.get("/v1/gmb/analytics/metrics/summary", { params: { ...params, startDate: start, endDate: end } }),
    ])
      .then(([ov, rat, ms]) => {
        setOverview(ov.data.data)
        setRatings(rat.data.data)
        setMetricsSummary(ms.data.data ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedLocation])

  const health = overview?.healthScore
  const sentiment = overview?.sentimentBreakdown?.sentiment
  const dist = ratings?.distribution ?? {}
  const trend = ratings?.trend ?? []

  const ratingBars = [1, 2, 3, 4, 5].map(r => ({
    stars: `${r}★`,
    count: dist[r] ?? 0,
    color: r >= 4 ? "oklch(0.52 0.18 160)" : r <= 2 ? "oklch(0.60 0.22 25)" : "oklch(0.62 0.18 55)",
  }))

  const trendData = trend.slice(-12).map(t => ({
    period: new Date(t.period).toLocaleDateString("en", { month: "short", day: "numeric" }),
    rating: parseFloat(t.avg_rating ?? 0),
    count: parseInt(t.count ?? 0),
  }))

  const sentimentTotal = (sentiment?.positive ?? 0) + (sentiment?.neutral ?? 0) + (sentiment?.negative ?? 0)
  const impressionMetrics = metricsSummary.filter(m => m.metric_type.includes("IMPRESSIONS"))
  const actionMetrics = metricsSummary.filter(m => !m.metric_type.includes("IMPRESSIONS"))

  const cardStyle = { background: CARD_BG, border: `1px solid ${CARD_BORDER}` }

  return (
    <DashboardPageLayout
      title="Analytics"
      subtitle="Rating trends, sentiment & business performance"
      actions={
        locations.length > 1 && (
          <div className="relative">
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
              style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT_MUTED }}
            >
              {locations.map(l => <option key={l.id} value={l.google_location_id}>{l.title}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: TEXT_FAINT }} />
          </div>
        )
      }
    >
      <div className="max-w-5xl mx-auto px-6 py-7 space-y-6">

        {/* ── Hero: Health score + key stats ── */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : health ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

            {/* Health score — 2-col wide */}
            <div className="lg:col-span-2 relative group rounded-2xl p-6 overflow-hidden transition-all hover:shadow-sm" style={cardStyle}>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl"
                style={{ background: `radial-gradient(ellipse 60% 50% at 20% 100%, ${PINK}08 0%, transparent 70%)` }}
              />
              <div className="flex items-center gap-6">
                <div className="relative shrink-0">
                  <ScoreRing score={health.score} size={90} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-black" style={{ color: TEXT }}>{health.score}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: TEXT_FAINT }}>Health Score</div>
                  <div className="text-4xl font-black mb-1" style={{ color: TEXT }}>
                    {health.score}<span className="text-lg font-normal" style={{ color: TEXT_FAINT }}>/100</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {[
                      { label: "Rating",   val: health.breakdown?.rating },
                      { label: "Recency",  val: `+${health.breakdown?.recency}` },
                      { label: "Response", val: health.breakdown?.responseRate },
                    ].map(b => (
                      <span
                        key={b.label}
                        className="text-[10px] rounded-full px-2 py-0.5"
                        style={{ background: "oklch(0.96 0.006 350)", color: TEXT_MUTED }}
                      >
                        {b.label} <span style={{ color: TEXT }}>{b.val}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Avg Rating */}
            <div className="relative group rounded-2xl p-5 overflow-hidden transition-all hover:shadow-sm" style={cardStyle}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl"
                style={{ background: "radial-gradient(ellipse 70% 50% at 50% 110%, oklch(0.62 0.18 55 / 10%) 0%, transparent 70%)" }} />
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "oklch(0.62 0.18 55 / 15%)" }}>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: TEXT_FAINT }}>Rating</span>
              </div>
              <div className="text-3xl font-black" style={{ color: TEXT }}>{health.meta?.averageRating?.toFixed(1) ?? "—"}</div>
              <div className="text-xs mt-1" style={{ color: TEXT_MUTED }}>{health.meta?.totalReviews ?? 0} total reviews</div>
            </div>

            {/* Response rate */}
            <div className="relative group rounded-2xl p-5 overflow-hidden transition-all hover:shadow-sm" style={cardStyle}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl"
                style={{ background: "radial-gradient(ellipse 70% 50% at 50% 110%, oklch(0.52 0.18 160 / 10%) 0%, transparent 70%)" }} />
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "oklch(0.52 0.18 160 / 15%)" }}>
                  <MessageSquare className="w-4 h-4" style={{ color: "oklch(0.42 0.18 160)" }} />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: TEXT_FAINT }}>Reply rate</span>
              </div>
              <div className="text-3xl font-black" style={{ color: TEXT }}>
                {health.meta?.responseRate ?? 0}<span className="text-lg font-normal" style={{ color: TEXT_FAINT }}>%</span>
              </div>
              <div className="text-xs mt-1" style={{ color: TEXT_MUTED }}>{health.meta?.recentReviews ?? 0} reviews this month</div>
            </div>
          </div>
        ) : null}

        {/* ── Rating distribution + Sentiment ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Rating distribution */}
          <div className="rounded-2xl p-5" style={cardStyle}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold" style={{ color: TEXT }}>Rating Distribution</h3>
              <div className="text-xs" style={{ color: TEXT_FAINT }}>90 days</div>
            </div>
            {loading ? (
              <div className="h-36 rounded-xl animate-pulse" style={{ background: "oklch(0.96 0.005 350)" }} />
            ) : (
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={ratingBars} barSize={32} margin={{ left: -10 }}>
                  <XAxis dataKey="stars" tick={{ fill: "oklch(0.60 0.008 270)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "oklch(0 0 0 / 3%)" }} />
                  <Bar
                    dataKey="count"
                    radius={[6, 6, 0, 0]}
                    shape={(props) => {
                      const { x, y, width, height, index } = props
                      return <rect x={x} y={y} width={width} height={height} fill={ratingBars[index]?.color ?? PINK} rx={6} ry={6} />
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Sentiment */}
          <div className="rounded-2xl p-5" style={cardStyle}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold" style={{ color: TEXT }}>Sentiment Breakdown</h3>
              <div className="text-xs" style={{ color: TEXT_FAINT }}>{sentimentTotal} reviews</div>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-8 rounded-xl animate-pulse" style={{ background: "oklch(0.96 0.005 350)" }} />)}
              </div>
            ) : sentiment ? (
              <div className="space-y-4">
                {[
                  { label: "Positive", value: sentiment.positive ?? 0, color: "oklch(0.52 0.18 160)", bg: "oklch(0.52 0.18 160 / 12%)" },
                  { label: "Neutral",  value: sentiment.neutral ?? 0,  color: "oklch(0.62 0.18 55)",  bg: "oklch(0.62 0.18 55 / 12%)"  },
                  { label: "Negative", value: sentiment.negative ?? 0, color: "oklch(0.58 0.22 25)",  bg: "oklch(0.58 0.22 25 / 12%)"  },
                ].map(s => {
                  const pct = sentimentTotal > 0 ? Math.round((s.value / sentimentTotal) * 100) : 0
                  return (
                    <div key={s.label}>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="font-medium" style={{ color: TEXT_MUTED }}>{s.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold" style={{ color: TEXT }}>{s.value}</span>
                          <span className="text-[10px]" style={{ color: TEXT_FAINT }}>{pct}%</span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: "oklch(0.93 0.005 350)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: s.color }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-24 text-sm" style={{ color: TEXT_FAINT }}>No sentiment data</div>
            )}
          </div>
        </div>

        {/* ── Rating trend ── */}
        {(loading || trendData.length > 0) && (
          <div className="rounded-2xl p-5" style={cardStyle}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold" style={{ color: TEXT }}>Rating Trend</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: PINK }} />
                <span className="text-xs" style={{ color: TEXT_FAINT }}>avg rating per week</span>
              </div>
            </div>
            {loading ? (
              <div className="h-44 rounded-xl animate-pulse" style={{ background: "oklch(0.96 0.005 350)" }} />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={trendData} margin={{ left: -10 }}>
                  <defs>
                    <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={PINK} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={PINK} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="period" tick={{ fill: "oklch(0.60 0.008 270)", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fill: "oklch(0.65 0.008 270)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "oklch(0 0 0 / 6%)" }} />
                  <Area type="monotone" dataKey="rating" stroke={PINK} strokeWidth={2} fill="url(#ratingGrad)" name="Avg Rating" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* ── Business metrics bento grid ── */}
        {(loading || metricsSummary.length > 0) && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: TEXT_FAINT }}>Business Metrics</h3>
              <div className="h-px flex-1" style={{ background: CARD_BORDER }} />
              <span className="text-xs" style={{ color: TEXT_FAINT }}>90 days</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <>
                {impressionMetrics.length > 0 && (
                  <div className="mb-3">
                    <div className="text-[10px] uppercase tracking-widest font-semibold mb-2 px-1" style={{ color: TEXT_FAINT }}>Impressions</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {impressionMetrics.map(m => <MetricBentoCard key={m.metric_type} metric={m} />)}
                    </div>
                  </div>
                )}
                {actionMetrics.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-widest font-semibold mb-2 px-1" style={{ color: TEXT_FAINT }}>Actions</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {actionMetrics.map(m => <MetricBentoCard key={m.metric_type} metric={m} />)}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Empty state */}
        {!loading && !overview && (
          <div className="text-center py-20" style={{ color: TEXT_FAINT }}>
            <TrendingUp className="w-10 h-10 mx-auto mb-4 opacity-30" />
            <p className="text-sm font-medium" style={{ color: TEXT_MUTED }}>No analytics data yet.</p>
            <p className="text-xs mt-1" style={{ color: TEXT_FAINT }}>Sync analytics from a location first.</p>
          </div>
        )}

      </div>
    </DashboardPageLayout>
  )
}
