"use client"

export const dynamic = "force-dynamic"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle, XCircle, Loader2, Zap } from "lucide-react"

function VerifyEmailInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const success = searchParams.get("success") === "true"
  const error = searchParams.get("error")
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (success) {
      const t = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) { clearInterval(t); router.replace("/dashboard"); return 0 }
          return c - 1
        })
      }, 1000)
      return () => clearInterval(t)
    }
  }, [success, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "oklch(0.985 0.003 270)" }}>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg text-center">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-md"
            style={{ background: "oklch(0.58 0.24 350)", boxShadow: "0 4px 14px oklch(0.58 0.24 350 / 35%)" }}>
            <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>

          {success ? (
            <>
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900 mb-2">Email verified!</h1>
              <p className="text-sm text-gray-500 mb-6">
                Your account is now active. Redirecting to dashboard in {countdown}s…
              </p>
              <Link href="/dashboard"
                className="inline-flex items-center justify-center w-full py-2.5 rounded-xl text-white text-sm font-semibold"
                style={{ background: "oklch(0.58 0.24 350)" }}>
                Go to dashboard
              </Link>
            </>
          ) : (
            <>
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900 mb-2">Link expired</h1>
              <p className="text-sm text-gray-500 mb-6">
                This verification link is invalid or has already been used. Sign in to request a new one.
              </p>
              <Link href="/auth"
                className="inline-flex items-center justify-center w-full py-2.5 rounded-xl text-white text-sm font-semibold"
                style={{ background: "oklch(0.58 0.24 350)" }}>
                Back to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    }>
      <VerifyEmailInner />
    </Suspense>
  )
}
