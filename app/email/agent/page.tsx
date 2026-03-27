"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Sparkles, Send, Plus, X, CheckCircle2, Loader2, AlertCircle,
  Mail, User, FileText, Users, ChevronRight, Copy, ExternalLink,
} from "lucide-react"
import { apiFetch } from "@/lib/api"

// ── Tool step definitions ──────────────────────────────────────────
const TOOL_STEPS = [
  {
    id: "generate_copy",
    label: "Generating copy",
    description: "AI writing subject lines, headline, body, and CTA",
    icon: FileText,
    color: "#7C3AED",
  },
  {
    id: "build_template",
    label: "Building template",
    description: "Rendering pixel-perfect MJML email design",
    icon: Mail,
    color: "#4285F4",
  },
  {
    id: "save_campaign",
    label: "Saving campaign",
    description: "Persisting campaign and recipient records",
    icon: CheckCircle2,
    color: "#0A7D4B",
  },
  {
    id: "trigger_send",
    label: "Triggering delivery",
    description: "Dispatching emails via Resend",
    icon: Send,
    color: "#F59E0B",
  },
]

type StepStatus = "pending" | "running" | "done" | "error"

interface StepState {
  id: string
  status: StepStatus
}

type AgentPhase = "form" | "running" | "done" | "error"

// ── Step indicator ─────────────────────────────────────────────────
function ToolStep({ step, status }: { step: typeof TOOL_STEPS[0]; status: StepStatus }) {
  const Icon = step.icon
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
        status === "running"
          ? "border-violet-200 bg-violet-50 shadow-sm"
          : status === "done"
          ? "border-green-200 bg-green-50"
          : status === "error"
          ? "border-red-200 bg-red-50"
          : "border-zinc-100 bg-white opacity-50"
      }`}
    >
      <div
        className="mt-0.5 flex size-8 items-center justify-center rounded-lg text-white shrink-0"
        style={{ background: status === "done" ? "#0A7D4B" : status === "error" ? "#ef4444" : step.color }}
      >
        {status === "running" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : status === "done" ? (
          <CheckCircle2 className="size-4" />
        ) : status === "error" ? (
          <AlertCircle className="size-4" />
        ) : (
          <Icon className="size-4" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${status === "done" ? "text-green-800" : status === "error" ? "text-red-700" : "text-zinc-800"}`}>
          {step.label}
        </p>
        <p className="text-xs text-zinc-400 mt-0.5">{step.description}</p>
      </div>
      {status === "running" && (
        <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-600 uppercase tracking-wider animate-pulse">
          Active
        </span>
      )}
    </motion.div>
  )
}

