"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import {
  MapPin, ChevronRight, Star, CheckCircle2, XCircle, AlertCircle,
  Clock, TrendingUp, Shield, Search, MessageCircle, Mail, Camera,
  Zap, ArrowLeft, Globe, Phone, ExternalLink, Share2,
} from "lucide-react"
import { AppSidebar } from "@/components/dashboard/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AnimatedSearchInput } from "@/components/animated-search"
// IllustrationGraph removed — replaced with purpose-built DimensionCard
import { api } from "@/lib/api"

// ── Helpers ───────────────────────────────────────────────────────────────────

function gradeLabel(score, max) {
  const pct = max > 0 ? (score / max) * 100 : 0
  if (pct >= 85) return { letter: "A", color: "#16a34a", bg: "#dcfce7", border: "#bbf7d0" }
  if (pct >= 70) return { letter: "B", color: "#2563eb", bg: "#dbeafe", border: "#bfdbfe" }
  if (pct >= 55) return { letter: "C", color: "#ca8a04", bg: "#fef9c3", border: "#fef08a" }
  if (pct >= 40) return { letter: "D", color: "#ea580c", bg: "#ffedd5", border: "#fed7aa" }
  return { letter: "F", color: "#dc2626", bg: "#fee2e2", border: "#fecaca" }
}

function priorityBadge(priority) {
  if (priority === "high") return { label: "High impact", bg: "#fee2e2", color: "#dc2626", border: "#fecaca" }
  if (priority === "medium") return { label: "Medium", bg: "#fef9c3", color: "#ca8a04", border: "#fef08a" }
  return { label: "Quick win", bg: "#dcfce7", color: "#16a34a", border: "#bbf7d0" }
}

function vitalStatus(name, value) {
  if (name === "lcp") return value <= 2500 ? "good" : value <= 4000 ? "needs-work" : "poor"
  if (name === "cls") return value <= 100 ? "good" : value <= 250 ? "needs-work" : "poor"
  if (name === "inp") return value <= 200 ? "good" : value <= 500 ? "needs-work" : "poor"
  return "good"
}
const VITAL_COLORS = { good: "#16a34a", "needs-work": "#ca8a04", poor: "#dc2626" }

