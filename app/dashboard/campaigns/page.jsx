"use client"

// Campaigns page — review request campaigns (SMS/email/WhatsApp)
// API: GET /v1/gmb/campaigns, POST /v1/gmb/campaigns, POST /v1/gmb/campaigns/:id/send
//      GET /v1/gmb/campaigns/link?locationId=

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Send, Plus, Link2, X } from "lucide-react"
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
    <div
      className="rounded-2xl p-5 transition-all hover:shadow-sm"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: TEXT }}>{campaign.name}</h3>
          {campaign.channel && (
            <span
              className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium capitalize"
              style={{ background: `${PINK}12`, color: PINK }}
            >
              {campaign.channel}
            </span>
          )}
        </div>
        <button
          onClick={getLink}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all hover:opacity-75"
          style={{ border: `1px solid ${CARD_BORDER}`, background: CARD_BG, color: TEXT_MUTED }}
        >
          <Link2 className="w-3.5 h-3.5" />
          Review link
        </button>
      </div>
      {campaign.messageTemplate && (
        <p className="text-xs italic" style={{ color: TEXT_FAINT }}>&ldquo;{campaign.messageTemplate}&rdquo;</p>
      )}
      {showLink && reviewLink && (
        <div
          className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}` }}
        >
          <span className="text-xs flex-1 truncate font-mono" style={{ color: TEXT_MUTED }}>{reviewLink}</span>
          <button
            onClick={() => { navigator.clipboard?.writeText(reviewLink) }}
            className="text-[10px] font-medium transition-colors hover:opacity-75"
            style={{ color: PINK }}
          >
            Copy
          </button>
          <button onClick={() => setShowLink(false)} className="transition-colors hover:opacity-75" style={{ color: TEXT_FAINT }}>
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_MUTED }}>{label}</label>
      {children}
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

  const inputStyle = { background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold" style={{ color: TEXT }}>New Campaign</h2>
          <button onClick={onClose} className="transition-colors hover:opacity-75" style={{ color: TEXT_FAINT }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Campaign name">
            <input
              required value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Post-visit review request"
              className="w-full rounded-lg text-sm px-3 py-2 outline-none transition-colors"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = PINK}
              onBlur={e => e.target.style.borderColor = INPUT_BORDER}
            />
          </Field>
          <Field label="Location">
            <select
              value={form.locationId}
              onChange={e => setForm(f => ({ ...f, locationId: e.target.value }))}
              className="w-full rounded-lg text-sm px-3 py-2 outline-none"
              style={inputStyle}
            >
              {locations.map(l => <option key={l.id} value={l.google_location_id}>{l.title}</option>)}
            </select>
          </Field>
          <Field label="Channel">
            <select
              value={form.channel}
              onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}
              className="w-full rounded-lg text-sm px-3 py-2 outline-none"
              style={inputStyle}
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
              className="w-full rounded-lg text-sm px-3 py-2 outline-none resize-none transition-colors"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = PINK}
              onBlur={e => e.target.style.borderColor = INPUT_BORDER}
            />
          </Field>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60 hover:opacity-90"
            style={{ background: PINK }}
          >
            {loading ? "Creating…" : "Create Campaign"}
          </button>
        </form>
      </div>
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
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white text-xs font-semibold transition-all hover:opacity-90"
          style={{ background: PINK }}
        >
          <Plus className="w-3.5 h-3.5" />
          New campaign
        </button>
      }
    >
      <div className="max-w-3xl mx-auto px-8 py-6 space-y-4">
        {loading ? (
          [...Array(2)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }} />
          ))
        ) : campaigns.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${PINK}12` }}>
              <Send className="w-7 h-7" style={{ color: PINK }} />
            </div>
            <h3 className="text-base font-semibold mb-2" style={{ color: TEXT }}>No campaigns yet</h3>
            <p className="text-sm mb-6" style={{ color: TEXT_MUTED }}>Create a review request campaign to send to your customers.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: PINK }}
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
