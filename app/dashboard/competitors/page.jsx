"use client"

// Competitors page — discover + track nearby competitors
// API: GET /v1/gmb/competitors, POST /v1/gmb/competitors/discover, GET /v1/gmb/competitors/compare

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Users, Search, Star, Trash2, ChevronDown, TrendingUp, TrendingDown } from "lucide-react"
import { DashboardPageLayout } from "@/components/dashboard/page-layout"
import { api } from "@/lib/api"

const PINK = "oklch(0.58 0.24 350)"
const CARD_BG = "oklch(1 0 0)"
const CARD_BORDER = "oklch(0.91 0.008 350)"
const TEXT = "oklch(0.14 0.008 270)"
const TEXT_MUTED = "oklch(0.55 0.008 270)"
const TEXT_FAINT = "oklch(0.65 0.008 270)"
const INPUT_BG = "oklch(0.96 0.005 350)"
const INPUT_BORDER = "oklch(0.90 0.008 350)"

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

  const inputStyle = { background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }

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
              className="appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
              style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT_MUTED }}
            >
              {locations.map(l => <option key={l.id} value={l.google_location_id}>{l.title}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: TEXT_FAINT }} />
          </div>
        )
      }
    >
      <div className="max-w-4xl mx-auto px-8 py-6 space-y-6">

        {/* Discover section */}
        <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: TEXT }}>Discover nearby competitors</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Keyword (e.g. coffee shop)"
              value={discoverForm.keyword}
              onChange={e => setDiscoverForm(f => ({ ...f, keyword: e.target.value }))}
              className="flex-1 min-w-40 rounded-lg text-sm px-3 py-2 outline-none transition-colors"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = PINK}
              onBlur={e => e.target.style.borderColor = INPUT_BORDER}
            />
            <div className="relative">
              <select
                value={discoverForm.radiusMeters}
                onChange={e => setDiscoverForm(f => ({ ...f, radiusMeters: e.target.value }))}
                className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm outline-none cursor-pointer"
                style={inputStyle}
              >
                <option value={500}>500m radius</option>
                <option value={1000}>1km radius</option>
                <option value={2000}>2km radius</option>
                <option value={5000}>5km radius</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: TEXT_FAINT }} />
            </div>
            <button
              onClick={handleDiscover}
              disabled={discovering || !selectedLocation}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-60 hover:opacity-90"
              style={{ background: PINK }}
            >
              <Search className="w-3.5 h-3.5" />
              {discovering ? "Discovering…" : "Discover"}
            </button>
          </div>
        </div>

        {/* Comparison table */}
        {comparison && (
          <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: TEXT }}>Comparison</h3>
            <div className="space-y-2">
              {/* Your location */}
              <div
                className="flex items-center gap-4 rounded-xl px-4 py-3"
                style={{ background: `${PINK}08`, border: `1px solid ${PINK}25` }}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PINK }} />
                <span className="text-sm font-medium flex-1" style={{ color: TEXT }}>{comparison.yours?.name ?? "Your location"}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-bold" style={{ color: TEXT }}>{comparison.yours?.rating?.toFixed(1)}</span>
                </div>
                <span className="text-xs" style={{ color: TEXT_FAINT }}>{comparison.yours?.reviewCount} reviews</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: `${PINK}18`, color: PINK }}>YOU</span>
              </div>
              {/* Competitors */}
              {(comparison.competitors ?? []).map((c, i) => {
                const ratingDiff = (c.rating ?? 0) - (comparison.yours?.rating ?? 0)
                return (
                  <div
                    key={i}
                    className="flex items-center gap-4 rounded-xl px-4 py-3 transition-all hover:shadow-sm"
                    style={{ background: "oklch(0.975 0.003 350)", border: `1px solid ${CARD_BORDER}` }}
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "oklch(0.80 0.005 270)" }} />
                    <span className="text-sm flex-1" style={{ color: TEXT_MUTED }}>{c.name}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />
                      <span className="text-sm" style={{ color: TEXT_MUTED }}>{c.rating?.toFixed(1)}</span>
                    </div>
                    <span className="text-xs" style={{ color: TEXT_FAINT }}>{c.reviewCount} reviews</span>
                    <div className={`flex items-center gap-0.5 text-[10px] font-medium ${ratingDiff > 0 ? "text-red-500" : "text-emerald-600"}`}>
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
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: TEXT_FAINT }}>Tracked competitors</h3>
            {competitors.map(c => (
              <div
                key={c.id}
                className="flex items-center gap-4 rounded-xl px-4 py-3 transition-all hover:shadow-sm"
                style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
              >
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: TEXT }}>{c.name}</div>
                  {c.address && <div className="text-xs" style={{ color: TEXT_FAINT }}>{c.address}</div>}
                </div>
                {c.rating != null && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm" style={{ color: TEXT }}>{c.rating?.toFixed(1)}</span>
                  </div>
                )}
                <button
                  onClick={() => handleDelete(c.id)}
                  className="transition-colors hover:text-red-500"
                  style={{ color: TEXT_FAINT }}
                  title="Stop tracking"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && competitors.length === 0 && !comparison && (
          <div className="text-center py-20" style={{ color: TEXT_FAINT }}>
            <Users className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No competitors tracked yet. Use Discover above to find nearby businesses.</p>
          </div>
        )}
      </div>
    </DashboardPageLayout>
  )
}
