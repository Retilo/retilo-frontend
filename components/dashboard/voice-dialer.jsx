"use client"

/**
 * VoiceDialer — web click-to-call component.
 *
 * Flow: config check → dial (gets LiveKit token) → join room (WebRTC) →
 *       SIP participant connects (call answered) → hangup → complete report.
 *
 * Mode "app": browser joins the LiveKit room as a WebRTC participant.
 * The SIP leg is dialed from the backend via Plivo Zentrunk.
 */

import { useEffect, useRef, useState, useCallback } from "react"
import { Phone, PhoneOff, Mic, MicOff, X, ChevronDown } from "lucide-react"
import { api } from "@/lib/api"

const PINK  = "oklch(0.58 0.24 350)"
const BLUE  = "oklch(0.52 0.20 255)"
const GREEN = "oklch(0.50 0.18 145)"
const RED   = "oklch(0.52 0.22 25)"
const CARD_BG     = "oklch(1 0 0)"
const CARD_BORDER = "oklch(0.91 0.008 350)"
const TEXT        = "oklch(0.14 0.008 270)"
const TEXT_MUTED  = "oklch(0.55 0.008 270)"
const TEXT_FAINT  = "oklch(0.65 0.008 270)"
const INPUT_BG    = "oklch(0.96 0.005 350)"
const INPUT_BORDER = "oklch(0.90 0.008 350)"

