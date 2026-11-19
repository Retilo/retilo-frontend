"use client"

// Voice AI — restaurant/merchant ops command centre
// Agents:  GET /v1/voice/agents, POST /v1/voice/agents/provision, DELETE /v1/voice/agents/:locationId
// Calls:   GET /v1/voice/calls, GET /v1/voice/analytics
// Orders:  GET /v1/voice/orders, PATCH /v1/voice/orders/:id/status
// Numbers: GET /v1/voice/numbers, POST /v1/voice/numbers

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Phone, PhoneCall, PhoneMissed, Mic, Plus, Trash2, Pencil,
  X, Hash, AlertCircle, Loader2, ShoppingBag,
  CheckCircle2, ArrowUpRight, Headphones, ExternalLink,
} from "lucide-react"
import { DashboardPageLayout } from "@/components/dashboard/page-layout"
import { ModuleHelper } from "@/components/module-helper"
import { VoiceDialer } from "@/components/dashboard/voice-dialer"
import { api } from "@/lib/api"
import { AnimatedCard, AnimatedCardHeader, AnimatedCardTitle, AnimatedCardDescription, AnimatedCardContent } from "@/components/animated-card"
import { AnimatedInput, AnimatedTextarea } from "@/components/animated-input"
import { AnimatedButton } from "@/components/animated-button"

const PINK         = "oklch(0.58 0.24 350)"
const BLUE         = "oklch(0.52 0.20 255)"
const AMBER        = "oklch(0.72 0.14 65)"
const TEAL         = "oklch(0.60 0.18 200)"
const CARD_BG      = "oklch(1 0 0)"
const CARD_BORDER  = "oklch(0.91 0.008 350)"
const TEXT         = "oklch(0.14 0.008 270)"
const TEXT_MUTED   = "oklch(0.55 0.008 270)"
const TEXT_FAINT   = "oklch(0.65 0.008 270)"
const INPUT_BG     = "oklch(0.96 0.005 350)"
const INPUT_BORDER = "oklch(0.90 0.008 350)"
const GREEN        = "oklch(0.50 0.18 145)"
const RED          = "oklch(0.52 0.22 25)"

const ORDER_STATUS_COLOR = {
  pending:   AMBER,
  confirmed: BLUE,
  preparing: TEAL,
  ready:     GREEN,
  delivered: GREEN,
  cancelled: RED,
}

const NEXT_ACTION = {
  pending:   { label: "Confirm Order",    next: "confirmed",  bg: GREEN },
  confirmed: { label: "Start Preparing",  next: "preparing",  bg: BLUE  },
  preparing: { label: "Mark Ready",       next: "ready",      bg: TEAL  },
  ready:     { label: "Mark Delivered",   next: "delivered",  bg: GREEN },
}

// ── Today strip ───────────────────────────────────────────────────────
function TodayStrip({ calls, orders }) {
  const today = new Date().toDateString()

  const todayCalls    = calls.filter(c => new Date(c.created_at).toDateString() === today)
  const aiAnswered    = todayCalls.filter(c => (c.duration_secs ?? 0) > 0)
  const todayOrders   = orders.filter(o => new Date(o.created_at).toDateString() === today && o.status !== "cancelled")
  const pendingCount  = todayOrders.filter(o => o.status === "pending").length
  const revenue       = todayOrders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0)

  if (!todayCalls.length && !todayOrders.length) return null

  const stats = [
    { value: todayCalls.length,  label: "calls today",   color: BLUE  },
    { value: aiAnswered.length,  label: "AI answered",   color: GREEN },
    ...(todayOrders.length ? [{
      value: todayOrders.length,
      label: pendingCount > 0 ? `orders · ${pendingCount} pending` : "orders",
      color: pendingCount > 0 ? AMBER : TEAL,
    }] : []),
    ...(revenue > 0 ? [{ value: `₹${Math.round(revenue)}`, label: "from orders", color: GREEN }] : []),
  ]

  return (
    <div
      className="rounded-2xl px-5 py-3 flex items-center gap-6 flex-wrap"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
    >
      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: TEXT_FAINT }}>Today</span>
      {stats.map((s, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
          <span className="text-xs" style={{ color: TEXT_FAINT }}>{s.label}</span>
        </div>
      ))}
    </div>
  )
}