function DimensionCard({ label, color, data, index }) {
  const pct = data.max > 0 ? (data.score / data.max) * 100 : 0
  const breakdown = (data.breakdown ?? []).slice(0, 5)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.07 }}
      className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className="font-bold" style={{ color }}>{data.score}<span className="text-gray-400 text-sm font-normal">/{data.max}</span></span>
      </div>

      {/* Overall progress */}
      <div>
        <div className="h-1.5 w-full rounded-full bg-gray-100">
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.0, ease: "easeOut", delay: 0.2 + index * 0.1 }}
          />
        </div>
        <div className="text-[11px] text-gray-400 mt-0.5">{Math.round(pct)}% of max score</div>
      </div>

      {/* Breakdown bars */}
      {breakdown.length > 0 && (
        <div className="space-y-2">
          {breakdown.map((item, i) => {
            const itemPct = item.maxPoints > 0 ? (item.points / item.maxPoints) * 100 : (item.status === "pass" ? 100 : 0)
            const itemColor = item.status === "pass" ? "#16a34a" : item.status === "partial" ? "#ca8a04" : "#dc2626"
            return (
              <div key={item.name}>
                <div className="flex items-center justify-between text-[11px] mb-0.5">
                  <span className="text-gray-500 capitalize">{item.name.replace(/-/g, " ")}</span>
                  <span style={{ color: itemColor }}>{item.points}/{item.maxPoints}</span>
                </div>
                <div className="h-1 w-full rounded-full bg-gray-100">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: itemColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${itemPct}%` }}
                    transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 + i * 0.05 }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Web vitals */}
      {data.metrics && Object.keys(data.metrics).length > 0 && (
        <div className="grid grid-cols-3 gap-1.5">
          {Object.entries(data.metrics).map(([k, v]) => {
            const status = vitalStatus(k, v)
            const vc = VITAL_COLORS[status]
            const display = v > 1000 ? `${(v / 1000).toFixed(1)}s` : `${v}`
            return (
              <div key={k} className="text-center p-1.5 rounded-lg bg-gray-50">
                <div className="text-xs font-bold" style={{ color: vc }}>{display}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide">{k}</div>
              </div>
            )
          })}
        </div>
      )}

      {data.rating !== undefined && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          {data.rating} · {data.reviewCount?.toLocaleString()} reviews
        </div>
      )}
      {data.keywords?.primary && (
        <div className="text-xs text-gray-400">Keyword: <span style={{ color }}>{data.keywords.primary}</span></div>
      )}
    </motion.div>
  )
}

function InitialsAvatar({ name, size = 56 }) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?"
  const colors = ["#7c3aed", "#2563eb", "#059669", "#d97706", "#dc2626"]
  const bg = colors[name ? name.charCodeAt(0) % colors.length : 0]
  return (
    <div
      className="rounded-2xl flex items-center justify-center shrink-0 font-bold text-white"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.33 }}
    >
      {initials}
    </div>
  )
}

function ScoreRing({ score, max, size = 84 }) {
  const pct = max > 0 ? score / max : 0
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const grade = gradeLabel(score, max)
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f3f4f6" strokeWidth="7" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={grade.color} strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={String(circ)}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - pct * circ }}
          transition={{ duration: 1.1, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold leading-none" style={{ fontSize: size * 0.27, color: grade.color }}>{score}</span>
        <span className="text-gray-400 leading-none" style={{ fontSize: size * 0.12 }}>/{max}</span>
      </div>
    </div>
  )
}

// ── Cycling industry text ─────────────────────────────────────────────────────

const INDUSTRIES = ["restaurant", "clinic", "hotel", "spa", "gym", "salon", "cafe", "bakery"]

function CyclingIndustry() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % INDUSTRIES.length), 2200)
    return () => clearInterval(t)
  }, [])
  return (
    <span className="relative inline-block overflow-hidden align-bottom" style={{ minWidth: "5.5ch" }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={INDUSTRIES[index]}
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -16, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block"
          style={{
            backgroundImage: "linear-gradient(135deg, oklch(0.55 0.24 280) 0%, oklch(0.58 0.24 350) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {INDUSTRIES[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

// ── States ────────────────────────────────────────────────────────────────────

const PHASES = [
  { key: "ingestion",   label: "Collecting your Google Business data",  detail: "Business profile, photos, address & contact details" },
  { key: "enrichment",  label: "Building your business profile",        detail: "Screenshots, reviews, logo & location mapping" },
  { key: "analysis",    label: "Running 16 checks on your business",    detail: "Website UX, SEO keywords, reputation & performance" },
  { key: "scoring",     label: "Writing your personalised report",      detail: "Calculating growth scores & finding opportunities" },
]

function getPhaseStatus(phaseKey, tasks) {
  const pt = (tasks || []).filter((t) => t.phase === phaseKey)
  if (!pt.length) return "pending"
  if (pt.every((t) => t.status === "complete")) return "complete"
  if (pt.some((t) => t.status === "processing")) return "processing"
  if (pt.some((t) => t.status === "failed")) return "failed"
  return "pending"
}

// ── Presence Card (replaces static FluidRendering) ────────────────────────────

function PresenceCard({ report }) {
  const checks = (report.taskGroups || []).flatMap((g) => g.checks || [])
  const hasSSL = checks.find((c) => c.name === "has-ssl")?.status === "pass"
  const hasCTA = checks.find((c) => c.name === "has-cta")?.status === "pass"
  const hasSchema = checks.find((c) => c.name === "has-schema-markup")?.status === "pass"
  const hasOrdering = checks.find((c) => c.name === "has-online-ordering")?.status === "pass"
  const noExternal = checks.find((c) => c.name === "no-external-ordering-links")?.status === "pass"
  const hasSocial = checks.find((c) => c.name === "has-social-presence")?.status === "pass"
  const highRating = checks.find((c) => c.name === "high-rating")?.status === "pass"
  const sufficientReviews = checks.find((c) => c.name === "sufficient-reviews")?.status === "pass"

  const items = [
    { label: "Google Business verified", ok: true, always: true },
    { label: `Rating ${report.metadata?.rating || "?"} / 5`, ok: highRating, always: true },
    { label: `${(report.metadata?.userRatingsTotal || 0).toLocaleString()} Google reviews`, ok: sufficientReviews, always: true },
    { label: "HTTPS / SSL secure", ok: hasSSL },
    { label: "Booking / order CTA on website", ok: hasCTA },
    { label: "Schema markup (Google rich results)", ok: hasSchema },
    { label: "Direct online ordering", ok: hasOrdering },
    { label: "No 3rd-party commission links", ok: noExternal },
    { label: "Social media presence", ok: hasSocial },
  ]

  const passCount = items.filter((i) => i.ok).length
  const totalCount = items.length

  return (
    <div className="flex flex-col gap-4">
      {/* Score bar */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-gray-700">Online presence</span>
        <span className="text-xs text-gray-400">{passCount}/{totalCount} checks passed</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-gray-100 mb-2">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #7c3aed, #6366f1, #38bdf8)" }}
          initial={{ width: 0 }}
          animate={{ width: `${(passCount / totalCount) * 100}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>
      <div className="space-y-2">
        {items.map(({ label, ok }) => (
          <div key={label} className="flex items-center gap-2.5">
            {ok ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span className="text-sm" style={{ color: ok ? "#374151" : "#9ca3af" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DashboardGraderPage() {
  const router = useRouter()
  const [view, setView] = useState("search") // search | scanning | report
  const [query, setQuery] = useState("")
  const [predictions, setPredictions] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [searchError, setSearchError] = useState("")
  const [pipelineId, setPipelineId] = useState(null)
  const [pipeline, setPipeline] = useState(null)
  const [report, setReport] = useState(null)
  const [reportError, setReportError] = useState("")
  const [dots, setDots] = useState(".")
  const debounceRef = useRef(null)
  const pollRef = useRef(null)
  const dotsRef = useRef(null)

  // Dots animation during scan
  useEffect(() => {
    if (view !== "scanning") return
    dotsRef.current = setInterval(() => setDots((d) => (d.length >= 3 ? "." : d + ".")), 600)
    return () => { if (dotsRef.current) clearInterval(dotsRef.current) }
  }, [view])

  // Poll pipeline
  useEffect(() => {
    if (view !== "scanning" || !pipelineId) return

    async function poll() {
      try {
        const res = await api.get(`/v1/pipelines/${pipelineId}`)
        const data = res.data
        setPipeline(data)
        if (data.status === "completed" || data.status === "partial") {
          if (pollRef.current) clearInterval(pollRef.current)
          // Fetch report
          try {
            const r = await api.get(`/v1/pipelines/${pipelineId}/report`)
            setReport(r.data)
            setView("report")
          } catch {
            setReportError("Report not ready yet — try refreshing in a moment.")
            setView("report")
          }
        } else if (data.status === "failed") {
          if (pollRef.current) clearInterval(pollRef.current)
        }
      } catch { /* keep polling */ }
    }

    poll()
    pollRef.current = setInterval(poll, 3000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [view, pipelineId])

  const fetchPredictions = useCallback(async (input) => {
    if (input.length < 2) { setPredictions([]); return }
    setIsSearching(true)
    try {
      const res = await api.get("/v1/places/autocomplete", { params: { input } })
      setPredictions(res.data?.predictions ?? [])
    } catch { setPredictions([]) }
    finally { setIsSearching(false) }
  }, [])

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    setPredictions([])
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchPredictions(val), 380)
  }

  const handleSelect = async (p) => {
    setSearchError("")
    setIsStarting(true)
    setPredictions([])
    setQuery(p.name)
    try {
      const res = await api.post("/v1/pipelines", {
        type: "brand-from-place-id",
        params: { googlePlaceId: p.place_id, source: "grader-dashboard" },
      })
      const id = res.data?.id
      if (!id) throw new Error("no id")
      setPipelineId(id)
      setView("scanning")
    } catch {
      setSearchError("Failed to start. Please try again.")
    } finally {
      setIsStarting(false)
    }
  }

  const resetSearch = () => {
    setView("search")
    setQuery("")
    setPredictions([])
    setPipeline(null)
    setReport(null)
    setPipelineId(null)
    setReportError("")
    if (pollRef.current) clearInterval(pollRef.current)
  }

  // Share helpers
  const reportUrl = typeof window !== "undefined" ? `${window.location.origin}/grader/${pipelineId}/report` : ""
  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(`Business growth report for ${report?.metadata?.name}: ${reportUrl}`)}`, "_blank")
  const shareEmail = () => window.open(`mailto:?subject=Growth Report: ${report?.metadata?.name}&body=${encodeURIComponent(`Here's the growth report:\n\n${reportUrl}`)}`, "_blank")

  const tasks = pipeline?.tasks ?? []
  const percentage = pipeline?.progress?.percentage ?? 0
  const brandName = pipeline?.brand?.name ?? query ?? "your business"
  const isFailed = pipeline?.status === "failed"

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen" style={{ background: "oklch(0.985 0.003 350)" }}>

          {/* ── Header bar ───────────────────────────────────── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="flex items-center justify-center w-7 h-7 rounded-lg transition-all hover:bg-gray-100 active:scale-95 shrink-0"
                style={{ color: "#9ca3af" }}
                aria-label="Go back"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
              </button>
              {view !== "search" && (
                <button
                  onClick={resetSearch}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
                >
                  New search
                </button>
              )}
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#f0fdf4" }}>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-[15px] font-bold text-gray-900 leading-none">Business Grader</h1>
                <p className="text-[11px] text-gray-400 mt-0.5">Free growth report for any business</p>
              </div>
            </div>
            {view === "report" && report && (
              <div className="flex gap-2">
                <button
                  onClick={shareWhatsApp}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </button>
                <button
                  onClick={shareEmail}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: "#ede9fe", color: "#7c3aed", border: "1px solid #ddd6fe" }}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </button>
              </div>
            )}
          </div>

          <div className="p-6 max-w-5xl mx-auto">
            <AnimatePresence mode="wait">

              {/* ── SEARCH ───────────────────────────────────────── */}
              {view === "search" && (
                <motion.div
                  key="search"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex flex-col items-center pt-8 pb-12"
                >
                  <div className="w-full max-w-xl">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Grade any <CyclingIndustry /> in 60 seconds
                      </h2>
                      <p className="text-gray-500 text-sm">Search below — we'll check their Google presence, website, reputation and SEO across 16 points.</p>
                    </div>

                    <div className="relative">
                      <AnimatedSearchInput
                        placeholder="Search your business name…"
                        value={query}
                        onChange={handleChange}
                        onClear={() => { setQuery(""); setPredictions([]) }}
                        isLoading={isSearching || isStarting}
                        loadingText={isStarting ? "Starting report…" : "Searching…"}
                        blobTranslucent
                      />

                      <AnimatePresence>
                        {predictions.length > 0 && !isStarting && (
                          <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.13 }}
                            className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50 bg-white"
                            style={{ border: "1px solid #e5e7eb", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
                          >
                            {predictions.map((p, i) => (
                              <button
                                key={p.place_id}
                                onClick={() => handleSelect(p)}
                                className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
                                style={{ borderBottom: i < predictions.length - 1 ? "1px solid #f3f4f6" : undefined }}
                              >
                                <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center shrink-0 mt-0.5">
                                  <MapPin className="w-3.5 h-3.5 text-violet-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-semibold text-gray-900 truncate">{p.name}</div>
                                  <div className="text-xs text-gray-400 mt-0.5 truncate">{p.address}</div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {searchError && (
                        <p className="mt-3 text-sm text-center text-red-500">{searchError}</p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-6 mt-10">
                      {[
                        { val: "16", label: "checks per report" },
                        { val: "60s", label: "to generate" },
                        { val: "Free", label: "always" },
                      ].map((s) => (
                        <div key={s.label} className="text-center p-4 rounded-2xl bg-white border border-gray-100">
                          <div className="text-xl font-bold text-violet-600">{s.val}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── SCANNING ─────────────────────────────────────── */}
              {view === "scanning" && (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="max-w-lg mx-auto pt-8"
                >
                  <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">
                      Grading <span className="text-violet-600">{brandName}</span>{!isFailed && dots}
                    </h2>
                    <p className="text-gray-400 text-sm mb-6">Hang tight — this takes about 60 seconds</p>

                    {/* Progress */}
                    <div className="mb-6">
                      <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                        <span>{Math.round(percentage)}% complete</span>
                        <span>{pipeline?.progress?.completed ?? 0}/{pipeline?.progress?.total ?? 16} checks</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-gray-100">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: "linear-gradient(90deg, #7c3aed, #6366f1)" }}
                          animate={{ width: `${Math.max(percentage, 3)}%` }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    {/* Phases */}
                    <div className="space-y-2.5">
                      {PHASES.map((phase, i) => {
                        const status = getPhaseStatus(phase.key, tasks)
                        return (
                          <motion.div
                            key={phase.key}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.07 }}
                            className="flex items-start gap-3 p-3 rounded-xl"
                            style={{
                              background: status === "processing" ? "#f5f3ff" : status === "complete" ? "#f0fdf4" : "#fafafa",
                              border: status === "processing" ? "1px solid #ddd6fe" : status === "complete" ? "1px solid #bbf7d0" : "1px solid #f3f4f6",
                              transition: "all 0.4s ease",
                            }}
                          >
                            <div className="mt-0.5 shrink-0">
                              {status === "complete" ? (
                                <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>
                                  <CheckCircle2 className="w-[18px] h-[18px] text-emerald-500" />
                                </motion.div>
                              ) : status === "processing" ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                                  className="w-[18px] h-[18px] rounded-full"
                                  style={{ border: "2px solid #ddd6fe", borderTopColor: "#7c3aed" }}
                                />
                              ) : status === "failed" ? (
                                <AlertCircle className="w-[18px] h-[18px] text-red-400" />
                              ) : (
                                <Clock className="w-[18px] h-[18px] text-gray-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div
                                className="text-sm font-medium"
                                style={{ color: status === "complete" ? "#16a34a" : status === "processing" ? "#7c3aed" : "#9ca3af" }}
                              >
                                {phase.label}
                              </div>
                              <AnimatePresence>
                                {status !== "pending" && (
                                  <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="text-xs text-gray-400 mt-0.5"
                                  >
                                    {phase.detail}
                                  </motion.p>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>

                    {isFailed && (
                      <div className="mt-5 p-4 rounded-xl bg-red-50 border border-red-100 text-center">
                        <p className="text-red-600 text-sm font-medium">This scan couldn't complete. Try searching for a different listing.</p>
                        <button onClick={resetSearch} className="mt-2 text-xs text-gray-400 hover:text-gray-600 underline">
                          Search again
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── REPORT ───────────────────────────────────────── */}
              {view === "report" && (
                <motion.div
                  key="report"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {reportError && (
                    <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 mb-5 text-center">
                      <p className="text-yellow-700 text-sm">{reportError}</p>
                    </div>
                  )}

                  {report && (() => {
                    const { metadata: meta, overallScore, maxScore, scores, taskGroups, insights, media, topReviews } = report
                    const grade = gradeLabel(overallScore, maxScore)

                    const DIMENSIONS = [
                      { key: "guestExperience", label: "Guest Experience", color: "#7c3aed", data: scores?.guestExperience },
                      { key: "reputation",       label: "Reputation",       color: "#16a34a", data: scores?.reputation },
                      { key: "searchResults",    label: "Search Visibility", color: "#2563eb", data: scores?.searchResults },
                    ]

                    return (
                      <div className="space-y-5">

                        {/* Hero */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row items-start md:items-center gap-5 shadow-sm">
                          {/* Logo / initials */}
                          {media?.logo ? (
                            <img
                              src={media.logo}
                              alt={meta.name}
                              className="w-14 h-14 rounded-2xl object-cover shrink-0"
                              style={{ border: "1px solid #f3f4f6" }}
                              onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex" }}
                            />
                          ) : null}
                          <InitialsAvatar name={meta.name} size={56} />

                          <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-bold text-gray-900">{meta.name}</h2>
                            <div className="flex flex-wrap items-center gap-3 mt-1">
                              {meta.rating && (
                                <span className="flex items-center gap-1 text-sm text-gray-500">
                                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                  {meta.rating} · {meta.userRatingsTotal?.toLocaleString()} reviews
                                </span>
                              )}
                              {meta.address?.city && (
                                <span className="flex items-center gap-1 text-sm text-gray-400">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {meta.address.city}{meta.address.state ? `, ${meta.address.state}` : ""}
                                </span>
                              )}
                              {meta.website && (
                                <a href={meta.website} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-sm text-violet-600 hover:underline">
                                  <Globe className="w-3.5 h-3.5" />
                                  Website
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            {meta.cuisines?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {meta.cuisines.slice(0, 5).map((c) => (
                                  <span key={c} className="px-2 py-0.5 rounded-full text-xs capitalize bg-violet-50 text-violet-700 border border-violet-100">{c}</span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Score ring + grade */}
                          <div className="flex flex-col items-center gap-2 shrink-0">
                            <ScoreRing score={overallScore} max={maxScore} size={84} />
                            <span
                              className="px-3 py-1 rounded-full text-sm font-bold"
                              style={{ background: grade.bg, color: grade.color, border: `1px solid ${grade.border}` }}
                            >
                              Grade {grade.letter}
                            </span>
                          </div>
                        </div>

                        {/* 3 Dimension cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {DIMENSIONS.map(({ key, label, color, data }, i) => data && (
                            <DimensionCard key={key} label={label} color={color} data={data} index={i} />
                          ))}
                        </div>

                        {/* Checks + Presence side by side */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Checks */}
                          {taskGroups?.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                              <h3 className="text-sm font-bold text-gray-800 mb-4">Detailed Checks</h3>
                              {taskGroups.map((group) => (
                                <div key={group.name} className="mb-4 last:mb-0">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{group.name}</span>
                                    <span className="text-xs text-gray-400">{group.score}/{group.max}</span>
                                  </div>
                                  <div>
                                    {group.checks.map((c) => (
                                      <div key={c.name} className="flex items-start gap-2.5 py-2" style={{ borderBottom: "1px solid #f9fafb" }}>
                                        <div className="shrink-0 mt-0.5">
                                          {c.status === "pass" ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                          ) : c.status === "partial" ? (
                                            <AlertCircle className="w-4 h-4 text-yellow-400" />
                                          ) : (
                                            <XCircle className="w-4 h-4 text-red-400" />
                                          )}
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-700 capitalize">{c.name.replace(/-/g, " ")}</p>
                                          {c.issue && <p className="text-xs text-gray-400 mt-0.5">{c.issue}</p>}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Dynamic presence card */}
                          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                            <PresenceCard report={report} />
                            {meta.phone && (
                              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
                                <Phone className="w-3.5 h-3.5 text-gray-300" />
                                <span className="text-sm text-gray-500">{meta.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Insights */}
                        {insights?.length > 0 && (
                          <div>
                            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                              <Zap className="w-4 h-4 text-violet-500" />
                              Growth opportunities ({insights.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                              {insights.map((ins, i) => {
                                const badge = priorityBadge(ins.priority)
                                return (
                                  <motion.div
                                    key={ins.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col gap-3"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span
                                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                        style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}
                                      >
                                        {badge.label}
                                      </span>
                                      <span className="text-xs text-gray-300 capitalize">{ins.type}</span>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-semibold text-gray-800 leading-snug">{ins.title}</h4>
                                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">{ins.description}</p>
                                    </div>
                                    <div className="text-xs bg-violet-50 text-violet-700 rounded-xl p-3 leading-relaxed border border-violet-100">
                                      <span className="font-semibold">What to do: </span>{ins.action}
                                    </div>
                                  </motion.div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Reviews */}
                        {topReviews?.length > 0 && (
                          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              Top Reviews
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {topReviews.slice(0, 4).map((rev, i) => (
                                <div key={i} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-sm font-medium text-gray-700">{rev.author}</span>
                                    <span className="flex items-center gap-0.5">
                                      {Array.from({ length: Math.min(5, rev.rating) }).map((_, j) => (
                                        <Star key={j} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                      ))}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{rev.text}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Screenshots */}
                        {(media?.screenshots?.desktop || media?.screenshots?.mobile) && (
                          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-800 mb-4">Website Screenshots</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {media.screenshots.desktop && (
                                <div>
                                  <p className="text-xs text-gray-400 mb-2">Desktop</p>
                                  <img src={media.screenshots.desktop} alt="Desktop" className="w-full rounded-xl border border-gray-100 object-cover" />
                                </div>
                              )}
                              {media.screenshots.mobile && (
                                <div>
                                  <p className="text-xs text-gray-400 mb-2">Mobile</p>
                                  <img src={media.screenshots.mobile} alt="Mobile" className="max-w-[180px] rounded-xl border border-gray-100 object-cover" />
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Camera upsell */}
                        <div
                          className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                          style={{ background: "linear-gradient(135deg, #f5f3ff, #ede9fe)", border: "1px solid #ddd6fe" }}
                        >
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#ede9fe" }}>
                            <Camera className="w-6 h-6 text-violet-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-gray-900">Upgrade your photos & Reels</h3>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                              Professional photography boosts your Google ranking and footfall. I bring the camera to you.
                            </p>
                          </div>
                          <div className="flex gap-2 shrink-0 flex-wrap">
                            <a
                              href="https://wa.me/917288807097"
                              target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                              style={{ background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0" }}
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              WhatsApp Satwik
                            </a>
                            <a
                              href={`mailto:satwik@retilo.io?subject=Photography for ${meta.name}`}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                              style={{ background: "#ede9fe", color: "#7c3aed", border: "1px solid #ddd6fe" }}
                            >
                              <Mail className="w-3.5 h-3.5" />
                              Email
                            </a>
                          </div>
                        </div>

                      </div>
                    )
                  })()}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
