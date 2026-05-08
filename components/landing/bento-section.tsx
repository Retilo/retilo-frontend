"use client"

import { motion, useInView } from "motion/react"
import { useRef, useEffect, useState } from "react"
import { MapPin, Star, BarChart3, Workflow, Zap, TrendingUp, Bell, Mail, CheckCheck, ArrowUpRight } from "lucide-react"
import { SpotlightBorder } from "@/components/effects"

// ── Rank heatmap (7×7) ────────────────────────────────────────────
function RankGridWidget() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [go, setGo] = useState(false)
  useEffect(() => { if (inView) { const t = setTimeout(() => setGo(true), 200); return () => clearTimeout(t) } }, [inView])

  const GRID = [
    [18,14,11, 9, 8,12,16],
    [15,10, 7, 4, 5, 8,13],
    [12, 7, 3, 2, 3, 6,10],
    [ 9, 5, 2, 1, 2, 4, 8],
    [11, 6, 3, 2, 3, 5, 9],
    [14, 9, 6, 4, 6, 9,14],
    [17,13,10, 8,10,13,18],
  ]
  const color = (r: number) =>
    r <= 3 ? "#16a34a" : r <= 7 ? "#84cc16" : r <= 12 ? "#f59e0b" : "#ef4444"

  return (
    <div ref={ref} className="mt-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-green-500 animate-pulse block" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Mumbai · CBD · pizza near me</span>
        </div>
        <span className="text-[10px] font-bold text-green-600">↑ 4 this week</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
        {GRID.flat().map((r, i) => {
          const col = i % 7; const row = Math.floor(i / 7)
          return (
            <motion.div key={i}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={go ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: (col + row) * 0.028, duration: 0.22, type: "spring", stiffness: 280 }}
              style={{ aspectRatio: "1", borderRadius: 4, background: `${color(r)}cc`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff" }}
            >{r}</motion.div>
          )
        })}
      </div>
      <div className="flex gap-3 mt-2">
        {[{ l:"#1–3", c:"#16a34a" },{ l:"#4–7", c:"#84cc16" },{ l:"#8–12", c:"#f59e0b" },{ l:"12+", c:"#ef4444" }].map(x => (
          <div key={x.l} className="flex items-center gap-1">
            <div style={{ width:8, height:8, borderRadius:2, background:x.c, flexShrink:0 }} />
            <span className="text-[9px] text-gray-400 font-semibold">{x.l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Review chat ───────────────────────────────────────────────────
function ReviewWidget() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [step, setStep] = useState(0)
  useEffect(() => {
    if (!inView) return
    const t = [setTimeout(() => setStep(1),300), setTimeout(() => setStep(2),1200), setTimeout(() => setStep(3),2400)]
    return () => t.forEach(clearTimeout)
  }, [inView])

  return (
    <div ref={ref} className="space-y-2 mt-4">
      <motion.div initial={{ opacity:0, y:6 }} animate={step>=1?{opacity:1,y:0}:{}} transition={{ duration:0.3 }}
        className="rounded-xl px-3 py-2.5" style={{ background:"#fef2f2", border:"1px solid #fecaca" }}>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-red-400">★★ James K.</span>
          <span className="text-[9px] text-gray-400">3h ago</span>
        </div>
        <p className="text-[11px] text-gray-600 leading-snug">"Disappointing — order arrived cold and late."</p>
      </motion.div>

      <motion.div initial={{ opacity:0, y:6 }} animate={step>=2?{opacity:1,y:0}:{}} transition={{ duration:0.3 }}
        className="rounded-xl px-3 py-2.5" style={{ background:"#faf5ff", border:"1px solid #e9d5ff" }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-purple-500">Retilo AI · drafting</span>
          {step<3 ? (
            <div className="flex gap-0.5">
              {[0,1,2].map(i=>(
                <motion.span key={i} style={{ width:3,height:3,borderRadius:"50%",background:"#a855f7",display:"block" }}
                  animate={{ opacity:[0.3,1,0.3],y:[0,-2,0] }} transition={{ duration:0.9,repeat:Infinity,delay:i*0.2 }} />
              ))}
            </div>
          ):(
            <span className="text-[9px] font-bold text-green-600 flex items-center gap-0.5"><CheckCheck className="w-3 h-3" />posted</span>
          )}
        </div>
        {step>=3&&(
          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.4 }}
            className="text-[11px] text-gray-600 leading-snug">
            "Hi James, we're truly sorry. We've flagged your order and will reach out within the hour…"
          </motion.p>
        )}
      </motion.div>
    </div>
  )
}

// ── Email pipeline ────────────────────────────────────────────────
function EmailWidget() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [active, setActive] = useState(0)
  useEffect(() => {
    if (!inView) return
    const id = setInterval(() => setActive(p=>(p+1)%4), 900)
    return () => clearInterval(id)
  }, [inView])

  const STEPS = [
    { label:"Brief",       color:"#7c3aed" },
    { label:"AI Copy",     color:"#2563eb" },
    { label:"MJML",        color:"#059669" },
    { label:"Sending",     color:"#d97706" },
  ]

  return (
    <div ref={ref} className="mt-4">
      <div className="flex gap-1.5">
        {STEPS.map((s,i)=>(
          <motion.div key={i}
            animate={{ opacity:active>=i?1:0.3, scale:active===i?1.03:1 }}
            className="flex-1 rounded-lg px-2 py-2.5 text-center"
            style={{ background:active>=i?`${s.color}12`:"#f8fafc", border:`1px solid ${active>=i?s.color+"33":"#e2e8f0"}` }}>
            <div style={{ fontSize:9,fontWeight:700,color:active>=i?s.color:"#94a3b8",letterSpacing:"0.04em" }}>{s.label}</div>
            {active===i&&<motion.div className="mt-1 mx-auto rounded-full" style={{ width:4,height:4,background:s.color }} animate={{ opacity:[1,0.3,1] }} transition={{ duration:0.8,repeat:Infinity }} />}
            {active>i&&<div className="mt-1 text-[9px] font-black text-green-600">✓</div>}
          </motion.div>
        ))}
      </div>
      <div className="mt-3 rounded-lg px-3 py-2" style={{ background:"#faf5ff", border:"1px solid #e9d5ff" }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] text-purple-400 font-semibold uppercase tracking-widest">AI subject line</span>
          <span className="text-[9px] font-bold text-green-600">89% open score</span>
        </div>
        <p className="text-[11px] text-gray-600 leading-snug">"Your customers haven't heard from you in 14 days — here's what they're missing 👀"</p>
      </div>
    </div>
  )
}

// ── Sparkline ─────────────────────────────────────────────────────
function SparklineWidget() {
  const pts = [22,29,35,41,58,63,71,78,85,91]
  const h = 44, w = 200
  const max = Math.max(...pts)
  const coords = pts.map((v,i)=>`${(i/(pts.length-1))*w},${h-(v/max)*h}`)
  const poly = coords.join(" ")
  const area = `0,${h} ${poly} ${w},${h}`

  return (
    <div className="mt-3">
      <div className="flex items-end justify-between mb-2">
        <div><span className="text-3xl font-black text-gray-900 tracking-tight">91</span><span className="text-xs text-gray-400 ml-1">/ 100</span></div>
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">↑ +73 pts</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ height:44,display:"block" }}>
        <defs>
          <linearGradient id="sg2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#sg2)" />
        <polyline points={poly} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="flex justify-between mt-1"><span className="text-[9px] text-gray-400">Aug 2024</span><span className="text-[9px] text-gray-400">Feb 2025</span></div>
    </div>
  )
}

// ── Workflow nodes ────────────────────────────────────────────────
function WorkflowWidget() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [lit, setLit] = useState(0)
  useEffect(() => {
    if (!inView) return
    const id = setInterval(()=>setLit(p=>(p+1)%5),700)
    return ()=>clearInterval(id)
  }, [inView])

  const NODES = [
    { label:"New Review", color:"#2563eb" },
    { label:"AI Draft",   color:"#ec4899" },
    { label:"Approve",    color:"#16a34a" },
    { label:"Post",       color:"#d97706" },
  ]

  return (
    <div ref={ref} className="mt-3">
      <div className="flex items-center gap-1">
        {NODES.map((n,i)=>(
          <div key={i} className="flex items-center gap-1 flex-1 min-w-0">
            <motion.div animate={{ opacity:lit>=i?1:0.3, scale:lit===i?1.04:1 }}
              className="flex-1 rounded-lg py-2 text-center"
              style={{ background:lit>=i?`${n.color}12`:"#f8fafc", border:`1px solid ${lit>=i?n.color+"44":"#e2e8f0"}` }}>
              <span style={{ fontSize:9,fontWeight:700,color:lit>=i?n.color:"#94a3b8",whiteSpace:"nowrap" }}>{n.label}</span>
            </motion.div>
            {i<NODES.length-1&&<motion.div animate={{ opacity:lit>i?1:0.2 }} style={{ width:10,height:1,background:"#e2e8f0",flexShrink:0 }} />}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 rounded-lg px-3 py-2 bg-gray-50 border border-gray-100">
        <span className="size-1.5 rounded-full bg-pink-400 animate-pulse block flex-shrink-0" />
        <span className="text-[10px] text-gray-500">342 automations ran this week · <span className="text-green-600 font-bold">0 failures</span></span>
      </div>
    </div>
  )
}

// ── Alert feed ────────────────────────────────────────────────────
function AlertWidget() {
  const ALERTS = [
    { type:"1-star review",     tag:"urgent",  lc:"#ef4444", bg:"#fef2f2", bc:"#fecaca" },
    { type:"Rank drop · #9→14", tag:"seo",     lc:"#f59e0b", bg:"#fffbeb", bc:"#fde68a" },
    { type:"Competitor spike",  tag:"intel",   lc:"#3b82f6", bg:"#eff6ff", bc:"#bfdbfe" },
    { type:"Reply pending 22h", tag:"sla",     lc:"#a855f7", bg:"#faf5ff", bc:"#e9d5ff" },
  ]
  return (
    <div className="mt-3 space-y-1.5">
      {ALERTS.map((a,i)=>(
        <motion.div key={i} initial={{ opacity:0,x:-6 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }} transition={{ delay:i*0.07 }}
          className="flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ background:a.bg, borderLeft:`2px solid ${a.lc}`, border:`1px solid ${a.bc}`, borderLeftWidth:2 }}>
          <span className="flex-1 text-[11px] font-semibold text-gray-700">{a.type}</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0" style={{ background:`${a.lc}18`, color:a.lc }}>{a.tag}</span>
        </motion.div>
      ))}
    </div>
  )
}

// ── Location pins ─────────────────────────────────────────────────
function LocationWidget() {
  const pins = [
    { top:"22%", left:"18%", label:"Andheri",  active:true  },
    { top:"45%", left:"36%", label:"Dadar",    active:true  },
    { top:"15%", left:"54%", label:"BKC",      active:true  },
    { top:"62%", left:"62%", label:"Colaba",   active:false },
    { top:"38%", left:"77%", label:"Powai",    active:true  },
    { top:"70%", left:"28%", label:"Chembur",  active:false },
  ]
  return (
    <div className="mt-4 relative rounded-xl overflow-hidden" style={{ height:100, background:"#f0fdf4", border:"1px solid #bbf7d0" }}>
      <div className="absolute inset-0 opacity-30"
        style={{ backgroundImage:"linear-gradient(rgba(22,163,74,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(22,163,74,0.15) 1px,transparent 1px)", backgroundSize:"26px 26px" }} />
      {pins.map((p,i)=>(
        <motion.div key={i} initial={{ scale:0,opacity:0 }} whileInView={{ scale:1,opacity:1 }} viewport={{ once:true }}
          transition={{ delay:i*0.1,type:"spring",stiffness:260 }}
          style={{ position:"absolute",top:p.top,left:p.left,transform:"translate(-50%,-50%)" }}
          className="flex flex-col items-center gap-0.5">
          <div style={{ width:p.active?9:7,height:p.active?9:7,borderRadius:"50%",background:p.active?"#16a34a":"#94a3b8",boxShadow:p.active?"0 0 6px #16a34a88":"none" }} />
          <span style={{ fontSize:8,fontWeight:600,color:p.active?"#15803d":"#94a3b8",whiteSpace:"nowrap" }}>{p.label}</span>
        </motion.div>
      ))}
      <div className="absolute bottom-1.5 right-2.5 flex items-center gap-1">
        <span className="size-1.5 rounded-full bg-green-500 animate-pulse block" />
        <span className="text-[9px] text-green-700 font-semibold">4 / 6 AI-active</span>
      </div>
    </div>
  )
}

// ── Journey funnel ────────────────────────────────────────────────
function JourneyWidget() {
  const stages = [
    { label:"Discovery",  pct:100, color:"#06b6d4" },
    { label:"Engagement", pct:64,  color:"#3b82f6" },
    { label:"Conversion", pct:38,  color:"#16a34a" },
    { label:"Loyalty",    pct:21,  color:"#f59e0b" },
  ]
  return (
    <div className="mt-4 space-y-2.5">
      {stages.map((s,i)=>(
        <div key={i}>
          <div className="flex justify-between mb-1">
            <span className="text-[11px] text-gray-500 font-semibold">{s.label}</span>
            <span className="text-[11px] font-bold" style={{ color:s.color }}>{s.pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <motion.div initial={{ width:0 }} whileInView={{ width:`${s.pct}%` }} viewport={{ once:true }}
              transition={{ duration:0.9,delay:i*0.1,ease:[0.22,1,0.36,1] }}
              style={{ height:"100%",borderRadius:999,background:s.color }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── SpotlightBorder card wrapper (cult-ui) ────────────────────────
function FeatureCard({
  title, desc, icon, accent, badge, className = "", children,
}: {
  title: string; desc: string; icon: React.ReactNode; accent: string
  badge?: string; className?: string; children?: React.ReactNode
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`group h-full ${className}`}
    >
      {/* SpotlightBorder — the cult-ui card primitive */}
      <SpotlightBorder className="group h-full">
        <div className="flex flex-col h-full p-5 rounded-xl bg-white">
          <div className="flex items-start justify-between mb-3">
            <div className="size-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background:`${accent}12`, color:accent }}>
              {icon}
            </div>
            {badge && (
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background:`${accent}12`, color:accent, border:`1px solid ${accent}22` }}>
                {badge}
              </span>
            )}
          </div>
          <h3 className="font-bold text-[15px] text-gray-900 mb-1.5 leading-snug">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
          {children && <div className="mt-auto">{children}</div>}
        </div>
      </SpotlightBorder>
    </motion.div>
  )
}

// ── Section ───────────────────────────────────────────────────────
export function BentoSection() {
  const headerRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" })

  return (
    <section id="features" className="py-24 px-4 bg-[oklch(0.985_0.003_270)]">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 16 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5 uppercase tracking-widest"
            style={{ background:"oklch(0.58 0.24 350 / 10%)", color:"oklch(0.48 0.24 350)", border:"1px solid oklch(0.58 0.24 350 / 20%)" }}>
            <Zap className="w-3 h-3" /> Platform overview
          </div>
          <h2 className="font-black tracking-tight mb-4 text-gray-900"
            style={{ fontSize:"clamp(2rem,4vw,3rem)", letterSpacing:"-0.03em", lineHeight:1.08 }}>
            One platform.{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage:"linear-gradient(135deg,oklch(0.58 0.24 350) 0%,oklch(0.55 0.24 280) 100%)" }}>
              Every retail signal.
            </span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-base leading-relaxed">
            From local ranking intelligence and AI review management to autonomous email campaigns — Retilo gives retail teams the full picture.
          </p>
        </motion.div>

        {/* Bento grid — 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Hero: Local Intelligence — 2 col */}
          <motion.div
            className="md:col-span-2 group h-full"
            initial={{ opacity:0, y:16 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true, margin:"-40px" }}
            transition={{ duration:0.5 }}
          >
            <SpotlightBorder className="group h-full">
              <div className="h-full rounded-xl bg-white grid md:grid-cols-2">
                {/* Left */}
                <div className="p-6 flex flex-col gap-4 border-r border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="size-9 rounded-xl flex items-center justify-center" style={{ background:"#16a34a12", color:"#16a34a" }}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-green-700">Local Ranking Intelligence</span>
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 leading-tight mb-2" style={{ fontSize:"clamp(1.25rem,2.5vw,1.65rem)", letterSpacing:"-0.025em" }}>
                      See exactly where you rank <span className="text-green-600">on every block.</span>
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      GBP geo-grid scanning across any keyword, any city. Track movement, spot gaps, and out-rank competitors before they know you exist.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-auto">
                    {[{ n:"47", u:"cities" },{ n:"2.4K", u:"locations" },{ n:"12K", u:"keywords" }].map(s=>(
                      <div key={s.u} className="rounded-xl p-3 text-center" style={{ background:"#f0fdf4", border:"1px solid #bbf7d0" }}>
                        <div className="text-xl font-black text-gray-900 tracking-tight">{s.n}</div>
                        <div className="text-[10px] font-bold text-green-600 mt-0.5">{s.u}</div>
                      </div>
                    ))}
                  </div>
                  <a href="/geo-seo" className="inline-flex items-center gap-1 text-xs font-bold text-green-700 hover:gap-2 transition-all">
                    View ranking dashboard <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
                {/* Right: rank grid */}
                <div className="p-6" style={{ background:"#f9fefb" }}>
                  <RankGridWidget />
                </div>
              </div>
            </SpotlightBorder>
          </motion.div>

          {/* Review AI */}
          <FeatureCard title="AI Review Replies" desc="Auto-draft personalised responses for every review. Approve in one click or let AI post directly."
            icon={<Star className="w-4 h-4" />} accent="#f59e0b">
            <ReviewWidget />
          </FeatureCard>

          {/* Workflows */}
          <FeatureCard title="Visual Workflows" desc="Drag-and-drop automation editor. Connect triggers, AI nodes, and actions — no code required."
            icon={<Workflow className="w-4 h-4" />} accent="#ec4899">
            <WorkflowWidget />
          </FeatureCard>

          {/* Email Campaign — 2 col */}
          <motion.div
            className="md:col-span-2 group h-full"
            initial={{ opacity:0, y:16 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true, margin:"-40px" }}
            transition={{ duration:0.5 }}
          >
            <SpotlightBorder className="group h-full">
              <div className="h-full rounded-xl bg-white p-6 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="size-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:"#7c3aed12", color:"#7c3aed" }}>
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background:"#7c3aed12", color:"#7c3aed", border:"1px solid #7c3aed22" }}>AI Agent</span>
                </div>
                <h3 className="font-bold text-[15px] text-gray-900 mb-1.5 leading-snug">Email Campaign AI Agent</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Describe your campaign in plain English. The agent writes copy, builds a pixel-perfect MJML template, and delivers at scale.</p>
                <div className="mt-auto"><EmailWidget /></div>
              </div>
            </SpotlightBorder>
          </motion.div>

          {/* CX Analytics */}
          <FeatureCard title="CX Analytics" desc="Visibility score trends, sentiment analysis, and response rate benchmarks across all locations."
            icon={<BarChart3 className="w-4 h-4" />} accent="#3b82f6">
            <SparklineWidget />
          </FeatureCard>

          {/* Multi-location — 2 col */}
          <motion.div
            className="md:col-span-2 group h-full"
            initial={{ opacity:0, y:16 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true, margin:"-40px" }}
            transition={{ duration:0.5 }}
          >
            <SpotlightBorder className="group h-full">
              <div className="h-full rounded-xl bg-white p-6 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="size-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:"#10b98112", color:"#10b981" }}>
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-bold text-[15px] text-gray-900 mb-1.5 leading-snug">Multi-location Dashboard</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Manage 1 or 1,000 locations from a single dashboard. AI adapts tone, copy, and strategy per location automatically.</p>
                <div className="mt-auto"><LocationWidget /></div>
              </div>
            </SpotlightBorder>
          </motion.div>

          {/* Smart Alerts */}
          <FeatureCard title="Smart Alerts" desc="Instant notifications the moment a review drops, a rank slips, or a competitor gains ground."
            icon={<Bell className="w-4 h-4" />} accent="#f43f5e">
            <AlertWidget />
          </FeatureCard>

          {/* Customer Journey */}
          <FeatureCard title="Customer Journey Insights" desc="Understand the full path from discovery to loyalty across every digital touchpoint."
            icon={<TrendingUp className="w-4 h-4" />} accent="#06b6d4">
            <JourneyWidget />
          </FeatureCard>

        </div>
      </div>
    </section>
  )
}
