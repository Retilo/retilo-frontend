"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("retilo_token")
    if (!token) {
      router.replace("/auth")
      return
    }
    setReady(true)
  }, [router])

  if (!ready) return null

  return (
    <div data-ui="dashboard" className="min-h-screen" style={{ background: "oklch(0.985 0.003 350)" }}>
      {children}
    </div>
  )
}
