"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/dashboard/sidebar"
import { AlertCard } from "@/components/dashboard/alert-card"
import { ActionCard } from "@/components/dashboard/action-card"
import { StatCard } from "@/components/dashboard/stat-card"
import { SignalFeed } from "@/components/dashboard/signal-feed"
import { GmbConnect } from "@/components/onboarding/gmb-connect"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

/* ─── Static data ─────────────────────────────────────────────── */

const stats = [
  { id: 1, label: "Open Alerts", value: "7", sub: "2 high priority", variant: "danger" as const },
  { id: 2, label: "Avg Rating", value: "4.1", sub: "across 9 stores", trend: { dir: "down" as const, label: "↓ 0.2 this week" } },
  { id: 3, label: "Total Reviews", value: "742", sub: "this month", variant: "default" as const },
  { id: 4, label: "Unread", value: "5", sub: "need reply now", variant: "warning" as const },
]

const alerts = [
  { id: 1, severity: "high", title: "5 unanswered 1-star reviews", description: "Posted in the last 4 hours — customers are waiting for a response", count: "5 new" },
  { id: 2, severity: "high", title: "Store #7 — critical inventory shortage", description: "3 top-selling SKUs are below the minimum reorder threshold", count: "3 SKUs" },
  { id: 3, severity: "medium", title: "Weekend staffing gap — Store #3", description: "Sunday open shift uncovered, 2 days away" },
  { id: 4, severity: "low", title: "12 review responses pending approval", description: "Draft replies are saved and ready to publish", count: "12" },
]

const actions = [
  { id: 1, title: "Reply to Sarah M.'s 1-star review", store: "Store #2 · George St · Google Reviews", description: '"Waited 30 min, no staff acknowledged us." — posted 2h ago', actionLabel: "Reply", actionVariant: "reply" },
  { id: 2, title: "Reorder SKU-4521 — Oat Milk 1L", store: "Store #7 · Newtown · Inventory", description: "4 units remaining. Average daily sell-through: 18 units.", actionLabel: "Fix", actionVariant: "fix" },
  { id: 3, title: "Cover Sunday open shift", store: "Store #3 · Surry Hills · Scheduling", description: "8:00 AM – 2:00 PM uncovered. 2 nearby staff available.", actionLabel: "Investigate", actionVariant: "investigate" },
  { id: 4, title: "Send 12 pending review replies", store: "All stores · Reviews", description: "Drafts have been saved and are ready to send.", actionLabel: "Review", actionVariant: "review" },
]

const signals = [
  { id: 1, customerName: "Sarah M.", rating: 1, storeName: "Store #2 · George St", platform: "Google", reviewText: "Waited over 30 minutes and not a single staff member acknowledged us. Extremely disappointing experience for a Sunday afternoon.", timeAgo: "2h ago", sentiment: "negative" },
  { id: 2, customerName: "James T.", rating: 4, storeName: "Store #5 · Westfield", platform: "Google", reviewText: "Great selection and friendly service. The checkout line was a bit long but staff were efficient once I got there.", timeAgo: "3h ago", sentiment: "positive" },
  { id: 3, customerName: "Priya K.", rating: 2, storeName: "Store #7 · Newtown", platform: "Yelp", reviewText: "Went to grab my usual oat milk and they were completely out. Happens way too often at this location.", timeAgo: "4h ago", sentiment: "negative" },
  { id: 4, customerName: "Ben R.", rating: 5, storeName: "Store #1 · CBD", platform: "Google", reviewText: "Best store in the chain. Always stocked, always clean, and the team actually knows the products inside out.", timeAgo: "5h ago", sentiment: "positive" },
  { id: 5, customerName: "Mia C.", rating: 3, storeName: "Store #3 · Surry Hills", platform: "Google", reviewText: "Average experience. Nothing wrong, nothing special. Would be nice if they had more staff on weekends.", timeAgo: "6h ago", sentiment: "neutral" },
]

/* ─── Dashboard content ───────────────────────────────────────── */

function DashboardContent() {
  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white/80 backdrop-blur-sm px-8 py-4">
        <div>
          <h1 className="text-base font-semibold text-zinc-900">Command Center</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Sunday, 22 March · 9 active stores · Sydney, NSW</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2 animate-pulse rounded-full bg-green-500" />
          <span className="text-xs font-medium text-zinc-400">Live</span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-8 py-7 space-y-8">

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3">
            {stats.map((s) => (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <StatCard key={s.id} {...(s as any)} />
            ))}
          </div>

          {/* Today's Priorities */}
          <section>
            <SectionHeader title="Today's Priorities" count={alerts.length} />
            <div className="mt-3 space-y-2">
              {alerts.map((a) => (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <AlertCard key={a.id} {...(a as any)} />
              ))}
            </div>
          </section>

          {/* Recommended Actions */}
          <section>
            <SectionHeader title="Recommended Actions" count={actions.length} />
            <div className="mt-3 space-y-2">
              {actions.map((a) => (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <ActionCard key={a.id} {...(a as any)} />
              ))}
            </div>
          </section>

          {/* Live Customer Signals */}
          <section>
            <SectionHeader title="Live Customer Signals" live />
            <div className="mt-3">
              <SignalFeed signals={signals} />
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}

function SectionHeader({
  title,
  count,
  live,
}: {
  title: string
  count?: number
  live?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
        {title}
      </h2>
      {count !== undefined && (
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-500 tabular-nums">
          {count}
        </span>
      )}
      {live && (
        <div className="flex items-center gap-1 ml-1">
          <div className="size-1.5 animate-pulse rounded-full bg-green-500" />
          <span className="text-[10px] font-semibold text-green-600">Live</span>
        </div>
      )}
    </div>
  )
}

/* ─── Page ────────────────────────────────────────────────────── */

export default function Dashboard() {
  const [isConnected, setIsConnected] = useState(false)

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="relative min-h-screen overflow-hidden">
        {/* Dashboard — blurred skeleton when not yet connected */}
        <div
          className={cn(
            "h-full transition-all duration-500",
            !isConnected && "pointer-events-none select-none blur-[3px] brightness-95"
          )}
        >
          <DashboardContent />
        </div>

        {/* GMB onboarding overlay */}
        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/10 backdrop-blur-[2px]">
            <GmbConnect onComplete={() => setIsConnected(true)} />
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
