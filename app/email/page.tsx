"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { Mail, Sparkles, ArrowRight, Zap, BarChart3, Send, Clock } from "lucide-react"

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: <Mail className="size-5" />,
    title: "Describe your campaign",
    body: "Write a plain-English brief — audience, offer, tone. No templates, no forms.",
    color: "#7C3AED",
  },
  {
    step: "02",
    icon: <Sparkles className="size-5" />,
    title: "AI writes & designs",
    body: "The agent generates copy, subject lines, and a pixel-perfect MJML email template.",
    color: "#4285F4",
  },
  {
    step: "03",
    icon: <Send className="size-5" />,
    title: "Deliver & track",
    body: "Emails go out via Resend. Open rates and engagement tracked in real time.",
    color: "#0A7D4B",
  },
]

const STATS = [
  { value: "3 steps", label: "brief → sent" },
  { value: "< 60s", label: "generation time" },
  { value: "Open tracked", label: "per recipient" },
]

export default function EmailHomePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-14"
      >
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
          <span className="size-1.5 rounded-full bg-violet-500 animate-pulse" />
          AI-powered email campaigns for e-commerce
        </div>

        <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 mb-4 leading-[1.1]">
          Email campaigns that<br />
          <span className="text-violet-600">write themselves</span>
        </h1>

        <p className="text-lg text-zinc-500 max-w-xl mx-auto leading-relaxed mb-8">
          Describe your campaign in plain English. The AI agent handles copywriting, MJML design, and delivery — driving massive response rates for e-commerce.
        </p>

        <div className="flex items-center gap-3 justify-center">
          <Link
            href="/email/agent"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold text-sm shadow-lg shadow-violet-200 hover:-translate-y-0.5 transition-all"
          >
            <Sparkles className="size-4" />
            Launch Agent
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/email/campaigns"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-700 font-semibold text-sm hover:bg-zinc-50 transition-all"
          >
            <BarChart3 className="size-4" />
            View Campaigns
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-3 gap-4 mb-14"
      >
        {STATS.map((s) => (
          <div key={s.label} className="rounded-2xl border border-zinc-200 bg-white p-5 text-center shadow-sm">
            <p className="text-2xl font-black text-zinc-900 mb-0.5">{s.value}</p>
            <p className="text-xs text-zinc-400 font-medium">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-xl font-bold text-zinc-900 mb-6 text-center">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {HOW_IT_WORKS.map((step) => (
            <div
              key={step.step}
              className="rounded-2xl border border-zinc-200 bg-white p-6 hover:shadow-md transition-all group"
            >
              <div className="mb-4 flex items-center justify-between">
                <div
                  className="flex size-10 items-center justify-center rounded-xl text-white"
                  style={{ background: step.color }}
                >
                  {step.icon}
                </div>
                <span className="text-3xl font-black text-zinc-100">{step.step}</span>
              </div>
              <h3 className="font-bold text-zinc-900 mb-2">{step.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-10 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-8 text-center"
      >
        <Zap className="size-8 text-violet-500 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-zinc-900 mb-2">Ready to launch your first AI campaign?</h3>
        <p className="text-sm text-zinc-500 mb-5">
          Just describe your offer and audience. The agent does the rest.
        </p>
        <Link
          href="/email/agent"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold text-sm shadow-md shadow-violet-200 hover:-translate-y-0.5 transition-all"
        >
          <Sparkles className="size-4" />
          Start a Campaign
        </Link>
      </motion.div>
    </div>
  )
}
