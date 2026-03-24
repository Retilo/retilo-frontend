"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AppSidebar } from "@/components/dashboard/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Star, BarChart3, MessageSquare, MapPin, TrendingUp, TrendingDown, ArrowRight, Zap } from "lucide-react"
import { api } from "@/lib/api"

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ label, value, sub, trend, accent = "oklch(0.65 0.26 280)" }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[oklch(0.13_0.015_270)] p-5 relative overflow-hidden group hover:border-white/15 transition-all">
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ background: `radial-gradient(ellipse 80% 60% at 50% 120%, ${accent}12 0%, transparent 70%)` }}
      />
      <div className="text-xs text-white/40 mb-2">{label}</div>
      <div className="text-3xl font-bold text-white mb-1" style={{ color: accent === "oklch(0.65 0.26 280)" ? "white" : undefined }}>
        {value}
      </div>
      {sub && <div className="text-xs text-white/40">{sub}</div>}
      {trend && (
        <div className={`flex items-center gap-1 text-xs mt-1 ${trend.dir === "up" ? "text-green-400" : "text-red-400"}`}>
          {trend.dir === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend.label}
        </div>
      )}
    </div>
  )
}

// ── Quick action card ──────────────────────────────────────────
function QuickAction({ icon: Icon, title, description, href, accent }) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-2xl border border-white/8 bg-[oklch(0.13_0.015_270)] p-5 hover:border-white/15 transition-all"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${accent}18`, color: accent }}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-white">{title}</span>
          <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
        </div>
        <p className="text-xs text-white/45 leading-relaxed">{description}</p>
      </div>
    </Link>
  )
}

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

    // Fetch locations for overview stats
    api.get("/v1/gmb/locations")
      .then(res => setLocations(res.data.data ?? []))
      .catch(() => {}) // silently fail — show fallback data
      .finally(() => setLoading(false))
  }, [router])

  const totalReviews = locations.reduce((s, l) => s + (l.total_review_count ?? 0), 0)
  const avgRating = locations.length
    ? (locations.reduce((s, l) => s + (l.average_rating ?? 0), 0) / locations.length).toFixed(1)
    : "—"
  const avgResponseRate = locations.length
    ? Math.round(locations.reduce((s, l) => s + (l.response_rate ?? 0), 0) / locations.length)
    : 0

  const STATS = [
    { label: "Locations", value: loading ? "…" : locations.length || "0", sub: "connected to Google", accent: "oklch(0.65 0.26 280)" },
    { label: "Avg Rating", value: loading ? "…" : avgRating, sub: "across all locations", trend: { dir: "up", label: "+0.2 this month" }, accent: "oklch(0.70 0.18 55)" },
    { label: "Total Reviews", value: loading ? "…" : totalReviews.toLocaleString(), sub: "all time", accent: "oklch(0.60 0.20 160)" },
    { label: "Response Rate", value: loading ? "…" : `${avgResponseRate}%`, sub: "of reviews replied", accent: "oklch(0.65 0.22 30)" },
  ]

  const QUICK_ACTIONS = [
    { icon: Star,         title: "Manage Reviews",    description: "View unreplied reviews, generate AI replies, and post responses.",    href: "/dashboard/reviews",    accent: "oklch(0.65 0.26 280)" },
    { icon: BarChart3,    title: "View Analytics",    description: "Rating trends, sentiment breakdowns, and keyword insights.",          href: "/dashboard/analytics",  accent: "oklch(0.60 0.20 160)" },
    { icon: Zap,          title: "Build Workflows",   description: "Automate review replies and notifications with visual workflows.",    href: "/dashboard/workflows",  accent: "oklch(0.70 0.18 55)" },
    { icon: MapPin,       title: "Locations",         description: "Manage your connected Google Business locations and settings.",       href: "/dashboard/locations",  accent: "oklch(0.65 0.22 30)" },
    { icon: MessageSquare, title: "Campaigns",        description: "Send review request campaigns via SMS, email, or WhatsApp.",          href: "/dashboard/campaigns",  accent: "oklch(0.60 0.20 310)" },
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-screen overflow-hidden bg-[oklch(0.09_0.012_270)]">
        <div className="flex flex-col h-full">
          {/* Top bar */}
          <div className="flex items-center justify-between border-b border-white/6 bg-[oklch(0.09_0.012_270)/80%] backdrop-blur-sm px-8 py-4 sticky top-0 z-10">
            <div>
              <h1 className="text-base font-semibold text-white">
                {merchant?.name ? `Welcome back, ${merchant.name.split(" ")[0]}` : "Dashboard"}
              </h1>
              <p className="text-xs text-white/40 mt-0.5">
                {new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}
                {locations.length > 0 ? ` · ${locations.length} location${locations.length > 1 ? "s" : ""}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 animate-pulse rounded-full bg-green-500" />
              <span className="text-xs font-medium text-white/40">Live</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-8 py-8 space-y-8">

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {STATS.map((s) => <StatCard key={s.label} {...s} />)}
              </div>

              {/* No locations → onboarding prompt */}
              {!loading && locations.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[oklch(0.55_0.24_280)/40%] bg-[oklch(0.55_0.24_280)/8%] p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[oklch(0.55_0.24_280)/20%] flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-6 h-6 text-[oklch(0.75_0.20_280)]" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">Connect your first location</h3>
                  <p className="text-sm text-white/50 mb-6 max-w-sm mx-auto">
                    Connect your Google Business account to start managing reviews and analytics.
                  </p>
                  <Link
                    href="/onboarding"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[oklch(0.55_0.24_280)] hover:bg-[oklch(0.60_0.26_280)] text-white text-sm font-semibold transition-colors"
                  >
                    Connect Google Business
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* Quick actions */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-white/30">Quick actions</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {QUICK_ACTIONS.map((a) => <QuickAction key={a.title} {...a} />)}
                </div>
              </section>

              {/* Locations preview (if any) */}
              {locations.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-white/30">Locations</h2>
                    <Link href="/dashboard/locations" className="text-xs text-[oklch(0.75_0.20_280)] hover:text-white transition-colors">
                      View all
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {locations.slice(0, 5).map((loc) => (
                      <div key={loc.id} className="flex items-center gap-4 rounded-xl border border-white/8 bg-[oklch(0.13_0.015_270)] px-4 py-3 hover:border-white/15 transition-all">
                        <div className="w-8 h-8 rounded-lg bg-[oklch(0.55_0.24_280)/20%] flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4 text-[oklch(0.75_0.20_280)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{loc.title}</div>
                          <div className="text-xs text-white/40">{loc.email}</div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-sm font-semibold text-white">{loc.average_rating?.toFixed(1) ?? "—"}</div>
                            <div className="text-[10px] text-white/30">rating</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-white">{loc.total_review_count ?? 0}</div>
                            <div className="text-[10px] text-white/30">reviews</div>
                          </div>
                          <div className={`w-1.5 h-1.5 rounded-full ${loc.status ? "bg-green-400" : "bg-white/20"}`} />
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
