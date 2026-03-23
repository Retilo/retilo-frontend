"use client"

// Competitors page — discover + track nearby competitors
// API: GET /v1/gmb/competitors, POST /v1/gmb/competitors/discover, GET /v1/gmb/competitors/compare

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Users, Search, Star, Trash2, ChevronDown, TrendingUp, TrendingDown } from "lucide-react"
import { DashboardPageLayout } from "@/components/dashboard/page-layout"
import { api } from "@/lib/api"

export default function CompetitorsPage() {
  const router = useRouter()
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState("")
  const [competitors, setCompetitors] = useState([])
  const [comparison, setComparison] = useState(null)
  const [loading, setLoading] = useState(true)
  const [discovering, setDiscovering] = useState(false)
  const [discoverForm, setDiscoverForm] = useState({ keyword: "", radiusMeters: 1000 })

  useEffect(() => {
    if (!localStorage.getItem("retilo_token")) { router.replace("/auth"); return }
    api.get("/v1/gmb/locations")
      .then(res => {
        const locs = res.data.data ?? []
        setLocations(locs)
        if (locs.length > 0) setSelectedLocation(locs[0].google_location_id)
      })
      .catch(() => setLoading(false))
  }, [router])

  useEffect(() => {
    if (!selectedLocation) return
    setLoading(true)
    Promise.all([
      api.get("/v1/gmb/competitors", { params: { locationId: selectedLocation } }),
      api.get("/v1/gmb/competitors/compare", { params: { locationId: selectedLocation } }),
    ])
      .then(([c, comp]) => {
        setCompetitors(c.data.data ?? [])
        setComparison(comp.data.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedLocation])

  const handleDiscover = async () => {
    if (!selectedLocation) return
    setDiscovering(true)
    try {
      await api.post("/v1/gmb/competitors/discover", {
        locationId: selectedLocation,
        keyword: discoverForm.keyword || undefined,
        radiusMeters: Number(discoverForm.radiusMeters),
        limit: 10,
      })
      // Reload competitors
      const res = await api.get("/v1/gmb/competitors", { params: { locationId: selectedLocation } })
      setCompetitors(res.data.data ?? [])
    } finally {
      setDiscovering(false)
    }
  }

  const handleDelete = async (competitorId) => {
    await api.delete(`/v1/gmb/competitors/${competitorId}`)
    setCompetitors(prev => prev.filter(c => c.id !== competitorId))
  }

  return (
    <DashboardPageLayout
      title="Competitors"
      subtitle="Track nearby competitor ratings and benchmark your locations"
      actions={
        locations.length > 1 && (
          <div className="relative">
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs outline-none cursor-pointer"
            >
              {locations.map(l => <option key={l.id} value={l.google_location_id}>{l.title}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
          </div>
        )
      }
    >
      <div className="max-w-4xl mx-auto px-8 py-6 space-y-6">

        {/* Discover section */}
        <div className="rounded-2xl border border-white/8 bg-[oklch(0.13_0.015_270)] p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Discover nearby competitors</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Keyword (e.g. coffee shop)"
              value={discoverForm.keyword}
              onChange={e => setDiscoverForm(f => ({ ...f, keyword: e.target.value }))}
              className="flex-1 min-w-40 rounded-lg bg-white/5 border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-[oklch(0.65_0.26_280)] placeholder:text-white/25"
            />
            <div className="relative">
              <select
                value={discoverForm.radiusMeters}
                onChange={e => setDiscoverForm(f => ({ ...f, radiusMeters: e.target.value }))}
                className="appearance-none pl-3 pr-8 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none cursor-pointer"
              >
                <option value={500}>500m radius</option>
                <option value={1000}>1km radius</option>
                <option value={2000}>2km radius</option>
                <option value={5000}>5km radius</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
            </div>
            <button
              onClick={handleDiscover}
              disabled={discovering || !selectedLocation}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[oklch(0.55_0.24_280)] hover:bg-[oklch(0.60_0.26_280)] text-white text-sm font-medium transition-all disabled:opacity-60"
            >
              <Search className="w-3.5 h-3.5" />
              {discovering ? "Discovering…" : "Discover"}
            </button>
          </div>
        </div>

        {/* Comparison table */}
        {comparison && (
          <div className="rounded-2xl border border-white/8 bg-[oklch(0.13_0.015_270)] p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Comparison</h3>
            <div className="space-y-2">
              {/* Your location */}
              <div className="flex items-center gap-4 rounded-xl bg-[oklch(0.55_0.24_280)/10%] border border-[oklch(0.55_0.24_280)/25%] px-4 py-3">
                <div className="w-2 h-2 rounded-full bg-[oklch(0.65_0.26_280)] flex-shrink-0" />
                <span className="text-sm font-medium text-white flex-1">{comparison.yours?.name ?? "Your location"}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-bold text-white">{comparison.yours?.rating?.toFixed(1)}</span>
                </div>
                <span className="text-xs text-white/40">{comparison.yours?.reviewCount} reviews</span>
                <span className="px-2 py-0.5 rounded-full bg-[oklch(0.55_0.24_280)/20%] text-[oklch(0.80_0.18_280)] text-[10px] font-semibold">YOU</span>
              </div>
              {/* Competitors */}
              {(comparison.competitors ?? []).map((c, i) => {
                const ratingDiff = (c.rating ?? 0) - (comparison.yours?.rating ?? 0)
                return (
                  <div key={i} className="flex items-center gap-4 rounded-xl bg-white/3 border border-white/8 px-4 py-3">
                    <div className="w-2 h-2 rounded-full bg-white/20 flex-shrink-0" />
                    <span className="text-sm text-white/70 flex-1">{c.name}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-400/60 text-yellow-400/60" />
                      <span className="text-sm text-white/70">{c.rating?.toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-white/40">{c.reviewCount} reviews</span>
                    <div className={`flex items-center gap-0.5 text-[10px] font-medium ${ratingDiff > 0 ? "text-red-400" : "text-green-400"}`}>
                      {ratingDiff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(ratingDiff).toFixed(1)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tracked competitors list */}
        {competitors.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/30">Tracked competitors</h3>
            {competitors.map(c => (
              <div key={c.id} className="flex items-center gap-4 rounded-xl border border-white/8 bg-[oklch(0.13_0.015_270)] px-4 py-3 hover:border-white/12 transition-all">
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{c.name}</div>
                  {c.address && <div className="text-xs text-white/35">{c.address}</div>}
                </div>
                {c.rating != null && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-white">{c.rating?.toFixed(1)}</span>
                  </div>
                )}
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-white/20 hover:text-red-400 transition-colors"
                  title="Stop tracking"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && competitors.length === 0 && !comparison && (
          <div className="text-center py-20 text-white/30">
            <Users className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No competitors tracked yet. Use Discover above to find nearby businesses.</p>
          </div>
        )}
      </div>
    </DashboardPageLayout>
  )
}
