"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Star, Sparkles, Send, RefreshCw, Filter,
  MessageSquare, MapPin, Clock, ChevronDown,
  X, Zap, TrendingUp,
} from "lucide-react"
import { api } from "@/lib/api"

// ── Colours ────────────────────────────────────────────────────
const PINK  = "oklch(0.58 0.24 350)"
const TEXT  = "oklch(0.14 0.008 270)"
const MUTED = "oklch(0.55 0.008 270)"
const FAINT = "oklch(0.70 0.008 270)"
const CARD  = "oklch(1 0 0)"
const BORDER= "oklch(0.91 0.008 270)"

// ── Source badge ───────────────────────────────────────────────
function SourceBadge({ source }) {
  const cfg = {
    gmb:       { label: "Google Business", color: "oklch(0.50 0.18 145)" , bg: "oklch(0.50 0.18 145 / 10%)" },
    whatsapp:  { label: "WhatsApp",        color: "oklch(0.48 0.22 145)" , bg: "oklch(0.48 0.22 145 / 10%)" },
    email:     { label: "Email",           color: "oklch(0.52 0.20 270)" , bg: "oklch(0.52 0.20 270 / 10%)" },
  }[source] ?? { label: source, color: MUTED, bg: "oklch(0.92 0.005 270)" }

  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {cfg.label}
    </span>
  )
}

// ── Star rating ────────────────────────────────────────────────
function Stars({ rating }) {
  const color = rating >= 4 ? "#F59E0B" : rating <= 2 ? "#EF4444" : "#F97316"
  return (
    <span className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className="size-3"
          style={{ fill: i < rating ? color : "transparent", color: i < rating ? color : "oklch(0.82 0.005 270)" }}
        />
      ))}
    </span>
  )
}

