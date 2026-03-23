"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Star } from "lucide-react"

// -----------------------------------------------------------------
// COSMIC CTA — inspired by cult-ui marketing-cta-cosmic
// -----------------------------------------------------------------

// Deterministic star positions (no Math.random to avoid hydration mismatch)
const STARS = [
  { x: 8, y: 15, size: 1, opacity: 0.6 }, { x: 15, y: 45, size: 1.5, opacity: 0.4 },
  { x: 22, y: 72, size: 1, opacity: 0.7 }, { x: 30, y: 25, size: 2, opacity: 0.3 },
  { x: 38, y: 60, size: 1, opacity: 0.5 }, { x: 45, y: 10, size: 1.5, opacity: 0.6 },
  { x: 52, y: 80, size: 1, opacity: 0.4 }, { x: 60, y: 35, size: 2, opacity: 0.3 },
  { x: 67, y: 68, size: 1, opacity: 0.7 }, { x: 73, y: 20, size: 1.5, opacity: 0.5 },
  { x: 80, y: 55, size: 1, opacity: 0.4 }, { x: 88, y: 82, size: 2, opacity: 0.3 },
  { x: 93, y: 30, size: 1, opacity: 0.6 }, { x: 5, y: 88, size: 1.5, opacity: 0.4 },
  { x: 96, y: 65, size: 1, opacity: 0.5 }, { x: 42, y: 92, size: 1.5, opacity: 0.35 },
  { x: 18, y: 5,  size: 1, opacity: 0.5 }, { x: 75, y: 90, size: 1, opacity: 0.4 },
]

const SOCIAL_PROOF = [
  { initials: "SM", color: "oklch(0.65_0.26_280)" },
  { initials: "JK", color: "oklch(0.60_0.20_160)" },
  { initials: "PL", color: "oklch(0.70_0.18_55)" },
  { initials: "AW", color: "oklch(0.65_0.22_30)" },
  { initials: "RC", color: "oklch(0.60_0.20_310)" },
]

export function CtaCosmicSection() {
  return (
    <section className="relative overflow-hidden bg-[oklch(0.07_0.010_270)] py-32 px-4">
      {/* Stars */}
      {STARS.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
          }}
          animate={{ opacity: [s.opacity, s.opacity * 0.3, s.opacity] }}
          transition={{
            duration: 2 + (i % 4),
            repeat: Infinity,
            delay: (i % 6) * 0.5,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Cosmic orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
        style={{
          background: "radial-gradient(ellipse at center, oklch(0.55 0.24 280 / 25%) 0%, oklch(0.45 0.20 310 / 15%) 40%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/4 w-64 h-64 rounded-full blur-[80px] opacity-20"
        style={{ background: "oklch(0.55 0.24 280)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-1/4 w-48 h-48 rounded-full blur-[60px] opacity-15"
        style={{ background: "oklch(0.60 0.20 310)" }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Stars rating */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-1 mb-6"
        >
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl font-bold text-white tracking-tight leading-[1.05] mb-6"
        >
          Ready to automate
          <br />
          <span className="gradient-text">your reputation?</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-white/50 mb-10 leading-relaxed max-w-xl mx-auto"
        >
          Join hundreds of multi-location businesses that use Retilo to
          automate Google Business replies, surface insights, and grow their
          online reputation on autopilot.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12"
        >
          <Link
            href="/auth"
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[oklch(0.55_0.24_280)] hover:bg-[oklch(0.60_0.26_280)] text-white font-semibold text-sm transition-all glow-purple hover:scale-[1.02]"
          >
            Start for free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/12 bg-white/4 hover:bg-white/8 text-white/70 hover:text-white font-medium text-sm transition-all"
          >
            Book a demo
          </Link>
        </motion.div>

        {/* Social proof avatars */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center justify-center gap-3"
        >
          <div className="flex items-center">
            {SOCIAL_PROOF.map((p, i) => (
              <div
                key={p.initials}
                className="w-8 h-8 rounded-full border-2 border-[oklch(0.07_0.010_270)] flex items-center justify-center text-xs font-bold text-white"
                style={{
                  background: p.color,
                  marginLeft: i > 0 ? "-8px" : 0,
                  zIndex: SOCIAL_PROOF.length - i,
                  position: "relative",
                }}
              >
                {p.initials}
              </div>
            ))}
          </div>
          <p className="text-sm text-white/40">
            <span className="text-white/70 font-medium">500+</span> locations managed on Retilo
          </p>
        </motion.div>
      </div>
    </section>
  )
}
