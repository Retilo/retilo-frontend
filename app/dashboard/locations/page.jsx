"use client"

// Locations page — manage connected GMB locations: map overview, per-location
// reviews, and settings.
// API: GET /v1/gmb/locations, GET /v1/gmb/reviews?locationId=,
//      PATCH /v1/gmb/locations/:id/settings, POST /v1/gmb/reviews/sync,
//      POST /v1/gmb/analytics/sync

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { MapPin, RefreshCw, Sparkles, Star, Bot, MessageSquare, ChevronDown, Send } from "lucide-react"
import { DashboardPageLayout } from "@/components/dashboard/page-layout"
import { LocationsMap } from "@/components/locations-map"
import { api } from "@/lib/api"

const PINK = "oklch(0.58 0.24 350)"
const CARD_BG = "oklch(1 0 0)"
const CARD_BORDER = "oklch(0.91 0.008 350)"
const CARD_BORDER_HOVER = "oklch(0.86 0.012 350)"
const TEXT = "oklch(0.14 0.008 270)"
const TEXT_MUTED = "oklch(0.55 0.008 270)"
const TEXT_FAINT = "oklch(0.65 0.008 270)"
const INPUT_BG = "oklch(0.96 0.005 350)"
const INPUT_BORDER = "oklch(0.90 0.008 350)"

function ToggleSwitch({ label, icon, checked, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className="flex items-center gap-2 text-xs transition-colors disabled:opacity-60"
      style={{ color: TEXT_MUTED }}
    >
      <span style={{ color: checked ? PINK : TEXT_FAINT }}>{icon}</span>
      <span>{label}</span>
      <div
        className="w-8 h-4 rounded-full transition-colors relative"
        style={{ background: checked ? PINK : "oklch(0.88 0.005 270)" }}
      >
        <div
          className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform"
          style={{ transform: checked ? "translateX(16px)" : "translateX(2px)" }}
        />
      </div>
    </button>
  )
}