// ── AI Reply Panel ─────────────────────────────────────────────
function AIReplyPanel({ event, onClose, onPosted }) {
  const [draft, setDraft] = useState("")
  const [generating, setGenerating] = useState(false)
  const [posting, setPosting] = useState(false)

  const generate = async () => {
    setGenerating(true)
    try {
      const res = await api.post(`/v1/gmb/reviews/${event.reviewId ?? event.id}/ai-reply`, { send: false })
      setDraft(res.data.data?.replyText ?? "")
    } catch {
      setDraft("Thank you for your review! We appreciate your feedback and look forward to serving you again.")
    } finally {
      setGenerating(false)
    }
  }

  const post = async () => {
    if (!draft.trim()) return
    setPosting(true)
    try {
      await api.post(`/v1/gmb/reviews/${event.reviewId ?? event.id}/reply`, { replyText: draft })
      onPosted(event.id ?? event.reviewId)
    } finally {
      setPosting(false)
    }
  }

  return (
    <div
      className="border-t p-4 space-y-3"
      style={{ background: "oklch(0.985 0.003 270)", borderColor: BORDER }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: PINK }}>
          AI Reply
        </span>
        <button onClick={onClose} className="rounded-md p-0.5 hover:bg-black/5 transition-colors">
          <X className="size-3.5" style={{ color: FAINT }} />
        </button>
      </div>

      <textarea
        rows={3}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        placeholder="Click 'Generate' to draft an AI reply, or write your own…"
        className="w-full rounded-xl text-sm px-3 py-2.5 outline-none resize-none transition-all"
        style={{
          background: CARD,
          border: `1px solid ${BORDER}`,
          color: TEXT,
          fontFamily: "inherit",
        }}
        onFocus={e => e.target.style.borderColor = PINK}
        onBlur={e => e.target.style.borderColor = BORDER}
      />

      <div className="flex items-center gap-2">
        <button
          onClick={generate}
          disabled={generating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-60 hover:opacity-85"
          style={{ background: `${PINK}12`, border: `1px solid ${PINK}30`, color: PINK }}
        >
          <Sparkles className="size-3.5" />
          {generating ? "Generating…" : "Generate"}
        </button>

        <button
          onClick={post}
          disabled={posting || !draft.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-medium transition-all disabled:opacity-60 ml-auto hover:opacity-90"
          style={{ background: PINK }}
        >
          <Send className="size-3.5" />
          {posting ? "Posting…" : "Post Reply"}
        </button>
      </div>
    </div>
  )
}

// ── Event card ─────────────────────────────────────────────────
function EventCard({ event, onMarkReplied }) {
  const [showReply, setShowReply] = useState(false)
  const [replied, setReplied] = useState(event.replied || !!event.reply)

  const initials = (event.reviewer ?? event.reviewerDisplayName ?? "?")[0].toUpperCase()
  const name = event.reviewer ?? event.reviewerDisplayName ?? "Anonymous"
  const text = event.review ?? event.comment ?? ""
  const ts = event.review_time
    ? new Date(event.review_time).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : null

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all hover:shadow-sm"
      style={{ background: CARD, border: `1px solid ${replied ? "oklch(0.91 0.008 270)" : "oklch(0.88 0.015 350)"}` }}
    >
      <div className="flex items-start gap-3.5 p-4">
        {/* Avatar */}
        <div
          className="size-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: `${PINK}15`, color: PINK }}
        >
          {initials}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="text-sm font-semibold" style={{ color: TEXT }}>{name}</span>
            {event.rating && <Stars rating={event.rating} />}
            <SourceBadge source={event._source ?? "gmb"} />
            {ts && (
              <span className="ml-auto text-[10px] flex items-center gap-1" style={{ color: FAINT }}>
                <Clock className="size-2.5" />
                {ts}
              </span>
            )}
          </div>

          {text && (
            <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{text}</p>
          )}

          {/* Existing reply */}
          {event.reply?.comment && !showReply && (
            <div
              className="mt-2.5 rounded-xl p-2.5 text-xs"
              style={{ background: "oklch(0.50 0.18 145 / 8%)", border: "1px solid oklch(0.50 0.18 145 / 20%)", color: MUTED }}
            >
              <span className="font-medium" style={{ color: "oklch(0.42 0.18 145)" }}>Your reply: </span>
              {event.reply.comment}
            </div>
          )}
        </div>

        {/* Status pill */}
        <div
          className="px-2.5 py-1 rounded-full text-[10px] font-semibold shrink-0"
          style={replied
            ? { background: "oklch(0.50 0.18 145 / 10%)", color: "oklch(0.42 0.18 145)" }
            : { background: `${PINK}12`, color: PINK }
          }
        >
          {replied ? "Replied" : "Pending"}
        </div>
      </div>

      {/* Action bar */}
      {!replied && !showReply && (
        <div
          className="flex items-center gap-2 px-4 py-2.5 border-t"
          style={{ borderColor: BORDER, background: "oklch(0.985 0.003 270)" }}
        >
          <button
            onClick={() => setShowReply(true)}
            className="flex items-center gap-1.5 text-xs font-medium transition-all hover:opacity-75"
            style={{ color: PINK }}
          >
            <Sparkles className="size-3" />
            AI Reply
          </button>
          <button
            onClick={() => setShowReply(true)}
            className="text-xs transition-all hover:opacity-75 ml-2"
            style={{ color: MUTED }}
          >
            Write reply
          </button>
          <span className="ml-auto text-[10px]" style={{ color: FAINT }}>
            {event.locationTitle ?? ""}
          </span>
        </div>
      )}

      {/* AI Reply panel */}
      {showReply && !replied && (
        <AIReplyPanel
          event={event}
          onClose={() => setShowReply(false)}
          onPosted={() => { setReplied(true); setShowReply(false); onMarkReplied?.(event.id ?? event.reviewId) }}
        />
      )}
    </div>
  )
}

// ── Toolbar ────────────────────────────────────────────────────
function Toolbar({ filter, setFilter, syncing, onSync, count, unreplied }) {
  return (
    <div
      className="flex items-center gap-3 px-5 py-3 border-b shrink-0 flex-wrap"
      style={{ background: CARD, borderColor: BORDER }}
    >
      <div className="flex items-center gap-1.5">
        <div className="size-2 rounded-full animate-pulse" style={{ background: "oklch(0.52 0.20 145)" }} />
        <span className="text-xs font-semibold" style={{ color: TEXT }}>Event Feed</span>
        {count > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: "oklch(0.92 0.008 270)", color: MUTED }}>
            {count}
          </span>
        )}
        {unreplied > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: `${PINK}12`, color: PINK }}>
            {unreplied} pending
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        <Filter className="size-3" style={{ color: FAINT }} />
        {["all", "pending", "replied"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
            style={filter === f
              ? { background: `${PINK}12`, color: PINK, border: `1px solid ${PINK}30` }
              : { color: MUTED, border: "1px solid transparent" }
            }
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}

        <div className="w-px h-4 mx-1" style={{ background: BORDER }} />

        <button
          onClick={onSync}
          disabled={syncing}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all disabled:opacity-50 hover:opacity-75"
          style={{ border: `1px solid ${BORDER}`, background: CARD, color: MUTED }}
        >
          <RefreshCw className={`size-3 ${syncing ? "animate-spin" : ""}`} />
          Sync
        </button>
      </div>
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────
function EmptyState({ filter, syncing, onSync }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-20 px-6 text-center">
      <div
        className="size-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: `${PINK}12` }}
      >
        <Activity className="size-7" style={{ color: PINK }} />
      </div>
      <p className="text-sm font-semibold mb-1" style={{ color: TEXT }}>
        {filter === "pending" ? "No pending events" : filter === "replied" ? "No replied events" : "No events yet"}
      </p>
      <p className="text-xs max-w-xs" style={{ color: MUTED }}>
        {filter === "all"
          ? "Sync your Google Business account to start seeing reviews and messages here."
          : `Switch to "All" to see all events.`
        }
      </p>
      {filter === "all" && (
        <button
          onClick={onSync}
          disabled={syncing}
          className="mt-5 flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90 disabled:opacity-60"
          style={{ background: PINK }}
        >
          <RefreshCw className={`size-3.5 ${syncing ? "animate-spin" : ""}`} />
          Sync from Google
        </button>
      )}
    </div>
  )
}

