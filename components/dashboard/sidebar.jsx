"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, Star, BarChart3, Workflow,
  MapPin, Send, LogOut, Users, Zap, Grid2X2,
} from "lucide-react"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const NAV_ITEMS = [
  { label: "Dashboard",   icon: LayoutDashboard, href: "/dashboard" },
  { label: "Reviews",     icon: Star,            href: "/dashboard/reviews",   badge: "5" },
  { label: "Analytics",   icon: BarChart3,       href: "/dashboard/analytics" },
  { label: "Workflows",   icon: Workflow,        href: "/dashboard/workflows" },
  { label: "Locations",   icon: MapPin,          href: "/dashboard/locations" },
  { label: "Campaigns",   icon: Send,            href: "/dashboard/campaigns" },
  { label: "Competitors", icon: Users,           href: "/dashboard/competitors" },
  { label: "Ranking",     icon: Grid2X2,         href: "/dashboard/ranking" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = () => {
    localStorage.removeItem("retilo_token")
    localStorage.removeItem("retilo_merchant")
    router.replace("/auth")
  }

  let merchantInitials = "ME"
  let merchantName = "My Account"
  let merchantEmail = ""
  if (typeof window !== "undefined") {
    try {
      const m = JSON.parse(localStorage.getItem("retilo_merchant") ?? "{}")
      if (m.name) {
        merchantInitials = m.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
        merchantName = m.name
      }
      if (m.email) merchantEmail = m.email
    } catch {}
  }

  return (
    <Sidebar collapsible="none" className="border-r border-sidebar-border bg-sidebar" style={{ width: "248px" }}>

      {/* ── Logo ─────────────────────────────────────── */}
      <SidebarHeader className="h-16 flex-row items-center gap-3 border-b border-sidebar-border px-5">
        <Link href="/" className="flex items-center gap-3 w-full">
          <div className="relative flex size-9 items-center justify-center rounded-xl bg-[oklch(0.58_0.24_350)] shadow-md shadow-[oklch(0.58_0.24_350)/30%] shrink-0">
            <Zap className="size-4 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-bold tracking-tight text-sidebar-foreground">
              Retilo
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[oklch(0.58_0.24_350)]">
              GMB Platform
            </span>
          </div>
          <span className="ml-auto rounded-md bg-[oklch(0.58_0.24_350)/12%] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[oklch(0.52_0.22_350)]">
            Beta
          </span>
        </Link>
      </SidebarHeader>

      {/* ── Nav ──────────────────────────────────────── */}
      <SidebarContent className="px-3 pt-4">
        <div className="mb-2 px-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-sidebar-foreground/40">
            Workspace
          </span>
        </div>
        <SidebarMenu className="gap-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))
            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className="h-10 gap-3 text-[13.5px] font-medium rounded-xl px-3 transition-all data-[active=true]:bg-[oklch(0.58_0.24_350)/12%] data-[active=true]:text-[oklch(0.48_0.24_350)]"
                >
                  <Link href={item.href}>
                    <item.icon className="size-[17px] shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
                {item.badge && (
                  <SidebarMenuBadge className="bg-[oklch(0.58_0.24_350)/15%] text-[oklch(0.48_0.22_350)] text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
                    {item.badge}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarSeparator className="mx-3 bg-sidebar-border" />

      {/* ── Footer ───────────────────────────────────── */}
      <SidebarFooter className="px-3 py-4">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all hover:bg-sidebar-accent cursor-pointer group text-left"
          title="Sign out"
        >
          <div className="relative shrink-0">
            <div className="flex size-8 items-center justify-center rounded-full bg-[oklch(0.58_0.24_350)/15%] ring-1 ring-[oklch(0.58_0.24_350)/25%]">
              <span className="text-[11px] font-bold text-[oklch(0.48_0.22_350)]">{merchantInitials}</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-1 ring-sidebar" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-semibold text-sidebar-foreground leading-none mb-0.5">{merchantName}</p>
            {merchantEmail && (
              <p className="truncate text-[10.5px] text-sidebar-foreground/45 leading-none">{merchantEmail}</p>
            )}
            {!merchantEmail && (
              <p className="text-[10.5px] text-sidebar-foreground/35 leading-none">Click to sign out</p>
            )}
          </div>
          <LogOut className="size-3.5 shrink-0 text-sidebar-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
