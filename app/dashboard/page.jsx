"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { AppSidebar } from "@/components/dashboard/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  Star, BarChart3, MapPin, ArrowRight, Zap, Globe,
  Phone, ShoppingBag, CheckCircle2, Circle, ChevronRight,
  TrendingUp, MessageSquare, Workflow, CalendarCheck,
} from "lucide-react"
import { api } from "@/lib/api"
import { LocationsMap } from "@/components/locations-map"

// ── Setup checklist ───────────────────────────────────────────────

const SETUP_STEPS = [
  {
    id:    "google",
    icon:  MapPin,
    title: "Connect Google Business",
    desc:  "Sync your locations, reviews and analytics",
    href:  "/dashboard/locations",
    color: "#4285F4",
  },
  {
    id:    "voice",
    icon:  Phone,
    title: "Set up Voice Agent",
    desc:  "AI receptionist — answers calls in Hindi & English",
    href:  "/dashboard/voice",
    color: "oklch(0.58 0.24 350)",
  },
  {
    id:    "workflow",
    icon:  Workflow,
    title: "Build your first workflow",
    desc:  "Visual agent builder — bookings, replies, follow-ups",
    href:  "/dashboard/workflows",
    color: "#6366f1",
  },
  {
    id:    "swiggy",
    icon:  ShoppingBag,
    title: "Connect Swiggy Dineout",
    desc:  "AI booking layer on India's #1 dining platform",
    href:  "/dashboard/swiggy",
    color: "#FC8019",
  },
]

