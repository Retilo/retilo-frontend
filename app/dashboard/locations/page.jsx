"use client"

// Locations page — manage connected GMB locations and their settings
// API: GET /v1/gmb/locations, PATCH /v1/gmb/locations/:id/settings, POST /v1/gmb/locations/sync

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MapPin, RefreshCw, Sparkles, Star, Bot } from "lucide-react"
import { DashboardPageLayout } from "@/components/dashboard/page-layout"
import { api } from "@/lib/api"

const PINK = "oklch(0.58 0.24 350)"
const CARD_BG = "oklch(1 0 0)"
const CARD_BORDER = "oklch(0.91 0.008 350)"
const CARD_BORDER_HOVER = "oklch(0.86 0.012 350)"
const TEXT = "oklch(0.14 0.008 270)"
const TEXT_MUTED = "oklch(0.55 0.008 270)"
const TEXT_FAINT = "oklch(0.65 0.008 270)"

function ToggleSwitch({ label, icon, checked, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className="flex items-center gap-2 text-xs transition-colors disabled:opacity-60"
      style={{ color: TEXT_MUTED }}
    >
      <span style={{ color: checked ? PINK : TEXT_FAINT }}>{icon}</span>
      <span>{label}</span>
      <div
        className="w-8 h-4 rounded-full transition-colors relative"
        style={{ background: checked ? PINK : "oklch(0.88 0.005 270)" }}
      >
        <div
          className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform"
          style={{ transform: checked ? "translateX(16px)" : "translateX(2px)" }}
        />
      </div>
    </button>
  )
}

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
    <div
      className="rounded-2xl overflow-hidden transition-all hover:shadow-sm"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
      onMouseEnter={e => e.currentTarget.style.borderColor = CARD_BORDER_HOVER}
      onMouseLeave={e => e.currentTarget.style.borderColor = CARD_BORDER}
    >
      <div className="flex items-start gap-4 p-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${PINK}12` }}>
          <MapPin className="w-5 h-5" style={{ color: PINK }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold truncate" style={{ color: TEXT }}>{location.title}</h3>
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${location.status ? "bg-emerald-500" : "bg-[oklch(0.80_0.005_270)]"}`} />
          </div>
          <p className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>{location.email}</p>
          <p className="text-[10px] mt-0.5 font-mono" style={{ color: TEXT_FAINT }}>{location.google_location_id}</p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          {location.average_rating != null && (
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-bold" style={{ color: TEXT }}>{location.average_rating?.toFixed(1)}</span>
              </div>
              <div className="text-[10px]" style={{ color: TEXT_FAINT }}>{location.total_review_count} reviews</div>
            </div>
          )}
          {location.response_rate != null && (
            <div className="text-right">
              <div className="text-sm font-bold" style={{ color: TEXT }}>{location.response_rate}%</div>
              <div className="text-[10px]" style={{ color: TEXT_FAINT }}>reply rate</div>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 py-3 flex items-center gap-6" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all disabled:opacity-60 hover:opacity-75"
            style={{ border: `1px solid ${CARD_BORDER}`, background: CARD_BG, color: TEXT_MUTED }}
          >
            <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
            Sync reviews
          </button>
        </div>
      </div>
    </div>
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
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white text-xs font-semibold transition-all disabled:opacity-60 hover:opacity-90"
          style={{ background: PINK }}
        >
          {connectingGMB ? "Redirecting…" : "+ Connect Google Business"}
        </button>
      }
    >
      <div className="max-w-3xl mx-auto px-8 py-6 space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }} />
          ))
        ) : locations.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${PINK}12` }}>
              <MapPin className="w-7 h-7" style={{ color: PINK }} />
            </div>
            <h3 className="text-base font-semibold mb-2" style={{ color: TEXT }}>No locations yet</h3>
            <p className="text-sm mb-6" style={{ color: TEXT_MUTED }}>Connect your Google Business account to get started.</p>
            <button
              onClick={handleConnectGMB}
              className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: PINK }}
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
