"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AuthStep } from "@/components/onboarding/AuthStep"
import { ConnectGMBStep } from "@/components/onboarding/ConnectGMBStep"
import { LocationSelectStep } from "@/components/onboarding/LocationSelectStep"
import { ProcessingStep } from "@/components/onboarding/ProcessingStep"
import { Zap, Check } from "lucide-react"

const STEPS = ["auth", "connect", "locations", "processing"]
const STEP_LABELS = {
  auth: "Account",
  connect: "Connect",
  locations: "Locations",
  processing: "Setup",
}

function StepIndicator({ current }) {
  const visibleSteps = STEPS.slice(0, 3)
  return (
    <div className="flex items-center gap-2">
      {visibleSteps.map((s, i) => {
        const stepIndex = STEPS.indexOf(s)
        const currentIndex = STEPS.indexOf(current)
        const isComplete = stepIndex < currentIndex
        const isActive = stepIndex === currentIndex
        return (
          <div key={s} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`flex size-6 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                  isComplete
                    ? "bg-[oklch(0.55_0.24_280)] text-white shadow-sm shadow-[oklch(0.55_0.24_280)/40%]"
                    : isActive
                    ? "bg-[oklch(0.55_0.24_280)/15%] text-[oklch(0.75_0.20_280)] ring-1 ring-[oklch(0.55_0.24_280)/50%]"
                    : "bg-white/6 text-white/30"
                }`}
              >
                {isComplete ? <Check className="size-3" strokeWidth={2.5} /> : i + 1}
              </div>
              <span
                className={`text-xs font-medium transition-colors ${
                  isActive ? "text-white/80" : isComplete ? "text-white/50" : "text-white/25"
                }`}
              >
                {STEP_LABELS[s]}
              </span>
            </div>
            {i < visibleSteps.length - 1 && (
              <div
                className={`h-px w-6 transition-colors ${
                  isComplete ? "bg-[oklch(0.55_0.24_280)]" : "bg-white/10"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

const variants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

export default function OnboardingPage() {
  const [step, setStep] = useState("auth")
  const [selectedLocations, setSelectedLocations] = useState([])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("gmb_connected") === "true") {
      setStep("locations")
      window.history.replaceState({}, "", window.location.pathname)
    }
    if (localStorage.getItem("retilo_token")) {
      const current = new URLSearchParams(window.location.search).get("gmb_connected")
      if (!current) setStep("connect")
    }
  }, [])

  const isProcessing = step === "processing"

  return (
    <div className="min-h-screen bg-[oklch(0.09_0.012_270)] flex flex-col">
      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(oklch(1 0 0 / 100%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 100%) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Radial glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, oklch(0.55 0.24 280) 0%, transparent 70%)" }}
        />
      </div>

      {isProcessing && <ProcessingStep locations={selectedLocations} />}

      {!isProcessing && (
        <>
          {/* Top bar */}
          <header className="relative z-10 flex h-16 items-center justify-between border-b border-white/6 bg-[oklch(0.09_0.012_270)/80%] backdrop-blur-sm px-6">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-xl bg-[oklch(0.55_0.24_280)] shadow-lg shadow-[oklch(0.55_0.24_280)/35%]">
                <Zap className="size-4 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold text-white tracking-tight">Retilo</span>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-[oklch(0.65_0.20_280)]">GMB Platform</span>
              </div>
            </div>
            <StepIndicator current={step} />
          </header>

          {/* Card */}
          <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
            <div className="w-full max-w-[400px]">
              {/* Card wrapper */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="rounded-2xl border border-white/10 bg-[oklch(0.12_0.015_270)] p-7 shadow-2xl shadow-black/50"
                >
                  {step === "auth" && <AuthStep onNext={() => setStep("connect")} dark />}
                  {step === "connect" && <ConnectGMBStep dark />}
                  {step === "locations" && (
                    <LocationSelectStep
                      onNext={(locs) => {
                        setSelectedLocations(locs)
                        setStep("processing")
                      }}
                      dark
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              <p className="mt-5 text-center text-[11px] text-white/20 tracking-wide">
                Retilo · Enterprise retail intelligence platform
              </p>
            </div>
          </main>
        </>
      )}
    </div>
  )
}
