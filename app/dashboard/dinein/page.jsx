"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import {
  Plus, Trash2, Upload, X, Camera, Eye, EyeOff,
  Pencil, ChevronLeft, ChevronRight, ImagePlus, LayoutGrid,
  Map, Armchair, Check, Users, AlertCircle, Layers,
} from "lucide-react"
import { DashboardPageLayout } from "@/components/dashboard/page-layout"
import { api } from "@/lib/api"

const PINK        = "oklch(0.58 0.24 350)"

const KonvaEditor = dynamic(() => import("./konva-editor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${PINK}40`, borderTopColor: PINK }} />
    </div>
  ),
})
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

// ── Zone modal ──────────────────────────────────────────────────────
function ZoneModal({ zone, onSave, onClose }) {
  const [form, setForm] = useState({ name: zone?.name ?? "", description: zone?.description ?? "", capacity: zone?.capacity ?? "" })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState("")
  const isEdit = !!zone?.id

  async function handleSave() {
    if (!form.name.trim()) { setErr("Zone name is required"); return }
    setSaving(true)
    try {
      const payload = { name: form.name.trim(), description: form.description.trim() || null, capacity: form.capacity ? parseInt(form.capacity) : null }
      const res = isEdit
        ? await api.patch(`/v1/dinein/zones/${zone.id}`, payload)
        : await api.post("/v1/dinein/zones", payload)
      onSave(res.data?.data ?? res.data)
    } catch (e) { setErr(e.response?.data?.message ?? "Failed to save") }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold" style={{ color: TEXT }}>{isEdit ? "Edit zone" : "New seating zone"}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/6"><X className="w-4 h-4" style={{ color: TEXT_MUTED }} /></button>
        </div>
        {err && <div className="mb-4 rounded-xl px-3 py-2 text-sm" style={{ background: `${RED}12`, color: RED }}>{err}</div>}
        <div className="flex flex-col gap-4">
          {[
            { label: "Zone name *", key: "name", placeholder: "e.g. Rooftop, Indoor AC, Private Dining" },
            { label: "Description / vibe", key: "description", placeholder: "What makes this area special?", rows: 3 },
            { label: "Max capacity", key: "capacity", placeholder: "e.g. 30", type: "number" },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: TEXT_MUTED }}>{f.label}</label>
              {f.rows ? (
                <textarea value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder} rows={f.rows} className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none resize-none"
                  style={{ background: INPUT_BG, border: `1.5px solid ${INPUT_BORDER}`, color: TEXT }} />
              ) : (
                <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  type={f.type || "text"} placeholder={f.placeholder} className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  style={{ background: INPUT_BG, border: `1.5px solid ${INPUT_BORDER}`, color: TEXT }} />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 rounded-xl py-2.5 text-sm font-semibold" style={{ border: `1px solid ${CARD_BORDER}`, color: TEXT_MUTED }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60" style={{ background: PINK }}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create zone"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Table edit popover ──────────────────────────────────────────────
function TablePopover({ table, zones, onUpdate, onDelete, onClose }) {
  const [form, setForm] = useState({ label: table.label, capacity: table.capacity, zoneId: table.zoneId ?? "" })
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      const res = await api.patch(`/v1/dinein/tables/${table.id}`, {
        label: form.label, capacity: Number(form.capacity),
        zoneId: form.zoneId ? Number(form.zoneId) : null,
      })
      onUpdate(res.data?.data ?? res.data)
      onClose()
    } catch { setSaving(false) }
  }

  async function del() {
    if (!confirm(`Delete table "${table.label}"?`)) return
    await api.delete(`/v1/dinein/tables/${table.id}`)
    onDelete(table.id)
    onClose()
  }

  async function toggle() {
    const res = await api.patch(`/v1/dinein/tables/${table.id}`, { isAvailable: !table.isAvailable })
    onUpdate(res.data?.data ?? res.data)
    onClose()
  }

  return (
    <div className="absolute z-30 w-56 rounded-2xl shadow-2xl p-4 flex flex-col gap-3"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" }}>
      <input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
        placeholder="Label" className="rounded-lg px-2.5 py-1.5 text-xs outline-none"
        style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }} />
      <div className="flex gap-2">
        <div className="flex items-center gap-1.5">
          <Users className="w-3 h-3" style={{ color: TEXT_FAINT }} />
          <input value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))}
            type="number" min={1} max={40} className="w-14 rounded-lg px-2 py-1.5 text-xs outline-none"
            style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }} />
        </div>
        <select value={form.zoneId} onChange={e => setForm(p => ({ ...p, zoneId: e.target.value }))}
          className="flex-1 rounded-lg px-2 py-1.5 text-xs outline-none"
          style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }}>
          <option value="">No zone</option>
          {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
        </select>
      </div>
      <div className="flex gap-1.5">
        <button onClick={save} disabled={saving} className="flex-1 rounded-lg py-1.5 text-xs font-bold text-white" style={{ background: PINK }}>
          {saving ? "…" : "Save"}
        </button>
        <button onClick={toggle} className="rounded-lg py-1.5 px-2 text-xs" style={{ background: `${GREEN}15`, color: GREEN }}>
          {table.isAvailable ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
        <button onClick={del} className="rounded-lg py-1.5 px-2 text-xs" style={{ background: `${RED}12`, color: RED }}>
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <button onClick={onClose} className="rounded-lg py-1.5 px-2 text-xs" style={{ color: TEXT_FAINT }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ── Floor plan canvas editor (legacy image-based — replaced by KonvaEditor)
// eslint-disable-next-line no-unused-vars
function FloorPlanEditorLegacy({ floorPlanUrl, tables, zones, onTablesChange, onFloorPlanChange }) {
  const canvasRef = useRef(null)
  const [addMode, setAddMode] = useState(false)
  const [dragging, setDragging] = useState(null) // { id, startX, startY, origX, origY }
  const [selected, setSelected] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  function getPct(e, el) {
    const rect = el.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100)),
    }
  }

  async function handleCanvasClick(e) {
    if (dragging || !addMode || !canvasRef.current) return
    const { x, y } = getPct(e, canvasRef.current)
    const nextLabel = `T${tables.length + 1}`
    try {
      const res = await api.post("/v1/dinein/tables", { label: nextLabel, capacity: 2, x, y })
      onTablesChange(prev => [...prev, res.data])
      setAddMode(false)
    } catch { }
  }

  function onTableMouseDown(e, table) {
    e.stopPropagation()
    if (addMode) return
    if (selected?.id === table.id) { setSelected(null); return }
    const rect = canvasRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    setDragging({ id: table.id, startX: clientX, startY: clientY, origX: table.x, origY: table.y })
    setSelected(null)
  }

  const onMouseMove = useCallback((e) => {
    if (!dragging || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const dx = ((clientX - dragging.startX) / rect.width) * 100
    const dy = ((clientY - dragging.startY) / rect.height) * 100
    const newX = Math.min(98, Math.max(2, dragging.origX + dx))
    const newY = Math.min(97, Math.max(3, dragging.origY + dy))
    onTablesChange(prev => prev.map(t => t.id === dragging.id ? { ...t, x: newX, y: newY } : t))
  }, [dragging, onTablesChange])

  const onMouseUp = useCallback(async (e) => {
    if (!dragging) return
    const moved = tables.find(t => t.id === dragging.id)
    const dist = Math.abs(moved?.x - dragging.origX) + Math.abs(moved?.y - dragging.origY)
    if (dist < 1) {
      // Treat as click — open popover
      setSelected(tables.find(t => t.id === dragging.id) ?? null)
    } else if (moved) {
      try { await api.patch(`/v1/dinein/tables/${dragging.id}`, { x: moved.x, y: moved.y }) }
      catch { onTablesChange(prev => prev.map(t => t.id === dragging.id ? { ...t, x: dragging.origX, y: dragging.origY } : t)) }
    }
    setDragging(null)
  }, [dragging, tables, onTablesChange])

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    window.addEventListener("touchmove", onMouseMove, { passive: true })
    window.addEventListener("touchend", onMouseUp)
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
      window.removeEventListener("touchmove", onMouseMove)
      window.removeEventListener("touchend", onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  async function uploadPlan(file) {
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("floorPlan", file)
      const res = await api.post("/v1/dinein/floor-plan/upload", fd, { headers: { "Content-Type": "multipart/form-data" } })
      onFloorPlanChange(res.data.floorPlanUrl)
    } catch (e) { alert(e.response?.data?.message ?? "Upload failed") }
    finally { setUploading(false) }
  }

  async function removePlan() {
    if (!confirm("Remove floor plan image?")) return
    await api.delete("/v1/dinein/floor-plan")
    onFloorPlanChange(null)
    onTablesChange([])
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <label className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer transition hover:opacity-90"
          style={{ background: PINK, color: "white" }}>
          <Upload className="w-4 h-4" />
          {uploading ? "Uploading…" : floorPlanUrl ? "Replace plan" : "Upload floor plan"}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => uploadPlan(e.target.files?.[0])} />
        </label>

        {floorPlanUrl && (
          <>
            <button
              onClick={() => { setAddMode(a => !a); setSelected(null) }}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition"
              style={{ background: addMode ? `${PINK}18` : `${CARD_BORDER}50`, border: `1.5px solid ${addMode ? PINK : CARD_BORDER}`, color: addMode ? PINK : TEXT_MUTED }}
            >
              <Plus className="w-4 h-4" />
              {addMode ? "Click floor plan to place table" : "Add table"}
            </button>
            <button onClick={removePlan} className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition"
              style={{ color: RED, border: `1px solid ${RED}30`, background: `${RED}08` }}>
              <Trash2 className="w-4 h-4" /> Remove plan
            </button>
          </>
        )}

        <span className="ml-auto text-xs" style={{ color: TEXT_FAINT }}>
          {tables.length} table{tables.length !== 1 ? "s" : ""} placed
        </span>
      </div>

      {/* Canvas */}
      {floorPlanUrl ? (
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="relative w-full rounded-2xl overflow-hidden select-none"
          style={{
            border: `2px solid ${addMode ? PINK : CARD_BORDER}`,
            cursor: addMode ? "crosshair" : dragging ? "grabbing" : "default",
            boxShadow: addMode ? `0 0 0 3px ${PINK}25` : undefined,
            aspectRatio: "16/9",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={floorPlanUrl} alt="Floor plan" className="w-full h-full object-cover" draggable={false} />

          {/* Table markers */}
          {tables.map(table => {
            const zone = zones.find(z => z.id === table.zoneId)
            const isSelected = selected?.id === table.id
            return (
              <div
                key={table.id}
                onMouseDown={e => onTableMouseDown(e, table)}
                onTouchStart={e => onTableMouseDown(e, table)}
                className="absolute flex flex-col items-center"
                style={{ left: `${table.x}%`, top: `${table.y}%`, transform: "translate(-50%, -50%)", zIndex: isSelected ? 20 : 10 }}
              >
                {/* Circle marker */}
                <div
                  className="flex items-center justify-center rounded-full font-bold text-white text-[10px] transition-all"
                  style={{
                    width: 32, height: 32,
                    background: !table.isAvailable ? "#6b7280" : isSelected ? "#fff" : (zone ? PINK : "#374151"),
                    border: `2.5px solid ${isSelected ? PINK : "rgba(255,255,255,0.6)"}`,
                    color: isSelected ? PINK : "white",
                    cursor: dragging?.id === table.id ? "grabbing" : "grab",
                    boxShadow: isSelected ? `0 0 0 3px ${PINK}40` : "0 2px 8px rgba(0,0,0,0.35)",
                    transform: isSelected ? "scale(1.2)" : "scale(1)",
                  }}
                >
                  {table.label.replace(/^T/, "")}
                </div>
                {/* Label below */}
                <div className="mt-1 px-1.5 py-0.5 rounded text-[9px] font-semibold text-white"
                  style={{ background: "rgba(0,0,0,0.55)", whiteSpace: "nowrap" }}>
                  {table.label} · {table.capacity}p
                </div>

                {/* Popover */}
                {isSelected && (
                  <TablePopover
                    table={selected}
                    zones={zones}
                    onUpdate={updated => {
                      onTablesChange(prev => prev.map(t => t.id === updated.id ? updated : t))
                      setSelected(null)
                    }}
                    onDelete={id => { onTablesChange(prev => prev.filter(t => t.id !== id)); setSelected(null) }}
                    onClose={() => setSelected(null)}
                  />
                )}
              </div>
            )
          })}

          {/* Add mode hint overlay */}
          {addMode && tables.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="rounded-2xl px-5 py-3 text-sm font-semibold text-white" style={{ background: "rgba(0,0,0,0.55)" }}>
                Click anywhere to place a table
              </div>
            </div>
          )}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-20 gap-4 cursor-pointer transition hover:border-opacity-60"
          style={{ borderColor: `${PINK}40` }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${PINK}12` }}>
            <Map className="w-7 h-7" style={{ color: PINK }} />
          </div>
          <div className="text-center px-4">
            <p className="text-sm font-bold mb-1" style={{ color: TEXT }}>Upload your restaurant floor plan</p>
            <p className="text-xs" style={{ color: TEXT_MUTED }}>A bird's-eye photo or drawing of your restaurant layout. PNG, JPG, or WebP.</p>
          </div>
          <div className="rounded-xl px-4 py-2 text-sm font-bold text-white" style={{ background: PINK }}>Choose image</div>
          <input type="file" accept="image/*" className="hidden" onChange={e => uploadPlan(e.target.files?.[0])} />
        </label>
      )}

      {floorPlanUrl && (
        <p className="text-xs" style={{ color: TEXT_FAINT }}>
          <strong style={{ color: TEXT_MUTED }}>Tip:</strong> Click <strong>Add table</strong> then click a spot on the floor plan to place a table. Drag any table to reposition. Click a placed table to rename it, set capacity, or assign it to a zone.
        </p>
      )}
    </div>
  )
}

// ── Zone card ───────────────────────────────────────────────────────
function ZoneCard({ zone, onUpdate, onDelete, onRefresh }) {
  const [photoIdx, setPhotoIdx] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [toggling, setToggling] = useState(false)
  const photos = zone.photos ?? []
  const photo = photos[photoIdx] ?? null

  async function uploadPhoto(file) {
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("photo", file)
      await api.post(`/v1/dinein/zones/${zone.id}/photos`, fd, { headers: { "Content-Type": "multipart/form-data" } })
      onRefresh()
    } catch (e) { alert(e.response?.data?.message ?? "Upload failed") }
    finally { setUploading(false) }
  }

  async function deletePhoto(photoId) {
    if (!confirm("Delete this photo?")) return
    await api.delete(`/v1/dinein/zones/${zone.id}/photos/${photoId}`)
    setPhotoIdx(0); onRefresh()
  }

  async function toggleAvailability() {
    setToggling(true)
    try { const res = await api.patch(`/v1/dinein/zones/${zone.id}`, { isAvailable: !zone.isAvailable }); onUpdate(res.data?.data ?? res.data) }
    catch { } finally { setToggling(false) }
  }

  async function deleteZone() {
    if (!confirm(`Delete "${zone.name}" and all its photos?`)) return
    await api.delete(`/v1/dinein/zones/${zone.id}`)
    onDelete(zone.id)
  }

  return (
    <>
      {editing && <ZoneModal zone={zone} onSave={u => { onUpdate(u); setEditing(false) }} onClose={() => setEditing(false)} />}
      <div className="rounded-2xl overflow-hidden" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, opacity: zone.isAvailable ? 1 : 0.65 }}>
        <div className="relative h-44 bg-zinc-100 group">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo.url} alt={zone.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ color: TEXT_FAINT }}>
              <Camera className="w-7 h-7 opacity-30" /><span className="text-xs">No photos</span>
            </div>
          )}
          {photos.length > 1 && (
            <>
              <button onClick={() => setPhotoIdx(i => Math.max(0, i - 1))} disabled={photoIdx === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/40 flex items-center justify-center disabled:opacity-0">
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <button onClick={() => setPhotoIdx(i => Math.min(photos.length - 1, i + 1))} disabled={photoIdx === photos.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/40 flex items-center justify-center disabled:opacity-0">
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </>
          )}
          {photo && (
            <button onClick={() => deletePhoto(photo.id)}
              className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
              <Trash2 className="w-3.5 h-3.5 text-white" />
            </button>
          )}
          <label className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-white cursor-pointer"
            style={{ background: uploading ? "#888" : PINK }}>
            <Upload className="w-3 h-3" />{uploading ? "Uploading…" : photos.length === 0 ? "Add photo" : "More"}
            <input type="file" accept="image/*" className="hidden" onChange={e => uploadPhoto(e.target.files?.[0])} />
          </label>
          {photos.length > 0 && (
            <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white bg-black/40">
              <ImagePlus className="w-3 h-3" />{photos.length}
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm truncate" style={{ color: TEXT }}>{zone.name}</h3>
              {zone.capacity && <p className="text-xs mt-0.5" style={{ color: TEXT_FAINT }}>Up to {zone.capacity} guests</p>}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={toggleAvailability} disabled={toggling} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-black/6 disabled:opacity-50">
                {zone.isAvailable ? <Eye className="w-3.5 h-3.5" style={{ color: GREEN }} /> : <EyeOff className="w-3.5 h-3.5" style={{ color: TEXT_FAINT }} />}
              </button>
              <button onClick={() => setEditing(true)} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-black/6">
                <Pencil className="w-3.5 h-3.5" style={{ color: TEXT_MUTED }} />
              </button>
              <button onClick={deleteZone} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-red-50">
                <Trash2 className="w-3.5 h-3.5" style={{ color: TEXT_FAINT }} />
              </button>
            </div>
          </div>
          {zone.description && <p className="text-xs leading-relaxed line-clamp-2" style={{ color: TEXT_MUTED }}>{zone.description}</p>}
          <div className="mt-2.5">
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ background: zone.isAvailable ? `${GREEN}15` : `${TEXT_FAINT}15`, color: zone.isAvailable ? GREEN : TEXT_FAINT }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: zone.isAvailable ? GREEN : TEXT_FAINT }} />
              {zone.isAvailable ? "Visible" : "Hidden"}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Live customer preview ───────────────────────────────────────────
function CustomerPreview({ zones, canvas }) {
  const vibePhotos = zones.flatMap(z => z.photos.slice(0, 2).map(p => ({ ...p, zoneName: z.name })))
  const availableZones = zones.filter(z => z.isAvailable)
  const canvasTables = canvas?.tables ?? []
  const canvasZones  = canvas?.zones  ?? []

  return (
    <div className="rounded-2xl overflow-hidden sticky top-6" style={{ background: "#0e0f12", color: "white", border: "1px solid #1e2028" }}>
      <div className="px-4 pt-4 pb-2 border-b border-white/8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Customer view preview</p>
      </div>

      {vibePhotos.length > 0 && (
        <div className="w-full h-24 flex overflow-hidden">
          {vibePhotos.slice(0, 3).map((p, i) => (
            <div key={p.id} className="relative shrink-0 overflow-hidden" style={{ width: i === 0 ? "55%" : "22.5%" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.zoneName} className="h-full w-full object-cover" />
              {i > 0 && <div className="absolute inset-y-0 left-0 w-[2px] bg-[#0e0f12]" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-1.5 left-2 text-[9px] font-semibold text-white/90">{p.zoneName}</span>
            </div>
          ))}
        </div>
      )}

      {canvasTables.length > 0 ? (
        <div className="p-4 flex flex-col gap-3">
          {canvasZones.length > 0 && (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Zones on floor plan</p>
              <div className="flex flex-wrap gap-1.5">
                {canvasZones.map(z => (
                  <span key={z.id} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${z.color}22`, color: z.color, border: `1px solid ${z.color}44` }}>
                    {z.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Tables</p>
            <div className="flex flex-wrap gap-1.5">
              {canvasTables.map(t => (
                <div key={t.id} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: t.available ? "#ffffff12" : "#ffffff06",
                    color: t.available ? "#ffffff" : "#555",
                    border: `1px solid ${t.available ? "#ffffff22" : "#ffffff0a"}`,
                  }}>
                  {t.label} · {t.capacity}p
                </div>
              ))}
            </div>
          </div>
          <p className="text-[9px] text-zinc-600">Customers will see this as an interactive floor plan and tap their preferred table.</p>
        </div>
      ) : availableZones.length > 0 ? (
        <div className="px-3 py-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Where would you like to sit?</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {availableZones.map(z => (
              <div key={z.id} className="relative shrink-0 w-24 rounded-xl overflow-hidden border border-white/10">
                {z.photos[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={z.photos[0].url} alt={z.name} className="h-14 w-full object-cover" />
                ) : (
                  <div className="h-14 flex items-center justify-center bg-white/5"><Armchair className="w-4 h-4 text-zinc-700" /></div>
                )}
                <div className="p-1.5 bg-white/[0.04]">
                  <p className="text-[10px] font-medium text-zinc-200 truncate">{z.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 py-6 text-center"><p className="text-xs text-zinc-600">Design your floor plan to preview it here</p></div>
      )}
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────
export default function DineInDesignerPage() {
  const [tab, setTab] = useState("floorplan")
  const [zones, setZones] = useState([])
  const [canvas, setCanvas] = useState({ zones: [], tables: [] })
  const [loading, setLoading] = useState(true)
  const [showZoneModal, setShowZoneModal] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get("/v1/dinein/zones"),
    ]).then(([zRes]) => {
      setZones(zRes.data?.data ?? [])
    }).catch(() => { }).finally(() => setLoading(false))
  }, [])

  const tabStyle = (t) => ({
    padding: "8px 18px",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    background: tab === t ? PINK : "transparent",
    color: tab === t ? "white" : TEXT_MUTED,
    border: "none",
    transition: "all 0.15s",
  })

  return (
    <DashboardPageLayout
      title="Dine-in Digital Twin"
      subtitle="Design your restaurant — customers pick their exact table when booking"
      actions={
        tab === "zones" ? (
          <button onClick={() => setShowZoneModal(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white hover:opacity-90"
            style={{ background: PINK }}>
            <Plus className="w-4 h-4" /> Add zone
          </button>
        ) : null
      }
    >
      {showZoneModal && (
        <ZoneModal zone={null} onSave={z => { setZones(p => [...p, z]); setShowZoneModal(false) }} onClose={() => setShowZoneModal(false)} />
      )}

      <div className="px-8 py-6 max-w-6xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: `${CARD_BORDER}60` }}>
          <button style={tabStyle("floorplan")} onClick={() => setTab("floorplan")}>
            <span className="flex items-center gap-2"><Map className="w-3.5 h-3.5" /> Floor Plan + Tables</span>
          </button>
          <button style={tabStyle("zones")} onClick={() => setTab("zones")}>
            <span className="flex items-center gap-2"><LayoutGrid className="w-3.5 h-3.5" /> Zone Photos</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${PINK}40`, borderTopColor: PINK }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {tab === "floorplan" ? (
                <div className="rounded-2xl p-6" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                  <KonvaEditor onCanvasChange={setCanvas} />
                </div>
              ) : (
                <div>
                  {zones.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-20 gap-4 cursor-pointer"
                      style={{ borderColor: `${PINK}40` }} onClick={() => setShowZoneModal(true)}>
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${PINK}12` }}>
                        <Armchair className="w-6 h-6" style={{ color: PINK }} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold mb-1" style={{ color: TEXT }}>No zones yet</p>
                        <p className="text-xs" style={{ color: TEXT_MUTED }}>Add Rooftop, Indoor, Garden, Private Room…</p>
                      </div>
                      <button className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white" style={{ background: PINK }}>
                        <Plus className="w-4 h-4" /> Add first zone
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {zones.map(z => (
                        <ZoneCard key={z.id} zone={z}
                          onUpdate={u => setZones(p => p.map(x => x.id === u.id ? u : x))}
                          onDelete={id => setZones(p => p.filter(x => x.id !== id))}
                          onRefresh={() => api.get("/v1/dinein/zones").then(r => setZones(r.data?.data ?? []))} />
                      ))}
                      <button onClick={() => setShowZoneModal(true)}
                        className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-10 gap-3 min-h-[220px]"
                        style={{ borderColor: `${PINK}30` }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${PINK}10` }}>
                          <Plus className="w-5 h-5" style={{ color: PINK }} />
                        </div>
                        <span className="text-xs font-semibold" style={{ color: TEXT_MUTED }}>Add zone</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: live preview */}
            <div className="lg:col-span-1">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: TEXT_FAINT }}>Live preview</p>
              <CustomerPreview zones={zones} canvas={canvas} />
              <div className="mt-4 rounded-xl px-4 py-3 text-xs leading-relaxed"
                style={{ background: `${PINK}06`, border: `1px solid ${PINK}18`, color: TEXT_MUTED }}>
                <strong style={{ color: PINK }}>How it flows:</strong> Floor plan → customer taps their table → agent books that specific table in Swiggy. Zone photos appear as the cinematic hero strip at the top of the booking page.
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardPageLayout>
  )
}
