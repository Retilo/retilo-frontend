"use client"

// Right-side config panel that appears when a node is selected

import { X } from "lucide-react"
import { useWorkflowStore } from "../store/workflow-store"

const PINK = "oklch(0.58 0.24 350)"
const BORDER = "oklch(0.91 0.008 350)"
const TEXT = "oklch(0.14 0.008 270)"
const TEXT_MUTED = "oklch(0.55 0.008 270)"
const TEXT_FAINT = "oklch(0.65 0.008 270)"
const PANEL_BG = "oklch(0.99 0.005 350)"
const INPUT_BG = "oklch(0.96 0.005 350)"
const INPUT_BORDER = "oklch(0.90 0.008 350)"

const inputCls = "w-full rounded-lg text-sm px-3 py-2 outline-none transition-colors"
const inputStyle = { background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }

export function NodeConfigPanel() {
  const { nodes, selectedNodeId, updateNodeConfig, selectNode } = useWorkflowStore()
  const node = nodes.find((n) => n.id === selectedNodeId)

  if (!node) return null

  const cfg = node.data.config ?? {}

  const renderFields = () => {
    switch (node.data.type) {
      case "trigger-new-review":
        return (
          <div className="space-y-4">
            <Field label="Location">
              <select
                className={inputCls} style={inputStyle}
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
                className={inputCls} style={inputStyle}
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
                  className="flex-1"
                  style={{ accentColor: PINK }}
                />
                <span className="text-sm w-4" style={{ color: TEXT_MUTED }}>{(cfg.value as number) ?? 2}</span>
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
                className={inputCls}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = PINK)}
                onBlur={e => (e.target.style.borderColor = INPUT_BORDER)}
              />
            </Field>
            <Field label="Match">
              <select
                className={inputCls} style={inputStyle}
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
                className={inputCls} style={inputStyle}
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
                  style={{ accentColor: PINK }}
                />
                <span className="text-sm" style={{ color: TEXT_MUTED }}>Auto-post reply</span>
              </label>
            </Field>
            <Field label="Hint / context">
              <textarea
                rows={3}
                placeholder="Optional guidance for the AI…"
                value={(cfg.hint as string) ?? ""}
                onChange={(e) => updateNodeConfig(node.id, { hint: e.target.value })}
                className={`${inputCls} resize-none`}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = PINK)}
                onBlur={e => (e.target.style.borderColor = INPUT_BORDER)}
              />
            </Field>
          </div>
        )

      case "send-notification":
        return (
          <div className="space-y-4">
            <Field label="Channel">
              <select
                className={inputCls} style={inputStyle}
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
                className={`${inputCls} resize-none`}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = PINK)}
                onBlur={e => (e.target.style.borderColor = INPUT_BORDER)}
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
                  className="w-20 rounded-lg text-sm px-3 py-2 outline-none"
                  style={inputStyle}
                />
                <select
                  className="flex-1 rounded-lg text-sm px-3 py-2 outline-none"
                  style={inputStyle}
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
                className={inputCls} style={inputStyle}
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
          <p className="text-xs italic" style={{ color: TEXT_FAINT }}>No configuration for this node.</p>
        )
    }
  }

  return (
    <div
      className="w-72 flex-shrink-0 flex flex-col overflow-hidden"
      style={{ background: PANEL_BG, borderLeft: `1px solid ${BORDER}` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div>
          <div className="text-xs uppercase tracking-widest mb-0.5" style={{ color: TEXT_FAINT }}>Configure node</div>
          <div className="text-sm font-semibold" style={{ color: TEXT }}>{node.data.label}</div>
        </div>
        <button
          onClick={() => selectNode(null)}
          className="transition-colors hover:opacity-75"
          style={{ color: TEXT_FAINT }}
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
        <summary className="text-[10px] cursor-pointer hover:opacity-75 transition-opacity" style={{ color: TEXT_FAINT }}>
          Debug: raw config
        </summary>
        <pre
          className="mt-2 text-[10px] rounded-lg p-3 overflow-auto max-h-40"
          style={{ background: "oklch(0.96 0.005 350)", color: TEXT_MUTED }}
        >
          {JSON.stringify({ id: node.id, type: node.data.type, config: node.data.config }, null, 2)}
        </pre>
      </details>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_MUTED }}>{label}</label>
      {children}
    </div>
  )
}
