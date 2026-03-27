"use client"

import { motion, useInView } from "motion/react"
import { useRef } from "react"
import { Mail, Sparkles, ArrowRight, CheckCircle2, Zap } from "lucide-react"
import Link from "next/link"

const TOOL_STEPS = [
  { id: 1, label: "generate_copy", desc: "Subject lines, headline, body, CTA written by AI", color: "#7C3AED", done: true },
  { id: 2, label: "build_template", desc: "MJML email rendered to pixel-perfect HTML", color: "#4285F4", done: true },
  { id: 3, label: "save_campaign", desc: "Campaign + recipients persisted in database", color: "#0A7D4B", done: true },
  { id: 4, label: "trigger_send", desc: "Batch delivery via Resend, open rates tracked", color: "#F59E0B", done: false },
]

const STATS = [
  { value: "< 60s", label: "Brief → sent" },
  { value: "MJML", label: "Email design" },
  { value: "Open tracked", label: "Per recipient" },
  { value: "GPT-4o", label: "Copy engine" },
]

export function EmailAgentSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <section className="py-24 px-4 bg-white border-t border-zinc-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Left: copy */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex-1 max-w-lg"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
              <Sparkles className="size-3" />
              New — Email Campaign AI Agent
            </div>

            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight mb-4 leading-[1.1]">
              E-commerce emails<br />
              <span className="text-violet-600">that write themselves</span>
            </h2>

            <p className="text-gray-500 leading-relaxed mb-6">
              Calling all AI builders in e-commerce — Retilo's Email Campaign Agent handles the full copywriting workflow. Describe your campaign brief in plain English, and the AI generates subject lines, body copy, and a pixel-perfect MJML template, then delivers at scale.
            </p>

            <ul className="space-y-3 mb-8">
              {[
                "GPT-4o powered copywriting for high-stakes campaigns",
                "MJML rendering — beautiful on every email client",
                "Async delivery via Resend with per-recipient tracking",
                "Open rate analytics back in your dashboard",
              ].map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <CheckCircle2 className="size-4 text-violet-500 mt-0.5 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/email/agent"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600 text-white font-semibold text-sm shadow-lg shadow-violet-200 hover:-translate-y-0.5 transition-all"
              >
                <Sparkles className="size-4" />
                Launch Email Agent
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/email"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-zinc-200 text-zinc-700 font-semibold text-sm hover:bg-zinc-50 transition-all"
              >
                Learn more
              </Link>
            </div>
          </motion.div>

          {/* Right: agent UI preview */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex-1 w-full max-w-md"
          >
            <div className="rounded-2xl border border-zinc-200 bg-[oklch(0.985_0.003_270)] p-1 shadow-xl">
              {/* Window chrome */}
              <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
                {/* Title bar */}
                <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="size-2.5 rounded-full bg-red-400" />
                    <div className="size-2.5 rounded-full bg-yellow-400" />
                    <div className="size-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="rounded-md bg-zinc-50 border border-zinc-200 px-3 py-1 text-[11px] text-zinc-400 font-mono">
                      retilo.io/email/agent
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  {/* Brief input */}
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Campaign Brief</p>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      Flash sale — 30% off sneakers this weekend. Audience: past buyers aged 18–35. Tone: urgent and energetic. Include a countdown CTA.
                    </p>
                  </div>

                  {/* Tool steps */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Agent progress</p>
                    {TOOL_STEPS.map((step) => (
                      <div
                        key={step.id}
                        className="flex items-center gap-2.5 rounded-lg p-2.5"
                        style={{ background: step.done ? `${step.color}08` : `${step.color}05`, border: `1px solid ${step.color}20` }}
                      >
                        <div
                          className="flex size-5 items-center justify-center rounded-full shrink-0"
                          style={{ background: step.done ? step.color : "transparent", border: step.done ? "none" : `1.5px solid ${step.color}` }}
                        >
                          {step.done ? (
                            <CheckCircle2 className="size-3 text-white" />
                          ) : (
                            <Zap className="size-3" style={{ color: step.color }} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-mono font-semibold" style={{ color: step.color }}>
                            {step.label}
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate">{step.desc}</p>
                        </div>
                        {!step.done && (
                          <span className="shrink-0 rounded-full text-[9px] font-bold px-1.5 py-0.5 text-white animate-pulse"
                            style={{ background: step.color }}>
                            Running
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats below card */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              {STATS.map((s) => (
                <div key={s.label} className="rounded-xl border border-zinc-200 bg-white p-3 text-center shadow-sm">
                  <p className="text-sm font-black text-zinc-900">{s.value}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
