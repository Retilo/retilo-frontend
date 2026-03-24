"use client"

import { useState } from "react"
import { Eye, EyeOff, Loader2, AlertCircle, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import Cookies from "js-cookie"

const API_URL = process.env.NEXT_PUBLIC_SERVER_BASE_URL

async function authRequest(endpoint, body) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || data.error || "Authentication failed")
  return data
}

function extractToken(data) {
  const token =
    data?.token ??
    data?.access_token ??
    data?.id_token ??
    data?.jwt ??
    data?.authToken ??
    data?.data?.token ??
    data?.data?.access_token

  if (!token || typeof token !== "string") {
    console.error("[Retilo] Could not find token in auth response. Keys received:", Object.keys(data ?? {}))
    throw new Error("Authentication succeeded but no token was returned. Check the console for the response shape.")
  }
  return token
}

function saveToken(token) {
  localStorage.setItem("retilo_token", token)
  Cookies.set("id_token", token, { expires: 7 })
}

export function AuthStep({ onNext, dark = false }) {
  const [tab, setTab] = useState("login")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" })

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await authRequest("/v1/auth/login", loginForm)
      saveToken(extractToken(data))
      onNext()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await authRequest("/v1/auth/register", registerForm)
      saveToken(extractToken(data))
      onNext()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* Logo mark */}
      <div className={cn(
        "mb-5 flex size-12 items-center justify-center rounded-2xl shadow-lg",
        dark
          ? "bg-[oklch(0.55_0.24_280)] shadow-[oklch(0.55_0.24_280)/40%]"
          : "bg-blue-600 shadow-blue-200"
      )}>
        <Zap className="size-6 text-white" strokeWidth={2.5} />
      </div>

      <h1 className={cn("text-xl font-bold tracking-tight", dark ? "text-white" : "text-zinc-900")}>
        {tab === "login" ? "Welcome back" : "Create your account"}
      </h1>
      <p className={cn("mt-1 text-sm", dark ? "text-white/40" : "text-zinc-500")}>
        {tab === "login" ? "Sign in to your Retilo workspace" : "Start your free Retilo trial"}
      </p>

      {/* Tab switcher */}
      <div className={cn(
        "mt-5 flex w-full rounded-xl p-1",
        dark ? "bg-white/6 border border-white/8" : "border border-zinc-200 bg-zinc-100"
      )}>
        {["login", "register"].map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(null) }}
            className={cn(
              "flex-1 rounded-lg py-1.5 text-sm font-medium transition-all",
              tab === t
                ? dark
                  ? "bg-white/10 text-white shadow-sm"
                  : "bg-white text-zinc-900 shadow-sm"
                : dark
                ? "text-white/40 hover:text-white/60"
                : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            {t === "login" ? "Sign in" : "Register"}
          </button>
        ))}
      </div>

      {/* Login form */}
      {tab === "login" && (
        <form onSubmit={handleLogin} className="mt-5 w-full space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="login-email" className={cn("text-xs font-semibold", dark ? "text-white/50" : "text-zinc-600")}>Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="you@company.com"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              required
              className={cn("h-10 text-sm", dark && "bg-white/6 border-white/10 text-white placeholder:text-white/25 focus:border-[oklch(0.55_0.24_280)/60%]")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="login-password" className={cn("text-xs font-semibold", dark ? "text-white/50" : "text-zinc-600")}>Password</Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
                className={cn("h-10 pr-10 text-sm", dark && "bg-white/6 border-white/10 text-white placeholder:text-white/25 focus:border-[oklch(0.55_0.24_280)/60%]")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn("absolute right-3 top-1/2 -translate-y-1/2", dark ? "text-white/30 hover:text-white/60" : "text-zinc-400 hover:text-zinc-600")}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          {error && <ErrorBox message={error} dark={dark} />}
          <Button
            type="submit"
            disabled={loading}
            className={cn(
              "h-10 w-full gap-2 font-semibold text-white",
              dark
                ? "bg-[oklch(0.55_0.24_280)] hover:bg-[oklch(0.60_0.26_280)] shadow-lg shadow-[oklch(0.55_0.24_280)/30%]"
                : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      )}

      {/* Register form */}
      {tab === "register" && (
        <form onSubmit={handleRegister} className="mt-5 w-full space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="reg-name" className={cn("text-xs font-semibold", dark ? "text-white/50" : "text-zinc-600")}>Full name</Label>
            <Input
              id="reg-name"
              type="text"
              placeholder="Alex Vance"
              value={registerForm.name}
              onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
              required
              className={cn("h-10 text-sm", dark && "bg-white/6 border-white/10 text-white placeholder:text-white/25")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-email" className={cn("text-xs font-semibold", dark ? "text-white/50" : "text-zinc-600")}>Work email</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="you@company.com"
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              required
              className={cn("h-10 text-sm", dark && "bg-white/6 border-white/10 text-white placeholder:text-white/25")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-password" className={cn("text-xs font-semibold", dark ? "text-white/50" : "text-zinc-600")}>Password</Label>
            <div className="relative">
              <Input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                required
                minLength={8}
                className={cn("h-10 pr-10 text-sm", dark && "bg-white/6 border-white/10 text-white placeholder:text-white/25")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn("absolute right-3 top-1/2 -translate-y-1/2", dark ? "text-white/30 hover:text-white/60" : "text-zinc-400 hover:text-zinc-600")}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          {error && <ErrorBox message={error} dark={dark} />}
          <Button
            type="submit"
            disabled={loading}
            className={cn(
              "h-10 w-full gap-2 font-semibold text-white",
              dark
                ? "bg-[oklch(0.55_0.24_280)] hover:bg-[oklch(0.60_0.26_280)] shadow-lg shadow-[oklch(0.55_0.24_280)/30%]"
                : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {loading ? "Creating account…" : "Create account"}
          </Button>
          <p className={cn("text-center text-[11px] leading-relaxed", dark ? "text-white/25" : "text-zinc-400")}>
            By continuing you agree to our Terms of Service and Privacy Policy
          </p>
        </form>
      )}
    </div>
  )
}

function ErrorBox({ message, dark = false }) {
  return (
    <div className={cn(
      "flex items-start gap-2.5 rounded-xl px-3.5 py-3",
      dark
        ? "border border-red-500/20 bg-red-500/10"
        : "border border-red-200 bg-red-50"
    )}>
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
      <p className={cn("text-sm", dark ? "text-red-400" : "text-red-700")}>{message}</p>
    </div>
  )
}
