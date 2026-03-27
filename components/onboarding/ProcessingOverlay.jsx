"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const MESSAGES = [
  { text: "Fetching customer feedback…",        icon: "💬" },
  { text: "Analyzing ratings across stores…",   icon: "⭐" },
  { text: "Building your store intelligence…",  icon: "🧠" },
  { text: "Mapping review patterns…",           icon: "📊" },
  { text: "Calibrating alert thresholds…",      icon: "🔔" },
  { text: "Generating AI response templates…",  icon: "✨" },
  { text: "Activating real-time monitoring…",   icon: "📡" },
  { text: "Finalising your command center…",    icon: "🚀" },
]

function PulseRing({ delay = 0, size = "size-32", color = "border-blue-500/20" }) {
  return (
    <motion.div
      className={`absolute rounded-full border ${size} ${color}`}
      initial={{ opacity: 0.6, scale: 0.8 }}
      animate={{ opacity: 0, scale: 1.8 }}
      transition={{ duration: 2.5, delay, repeat: Infinity, ease: "easeOut" }}
    />
  )
}

export function ProcessingOverlay({ visible, locationCount = 0 }) {
  const [msgIndex, setMsgIndex] = useState(0)
  const [dots, setDots] = useState(0)

  useEffect(() => {
    if (!visible) return

    const msgTimer = setInterval(() => {
      setMsgIndex((i) => (i + 1 < MESSAGES.length ? i + 1 : i))
    }, 1600)

    const dotTimer = setInterval(() => {
      setDots((d) => (d + 1) % 4)
    }, 400)

    return () => {
      clearInterval(msgTimer)
      clearInterval(dotTimer)
    }
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
        >
          {/* Background grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Blue glow center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-64 rounded-full bg-blue-400/12 blur-3xl" />

          {/* Pulse rings */}
          <div className="relative flex items-center justify-center">
            <PulseRing delay={0}   size="size-40" color="border-blue-400/20" />
            <PulseRing delay={0.8} size="size-40" color="border-blue-300/15" />
            <PulseRing delay={1.6} size="size-40" color="border-indigo-400/12" />

            {/* Core spinner */}
            <div className="relative flex size-20 items-center justify-center rounded-full bg-white border border-zinc-200 shadow-lg shadow-blue-100/50">
              <motion.div
                className="absolute inset-1 rounded-full border-2 border-transparent border-t-blue-500"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-3 rounded-full border border-transparent border-t-blue-400/60"
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="size-3 rounded-full bg-blue-500"
              />
            </div>
          </div>

          {/* Text block */}
          <div className="relative mt-14 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-semibold text-zinc-900 tracking-tight"
            >
              Activating your intelligence
            </motion.h2>
            <p className="mt-2 text-sm text-zinc-400">
              {locationCount > 0
                ? `Processing ${locationCount} location${locationCount !== 1 ? "s" : ""}`
                : "Analysing your business data"}
            </p>

            {/* Rotating message */}
            <div className="mt-8 h-8 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={msgIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2.5"
                >
                  <span className="text-base">{MESSAGES[msgIndex].icon}</span>
                  <span className="text-sm text-zinc-600 font-medium">
                    {MESSAGES[msgIndex].text}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress dots */}
            <div className="mt-6 flex items-center justify-center gap-2">
              {MESSAGES.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    width: i === msgIndex ? 20 : 6,
                    backgroundColor: i < msgIndex ? "#22c55e" : i === msgIndex ? "#3b82f6" : "#e4e4e7",
                  }}
                  transition={{ duration: 0.3 }}
                  className="h-1.5 rounded-full"
                />
              ))}
            </div>
          </div>

          {/* Completed steps log */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xs px-4">
            <div className="space-y-1.5">
              <AnimatePresence>
                {MESSAGES.slice(0, msgIndex).map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-2"
                  >
                    <div className="size-3.5 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="size-2.5 text-green-600" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-[11px] text-zinc-400 line-through decoration-zinc-300">{msg.text}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
