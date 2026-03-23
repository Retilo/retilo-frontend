"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

function GoogleColorRing({ className }) {
  return (
    <div className={cn("relative shrink-0", className)}>
      <svg viewBox="0 0 40 40" className="size-full">
        <circle cx="20" cy="20" r="18" fill="none" stroke="#4285F4" strokeWidth="2.5" strokeDasharray="28 84" strokeLinecap="round" />
        <circle cx="20" cy="20" r="18" fill="none" stroke="#34A853" strokeWidth="2.5" strokeDasharray="28 84" strokeDashoffset="-28" strokeLinecap="round" />
        <circle cx="20" cy="20" r="18" fill="none" stroke="#FBBC05" strokeWidth="2.5" strokeDasharray="28 84" strokeDashoffset="-56" strokeLinecap="round" />
        <circle cx="20" cy="20" r="18" fill="none" stroke="#EA4335" strokeWidth="2.5" strokeDasharray="28 84" strokeDashoffset="-84" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export function AccountInfo({ email, loading }) {
  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/60 px-4 py-3">
        <Skeleton className="size-9 rounded-full shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-40 rounded" />
          <Skeleton className="h-2.5 w-28 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/60 px-4 py-3">
      <GoogleColorRing className="size-9" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-zinc-900">{email}</p>
        <p className="text-[11px] text-zinc-400 mt-0.5">Google Business account · Connected</p>
      </div>
      <div className="ml-auto flex items-center gap-1.5 shrink-0">
        <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[11px] font-medium text-green-600">Active</span>
      </div>
    </div>
  )
}
