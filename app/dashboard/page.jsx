"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AppSidebar } from "@/components/dashboard/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Star, BarChart3, MessageSquare, MapPin, TrendingUp, TrendingDown, ArrowRight, Zap } from "lucide-react"
import { api } from "@/lib/api"

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ label, value, sub, trend, accent = "oklch(0.58 0.24 350)" }) {
  return (
    <div
      className="rounded-2xl border p-5 relative overflow-hidden group transition-all hover:shadow-sm"
      style={{ background: "oklch(1 0 0)", borderColor: `${accent}20` }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(ellipse 80% 60% at 50% 120%, ${accent}08 0%, transparent 70%)` }}
      />
      <div className="text-xs font-medium text-[oklch(0.52_0.008_270)] mb-2">{label}</div>
      <div className="text-3xl font-bold mb-1" style={{ color: "oklch(0.14 0.008 270)" }}>
        {value}
      </div>
      {sub && <div className="text-xs text-[oklch(0.60_0.008_270)]">{sub}</div>}
      {trend && (
        <div className={`flex items-center gap-1 text-xs mt-1 ${trend.dir === "up" ? "text-emerald-600" : "text-red-500"}`}>
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
      className="group flex items-start gap-4 rounded-2xl border p-5 transition-all hover:shadow-sm hover:-translate-y-px"
      style={{ background: "oklch(1 0 0)", borderColor: `${accent}18` }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${accent}12`, color: accent }}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-[oklch(0.14_0.008_270)]">{title}</span>
          <ArrowRight className="w-4 h-4 text-[oklch(0.70_0.008_270)] group-hover:translate-x-0.5 transition-all" style={{ color: `${accent}80` }} />
        </div>
        <p className="text-xs text-[oklch(0.55_0.008_270)] leading-relaxed">{description}</p>
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

    api.get("/v1/gmb/locations")
      .then(res => setLocations(res.data.data ?? []))
      .catch(() => {})
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
    { label: "Locations",     value: loading ? "…" : locations.length || "0",          sub: "connected to Google",     accent: "oklch(0.58 0.24 350)" },
    { label: "Avg Rating",    value: loading ? "…" : avgRating,                         sub: "across all locations",    trend: { dir: "up", label: "+0.2 this month" }, accent: "oklch(0.55 0.22 55)" },
    { label: "Total Reviews", value: loading ? "…" : totalReviews.toLocaleString(),     sub: "all time",                accent: "oklch(0.52 0.20 160)" },
    { label: "Response Rate", value: loading ? "…" : `${avgResponseRate}%`,             sub: "of reviews replied",      accent: "oklch(0.55 0.22 280)" },
  ]

  const QUICK_ACTIONS = [
    { icon: Star,          title: "Manage Reviews",  description: "View unreplied reviews, generate AI replies, and post responses.",    href: "/dashboard/reviews",    accent: "oklch(0.58 0.24 350)" },
    { icon: BarChart3,     title: "View Analytics",  description: "Rating trends, sentiment breakdowns, and keyword insights.",          href: "/dashboard/analytics",  accent: "oklch(0.52 0.20 160)" },
    { icon: Zap,           title: "Build Workflows", description: "Automate review replies and notifications with visual workflows.",    href: "/dashboard/workflows",  accent: "oklch(0.55 0.22 55)" },
    { icon: MapPin,        title: "Locations",       description: "Manage your connected Google Business locations and settings.",       href: "/dashboard/locations",  accent: "oklch(0.55 0.22 280)" },
    { icon: MessageSquare, title: "Campaigns",       description: "Send review request campaigns via SMS, email, or WhatsApp.",          href: "/dashboard/campaigns",  accent: "oklch(0.52 0.20 310)" },
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-screen overflow-hidden" style={{ background: "oklch(0.985 0.003 350)" }}>
        <div className="flex flex-col h-full">

          {/* Top bar */}
          <div
            className="flex items-center justify-between px-8 py-4 sticky top-0 z-10 backdrop-blur-sm"
            style={{ background: "oklch(0.985 0.003 350 / 85%)", borderBottom: "1px solid oklch(0.91 0.008 350)" }}
          >
            <div>
              <h1 className="text-base font-semibold text-[oklch(0.14_0.008_270)]">
                {merchant?.name ? `Welcome back, ${merchant.name.split(" ")[0]}` : "Dashboard"}
              </h1>
              <p className="text-xs text-[oklch(0.55_0.008_270)] mt-0.5">
                {new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}
                {locations.length > 0 ? ` · ${locations.length} location${locations.length > 1 ? "s" : ""}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-[oklch(0.55_0.008_270)]">Live</span>
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
                <div
                  className="rounded-2xl border-2 border-dashed p-8 text-center"
                  style={{ borderColor: "oklch(0.58 0.24 350 / 35%)", background: "oklch(0.58 0.24 350 / 5%)" }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: "oklch(0.58 0.24 350 / 15%)" }}
                  >
                    <MapPin className="w-6 h-6" style={{ color: "oklch(0.48 0.22 350)" }} />
                  </div>
                  <h3 className="text-base font-semibold text-[oklch(0.14_0.008_270)] mb-2">Connect your first location</h3>
                  <p className="text-sm text-[oklch(0.55_0.008_270)] mb-6 max-w-sm mx-auto">
                    Connect your Google Business account to start managing reviews and analytics.
                  </p>
                  <Link
                    href="/onboarding"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 hover:shadow-md"
                    style={{ background: "oklch(0.58 0.24 350)" }}
                  >
                    Connect Google Business
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* Quick actions */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[oklch(0.60_0.008_270)]">Quick actions</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {QUICK_ACTIONS.map((a) => <QuickAction key={a.title} {...a} />)}
                </div>
              </section>

              {/* Locations preview */}
              {locations.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[oklch(0.60_0.008_270)]">Locations</h2>
                    <Link href="/dashboard/locations" className="text-xs font-medium transition-colors hover:opacity-75" style={{ color: "oklch(0.48 0.22 350)" }}>
                      View all
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {locations.slice(0, 5).map((loc) => (
                      <div
                        key={loc.id}
                        className="flex items-center gap-4 rounded-xl px-4 py-3 transition-all hover:shadow-sm"
                        style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.91 0.008 350)" }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: "oklch(0.58 0.24 350 / 12%)" }}
                        >
                          <MapPin className="w-4 h-4" style={{ color: "oklch(0.48 0.22 350)" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-[oklch(0.14_0.008_270)] truncate">{loc.title}</div>
                          <div className="text-xs text-[oklch(0.55_0.008_270)]">{loc.email}</div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-sm font-semibold text-[oklch(0.14_0.008_270)]">{loc.average_rating?.toFixed(1) ?? "—"}</div>
                            <div className="text-[10px] text-[oklch(0.60_0.008_270)]">rating</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-[oklch(0.14_0.008_270)]">{loc.total_review_count ?? 0}</div>
                            <div className="text-[10px] text-[oklch(0.60_0.008_270)]">reviews</div>
                          </div>
                          <div className={`w-1.5 h-1.5 rounded-full ${loc.status ? "bg-emerald-500" : "bg-[oklch(0.80_0.005_270)]"}`} />
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
