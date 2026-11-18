"use client"

/**
 * VoiceDialer — web click-to-call with two modes:
 *
 *  "app"    (Browser WebRTC) — this tab joins the LiveKit room as an audio
 *           participant; Plivo dials the customer as a SIP leg.
 *
 *  "bridge" (PSTN bridge)   — LiveKit calls YOUR phone first (waitUntilAnswered),
 *           then bridges the customer in. No browser audio needed; your physical
 *           phone IS the agent leg. Browser just tracks status + offers hangup.
 */

import { useEffect, useRef, useState, useCallback } from "react"
import { Phone, PhoneOff, Mic, MicOff, X, Smartphone, Globe, ChevronDown } from "lucide-react"
import { api } from "@/lib/api"

const PINK       = "oklch(0.58 0.24 350)"
const BLUE       = "oklch(0.52 0.20 255)"
const GREEN      = "oklch(0.50 0.18 145)"
const RED        = "oklch(0.52 0.22 25)"
const AMBER      = "oklch(0.72 0.14 65)"
const CARD_BG    = "oklch(1 0 0)"
const CARD_BORDER = "oklch(0.91 0.008 350)"
const TEXT       = "oklch(0.14 0.008 270)"
const TEXT_MUTED = "oklch(0.55 0.008 270)"
const TEXT_FAINT = "oklch(0.65 0.008 270)"
const INPUT_BG   = "oklch(0.96 0.005 350)"
const INPUT_BORDER = "oklch(0.90 0.008 350)"

