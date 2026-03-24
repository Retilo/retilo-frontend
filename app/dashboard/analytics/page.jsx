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

// ── Tooltip ────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl bg-[oklch(0.15_0.018_270)] border border-white/10 px-3 py-2 text-xs shadow-xl">
      {label && <div className="text-white/40 mb-1">{label}</div>}
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color ?? "white" }}>
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
    pct >= 70 ? "oklch(0.60 0.20 160)" :
    pct >= 40 ? "oklch(0.70 0.18 55)" :
                "oklch(0.65 0.22 25)"

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" stroke="oklch(1 0 0 / 6%)" strokeWidth="8" />
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
  BUSINESS_IMPRESSIONS_DESKTOP_SEARCH: { label: "Desktop Search", icon: Search,     accent: "oklch(0.65 0.26 280)" },
  BUSINESS_IMPRESSIONS_MOBILE_SEARCH:  { label: "Mobile Search",  icon: Smartphone, accent: "oklch(0.65 0.26 280)" },
  BUSINESS_IMPRESSIONS_DESKTOP_MAPS:   { label: "Desktop Maps",   icon: Monitor,    accent: "oklch(0.60 0.20 160)" },
  BUSINESS_IMPRESSIONS_MOBILE_MAPS:    { label: "Mobile Maps",    icon: Map,        accent: "oklch(0.60 0.20 160)" },
  BUSINESS_CONVERSATIONS:              { label: "Conversations",  icon: MessageSquare, accent: "oklch(0.70 0.18 55)" },
  BUSINESS_DIRECTION_REQUESTS:         { label: "Direction Reqs", icon: Navigation, accent: "oklch(0.65 0.22 30)" },
  CALL_CLICKS:                         { label: "Call Clicks",    icon: Phone,      accent: "oklch(0.65 0.22 30)" },
  WEBSITE_CLICKS:                      { label: "Website Clicks", icon: Globe,      accent: "oklch(0.60 0.20 310)" },
  BUSINESS_BOOKINGS:                   { label: "Bookings",       icon: Calendar,   accent: "oklch(0.60 0.20 310)" },
}

// ── Metric bento card ──────────────────────────────────────────────
function MetricBentoCard({ metric }) {
  const meta = METRIC_META[metric.metric_type] ?? { label: metric.metric_type.replace(/_/g, " "), icon: Eye, accent: "oklch(0.65 0.26 280)" }
  const Icon = meta.icon
  const total = parseInt(metric.total ?? 0)
  const avg = parseFloat(metric.daily_avg ?? 0).toFixed(1)

  return (
    <div className="relative group rounded-2xl border border-white/8 bg-[oklch(0.13_0.015_270)] p-5 overflow-hidden hover:border-white/15 transition-all duration-300 cursor-default">
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 70% 50% at 50% 110%, ${meta.accent}18 0%, transparent 70%)` }}
      />
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${meta.accent}18`, color: meta.accent }}
        >
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-[10px] text-white/30 font-medium uppercase tracking-wider">{avg}/day</span>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{total.toLocaleString()}</div>
      <div className="text-xs text-white/40 leading-snug">{meta.label}</div>
    </div>
  )
}

