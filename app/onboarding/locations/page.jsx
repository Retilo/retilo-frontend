"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import { AccountInfo } from "@/components/onboarding/AccountInfo"
import { LocationList } from "@/components/onboarding/LocationList"
import { ProcessingOverlay } from "@/components/onboarding/ProcessingOverlay"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { apiFetch } from "@/lib/api"

export default function LocationsPage() {
  const router = useRouter()

  const [account, setAccount] = useState(null)
  const [locations, setLocations] = useState([])
  const [selected, setSelected] = useState([])
  const [loadingAccount, setLoadingAccount] = useState(true)
  const [loadingLocations, setLoadingLocations] = useState(true)
  const [locationError, setLocationError] = useState(null)
  const [processing, setProcessing] = useState(false)
  const ran = useRef(false)

  const fetchData = async () => {
    setLoadingAccount(true)
    setLoadingLocations(true)
    setLocationError(null)

    // Fetch in parallel
    const [connResult, locResult] = await Promise.allSettled([
      apiFetch("/v1/gmb/oauth/connections"),
      apiFetch("/v1/gmb/locations"),
    ])

    // Account
    if (connResult.status === "fulfilled") {
      const raw = connResult.value
      const connections = Array.isArray(raw) ? raw : (raw?.connections ?? raw?.data ?? [])
      if (connections.length > 0) {
        setAccount(connections[0])
      }
    }
    setLoadingAccount(false)

    // Locations
    if (locResult.status === "fulfilled") {
      const raw = locResult.value
      const locs = Array.isArray(raw) ? raw : (raw?.locations ?? raw?.data ?? [])
      setLocations(locs)
      setSelected(locs.map((l) => [l.google_location_id, l.email]))
    } else {
      setLocationError(locResult.reason?.message ?? "Failed to load locations")
    }
    setLoadingLocations(false)
  }

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    fetchData()
  }, [])

  const toggleLocation = (id) => {
    setSelected((s) => (s.includes(id) ? s.filter((i) => i !== id) : [...s, id]))
  }

  const handleStartAnalysis = async () => {
    if (selected.length === 0) return
    setProcessing(true)
    // selected will be in [google_location_id, email]
    const locationIds = selected.map((l) => l[0])
    const email = selected[0]
    // one year for start date
    const startDate = new Date()
    startDate.setFullYear(startDate.getFullYear() - 1);
    const endDate = new Date();
    await Promise.allSettled([
      apiFetch("/v1/gmb/locations/sync", {
        method: "POST",
        body: JSON.stringify({ locationIds, email }),
      }),
      apiFetch("/v1/gmb/analytics/sync", {
        method: "POST",
        body: JSON.stringify({ locationId: locationIds[0], email, startDate, endDate }),
      }),
    ])

    // Minimum display time so the animation feels intentional
    await new Promise((r) => setTimeout(r, MESSAGES_DURATION))

    router.push("/dashboard")
  }

  // Keep overlay up for the full message rotation
  const MESSAGES_DURATION = 8 * 1600 + 600

  const accountEmail =
    account?.email ??
    account?.googleEmail ??
    account?.google_email ??
    account?.accountEmail

  const allSelected = locations.length > 0 && selected.length === locations.length
  const noneSelected = selected.length === 0

  return (
    <>
      <ProcessingOverlay visible={processing} locationCount={selected.length} />

      <div className="min-h-screen bg-white">
        {/* Subtle gradient header */}
        <div className="relative overflow-hidden border-b border-zinc-100 bg-gradient-to-br from-zinc-50 via-blue-50/30 to-zinc-50 px-6 pt-14 pb-10">
          {/* Background glow */}
          <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 size-80 rounded-full bg-blue-400/8 blur-3xl" />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative mx-auto max-w-lg text-center"
          >
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1">
              <Sparkles className="size-3 text-blue-500" />
              <span className="text-[11px] font-semibold tracking-wide text-blue-600 uppercase">
                System Activation
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 leading-snug">
              Set up your business intelligence
            </h1>
            <p className="mt-2.5 text-sm text-zinc-500 leading-relaxed max-w-sm mx-auto">
              Select the locations you want to analyse. Retilo will pull in your reviews, ratings, and signals — then start watching in real time.
            </p>
          </motion.div>
        </div>

        {/* Main content */}
        <div className="mx-auto max-w-lg px-6 py-8 space-y-6">

          {/* Connected account */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
              Connected Account
            </p>
            <AccountInfo email={accountEmail} loading={loadingAccount} />
          </motion.div>

          <Separator className="bg-zinc-100" />

          {/* Location list */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                Business Locations
                {!loadingLocations && locations.length > 0 && (
                  <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-500 tabular-nums normal-case tracking-normal">
                    {locations.length}
                  </span>
                )}
              </p>
              {!loadingLocations && locations.length > 1 && (
                <button
                  onClick={() => {
                    if (allSelected) {
                      setSelected([])
                    } else {
                      setSelected(locations.map((l) => l.id || l._id || l.name))
                    }
                  }}
                  className="text-[11px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {allSelected ? "Deselect all" : "Select all"}
                </button>
              )}
            </div>

            <LocationList
              locations={locations}
              selected={selected}
              onToggle={toggleLocation}
              loading={loadingLocations}
              error={locationError}
              onRetry={fetchData}
            />
          </motion.div>
        </div>

        {/* Sticky CTA footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.35 }}
          className="sticky bottom-0 border-t border-zinc-100 bg-white/90 backdrop-blur-sm px-6 py-4"
        >
          <div className="mx-auto max-w-lg flex items-center justify-between gap-4">
            <div>
              {noneSelected ? (
                <p className="text-sm text-zinc-400">Select at least one location</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-zinc-900">
                    {selected.length} location{selected.length !== 1 ? "s" : ""} selected
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">Ready to start analysis</p>
                </>
              )}
            </div>
            <Button
              onClick={handleStartAnalysis}
              disabled={noneSelected || processing || loadingLocations}
              className="h-10 gap-2 bg-blue-600 px-5 font-medium text-white hover:bg-blue-700 disabled:opacity-40 shrink-0"
            >
              <Sparkles className="size-4" />
              Start Analysis
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </>
  )
}
