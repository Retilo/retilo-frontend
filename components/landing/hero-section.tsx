"use client"

import { useMemo } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight, MapPin, Star, Phone, Webhook, MessageSquare, Bot } from "lucide-react"
import { LogoCloudAnimation } from "@/components/logo-cloud-animation"

const CALENDLY = "https://calendly.com/satwikloka321/retilo?month=2026-03"

// Wrap icon in a colored circle matching LogoCloudAnimation button style
function IntIcon({ Icon, color, bg }: { Icon: React.ElementType; color: string; bg: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center" style={{ background: bg }}>
      <Icon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-10 lg:w-10" style={{ color }} strokeWidth={1.8} />
    </div>
  )
}

export function HeroSection() {
  const integrationButtons = useMemo(
    () => [
      {
        label: "Google Business",
        description: "Sync all GMB locations, reviews, and rank data in real time.",
        icon: <IntIcon Icon={MapPin} color="#4285F4" bg="#4285F418" />,
        iconShape: <IntIcon Icon={MapPin} color="#4285F440" bg="#4285F408" />,
      },
      {
        label: "Social Media",
        description: "Instagram, Facebook, and WhatsApp in one AI-powered inbox.",
        icon: <IntIcon Icon={MessageSquare} color="#E1306C" bg="#E1306C18" />,
        iconShape: <IntIcon Icon={MessageSquare} color="#E1306C40" bg="#E1306C08" />,
      },
      {
        label: "Telephony",
        description: "Log calls, send post-call SMS review requests automatically.",
        icon: <IntIcon Icon={Phone} color="#0A7D4B" bg="#0A7D4B18" />,
        iconShape: <IntIcon Icon={Phone} color="#0A7D4B40" bg="#0A7D4B08" />,
      },
      {
        label: "Webhooks",
        description: "Connect any CRM, POS, or loyalty system via webhooks.",
        icon: <IntIcon Icon={Webhook} color="#7C3AED" bg="#7C3AED18" />,
        iconShape: <IntIcon Icon={Webhook} color="#7C3AED40" bg="#7C3AED08" />,
      },
      {
        label: "Reviews",
        description: "AI-generated review replies that match your brand voice.",
        icon: <IntIcon Icon={Star} color="#F59E0B" bg="#F59E0B18" />,
        iconShape: <IntIcon Icon={Star} color="#F59E0B40" bg="#F59E0B08" />,
      },
      {
        label: "AI Agents",
        description: "Autonomous agents that monitor and respond across all touchpoints.",
        icon: <IntIcon Icon={Bot} color="oklch(0.55 0.24 350)" bg="oklch(0.58 0.24 350 / 12%)" />,
        iconShape: <IntIcon Icon={Bot} color="oklch(0.58 0.24 350 / 40%)" bg="oklch(0.58 0.24 350 / 5%)" />,
      },
    ],
    []
  )

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white px-4 pt-20 pb-10 sm:pt-16 sm:pb-12">
      {/* Soft radial glow */}
      <div aria-hidden className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[900px] h-[500px]"
        style={{ background: "radial-gradient(ellipse 60% 55% at 50% 0%, oklch(0.58 0.24 350 / 8%) 0%, transparent 70%)" }} />
      {/* Dot grid */}
      <div aria-hidden className="absolute inset-0 opacity-[0.035]"
        style={{ backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">

          {/* ── Left: copy ───────────────────────────────── */}
          <div className="flex-shrink-0 w-full lg:max-w-[480px] text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ background: "oklch(0.58 0.24 350 / 10%)", color: "oklch(0.48 0.24 350)", border: "1px solid oklch(0.58 0.24 350 / 20%)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.58_0.24_350)] animate-pulse" />
              The Retail Intelligence Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[1.8rem] sm:text-4xl lg:text-5xl xl:text-[3.4rem] font-black tracking-tight text-gray-900 leading-[1.1] mb-4"
            >
              Retail runs on<br />
              <span style={{ color: "oklch(0.58 0.24 350)" }}>intelligence,</span><br />
              not guesswork
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[1.05rem] text-gray-500 leading-relaxed mb-8"
            >
              Retilo is building the operating layer for modern retail — from warehouse ops to customer experience. Starting with CX: one platform to unify reviews, rankings, and every touchpoint at scale.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-3 justify-center lg:justify-start"
            >
              <a
                href={CALENDLY} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white text-sm shadow-lg transition-all hover:-translate-y-0.5"
                style={{ background: "oklch(0.58 0.24 350)", boxShadow: "0 8px 24px oklch(0.58 0.24 350 / 30%)" }}
              >
                Book a demo <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/auth"
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-gray-700 text-sm border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Start free
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-6 flex items-center gap-4 sm:gap-6 text-xs text-gray-400 justify-center lg:justify-start flex-wrap"
            >
              {[{ value: "4.9★", label: "avg rating lift" }, { value: "10×", label: "ops efficiency" }, { value: "94%", label: "review response rate" }]
                .map(({ value, label }) => (
                  <div key={label}>
                    <span className="font-bold text-gray-700 text-sm">{value}</span>{" "}<span>{label}</span>
                  </div>
                ))}
            </motion.div>
          </div>

          {/* ── Right: integration orbit cloud ───────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-1 w-full lg:max-w-[500px] h-80 sm:h-96 lg:h-125"
          >
            <LogoCloudAnimation buttons={integrationButtons}>
              <div className="text-center px-6">
                <p className="font-black text-2xl text-gray-900 tracking-tight leading-snug mb-1">
                  All your signals.<br />One brain.
                </p>
                <p className="text-sm text-gray-400">
                  Click any channel to explore
                </p>
              </div>
            </LogoCloudAnimation>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
