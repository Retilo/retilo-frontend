"use client"

// Analytics page — health scores, ratings, sentiment, metrics
// API: GET /v1/gmb/analytics/overview, /health, /ratings, /sentiment, /metrics/summary

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { TrendingUp, Star, MessageSquare, ChevronDown } from "lucide-react"
import { DashboardPageLayout } from "@/components/dashboard/page-layout"
import { api } from "@/lib/api"

// Custom tooltip for recharts — dark theme
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl bg-[oklch(0.15_0.018_270)] border border-white/12 px-3 py-2 text-xs shadow-xl">
      {label && <div className="text-white/40 mb-1">{label}</div>}
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color ?? "white" }}>
          {p.name}: <span className="font-semibold">{typeof p.value === "number" ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
    </div>
  )
}

function MetricCard({ label, value, sub, color = "oklch(0.65 0.26 280)" }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[oklch(0.13_0.015_270)] p-5">
      <div className="text-xs text-white/40 mb-2">{label}</div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      {sub && <div className="text-xs text-white/40">{sub}</div>}
    </div>
  )
}

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
    rating: parseFloat(t.avg_rating?.toFixed(2)),
    count: t.count,
  }))

  return (
    <DashboardPageLayout
      title="Analytics"
      subtitle="Rating trends, sentiment, and business metrics"
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
      <div className="max-w-4xl mx-auto px-8 py-6 space-y-6">

        {/* Health score */}
        {health && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Health Score" value={`${health.score}/100`} sub="composite score" />
            <MetricCard label="Avg Rating" value={health.meta?.averageRating?.toFixed(1) ?? "—"} sub={`${health.meta?.totalReviews ?? 0} reviews`} />
            <MetricCard label="Response Rate" value={`${health.meta?.responseRate ?? 0}%`} sub="of reviews replied" />
            <MetricCard label="Recent Reviews" value={health.meta?.recentReviews ?? 0} sub="last 30 days" />
          </div>
        )}

        {/* Two-column: rating distribution + sentiment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rating distribution */}
          <div className="rounded-2xl border border-white/8 bg-[oklch(0.13_0.015_270)] p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Rating Distribution</h3>
            {loading ? (
              <div className="h-32 bg-white/4 rounded-xl animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={ratingBars} barSize={28}>
                  <XAxis dataKey="stars" tick={{ fill: "oklch(1 0 0 / 40%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {ratingBars.map((b, i) => <Cell key={i} fill={b.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Sentiment */}
          {sentiment && (
            <div className="rounded-2xl border border-white/8 bg-[oklch(0.13_0.015_270)] p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Sentiment Breakdown</h3>
              <div className="space-y-3">
                {[
                  { label: "Positive", value: sentiment.positive ?? 0, color: "oklch(0.60 0.20 160)" },
                  { label: "Neutral", value: sentiment.neutral ?? 0, color: "oklch(0.70 0.18 55)" },
                  { label: "Negative", value: sentiment.negative ?? 0, color: "oklch(0.65 0.22 25)" },
                ].map(s => {
                  const total = (sentiment.positive ?? 0) + (sentiment.neutral ?? 0) + (sentiment.negative ?? 0)
                  const pct = total > 0 ? Math.round((s.value / total) * 100) : 0
                  return (
                    <div key={s.label}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-white/50">{s.label}</span>
                        <span className="text-white/70">{s.value} <span className="text-white/30">({pct}%)</span></span>
                      </div>
                      <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: s.color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Rating trend */}
        {trendData.length > 0 && (
          <div className="rounded-2xl border border-white/8 bg-[oklch(0.13_0.015_270)] p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Rating Trend (last 12 weeks)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendData}>
                <XAxis dataKey="period" tick={{ fill: "oklch(1 0 0 / 40%)", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} hide />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="rating" stroke="oklch(0.65 0.26 280)" strokeWidth={2} dot={false} name="Avg Rating" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Metrics summary */}
        {metricsSummary.length > 0 && (
          <div className="rounded-2xl border border-white/8 bg-[oklch(0.13_0.015_270)] p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Business Metrics (90 days)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {metricsSummary.map(m => (
                <div key={m.metric_type} className="rounded-xl bg-white/4 border border-white/8 p-3">
                  <div className="text-[10px] text-white/35 mb-1">
                    {m.metric_type.replace(/_/g, " ")}
                  </div>
                  <div className="text-lg font-bold text-white">{m.total?.toLocaleString()}</div>
                  {m.daily_avg && <div className="text-[10px] text-white/40">{m.daily_avg?.toFixed(1)}/day avg</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !overview && (
          <div className="text-center py-16 text-white/30">
            <BarChart className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No analytics data yet. Sync analytics from a location first.</p>
          </div>
        )}
      </div>
    </DashboardPageLayout>
  )
}
