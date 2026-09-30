"use client"

// Digital Twin Designer — lets the restaurant owner build their
// interactive zone map that customers see when booking a table.
//
// Backend APIs (JWT required):
//   GET    /v1/dinein/zones                     — list zones with photos
//   POST   /v1/dinein/zones                     — create zone
//   PATCH  /v1/dinein/zones/:id                 — update zone
//   DELETE /v1/dinein/zones/:id                 — delete zone
//   POST   /v1/dinein/zones/:id/photos          — upload photo (multipart)
//   DELETE /v1/dinein/zones/:id/photos/:photoId — delete photo
//   POST   /v1/dinein/zones/:id/photos/reorder  — reorder photos

import { useEffect, useRef, useState } from "react"
import {
  Plus, Trash2, Upload, X, Camera, Eye, EyeOff,
  Pencil, Check, GripVertical, Armchair, ChevronLeft, ChevronRight,
  ImagePlus, LayoutGrid,
} from "lucide-react"
import { DashboardPageLayout } from "@/components/dashboard/page-layout"
import { api } from "@/lib/api"

// ── Design tokens ──────────────────────────────────────────────────
const PINK        = "oklch(0.58 0.24 350)"
const CARD_BG     = "oklch(1 0 0)"
const CARD_BORDER = "oklch(0.91 0.008 350)"
const TEXT        = "oklch(0.14 0.008 270)"
const TEXT_MUTED  = "oklch(0.55 0.008 270)"
const TEXT_FAINT  = "oklch(0.65 0.008 270)"
const INPUT_BG    = "oklch(0.96 0.005 350)"
const INPUT_BORDER= "oklch(0.90 0.008 350)"
const GREEN       = "oklch(0.50 0.18 145)"
const RED         = "oklch(0.52 0.22 25)"
const ORANGE      = "oklch(0.62 0.20 50)"

const VIBE_TAGS = [
  "Romantic", "Great view", "Outdoor", "AC Indoor", "Private", "Family-friendly",
  "Bar seating", "Pet-friendly", "Rooftop", "Garden", "Lounge", "Booth",
]

// ── Zone form modal ─────────────────────────────────────────────────
function ZoneModal({ zone, onSave, onClose }) {
  const [form, setForm] = useState({
    name: zone?.name ?? "",
    description: zone?.description ?? "",
    capacity: zone?.capacity ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState("")

  const isEdit = !!zone?.id

  async function handleSave() {
    if (!form.name.trim()) { setErr("Zone name is required"); return }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        capacity: form.capacity ? parseInt(form.capacity) : null,
      }
      if (isEdit) {
        const res = await api.patch(`/v1/dinein/zones/${zone.id}`, payload)
        onSave(res.data)
      } else {
        const res = await api.post("/v1/dinein/zones", payload)
        onSave(res.data)
      }
    } catch (e) {
      setErr(e.response?.data?.message ?? "Failed to save zone")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold" style={{ color: TEXT }}>
            {isEdit ? "Edit zone" : "New seating zone"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/6">
            <X className="w-4 h-4" style={{ color: TEXT_MUTED }} />
          </button>
        </div>

        {err && (
          <div className="mb-4 rounded-xl px-3 py-2 text-sm" style={{ background: `${RED}12`, color: RED }}>
            {err}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: TEXT_MUTED }}>Zone name *</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Rooftop, Indoor AC, Private Dining"
              className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2"
              style={{ background: INPUT_BG, border: `1.5px solid ${INPUT_BORDER}`, color: TEXT,
                "--tw-ring-color": PINK }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: TEXT_MUTED }}>Description / vibe</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What makes this area special? e.g. Candle-lit tables with a city skyline view"
              rows={3}
              className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none resize-none focus:ring-2"
              style={{ background: INPUT_BG, border: `1.5px solid ${INPUT_BORDER}`, color: TEXT,
                "--tw-ring-color": PINK }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: TEXT_MUTED }}>Max capacity (guests)</label>
            <input
              value={form.capacity}
              onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
              type="number"
              min={1}
              placeholder="e.g. 30"
              className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2"
              style={{ background: INPUT_BG, border: `1.5px solid ${INPUT_BORDER}`, color: TEXT,
                "--tw-ring-color": PINK }}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all hover:bg-black/5"
            style={{ border: `1px solid ${CARD_BORDER}`, color: TEXT_MUTED }}
          >Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: PINK }}
          >{saving ? "Saving…" : isEdit ? "Save changes" : "Create zone"}</button>
        </div>
      </div>
    </div>
  )
}

