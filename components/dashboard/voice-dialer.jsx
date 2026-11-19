"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Phone, PhoneOff, Mic, MicOff, Delete, Globe, Smartphone } from "lucide-react"
import { api } from "@/lib/api"

const GREEN       = "oklch(0.50 0.18 145)"
const RED         = "oklch(0.52 0.22 25)"
const BLUE        = "oklch(0.52 0.20 255)"
const AMBER       = "oklch(0.72 0.14 65)"
const CARD_BG     = "oklch(1 0 0)"
const CARD_BORDER = "oklch(0.91 0.008 350)"
const TEXT        = "oklch(0.14 0.008 270)"
const TEXT_MUTED  = "oklch(0.55 0.008 270)"
const TEXT_FAINT  = "oklch(0.65 0.008 270)"
const INPUT_BG    = "oklch(0.96 0.005 350)"
const INPUT_BORDER = "oklch(0.90 0.008 350)"
const KEY_BG      = "oklch(0.97 0.004 270)"
const KEY_ACTIVE  = "oklch(0.93 0.006 270)"

const KEYPAD = [
  [["1",""],["2","ABC"],["3","DEF"]],
  [["4","GHI"],["5","JKL"],["6","MNO"]],
  [["7","PQRS"],["8","TUV"],["9","WXYZ"]],
  [["*",""],["0","+"],["#",""]],
]

