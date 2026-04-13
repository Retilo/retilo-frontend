"use client"

import { ReactFlowProvider } from "@xyflow/react"
import { WorkflowSidebar } from "@/app/dashboard/workflows/components/workflow-sidebar"
import { WorkflowCanvas } from "@/app/dashboard/workflows/components/workflow-canvas"
import { WorkflowToolbar } from "@/app/dashboard/workflows/components/workflow-toolbar"
import { NodeConfigPanel } from "@/app/dashboard/workflows/components/node-config-panel"
import { useWorkflowStore } from "@/app/dashboard/workflows/store/workflow-store"

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
