"use client"

// Booking Page Setup — configure restaurant's public booking page
// GET  /v1/brand-config                    → load existing config
// PUT  /v1/brand-config                    → save/upsert config
// POST /v1/brand-config/upload-image?type= → upload logo/banner, returns { url }

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BookOpen, Copy, Check, Upload, Globe, MessageSquare,
  Palette, MapPin, Phone, Image, ExternalLink, Info,
} from "lucide-react"
import { DashboardPageLayout } from "@/components/dashboard/page-layout"
import { api } from "@/lib/api"

const PINK   = "oklch(0.58 0.24 350)"
const PURPLE = "oklch(0.55 0.22 290)"
const CARD_BG      = "oklch(1 0 0)"
const CARD_BORDER  = "oklch(0.91 0.008 350)"
const TEXT         = "oklch(0.14 0.008 270)"
const TEXT_MUTED   = "oklch(0.55 0.008 270)"
const TEXT_FAINT   = "oklch(0.65 0.008 270)"
const INPUT_BG     = "oklch(0.96 0.005 350)"
const INPUT_BORDER = "oklch(0.90 0.008 350)"
const GREEN = "oklch(0.50 0.18 145)"
const RED   = "oklch(0.52 0.22 25)"

const SLUG_RE = /^[a-z0-9-]*$/

const BUSINESS_TYPES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "clinic",     label: "Clinic" },
  { value: "salon",      label: "Salon" },
  { value: "fitness",    label: "Fitness" },
  { value: "spa",        label: "Spa" },
  { value: "retail",     label: "Retail" },
  { value: "other",      label: "Other" },
]

const DEFAULT_FORM = {
  slug:                "",
  displayName:         "",
  tagline:             "",
  businessType:        "restaurant",
  logoUrl:             "",
  bannerUrl:           "",
  primaryColor:        "#7C3AED",
  accentColor:         "#F59E0B",
  bookingTheme:        "dark",
  whatsappNumber:      "",
  address:             "",
  bookingPrompt:       "",
  confirmationMessage: "",
  showPoweredBy:       true,
  locationId:          null,
}

// ── Small helpers ─────────────────────────────────────────────────

function Label({ children }) {
  return (
    <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_MUTED }}>
      {children}
    </label>
  )
}

function InputField({ value, onChange, placeholder, onFocus, onBlur, type = "text", ...rest }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors"
      style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }}
      onFocus={e => { e.target.style.borderColor = PINK; onFocus?.(e) }}
      onBlur={e => { e.target.style.borderColor = INPUT_BORDER; onBlur?.(e) }}
      {...rest}
    />
  )
}

function TextAreaField({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none transition-colors"
      style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }}
      onFocus={e => (e.target.style.borderColor = PINK)}
      onBlur={e => (e.target.style.borderColor = INPUT_BORDER)}
    />
  )
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl p-6" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
      <div className="flex items-center gap-2 mb-5">
        <Icon className="w-4 h-4" style={{ color: PINK }} />
        <h2 className="text-sm font-semibold" style={{ color: TEXT }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

// ── Copy button ───────────────────────────────────────────────────

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy"
      className="flex items-center justify-center w-7 h-7 rounded-lg transition-all hover:opacity-80 flex-shrink-0"
      style={{ background: copied ? `${GREEN}18` : INPUT_BG, border: `1px solid ${copied ? GREEN + "40" : INPUT_BORDER}` }}
    >
      {copied
        ? <Check className="w-3.5 h-3.5" style={{ color: GREEN }} />
        : <Copy className="w-3.5 h-3.5" style={{ color: TEXT_FAINT }} />}
    </button>
  )
}

// ── Image upload zone ─────────────────────────────────────────────

function ImageUploadZone({ label, url, onUpload, uploading }) {
  const inputRef = useRef(null)

  return (
    <div>
      <Label>{label}</Label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full flex flex-col items-center justify-center gap-2 rounded-xl py-5 transition-all hover:opacity-80 disabled:opacity-60"
        style={{ border: `1.5px dashed ${url ? PINK + "50" : INPUT_BORDER}`, background: url ? `${PINK}06` : INPUT_BG }}
      >
        {url ? (
          <img src={url} alt="preview" className="h-14 w-auto rounded-lg object-contain max-w-full" />
        ) : (
          <>
            <Upload className="w-5 h-5" style={{ color: TEXT_FAINT }} />
            <span className="text-xs" style={{ color: TEXT_FAINT }}>
              {uploading ? "Uploading…" : "Click to upload (JPEG, PNG, WebP · max 5 MB)"}
            </span>
          </>
        )}
        {url && (
          <span className="text-[11px]" style={{ color: TEXT_FAINT }}>
            {uploading ? "Uploading new image…" : "Click to replace"}
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) onUpload(file)
          e.target.value = ""
        }}
      />
    </div>
  )
}

