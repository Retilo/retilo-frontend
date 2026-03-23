"use client"

// GMB Workflow Editor — Lamatic-inspired visual node editor
// Layout (sidebar + SidebarInset) is provided by ./layout.tsx
// This page is purely the workflow editor itself.

import { ReactFlowProvider } from "@xyflow/react"
import { WorkflowSidebar } from "./components/workflow-sidebar"
import { WorkflowCanvas } from "./components/workflow-canvas"
import { WorkflowToolbar } from "./components/workflow-toolbar"
import { NodeConfigPanel } from "./components/node-config-panel"
import { useWorkflowStore } from "./store/workflow-store"

function WorkflowEditor() {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId)

  return (
    <div className="flex flex-col h-full">
      <WorkflowToolbar />
      <div className="flex flex-1 overflow-hidden">
        <WorkflowSidebar />
        <WorkflowCanvas />
        {selectedNodeId && <NodeConfigPanel />}
      </div>
    </div>
  )
}

export default function WorkflowsPage() {
  return (
    <ReactFlowProvider>
      <WorkflowEditor />
    </ReactFlowProvider>
  )
}
