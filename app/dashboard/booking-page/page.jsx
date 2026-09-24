"use client"

// Booking Page Setup — multi-location booking page manager
// GET  /v1/brand-config                    → list all brands for this merchant
// PUT  /v1/brand-config                    → upsert brand (locationId = null → master)
// POST /v1/brand-config/upload-image?type= → upload logo/banner, returns { url }
// GET  /v1/gmb/locations                   → list GMB locations for branch picker

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BookOpen, Copy, Check, Upload, Globe, MessageSquare,
  Palette, MapPin, Phone, ExternalLink, Info,
  Plus, ChevronRight, ArrowLeft, Code2,
} from "lucide-react"
import { DashboardPageLayout } from "@/components/dashboard/page-layout"
import { api } from "@/lib/api"

// ── Design tokens ─────────────────────────────────────────────────
const PINK         = "oklch(0.58 0.24 350)"
const PURPLE       = "oklch(0.55 0.22 290)"
const CARD_BG      = "oklch(1 0 0)"
const CARD_BORDER  = "oklch(0.91 0.008 350)"
const TEXT         = "oklch(0.14 0.008 270)"
const TEXT_MUTED   = "oklch(0.55 0.008 270)"
const TEXT_FAINT   = "oklch(0.65 0.008 270)"
const INPUT_BG     = "oklch(0.96 0.005 350)"
const INPUT_BORDER = "oklch(0.90 0.008 350)"
const GREEN        = "oklch(0.50 0.18 145)"
const RED          = "oklch(0.52 0.22 25)"

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

function emptyForm(locationId = null) {
  return {
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
    locationId,
  }
}

function brandToForm(b) {
  return {
    slug:                b.slug                ?? "",
    displayName:         b.displayName         ?? b.display_name         ?? "",
    tagline:             b.tagline             ?? "",
    businessType:        b.businessType        ?? b.business_type        ?? "restaurant",
    logoUrl:             b.logoUrl             ?? b.logo_url             ?? "",
    bannerUrl:           b.bannerUrl           ?? b.banner_url           ?? "",
    primaryColor:        b.primaryColor        ?? b.primary_color        ?? "#7C3AED",
    accentColor:         b.accentColor         ?? b.accent_color         ?? "#F59E0B",
    bookingTheme:        b.bookingTheme        ?? b.booking_theme        ?? "dark",
    whatsappNumber:      b.whatsappNumber      ?? b.whatsapp_number      ?? "",
    address:             b.address             ?? "",
    bookingPrompt:       b.bookingPrompt       ?? b.booking_prompt       ?? "",
    confirmationMessage: b.confirmationMessage ?? b.confirmation_message ?? "",
    showPoweredBy:       b.showPoweredBy       ?? b.show_powered_by      ?? true,
    locationId:          b.locationId          ?? b.location_id          ?? null,
  }
}

// ── Shared small components ───────────────────────────────────────

function Label({ children }) {
  return (
    <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_MUTED }}>
      {children}
    </label>
  )
}

function InputField({ value, onChange, placeholder, type = "text", ...rest }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors"
      style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }}
      onFocus={e => (e.target.style.borderColor = PINK)}
      onBlur={e => (e.target.style.borderColor = INPUT_BORDER)}
      {...rest}
    />
  )
}

function TextAreaField({ value, onChange, placeholder, rows = 2 }) {
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
        {Icon && <Icon className="w-4 h-4" style={{ color: PINK }} />}
        <h2 className="text-sm font-semibold" style={{ color: TEXT }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {}
      }}
      className="flex items-center justify-center w-7 h-7 rounded-lg transition-all hover:opacity-80 flex-shrink-0"
      style={{ background: copied ? `${GREEN}18` : INPUT_BG, border: `1px solid ${copied ? GREEN + "40" : INPUT_BORDER}` }}
    >
      {copied
        ? <Check className="w-3.5 h-3.5" style={{ color: GREEN }} />
        : <Copy className="w-3.5 h-3.5" style={{ color: TEXT_FAINT }} />}
    </button>
  )
}

