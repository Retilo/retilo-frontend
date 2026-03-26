"use client"

import { motion, useInView } from "motion/react"
import { useRef } from "react"
import { MapPin, Star, BarChart3, Workflow, Grid2X2, Zap, TrendingUp, Bell } from "lucide-react"

// ─── Mini widgets inside cards ────────────────────────────────────

function RankGridMini() {
  const grid = [1, 2, 4, 3, 5, 8, 6, 7, 12, 9, 11, 14, 10, 13, 15, 18, 20, 16, 22, 19, 17, 21, 24, 23, 25]
  const color = (r: number) => r <= 3 ? "#22c55e" : r <= 10 ? "#eab308" : "#ef4444"
  return (
    <div className="mt-4 grid grid-cols-5 gap-1">
      {grid.map((r, i) => (
        <div key={i} className="h-7 rounded flex items-center justify-center text-[10px] font-bold text-white"
          style={{ background: color(r) }}>
          {r}
        </div>
      ))}
    </div>
  )
}

function ReviewWidget() {
  const reviews = [
    { name: "Sarah M.", stars: 5, text: "Absolutely love this place!", replied: true },
    { name: "James K.", stars: 2, text: "Disappointing experience...", replied: false },
    { name: "Priya L.", stars: 5, text: "Best service ever!", replied: true },
  ]
  return (
    <div className="mt-4 space-y-2">
      {reviews.map((r) => (
        <div key={r.name} className="flex items-start gap-2 p-2.5 rounded-xl" style={{ background: "oklch(0.97 0.003 270)" }}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
            style={{ background: "oklch(0.60 0.18 280)" }}>
            {r.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              {"★".repeat(r.stars).split("").map((s, i) => (
                <span key={i} className="text-[10px] text-yellow-400">{s}</span>
              ))}
            </div>
            <p className="text-[10px] text-gray-500 truncate">{r.text}</p>
          </div>
          {r.replied && (
            <div className="flex-shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-green-100 text-green-700">AI ✓</div>
          )}
        </div>
      ))}
    </div>
  )
}

function WorkflowMini() {
  const nodes = [
    { label: "New review", color: "#4285F4" },
    { label: "AI Draft", color: "oklch(0.58 0.24 350)" },
    { label: "Approve", color: "#0A7D4B" },
    { label: "Post", color: "#F59E0B" },
  ]
  return (
    <div className="mt-4 flex items-center gap-1 overflow-hidden">
      {nodes.map((n, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="px-2 py-1.5 rounded-lg text-[10px] font-semibold text-white whitespace-nowrap flex-shrink-0"
            style={{ background: n.color }}>
            {n.label}
          </div>
          {i < nodes.length - 1 && <div className="w-3 h-px flex-shrink-0" style={{ background: "#cbd5e1" }} />}
        </div>
      ))}
    </div>
  )
}

// ─── Bento card ────────────────────────────────────────────────────
function BentoCard({
  className = "", icon, title, description, accent = "#6366f1", delay = 0, children, badge
}: {
  className?: string
  icon: React.ReactNode
  title: string
  description: string
  accent?: string
  delay?: number
  children?: React.ReactNode
  badge?: string
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className={`relative group rounded-2xl border bg-white overflow-hidden p-6 hover:shadow-md transition-all duration-300 ${className}`}
      style={{ borderColor: "oklch(0.92 0.006 270)" }}
    >
      {/* Hover accent glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(ellipse 80% 60% at 50% 110%, ${accent}10 0%, transparent 70%)` }} />

      {badge && (
        <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
          style={{ background: accent }}>
          {badge}
        </div>
      )}

      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `${accent}15`, color: accent }}>
        {icon}
      </div>
      <h3 className="font-bold text-gray-900 text-base mb-1.5">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      {children}
    </motion.div>
  )
}

// ─── Section ────────────────────────────────────────────────────────
export function BentoSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section id="features" className="py-24 px-4 bg-[oklch(0.985_0.003_270)]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: "oklch(0.58 0.24 350 / 10%)", color: "oklch(0.48 0.24 350)", border: "1px solid oklch(0.58 0.24 350 / 20%)" }}>
            <Zap className="w-3 h-3" /> Platform overview
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight mb-4">
            One platform. Every retail signal.
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            From local ranking intelligence to AI-powered review management — Retilo gives retail teams the full picture, in real time.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-auto">
          {/* Large: GBP Ranking — spans 2 cols */}
          <BentoCard
            className="md:col-span-2"
            icon={<Grid2X2 className="w-5 h-5" />}
            title="GBP Local Ranking Grid"
            description="Visualise exactly where your business appears on Google Maps for any keyword across a geographic grid. Scan, track, and improve."
            accent="oklch(0.58 0.24 350)"
            delay={0}
            badge="New"
          >
            <RankGridMini />
          </BentoCard>

          {/* Workflows */}
          <BentoCard
            icon={<Workflow className="w-5 h-5" />}
            title="Visual Workflows"
            description="Drag-and-drop automation editor. Connect triggers, AI nodes, and actions — no code required."
            accent="#7C3AED"
            delay={0.05}
          >
            <WorkflowMini />
          </BentoCard>

          {/* Review AI */}
          <BentoCard
            icon={<Star className="w-5 h-5" />}
            title="AI Review Replies"
            description="Auto-draft personalised responses for every review. Approve in one click or let AI post directly."
            accent="#F59E0B"
            delay={0.1}
          >
            <ReviewWidget />
          </BentoCard>

          {/* Analytics */}
          <BentoCard
            icon={<BarChart3 className="w-5 h-5" />}
            title="CX Analytics"
            description="Rating trends, response rates, sentiment scores, and business metrics across all locations."
            accent="#4285F4"
            delay={0.15}
          />

          {/* Multi-location */}
          <BentoCard
            icon={<MapPin className="w-5 h-5" />}
            title="Multi-location"
            description="Manage 1 or 1,000 locations from a single dashboard. AI adapts tone per location."
            accent="#0A7D4B"
            delay={0.2}
          />

          {/* Alerts */}
          <BentoCard
            className="md:col-span-2"
            icon={<Bell className="w-5 h-5" />}
            title="Smart Alerts & Escalations"
            description="Get notified the moment a negative review drops, a ranking slips, or a keyword opportunity appears. Route to the right team member automatically."
            accent="#E1306C"
            delay={0.25}
          >
            <div className="mt-4 flex flex-wrap gap-2">
              {["1-star review", "Rank drop", "No reply 24h", "Competitor spike"].map((tag) => (
                <div key={tag} className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-600 border border-red-100">
                  {tag}
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Customer Journey */}
          <BentoCard
            icon={<TrendingUp className="w-5 h-5" />}
            title="Customer Journey Insights"
            description="Understand the full path from discovery to loyalty. See which touchpoints drive reviews, repeat visits, and revenue."
            accent="#0A7D4B"
            delay={0.3}
          />
        </div>
      </div>
    </section>
  )
}
