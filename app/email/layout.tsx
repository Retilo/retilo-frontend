"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ChevronRight } from "lucide-react"

const NAV = [
  { label: "Agent", href: "/email/agent" },
  { label: "Campaigns", href: "/email/campaigns" },
]

export default function EmailLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[oklch(0.985_0.003_270)]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 h-14 flex items-center gap-6">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src="/retilo-fox.svg" alt="Retilo" width={28} height={28} />
            <span className="text-sm font-bold text-zinc-900 tracking-tight">Retilo</span>
            <ChevronRight className="size-3.5 text-zinc-300" />
            <span className="text-sm font-semibold text-violet-600">Email Agent</span>
            <span className="ml-1 rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-violet-600">
              AI
            </span>
          </Link>

          {/* Nav pills */}
          <nav className="flex items-center gap-1 ml-2">
            {NAV.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-violet-50 text-violet-700"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Back to dashboard */}
          <Link
            href="/dashboard"
            className="ml-auto flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <LayoutDashboard className="size-3.5" />
            GMB Dashboard
          </Link>
        </div>
      </header>

      {children}
    </div>
  )
}