// Compress image client-side to stay well under the 5 MB server limit.
// Draws onto a canvas at max 1400px on longest side, quality 0.82 JPEG.
async function compressImage(file, maxPx = 1400, quality = 0.82) {
  return new Promise((resolve) => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > maxPx || height > maxPx) {
        if (width >= height) { height = Math.round(height * maxPx / width); width = maxPx }
        else { width = Math.round(width * maxPx / height); height = maxPx }
      }
      const canvas = document.createElement("canvas")
      canvas.width = width; canvas.height = height
      canvas.getContext("2d").drawImage(img, 0, 0, width, height)
      canvas.toBlob(blob => resolve(blob ?? file), "image/jpeg", quality)
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}

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
              {uploading ? "Uploading…" : "Click to upload (JPEG, PNG, WebP)"}
            </span>
          </>
        )}
        {url && <span className="text-[11px]" style={{ color: TEXT_FAINT }}>{uploading ? "Uploading…" : "Click to replace"}</span>}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={async e => {
          const f = e.target.files?.[0]
          if (f) {
            const compressed = await compressImage(f)
            onUpload(compressed)
          }
          e.target.value = ""
        }}
      />
    </div>
  )
}

function ShareRow({ label, value }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: INPUT_BG }}>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-medium mb-0.5" style={{ color: TEXT_FAINT }}>{label}</div>
        <div className="text-xs font-mono truncate" style={{ color: TEXT }}>{value}</div>
      </div>
      <CopyButton text={value} />
    </div>
  )
}

function NoteCard({ icon: Icon, title, body }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: `${PURPLE}08`, border: `1px solid ${PURPLE}20` }}>
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: PURPLE }} />
      <div>
        <div className="text-xs font-semibold mb-0.5" style={{ color: TEXT }}>{title}</div>
        <div className="text-xs leading-relaxed" style={{ color: TEXT_MUTED }}>{body}</div>
      </div>
    </div>
  )
}

function Toast({ message, type }) {
  if (!message) return null
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-white text-sm font-medium"
      style={{ background: type === "error" ? RED : GREEN, maxWidth: 320 }}
    >
      {type === "error"
        ? <Info className="w-4 h-4 flex-shrink-0" />
        : <Check className="w-4 h-4 flex-shrink-0" />}
      {message}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }} />
      ))}
    </div>
  )
}

// ── Brand list card ───────────────────────────────────────────────

function BrandCard({ brand, onEdit }) {
  const isMaster = brand.locationId == null
  const slug = brand.slug ?? ""
  const name = brand.displayName ?? brand.display_name ?? slug
  const bookingUrl = brand.bookingUrl ?? `https://book.retilo.io/${slug}`

  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-4 transition-all cursor-pointer hover:shadow-sm"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
      onClick={() => onEdit(brand)}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${PINK}12` }}
      >
        {isMaster
          ? <Globe className="w-5 h-5" style={{ color: PINK }} />
          : <MapPin className="w-5 h-5" style={{ color: PINK }} />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold truncate" style={{ color: TEXT }}>{name}</span>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
            style={{
              background: isMaster ? `${PINK}12` : INPUT_BG,
              color: isMaster ? PINK : TEXT_FAINT,
            }}
          >
            {isMaster ? "Main" : "Branch"}
          </span>
        </div>
        <div className="text-xs font-mono truncate" style={{ color: TEXT_MUTED }}>
          {bookingUrl.replace("https://", "")}
        </div>
      </div>

      {/* Edit chevron */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-xs font-medium" style={{ color: TEXT_FAINT }}>Edit</span>
        <ChevronRight className="w-4 h-4" style={{ color: TEXT_FAINT }} />
      </div>
    </div>
  )
}

// ── List view ─────────────────────────────────────────────────────

function ListView({ brands, locations, loading, onEdit, onAdd }) {
  return (
    <div className="max-w-2xl mx-auto px-8 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-bold" style={{ color: TEXT }}>Your booking pages</h2>
          <p className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>
            Each location can have its own branded booking page
          </p>
        </div>
        <button
          onClick={() => onAdd(null)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
          style={{ background: PINK, color: "#fff" }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add page
        </button>
      </div>

      {loading ? <LoadingSkeleton /> : brands.length === 0 ? (
        <div
          className="rounded-2xl p-10 flex flex-col items-center gap-4 text-center"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${PINK}12` }}>
            <BookOpen className="w-6 h-6" style={{ color: PINK }} />
          </div>
          <div>
            <div className="text-sm font-semibold mb-1" style={{ color: TEXT }}>No booking pages yet</div>
            <div className="text-xs" style={{ color: TEXT_MUTED }}>
              Create your first booking page to start accepting reservations
            </div>
          </div>
          <button
            onClick={() => onAdd(null)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: PINK, color: "#fff" }}
          >
            <Plus className="w-4 h-4" />
            Create booking page
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {brands.map((b, i) => (
            <BrandCard key={b.slug ?? i} brand={b} onEdit={onEdit} />
          ))}

          {/* Add another location page */}
          <button
            onClick={() => onAdd(null)}
            className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all hover:opacity-80"
            style={{ background: INPUT_BG, border: `1.5px dashed ${INPUT_BORDER}` }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
              <Plus className="w-4 h-4" style={{ color: TEXT_FAINT }} />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium" style={{ color: TEXT_MUTED }}>Add another location</div>
              <div className="text-xs" style={{ color: TEXT_FAINT }}>Branch page with its own slug, branding & config</div>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}

