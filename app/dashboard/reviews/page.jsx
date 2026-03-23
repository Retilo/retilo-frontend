"use client"

// Reviews page — list GMB reviews, filter, AI reply, post
// API: GET /v1/gmb/reviews, POST /v1/gmb/reviews/:id/reply, POST /v1/gmb/reviews/:id/ai-reply

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Star, Sparkles, Send, RefreshCw, Filter, ChevronDown } from "lucide-react"
import { DashboardPageLayout } from "@/components/dashboard/page-layout"
import { api } from "@/lib/api"

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

  const ratingColor = review.rating >= 4 ? "text-yellow-400" : review.rating <= 2 ? "text-red-400" : "text-orange-400"

  return (
    <div className="rounded-2xl border border-white/8 bg-[oklch(0.13_0.015_270)] overflow-hidden hover:border-white/12 transition-all">
      {/* Review header */}
      <div className="flex items-start gap-4 p-5">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-[oklch(0.55_0.24_280)/20%] flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-[oklch(0.80_0.18_280)]">
            {(review.reviewer ?? review.reviewerDisplayName ?? "?")[0].toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-white">
              {review.reviewer ?? review.reviewerDisplayName ?? "Anonymous"}
            </span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < review.rating ? `fill-current ${ratingColor}` : "text-white/15"}`}
                />
              ))}
            </div>
            {review.review_time && (
              <span className="text-[10px] text-white/30 ml-auto">
                {new Date(review.review_time).toLocaleDateString()}
              </span>
            )}
          </div>
          <p className="text-sm text-white/60 leading-relaxed line-clamp-3">{review.review ?? review.comment ?? "No comment."}</p>
        </div>

        {/* Status badge */}
        <div className={`px-2.5 py-1 rounded-full text-[10px] font-semibold flex-shrink-0 ${
          posted ? "bg-green-500/15 text-green-400" : "bg-[oklch(0.55_0.24_280)/15%] text-[oklch(0.80_0.18_280)]"
        }`}>
          {posted ? "Replied" : "Pending"}
        </div>
      </div>

      {/* Existing reply */}
      {review.reply?.comment && !expanded && (
        <div className="mx-5 mb-4 rounded-xl bg-green-500/8 border border-green-500/15 p-3 text-xs text-white/50">
          <span className="text-green-400 font-medium">Your reply: </span>
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
              className="w-full rounded-xl bg-white/5 border border-white/10 text-white text-sm px-3 py-2.5 outline-none focus:border-[oklch(0.65_0.26_280)] placeholder:text-white/25 resize-none transition-colors"
            />
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAiDraft}
              disabled={generating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[oklch(0.55_0.24_280)/15%] hover:bg-[oklch(0.55_0.24_280)/25%] border border-[oklch(0.55_0.24_280)/30%] text-[oklch(0.80_0.18_280)] text-xs font-medium transition-all disabled:opacity-60"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {generating ? "Generating…" : "AI Draft"}
            </button>
            {expanded && (
              <button
                onClick={handlePost}
                disabled={posting || !draft.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[oklch(0.55_0.24_280)] hover:bg-[oklch(0.60_0.26_280)] text-white text-xs font-medium transition-all disabled:opacity-60 ml-auto"
              >
                <Send className="w-3.5 h-3.5" />
                {posting ? "Posting…" : "Post Reply"}
              </button>
            )}
            {!expanded && (
              <button
                onClick={() => setExpanded(true)}
                className="text-xs text-white/40 hover:text-white/70 transition-colors ml-auto"
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
  const [filterReplied, setFilterReplied] = useState("all") // all | unreplied | replied
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem("retilo_token")) { router.replace("/auth"); return }
    // Load locations first
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/4 hover:bg-white/8 text-white/60 hover:text-white text-xs transition-all disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
          Sync reviews
        </button>
      }
    >
      <div className="max-w-3xl mx-auto px-8 py-6 space-y-5">

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Location filter */}
          <div className="relative">
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs outline-none focus:border-[oklch(0.65_0.26_280)] cursor-pointer"
            >
              <option value="all">All locations</option>
              {locations.map(l => <option key={l.id} value={l.google_location_id}>{l.title}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
          </div>

          {/* Replied filter */}
          {["all", "unreplied", "replied"].map(f => (
            <button
              key={f}
              onClick={() => setFilterReplied(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterReplied === f
                  ? "bg-[oklch(0.55_0.24_280)/20%] text-[oklch(0.80_0.18_280)] border border-[oklch(0.55_0.24_280)/40%]"
                  : "text-white/40 hover:text-white/70 border border-transparent hover:border-white/10"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Reviews list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-white/4 border border-white/8 animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 text-white/30">
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
