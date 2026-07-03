"use client"

import { useEffect, useState, useRef } from "react"
import { AppSidebar } from "@/components/dashboard/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { FileText, Sparkles, Plus, X, Send, Trash2, Bot, User, ChevronDown, ImagePlus } from "lucide-react"
import { api } from "@/lib/api"

const ACCENT = "oklch(0.58 0.24 350)"
const ACCENT_MID = "oklch(0.48 0.22 350)"

function fmtDate(iso) {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

function parseDate(str) {
  if (!str) return undefined
  const [y, m, d] = str.split("-").map(Number)
  return { year: y, month: m, day: d }
}

function SourceBadge({ source }) {
  const isAI = source === "ai_agent"
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={isAI
        ? { background: `${ACCENT}15`, color: ACCENT_MID }
        : { background: "oklch(0.94 0.01 270 / 60%)", color: "oklch(0.45 0.01 270)" }}
    >
      {isAI ? <Bot className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
      {isAI ? "AI agent" : "Manual"}
    </span>
  )
}

function TypeBadge({ type }) {
  const cfg = {
    STANDARD: { label: "Update", color: "#6366f1" },
    OFFER:    { label: "Offer",  color: "#f59e0b" },
    EVENT:    { label: "Event",  color: "#10b981" },
  }[type] ?? { label: type || "Update", color: "#94a3b8" }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ background: `${cfg.color}18`, color: cfg.color }}>
      {cfg.label}
    </span>
  )
}

function StateBadge({ state }) {
  const cfg = {
    LIVE:       { bg: "rgba(34,197,94,0.1)",  color: "#16a34a", dot: "#22c55e", label: "Live" },
    PROCESSING: { bg: "rgba(245,158,11,0.1)", color: "#b45309", dot: "#f59e0b", label: "Processing" },
    REJECTED:   { bg: "rgba(239,68,68,0.1)",  color: "#dc2626", dot: "#ef4444", label: "Rejected" },
  }[state] ?? { bg: "rgba(100,116,139,0.1)", color: "#475569", dot: "#94a3b8", label: state }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: cfg.bg, color: cfg.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  )
}

function PostCard({ post, onDelete }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Remove this post record?")) return
    setDeleting(true)
    try {
      await api.delete(`/v1/gmb/posts/${post.id}`)
      onDelete(post.id)
    } catch (e) {
      alert(e?.response?.data?.message || "Delete failed")
      setDeleting(false)
    }
  }

  return (
    <div className="rounded-2xl border p-5 relative group" style={{ background: "white", borderColor: `${ACCENT}14` }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <SourceBadge source={post.source} />
          <TypeBadge type={post.topic_type} />
          <StateBadge state={post.state} />
          <span className="text-[10px] text-gray-400">{fmtDate(post.published_at || post.created_at)}</span>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50"
          title="Delete post record"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
        </button>
      </div>
      {post.media_url && (
        <img
          src={post.media_url}
          alt="Post media"
          className="w-full h-36 object-cover rounded-xl mb-3"
        />
      )}
      <p className="text-sm text-gray-700 leading-relaxed">{post.summary}</p>
      {post.call_to_action?.url && (
        <a
          href={post.call_to_action.url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium hover:underline"
          style={{ color: ACCENT_MID }}
        >
          {post.call_to_action.url}
        </a>
      )}
    </div>
  )
}

const POST_TYPES = [
  { id: "STANDARD", label: "Update" },
  { id: "OFFER",    label: "Offer" },
  { id: "EVENT",    label: "Event" },
]

function FieldInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-1"
        style={{ borderColor: `${ACCENT}20`, background: "oklch(0.985 0.003 350)" }}
      />
    </div>
  )
}

