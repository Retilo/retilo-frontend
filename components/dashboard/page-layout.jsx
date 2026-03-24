"use client"

// Reusable layout wrapper for all dashboard sub-pages
import { AppSidebar } from "./sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function DashboardPageLayout({ title, subtitle, actions, children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-screen overflow-hidden bg-[oklch(0.09_0.012_270)]">
        <div className="flex flex-col h-full">
          {/* Top bar */}
          <div className="flex items-center justify-between border-b border-white/6 bg-[oklch(0.09_0.012_270)/80%] backdrop-blur-sm px-8 py-4 sticky top-0 z-10">
            <div>
              <h1 className="text-[15px] font-bold text-white tracking-tight">{title}</h1>
              {subtitle && <p className="text-xs text-white/35 mt-0.5">{subtitle}</p>}
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
