"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { apiFetch } from "@/lib/api"

const MESSAGES = [
  "Importing your review history…",
  "Analysing sentiment patterns…",
  "Identifying high-risk locations…",
  "Building your alert thresholds…",
  "Generating AI response templates…",
  "Calibrating priority scoring…",
  "Setting up real-time monitoring…",
  "Almost there — finalising your dashboard…",
]

export function ProcessingStep({ locations = [] }) {
  const router = useRouter()
  const [msgIndex, setMsgIndex] = useState(0)
  const [done, setDone] = useState(false)
  const [completedSteps, setCompletedSteps] = useState([])
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const ticker = setInterval(() => {
      setMsgIndex((i) => {
        const next = i + 1
        setCompletedSteps((prev) => [...prev, i])
        return next < MESSAGES.length ? next : i
      })
    }, 1400)

    const runSync = async () => {
      const locationIds = locations.map((l) => l.id || l._id).filter(Boolean)

      await Promise.allSettled([
        apiFetch("/v1/gmb/locations/sync", {
          method: "POST",
          body: JSON.stringify({ locationIds }),
        }),
        apiFetch("/v1/gmb/analytics/sync", {
          method: "POST",
          body: JSON.stringify({ locationIds }),
        }),
      ])

      clearInterval(ticker)

      // Ensure at least ~6s of animation for polish
      await new Promise((r) => setTimeout(r, 500))

      setCompletedSteps(MESSAGES.map((_, i) => i))
      setDone(true)

      setTimeout(() => {
        router.push("/dashboard")
      }, 1200)
    }

    // Run both in parallel: animation + API
    const minWait = new Promise((r) => setTimeout(r, MESSAGES.length * 1400))
    Promise.all([runSync(), minWait]).then(() => {
      clearInterval(ticker)
    })

    return () => clearInterval(ticker)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 px-8">
      {/* Animated ring */}
      <div className="relative mb-10">
        <div className="size-20 rounded-full border-4 border-zinc-800" />
        {!done && (
          <div className="absolute inset-0 size-20 animate-spin rounded-full border-4 border-transparent border-t-blue-500" />
        )}
        {done && (
          <div className="absolute inset-0 flex items-center justify-center">
            <CheckCircle2 className="size-10 text-green-400" />
          </div>
        )}
        {!done && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-3 animate-pulse rounded-full bg-blue-500" />
          </div>
        )}
      </div>

      <h2 className="text-xl font-semibold text-white text-center">
        {done ? "Setup complete!" : "Setting up your dashboard"}
      </h2>
      <p className="mt-2 text-sm text-zinc-400 text-center max-w-xs leading-relaxed">
        {done
          ? "Taking you to your command center…"
          : "This takes about 10 seconds. Sit tight."}
      </p>

      {/* Step log */}
      <div className="mt-10 w-full max-w-xs space-y-2.5">
        {MESSAGES.map((msg, i) => {
          const isComplete = completedSteps.includes(i)
          const isCurrent = i === msgIndex && !done

          if (i > msgIndex + 1) return null

          return (
            <div
              key={i}
              className={`flex items-center gap-3 transition-all duration-500 ${
                isComplete || isCurrent ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="shrink-0">
                {isComplete ? (
                  <CheckCircle2 className="size-4 text-green-400" />
                ) : isCurrent ? (
                  <div className="size-4 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-400" />
                ) : (
                  <div className="size-4 rounded-full border-2 border-zinc-700" />
                )}
              </div>
              <span
                className={`text-sm ${
                  isComplete
                    ? "text-zinc-400 line-through decoration-zinc-600"
                    : isCurrent
                    ? "text-white font-medium"
                    : "text-zinc-600"
                }`}
              >
                {msg}
              </span>
            </div>
          )
        })}
      </div>

      {/* Store count pill */}
      {locations.length > 0 && (
        <div className="mt-10 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-1.5">
          <span className="text-xs text-zinc-400">
            {locations.length} store{locations.length !== 1 ? "s" : ""} being configured
          </span>
        </div>
      )}
    </div>
  )
}
