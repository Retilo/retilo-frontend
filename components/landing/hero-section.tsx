"use client"

import { useReducedMotion, motion, type Variants } from "motion/react"
import { ArrowRight, Zap } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { OrganicShapeBadge } from "@/components/organic-shape-badge"
import { OrganicButton } from "@/components/organic-button"

const CALENDLY = "https://calendly.com/satwikloka321/retilo?month=2026-03"

const PLATFORMS = [
  { name: "Google Business", color: "#4285F4" },
  { name: "ChatGPT",         color: "#10a37f" },
  { name: "WhatsApp",        color: "#25d366" },
  { name: "ElevenLabs",      color: "#c96442" },
  { name: "Perplexity",      color: "#20808d" },
  { name: "Instagram",       color: "#833ab4" },
]

/* ── Deterministic noise ── */
function det(i: number, ch: number) {
  let n = i * 127 + ch * 311 + 9973
  n = (n * 9301 + 49_297) % 233_280
  return n / 233_280
}

/* ── Product cards (dark zinc — same language as StorySection) ── */

function VoiceCard({ reduce }: { reduce: boolean }) {
  const bars = Array.from({ length: 24 })
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
          Live · Incoming call
        </span>
      </div>
      <div className="flex items-center gap-[2px] h-8 mb-3">
        {bars.map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-blue-400"
            style={{
              height: `${(0.25 + det(i, 0) * 0.75) * 100}%`,
              opacity: 0.4 + det(i, 3) * 0.5,
              animation: reduce
                ? "none"
                : `hero-bar ${0.5 + det(i, 1) * 0.7}s ease-in-out ${det(i, 2) * 0.4}s infinite alternate`,
            }}
          />
        ))}
      </div>
      <p className="text-xs text-zinc-300">&ldquo;Table for 4, Sunday 7pm?&rdquo;</p>
      <p className="text-[11px] text-blue-400 mt-1 font-mono">Retilo Voice → Confirming…</p>
    </div>
  )
}

function ScoreCard({ reduce }: { reduce: boolean }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
          AI Visibility
        </span>
        <span className="font-mono text-[9px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
          ↑ +55 pts
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-bold text-white tabular-nums tracking-tight">89</span>
        <span className="text-zinc-600 font-mono text-xs">/ 100</span>
      </div>
      <div className="mt-3 h-1 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400"
          style={{
            width: "89%",
            animation: reduce ? "none" : "hero-score-bar 1.4s cubic-bezier(0.22,1,0.36,1) forwards",
          }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="font-mono text-[9px] text-zinc-600">was 34</span>
        <span className="font-mono text-[9px] text-zinc-600">now 89</span>
      </div>
    </div>
  )
}