function fmtDuration(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

// ── Mode pill ─────────────────────────────────────────────────────────────────
function ModePill({ active, icon: Icon, label, description, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-center transition-all"
      style={{
        background: active ? `${color}12` : "transparent",
        border: `1px solid ${active ? color + "40" : CARD_BORDER}`,
        color: active ? color : TEXT_FAINT,
      }}
    >
      <Icon className="w-4 h-4" />
      <span className="text-xs font-semibold">{label}</span>
      <span className="text-[9px] leading-tight" style={{ color: active ? color : TEXT_FAINT, opacity: 0.8 }}>
        {description}
      </span>
    </button>
  )
}

export function VoiceDialer() {
  const [expanded, setExpanded]       = useState(false)
  const [mode, setMode]               = useState("app")       // "app" | "bridge"
  const [config, setConfig]           = useState(null)
  const [toNumber, setToNumber]       = useState("")
  const [contactName, setContactName] = useState("")
  const [fromNumber, setFromNumber]   = useState("")
  const [agentNumber, setAgentNumber] = useState("")           // bridge mode: your phone
  const [callState, setCallState]     = useState("idle")       // idle|connecting|ringing|connected|ending|ended
  const [callData, setCallData]       = useState(null)
  const [muted, setMuted]             = useState(false)
  const [duration, setDuration]       = useState(0)
  const [error, setError]             = useState("")

  const roomRef      = useRef(null)
  const timerRef     = useRef(null)
  const pollRef      = useRef(null)
  const durationRef  = useRef(0)
  const callDataRef  = useRef(null)
  const finishedRef  = useRef(false)

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

  // Duration timer
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

  // Cleanup on unmount
  useEffect(() => () => {
    clearInterval(timerRef.current)
    clearInterval(pollRef.current)
    roomRef.current?.disconnect()
  }, [])

  const finishCall = useCallback(async ({ answered = false } = {}) => {
    if (finishedRef.current) return
    finishedRef.current = true
    setCallState("ending")
    clearInterval(timerRef.current)
    clearInterval(pollRef.current)
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
        finishedRef.current = false
        roomRef.current = null
      }, 2500)
    }
  }, [])

  // ── Bridge mode: poll active calls to detect when call connects / ends ───────
  const startBridgePoll = useCallback((callId) => {
    let consecutiveMissed = 0
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get("/v1/voice/dialer/active")
        const calls = res.data?.data?.calls ?? res.data?.calls ?? []
        const live = calls.find(c => c.callId === callId)
        if (live) {
          consecutiveMissed = 0
          // If we're still in ringing/connecting and there's a live call, it means
          // at least the agent leg is up — treat as connected.
          setCallState(s => (s === "ringing" || s === "connecting") ? "connected" : s)
        } else {
          consecutiveMissed++
          // Call disappeared — both legs hung up.
          if (consecutiveMissed >= 2) finishCall({ answered: durationRef.current > 0 })
        }
      } catch (_) {}
    }, 3000)
  }, [finishCall])

  // ── App mode (browser WebRTC) ─────────────────────────────────────────────
  const dialAppMode = useCallback(async (data) => {
    const { Room, RoomEvent, ConnectionState } = await import("livekit-client")
    const room = new Room()
    roomRef.current = room

    room.on(RoomEvent.ParticipantConnected, (participant) => {
      if (participant.identity?.startsWith("phone-")) setCallState("connected")
    })
    room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      if (participant.identity?.startsWith("phone-")) finishCall({ answered: true })
    })
    room.on(RoomEvent.Disconnected, () => {
      finishCall({ answered: durationRef.current > 0 })
    })
    room.on(RoomEvent.ConnectionStateChanged, (state) => {
      if (state === ConnectionState.Disconnected) finishCall({ answered: durationRef.current > 0 })
    })

    await room.connect(data.livekitUrl, data.token)
    await room.localParticipant.setMicrophoneEnabled(true)

    // Check if SIP participant already in room (fast answer)
    const sipAlready = [...room.remoteParticipants.values()].find(p =>
      p.identity?.startsWith("phone-")
    )
    if (sipAlready) setCallState("connected")
    else setCallState("ringing")
  }, [finishCall])

  const handleDial = async () => {
    if (!toNumber.trim()) return
    if (mode === "bridge" && !agentNumber.trim()) {
      setError("Enter your phone number to bridge to")
      return
    }
    setError("")
    setCallState("connecting")
    setDuration(0)
    finishedRef.current = false

    try {
      const body = {
        to: toNumber.trim(),
        from: fromNumber || undefined,
        contactName: contactName.trim() || undefined,
        mode,
        ...(mode === "bridge" ? { agentNumber: agentNumber.trim() } : {}),
      }
      const res = await api.post("/v1/voice/dialer/dial", body)
      const data = res.data?.data ?? res.data
      setCallData(data)
      callDataRef.current = data

      if (mode === "app") {
        await dialAppMode(data)
      } else {
        // Bridge mode: LiveKit will call agentNumber first; just track via polling.
        setCallState("ringing")
        startBridgePoll(data.callId)
      }
    } catch (err) {
      setCallState("idle")
      setError(err?.response?.data?.message ?? err?.message ?? "Failed to place call")
      roomRef.current = null
      setCallData(null)
      callDataRef.current = null
      finishedRef.current = false
    }
  }

  const handleHangup = async () => {
    clearInterval(pollRef.current)
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

  // ── Collapsed button ──────────────────────────────────────────────────────
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

  // ── Expanded panel ────────────────────────────────────────────────────────
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
              {!config.livekitConfigured ? "LiveKit not configured"
                : !config.numbers?.length ? "No DID number provisioned"
                : "Not ready"}
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
                {callState === "ringing" && mode === "bridge" && "Your phone will ring soon…"}
                {callState === "ringing" && mode === "app"    && "Ringing customer…"}
                {callState === "connected" && fmtDuration(duration)}
                {callState === "ending" && "Ending…"}
              </div>
              {callState === "ringing" && mode === "bridge" && (
                <div className="text-[10px] mt-1" style={{ color: TEXT_FAINT }}>
                  Pick up — customer connects once you answer
                </div>
              )}
            </div>

            {/* Animated ring */}
            {callState === "ringing" && (
              <div className="flex justify-center">
                <span
                  className="w-3 h-3 rounded-full animate-ping"
                  style={{ background: callState === "ringing" ? AMBER : GREEN, opacity: 0.6 }}
                />
              </div>
            )}

            {/* Call controls */}
            <div className="flex items-center justify-center gap-4">
              {/* Mute — only in app mode (browser has the mic) */}
              {mode === "app" && (
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
              )}

              {/* Hangup */}
              <button
                onClick={handleHangup}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:opacity-90"
                style={{ background: RED, color: "#fff" }}
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>

            {/* Bridge mode info */}
            {mode === "bridge" && callState === "connected" && (
              <p className="text-[10px]" style={{ color: TEXT_FAINT }}>
                Call is live on your phone — hang up from here or from your phone
              </p>
            )}
          </div>
        ) : callState === "ended" ? (
          <div className="text-center py-4">
            <div className="text-sm font-medium mb-1" style={{ color: TEXT }}>Call ended</div>
            <div className="text-xs" style={{ color: TEXT_MUTED }}>{fmtDuration(duration)}</div>
          </div>
        ) : (
          /* Idle form */
          <div className="space-y-4">
            {/* Mode selector */}
            <div className="flex gap-2">
              <ModePill
                active={mode === "app"}
                icon={Globe}
                label="Browser"
                description="Talk from this tab (WebRTC)"
                color={BLUE}
                onClick={() => setMode("app")}
              />
              <ModePill
                active={mode === "bridge"}
                icon={Smartphone}
                label="PSTN Bridge"
                description="LiveKit calls your phone, bridges customer"
                color={AMBER}
                onClick={() => setMode("bridge")}
              />
            </div>

            {/* From number selector */}
            {config?.numbers?.length > 1 && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_MUTED }}>Caller ID</label>
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

            {/* Bridge: your phone number */}
            {mode === "bridge" && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_MUTED }}>
                  Your phone *
                  <span className="ml-1 font-normal" style={{ color: TEXT_FAINT }}>(LiveKit calls this first)</span>
                </label>
                <input
                  type="tel"
                  value={agentNumber}
                  onChange={e => setAgentNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }}
                />
              </div>
            )}

            {/* Customer number */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_MUTED }}>Customer *</label>
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
              style={{ background: mode === "bridge" ? AMBER : GREEN }}
            >
              <Phone className="w-4 h-4" />
              {mode === "bridge" ? "Call via your phone" : "Call from browser"}
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
