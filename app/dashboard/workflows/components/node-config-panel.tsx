"use client"

// Right-side config panel that appears when a node is selected

import { X } from "lucide-react"
import { useWorkflowStore } from "../store/workflow-store"

export function NodeConfigPanel() {
  const { nodes, selectedNodeId, updateNodeConfig, selectNode } = useWorkflowStore()
  const node = nodes.find((n) => n.id === selectedNodeId)

  if (!node) return null

  const cfg = node.data.config ?? {}

  // Per-node config fields
  const renderFields = () => {
    switch (node.data.type) {
      case "trigger-new-review":
        return (
          <div className="space-y-4">
            <Field label="Location">
              <select
                className="w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-[oklch(0.65_0.26_280)]"
                value={(cfg.locationId as string) ?? "all"}
                onChange={(e) => updateNodeConfig(node.id, { locationId: e.target.value })}
              >
                <option value="all">All locations</option>
                <option value="specific">Specific location…</option>
              </select>
            </Field>
          </div>
        )

      case "filter-rating":
        return (
          <div className="space-y-4">
            <Field label="Condition">
              <select
                className="w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-[oklch(0.65_0.26_280)]"
                value={(cfg.operator as string) ?? "lte"}
                onChange={(e) => updateNodeConfig(node.id, { operator: e.target.value })}
              >
                <option value="lte">Rating ≤</option>
                <option value="gte">Rating ≥</option>
                <option value="eq">Rating =</option>
              </select>
            </Field>
            <Field label="Stars">
              <div className="flex items-center gap-2">
                <input
                  type="range" min={1} max={5} step={1}
                  value={(cfg.value as number) ?? 2}
                  onChange={(e) => updateNodeConfig(node.id, { value: Number(e.target.value) })}
                  className="flex-1 accent-[oklch(0.65_0.26_280)]"
                />
                <span className="text-white/70 text-sm w-4">{(cfg.value as number) ?? 2}</span>
              </div>
            </Field>
          </div>
        )

      case "filter-keyword":
        return (
          <div className="space-y-4">
            <Field label="Keywords (comma-separated)">
              <input
                type="text"
                placeholder="e.g. wait, slow, rude"
                value={(cfg.keywords as string) ?? ""}
                onChange={(e) => updateNodeConfig(node.id, { keywords: e.target.value })}
                className="w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-[oklch(0.65_0.26_280)] placeholder:text-white/25"
              />
            </Field>
            <Field label="Match">
              <select
                className="w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-[oklch(0.65_0.26_280)]"
                value={(cfg.match as string) ?? "any"}
                onChange={(e) => updateNodeConfig(node.id, { match: e.target.value })}
              >
                <option value="any">Any keyword</option>
                <option value="all">All keywords</option>
              </select>
            </Field>
          </div>
        )

      case "ai-draft-reply":
        return (
          <div className="space-y-4">
            <Field label="Tone">
              <select
                className="w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-[oklch(0.65_0.26_280)]"
                value={(cfg.tone as string) ?? "empathetic"}
                onChange={(e) => updateNodeConfig(node.id, { tone: e.target.value })}
              >
                <option value="empathetic">Empathetic</option>
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="apologetic">Apologetic</option>
              </select>
            </Field>
            <Field label="Auto post without approval">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(cfg.autoPost as boolean) ?? false}
                  onChange={(e) => updateNodeConfig(node.id, { autoPost: e.target.checked })}
                  className="accent-[oklch(0.65_0.26_280)]"
                />
                <span className="text-sm text-white/60">Auto-post reply</span>
              </label>
            </Field>
            <Field label="Hint / context">
              <textarea
                rows={3}
                placeholder="Optional guidance for the AI…"
                value={(cfg.hint as string) ?? ""}
                onChange={(e) => updateNodeConfig(node.id, { hint: e.target.value })}
                className="w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-[oklch(0.65_0.26_280)] placeholder:text-white/25 resize-none"
              />
            </Field>
          </div>
        )

      case "send-notification":
        return (
          <div className="space-y-4">
            <Field label="Channel">
              <select
                className="w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-[oklch(0.65_0.26_280)]"
                value={(cfg.channel as string) ?? "slack"}
                onChange={(e) => updateNodeConfig(node.id, { channel: e.target.value })}
              >
                <option value="slack">Slack</option>
                <option value="email">Email</option>
                <option value="in-app">In-app</option>
              </select>
            </Field>
            <Field label="Message">
              <textarea
                rows={3}
                placeholder="Notification message… (supports {{reviewer}}, {{rating}})"
                value={(cfg.message as string) ?? ""}
                onChange={(e) => updateNodeConfig(node.id, { message: e.target.value })}
                className="w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-[oklch(0.65_0.26_280)] placeholder:text-white/25 resize-none"
              />
            </Field>
          </div>
        )

      case "delay":
        return (
          <div className="space-y-4">
            <Field label="Wait duration">
              <div className="flex gap-2">
                <input
                  type="number" min={1}
                  value={(cfg.amount as number) ?? 1}
                  onChange={(e) => updateNodeConfig(node.id, { amount: Number(e.target.value) })}
                  className="w-20 rounded-lg bg-white/5 border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-[oklch(0.65_0.26_280)]"
                />
                <select
                  className="flex-1 rounded-lg bg-white/5 border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-[oklch(0.65_0.26_280)]"
                  value={(cfg.unit as string) ?? "minutes"}
                  onChange={(e) => updateNodeConfig(node.id, { unit: e.target.value })}
                >
                  <option value="minutes">minutes</option>
                  <option value="hours">hours</option>
                  <option value="days">days</option>
                </select>
              </div>
            </Field>
          </div>
        )

      case "trigger-schedule":
        return (
          <div className="space-y-4">
            <Field label="Frequency">
              <select
                className="w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-[oklch(0.65_0.26_280)]"
                value={(cfg.frequency as string) ?? "daily"}
                onChange={(e) => updateNodeConfig(node.id, { frequency: e.target.value })}
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </Field>
          </div>
        )

      default:
        return (
          <p className="text-xs text-white/30 italic">No configuration for this node.</p>
        )
    }
  }

  return (
    <div className="w-72 flex-shrink-0 flex flex-col bg-[oklch(0.10_0.016_270)] border-l border-white/8 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/8">
        <div>
          <div className="text-xs text-white/40 uppercase tracking-widest mb-0.5">Configure node</div>
          <div className="text-sm font-semibold text-white">{node.data.label}</div>
        </div>
        <button
          onClick={() => selectNode(null)}
          className="text-white/30 hover:text-white/70 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {renderFields()}
      </div>

      {/* Debug info */}
      <details className="px-4 pb-4">
        <summary className="text-[10px] text-white/25 cursor-pointer hover:text-white/40 transition-colors">
          Debug: raw config
        </summary>
        <pre className="mt-2 text-[10px] text-white/40 bg-black/30 rounded-lg p-3 overflow-auto max-h-40">
          {JSON.stringify({ id: node.id, type: node.data.type, config: node.data.config }, null, 2)}
        </pre>
      </details>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/50 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
