"use client"

import { useState } from "react"
import { CheckCircle2, ChevronRight, MapPin, Star, Zap, Bell, MessageSquareShare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const MOCK_LOCATIONS = [
  {
    id: 1,
    name: "Retilo George St",
    address: "123 George St, Sydney CBD NSW 2000",
    rating: 4.2,
    reviews: 247,
    pendingReplies: 3,
  },
  {
    id: 2,
    name: "Retilo Newtown",
    address: "45 King St, Newtown NSW 2042",
    rating: 3.8,
    reviews: 183,
    pendingReplies: 5,
  },
  {
    id: 3,
    name: "Retilo Surry Hills",
    address: "78 Crown St, Surry Hills NSW 2010",
    rating: 4.6,
    reviews: 312,
    pendingReplies: 1,
  },
]

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1 rounded-full transition-all duration-300",
            i < current
              ? "w-5 bg-blue-600"
              : i === current
              ? "w-5 bg-blue-600"
              : "w-2.5 bg-zinc-200"
          )}
        />
      ))}
    </div>
  )
}

function GoogleIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function ConnectStep({ onNext }) {
  const [loading, setLoading] = useState(false)

  const handleConnect = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onNext()
    }, 1800)
  }

  return (
    <div className="flex flex-col items-center">
      {/* Brand mark */}
      <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-200">
        <MessageSquareShare className="size-6 text-white" />
      </div>

      <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
        Connect your stores
      </h1>
      <p className="mt-1.5 text-center text-sm text-zinc-500 max-w-[280px] leading-relaxed">
        Link your Google Business Profile to start monitoring reviews and responding instantly.
      </p>

      {/* Value props */}
      <div className="mt-6 w-full space-y-2">
        {[
          { icon: Star, label: "See every review the moment it lands", color: "text-amber-500" },
          { icon: Bell, label: "Instant alerts for 1 and 2-star reviews", color: "text-red-500" },
          { icon: Zap, label: "AI reply drafts ready in under 5 seconds", color: "text-blue-500" },
        ].map(({ icon: Icon, label, color }) => (
          <div key={label} className="flex items-center gap-3 rounded-lg bg-zinc-50 px-3.5 py-2.5 border border-zinc-100">
            <Icon className={cn("size-4 shrink-0", color)} />
            <span className="text-sm text-zinc-700">{label}</span>
          </div>
        ))}
      </div>

      <Button
        onClick={handleConnect}
        disabled={loading}
        className="mt-6 w-full h-10 gap-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium"
      >
        {loading ? (
          <div className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : (
          <GoogleIcon className="size-4" />
        )}
        {loading ? "Connecting to Google…" : "Continue with Google"}
        {!loading && <ChevronRight className="size-3.5" />}
      </Button>

      <p className="mt-3.5 text-center text-xs text-zinc-400">
        Read-only access · No posting without your approval
      </p>
    </div>
  )
}

function LocationsStep({ onNext }) {
  const [selected, setSelected] = useState([1, 2, 3])
  const [loading, setLoading] = useState(false)

  const toggle = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((i) => i !== id) : [...s, id]))

  const handleContinue = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onNext()
    }, 1200)
  }

  return (
    <div className="flex flex-col">
      <h2 className="text-lg font-semibold text-zinc-900">Select locations</h2>
      <p className="mt-1 text-sm text-zinc-500">
        We found {MOCK_LOCATIONS.length} locations linked to your account.
      </p>

      <div className="mt-4 space-y-2">
        {MOCK_LOCATIONS.map((loc) => {
          const isSelected = selected.includes(loc.id)
          return (
            <button
              key={loc.id}
              onClick={() => toggle(loc.id)}
              className={cn(
                "w-full rounded-xl border p-3.5 text-left transition-all",
                isSelected
                  ? "border-blue-200 bg-blue-50 ring-1 ring-blue-200"
                  : "border-zinc-200 bg-white hover:border-zinc-300"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-900">{loc.name}</p>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500">
                    <MapPin className="size-3 shrink-0" />
                    <span className="truncate">{loc.address}</span>
                  </div>
                </div>
                <div
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    isSelected
                      ? "border-blue-600 bg-blue-600"
                      : "border-zinc-300 bg-white"
                  )}
                >
                  {isSelected && (
                    <svg className="size-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>

              <div className="mt-2.5 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-medium text-zinc-700">{loc.rating}</span>
                </div>
                <span className="text-xs text-zinc-400">{loc.reviews} reviews</span>
                {loc.pendingReplies > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                    {loc.pendingReplies} pending
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <Button
        onClick={handleContinue}
        disabled={selected.length === 0 || loading}
        className="mt-5 w-full h-10 gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium"
      >
        {loading ? (
          <div className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : null}
        {loading
          ? "Setting up your workspace…"
          : `Monitor ${selected.length} location${selected.length !== 1 ? "s" : ""}`}
        {!loading && <ChevronRight className="size-3.5" />}
      </Button>
    </div>
  )
}

function SuccessStep({ onComplete }) {
  return (
    <div className="flex flex-col items-center py-4 text-center">
      <div className="relative mb-5">
        <div className="flex size-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="size-8 text-green-600" />
        </div>
        <div className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-blue-600">
          <svg className="size-3 text-white" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-zinc-900">You&apos;re all set!</h2>
      <p className="mt-2 text-sm text-zinc-500 max-w-[260px] leading-relaxed">
        Your stores are connected. We&apos;re already pulling in reviews and monitoring for issues.
      </p>

      <div className="mt-6 w-full space-y-2 rounded-xl border border-green-100 bg-green-50 p-4">
        {[
          "3 store locations connected",
          "742 reviews imported",
          "9 pending replies found",
        ].map((item) => (
          <div key={item} className="flex items-center gap-2.5">
            <CheckCircle2 className="size-4 shrink-0 text-green-600" />
            <span className="text-sm text-zinc-700">{item}</span>
          </div>
        ))}
      </div>

      <Button
        onClick={onComplete}
        className="mt-6 w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium"
      >
        Open Dashboard
        <ChevronRight className="size-3.5" />
      </Button>
    </div>
  )
}

export function GmbConnect({ onComplete }) {
  const [step, setStep] = useState(0)

  return (
    <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-200/60">
      {/* Step indicator */}
      <div className="mb-5 flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400 tabular-nums">
          {step + 1} / 3
        </span>
        <StepIndicator current={step} total={3} />
      </div>

      {step === 0 && <ConnectStep onNext={() => setStep(1)} />}
      {step === 1 && <LocationsStep onNext={() => setStep(2)} />}
      {step === 2 && <SuccessStep onComplete={onComplete} />}
    </div>
  )
}
