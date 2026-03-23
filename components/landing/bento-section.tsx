"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import {
  Star, BarChart3, Workflow, MapPin, Send, ShieldCheck,
  Sparkles, Bell, TrendingUp, Users
} from "lucide-react"

// -----------------------------------------------------------------
// BENTO GRID — "What Retilo does" marketing section
// Inspired by cult-ui marketing-bento-database style
// -----------------------------------------------------------------

interface BentoCardProps {
  className?: string
  icon: React.ReactNode
  title: string
  description: string
  accent?: string
  delay?: number
  children?: React.ReactNode
}

function BentoCard({ className = "", icon, title, description, accent = "oklch(0.65_0.26_280)", delay = 0, children }: BentoCardProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className={`relative group rounded-2xl border border-white/8 bg-[oklch(0.13_0.015_270)] overflow-hidden p-6 hover:border-white/15 transition-all duration-300 ${className}`}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 60% 40% at 50% 100%, ${accent}18 0%, transparent 70%)` }}
      />
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `${accent}18`, color: accent }}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-white text-base mb-2">{title}</h3>
      <p className="text-sm text-white/50 leading-relaxed">{description}</p>
      {children}
    </motion.div>
  )
}

// Mini review reply preview widget
function ReviewReplyWidget() {
  return (
    <div className="mt-4 rounded-xl bg-black/30 border border-white/8 p-3 space-y-2 text-xs">
      <div className="flex items-start gap-2">
        <div className="w-5 h-5 rounded-full bg-red-400/20 flex items-center justify-center text-[9px] font-bold text-red-400 flex-shrink-0">J</div>
        <p className="text-white/50 leading-relaxed">"Terrible experience, waited 45 mins…"</p>
      </div>
      <div className="flex items-center gap-1.5 text-[oklch(0.80_0.18_280)]">
        <Sparkles className="w-3 h-3" />
        <span>Generating AI reply…</span>
      </div>
      <div className="rounded-lg bg-[oklch(0.55_0.24_280)/15%] border border-[oklch(0.55_0.24_280)/30%] p-2 text-white/60 leading-relaxed">
        "Hi John, we sincerely apologize for the wait. This is not our standard…"
      </div>
    </div>
  )
}

// Mini analytics sparkline
function AnalyticsWidget() {
  const bars = [30, 45, 38, 52, 48, 65, 70, 58, 75, 80, 72, 85]
  return (
    <div className="mt-4 flex items-end gap-1 h-12">
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all"
          style={{
            height: `${h}%`,
            background: `oklch(0.65 0.26 280 / ${40 + i * 5}%)`,
          }}
        />
      ))}
    </div>
  )
}

// Mini workflow nodes preview
function WorkflowWidget() {
  const nodes = ["New Review", "AI Filter", "Draft Reply", "Auto Post"]
  return (
    <div className="mt-4 flex items-center gap-1.5 flex-wrap">
      {nodes.map((n, i) => (
        <div key={n} className="flex items-center gap-1">
          <div className="px-2.5 py-1 rounded-lg bg-white/6 border border-white/10 text-[10px] text-white/70 whitespace-nowrap">
            {n}
          </div>
          {i < nodes.length - 1 && <div className="w-3 h-px bg-white/20" />}
        </div>
      ))}
    </div>
  )
}

export function BentoSection() {
  return (
    <section id="features" className="bg-[oklch(0.09_0.012_270)] py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-medium text-[oklch(0.75_0.20_280)] mb-3 uppercase tracking-widest">
            Platform capabilities
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Everything your GMB needs
          </h2>
          <p className="text-lg text-white/50 max-w-xl mx-auto">
            One platform to manage reviews, analytics, automation, and campaigns
            across every location.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Large: AI Reviews */}
          <BentoCard
            className="sm:col-span-2"
            icon={<Star className="w-5 h-5" />}
            title="AI Review Replies"
            description="Automatically generate and post personalised replies to every Google review — at any scale, in your brand voice."
            accent="oklch(0.65_0.26_280)"
            delay={0}
          >
            <ReviewReplyWidget />
          </BentoCard>

          {/* Analytics */}
          <BentoCard
            icon={<BarChart3 className="w-5 h-5" />}
            title="Deep Analytics"
            description="Rating trends, sentiment breakdowns, keyword insights, and health scores for every location."
            accent="oklch(0.60_0.20_160)"
            delay={0.05}
          >
            <AnalyticsWidget />
          </BentoCard>

          {/* Workflows */}
          <BentoCard
            icon={<Workflow className="w-5 h-5" />}
            title="Automation Workflows"
            description="Build visual no-code workflows: trigger on new reviews, filter by rating, generate AI drafts, auto-post or notify your team."
            accent="oklch(0.70_0.18_55)"
            delay={0.1}
          >
            <WorkflowWidget />
          </BentoCard>

          {/* Multi-location */}
          <BentoCard
            icon={<MapPin className="w-5 h-5" />}
            title="Multi-location"
            description="Connect all your Google Business profiles in one workspace. Manage 1 or 100+ locations from a single dashboard."
            accent="oklch(0.65_0.22_30)"
            delay={0.15}
          />

          {/* Campaigns */}
          <BentoCard
            icon={<Send className="w-5 h-5" />}
            title="Review Campaigns"
            description="Send SMS, email, or WhatsApp review request campaigns to your customers and boost your review velocity."
            accent="oklch(0.60_0.20_310)"
            delay={0.2}
          />

          {/* Health Score */}
          <BentoCard
            icon={<TrendingUp className="w-5 h-5" />}
            title="Health Score"
            description="A 0–100 composite score per location — built from rating, response rate, review velocity, and recency."
            accent="oklch(0.60_0.20_160)"
            delay={0.25}
          />

          {/* Competitor Intel */}
          <BentoCard
            icon={<Users className="w-5 h-5" />}
            title="Competitor Intelligence"
            description="Discover nearby competitors via Google Places. Track their ratings, review counts, and compare side-by-side."
            accent="oklch(0.65_0.26_280)"
            delay={0.3}
          />

          {/* Large: Notifications */}
          <BentoCard
            className="sm:col-span-2"
            icon={<Bell className="w-5 h-5" />}
            title="Smart Alerts & Notifications"
            description="Get instant alerts when a 1-star review drops, a location's health score dips, or a reply is waiting for approval. Route notifications to Slack, email, or in-app."
            accent="oklch(0.65_0.22_30)"
            delay={0.35}
          >
            <div className="mt-4 space-y-2">
              {[
                { icon: "🔴", text: "3 unanswered 1-star reviews — Store #4", time: "2m ago" },
                { icon: "🟡", text: "Health score dropped below 70 — Store #9", time: "15m ago" },
                { icon: "🟢", text: "12 AI reply drafts ready for approval", time: "1h ago" },
              ].map((n) => (
                <div key={n.text} className="flex items-center gap-3 rounded-lg bg-black/20 border border-white/8 px-3 py-2 text-xs">
                  <span>{n.icon}</span>
                  <span className="text-white/60 flex-1">{n.text}</span>
                  <span className="text-white/30 flex-shrink-0">{n.time}</span>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Security */}
          <BentoCard
            icon={<ShieldCheck className="w-5 h-5" />}
            title="Secure by default"
            description="JWT auth, per-merchant data isolation, and OAuth-scoped Google tokens. Your data stays yours."
            accent="oklch(0.60_0.20_160)"
            delay={0.4}
          />
        </div>
      </div>
    </section>
  )
}
