"use client"

// GMB Workflow Node — the visual card rendered on the React Flow canvas

import { memo, useCallback } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import {
  Star, Clock, Filter, SlidersHorizontal,
  Sparkles, Send, Bell, GitBranch, Timer, CheckCircle2, Trash2,
} from "lucide-react"
import { type AppNode, type GmbNodeType, useWorkflowStore } from "../../store/workflow-store"

const PINK = "oklch(0.58 0.24 350)"
const CARD_BG = "oklch(1 0 0)"
const CARD_BORDER = "oklch(0.91 0.008 350)"
const TEXT = "oklch(0.14 0.008 270)"
const TEXT_MUTED = "oklch(0.55 0.008 270)"
const TEXT_FAINT = "oklch(0.65 0.008 270)"

// ── Style map ──────────────────────────────────────────────────
const NODE_STYLE: Record<GmbNodeType, {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  color: string
  category: "trigger" | "logic" | "action" | "output"
}> = {
  "trigger-new-review":   { icon: Star,              color: PINK,                      category: "trigger" },
  "trigger-schedule":     { icon: Clock,             color: "oklch(0.58 0.20 55)",     category: "trigger" },
  "filter-rating":        { icon: Filter,            color: "oklch(0.55 0.20 310)",    category: "logic"   },
  "filter-keyword":       { icon: SlidersHorizontal, color: "oklch(0.55 0.20 310)",    category: "logic"   },
  "ai-draft-reply":       { icon: Sparkles,          color: PINK,                      category: "action"  },
  "post-reply":           { icon: Send,              color: "oklch(0.52 0.18 160)",    category: "action"  },
  "send-notification":    { icon: Bell,              color: "oklch(0.58 0.20 55)",     category: "action"  },
  "branch":               { icon: GitBranch,         color: "oklch(0.55 0.22 280)",    category: "logic"   },
  "delay":                { icon: Timer,             color: "oklch(0.55 0.22 280)",    category: "logic"   },
  "output":               { icon: CheckCircle2,      color: "oklch(0.52 0.18 160)",    category: "output"  },
}

const STATUS_DOT: Record<string, string> = {
  idle:    "oklch(0.82 0.005 270)",
  running: "#F59E0B",
  success: "#10B981",
  error:   "#EF4444",
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
      className="relative w-[220px] rounded-2xl transition-all duration-200 cursor-pointer select-none"
      style={{
        background: CARD_BG,
        border: `1px solid ${selected ? style.color : CARD_BORDER}`,
        boxShadow: selected
          ? `0 0 0 3px ${style.color}20, 0 4px 16px -4px ${style.color}30`
          : "0 1px 4px oklch(0 0 0 / 6%)",
      }}
    >
      {/* Target handle */}
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !border-2 !rounded-full"
          style={{
            borderColor: style.color,
            background: CARD_BG,
          }}
        />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${style.color}12` }}
            >
              <Icon className="w-4 h-4" style={{ color: style.color }} />
            </div>
            <div>
              <div
                className="text-[9px] font-bold uppercase tracking-widest mb-0.5"
                style={{ color: `${style.color}90` }}
              >
                {CATEGORY_LABEL[style.category]}
              </div>
              <div className="text-sm font-semibold leading-tight" style={{ color: TEXT }}>
                {data.label}
              </div>
            </div>
          </div>

          {/* Status + delete */}
          <div className="flex items-center gap-1.5 ml-1">
            <div
              className={`w-2 h-2 rounded-full ${data.status === "running" ? "animate-pulse" : ""}`}
              style={{ background: STATUS_DOT[data.status ?? "idle"] }}
            />
            <button
              className="nodrag opacity-0 group-hover:opacity-100 transition-all hover:text-red-500"
              style={{ color: TEXT_FAINT }}
              onClick={onDelete}
              title="Remove node"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Description */}
        {data.description && (
          <p className="text-[11px] leading-relaxed" style={{ color: TEXT_FAINT }}>
            {data.description}
          </p>
        )}

        {/* Config preview */}
        {data.config && Object.keys(data.config).length > 0 && (
          <div
            className="mt-3 rounded-lg px-3 py-2 space-y-1"
            style={{ background: "oklch(0.97 0.004 350)", border: `1px solid oklch(0.92 0.007 350)` }}
          >
            {Object.entries(data.config).slice(0, 3).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between text-[10px]">
                <span className="capitalize" style={{ color: TEXT_FAINT }}>{k}</span>
                <span style={{ color: TEXT_MUTED }}>{String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Source handle */}
      {!isOutput && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !border-2 !rounded-full"
          style={{
            borderColor: style.color,
            background: CARD_BG,
          }}
        />
      )}
    </div>
  )
}

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
