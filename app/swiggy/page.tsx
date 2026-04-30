"use client"

import { motion } from "motion/react"
import { Phone, ShoppingBag, Zap, Lock, ArrowRight, Mic, ClipboardList } from "lucide-react"
import { MarketingWaitlistMinimal } from "@/components/marketing-waitlist-minimal"
import {
  OrganicCard,
  OrganicCardBody,
  OrganicCardBand,
  OrganicCardEyebrow,
  OrganicCardTitle,
  OrganicCardDescription,
  OrganicCardFooter,
  OrganicCardFooterLabel,
  OrganicCardFooterIcon,
} from "@/components/organic-card"

const ORANGE = "#FC8019"

// ── Call flow visualization ───────────────────────────────────────

function CallFlowDiagram() {
  const steps = [
    { icon: Phone,         label: "Customer calls",        sub: "Any phone number" },
    { icon: Mic,           label: "AI answers + takes order", sub: "Natural conversation" },
    { icon: Lock,          label: "OTP via Swiggy MCP",    sub: "Seamless auth" },
    { icon: ClipboardList, label: "Order placed on Swiggy", sub: "Auto-confirmed" },
  ]

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 mt-5">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-2">
          <div className="flex flex-col items-center text-center">
            <div
              className="size-10 rounded-xl flex items-center justify-center mb-1.5 shadow-sm"
              style={{ background: i === 0 ? `${ORANGE}18` : "oklch(0.96 0.003 50)", border: `1px solid ${i === 0 ? `${ORANGE}30` : "oklch(0.91 0.005 50)"}` }}
            >
              <step.icon className="size-4" style={{ color: i === 0 ? ORANGE : "#6b7280" }} />
            </div>
            <p className="text-[10px] font-semibold text-gray-700 leading-tight max-w-[72px]">{step.label}</p>
            <p className="text-[9px] text-gray-400 mt-0.5">{step.sub}</p>
          </div>
          {i < steps.length - 1 && (
            <ArrowRight className="size-3 text-gray-300 shrink-0 mb-4 hidden sm:block" />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Live call transcript preview ──────────────────────────────────

function CallTranscript() {
  const lines = [
    { speaker: "Customer", text: "Hi, I'd like to order a Chicken Biryani and 2 Masala Cokes.", right: false },
    { speaker: "AI",       text: "Got it! Logging into your Swiggy account — you'll get an OTP now.", right: true },
    { speaker: "Customer", text: "It's 4 8 2 1.", right: false },
    { speaker: "AI",       text: "Order placed! Estimated delivery in 35 min. Anything else?", right: true },
  ]

  return (
    <div className="mt-5 space-y-2 rounded-xl bg-gray-50 border border-gray-100 p-4">
      {lines.map((l) => (
        <div key={l.text} className={`flex ${l.right ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-[80%] rounded-2xl px-3 py-2 text-[11px] leading-snug ${
              l.right
                ? "rounded-tr-sm text-white"
                : "rounded-tl-sm bg-white border border-gray-100 text-gray-700"
            }`}
            style={l.right ? { background: ORANGE } : {}}
          >
            <span className="font-semibold block mb-0.5 opacity-70" style={{ fontSize: 9 }}>
              {l.speaker}
            </span>
            {l.text}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── MCP auth flow preview ─────────────────────────────────────────

function McpAuthPreview() {
  return (
    <div className="mt-5 rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="size-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[11px] font-semibold text-gray-700">Swiggy MCP · Connected</span>
      </div>
      <div className="space-y-1.5">
        {[
          { label: "auth.request_otp",    status: "called", color: "#16a34a" },
          { label: "auth.verify_otp",     status: "verified", color: "#16a34a" },
          { label: "orders.create",       status: "placed",   color: ORANGE },
        ].map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between rounded-lg px-3 py-1.5 border"
            style={{ background: `${r.color}08`, borderColor: `${r.color}20` }}
          >
            <code className="text-[10px] text-gray-600">{r.label}</code>
            <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: r.color }}>{r.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Order confirmation preview ────────────────────────────────────

function OrderConfirmPreview() {
  return (
    <div className="mt-5 rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between" style={{ background: `${ORANGE}0a` }}>
        <span className="text-[11px] font-bold text-gray-800">Order #SWG-4821</span>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: ORANGE }}>Confirmed</span>
      </div>
      <div className="bg-white p-4 space-y-2">
        {[
          { item: "Chicken Biryani", qty: 1, price: "₹299" },
          { item: "Masala Coke",     qty: 2, price: "₹120" },
        ].map((r) => (
          <div key={r.item} className="flex items-center justify-between text-[11px]">
            <span className="text-gray-600">{r.qty}× {r.item}</span>
            <span className="font-semibold text-gray-800">{r.price}</span>
          </div>
        ))}
        <div className="pt-2 border-t border-gray-100 flex justify-between text-[11px] font-bold">
          <span className="text-gray-800">Total</span>
          <span style={{ color: ORANGE }}>₹419</span>
        </div>
        <p className="text-[10px] text-gray-400 pt-1">Est. delivery: 35 min · Auto-placed via Retilo Voice AI</p>
      </div>
    </div>
  )
}

// ── Card definitions ─────────────────────────────────────────────

const CARDS = [
  {
    bg: "#fff8f3",
    eyebrow: "Voice AI",
    title: "Customers call. AI takes the order.",
    description:
      "Your restaurant gets a dedicated AI-powered number. Customers call, describe what they want in plain speech, and the AI handles the rest — menu lookup, upsells, confirmation.",
    preview: <CallTranscript />,
    footer: "See live transcript",
    wide: true,
  },
  {
    bg: "#f3fff8",
    eyebrow: "Swiggy MCP",
    title: "OTP auth + order placement via MCP",
    description:
      "Retilo connects to Swiggy's MCP layer — requesting OTP during the call, verifying it in real time, then placing the order directly on the customer's Swiggy account.",
    preview: <McpAuthPreview />,
    footer: "Swiggy MCP integration",
    wide: false,
  },
  {
    bg: "#fff3f8",
    eyebrow: "Order management",
    title: "Every call becomes a Swiggy order",
    description:
      "No app required. Customers skip the Swiggy UI entirely — the AI places a verified order on their behalf, and it lands in your kitchen just like any other order.",
    preview: <OrderConfirmPreview />,
    footer: "View order flow",
    wide: false,
  },
]

// ── Page ─────────────────────────────────────────────────────────

export default function SwiggyPromoPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <div className="border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        <div
          className="size-7 rounded-lg flex items-center justify-center text-white font-black text-sm"
          style={{ background: ORANGE }}
        >
          S
        </div>
        <span className="font-bold text-gray-900 text-sm">Retilo × Swiggy</span>
        <span className="ml-auto text-xs text-gray-400">Private Beta · Builders Club</span>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-12 px-4">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse 80% 50% at 50% -10%, ${ORANGE}0e, transparent 65%)` }}
        />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold mb-6"
              style={{ borderColor: `${ORANGE}35`, color: ORANGE, background: `${ORANGE}0d` }}
            >
              <ShoppingBag className="size-3.5" />
              Built for Swiggy Builders Club
            </div>

            <h1
              className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 mb-5 leading-[1.07]"
              style={{ letterSpacing: "-0.03em" }}
            >
              Restaurants get orders<br />
              <span style={{ color: ORANGE }}>from a phone call</span>
            </h1>

            <p className="text-gray-500 text-lg leading-relaxed max-w-xl mx-auto mb-10">
              Retilo's Voice AI answers customer calls, authenticates via Swiggy MCP, and places the
              order — no app, no friction, no missed calls.
            </p>

            {/* Call flow */}
            <div className="inline-block mx-auto">
              <CallFlowDiagram />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cards */}
      <section className="px-4 pb-20 pt-8">
        <div className="max-w-5xl mx-auto space-y-5">

          {/* Wide card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="w-full"
          >
            <OrganicCard backgroundColor={CARDS[0].bg} className="max-w-full">
              <OrganicCardBody>
                <div>
                  <OrganicCardEyebrow
                    className="opacity-100"
                    style={{ color: ORANGE, animationDelay: "0ms" }}
                  >
                    {CARDS[0].eyebrow}
                  </OrganicCardEyebrow>
                  <OrganicCardTitle className="opacity-100" style={{ animationDelay: "0ms" }}>
                    {CARDS[0].title}
                  </OrganicCardTitle>
                  <OrganicCardDescription className="opacity-100" style={{ animationDelay: "0ms" }}>
                    {CARDS[0].description}
                  </OrganicCardDescription>
                </div>
                {CARDS[0].preview}
              </OrganicCardBody>
              <OrganicCardBand />
              <OrganicCardFooter>
                <OrganicCardFooterLabel className="opacity-100" style={{ animationDelay: "0ms" }}>
                  {CARDS[0].footer}
                </OrganicCardFooterLabel>
                <OrganicCardFooterIcon
                  className="opacity-100"
                  style={{ background: ORANGE, animationDelay: "0ms" }}
                />
              </OrganicCardFooter>
            </OrganicCard>
          </motion.div>

          {/* Two cards side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CARDS.slice(1).map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.09 }}
                className="w-full"
              >
                <OrganicCard backgroundColor={card.bg} className="max-w-full">
                  <OrganicCardBody>
                    <div>
                      <OrganicCardEyebrow
                        className="opacity-100"
                        style={{ color: ORANGE, animationDelay: "0ms" }}
                      >
                        {card.eyebrow}
                      </OrganicCardEyebrow>
                      <OrganicCardTitle className="opacity-100" style={{ animationDelay: "0ms" }}>
                        {card.title}
                      </OrganicCardTitle>
                      <OrganicCardDescription className="opacity-100" style={{ animationDelay: "0ms" }}>
                        {card.description}
                      </OrganicCardDescription>
                    </div>
                    {card.preview}
                  </OrganicCardBody>
                  <OrganicCardBand />
                  <OrganicCardFooter>
                    <OrganicCardFooterLabel className="opacity-100" style={{ animationDelay: "0ms" }}>
                      {card.footer}
                    </OrganicCardFooterLabel>
                    <OrganicCardFooterIcon
                      className="opacity-100"
                      style={{ background: ORANGE, animationDelay: "0ms" }}
                    />
                  </OrganicCardFooter>
                </OrganicCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why it matters strip */}
      <section className="px-4 pb-20">
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-2xl p-6 border grid grid-cols-3 gap-6 text-center"
            style={{ background: `${ORANGE}07`, borderColor: `${ORANGE}1e` }}
          >
            {[
              { stat: "0",    unit: "apps needed",     sub: "customer side" },
              { stat: "< 2s", unit: "OTP round-trip",  sub: "via Swiggy MCP" },
              { stat: "24/7", unit: "call coverage",   sub: "AI never sleeps" },
            ].map((s) => (
              <div key={s.stat}>
                <div className="text-2xl font-black" style={{ color: ORANGE }}>{s.stat}</div>
                <div className="text-xs font-semibold text-gray-700 mt-0.5">{s.unit}</div>
                <div className="text-[10px] text-gray-400">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section className="px-4 pb-28">
        <div className="max-w-lg mx-auto">
          <div className="rounded-3xl border border-gray-100 bg-gray-50/50 p-10 text-center">
            <MarketingWaitlistMinimal
              headline="Get early access"
              subtext="We're onboarding Swiggy restaurants in batches. Drop your email and we'll reach out when your slot opens."
              placeholder="restaurant@example.com"
              buttonLabel="Request access"
              successMessage="You're in — we'll be in touch!"
              accentColor={ORANGE}
              count={89}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="border-t border-gray-100 px-6 py-5 text-center">
        <p className="text-xs text-gray-400">
          <span className="font-semibold text-gray-600">Retilo</span> · AI calling infrastructure for Swiggy restaurants · Built for Builders Club 2026
        </p>
      </div>

    </div>
  )
}