function Activity({ className, style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

// ── Stats bar ──────────────────────────────────────────────────
function StatsBar({ locations, loading }) {
  const totalReviews = locations.reduce((s, l) => s + (l.total_review_count ?? 0), 0)
  const avgRating = locations.length
    ? (locations.reduce((s, l) => s + (l.average_rating ?? 0), 0) / locations.length).toFixed(1)
    : null

  if (loading) return null

  return (
    <div
      className="flex items-center gap-6 px-5 py-2 border-b text-xs shrink-0"
      style={{ background: "oklch(0.985 0.003 270)", borderColor: BORDER }}
    >
      <span style={{ color: FAINT }}>
        <span className="font-semibold" style={{ color: TEXT }}>{locations.length}</span> location{locations.length !== 1 ? "s" : ""}
      </span>
      {avgRating && (
        <span className="flex items-center gap-1" style={{ color: FAINT }}>
          <Star className="size-3" style={{ fill: "#F59E0B", color: "#F59E0B" }} />
          <span className="font-semibold" style={{ color: TEXT }}>{avgRating}</span> avg rating
        </span>
      )}
      <span style={{ color: FAINT }}>
        <span className="font-semibold" style={{ color: TEXT }}>{totalReviews.toLocaleString()}</span> total reviews
      </span>
      <span className="ml-auto flex items-center gap-1" style={{ color: "oklch(0.52 0.18 145)" }}>
        <div className="size-1.5 rounded-full bg-current animate-pulse" />
        Google Business connected
      </span>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────
export default function OpsPage() {
  const router = useRouter()
  const [events, setEvents] = useState([])
  const [locations, setLocations] = useState([])
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem("retilo_token")) { router.replace("/auth"); return }
    api.get("/v1/gmb/locations")
      .then(res => setLocations(res.data.data ?? []))
      .catch(() => {})
  }, [router])

  const loadEvents = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (locations.length > 0) params.locationIds = locations.map(l => l.google_location_id).join(",")
      if (filter === "pending")  params.replied = false
      if (filter === "replied")  params.replied = true
      const res = await api.get("/v1/gmb/reviews", { params })
      // Normalise into events with a _source tag
      const raw = res.data.data ?? []
      setEvents(raw.map(r => ({ ...r, _source: "gmb" })))
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [locations, filter])

  useEffect(() => { loadEvents() }, [loadEvents])

  const handleSync = async () => {
    setSyncing(true)
    try {
      await api.post("/v1/gmb/reviews/sync/all")
      await loadEvents()
    } finally {
      setSyncing(false)
    }
  }

  const handleMarkReplied = (id) => {
    setEvents(prev => prev.map(e => (e.id === id || e.reviewId === id) ? { ...e, replied: true } : e))
  }

  const displayed = events
  const unreplied = events.filter(e => !e.replied && !e.reply).length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Stats */}
      <StatsBar locations={locations} loading={false} />

      {/* Toolbar */}
      <Toolbar
        filter={filter}
        setFilter={setFilter}
        syncing={syncing}
        onSync={handleSync}
        count={displayed.length}
        unreplied={unreplied}
      />

      {/* Feed */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-3 p-5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl animate-pulse"
                style={{ background: CARD, border: `1px solid ${BORDER}` }}
              />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <EmptyState filter={filter} syncing={syncing} onSync={handleSync} />
        ) : (
          <div className="p-5 space-y-3 max-w-3xl">
            {displayed.map(event => (
              <EventCard
                key={event.id ?? event.reviewId}
                event={event}
                onMarkReplied={handleMarkReplied}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
