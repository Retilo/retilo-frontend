"use client"

// Voice AI Phone Receptionist page
// Agents: GET /v1/voice/agents, POST /v1/voice/agents/provision, DELETE /v1/voice/agents/:locationId
// Calls:  GET /v1/voice/calls, GET /v1/voice/analytics
// Numbers: GET /v1/voice/numbers, POST /v1/voice/numbers

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Phone, PhoneCall, PhoneMissed, Mic, MicOff, Plus, Trash2,
  ChevronDown, X, Hash, BarChart2, Clock, TrendingUp,
  CheckCircle2, AlertCircle, Loader2, Radio,
} from "lucide-react"
import { DashboardPageLayout } from "@/components/dashboard/page-layout"
import { ModuleHelper } from "@/components/module-helper"
import { api } from "@/lib/api"

const PINK = "oklch(0.58 0.24 350)"
const BLUE = "oklch(0.52 0.20 255)"
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

// ── Stat tile ─────────────────────────────────────────────────────
function StatTile({ icon: Icon, label, value, sub, accent = BLUE }) {
  return (
    <div className="rounded-2xl p-5 flex items-start gap-4" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${accent}12`, color: accent }}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-xl font-bold" style={{ color: TEXT }}>{value ?? "—"}</div>
        <div className="text-xs font-medium mt-0.5" style={{ color: TEXT_MUTED }}>{label}</div>
        {sub && <div className="text-[10px] mt-0.5" style={{ color: TEXT_FAINT }}>{sub}</div>}
      </div>
    </div>
  )
}

// ── Agent card ────────────────────────────────────────────────────
function AgentCard({ agent, phoneNumber, onDelete }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Decommission this voice agent? This cannot be undone.")) return
    setDeleting(true)
    try { await onDelete(agent.location_id) } finally { setDeleting(false) }
  }

  const statusColor = agent.status === "active" ? GREEN : TEXT_FAINT
  const statusLabel = agent.status === "active" ? "Active" : agent.status

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all hover:shadow-sm"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
      onMouseEnter={e => e.currentTarget.style.borderColor = CARD_BORDER_HOVER}
      onMouseLeave={e => e.currentTarget.style.borderColor = CARD_BORDER}
    >
      <div className="flex items-start gap-4 p-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${BLUE}12`, color: BLUE }}>
          <Mic className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-semibold truncate" style={{ color: TEXT }}>{agent.restaurant_name}</h3>
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0"
              style={{ background: `${statusColor}15`, color: statusColor }}
            >
              <span className="w-1 h-1 rounded-full" style={{ background: statusColor }} />
              {statusLabel}
            </span>
          </div>
          <p className="text-xs font-mono" style={{ color: TEXT_FAINT }}>{agent.elevenlabs_agent_id}</p>
          <p className="text-[10px] mt-0.5" style={{ color: TEXT_FAINT }}>
            Lang: {agent.primary_language?.toUpperCase()} · Created {new Date(agent.created_at).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1.5 rounded-lg transition-all hover:bg-red-50 disabled:opacity-50 flex-shrink-0"
          style={{ color: TEXT_FAINT }}
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>

      {phoneNumber && (
        <div className="px-5 py-3 flex items-center gap-3" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
          <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: TEXT_FAINT }} />
          <span className="text-xs font-mono" style={{ color: TEXT_MUTED }}>{phoneNumber.phone_number}</span>
          <span
            className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full"
            style={{
              background: phoneNumber.sip_configured ? `${GREEN}15` : `${TEXT_FAINT}12`,
              color: phoneNumber.sip_configured ? GREEN : TEXT_FAINT,
            }}
          >
            {phoneNumber.sip_configured ? "SIP linked" : "SIP pending"}
          </span>
        </div>
      )}
    </div>
  )
}

