"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { AppSidebar } from "@/components/dashboard/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  Star, BarChart3, MessageSquare, MapPin, TrendingUp, TrendingDown,
  ArrowRight, Zap, Activity, Globe, Mail, Webhook, CheckCircle2,
  AlertCircle, Clock, RefreshCw, ExternalLink, ChevronRight,
} from "lucide-react"
import { api } from "@/lib/api"
import { ModuleHelper } from "@/components/module-helper"

// ── Endpoint health card ──────────────────────────────────────────────────────

function EndpointCard({ icon: Icon, name, status, meta, href, accent, pulse }) {
  const statusColor = status === "live" ? "#22c55e" : status === "error" ? "#ef4444" : "#f59e0b"
  const statusLabel = status === "live" ? "Live" : status === "error" ? "Error" : "Degraded"
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border px-4 py-3 transition-all hover:shadow-sm hover:-translate-y-px"
      style={{ background: "white", borderColor: `${accent}18` }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${accent}12`, color: accent }}>
        <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-800 truncate">{name}</div>
        <div className="text-xs text-gray-400 truncate">{meta}</div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor, boxShadow: pulse ? `0 0 4px ${statusColor}` : "none", animation: pulse ? "pulse 2s infinite" : "none" }} />
          <span className="text-xs font-medium" style={{ color: statusColor }}>{statusLabel}</span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  )
}

// ── Activity feed item ────────────────────────────────────────────────────────

const FEED_ICONS = {
  review: Star,
  reply: Zap,
  rank: TrendingUp,
  campaign: Mail,
  sync: RefreshCw,
}

function FeedItem({ event }) {
  const Icon = FEED_ICONS[event.type] ?? Activity
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 py-2.5"
    >
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${event.color}15`, color: event.color }}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-700 leading-relaxed">{event.label}</p>
        <span className="text-[10px] text-gray-400">{event.time}</span>
      </div>
      {event.delta && (
        <span className={`text-[10px] font-bold flex-shrink-0 ${event.delta > 0 ? "text-emerald-500" : "text-red-400"}`}>
          {event.delta > 0 ? "+" : ""}{event.delta}
        </span>
      )}
    </motion.div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, trend, accent = "oklch(0.58 0.24 350)" }) {
  return (
    <div
      className="rounded-2xl border p-5 relative overflow-hidden group transition-all hover:shadow-sm"
      style={{ background: "white", borderColor: `${accent}20` }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl" style={{ background: `radial-gradient(ellipse 80% 60% at 50% 120%, ${accent}08 0%, transparent 70%)` }} />
      <div className="text-xs font-medium text-gray-500 mb-2">{label}</div>
      <div className="text-3xl font-bold mb-1 text-gray-900">{value}</div>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
      {trend && (
        <div className={`flex items-center gap-1 text-xs mt-1 ${trend.dir === "up" ? "text-emerald-600" : "text-red-500"}`}>
          {trend.dir === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend.label}
        </div>
      )}
    </div>
  )
}

// ── Mock activity feed ────────────────────────────────────────────────────────

const MOCK_FEED = [
  { type: "review",   label: "New 5★ review — \"Amazing service!\" — Melbourne CBD",          time: "2 min ago",  color: "#f59e0b", delta: null },
  { type: "reply",    label: "AI reply sent to James K. on George St location",               time: "5 min ago",  color: "#7c3aed", delta: null },
  { type: "rank",     label: "Keyword 'best coffee Sydney' moved to position #3",             time: "18 min ago", color: "#22c55e", delta: +3 },
  { type: "campaign", label: "Review request campaign sent — 42 contacts",                    time: "1 hr ago",   color: "#0ea5e9", delta: null },
  { type: "sync",     label: "GMB sync complete — 3 locations updated",                       time: "2 hr ago",   color: "#6b7280", delta: null },
  { type: "rank",     label: "Keyword 'hair salon Brisbane' dropped from #7 to #10",          time: "3 hr ago",   color: "#ef4444", delta: -3 },
]

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [merchant, setMerchant] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("retilo_token")
    if (!token) { router.replace("/auth"); return }
    const m = JSON.parse(localStorage.getItem("retilo_merchant") ?? "null")
    setMerchant(m)
    api.get("/v1/gmb/locations")
      .then(res => setLocations(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  const totalReviews = locations.reduce((s, l) => s + (l.total_review_count ?? 0), 0)
  const avgRating = locations.length ? (locations.reduce((s, l) => s + (l.average_rating ?? 0), 0) / locations.length).toFixed(1) : "—"
  const avgResponseRate = locations.length ? Math.round(locations.reduce((s, l) => s + (l.response_rate ?? 0), 0) / locations.length) : 0

  const STATS = [
    { label: "Locations",     value: loading ? "…" : locations.length || "0",      sub: "connected to Google",  accent: "oklch(0.58 0.24 350)" },
    { label: "Avg Rating",    value: loading ? "…" : avgRating,                     sub: "across all locations", trend: { dir: "up", label: "+0.2 this month" }, accent: "oklch(0.55 0.22 55)" },
    { label: "Total Reviews", value: loading ? "…" : totalReviews.toLocaleString(), sub: "all time",             accent: "oklch(0.52 0.20 160)" },
    { label: "Response Rate", value: loading ? "…" : `${avgResponseRate}%`,         sub: "of reviews replied",   accent: "oklch(0.55 0.22 280)" },
  ]

  const ENDPOINTS = [
    { icon: MapPin,       name: "Google Business",  status: locations.length > 0 ? "live" : "error",  meta: `${locations.length} location${locations.length !== 1 ? "s" : ""} synced`,    href: "/dashboard/locations",  accent: "#4285F4", pulse: locations.length > 0 },
    { icon: Star,         name: "Review Engine",    status: "live",      meta: "AI replies active",                                href: "/dashboard/reviews",    accent: "#f59e0b", pulse: true  },
    { icon: BarChart3,    name: "Analytics",        status: "live",      meta: "Real-time data",                                   href: "/dashboard/analytics",  accent: "#22c55e", pulse: false },
    { icon: Globe,        name: "AI Visibility",    status: "degraded",  meta: "Not yet scanned",                                  href: "/visibility",              accent: "#FD5BFF", pulse: false },
    { icon: Mail,         name: "Email Agent",      status: "live",      meta: "Campaign queue ready",                             href: "/email/agent",          accent: "#7c3aed", pulse: false },
    { icon: Zap,          name: "Workflows",        status: "live",      meta: "4 active automations",                             href: "/dashboard/workflows",  accent: "#0ea5e9", pulse: true  },
  ]

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar />
      <SidebarInset className="h-full overflow-hidden" style={{ background: "oklch(0.985 0.003 350)" }}>
        <div className="flex flex-col h-full">

          {/* Top bar */}
          <div className="flex items-center justify-between px-8 py-4 sticky top-0 z-10 backdrop-blur-sm" style={{ background: "oklch(0.985 0.003 350 / 85%)", borderBottom: "1px solid oklch(0.91 0.008 350)" }}>
            <div>
              <h1 className="text-base font-semibold text-gray-800">
                {merchant?.name ? `Welcome back, ${merchant.name.split(" ")[0]}` : "Control Center"}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}
                {locations.length > 0 ? ` · ${locations.length} endpoint${locations.length > 1 ? "s" : ""} active` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/visibility" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90" style={{ background: "rgba(253,91,255,0.12)", color: "#FD5BFF", border: "1px solid rgba(253,91,255,0.25)" }}>
                <Globe className="w-3 h-3" />
                AI Scan
              </Link>
              <div className="flex items-center gap-1.5">
                <div className="size-2 animate-pulse rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-gray-400">Live</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-8 py-8 space-y-8">
              <ModuleHelper
                moduleKey="dashboard-home-v1"
                title="Welcome to Retilo Control Center"
                description="This is your command centre — connect a Google Business location via the sidebar to activate reviews, analytics, voice AI, ranking intel, and demand forecasting for your business."
                rimVariant="default"
              />

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {STATS.map((s) => <StatCard key={s.label} {...s} />)}
              </div>

              {/* Onboarding prompt */}
              {!loading && locations.length === 0 && (
                <div className="rounded-2xl border-2 border-dashed p-8 text-center" style={{ borderColor: "oklch(0.58 0.24 350 / 35%)", background: "oklch(0.58 0.24 350 / 5%)" }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "oklch(0.58 0.24 350 / 15%)" }}>
                    <MapPin className="w-6 h-6" style={{ color: "oklch(0.48 0.22 350)" }} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-800 mb-2">Connect your first endpoint</h3>
                  <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">Connect your Google Business account to activate all endpoint monitoring.</p>
                  <Link href="/onboarding" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 hover:shadow-md" style={{ background: "oklch(0.58 0.24 350)" }}>
                    Connect Google Business <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* Endpoint grid + Activity feed */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* Endpoints */}
                <div className="lg:col-span-3">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Digital Endpoints</h2>
                    <span className="text-xs text-gray-300 font-medium">{ENDPOINTS.filter(e => e.status === "live").length}/{ENDPOINTS.length} live</span>
                  </div>
                  <div className="space-y-2">
                    {ENDPOINTS.map((ep) => <EndpointCard key={ep.name} {...ep} />)}
                  </div>
                </div>

                {/* Activity feed */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Activity</h2>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs text-gray-300 font-medium">Live</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border p-4 divide-y divide-gray-50" style={{ background: "white", borderColor: "rgba(0,0,0,0.07)" }}>
                    {MOCK_FEED.map((event, i) => (
                      <FeedItem key={i} event={event} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Locations table */}
              {locations.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Locations</h2>
                    <Link href="/dashboard/locations" className="text-xs font-medium transition-colors hover:opacity-75" style={{ color: "oklch(0.48 0.22 350)" }}>View all</Link>
                  </div>
                  <div className="space-y-2">
                    {locations.slice(0, 5).map((loc) => (
                      <div key={loc.id} className="flex items-center gap-4 rounded-xl px-4 py-3 transition-all hover:shadow-sm" style={{ background: "white", border: "1px solid oklch(0.91 0.008 350)" }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "oklch(0.58 0.24 350 / 12%)" }}>
                          <MapPin className="w-4 h-4" style={{ color: "oklch(0.48 0.22 350)" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-800 truncate">{loc.title}</div>
                          <div className="text-xs text-gray-400">{loc.email}</div>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-sm font-semibold text-gray-800">{loc.average_rating?.toFixed(1) ?? "—"}</div>
                            <div className="text-[10px] text-gray-400">rating</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-gray-800">{loc.total_review_count ?? 0}</div>
                            <div className="text-[10px] text-gray-400">reviews</div>
                          </div>
                          <div className={`w-1.5 h-1.5 rounded-full ${loc.status ? "bg-emerald-500" : "bg-gray-200"}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
