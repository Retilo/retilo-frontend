"use client"

import { useState } from "react"
import { Eye, EyeOff, Loader2, AlertCircle, MessageSquareShare } from "lucide-react"
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
  // Try common token field names; extend this list if your API uses a different key
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

export function AuthStep({ onNext }) {
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
      {/* Logo */}
      <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-200">
        <MessageSquareShare className="size-6 text-white" />
      </div>

      <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
        {tab === "login" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        {tab === "login" ? "Sign in to your Retilo workspace" : "Start your free Retilo trial"}
      </p>

      {/* Tab switcher */}
      <div className="mt-5 flex w-full rounded-lg border border-zinc-200 bg-zinc-100 p-1">
        {["login", "register"].map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(null) }}
            className={cn(
              "flex-1 rounded-md py-1.5 text-sm font-medium transition-all",
              tab === t
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            {t === "login" ? "Sign in" : "Register"}
          </button>
        ))}
      </div>

      {/* Login form */}
      {tab === "login" && (
        <form onSubmit={handleLogin} className="mt-5 w-full space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="login-email" className="text-xs font-medium text-zinc-600">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="you@company.com"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              required
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="login-password" className="text-xs font-medium text-zinc-600">Password</Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
                className="h-9 pr-9 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          {error && <ErrorBox message={error} />}
          <Button
            type="submit"
            disabled={loading}
            className="h-10 w-full gap-2 bg-blue-600 font-medium text-white hover:bg-blue-700"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      )}

      {/* Register form */}
      {tab === "register" && (
        <form onSubmit={handleRegister} className="mt-5 w-full space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="reg-name" className="text-xs font-medium text-zinc-600">Full name</Label>
            <Input
              id="reg-name"
              type="text"
              placeholder="Alex Vance"
              value={registerForm.name}
              onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
              required
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-email" className="text-xs font-medium text-zinc-600">Work email</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="you@company.com"
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              required
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-password" className="text-xs font-medium text-zinc-600">Password</Label>
            <div className="relative">
              <Input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                required
                minLength={8}
                className="h-9 pr-9 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          {error && <ErrorBox message={error} />}
          <Button
            type="submit"
            disabled={loading}
            className="h-10 w-full gap-2 bg-blue-600 font-medium text-white hover:bg-blue-700"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {loading ? "Creating account…" : "Create account"}
          </Button>
          <p className="text-center text-[11px] text-zinc-400 leading-relaxed">
            By continuing you agree to our Terms of Service and Privacy Policy
          </p>
        </form>
      )}
    </div>
  )
}

function ErrorBox({ message }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3">
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
      <p className="text-sm text-red-700">{message}</p>
    </div>
  )
}
