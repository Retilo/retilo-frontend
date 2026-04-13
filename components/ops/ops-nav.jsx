"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Activity, MessageSquare, Bot, Workflow,
  Plug, Zap, LogOut, Settings, ChevronRight,
} from "lucide-react"
import { useState } from "react"

const NAV_ITEMS = [
  { icon: Activity,       label: "Event Feed",      href: "/ops",                exact: true },
  { icon: MessageSquare,  label: "Conversations",   href: "/ops/conversations" },
  { icon: Bot,            label: "Agents",          href: "/ops/agents" },
  { icon: Workflow,       label: "Workflows",       href: "/ops/workflows" },
]

const BOTTOM_ITEMS = [
  { icon: Plug,     label: "Integrations", href: "/integrations" },
  { icon: Settings, label: "Settings",     href: "/ops/settings" },
]

export function OpsNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)

  const handleSignOut = () => {
    localStorage.removeItem("retilo_token")
    localStorage.removeItem("retilo_merchant")
    router.replace("/auth")
  }

  let merchantInitials = "ME"
  if (typeof window !== "undefined") {
    try {
      const m = JSON.parse(localStorage.getItem("retilo_merchant") ?? "{}")
      if (m.name) merchantInitials = m.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    } catch {}
  }

  const isActive = (item) => item.exact
    ? pathname === item.href
    : pathname === item.href || pathname?.startsWith(item.href + "/")

  const width = expanded ? 200 : 60

  return (
    <nav
      className="flex flex-col border-r shrink-0 transition-all duration-200 overflow-hidden"
      style={{
        width,
        background: "oklch(0.10 0.018 270)",
        borderColor: "oklch(0.18 0.018 270)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-3.5 border-b shrink-0"
        style={{ height: 56, borderColor: "oklch(0.18 0.018 270)" }}
      >
        <Link href="/ops" className="flex items-center gap-3 min-w-0">
          <div
            className="size-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "oklch(0.58 0.24 350)" }}
          >
            <Zap className="size-4 text-white" strokeWidth={2.5} />
          </div>
          {expanded && (
            <span className="text-[14px] font-bold tracking-tight text-white truncate">
              Retilo
            </span>
          )}
        </Link>
        {expanded && (
          <button
            onClick={() => setExpanded(false)}
            className="ml-auto text-[oklch(0.50_0.010_270)] hover:text-white transition-colors shrink-0"
          >
            <ChevronRight className="size-3.5 rotate-180" />
          </button>
        )}
      </div>

      {/* Main nav */}
      <div className="flex-1 flex flex-col gap-0.5 py-3 px-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={!expanded ? item.label : undefined}
              className="flex items-center gap-3 rounded-xl px-2.5 transition-all group"
              style={{
                height: 40,
                background: active ? "oklch(0.58 0.24 350 / 18%)" : "transparent",
                color: active ? "oklch(0.85 0.08 350)" : "oklch(0.60 0.010 270)",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "oklch(0.16 0.018 270)" }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent" }}
            >
              <item.icon className="size-[18px] shrink-0" strokeWidth={active ? 2.2 : 1.8} />
              {expanded && (
                <span className="text-[13px] font-medium truncate">{item.label}</span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Bottom nav */}
      <div className="flex flex-col gap-0.5 px-2 pb-2">
        {BOTTOM_ITEMS.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={!expanded ? item.label : undefined}
              className="flex items-center gap-3 rounded-xl px-2.5 transition-all"
              style={{
                height: 38,
                background: active ? "oklch(0.58 0.24 350 / 18%)" : "transparent",
                color: active ? "oklch(0.85 0.08 350)" : "oklch(0.50 0.010 270)",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "oklch(0.16 0.018 270)" }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent" }}
            >
              <item.icon className="size-[16px] shrink-0" strokeWidth={1.8} />
              {expanded && (
                <span className="text-[12px] font-medium truncate">{item.label}</span>
              )}
            </Link>
          )
        })}

        {/* Divider */}
        <div className="my-1 mx-1 border-t" style={{ borderColor: "oklch(0.18 0.018 270)" }} />

        {/* Expand toggle */}
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            title="Expand sidebar"
            className="flex items-center justify-center rounded-xl transition-all"
            style={{ height: 38, color: "oklch(0.40 0.010 270)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "oklch(0.16 0.018 270)"; e.currentTarget.style.color = "oklch(0.65 0.010 270)" }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "oklch(0.40 0.010 270)" }}
          >
            <ChevronRight className="size-3.5" />
          </button>
        )}

        {/* User avatar */}
        <button
          onClick={handleSignOut}
          title="Sign out"
          className="flex items-center gap-3 rounded-xl px-2.5 transition-all group"
          style={{ height: 40, color: "oklch(0.50 0.010 270)" }}
          onMouseEnter={e => { e.currentTarget.style.background = "oklch(0.16 0.018 270)" }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
        >
          <div
            className="size-7 rounded-full flex items-center justify-center shrink-0 ring-1"
            style={{ background: "oklch(0.58 0.24 350 / 20%)", ringColor: "oklch(0.58 0.24 350 / 30%)" }}
          >
            <span className="text-[10px] font-bold" style={{ color: "oklch(0.75 0.10 350)" }}>
              {merchantInitials}
            </span>
          </div>
          {expanded && (
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[12px] font-medium truncate text-[oklch(0.65_0.010_270)]">Sign out</span>
              <LogOut className="size-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
          )}
        </button>
      </div>
    </nav>
  )
}
