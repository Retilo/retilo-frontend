"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight, MapPin, Star, Phone, Webhook, MessageSquare, Bot, Mail, Check, Loader2, TrendingUp } from "lucide-react"

const CALENDLY = "https://calendly.com/satwikloka321/retilo?month=2026-03"

// ── Retilo-specific signal feed (replaces generic AppLogs) ────────────────────

const SIGNAL_LOGS = [
  { time: "00:12", type: "review",   badge: "★",   badgeColor: "#f59e0b", status: 5,    path: "New 5★ Google review" },
  { time: "00:09", type: "reply",    badge: "AI",  badgeColor: "#7c3aed", status: 200,  path: "AI reply sent" },
  { time: "00:07", type: "rank",     badge: "↑3",  badgeColor: "#22c55e", status: 200,  path: "/keyword/rank +3" },
  { time: "00:02", type: "campaign", badge: "SMS", badgeColor: "#0ea5e9", status: 200,  path: "Review request sent" },
]

const TOP_TOUCHPOINTS = [
  { name: "Google Business", visitors: 12_840, pct: 100, color: "#4285F4" },
  { name: "WhatsApp",        visitors:  5_210, pct: 40,  color: "#25d366" },
  { name: "Email",           visitors:  3_882, pct: 30,  color: "#7c3aed" },
  { name: "SMS / Telephony", visitors:  2_140, pct: 17,  color: "#f59e0b" },
  { name: "Social Media",    visitors:  1_090, pct: 8,   color: "#e1306c" },
]

const VISIBILITY_STATS = [
  { label: "AI Score", value: "—/100", note: "Check yours →" },
  { label: "ChatGPT", value: "✓", note: "crawling" },
  { label: "Perplexity", value: "✗", note: "blocked" },
]

// ── Floating card: Signal feed ────────────────────────────────────────────────

function SignalFeedCard() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 500); return () => clearTimeout(t) }, [])
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(14px)",
      filter: visible ? "blur(0)" : "blur(4px)",
      transition: "all 500ms cubic-bezier(0.23,1,0.32,1)",
      background: "white",
      borderRadius: 12,
      border: "1px solid rgba(0,0,0,0.08)",
      boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)",
      overflow: "hidden",
      width: 268,
    }}>
      <div style={{ padding: "10px 14px 6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#111", letterSpacing: "-0.01em" }}>Signal Feed</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, color: "#22c55e", fontWeight: 600 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse 2s infinite" }} />
          Live
        </span>
      </div>
      <div style={{ padding: "2px 8px 10px" }}>
        {SIGNAL_LOGS.map((log) => (
          <div key={`${log.time}-${log.path}`} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 6px", borderRadius: 6, fontSize: 11 }}>
            <span style={{ fontFamily: "ui-monospace, monospace", color: "#9ca3af", width: 32, flexShrink: 0, fontSize: 10 }}>{log.time}</span>
            <span style={{ width: 22, height: 22, borderRadius: 5, border: "1px solid rgba(0,0,0,0.08)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "white", flexShrink: 0, background: log.badgeColor }}>{log.badge}</span>
            <span style={{ fontSize: 11, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.path}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Floating card: Top touchpoints ────────────────────────────────────────────

function TouchpointsCard() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 680); return () => clearTimeout(t) }, [])
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateX(0)" : "translateX(16px)",
      filter: visible ? "blur(0)" : "blur(4px)",
      transition: "all 500ms cubic-bezier(0.23,1,0.32,1)",
      background: "white",
      borderRadius: 12,
      border: "1px solid rgba(0,0,0,0.08)",
      boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)",
      overflow: "hidden",
      width: 240,
    }}>
      <div style={{ padding: "10px 14px 6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#111", letterSpacing: "-0.01em" }}>Touchpoints</span>
        <span style={{ fontSize: 11, color: "#9ca3af" }}>Signals</span>
      </div>
      <div style={{ padding: "2px 8px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {TOP_TOUCHPOINTS.map((tp) => (
          <div key={tp.name} style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "5px 6px", borderRadius: 5 }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${tp.pct}%`, background: `${tp.color}10`, borderRadius: 5 }} />
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: tp.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "#4b5563", whiteSpace: "nowrap" }}>{tp.name}</span>
            </div>
            <span style={{ position: "relative", fontSize: 11, color: "#6b7280", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{tp.visitors.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Floating card: AI Visibility teaser ──────────────────────────────────────

function VisibilityTeaserCard() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 300); return () => clearTimeout(t) }, [])
  return (
    <Link href="/visibility" style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(-12px)",
      filter: visible ? "blur(0)" : "blur(4px)",
      transition: "all 500ms cubic-bezier(0.23,1,0.32,1)",
      background: "linear-gradient(135deg, #301c2a 0%, #1a0d22 100%)",
      borderRadius: 12,
      border: "1px solid rgba(253,91,255,0.25)",
      boxShadow: "0 4px 24px rgba(253,91,255,0.15), 0 0 0 1px rgba(253,91,255,0.1)",
      overflow: "hidden",
      padding: "10px 14px",
      display: "block",
      width: 220,
      cursor: "pointer",
      textDecoration: "none",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#FD5BFF", letterSpacing: "0.03em", textTransform: "uppercase" }}>AI Visibility</span>
        <span style={{ fontSize: 9, color: "rgba(244,248,232,0.4)", fontWeight: 500 }}>Free scan →</span>
      </div>
      {VISIBILITY_STATS.map((s) => (
        <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span style={{ fontSize: 10, color: "rgba(244,248,232,0.5)" }}>{s.label}</span>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: s.value === "✗" ? "#ef4444" : s.value === "✓" ? "#22c55e" : "#FD5BFF" }}>{s.value}</span>
            <span style={{ fontSize: 9, color: "rgba(244,248,232,0.3)", marginLeft: 4 }}>{s.note}</span>
          </div>
        </div>
      ))}
    </Link>
  )
}

// ── Main hero section ─────────────────────────────────────────────────────────

export function HeroSection() {
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
              Retilo is building the operating layer for modern retail — from warehouse ops to customer experience. One platform to unify reviews, AI visibility, rankings, and every touchpoint at scale.
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

          {/* ── Right: floating signal cards ─────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-1 w-full lg:max-w-[520px] relative"
            style={{ minHeight: 380 }}
          >
            {/* Background glow */}
            <div aria-hidden className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, oklch(0.58 0.24 350 / 6%) 0%, transparent 70%)" }} />

            {/* Grid lines backdrop */}
            <div aria-hidden className="absolute inset-0 rounded-3xl overflow-hidden opacity-40 pointer-events-none"
              style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

            {/* AI Visibility teaser — top center */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
              <VisibilityTeaserCard />
            </div>

            {/* Signal feed — bottom left */}
            <div className="absolute bottom-4 left-0 z-20">
              <SignalFeedCard />
            </div>

            {/* Touchpoints — mid right */}
            <div className="absolute top-1/2 -translate-y-1/2 right-0 z-20">
              <TouchpointsCard />
            </div>

            {/* Center orb */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-xl"
                style={{ background: "white", border: "2px solid oklch(0.91 0.01 270)" }}
              >
                <Bot className="w-8 h-8 mb-0.5" style={{ color: "oklch(0.58 0.24 350)" }} />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Retilo</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
