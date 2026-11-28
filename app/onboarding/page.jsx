"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "motion/react"
import { AuthStep } from "@/components/onboarding/AuthStep"
import { ConnectGMBStep } from "@/components/onboarding/ConnectGMBStep"
import { LocationSelectStep } from "@/components/onboarding/LocationSelectStep"
import { ProcessingStep } from "@/components/onboarding/ProcessingStep"
import { Zap, Check } from "lucide-react"

// ── Pain options ──────────────────────────────────────────────────────────────

const PAIN_OPTIONS = [
  {
    id: "calls",
    emoji: "📞",
    title: "I miss calls all day",
    desc: "Calls go unanswered during rush hours",
    fix: "AI receptionist answers every call, takes orders, books tables",
    color: "#3b82f6",
    bg: "#eff6ff",
  },
  {
    id: "commission",
    emoji: "💸",
    title: "Swiggy/Zomato fees are killing me",
    desc: "30% commission on every delivery",
    fix: "Take orders directly — zero commission, full control",
    color: "#FC8019",
    bg: "#fff7ed",
  },
  {
    id: "reviews",
    emoji: "⭐",
    title: "Bad reviews are hurting me",
    desc: "1-star reviews sit unanswered for days",
    fix: "AI replies to every Google review in your brand voice",
    color: "#f59e0b",
    bg: "#fffbeb",
  },
  {
    id: "all",
    emoji: "⚡",
    title: "All of the above",
    desc: "Missing calls, bad reviews, losing margin",
    fix: "Full Retilo setup — takes 3 minutes",
    color: "oklch(0.52 0.22 350)",
    bg: "oklch(0.97 0.012 350)",
  },
]

// ── Brand logos (inline SVG, no external deps) ────────────────────────────────

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57C21.36 18.09 22.56 15.27 22.56 12.25z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function SwiggyLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#FC8019"/>
      <path d="M9 9.5a3 3 0 1 1 6 0c0 2.5-3 5-3 5s-3-2.5-3-5z" fill="white"/>
      <circle cx="15.5" cy="14.5" r="2" fill="white" opacity="0.75"/>
    </svg>
  )
}

function WhatsAppLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#25D366"/>
      <path d="M17 14.5c-.3-.15-1.7-.84-2-.94-.3-.1-.5-.15-.7.15-.2.3-.8.94-1 1.14-.19.2-.38.22-.7.07-1.6-.8-2.65-1.9-3.3-3.3-.3-.6.3-.56.84-1.65.1-.2.05-.37-.02-.52L9.1 7.1c-.27-.64-.54-.55-.74-.56H7.8c-.2 0-.52.07-.8.37-.27.3-1.03 1-1.03 2.44s1.05 2.84 1.2 3.04c.14.2 2.07 3.16 5.02 4.43 1.76.76 2.45.82 3.33.69.53-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.11-.27-.18-.57-.32z" fill="white"/>
    </svg>
  )
}

function VoiceLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="oklch(0.58 0.24 350)"/>
      <path d="M8.5 7h.8c.2 0 .4.1.5.3l1.1 2.3c.1.2.1.5-.05.65l-.8.95c.55 1.1 1.4 1.95 2.5 2.5l.95-.8c.2-.15.45-.15.65-.05l2.3 1.1c.2.1.3.3.3.5v.75c0 .4-.3.75-.7.75C10.1 16 8 12.1 8 10.2c0-.4.3-.7.5-.7z" fill="white" fillRule="evenodd"/>
      <path d="M15.5 9.5a2 2 0 0 1 2 2" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
      <path d="M15.5 7a4 4 0 0 1 4 4" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
    </svg>
  )
}