function CreateDrawer({ locations, onClose, onCreated }) {
  const [locationId, setLocationId] = useState(locations[0]?.google_location_id ?? "")
  const [postType, setPostType]     = useState("STANDARD")
  const [summary, setSummary]       = useState("")
  const [ctaUrl, setCtaUrl]         = useState("")
  const [drafting, setDrafting]     = useState(false)
  const [posting, setPosting]       = useState(false)
  const [error, setError]           = useState(null)

  const [imageFile, setImageFile]       = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)

  const [couponCode, setCouponCode]   = useState("")
  const [redeemUrl, setRedeemUrl]     = useState("")
  const [terms, setTerms]             = useState("")
  const [offerStart, setOfferStart]   = useState("")
  const [offerEnd, setOfferEnd]       = useState("")

  const [eventTitle, setEventTitle]   = useState("")
  const [eventStart, setEventStart]   = useState("")
  const [eventEnd, setEventEnd]       = useState("")

  const textRef = useRef(null)
  const selectedLoc = locations.find(l => l.google_location_id === locationId)

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleAIDraft = async () => {
    if (!locationId) return
    setDrafting(true)
    setError(null)
    try {
      const res = await api.post("/v1/gmb/posts/ai-draft", {
        locationId,
        businessType: selectedLoc?.business_type || "business",
      })
      const draft = res.data.data
      setSummary(draft.summary || "")
      if (draft.callToAction?.url) setCtaUrl(draft.callToAction.url)
      textRef.current?.focus()
    } catch (e) {
      setError(e?.response?.data?.message || "AI draft failed — try again")
    } finally {
      setDrafting(false)
    }
  }

  const handlePost = async () => {
    if (!summary.trim()) return
    if (postType === "EVENT" && !eventTitle.trim()) { setError("Event title is required"); return }
    setPosting(true)
    setError(null)
    try {
      let mediaUrl = null
      if (imageFile) {
        const fd = new FormData()
        fd.append("file", imageFile)
        const upRes = await api.post("/v1/media/upload", fd, { headers: { "Content-Type": "multipart/form-data" } })
        mediaUrl = upRes.data.data.url
      }

      const body = { locationId, summary: summary.trim(), topicType: postType, source: "manual" }
      if (ctaUrl.trim()) body.callToAction = { actionType: postType === "OFFER" ? "GET_OFFER" : "LEARN_MORE", url: ctaUrl.trim() }
      if (mediaUrl) body.media = [{ mediaFormat: "PHOTO", sourceUrl: mediaUrl }]

      if (postType === "OFFER") {
        const offer = {}
        if (couponCode.trim()) offer.couponCode = couponCode.trim()
        if (redeemUrl.trim()) offer.redeemOnlineUrl = redeemUrl.trim()
        if (terms.trim()) offer.termsConditions = terms.trim()
        const sd = parseDate(offerStart), ed = parseDate(offerEnd)
        if (sd && ed) offer.redeemTimePeriod = { startDate: sd, endDate: ed }
        if (Object.keys(offer).length) body.offer = offer
      }

      if (postType === "EVENT") {
        body.event = {
          title: eventTitle.trim(),
          schedule: { startDate: parseDate(eventStart), endDate: parseDate(eventEnd) },
        }
      }

      const res = await api.post("/v1/gmb/posts", body)
      onCreated(res.data.data)
      onClose()
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to publish — check your Google connection")
      setPosting(false)
    }
  }

  const canPost = !posting && summary.trim() && locationId && (postType !== "EVENT" || eventTitle.trim())

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(0,0,0,0.35)" }} onClick={onClose}>
      <div
        className="h-full w-full max-w-md flex flex-col shadow-2xl overflow-y-auto"
        style={{ background: "white" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: `${ACCENT}14` }}>
          <div>
            <h2 className="text-base font-semibold text-gray-800">New Google Post</h2>
            <p className="text-xs text-gray-400 mt-0.5">Appears on Maps &amp; Search within minutes</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-6 space-y-5">

          {/* Post type tabs */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">Post type</label>
            <div className="flex gap-2">
              {POST_TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setPostType(t.id)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={postType === t.id
                    ? { background: ACCENT, color: "white" }
                    : { background: "oklch(0.94 0.005 270)", color: "oklch(0.45 0.01 270)" }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location picker */}
          {locations.length > 1 && (
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Location</label>
              <div className="relative">
                <select
                  value={locationId}
                  onChange={e => setLocationId(e.target.value)}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm text-gray-700 appearance-none pr-8 focus:outline-none"
                  style={{ borderColor: `${ACCENT}20`, background: "oklch(0.985 0.003 350)" }}
                >
                  {locations.map(l => (
                    <option key={l.google_location_id} value={l.google_location_id}>{l.title}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Event title (EVENT only) */}
          {postType === "EVENT" && (
            <FieldInput
              label="Event title *"
              value={eventTitle}
              onChange={setEventTitle}
              placeholder="e.g. Grand Opening Sale"
            />
          )}

          {/* Post text */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-500">Post text</label>
              <button
                onClick={handleAIDraft}
                disabled={drafting || !locationId}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: `${ACCENT}12`, color: ACCENT_MID }}
              >
                <Sparkles className="w-3 h-3" />
                {drafting ? "Drafting…" : "AI draft"}
              </button>
            </div>
            <textarea
              ref={textRef}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              maxLength={1500}
              rows={5}
              placeholder="What's new at your business this week?"
              className="w-full rounded-xl border px-4 py-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-1"
              style={{ borderColor: `${ACCENT}20`, background: "oklch(0.985 0.003 350)" }}
            />
            <div className="text-right text-[10px] text-gray-400 mt-0.5">{summary.length}/1500</div>
          </div>

          {/* Image upload */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Photo <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-36 object-cover" />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl border-2 border-dashed py-6 flex flex-col items-center gap-2 transition-colors hover:border-current"
                style={{ borderColor: `${ACCENT}30`, color: ACCENT_MID }}
              >
                <ImagePlus className="w-5 h-5" />
                <span className="text-xs font-medium">Add photo</span>
              </button>
            )}
          </div>

          {/* Offer fields */}
          {postType === "OFFER" && (
            <div className="space-y-3">
              <div className="h-px" style={{ background: `${ACCENT}14` }} />
              <p className="text-xs font-semibold text-gray-500">Offer details</p>
              <FieldInput label="Coupon code (optional)" value={couponCode} onChange={setCouponCode} placeholder="e.g. SAVE20" />
              <FieldInput label="Redeem URL (optional)" value={redeemUrl} onChange={setRedeemUrl} placeholder="https://…" type="url" />
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Terms &amp; conditions (optional)</label>
                <textarea
                  value={terms}
                  onChange={e => setTerms(e.target.value)}
                  rows={2}
                  placeholder="Offer T&Cs…"
                  className="w-full rounded-xl border px-4 py-2.5 text-sm text-gray-700 resize-none focus:outline-none"
                  style={{ borderColor: `${ACCENT}20`, background: "oklch(0.985 0.003 350)" }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FieldInput label="Start date" value={offerStart} onChange={setOfferStart} type="date" placeholder="" />
                <FieldInput label="End date"   value={offerEnd}   onChange={setOfferEnd}   type="date" placeholder="" />
              </div>
            </div>
          )}

          {/* Event date fields */}
          {postType === "EVENT" && (
            <div className="space-y-3">
              <div className="h-px" style={{ background: `${ACCENT}14` }} />
              <p className="text-xs font-semibold text-gray-500">Event schedule</p>
              <div className="grid grid-cols-2 gap-3">
                <FieldInput label="Start date" value={eventStart} onChange={setEventStart} type="date" placeholder="" />
                <FieldInput label="End date"   value={eventEnd}   onChange={setEventEnd}   type="date" placeholder="" />
              </div>
            </div>
          )}

          {/* CTA URL */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Button URL <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              type="url"
              value={ctaUrl}
              onChange={e => setCtaUrl(e.target.value)}
              placeholder="https://book.retilo.io/your-business"
              className="w-full rounded-xl border px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-1"
              style={{ borderColor: `${ACCENT}20`, background: "oklch(0.985 0.003 350)" }}
            />
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 text-xs text-red-700" style={{ background: "rgba(239,68,68,0.08)" }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t" style={{ borderColor: `${ACCENT}14` }}>
          <button
            onClick={handlePost}
            disabled={!canPost}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: ACCENT }}
          >
            <Send className="w-4 h-4" />
            {posting ? "Publishing…" : "Publish to Google"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PostsPage() {
  const [locations, setLocations]   = useState([])
  const [posts, setPosts]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [selectedLoc, setSelectedLoc] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    api.get("/v1/gmb/locations")
      .then(res => {
        const locs = res.data.data ?? []
        setLocations(locs)
        if (locs.length) {
          setSelectedLoc(locs[0].google_location_id)
          return api.get(`/v1/gmb/posts?locationId=${locs[0].google_location_id}`)
        }
      })
      .then(res => {
        if (res) setPosts(res.data.data ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const loadPosts = async (locId) => {
    setLoading(true)
    try {
      const res = await api.get(`/v1/gmb/posts?locationId=${locId}`)
      setPosts(res.data.data ?? [])
    } catch { }
    setLoading(false)
  }

  const handleLocChange = (id) => {
    setSelectedLoc(id)
    loadPosts(id)
  }

  const handleCreated = (post) => {
    setPosts(prev => [post, ...prev])
  }

  const handleDelete = (id) => {
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  const noLocations = !loading && locations.length === 0

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar />
      <SidebarInset className="h-full overflow-hidden" style={{ background: "oklch(0.985 0.003 350)" }}>
        <div className="flex flex-col h-full">

          <div
            className="flex items-center justify-between px-8 py-4 sticky top-0 z-10 backdrop-blur-sm"
            style={{ background: "oklch(0.985 0.003 350 / 85%)", borderBottom: "1px solid oklch(0.91 0.008 350)" }}
          >
            <div>
              <h1 className="text-base font-semibold text-gray-800">Google Posts</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {loading ? "Loading…" : `${posts.length} post${posts.length !== 1 ? "s" : ""} · appear on Maps & Search`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {locations.length > 1 && (
                <div className="relative">
                  <select
                    value={selectedLoc ?? ""}
                    onChange={e => handleLocChange(e.target.value)}
                    className="rounded-xl border px-3 py-1.5 text-xs font-medium text-gray-700 appearance-none pr-7 focus:outline-none"
                    style={{ borderColor: `${ACCENT}20`, background: "white" }}
                  >
                    {locations.map(l => (
                      <option key={l.google_location_id} value={l.google_location_id}>{l.title}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
              {!noLocations && (
                <button
                  onClick={() => setShowCreate(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold transition-all hover:opacity-90 hover:shadow-sm"
                  style={{ background: ACCENT }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  New post
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-8 py-8">

              {noLocations ? (
                <div className="text-center py-20">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${ACCENT}12` }}>
                    <FileText className="w-6 h-6" style={{ color: ACCENT_MID }} />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">No Google Business connected</h3>
                  <p className="text-xs text-gray-400">Connect a location from the Locations page to start posting.</p>
                </div>
              ) : loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: "oklch(0.93 0.005 350)" }} />
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${ACCENT}12` }}>
                    <FileText className="w-6 h-6" style={{ color: ACCENT_MID }} />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">No posts yet</h3>
                  <p className="text-xs text-gray-400 mb-5">The AI agent posts every Monday. Or create one manually.</p>
                  <button
                    onClick={() => setShowCreate(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90"
                    style={{ background: ACCENT }}
                  >
                    <Plus className="w-4 h-4" /> Create first post
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {posts.map(p => (
                    <PostCard key={p.id} post={p} onDelete={handleDelete} />
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>

        {showCreate && (
          <CreateDrawer
            locations={locations}
            onClose={() => setShowCreate(false)}
            onCreated={handleCreated}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
