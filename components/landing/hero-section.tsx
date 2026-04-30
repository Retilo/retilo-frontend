"use client"

import { useReducedMotion, motion, type Variants } from "motion/react"
import { ArrowRight, Zap } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import MarqueeAlongSvgPath from "@/components/ribbon"
import { OrganicShapeBadge } from "@/components/organic-shape-badge"
import { OrganicButton } from "@/components/organic-button"

const CALENDLY = "https://calendly.com/satwikloka321/retilo?month=2026-03"

// ── Retilo platform tiles for the ribbon ──────────────────────────────────────

function tileSvg(inner: string): string {
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">${inner}</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`
}

const RETILO_TILES = [
  {
    alt: "Google Business",
    src: tileSvg(`<rect width="128" height="128" fill="#4285F4"/><text x="64" y="84" text-anchor="middle" font-size="72" font-weight="800" fill="white" font-family="system-ui,sans-serif">G</text><text x="64" y="110" text-anchor="middle" font-size="14" fill="rgba(255,255,255,0.7)" font-family="system-ui,sans-serif">Business</text>`),
  },
  {
    alt: "ChatGPT",
    src: tileSvg(`<rect width="128" height="128" fill="#10a37f"/><text x="64" y="78" text-anchor="middle" font-size="28" font-weight="700" fill="white" font-family="ui-monospace,monospace">GPT-4</text><text x="64" y="104" text-anchor="middle" font-size="13" fill="rgba(255,255,255,0.65)" font-family="system-ui,sans-serif">ChatGPT</text>`),
  },
  {
    alt: "WhatsApp",
    src: tileSvg(`<rect width="128" height="128" fill="#25d366"/><text x="64" y="82" text-anchor="middle" font-size="52" font-weight="800" fill="white" font-family="system-ui,sans-serif">WA</text><text x="64" y="108" text-anchor="middle" font-size="13" fill="rgba(255,255,255,0.7)" font-family="system-ui,sans-serif">WhatsApp</text>`),
  },
  {
    alt: "Claude AI",
    src: tileSvg(`<rect width="128" height="128" fill="#c96442"/><text x="64" y="82" text-anchor="middle" font-size="64" font-weight="900" fill="#FFDDCC" font-family="Georgia,serif">C</text><text x="64" y="108" text-anchor="middle" font-size="13" fill="rgba(255,221,204,0.7)" font-family="system-ui,sans-serif">Claude</text>`),
  },
  {
    alt: "AI Reply Engine",
    src: tileSvg(`<rect width="128" height="128" fill="#1a0a2e"/><text x="64" y="72" text-anchor="middle" font-size="34" font-weight="800" fill="#FD5BFF" font-family="system-ui,sans-serif">AI</text><text x="64" y="98" text-anchor="middle" font-size="13" fill="rgba(253,91,255,0.7)" font-family="system-ui,sans-serif">Auto-Reply</text>`),
  },
  {
    alt: "Perplexity",
    src: tileSvg(`<rect width="128" height="128" fill="#20808d"/><text x="64" y="82" text-anchor="middle" font-size="64" font-weight="800" fill="white" font-family="system-ui,sans-serif">P</text><text x="64" y="108" text-anchor="middle" font-size="13" fill="rgba(255,255,255,0.65)" font-family="system-ui,sans-serif">Perplexity</text>`),
  },
  {
    alt: "Star Reviews",
    src: tileSvg(`<rect width="128" height="128" fill="#1c1917"/><text x="64" y="68" text-anchor="middle" font-size="26" fill="#f59e0b" font-family="system-ui,sans-serif">★★★★★</text><text x="64" y="92" text-anchor="middle" font-size="14" fill="rgba(245,158,11,0.8)" font-family="ui-monospace,monospace">4.9 avg</text><text x="64" y="112" text-anchor="middle" font-size="12" fill="rgba(255,255,255,0.3)" font-family="system-ui,sans-serif">Reviews</text>`),
  },
  {
    alt: "Email",
    src: tileSvg(`<rect width="128" height="128" fill="#7c3aed"/><text x="64" y="82" text-anchor="middle" font-size="64" font-weight="700" fill="white" font-family="system-ui,sans-serif">@</text><text x="64" y="108" text-anchor="middle" font-size="13" fill="rgba(255,255,255,0.65)" font-family="system-ui,sans-serif">Email</text>`),
  },
  {
    alt: "SMS Campaigns",
    src: tileSvg(`<rect width="128" height="128" fill="#0ea5e9"/><text x="64" y="78" text-anchor="middle" font-size="38" font-weight="800" fill="white" font-family="system-ui,sans-serif">SMS</text><text x="64" y="104" text-anchor="middle" font-size="13" fill="rgba(255,255,255,0.65)" font-family="system-ui,sans-serif">Campaigns</text>`),
  },
  {
    alt: "Retilo Platform",
    src: tileSvg(`<rect width="128" height="128" fill="#301c2a"/><circle cx="64" cy="55" r="24" fill="none" stroke="#FD5BFF" stroke-width="5"/><text x="64" y="102" text-anchor="middle" font-size="16" font-weight="700" fill="#FD5BFF" font-family="system-ui,sans-serif">Retilo</text><text x="64" y="62" text-anchor="middle" font-size="14" font-weight="700" fill="#FD5BFF" font-family="system-ui,sans-serif">R</text>`),
  },
  {
    alt: "Google AI",
    src: tileSvg(`<rect width="128" height="128" fill="#e8eaed"/><text x="64" y="60" text-anchor="middle" font-size="22" font-weight="700" fill="#4285F4" font-family="system-ui,sans-serif">Google</text><text x="64" y="88" text-anchor="middle" font-size="22" font-weight="700" fill="#ea4335" font-family="system-ui,sans-serif">AI</text><text x="64" y="112" text-anchor="middle" font-size="12" fill="#9aa0a6" font-family="system-ui,sans-serif">Search</text>`),
  },
  {
    alt: "Instagram",
    src: tileSvg(`<rect width="128" height="128" fill="#833ab4"/><text x="64" y="80" text-anchor="middle" font-size="50" font-weight="800" fill="white" font-family="system-ui,sans-serif">IG</text><text x="64" y="108" text-anchor="middle" font-size="13" fill="rgba(255,255,255,0.65)" font-family="system-ui,sans-serif">Instagram</text>`),
  },
  {
    alt: "Swiggy",
    src: tileSvg(`<rect width="128" height="128" fill="#FC8019"/><text x="64" y="72" text-anchor="middle" font-size="44" font-weight="900" fill="white" font-family="system-ui,sans-serif">S</text><text x="64" y="104" text-anchor="middle" font-size="14" font-weight="700" fill="rgba(255,255,255,0.85)" font-family="system-ui,sans-serif">Swiggy</text>`),
  },
] as const

