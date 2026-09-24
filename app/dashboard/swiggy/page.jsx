"use client"

// Swiggy integration page
// OAuth: POST /v1/swiggy/auth/connect, GET /v1/swiggy/auth/status, DELETE /v1/swiggy/auth/disconnect
// Competitors: GET /v1/swiggy/competitors, POST /v1/swiggy/scan/trigger
// Intelligence: GET /v1/swiggy/intelligence/pricing, GET /v1/swiggy/intelligence/ranking

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Zap, Link2, Unlink, RefreshCw, TrendingUp, TrendingDown,
  Minus, Star, Search, Trash2, X, ChevronRight, ShoppingBag,
  BarChart2, DollarSign, Hash, GitBranch, MapPin, Plus, Check,
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

  const handleScan = async () => {
    setScanning(true)
    try {
      const kwList = keywords.split(",").map(k => k.trim()).filter(Boolean)
      await onScan(kwList.length > 0 ? kwList : undefined)
      onClose()
    } finally {
      setScanning(false)
    }
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
          className="w-full rounded-xl px-4 py-3 text-sm outline-none mb-4"
          style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }}
          onFocus={e => e.target.style.borderColor = ORANGE}
          onBlur={e => e.target.style.borderColor = INPUT_BORDER}
        />
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

// ── Branches section ──────────────────────────────────────────────
function BranchesSection({ branches, onRemove, onAdd }) {
  const [showAdd, setShowAdd] = useState(false)
  const [mode, setMode] = useState("gmb") // "gmb" | "manual"
  const [locations, setLocations] = useState([])
  const [selectedLoc, setSelectedLoc] = useState(null)
  const [manualName, setManualName] = useState("")
  const [manualLat, setManualLat] = useState("")
  const [manualLng, setManualLng] = useState("")
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState("")

  const openAdd = async () => {
    setMode("gmb")
    setSelectedLoc(null)
    setManualName("")
    setManualLat("")
    setManualLng("")
    setError("")
    try {
      const res = await api.get("/v1/gmb/locations")
      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : (res.data?.data?.locations ?? [])
      setLocations(list.filter(l => l.lat || l.latitude))
    } catch {
      setLocations([])
    }
    setShowAdd(true)
  }

  const handleAdd = async () => {
    setError("")
    setAdding(true)
    try {
      if (mode === "gmb") {
        if (!selectedLoc) return
        await api.post("/v1/swiggy/branches", {
          locationId: selectedLoc.id,
          branchName: selectedLoc.title ?? selectedLoc.name ?? null,
          latitude:   selectedLoc.lat ?? selectedLoc.latitude,
          longitude:  selectedLoc.lng ?? selectedLoc.longitude,
        })
      } else {
        const lat = parseFloat(manualLat)
        const lng = parseFloat(manualLng)
        if (!manualName.trim())       { setError("Branch name is required"); return }
        if (isNaN(lat) || isNaN(lng)) { setError("Enter valid latitude and longitude"); return }
        if (lat < -90 || lat > 90)    { setError("Latitude must be between -90 and 90"); return }
        if (lng < -180 || lng > 180)  { setError("Longitude must be between -180 and 180"); return }
        await api.post("/v1/swiggy/branches", {
          locationId: Date.now(),
          branchName: manualName.trim(),
          latitude:   lat,
          longitude:  lng,
        })
      }
      setShowAdd(false)
      onAdd()
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to add branch")
    } finally {
      setAdding(false)
    }
  }

  const canSubmit = mode === "gmb"
    ? !!selectedLoc
    : (manualName.trim() && manualLat && manualLng)

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
        <div className="py-6 text-center rounded-2xl" style={{ border: `1px dashed ${CARD_BORDER}` }}>
          <p className="text-xs" style={{ color: TEXT_FAINT }}>No branches configured. Add one to set per-location restaurant context.</p>
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
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: (b.latitude && b.longitude) ? GREEN : TEXT_FAINT }}>
                    <Check className="w-2.5 h-2.5" />
                    Location
                  </span>
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: b.own_swiggy_restaurant_id ? GREEN : TEXT_FAINT }}>
                    <Check className="w-2.5 h-2.5" />
                    Restaurant
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: TEXT }}>Add Branch Location</h3>
              <button onClick={() => setShowAdd(false)} style={{ color: TEXT_FAINT }}><X className="w-4 h-4" /></button>
            </div>

            {/* Mode toggle */}
            <div className="flex rounded-xl overflow-hidden mb-4" style={{ border: `1px solid ${INPUT_BORDER}` }}>
              {["gmb", "manual"].map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError("") }}
                  className="flex-1 py-2 text-xs font-semibold transition-all"
                  style={{
                    background: mode === m ? ORANGE : "transparent",
                    color: mode === m ? "#fff" : TEXT_MUTED,
                  }}
                >
                  {m === "gmb" ? "From GMB" : "Enter manually"}
                </button>
              ))}
            </div>

            {mode === "gmb" ? (
              locations.length === 0 ? (
                <p className="text-xs py-4 text-center" style={{ color: TEXT_MUTED }}>
                  No GMB locations with coordinates found. Use manual entry instead.
                </p>
              ) : (
                <div className="space-y-2 mb-4 max-h-56 overflow-y-auto">
                  {locations.map(loc => {
                    const sel = selectedLoc?.id === loc.id
                    return (
                      <button
                        key={loc.id}
                        onClick={() => setSelectedLoc(loc)}
                        className="w-full text-left p-3 rounded-xl transition-all"
                        style={{
                          background: sel ? `${ORANGE}10` : INPUT_BG,
                          border: `1px solid ${sel ? ORANGE + "40" : INPUT_BORDER}`,
                        }}
                      >
                        <div className="text-sm font-medium" style={{ color: TEXT }}>{loc.title ?? loc.name}</div>
                        {loc.address && <div className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>{loc.address}</div>}
                      </button>
                    )
                  })}
                </div>
              )
            ) : (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: TEXT_MUTED }}>Branch name</label>
                  <input
                    value={manualName}
                    onChange={e => setManualName(e.target.value)}
                    placeholder="e.g. Koramangala outlet"
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                    style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }}
                    onFocus={e => e.target.style.borderColor = ORANGE}
                    onBlur={e => e.target.style.borderColor = INPUT_BORDER}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium mb-1" style={{ color: TEXT_MUTED }}>Latitude</label>
                    <input
                      type="number"
                      value={manualLat}
                      onChange={e => setManualLat(e.target.value)}
                      placeholder="12.9352"
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                      style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }}
                      onFocus={e => e.target.style.borderColor = ORANGE}
                      onBlur={e => e.target.style.borderColor = INPUT_BORDER}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium mb-1" style={{ color: TEXT_MUTED }}>Longitude</label>
                    <input
                      type="number"
                      value={manualLng}
                      onChange={e => setManualLng(e.target.value)}
                      placeholder="77.6245"
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                      style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }}
                      onFocus={e => e.target.style.borderColor = ORANGE}
                      onBlur={e => e.target.style.borderColor = INPUT_BORDER}
                    />
                  </div>
                </div>
                <p className="text-[11px]" style={{ color: TEXT_FAINT }}>
                  Right-click any location in Google Maps and copy the coordinates.
                </p>
              </div>
            )}

            {error && (
              <p className="text-xs mb-3" style={{ color: RED }}>{error}</p>
            )}

            <button
              onClick={handleAdd}
              disabled={adding || !canSubmit}
              className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50 hover:opacity-90"
              style={{ background: ORANGE }}
            >
              {adding ? "Adding…" : "Add Branch"}
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
    setBranches(prev => prev.filter(b => b.locationId !== locationId))
  }

  const handleScan = async (keywords) => {
    await api.post("/v1/swiggy/scan/trigger", keywords ? { keywords } : {})
    setScanning(true)
    setTimeout(() => {
      setScanning(false)
      fetchAll()
    }, 3000)
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
                      <p className="text-xs mb-4" style={{ color: TEXT_MUTED }}>Run a scan to discover nearby competitors on Swiggy.</p>
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
