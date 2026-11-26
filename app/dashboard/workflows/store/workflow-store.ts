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
  // Triggers — Google
  | "trigger-new-review"
  | "trigger-schedule"
  // Triggers — Swiggy
  | "trigger-swiggy-booking"
  | "trigger-swiggy-cancelled"
  // Triggers — Voice
  | "trigger-voice-inbound"
  | "trigger-voice-missed"
  // Triggers — WhatsApp
  | "trigger-whatsapp-message"
  // Logic
  | "filter-rating"
  | "filter-keyword"
  | "branch"
  | "delay"
  // Actions — Swiggy
  | "action-swiggy-confirm"
  | "action-swiggy-reject"
  // Actions — WhatsApp
  | "action-send-whatsapp"
  // Actions — Voice
  | "action-voice-callback"
  // Actions — Google
  | "ai-draft-reply"
  | "post-reply"
  | "action-gmb-post"
  // Actions — Notifications
  | "send-notification"
  // Terminal
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
    // Google triggers
    "trigger-new-review":      { label: "New Review",           description: "Triggers when a new Google review arrives" },
    "trigger-schedule":        { label: "Schedule",             description: "Cron / time-based trigger" },
    // Swiggy triggers
    "trigger-swiggy-booking":  { label: "Swiggy Booking",       description: "New table booking request via Swiggy Dineout" },
    "trigger-swiggy-cancelled":{ label: "Booking Cancelled",    description: "Guest cancelled a Swiggy Dineout booking" },
    // Voice triggers
    "trigger-voice-inbound":   { label: "Incoming Call",        description: "AI receptionist picked up an inbound call" },
    "trigger-voice-missed":    { label: "Missed Call",          description: "Call not answered — trigger follow-up" },
    // WhatsApp triggers
    "trigger-whatsapp-message":{ label: "WhatsApp Message",     description: "New message in the WhatsApp inbox" },
    // Logic
    "filter-rating":           { label: "Filter Rating",        description: "Continue only if rating meets condition" },
    "filter-keyword":          { label: "Filter Keyword",       description: "Match text in review or message" },
    "branch":                  { label: "Branch",               description: "Conditional split on a value" },
    "delay":                   { label: "Delay",                description: "Wait X minutes before next step" },
    // Swiggy actions
    "action-swiggy-confirm":   { label: "Confirm Booking",      description: "Confirm the Swiggy Dineout reservation" },
    "action-swiggy-reject":    { label: "Reject Booking",       description: "Decline with an optional reason" },
    // WhatsApp actions
    "action-send-whatsapp":    { label: "Send WhatsApp",        description: "Send a message to the guest's number" },
    // Voice actions
    "action-voice-callback":   { label: "Voice Callback",       description: "Trigger outbound call to the guest" },
    // Google actions
    "ai-draft-reply":          { label: "AI Draft Reply",       description: "Generate AI reply to a review" },
    "post-reply":              { label: "Post GMB Reply",       description: "Publish reply to Google Business" },
    "action-gmb-post":         { label: "GMB Post",             description: "Create a Google Business update post" },
    // Notifications
    "send-notification":       { label: "Send Notification",    description: "Notify via email, Slack, or in-app" },
    // Terminal
    "output":                  { label: "Done",                 description: "Workflow complete" },
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

// Default workflow: Swiggy booking → AI confirmation → WhatsApp guest
// This is the entry-point funnel — "Claude for restaurants"
const DEFAULT_NODES: AppNode[] = [
  {
    id: "n1",
    type: "trigger-swiggy-booking",
    position: { x: 60, y: 60 },
    data: { type: "trigger-swiggy-booking", label: "Swiggy Booking", description: "New table booking via Swiggy Dineout", config: {}, status: "idle" },
  },
  {
    id: "n2",
    type: "action-swiggy-confirm",
    position: { x: 340, y: 60 },
    data: { type: "action-swiggy-confirm", label: "Confirm Booking", description: "Auto-confirm within 30 seconds", config: { autoConfirm: true }, status: "idle" },
  },
  {
    id: "n3",
    type: "action-send-whatsapp",
    position: { x: 620, y: 60 },
    data: { type: "action-send-whatsapp", label: "Send WhatsApp", description: "Confirmation + directions to guest", config: { template: "booking_confirmed" }, status: "idle" },
  },
  {
    id: "n4",
    type: "trigger-voice-missed",
    position: { x: 60, y: 240 },
    data: { type: "trigger-voice-missed", label: "Missed Call", description: "AI receptionist missed call", config: {}, status: "idle" },
  },
  {
    id: "n5",
    type: "action-send-whatsapp",
    position: { x: 340, y: 240 },
    data: { type: "action-send-whatsapp", label: "Send WhatsApp", description: "\"Sorry we missed you — book a table here\"", config: { template: "missed_call" }, status: "idle" },
  },
  {
    id: "n6",
    type: "trigger-new-review",
    position: { x: 60, y: 420 },
    data: { type: "trigger-new-review", label: "New Review", description: "New Google review received", config: {}, status: "idle" },
  },
  {
    id: "n7",
    type: "filter-rating",
    position: { x: 340, y: 420 },
    data: { type: "filter-rating", label: "Filter Rating", description: "Only 4★ and above", config: { operator: "gte", value: 4 }, status: "idle" },
  },
  {
    id: "n8",
    type: "ai-draft-reply",
    position: { x: 620, y: 420 },
    data: { type: "ai-draft-reply", label: "AI Reply", description: "Warm, brand-voice reply", config: { tone: "warm", autoPost: true }, status: "idle" },
  },
  {
    id: "n9",
    type: "output",
    position: { x: 900, y: 180 },
    data: { type: "output", label: "Done", description: "Agent handled it", config: {}, status: "idle" },
  },
]

const DEFAULT_EDGES: Edge[] = [
  { id: "e1", source: "n1", target: "n2",  animated: true },
  { id: "e2", source: "n2", target: "n3",  animated: true },
  { id: "e3", source: "n3", target: "n9",  animated: true },
  { id: "e4", source: "n4", target: "n5",  animated: true },
  { id: "e5", source: "n5", target: "n9",  animated: true },
  { id: "e6", source: "n6", target: "n7",  animated: true },
  { id: "e7", source: "n7", target: "n8",  animated: true },
  { id: "e8", source: "n8", target: "n9",  animated: true },
]

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: DEFAULT_NODES,
  edges: DEFAULT_EDGES,
  selectedNodeId: null,
  workflowName: "Restaurant AI — Swiggy + Reviews + Missed Calls",
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