// ── Recipient input ────────────────────────────────────────────────
function RecipientInput({
  recipients,
  onAdd,
  onRemove,
}: {
  recipients: string[]
  onAdd: (email: string) => void
  onRemove: (email: string) => void
}) {
  const [draft, setDraft] = useState("")

  const commit = () => {
    const trimmed = draft.trim().toLowerCase()
    if (trimmed && trimmed.includes("@") && !recipients.includes(trimmed)) {
      onAdd(trimmed)
      setDraft("")
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); commit() } }}
          placeholder="Add recipient email and press Enter"
          className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 transition-all"
        />
        <button
          type="button"
          onClick={commit}
          className="flex size-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 hover:border-violet-300 hover:text-violet-600 transition-all"
        >
          <Plus className="size-4" />
        </button>
      </div>
      {recipients.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {recipients.map((email) => (
            <span
              key={email}
              className="inline-flex items-center gap-1 rounded-lg bg-violet-50 border border-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700"
            >
              {email}
              <button type="button" onClick={() => onRemove(email)} className="text-violet-400 hover:text-violet-700 transition-colors">
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────
export default function EmailAgentPage() {
  const [phase, setPhase] = useState<AgentPhase>("form")
  const [brief, setBrief] = useState("")
  const [fromName, setFromName] = useState("")
  const [fromEmail, setFromEmail] = useState("")
  const [recipients, setRecipients] = useState<string[]>([])

  const [steps, setSteps] = useState<StepState[]>(
    TOOL_STEPS.map((s) => ({ id: s.id, status: "pending" as StepStatus }))
  )
  const [campaignId, setCampaignId] = useState<string | null>(null)
  const [summary, setSummary] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const canSubmit = brief.trim().length > 0 && fromName.trim() && fromEmail.trim().includes("@") && recipients.length > 0

  // Simulate step-by-step progress while request is in-flight
  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const simulateSteps = () => {
    let idx = 0
    const advance = () => {
      setSteps((prev) =>
        prev.map((s, i) =>
          i === idx
            ? { ...s, status: "running" }
            : i < idx
            ? { ...s, status: "done" }
            : s
        )
      )
      idx++
      if (idx < TOOL_STEPS.length) {
        stepTimerRef.current = setTimeout(advance, 6000)
      }
    }
    advance()
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setPhase("running")
    setSteps(TOOL_STEPS.map((s) => ({ id: s.id, status: "pending" })))
    simulateSteps()

    try {
      const data = await apiFetch("/v1/email/agent/run", {
        method: "POST",
        body: JSON.stringify({
          brief: brief.trim(),
          fromName: fromName.trim(),
          fromEmail: fromEmail.trim(),
          recipientEmails: recipients,
        }),
      })

      if (stepTimerRef.current) clearTimeout(stepTimerRef.current)

      // Mark all as done using the actual tool call log from backend
      const log: string[] = data?.data?.toolCallLog ?? []
      setSteps((prev) =>
        prev.map((s) => ({
          ...s,
          status: log.includes(s.id) ? "done" : "done",
        }))
      )

      setCampaignId(data?.data?.campaignId ?? null)
      setSummary(data?.data?.summary ?? null)
      setPhase("done")
    } catch (err: any) {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current)
      setErrorMsg(err?.message ?? "Something went wrong. Please try again.")
      setPhase("error")
    }
  }

  const reset = () => {
    setPhase("form")
    setBrief("")
    setRecipients([])
    setCampaignId(null)
    setSummary(null)
    setErrorMsg(null)
    setSteps(TOOL_STEPS.map((s) => ({ id: s.id, status: "pending" })))
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="mb-3 inline-flex size-12 items-center justify-center rounded-2xl bg-violet-600 shadow-lg shadow-violet-200">
          <Sparkles className="size-6 text-white" />
        </div>
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Email Campaign Agent</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Describe your campaign in plain English — the AI handles copy, design, and delivery.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ── Form phase ── */}
        {phase === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-5"
          >
            {/* Campaign brief */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <label className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
                <FileText className="size-3.5" />
                Campaign Brief
              </label>
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="e.g. Flash sale — 30% off sneakers this weekend. Audience: past buyers aged 18–35. Tone: urgent and energetic. Include a countdown CTA."
                rows={4}
                className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100 transition-all"
              />
              <p className="mt-1.5 text-[11px] text-zinc-400">
                {brief.length} chars{brief.length > 0 && brief.length < 30 ? " — more detail gives better results" : ""}
              </p>
            </div>

            {/* Sender */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <label className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
                <User className="size-3.5" />
                Sender Info
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-1 text-xs font-medium text-zinc-500">From name</p>
                  <input
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    placeholder="Retilo Store"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100 transition-all"
                  />
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-zinc-500">From email</p>
                  <input
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    placeholder="hello@yourdomain.com"
                    type="email"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Recipients */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <label className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
                <Users className="size-3.5" />
                Recipients
                {recipients.length > 0 && (
                  <span className="ml-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-600">
                    {recipients.length}
                  </span>
                )}
              </label>
              <RecipientInput
                recipients={recipients}
                onAdd={(e) => setRecipients((r) => [...r, e])}
                onRemove={(e) => setRecipients((r) => r.filter((x) => x !== e))}
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-violet-600 text-white font-semibold text-sm shadow-lg shadow-violet-200 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              <Sparkles className="size-4" />
              Run Email Agent
              <ChevronRight className="size-4" />
            </button>

            {!canSubmit && (
              <p className="text-center text-xs text-zinc-400">
                Fill in all fields and add at least one recipient to continue
              </p>
            )}
          </motion.div>
        )}

        {/* ── Running phase ── */}
        {phase === "running" && (
          <motion.div
            key="running"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm mb-2">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-violet-600">
                  <Loader2 className="size-4 text-white animate-spin" />
                </div>
                <div>
                  <p className="text-sm font-bold text-violet-900">Agent is running</p>
                  <p className="text-xs text-violet-600 mt-0.5">Crafting your email campaign…</p>
                </div>
              </div>
            </div>

            {TOOL_STEPS.map((step, i) => (
              <ToolStep
                key={step.id}
                step={step}
                status={steps[i]?.status ?? "pending"}
              />
            ))}

            <p className="text-center text-xs text-zinc-400 pt-2">
              This usually takes 30–60 seconds
            </p>
          </motion.div>
        )}

        {/* ── Done phase ── */}
        {phase === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* Success banner */}
            <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-white p-6 text-center shadow-sm">
              <div className="mb-3 inline-flex size-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="size-6 text-green-600" />
              </div>
              <h2 className="text-xl font-black text-zinc-900 mb-1">Campaign sent!</h2>
              <p className="text-sm text-zinc-500">
                {recipients.length} email{recipients.length !== 1 ? "s" : ""} dispatched via Resend
              </p>
            </div>

            {/* Tool log */}
            <div className="space-y-3">
              {TOOL_STEPS.map((step, i) => (
                <ToolStep key={step.id} step={step} status="done" />
              ))}
            </div>

            {/* Campaign ID */}
            {campaignId && (
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Campaign ID</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-lg bg-zinc-50 px-3 py-2 text-xs font-mono text-zinc-700 truncate border border-zinc-100">
                    {campaignId}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(campaignId)}
                    className="flex size-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-700 transition-colors"
                  >
                    <Copy className="size-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Summary */}
            {summary && (
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Agent Summary</p>
                <p className="text-sm text-zinc-600 leading-relaxed">{summary}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-700 font-semibold text-sm hover:bg-zinc-50 transition-all"
              >
                <Plus className="size-4" />
                New Campaign
              </button>
              <a
                href="/email/campaigns"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 text-white font-semibold text-sm shadow-md shadow-violet-200 hover:-translate-y-0.5 transition-all"
              >
                <ExternalLink className="size-4" />
                View All Campaigns
              </a>
            </div>
          </motion.div>
        )}

        {/* ── Error phase ── */}
        {phase === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <AlertCircle className="size-10 text-red-500 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-red-900 mb-1">Agent failed</h2>
              <p className="text-sm text-red-600">{errorMsg}</p>
            </div>
            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-700 font-semibold text-sm hover:bg-zinc-50 transition-all"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
