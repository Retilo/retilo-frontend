"use client"

// The React Flow canvas with GMB nodes

import { useCallback } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  BackgroundVariant,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { useWorkflowStore } from "../store/workflow-store"
import { nodeTypes } from "./nodes/gmb-node"

const PINK = "oklch(0.58 0.24 350)"

export function WorkflowCanvas() {
  const {
    nodes, edges,
    onNodesChange, onEdgesChange, onConnect,
    addNode,
  } = useWorkflowStore()

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const nodeType = e.dataTransfer.getData("application/gmb-node") as
        | import("../store/workflow-store").GmbNodeType
        | ""
      if (!nodeType) return

      const bounds = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const position = { x: e.clientX - bounds.left, y: e.clientY - bounds.top }
      addNode(nodeType, position)
    },
    [addNode]
  )

  return (
    <div className="flex-1 relative" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        colorMode="light"
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: `${PINK}80`, strokeWidth: 2 },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="oklch(0 0 0 / 10%)"
        />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}
