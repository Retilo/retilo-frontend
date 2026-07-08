"use client"

import { useState } from "react"
import Link from "next/link"
import { Zap, Eye, EyeOff, Trash2, ShieldAlert, CheckCircle, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

type Mode = "account" | "gmb"
type Stage = "form" | "confirm" | "done"

export default function DeleteAccountPage() {
  const [mode, setMode] = useState<Mode>("account")
  const [stage, setStage] = useState<Stage>("form")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const isGmbOnly = mode === "gmb"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (stage === "form") { setStage("confirm"); return }

    setError(""); setLoading(true)
    try {
      const endpoint = isGmbOnly ? "/v1/auth/account/gmb" : "/v1/auth/account"
      await api.delete(endpoint, { data: { email, password } })
      setStage("done")
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e?.response?.data?.message ?? "Something went wrong — please try again.")
      setStage("form")
    } finally {
      setLoading(false)
    }
  }

  if (stage === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "oklch(0.985 0.003 270)" }}>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg text-center max-w-sm w-full">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            {isGmbOnly ? "GMB data deleted" : "Account deleted"}
          </h2>
          <p className="text-sm text-gray-500">
            {isGmbOnly
              ? "All your Google Business data has been removed from Retilo."
              : "Your account and all associated data have been permanently deleted."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "oklch(0.985 0.003 270)" }}>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg">

          {/* Header */}
          <div className="mb-6">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4 shadow-md"
              style={{ background: "oklch(0.58 0.24 350)", boxShadow: "0 4px 14px oklch(0.58 0.24 350 / 35%)" }}>
              <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Delete data</h1>
            <p className="text-sm text-gray-500 mt-1">Choose what you'd like to remove</p>
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-xl border border-gray-200 p-1 mb-5 bg-gray-50">
            {(["account", "gmb"] as Mode[]).map((m) => (
              <button key={m} type="button"
                onClick={() => { setMode(m); setStage("form"); setError("") }}
                className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all ${
                  mode === m
                    ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                    : "text-gray-500 hover:text-gray-700"
                }`}>
                {m === "account" ? "Full account" : "GMB data only"}
              </button>
            ))}
          </div>

          {/* What gets deleted */}
          <div className={`rounded-xl border p-4 mb-5 text-xs leading-relaxed ${
            isGmbOnly
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}>
            <p className="font-semibold mb-1.5">
              {isGmbOnly ? "This will permanently delete:" : "This will permanently delete:"}
            </p>
            {isGmbOnly ? (
              <ul className="space-y-0.5 list-disc list-inside text-amber-700">
                <li>GMB locations synced to Retilo</li>
                <li>Reviews, posts, and photos</li>
                <li>Analytics and performance data</li>
                <li>Competitor tracking data</li>
                <li>Google OAuth connection</li>
              </ul>
            ) : (
              <ul className="space-y-0.5 list-disc list-inside text-red-700">
                <li>Your Retilo account and profile</li>
                <li>All GMB data (locations, reviews, posts)</li>
                <li>Campaigns, bookings, and customers</li>
                <li>All analytics and reports</li>
              </ul>
            )}
          </div>

          {stage === "confirm" ? (
            <div>
              <div className={`rounded-xl border p-4 mb-5 flex items-start gap-3 ${
                isGmbOnly ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"
              }`}>
                <ShieldAlert className={`w-5 h-5 shrink-0 mt-0.5 ${isGmbOnly ? "text-amber-600" : "text-red-600"}`} />
                <p className={`text-xs leading-relaxed font-medium ${isGmbOnly ? "text-amber-800" : "text-red-800"}`}>
                  {isGmbOnly
                    ? "This action cannot be undone. Your GMB data will be permanently removed from Retilo."
                    : "This action cannot be undone. Your account will be permanently deleted."}
                </p>
              </div>
              {error && (
                <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">{error}</p>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={() => setStage("form")}
                  className="flex-1 py-2.5 rounded-xl text-gray-700 text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="button" disabled={loading} onClick={handleSubmit}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-60"
                  style={{ background: isGmbOnly ? "oklch(0.65 0.18 60)" : "oklch(0.55 0.22 25)" }}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {loading ? "Deleting…" : "Confirm delete"}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="Email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[oklch(0.58_0.24_350)] focus:ring-2 focus:ring-[oklch(0.58_0.24_350_/_12%)] transition-colors"
              />
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[oklch(0.58_0.24_350)] focus:ring-2 focus:ring-[oklch(0.58_0.24_350_/_12%)] transition-colors"
                />
                <button type="button" onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && (
                <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}
              <button type="submit"
                className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all mt-1"
                style={{
                  background: isGmbOnly ? "oklch(0.65 0.18 60)" : "oklch(0.55 0.22 25)",
                  boxShadow: isGmbOnly
                    ? "0 4px 16px oklch(0.65 0.18 60 / 30%)"
                    : "0 4px 16px oklch(0.55 0.22 25 / 30%)",
                }}>
                Continue
              </button>
            </form>
          )}

          <p className="text-center text-xs text-gray-400 mt-5">
            Changed your mind?{" "}
            <Link href="/auth" className="font-semibold" style={{ color: "oklch(0.48 0.24 350)" }}>
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