function SetupChecklist({ locations, voiceAgents }) {
  const done = {
    google:   locations.length > 0,
    voice:    voiceAgents.length > 0,
    workflow: false,
    swiggy:   false,
  }
  const totalDone = Object.values(done).filter(Boolean).length
  const allDone   = totalDone === SETUP_STEPS.length

  if (allDone) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Get started</h2>
          <p className="text-xs text-gray-400 mt-0.5">{totalDone} of {SETUP_STEPS.length} steps complete</p>
        </div>
        <div className="flex gap-1">
          {SETUP_STEPS.map((s) => (
            <div
              key={s.id}
              className="h-1.5 w-8 rounded-full transition-all"
              style={{ background: done[s.id] ? "oklch(0.58 0.24 350)" : "oklch(0.91 0.008 350)" }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SETUP_STEPS.map((step, i) => {
          const isDone = done[step.id]
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                href={step.href}
                className="group flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all hover:shadow-sm hover:-translate-y-px"
                style={{
                  background:   isDone ? `${step.color}08` : "white",
                  borderColor:  isDone ? `${step.color}30` : "oklch(0.91 0.008 350)",
                  opacity:      isDone ? 0.6 : 1,
                }}
              >
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${step.color}15` }}
                >
                  {isDone
                    ? <CheckCircle2 className="size-4" style={{ color: step.color }} />
                    : <step.icon className="size-4" style={{ color: step.color }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 leading-none mb-1">{step.title}</p>
                  <p className="text-xs text-gray-400 leading-snug">{step.desc}</p>
                </div>
                {!isDone && (
                  <ChevronRight className="size-4 text-gray-300 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                )}
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

// ── Today strip ───────────────────────────────────────────────────

function TodayStrip({ locations }) {
  const totalReviews  = locations.reduce((s, l) => s + (l.total_review_count ?? 0), 0)
  const avgRating     = locations.length
    ? (locations.reduce((s, l) => s + (l.average_rating ?? 0), 0) / locations.length).toFixed(1)
    : null

  if (!locations.length) return null

  return (
    <div
      className="flex items-center gap-6 flex-wrap rounded-2xl px-5 py-3.5"
      style={{ background: "white", border: "1px solid oklch(0.91 0.008 350)" }}
    >
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Live</span>
      <div className="flex items-center gap-1.5">
        <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-sm font-bold text-gray-800">{locations.length}</span>
        <span className="text-xs text-gray-400">location{locations.length !== 1 ? "s" : ""}</span>
      </div>
      {avgRating && (
        <div className="flex items-center gap-1.5">
          <Star className="size-3.5 text-amber-500 fill-amber-500" />
          <span className="text-sm font-bold text-gray-800">{avgRating}</span>
          <span className="text-xs text-gray-400">avg rating</span>
        </div>
      )}
      {totalReviews > 0 && (
        <div className="flex items-center gap-1.5">
          <MessageSquare className="size-3.5 text-blue-500" />
          <span className="text-sm font-bold text-gray-800">{totalReviews.toLocaleString()}</span>
          <span className="text-xs text-gray-400">reviews</span>
        </div>
      )}
    </div>
  )
}

// ── Quick actions ─────────────────────────────────────────────────

const QUICK_ACTIONS = [
  {
    icon:  Star,
    label: "Reply to reviews",
    desc:  "AI-drafted replies waiting",
    href:  "/dashboard/reviews",
    color: "#f59e0b",
  },
  {
    icon:  Workflow,
    label: "Build a workflow",
    desc:  "Visual agent builder",
    href:  "/dashboard/workflows",
    color: "#6366f1",
  },
  {
    icon:  CalendarCheck,
    label: "Share booking link",
    desc:  "Get table reservations",
    href:  "/dashboard/booking-page",
    color: "#FC8019",
  },
  {
    icon:  Globe,
    label: "Run AI visibility scan",
    desc:  "See how AI finds you",
    href:  "/visibility",
    color: "#FD5BFF",
  },
]

function QuickActions() {
  return (
    <section>
      <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Quick actions</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {QUICK_ACTIONS.map((a, i) => (
          <motion.div
            key={a.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Link
              href={a.href}
              className="group flex flex-col gap-2.5 rounded-2xl border p-4 transition-all hover:shadow-sm hover:-translate-y-px"
              style={{ background: "white", borderColor: `${a.color}18` }}
            >
              <div
                className="flex size-9 items-center justify-center rounded-xl"
                style={{ background: `${a.color}12` }}
              >
                <a.icon className="size-4" style={{ color: a.color }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 leading-none mb-1">{a.label}</p>
                <p className="text-xs text-gray-400">{a.desc}</p>
              </div>
              <ArrowRight className="size-3.5 text-gray-300 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all self-end" />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ── Stat cards ────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent = "oklch(0.58 0.24 350)" }) {
  return (
    <div
      className="rounded-2xl border p-4 relative overflow-hidden group transition-all hover:shadow-sm"
      style={{ background: "white", borderColor: `${accent}20` }}
    >
      <div className="text-xs font-medium text-gray-400 mb-1.5">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const [locations,   setLocations]   = useState([])
  const [voiceAgents, setVoiceAgents] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [merchant,    setMerchant]    = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("retilo_token")
    if (!token) { router.replace("/auth"); return }
    const m = JSON.parse(localStorage.getItem("retilo_merchant") ?? "null")
    setMerchant(m)

    Promise.all([
      api.get("/v1/gmb/locations").then(r => r.data.data ?? []).catch(() => []),
      api.get("/v1/voice/agents").then(r => r.data.agents ?? r.data ?? []).catch(() => []),
    ]).then(([locs, agents]) => {
      setLocations(locs)
      setVoiceAgents(agents)
    }).finally(() => setLoading(false))
  }, [router])

  const totalReviews     = locations.reduce((s, l) => s + (l.total_review_count ?? 0), 0)
  const avgRating        = locations.length
    ? (locations.reduce((s, l) => s + (l.average_rating ?? 0), 0) / locations.length).toFixed(1)
    : "—"
  const avgResponseRate  = locations.length
    ? Math.round(locations.reduce((s, l) => s + (l.response_rate ?? 0), 0) / locations.length)
    : 0

  const firstName = merchant?.name?.split(" ")[0] ?? null

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar />
      <SidebarInset className="h-full overflow-hidden" style={{ background: "oklch(0.985 0.003 350)" }}>
        <div className="flex flex-col h-full">

          {/* Top bar */}
          <div
            className="flex items-center justify-between px-6 py-3.5 sticky top-0 z-10 backdrop-blur-sm"
            style={{ background: "oklch(0.985 0.003 350 / 85%)", borderBottom: "1px solid oklch(0.91 0.008 350)" }}
          >
            <div>
              <h1 className="text-sm font-semibold text-gray-800">
                {firstName ? `Hey ${firstName} 👋` : "Overview"}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/visibility"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                style={{ background: "rgba(253,91,255,0.10)", color: "#FD5BFF", border: "1px solid rgba(253,91,255,0.20)" }}
              >
                <Globe className="w-3 h-3" />
                AI Scan
              </Link>
              <Link
                href="/dashboard/workflows"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                style={{ background: "rgba(99,102,241,0.10)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.20)" }}
              >
                <Workflow className="w-3 h-3" />
                Workflow Builder
              </Link>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">
                {[72, 160, 120].map((h, i) => (
                  <div key={i} className="rounded-2xl animate-pulse" style={{ height: h, background: "oklch(0.93 0.005 350)" }} />
                ))}
              </div>
            ) : (
              <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

                {/* Setup checklist — shown until all done */}
                <SetupChecklist locations={locations} voiceAgents={voiceAgents} />

                {/* Live strip */}
                <TodayStrip locations={locations} />

                {/* Quick actions */}
                <QuickActions />

                {/* Stats — only meaningful once Google is connected */}
                {locations.length > 0 && (
                  <section>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">At a glance</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <StatCard label="Locations"     value={locations.length}              sub="on Google Business"      accent="oklch(0.58 0.24 350)" />
                      <StatCard label="Avg Rating"    value={avgRating}                     sub="across all locations"    accent="oklch(0.55 0.22 55)"  />
                      <StatCard label="Total Reviews" value={totalReviews.toLocaleString()} sub="all time"                accent="oklch(0.52 0.20 160)" />
                      <StatCard label="Response Rate" value={`${avgResponseRate}%`}          sub="of reviews replied"      accent="oklch(0.55 0.22 280)" />
                    </div>
                  </section>
                )}

                {/* Map — hero only after setup */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Your locations</h2>
                    {locations.length > 0 && (
                      <Link href="/dashboard/locations" className="text-xs font-medium hover:opacity-75 transition-opacity" style={{ color: "oklch(0.48 0.22 350)" }}>
                        Manage →
                      </Link>
                    )}
                  </div>

                  {locations.length > 0 ? (
                    <div className="h-64 rounded-2xl overflow-hidden border" style={{ borderColor: "oklch(0.91 0.008 350)" }}>
                      <LocationsMap
                        locations={locations}
                        onSelect={() => router.push("/dashboard/locations")}
                      />
                    </div>
                  ) : (
                    <Link
                      href="/dashboard/locations"
                      className="group flex items-center gap-4 rounded-2xl border-2 border-dashed px-6 py-8 transition-all hover:border-opacity-60"
                      style={{ borderColor: "oklch(0.58 0.24 350 / 25%)", background: "oklch(0.58 0.24 350 / 3%)" }}
                    >
                      <div className="flex size-12 items-center justify-center rounded-2xl" style={{ background: "oklch(0.58 0.24 350 / 10%)" }}>
                        <MapPin className="size-6" style={{ color: "oklch(0.48 0.22 350)" }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Connect Google Business</p>
                        <p className="text-xs text-gray-400 mt-0.5">Your locations will appear here — reviews, analytics and AI replies activate automatically</p>
                      </div>
                      <ArrowRight className="ml-auto size-4 text-gray-300 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  )}
                </section>

              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
