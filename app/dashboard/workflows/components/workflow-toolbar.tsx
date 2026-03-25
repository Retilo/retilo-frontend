"use client"

// Top toolbar: run / save / status bar

import { Play, Square, Save, Trash2 } from "lucide-react"
import { useWorkflowStore } from "../store/workflow-store"

const PINK = "oklch(0.58 0.24 350)"
const BORDER = "oklch(0.91 0.008 350)"
const TEXT = "oklch(0.14 0.008 270)"
const TEXT_MUTED = "oklch(0.55 0.008 270)"
const TEXT_FAINT = "oklch(0.65 0.008 270)"
const BTN_BG = "oklch(0.975 0.004 350)"

export function WorkflowToolbar() {
  const { isRunning, runWorkflow, stopWorkflow, clearWorkflow, nodes, edges } = useWorkflowStore()

  return (
    <div
      className="flex items-center gap-2 px-4 py-3"
      style={{ borderBottom: `1px solid ${BORDER}`, background: "oklch(0.99 0.005 350)" }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm mr-4" style={{ color: TEXT_FAINT }}>
        <span className="font-medium" style={{ color: TEXT_MUTED }}>Workflows</span>
        <span>/</span>
        <span style={{ color: TEXT_MUTED }}>Editor</span>
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-1.5 text-xs">
        <div
          className={`w-1.5 h-1.5 rounded-full ${isRunning ? "animate-pulse" : ""}`}
          style={{ background: isRunning ? "#F59E0B" : "oklch(0.80 0.005 270)" }}
        />
        <span style={{ color: TEXT_FAINT }}>
          {isRunning ? "Running…" : `${nodes.length} nodes · ${edges.length} edges`}
        </span>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={clearWorkflow}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all hover:opacity-75"
          style={{ border: `1px solid ${BORDER}`, background: BTN_BG, color: TEXT_MUTED }}
          title="Clear canvas"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>

        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all hover:opacity-75"
          style={{ border: `1px solid ${BORDER}`, background: BTN_BG, color: TEXT_MUTED }}
          title="Save workflow"
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </button>

        {isRunning ? (
          <button
            onClick={stopWorkflow}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white text-xs font-semibold transition-all hover:opacity-90"
            style={{ background: "oklch(0.58 0.22 25)" }}
          >
            <Square className="w-3.5 h-3.5" />
            Stop
          </button>
        ) : (
          <button
            onClick={runWorkflow}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white text-xs font-semibold transition-all hover:opacity-90"
            style={{ background: PINK }}
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            Run
          </button>
        )}
      </div>
    </div>
  )
}
