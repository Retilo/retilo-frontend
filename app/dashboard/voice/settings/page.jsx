"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  Phone,
  Languages,
  Store,
  MapPin,
  Clock,
  Utensils,
  Save,
  PhoneCall,
  Sparkles,
  ArrowRight,
} from "lucide-react"

import { api } from "@/lib/api"
import {
  TextureCard,
  TextureCardHeader,
  TextureCardContent,
  TextureCardTitle,
  TextureCardDescription,
  TextureSeparator,
} from "@/components/ui/texture-card"
import { TextureButton } from "@/components/ui/texture-button"

// Palette — matches the rest of the voice dashboard (OKLCH, light mode).
const BLUE = "oklch(0.52 0.20 255)"
const GREEN = "oklch(0.50 0.18 145)"
const TEXT = "oklch(0.14 0.008 270)"
const TEXT_MUTED = "oklch(0.45 0.008 270)"
const TEXT_FAINT = "oklch(0.60 0.008 270)"
const INPUT_BG = "oklch(0.97 0.004 270)"
const INPUT_BORDER = "oklch(0.90 0.006 270)"

// Hindi + English run on AWS Polly today. The rest arrive with Sarvam (Indic
// STT+TTS) — selectable once that provider is wired.
const LANGUAGES = [
  { code: "hi-IN", label: "Hindi · हिन्दी", active: true },
  { code: "en-IN", label: "English", active: true },
  { code: "ta-IN", label: "Tamil · தமிழ்", active: false },
  { code: "te-IN", label: "Telugu · తెలుగు", active: false },
  { code: "kn-IN", label: "Kannada · ಕನ್ನಡ", active: false },
  { code: "ml-IN", label: "Malayalam · മലയാളം", active: false },
  { code: "bn-IN", label: "Bengali · বাংলা", active: false },
  { code: "mr-IN", label: "Marathi · मराठी", active: false },
  { code: "gu-IN", label: "Gujarati · ગુજરાતી", active: false },
]

const EMPTY = {
  locationId: "default",
  restaurantName: "",
  primaryLanguage: "hi-IN",
  restaurantAddress: "",
  restaurantHours: "",
  restaurantCuisine: "",
  restaurantPhone: "",
  menuText: "",
}

function prettyNumber(e164) {
  // +918065589900 → +91 80 6558 9900
  const m = String(e164 || "").match(/^\+(\d{2})(\d{2})(\d{4})(\d{4})$/)
  return m ? `+${m[1]} ${m[2]} ${m[3]} ${m[4]}` : e164 || "—"
}

function greetingPreview(name, lang) {
  const who = name?.trim() || "the restaurant"
  if (lang === "en-IN") {
    return `Hello! I'm the AI receptionist for ${who}. How can I help you today?`
  }
  return `Namaste! Main ${who} ka AI receptionist hoon. Bataiye, main aapki kaise madad kar sakta hoon?`
}

