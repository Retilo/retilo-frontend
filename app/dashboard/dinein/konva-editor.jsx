'use client'
// Loaded dynamically (ssr: false) — Konva requires browser Canvas API

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Stage, Layer, Circle, Rect, Text, Group, Line } from 'react-konva'
import { api } from '@/lib/api'
import {
  MousePointer2, Circle as LucideCircle, RectangleHorizontal,
  Layers, Undo2, Trash2, Check, Loader2, Users, Eye, EyeOff,
} from 'lucide-react'

// ── Constants ───────────────────────────────────────────────────────
const VW = 900
const VH = 540
const GRID = 30

const ZONE_COLORS = ['#f59e0b', '#8b5cf6', '#10b981', '#3b82f6', '#ef4444', '#ec4899']
const EMPTY = { zones: [], tables: [] }

function genId() { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}` }
function snap(v) { return Math.round(v / GRID) * GRID }

// ── Tool button ─────────────────────────────────────────────────────
function ToolBtn({ active, onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
      style={{
        background: active ? 'oklch(0.58 0.24 350)' : 'oklch(0.96 0.005 350)',
        border: `1.5px solid ${active ? 'oklch(0.58 0.24 350)' : 'oklch(0.91 0.008 350)'}`,
        color: active ? 'white' : 'oklch(0.55 0.008 270)',
      }}
    >
      {children}
    </button>
  )
}

// ── Main component ──────────────────────────────────────────────────
export default function KonvaEditor({ onCanvasChange }) {
  const [canvas, setCanvas]       = useState(EMPTY)
  const [mode, setMode]           = useState('select')
  const [zoneColor, setZoneColor] = useState(ZONE_COLORS[0])
  const [selectedId, setSelectedId] = useState(null)
  const [editTarget, setEditTarget] = useState(null)  // { id, type, ...fields }
  const [drawing, setDrawing]     = useState(null)    // zone being drawn { x, y, w, h }
  const [history, setHistory]     = useState([EMPTY])
  const [histPos, setHistPos]     = useState(0)
  const [saveState, setSaveState] = useState('idle')  // 'idle'|'saving'|'saved'
  const [stageW, setStageW]       = useState(800)
  const [loaded, setLoaded]       = useState(false)

  const containerRef = useRef(null)
  const stageRef     = useRef(null)
  const saveTimer    = useRef(null)
  const drawStart    = useRef(null)
  const isDragging   = useRef(false)

  // Responsive width
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(([e]) => setStageW(e.contentRect.width))
    obs.observe(el)
    setStageW(el.getBoundingClientRect().width)
    return () => obs.disconnect()
  }, [])

  // Load canvas from backend
  useEffect(() => {
    api.get('/v1/dinein/canvas')
      .then(r => {
        const data = r.data?.data ?? EMPTY
        setCanvas(data)
        setHistory([data])
        setHistPos(0)
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  const scale  = stageW / VW
  const stageH = stageW * (VH / VW)

  // ── Auto-save ───────────────────────────────────────────────────
  function schedSave(next) {
    clearTimeout(saveTimer.current)
    setSaveState('saving')
    saveTimer.current = setTimeout(async () => {
      try {
        await api.put('/v1/dinein/canvas', next)
        setSaveState('saved')
        setTimeout(() => setSaveState('idle'), 2500)
      } catch { setSaveState('idle') }
    }, 1400)
  }

  // ── State helpers ───────────────────────────────────────────────
  function pushCanvas(next) {
    setCanvas(next)
    const newHist = [...history.slice(0, histPos + 1), next].slice(-25)
    setHistory(newHist)
    setHistPos(newHist.length - 1)
    schedSave(next)
    onCanvasChange?.(next)
  }

  function undo() {
    if (histPos <= 0) return
    const prev = history[histPos - 1]
    setCanvas(prev)
    setHistPos(p => p - 1)
    schedSave(prev)
  }

  function clearAll() {
    if (!confirm('Clear the entire floor plan?')) return
    const next = EMPTY
    pushCanvas(next)
    setSelectedId(null)
    setEditTarget(null)
  }

  // ── Table ops ───────────────────────────────────────────────────
  function placeTable(px, py) {
    const sx = snap(px), sy = snap(py)
    const label = `T${canvas.tables.length + 1}`
    const table = mode === 'addRound'
      ? { id: genId(), x: sx, y: sy, shape: 'circle', r: 28, label, capacity: 2, available: true }
      : { id: genId(), x: sx - 39, y: sy - 27, shape: 'rect', w: 78, h: 54, label, capacity: 4, available: true }
    const next = { ...canvas, tables: [...canvas.tables, table] }
    pushCanvas(next)
    setMode('select')
    setSelectedId(table.id)
    setEditTarget({ id: table.id, type: 'table', label: table.label, capacity: table.capacity, available: table.available })
  }

  function applyTableEdit() {
    if (!editTarget || editTarget.type !== 'table') return
    const next = {
      ...canvas,
      tables: canvas.tables.map(t =>
        t.id === editTarget.id
          ? { ...t, label: editTarget.label, capacity: Number(editTarget.capacity), available: editTarget.available }
          : t
      ),
    }
    pushCanvas(next)
  }

  function moveTable(id, x, y) {
    const next = { ...canvas, tables: canvas.tables.map(t => t.id === id ? { ...t, x: snap(x), y: snap(y) } : t) }
    pushCanvas(next)
  }

  function deleteSelected() {
    if (!selectedId) return
    const isZone = canvas.zones.some(z => z.id === selectedId)
    const next = isZone
      ? { ...canvas, zones: canvas.zones.filter(z => z.id !== selectedId) }
      : { ...canvas, tables: canvas.tables.filter(t => t.id !== selectedId) }
    pushCanvas(next)
    setSelectedId(null)
    setEditTarget(null)
  }

  // ── Zone ops ────────────────────────────────────────────────────
  function finalizeZone(d) {
    const x = Math.min(d.x, d.x + d.w), y = Math.min(d.y, d.y + d.h)
    const w = Math.abs(d.w), h = Math.abs(d.h)
    if (w < 40 || h < 40) return
    const zone = { id: genId(), x: snap(x), y: snap(y), w: snap(w), h: snap(h), color: zoneColor, name: 'Zone' }
    const next = { ...canvas, zones: [...canvas.zones, zone] }
    pushCanvas(next)
    setMode('select')
    setSelectedId(zone.id)
    setEditTarget({ id: zone.id, type: 'zone', name: 'Zone', color: zoneColor })
  }

  function applyZoneEdit() {
    if (!editTarget || editTarget.type !== 'zone') return
    const next = {
      ...canvas,
      zones: canvas.zones.map(z =>
        z.id === editTarget.id ? { ...z, name: editTarget.name, color: editTarget.color } : z
      ),
    }
    pushCanvas(next)
  }

  function moveZone(id, x, y) {
    const next = { ...canvas, zones: canvas.zones.map(z => z.id === id ? { ...z, x: snap(x), y: snap(y) } : z) }
    pushCanvas(next)
  }

  // ── Stage event handlers ────────────────────────────────────────
  function getPos() {
    return stageRef.current?.getRelativePointerPosition() ?? { x: 0, y: 0 }
  }

  function handleBgClick() {
    if (isDragging.current) return
    if (mode === 'addRound' || mode === 'addRect') {
      const p = getPos()
      placeTable(p.x, p.y)
    } else {
      setSelectedId(null)
      setEditTarget(null)
    }
  }

  function handleStageMouseDown(e) {
    if (mode !== 'addZone') return
    const p = getPos()
    drawStart.current = p
    setDrawing({ x: p.x, y: p.y, w: 0, h: 0 })
  }

  function handleStageMouseMove() {
    if (mode !== 'addZone' || !drawStart.current) return
    const p = getPos()
    setDrawing({
      x: drawStart.current.x,
      y: drawStart.current.y,
      w: p.x - drawStart.current.x,
      h: p.y - drawStart.current.y,
    })
  }

  function handleStageMouseUp() {
    if (mode !== 'addZone' || !drawStart.current) return
    if (drawing) finalizeZone(drawing)
    drawStart.current = null
    setDrawing(null)
  }

  function handleTableClick(t, e) {
    e.cancelBubble = true
    if (isDragging.current || mode !== 'select') return
    setSelectedId(t.id)
    setEditTarget({ id: t.id, type: 'table', label: t.label, capacity: t.capacity, available: t.available })
  }

  function handleZoneClick(z, e) {
    e.cancelBubble = true
    if (isDragging.current || mode !== 'select') return
    setSelectedId(z.id)
    setEditTarget({ id: z.id, type: 'zone', name: z.name, color: z.color })
  }

  // Grid dots (rendered once, not interactive)
  const gridDots = useMemo(() => {
    const dots = []
    for (let gx = 0; gx <= VW; gx += GRID)
      for (let gy = 0; gy <= VH; gy += GRID)
        dots.push({ x: gx, y: gy })
    return dots
  }, [])

  // Normalized drawing rect
  const drawRect = useMemo(() => {
    if (!drawing) return null
    return {
      x: Math.min(drawing.x, drawing.x + drawing.w),
      y: Math.min(drawing.y, drawing.y + drawing.h),
      w: Math.abs(drawing.w),
      h: Math.abs(drawing.h),
    }
  }, [drawing])

  const canUndo = histPos > 0
  const selected = canvas.tables.find(t => t.id === selectedId) ?? canvas.zones.find(z => z.id === selectedId)

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'oklch(0.58 0.24 350)' }} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">

      {/* ── Toolbar ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <ToolBtn active={mode === 'select'} onClick={() => setMode('select')} title="Select & move">
          <MousePointer2 className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn active={mode === 'addRound'} onClick={() => setMode('addRound')} title="Add round table">
          <LucideCircle className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn active={mode === 'addRect'} onClick={() => setMode('addRect')} title="Add rectangular table">
          <RectangleHorizontal className="w-4 h-4" />
        </ToolBtn>

        <div className="flex items-center gap-1 px-2 py-1 rounded-xl" style={{ background: 'oklch(0.96 0.005 350)', border: '1.5px solid oklch(0.91 0.008 350)' }}>
          <button
            onClick={() => setMode(mode === 'addZone' ? 'select' : 'addZone')}
            className="flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: mode === 'addZone' ? 'oklch(0.58 0.24 350)' : 'oklch(0.55 0.008 270)' }}
            title="Draw a zone area"
          >
            <Layers className="w-4 h-4" /> Zone
          </button>
          <div className="flex gap-1 ml-1">
            {ZONE_COLORS.map(c => (
              <button
                key={c}
                onClick={() => { setZoneColor(c); setMode('addZone') }}
                className="w-4 h-4 rounded-full transition-transform"
                style={{
                  background: c,
                  outline: zoneColor === c && mode === 'addZone' ? `2px solid ${c}` : 'none',
                  outlineOffset: 1,
                  transform: zoneColor === c && mode === 'addZone' ? 'scale(1.3)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>

        <div className="w-px h-6 mx-1" style={{ background: 'oklch(0.91 0.008 350)' }} />

        <ToolBtn active={false} onClick={undo} title="Undo">
          <Undo2 className={`w-4 h-4 ${!canUndo ? 'opacity-30' : ''}`} />
        </ToolBtn>

        {selectedId && (
          <ToolBtn active={false} onClick={deleteSelected} title="Delete selected">
            <Trash2 className="w-4 h-4 text-red-400" />
          </ToolBtn>
        )}

        <div className="ml-auto flex items-center gap-2">
          {saveState === 'saving' && (
            <span className="text-xs flex items-center gap-1" style={{ color: 'oklch(0.65 0.008 270)' }}>
              <Loader2 className="w-3 h-3 animate-spin" /> Saving…
            </span>
          )}
          {saveState === 'saved' && (
            <span className="text-xs flex items-center gap-1" style={{ color: 'oklch(0.50 0.18 145)' }}>
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
          <span className="text-xs" style={{ color: 'oklch(0.65 0.008 270)' }}>
            {canvas.tables.length} tables · {canvas.zones.length} zones
          </span>
        </div>
      </div>

      {/* ── Mode hint ──────────────────────────────────────────── */}
      {mode !== 'select' && (
        <div className="rounded-xl px-3 py-2 text-xs text-center font-medium" style={{ background: 'oklch(0.58 0.24 350 / 0.08)', color: 'oklch(0.58 0.24 350)', border: '1px solid oklch(0.58 0.24 350 / 0.2)' }}>
          {mode === 'addRound' && 'Click on the canvas to place a round table'}
          {mode === 'addRect'  && 'Click on the canvas to place a rectangular table'}
          {mode === 'addZone'  && 'Click and drag to draw a zone area · Esc to cancel'}
        </div>
      )}

      {/* ── Canvas ─────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="rounded-2xl overflow-hidden w-full"
        style={{
          width: '100%',
          height: stageH,
          cursor: mode === 'addZone' ? 'crosshair' : mode !== 'select' ? 'crosshair' : 'default',
        }}
        onKeyDown={e => { if (e.key === 'Escape') setMode('select'); if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected() }}
        tabIndex={0}
      >
        <Stage
          ref={stageRef}
          width={stageW}
          height={stageH}
          scaleX={scale}
          scaleY={scale}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
          onTouchStart={handleStageMouseDown}
          onTouchMove={handleStageMouseMove}
          onTouchEnd={handleStageMouseUp}
        >
          {/* Background + grid */}
          <Layer listening={false}>
            <Rect x={0} y={0} width={VW} height={VH} fill="#12141a" />
            {gridDots.map((d, i) => (
              <Circle key={i} x={d.x} y={d.y} radius={1} fill="rgba(255,255,255,0.07)" />
            ))}
          </Layer>

          {/* Zones */}
          <Layer>
            {canvas.zones.map(z => {
              const isSel = z.id === selectedId
              return (
                <Group
                  key={z.id}
                  x={z.x} y={z.y}
                  draggable={mode === 'select'}
                  onClick={e => handleZoneClick(z, e)}
                  onTap={e => handleZoneClick(z, e)}
                  onDragStart={() => { isDragging.current = true }}
                  onDragEnd={e => {
                    isDragging.current = false
                    moveZone(z.id, e.target.x(), e.target.y())
                    e.target.x(snap(e.target.x()))
                    e.target.y(snap(e.target.y()))
                  }}
                >
                  <Rect
                    x={0} y={0} width={z.w} height={z.h}
                    fill={z.color}
                    opacity={isSel ? 0.22 : 0.13}
                    stroke={z.color}
                    strokeWidth={isSel ? 2 : 1}
                    cornerRadius={8}
                  />
                  <Text
                    x={10} y={10}
                    text={z.name}
                    fontSize={13}
                    fontStyle="bold"
                    fill={z.color}
                    opacity={0.85}
                  />
                </Group>
              )
            })}
          </Layer>

          {/* Tables */}
          <Layer>
            {canvas.tables.map(t => {
              const isSel = t.id === selectedId
              const fill = !t.available ? '#374151' : isSel ? '#a855f7' : '#4b5563'
              const stroke = isSel ? '#a855f7' : 'rgba(255,255,255,0.3)'
              const cx = t.shape === 'circle' ? t.x : t.x + (t.w ?? 78) / 2
              const cy = t.shape === 'circle' ? t.y : t.y + (t.h ?? 54) / 2

              return (
                <Group
                  key={t.id}
                  x={cx} y={cy}
                  draggable={mode === 'select'}
                  onClick={e => handleTableClick(t, e)}
                  onTap={e => handleTableClick(t, e)}
                  onDragStart={() => { isDragging.current = true }}
                  onDragEnd={e => {
                    isDragging.current = false
                    const nx = e.target.x(), ny = e.target.y()
                    const ox = t.shape === 'circle' ? nx : nx - (t.w ?? 78) / 2
                    const oy = t.shape === 'circle' ? ny : ny - (t.h ?? 54) / 2
                    moveTable(t.id, ox, oy)
                    e.target.x(snap(nx))
                    e.target.y(snap(ny))
                  }}
                >
                  {/* Selection ring */}
                  {isSel && t.shape === 'circle' && (
                    <Circle radius={(t.r ?? 28) + 5} fill="transparent" stroke="#a855f7" strokeWidth={2} opacity={0.5} />
                  )}
                  {isSel && t.shape === 'rect' && (
                    <Rect
                      x={-(t.w ?? 78) / 2 - 4} y={-(t.h ?? 54) / 2 - 4}
                      width={(t.w ?? 78) + 8} height={(t.h ?? 54) + 8}
                      fill="transparent" stroke="#a855f7" strokeWidth={2} cornerRadius={13} opacity={0.5}
                    />
                  )}
                  {/* Table shape */}
                  {t.shape === 'circle' ? (
                    <Circle radius={t.r ?? 28} fill={fill} stroke={stroke} strokeWidth={1.5} />
                  ) : (
                    <Rect
                      x={-(t.w ?? 78) / 2} y={-(t.h ?? 54) / 2}
                      width={t.w ?? 78} height={t.h ?? 54}
                      fill={fill} stroke={stroke} strokeWidth={1.5} cornerRadius={9}
                    />
                  )}
                  {/* Label */}
                  <Text
                    x={-24} y={-9} width={48} height={12}
                    text={t.label}
                    align="center"
                    fontSize={11} fontStyle="bold" fill="white"
                    listening={false}
                  />
                  {/* Capacity */}
                  <Text
                    x={-16} y={4} width={32} height={10}
                    text={`${t.capacity}p`}
                    align="center"
                    fontSize={9} fill="rgba(255,255,255,0.55)"
                    listening={false}
                  />
                  {/* Unavailable cross */}
                  {!t.available && (
                    <Text x={-5} y={-6} text="✕" fontSize={10} fill="rgba(255,255,255,0.4)" listening={false} />
                  )}
                </Group>
              )
            })}
          </Layer>

          {/* Drawing preview */}
          {drawRect && (
            <Layer listening={false}>
              <Rect
                x={drawRect.x} y={drawRect.y}
                width={drawRect.w} height={drawRect.h}
                fill={zoneColor} opacity={0.15}
                stroke={zoneColor} strokeWidth={1.5} dash={[6, 4]} cornerRadius={6}
              />
            </Layer>
          )}

          {/* Invisible bg click catcher */}
          <Layer>
            <Rect
              x={0} y={0} width={VW} height={VH}
              fill="transparent"
              onClick={handleBgClick}
              onTap={handleBgClick}
            />
          </Layer>
        </Stage>
      </div>

      {/* ── Properties panel ───────────────────────────────────── */}
      {editTarget && (
        <div className="rounded-2xl p-4 flex flex-wrap gap-4 items-end" style={{ background: '#f9f8f7', border: '1px solid oklch(0.91 0.008 350)' }}>
          {editTarget.type === 'table' ? (
            <>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'oklch(0.55 0.008 270)' }}>Label</label>
                <input
                  value={editTarget.label}
                  onChange={e => setEditTarget(p => ({ ...p, label: e.target.value }))}
                  className="rounded-xl px-3 py-2 text-sm font-semibold outline-none w-24"
                  style={{ background: 'white', border: '1.5px solid oklch(0.91 0.008 350)', color: 'oklch(0.14 0.008 270)' }}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'oklch(0.55 0.008 270)' }}>Seats</label>
                <input
                  type="number" min={1} max={40}
                  value={editTarget.capacity}
                  onChange={e => setEditTarget(p => ({ ...p, capacity: e.target.value }))}
                  className="rounded-xl px-3 py-2 text-sm font-semibold outline-none w-20"
                  style={{ background: 'white', border: '1.5px solid oklch(0.91 0.008 350)', color: 'oklch(0.14 0.008 270)' }}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'oklch(0.55 0.008 270)' }}>Status</label>
                <button
                  onClick={() => setEditTarget(p => ({ ...p, available: !p.available }))}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold"
                  style={{
                    background: editTarget.available ? 'oklch(0.50 0.18 145 / 0.12)' : 'oklch(0.65 0.008 270 / 0.1)',
                    border: `1.5px solid ${editTarget.available ? 'oklch(0.50 0.18 145 / 0.4)' : 'oklch(0.65 0.008 270 / 0.3)'}`,
                    color: editTarget.available ? 'oklch(0.50 0.18 145)' : 'oklch(0.55 0.008 270)',
                  }}
                >
                  {editTarget.available ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {editTarget.available ? 'Available' : 'Blocked'}
                </button>
              </div>
              <button
                onClick={applyTableEdit}
                className="rounded-xl px-4 py-2 text-sm font-bold text-white"
                style={{ background: 'oklch(0.58 0.24 350)' }}
              >
                Apply
              </button>
            </>
          ) : editTarget.type === 'zone' ? (
            <>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'oklch(0.55 0.008 270)' }}>Zone name</label>
                <input
                  value={editTarget.name}
                  onChange={e => setEditTarget(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Rooftop"
                  className="rounded-xl px-3 py-2 text-sm font-semibold outline-none w-36"
                  style={{ background: 'white', border: '1.5px solid oklch(0.91 0.008 350)', color: 'oklch(0.14 0.008 270)' }}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'oklch(0.55 0.008 270)' }}>Color</label>
                <div className="flex gap-1.5">
                  {ZONE_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setEditTarget(p => ({ ...p, color: c }))}
                      className="w-6 h-6 rounded-full transition-transform"
                      style={{
                        background: c,
                        outline: editTarget.color === c ? `2px solid ${c}` : 'none',
                        outlineOffset: 2,
                        transform: editTarget.color === c ? 'scale(1.25)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={applyZoneEdit}
                className="rounded-xl px-4 py-2 text-sm font-bold text-white"
                style={{ background: 'oklch(0.58 0.24 350)' }}
              >
                Apply
              </button>
            </>
          ) : null}

          <button
            onClick={deleteSelected}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold ml-auto"
            style={{ color: 'oklch(0.52 0.22 25)', background: 'oklch(0.52 0.22 25 / 0.08)', border: '1px solid oklch(0.52 0.22 25 / 0.25)' }}
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}

      {/* ── Legend ─────────────────────────────────────────────── */}
      <p className="text-xs" style={{ color: 'oklch(0.65 0.008 270)' }}>
        <strong style={{ color: 'oklch(0.55 0.008 270)' }}>Tip:</strong> Use <strong>Zone</strong> to mark Rooftop / Indoor / Garden areas. Then place tables inside them with the circle or rect tools. Drag to reposition. Click a placed element to edit its label and capacity.
      </p>
    </div>
  )
}
