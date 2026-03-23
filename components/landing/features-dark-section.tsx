"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Check, ArrowRight } from "lucide-react"

// -----------------------------------------------------------------
// DARK FEATURES — "How it works" section
// Inspired by cult-ui marketing-features-dark style
// -----------------------------------------------------------------

const STEPS = [
  {
    step: "01",
    title: "Connect your Google Business",
    description:
      "OAuth in one click. Retilo syncs all your locations, existing reviews, and historical data immediately after connecting.",
    bullets: [
      "Multi-account Google support",
      "Instant location + review sync",
      "Historical analytics import",
    ],
    accent: "oklch(0.65_0.26_280)",
    // Inline mockup
    preview: (
      <div className="rounded-xl bg-black/40 border border-white/10 p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[oklch(0.55_0.24_280)/30%] flex items-center justify-center">
            <span className="text-xs font-bold text-[oklch(0.80_0.18_280)]">G</span>
          </div>
          <div>
            <div className="text-sm font-medium text-white">business@yourcompany.com</div>
            <div className="text-xs text-white/40">12 locations found</div>
          </div>
          <div className="ml-auto px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">Connected</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {["Store CBD", "Store Newtown", "Store Surry Hills", "Store Bondi"].map((s) => (
            <div key={s} className="flex items-center gap-2 text-xs text-white/50 rounded-lg bg-white/4 px-3 py-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              {s}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    step: "02",
    title: "Build your automation workflows",
    description:
      "Drag and drop GMB nodes onto a visual canvas. Set triggers, filters, AI reply rules, and notification steps — no code required.",
    bullets: [
      "Visual node-based editor",
      "GMB-specific trigger nodes",
      "AI reply + auto-post support",
    ],
    accent: "oklch(0.70_0.18_55)",
    preview: (
      <div className="rounded-xl bg-black/40 border border-white/10 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-xs text-white/30">Workflow: Auto-reply to negative reviews</div>
          <div className="ml-auto flex items-center gap-1 text-xs text-green-400">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Active
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          {[
            { label: "New Review", sub: "rating ≤ 2 stars", color: "oklch(0.65_0.26_280)" },
            { label: "AI Draft Reply", sub: "empathetic tone", color: "oklch(0.70_0.18_55)" },
            { label: "Manager Approval", sub: "Slack notification", color: "oklch(0.65_0.22_30)" },
            { label: "Post to Google", sub: "auto-reply", color: "oklch(0.60_0.20_160)" },
          ].map((n, i) => (
            <div key={n.label} className="flex flex-col items-center w-full">
              <div
                className="w-full max-w-xs px-4 py-2.5 rounded-xl border text-center"
                style={{ borderColor: `${n.color}40`, background: `${n.color}12` }}
              >
                <div className="text-xs font-medium text-white/80">{n.label}</div>
                <div className="text-[10px] text-white/40 mt-0.5">{n.sub}</div>
              </div>
              {i < 3 && <div className="w-px h-4 bg-white/15" />}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    step: "03",
    title: "Monitor and act on insights",
    description:
      "Real-time analytics across every location. Health scores, sentiment analysis, keyword trends, and competitor comparisons — all in one place.",
    bullets: [
      "Health score 0-100 per location",
      "Sentiment + topic analysis",
      "Competitor benchmarking",
    ],
    accent: "oklch(0.60_0.20_160)",
    preview: (
      <div className="rounded-xl bg-black/40 border border-white/10 p-5 space-y-4">
        {/* Health score ring */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="26" fill="none" stroke="oklch(1 0 0 / 8%)" strokeWidth="6" />
              <circle
                cx="32" cy="32" r="26"
                fill="none"
                stroke="oklch(0.60 0.20 160)"
                strokeWidth="6"
                strokeDasharray="163.36"
                strokeDashoffset="32.67"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-white">84</span>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-white">Health Score</div>
            <div className="text-xs text-white/40 mt-0.5">Store #1 · CBD</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-green-400">
              +6 this week
            </div>
          </div>
        </div>
        {/* Sentiment bars */}
        <div className="space-y-2">
          {[
            { label: "Positive", pct: 72, color: "oklch(0.60_0.20_160)" },
            { label: "Neutral", pct: 15, color: "oklch(0.70_0.18_55)" },
            { label: "Negative", pct: 13, color: "oklch(0.65_0.22_25)" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 text-xs">
              <span className="text-white/40 w-14">{s.label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
              </div>
              <span className="text-white/60 w-6 text-right">{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
]

export function FeaturesDarkSection() {
  return (
    <section className="bg-[oklch(0.07_0.010_270)] py-28 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <p className="text-sm font-medium text-[oklch(0.75_0.20_280)] mb-3 uppercase tracking-widest">
            How it works
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            From connect to automated
            <br />
            <span className="gradient-text">in minutes</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="space-y-24">
          {STEPS.map((step, i) => {
            const ref = useRef(null)
            const inView = useInView(ref, { once: true, margin: "-80px" })
            const isEven = i % 2 === 0

            return (
              <motion.div
                key={step.step}
                ref={ref}
                initial={{ opacity: 0, y: 32 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-12 lg:gap-16`}
              >
                {/* Text */}
                <div className="flex-1 space-y-6">
                  <div
                    className="text-5xl font-black leading-none"
                    style={{ color: `${step.accent}30` }}
                  >
                    {step.step}
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-base text-white/50 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  <ul className="space-y-2.5">
                    {step.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-3 text-sm text-white/70">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: `${step.accent}20`, color: step.accent }}
                        >
                          <Check className="w-3 h-3" />
                        </div>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Preview */}
                <div className="flex-1 w-full max-w-md lg:max-w-none">
                  {step.preview}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
