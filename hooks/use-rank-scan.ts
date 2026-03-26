"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { api } from "@/lib/api"

export type ScanStatus = "idle" | "pending" | "running" | "completed" | "failed"

export interface RankPoint {
  lat: number
  lng: number
  rank: number
}

export interface RankScanState {
  status: ScanStatus
  scanId: string | null
  points: RankPoint[]
  progress: number
  error: string | null
  isRunning: boolean
}

const POLL_INTERVAL_MS = 2000

export function useRankScan() {
  const [state, setState] = useState<RankScanState>({
    status: "idle",
    scanId: null,
    points: [],
    progress: 0,
    error: null,
    isRunning: false,
  })

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const abortedRef = useRef(false)

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortedRef.current = true
      stopPolling()
    }
  }, [stopPolling])

  const poll = useCallback(
    (scanId: string) => {
      pollRef.current = setInterval(async () => {
        if (abortedRef.current) return
        try {
          const res = await api.get(`/v1/gmb/rank/status/${scanId}`)
          const data = res.data?.data ?? res.data
          const status: string = data?.status ?? "running"
          const progress: number = data?.progress ?? 0
          const points: RankPoint[] = data?.points ?? []

          if (abortedRef.current) return

          setState((s) => ({ ...s, progress, points }))

          if (status === "completed") {
            stopPolling()
            setState((s) => ({
              ...s,
              status: "completed",
              points,
              progress: 100,
              isRunning: false,
            }))
          } else if (status === "failed") {
            stopPolling()
            setState((s) => ({
              ...s,
              status: "failed",
              error: data?.error ?? "Scan failed",
              isRunning: false,
            }))
          }
          // else keep polling for "running" / "pending"
        } catch {
          // Transient error — keep polling, don't crash
        }
      }, POLL_INTERVAL_MS)
    },
    [stopPolling]
  )

  const startScan = useCallback(
    async (locationId: string, keyword: string) => {
      stopPolling()
      abortedRef.current = false

      setState({
        status: "pending",
        scanId: null,
        points: [],
        progress: 0,
        error: null,
        isRunning: true,
      })

      try {
        const res = await api.post("/v1/gmb/rank/scan", {
          locationId,
          keyword: keyword.trim(),
        })

        if (abortedRef.current) return

        const data = res.data?.data ?? res.data
        // If backend returned points synchronously (non-async path)
        const syncPoints: RankPoint[] = data?.points ?? []
        const scanId: string | null = data?.scanId ?? data?.scan_id ?? null

        if (!scanId) {
          // Synchronous response — scan already completed
          setState({
            status: "completed",
            scanId: null,
            points: syncPoints,
            progress: 100,
            error: null,
            isRunning: false,
          })
          return
        }

        // Async path — poll status
        setState((s) => ({
          ...s,
          status: "running",
          scanId,
          progress: 5,
        }))
        poll(scanId)
      } catch (err: unknown) {
        const apiErr = err as { response?: { data?: { message?: string } }; message?: string }
        const msg =
          apiErr.response?.data?.message ?? apiErr.message ?? "Scan failed to start"
        setState({
          status: "failed",
          scanId: null,
          points: [],
          progress: 0,
          error: msg,
          isRunning: false,
        })
      }
    },
    [stopPolling, poll]
  )

  const reset = useCallback(() => {
    stopPolling()
    abortedRef.current = false
    setState({
      status: "idle",
      scanId: null,
      points: [],
      progress: 0,
      error: null,
      isRunning: false,
    })
  }, [stopPolling])

  return { ...state, startScan, reset }
}
