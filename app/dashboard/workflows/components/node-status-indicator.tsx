"use client"

// Lifted from xyflow pro-ai-workflow-editor — NodeStatusIndicator
import { type ReactNode } from "react"
import { LoaderCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export type NodeStatus = "loading" | "success" | "error" | "initial" | "idle" | "running"

function StatusBorder({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <>
      <div className={cn("absolute -top-px -left-px h-[calc(100%+2px)] w-[calc(100%+2px)] rounded-[13px] border-2", className)} />
      {children}
    </>
  )
}

function SpinningBorderIndicator({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="absolute -top-px -left-px h-[calc(100%+2px)] w-[calc(100%+2px)]">
        <style>{`
          @keyframes rf-spin {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to   { transform: translate(-50%, -50%) rotate(360deg); }
          }
          .rf-spinner { animation: rf-spin 2s linear infinite; position: absolute; left: 50%; top: 50%; width: 140%; aspect-ratio: 1; }
        `}</style>
        <div className="absolute inset-0 overflow-hidden rounded-[13px]">
          <div className="rf-spinner rounded-full bg-[conic-gradient(from_0deg_at_50%_50%,oklch(0.58_0.24_350)_0deg,transparent_360deg)]" />
        </div>
      </div>
      {children}
    </>
  )
}

export function NodeStatusIndicator({ status, children }: { status?: NodeStatus; children: ReactNode }) {
  switch (status) {
    case "running":
    case "loading":
      return <SpinningBorderIndicator>{children}</SpinningBorderIndicator>
    case "success":
      return <StatusBorder className="border-emerald-500">{children}</StatusBorder>
    case "error":
      return <StatusBorder className="border-red-400">{children}</StatusBorder>
    default:
      return <>{children}</>
  }
}
