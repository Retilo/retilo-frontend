"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react"

const WAITLIST_API = "https://api.retilo.io/v1/public/waitlist"

interface MarketingWaitlistMinimalProps {
  headline?: string
  subtext?: string
  successMessage?: string
  accentColor?: string
  count?: number
}

export function MarketingWaitlistMinimal({
  headline = "Join the waitlist",
  subtext = "Be first to know when we launch.",
  successMessage = "You're on the list!",
  accentColor = "#FC8019",
  count = 142,
}: MarketingWaitlistMinimalProps) {
  const [email, setEmail] = useState("")
  const [restaurantName, setRestaurantName] = useState("")
  const [phone, setPhone] = useState("")
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Enter a valid email address.")
      return
    }
    if (!restaurantName.trim()) {
      setErrorMsg("Enter your restaurant name.")
      return
    }
    setState("loading")
    setErrorMsg("")
    try {
      const res = await fetch(WAITLIST_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          restaurant_name: restaurantName.trim(),
          ...(phone.trim() ? { phone: phone.trim() } : {}),
        }),
      })
      if (!res.ok) throw new Error("api_error")
      setState("done")
    } catch {
      setState("error")
      setErrorMsg("Something went wrong. Try again.")
    }
  }

  const inputClass = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-gray-300 focus:bg-white disabled:opacity-60"

  return (
    <div className="w-full max-w-md mx-auto text-center">
      {/* Count pill */}
      <div className="inline-flex items-center gap-1.5 rounded-full border border-black/8 bg-black/[0.03] px-3 py-1 text-xs font-medium text-gray-500 mb-5">
        <span className="inline-block size-1.5 rounded-full animate-pulse" style={{ background: accentColor }} />
        {count.toLocaleString()} restaurants already joined
      </div>

      <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 mb-2">{headline}</h2>
      <p className="text-gray-500 text-sm mb-6 leading-relaxed">{subtext}</p>

      <AnimatePresence mode="wait">
        {state === "done" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-2 py-6"
          >
            <CheckCircle2 className="size-9" style={{ color: accentColor }} />
            <p className="font-semibold text-gray-800">{successMessage}</p>
            <p className="text-xs text-gray-400">We'll reach out when your access is ready.</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-2.5 text-left"
          >
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => { setRestaurantName(e.target.value); setErrorMsg("") }}
              placeholder="Restaurant name"
              disabled={state === "loading"}
              className={inputClass}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrorMsg("") }}
              placeholder="your@email.com"
              disabled={state === "loading"}
              className={inputClass}
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setErrorMsg("") }}
              placeholder="Phone number (optional)"
              disabled={state === "loading"}
              className={inputClass}
            />
            <button
              type="submit"
              disabled={state === "loading"}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 mt-1"
              style={{ background: accentColor }}
            >
              {state === "loading" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>Request access <ArrowRight className="size-4" /></>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {errorMsg && <p className="mt-2 text-xs text-red-500">{errorMsg}</p>}
      <p className="mt-3 text-[11px] text-gray-400">No spam. Unsubscribe anytime.</p>
    </div>
  )
}
