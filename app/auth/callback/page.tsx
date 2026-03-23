"use client"

// OAuth callback — backend redirects here with:
//   /auth/callback?token=<jwt>      on success
//   /auth/callback?error=<message>  on failure

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"

function CallbackHandler() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const token = params.get("token")
    const error = params.get("error")

    if (token) {
      localStorage.setItem("retilo_token", token)
      // Check if user has completed onboarding (has locations)
      router.replace("/dashboard")
    } else {
      console.error("OAuth callback error:", error)
      router.replace(`/auth?error=${error ?? "oauth_failed"}`)
    }
  }, [params, router])

  return (
    <div className="min-h-screen bg-[oklch(0.09_0.012_270)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-5 h-5 rounded-full border-2 border-[oklch(0.65_0.26_280)] border-t-transparent animate-spin" />
        <p className="text-sm text-white/50">Completing sign in…</p>
      </div>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  )
}