// ── Share row ─────────────────────────────────────────────────────

function ShareRow({ label, value }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: INPUT_BG }}>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-medium mb-0.5" style={{ color: TEXT_FAINT }}>{label}</div>
        <div className="text-sm font-mono truncate" style={{ color: TEXT }}>{value}</div>
      </div>
      <CopyButton text={value} />
    </div>
  )
}

// ── Note card ─────────────────────────────────────────────────────

function NoteCard({ icon: Icon, title, body }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: `${PURPLE}08`, border: `1px solid ${PURPLE}20` }}>
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: PURPLE }} />
      <div>
        <div className="text-xs font-semibold mb-0.5" style={{ color: TEXT }}>{title}</div>
        <div className="text-xs" style={{ color: TEXT_MUTED }}>{body}</div>
      </div>
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────────────────

function Toast({ message, type }) {
  if (!message) return null
  const bg = type === "error" ? RED : GREEN
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-white text-sm font-medium"
      style={{ background: bg, maxWidth: 320 }}
    >
      {type === "error" ? <Info className="w-4 h-4 flex-shrink-0" /> : <Check className="w-4 h-4 flex-shrink-0" />}
      {message}
    </div>
  )
}

// ── Loading skeleton ──────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-40 rounded-2xl animate-pulse"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        />
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────

