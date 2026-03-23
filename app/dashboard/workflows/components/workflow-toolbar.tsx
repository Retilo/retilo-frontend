"use client"

// Top toolbar: run / save / status bar

import { Play, Square, Save, Trash2, ChevronDown } from "lucide-react"
import { useWorkflowStore } from "../store/workflow-store"

export function WorkflowToolbar() {
  const { isRunning, runWorkflow, stopWorkflow, clearWorkflow, nodes, edges } = useWorkflowStore()

  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-[oklch(0.10_0.016_270)]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-white/40 mr-4">
        <span className="text-white/70 font-medium">Workflows</span>
        <span>/</span>
        <span className="text-white/50">Editor</span>
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-1.5 text-xs">
        <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-yellow-400 animate-pulse" : "bg-white/25"}`} />
        <span className="text-white/40">{isRunning ? "Running…" : `${nodes.length} nodes · ${edges.length} edges`}</span>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={clearWorkflow}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/3 hover:bg-white/6 text-white/50 hover:text-white/80 text-xs transition-all"
          title="Clear canvas"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>

        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/3 hover:bg-white/6 text-white/50 hover:text-white/80 text-xs transition-all"
          title="Save workflow (not yet wired to backend)"
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </button>

        {isRunning ? (
          <button
            onClick={stopWorkflow}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-xs font-semibold transition-all"
          >
            <Square className="w-3.5 h-3.5" />
            Stop
          </button>
        ) : (
          <button
            onClick={runWorkflow}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[oklch(0.55_0.24_280)] hover:bg-[oklch(0.60_0.26_280)] text-white text-xs font-semibold transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            Run
          </button>
        )}
      </div>
    </div>
  )
}