// ── Zone card ───────────────────────────────────────────────────────
function ZoneCard({ zone, onUpdate, onDelete, onRefresh }) {
  const [photoIdx, setPhotoIdx] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const fileRef = useRef()

  const photos = zone.photos ?? []
  const photo = photos[photoIdx] ?? null

  async function uploadPhoto(file) {
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("photo", file)
      const caption = ""
      if (caption) fd.append("caption", caption)
      await api.post(`/v1/dinein/zones/${zone.id}/photos`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      onRefresh()
    } catch (e) {
      alert(e.response?.data?.message ?? "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  async function deletePhoto(photoId) {
    if (!confirm("Delete this photo?")) return
    try {
      await api.delete(`/v1/dinein/zones/${zone.id}/photos/${photoId}`)
      setPhotoIdx(0)
      onRefresh()
    } catch { }
  }

  async function toggleAvailability() {
    setToggling(true)
    try {
      const res = await api.patch(`/v1/dinein/zones/${zone.id}`, { isAvailable: !zone.isAvailable })
      onUpdate(res.data)
    } catch { } finally { setToggling(false) }
  }

  async function deleteZone() {
    if (!confirm(`Delete "${zone.name}" and all its photos?`)) return
    setDeleting(true)
    try {
      await api.delete(`/v1/dinein/zones/${zone.id}`)
      onDelete(zone.id)
    } catch { setDeleting(false) }
  }

  return (
    <>
      {editing && (
        <ZoneModal
          zone={zone}
          onSave={updated => { onUpdate(updated); setEditing(false) }}
          onClose={() => setEditing(false)}
        />
      )}

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: CARD_BG,
          border: `1px solid ${CARD_BORDER}`,
          opacity: zone.isAvailable ? 1 : 0.6,
        }}
      >
        {/* Photo area */}
        <div className="relative h-52 bg-zinc-100 group">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo.url} alt={zone.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ color: TEXT_FAINT }}>
              <Camera className="w-8 h-8 opacity-40" />
              <span className="text-xs">No photos yet</span>
            </div>
          )}

          {/* Photo nav — only when >1 photos */}
          {photos.length > 1 && (
            <>
              <button
                onClick={() => setPhotoIdx(i => Math.max(0, i - 1))}
                disabled={photoIdx === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/40 flex items-center justify-center disabled:opacity-0 hover:bg-black/60 transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => setPhotoIdx(i => Math.min(photos.length - 1, i + 1))}
                disabled={photoIdx === photos.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/40 flex items-center justify-center disabled:opacity-0 hover:bg-black/60 transition-all"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {photos.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setPhotoIdx(i)}
                    className="h-1.5 rounded-full cursor-pointer transition-all"
                    style={{ width: i === photoIdx ? 16 : 6, background: i === photoIdx ? "white" : "rgba(255,255,255,0.4)" }}
                  />
                ))}
              </div>
            </>
          )}

          {/* Delete current photo */}
          {photo && (
            <button
              onClick={() => deletePhoto(photo.id)}
              className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              <Trash2 className="w-3.5 h-3.5 text-white" />
            </button>
          )}

          {/* Upload button */}
          <label
            className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-white cursor-pointer transition-all hover:opacity-90"
            style={{ background: uploading ? "#888" : PINK }}
          >
            <Upload className="w-3 h-3" />
            {uploading ? "Uploading…" : photos.length === 0 ? "Add photo" : "Add more"}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => uploadPhoto(e.target.files?.[0])}
            />
          </label>

          {/* Photo count badge */}
          {photos.length > 0 && (
            <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white bg-black/40">
              <ImagePlus className="w-3 h-3" />
              {photos.length} photo{photos.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Zone info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm truncate" style={{ color: TEXT }}>{zone.name}</h3>
              {zone.capacity && (
                <p className="text-xs mt-0.5" style={{ color: TEXT_FAINT }}>Up to {zone.capacity} guests</p>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {/* availability toggle */}
              <button
                onClick={toggleAvailability}
                disabled={toggling}
                title={zone.isAvailable ? "Mark unavailable" : "Mark available"}
                className="h-7 w-7 rounded-lg flex items-center justify-center transition-all hover:bg-black/6 disabled:opacity-50"
              >
                {zone.isAvailable
                  ? <Eye className="w-3.5 h-3.5" style={{ color: GREEN }} />
                  : <EyeOff className="w-3.5 h-3.5" style={{ color: TEXT_FAINT }} />}
              </button>
              <button
                onClick={() => setEditing(true)}
                className="h-7 w-7 rounded-lg flex items-center justify-center transition-all hover:bg-black/6"
              >
                <Pencil className="w-3.5 h-3.5" style={{ color: TEXT_MUTED }} />
              </button>
              <button
                onClick={deleteZone}
                disabled={deleting}
                className="h-7 w-7 rounded-lg flex items-center justify-center transition-all hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" style={{ color: deleting ? RED : TEXT_FAINT }} />
              </button>
            </div>
          </div>

          {zone.description && (
            <p className="text-xs leading-relaxed line-clamp-2" style={{ color: TEXT_MUTED }}>
              {zone.description}
            </p>
          )}

          {/* availability pill */}
          <div className="mt-3">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold"
              style={{
                background: zone.isAvailable ? `${GREEN}15` : `${TEXT_FAINT}15`,
                color: zone.isAvailable ? GREEN : TEXT_FAINT,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: zone.isAvailable ? GREEN : TEXT_FAINT }} />
              {zone.isAvailable ? "Available" : "Hidden from customers"}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Customer preview strip ──────────────────────────────────────────
function CustomerPreview({ zones }) {
  const vibePhotos = zones.flatMap(z =>
    z.photos.slice(0, 2).map(p => ({ ...p, zoneName: z.name }))
  )
  const availableZones = zones.filter(z => z.isAvailable)

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "#0e0f12", color: "white", border: "1px solid #1e2028" }}
    >
      <div className="px-5 pt-5 pb-3 border-b border-white/8">
        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          Customer view — live preview
        </p>
      </div>

      {/* Cinematic strip preview */}
      {vibePhotos.length > 0 ? (
        <div className="w-full h-28 flex overflow-hidden">
          {vibePhotos.slice(0, 4).map((p, i) => (
            <div
              key={p.id}
              className="relative shrink-0 overflow-hidden"
              style={{ width: i === 0 ? "55%" : `${45 / Math.min(vibePhotos.length - 1, 3)}%` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.zoneName} className="h-full w-full object-cover" />
              {i > 0 && <div className="absolute inset-y-0 left-0 w-[2px] bg-[#0e0f12]" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-2 left-2 text-[10px] font-semibold text-white/90">{p.zoneName}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-28 flex items-center justify-center">
          <p className="text-xs text-zinc-600">Add photos to see the cinematic hero</p>
        </div>
      )}

      {/* Zone picker preview */}
      {availableZones.length > 0 && (
        <div className="px-4 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-3">Where would you like to sit?</p>
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {availableZones.map(z => {
              const photo = z.photos[0]?.url
              return (
                <div
                  key={z.id}
                  className="relative shrink-0 w-28 rounded-xl overflow-hidden border"
                  style={{ borderColor: "rgba(255,255,255,0.1)" }}
                >
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt={z.name} className="h-16 w-full object-cover" />
                  ) : (
                    <div className="h-16 w-full flex items-center justify-center bg-white/5">
                      <Armchair className="w-5 h-5 text-zinc-700" />
                    </div>
                  )}
                  <div className="p-2 bg-white/[0.04]">
                    <p className="text-[11px] font-medium text-zinc-200 truncate">{z.name}</p>
                    {z.capacity && <p className="text-[10px] text-zinc-600">up to {z.capacity}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {availableZones.length === 0 && vibePhotos.length === 0 && (
        <div className="px-5 py-6 text-center">
          <p className="text-xs text-zinc-600">Create zones and add photos to see the preview</p>
        </div>
      )}
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────
export default function DineInDesignerPage() {
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState("")
  const [showModal, setShowModal] = useState(false)

  async function loadZones() {
    try {
      const res = await api.get("/v1/dinein/zones")
      setZones(res.data ?? [])
    } catch (e) {
      setErr(e.response?.data?.message ?? "Failed to load zones")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadZones() }, [])

  function handleCreate(newZone) {
    setZones(z => [...z, newZone])
    setShowModal(false)
  }

  function handleUpdate(updated) {
    setZones(z => z.map(x => x.id === updated.id ? updated : x))
  }

  function handleDelete(id) {
    setZones(z => z.filter(x => x.id !== id))
  }

  return (
    <DashboardPageLayout
      title="Dine-in Digital Twin"
      subtitle="Design your restaurant's zones — customers pick where they sit when booking"
      actions={
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
          style={{ background: PINK }}
        >
          <Plus className="w-4 h-4" />
          Add zone
        </button>
      }
    >
      {showModal && (
        <ZoneModal
          zone={null}
          onSave={handleCreate}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className="px-8 py-6 max-w-6xl mx-auto">
        {/* Explainer banner */}
        <div
          className="rounded-2xl p-5 mb-8 flex items-start gap-4"
          style={{ background: `${PINK}08`, border: `1px solid ${PINK}20` }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: `${PINK}15` }}
          >
            <LayoutGrid className="w-5 h-5" style={{ color: PINK }} />
          </div>
          <div>
            <h3 className="text-sm font-bold mb-1" style={{ color: TEXT }}>
              How the digital twin works
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: TEXT_MUTED }}>
              Each zone you create (Rooftop, Indoor, Garden…) appears on your booking page as a photo card.
              Customers browse the zones, pick where they want to sit, and the agent books accordingly.
              The zone photos also appear as a cinematic hero strip at the top of the booking page.
              <strong style={{ color: TEXT }}> More photos = richer experience.</strong>
            </p>
          </div>
        </div>

        {err && (
          <div className="mb-6 rounded-xl px-4 py-3 text-sm" style={{ background: `${RED}12`, color: RED, border: `1px solid ${RED}25` }}>
            {err}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${PINK}40`, borderTopColor: PINK }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: zone cards */}
            <div className="lg:col-span-2">
              {zones.length === 0 ? (
                <div
                  className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-20 gap-4 cursor-pointer hover:border-opacity-60 transition-all"
                  style={{ borderColor: `${PINK}40` }}
                  onClick={() => setShowModal(true)}
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${PINK}12` }}>
                    <Armchair className="w-6 h-6" style={{ color: PINK }} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold mb-1" style={{ color: TEXT }}>No zones yet</p>
                    <p className="text-xs" style={{ color: TEXT_MUTED }}>
                      Add your first zone — Rooftop, Indoor, Garden, Private Room…
                    </p>
                  </div>
                  <button
                    className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white"
                    style={{ background: PINK }}
                  >
                    <Plus className="w-4 h-4" />
                    Add first zone
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {zones.map(z => (
                    <ZoneCard
                      key={z.id}
                      zone={z}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                      onRefresh={loadZones}
                    />
                  ))}
                  {/* Add zone card */}
                  <button
                    onClick={() => setShowModal(true)}
                    className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-10 gap-3 transition-all hover:border-opacity-60 min-h-[220px]"
                    style={{ borderColor: `${PINK}35` }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${PINK}10` }}>
                      <Plus className="w-5 h-5" style={{ color: PINK }} />
                    </div>
                    <span className="text-xs font-semibold" style={{ color: TEXT_MUTED }}>Add zone</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right: live preview */}
            <div className="lg:col-span-1">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: TEXT_FAINT }}>
                Live preview
              </p>
              <CustomerPreview zones={zones} />

              {zones.length > 0 && (
                <div
                  className="mt-4 rounded-xl px-4 py-3 text-xs leading-relaxed"
                  style={{ background: `${ORANGE}08`, border: `1px solid ${ORANGE}20`, color: TEXT_MUTED }}
                >
                  <span style={{ color: ORANGE, fontWeight: 700 }}>Tip:</span> Add 3–5 photos per zone for the best booking experience. Use real photos of the actual space — customers want to know what they're picking.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardPageLayout>
  )
}
