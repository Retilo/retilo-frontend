"use client"

import {
  StatsGlobeRoot,
  StatsGlobeBackground,
  StatsGlobeContainer,
  StatsGlobeVisual,
  StatsGlobeHeading,
  AnimatedCounter,
  type StatsGlobeMarker,
  type StatsGlobeArc,
} from "@/components/stats-globe"
import { motion, useInView } from "motion/react"
import { useRef } from "react"

// ── AI platform HQ markers on the globe ───────────────────────────────────────

const MARKERS: StatsGlobeMarker[] = [
  { id: "sf",        label: "San Francisco",  location: [37.7749, -122.4194], size: 0.09 },
  { id: "seattle",   label: "Seattle",        location: [47.6062, -122.3321], size: 0.065 },
  { id: "london",    label: "London",         location: [51.5074, -0.1278],   size: 0.062 },
  { id: "tokyo",     label: "Tokyo",          location: [35.6762, 139.6503],  size: 0.062 },
  { id: "sydney",    label: "Sydney",         location: [-33.8688, 151.2093], size: 0.055 },
  { id: "saopaulo",  label: "São Paulo",      location: [-23.5505, -46.6333], size: 0.058 },
  { id: "dubai",     label: "Dubai",          location: [25.2048, 55.2708],   size: 0.055 },
  { id: "singapore", label: "Singapore",      location: [1.3521, 103.8198],   size: 0.058 },
]

const ARCS: StatsGlobeArc[] = [
  { id: "arc-sf-london",    from: [37.7749, -122.4194], to: [51.5074, -0.1278]   },
  { id: "arc-sf-tokyo",     from: [37.7749, -122.4194], to: [35.6762, 139.6503]  },
  { id: "arc-london-dubai", from: [51.5074, -0.1278],   to: [25.2048, 55.2708]   },
  { id: "arc-dubai-sg",     from: [25.2048, 55.2708],   to: [1.3521, 103.8198]   },
]

// ── Platform logos (inline SVG) ────────────────────────────────────────────────

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-label="Google">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function OpenAILogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#10a37f" aria-label="ChatGPT">
      <path d="M22.28 9.98a5.47 5.47 0 0 0-.47-4.49 5.53 5.53 0 0 0-5.95-2.65A5.5 5.5 0 0 0 11.71 1a5.53 5.53 0 0 0-5.27 3.83 5.5 5.5 0 0 0-3.67 2.66 5.54 5.54 0 0 0 .68 6.49 5.47 5.47 0 0 0 .47 4.49 5.53 5.53 0 0 0 5.95 2.65A5.5 5.5 0 0 0 14.29 23a5.53 5.53 0 0 0 5.27-3.83 5.5 5.5 0 0 0 3.67-2.66 5.54 5.54 0 0 0-.95-6.53zm-8.27 11.56a4.1 4.1 0 0 1-2.63-.95l.13-.07 4.37-2.52a.72.72 0 0 0 .36-.63v-6.15l1.85 1.07a.07.07 0 0 1 .04.05v5.1a4.12 4.12 0 0 1-4.12 4.1zM3.9 18.13a4.1 4.1 0 0 1-.49-2.75l.13.08 4.37 2.52a.71.71 0 0 0 .72 0l5.34-3.08v2.13a.07.07 0 0 1-.03.06L9.5 19.64a4.13 4.13 0 0 1-5.6-1.5zm-1.07-9.5A4.1 4.1 0 0 1 5 6.27v5.18a.71.71 0 0 0 .36.62l5.33 3.08-1.85 1.07a.07.07 0 0 1-.07 0L4.4 13.7a4.12 4.12 0 0 1-1.57-5.07zm15.22 3.54-5.34-3.08 1.85-1.07a.07.07 0 0 1 .07 0l4.37 2.52a4.12 4.12 0 0 1-.64 7.42V12.8a.72.72 0 0 0-.31-.63zm1.84-2.77-.13-.08-4.37-2.52a.72.72 0 0 0-.72 0L9.33 9.88V7.75a.07.07 0 0 1 .03-.06l4.37-2.52a4.12 4.12 0 0 1 6.16 4.23zM8.4 12.85l-1.85-1.06a.07.07 0 0 1-.04-.06V6.63a4.12 4.12 0 0 1 6.75-3.16l-.13.07-4.37 2.53a.72.72 0 0 0-.36.62zm1-2.16 2.38-1.37 2.37 1.37v2.74L11.77 15l-2.37-1.37z"/>
    </svg>
  )
}

function AnthropicLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-label="Claude">
      <rect width="24" height="24" rx="4" fill="#c96442"/>
      <text x="12" y="17" textAnchor="middle" fontSize="14" fontWeight="900" fill="#FFDDCC" fontFamily="Georgia,serif">C</text>
    </svg>
  )
}

function PerplexityLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-label="Perplexity">
      <rect width="24" height="24" rx="4" fill="#20808d"/>
      <text x="12" y="17" textAnchor="middle" fontSize="14" fontWeight="800" fill="white" fontFamily="system-ui,sans-serif">P</text>
    </svg>
  )
}

// ── Platform stat cards ────────────────────────────────────────────────────────

const PLATFORM_STATS = [
  {
    logo: <GoogleLogo />,
    name: "Google AI",
    metric: 6100000,
    suffix: "+",
    label: "daily AI search queries",
    color: "#4285F4",
    bg: "rgba(66,133,244,0.07)",
    border: "rgba(66,133,244,0.18)",
  },
  {
    logo: <OpenAILogo />,
    name: "ChatGPT",
    metric: 4800000,
    suffix: "+",
    label: "daily brand lookups",
    color: "#10a37f",
    bg: "rgba(16,163,127,0.07)",
    border: "rgba(16,163,127,0.18)",
  },
  {
    logo: <AnthropicLogo />,
    name: "Claude",
    metric: 2200000,
    suffix: "+",
    label: "daily cite checks",
    color: "#c96442",
    bg: "rgba(201,100,66,0.07)",
    border: "rgba(201,100,66,0.18)",
  },
  {
    logo: <PerplexityLogo />,
    name: "Perplexity",
    metric: 1900000,
    suffix: "+",
    label: "daily source queries",
    color: "#20808d",
    bg: "rgba(32,128,141,0.07)",
    border: "rgba(32,128,141,0.18)",
  },
]

// ── Section ────────────────────────────────────────────────────────────────────

export function GlobeStatsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <StatsGlobeRoot className="bg-transparent" ref={ref as React.Ref<HTMLElement>}>
      {/* Custom dark background — replaces StatsGlobeBackground which forces bg-background (white) */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0" style={{ background: "#0d0914" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 50% at 30% 60%, rgba(253,91,255,0.08) 0%, transparent 60%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 50% 40% at 70% 40%, rgba(201,100,66,0.06) 0%, transparent 60%)" }} />
      </div>

      <StatsGlobeContainer className="gap-10 py-16 md:py-20 overflow-x-hidden">

        {/* Heading */}
        <StatsGlobeHeading>
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(253,91,255,0.7)" }}>AI Search is already happening</p>
            <h2
              className="font-black text-balance mb-4"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.8rem)", letterSpacing: "-0.035em", lineHeight: 1.08, color: "#fff" }}
            >
              Millions of queries —{" "}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #FD5BFF 0%, #c96442 100%)" }}>
                is your brand answering?
              </span>
            </h2>
            <p className="text-base max-w-xl mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              Every day, customers ask ChatGPT, Claude, Perplexity, and Google AI about businesses like yours. 67% of brands aren't showing up at all.
            </p>
          </div>
        </StatsGlobeHeading>

        {/* Globe + platform stats grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">

          {/* Globe */}
          <div className="w-full flex items-center justify-center min-w-0">
            <StatsGlobeVisual markers={MARKERS} arcs={ARCS} globeSize={380} className="w-full max-w-[380px]" />
          </div>

          {/* Platform stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" ref={ref}>
            {PLATFORM_STATS.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                className="rounded-2xl p-5"
                style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${p.border}`, backdropFilter: "blur(12px)" }}
              >
                {/* Platform header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.12)" }}>
                    {p.logo}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>{p.name}</span>
                </div>

                {/* Animated counter */}
                <div
                  className="font-black tabular-nums leading-none mb-1"
                  style={{ fontSize: "clamp(1.5rem, 2.5vw, 1.9rem)", color: p.color, letterSpacing: "-0.03em" }}
                >
                  <AnimatedCounter target={p.metric} suffix={p.suffix} />
                </div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{p.label}</div>
              </motion.div>
            ))}
          </div>

        </div>

        {/* Bottom CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
        >
          <p className="text-sm text-center" style={{ color: "rgba(255,255,255,0.5)" }}>
            Find out which engines can see your brand —
          </p>
          <a
            href="/visibility"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #FD5BFF, #7928ca)", boxShadow: "0 4px 20px rgba(253,91,255,0.3)" }}
          >
            Run free scan →
          </a>
        </motion.div>

      </StatsGlobeContainer>
    </StatsGlobeRoot>
  )
}
