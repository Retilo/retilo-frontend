"use client"

// Lamatic-inspired left sidebar: draggable node palette + workflow list

import { useCallback, useState } from "react"
import { useReactFlow } from "@xyflow/react"
import {
  Star, Clock, Filter, SlidersHorizontal,
  Sparkles, Send, Bell, GitBranch, Timer, CheckCircle2,
  GripVertical, Plus, ChevronRight, ShoppingBag, Phone, MessageSquare,
  PhoneMissed, PhoneIncoming, XCircle, FileText,
} from "lucide-react"
import { type GmbNodeType, useWorkflowStore } from "../store/workflow-store"

const PINK    = "oklch(0.58 0.24 350)"
const ORANGE  = "#FC8019"
const GREEN   = "#25d366"
const VIOLET  = "#6366f1"
const BORDER  = "oklch(0.91 0.008 350)"
const TEXT    = "oklch(0.14 0.008 270)"
const TEXT_MUTED  = "oklch(0.55 0.008 270)"
const TEXT_FAINT  = "oklch(0.65 0.008 270)"
const SIDEBAR_BG  = "oklch(0.99 0.005 350)"
const ITEM_BG     = "oklch(1 0 0)"
const ITEM_BORDER = "oklch(0.92 0.007 350)"

interface NodeDef {
  type: GmbNodeType
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  category: "Swiggy" | "Voice" | "WhatsApp" | "Google" | "Logic"
}

const NODE_PALETTE: NodeDef[] = [
  // ── Swiggy ───────────────────────────────────────────────────
  { type: "trigger-swiggy-booking",   label: "Swiggy Booking",    description: "New booking via Dineout",         icon: ShoppingBag,     color: ORANGE,                   category: "Swiggy" },
  { type: "trigger-swiggy-cancelled", label: "Booking Cancelled",  description: "Guest cancelled a reservation",   icon: XCircle,         color: ORANGE,                   category: "Swiggy" },
  { type: "action-swiggy-confirm",    label: "Confirm Booking",    description: "Auto-confirm on Swiggy",          icon: CheckCircle2,    color: ORANGE,                   category: "Swiggy" },
  { type: "action-swiggy-reject",     label: "Reject Booking",     description: "Decline with reason",             icon: XCircle,         color: ORANGE,                   category: "Swiggy" },
  // ── Voice ────────────────────────────────────────────────────
  { type: "trigger-voice-inbound",    label: "Incoming Call",      description: "AI receptionist answered",        icon: PhoneIncoming,   color: VIOLET,                   category: "Voice" },
  { type: "trigger-voice-missed",     label: "Missed Call",        description: "Unanswered — trigger follow-up",  icon: PhoneMissed,     color: VIOLET,                   category: "Voice" },
  { type: "action-voice-callback",    label: "Outbound Call",      description: "AI calls the guest back",         icon: Phone,           color: VIOLET,                   category: "Voice" },
  // ── WhatsApp ─────────────────────────────────────────────────
  { type: "trigger-whatsapp-message", label: "WhatsApp Message",   description: "New message in inbox",            icon: MessageSquare,   color: GREEN,                    category: "WhatsApp" },
  { type: "action-send-whatsapp",     label: "Send WhatsApp",      description: "Message / template to guest",     icon: Send,            color: GREEN,                    category: "WhatsApp" },
  // ── Google ───────────────────────────────────────────────────
  { type: "trigger-new-review",       label: "New Review",         description: "New Google Business review",      icon: Star,            color: PINK,                     category: "Google" },
  { type: "trigger-schedule",         label: "Schedule",           description: "Cron / time-based trigger",       icon: Clock,           color: "oklch(0.58 0.20 55)",   category: "Google" },
  { type: "ai-draft-reply",           label: "AI Reply",           description: "Draft reply with brand voice",    icon: Sparkles,        color: PINK,                     category: "Google" },
  { type: "post-reply",               label: "Post GMB Reply",     description: "Publish to Google Business",      icon: Send,            color: "oklch(0.52 0.18 160)",  category: "Google" },
  { type: "action-gmb-post",          label: "GMB Update Post",    description: "Create a Google post",            icon: FileText,        color: "oklch(0.52 0.18 160)",  category: "Google" },
  // ── Logic ────────────────────────────────────────────────────
  { type: "filter-rating",            label: "Filter Rating",      description: "By star rating",                  icon: Filter,          color: "oklch(0.55 0.20 310)",  category: "Logic" },
  { type: "filter-keyword",           label: "Filter Keyword",     description: "Match text in content",           icon: SlidersHorizontal,color:"oklch(0.55 0.20 310)", category: "Logic" },
  { type: "branch",                   label: "Branch",             description: "Conditional split",               icon: GitBranch,       color: "oklch(0.55 0.22 280)",  category: "Logic" },
  { type: "delay",                    label: "Delay",              description: "Wait X minutes",                  icon: Timer,           color: "oklch(0.55 0.22 280)",  category: "Logic" },
  { type: "send-notification",        label: "Notify Team",        description: "Email / Slack / in-app",          icon: Bell,            color: "oklch(0.58 0.20 55)",   category: "Logic" },
  { type: "output",                   label: "Done",               description: "Agent handled it",                icon: CheckCircle2,    color: "oklch(0.52 0.18 160)",  category: "Logic" },
]