function ReplyCard({ reduce }: { reduce: boolean }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
          AI reply · 2★ review
        </span>
        <div className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1 w-1 rounded-full bg-violet-400"
              style={{
                animation: reduce ? "none" : `hero-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
      <p className="text-xs text-zinc-500 italic mb-2">&ldquo;Order arrived cold and late…&rdquo;</p>
      <p className="text-xs text-zinc-200 leading-relaxed">
        &ldquo;Hi James, we&rsquo;re truly sorry. We&rsquo;ve flagged your order…&rdquo;
      </p>
      <div className="mt-2.5 flex items-center gap-1.5">
        <div className="h-1 w-1 rounded-full bg-emerald-400" />
        <span className="font-mono text-[9px] text-emerald-400">Posted · 94% satisfaction score</span>
      </div>
    </div>
  )
}

/* ── Main section ── */

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion()
  const initial = shouldReduceMotion ? "visible" : "hidden"

  const stagger: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.06 } },
  }

  const item: Variants = {
    hidden:   { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
    visible:  { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  }

  const card: Variants = {
    hidden:  { opacity: 0, y: 28, scale: 0.95 },
    visible: { opacity: 1, y: 0,  scale: 1,   transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  }

  return (
    <section className="relative flex min-h-svh w-full flex-col bg-white overflow-hidden">
      {/* Soft radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 55% at 50% -18%, color-mix(in oklab, oklch(0.58 0.24 350) 12%, transparent), transparent 62%)",
        }}
      />
      {/* Dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-16 sm:px-6 sm:py-20 lg:py-0">
        <div className="grid flex-1 grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-14 lg:py-16">

          {/* Left: copy */}
          <motion.div
            animate="visible"
            className="mx-auto w-full max-w-2xl text-center lg:mx-0 lg:max-w-none lg:text-left"
            initial={initial}
            variants={stagger}
          >
            <motion.div className="mb-6" variants={item}>
              <OrganicShapeBadge
                icon={<Zap aria-hidden className="organic-badge-icon stroke-[1.75]" />}
                label="Retail Intelligence Platform"
                size="sm"
                variantColor="light"
              />
            </motion.div>

            <motion.h1
              className="mb-5 font-black tracking-tight text-gray-900"
              style={{ fontSize: "clamp(2.2rem, 5.4vw, 3.75rem)", letterSpacing: "-0.04em", lineHeight: 1.04 }}
              variants={item}
            >
              The AI operating system
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, oklch(0.58 0.24 350) 0%, oklch(0.50 0.28 310) 100%)",
                }}
              >
                for local retail.
              </span>
            </motion.h1>

            {/* Four-module strip */}
            <motion.div
              className="mb-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 lg:justify-start"
              variants={item}
            >
              {["Voice", "Rankings", "Demand signals", "Reputation"].map((m, i, arr) => (
                <span key={m} className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-gray-700">
                    {m}
                  </span>
                  {i < arr.length - 1 && (
                    <span className="h-px w-3 bg-gray-300 flex-shrink-0" />
                  )}
                </span>
              ))}
            </motion.div>

            <motion.p
              className="mx-auto mb-8 max-w-lg text-pretty text-gray-500 leading-relaxed sm:text-base lg:mx-0"
              style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.07rem)" }}
              variants={item}
            >
              One platform that reads your shop, connects your channels,
              and tells you exactly what to win next.
            </motion.p>

            <motion.div
              className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 lg:justify-start"
              variants={item}
            >
              <OrganicButton
                animationSpeed="fast"
                href="/grader"
                icon={<ArrowRight className="organic-icon stroke-2 transition-transform duration-100 group-hover/organic:translate-x-0.5" />}
                label="Free 60-second audit"
                size="lg"
                variantColor="primary"
              />
              <Link
                href={CALENDLY}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex h-14 items-center justify-center px-6 text-base font-semibold",
                  "rounded-full border border-gray-200 bg-white text-gray-700",
                  "transition-all hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                Book a demo
              </Link>
            </motion.div>

            {/* Platform pill strip */}
            <motion.div
              className="mt-7 flex flex-wrap items-center justify-center gap-2 lg:justify-start"
              variants={item}
            >
              <span className="text-xs text-gray-400 mr-1">Works with</span>
              {PLATFORMS.map(({ name, color }) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-500"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                    style={{ background: color }}
                  />
                  {name}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: product cards */}
          <motion.div
            animate="visible"
            className="flex flex-col gap-3 w-full max-w-sm mx-auto lg:mx-0 lg:max-w-none"
            initial={initial}
            variants={stagger}
          >
            <motion.div variants={card}>
              <VoiceCard reduce={!!shouldReduceMotion} />
            </motion.div>
            <motion.div variants={card} className="lg:ml-8">
              <ScoreCard reduce={!!shouldReduceMotion} />
            </motion.div>
            <motion.div variants={card}>
              <ReplyCard reduce={!!shouldReduceMotion} />
            </motion.div>
          </motion.div>

        </div>
      </div>

      <style>{`
        @keyframes hero-bar {
          from { transform: scaleY(0.3); }
          to   { transform: scaleY(1); }
        }
        @keyframes hero-score-bar { from { width: 0; } }
        @keyframes hero-dot {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50%       { opacity: 1; transform: translateY(-2px); }
        }
      `}</style>
    </section>
  )
}
