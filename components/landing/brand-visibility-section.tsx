"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight, Globe, Zap, Check } from "lucide-react"
import { DitheringSimplexBackdrop } from "@/app/dithering-simplex-backdrop"

const FEATURES = [
  "AI crawler access check (GPTBot, ClaudeBot, Perplexity…)",
  "Structured data & schema validation",
  "E-E-A-T signal analysis",
  "Content citability score",
  "Prioritized fix playbook with code snippets",
]

const SCORE_DEMO = [
  { label: "AI Crawlers", score: 40, color: "#f59e0b" },
  { label: "Citability",  score: 22, color: "#ef4444" },
  { label: "E-E-A-T",     score: 65, color: "#f59e0b" },
  { label: "Schema",      score: 0,  color: "#ef4444" },
]

export function BrandVisibilitySection() {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <section className="relative overflow-hidden">
      <DitheringSimplexBackdrop className="w-full" style={{ minHeight: 520 }}>
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-12">

          {/* Left: copy */}
          <div className="flex-1 max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: "rgba(253,91,255,0.12)", color: "#FD5BFF", border: "1px solid rgba(253,91,255,0.3)" }}>
                <Zap className="w-3 h-3" />
                NEW — AI Brand Visibility
              </span>

              <h2 className="font-bold text-[#f4f8e8] mb-4" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.1, letterSpacing: "-0.03em", textShadow: "0 2px 24px rgba(0,0,0,0.5)" }}>
                Is your brand invisible{" "}
                <span style={{ color: "#FD5BFF" }}>to ChatGPT?</span>
              </h2>

              <p className="mb-8 font-medium" style={{ fontSize: "1.05rem", color: "rgba(244,248,232,0.65)", lineHeight: 1.6 }}>
                67% of businesses are completely invisible to AI models. Get your free visibility score in 60 seconds and a prioritized fix playbook.
              </p>

              <ul className="space-y-2.5 mb-8">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: "rgba(244,248,232,0.7)" }}>
                    <span className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(253,91,255,0.2)", border: "1px solid rgba(253,91,255,0.35)" }}>
                      <Check className="w-2.5 h-2.5" style={{ color: "#FD5BFF" }} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/visibility"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
                style={{ background: "#FD5BFF", color: "#301c2a", boxShadow: "0 0 0 1px rgba(171,250,25,0.35), 0 8px 32px rgba(253,91,255,0.4)" }}
              >
                Scan your site free <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          {/* Right: score preview card */}
          <motion.div
            initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-shrink-0 w-full max-w-sm"
          >
            <div className="rounded-2xl p-6" style={{ background: "rgba(244,248,232,0.06)", border: "1px solid rgba(253,91,255,0.2)", backdropFilter: "blur(12px)" }}>
              <div className="text-center mb-6">
                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(244,248,232,0.4)" }}>AI Visibility Score</div>
                <div className="font-black" style={{ fontSize: 64, color: "#ef4444", lineHeight: 1, textShadow: "0 0 32px rgba(239,68,68,0.4)" }}>34</div>
                <div className="text-sm font-semibold px-3 py-1 rounded-full inline-block mt-1" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>POOR</div>
              </div>

              <div className="space-y-3">
                {SCORE_DEMO.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-xs font-medium w-20 flex-shrink-0" style={{ color: "rgba(244,248,232,0.5)" }}>{item.label}</span>
                    <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(244,248,232,0.08)" }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.score}%`, background: item.color }} />
                    </div>
                    <span className="text-xs font-bold w-8 text-right tabular-nums" style={{ color: item.color }}>{item.score}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 text-center" style={{ borderTop: "1px solid rgba(244,248,232,0.08)" }}>
                <p className="text-xs" style={{ color: "rgba(244,248,232,0.4)" }}>
                  Fix 8 issues → score:{" "}
                  <strong style={{ color: "#22c55e" }}>89/100</strong>
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </DitheringSimplexBackdrop>
    </section>
  )
}