const INTEGRATIONS = [
  { name: "Google",    Logo: GoogleLogo,   tagline: "Reviews & Maps" },
  { name: "Swiggy",   Logo: SwiggyLogo,   tagline: "Direct orders" },
  { name: "WhatsApp", Logo: WhatsAppLogo, tagline: "Guest messages" },
  { name: "Voice AI", Logo: VoiceLogo,    tagline: "Call receptionist" },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function IntegrationStrip() {
  return (
    <div className="flex items-center justify-center gap-5 py-4">
      {INTEGRATIONS.map(({ name, Logo, tagline }) => (
        <div key={name} className="flex flex-col items-center gap-1.5 group">
          <div className="rounded-xl p-2 bg-white border border-gray-100 shadow-sm transition-shadow group-hover:shadow-md">
            <Logo />
          </div>
          <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider leading-none">{name}</span>
          <span className="text-[9px] text-gray-300 leading-none">{tagline}</span>
        </div>
      ))}
    </div>
  )
}

function PainPickerStep({ onSelect }) {
  const [hovered, setHovered] = useState(null)

  return (
    <div className="w-full max-w-[540px] mx-auto px-2">
      {/* Headline */}
      <div className="text-center mb-2">
        <h1 className="text-[26px] font-bold leading-tight tracking-tight" style={{ color: "oklch(0.14 0.008 270)" }}>
          What's hurting your business<br />most right now?
        </h1>
        <p className="text-sm mt-2" style={{ color: "oklch(0.55 0.008 270)" }}>
          Pick one · we'll set up only what you need · takes 2 minutes
        </p>
      </div>

      {/* Integration banner */}
      <IntegrationStrip />

      {/* Divider */}
      <div className="h-px bg-gray-100 my-2" />

      {/* Pain cards */}
      <div className="grid grid-cols-2 gap-3 mt-5">
        {PAIN_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onMouseEnter={() => setHovered(opt.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect(opt)}
            className="text-left rounded-2xl border p-5 transition-all duration-150 outline-none focus-visible:ring-2"
            style={{
              borderColor: hovered === opt.id ? opt.color + "40" : "#e5e7eb",
              background: hovered === opt.id ? opt.bg : "white",
              transform: hovered === opt.id ? "translateY(-1px)" : "none",
              boxShadow: hovered === opt.id ? `0 4px 20px ${opt.color}20` : "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-xl transition-all"
              style={{ background: opt.bg }}
            >
              {opt.emoji}
            </div>
            <div
              className="text-sm font-semibold leading-snug mb-1 transition-colors"
              style={{ color: hovered === opt.id ? opt.color : "oklch(0.14 0.008 270)" }}
            >
              {opt.title}
            </div>
            <div className="text-[11px] leading-snug mb-2.5" style={{ color: "oklch(0.60 0.008 270)" }}>
              {opt.desc}
            </div>
            <div className="text-[11px] font-medium leading-snug" style={{ color: opt.color }}>
              → {opt.fix}
            </div>
          </button>
        ))}
      </div>

      <p className="text-center text-[11px] mt-5" style={{ color: "oklch(0.72 0.005 270)" }}>
        You can unlock more later · No credit card required
      </p>
    </div>
  )
}

function StepIndicator({ current }) {
  const steps = ["auth", "connect", "locations"]
  const labels = { auth: "Account", connect: "Connect", locations: "Locations" }
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const isComplete = steps.indexOf(s) < steps.indexOf(current)
        const isActive   = s === current
        return (
          <div key={s} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className="flex size-6 items-center justify-center rounded-full text-[10px] font-bold transition-all"
                style={
                  isComplete
                    ? { background: "oklch(0.58 0.24 350)", color: "white", boxShadow: "0 2px 8px oklch(0.58 0.24 350 / 30%)" }
                    : isActive
                    ? { background: "oklch(0.58 0.24 350 / 12%)", color: "oklch(0.48 0.24 350)" }
                    : { background: "#f3f4f6", color: "#d1d5db" }
                }
              >
                {isComplete ? <Check className="size-3" strokeWidth={2.5} /> : i + 1}
              </div>
              <span className={`text-xs font-medium ${isActive ? "text-gray-700" : isComplete ? "text-gray-400" : "text-gray-300"}`}>
                {labels[s]}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px w-5 ${isComplete ? "bg-[oklch(0.70_0.20_350)]" : "bg-gray-200"}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const variants = {
  enter:  { opacity: 0, y: 14 },
  center: { opacity: 1, y: 0  },
  exit:   { opacity: 0, y: -10 },
}

export default function OnboardingPage() {
  const [step, setStep] = useState("pain")
  const [selectedPain, setSelectedPain] = useState(null)
  const [selectedLocations, setSelectedLocations] = useState([])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("gmb_connected") === "true") {
      setStep("locations")
      window.history.replaceState({}, "", window.location.pathname)
      return
    }
    if (localStorage.getItem("retilo_token")) {
      setStep("connect")
    }
  }, [])

  const isProcessing = step === "processing"
  const isPain       = step === "pain"

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "oklch(0.985 0.003 270)" }}>
      {/* Dot grid + glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px]"
          style={{ background: "radial-gradient(ellipse 60% 55% at 50% 0%, oklch(0.58 0.24 350 / 8%) 0%, transparent 70%)" }}
        />
      </div>

      {isProcessing && <ProcessingStep locations={selectedLocations} />}

      {!isProcessing && (
        <>
          {/* Nav */}
          <header className="relative z-10 flex h-16 items-center justify-between border-b border-gray-200/80 bg-white/80 backdrop-blur-sm px-6">
            <div className="flex items-center gap-3">
              <div
                className="flex size-8 items-center justify-center rounded-xl"
                style={{ background: "oklch(0.58 0.24 350)", boxShadow: "0 4px 14px oklch(0.58 0.24 350 / 35%)" }}
              >
                <Zap className="size-4 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold tracking-tight" style={{ color: "oklch(0.14 0.008 270)" }}>Retilo</span>
                <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: "oklch(0.55 0.20 350)" }}>
                  Retail Intelligence
                </span>
              </div>
            </div>
            {!isPain && <StepIndicator current={step} />}
          </header>

          {/* Body */}
          <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
            <AnimatePresence mode="wait">
              {isPain ? (
                <motion.div
                  key="pain"
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="w-full"
                >
                  <PainPickerStep
                    onSelect={(pain) => {
                      setSelectedPain(pain)
                      setStep("auth")
                    }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={step}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="w-full max-w-[400px]"
                >
                  <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-lg shadow-gray-100/80">
                    {step === "auth"      && <AuthStep onNext={() => setStep("connect")} />}
                    {step === "connect"   && <ConnectGMBStep />}
                    {step === "locations" && (
                      <LocationSelectStep
                        onNext={(locs) => { setSelectedLocations(locs); setStep("processing") }}
                      />
                    )}
                  </div>

                  {/* Selected pain badge — shows context under the card */}
                  {step === "auth" && selectedPain && (
                    <div className="mt-4 flex justify-center">
                      <div
                        className="flex items-center gap-2 text-xs font-medium px-3.5 py-1.5 rounded-full"
                        style={{ background: selectedPain.bg, color: selectedPain.color }}
                      >
                        <span>{selectedPain.emoji}</span>
                        <span>{selectedPain.title}</span>
                      </div>
                    </div>
                  )}

                  <p className="mt-5 text-center text-[11px] tracking-wide" style={{ color: "oklch(0.72 0.005 270)" }}>
                    Retilo · Retail intelligence platform
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </>
      )}
    </div>
  )
}
