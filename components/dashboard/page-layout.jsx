"use client"

// Reusable layout wrapper for all dashboard sub-pages
// Wraps AppSidebar + SidebarProvider + consistent header

import { AppSidebar } from "./sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function DashboardPageLayout({ title, subtitle, actions, children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-screen overflow-hidden bg-[oklch(0.09_0.012_270)]">
        <div className="flex flex-col h-full">
          {/* Top bar */}
          <div className="flex items-center justify-between border-b border-white/8 bg-[oklch(0.10_0.016_270)] px-8 py-4">
            <div>
              <h1 className="text-base font-semibold text-white">{title}</h1>
              {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
