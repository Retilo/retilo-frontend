"use client"

import { useState } from "react"
import { Star, Bell, Zap, ChevronRight, AlertCircle, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const API_URL = process.env.NEXT_PUBLIC_SERVER_BASE_URL
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

function buildGmbOAuthUrl() {
  // State = the JWT — backend decodes it to extract merchantId from the payload
  const token = localStorage.getItem("retilo_token")
  if (!token) return null

  const scope = encodeURIComponent(
    [
      "https://www.googleapis.com/auth/business.manage",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" ")
  )

  const redirectUri = encodeURIComponent(`${API_URL}/v1/gmb/oauth/callback`)

  return (
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${redirectUri}` +
    `&response_type=code` +
    `&scope=${scope}` +
    `&access_type=offline` +
    `&state=${encodeURIComponent(token)}` +
    `&prompt=consent`
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

export function ConnectGMBStep() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleConnect = () => {
    setError(null)

    const authUrl = buildGmbOAuthUrl()

    if (!authUrl) {
      setError("Session not found — please sign in first.")
      return
    }

    setLoading(true)
    window.location.href = authUrl
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* Google logo lockup */}
      <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-white shadow-md shadow-zinc-200 border border-zinc-100">
        <GoogleIcon className="size-8" />
      </div>

      <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
        Connect Google Business
      </h2>
      <p className="mt-1.5 text-center text-sm text-zinc-500 max-w-[290px] leading-relaxed">
        Link your Google Business Profile so Retilo can monitor reviews across all your stores.
      </p>

      {/* Benefits */}
      <div className="mt-6 w-full space-y-2">
        {[
          { icon: Star,  label: "Every review captured the moment it lands",  color: "text-amber-500" },
          { icon: Bell,  label: "Instant alerts for 1 and 2-star reviews",    color: "text-red-500"   },
          { icon: Zap,   label: "AI reply drafts ready in under 5 seconds",   color: "text-blue-500"  },
        ].map(({ icon: Icon, label, color }) => (
          <div key={label} className="flex items-center gap-3 rounded-lg border border-zinc-100 bg-zinc-50 px-3.5 py-2.5">
            <Icon className={cn("size-4 shrink-0", color)} />
            <span className="text-sm text-zinc-700">{label}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-4 flex w-full items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Button
        onClick={handleConnect}
        disabled={loading}
        className="mt-6 h-10 w-full gap-2.5 bg-zinc-900 font-medium text-white hover:bg-zinc-800"
      >
        {loading ? (
          <div className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : (
          <GoogleIcon className="size-4" />
        )}
        {loading ? "Redirecting to Google…" : "Continue with Google"}
        {!loading && <ChevronRight className="size-3.5" />}
      </Button>

      <div className="mt-3.5 flex items-center gap-1.5 text-zinc-400">
        <Shield className="size-3.5" />
        <p className="text-xs">Read-only access · No posting without your approval</p>
      </div>
    </div>
  )
}
