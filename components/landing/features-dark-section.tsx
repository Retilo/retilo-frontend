"use client"

import { motion, useInView } from "motion/react"
import { useRef } from "react"
import { Check, ArrowRight, ArrowDown } from "lucide-react"

const CALENDLY = "https://calendly.com/satwikloka321/retilo?month=2026-03"

const STEPS = [
  {
    step: "01",
    title: "Connect your Google Business",
    description:
      "OAuth in one click. Retilo syncs all your locations, existing reviews, and historical data immediately after connecting.",
    bullets: ["Multi-account Google support", "Instant location + review sync", "Historical analytics import"],
    accent: "oklch(0.65_0.26_280)",
    accentHex: "#818cf8",
    preview: (
      <div className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#4285F4]/20 flex items-center justify-center">
            <span className="text-xs font-bold text-[#4285F4]">G</span>
          </div>
          <div>
            <div className="text-sm font-medium text-white">business@yourcompany.com</div>
            <div className="text-xs text-white/40">12 locations found</div>
          </div>
          <div className="ml-auto px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">Connected</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {["Store CBD", "Store Newtown", "Store Hills", "Store Beach"].map((s) => (
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
    title: "Set up automation workflows",
    description:
      "Drag-and-drop GMB nodes onto a visual canvas. Set triggers, AI reply rules, and notification steps — no code required.",
    bullets: ["Visual node-based editor", "GMB-specific trigger nodes", "AI reply + auto-post support"],
    accent: "oklch(0.70_0.18_55)",
    accentHex: "#fbbf24",
    preview: (
      <div className="rounded-xl bg-white/5 border border-white/10 p-5">
        <div className="text-xs text-white/40 mb-3 font-medium">Active workflow</div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: "1★ Review", color: "#ef4444" },
            { label: "AI Draft", color: "#818cf8" },
            { label: "Approve", color: "#22c55e" },
            { label: "Post Reply", color: "#fbbf24" },
          ].map((n, i, arr) => (
            <div key={i} className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white whitespace-nowrap" style={{ background: n.color + "30", border: `1px solid ${n.color}50`, color: n.color }}>
                {n.label}
              </div>
              {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-white/20 flex-shrink-0" />}
            </div>
          ))}
        </div>
        <div className="mt-3 px-3 py-2 rounded-lg bg-white/4 text-xs text-white/50">
          ✦ 247 runs this month · avg 4 min response
        </div>
      </div>
    ),
  },
  {
    step: "03",
    title: "Track local ranking with grid scans",
    description:
      "Run geographic grid scans for any keyword. See exactly where you rank across your service area and spot opportunities instantly.",
    bullets: ["Async grid scan with live progress", "Color-coded rank heatmap", "Keyword vs competitor tracking"],
    accent: "oklch(0.58_0.24_350)",
    accentHex: "oklch(0.70 0.24 350)",
    preview: (
      <div className="rounded-xl bg-white/5 border border-white/10 p-5">
        <div className="text-xs text-white/40 mb-3 font-medium">Rank grid — &ldquo;best coffee near me&rdquo;</div>
        <div className="grid grid-cols-5 gap-1">
          {[1,2,4,3,5,8,6,7,12,9,11,14,10,13,15,18,16,20,17,19,22,21,25,23,24].map((r, i) => {
            const color = r <= 3 ? "#22c55e" : r <= 10 ? "#eab308" : "#ef4444"
            return (
              <div key={i} className="aspect-square rounded flex items-center justify-center text-[10px] font-bold text-white"
                style={{ background: color + "90" }}>
                {r}
              </div>
            )
          })}
        </div>
        <div className="mt-3 flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-green-400"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />Top 3: 6</span>
          <span className="flex items-center gap-1 text-yellow-400"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />Top 10: 11</span>
          <span className="flex items-center gap-1 text-red-400"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />10+: 8</span>
        </div>
      </div>
    ),
  },
  {
    step: "04",
    title: "AI agents handle the rest",
    description:
      "Autonomous agents monitor your reputation, respond to reviews, alert your team, and continuously optimise your local presence.",
    bullets: ["24/7 review monitoring", "Auto-post with approval flow", "Competitor alert notifications"],
    accent: "oklch(0.60_0.20_160)",
    accentHex: "#34d399",
    preview: (
      <div className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-2">
        {[
          { msg: "⭐ Replied to 3 new reviews", time: "2m ago", dot: "#22c55e" },
          { msg: "📍 Rank improved: #4 → #2 for 'pizza'", time: "1h ago", dot: "#818cf8" },
          { msg: "🔔 Competitor got 8 new reviews today", time: "3h ago", dot: "#fbbf24" },
        ].map((n, i) => (
          <div key={i} className="flex items-start gap-2.5 px-3 py-2 rounded-lg bg-white/4">
            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.dot }} />
            <div className="flex-1">
              <p className="text-xs text-white/70">{n.msg}</p>
              <p className="text-[10px] text-white/30 mt-0.5">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
]

export function FeaturesDarkSection() {
  const headerRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" })

  return (
    <section className="py-28 px-4 bg-[oklch(0.10_0.012_270)]">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }} animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5 bg-white/8 text-white/60 border border-white/10">
            How it works
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-4">
            From connection to intelligence<br className="hidden lg:block" /> in four steps
          </h2>
          <p className="text-white/45 max-w-lg mx-auto text-[1rem]">
            Retilo is designed to deliver value in minutes — not months.
          </p>
        </motion.div>

        {/* Steps — vertically connected */}
        <div className="space-y-0">
          {STEPS.map((step, index) => {
            const ref = useRef(null) // eslint-disable-line react-hooks/rules-of-hooks
            const inView = useInView(ref, { once: true, margin: "-80px" }) // eslint-disable-line react-hooks/rules-of-hooks
            const isLast = index === STEPS.length - 1
            const isEven = index % 2 === 0

            return (
              <div key={step.step} className="relative">
                {/* Connector line */}
                {!isLast && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full z-10 flex flex-col items-center" style={{ height: 48 }}>
                    <div className="flex-1 w-px" style={{ background: `linear-gradient(to bottom, ${step.accentHex}40, ${STEPS[index + 1].accentHex}40)` }} />
                    <ArrowDown className="w-4 h-4 text-white/20" />
                  </div>
                )}

                <motion.div
                  ref={ref}
                  initial={{ opacity: 0, y: 32 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6 }}
                  className={`flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-6 lg:gap-10 mb-12`}
                >
                  {/* Text side */}
                  <div className="flex-1 space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-black tracking-widest px-2.5 py-1 rounded-lg border text-white/40 border-white/10">
                        {step.step}
                      </div>
                      <div className="h-px flex-1 bg-white/8" />
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight">{step.title}</h3>
                    <p className="text-white/50 leading-relaxed">{step.description}</p>
                    <ul className="space-y-2.5">
                      {step.bullets.map((b) => (
                        <li key={b} className="flex items-center gap-2.5 text-sm text-white/60">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: step.accentHex + "20" }}>
                            <Check className="w-2.5 h-2.5" style={{ color: step.accentHex }} />
                          </div>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Preview side */}
                  <div className="flex-1 w-full lg:max-w-md">{step.preview}</div>
                </motion.div>
              </div>
            )
          })}
        </div>

        {/* Book demo CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-white/40 text-sm mb-5">Ready to see it in action?</p>
          <a
            href={CALENDLY}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white text-sm transition-all hover:-translate-y-0.5"
            style={{ background: "oklch(0.58 0.24 350)", boxShadow: "0 8px 24px oklch(0.58 0.24 350 / 35%)" }}
          >
            Book a demo <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
