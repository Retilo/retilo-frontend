"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, Star, BarChart3, Workflow,
  MapPin, Send, Settings, LogOut, Users,
} from "lucide-react"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

// ── Nav definition ────────────────────────────────────────────
// href points to actual Next.js routes
const NAV_ITEMS = [
  { label: "Dashboard",   icon: LayoutDashboard, href: "/dashboard" },
  { label: "Reviews",     icon: Star,            href: "/dashboard/reviews",   badge: "5" },
  { label: "Analytics",   icon: BarChart3,       href: "/dashboard/analytics" },
  { label: "Workflows",   icon: Workflow,        href: "/dashboard/workflows" },
  { label: "Locations",   icon: MapPin,          href: "/dashboard/locations" },
  { label: "Campaigns",   icon: Send,            href: "/dashboard/campaigns" },
  { label: "Competitors", icon: Users,           href: "/dashboard/competitors" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = () => {
    localStorage.removeItem("retilo_token")
    localStorage.removeItem("retilo_merchant")
    router.replace("/auth")
  }

  // Derive merchant initials from localStorage (client-side only)
  let merchantInitials = "ME"
  let merchantName = "My Account"
  if (typeof window !== "undefined") {
    try {
      const m = JSON.parse(localStorage.getItem("retilo_merchant") ?? "{}")
      if (m.name) {
        merchantInitials = m.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
        merchantName = m.name
      }
    } catch {}
  }

  return (
    <Sidebar collapsible="none" className="border-r border-sidebar-border w-[220px]">

      {/* Logo */}
      <SidebarHeader className="h-14 flex-row items-center gap-2.5 border-b border-sidebar-border px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-[oklch(0.55_0.24_280)] shadow-md shadow-[oklch(0.55_0.24_280)/30%]">
            <span className="text-white font-black text-xs">R</span>
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
              Retilo
            </span>
            <span className="ml-1.5 rounded-sm bg-[oklch(0.55_0.24_280)/20%] px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[oklch(0.80_0.18_280)]">
              Beta
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="p-2 pt-2.5">
        <div className="mb-1 px-2 pt-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30">
            Workspace
          </span>
        </div>
        <SidebarMenu>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))
            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className="h-8.5 gap-2.5 text-[13px] font-medium"
                >
                  <Link href={item.href}>
                    <item.icon className="size-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
                {item.badge && (
                  <SidebarMenuBadge className="bg-[oklch(0.55_0.24_280)/20%] text-[oklch(0.80_0.18_280)] text-[10px] font-bold">
                    {item.badge}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarSeparator className="bg-sidebar-border/60" />

      {/* Footer */}
      <SidebarFooter className="p-2 pb-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-8.5 gap-2.5 text-[13px] font-medium">
              <Link href="/dashboard/settings">
                <Settings className="size-4 shrink-0" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator className="my-2 bg-sidebar-border/40" />

        {/* User row */}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-sidebar-accent cursor-pointer group text-left"
          title="Sign out"
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[oklch(0.55_0.24_280)/20%]">
            <span className="text-[11px] font-bold text-[oklch(0.80_0.18_280)]">{merchantInitials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium text-sidebar-foreground">{merchantName}</p>
            <p className="truncate text-[10px] text-sidebar-foreground/40">Click to sign out</p>
          </div>
          <LogOut className="size-3.5 shrink-0 text-sidebar-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