// ── Call row ──────────────────────────────────────────────────────
function CallRow({ call }) {
  const durationMin = Math.floor((call.duration_secs ?? 0) / 60)
  const durationSec = (call.duration_secs ?? 0) % 60
  const statusColor = call.status === "completed" ? TEXT_MUTED : call.status === "missed" ? RED : TEXT_FAINT

  return (
    <div className="flex items-center gap-4 px-5 py-3.5" style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: call.status === "missed" ? `${RED}12` : `${BLUE}10`, color: call.status === "missed" ? RED : BLUE }}
      >
        {call.status === "missed" ? <PhoneMissed className="w-3.5 h-3.5" /> : <PhoneCall className="w-3.5 h-3.5" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium" style={{ color: TEXT }}>{call.caller_number ?? "Unknown"}</div>
        <div className="text-[10px] mt-0.5 truncate" style={{ color: TEXT_FAINT }}>
          {call.transcript_summary ?? call.status}
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 text-right">
        {call.order_placed && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${GREEN}15`, color: GREEN }}>
            Order placed
          </span>
        )}
        <div>
          <div className="text-xs font-medium" style={{ color: statusColor }}>
            {durationMin}:{String(durationSec).padStart(2, "0")}
          </div>
          <div className="text-[10px]" style={{ color: TEXT_FAINT }}>
            {new Date(call.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Provision agent modal ─────────────────────────────────────────
function ProvisionModal({ locations, onClose, onProvision }) {
  const [form, setForm] = useState({
    locationId: locations[0]?.google_location_id ?? "",
    restaurantName: "",
    restaurantAddress: "",
    restaurantHours: "",
    restaurantCuisine: "",
    restaurantPhone: "",
    primaryLanguage: "hi",
    menuText: "",
  })
  const [provisioning, setProvisioning] = useState(false)
  const [error, setError] = useState("")

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setProvisioning(true)
    setError("")
    try {
      await onProvision(form)
      onClose()
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to provision agent")
    } finally {
      setProvisioning(false)
    }
  }

  const inputStyle = { background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }
  const focusStyle = { borderColor: BLUE }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-y-auto"
        style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, maxHeight: "90vh" }}
      >
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
          <div>
            <h2 className="text-base font-semibold" style={{ color: TEXT }}>Provision Voice Agent</h2>
            <p className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>Sets up an ElevenLabs AI receptionist for your store</p>
          </div>
          <button onClick={onClose} style={{ color: TEXT_FAINT }}><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_MUTED }}>Location</label>
            <select
              value={form.locationId}
              onChange={e => set("locationId", e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
            >
              {locations.map(l => <option key={l.id} value={l.google_location_id}>{l.name ?? l.title}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_MUTED }}>Store name *</label>
            <input
              required value={form.restaurantName}
              onChange={e => set("restaurantName", e.target.value)}
              placeholder="Reliance Digital – Koramangala"
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
              onFocus={e => Object.assign(e.target.style, focusStyle)}
              onBlur={e => e.target.style.borderColor = INPUT_BORDER}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_MUTED }}>Store category</label>
              <input
                value={form.restaurantCuisine}
                onChange={e => set("restaurantCuisine", e.target.value)}
                placeholder="Electronics, Fashion, Pharmacy…"
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={inputStyle}
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e => e.target.style.borderColor = INPUT_BORDER}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_MUTED }}>Phone</label>
              <input
                value={form.restaurantPhone}
                onChange={e => set("restaurantPhone", e.target.value)}
                placeholder="+919876543210"
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={inputStyle}
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e => e.target.style.borderColor = INPUT_BORDER}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_MUTED }}>Address</label>
            <input
              value={form.restaurantAddress}
              onChange={e => set("restaurantAddress", e.target.value)}
              placeholder="12, MG Road, Bengaluru"
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
              onFocus={e => Object.assign(e.target.style, focusStyle)}
              onBlur={e => e.target.style.borderColor = INPUT_BORDER}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_MUTED }}>Hours</label>
            <input
              value={form.restaurantHours}
              onChange={e => set("restaurantHours", e.target.value)}
              placeholder="Mon–Sun 11am–11pm"
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
              onFocus={e => Object.assign(e.target.style, focusStyle)}
              onBlur={e => e.target.style.borderColor = INPUT_BORDER}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_MUTED }}>Primary language</label>
            <select
              value={form.primaryLanguage}
              onChange={e => set("primaryLanguage", e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
            >
              <option value="hi">Hindi</option>
              <option value="en">English</option>
              <option value="ta">Tamil</option>
              <option value="te">Telugu</option>
              <option value="kn">Kannada</option>
              <option value="mr">Marathi</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_MUTED }}>Product catalogue / FAQs (optional)</label>
            <textarea
              rows={4}
              value={form.menuText}
              onChange={e => set("menuText", e.target.value)}
              placeholder="Samsung Galaxy S24 – ₹74,999&#10;Return policy: 7 days&#10;EMI available on all products&#10;…"
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
              style={inputStyle}
              onFocus={e => Object.assign(e.target.style, focusStyle)}
              onBlur={e => e.target.style.borderColor = INPUT_BORDER}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs p-3 rounded-xl" style={{ background: `${RED}10`, color: RED }}>
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <p className="text-[10px]" style={{ color: TEXT_FAINT }}>
            Provisions an ElevenLabs AI agent and loads your knowledge base — takes 5–10 s. Don't close this dialog.
          </p>

          <button
            type="submit"
            disabled={provisioning}
            className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60 hover:opacity-90 flex items-center justify-center gap-2"
            style={{ background: BLUE }}
          >
            {provisioning ? <><Loader2 className="w-4 h-4 animate-spin" />Provisioning…</> : "Provision Agent"}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Analytics bar ─────────────────────────────────────────────────
function AnalyticsBar({ analytics }) {
  if (!analytics) return null
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatTile icon={PhoneCall} label="Total calls" value={analytics.totalCalls} accent={BLUE} />
      <StatTile icon={TrendingUp} label="Answer rate" value={`${analytics.answerRate}%`} sub={`${analytics.missedCalls} missed`} accent={GREEN} />
      <StatTile icon={Hash} label="Enquiries resolved" value={analytics.ordersPlaced} accent="oklch(0.62 0.20 50)" />
      <StatTile icon={Clock} label="Avg duration" value={`${analytics.avgDuration}s`} accent={PINK} />
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────
export default function VoicePage() {
  const router = useRouter()
  const [agents, setAgents] = useState([])
  const [numbers, setNumbers] = useState([])
  const [calls, setCalls] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showProvision, setShowProvision] = useState(false)
  const [callsLimit] = useState(20)

  useEffect(() => {
    if (!localStorage.getItem("retilo_token")) { router.replace("/auth"); return }
    fetchAll()
  }, [router])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [agentRes, numbersRes, callsRes, analyticsRes, locRes] = await Promise.allSettled([
        api.get("/v1/voice/agents"),
        api.get("/v1/voice/numbers"),
        api.get("/v1/voice/calls", { params: { limit: callsLimit } }),
        api.get("/v1/voice/analytics"),
        api.get("/v1/gmb/locations"),
      ])

      if (agentRes.status === "fulfilled") setAgents(agentRes.value.data?.data?.agents ?? [])
      if (numbersRes.status === "fulfilled") setNumbers(numbersRes.value.data?.data?.numbers ?? [])
      if (callsRes.status === "fulfilled") setCalls(callsRes.value.data?.data?.calls ?? [])
      if (analyticsRes.status === "fulfilled") setAnalytics(analyticsRes.value.data?.data)
      if (locRes.status === "fulfilled") setLocations(locRes.value.data?.data ?? [])
    } catch {}
    finally { setLoading(false) }
  }

  const handleProvision = async (form) => {
    await api.post("/v1/voice/agents/provision", form)
    await fetchAll()
  }

  const handleDeleteAgent = async (locationId) => {
    await api.delete(`/v1/voice/agents/${locationId}`)
    setAgents(prev => prev.filter(a => a.location_id !== locationId))
  }

  const getPhoneForAgent = (agent) =>
    numbers.find(n => n.location_id === agent.location_id) ?? null

  return (
    <DashboardPageLayout
      title="Voice AI"
      subtitle="AI phone receptionist for your stores — handles product queries, hours, directions and stock checks"
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
            onClick={() => setShowProvision(true)}
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
      <div className="max-w-3xl mx-auto px-8 py-6 space-y-8">
        <ModuleHelper
          moduleKey="voice-ai-v1"
          title="AI Phone Receptionist — getting started"
          description="Provision a phone number for each location and the AI answers 100% of calls — handling menu questions, store hours, directions, and order placement. Missed calls become revenue."
          rimVariant="default"
        />
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }} />
            ))}
          </div>
        ) : (
          <>
            {/* Analytics summary */}
            <AnalyticsBar analytics={analytics} />

            {/* Agents */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: TEXT_FAINT }}>
                  Voice Agents
                </h2>
                <span className="text-xs" style={{ color: TEXT_FAINT }}>{agents.length} active</span>
              </div>

              {agents.length === 0 ? (
                <div className="text-center py-14 rounded-2xl" style={{ border: `1px dashed ${CARD_BORDER}` }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${BLUE}12` }}>
                    <Mic className="w-7 h-7" style={{ color: BLUE }} />
                  </div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: TEXT }}>No voice agents yet</h3>
                  <p className="text-xs mb-6 max-w-xs mx-auto" style={{ color: TEXT_MUTED }}>
                    Provision an AI receptionist for your store — it answers calls 24/7, handles product queries, gives directions, and checks store hours.
                  </p>
                  <button
                    onClick={() => setShowProvision(true)}
                    disabled={locations.length === 0}
                    className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
                    style={{ background: BLUE }}
                  >
                    Provision first agent
                  </button>
                  {locations.length === 0 && (
                    <p className="mt-3 text-xs" style={{ color: TEXT_FAINT }}>Connect a GMB location first</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {agents.map(agent => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      phoneNumber={getPhoneForAgent(agent)}
                      onDelete={handleDeleteAgent}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Call history */}
            {calls.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: TEXT_FAINT }}>
                    Recent Calls
                  </h2>
                </div>
                <div className="rounded-2xl overflow-hidden" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                  {calls.map(call => (
                    <CallRow key={call.id} call={call} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showProvision && (
        <ProvisionModal
          locations={locations}
          onClose={() => setShowProvision(false)}
          onProvision={handleProvision}
        />
      )}
    </DashboardPageLayout>
  )
}