/** Cubic Bézier ribbon path — same as marketing-hero-ribbon */
const RIBBON_PATH =
  "M1 209.434C58.5872 255.935 387.926 325.938 482.583 209.434C600.905 63.8051 525.516 -43.2211 427.332 19.9613C329.149 83.1436 352.902 242.723 515.041 267.302C644.752 286.966 943.56 181.94 995 156.5"

// ── Main hero section ─────────────────────────────────────────────────────────

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion()
  const initial = shouldReduceMotion ? "visible" : "hidden"

  const staggerContainer: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.06 } },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
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
        <div className="grid flex-1 grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-10 lg:py-16 xl:gap-14">

          {/* ── Left: copy ─────────────────────────────────── */}
          <motion.div
            animate="visible"
            className="mx-auto w-full max-w-2xl text-center lg:mx-0 lg:max-w-none lg:pr-4 lg:text-left"
            initial={initial}
            variants={staggerContainer}
          >
            <motion.div className="mb-6 lg:mx-0" variants={itemVariants}>
              <OrganicShapeBadge
                icon={<Zap aria-hidden className="organic-badge-icon stroke-[1.75]" />}
                label="Retail Intelligence Platform"
                size="sm"
                variantColor="light"
              />
            </motion.div>

            <motion.h1
              className="mb-4 text-balance font-black tracking-tight text-gray-900 leading-[1.08]"
              style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", letterSpacing: "-0.035em" }}
              variants={itemVariants}
            >
              Retail runs on{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, oklch(0.58 0.24 350) 0%, oklch(0.52 0.30 350) 100%)",
                }}
              >
                intelligence,
              </span>
              <br />
              not guesswork
            </motion.h1>

            <motion.p
              className="mx-auto mb-8 max-w-lg text-pretty text-gray-500 leading-relaxed sm:text-base lg:mx-0"
              style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.075rem)" }}
              variants={itemVariants}
            >
              Retilo is building the operating layer for modern retail — from warehouse ops to customer
              experience. One platform to unify reviews, AI visibility, rankings, and every touchpoint at scale.
            </motion.p>

            <motion.div
              className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 lg:justify-start"
              variants={itemVariants}
            >
              <OrganicButton
                animationSpeed="fast"
                href={CALENDLY}
                icon={<ArrowRight className="organic-icon stroke-2 transition-transform duration-100 group-hover/organic:translate-x-0.5" />}
                label="Book a demo"
                size="lg"
                variantColor="primary"
              />
              <Link
                href="/auth"
                className={cn(
                  "inline-flex h-14 items-center justify-center px-6 text-base font-semibold",
                  "rounded-full border border-gray-200 bg-white text-gray-700",
                  "transition-all hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                Start free
              </Link>
            </motion.div>

            <motion.div
              className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-gray-400 lg:justify-start"
              variants={itemVariants}
            >
              {[
                { value: "4.9★", label: "avg rating lift" },
                { value: "10×", label: "ops efficiency" },
                { value: "94%", label: "review response rate" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <span className="font-bold text-gray-700 text-sm">{value}</span>{" "}
                  <span>{label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right: ribbon of platform tiles ──────────────── */}
          <div
            aria-hidden
            className={cn(
              "-translate-x-6 sm:-translate-x-8 lg:-translate-x-14 xl:-translate-x-20",
              "relative z-5 min-h-[min(42vh,320px)] w-full shrink-0 rotate-45 select-none",
              "sm:min-h-[min(40vh,360px)] lg:max-h-[min(72vh,600px)] lg:min-h-[min(64vh,520px)]"
            )}
          >
            <MarqueeAlongSvgPath
              baseVelocity={5.5}
              className="h-full w-full text-muted-foreground/20"
              path={RIBBON_PATH}
              repeat={4}
              responsive
              slowDownFactor={0.28}
              slowdownOnHover
              viewBox="0 -50 1000 390"
              zIndexBase={1}
              zIndexRange={12}
            >
              {RETILO_TILES.map((tile) => (
                <div
                  className="size-15 shrink-0 overflow-hidden rounded-[2px] shadow-sm ring-1 ring-black/6 sm:size-16"
                  key={tile.alt}
                >
                  <img
                    alt={tile.alt}
                    className="size-full object-cover"
                    decoding="async"
                    draggable={false}
                    height={128}
                    loading="lazy"
                    src={tile.src}
                    width={128}
                  />
                </div>
              ))}
            </MarqueeAlongSvgPath>
          </div>

        </div>
      </div>
    </section>
  )
}
