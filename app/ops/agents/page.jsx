"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Bot, Plus, Trash2, Play, Pause, MoreHorizontal,
  Zap, ChevronRight, X, Check, AlertCircle, Loader2,
} from "lucide-react"
import { api } from "@/lib/api"

const TEXT  = "oklch(0.14 0.008 270)"
const MUTED = "oklch(0.55 0.008 270)"
const FAINT = "oklch(0.70 0.008 270)"
const CARD  = "oklch(1 0 0)"
const BORDER= "oklch(0.91 0.008 270)"
const PINK  = "oklch(0.58 0.24 350)"
const BG    = "oklch(0.97 0.003 270)"

// ── Trigger / action type labels ───────────────────────────────
const TRIGGER_LABELS = {
  gmb_new_review:   "New GMB Review",
  gmb_new_message:  "New GMB Message",
  manual:           "Manual trigger",
  schedule:         "Scheduled",
}

const ACTION_LABELS = {
  send_email:        "Send Email",
  post_gmb_reply:    "Post GMB Reply",
  send_whatsapp:     "Send WhatsApp",
  run_workflow:      "Run Workflow",
  notify_slack:      "Notify Slack",
}

// ── Status badge ───────────────────────────────────────────────
function StatusBadge({ active }) {
  return (
    <span
      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={active
        ? { background: "oklch(0.50 0.18 145 / 12%)", color: "oklch(0.42 0.18 145)" }
        : { background: "oklch(0.92 0.005 270)", color: FAINT }
      }
    >
      <span className={`size-1.5 rounded-full ${active ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
      {active ? "Active" : "Paused"}
    </span>
  )
}

// ── Agent card ─────────────────────────────────────────────────
function AgentCard({ agent, onDelete, onToggle, onTest }) {
  const [testing, setTesting]   = useState(false)
  const [testResult, setResult] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const handleTest = async () => {
    setTesting(true)
    setResult(null)
    try {
      const res = await api.post(`/v1/agents/${agent.id}/test`, {})
      setResult({ ok: true, msg: res.data?.message ?? "Agent executed successfully." })
    } catch (err) {
      setResult({ ok: false, msg: err?.response?.data?.message ?? "Test failed." })
    } finally {
      setTesting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete agent "${agent.name}"?`)) return
    setDeleting(true)
    try {
      await api.delete(`/v1/agents/${agent.id}`)
      onDelete(agent.id)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all hover:shadow-sm"
      style={{ background: CARD, border: `1px solid ${BORDER}` }}
    >
      <div className="flex items-start gap-4 p-5">
        {/* Icon */}
        <div
          className="size-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${PINK}12` }}
        >
          <Bot className="size-5" style={{ color: PINK }} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-semibold" style={{ color: TEXT }}>{agent.name}</span>
            <StatusBadge active={agent.active} />
          </div>
          {agent.description && (
            <p className="text-xs mb-2" style={{ color: MUTED }}>{agent.description}</p>
          )}
          <div className="flex items-center gap-3 text-[11px]" style={{ color: FAINT }}>
            {agent.trigger_type && (
              <span className="flex items-center gap-1">
                <Zap className="size-3" />
                {TRIGGER_LABELS[agent.trigger_type] ?? agent.trigger_type}
              </span>
            )}
            {agent.action_type && (
              <span className="flex items-center gap-1">
                <ChevronRight className="size-3" />
                {ACTION_LABELS[agent.action_type] ?? agent.action_type}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onToggle(agent)}
            title={agent.active ? "Pause" : "Activate"}
            className="size-8 rounded-lg flex items-center justify-center transition-all hover:opacity-75"
            style={{ border: `1px solid ${BORDER}`, background: CARD, color: MUTED }}
          >
            {agent.active ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </button>
          <button
            onClick={handleTest}
            disabled={testing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-60 hover:opacity-75"
            style={{ border: `1px solid ${PINK}30`, background: `${PINK}08`, color: PINK }}
          >
            {testing ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
            {testing ? "Running…" : "Test"}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="size-8 rounded-lg flex items-center justify-center transition-all hover:bg-red-50 hover:text-red-500 disabled:opacity-60"
            style={{ border: `1px solid ${BORDER}`, background: CARD, color: FAINT }}
          >
            {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
          </button>
        </div>
      </div>

      {/* Test result */}
      {testResult && (
        <div
          className="flex items-start gap-2 mx-5 mb-4 px-3 py-2 rounded-xl text-xs"
          style={testResult.ok
            ? { background: "oklch(0.50 0.18 145 / 8%)", border: "1px solid oklch(0.50 0.18 145 / 25%)", color: "oklch(0.42 0.18 145)" }
            : { background: "oklch(0.577 0.245 27 / 8%)", border: "1px solid oklch(0.577 0.245 27 / 25%)", color: "oklch(0.45 0.20 27)" }
          }
        >
          {testResult.ok
            ? <Check className="size-3.5 shrink-0 mt-0.5" />
            : <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
          }
          {testResult.msg}
          <button className="ml-auto shrink-0" onClick={() => setResult(null)}>
            <X className="size-3" />
          </button>
        </div>
      )}
    </div>
  )
}

// ── Create modal ───────────────────────────────────────────────
function CreateModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    trigger_type: "gmb_new_review",
    action_type: "post_gmb_reply",
    active: true,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const handle = async () => {
    if (!form.name.trim()) { setError("Name is required."); return }
    setSaving(true)
    setError("")
    try {
      const res = await api.post("/v1/agents", form)
      onCreate(res.data.data ?? res.data)
      onClose()
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to create agent.")
    } finally {
      setSaving(false)
    }
  }

  const field = (label, key, type = "text", placeholder = "") => (
    <div>
      <label className="block text-[11px] font-semibold mb-1.5 uppercase tracking-wide" style={{ color: FAINT }}>
        {label}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{ background: BG, border: `1px solid ${BORDER}`, color: TEXT, fontFamily: "inherit" }}
        onFocus={e => e.target.style.borderColor = PINK}
        onBlur={e => e.target.style.borderColor = BORDER}
      />
    </div>
  )

  const select = (label, key, options) => (
    <div>
      <label className="block text-[11px] font-semibold mb-1.5 uppercase tracking-wide" style={{ color: FAINT }}>
        {label}
      </label>
      <select
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none appearance-none"
        style={{ background: BG, border: `1px solid ${BORDER}`, color: TEXT }}
      >
        {options.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
      </select>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "oklch(0.10 0.018 270 / 60%)" }}>
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: CARD }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: BORDER }}>
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl flex items-center justify-center" style={{ background: `${PINK}12` }}>
              <Bot className="size-4" style={{ color: PINK }} />
            </div>
            <span className="text-sm font-bold" style={{ color: TEXT }}>New Agent</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-black/5 transition-colors">
            <X className="size-4" style={{ color: FAINT }} />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          {field("Name", "name", "text", "e.g. Auto-reply to 1-star reviews")}
          {field("Description", "description", "text", "What does this agent do? (optional)")}
          {select("Trigger", "trigger_type", Object.entries(TRIGGER_LABELS))}
          {select("Action", "action_type", Object.entries(ACTION_LABELS))}

          {error && (
            <p className="text-xs flex items-center gap-1.5" style={{ color: "oklch(0.45 0.20 27)" }}>
              <AlertCircle className="size-3.5 shrink-0" />
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-6 py-4 border-t" style={{ borderColor: BORDER }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-75"
            style={{ border: `1px solid ${BORDER}`, color: MUTED }}
          >
            Cancel
          </button>
          <button
            onClick={handle}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: PINK }}
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {saving ? "Creating…" : "Create Agent"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────
export default function AgentsPage() {
  const router = useRouter()
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem("retilo_token")) { router.replace("/auth"); return }
    api.get("/v1/agents")
      .then(res => setAgents(res.data.data ?? res.data ?? []))
      .catch(() => setAgents([]))
      .finally(() => setLoading(false))
  }, [router])

  const handleToggle = async (agent) => {
    try {
      const res = await api.put(`/v1/agents/${agent.id}`, { active: !agent.active })
      const updated = res.data.data ?? res.data
      setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, active: !agent.active } : a))
    } catch {}
  }

  const handleDelete = (id) => setAgents(prev => prev.filter(a => a.id !== id))

  const handleCreate = (agent) => setAgents(prev => [agent, ...prev])

  const activeCount  = agents.filter(a => a.active).length

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: BG }}>
      {/* Toolbar */}
      <div
        className="flex items-center gap-3 px-5 py-3 border-b shrink-0"
        style={{ background: CARD, borderColor: BORDER }}
      >
        <span className="text-sm font-bold" style={{ color: TEXT }}>Agents</span>
        {!loading && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: `${PINK}12`, color: PINK }}>
            {activeCount} active
          </span>
        )}
        <button
          onClick={() => setShowCreate(true)}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-semibold transition-all hover:opacity-90"
          style={{ background: PINK }}
        >
          <Plus className="size-3.5" />
          New Agent
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {loading ? (
          <div className="space-y-3 max-w-3xl">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: CARD, border: `1px solid ${BORDER}` }} />
            ))}
          </div>
        ) : agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="size-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: `${PINK}10` }}
            >
              <Bot className="size-7" style={{ color: PINK }} />
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: TEXT }}>No agents yet</p>
            <p className="text-xs max-w-xs mb-5" style={{ color: MUTED }}>
              Create your first agent to automate responses to reviews, messages, and more.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all"
              style={{ background: PINK }}
            >
              <Plus className="size-4" />
              Create Agent
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl">
            {agents.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onDelete={handleDelete}
                onToggle={handleToggle}
                onTest={() => {}}
              />
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  )
}