function fmtDuration(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

export function VoiceDialer() {
  const [mode, setMode]               = useState("bridge")
  const [config, setConfig]           = useState(null)
  const [display, setDisplay]         = useState("")
  const [agentNumber, setAgentNumber] = useState("")
  const [fromNumber, setFromNumber]   = useState("")
  const [callState, setCallState]     = useState("idle")
  const [callData, setCallData]       = useState(null)
  const [muted, setMuted]             = useState(false)
  const [duration, setDuration]       = useState(0)
  const [error, setError]             = useState("")
  const [pressedKey, setPressedKey]   = useState(null)

  const roomRef      = useRef(null)
  const timerRef     = useRef(null)
  const pollRef      = useRef(null)
  const durationRef  = useRef(0)
  const callDataRef  = useRef(null)
  const finishedRef  = useRef(false)

  useEffect(() => {
    api.get("/v1/voice/dialer/config")
      .then(res => {
        const d = res.data?.data ?? res.data
        setConfig(d)
        if (d?.numbers?.length) setFromNumber(d.numbers[0].phoneNumber)
      })
      .catch(() => {})
  }, [])

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
          durationSecs: dur, answered,
          status: answered ? "completed" : "missed",
        }).catch(() => {})
      }
    } finally {
      setCallState("ended")
      setTimeout(() => {
        setCallState("idle"); setCallData(null); callDataRef.current = null
        setDuration(0); setMuted(false); finishedRef.current = false; roomRef.current = null
      }, 2000)
    }
  }, [])

  const startBridgePoll = useCallback((callId) => {
    let misses = 0
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get("/v1/voice/dialer/active")
        const calls = res.data?.data?.calls ?? res.data?.calls ?? []
        const live = calls.find(c => c.callId === callId)
        if (live) {
          misses = 0
          setCallState(s => (s === "ringing" || s === "connecting") ? "connected" : s)
        } else {
          misses++
          if (misses >= 2) finishCall({ answered: durationRef.current > 0 })
        }
      } catch (_) {}
    }, 3000)
  }, [finishCall])

  const dialAppMode = useCallback(async (data) => {
    const { Room, RoomEvent } = await import("livekit-client")
    const room = new Room()
    roomRef.current = room
    room.on(RoomEvent.ParticipantConnected, (p) => {
      if (p.identity?.startsWith("phone-")) setCallState("connected")
    })
    room.on(RoomEvent.ParticipantDisconnected, (p) => {
      if (p.identity?.startsWith("phone-")) finishCall({ answered: true })
    })
    room.on(RoomEvent.Disconnected, () => finishCall({ answered: durationRef.current > 0 }))
    await room.connect(data.livekitUrl, data.token)
    await room.localParticipant.setMicrophoneEnabled(true)
    const sipAlready = [...room.remoteParticipants.values()].find(p => p.identity?.startsWith("phone-"))
    setCallState(sipAlready ? "connected" : "ringing")
  }, [finishCall])

  const pressKey = (key) => {
    if (isInCall) return
    setPressedKey(key)
    setTimeout(() => setPressedKey(null), 120)
    setDisplay(d => d.length < 15 ? d + key : d)
  }

  const handleDial = async () => {
    const to = display.trim()
    if (!to) return
    if (mode === "bridge" && !agentNumber.trim()) { setError("Enter your phone to bridge to"); return }
    setError(""); setCallState("connecting"); setDuration(0); finishedRef.current = false
    try {
      const body = {
        to, from: fromNumber || undefined, mode,
        ...(mode === "bridge" ? { agentNumber: agentNumber.trim() } : {}),
      }
      const res = await api.post("/v1/voice/dialer/dial", body)
      const data = res.data?.data ?? res.data
      setCallData(data); callDataRef.current = data
      if (mode === "app") await dialAppMode(data)
      else { setCallState("ringing"); startBridgePoll(data.callId) }
    } catch (err) {
      setCallState("idle"); setError(err?.response?.data?.message ?? err?.message ?? "Call failed")
      roomRef.current = null; setCallData(null); callDataRef.current = null; finishedRef.current = false
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
    if (!roomRef.current) return
    const next = !muted
    await roomRef.current.localParticipant.setMicrophoneEnabled(!next)
    setMuted(next)
  }

  const isInCall    = ["connecting", "ringing", "connected", "ending"].includes(callState)
  const callColor   = mode === "bridge" ? AMBER : GREEN
  const displayTo   = callData?.to?.replace(/^\+91/, "") ?? display

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>

      {/* Mode tabs */}
      <div className="flex" style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
        {[
          { key: "bridge", label: "PSTN", icon: Smartphone, color: AMBER, hint: "Your phone rings" },
          { key: "app",    label: "Browser",  icon: Globe,       color: BLUE,  hint: "Talk from this tab" },
        ].map(({ key, label, icon: Icon, color, hint }) => (
          <button
            key={key}
            onClick={() => !isInCall && setMode(key)}
            disabled={isInCall}
            title={hint}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all"
            style={{
              color:        mode === key ? color : TEXT_FAINT,
              borderBottom: mode === key ? `2px solid ${color}` : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3">

        {/* Number display */}
        <div
          className="flex items-center gap-2 px-3 rounded-xl"
          style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, minHeight: 46 }}
        >
          <span className="text-sm font-mono flex-shrink-0" style={{ color: TEXT_FAINT }}>+91</span>
          <span className="flex-1 text-xl font-mono font-semibold tracking-wider py-2" style={{ color: TEXT }}>
            {isInCall ? displayTo : display}
          </span>
          {!isInCall && display && (
            <button
              onClick={() => setDisplay(d => d.slice(0, -1))}
              className="p-1.5 rounded-lg transition-all hover:bg-black/5"
              style={{ color: TEXT_FAINT }}
            >
              <Delete className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* In-call status bar */}
        {isInCall && (
          <div className="flex items-center justify-center gap-2 py-0.5">
            {callState === "ringing" && (
              <div className="flex gap-0.5">
                {[0.3, 0.6, 1, 0.6, 0.3].map((o, i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: callColor, opacity: o }}
                  />
                ))}
              </div>
            )}
            <span className="text-xs font-medium" style={{ color: TEXT_MUTED }}>
              {callState === "connecting" && "Connecting…"}
              {callState === "ringing" && mode === "bridge" && "Your phone ringing…"}
              {callState === "ringing" && mode === "app"    && "Ringing customer…"}
              {callState === "connected" && fmtDuration(duration)}
              {callState === "ending" && "Ending…"}
            </span>
          </div>
        )}

        {callState === "ended" && (
          <div className="text-center text-xs font-medium py-0.5" style={{ color: TEXT_MUTED }}>
            Call ended · {fmtDuration(duration)}
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-1.5">
          {KEYPAD.flat().map(([key, sub]) => (
            <button
              key={key}
              onClick={() => pressKey(key)}
              className="flex flex-col items-center justify-center rounded-xl py-3 transition-all select-none"
              style={{
                background: pressedKey === key ? KEY_ACTIVE : KEY_BG,
                color: TEXT,
                transform: pressedKey === key ? "scale(0.95)" : "scale(1)",
              }}
            >
              <span className="text-base font-semibold leading-none">{key}</span>
              {sub && (
                <span className="text-[8px] font-bold mt-0.5 tracking-widest" style={{ color: TEXT_FAINT }}>
                  {sub}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bridge: your phone */}
        {mode === "bridge" && !isInCall && (
          <div>
            <label className="block text-[10px] font-medium mb-1" style={{ color: TEXT_FAINT }}>
              Your phone — we call this first
            </label>
            <input
              type="tel"
              value={agentNumber}
              onChange={e => setAgentNumber(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full rounded-xl px-3 py-2 text-xs outline-none"
              style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }}
            />
          </div>
        )}

        {/* Caller ID (multiple numbers) */}
        {config?.numbers?.length > 1 && !isInCall && (
          <div>
            <label className="block text-[10px] font-medium mb-1" style={{ color: TEXT_FAINT }}>Caller ID</label>
            <select
              value={fromNumber}
              onChange={e => setFromNumber(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-xs outline-none"
              style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }}
            >
              {config.numbers.map(n => (
                <option key={n.phoneNumber} value={n.phoneNumber}>{n.phoneNumber}</option>
              ))}
            </select>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-xs px-3 py-2 rounded-xl" style={{ background: `${RED}10`, color: RED }}>
            {error}
          </div>
        )}

        {/* CTA */}
        {isInCall ? (
          <div className="flex gap-2">
            {mode === "app" && (
              <button
                onClick={toggleMute}
                disabled={callState !== "connected"}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
                style={{ background: muted ? `${RED}15` : `${BLUE}12`, color: muted ? RED : BLUE }}
              >
                {muted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                {muted ? "Unmute" : "Mute"}
              </button>
            )}
            <button
              onClick={handleHangup}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-xs font-semibold transition-all hover:opacity-90"
              style={{ background: RED }}
            >
              <PhoneOff className="w-3.5 h-3.5" />
              Hang Up
            </button>
          </div>
        ) : (
          <button
            onClick={handleDial}
            disabled={!display.trim() || callState === "ended" || (config !== null && !config.ready)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: callColor }}
          >
            <Phone className="w-4 h-4" />
            {mode === "bridge" ? "Call via your phone" : "Call from browser"}
          </button>
        )}

        {config !== null && !config.ready && !isInCall && (
          <p className="text-[10px] text-center" style={{ color: TEXT_FAINT }}>
            {!config.numbers?.length ? "Provision a number first" : "LiveKit not configured"}
          </p>
        )}
      </div>
    </div>
  )
}
