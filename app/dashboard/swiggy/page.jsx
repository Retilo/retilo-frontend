"use client"

// Swiggy integration page
// OAuth: POST /v1/swiggy/auth/connect, GET /v1/swiggy/auth/status, DELETE /v1/swiggy/auth/disconnect
// Competitors: GET /v1/swiggy/competitors, POST /v1/swiggy/scan/trigger
// Intelligence: GET /v1/swiggy/intelligence/pricing, GET /v1/swiggy/intelligence/ranking

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Link2, Unlink, RefreshCw, TrendingUp, TrendingDown,
  Minus, Star, Search, Trash2, X, ShoppingBag,
  BarChart2, DollarSign, Hash, GitBranch, MapPin, Plus, Check,
  Copy, ExternalLink, Palette, Globe, Pencil,
} from "lucide-react"
import { DashboardPageLayout } from "@/components/dashboard/page-layout"
import { api } from "@/lib/api"

const PINK = "oklch(0.58 0.24 350)"
const ORANGE = "oklch(0.62 0.20 50)"
const CARD_BG = "oklch(1 0 0)"
const CARD_BORDER = "oklch(0.91 0.008 350)"
const CARD_BORDER_HOVER = "oklch(0.86 0.012 350)"
const TEXT = "oklch(0.14 0.008 270)"
const TEXT_MUTED = "oklch(0.55 0.008 270)"
const TEXT_FAINT = "oklch(0.65 0.008 270)"
const INPUT_BG = "oklch(0.96 0.005 350)"
const INPUT_BORDER = "oklch(0.90 0.008 350)"
const GREEN = "oklch(0.50 0.18 145)"
const RED = "oklch(0.52 0.22 25)"

// ── Connection status banner ──────────────────────────────────────
function ConnectionBanner({ status, onConnect, onDisconnect, connecting, disconnecting }) {
  if (!status) return null

  if (!status.connected) {
    return (
      <div
        className="rounded-2xl p-6 flex items-center gap-5"
        style={{ background: `${ORANGE}08`, border: `1px solid ${ORANGE}28` }}
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${ORANGE}15` }}>
          <ShoppingBag className="w-6 h-6" style={{ color: ORANGE }} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold mb-1" style={{ color: TEXT }}>Connect Swiggy</h3>
          <p className="text-xs" style={{ color: TEXT_MUTED }}>
            Link your Swiggy restaurant to unlock competitor intelligence, pricing comparison, and keyword ranking.
          </p>
        </div>
        <button
          onClick={onConnect}
          disabled={connecting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60 hover:opacity-90 flex-shrink-0"
          style={{ background: ORANGE }}
        >
          <Link2 className="w-4 h-4" />
          {connecting ? "Redirecting…" : "Connect Swiggy"}
        </button>
      </div>
    )
  }

  const expiry = status.expiresAt ? new Date(status.expiresAt).toLocaleDateString() : null

  return (
    <div
      className="rounded-2xl p-5 flex items-center gap-4"
      style={{ background: `${GREEN}08`, border: `1px solid ${GREEN}28` }}
    >
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: GREEN, boxShadow: `0 0 6px ${GREEN}` }} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold" style={{ color: TEXT }}>Swiggy connected</div>
        {expiry && <div className="text-xs mt-0.5" style={{ color: TEXT_FAINT }}>Token valid until {expiry}</div>}
      </div>
      {status.lastSyncedAt && (
        <div className="text-xs text-right flex-shrink-0" style={{ color: TEXT_FAINT }}>
          Last sync<br />{new Date(status.lastSyncedAt).toLocaleDateString()}
        </div>
      )}
      <button
        onClick={onDisconnect}
        disabled={disconnecting}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all disabled:opacity-60 hover:opacity-75"
        style={{ border: `1px solid ${CARD_BORDER}`, background: CARD_BG, color: TEXT_MUTED }}
      >
        <Unlink className="w-3 h-3" />
        Disconnect
      </button>
    </div>
  )
}

// ── Booking page URL card ─────────────────────────────────────────
function BookingPageCard({ handle }) {
  const [copied, setCopied] = useState(false)
  const url = handle ? `https://book.retilo.io/${handle}/dinein` : null

  const copy = () => {
    if (!url) return
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="w-3.5 h-3.5" style={{ color: ORANGE }} />
        <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: TEXT_FAINT }}>
          Dineout Booking Page
        </h2>
      </div>
      {handle ? (
        <div>
          <div className="flex items-center gap-2 p-3 rounded-xl mb-2" style={{ background: INPUT_BG }}>
            <span className="text-xs flex-1 truncate font-mono" style={{ color: TEXT }}>
              book.retilo.io/{handle}/dinein
            </span>
            <button
              onClick={copy}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold flex-shrink-0 transition-all"
              style={{ background: copied ? `${GREEN}15` : `${ORANGE}15`, color: copied ? GREEN : ORANGE }}
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold flex-shrink-0"
              style={{ background: `${ORANGE}15`, color: ORANGE }}
            >
              <ExternalLink className="w-3 h-3" />
              Open
            </a>
          </div>
          <p className="text-[11px]" style={{ color: TEXT_FAINT }}>
            Share this with your guests. Each branch below must have a linked Swiggy restaurant to enable slot booking.
          </p>
        </div>
      ) : (
        <p className="text-xs" style={{ color: TEXT_MUTED }}>
          Set your unique handle in{" "}
          <a href="/dashboard/settings" className="underline" style={{ color: ORANGE }}>
            Settings
          </a>{" "}
          to generate your booking page URL.
        </p>
      )}
    </div>
  )
}

