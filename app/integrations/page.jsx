"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  MapPin, MessageCircle, Mail, Check, ArrowRight,
  RefreshCw, AlertCircle, ExternalLink, Plug,
  Activity, Zap,
} from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"

const TEXT  = "oklch(0.14 0.008 270)"
const MUTED = "oklch(0.55 0.008 270)"
const FAINT = "oklch(0.70 0.008 270)"
const CARD  = "oklch(1 0 0)"
const BORDER= "oklch(0.91 0.008 270)"
const PINK  = "oklch(0.58 0.24 350)"
const BG    = "oklch(0.97 0.003 270)"

// ── Integration card ───────────────────────────────────────────
function IntegrationCard({ integration }) {
  const { name, description, icon: Icon, color, status, meta, actions } = integration

  const statusConfig = {
    connected: { label: "Connected",    dot: "bg-emerald-500",   text: "oklch(0.42 0.18 145)", bg: "oklch(0.50 0.18 145 / 10%)" },
    partial:   { label: "Partial",      dot: "bg-amber-500",     text: "oklch(0.55 0.20 65)",  bg: "oklch(0.60 0.20 65 / 10%)"  },
    disconnected: { label: "Not connected", dot: "bg-slate-300", text: FAINT,                  bg: "oklch(0.93 0.005 270)"       },
  }[status] ?? { label: status, dot: "bg-slate-300", text: FAINT, bg: "oklch(0.93 0.005 270)" }

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all hover:shadow-md"
      style={{ background: CARD, border: `1px solid ${BORDER}` }}
    >
      {/* Header strip */}
      <div
        className="h-1.5"
        style={{ background: status === "connected" ? color : "oklch(0.92 0.005 270)" }}
      />

      <div className="p-6">
        {/* Icon + status */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="size-12 rounded-2xl flex items-center justify-center"
            style={{ background: `${color}15` }}
          >
            <Icon className="size-6" style={{ color }} />
          </div>
          <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{ color: statusConfig.text, background: statusConfig.bg }}
          >
            <span className={`size-1.5 rounded-full ${statusConfig.dot}`} />
            {statusConfig.label}
          </span>
        </div>

        {/* Name + desc */}
        <h3 className="text-base font-bold mb-1" style={{ color: TEXT }}>{name}</h3>
        <p className="text-[13px] leading-relaxed mb-4" style={{ color: MUTED }}>{description}</p>

        {/* Meta rows */}
        {meta && meta.length > 0 && (
          <div
            className="rounded-xl p-3 mb-4 space-y-1.5"
            style={{ background: BG, border: `1px solid ${BORDER}` }}
          >
            {meta.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-xs">
                <span style={{ color: FAINT }}>{label}</span>
                <span className="font-medium" style={{ color: TEXT }}>{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              disabled={action.loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-85 disabled:opacity-60"
              style={action.primary
                ? { background: color, color: "white" }
                : { border: `1px solid ${BORDER}`, background: CARD, color: MUTED }
              }
            >
              {action.loading ? <RefreshCw className="size-3.5 animate-spin" /> : action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Event flow diagram ─────────────────────────────────────────
function EventFlow() {
  const sources = [
    { label: "GMB Reviews",   color: "#4285F4" },
    { label: "GMB Messages",  color: "#34A853" },
    { label: "WhatsApp",      color: "#25D366" },
    { label: "Email",         color: "#8B5CF6" },
  ]
  const destinations = [
    { label: "Event Feed",      href: "/ops" },
    { label: "Conversations",   href: "/ops/conversations" },
    { label: "AI Actions",      href: "/ops/agents" },
  ]

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: CARD, border: `1px solid ${BORDER}` }}
    >
      <div className="flex items-center gap-2 mb-5">
        <Activity className="size-4" style={{ color: PINK }} />
        <span className="text-sm font-bold" style={{ color: TEXT }}>How events flow</span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto">
        {/* Sources */}
        <div className="flex flex-col gap-2 shrink-0">
          {sources.map(s => (
            <div
              key={s.label}
              className="px-3 py-2 rounded-xl text-[12px] font-medium"
              style={{ background: `${s.color}12`, color: s.color, border: `1px solid ${s.color}25` }}
            >
              {s.label}
            </div>
          ))}
        </div>

        {/* Arrow */}
        <div className="flex-1 relative flex items-center justify-center min-w-16">
          <div className="w-full h-px" style={{ background: `${PINK}40` }} />
          <div
            className="absolute px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide"
            style={{ background: `${PINK}12`, color: PINK, border: `1px solid ${PINK}30` }}
          >
            <Zap className="size-3 inline mr-0.5" />
            Retilo
          </div>
        </div>

        {/* Destinations */}
        <div className="flex flex-col gap-2 shrink-0">
          {destinations.map(d => (
            <Link
              key={d.label}
              href={d.href}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-medium transition-all hover:opacity-75"
              style={{ background: `${PINK}10`, color: PINK, border: `1px solid ${PINK}25` }}
            >
              {d.label}
              <ArrowRight className="size-3 ml-auto" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────
export default function IntegrationsPage() {
  const router = useRouter()
  const [locations, setLocations]   = useState([])
  const [loadingGMB, setLoadingGMB] = useState(true)
  const [syncingGMB, setSyncingGMB] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem("retilo_token")) { router.replace("/auth"); return }
    api.get("/v1/gmb/locations")
      .then(res => setLocations(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingGMB(false))
  }, [router])

  const syncGMB = async () => {
    setSyncingGMB(true)
    try {
      await api.post("/v1/gmb/reviews/sync/all")
    } finally {
      setSyncingGMB(false)
    }
  }

  const gmbStatus = loadingGMB ? "partial" : locations.length > 0 ? "connected" : "disconnected"

  const INTEGRATIONS = [
    {
      name: "Google Business Profile",
      description: "Reviews and messages from your Google Business locations flow directly into your Event Feed and Conversations.",
      icon: MapPin,
      color: "#4285F4",
      status: gmbStatus,
      meta: locations.length > 0 ? [
        { label: "Locations connected", value: locations.length },
        { label: "Avg rating",          value: locations.length ? (locations.reduce((s, l) => s + (l.average_rating ?? 0), 0) / locations.length).toFixed(1) : "—" },
        { label: "Total reviews",       value: locations.reduce((s, l) => s + (l.total_review_count ?? 0), 0).toLocaleString() },
        { label: "Events route to",     value: "Event Feed + AI Panel" },
      ] : [],
      actions: [
        gmbStatus === "connected"
          ? {
              label: "Sync now",
              icon: <RefreshCw className="size-3.5" />,
              onClick: syncGMB,
              loading: syncingGMB,
              primary: false,
            }
          : {
              label: "Connect Google Business",
              icon: <ExternalLink className="size-3.5" />,
              onClick: () => router.push("/onboarding"),
              primary: true,
            },
        gmbStatus === "connected" && {
          label: "View events",
          icon: <Activity className="size-3.5" />,
          onClick: () => router.push("/ops"),
          primary: true,
        },
      ].filter(Boolean),
    },
    {
      name: "WhatsApp Business",
      description: "Receive and reply to WhatsApp messages in Conversations. AI can draft responses automatically.",
      icon: MessageCircle,
      color: "#25D366",
      status: "disconnected",
      meta: [],
      actions: [
        {
          label: "Connect WhatsApp",
          icon: <ExternalLink className="size-3.5" />,
          onClick: () => {},
          primary: true,
        },
        {
          label: "Learn more",
          icon: <ArrowRight className="size-3.5" />,
          onClick: () => {},
          primary: false,
        },
      ],
    },
    {
      name: "Email",
      description: "Connect your business email to receive and send emails directly from the Conversations view.",
      icon: Mail,
      color: "#8B5CF6",
      status: "disconnected",
      meta: [],
      actions: [
        {
          label: "Connect Email",
          icon: <ExternalLink className="size-3.5" />,
          onClick: () => {},
          primary: true,
        },
        {
          label: "Learn more",
          icon: <ArrowRight className="size-3.5" />,
          onClick: () => {},
          primary: false,
        },
      ],
    },
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: BG }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-3 border-b shrink-0"
        style={{ background: CARD, borderColor: BORDER }}
      >
        <Plug className="size-4" style={{ color: PINK }} />
        <span className="text-sm font-bold" style={{ color: TEXT }}>Integrations</span>
        <span className="text-xs" style={{ color: MUTED }}>
          — Connect your event sources
        </span>
        <Link
          href="/ops"
          className="ml-auto flex items-center gap-1.5 text-xs font-medium transition-all hover:opacity-75"
          style={{ color: PINK }}
        >
          <Activity className="size-3.5" />
          Go to Ops
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl space-y-6">

          {/* Event flow */}
          <EventFlow />

          {/* Integration cards */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: FAINT }}>
              Connected sources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {INTEGRATIONS.map(i => (
                <IntegrationCard key={i.name} integration={i} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
