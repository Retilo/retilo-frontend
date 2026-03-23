"use client"

// GMB Workflow Node — the visual card rendered on the React Flow canvas
// Each node type shares this base; the icon + color is derived from data.type

import { memo, useCallback } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import {
  Star, Clock, Filter, SlidersHorizontal,
  Sparkles, Send, Bell, GitBranch, Timer, CheckCircle2, Trash2,
} from "lucide-react"
import { type AppNode, type GmbNodeType, useWorkflowStore } from "../../store/workflow-store"

// ── Style map ──────────────────────────────────────────────────
const NODE_STYLE: Record<GmbNodeType, {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  color: string
  bg: string
  category: "trigger" | "logic" | "action" | "output"
}> = {
  "trigger-new-review":   { icon: Star,              color: "oklch(0.65 0.26 280)", bg: "oklch(0.65 0.26 280 / 15%)", category: "trigger" },
  "trigger-schedule":     { icon: Clock,             color: "oklch(0.70 0.18 55)",  bg: "oklch(0.70 0.18 55 / 15%)",  category: "trigger" },
  "filter-rating":        { icon: Filter,            color: "oklch(0.60 0.20 310)", bg: "oklch(0.60 0.20 310 / 15%)", category: "logic" },
  "filter-keyword":       { icon: SlidersHorizontal, color: "oklch(0.60 0.20 310)", bg: "oklch(0.60 0.20 310 / 15%)", category: "logic" },
  "ai-draft-reply":       { icon: Sparkles,          color: "oklch(0.65 0.26 280)", bg: "oklch(0.65 0.26 280 / 15%)", category: "action" },
  "post-reply":           { icon: Send,              color: "oklch(0.60 0.20 160)", bg: "oklch(0.60 0.20 160 / 15%)", category: "action" },
  "send-notification":    { icon: Bell,              color: "oklch(0.70 0.18 55)",  bg: "oklch(0.70 0.18 55 / 15%)",  category: "action" },
  "branch":               { icon: GitBranch,         color: "oklch(0.65 0.22 30)",  bg: "oklch(0.65 0.22 30 / 15%)",  category: "logic" },
  "delay":                { icon: Timer,             color: "oklch(0.65 0.22 30)",  bg: "oklch(0.65 0.22 30 / 15%)",  category: "logic" },
  "output":               { icon: CheckCircle2,      color: "oklch(0.60 0.20 160)", bg: "oklch(0.60 0.20 160 / 15%)", category: "output" },
}

const STATUS_COLOR: Record<string, string> = {
  idle:    "bg-white/20",
  running: "bg-yellow-400 animate-pulse",
  success: "bg-green-400",
  error:   "bg-red-400",
}

const CATEGORY_LABEL: Record<string, string> = {
  trigger: "TRIGGER",
  logic:   "LOGIC",
  action:  "ACTION",
  output:  "OUTPUT",
}

function GmbNodeComponent({ id, data, selected }: NodeProps<AppNode>) {
  const removeNode = useWorkflowStore((s) => s.removeNode)
  const selectNode = useWorkflowStore((s) => s.selectNode)
  const onDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    removeNode(id)
  }, [id, removeNode])

  const style = NODE_STYLE[data.type]
  const Icon = style.icon
  const isTrigger = style.category === "trigger"
  const isOutput = style.category === "output"

  return (
    <div
      onClick={() => selectNode(id)}
      className={`
        relative w-[220px] rounded-2xl border transition-all duration-200 cursor-pointer select-none
        ${selected
          ? "border-[oklch(0.65_0.26_280)] shadow-lg shadow-[oklch(0.55_0.24_280)/20%]"
          : "border-white/10 hover:border-white/20"
        }
      `}
      style={{ background: "oklch(0.15 0.018 270)" }}
    >
      {/* Glow when selected */}
      {selected && (
        <div
          className="absolute -inset-px rounded-2xl pointer-events-none"
          style={{ boxShadow: `0 0 20px -4px ${style.color}60` }}
        />
      )}

      {/* Target handle (not on triggers) */}
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !border-2 !border-[oklch(0.65_0.26_280)] !bg-[oklch(0.15_0.018_270)] !rounded-full"
        />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: style.bg }}
            >
              <Icon className="w-4 h-4" style={{ color: style.color }} />
            </div>
            <div>
              <div
                className="text-[9px] font-bold uppercase tracking-widest mb-0.5"
                style={{ color: `${style.color}80` }}
              >
                {CATEGORY_LABEL[style.category]}
              </div>
              <div className="text-sm font-semibold text-white leading-tight">
                {data.label}
              </div>
            </div>
          </div>

          {/* Status + delete */}
          <div className="flex items-center gap-1.5 ml-1">
            <div className={`w-2 h-2 rounded-full ${STATUS_COLOR[data.status ?? "idle"]}`} />
            <button
              className="nodrag opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all"
              onClick={onDelete}
              title="Remove node"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Description */}
        {data.description && (
          <p className="text-[11px] text-white/40 leading-relaxed">
            {data.description}
          </p>
        )}

        {/* Config preview */}
        {data.config && Object.keys(data.config).length > 0 && (
          <div className="mt-3 rounded-lg bg-white/4 border border-white/8 px-3 py-2 space-y-1">
            {Object.entries(data.config).slice(0, 3).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between text-[10px]">
                <span className="text-white/30 capitalize">{k}</span>
                <span className="text-white/60">{String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Source handle (not on outputs) */}
      {!isOutput && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !border-2 !border-[oklch(0.65_0.26_280)] !bg-[oklch(0.15_0.018_270)] !rounded-full"
        />
      )}
    </div>
  )
}

// Export each GMB node type as a separate React Flow nodeType key
// (they all share GmbNodeComponent but are registered separately for future customisation)
export const GmbNode = memo(GmbNodeComponent)

export const nodeTypes = {
  "trigger-new-review":   GmbNode,
  "trigger-schedule":     GmbNode,
  "filter-rating":        GmbNode,
  "filter-keyword":       GmbNode,
  "ai-draft-reply":       GmbNode,
  "post-reply":           GmbNode,
  "send-notification":    GmbNode,
  "branch":               GmbNode,
  "delay":                GmbNode,
  "output":               GmbNode,
}
