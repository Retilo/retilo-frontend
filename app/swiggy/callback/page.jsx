"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function CallbackInner() {
  const router = useRouter()
  const params = useSearchParams()
  const status = params.get("status")
  const reason = params.get("reason")

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/dashboard/swiggy")
    }, status === "connected" ? 1500 : 3000)
    return () => clearTimeout(timer)
  }, [router, status])

  const connected = status === "connected"

  return (
    <div className="text-center space-y-3">
      <div className="text-4xl">{connected ? "✓" : "✗"}</div>
      <p className="text-white text-sm font-medium">
        {connected
          ? "Swiggy connected. Redirecting…"
          : `Connection failed: ${reason || "unknown error"}. Redirecting…`}
      </p>
    </div>
  )
}

export default function SwiggyCallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Suspense>
        <CallbackInner />
      </Suspense>
    </div>
  )
}