// ── Compact per-location review row (drafts + posts replies inline) ────────────
function ReviewRow({ review, onAiReply, onPostReply }) {
  // The reply/ai-reply endpoints resolve by the Google review_id, not the numeric PK.
  const reviewId = review.review_id ?? review.reviewId ?? review.id
  const existingReply = review.review_reply ?? review.reply?.comment ?? null
  const [expanded, setExpanded] = useState(false)
  const [draft, setDraft] = useState(existingReply ?? "")
  const [generating, setGenerating] = useState(false)
  const [posting, setPosting] = useState(false)
  const [posted, setPosted] = useState(!!existingReply)

  const rating = review.rating ?? 0
  const starColor = rating >= 4 ? "#F59E0B" : rating <= 2 ? "#EF4444" : "#F97316"
  const reviewer = review.reviewer ?? review.reviewerDisplayName ?? "Anonymous"
  const body = review.review ?? review.comment ?? "No comment."

  const handleAiDraft = async () => {
    setGenerating(true)
    try {
      const res = await onAiReply(reviewId)
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
      await onPostReply(reviewId, draft)
      setPosted(true)
      setExpanded(false)
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="rounded-xl p-3.5" style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}` }}>
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${PINK}15` }}>
          <span className="text-xs font-bold" style={{ color: PINK }}>{reviewer[0].toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-medium truncate" style={{ color: TEXT }}>{reviewer}</span>
            <div className="flex flex-shrink-0">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-2.5 h-2.5"
                  style={{
                    fill: i < rating ? starColor : "transparent",
                    color: i < rating ? starColor : "oklch(0.80 0.005 270)",
                  }}
                />
              ))}
            </div>
            {review.review_time && (
              <span className="text-[10px] ml-auto flex-shrink-0" style={{ color: TEXT_FAINT }}>
                {new Date(review.review_time).toLocaleDateString()}
              </span>
            )}
          </div>
          <p className="text-xs leading-relaxed" style={{ color: TEXT_MUTED }}>{body}</p>

          {/* Existing / drafted reply */}
          {posted && existingReply && !expanded && (
            <div className="mt-2 rounded-lg p-2 text-[11px]" style={{ background: "oklch(0.60 0.20 160 / 8%)", color: TEXT_MUTED }}>
              <span className="font-medium" style={{ color: "oklch(0.42 0.18 160)" }}>Your reply: </span>
              {existingReply}
            </div>
          )}

          {expanded && (
            <textarea
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write your reply…"
              className="mt-2 w-full rounded-lg text-xs px-2.5 py-2 outline-none resize-none"
              style={{ background: CARD_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }}
              onFocus={(e) => (e.target.style.borderColor = PINK)}
              onBlur={(e) => (e.target.style.borderColor = INPUT_BORDER)}
            />
          )}

          {!posted && (
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleAiDraft}
                disabled={generating}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all disabled:opacity-60"
                style={{ background: `${PINK}12`, border: `1px solid ${PINK}30`, color: PINK }}
              >
                <Sparkles className="w-3 h-3" />
                {generating ? "Generating…" : "AI Draft"}
              </button>
              {expanded ? (
                <button
                  onClick={handlePost}
                  disabled={posting || !draft.trim()}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-white text-[11px] font-medium transition-all disabled:opacity-60 ml-auto hover:opacity-90"
                  style={{ background: PINK }}
                >
                  <Send className="w-3 h-3" />
                  {posting ? "Posting…" : "Post"}
                </button>
              ) : (
                <button onClick={() => setExpanded(true)} className="text-[11px] ml-auto transition-colors hover:opacity-75" style={{ color: TEXT_MUTED }}>
                  Write reply
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Per-location reviews panel (lazy-loaded when a card is opened) ─────────────
function LocationReviews({ location, active }) {
  const [reviews, setReviews] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get("/v1/gmb/reviews", { params: { locationId: location.google_location_id } })
      setReviews(res.data.data ?? [])
    } catch {
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (active && reviews === null) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  const handleAiReply = async (reviewId) => {
    const res = await api.post(`/v1/gmb/reviews/${reviewId}/ai-reply`, { send: false })
    return res.data.data
  }
  const handlePostReply = async (reviewId, replyText) => {
    await api.post(`/v1/gmb/reviews/${reviewId}/reply`, { replyText })
  }

  if (loading || reviews === null) {
    return (
      <div className="space-y-2 px-5 pb-5">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: INPUT_BG }} />
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="px-5 pb-5 text-center py-6" style={{ color: TEXT_FAINT }}>
        <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-30" />
        <p className="text-xs">No reviews synced for this location yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 px-5 pb-5">
      {reviews.map((r) => (
        <ReviewRow key={r.id ?? r.reviewId} review={r} onAiReply={handleAiReply} onPostReply={handlePostReply} />
      ))}
    </div>
  )
}

function LocationCard({ location, isOpen, onToggleOpen, onSettingsChange, onSync }) {
  const cardRef = useRef(null)
  const [settings, setSettings] = useState({
    ai_enable: location.ai_enable ?? false,
    auto_replies: location.auto_replies ?? false,
    status: location.status ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)

  // When opened via a map pin click, bring the card into view.
  useEffect(() => {
    if (isOpen && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }, [isOpen])

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    setSaving(true)
    try {
      await onSettingsChange(location.id, { [key]: value })
    } catch {
      setSettings(settings)
    } finally {
      setSaving(false)
    }
  }

  const handleSync = async (e) => {
    e.stopPropagation()
    setSyncing(true)
    try {
      await onSync(location.google_location_id)
    } finally {
      setSyncing(false)
    }
  }

  const reviewCount = location.total_review_count ?? 0

  return (
    <div
      ref={cardRef}
      className="rounded-2xl overflow-hidden transition-all hover:shadow-sm"
      style={{ background: CARD_BG, border: `1px solid ${isOpen ? PINK + "50" : CARD_BORDER}` }}
      onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.borderColor = CARD_BORDER_HOVER }}
      onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.borderColor = CARD_BORDER }}
    >
      <div className="flex items-start gap-4 p-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${PINK}12` }}>
          <MapPin className="w-5 h-5" style={{ color: PINK }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold truncate" style={{ color: TEXT }}>{location.title}</h3>
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${location.status ? "bg-emerald-500" : "bg-[oklch(0.80_0.005_270)]"}`} />
          </div>
          {location.address && <p className="text-xs mt-0.5 truncate" style={{ color: TEXT_MUTED }}>{location.address}</p>}
          <p className="text-[10px] mt-0.5 font-mono" style={{ color: TEXT_FAINT }}>{location.google_location_id}</p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          {location.average_rating != null && (
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-bold" style={{ color: TEXT }}>{location.average_rating?.toFixed(1)}</span>
              </div>
              <div className="text-[10px]" style={{ color: TEXT_FAINT }}>{reviewCount} reviews</div>
            </div>
          )}
          {location.response_rate != null && (
            <div className="text-right">
              <div className="text-sm font-bold" style={{ color: TEXT }}>{location.response_rate}%</div>
              <div className="text-[10px]" style={{ color: TEXT_FAINT }}>reply rate</div>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 py-3 flex items-center gap-6" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
        <ToggleSwitch
          label="AI Replies"
          icon={<Sparkles className="w-3 h-3" />}
          checked={settings.ai_enable}
          onChange={(v) => updateSetting("ai_enable", v)}
          disabled={saving}
        />
        <ToggleSwitch
          label="Auto-post"
          icon={<Bot className="w-3 h-3" />}
          checked={settings.auto_replies}
          onChange={(v) => updateSetting("auto_replies", v)}
          disabled={saving}
        />
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all disabled:opacity-60 hover:opacity-75"
            style={{ border: `1px solid ${CARD_BORDER}`, background: CARD_BG, color: TEXT_MUTED }}
          >
            <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
            Sync
          </button>
          <button
            onClick={() => onToggleOpen(location.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={isOpen
              ? { background: `${PINK}12`, border: `1px solid ${PINK}30`, color: PINK }
              : { border: `1px solid ${CARD_BORDER}`, background: CARD_BG, color: TEXT_MUTED }}
          >
            <MessageSquare className="w-3 h-3" />
            Reviews
            {reviewCount > 0 && <span className="tabular-nums">({reviewCount})</span>}
            <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div style={{ borderTop: `1px solid ${CARD_BORDER}`, background: "oklch(0.985 0.003 350)" }}>
          <div className="px-5 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: TEXT_FAINT }}>
            Reviews · {location.title}
          </div>
          <LocationReviews location={location} active={isOpen} />
        </div>
      )}
    </div>
  )
}

export default function LocationsPage() {
  const router = useRouter()
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [connectingGMB, setConnectingGMB] = useState(false)
  const [openId, setOpenId] = useState(null) // selected/expanded location id (accordion + map sync)

  useEffect(() => {
    if (!localStorage.getItem("retilo_token")) { router.replace("/auth"); return }
    api.get("/v1/gmb/locations")
      .then(res => setLocations(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  const handleSettingsChange = async (locationId, settings) => {
    await api.patch(`/v1/gmb/locations/${locationId}/settings`, settings)
  }

  const handleSync = async (locationId) => {
    await api.post("/v1/gmb/reviews/sync", { locationId })
    await api.post("/v1/gmb/analytics/sync", { locationId })
  }

  const handleConnectGMB = async () => {
    setConnectingGMB(true)
    try {
      const res = await api.get("/v1/gmb/oauth/connect")
      window.location.href = res.data.data.url
    } catch {
      setConnectingGMB(false)
    }
  }

  const toggleOpen = (id) => setOpenId((cur) => (cur === id ? null : id))

  const hasMappable = locations.some(
    (l) => typeof l.lat === "number" && typeof l.lng === "number"
  )

  return (
    <DashboardPageLayout
      title="Locations"
      subtitle={`${locations.length} Google Business location${locations.length !== 1 ? "s" : ""} connected`}
      actions={
        <button
          onClick={handleConnectGMB}
          disabled={connectingGMB}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white text-xs font-semibold transition-all disabled:opacity-60 hover:opacity-90"
          style={{ background: PINK }}
        >
          {connectingGMB ? "Redirecting…" : "+ Connect Google Business"}
        </button>
      }
    >
      <div className="max-w-3xl mx-auto px-8 py-6 space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }} />
          ))
        ) : locations.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${PINK}12` }}>
              <MapPin className="w-7 h-7" style={{ color: PINK }} />
            </div>
            <h3 className="text-base font-semibold mb-2" style={{ color: TEXT }}>No locations yet</h3>
            <p className="text-sm mb-6" style={{ color: TEXT_MUTED }}>Connect your Google Business account to get started.</p>
            <button
              onClick={handleConnectGMB}
              className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: PINK }}
            >
              Connect Google Business
            </button>
          </div>
        ) : (
          <>
            {/* Map overview of the brand's footprint */}
            <div className="h-72">
              <LocationsMap
                locations={locations}
                selectedId={openId}
                onSelect={(loc) => setOpenId(loc.id)}
                className={hasMappable ? "" : "opacity-95"}
              />
            </div>

            {locations.map(loc => (
              <LocationCard
                key={loc.id}
                location={loc}
                isOpen={openId === loc.id}
                onToggleOpen={toggleOpen}
                onSettingsChange={handleSettingsChange}
                onSync={handleSync}
              />
            ))}
          </>
        )}
      </div>
    </DashboardPageLayout>
  )
}