// ── Skeleton card ──────────────────────────────────────────────────
function SkeletonCard({ className = "" }) {
  return (
    <div className={`rounded-2xl border border-white/6 bg-[oklch(0.13_0.015_270)] p-5 animate-pulse ${className}`}>
      <div className="h-4 bg-white/6 rounded w-2/3 mb-3" />
      <div className="h-8 bg-white/6 rounded w-1/3 mb-2" />
      <div className="h-3 bg-white/4 rounded w-1/2" />
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
    color: r >= 4 ? "oklch(0.60 0.20 160)" : r <= 2 ? "oklch(0.65 0.22 25)" : "oklch(0.70 0.18 55)",
  }))

  const trendData = trend.slice(-12).map(t => ({
    period: new Date(t.period).toLocaleDateString("en", { month: "short", day: "numeric" }),
    rating: parseFloat(t.avg_rating ?? 0),
    count: parseInt(t.count ?? 0),
  }))

  const sentimentTotal = (sentiment?.positive ?? 0) + (sentiment?.neutral ?? 0) + (sentiment?.negative ?? 0)

  // Group metrics: impressions vs actions
  const impressionMetrics = metricsSummary.filter(m => m.metric_type.includes("IMPRESSIONS"))
  const actionMetrics = metricsSummary.filter(m => !m.metric_type.includes("IMPRESSIONS"))

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
              className="appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs outline-none cursor-pointer"
            >
              {locations.map(l => <option key={l.id} value={l.google_location_id}>{l.title}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
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
            <div className="lg:col-span-2 relative group rounded-2xl border border-white/8 bg-[oklch(0.13_0.015_270)] p-6 overflow-hidden hover:border-white/15 transition-all">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ background: "radial-gradient(ellipse 60% 50% at 20% 100%, oklch(0.65 0.26 280 / 12%) 0%, transparent 70%)" }}
              />
              <div className="flex items-center gap-6">
                <div className="relative shrink-0">
                  <ScoreRing score={health.score} size={90} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-black text-white">{health.score}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-1">Health Score</div>
                  <div className="text-4xl font-black text-white mb-1">{health.score}<span className="text-lg text-white/30 font-normal">/100</span></div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {[
                      { label: "Rating", val: health.breakdown?.rating, color: health.breakdown?.rating >= 0 ? "text-green-400" : "text-red-400" },
                      { label: "Recency", val: `+${health.breakdown?.recency}`, color: "text-green-400" },
                      { label: "Response", val: health.breakdown?.responseRate, color: "text-white/50" },
                    ].map(b => (
                      <span key={b.label} className="text-[10px] bg-white/6 rounded-full px-2 py-0.5 text-white/50">
                        {b.label} <span className={b.color}>{b.val}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Avg Rating */}
            <div className="relative group rounded-2xl border border-white/8 bg-[oklch(0.13_0.015_270)] p-5 overflow-hidden hover:border-white/15 transition-all">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ background: "radial-gradient(ellipse 70% 50% at 50% 110%, oklch(0.70 0.18 55 / 14%) 0%, transparent 70%)" }} />
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-[oklch(0.70_0.18_55)/18%] flex items-center justify-center">
                  <Star className="w-4 h-4 text-[oklch(0.85_0.18_55)]" />
                </div>
                <span className="text-[10px] text-white/30 uppercase tracking-wider">Rating</span>
              </div>
              <div className="text-3xl font-black text-white">{health.meta?.averageRating?.toFixed(1) ?? "—"}</div>
              <div className="text-xs text-white/40 mt-1">{health.meta?.totalReviews ?? 0} total reviews</div>
            </div>

            {/* Response rate */}
            <div className="relative group rounded-2xl border border-white/8 bg-[oklch(0.13_0.015_270)] p-5 overflow-hidden hover:border-white/15 transition-all">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ background: "radial-gradient(ellipse 70% 50% at 50% 110%, oklch(0.60 0.20 160 / 14%) 0%, transparent 70%)" }} />
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-[oklch(0.60_0.20_160)/18%] flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-[oklch(0.75_0.18_160)]" />
                </div>
                <span className="text-[10px] text-white/30 uppercase tracking-wider">Reply rate</span>
              </div>
              <div className="text-3xl font-black text-white">{health.meta?.responseRate ?? 0}<span className="text-lg text-white/30 font-normal">%</span></div>
              <div className="text-xs text-white/40 mt-1">{health.meta?.recentReviews ?? 0} reviews this month</div>
            </div>
          </div>
        ) : null}

        {/* ── Rating distribution + Sentiment ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Rating distribution */}
          <div className="rounded-2xl border border-white/8 bg-[oklch(0.13_0.015_270)] p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-white">Rating Distribution</h3>
              <div className="text-xs text-white/30">90 days</div>
            </div>
            {loading ? (
              <div className="h-36 bg-white/4 rounded-xl animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={ratingBars} barSize={32} margin={{ left: -10 }}>
                  <XAxis dataKey="stars" tick={{ fill: "oklch(1 0 0 / 35%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "oklch(1 0 0 / 3%)" }} />
                  <Bar
                    dataKey="count"
                    radius={[6, 6, 0, 0]}
                    shape={(props) => {
                      const { x, y, width, height, index } = props
                      return <rect x={x} y={y} width={width} height={height} fill={ratingBars[index]?.color ?? "oklch(0.65 0.26 280)"} rx={6} ry={6} />
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Sentiment */}
          <div className="rounded-2xl border border-white/8 bg-[oklch(0.13_0.015_270)] p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-white">Sentiment Breakdown</h3>
              <div className="text-xs text-white/30">{sentimentTotal} reviews</div>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-8 bg-white/4 rounded-xl animate-pulse" />)}
              </div>
            ) : sentiment ? (
              <div className="space-y-4">
                {[
                  { label: "Positive", value: sentiment.positive ?? 0, color: "oklch(0.60 0.20 160)", bg: "oklch(0.60 0.20 160 / 15%)" },
                  { label: "Neutral",  value: sentiment.neutral ?? 0,  color: "oklch(0.70 0.18 55)",  bg: "oklch(0.70 0.18 55 / 15%)"  },
                  { label: "Negative", value: sentiment.negative ?? 0, color: "oklch(0.65 0.22 25)",  bg: "oklch(0.65 0.22 25 / 15%)"  },
                ].map(s => {
                  const pct = sentimentTotal > 0 ? Math.round((s.value / sentimentTotal) * 100) : 0
                  return (
                    <div key={s.label}>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-white/50 font-medium">{s.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white/70 font-semibold">{s.value}</span>
                          <span className="text-white/25 text-[10px]">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-white/6 overflow-hidden">
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
              <div className="flex items-center justify-center h-24 text-white/20 text-sm">No sentiment data</div>
            )}
          </div>
        </div>

        {/* ── Rating trend ── */}
        {(loading || trendData.length > 0) && (
          <div className="rounded-2xl border border-white/8 bg-[oklch(0.13_0.015_270)] p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-white">Rating Trend</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[oklch(0.65_0.26_280)]" />
                <span className="text-xs text-white/30">avg rating per week</span>
              </div>
            </div>
            {loading ? (
              <div className="h-44 bg-white/4 rounded-xl animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={trendData} margin={{ left: -10 }}>
                  <defs>
                    <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.65 0.26 280)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="oklch(0.65 0.26 280)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="period" tick={{ fill: "oklch(1 0 0 / 30%)", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fill: "oklch(1 0 0 / 25%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "oklch(1 0 0 / 8%)" }} />
                  <Area type="monotone" dataKey="rating" stroke="oklch(0.65 0.26 280)" strokeWidth={2} fill="url(#ratingGrad)" name="Avg Rating" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* ── Business metrics bento grid ── */}
        {(loading || metricsSummary.length > 0) && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/30">Business Metrics</h3>
              <div className="h-px flex-1 bg-white/6" />
              <span className="text-xs text-white/25">90 days</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <>
                {/* Impressions group */}
                {impressionMetrics.length > 0 && (
                  <div className="mb-3">
                    <div className="text-[10px] uppercase tracking-widest text-white/20 font-semibold mb-2 px-1">Impressions</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {impressionMetrics.map(m => <MetricBentoCard key={m.metric_type} metric={m} />)}
                    </div>
                  </div>
                )}
                {/* Actions group */}
                {actionMetrics.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/20 font-semibold mb-2 px-1">Actions</div>
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
          <div className="text-center py-20 text-white/20">
            <TrendingUp className="w-10 h-10 mx-auto mb-4 opacity-20" />
            <p className="text-sm font-medium">No analytics data yet.</p>
            <p className="text-xs mt-1 text-white/15">Sync analytics from a location first.</p>
          </div>
        )}

      </div>
    </DashboardPageLayout>
  )
}
