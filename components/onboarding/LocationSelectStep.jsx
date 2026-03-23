"use client"

import { useState, useEffect } from "react"
import { MapPin, Star, ChevronRight, RefreshCw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { apiFetch } from "@/lib/api"

function LocationSkeleton() {
  return (
    <div className="w-full rounded-xl border border-zinc-200 bg-white p-3.5 space-y-2.5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 w-36 rounded bg-zinc-200" />
          <div className="h-3 w-52 rounded bg-zinc-100" />
        </div>
        <div className="size-5 rounded-full bg-zinc-200 mt-0.5 shrink-0" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-3 w-10 rounded bg-zinc-200" />
        <div className="h-3 w-20 rounded bg-zinc-100" />
        <div className="h-4 w-16 rounded-full bg-zinc-100" />
      </div>
    </div>
  )
}

export function LocationSelectStep({ onNext }) {
  const [locations, setLocations] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchLocations = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch("/v1/gmb/locations")
      const locs = Array.isArray(data) ? data : (data.locations || data.data || [])
      setLocations(locs)
      setSelected(locs.map((l) => l.id || l._id))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  const toggle = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((i) => i !== id) : [...s, id]))

  const handleContinue = async () => {
    setSubmitting(true)
    try {
      await apiFetch("/v1/gmb/locations/sync", {
        method: "POST",
        body: JSON.stringify({ locationIds: selected }),
      })
    } catch {
      // Non-fatal — proceed to processing regardless
    }
    onNext(locations.filter((l) => selected.includes(l.id || l._id)))
  }

  return (
    <div className="flex flex-col w-full">
      <h2 className="text-lg font-semibold text-zinc-900">Select locations</h2>
      <p className="mt-1 text-sm text-zinc-500">
        {loading
          ? "Finding your linked locations…"
          : error
          ? "Could not load locations"
          : `We found ${locations.length} location${locations.length !== 1 ? "s" : ""} linked to your account.`}
      </p>

      <div className="mt-4 space-y-2">
        {loading && [1, 2, 3].map((i) => <LocationSkeleton key={i} />)}

        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-zinc-500">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchLocations} className="gap-2">
              <RefreshCw className="size-3.5" />
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && locations.map((loc) => {
          const id = loc.id || loc._id
          const isSelected = selected.includes(id)
          const rating = loc.rating ?? loc.averageRating
          const reviews = loc.reviewCount ?? loc.totalReviews ?? loc.reviews
          const pending = loc.pendingReplies ?? loc.unrepliedCount ?? 0

          return (
            <button
              key={id}
              onClick={() => toggle(id)}
              className={cn(
                "w-full rounded-xl border p-3.5 text-left transition-all",
                isSelected
                  ? "border-blue-200 bg-blue-50 ring-1 ring-blue-200"
                  : "border-zinc-200 bg-white hover:border-zinc-300"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-900">
                    {loc.name || loc.locationName}
                  </p>
                  {(loc.address || loc.formattedAddress) && (
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500">
                      <MapPin className="size-3 shrink-0" />
                      <span className="truncate">{loc.address || loc.formattedAddress}</span>
                    </div>
                  )}
                </div>
                <div
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    isSelected ? "border-blue-600 bg-blue-600" : "border-zinc-300 bg-white"
                  )}
                >
                  {isSelected && (
                    <svg className="size-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>

              <div className="mt-2.5 flex items-center gap-3">
                {rating != null && (
                  <div className="flex items-center gap-1">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium text-zinc-700">{rating}</span>
                  </div>
                )}
                {reviews != null && (
                  <span className="text-xs text-zinc-400">{reviews} reviews</span>
                )}
                {pending > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                    {pending} pending
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {!loading && !error && locations.length > 0 && (
        <Button
          onClick={handleContinue}
          disabled={selected.length === 0 || submitting}
          className="mt-5 h-10 w-full gap-2 bg-blue-600 font-medium text-white hover:bg-blue-700"
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {submitting
            ? "Setting up…"
            : `Monitor ${selected.length} location${selected.length !== 1 ? "s" : ""}`}
          {!submitting && <ChevronRight className="size-3.5" />}
        </Button>
      )}
    </div>
  )
}
