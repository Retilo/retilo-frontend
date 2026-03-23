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
  { type: "trigger-new-review",   label: "New Review",        description: "On any new GMB review",      icon: Star,              color: "oklch(0.65 0.26 280)", category: "Triggers" },
  { type: "trigger-schedule",     label: "Schedule",          description: "Cron / time-based trigger",   icon: Clock,             color: "oklch(0.70 0.18 55)",  category: "Triggers" },
  // Logic
  { type: "filter-rating",        label: "Filter Rating",     description: "By star rating threshold",    icon: Filter,            color: "oklch(0.60 0.20 310)", category: "Logic" },
  { type: "filter-keyword",       label: "Filter Keyword",    description: "By keyword in review text",   icon: SlidersHorizontal, color: "oklch(0.60 0.20 310)", category: "Logic" },
  { type: "branch",               label: "Branch",            description: "Conditional split",           icon: GitBranch,         color: "oklch(0.65 0.22 30)",  category: "Logic" },
  { type: "delay",                label: "Delay",             description: "Wait X minutes/hours",        icon: Timer,             color: "oklch(0.65 0.22 30)",  category: "Logic" },
  // Actions
  { type: "ai-draft-reply",       label: "AI Draft Reply",    description: "Generate AI reply text",      icon: Sparkles,          color: "oklch(0.65 0.26 280)", category: "Actions" },
  { type: "post-reply",           label: "Post Reply",        description: "Publish reply to Google",     icon: Send,              color: "oklch(0.60 0.20 160)", category: "Actions" },
  { type: "send-notification",    label: "Send Notification", description: "Slack / email alert",         icon: Bell,              color: "oklch(0.70 0.18 55)",  category: "Actions" },
  { type: "output",               label: "End",               description: "Workflow end",                icon: CheckCircle2,      color: "oklch(0.60 0.20 160)", category: "Actions" },
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
      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 hover:border-white/15 cursor-grab active:cursor-grabbing transition-all"
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${node.color.replace(")", " / 20%)")}`, color: node.color }}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-white/80 truncate">{node.label}</div>
        <div className="text-[10px] text-white/35 truncate">{node.description}</div>
      </div>
      <GripVertical className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 flex-shrink-0" />
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
    <div className="w-64 flex-shrink-0 flex flex-col bg-[oklch(0.10_0.016_270)] border-r border-white/8 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded-md bg-[oklch(0.55_0.24_280)] flex items-center justify-center">
            <span className="text-white font-black text-[10px]">R</span>
          </div>
          <span className="text-xs font-bold text-white/70 uppercase tracking-widest">Workflows</span>
        </div>
        {/* Editable workflow name */}
        {editingName ? (
          <input
            autoFocus
            className="w-full mt-2 bg-white/6 border border-[oklch(0.65_0.26_280)/50%] rounded-lg px-2.5 py-1.5 text-sm text-white outline-none"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="mt-2 w-full text-left text-sm font-semibold text-white/90 hover:text-white truncate px-0.5 transition-colors"
            title="Click to rename"
          >
            {workflowName}
          </button>
        )}
      </div>

      {/* Node palette */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin">
        <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1 mb-1">
          Drag nodes onto canvas
        </div>

        {CATEGORIES.map((cat) => {
          const nodes = NODE_PALETTE.filter((n) => n.category === cat)
          const isOpen = openCategories.has(cat)
          return (
            <div key={cat}>
              <button
                onClick={() => toggleCategory(cat)}
                className="flex items-center gap-1.5 w-full px-1 py-1 text-[11px] font-semibold text-white/50 hover:text-white/80 transition-colors"
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

      {/* Footer — create new */}
      <div className="px-3 py-3 border-t border-white/8">
        <button className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dashed border-white/15 text-white/40 hover:text-white/70 hover:border-white/25 text-xs font-medium transition-all">
          <Plus className="w-3.5 h-3.5" />
          New workflow
        </button>
      </div>
    </div>
  )
}
