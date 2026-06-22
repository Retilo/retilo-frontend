"use client"

export const dynamic = "force-dynamic"

import { Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Lock, Eye, EyeOff, Zap, CheckCircle, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

function ResetPasswordInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token") ?? ""
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "oklch(0.985 0.003 270)" }}>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg text-center max-w-sm w-full">
          <p className="text-sm text-gray-500 mb-4">Invalid reset link — please request a new one.</p>
          <Link href="/auth" className="text-sm font-semibold" style={{ color: "oklch(0.48 0.24 350)" }}>
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { setError("Password must be at least 8 characters"); return }
    if (password !== confirm) { setError("Passwords do not match"); return }
    setError(""); setLoading(true)
    try {
      await api.post("/v1/auth/reset-password", { token, password })
      setDone(true)
      setTimeout(() => router.replace("/auth"), 3000)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e?.response?.data?.message ?? "Something went wrong — try requesting a new link.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "oklch(0.985 0.003 270)" }}>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg">
          <div className="mb-7">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4 shadow-md"
              style={{ background: "oklch(0.58 0.24 350)", boxShadow: "0 4px 14px oklch(0.58 0.24 350 / 35%)" }}>
              <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Set new password</h1>
            <p className="text-sm text-gray-500 mt-1">Choose a strong password for your account</p>
          </div>

          {done ? (
            <div className="text-center py-4">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-800 mb-1">Password updated!</p>
              <p className="text-xs text-gray-400">Redirecting to sign in…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="New password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[oklch(0.58_0.24_350)] focus:ring-2 focus:ring-[oklch(0.58_0.24_350_/_12%)] transition-colors"
                />
                <button type="button" onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Confirm password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[oklch(0.58_0.24_350)] focus:ring-2 focus:ring-[oklch(0.58_0.24_350_/_12%)] transition-colors"
                />
              </div>
              {error && (
                <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60 mt-1"
                style={{ background: "oklch(0.58 0.24 350)", boxShadow: "0 4px 16px oklch(0.58 0.24 350 / 30%)" }}>
                {loading ? "Updating…" : "Set new password"}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-gray-400 mt-5">
            <Link href="/auth" className="font-semibold" style={{ color: "oklch(0.48 0.24 350)" }}>
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    }>
      <ResetPasswordInner />
    </Suspense>
  )
}
