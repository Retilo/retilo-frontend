// Retilo API client
// -------------------------------------------------------------------
// Uses axios for convenience (request/response interceptors, params, etc.)
// Base URL: NEXT_PUBLIC_API_URL env var, defaults to https://api.retilo.com
//
// DEBUG: Set NEXT_PUBLIC_SERVER_BASE_URL=http://localhost:3002 in .env.local
// to point at a local backend.
//
// Usage:
//   import { api } from "@/lib/api"
//   const res = await api.get("/v1/gmb/locations")
//   const res = await api.post("/v1/auth/login", { email, password })
// -------------------------------------------------------------------

import axios from "axios"

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_BASE_URL ?? "https://api.retilo.com"

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
})

// Request interceptor: attach JWT from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("retilo_token")
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("retilo_token")
      localStorage.removeItem("retilo_merchant")
      window.location.href = "/auth"
    }
    return Promise.reject(error)
  }
)

// Legacy fetch-based helper (kept for backwards compatibility)
export async function apiFetch(path, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("retilo_token") : null
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  if (!res.ok) {
    let errMsg = `Request failed: ${res.status}`
    try {
      const body = await res.json()
      errMsg = body.message ?? body.error ?? errMsg
    } catch {}
    throw new Error(errMsg)
  }
  return res.json()
}
