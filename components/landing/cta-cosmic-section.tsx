"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { ArrowRight, Calendar } from "lucide-react"

const CALENDLY = "https://calendly.com/satwikloka321/retilo?month=2026-03"

const SOCIAL_PROOF = [
  { initials: "SM", bg: "oklch(0.65 0.26 280)" },
  { initials: "JK", bg: "oklch(0.60 0.20 160)" },
  { initials: "PL", bg: "oklch(0.70 0.18 55)" },
  { initials: "AW", bg: "oklch(0.65 0.22 30)" },
  { initials: "RC", bg: "oklch(0.60 0.20 310)" },
]

export function CtaSection() {
  return (
    <section className="py-28 px-4 bg-white relative overflow-hidden">
      {/* Soft gradient bg */}
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, oklch(0.58 0.24 350 / 6%) 0%, transparent 70%)" }} />
      <div aria-hidden className="pointer-events-none absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(to right, transparent, oklch(0.58 0.24 350 / 20%), transparent)" }} />

      <div className="max-w-2xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Social proof avatars */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex -space-x-2 mr-3">
              {SOCIAL_PROOF.map(({ initials, bg }) => (
                <div
                  key={initials}
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: bg }}
                >
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              Trusted by <span className="font-semibold text-gray-700">200+ retail brands</span>
            </p>
          </div>

          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-5">
            The future of retail<br />
            <span style={{ color: "oklch(0.58 0.24 350)" }}>starts here</span>
          </h2>
          <p className="text-gray-500 mb-10 text-lg leading-relaxed">
            Book a 30-minute demo and see why Retilo is becoming the intelligence layer retail teams can't operate without.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={CALENDLY}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-white text-sm transition-all hover:-translate-y-0.5"
              style={{ background: "oklch(0.58 0.24 350)", boxShadow: "0 8px 24px oklch(0.58 0.24 350 / 30%)" }}
            >
              <Calendar className="w-4 h-4" />
              Book a demo
            </a>
            <Link
              href="/auth"
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-gray-700 text-sm border border-gray-200 bg-white hover:bg-gray-50 transition-all"
            >
              Start free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="mt-6 text-xs text-gray-400">No credit card required · Setup in under 5 minutes</p>
        </motion.div>
      </div>
    </section>
  )
}
