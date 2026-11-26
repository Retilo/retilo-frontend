"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import {
  LayoutDashboard, Star, BarChart3,
  MapPin, Send, LogOut, Zap, Mail,
  ShoppingBag, Phone, TrendingUp, Globe, Scan, Activity, Moon, Sun, FileText, Armchair,
  CalendarCheck, Users, Grid2X2, Workflow,
} from "lucide-react"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

// ── Nav structure grouped by business outcome ──────────────────────
const NAV = [
  {
    id: "bookings",
    label: "Bookings",
    items: [
      { label: "Voice Agent",   icon: Phone,         href: "/dashboard/voice",          accent: "violet" },
      { label: "Workflows",     icon: Workflow,       href: "/dashboard/workflows",      accent: "violet", tag: { label: "Builder", color: "violet" } },
      { label: "Booking Page",  icon: CalendarCheck,  href: "/dashboard/booking-page",  accent: "violet" },
      { label: "Dine-in",       icon: Armchair,       href: "/dashboard/dinein",         accent: "violet" },
      { label: "Swiggy",        icon: ShoppingBag,    href: "/dashboard/swiggy",         accent: "violet" },
    ],
    tag: { label: "Swiggy", color: "orange" },
  },
  {
    id: "reputation",
    label: "Reputation",
    items: [
      { label: "Reviews",    icon: Star,     href: "/dashboard/reviews",   badge: "5", accent: "amber" },
      { label: "Campaigns",  icon: Send,     href: "/dashboard/campaigns",             accent: "amber" },
      { label: "Posts",      icon: FileText, href: "/dashboard/posts",                 accent: "amber" },
    ],
  },
  {
    id: "visibility",
    label: "Visibility",
    items: [
      { label: "Rankings",      icon: Grid2X2,    href: "/dashboard/ranking",              accent: "blue" },
      { label: "AI Visibility", icon: Globe,      href: "/visibility",                     accent: "blue", tag: { label: "New", color: "violet" } },
      { label: "Competitors",   icon: Users,      href: "/dashboard/competitors",           accent: "blue" },
    ],
  },
  {
    id: "intelligence",
    label: "Intelligence",
    items: [
      { label: "Analytics",      icon: BarChart3, href: "/dashboard/analytics",             accent: "green" },
      { label: "Demand Signals", icon: Activity,  href: "/dashboard/demand",                accent: "green", tag: { label: "New", color: "blue" } },
      { label: "Location Intel", icon: Scan,      href: "/dashboard/location-intelligence", accent: "green", tag: { label: "New", color: "blue" } },
    ],
  },
  {
    id: "manage",
    label: "Manage",
    items: [
      { label: "Locations",      icon: MapPin,     href: "/dashboard/locations", accent: "gray" },
      { label: "Business Grader",icon: TrendingUp, href: "/dashboard/grader",    accent: "gray", tag: { label: "Free", color: "emerald" } },
      { label: "Email Agent",    icon: Mail,       href: "/email",               accent: "gray", tag: { label: "AI", color: "violet" } },
    ],
  },
]

// ── Active-state color by accent ───────────────────────────────────
const ACTIVE_CLASS = {
  violet:  "data-[active=true]:bg-violet-50  data-[active=true]:text-violet-700",
  amber:   "data-[active=true]:bg-amber-50   data-[active=true]:text-amber-700",
  blue:    "data-[active=true]:bg-blue-50    data-[active=true]:text-blue-700",
  green:   "data-[active=true]:bg-emerald-50 data-[active=true]:text-emerald-700",
  orange:  "data-[active=true]:bg-orange-50  data-[active=true]:text-orange-700",
  gray:    "data-[active=true]:bg-gray-100   data-[active=true]:text-gray-700",
}

// ── Tag badge ──────────────────────────────────────────────────────
const TAG_STYLES = {
  orange:  "bg-orange-100  text-orange-700",
  violet:  "bg-violet-100  text-violet-700",
  blue:    "bg-blue-100    text-blue-700",
  emerald: "bg-emerald-100 text-emerald-700",
}

