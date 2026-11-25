"use client"

import { motion, useInView, useReducedMotion } from "motion/react"
import { useRef } from "react"
import { ArrowRight, CalendarCheck, CheckCircle2, Zap } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const CALENDLY = "https://calendly.com/satwikloka321/retilo?month=2026-03"

/* ── Booking-flow visualization ───────────────────────────────────── */

type Step = { label: string; sub: string; icon: string; accent: string }

const FLOW_STEPS: Step[] = [
  { label: "Guest request",   sub: "WhatsApp / Web / QR",          icon: "💬", accent: "#25d366" },
  { label: "Retilo AI",       sub: "Intent → availability check",   icon: "🤖", accent: "#6366f1" },
  { label: "Swiggy Dineout",  sub: "Real-time slot confirmation",   icon: "🍽️", accent: "#FC8019" },
  { label: "Booked",          sub: "Lands in your dashboard",       icon: "✅", accent: "#22c55e" },
]

function FlowDiagram({ reduce }: { reduce: boolean }) {
  return (
    <div className="relative mx-auto w-full max-w-sm space-y-2.5">
      {FLOW_STEPS.map((step, i) => (
        <div key={step.label} className="relative">
          {i < FLOW_STEPS.length - 1 && (
            <div className="absolute left-5 top-full z-0 h-2.5 w-px bg-gray-200" />
          )}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 24 }}
            className="relative z-10 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg shadow-sm"
              style={{ background: `${step.accent}18`, border: `1.5px solid ${step.accent}30` }}
            >
              {step.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900">{step.label}</p>
              <p className="text-[11px] text-gray-400">{step.sub}</p>
            </div>
            {!reduce && i > 0 && i < FLOW_STEPS.length - 1 && (
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: step.accent,
                  animation: `swiggy-pulse 1.6s ease-in-out ${i * 0.3}s infinite`,
                }}
              />
            )}
            {i === FLOW_STEPS.length - 1 && (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
            )}
          </motion.div>
        </div>
      ))}

      <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3">
        <span className="text-[11px] font-medium text-orange-700">Official integration</span>
        <span className="text-orange-300">·</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brands/swiggy-logo-square.svg" alt="Swiggy" className="h-5 w-5 rounded-[4px]" />
        <span className="text-[11px] font-semibold text-orange-700">Swiggy Dineout</span>
      </div>

      <style>{`
        @keyframes swiggy-pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.9); }
          50%       { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}

/* ── Stat chips ───────────────────────────────────────────────────── */

const STATS = [
  { value: "#1",      label: "dining-out platform in India" },
  { value: "50K+",    label: "Swiggy Dineout restaurants" },
  { value: "1-line",  label: "swap to live Swiggy API" },
  { value: "< 2 s",   label: "booking confirmation" },
]

/* ── Main section ─────────────────────────────────────────────────── */

export function SwiggyDineoutSection() {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const reduce = useReducedMotion()

  return (
    <section
      ref={ref}
      id="swiggy-dineout"
      className="relative overflow-hidden py-24 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,oklch(0.75_0.18_50/0.07),transparent_65%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* header */}
        <div className="mb-14 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brands/swiggy-logo-square.svg" alt="Swiggy" className="h-4 w-4 rounded-[3px]" />
            <span className="text-xs font-semibold text-orange-700">Official Swiggy Dineout Partner</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.07 }}
            className="mx-auto max-w-3xl text-3xl font-black tracking-tight text-gray-900 sm:text-5xl"
            style={{ letterSpacing: "-0.03em" }}
          >
            India&apos;s first AI booking layer,
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #FC8019 0%, #e65c00 100%)" }}
            >
              powered by Swiggy Dineout.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.14 }}
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-500 sm:text-lg"
          >
            Retilo sits as an intelligent booking agent on top of Swiggy Dineout&apos;s
            reservation network — turning every WhatsApp message, QR scan, or website
            visit into a confirmed table in under 2 seconds.
          </motion.p>
        </div>

        {/* stats bar */}
        <div className="mb-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
              className="rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm"
            >
              <p className="text-2xl font-black text-gray-900 sm:text-3xl" style={{ letterSpacing: "-0.04em" }}>
                {s.value}
              </p>
              <p className="mt-1 text-xs text-gray-400">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* two-col: flow + copy */}
        <div className="grid items-center gap-14 lg:grid-cols-2">

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <FlowDiagram reduce={!!reduce} />
          </motion.div>

          <div className="lg:pl-6">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.12 }}
              className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-gray-400"
            >
              How it works
            </motion.p>

            <motion.h3
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.19 }}
              className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl"
              style={{ letterSpacing: "-0.03em" }}
            >
              Your AI receptionist, backed
              <br />by India&apos;s largest dining network.
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.26 }}
              className="mt-4 text-base leading-relaxed text-gray-500"
            >
              When a diner asks for a table — via WhatsApp, your website, or a
              QR on the table — Retilo&apos;s AI agent reads intent, checks live slots
              through the Swiggy Dineout MCP, and confirms the booking without
              any human in the loop.
            </motion.p>

            <ul className="mt-6 space-y-3">
              {[
                "Zero typing for guests — party size, date, time all tappable",
                "Bookings land instantly in your Swiggy Dineout dashboard",
                "AI handles rescheduling, cancellations and follow-ups",
                "One-line swap from stub to live Swiggy API in production",
              ].map((point, i) => (
                <motion.li
                  key={point}
                  initial={{ opacity: 0, x: -8 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.35, delay: 0.3 + i * 0.08 }}
                  className="flex items-start gap-3 text-sm text-gray-600"
                >
                  <Zap
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: "#FC8019" }}
                  />
                  {point}
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <a
                href="https://book.retilo.io/demo"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-all",
                  "shadow-sm hover:shadow-md hover:brightness-105"
                )}
                style={{ background: "linear-gradient(135deg, #FC8019 0%, #e65c00 100%)" }}
              >
                Try live demo
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href={CALENDLY}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
              >
                <CalendarCheck className="h-4 w-4" />
                Book a demo
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="mt-4 text-xs text-gray-400"
            >
              Retilo is an official Swiggy Builders Club integration partner.
            </motion.p>
          </div>
        </div>

      </div>
    </section>
  )
}
