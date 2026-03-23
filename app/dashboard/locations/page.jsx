"use client"

// Locations page — manage connected GMB locations and their settings
// API: GET /v1/gmb/locations, PATCH /v1/gmb/locations/:id/settings, POST /v1/gmb/locations/sync

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MapPin, RefreshCw, ToggleLeft, ToggleRight, Sparkles, Star, MessageSquare, Bot } from "lucide-react"
import { DashboardPageLayout } from "@/components/dashboard/page-layout"
import { api } from "@/lib/api"

function LocationCard({ location, onSettingsChange, onSync }) {
  const [settings, setSettings] = useState({
    ai_enable: location.ai_enable ?? false,
    auto_replies: location.auto_replies ?? false,
    status: location.status ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    setSaving(true)
    try {
      await onSettingsChange(location.id, { [key]: value })
    } catch {
      // revert on error
      setSettings(settings)
    } finally {
      setSaving(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      await onSync(location.google_location_id)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-[oklch(0.13_0.015_270)] overflow-hidden hover:border-white/12 transition-all">
      {/* Header */}
      <div className="flex items-start gap-4 p-5">
        <div className="w-10 h-10 rounded-xl bg-[oklch(0.55_0.24_280)/20%] flex items-center justify-center flex-shrink-0">
          <MapPin className="w-5 h-5 text-[oklch(0.75_0.20_280)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white truncate">{location.title}</h3>
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${location.status ? "bg-green-400" : "bg-white/20"}`} />
          </div>
          <p className="text-xs text-white/40 mt-0.5">{location.email}</p>
          <p className="text-[10px] text-white/25 mt-0.5 font-mono">{location.google_location_id}</p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          {location.average_rating != null && (
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-bold text-white">{location.average_rating?.toFixed(1)}</span>
              </div>
              <div className="text-[10px] text-white/30">{location.total_review_count} reviews</div>
            </div>
          )}
          {location.response_rate != null && (
            <div className="text-right">
              <div className="text-sm font-bold text-white">{location.response_rate}%</div>
              <div className="text-[10px] text-white/30">reply rate</div>
            </div>
          )}
        </div>
      </div>

      {/* Settings toggles */}
      <div className="border-t border-white/8 px-5 py-3 flex items-center gap-6">
        <ToggleSwitch
          label="AI Replies"
          icon={<Sparkles className="w-3 h-3" />}
          checked={settings.ai_enable}
          onChange={(v) => updateSetting("ai_enable", v)}
          disabled={saving}
        />
        <ToggleSwitch
          label="Auto-post"
          icon={<Bot className="w-3 h-3" />}
          checked={settings.auto_replies}
          onChange={(v) => updateSetting("auto_replies", v)}
          disabled={saving}
        />
        <div className="ml-auto">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/4 hover:bg-white/8 text-white/50 hover:text-white text-xs transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
            Sync reviews
          </button>
        </div>
      </div>
    </div>
  )
}

function ToggleSwitch({ label, icon, checked, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className="flex items-center gap-2 text-xs text-white/50 hover:text-white/80 transition-colors disabled:opacity-60"
    >
      <span className={`transition-colors ${checked ? "text-[oklch(0.75_0.20_280)]" : "text-white/30"}`}>{icon}</span>
      <span>{label}</span>
      <div className={`w-8 h-4 rounded-full transition-colors relative ${checked ? "bg-[oklch(0.55_0.24_280)]" : "bg-white/15"}`}>
        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
      </div>
    </button>
  )
}

export default function LocationsPage() {
  const router = useRouter()
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [connectingGMB, setConnectingGMB] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem("retilo_token")) { router.replace("/auth"); return }
    api.get("/v1/gmb/locations")
      .then(res => setLocations(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  const handleSettingsChange = async (locationId, settings) => {
    await api.patch(`/v1/gmb/locations/${locationId}/settings`, settings)
  }

  const handleSync = async (locationId) => {
    await api.post("/v1/gmb/reviews/sync", { locationId })
    await api.post("/v1/gmb/analytics/sync", { locationId })
  }

  const handleConnectGMB = async () => {
    setConnectingGMB(true)
    try {
      const res = await api.get("/v1/gmb/oauth/connect")
      window.location.href = res.data.data.url
    } catch {
      setConnectingGMB(false)
    }
  }

  return (
    <DashboardPageLayout
      title="Locations"
      subtitle={`${locations.length} Google Business location${locations.length !== 1 ? "s" : ""} connected`}
      actions={
        <button
          onClick={handleConnectGMB}
          disabled={connectingGMB}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[oklch(0.55_0.24_280)] hover:bg-[oklch(0.60_0.26_280)] text-white text-xs font-semibold transition-all disabled:opacity-60"
        >
          {connectingGMB ? "Redirecting…" : "+ Connect Google Business"}
        </button>
      }
    >
      <div className="max-w-3xl mx-auto px-8 py-6 space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/4 border border-white/8 animate-pulse" />
          ))
        ) : locations.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-[oklch(0.55_0.24_280)/15%] flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-7 h-7 text-[oklch(0.75_0.20_280)]" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">No locations yet</h3>
            <p className="text-sm text-white/40 mb-6">Connect your Google Business account to get started.</p>
            <button
              onClick={handleConnectGMB}
              className="px-5 py-2.5 rounded-xl bg-[oklch(0.55_0.24_280)] hover:bg-[oklch(0.60_0.26_280)] text-white text-sm font-semibold transition-colors"
            >
              Connect Google Business
            </button>
          </div>
        ) : (
          locations.map(loc => (
            <LocationCard
              key={loc.id}
              location={loc}
              onSettingsChange={handleSettingsChange}
              onSync={handleSync}
            />
          ))
        )}
      </div>
    </DashboardPageLayout>
  )
}
