"use client"

// Reusable layout wrapper for all dashboard sub-pages
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { AppSidebar } from "./sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function DashboardPageLayout({ title, subtitle, actions, children }) {
  const router = useRouter()

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
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="flex items-center justify-center w-7 h-7 rounded-lg transition-all hover:bg-black/6 active:scale-95"
                style={{ color: "oklch(0.55 0.008 270)" }}
                aria-label="Go back"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
              </button>
              <div>
                <h1 className="text-[15px] font-bold text-[oklch(0.14_0.008_270)] tracking-tight">{title}</h1>
                {subtitle && <p className="text-xs text-[oklch(0.55_0.008_270)] mt-0.5">{subtitle}</p>}
              </div>
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
