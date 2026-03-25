"use client"

// Reviews page — list GMB reviews, filter, AI reply, post
// API: GET /v1/gmb/reviews, POST /v1/gmb/reviews/:id/reply, POST /v1/gmb/reviews/:id/ai-reply

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Star, Sparkles, Send, RefreshCw, ChevronDown } from "lucide-react"
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

// ── Review card ────────────────────────────────────────────────
function ReviewCard({ review, onAiReply, onPostReply }) {
  const [expanded, setExpanded] = useState(false)
  const [draft, setDraft] = useState(review.reply?.comment ?? "")
  const [generating, setGenerating] = useState(false)
  const [posting, setPosting] = useState(false)
  const [posted, setPosted] = useState(!!review.reply)

  const handleAiDraft = async () => {
    setGenerating(true)
    try {
      const res = await onAiReply(review.reviewId ?? review.id)
      setDraft(res.replyText)
      setExpanded(true)
    } finally {
      setGenerating(false)
    }
  }

  const handlePost = async () => {
    if (!draft.trim()) return
    setPosting(true)
    try {
      await onPostReply(review.reviewId ?? review.id, draft)
      setPosted(true)
    } finally {
      setPosting(false)
    }
  }

  const starColor = review.rating >= 4 ? "#F59E0B" : review.rating <= 2 ? "#EF4444" : "#F97316"

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all hover:shadow-sm"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
    >
      {/* Review header */}
      <div className="flex items-start gap-4 p-5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `${PINK}15` }}
        >
          <span className="text-sm font-bold" style={{ color: PINK }}>
            {(review.reviewer ?? review.reviewerDisplayName ?? "?")[0].toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium" style={{ color: TEXT }}>
              {review.reviewer ?? review.reviewerDisplayName ?? "Anonymous"}
            </span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-3 h-3"
                  style={{
                    fill: i < review.rating ? starColor : "transparent",
                    color: i < review.rating ? starColor : "oklch(0.80 0.005 270)",
                  }}
                />
              ))}
            </div>
            {review.review_time && (
              <span className="text-[10px] ml-auto" style={{ color: TEXT_FAINT }}>
                {new Date(review.review_time).toLocaleDateString()}
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed line-clamp-3" style={{ color: TEXT_MUTED }}>
            {review.review ?? review.comment ?? "No comment."}
          </p>
        </div>

        <div
          className="px-2.5 py-1 rounded-full text-[10px] font-semibold flex-shrink-0"
          style={posted
            ? { background: "oklch(0.60 0.20 160 / 12%)", color: "oklch(0.42 0.18 160)" }
            : { background: `${PINK}12`, color: PINK }
          }
        >
          {posted ? "Replied" : "Pending"}
        </div>
      </div>

      {/* Existing reply */}
      {review.reply?.comment && !expanded && (
        <div
          className="mx-5 mb-4 rounded-xl p-3 text-xs"
          style={{ background: "oklch(0.60 0.20 160 / 8%)", border: "1px solid oklch(0.60 0.20 160 / 20%)", color: TEXT_MUTED }}
        >
          <span className="font-medium" style={{ color: "oklch(0.42 0.18 160)" }}>Your reply: </span>
          {review.reply.comment}
        </div>
      )}

      {/* Reply composer */}
      {!posted && (
        <div className="px-5 pb-5 space-y-2">
          {expanded && (
            <textarea
              rows={3}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write your reply…"
              className="w-full rounded-xl text-sm px-3 py-2.5 outline-none resize-none transition-colors"
              style={{
                background: INPUT_BG,
                border: `1px solid ${INPUT_BORDER}`,
                color: TEXT,
              }}
              onFocus={e => e.target.style.borderColor = PINK}
              onBlur={e => e.target.style.borderColor = INPUT_BORDER}
            />
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAiDraft}
              disabled={generating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-60"
              style={{
                background: `${PINK}12`,
                border: `1px solid ${PINK}30`,
                color: PINK,
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {generating ? "Generating…" : "AI Draft"}
            </button>
            {expanded && (
              <button
                onClick={handlePost}
                disabled={posting || !draft.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-medium transition-all disabled:opacity-60 ml-auto hover:opacity-90"
                style={{ background: PINK }}
              >
                <Send className="w-3.5 h-3.5" />
                {posting ? "Posting…" : "Post Reply"}
              </button>
            )}
            {!expanded && (
              <button
                onClick={() => setExpanded(true)}
                className="text-xs ml-auto transition-colors hover:opacity-75"
                style={{ color: TEXT_MUTED }}
              >
                Write reply
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ReviewsPage() {
  const router = useRouter()
  const [reviews, setReviews] = useState([])
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [filterReplied, setFilterReplied] = useState("all")
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem("retilo_token")) { router.replace("/auth"); return }
    api.get("/v1/gmb/locations")
      .then(res => setLocations(res.data.data ?? []))
      .catch(() => {})
  }, [router])

  const loadReviews = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (selectedLocation !== "all") params.locationId = selectedLocation
      else if (locations.length > 0) params.locationIds = locations.map(l => l.google_location_id).join(",")
      if (filterReplied !== "all") params.replied = filterReplied === "replied"
      const res = await api.get("/v1/gmb/reviews", { params })
      setReviews(res.data.data ?? [])
    } catch {
      setReviews([])
    } finally {
      setLoading(false)
    }
  }, [selectedLocation, filterReplied, locations])

  useEffect(() => { if (locations.length > 0 || selectedLocation !== "all") loadReviews() }, [loadReviews])

  const handleSyncAll = async () => {
    setSyncing(true)
    try {
      await api.post("/v1/gmb/reviews/sync/all")
      await loadReviews()
    } finally {
      setSyncing(false)
    }
  }

  const handleAiReply = async (reviewId) => {
    const res = await api.post(`/v1/gmb/reviews/${reviewId}/ai-reply`, { send: false })
    return res.data.data
  }

  const handlePostReply = async (reviewId, replyText) => {
    await api.post(`/v1/gmb/reviews/${reviewId}/reply`, { replyText })
  }

  const unrepliedCount = reviews.filter(r => !r.replied && !r.reply).length

  return (
    <DashboardPageLayout
      title="Reviews"
      subtitle={`${reviews.length} reviews · ${unrepliedCount} need attention`}
      actions={
        <button
          onClick={handleSyncAll}
          disabled={syncing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all disabled:opacity-60"
          style={{
            border: `1px solid ${CARD_BORDER}`,
            background: CARD_BG,
            color: TEXT_MUTED,
          }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
          Sync reviews
        </button>
      }
    >
      <div className="max-w-3xl mx-auto px-8 py-6 space-y-5">

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
              style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT_MUTED }}
            >
              <option value="all">All locations</option>
              {locations.map(l => <option key={l.id} value={l.google_location_id}>{l.title}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: TEXT_FAINT }} />
          </div>

          {["all", "unreplied", "replied"].map(f => (
            <button
              key={f}
              onClick={() => setFilterReplied(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={filterReplied === f
                ? { background: `${PINK}12`, color: PINK, border: `1px solid ${PINK}35` }
                : { color: TEXT_MUTED, border: "1px solid transparent" }
              }
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Reviews list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }} />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16" style={{ color: TEXT_FAINT }}>
            <Star className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No reviews found. Try syncing from Google.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <ReviewCard
                key={r.id ?? r.reviewId}
                review={r}
                onAiReply={handleAiReply}
                onPostReply={handlePostReply}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardPageLayout>
  )
}