function NavTag({ label, color }) {
  return (
    <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${TAG_STYLES[color] ?? TAG_STYLES.violet}`}>
      {label}
    </span>
  )
}

// ── Dark mode toggle ───────────────────────────────────────────────
function DarkModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  const isDark = theme === "dark"
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2 transition-all hover:bg-sidebar-accent text-left"
    >
      <div className="flex size-7 items-center justify-center rounded-lg bg-sidebar-accent shrink-0">
        {isDark ? <Sun className="size-3.5 text-sidebar-foreground/70" /> : <Moon className="size-3.5 text-sidebar-foreground/70" />}
      </div>
      <span className="text-[12.5px] font-medium text-sidebar-foreground/55">
        {isDark ? "Light mode" : "Dark mode"}
      </span>
    </button>
  )
}

// ── Main sidebar ───────────────────────────────────────────────────
export function AppSidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  const handleSignOut = () => {
    localStorage.removeItem("retilo_token")
    localStorage.removeItem("retilo_merchant")
    router.replace("/auth")
  }

  let merchantInitials = "ME"
  let merchantName     = "My Account"
  let merchantEmail    = ""
  if (typeof window !== "undefined") {
    try {
      const m = JSON.parse(localStorage.getItem("retilo_merchant") ?? "{}")
      if (m.name) {
        merchantInitials = m.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
        merchantName = m.name
      }
      if (m.email) merchantEmail = m.email
    } catch { }
  }

  return (
    <Sidebar collapsible="none" className="border-r border-sidebar-border bg-sidebar" style={{ width: "240px" }}>

      {/* ── Logo ─────────────────────────────────────── */}
      <SidebarHeader className="h-14 flex-row items-center gap-3 border-b border-sidebar-border px-4">
        <Link href="/" className="flex items-center gap-3 w-full">
          <div className="relative flex size-8 items-center justify-center rounded-xl bg-[oklch(0.58_0.24_350)] shadow-md shadow-[oklch(0.58_0.24_350)/30%] shrink-0">
            <Zap className="size-3.5 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[14px] font-bold tracking-tight text-sidebar-foreground">Retilo</span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[oklch(0.58_0.24_350)]">AI Platform</span>
          </div>
          <span className="ml-auto rounded-md bg-[oklch(0.58_0.24_350)/12%] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[oklch(0.52_0.22_350)]">
            Beta
          </span>
        </Link>
      </SidebarHeader>

      {/* ── Nav ──────────────────────────────────────── */}
      <SidebarContent className="px-3 pt-3 pb-2 overflow-y-auto">

        {/* Overview */}
        <SidebarMenu className="gap-0.5 mb-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/dashboard"}
              className={`h-9 gap-2.5 text-[13px] font-medium rounded-xl px-3 transition-all ${ACTIVE_CLASS.gray}`}
            >
              <Link href="/dashboard">
                <LayoutDashboard className="size-[15px] shrink-0" />
                <span>Overview</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Grouped sections */}
        {NAV.map((section, si) => (
          <div key={section.id}>
            <SidebarSeparator className="mx-2 my-2 bg-sidebar-border" />

            <div className="mb-1.5 px-2 flex items-center gap-2">
              <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-sidebar-foreground/35">
                {section.label}
              </span>
              {section.tag && <NavTag label={section.tag.label} color={section.tag.color} />}
            </div>

            <SidebarMenu className="gap-0.5">
              {section.items.map((item) => {
                const isActive = item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname?.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`h-9 gap-2.5 text-[13px] font-medium rounded-xl px-3 transition-all ${ACTIVE_CLASS[item.accent] ?? ACTIVE_CLASS.gray}`}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-[15px] shrink-0" />
                        <span>{item.label}</span>
                        {item.tag && <NavTag label={item.tag.label} color={item.tag.color} />}
                      </Link>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge className="bg-amber-100 text-amber-700 text-[9px] font-bold min-w-[16px] h-[16px] flex items-center justify-center rounded-full">
                        {item.badge}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </div>
        ))}
      </SidebarContent>

      <SidebarSeparator className="mx-3 bg-sidebar-border" />

      {/* ── Footer ───────────────────────────────────── */}
      <SidebarFooter className="px-3 py-3">
        <DarkModeToggle />
        <div className="h-px bg-sidebar-border my-1" />
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all hover:bg-sidebar-accent cursor-pointer group text-left"
        >
          <div className="relative shrink-0">
            <div className="flex size-8 items-center justify-center rounded-full bg-[oklch(0.58_0.24_350)/15%] ring-1 ring-[oklch(0.58_0.24_350)/25%]">
              <span className="text-[11px] font-bold text-[oklch(0.48_0.22_350)]">{merchantInitials}</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-1 ring-sidebar" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-semibold text-sidebar-foreground leading-none mb-0.5">{merchantName}</p>
            <p className="truncate text-[10px] text-sidebar-foreground/40 leading-none">
              {merchantEmail || "Click to sign out"}
            </p>
          </div>
          <LogOut className="size-3.5 shrink-0 text-sidebar-foreground/25 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
