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
                    ? "text-white shadow-sm"
                    : isActive
                    ? "ring-1 ring-[oklch(0.58_0.24_350)/50%]"
                    : "text-gray-300"
                }`}
                style={
                  isComplete
                    ? { background: "oklch(0.58 0.24 350)", boxShadow: "0 2px 8px oklch(0.58 0.24 350 / 30%)" }
                    : isActive
                    ? { background: "oklch(0.58 0.24 350 / 12%)", color: "oklch(0.48 0.24 350)" }
                    : { background: "#f3f4f6", color: "#d1d5db" }
                }
              >
                {isComplete ? <Check className="size-3" strokeWidth={2.5} /> : i + 1}
              </div>
              <span
                className={`text-xs font-medium transition-colors ${
                  isActive ? "text-gray-700" : isComplete ? "text-gray-400" : "text-gray-300"
                }`}
              >
                {STEP_LABELS[s]}
              </span>
            </div>
            {i < visibleSteps.length - 1 && (
              <div
                className={`h-px w-6 transition-colors ${
                  isComplete ? "bg-[oklch(0.70_0.20_350)]" : "bg-gray-200"
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
    <div className="min-h-screen bg-[oklch(0.985_0.003_270)] flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Soft pink radial glow at top */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 55% at 50% 0%, oklch(0.58 0.24 350 / 7%) 0%, transparent 70%)" }}
        />
      </div>

      {isProcessing && <ProcessingStep locations={selectedLocations} />}

      {!isProcessing && (
        <>
          {/* Top bar */}
          <header className="relative z-10 flex h-16 items-center justify-between border-b border-gray-200/80 bg-white/80 backdrop-blur-sm px-6">
            <div className="flex items-center gap-3">
              <div
                className="flex size-8 items-center justify-center rounded-xl shadow-lg"
                style={{ background: "oklch(0.58 0.24 350)", boxShadow: "0 4px 14px oklch(0.58 0.24 350 / 35%)" }}
              >
                <Zap className="size-4 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold text-gray-900 tracking-tight">Retilo</span>
                <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: "oklch(0.55 0.20 350)" }}>
                  Retail Intelligence
                </span>
              </div>
            </div>
            <StepIndicator current={step} />
          </header>

          {/* Card */}
          <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
            <div className="w-full max-w-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="rounded-2xl border border-gray-200 bg-white p-7 shadow-lg shadow-gray-100/80"
                >
                  {step === "auth" && <AuthStep onNext={() => setStep("connect")} />}
                  {step === "connect" && <ConnectGMBStep />}
                  {step === "locations" && (
                    <LocationSelectStep
                      onNext={(locs) => {
                        setSelectedLocations(locs)
                        setStep("processing")
                      }}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              <p className="mt-5 text-center text-[11px] text-gray-400 tracking-wide">
                Retilo · Retail intelligence platform
              </p>
            </div>
          </main>
        </>
      )}
    </div>
  )
}
