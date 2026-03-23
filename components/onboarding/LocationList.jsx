"use client"

import { motion, AnimatePresence } from "framer-motion"
import { MapPin, Star, CheckCircle2, Clock, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function LocationSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-44 rounded-md" />
          <Skeleton className="h-3 w-60 rounded-md" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-3 w-10 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
    </div>
  )
}

function SyncBadge({ synced }) {
  if (synced) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-[10px] font-semibold text-green-700">
        <CheckCircle2 className="size-3" />
        Synced
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
      <Clock className="size-3" />
      Pending
    </span>
  )
}

export function LocationList({ locations, selected, onToggle, loading, error, onRetry }) {
  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="size-10 rounded-full bg-red-50 flex items-center justify-center">
          <RefreshCw className="size-5 text-red-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-700">Couldn't load locations</p>
          <p className="text-xs text-zinc-400 mt-0.5">{error}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2 mt-1">
          <RefreshCw className="size-3.5" />
          Try again
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <LocationSkeleton key={i} />)}
      </div>
    )
  }

  if (locations.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-zinc-500">No locations found for this account.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      <AnimatePresence>
        {locations.map((loc, i) => {
          const id = loc.id || loc._id || loc.name
          const isSelected = selected.includes(id)
          const name = loc.name || loc.locationName || loc.title
          const address = loc.address || loc.formattedAddress || loc.storefrontAddress?.addressLines?.join(", ")
          const rating = loc.rating ?? loc.averageRating
          const reviews = loc.reviewCount ?? loc.totalReviews
          const synced = loc.synced ?? loc.isSynced ?? false

          return (
            <motion.button
              key={id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: i * 0.07, ease: "easeOut" }}
              onClick={() => onToggle(id)}
              className={cn(
                "group w-full rounded-2xl border p-4 text-left transition-all duration-200",
                isSelected
                  ? "border-blue-200 bg-blue-50/70 ring-1 ring-blue-300/60 shadow-sm shadow-blue-100"
                  : "border-zinc-100 bg-white hover:border-zinc-200 hover:shadow-sm"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {/* Selection indicator */}
                    <div
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
                        isSelected
                          ? "border-blue-600 bg-blue-600"
                          : "border-zinc-300 bg-white group-hover:border-zinc-400"
                      )}
                    >
                      {isSelected && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="size-2.5 text-white"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </motion.svg>
                      )}
                    </div>
                    <p className={cn(
                      "text-sm font-semibold transition-colors",
                      isSelected ? "text-blue-900" : "text-zinc-900"
                    )}>
                      {name}
                    </p>
                  </div>
                  {address && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-zinc-400 pl-6">
                      <MapPin className="size-3 shrink-0" />
                      <span className="truncate">{address}</span>
                    </div>
                  )}
                </div>
                <SyncBadge synced={synced} />
              </div>

              {(rating != null || reviews != null) && (
                <div className="mt-3 flex items-center gap-3 pl-6">
                  {rating != null && (
                    <div className="flex items-center gap-1">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-medium text-zinc-600">{rating}</span>
                    </div>
                  )}
                  {reviews != null && (
                    <span className="text-xs text-zinc-400">{reviews.toLocaleString()} reviews</span>
                  )}
                </div>
              )}
            </motion.button>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
