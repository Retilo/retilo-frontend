"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, Chrome } from "lucide-react"
import { api } from "@/lib/api"

// --- NOTE FOR DEBUGGERS ---
// Auth flow: register/login → JWT stored in localStorage as "retilo_token"
// Google OAuth: redirect to /v1/auth/google → callback at /auth/callback?token=<jwt>

type Mode = "login" | "register"

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("login")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ name: "", email: "", password: "" })

  // Already authed → go to dashboard
  useEffect(() => {
    if (localStorage.getItem("retilo_token")) router.replace("/dashboard")
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (mode === "register") {
        await api.post("/v1/auth/register", {
          name: form.name,
          email: form.email,
          password: form.password,
        })
        setMode("login")
        setError("")
        return
      }
      const res = await api.post("/v1/auth/login", {
        email: form.email,
        password: form.password,
      })
      localStorage.setItem("retilo_token", res.data.data.token)
      if (res.data.data.merchant) {
        localStorage.setItem("retilo_merchant", JSON.stringify(res.data.data.merchant))
      }
      router.replace("/dashboard")
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e?.response?.data?.message ?? "Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = () => {
    // Backend redirects to /auth/callback?token=<jwt> after consent
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL ?? "https://api.retilo.com"}/v1/auth/google`
  }

  return (
    <div className="min-h-screen bg-[oklch(0.09_0.012_270)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid opacity-40" />
      {/* Purple glow orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[oklch(0.55_0.24_280)] rounded-full blur-[120px] opacity-10 pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 mb-8 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card p-8"
        >
          {/* Logo */}
          <div className="mb-8">
            <div className="w-8 h-8 rounded-lg bg-[oklch(0.55_0.24_280)] flex items-center justify-center mb-4">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <h1 className="text-xl font-semibold text-white">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-sm text-white/50 mt-1">
              {mode === "login"
                ? "Sign in to your Retilo workspace"
                : "Start automating your GMB presence"}
            </p>
          </div>

          {/* Google OAuth */}
          <button
            onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/8 text-white text-sm font-medium transition-colors mb-5"
          >
            <Chrome className="w-4 h-4" />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-white/30">or</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "register" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  placeholder="Full name"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[oklch(0.65_0.26_280)] focus:ring-1 focus:ring-[oklch(0.65_0.26_280)] transition-colors"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                placeholder="Email address"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[oklch(0.65_0.26_280)] focus:ring-1 focus:ring-[oklch(0.65_0.26_280)] transition-colors"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[oklch(0.65_0.26_280)] focus:ring-1 focus:ring-[oklch(0.65_0.26_280)] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-[oklch(0.65_0.22_25)] text-xs">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[oklch(0.55_0.24_280)] hover:bg-[oklch(0.60_0.26_280)] text-white text-sm font-semibold transition-colors disabled:opacity-60 mt-1"
            >
              {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="text-center text-xs text-white/40 mt-5">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError("") }}
              className="text-[oklch(0.75_0.20_280)] hover:text-[oklch(0.80_0.22_280)] transition-colors"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