// ── Competitor card ───────────────────────────────────────────────
function CompetitorCard({ comp, onDelete }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try { await onDelete(comp.id) } finally { setDeleting(false) }
  }

  const topKeywords = comp.rank_for_keyword
    ? Object.entries(comp.rank_for_keyword).slice(0, 3)
    : []

  return (
    <div
      className="rounded-2xl p-5 transition-all hover:shadow-sm group"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
      onMouseEnter={e => e.currentTarget.style.borderColor = CARD_BORDER_HOVER}
      onMouseLeave={e => e.currentTarget.style.borderColor = CARD_BORDER}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold truncate" style={{ color: TEXT }}>{comp.name}</h3>
          {comp.cuisine && (
            <span
              className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ background: `${ORANGE}12`, color: ORANGE }}
            >
              {comp.cuisine}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {comp.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-bold" style={{ color: TEXT }}>{comp.rating}</span>
            </div>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50"
            style={{ color: TEXT_FAINT }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {topKeywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topKeywords.map(([kw, rank]) => (
            <span
              key={kw}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ background: "oklch(0.95 0.005 270)", color: TEXT_MUTED }}
            >
              <Hash className="w-2.5 h-2.5" />
              {kw} · <span className="font-bold" style={{ color: TEXT }}>#{rank}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Pricing card ─────────────────────────────────────────────────
function PricingCard({ pricing }) {
  if (!pricing) return null
  const { yours, competitors } = pricing

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
      <div className="px-5 py-4" style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" style={{ color: ORANGE }} />
          <span className="text-sm font-semibold" style={{ color: TEXT }}>Price Comparison</span>
        </div>
      </div>
      <div className="p-5 space-y-3">
        {yours && (
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: `${ORANGE}08` }}>
            <div className="text-xs font-medium flex-1" style={{ color: TEXT }}>Your avg price</div>
            <div className="text-sm font-bold" style={{ color: ORANGE }}>₹{yours.avgPrice}</div>
          </div>
        )}
        {competitors?.map((c, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: INPUT_BG }}>
            <div className="text-xs flex-1 truncate" style={{ color: TEXT_MUTED }}>{c.name}</div>
            <div className="text-xs font-medium" style={{ color: TEXT }}>₹{c.avgPrice}</div>
            {c.delta != null && (
              <div
                className="flex items-center gap-0.5 text-[10px] font-bold"
                style={{ color: c.delta < 0 ? RED : GREEN }}
              >
                {c.delta < 0 ? <TrendingDown className="w-3 h-3" /> : c.delta > 0 ? <TrendingUp className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                {c.delta > 0 ? "+" : ""}{c.delta}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Ranking card ─────────────────────────────────────────────────
function RankingCard({ rankings }) {
  if (!rankings?.length) return null

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
      <div className="px-5 py-4" style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4" style={{ color: PINK }} />
          <span className="text-sm font-semibold" style={{ color: TEXT }}>Keyword Rankings</span>
        </div>
      </div>
      <div className="divide-y" style={{ borderColor: CARD_BORDER }}>
        {rankings.map((r, i) => {
          const rankColor = r.rank <= 3 ? GREEN : r.rank <= 7 ? ORANGE : TEXT_MUTED
          return (
            <div key={i} className="flex items-center gap-4 px-5 py-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: TEXT }}>{r.keyword}</div>
                <div className="text-[10px] mt-0.5" style={{ color: TEXT_FAINT }}>{r.totalResults} results</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold" style={{ color: rankColor }}>#{r.rank}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Scan trigger modal ────────────────────────────────────────────
function ScanModal({ onClose, onScan }) {
  const [keywords, setKeywords] = useState("")
  const [scanning, setScanning] = useState(false)
  const [done, setDone] = useState(false)

  const handleScan = async () => {
    setScanning(true)
    try {
      const kwList = keywords.split(",").map(k => k.trim()).filter(Boolean)
      await onScan(kwList.length > 0 ? kwList : undefined)
      setDone(true)
    } finally {
      setScanning(false)
    }
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl text-center" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: `${GREEN}15` }}>
            <Check className="w-5 h-5" style={{ color: GREEN }} />
          </div>
          <h2 className="text-sm font-semibold mb-1" style={{ color: TEXT }}>Scan triggered</h2>
          <p className="text-xs mb-5" style={{ color: TEXT_MUTED }}>
            Competitors will appear here in 2–5 minutes once the background scan completes.
          </p>
          <button onClick={onClose} className="px-6 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: ORANGE }}>
            Got it
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold" style={{ color: TEXT }}>Scan Competitors</h2>
          <button onClick={onClose} style={{ color: TEXT_FAINT }}><X className="w-4 h-4" /></button>
        </div>
        <p className="text-xs mb-4" style={{ color: TEXT_MUTED }}>
          Optionally provide cuisine keywords to scan for. Leave blank to use your restaurant's default cuisine.
        </p>
        <input
          value={keywords}
          onChange={e => setKeywords(e.target.value)}
          placeholder="biryani, pizza, chinese (comma separated)"
          className="w-full rounded-xl px-4 py-3 text-sm outline-none mb-3"
          style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }}
          onFocus={e => e.target.style.borderColor = ORANGE}
          onBlur={e => e.target.style.borderColor = INPUT_BORDER}
        />
        <p className="text-[11px] mb-4" style={{ color: TEXT_FAINT }}>
          Results appear in 2–5 min after scan completes in the background.
        </p>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60 hover:opacity-90"
          style={{ background: ORANGE }}
        >
          {scanning ? "Triggering scan…" : "Start Scan"}
        </button>
      </div>
    </div>
  )
}

// ── Booking pages section (per-branch Canva-style pages) ─────────
function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60)
}

function BookingPagesSection({ branches }) {
  const [pages, setPages] = useState([])
  const [loadingPages, setLoadingPages] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState(null) // page object being edited
  // Form state
  const [fSlug, setFSlug] = useState("")
  const [fName, setFName] = useState("")
  const [fTagline, setFTagline] = useState("")
  const [fPrimary, setFPrimary] = useState("#FF6200")
  const [fAccent, setFAccent] = useState("#FFA500")
  const [fRestaurantId, setFRestaurantId] = useState("")
  const [fTheme, setFTheme] = useState("dark")
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")
  const [copiedSlug, setCopiedSlug] = useState(null)

  useEffect(() => { fetchPages() }, [])

  const fetchPages = async () => {
    setLoadingPages(true)
    try {
      const res = await api.get("/v1/brand-config")
      setPages(res.data?.brands ?? [])
    } catch { setPages([]) }
    finally { setLoadingPages(false) }
  }

  const openCreate = () => {
    setEditing(null)
    setFSlug(""); setFName(""); setFTagline("")
    setFPrimary("#FF6200"); setFAccent("#FFA500"); setFRestaurantId(""); setFTheme("dark")
    setFormError("")
    setShowCreate(true)
  }

  const openEdit = (page) => {
    setEditing(page)
    setFSlug(page.slug ?? "")
    setFName(page.displayName ?? "")
    setFTagline(page.tagline ?? "")
    setFPrimary(page.primaryColor ?? "#FF6200")
    setFAccent(page.accentColor ?? "#FFA500")
    setFRestaurantId(page.swiggyRestaurantId ?? "")
    setFTheme(page.bookingTheme ?? "dark")
    setFormError("")
    setShowCreate(true)
  }

  const handleNameChange = (val) => {
    setFName(val)
    if (!editing) setFSlug(slugify(val))
  }

  const handleSave = async () => {
    if (!fName.trim()) { setFormError("Display name is required"); return }
    if (!fSlug.trim()) { setFormError("URL slug is required"); return }
    if (!/^[a-z0-9-]+$/.test(fSlug)) { setFormError("Slug can only contain lowercase letters, numbers and hyphens"); return }
    setSaving(true)
    setFormError("")
    try {
      await api.put("/v1/brand-config", {
        slug:               fSlug.trim(),
        displayName:        fName.trim(),
        tagline:            fTagline.trim() || undefined,
        primaryColor:       fPrimary,
        accentColor:        fAccent,
        businessType:       "restaurant",
        bookingTheme:       fTheme,
        swiggyRestaurantId: fRestaurantId.trim() || null,
        locationId:         null,
      })
      setShowCreate(false)
      fetchPages()
    } catch (e) {
      setFormError(e?.response?.data?.message ?? "Failed to save booking page")
    } finally { setSaving(false) }
  }

  const copy = (slug) => {
    navigator.clipboard.writeText(`https://book.retilo.io/${slug}/dinein`)
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  const linkedRestaurants = branches
    .filter(b => b.own_swiggy_restaurant_id)
    .map(b => ({ id: b.own_swiggy_restaurant_id, name: b.branch_name }))

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Palette className="w-3.5 h-3.5" style={{ color: TEXT_FAINT }} />
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: TEXT_FAINT }}>
            Booking Pages
          </h2>
          <Link
            href="/dashboard/booking-page"
            className="text-[10px] font-medium"
            style={{ color: ORANGE }}
          >
            Manage all →
          </Link>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
          style={{ background: `${ORANGE}15`, color: ORANGE, border: `1px solid ${ORANGE}28` }}
        >
          <Plus className="w-3 h-3" />
          New page
        </button>
      </div>

      {loadingPages ? (
        <div className="h-20 rounded-2xl animate-pulse" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }} />
      ) : pages.length === 0 ? (
        <div className="py-8 text-center rounded-2xl" style={{ border: `1px dashed ${CARD_BORDER}` }}>
          <Globe className="w-6 h-6 mx-auto mb-2" style={{ color: TEXT_FAINT }} />
          <p className="text-sm font-medium mb-1" style={{ color: TEXT }}>No booking pages yet</p>
          <p className="text-xs mb-4" style={{ color: TEXT_FAINT }}>
            Create a branded dineout page for each of your locations.
          </p>
          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-xl text-white text-xs font-semibold hover:opacity-90"
            style={{ background: ORANGE }}
          >
            Create first page
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {pages.map(page => (
            <div
              key={page.id}
              className="rounded-xl overflow-hidden"
              style={{ background: CARD_BG, border: `1px solid ${page.swiggyRestaurantId ? CARD_BORDER : ORANGE + "40"}` }}
            >
              <div className="flex items-center gap-3 p-4">
                {/* Color swatch */}
                <div
                  className="w-8 h-8 rounded-lg flex-shrink-0"
                  style={{ background: page.primaryColor ?? ORANGE }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: TEXT }}>{page.displayName}</div>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-[10px] font-mono" style={{ color: TEXT_FAINT }}>
                      /{page.slug}/dinein
                    </span>
                    {page.swiggyRestaurantId ? (
                      <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: `${GREEN}12`, color: GREEN }}>
                        <Check className="w-2.5 h-2.5" />Swiggy linked
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: `${ORANGE}12`, color: ORANGE }}>
                        Swiggy not linked
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => copy(page.slug)}
                    className="p-1.5 rounded-lg transition-all"
                    style={{ background: copiedSlug === page.slug ? `${GREEN}15` : INPUT_BG, color: copiedSlug === page.slug ? GREEN : TEXT_FAINT }}
                    title="Copy dineout URL"
                  >
                    {copiedSlug === page.slug ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={`https://book.retilo.io/${page.slug}/dinein`}
                    target="_blank" rel="noopener noreferrer"
                    className="p-1.5 rounded-lg"
                    style={{ background: INPUT_BG, color: TEXT_FAINT }}
                    title="Open page"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <Link
                    href="/dashboard/booking-page"
                    className="p-1.5 rounded-lg"
                    style={{ background: INPUT_BG, color: TEXT_FAINT, display: "flex" }}
                    title="Configure in booking page editor"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
              {/* CTA when Swiggy not linked */}
              {!page.swiggyRestaurantId && (
                <div
                  className="flex items-center justify-between px-4 py-2.5"
                  style={{ background: `${ORANGE}08`, borderTop: `1px solid ${ORANGE}20` }}
                >
                  <span className="text-[11px]" style={{ color: TEXT_MUTED }}>
                    Link a Swiggy restaurant to enable real-time slot booking on this page
                  </span>
                  <Link
                    href="/dashboard/booking-page"
                    className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg flex-shrink-0 ml-3"
                    style={{ background: ORANGE, color: "#fff" }}
                  >
                    Configure →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-md rounded-2xl shadow-2xl" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4" style={{ color: ORANGE }} />
                <h3 className="text-sm font-semibold" style={{ color: TEXT }}>
                  {editing ? "Edit booking page" : "Create booking page"}
                </h3>
              </div>
              <button onClick={() => setShowCreate(false)} style={{ color: TEXT_FAINT }}><X className="w-4 h-4" /></button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Preview strip */}
              <div
                className="rounded-xl p-4 flex items-center gap-3"
                style={{ background: fTheme === "dark" ? "#111" : "#fafafa", border: `2px solid ${fPrimary}33` }}
              >
                <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ background: fPrimary }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: fTheme === "dark" ? "#fff" : "#111" }}>
                    {fName || "Restaurant name"}
                  </div>
                  {fTagline && <div className="text-[11px] truncate" style={{ color: fTheme === "dark" ? "#aaa" : "#666" }}>{fTagline}</div>}
                </div>
                <div className="text-[10px] px-2 py-1 rounded-lg font-semibold" style={{ background: fPrimary, color: "#fff" }}>
                  Book
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[11px] font-medium mb-1" style={{ color: TEXT_MUTED }}>Restaurant display name</label>
                <input
                  value={fName}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="Meghana Foods Koramangala"
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }}
                  onFocus={e => e.target.style.borderColor = ORANGE}
                  onBlur={e => e.target.style.borderColor = INPUT_BORDER}
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-[11px] font-medium mb-1" style={{ color: TEXT_MUTED }}>Tagline (optional)</label>
                <input
                  value={fTagline}
                  onChange={e => setFTagline(e.target.value)}
                  placeholder="Authentic Andhra Cuisine since 1998"
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }}
                  onFocus={e => e.target.style.borderColor = ORANGE}
                  onBlur={e => e.target.style.borderColor = INPUT_BORDER}
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-[11px] font-medium mb-1" style={{ color: TEXT_MUTED }}>Booking URL slug</label>
                <div className="flex items-center rounded-xl overflow-hidden" style={{ border: `1px solid ${INPUT_BORDER}`, background: INPUT_BG }}>
                  <span className="pl-3 text-xs flex-shrink-0" style={{ color: TEXT_FAINT }}>book.retilo.io/</span>
                  <input
                    value={fSlug}
                    onChange={e => setFSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="meghana-koramangala"
                    className="flex-1 px-2 py-2.5 text-sm outline-none bg-transparent"
                    style={{ color: TEXT }}
                    onFocus={e => e.target.parentElement.style.borderColor = ORANGE}
                    onBlur={e => e.target.parentElement.style.borderColor = INPUT_BORDER}
                  />
                  <span className="pr-3 text-xs flex-shrink-0" style={{ color: TEXT_FAINT }}>/dinein</span>
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: TEXT_MUTED }}>Primary color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fPrimary}
                      onChange={e => setFPrimary(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                    />
                    <input
                      value={fPrimary}
                      onChange={e => setFPrimary(e.target.value)}
                      maxLength={7}
                      className="flex-1 rounded-xl px-3 py-2 text-sm outline-none font-mono"
                      style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: TEXT_MUTED }}>Accent color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fAccent}
                      onChange={e => setFAccent(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                    />
                    <input
                      value={fAccent}
                      onChange={e => setFAccent(e.target.value)}
                      maxLength={7}
                      className="flex-1 rounded-xl px-3 py-2 text-sm outline-none font-mono"
                      style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }}
                    />
                  </div>
                </div>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-[11px] font-medium mb-1" style={{ color: TEXT_MUTED }}>Page theme</label>
                <div className="flex rounded-xl overflow-hidden" style={{ border: `1px solid ${INPUT_BORDER}` }}>
                  {["dark", "light"].map(t => (
                    <button
                      key={t}
                      onClick={() => setFTheme(t)}
                      className="flex-1 py-2 text-xs font-semibold capitalize transition-all"
                      style={{ background: fTheme === t ? ORANGE : "transparent", color: fTheme === t ? "#fff" : TEXT_MUTED }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Swiggy restaurant */}
              <div>
                <label className="block text-[11px] font-medium mb-1" style={{ color: TEXT_MUTED }}>
                  Swiggy restaurant
                  <span className="ml-1 font-normal" style={{ color: TEXT_FAINT }}>(picks slots for this page)</span>
                </label>
                {linkedRestaurants.length > 0 ? (
                  <div className="space-y-1.5 mb-2 max-h-36 overflow-y-auto">
                    {linkedRestaurants.map(r => {
                      const sel = fRestaurantId === r.id
                      return (
                        <button
                          key={r.id}
                          onClick={() => setFRestaurantId(sel ? "" : r.id)}
                          className="w-full text-left p-2.5 rounded-xl transition-all text-sm"
                          style={{
                            background: sel ? `${ORANGE}10` : INPUT_BG,
                            border: `1px solid ${sel ? ORANGE + "40" : INPUT_BORDER}`,
                            color: TEXT,
                          }}
                        >
                          {r.name}
                          <span className="text-[10px] ml-2 font-mono" style={{ color: TEXT_FAINT }}>#{r.id}</span>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs mb-2" style={{ color: TEXT_FAINT }}>
                    No linked branches yet — add a branch above first, or paste a Swiggy restaurant ID manually.
                  </p>
                )}
                <input
                  value={fRestaurantId}
                  onChange={e => setFRestaurantId(e.target.value)}
                  placeholder="Swiggy restaurant ID (e.g. 786054)"
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none font-mono"
                  style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }}
                  onFocus={e => e.target.style.borderColor = ORANGE}
                  onBlur={e => e.target.style.borderColor = INPUT_BORDER}
                />
              </div>

              {formError && <p className="text-xs" style={{ color: RED }}>{formError}</p>}

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50 hover:opacity-90"
                style={{ background: ORANGE }}
              >
                {saving ? "Saving…" : editing ? "Save changes" : "Create booking page"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Branches section ──────────────────────────────────────────────
function BranchesSection({ branches, onRemove, onAdd }) {
  const [showAdd, setShowAdd] = useState(false)
  const [swiggyQuery, setSwiggyQuery] = useState("")
  const [swiggyResults, setSwiggyResults] = useState([])
  const [selectedSwiggy, setSelectedSwiggy] = useState(null)
  const [searchingSwiggy, setSearchingSwiggy] = useState(false)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState("")

  const openAdd = () => {
    setSwiggyQuery("")
    setSwiggyResults([])
    setSelectedSwiggy(null)
    setError("")
    setShowAdd(true)
  }

  const handleSwiggySearch = async () => {
    if (!swiggyQuery.trim()) return
    setSearchingSwiggy(true)
    try {
      const res = await api.get(`/v1/swiggy/restaurants/search?q=${encodeURIComponent(swiggyQuery)}`)
      setSwiggyResults(res.data?.data?.restaurants ?? [])
    } catch {
      setSwiggyResults([])
    } finally {
      setSearchingSwiggy(false)
    }
  }

  const handleAdd = async () => {
    if (!selectedSwiggy) return
    setError("")
    setAdding(true)
    try {
      await api.post("/v1/swiggy/branches", {
        locationId:            Date.now(),
        branchName:            selectedSwiggy.name,
        ownSwiggyRestaurantId: selectedSwiggy.restaurantId,
      })
      setShowAdd(false)
      onAdd()
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to add branch")
    } finally {
      setAdding(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <GitBranch className="w-3.5 h-3.5" style={{ color: TEXT_FAINT }} />
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: TEXT_FAINT }}>
            Branch Locations
          </h2>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
          style={{ background: `${ORANGE}15`, color: ORANGE, border: `1px solid ${ORANGE}28` }}
        >
          <Plus className="w-3 h-3" />
          Add Branch
        </button>
      </div>

      {branches.length === 0 ? (
        <div className="py-8 text-center rounded-2xl" style={{ border: `1px dashed ${CARD_BORDER}` }}>
          <MapPin className="w-6 h-6 mx-auto mb-2" style={{ color: TEXT_FAINT }} />
          <p className="text-sm font-medium mb-1" style={{ color: TEXT }}>No restaurant linked yet</p>
          <p className="text-xs mb-4" style={{ color: TEXT_FAINT }}>
            Search your restaurant on Swiggy to enable the booking page.
          </p>
          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-xl text-white text-xs font-semibold hover:opacity-90"
            style={{ background: ORANGE }}
          >
            Link restaurant
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {branches.map(b => (
            <div
              key={b.location_id}
              className="flex items-center gap-3 p-4 rounded-xl"
              style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${ORANGE}12` }}>
                <MapPin className="w-4 h-4" style={{ color: ORANGE }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium" style={{ color: TEXT }}>
                  {b.branch_name ?? `Branch ${b.location_id}`}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{ background: b.own_swiggy_restaurant_id ? `${GREEN}12` : `${TEXT_FAINT}12`, color: b.own_swiggy_restaurant_id ? GREEN : TEXT_FAINT }}
                  >
                    <Check className="w-2.5 h-2.5" />
                    {b.own_swiggy_restaurant_id ? `Swiggy #${b.own_swiggy_restaurant_id}` : "Not linked to Swiggy"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onRemove(b.location_id)}
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                style={{ color: TEXT_FAINT }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold" style={{ color: TEXT }}>Link your Swiggy restaurant</h3>
              <button onClick={() => setShowAdd(false)} style={{ color: TEXT_FAINT }}><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs mb-4" style={{ color: TEXT_MUTED }}>
              Search by name and pick your outlet — this powers the booking page.
            </p>

            <div className="flex gap-2 mb-3">
              <input
                value={swiggyQuery}
                onChange={e => setSwiggyQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSwiggySearch()}
                placeholder="e.g. Meghana Foods, Biryani By Kilo…"
                className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }}
                onFocus={e => e.target.style.borderColor = ORANGE}
                onBlur={e => e.target.style.borderColor = INPUT_BORDER}
                autoFocus
              />
              <button
                onClick={handleSwiggySearch}
                disabled={searchingSwiggy || !swiggyQuery.trim()}
                className="px-4 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center"
                style={{ background: ORANGE }}
              >
                {searchingSwiggy
                  ? <RefreshCw className="w-4 h-4 animate-spin" />
                  : <Search className="w-4 h-4" />}
              </button>
            </div>

            {swiggyResults.length > 0 && (
              <div className="space-y-2 mb-4 max-h-56 overflow-y-auto">
                {swiggyResults.map(r => {
                  const sel = selectedSwiggy?.restaurantId === r.restaurantId
                  return (
                    <button
                      key={r.restaurantId}
                      onClick={() => setSelectedSwiggy(r)}
                      className="w-full text-left p-3 rounded-xl transition-all"
                      style={{
                        background: sel ? `${ORANGE}10` : INPUT_BG,
                        border: `1px solid ${sel ? ORANGE + "40" : INPUT_BORDER}`,
                      }}
                    >
                      <div className="text-sm font-medium" style={{ color: TEXT }}>{r.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {r.rating && (
                          <span className="flex items-center gap-0.5 text-[10px]" style={{ color: TEXT_MUTED }}>
                            <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                            {r.rating}
                          </span>
                        )}
                        {r.address && (
                          <span className="text-[10px] truncate" style={{ color: TEXT_FAINT }}>{r.address}</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {swiggyResults.length === 0 && !searchingSwiggy && swiggyQuery.trim() && (
              <p className="text-xs mb-3 text-center py-2" style={{ color: TEXT_FAINT }}>
                No results — try a shorter name or different spelling.
              </p>
            )}

            {error && <p className="text-xs mb-3" style={{ color: RED }}>{error}</p>}

            <button
              onClick={handleAdd}
              disabled={adding || !selectedSwiggy}
              className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50 hover:opacity-90"
              style={{ background: ORANGE }}
            >
              {adding ? "Linking…" : selectedSwiggy ? `Link "${selectedSwiggy.name}"` : "Select a restaurant above"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────
export default function SwiggyPage() {
  const router = useRouter()
  const [status, setStatus] = useState(null)
  const [competitors, setCompetitors] = useState([])
  const [pricing, setPricing] = useState(null)
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [showScanModal, setShowScanModal] = useState(false)
  const [branches, setBranches] = useState([])

  useEffect(() => {
    if (!localStorage.getItem("retilo_token")) { router.replace("/auth"); return }
    fetchAll()
  }, [router])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [statusRes, competitorRes, branchRes] = await Promise.allSettled([
        api.get("/v1/swiggy/auth/status"),
        api.get("/v1/swiggy/competitors"),
        api.get("/v1/swiggy/branches"),
      ])

      const s = statusRes.status === "fulfilled" ? statusRes.value.data?.data : { connected: false }
      setStatus(s ?? { connected: false })
      if (branchRes.status === "fulfilled") setBranches(branchRes.value.data?.data?.branches ?? [])

      if (s?.connected) {
        const [pricingRes, rankingRes] = await Promise.allSettled([
          api.get("/v1/swiggy/intelligence/pricing"),
          api.get("/v1/swiggy/intelligence/ranking"),
        ])
        if (pricingRes.status === "fulfilled") setPricing(pricingRes.value.data?.data)
        if (rankingRes.status === "fulfilled") setRankings(rankingRes.value.data?.data ?? [])
      }

      if (competitorRes.status === "fulfilled") setCompetitors(competitorRes.value.data?.data ?? [])
    } catch {}
    finally { setLoading(false) }
  }

  const handleConnect = async () => {
    setConnecting(true)
    try {
      const res = await api.post("/v1/swiggy/auth/connect", {})
      window.location.href = res.data?.data?.authorizeUrl
    } catch { setConnecting(false) }
  }

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try {
      await api.delete("/v1/swiggy/auth/disconnect")
      setStatus({ connected: false })
      setPricing(null)
      setRankings([])
    } finally { setDisconnecting(false) }
  }

  const handleDeleteCompetitor = async (id) => {
    await api.delete(`/v1/swiggy/competitors/${id}`)
    setCompetitors(prev => prev.filter(c => c.id !== id))
  }

  const handleRemoveBranch = async (locationId) => {
    await api.delete(`/v1/swiggy/branches/${locationId}`)
    setBranches(prev => prev.filter(b => b.location_id !== locationId))
  }

  const handleScan = async (keywords) => {
    await api.post("/v1/swiggy/scan/trigger", keywords ? { keywords } : {})
    setScanning(true)
    setTimeout(() => {
      setScanning(false)
      fetchAll()
    }, 5000)
  }

  return (
    <DashboardPageLayout
      title="Swiggy Intelligence"
      subtitle="Competitor pricing, keyword rankings, and menu insights"
      actions={
        status?.connected ? (
          <button
            onClick={() => setShowScanModal(true)}
            disabled={scanning}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white text-xs font-semibold transition-all disabled:opacity-60 hover:opacity-90"
            style={{ background: ORANGE }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? "animate-spin" : ""}`} />
            {scanning ? "Scanning…" : "Scan competitors"}
          </button>
        ) : null
      }
    >
      <div className="max-w-3xl mx-auto px-8 py-6 space-y-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }} />
            ))}
          </div>
        ) : (
          <>
            <ConnectionBanner
              status={status}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              connecting={connecting}
              disconnecting={disconnecting}
            />

            {/* Booking pages always visible — independent of Swiggy connection */}
            <BookingPagesSection branches={branches} />

            {status?.connected && (
              <>
                <BranchesSection
                  branches={branches}
                  onRemove={handleRemoveBranch}
                  onAdd={fetchAll}
                />

                {/* Intelligence grid */}
                {(pricing || rankings.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PricingCard pricing={pricing} />
                    <RankingCard rankings={rankings} />
                  </div>
                )}

                {/* Competitors */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: TEXT_FAINT }}>
                      Tracked Competitors
                    </h2>
                    <span className="text-xs" style={{ color: TEXT_FAINT }}>{competitors.length} found</span>
                  </div>
                  {competitors.length === 0 ? (
                    <div className="text-center py-12 rounded-2xl" style={{ border: `1px dashed ${CARD_BORDER}` }}>
                      <Search className="w-8 h-8 mx-auto mb-3" style={{ color: TEXT_FAINT }} />
                      <p className="text-sm font-medium mb-1" style={{ color: TEXT }}>No competitors tracked yet</p>
                      <p className="text-xs mb-4" style={{ color: TEXT_MUTED }}>
                        Run a scan to discover nearby competitors on Swiggy. Results appear in 2–5 minutes.
                      </p>
                      <button
                        onClick={() => setShowScanModal(true)}
                        className="px-4 py-2 rounded-xl text-white text-xs font-semibold transition-all hover:opacity-90"
                        style={{ background: ORANGE }}
                      >
                        Run first scan
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {competitors.map(c => (
                        <CompetitorCard key={c.id} comp={c} onDelete={handleDeleteCompetitor} />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {showScanModal && (
        <ScanModal onClose={() => setShowScanModal(false)} onScan={handleScan} />
      )}
    </DashboardPageLayout>
  )
}
