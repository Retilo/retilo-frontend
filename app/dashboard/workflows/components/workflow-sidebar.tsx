"use client"

// Lamatic-inspired left sidebar: draggable node palette + workflow list

import { useCallback, useState } from "react"
import { useReactFlow } from "@xyflow/react"
import {
  Star, Clock, Filter, SlidersHorizontal,
  Sparkles, Send, Bell, GitBranch, Timer, CheckCircle2,
  GripVertical, Plus, ChevronRight,
} from "lucide-react"
import { type GmbNodeType, useWorkflowStore } from "../store/workflow-store"

const PINK = "oklch(0.58 0.24 350)"
const BORDER = "oklch(0.91 0.008 350)"
const TEXT = "oklch(0.14 0.008 270)"
const TEXT_MUTED = "oklch(0.55 0.008 270)"
const TEXT_FAINT = "oklch(0.65 0.008 270)"
const SIDEBAR_BG = "oklch(0.99 0.005 350)"
const ITEM_BG = "oklch(1 0 0)"
const ITEM_BORDER = "oklch(0.92 0.007 350)"

interface NodeDef {
  type: GmbNodeType
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  category: "Triggers" | "Logic" | "Actions"
}

const NODE_PALETTE: NodeDef[] = [
  // Triggers
  { type: "trigger-new-review",   label: "New Review",        description: "On any new GMB review",      icon: Star,              color: PINK,                      category: "Triggers" },
  { type: "trigger-schedule",     label: "Schedule",          description: "Cron / time-based trigger",   icon: Clock,             color: "oklch(0.58 0.20 55)",     category: "Triggers" },
  // Logic
  { type: "filter-rating",        label: "Filter Rating",     description: "By star rating threshold",    icon: Filter,            color: "oklch(0.55 0.20 310)",    category: "Logic" },
  { type: "filter-keyword",       label: "Filter Keyword",    description: "By keyword in review text",   icon: SlidersHorizontal, color: "oklch(0.55 0.20 310)",    category: "Logic" },
  { type: "branch",               label: "Branch",            description: "Conditional split",           icon: GitBranch,         color: "oklch(0.55 0.22 280)",    category: "Logic" },
  { type: "delay",                label: "Delay",             description: "Wait X minutes/hours",        icon: Timer,             color: "oklch(0.55 0.22 280)",    category: "Logic" },
  // Actions
  { type: "ai-draft-reply",       label: "AI Draft Reply",    description: "Generate AI reply text",      icon: Sparkles,          color: PINK,                      category: "Actions" },
  { type: "post-reply",           label: "Post Reply",        description: "Publish reply to Google",     icon: Send,              color: "oklch(0.52 0.18 160)",    category: "Actions" },
  { type: "send-notification",    label: "Send Notification", description: "Slack / email alert",         icon: Bell,              color: "oklch(0.58 0.20 55)",     category: "Actions" },
  { type: "output",               label: "End",               description: "Workflow end",                icon: CheckCircle2,      color: "oklch(0.52 0.18 160)",    category: "Actions" },
]

const CATEGORIES: NodeDef["category"][] = ["Triggers", "Logic", "Actions"]

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
    new Set(["Triggers", "Logic", "Actions"])
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

        {CATEGORIES.map((cat) => {
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
