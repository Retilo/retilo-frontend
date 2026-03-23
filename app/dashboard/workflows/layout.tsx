"use client"

// Workflow editor needs full-height layout (the canvas takes all remaining space)
// We bypass DashboardPageLayout here and handle it inline in WorkflowsPage

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/dashboard/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function WorkflowsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("retilo_token")) {
      router.replace("/auth")
    }
  }, [router])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-screen overflow-hidden bg-[oklch(0.09_0.012_270)]">
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
