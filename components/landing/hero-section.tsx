"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Star, Zap } from "lucide-react"

const HERO_STATS = [
  { value: "4.9★", label: "avg rating lift" },
  { value: "3×", label: "faster replies" },
  { value: "94%", label: "response rate" },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[oklch(0.09_0.012_270)] px-4 py-24">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid opacity-30" />

      {/* Radial glow top center */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px]"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 0%, oklch(0.55 0.24 280 / 30%) 0%, transparent 70%)",
        }}
      />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[oklch(0.65_0.26_280)]"
          style={{
            left: `${15 + i * 14}%`,
            top: `${20 + (i % 3) * 20}%`,
          }}
          animate={{ y: [-8, 8, -8], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[oklch(0.55_0.24_280)/40%] bg-[oklch(0.55_0.24_280)/10%] text-xs font-medium text-[oklch(0.80_0.18_280)] mb-8"
        >
          <Zap className="w-3 h-3" />
          AI-powered Google Business Management
          <span className="inline-flex items-center gap-1 bg-[oklch(0.55_0.24_280)/20%] px-1.5 py-0.5 rounded-full text-[10px]">
            New
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.05] mb-6"
        >
          Automate your{" "}
          <br className="hidden sm:block" />
          <span className="gradient-text">Google Business</span>
          <br />
          at scale
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Retilo connects to all your Google Business locations, generates
          AI review replies, surfaces insights, and runs automation workflows —
          so you can focus on what matters.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
        >
          <Link
            href="/auth"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[oklch(0.55_0.24_280)] hover:bg-[oklch(0.60_0.26_280)] text-white font-semibold text-sm transition-all glow-purple-sm hover:glow-purple"
          >
            Get started free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/4 hover:bg-white/8 text-white/80 hover:text-white font-medium text-sm transition-all"
          >
            See how it works
          </Link>
        </motion.div>

        {/* Social proof stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center justify-center gap-8 sm:gap-12"
        >
          {HERO_STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Dashboard preview mockup */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 20 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative z-10 mt-20 w-full max-w-5xl mx-auto"
      >
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[oklch(0.13_0.015_270)] shadow-2xl shadow-black/60">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-[oklch(0.11_0.014_270)]">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
            <div className="ml-4 flex-1 max-w-xs h-5 rounded-md bg-white/5 flex items-center px-3">
              <span className="text-[10px] text-white/30">app.retilo.com/dashboard</span>
            </div>
          </div>
          {/* Fake dashboard layout */}
          <div className="flex h-[380px]">
            {/* Sidebar */}
            <div className="w-52 border-r border-white/8 bg-[oklch(0.10_0.016_270)] p-4 space-y-1 flex-shrink-0">
              {["Dashboard", "Reviews", "Analytics", "Workflows", "Locations", "Campaigns"].map((item, i) => (
                <div
                  key={item}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs ${
                    i === 0
                      ? "bg-[oklch(0.55_0.24_280)/20%] text-[oklch(0.80_0.18_280)]"
                      : "text-white/40 hover:text-white/70 hover:bg-white/5"
                  } transition-colors cursor-default`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-[oklch(0.65_0.26_280)]" : "bg-white/20"}`} />
                  {item}
                </div>
              ))}
            </div>
            {/* Main area */}
            <div className="flex-1 p-6 space-y-5 overflow-hidden">
              {/* Stat cards */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Avg Rating", value: "4.7", color: "oklch(0.65_0.26_280)" },
                  { label: "Reviews", value: "1,204", color: "oklch(0.60_0.20_160)" },
                  { label: "Replied", value: "94%", color: "oklch(0.70_0.18_55)" },
                  { label: "Locations", value: "12", color: "oklch(0.65_0.22_30)" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-white/4 border border-white/8 p-3">
                    <div className="text-[10px] text-white/40 mb-1">{s.label}</div>
                    <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
              {/* Mock review feed */}
              <div className="space-y-2">
                {[
                  { name: "Sarah M.", rating: 5, text: "Amazing service, will definitely return!", replied: true },
                  { name: "James K.", rating: 2, text: "Waited too long. Staff not attentive.", replied: false },
                  { name: "Priya S.", rating: 4, text: "Good experience overall, minor issues with…", replied: true },
                ].map((r) => (
                  <div key={r.name} className="flex items-start gap-3 rounded-xl bg-white/3 border border-white/8 px-4 py-3">
                    <div className="w-7 h-7 rounded-full bg-[oklch(0.55_0.24_280)/30%] flex items-center justify-center text-xs font-bold text-[oklch(0.80_0.18_280)] flex-shrink-0">
                      {r.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-white/80">{r.name}</span>
                        <span className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-2.5 h-2.5 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-white/20"}`} />
                          ))}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/40 truncate">{r.text}</p>
                    </div>
                    <div className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${r.replied ? "bg-green-500/15 text-green-400" : "bg-[oklch(0.55_0.24_280)/20%] text-[oklch(0.80_0.18_280)]"}`}>
                      {r.replied ? "Replied" : "AI Draft"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Glow under mockup */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-[oklch(0.55_0.24_280)] blur-[60px] opacity-15 rounded-full" />
      </motion.div>
    </section>
  )
}
