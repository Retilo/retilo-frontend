"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff } from "lucide-react"
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
    const base = process.env.NEXT_PUBLIC_SERVER_BASE_URL ?? "https://api.retilo.com"
    window.location.href = `${base}/v1/auth/google`
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
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
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