// ── Edit / Create form ────────────────────────────────────────────

function EditForm({ initialForm, isNew, locations, onSave, onBack, showToast }) {
  const [form, setForm]               = useState(initialForm)
  const [slugError, setSlugError]     = useState("")
  const [saving, setSaving]           = useState(false)
  const [logoUploading, setLogoUploading]     = useState(false)
  const [bannerUploading, setBannerUploading] = useState(false)

  const set = (key) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value
    if (key === "slug") {
      const lower = val.toLowerCase()
      setSlugError(!SLUG_RE.test(lower) ? "Only lowercase letters, numbers, and hyphens allowed" : "")
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
      fd.append("image", file, "image.jpg")
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
    if (!form.slug)        { showToast("Booking URL slug is required", "error"); return }
    if (slugError)         { showToast(slugError, "error"); return }
    if (!form.displayName) { showToast("Display name is required", "error"); return }

    setSaving(true)
    try {
      await api.put("/v1/brand-config", {
        slug:                form.slug,
        displayName:         form.displayName,
        tagline:             form.tagline             || undefined,
        businessType:        form.businessType,
        logoUrl:             form.logoUrl             || undefined,
        bannerUrl:           form.bannerUrl           || undefined,
        primaryColor:        form.primaryColor,
        accentColor:         form.accentColor,
        bookingTheme:        form.bookingTheme,
        whatsappNumber:      form.whatsappNumber      || undefined,
        address:             form.address             || undefined,
        bookingPrompt:       form.bookingPrompt       || undefined,
        confirmationMessage: form.confirmationMessage || undefined,
        showPoweredBy:       form.showPoweredBy,
        locationId:          form.locationId          ?? undefined,
      })
      showToast("Booking page saved!")
      onSave()
    } catch (e) {
      showToast(e?.response?.data?.message ?? "Save failed", "error")
    } finally {
      setSaving(false)
    }
  }

  const bookingUrl   = form.slug ? `https://book.retilo.io/${form.slug}` : null
  const embedSnippet = form.slug ? `<script src="https://api.retilo.io/book/${form.slug}/embed.js" async></script>` : null
  const isMaster     = form.locationId == null

  return (
    <div className="max-w-2xl mx-auto px-8 py-6 space-y-5">

      {/* Back + header */}
      <div className="flex items-center gap-3 mb-1">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-medium transition-all hover:opacity-70"
          style={{ color: TEXT_MUTED }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All pages
        </button>
      </div>

      {/* Location badge (branch pages) */}
      {!isMaster && (
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
          style={{ background: `${PURPLE}08`, border: `1px solid ${PURPLE}20` }}
        >
          <MapPin className="w-3.5 h-3.5" style={{ color: PURPLE }} />
          <span className="text-xs" style={{ color: TEXT_MUTED }}>
            Branch page — location ID {form.locationId}
            {locations.find(l => l.id === form.locationId || l.google_location_id === String(form.locationId)) && (
              <> · {locations.find(l => l.id === form.locationId || l.google_location_id === String(form.locationId))?.title}</>
            )}
          </span>
        </div>
      )}

      {/* Location picker (only for new pages when locations exist) */}
      {isNew && locations.length > 0 && (
        <SectionCard icon={MapPin} title="Location (optional)">
          <p className="text-xs mb-3" style={{ color: TEXT_MUTED }}>
            Leave as "Main brand" for your primary booking page, or pick a specific branch.
          </p>
          <select
            value={form.locationId ?? ""}
            onChange={e => setForm(f => ({ ...f, locationId: e.target.value ? Number(e.target.value) : null }))}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }}
            onFocus={e => (e.target.style.borderColor = PINK)}
            onBlur={e => (e.target.style.borderColor = INPUT_BORDER)}
          >
            <option value="">Main brand (no specific location)</option>
            {locations.map(l => (
              <option key={l.id ?? l.google_location_id} value={l.id ?? l.google_location_id}>
                {l.title ?? l.name}
              </option>
            ))}
          </select>
        </SectionCard>
      )}

      {/* ── A. Identity ── */}
      <SectionCard icon={Globe} title="Identity">
        {/* Live URL preview */}
        <div
          className="mb-5 px-4 py-3 rounded-xl"
          style={{ background: `${PINK}08`, border: `1px solid ${PINK}20` }}
        >
          <div className="text-[10px] font-semibold mb-1" style={{ color: TEXT_FAINT, letterSpacing: "0.1em" }}>
            YOUR BOOKING PAGE
          </div>
          <div className="text-sm font-mono font-semibold" style={{ color: form.slug ? PINK : TEXT_FAINT }}>
            book.retilo.io/{form.slug || "your-slug"}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label>Restaurant / Business name *</Label>
            <InputField value={form.displayName} onChange={set("displayName")} placeholder="The Spice Garden" />
          </div>

          <div className="sm:col-span-2">
            <Label>Tagline</Label>
            <InputField value={form.tagline} onChange={set("tagline")} placeholder="Authentic South Indian cuisine" />
          </div>

          <div className="sm:col-span-2">
            <Label>Booking URL slug *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm select-none pointer-events-none" style={{ color: TEXT_FAINT }}>
                book.retilo.io/
              </span>
              <input
                type="text"
                value={form.slug}
                onChange={set("slug")}
                placeholder="the-spice-garden"
                className="w-full py-2 pr-3 rounded-xl text-sm outline-none transition-colors"
                style={{
                  paddingLeft: "calc(0.75rem + 9.5ch)",
                  background: INPUT_BG,
                  border: `1px solid ${slugError ? RED + "60" : INPUT_BORDER}`,
                  color: TEXT,
                }}
                onFocus={e => (e.target.style.borderColor = slugError ? RED + "90" : PINK)}
                onBlur={e => (e.target.style.borderColor = slugError ? RED + "60" : INPUT_BORDER)}
              />
            </div>
            {slugError && <p className="text-xs mt-1" style={{ color: RED }}>{slugError}</p>}
          </div>

          <div className="sm:col-span-2">
            <Label>Business type</Label>
            <div className="flex flex-wrap gap-2">
              {BUSINESS_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, businessType: t.value }))}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: form.businessType === t.value ? `${PINK}14` : INPUT_BG,
                    border: `1px solid ${form.businessType === t.value ? PINK + "50" : INPUT_BORDER}`,
                    color: form.businessType === t.value ? PINK : TEXT_MUTED,
                    fontWeight: form.businessType === t.value ? 600 : 400,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── B. Branding ── */}
      <SectionCard icon={Palette} title="Branding">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <ImageUploadZone label="Logo (1:1)" url={form.logoUrl} onUpload={f => uploadImage(f, "logo")} uploading={logoUploading} />
          <ImageUploadZone label="Banner (3:1 wide)" url={form.bannerUrl} onUpload={f => uploadImage(f, "banner")} uploading={bannerUploading} />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Primary colour</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.primaryColor}
                onChange={set("primaryColor")}
                className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0.5"
                style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}` }}
              />
              <input
                type="text"
                value={form.primaryColor}
                onChange={set("primaryColor")}
                className="flex-1 px-3 py-2 rounded-xl text-sm font-mono outline-none"
                style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }}
                onFocus={e => (e.target.style.borderColor = PINK)}
                onBlur={e => (e.target.style.borderColor = INPUT_BORDER)}
              />
            </div>
          </div>
          <div>
            <Label>Accent colour</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.accentColor}
                onChange={set("accentColor")}
                className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0.5"
                style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}` }}
              />
              <input
                type="text"
                value={form.accentColor}
                onChange={set("accentColor")}
                className="flex-1 px-3 py-2 rounded-xl text-sm font-mono outline-none"
                style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }}
                onFocus={e => (e.target.style.borderColor = PINK)}
                onBlur={e => (e.target.style.borderColor = INPUT_BORDER)}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          {["dark", "light"].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setForm(f => ({ ...f, bookingTheme: t }))}
              className="flex-1 py-3 rounded-xl text-xs font-semibold capitalize transition-all"
              style={{
                background: form.bookingTheme === t ? `${PINK}14` : INPUT_BG,
                border: `1px solid ${form.bookingTheme === t ? PINK + "50" : INPUT_BORDER}`,
                color: form.bookingTheme === t ? PINK : TEXT_MUTED,
              }}
            >
              {t === "dark" ? "🌙 Dark" : "☀️ Light"}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={form.showPoweredBy}
            onChange={set("showPoweredBy")}
            className="w-4 h-4 rounded accent-pink-500"
          />
          <span className="text-xs" style={{ color: TEXT_MUTED }}>Show "Powered by Retilo" on booking page</span>
        </label>
      </SectionCard>

      {/* ── C. Contact & Messaging ── */}
      <SectionCard icon={MessageSquare} title="Contact & Messaging">
        <div className="space-y-4">
          <div>
            <Label>WhatsApp number</Label>
            <InputField value={form.whatsappNumber} onChange={set("whatsappNumber")} placeholder="+91 98765 43210" type="tel" />
          </div>
          <div>
            <Label>Address</Label>
            <TextAreaField value={form.address} onChange={set("address")} placeholder="123 Main St, City" rows={2} />
          </div>
          <div>
            <Label>Booking page prompt</Label>
            <InputField value={form.bookingPrompt} onChange={set("bookingPrompt")} placeholder="Book a table with us" />
          </div>
          <div>
            <Label>Confirmation message</Label>
            <TextAreaField value={form.confirmationMessage} onChange={set("confirmationMessage")} placeholder="We'll confirm your booking on WhatsApp." rows={2} />
          </div>
        </div>
      </SectionCard>

      {/* ── D. Share (only when slug exists) ── */}
      {bookingUrl && (
        <SectionCard icon={ExternalLink} title="Share your page">
          <div className="space-y-3 mb-4">
            <ShareRow label="Booking URL" value={bookingUrl} />
            <ShareRow label="Website widget" value={embedSnippet} />
          </div>
          <div className="space-y-2">
            <NoteCard
              icon={MapPin}
              title="Add to Google Business"
              body="Google Business Profile → Edit profile → Add a link → paste your booking URL."
            />
            <NoteCard
              icon={Phone}
              title="Share on WhatsApp"
              body="Send your booking URL to customers or add it to your WhatsApp status."
            />
            <NoteCard
              icon={Code2}
              title="Embed on your website"
              body="Paste the widget snippet into your site's HTML before </body>. A floating 'Book a table' button appears automatically."
            />
          </div>
        </SectionCard>
      )}

      {/* ── Save ── */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
        style={{ background: `linear-gradient(135deg, ${PINK}, ${PURPLE})` }}
      >
        {saving ? "Saving…" : "Save & Publish"}
      </button>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────

export default function BookingPageSetup() {
  const router    = useRouter()
  const [loading, setLoading]     = useState(true)
  const [brands, setBrands]       = useState([])
  const [locations, setLocations] = useState([])
  const [toast, setToast]         = useState({ message: "", type: "success" })

  // view: "list" | "edit"
  const [view, setView]           = useState("list")
  const [editingForm, setEditingForm] = useState(null)
  const [isNew, setIsNew]         = useState(false)

  const showToast = (message, type = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast({ message: "", type: "success" }), 3500)
  }

  const loadBrands = () =>
    api.get("/v1/brand-config")
      .then(res => setBrands(res.data?.brands ?? []))
      .catch(() => {})

  useEffect(() => {
    if (!localStorage.getItem("retilo_token")) { router.replace("/auth"); return }
    Promise.all([
      api.get("/v1/brand-config").then(res => setBrands(res.data?.brands ?? [])).catch(() => {}),
      api.get("/v1/gmb/locations").then(res => setLocations(res.data?.data ?? [])).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [router])

  const handleEdit = (brand) => {
    setEditingForm(brandToForm(brand))
    setIsNew(false)
    setView("edit")
  }

  const handleAdd = () => {
    setEditingForm(emptyForm(null))
    setIsNew(true)
    setView("edit")
  }

  const handleBack = () => {
    setView("list")
    setEditingForm(null)
  }

  const handleSaved = () => {
    loadBrands()
    setView("list")
    setEditingForm(null)
  }

  const editingSlug = editingForm?.slug
  const pageTitle = view === "list"
    ? "Booking Pages"
    : isNew ? "New Booking Page" : `Edit · ${editingSlug || "Booking Page"}`
  const pageSubtitle = view === "list"
    ? "Manage all your public booking pages — one per location"
    : "Configure branding, messaging & share links"

  return (
    <DashboardPageLayout
      title={pageTitle}
      subtitle={pageSubtitle}
      actions={
        view === "edit" && editingSlug ? (
          <a
            href={`https://book.retilo.io/${editingSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
            style={{ background: `${PINK}12`, color: PINK, border: `1px solid ${PINK}28` }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Preview
          </a>
        ) : null
      }
    >
      {view === "list" ? (
        <ListView
          brands={brands}
          locations={locations}
          loading={loading}
          onEdit={handleEdit}
          onAdd={handleAdd}
        />
      ) : (
        <EditForm
          key={editingForm?.locationId ?? "new"}
          initialForm={editingForm}
          isNew={isNew}
          locations={locations}
          onSave={handleSaved}
          onBack={handleBack}
          showToast={showToast}
        />
      )}

      <Toast message={toast.message} type={toast.type} />
    </DashboardPageLayout>
  )
}
