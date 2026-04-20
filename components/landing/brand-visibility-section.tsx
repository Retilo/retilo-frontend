"use client"

import { motion } from "motion/react"
import { ArrowRight, Grid3x3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { DitheringSimplexBackdrop } from "@/app/dithering-simplex-backdrop"
import { OrganicButton } from "@/components/organic-button"
import { OrganicShapeBadge } from "@/components/organic-shape-badge"
import { headingOnDark, bodyOnDark } from "@/lib/organic-theme"

// ── Organic corner-cutout helpers (same technique as cult-ui-pro organic hero) ──

const CUTOUT_R = 48
const HERO_SHELL_RADIUS = "rounded-bl-2xl lg:rounded-bl-3xl rounded-tr-2xl lg:rounded-tr-3xl"
const HERO_PAD = "p-6 md:p-8 lg:p-10"
const HERO_PAD_PULL = "-mt-6 -ml-6 md:-mt-8 md:-ml-8 lg:-mt-10 lg:-ml-10"
const HERO_PAD_TL = "pt-6 pl-6 md:pt-8 md:pl-8 lg:pt-10 lg:pl-10"

function cornerLayerLight(at: string): string {
  return `radial-gradient(circle at ${at}, transparent ${CUTOUT_R}px, white ${CUTOUT_R}px)`
}

function TopLeftPanelCutouts() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 z-0 h-12 w-12"
        style={{ background: cornerLayerLight("bottom right"), transform: "translateY(100%) translateZ(0)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 z-0 h-12 w-12"
        style={{ background: cornerLayerLight("bottom right"), transform: "translateX(100%) translateZ(0)" }}
      />
    </>
  )
}

// ── Demo data ─────────────────────────────────────────────────────────────────

const FEATURES = [
  "AI crawler access (GPTBot, ClaudeBot, Perplexity…)",
  "Structured data & schema validation",
  "E-E-A-T signal analysis + content citability score",
  "Prioritized fix playbook with ready-to-paste code",
]

const AI_ENGINES = [
  { name: "ChatGPT",    color: "#10a37f", status: "Not cited",  ok: false, issue: "GPTBot blocked" },
  { name: "Claude",     color: "#c96442", status: "Indexed",    ok: true,  issue: null },
  { name: "Perplexity", color: "#20808d", status: "Blocked",    ok: false, issue: "robots.txt rule" },
  { name: "Google AI",  color: "#4285F4", status: "No schema",  ok: false, issue: "JSON-LD missing" },
]

const SCORE_BARS = [
  { label: "AI Crawlers", score: 40,  color: "#f59e0b" },
  { label: "Citability",  score: 22,  color: "#ef4444" },
  { label: "E-E-A-T",     score: 65,  color: "#f59e0b" },
  { label: "Schema",      score: 0,   color: "#ef4444" },
]

// ── Section ───────────────────────────────────────────────────────────────────

export function BrandVisibilitySection() {
  return (
    <section className="bg-white py-6 px-4 md:px-8 lg:px-10">
      {/* Floating shell — dithering is CONTAINED, not full-bleed */}
      <div className={cn("relative overflow-hidden bg-[#1a0a2e]", HERO_SHELL_RADIUS)}>
        <DitheringSimplexBackdrop
          className={cn("w-full", HERO_SHELL_RADIUS)}
          colorFront="#FD5BFF"
          colorBack="#1a0a2e"
          style={{ minHeight: 520 }}
        >
          {/* Scrim: readable center, vivid edges */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              background:
                "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(26,10,46,0.82) 0%, rgba(26,10,46,0.5) 65%, transparent 100%)",
            }}
          />

          <div className={cn("relative z-20 flex min-h-0 w-full flex-1 flex-col", HERO_PAD)}>

            {/* Top-left brand panel with corner cutout */}
            <div
              className={cn(
                "relative self-start rounded-br-3xl bg-white pr-6 pb-4",
                HERO_PAD_PULL,
                HERO_PAD_TL
              )}
            >
              <TopLeftPanelCutouts />
              <div className="relative z-10">
                <p className="font-semibold text-gray-900 leading-tight text-sm">
                  Retilo
                </p>
                <p className="font-normal text-gray-400 text-xs mt-0.5">AI Visibility Scanner</p>
              </div>
            </div>

            {/* Main content: copy + demo card */}
            <div className="flex flex-col gap-10 pt-8 lg:flex-row lg:items-center lg:gap-12 lg:pt-10">

              {/* Left: copy */}
              <motion.div
                className="flex-1 max-w-xl"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
              >
                <OrganicShapeBadge
                  className="mb-6"
                  icon={<Grid3x3 aria-hidden className="organic-badge-icon stroke-[1.75]" />}
                  label="AI Brand Visibility"
                  variantColor="dark"
                />

                <h2
                  className={cn(headingOnDark, "mb-4")}
                  style={{ fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.08 }}
                >
                  Is your brand{" "}
                  <span style={{ color: "#FD5BFF", textShadow: "0 0 40px rgba(253,91,255,0.45)" }}>
                    invisible<br />to ChatGPT?
                  </span>
                </h2>

                <p className={cn(bodyOnDark, "mb-8 text-base lg:text-lg")}>
                  67% of businesses are completely invisible to AI models. Get your free visibility score
                  in 60 seconds and a prioritized fix playbook.
                </p>

                <ul className="mb-10 space-y-3">
                  {FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: "rgba(244,248,232,0.7)" }}>
                      <span
                        className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(253,91,255,0.18)", border: "1px solid rgba(253,91,255,0.35)" }}
                      >
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1.5 4L3.5 6L6.5 2" stroke="#FD5BFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <OrganicButton
                  animationSpeed="fast"
                  href="/visibility"
                  icon={<ArrowRight className="organic-icon stroke-2 transition-transform duration-100 group-hover/organic:translate-x-0.5" />}
                  label="Scan your site free"
                  size="lg"
                  variantColor="dither"
                />
              </motion.div>

              {/* Right: AI engine visibility demo card */}
              <motion.div
                className="flex-shrink-0 w-full lg:max-w-sm"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    backdropFilter: "blur(16px)",
                    boxShadow: "0 4px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.09)",
                  }}
                >
                  {/* Card header */}
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(244,248,232,0.45)", textTransform: "uppercase" as const, letterSpacing: "0.07em" }}>
                      AI Visibility Score
                    </span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#ef4444", background: "rgba(239,68,68,0.14)", padding: "2px 8px", borderRadius: 20, border: "1px solid rgba(239,68,68,0.25)" }}>
                      POOR
                    </span>
                  </div>

                  {/* Score */}
                  <div style={{ padding: "18px 18px 14px", display: "flex", alignItems: "flex-end", gap: 14, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div>
                      <span style={{ fontSize: 64, fontWeight: 900, color: "#ef4444", lineHeight: 1, display: "block" }}>34</span>
                      <span style={{ fontSize: 11, color: "rgba(244,248,232,0.3)" }}>out of 100</span>
                    </div>
                    <div style={{ flex: 1, paddingBottom: 6 }}>
                      {SCORE_BARS.map((bar) => (
                        <div key={bar.label} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                          <span style={{ fontSize: 9, color: "rgba(244,248,232,0.4)", width: 54, flexShrink: 0 }}>{bar.label}</span>
                          <div style={{ flex: 1, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${bar.score}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
                              style={{ height: "100%", borderRadius: 99, background: bar.color }}
                            />
                          </div>
                          <span style={{ fontSize: 9, fontWeight: 700, color: bar.color, width: 18, textAlign: "right" as const }}>{bar.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI engine status — the actual story */}
                  <div style={{ padding: "14px 18px" }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(244,248,232,0.35)", textTransform: "uppercase" as const, letterSpacing: "0.07em", display: "block", marginBottom: 10 }}>
                      Engine visibility
                    </span>
                    {AI_ENGINES.map((engine) => (
                      <div key={engine.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: engine.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(244,248,232,0.75)", width: 74, flexShrink: 0 }}>{engine.name}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: engine.ok ? "#22c55e" : "#ef4444", flex: 1 }}>
                          {engine.ok ? "✓ " : "✗ "}{engine.status}
                        </span>
                        {engine.issue && (
                          <span style={{ fontSize: 9, color: "rgba(244,248,232,0.25)", textAlign: "right" as const, maxWidth: 80, lineHeight: 1.3, flexShrink: 0 }}>
                            {engine.issue}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div style={{ padding: "10px 18px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" as const }}>
                    <p style={{ fontSize: 11, color: "rgba(244,248,232,0.35)" }}>
                      Fix 8 issues → reach{" "}
                      <strong style={{ color: "#22c55e" }}>89/100</strong>
                      {" "}in 60 seconds
                    </p>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </DitheringSimplexBackdrop>
      </div>
    </section>
  )
}