function fmtDuration(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

export function VoiceDialer() {
  const [expanded, setExpanded]       = useState(false)
  const [config, setConfig]           = useState(null)   // { ready, numbers }
  const [toNumber, setToNumber]       = useState("")
  const [contactName, setContactName] = useState("")
  const [fromNumber, setFromNumber]   = useState("")
  const [callState, setCallState]     = useState("idle") // idle|connecting|ringing|connected|ending|ended
  const [callData, setCallData]       = useState(null)   // dial response
  const [muted, setMuted]             = useState(false)
  const [duration, setDuration]       = useState(0)
  const [error, setError]             = useState("")

  const roomRef        = useRef(null)
  const timerRef       = useRef(null)
  const durationRef    = useRef(0)      // tracks for complete() payload without stale closure
  const callDataRef    = useRef(null)   // mirrors callData for event-listener closures
  const finishedRef    = useRef(false)  // guard against double-finish

  // Load dialer config when panel opens
  useEffect(() => {
    if (!expanded) return
    api.get("/v1/voice/dialer/config")
      .then(res => {
        const d = res.data?.data ?? res.data
        setConfig(d)
        if (d?.numbers?.length) setFromNumber(d.numbers[0].phoneNumber)
      })
      .catch(() => setError("Could not load dialer config"))
  }, [expanded])

  // Duration timer — start when connected, stop on call end
  useEffect(() => {
    if (callState === "connected") {
      durationRef.current = 0
      timerRef.current = setInterval(() => {
        durationRef.current += 1
        setDuration(d => d + 1)
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [callState])

  const handleDial = async () => {
    if (!toNumber.trim()) return
    setError("")
    setCallState("connecting")
    setDuration(0)

    try {
      const res = await api.post("/v1/voice/dialer/dial", {
        to: toNumber.trim(),
        from: fromNumber || undefined,
        contactName: contactName.trim() || undefined,
        mode: "app",
      })
      const data = res.data?.data ?? res.data
      setCallData(data)
      callDataRef.current  = data
      finishedRef.current  = false

      // Dynamically import livekit-client (SSR-safe)
      const { Room, RoomEvent, ConnectionState } = await import("livekit-client")
      const room = new Room()
      roomRef.current = room

      setCallState("ringing")

      room.on(RoomEvent.ParticipantConnected, (participant) => {
        // SIP leg connected = customer picked up
        if (participant.identity?.startsWith("phone-")) {
          setCallState("connected")
        }
      })

      room.on(RoomEvent.ParticipantDisconnected, (participant) => {
        if (participant.identity?.startsWith("phone-")) {
          finishCall({ answered: true })
        }
      })

      room.on(RoomEvent.Disconnected, () => {
        finishCall({ answered: callState === "connected" || durationRef.current > 0 })
      })

      room.on(RoomEvent.ConnectionStateChanged, (state) => {
        if (state === ConnectionState.Disconnected) {
          finishCall({ answered: durationRef.current > 0 })
        }
      })

      await room.connect(data.livekitUrl, data.token)
      await room.localParticipant.setMicrophoneEnabled(true)

      // If SIP participant already in room (fast answer), set connected immediately
      const sipParticipant = [...room.remoteParticipants.values()].find(p =>
        p.identity?.startsWith("phone-")
      )
      if (sipParticipant) setCallState("connected")

    } catch (err) {
      setCallState("idle")
      setError(err?.response?.data?.message ?? err?.message ?? "Failed to place call")
      roomRef.current = null
      setCallData(null)
    }
  }

  // Uses refs so room event listeners never go stale.
  const finishCall = useCallback(async ({ answered = false } = {}) => {
    if (finishedRef.current) return
    finishedRef.current = true
    setCallState("ending")
    clearInterval(timerRef.current)
    const dur = durationRef.current

    try {
      const id = callDataRef.current?.callId
      if (id) {
        await api.post(`/v1/voice/dialer/${id}/complete`, {
          durationSecs: dur,
          answered,
          status: answered ? "completed" : "missed",
        }).catch(() => {})
      }
    } finally {
      setCallState("ended")
      setTimeout(() => {
        setCallState("idle")
        setCallData(null)
        callDataRef.current = null
        setDuration(0)
        setMuted(false)
        roomRef.current = null
      }, 2000)
    }
  }, []) // stable — only uses refs

  const handleHangup = async () => {
    const id = callDataRef.current?.callId
    if (id) await api.post(`/v1/voice/dialer/${id}/hangup`).catch(() => {})
    roomRef.current?.disconnect()
    await finishCall({ answered: callState === "connected" })
  }

  const toggleMute = async () => {
    const room = roomRef.current
    if (!room) return
    const next = !muted
    await room.localParticipant.setMicrophoneEnabled(!next)
    setMuted(next)
  }

  const isInCall    = ["connecting", "ringing", "connected", "ending"].includes(callState)
  const displayName = callData?.contactName || callData?.to || toNumber

  // ── Collapsed button ──────────────────────────────────────────────
  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
        style={{ background: `${GREEN}15`, color: GREEN, border: `1px solid ${GREEN}30` }}
      >
        <Phone className="w-3.5 h-3.5" />
        New Call
      </button>
    )
  }

  // ── Expanded panel ────────────────────────────────────────────────
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${GREEN}15`, color: GREEN }}>
            <Phone className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-semibold" style={{ color: TEXT }}>Dial</span>
          {config && !config.ready && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${RED}12`, color: RED }}>
              {!config.livekitConfigured ? "LiveKit not configured" : !config.numbers?.length ? "No DID number provisioned" : "Not ready"}
            </span>
          )}
        </div>
        <button onClick={() => setExpanded(false)} style={{ color: TEXT_FAINT }}>
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5">
        {/* In-call view */}
        {isInCall ? (
          <div className="text-center space-y-5">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-xl font-bold"
              style={{ background: `${GREEN}15`, color: GREEN }}
            >
              {displayName?.[0]?.toUpperCase() ?? "?"}
            </div>

            <div>
              <div className="text-sm font-semibold" style={{ color: TEXT }}>{displayName}</div>
              <div className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>
                {callState === "connecting" && "Connecting…"}
                {callState === "ringing"    && "Ringing…"}
                {callState === "connected"  && fmtDuration(duration)}
                {callState === "ending"     && "Ending…"}
              </div>
            </div>

            {/* Animated ring for ringing state */}
            {callState === "ringing" && (
              <div className="flex justify-center">
                <span
                  className="w-3 h-3 rounded-full animate-ping"
                  style={{ background: GREEN, opacity: 0.6 }}
                />
              </div>
            )}

            {/* Call controls */}
            <div className="flex items-center justify-center gap-4">
              {/* Mute */}
              <button
                onClick={toggleMute}
                disabled={callState !== "connected"}
                className="w-11 h-11 rounded-full flex items-center justify-center transition-all disabled:opacity-40"
                style={{
                  background: muted ? `${RED}15` : `${BLUE}12`,
                  color: muted ? RED : BLUE,
                  border: `1px solid ${muted ? RED : BLUE}30`,
                }}
              >
                {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Hangup */}
              <button
                onClick={handleHangup}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:opacity-90"
                style={{ background: RED, color: "#fff" }}
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : callState === "ended" ? (
          <div className="text-center py-4">
            <div className="text-sm font-medium mb-1" style={{ color: TEXT }}>Call ended</div>
            <div className="text-xs" style={{ color: TEXT_MUTED }}>{fmtDuration(duration)}</div>
          </div>
        ) : (
          /* Idle form */
          <div className="space-y-4">
            {/* From number selector */}
            {config?.numbers?.length > 1 && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_MUTED }}>From</label>
                <select
                  value={fromNumber}
                  onChange={e => setFromNumber(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }}
                >
                  {config.numbers.map(n => (
                    <option key={n.phoneNumber} value={n.phoneNumber}>{n.phoneNumber}</option>
                  ))}
                </select>
              </div>
            )}

            {/* To number */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_MUTED }}>To *</label>
              <input
                type="tel"
                value={toNumber}
                onChange={e => setToNumber(e.target.value)}
                onKeyDown={e => e.key === "Enter" && config?.ready && handleDial()}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }}
              />
            </div>

            {/* Contact name */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_MUTED }}>Name (optional)</label>
              <input
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                placeholder="Customer name"
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }}
              />
            </div>

            {error && (
              <div className="text-xs px-3 py-2 rounded-xl" style={{ background: `${RED}10`, color: RED }}>
                {error}
              </div>
            )}

            <button
              onClick={handleDial}
              disabled={!toNumber.trim() || !config?.ready}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: GREEN }}
            >
              <Phone className="w-4 h-4" />
              Call
            </button>

            {config && !config.ready && (
              <p className="text-[10px] text-center" style={{ color: TEXT_FAINT }}>
                Provision a number and configure LiveKit to enable calling.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
