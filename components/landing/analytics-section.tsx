"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"
import { TrendingUp, Zap } from "lucide-react"
import { AnalyticsLineChart, type AnalyticsDataPoint, type AnalyticsGradientStop } from "@/components/analytics-chart"
import { OrganicShapeBadge } from "@/components/organic-shape-badge"
import { AnimatedCounter } from "@/components/stats-globe"

const SCORE_DATA: AnalyticsDataPoint[] = [
  { date: "2024-08-01", label: "visibility score", value: 18 },
  { date: "2024-09-01", label: "visibility score", value: 24 },
  { date: "2024-10-01", label: "visibility score", value: 31 },
  { date: "2024-11-01", label: "visibility score", value: 47 },
  { date: "2024-12-01", label: "visibility score", value: 58 },
  { date: "2025-01-01", label: "visibility score", value: 72 },
  { date: "2025-02-01", label: "visibility score", value: 91 },
]

const GRADIENT: AnalyticsGradientStop[] = [
  { offset: "0%",   color: "#ef4444" },
  { offset: "35%",  color: "#f59e0b" },
  { offset: "65%",  color: "#84cc16" },
  { offset: "100%", color: "#22c55e" },
]

const STATS = [
  { value: 73,   suffix: " pts", label: "avg score gain",          sub: "18 → 91 over 6 months" },
  { value: 3.1,  suffix: "×",    label: "more AI citations",        sub: "after full fix playbook", decimals: 1 },
  { value: 60,   suffix: "s",    label: "to first visibility score", sub: "free, no card needed" },
]

export function AnalyticsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section className="bg-white py-16 md:py-20 px-4 md:px-8 lg:px-10" ref={ref}>
      <div className="max-w-5xl mx-auto">

        <motion.div
          className="max-w-2xl mb-12"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
        >
          <OrganicShapeBadge
            className="mb-5"
            icon={<TrendingUp aria-hidden className="organic-badge-icon stroke-[1.75]" />}
            label="Proven Results"
            size="sm"
            variantColor="light"
          />
          <h2
            className="font-black tracking-tight text-gray-900 text-balance mb-3"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.6rem)", letterSpacing: "-0.03em", lineHeight: 1.1 }}
          >
            From invisible to{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" }}
            >
              fully cited
            </span>
          </h2>
          <p className="text-gray-500 text-base leading-relaxed max-w-lg">
            Brands that act on their Retilo fix playbook see their AI visibility score climb from near zero to 90+ — tracked every step of the way.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-8 items-start">

          {/* Chart card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-2xl bg-white overflow-hidden"
            style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 24px rgba(0,0,0,0.06)" }}
          >
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <div>
                <p className="text-sm font-semibold text-gray-800">AI Visibility Score</p>
                <p className="text-xs text-gray-400 mt-0.5">Aug 2024 — Feb 2025</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a", border: "1px solid rgba(34,197,94,0.2)" }}>
                <TrendingUp className="w-3 h-3" />
                +73 pts
              </span>
            </div>
            <div className="px-4 pt-6 pb-4">
              {inView && (
                <AnalyticsLineChart
                  data={SCORE_DATA}
                  gradientStops={GRADIENT}
                  gridLines={5}
                  height={220}
                  pinnedIndices={[0, 6]}
                  valueLabel="/ 100"
                  className="w-full"
                />
              )}
            </div>
          </motion.div>

          {/* Stat cards with animated counters */}
          <div className="flex flex-col gap-3 lg:pt-2">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: 16 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className="rounded-2xl p-5 bg-white"
                style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}
              >
                <div
                  className="font-black leading-none mb-1"
                  style={{ fontSize: "clamp(1.8rem, 3vw, 2.2rem)", color: "#111827", letterSpacing: "-0.03em" }}
                >
                  <AnimatedCounter
                    target={stat.value}
                    suffix={stat.suffix}
                    decimals={stat.decimals ?? 0}
                  />
                </div>
                <div className="text-xs font-semibold text-gray-700 leading-tight">{stat.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{stat.sub}</div>
              </motion.div>
            ))}

            <motion.a
              href="/visibility"
              initial={{ opacity: 0, x: 16 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="rounded-2xl p-5 flex items-center gap-3 transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #1a0a2e, #2d1055)", border: "1px solid rgba(253,91,255,0.2)", boxShadow: "0 4px 20px rgba(26,10,46,0.25)" }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(253,91,255,0.18)", border: "1px solid rgba(253,91,255,0.25)" }}>
                <Zap className="w-4 h-4" style={{ color: "#FD5BFF" }} />
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: "rgba(255,221,204,0.9)" }}>Scan your site free</p>
                <p className="text-xs" style={{ color: "rgba(255,221,204,0.4)" }}>Get your score in 60s →</p>
              </div>
            </motion.a>
          </div>

        </div>
      </div>
    </section>
  )
}
