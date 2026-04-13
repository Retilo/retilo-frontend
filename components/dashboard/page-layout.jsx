"use client"

import { OpsNav } from "@/components/ops/ops-nav"

export function DashboardPageLayout({ title, subtitle, actions, children }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "oklch(0.97 0.003 270)" }}>
      <OpsNav />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-6 py-3.5 border-b shrink-0"
          style={{ background: "oklch(1 0 0)", borderColor: "oklch(0.91 0.008 270)" }}
        >
          <div>
            <h1 className="text-[14px] font-bold text-[oklch(0.14_0.008_270)] tracking-tight">{title}</h1>
            {subtitle && <p className="text-[11px] text-[oklch(0.55_0.008_270)] mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