export default function VoiceCallSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [numbers, setNumbers] = useState([])
  const [providers, setProviders] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [numRes, agentRes, provRes] = await Promise.allSettled([
          api.get("/v1/voice/numbers"),
          api.get("/v1/voice/agents"),
          api.get("/v1/voice/providers"),
        ])

        if (!alive) return

        const nums =
          numRes.status === "fulfilled"
            ? numRes.value.data?.data?.numbers ?? numRes.value.data?.data ?? []
            : []
        setNumbers(Array.isArray(nums) ? nums : [])

        const agents =
          agentRes.status === "fulfilled"
            ? agentRes.value.data?.data?.agents ?? agentRes.value.data?.data ?? []
            : []
        const loc = Array.isArray(nums) && nums[0]?.location_id
        const agent =
          (Array.isArray(agents) &&
            (agents.find((a) => a.location_id === loc) || agents[0])) ||
          null
        if (agent) {
          setForm({
            locationId: agent.location_id || loc || "default",
            restaurantName: agent.restaurant_name || "",
            primaryLanguage: agent.primary_language || "hi-IN",
            restaurantAddress: agent.restaurant_address || "",
            restaurantHours: agent.restaurant_hours || "",
            restaurantCuisine: agent.restaurant_cuisine || "",
            restaurantPhone: agent.restaurant_phone || "",
            menuText: agent.menu_text || "",
          })
        } else if (loc) {
          set("locationId", loc)
        }

        if (provRes.status === "fulfilled") {
          setProviders(provRes.value.data?.data ?? null)
        }
      } catch {
        /* individual failures already handled above */
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  async function save() {
    if (!form.restaurantName.trim()) {
      toast.error("Add your business name first.")
      return
    }
    setSaving(true)
    try {
      await api.post("/v1/voice/agents/provision", {
        locationId: form.locationId || "default",
        restaurantName: form.restaurantName.trim(),
        primaryLanguage: form.primaryLanguage,
        restaurantAddress: form.restaurantAddress.trim(),
        restaurantHours: form.restaurantHours.trim(),
        restaurantCuisine: form.restaurantCuisine.trim(),
        restaurantPhone: form.restaurantPhone.trim(),
        menuText: form.menuText.trim(),
      })
      toast.success("Voice call settings saved. New calls use them right away.")
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't save settings.")
    } finally {
      setSaving(false)
    }
  }

  const primary = numbers[0]
  const activeLangLabel =
    LANGUAGES.find((l) => l.code === form.primaryLanguage)?.label ||
    form.primaryLanguage

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2" style={{ color: BLUE }}>
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">
            AI Receptionist
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-bold" style={{ color: TEXT }}>
          Voice Call Settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: TEXT_MUTED }}>
          How your AI answers the phone — the language it speaks and what it
          knows about your business. Changes apply on the next call.
        </p>
      </div>

      {loading ? (
        <div
          className="rounded-3xl p-10 text-center text-sm"
          style={{ color: TEXT_FAINT }}
        >
          Loading your settings…
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Connected number */}
          <TextureCard>
            <TextureCardContent className="p-5">
              {primary ? (
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-2xl"
                      style={{ background: `${GREEN}14`, color: GREEN }}
                    >
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <div
                        className="text-base font-semibold"
                        style={{ color: TEXT }}
                      >
                        {prettyNumber(primary.phone_number)}
                      </div>
                      <div className="text-xs" style={{ color: TEXT_FAINT }}>
                        Connected · {primary.is_active ? "Active" : "Inactive"} ·
                        speaking {activeLangLabel}
                      </div>
                    </div>
                  </div>
                  <a
                    href={`tel:${primary.phone_number}`}
                    className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium"
                    style={{ background: `${BLUE}12`, color: BLUE }}
                  >
                    <PhoneCall className="h-4 w-4" />
                    Call to test
                  </a>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold" style={{ color: TEXT }}>
                      No phone number yet
                    </div>
                    <div className="text-xs" style={{ color: TEXT_FAINT }}>
                      Get an Indian number for your AI receptionist first.
                    </div>
                  </div>
                  <Link
                    href="/dashboard/voice/numbers"
                    className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium"
                    style={{ background: `${BLUE}12`, color: BLUE }}
                  >
                    Get a number
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </TextureCardContent>
          </TextureCard>

          {/* Settings form */}
          <TextureCard>
            <TextureCardHeader className="px-5 pt-5">
              <TextureCardTitle>Your business</TextureCardTitle>
              <TextureCardDescription>
                The AI uses this to answer callers accurately.
              </TextureCardDescription>
            </TextureCardHeader>
            <TextureSeparator />
            <TextureCardContent className="flex flex-col gap-5 p-5">
              <Field icon={Store} label="Business name" required>
                <input
                  value={form.restaurantName}
                  onChange={(e) => set("restaurantName", e.target.value)}
                  placeholder="e.g. Spice Garden"
                  style={inputStyle}
                />
              </Field>

              <Field icon={Languages} label="Language the AI speaks">
                <select
                  value={form.primaryLanguage}
                  onChange={(e) => set("primaryLanguage", e.target.value)}
                  style={inputStyle}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} disabled={!l.active}>
                      {l.label}
                      {l.active ? "" : "  (Sarvam — soon)"}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs" style={{ color: TEXT_FAINT }}>
                  Hindi & English are live now. More Indian languages arrive with
                  Sarvam.
                </p>
              </Field>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field icon={MapPin} label="Address">
                  <input
                    value={form.restaurantAddress}
                    onChange={(e) => set("restaurantAddress", e.target.value)}
                    placeholder="Area, city"
                    style={inputStyle}
                  />
                </Field>
                <Field icon={Clock} label="Timings">
                  <input
                    value={form.restaurantHours}
                    onChange={(e) => set("restaurantHours", e.target.value)}
                    placeholder="11am–11pm, daily"
                    style={inputStyle}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field icon={Utensils} label="Cuisine">
                  <input
                    value={form.restaurantCuisine}
                    onChange={(e) => set("restaurantCuisine", e.target.value)}
                    placeholder="North Indian, Chinese"
                    style={inputStyle}
                  />
                </Field>
                <Field icon={Phone} label="Fallback phone (optional)">
                  <input
                    value={form.restaurantPhone}
                    onChange={(e) => set("restaurantPhone", e.target.value)}
                    placeholder="Owner / manager number"
                    style={inputStyle}
                  />
                </Field>
              </div>

              <Field icon={Utensils} label="Menu / knowledge (optional)">
                <textarea
                  value={form.menuText}
                  onChange={(e) => set("menuText", e.target.value)}
                  placeholder="Paste your menu or anything the AI should know (specials, offers, policies)…"
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </Field>
            </TextureCardContent>
          </TextureCard>

          {/* Greeting preview */}
          <TextureCard>
            <TextureCardContent className="p-5">
              <div
                className="mb-2 text-xs font-semibold uppercase tracking-wide"
                style={{ color: TEXT_FAINT }}
              >
                Caller hears
              </div>
              <p
                className="text-sm italic leading-relaxed"
                style={{ color: TEXT_MUTED }}
              >
                “{greetingPreview(form.restaurantName, form.primaryLanguage)}”
              </p>
            </TextureCardContent>
          </TextureCard>

          {/* Save */}
          <div className="flex items-center justify-end gap-3">
            {providers && (
              <span className="text-xs" style={{ color: TEXT_FAINT }}>
                Stack: {providers.stt?.provider || "aws"} ·{" "}
                {providers.llm?.provider || "anthropic"} ·{" "}
                {providers.tts?.provider || "polly"}
              </span>
            )}
            <TextureButton
              variant="accent"
              onClick={save}
              disabled={saving}
              className="min-w-[160px]"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : "Save settings"}
              </span>
            </TextureButton>
          </div>
        </div>
      )}
    </div>
  )
}

const inputStyle = {
  width: "100%",
  background: INPUT_BG,
  border: `1px solid ${INPUT_BORDER}`,
  borderRadius: "0.75rem",
  padding: "0.6rem 0.8rem",
  fontSize: "0.875rem",
  color: TEXT,
  outline: "none",
}

function Field({ icon: Icon, label, required, children }) {
  return (
    <label className="block">
      <span
        className="mb-1.5 flex items-center gap-1.5 text-xs font-medium"
        style={{ color: TEXT_MUTED }}
      >
        <Icon className="h-3.5 w-3.5" />
        {label}
        {required && <span style={{ color: "oklch(0.55 0.22 25)" }}>*</span>}
      </span>
      {children}
    </label>
  )
}
