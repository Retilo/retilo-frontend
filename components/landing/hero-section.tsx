"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { ArrowRight, Star, Zap } from "lucide-react"
import { TextRoll } from "@/components/text-roll"
import { Magnetic } from "@/components/magnetic"

const ROTATING_WORDS = ["Reviews", "Campaigns", "Insights", "Workflows"]

const HERO_STATS = [
  { value: "4.9★", label: "avg rating lift" },
  { value: "3×", label: "faster replies" },
  { value: "94%", label: "response rate" },
]

export function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0)
  const [cycleKey, setCycleKey] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setWordIndex((i) => (i + 1) % ROTATING_WORDS.length)
      setCycleKey((k) => k + 1)
    }, 2600)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[oklch(0.09_0.012_270)] px-4 pt-28 pb-24">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid opacity-[0.18]" />

      {/* Primary radial glow — top center */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[700px]"
        style={{
          background:
            "radial-gradient(ellipse 55% 50% at 50% 0%, oklch(0.55 0.24 280 / 22%) 0%, transparent 70%)",
        }}
      />

      {/* Secondary soft side glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 -left-48 w-96 h-96 rounded-full blur-[120px]"
        style={{ background: "oklch(0.55 0.24 280 / 7%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-2/3 -right-48 w-96 h-96 rounded-full blur-[120px]"
        style={{ background: "oklch(0.55 0.24 280 / 5%)" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto text-center w-full">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[oklch(0.55_0.24_280)/35%] bg-[oklch(0.55_0.24_280)/8%] text-[11px] font-semibold text-[oklch(0.80_0.18_280)] mb-10 tracking-widest uppercase"
        >
          <Zap className="w-3 h-3" />
          AI-powered Google Business Management
          <span className="bg-[oklch(0.55_0.24_280)/30%] px-2 py-0.5 rounded-full text-[9px] tracking-wider">
            NEW
          </span>
        </motion.div>

        {/* Headline */}
        <div className="mb-8 overflow-hidden">
          {/* Line 1: TextRoll entrance */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1, delay: 0.05 }}
          >
            <h1 className="font-black tracking-tight text-white leading-[1.0]">
              <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-[5.25rem]">
                <TextRoll
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.25rem] text-white"
                  duration={0.35}
                  getEnterDelay={(i) => i * 0.028}
                  getExitDelay={(i) => i * 0.028 + 0.15}
                >
                  Automate your
                </TextRoll>
              </span>

              {/* Line 2: Cycling gradient word */}
              <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-[5.25rem] mt-1 h-[1.15em] overflow-hidden relative">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={cycleKey}
                    initial={{ y: "105%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-105%", opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 flex items-center justify-center gradient-text"
                  >
                    {ROTATING_WORDS[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>

              {/* Line 3: "at scale" */}
              <motion.span
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.55, ease: "easeOut" }}
                className="block text-5xl sm:text-6xl md:text-7xl lg:text-[5.25rem] text-white/80 mt-1"
              >
                at scale.
              </motion.span>
            </h1>
          </motion.div>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="text-lg sm:text-xl text-white/42 max-w-xl mx-auto leading-relaxed mb-12 font-light"
        >
          Connect all your Google Business locations, generate AI reply drafts,
          surface actionable insights, and run automation workflows — in one place.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
        >
          <Magnetic intensity={0.45} range={90}>
            <Link
              href="/auth"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[oklch(0.55_0.24_280)] hover:bg-[oklch(0.60_0.26_280)] text-white font-semibold text-sm transition-all duration-200 glow-purple-sm hover:glow-purple"
            >
              Get started free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </Magnetic>

          <Magnetic intensity={0.35} range={90}>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white font-medium text-sm transition-all duration-200"
            >
              See how it works
            </Link>
          </Magnetic>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          className="flex items-center justify-center gap-10 sm:gap-16 mb-20"
        >
          {HERO_STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight tabular-nums">
                {s.value}
              </div>
              <div className="text-[11px] text-white/35 mt-1 tracking-widest uppercase">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Dashboard preview mockup */}
      <motion.div
        initial={{ opacity: 0, y: 48 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-5xl mx-auto px-4"
      >
        {/* Top glow above mockup */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-2/3 h-12 bg-[oklch(0.55_0.24_280)] blur-[50px] opacity-10 rounded-full" />

        <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[oklch(0.13_0.015_270)] shadow-2xl shadow-black/70">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-[oklch(0.11_0.014_270)]">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
            <div className="ml-4 flex-1 max-w-xs h-5 rounded-md bg-white/[0.05] flex items-center px-3">
              <span className="text-[10px] text-white/25 tracking-wide">
                app.retilo.com/dashboard
              </span>
            </div>
          </div>

          {/* Fake dashboard layout */}
          <div className="flex h-[380px]">
            {/* Sidebar */}
            <div className="w-52 border-r border-white/[0.06] bg-[oklch(0.10_0.016_270)] p-4 space-y-0.5 flex-shrink-0">
              {[
                "Dashboard",
                "Reviews",
                "Analytics",
                "Workflows",
                "Locations",
                "Campaigns",
              ].map((item, i) => (
                <div
                  key={item}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors cursor-default ${
                    i === 0
                      ? "bg-[oklch(0.55_0.24_280)/18%] text-[oklch(0.82_0.18_280)]"
                      : "text-white/35 hover:text-white/60"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      i === 0
                        ? "bg-[oklch(0.65_0.26_280)]"
                        : "bg-white/15"
                    }`}
                  />
                  {item}
                </div>
              ))}
            </div>

            {/* Main area */}
            <div className="flex-1 p-6 space-y-4 overflow-hidden">
              {/* Stat cards */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Avg Rating", value: "4.7", color: "oklch(0.65_0.26_280)" },
                  { label: "Reviews", value: "1,204", color: "oklch(0.60_0.20_160)" },
                  { label: "Replied", value: "94%", color: "oklch(0.70_0.18_55)" },
                  { label: "Locations", value: "12", color: "oklch(0.65_0.22_30)" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl bg-white/[0.04] border border-white/[0.07] p-3"
                  >
                    <div className="text-[10px] text-white/35 mb-1.5 tracking-wide">
                      {s.label}
                    </div>
                    <div className="text-xl font-bold tabular-nums" style={{ color: s.color }}>
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Review feed */}
              <div className="space-y-2">
                {[
                  { name: "Sarah M.", rating: 5, text: "Amazing service, will definitely return!", replied: true },
                  { name: "James K.", rating: 2, text: "Waited too long. Staff not attentive.", replied: false },
                  { name: "Priya S.", rating: 4, text: "Good experience overall, minor issues with…", replied: true },
                ].map((r) => (
                  <div
                    key={r.name}
                    className="flex items-start gap-3 rounded-xl bg-white/[0.02] border border-white/[0.07] px-4 py-3"
                  >
                    <div className="w-7 h-7 rounded-full bg-[oklch(0.55_0.24_280)/25%] flex items-center justify-center text-xs font-bold text-[oklch(0.82_0.18_280)] flex-shrink-0">
                      {r.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-white/75">
                          {r.name}
                        </span>
                        <span className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-2.5 h-2.5 ${
                                i < r.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-white/15"
                              }`}
                            />
                          ))}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/35 truncate">{r.text}</p>
                    </div>
                    <div
                      className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 font-medium ${
                        r.replied
                          ? "bg-green-500/12 text-green-400"
                          : "bg-[oklch(0.55_0.24_280)/18%] text-[oklch(0.82_0.18_280)]"
                      }`}
                    >
                      {r.replied ? "Replied" : "AI Draft"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom glow under mockup */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-[oklch(0.55_0.24_280)] blur-[60px] opacity-12 rounded-full" />
      </motion.div>
    </section>
  )
}
