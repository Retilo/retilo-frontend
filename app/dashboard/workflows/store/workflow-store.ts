// Zustand store for the GMB Workflow Editor
// Follows the same pattern as the workflow-editor-pro-example.zip

import { create } from "zustand"
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type XYPosition,
} from "@xyflow/react"

// ── Node type registry ────────────────────────────────────────
export type GmbNodeType =
  | "trigger-new-review"
  | "trigger-schedule"
  | "filter-rating"
  | "filter-keyword"
  | "ai-draft-reply"
  | "post-reply"
  | "send-notification"
  | "branch"
  | "delay"
  | "output"

export interface GmbNodeData extends Record<string, unknown> {
  type: GmbNodeType
  label: string
  description?: string
  config?: Record<string, unknown>
  // runtime
  status?: "idle" | "running" | "success" | "error"
}

export type AppNode = Node<GmbNodeData>

// ── Store ─────────────────────────────────────────────────────
interface WorkflowStore {
  nodes: AppNode[]
  edges: Edge[]
  selectedNodeId: string | null
  workflowName: string
  isRunning: boolean

  // React Flow handlers
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void

  // Node management
  addNode: (type: GmbNodeType, position: XYPosition) => void
  removeNode: (id: string) => void
  updateNodeConfig: (id: string, config: Record<string, unknown>) => void
  selectNode: (id: string | null) => void

  // Workflow actions
  setWorkflowName: (name: string) => void
  runWorkflow: () => void
  stopWorkflow: () => void
  clearWorkflow: () => void
}

let nodeCounter = 1

function createNode(type: GmbNodeType, position: XYPosition): AppNode {
  const NODE_META: Record<GmbNodeType, { label: string; description: string }> = {
    "trigger-new-review":   { label: "New Review",        description: "Triggers when a new Google review is received" },
    "trigger-schedule":     { label: "Schedule",          description: "Triggers on a time schedule (daily, weekly)" },
    "filter-rating":        { label: "Filter by Rating",  description: "Continue only if rating meets condition" },
    "filter-keyword":       { label: "Filter by Keyword", description: "Continue only if review contains keyword" },
    "ai-draft-reply":       { label: "AI Draft Reply",    description: "Generate an AI reply with configurable tone" },
    "post-reply":           { label: "Post Reply",        description: "Post the reply to Google Business" },
    "send-notification":    { label: "Send Notification", description: "Notify via Slack, email, or in-app" },
    "branch":               { label: "Branch",            description: "Split workflow based on a condition" },
    "delay":                { label: "Delay",             description: "Wait before proceeding to next step" },
    "output":               { label: "End",               description: "Workflow complete" },
  }

  const meta = NODE_META[type]
  return {
    id: `node_${nodeCounter++}`,
    type,
    position,
    data: {
      type,
      label: meta.label,
      description: meta.description,
      config: {},
      status: "idle",
    },
  }
}

// Default workflow: auto-reply to low-rated reviews
const DEFAULT_NODES: AppNode[] = [
  {
    id: "node_start",
    type: "trigger-new-review",
    position: { x: 300, y: 80 },
    data: { type: "trigger-new-review", label: "New Review", description: "Triggers on new Google review", config: {}, status: "idle" },
  },
  {
    id: "node_filter",
    type: "filter-rating",
    position: { x: 300, y: 220 },
    data: { type: "filter-rating", label: "Filter by Rating", description: "Only ≤ 2 stars", config: { operator: "lte", value: 2 }, status: "idle" },
  },
  {
    id: "node_ai",
    type: "ai-draft-reply",
    position: { x: 300, y: 360 },
    data: { type: "ai-draft-reply", label: "AI Draft Reply", description: "Empathetic tone", config: { tone: "empathetic", autoPost: false }, status: "idle" },
  },
  {
    id: "node_notify",
    type: "send-notification",
    position: { x: 100, y: 500 },
    data: { type: "send-notification", label: "Send Notification", description: "Notify manager", config: { channel: "slack" }, status: "idle" },
  },
  {
    id: "node_post",
    type: "post-reply",
    position: { x: 500, y: 500 },
    data: { type: "post-reply", label: "Post Reply", description: "Post to Google", config: { requireApproval: false }, status: "idle" },
  },
  {
    id: "node_end",
    type: "output",
    position: { x: 300, y: 640 },
    data: { type: "output", label: "End", description: "Workflow complete", config: {}, status: "idle" },
  },
]

const DEFAULT_EDGES: Edge[] = [
  { id: "e1", source: "node_start",  target: "node_filter", type: "default" },
  { id: "e2", source: "node_filter", target: "node_ai",     type: "default" },
  { id: "e3", source: "node_ai",     target: "node_notify", type: "default" },
  { id: "e4", source: "node_ai",     target: "node_post",   type: "default" },
  { id: "e5", source: "node_notify", target: "node_end",    type: "default" },
  { id: "e6", source: "node_post",   target: "node_end",    type: "default" },
]

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: DEFAULT_NODES,
  edges: DEFAULT_EDGES,
  selectedNodeId: null,
  workflowName: "Auto-reply negative reviews",
  isRunning: false,

  onNodesChange: (changes) =>
    set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) as AppNode[] })),

  onEdgesChange: (changes) =>
    set((s) => ({ edges: applyEdgeChanges(changes, s.edges) })),

  onConnect: (connection) =>
    set((s) => ({ edges: addEdge({ ...connection, type: "default" }, s.edges) })),

  addNode: (type, position) => {
    const node = createNode(type, position)
    set((s) => ({ nodes: [...s.nodes, node] }))
  },

  removeNode: (id) =>
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      edges: s.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
    })),

  updateNodeConfig: (id, config) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, config: { ...n.data.config, ...config } } } : n
      ),
    })),

  selectNode: (id) => set({ selectedNodeId: id }),

  setWorkflowName: (name) => set({ workflowName: name }),

  runWorkflow: () => {
    // Simulate workflow execution — set all nodes to running then success
    set({ isRunning: true })
    const { nodes } = get()
    nodes.forEach((node, i) => {
      setTimeout(() => {
        set((s) => ({
          nodes: s.nodes.map((n) =>
            n.id === node.id ? { ...n, data: { ...n.data, status: "running" } } : n
          ),
        }))
        setTimeout(() => {
          set((s) => ({
            nodes: s.nodes.map((n) =>
              n.id === node.id ? { ...n, data: { ...n.data, status: "success" } } : n
            ),
          }))
        }, 600)
      }, i * 400)
    })
    setTimeout(() => set({ isRunning: false }), nodes.length * 400 + 800)
  },

  stopWorkflow: () => {
    set((s) => ({
      isRunning: false,
      nodes: s.nodes.map((n) => ({ ...n, data: { ...n.data, status: "idle" } })),
    }))
  },

  clearWorkflow: () =>
    set({ nodes: [], edges: [], selectedNodeId: null }),
}))
