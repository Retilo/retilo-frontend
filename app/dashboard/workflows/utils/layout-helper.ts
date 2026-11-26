// ELK auto-layout — adapted from xyflow pro-ai-workflow-editor
import { type Edge, type Node } from "@xyflow/react"
import ELK from "elkjs/lib/elk.bundled.js"

const elk = new ELK()

const ELK_OPTIONS = {
  "elk.algorithm":                             "layered",
  "elk.direction":                             "RIGHT",
  "elk.layered.spacing.edgeNodeBetweenLayers": "80",
  "elk.spacing.nodeNode":                      "60",
  "elk.layered.nodePlacement.strategy":        "SIMPLE",
  "elk.separateConnectedComponents":           "true",
  "elk.spacing.componentComponent":            "80",
}

export async function layoutGraph(nodes: Node[], edges: Edge[]): Promise<Node[]> {
  if (!nodes.length) return nodes

  const connected = new Set<string>()
  edges.forEach((e) => { connected.add(e.source); connected.add(e.target) })

  const graph = {
    id: "root",
    layoutOptions: ELK_OPTIONS,
    edges: edges.map((e) => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
    })),
    children: nodes
      .filter((n) => connected.has(n.id))
      .map((n) => ({
        id:     n.id,
        width:  (n as Node & { measured?: { width?: number } }).measured?.width ?? 220,
        height: (n as Node & { measured?: { height?: number } }).measured?.height ?? 80,
      })),
  }

  const result = await elk.layout(graph)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const posMap = new Map((result.children ?? []).map((n: any) => [n.id as string, { x: n.x as number, y: n.y as number }]))

  return nodes.map((n) => {
    const pos = posMap.get(n.id)
    if (!pos) return n
    return { ...n, position: pos }
  }) as Node[]
}