const CATEGORIES: { id: NodeDef["category"]; emoji: string }[] = [
  { id: "Swiggy",   emoji: "🛵" },
  { id: "Voice",    emoji: "🎙" },
  { id: "WhatsApp", emoji: "💬" },
  { id: "Google",   emoji: "⭐" },
  { id: "Logic",    emoji: "⚙️" },
]

function NodePaletteItem({ node }: { node: NodeDef }) {
  const { screenToFlowPosition } = useReactFlow()
  const addNode = useWorkflowStore((s) => s.addNode)

  const onClick = useCallback(() => {
    const pos = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    addNode(node.type, pos)
  }, [node.type, addNode, screenToFlowPosition])

  const onDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData("application/gmb-node", node.type)
    e.dataTransfer.effectAllowed = "move"
  }, [node.type])

  const Icon = node.icon

  return (
    <div
      draggable
      onClick={onClick}
      onDragStart={onDragStart}
      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-grab active:cursor-grabbing transition-all hover:shadow-sm hover:-translate-y-px"
      style={{ background: ITEM_BG, border: `1px solid ${ITEM_BORDER}` }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${node.color}12`, color: node.color }}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium truncate" style={{ color: TEXT }}>{node.label}</div>
        <div className="text-[10px] truncate" style={{ color: TEXT_FAINT }}>{node.description}</div>
      </div>
      <GripVertical className="w-3.5 h-3.5 flex-shrink-0 opacity-30 group-hover:opacity-60" style={{ color: TEXT_MUTED }} />
    </div>
  )
}

export function WorkflowSidebar() {
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    new Set(["Swiggy", "Voice", "WhatsApp"])
  )
  const workflowName = useWorkflowStore((s) => s.workflowName)
  const setWorkflowName = useWorkflowStore((s) => s.setWorkflowName)
  const [editingName, setEditingName] = useState(false)

  const toggleCategory = (cat: string) =>
    setOpenCategories((prev) => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })

  return (
    <div
      className="w-64 flex-shrink-0 flex flex-col overflow-hidden"
      style={{ background: SIDEBAR_BG, borderRight: `1px solid ${BORDER}` }}
    >
      {/* Header */}
      <div className="px-4 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: PINK }}>
            <span className="text-white font-black text-[10px]">R</span>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: TEXT_FAINT }}>Workflows</span>
        </div>
        {editingName ? (
          <input
            autoFocus
            className="w-full mt-2 rounded-lg px-2.5 py-1.5 text-sm outline-none"
            style={{
              background: "oklch(0.96 0.005 350)",
              border: `1px solid ${PINK}50`,
              color: TEXT,
            }}
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="mt-2 w-full text-left text-sm font-semibold truncate px-0.5 transition-colors hover:opacity-75"
            style={{ color: TEXT }}
            title="Click to rename"
          >
            {workflowName}
          </button>
        )}
      </div>

      {/* Node palette */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        <div className="text-[10px] font-bold uppercase tracking-widest px-1 mb-1" style={{ color: TEXT_FAINT }}>
          Drag nodes onto canvas
        </div>

        {CATEGORIES.map(({ id: cat, emoji }) => {
          const nodes = NODE_PALETTE.filter((n) => n.category === cat)
          const isOpen = openCategories.has(cat)
          return (
            <div key={cat}>
              <button
                onClick={() => toggleCategory(cat)}
                className="flex items-center gap-1.5 w-full px-1 py-1 text-[11px] font-semibold transition-colors hover:opacity-75"
                style={{ color: TEXT_MUTED }}
              >
                <ChevronRight
                  className={`w-3 h-3 transition-transform ${isOpen ? "rotate-90" : ""}`}
                />
                <span>{emoji}</span>
                {cat}
              </button>
              {isOpen && (
                <div className="mt-1.5 space-y-1.5">
                  {nodes.map((n) => <NodePaletteItem key={n.type} node={n} />)}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-3 py-3" style={{ borderTop: `1px solid ${BORDER}` }}>
        <button
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed text-xs font-medium transition-all hover:opacity-75"
          style={{ borderColor: `${PINK}30`, color: TEXT_FAINT }}
        >
          <Plus className="w-3.5 h-3.5" />
          New workflow
        </button>
      </div>
    </div>
  )
}
