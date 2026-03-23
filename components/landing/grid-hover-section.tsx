"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { ArrowRight, Workflow } from "lucide-react"
import Link from "next/link"

// -----------------------------------------------------------------
// GRID LIST HOVER — Workflow template showcase
// Inspired by cult-ui app-ui-grid-list-hover style
// -----------------------------------------------------------------

const TEMPLATES = [
  {
    id: "auto-reply-negative",
    title: "Auto-reply negative reviews",
    description: "Trigger on 1–2 star reviews, generate empathetic AI reply, notify manager for approval before posting.",
    nodes: 4,
    runs: "2.4k",
    tag: "Reviews",
    accent: "oklch(0.65_0.26_280)",
  },
  {
    id: "review-request-campaign",
    title: "Post-purchase review request",
    description: "Send a personalised review request SMS/email 24h after purchase. Filter out recent reviewers automatically.",
    nodes: 5,
    runs: "1.8k",
    tag: "Campaigns",
    accent: "oklch(0.70_0.18_55)",
  },
  {
    id: "weekly-analytics-report",
    title: "Weekly analytics digest",
    description: "Every Monday, pull analytics for all locations and post a formatted report to Slack or email.",
    nodes: 3,
    runs: "890",
    tag: "Analytics",
    accent: "oklch(0.60_0.20_160)",
  },
  {
    id: "competitor-alert",
    title: "Competitor rating alert",
    description: "Monitor competitor ratings. Get notified when a competitor's rating changes by 0.1+ or they get a review spike.",
    nodes: 3,
    runs: "520",
    tag: "Intelligence",
    accent: "oklch(0.65_0.22_30)",
  },
  {
    id: "bulk-reply-positive",
    title: "Bulk reply positive reviews",
    description: "Auto-reply to all 5-star reviews with rotating AI-generated thank you messages. No duplicates.",
    nodes: 3,
    runs: "3.1k",
    tag: "Reviews",
    accent: "oklch(0.60_0.20_310)",
  },
  {
    id: "health-score-alert",
    title: "Health score drop alert",
    description: "Trigger when a location's health score drops below a threshold. Auto-assign recovery tasks to the team.",
    nodes: 4,
    runs: "340",
    tag: "Monitoring",
    accent: "oklch(0.65_0.26_280)",
  },
  {
    id: "new-location-setup",
    title: "New location onboarding",
    description: "When a new GMB location is connected, auto-sync reviews, run initial analytics, and create default workflows.",
    nodes: 6,
    runs: "210",
    tag: "Setup",
    accent: "oklch(0.70_0.18_55)",
  },
  {
    id: "vip-customer-reply",
    title: "VIP customer escalation",
    description: "Detect reviews from repeat customers or high LTV accounts. Route to senior manager for personalised response.",
    nodes: 5,
    runs: "180",
    tag: "Reviews",
    accent: "oklch(0.60_0.20_160)",
  },
]

interface TemplateCardProps {
  template: (typeof TEMPLATES)[0]
  delay: number
}

function TemplateCard({ template, delay }: TemplateCardProps) {
  const [hovered, setHovered] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4, delay }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative group rounded-2xl border border-white/8 bg-[oklch(0.13_0.015_270)] overflow-hidden cursor-pointer transition-all duration-300 hover:border-white/15"
      style={{
        boxShadow: hovered ? `0 0 30px -8px ${template.accent}50` : "none",
      }}
    >
      {/* Hover gradient overlay */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 120%, ${template.accent}15 0%, transparent 70%)`,
        }}
      />

      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between mb-3">
          <div
            className="px-2 py-0.5 rounded-full text-[10px] font-medium"
            style={{ background: `${template.accent}18`, color: template.accent }}
          >
            {template.tag}
          </div>
          <motion.div
            animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -4 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowRight className="w-4 h-4 text-white/60" />
          </motion.div>
        </div>

        {/* Workflow icon + title */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${template.accent}18` }}
          >
            <Workflow className="w-4 h-4" style={{ color: template.accent }} />
          </div>
          <h3 className="text-sm font-semibold text-white leading-snug">
            {template.title}
          </h3>
        </div>

        <p className="text-xs text-white/40 leading-relaxed mb-4">
          {template.description}
        </p>

        {/* Footer meta */}
        <div className="flex items-center gap-3 text-[10px] text-white/30">
          <span>{template.nodes} nodes</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span>{template.runs} runs</span>
        </div>
      </div>
    </motion.div>
  )
}

export function GridHoverSection() {
  return (
    <section className="bg-[oklch(0.09_0.012_270)] py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12"
        >
          <div>
            <p className="text-sm font-medium text-[oklch(0.75_0.20_280)] mb-3 uppercase tracking-widest">
              Workflow templates
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Start with a template,
              <br />
              <span className="gradient-text-pb">customise to fit</span>
            </h2>
          </div>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/4 hover:bg-white/8 text-white/70 hover:text-white text-sm font-medium transition-all flex-shrink-0"
          >
            View all templates
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMPLATES.map((t, i) => (
            <TemplateCard key={t.id} template={t} delay={i * 0.04} />
          ))}
        </div>
      </div>
    </section>
  )
}
