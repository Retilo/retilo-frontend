"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function GmbCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const gmb = params.get("gmb")      // backend sends ?gmb=connected or ?gmb=error
    const reason = params.get("reason") // backend sends &reason=... on early errors

    if (gmb === "connected") {
      setStatus("success")
      setTimeout(() => {
        window.location.replace("/onboarding?gmb_connected=true")
      }, 1200)
    } else {
      setStatus("error")
      const msg = reason
        ? decodeURIComponent(reason)
        : gmb === "error"
        ? "Google Business connection failed. Please try again."
        : "Something went wrong during the connection."
      setErrorMsg(msg)
    }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-200/60 text-center">

        {status === "loading" && (
          <>
            <Loader2 className="mb-4 size-10 animate-spin text-blue-600" />
            <p className="text-sm font-medium text-zinc-700">Connecting your stores…</p>
            <p className="mt-1 text-xs text-zinc-400">This will only take a moment</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="size-8 text-green-600" />
            </div>
            <p className="text-base font-semibold text-zinc-900">Google Business connected!</p>
            <p className="mt-1 text-sm text-zinc-500">Taking you back to setup…</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-red-100">
              <XCircle className="size-8 text-red-500" />
            </div>
            <p className="text-base font-semibold text-zinc-900">Connection failed</p>
            <p className="mt-1 text-sm text-zinc-500 max-w-60">{errorMsg}</p>
            <button
              onClick={() => window.location.replace("/onboarding")}
              className="mt-5 rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
            >
              Try again
            </button>
          </>
        )}

      </div>
    </div>
  )
}
