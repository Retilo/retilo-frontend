"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AuthStep } from "@/components/onboarding/AuthStep"
import { ConnectGMBStep } from "@/components/onboarding/ConnectGMBStep"
import { LocationSelectStep } from "@/components/onboarding/LocationSelectStep"
import { ProcessingStep } from "@/components/onboarding/ProcessingStep"

const STEPS = ["auth", "connect", "locations", "processing"]

const STEP_LABELS = {
  auth: "Account",
  connect: "Connect",
  locations: "Locations",
  processing: "Setup",
}

function StepIndicator({ current }) {
  const visibleSteps = STEPS.slice(0, 3) // don't show "processing" in indicator
  return (
    <div className="flex items-center gap-2">
      {visibleSteps.map((s, i) => {
        const stepIndex = STEPS.indexOf(s)
        const currentIndex = STEPS.indexOf(current)
        const isComplete = stepIndex < currentIndex
        const isActive = stepIndex === currentIndex
        return (
          <div key={s} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                  isComplete
                    ? "bg-blue-600 text-white"
                    : isActive
                    ? "bg-blue-600/20 text-blue-600 ring-1 ring-blue-600/40"
                    : "bg-zinc-100 text-zinc-400"
                }`}
              >
                {isComplete ? (
                  <svg className="size-3" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-xs font-medium ${
                  isActive ? "text-zinc-900" : isComplete ? "text-zinc-500" : "text-zinc-400"
                }`}
              >
                {STEP_LABELS[s]}
              </span>
            </div>
            {i < visibleSteps.length - 1 && (
              <div
                className={`h-px w-6 transition-colors ${
                  isComplete ? "bg-blue-600" : "bg-zinc-200"
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
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

export default function OnboardingPage() {
  const [step, setStep] = useState("auth")
  const [selectedLocations, setSelectedLocations] = useState([])

  // Detect return from GMB OAuth: /onboarding?gmb_connected=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("gmb_connected") === "true") {
      setStep("locations")
      window.history.replaceState({}, "", window.location.pathname)
    }
    // If user already has a token, skip auth step
    if (localStorage.getItem("retilo_token")) {
      const current = new URLSearchParams(window.location.search).get("gmb_connected")
      if (!current) setStep("connect")
    }
  }, [])

  const isProcessing = step === "processing"

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Processing step is full-screen — render standalone */}
      {isProcessing && <ProcessingStep locations={selectedLocations} />}

      {!isProcessing && (
        <>
          {/* Top bar */}
          <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-blue-600 shadow-md shadow-blue-900/20">
                <svg className="size-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-zinc-900">Retilo</span>
            </div>
            <StepIndicator current={step} />
          </header>

          {/* Card */}
          <main className="flex flex-1 items-center justify-center px-4 py-12">
            <div className="w-full max-w-sm">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-200/60"
                >
                  {step === "auth" && (
                    <AuthStep onNext={() => setStep("connect")} />
                  )}
                  {step === "connect" && (
                    <ConnectGMBStep />
                  )}
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

              {/* Footer note */}
              <p className="mt-4 text-center text-xs text-zinc-400">
                Retilo · Enterprise retail intelligence platform
              </p>
            </div>
          </main>
        </>
      )}
    </div>
  )
}