// ── Order card ────────────────────────────────────────────────────────
function OrderCard({ order, onStatusUpdate }) {
  const [updating, setUpdating] = useState(false)

  const color   = ORDER_STATUS_COLOR[order.status] ?? TEXT_FAINT
  const items   = order.items ?? []
  const displayId = order.notes?.startsWith("RET-") ? order.notes : `RET-${order.id.slice(0, 8).toUpperCase()}`
  const action  = NEXT_ACTION[order.status]

  const handleAction = async () => {
    if (!action || updating) return
    setUpdating(true)
    try { await onStatusUpdate(order.id, action.next) }
    finally { setUpdating(false) }
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden transition-all"
      style={{
        background: CARD_BG,
        border: `1px solid ${CARD_BORDER}`,
        borderLeftWidth: "3px",
        borderLeftColor: color,
      }}
    >
      {/* Ping dot for pending */}
      {order.status === "pending" && (
        <span className="absolute top-3.5 right-4 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: AMBER }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: AMBER }} />
        </span>
      )}

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold" style={{ color: TEXT }}>{displayId}</span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: `${color}18`, color }}
            >
              {order.status}
            </span>
          </div>
          <div className="text-right flex-shrink-0">
            {order.total_amount && (
              <div className="text-sm font-bold" style={{ color: TEXT }}>₹{Math.round(order.total_amount)}</div>
            )}
            <div className="text-[10px]" style={{ color: TEXT_FAINT }}>
              {new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="text-xs mb-3" style={{ color: TEXT_MUTED }}>
          {items.map(i => `${i.itemName} ×${i.quantity}`).join("  ·  ") || "—"}
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between gap-3">
          {order.caller_phone && (
            <span className="text-[10px] font-mono" style={{ color: TEXT_FAINT }}>{order.caller_phone}</span>
          )}
          {action && (
            <button
              onClick={handleAction}
              disabled={updating}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: action.bg }}
            >
              {updating && <Loader2 className="w-3 h-3 animate-spin" />}
              {action.label}
            </button>
          )}
          {!action && ["delivered", "cancelled"].includes(order.status) && (
            <span className="ml-auto text-[10px] font-medium" style={{ color: TEXT_FAINT }}>
              {order.status === "cancelled" ? "Cancelled" : "Delivered"}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Voice order queue ─────────────────────────────────────────────────
function VoiceOrderQueue({ orders, onStatusUpdate, lastRefreshed }) {
  const active = orders.filter(o => !["delivered", "cancelled"].includes(o.status))
  const done   = orders.filter(o =>  ["delivered", "cancelled"].includes(o.status)).slice(0, 5)

  if (!orders.length) return null

  const pendingCount = active.filter(o => o.status === "pending").length

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: TEXT_FAINT }}>
            Voice Orders
          </h2>
          {pendingCount > 0 && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `${AMBER}18`, color: AMBER }}
            >
              {pendingCount} pending
            </span>
          )}
        </div>
        {lastRefreshed && (
          <span className="text-[10px]" style={{ color: TEXT_FAINT }}>
            {new Date(lastRefreshed).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>

      {active.length === 0 ? (
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          <CheckCircle2 className="w-6 h-6 mx-auto mb-2" style={{ color: GREEN }} />
          <p className="text-sm font-semibold" style={{ color: TEXT }}>All caught up</p>
          <p className="text-xs mt-0.5" style={{ color: TEXT_FAINT }}>No pending orders right now</p>
        </div>
      ) : (
        <div className="space-y-3">
          {active.map(order => (
            <OrderCard key={order.id} order={order} onStatusUpdate={onStatusUpdate} />
          ))}
        </div>
      )}

      {/* Completed orders (compact) */}
      {done.length > 0 && (
        <div className="mt-4">
          <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: TEXT_FAINT }}>
            Completed · {done.length}
          </span>
          <div
            className="mt-2 rounded-2xl overflow-hidden"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
          >
            {done.map((o, i) => {
              const did = o.notes?.startsWith("RET-") ? o.notes : `RET-${o.id.slice(0, 8).toUpperCase()}`
              const c   = ORDER_STATUS_COLOR[o.status] ?? TEXT_FAINT
              return (
                <div
                  key={o.id}
                  className="flex items-center gap-3 px-4 py-2.5"
                  style={{ borderBottom: i < done.length - 1 ? `1px solid ${CARD_BORDER}` : "none" }}
                >
                  <span className="text-[10px] font-mono font-semibold w-28 flex-shrink-0" style={{ color: TEXT_FAINT }}>{did}</span>
                  <span className="flex-1 text-[10px] truncate" style={{ color: TEXT_FAINT }}>
                    {(o.items ?? []).map(i => i.itemName).join(", ")}
                  </span>
                  <span className="text-[10px] font-medium flex-shrink-0" style={{ color: c }}>{o.status}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Missed calls ──────────────────────────────────────────────────────
function MissedCalls({ calls, onCallBack }) {
  if (!calls.length) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: TEXT_FAINT }}>Missed Calls</h2>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: `${RED}12`, color: RED }}
        >
          {calls.length}
        </span>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
        {calls.map((call, i) => (
          <div
            key={call.id}
            className="flex items-center gap-4 px-5 py-3.5"
            style={{ borderBottom: i < calls.length - 1 ? `1px solid ${CARD_BORDER}` : "none" }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${RED}12`, color: RED }}
            >
              <PhoneMissed className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium font-mono" style={{ color: TEXT }}>
                {call.caller_number ?? "Unknown"}
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: TEXT_FAINT }}>
                {new Date(call.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            {call.caller_number && (
              <button
                onClick={() => onCallBack(call.caller_number.replace(/^\+91/, ""))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80 flex-shrink-0"
                style={{ background: `${BLUE}12`, color: BLUE }}
              >
                <ArrowUpRight className="w-3 h-3" />
                Call Back
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── AI Receptionist (compact widget) ─────────────────────────────────
function AgentWidget({ agents, numbers, locations, onEdit, onDelete, onAdd }) {
  const getPhone = (agent) => numbers.find(n => n.location_id === agent.location_id) ?? null

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: TEXT_FAINT }}>
          AI Receptionist
        </h2>
        {agents.length > 0 && (
          <button
            onClick={onAdd}
            disabled={locations.length === 0}
            className="flex items-center gap-1 text-[10px] font-semibold transition-all hover:opacity-80 disabled:opacity-40"
            style={{ color: BLUE }}
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        )}
      </div>

      {agents.length === 0 ? (
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: CARD_BG, border: `1px dashed ${CARD_BORDER}` }}
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: `${BLUE}12` }}
          >
            <Mic className="w-5 h-5" style={{ color: BLUE }} />
          </div>
          <h3 className="text-sm font-semibold mb-1" style={{ color: TEXT }}>No AI agent yet</h3>
          <p className="text-xs mb-4 max-w-xs mx-auto" style={{ color: TEXT_MUTED }}>
            Answers every call 24/7 in Hindi, English, Telugu, Tamil, Kannada. Takes orders, books tables.
          </p>
          <button
            onClick={onAdd}
            disabled={locations.length === 0}
            className="px-4 py-2 rounded-xl text-white text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: BLUE }}
          >
            Provision first agent
          </button>
          {locations.length === 0 && (
            <p className="mt-2 text-[11px]" style={{ color: TEXT_FAINT }}>Connect a GMB location first</p>
          )}
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
          {agents.map((agent, i) => {
            const phone       = getPhone(agent)
            const statusColor = agent.status === "active" ? GREEN : TEXT_FAINT

            return (
              <div
                key={agent.id}
                className="flex items-center gap-3 px-5 py-3.5"
                style={{ borderBottom: i < agents.length - 1 ? `1px solid ${CARD_BORDER}` : "none" }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: statusColor }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold truncate" style={{ color: TEXT }}>
                      {agent.restaurant_name}
                    </span>
                    <span className="text-[10px] flex-shrink-0" style={{ color: TEXT_FAINT }}>
                      {agent.primary_language?.toUpperCase()}
                    </span>
                  </div>
                  {phone && (
                    <div className="text-[10px] font-mono mt-0.5" style={{ color: TEXT_FAINT }}>
                      {phone.phone_number}
                      {phone.sip_configured && (
                        <span className="ml-1.5" style={{ color: GREEN }}>· SIP live</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button
                    onClick={() => onEdit(agent)}
                    className="p-1.5 rounded-lg transition-all hover:bg-black/5"
                    style={{ color: TEXT_FAINT }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(agent.location_id)}
                    className="p-1.5 rounded-lg transition-all hover:bg-red-50"
                    style={{ color: TEXT_FAINT }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Call row ──────────────────────────────────────────────────────────
function CallRow({ call }) {
  const [playerOpen, setPlayerOpen] = useState(false)
  const [audioUrl,   setAudioUrl]   = useState(null)
  const [loadingRec, setLoadingRec] = useState(false)

  const durationMin = Math.floor((call.duration_secs ?? 0) / 60)
  const durationSec = (call.duration_secs ?? 0) % 60
  const isMissed    = call.status === "missed"
  const hasRec      = Boolean(call.recording_url)

  const togglePlayer = async () => {
    if (playerOpen) { setPlayerOpen(false); return }
    if (!audioUrl) {
      setLoadingRec(true)
      try {
        const res = await api.get(`/v1/voice/calls/${call.id}/recording`)
        const url = res.data?.data?.url
        if (url) setAudioUrl(url)
      } catch {}
      finally { setLoadingRec(false) }
    }
    setPlayerOpen(true)
  }

  return (
    <div style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
      <div className="flex items-center gap-4 px-5 py-3.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: isMissed ? `${RED}12` : `${BLUE}10`, color: isMissed ? RED : BLUE }}
        >
          {isMissed ? <PhoneMissed className="w-3.5 h-3.5" /> : <PhoneCall className="w-3.5 h-3.5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium" style={{ color: TEXT }}>{call.caller_number ?? "Unknown"}</div>
          <div className="text-[10px] mt-0.5 truncate" style={{ color: TEXT_FAINT }}>
            {call.transcript_summary ?? call.status}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {call.order_placed && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: `${GREEN}15`, color: GREEN }}
            >
              Order
            </span>
          )}
          {/* Recording play button */}
          {hasRec && (
            <button
              onClick={togglePlayer}
              disabled={loadingRec}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all hover:opacity-80 disabled:opacity-50"
              style={{
                background: playerOpen ? `${BLUE}18` : `${BLUE}10`,
                color: BLUE,
              }}
              title="Play recording"
            >
              {loadingRec
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <Headphones className="w-3 h-3" />}
              {loadingRec ? "Loading…" : playerOpen ? "Close" : "Play"}
            </button>
          )}
          <div className="text-right">
            <div className="text-xs font-medium" style={{ color: isMissed ? RED : TEXT_MUTED }}>
              {durationMin}:{String(durationSec).padStart(2, "0")}
            </div>
            <div className="text-[10px]" style={{ color: TEXT_FAINT }}>
              {new Date(call.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Inline audio player */}
      {playerOpen && (
        <div
          className="px-5 pb-4 flex items-center gap-3"
          style={{ borderTop: `1px solid ${CARD_BORDER}` }}
        >
          {audioUrl ? (
            <>
              <audio
                src={audioUrl}
                controls
                autoPlay
                className="flex-1 h-8"
                style={{ accentColor: BLUE }}
              />
              <a
                href={audioUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-shrink-0 p-1.5 rounded-lg transition-all hover:bg-black/5"
                style={{ color: TEXT_FAINT }}
                title="Open in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </>
          ) : (
            <span className="text-xs" style={{ color: TEXT_FAINT }}>Recording unavailable</span>
          )}
        </div>
      )}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────
function FieldLabel({ children }) {
  return <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_MUTED }}>{children}</label>
}

function CultSelect({ value, onChange, placeholder, options, disabled }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none disabled:opacity-70"
      style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }}
    >
      {placeholder && !value && <option value="" disabled>{placeholder}</option>}
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

// ── Provision modal ───────────────────────────────────────────────────
function ProvisionModal({ locations, agent, onClose, onProvision }) {
  const isEdit = !!agent
  const [form, setForm] = useState({
    locationId:        agent?.location_id        ?? locations[0]?.google_location_id ?? "",
    restaurantName:    agent?.restaurant_name    ?? "",
    restaurantAddress: agent?.restaurant_address ?? "",
    restaurantHours:   agent?.restaurant_hours   ?? "",
    restaurantCuisine: agent?.restaurant_cuisine ?? "",
    restaurantPhone:   "",
    primaryLanguage:   agent?.primary_language   ?? "hi",
    menuText:          agent?.menu_text          ?? "",
  })
  const [stack, setStack]       = useState({ telephony: "plivo", stt: "aws", llm: "anthropic", tts: "polly" })
  const [catalog, setCatalog]   = useState(null)
  const [provisioning, setP]    = useState(false)
  const [error, setError]       = useState("")

  const set       = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setEngine = (d, v) => setStack(s => ({ ...s, [d]: v }))

  useEffect(() => {
    api.get("/v1/voice/providers/catalog").then(r => setCatalog(r.data?.data ?? r.data)).catch(() => {})
    api.get("/v1/voice/providers").then(r => {
      const p = r.data?.data ?? r.data
      if (p) setStack({
        telephony: p.telephony?.provider ?? "plivo",
        stt:       p.stt?.provider       ?? "aws",
        llm:       p.llm?.provider       ?? "anthropic",
        tts:       p.tts?.provider       ?? "polly",
      })
    }).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setP(true); setError("")
    try {
      await onProvision({
        ...form,
        providers: {
          telephony: { provider: stack.telephony },
          stt:       { provider: stack.stt },
          llm:       { provider: stack.llm },
          tts:       { provider: stack.tts },
        },
      })
      onClose()
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to provision agent")
    } finally { setP(false) }
  }

  const STACK_FIELDS = [
    { dim: "telephony", label: "Telephony" },
    { dim: "stt",       label: "Speech → Text" },
    { dim: "llm",       label: "Brain (LLM)" },
    { dim: "tts",       label: "Voice (TTS)" },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-y-auto"
        style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, maxHeight: "90vh" }}
      >
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: `1px solid ${CARD_BORDER}` }}
        >
          <div>
            <h2 className="text-base font-semibold" style={{ color: TEXT }}>
              {isEdit ? "Edit Voice Agent" : "Provision Voice Agent"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>
              Set up your AI receptionist and choose the engines it runs on
            </p>
          </div>
          <button onClick={onClose} style={{ color: TEXT_FAINT }}><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <AnimatedCard aria-label="Business profile">
            <AnimatedCardHeader>
              <AnimatedCardTitle>Business profile</AnimatedCardTitle>
              <AnimatedCardDescription>Your AI receptionist answers callers with this info.</AnimatedCardDescription>
            </AnimatedCardHeader>
            <AnimatedCardContent className="space-y-4">
              <div>
                <FieldLabel>Location</FieldLabel>
                <CultSelect
                  value={form.locationId}
                  onChange={(v) => set("locationId", v)}
                  placeholder="Select a location"
                  options={locations.map((l) => ({ value: l.google_location_id, label: l.name ?? l.title }))}
                />
              </div>
              <div>
                <FieldLabel>Store name *</FieldLabel>
                <AnimatedInput required value={form.restaurantName} onChange={(e) => set("restaurantName", e.target.value)} placeholder="Reliance Digital – Koramangala" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Store category</FieldLabel>
                  <AnimatedInput value={form.restaurantCuisine} onChange={(e) => set("restaurantCuisine", e.target.value)} placeholder="Restaurant, Pharmacy…" />
                </div>
                <div>
                  <FieldLabel>Phone</FieldLabel>
                  <AnimatedInput value={form.restaurantPhone} onChange={(e) => set("restaurantPhone", e.target.value)} placeholder="+919876543210" />
                </div>
              </div>
              <div>
                <FieldLabel>Address</FieldLabel>
                <AnimatedInput value={form.restaurantAddress} onChange={(e) => set("restaurantAddress", e.target.value)} placeholder="12, MG Road, Bengaluru" />
              </div>
              <div>
                <FieldLabel>Hours</FieldLabel>
                <AnimatedInput value={form.restaurantHours} onChange={(e) => set("restaurantHours", e.target.value)} placeholder="Mon–Sun 11am–11pm" />
              </div>
              <div>
                <FieldLabel>Primary language</FieldLabel>
                <CultSelect
                  value={form.primaryLanguage}
                  onChange={(v) => set("primaryLanguage", v)}
                  placeholder="Select a language"
                  options={[
                    { value: "hi", label: "Hindi" },
                    { value: "en", label: "English" },
                    { value: "ta", label: "Tamil" },
                    { value: "te", label: "Telugu" },
                    { value: "kn", label: "Kannada" },
                    { value: "mr", label: "Marathi" },
                  ]}
                />
              </div>
              <div>
                <FieldLabel>Menu / catalogue (optional)</FieldLabel>
                <AnimatedTextarea
                  rows={4}
                  value={form.menuText}
                  onChange={(e) => set("menuText", e.target.value)}
                  placeholder="Dishes, prices, return policy, FAQs…"
                />
              </div>
            </AnimatedCardContent>
          </AnimatedCard>

          <AnimatedCard aria-label="AI stack">
            <AnimatedCardHeader>
              <AnimatedCardTitle>AI stack</AnimatedCardTitle>
              <AnimatedCardDescription>Engines your receptionist runs on — switchable per call, no redeploy.</AnimatedCardDescription>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              <div className="grid grid-cols-2 gap-4">
                {STACK_FIELDS.map(({ dim, label }) => {
                  const wired  = catalog?.wired?.[dim]  ?? [stack[dim]]
                  const labels = catalog?.labels?.[dim] ?? {}
                  return (
                    <div key={dim}>
                      <FieldLabel>{label}</FieldLabel>
                      <CultSelect
                        value={stack[dim]}
                        onChange={(v) => setEngine(dim, v)}
                        placeholder={label}
                        disabled={wired.length <= 1}
                        options={wired.map((p) => ({ value: p, label: labels[p] ?? p }))}
                      />
                    </div>
                  )
                })}
              </div>
            </AnimatedCardContent>
          </AnimatedCard>

          {error && (
            <div className="flex items-center gap-2 text-xs p-3 rounded-xl" style={{ background: `${RED}10`, color: RED }}>
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <AnimatedButton type="submit" isLoading={provisioning} loadingText={isEdit ? "Saving…" : "Provisioning…"} className="w-full">
            {isEdit ? "Save changes" : "Provision Agent"}
          </AnimatedButton>
        </form>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────
export default function VoicePage() {
  const router    = useRouter()
  const dialerRef = useRef(null)

  const [agents,            setAgents]           = useState([])
  const [numbers,           setNumbers]          = useState([])
  const [calls,             setCalls]            = useState([])
  const [orders,            setOrders]           = useState([])
  const [locations,         setLocations]        = useState([])
  const [loading,           setLoading]          = useState(true)
  const [showProvision,     setShowProvision]    = useState(false)
  const [editingAgent,      setEditingAgent]     = useState(null)
  const [callbackNumber,    setCallbackNumber]   = useState("")
  const [ordersLastRefresh, setLastRefresh]      = useState(null)

  useEffect(() => {
    if (!localStorage.getItem("retilo_token")) { router.replace("/auth"); return }
    fetchAll()
  }, [router])

  // Live order polling — 30 s
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await api.get("/v1/voice/orders", { params: { limit: 50 } })
        setOrders(res.data?.data?.orders ?? [])
        setLastRefresh(Date.now())
      } catch {}
    }
    const id = setInterval(poll, 30_000)
    return () => clearInterval(id)
  }, [])

  // Live call polling — 60 s
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await api.get("/v1/voice/calls", { params: { limit: 20 } })
        setCalls(res.data?.calls ?? res.data?.data?.calls ?? [])
      } catch {}
    }
    const id = setInterval(poll, 60_000)
    return () => clearInterval(id)
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [agentRes, numbersRes, callsRes, ordersRes, locRes] = await Promise.allSettled([
        api.get("/v1/voice/agents"),
        api.get("/v1/voice/numbers"),
        api.get("/v1/voice/calls",   { params: { limit: 20 } }),
        api.get("/v1/voice/orders",  { params: { limit: 50 } }),
        api.get("/v1/gmb/locations"),
      ])
      if (agentRes.status   === "fulfilled") setAgents(agentRes.value.data?.agents    ?? agentRes.value.data?.data?.agents   ?? [])
      if (numbersRes.status === "fulfilled") setNumbers(numbersRes.value.data?.numbers ?? numbersRes.value.data?.data?.numbers ?? [])
      if (callsRes.status   === "fulfilled") setCalls(callsRes.value.data?.calls       ?? callsRes.value.data?.data?.calls    ?? [])
      if (ordersRes.status  === "fulfilled") {
        setOrders(ordersRes.value.data?.data?.orders ?? [])
        setLastRefresh(Date.now())
      }
      if (locRes.status === "fulfilled") setLocations(locRes.value.data?.data ?? locRes.value.data ?? [])
    } catch {}
    finally { setLoading(false) }
  }

  const handleProvision = async (form) => {
    await api.post("/v1/voice/agents/provision", form)
    await fetchAll()
  }

  const handleDeleteAgent = async (locationId) => {
    if (!confirm("Decommission this voice agent? This cannot be undone.")) return
    await api.delete(`/v1/voice/agents/${locationId}`)
    setAgents(prev => prev.filter(a => a.location_id !== locationId))
  }

  const handleOrderStatus = async (orderId, status) => {
    await api.patch(`/v1/voice/orders/${orderId}/status`, { status })
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
  }

  const handleCallBack = useCallback((number) => {
    setCallbackNumber(number)
    setTimeout(() => dialerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80)
  }, [])

  const missedCalls  = calls.filter(c => c.status === "missed")
  const answeredCalls = calls.filter(c => c.status !== "missed")

  return (
    <DashboardPageLayout
      title="Voice Intelligence"
      subtitle="Every call answered. Every missed call recovered. Orders placed in Hindi, Telugu, Tamil and more."
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/dashboard/voice/numbers")}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
            style={{ background: `${PINK}12`, color: PINK, border: `1px solid ${PINK}30` }}
          >
            <Hash className="w-3.5 h-3.5" />
            Get a number
          </button>
          <button
            onClick={() => { setEditingAgent(null); setShowProvision(true) }}
            disabled={locations.length === 0}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white text-xs font-semibold transition-all disabled:opacity-40 hover:opacity-90"
            style={{ background: BLUE }}
          >
            <Plus className="w-3.5 h-3.5" />
            New agent
          </button>
        </div>
      }
    >
      <div className="max-w-3xl mx-auto px-8 py-6 space-y-5">
        <ModuleHelper
          moduleKey="voice-ai-v1"
          title="Voice Intelligence — getting started"
          description="Provision a number for each location. The AI answers every call in Hindi, English, Telugu, Tamil, Kannada. Missed calls become bookings. Outbound dialer for follow-ups — right here."
          rimVariant="default"
        />

        {loading ? (
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-3 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }} />
              ))}
            </div>
            <div className="col-span-2">
              <div className="h-96 rounded-2xl animate-pulse" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }} />
            </div>
          </div>
        ) : (
          <>
            <TodayStrip calls={calls} orders={orders} />

            <div className="grid grid-cols-5 gap-4 items-start">
              {/* ── Left column ── */}
              <div className="col-span-3 space-y-5">
                <VoiceOrderQueue
                  orders={orders}
                  onStatusUpdate={handleOrderStatus}
                  lastRefreshed={ordersLastRefresh}
                />

                <MissedCalls calls={missedCalls} onCallBack={handleCallBack} />

                <AgentWidget
                  agents={agents}
                  numbers={numbers}
                  locations={locations}
                  onEdit={(a) => { setEditingAgent(a); setShowProvision(true) }}
                  onDelete={handleDeleteAgent}
                  onAdd={() => { setEditingAgent(null); setShowProvision(true) }}
                />

                {answeredCalls.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: TEXT_FAINT }}>
                      Recent Calls
                    </h2>
                    <div className="rounded-2xl overflow-hidden" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                      {answeredCalls.map(call => <CallRow key={call.id} call={call} />)}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Right column: Dialer ── */}
              <div className="col-span-2" ref={dialerRef}>
                <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: TEXT_FAINT }}>
                  Outbound Dialer
                </h2>
                <VoiceDialer initialNumber={callbackNumber} />
              </div>
            </div>
          </>
        )}
      </div>

      {showProvision && (
        <ProvisionModal
          locations={locations}
          agent={editingAgent}
          onClose={() => { setShowProvision(false); setEditingAgent(null) }}
          onProvision={handleProvision}
        />
      )}
    </DashboardPageLayout>
  )
}
