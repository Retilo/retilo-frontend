"use client"

// Campaigns page — review request campaigns (SMS/email/WhatsApp)
// API: GET /v1/gmb/campaigns, POST /v1/gmb/campaigns, POST /v1/gmb/campaigns/:id/send
//      GET /v1/gmb/campaigns/link?locationId=

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Send, Plus, Link2, Users, ChevronDown, X } from "lucide-react"
import { DashboardPageLayout } from "@/components/dashboard/page-layout"
import { api } from "@/lib/api"

function CampaignCard({ campaign }) {
  const [reviewLink, setReviewLink] = useState("")
  const [showLink, setShowLink] = useState(false)

  const getLink = async () => {
    if (reviewLink) { setShowLink(true); return }
    try {
      const res = await api.get(`/v1/gmb/campaigns/${campaign.id}/link`)
      setReviewLink(res.data.data.reviewLink)
      setShowLink(true)
    } catch {}
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-[oklch(0.13_0.015_270)] p-5 hover:border-white/12 transition-all">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-white">{campaign.name}</h3>
          {campaign.channel && (
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[oklch(0.55_0.24_280)/15%] text-[oklch(0.80_0.18_280)] text-[10px] font-medium capitalize">
              {campaign.channel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={getLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/4 hover:bg-white/8 text-white/50 hover:text-white text-xs transition-all"
          >
            <Link2 className="w-3.5 h-3.5" />
            Review link
          </button>
        </div>
      </div>
      {campaign.messageTemplate && (
        <p className="text-xs text-white/35 italic">&ldquo;{campaign.messageTemplate}&rdquo;</p>
      )}
      {showLink && reviewLink && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/4 border border-white/8 px-3 py-2">
          <span className="text-xs text-white/50 flex-1 truncate font-mono">{reviewLink}</span>
          <button onClick={() => { navigator.clipboard?.writeText(reviewLink) }} className="text-[10px] text-[oklch(0.75_0.20_280)] hover:text-white transition-colors">
            Copy
          </button>
          <button onClick={() => setShowLink(false)} className="text-white/30 hover:text-white/70 transition-colors">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}

function CreateCampaignModal({ locations, onClose, onCreate }) {
  const [form, setForm] = useState({ locationId: locations[0]?.google_location_id ?? "", name: "", channel: "sms", messageTemplate: "" })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onCreate(form)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-[oklch(0.13_0.015_270)] border border-white/12 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-white">New Campaign</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Campaign name">
            <input
              required value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Post-visit review request"
              className="w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-[oklch(0.65_0.26_280)] placeholder:text-white/25"
            />
          </Field>
          <Field label="Location">
            <select
              value={form.locationId}
              onChange={e => setForm(f => ({ ...f, locationId: e.target.value }))}
              className="w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm px-3 py-2 outline-none"
            >
              {locations.map(l => <option key={l.id} value={l.google_location_id}>{l.title}</option>)}
            </select>
          </Field>
          <Field label="Channel">
            <select
              value={form.channel}
              onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}
              className="w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm px-3 py-2 outline-none"
            >
              <option value="sms">SMS</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </Field>
          <Field label="Message template (optional)">
            <textarea
              rows={3}
              value={form.messageTemplate}
              onChange={e => setForm(f => ({ ...f, messageTemplate: e.target.value }))}
              placeholder="Hi {name}, we'd love your review! {link}"
              className="w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-[oklch(0.65_0.26_280)] placeholder:text-white/25 resize-none"
            />
          </Field>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[oklch(0.55_0.24_280)] hover:bg-[oklch(0.60_0.26_280)] text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create Campaign"}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/50 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

export default function CampaignsPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem("retilo_token")) { router.replace("/auth"); return }
    Promise.all([
      api.get("/v1/gmb/campaigns"),
      api.get("/v1/gmb/locations"),
    ])
      .then(([c, l]) => {
        setCampaigns(c.data.data ?? [])
        setLocations(l.data.data ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  const handleCreate = async (formData) => {
    const res = await api.post("/v1/gmb/campaigns", formData)
    setCampaigns(prev => [...prev, res.data.data])
  }

  return (
    <DashboardPageLayout
      title="Campaigns"
      subtitle="Review request campaigns via SMS, email, or WhatsApp"
      actions={
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[oklch(0.55_0.24_280)] hover:bg-[oklch(0.60_0.26_280)] text-white text-xs font-semibold transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          New campaign
        </button>
      }
    >
      <div className="max-w-3xl mx-auto px-8 py-6 space-y-4">
        {loading ? (
          [...Array(2)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/4 border border-white/8 animate-pulse" />
          ))
        ) : campaigns.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-[oklch(0.55_0.24_280)/15%] flex items-center justify-center mx-auto mb-4">
              <Send className="w-7 h-7 text-[oklch(0.75_0.20_280)]" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">No campaigns yet</h3>
            <p className="text-sm text-white/40 mb-6">Create a review request campaign to send to your customers.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-5 py-2.5 rounded-xl bg-[oklch(0.55_0.24_280)] hover:bg-[oklch(0.60_0.26_280)] text-white text-sm font-semibold transition-colors"
            >
              Create first campaign
            </button>
          </div>
        ) : (
          campaigns.map(c => <CampaignCard key={c.id} campaign={c} />)
        )}
      </div>

      {showCreate && locations.length > 0 && (
        <CreateCampaignModal
          locations={locations}
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </DashboardPageLayout>
  )
}