export default function BookingPageSetup() {
  const router = useRouter()
  const [loading, setLoading]   = useState(true)
  const [saving,  setSaving]    = useState(false)
  const [toast,   setToast]     = useState({ message: "", type: "success" })
  const [form, setForm]         = useState(DEFAULT_FORM)
  const [slugError, setSlugError] = useState("")
  const [logoUploading,   setLogoUploading]   = useState(false)
  const [bannerUploading, setBannerUploading] = useState(false)

  const showToast = (message, type = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast({ message: "", type: "success" }), 3500)
  }

  useEffect(() => {
    if (!localStorage.getItem("retilo_token")) { router.replace("/auth"); return }
    api.get("/v1/brand-config")
      .then(res => {
        const brands = res.data?.brands ?? []
        if (brands.length > 0) {
          const b = brands[0]
          setForm({
            slug:                b.slug                ?? "",
            displayName:         b.displayName         ?? b.display_name ?? "",
            tagline:             b.tagline             ?? "",
            businessType:        b.businessType        ?? b.business_type ?? "restaurant",
            logoUrl:             b.logoUrl             ?? b.logo_url ?? "",
            bannerUrl:           b.bannerUrl           ?? b.banner_url ?? "",
            primaryColor:        b.primaryColor        ?? b.primary_color ?? "#7C3AED",
            accentColor:         b.accentColor         ?? b.accent_color ?? "#F59E0B",
            bookingTheme:        b.bookingTheme        ?? b.booking_theme ?? "dark",
            whatsappNumber:      b.whatsappNumber      ?? b.whatsapp_number ?? "",
            address:             b.address             ?? "",
            bookingPrompt:       b.bookingPrompt       ?? b.booking_prompt ?? "",
            confirmationMessage: b.confirmationMessage ?? b.confirmation_message ?? "",
            showPoweredBy:       b.showPoweredBy       ?? b.show_powered_by ?? true,
            locationId:          b.locationId          ?? b.location_id ?? null,
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  const set = (key) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value
    if (key === "slug") {
      const lower = val.toLowerCase()
      if (!SLUG_RE.test(lower)) {
        setSlugError("Only lowercase letters, numbers, and hyphens allowed")
      } else {
        setSlugError("")
      }
      setForm(f => ({ ...f, slug: lower }))
      return
    }
    setForm(f => ({ ...f, [key]: val }))
  }

  const uploadImage = async (file, type) => {
    const setUploading = type === "logo" ? setLogoUploading : setBannerUploading
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("image", file)
      const res = await api.post(`/v1/brand-config/upload-image?type=${type}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      const url = res.data?.url
      if (url) {
        setForm(f => ({ ...f, [type === "logo" ? "logoUrl" : "bannerUrl"]: url }))
        showToast(`${type === "logo" ? "Logo" : "Banner"} uploaded`)
      }
    } catch (e) {
      showToast(e?.response?.data?.message ?? "Upload failed", "error")
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!form.slug) { showToast("Booking URL slug is required", "error"); return }
    if (slugError)  { showToast(slugError, "error"); return }
    if (!form.displayName) { showToast("Display name is required", "error"); return }

    setSaving(true)
    try {
      await api.put("/v1/brand-config", {
        slug:                form.slug,
        displayName:         form.displayName,
        tagline:             form.tagline       || undefined,
        businessType:        form.businessType,
        logoUrl:             form.logoUrl       || undefined,
        bannerUrl:           form.bannerUrl     || undefined,
        primaryColor:        form.primaryColor,
        accentColor:         form.accentColor,
        bookingTheme:        form.bookingTheme,
        whatsappNumber:      form.whatsappNumber || undefined,
        address:             form.address        || undefined,
        bookingPrompt:       form.bookingPrompt  || undefined,
        confirmationMessage: form.confirmationMessage || undefined,
        showPoweredBy:       form.showPoweredBy,
        locationId:          form.locationId ?? undefined,
      })
      showToast("Booking page saved!")
    } catch (e) {
      showToast(e?.response?.data?.message ?? "Save failed", "error")
    } finally {
      setSaving(false)
    }
  }

  const bookingUrl   = form.slug ? `https://book.retilo.io/${form.slug}` : "https://book.retilo.io/your-slug"
  const embedSnippet = form.slug
    ? `<script src="https://api.retilo.io/book/${form.slug}/embed.js" async></script>`
    : `<script src="https://api.retilo.io/book/your-slug/embed.js" async></script>`

  const inputStyle = { background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }
  const focusStyle = (e) => (e.target.style.borderColor = PINK)
  const blurStyle  = (e) => (e.target.style.borderColor = INPUT_BORDER)

  return (
    <DashboardPageLayout
      title="Booking Page"
      subtitle="Set up your public booking page — share it everywhere"
      actions={
        form.slug ? (
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
            style={{ background: `${PINK}12`, color: PINK, border: `1px solid ${PINK}28` }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Preview page
          </a>
        ) : null
      }
    >
      <div className="max-w-2xl mx-auto px-8 py-6 space-y-5">
        {loading ? <LoadingSkeleton /> : (
          <>
            {/* ── A. Identity ── */}
            <SectionCard icon={Globe} title="Identity">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label>Restaurant / Business name *</Label>
                  <InputField
                    value={form.displayName}
                    onChange={set("displayName")}
                    placeholder="The Spice Garden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label>Tagline</Label>
                  <InputField
                    value={form.tagline}
                    onChange={set("tagline")}
                    placeholder="Authentic South Indian cuisine"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label>Booking URL slug *</Label>
                  <div className="relative">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-sm select-none"
                      style={{ color: TEXT_FAINT }}
                    >
                      book.retilo.io/
                    </span>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={set("slug")}
                      placeholder="the-spice-garden"
                      className="w-full pl-[132px] pr-3 py-2 rounded-xl text-sm outline-none transition-colors"
                      style={{ ...inputStyle, borderColor: slugError ? RED : INPUT_BORDER }}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    />
                  </div>
                  {slugError ? (
                    <p className="text-[11px] mt-1" style={{ color: RED }}>{slugError}</p>
                  ) : form.slug ? (
                    <p className="text-[11px] mt-1" style={{ color: TEXT_FAINT }}>
                      Your page will be live at <span style={{ color: PINK }}>{bookingUrl}</span>
                    </p>
                  ) : null}
                </div>

                <div className="sm:col-span-2">
                  <Label>Business type</Label>
                  <select
                    value={form.businessType}
                    onChange={set("businessType")}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none appearance-none cursor-pointer"
                    style={inputStyle}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  >
                    {BUSINESS_TYPES.map(bt => (
                      <option key={bt.value} value={bt.value}>{bt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </SectionCard>

            {/* ── B. Branding ── */}
            <SectionCard icon={Palette} title="Branding">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ImageUploadZone
                  label="Logo"
                  url={form.logoUrl}
                  uploading={logoUploading}
                  onUpload={file => uploadImage(file, "logo")}
                />
                <ImageUploadZone
                  label="Banner"
                  url={form.bannerUrl}
                  uploading={bannerUploading}
                  onUpload={file => uploadImage(file, "banner")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-5">
                <div>
                  <Label>Primary colour</Label>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl" style={inputStyle}>
                    <input
                      type="color"
                      value={form.primaryColor}
                      onChange={set("primaryColor")}
                      className="w-7 h-7 rounded-lg border-0 bg-transparent cursor-pointer p-0"
                    />
                    <span className="text-sm font-mono" style={{ color: TEXT }}>{form.primaryColor}</span>
                  </div>
                </div>
                <div>
                  <Label>Accent colour</Label>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl" style={inputStyle}>
                    <input
                      type="color"
                      value={form.accentColor}
                      onChange={set("accentColor")}
                      className="w-7 h-7 rounded-lg border-0 bg-transparent cursor-pointer p-0"
                    />
                    <span className="text-sm font-mono" style={{ color: TEXT }}>{form.accentColor}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-5">
                {/* Theme toggle */}
                <div className="flex-1">
                  <Label>Page theme</Label>
                  <div className="flex rounded-xl overflow-hidden" style={{ border: `1px solid ${INPUT_BORDER}` }}>
                    {["dark", "light"].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, bookingTheme: t }))}
                        className="flex-1 py-2 text-xs font-semibold capitalize transition-all"
                        style={{
                          background: form.bookingTheme === t ? PINK : "transparent",
                          color:      form.bookingTheme === t ? "#fff" : TEXT_MUTED,
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Powered by toggle */}
                <div className="flex-1">
                  <Label>Show "Powered by Retilo"</Label>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, showPoweredBy: !f.showPoweredBy }))}
                    className="w-full py-2 text-xs font-semibold rounded-xl transition-all"
                    style={{
                      background: form.showPoweredBy ? `${GREEN}15` : INPUT_BG,
                      border:     `1px solid ${form.showPoweredBy ? GREEN + "40" : INPUT_BORDER}`,
                      color:      form.showPoweredBy ? GREEN : TEXT_MUTED,
                    }}
                  >
                    {form.showPoweredBy ? "Enabled" : "Hidden"}
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* ── C. Contact & Messaging ── */}
            <SectionCard icon={MessageSquare} title="Contact &amp; Messaging">
              <div className="space-y-4">
                <div>
                  <Label>WhatsApp number</Label>
                  <InputField
                    value={form.whatsappNumber}
                    onChange={set("whatsappNumber")}
                    placeholder="+919876543210"
                  />
                  <p className="text-[11px] mt-1" style={{ color: TEXT_FAINT }}>
                    Customers will be directed here after booking.
                  </p>
                </div>
                <div>
                  <Label>Address</Label>
                  <TextAreaField
                    value={form.address}
                    onChange={set("address")}
                    placeholder="12 MG Road, Koramangala, Bengaluru 560034"
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Booking prompt</Label>
                  <InputField
                    value={form.bookingPrompt}
                    onChange={set("bookingPrompt")}
                    placeholder="Book a table"
                  />
                  <p className="text-[11px] mt-1" style={{ color: TEXT_FAINT }}>
                    Shown as the CTA label on your booking page.
                  </p>
                </div>
                <div>
                  <Label>Confirmation message</Label>
                  <TextAreaField
                    value={form.confirmationMessage}
                    onChange={set("confirmationMessage")}
                    placeholder="We'll confirm your booking on WhatsApp."
                    rows={2}
                  />
                </div>
              </div>
            </SectionCard>

            {/* ── D. Share your page ── */}
            <SectionCard icon={Image} title="Share your page">
              <div className="space-y-3">
                <ShareRow label="Booking link" value={bookingUrl} />
                <ShareRow label="Website widget embed" value={embedSnippet} />
              </div>

              <div className="mt-4 space-y-3">
                <NoteCard
                  icon={MapPin}
                  title="Add to Google Business Profile"
                  body="Go to your Google Business Profile → Edit profile → Add booking link → paste your booking URL above."
                />
                <NoteCard
                  icon={Phone}
                  title="Share on WhatsApp"
                  body="Copy the booking link and share it with customers directly in WhatsApp conversations or broadcast lists."
                />
              </div>
            </SectionCard>

            {/* ── E. Save ── */}
            <button
              onClick={handleSave}
              disabled={saving || !!slugError}
              className="w-full py-3 rounded-2xl text-white text-sm font-bold transition-all hover:opacity-90 disabled:opacity-60"
              style={{
                background: `linear-gradient(135deg, ${PINK}, ${PURPLE})`,
                boxShadow: `0 4px 20px ${PINK}40`,
              }}
            >
              {saving ? "Saving…" : "Save booking page"}
            </button>
          </>
        )}
      </div>

      <Toast message={toast.message} type={toast.type} />
    </DashboardPageLayout>
  )
}
