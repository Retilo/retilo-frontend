"use client"

// Reusable layout wrapper for all dashboard sub-pages
import { AppSidebar } from "./sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function DashboardPageLayout({ title, subtitle, actions, children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-screen overflow-hidden" style={{ background: "oklch(0.985 0.003 350)" }}>
        <div className="flex flex-col h-full">
          {/* Top bar */}
          <div
            className="flex items-center justify-between px-8 py-4 sticky top-0 z-10 backdrop-blur-sm"
            style={{ background: "oklch(0.985 0.003 350 / 85%)", borderBottom: "1px solid oklch(0.91 0.008 350)" }}
          >
            <div>
              <h1 className="text-[15px] font-bold text-[oklch(0.14_0.008_270)] tracking-tight">{title}</h1>
              {subtitle && <p className="text-xs text-[oklch(0.55_0.008_270)] mt-0.5">{subtitle}</p>}
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
