"use client"

import { useState } from "react"
import {
  MessageSquare, Search, Sparkles, Send,
  Phone, Mail, MapPin, Clock, ChevronRight,
} from "lucide-react"

const TEXT  = "oklch(0.14 0.008 270)"
const MUTED = "oklch(0.55 0.008 270)"
const FAINT = "oklch(0.70 0.008 270)"
const CARD  = "oklch(1 0 0)"
const BORDER= "oklch(0.91 0.008 270)"
const PINK  = "oklch(0.58 0.24 350)"
const BG    = "oklch(0.97 0.003 270)"

// ── Sample conversations (structured like real threads) ────────
const MOCK_THREADS = [
  {
    id: "1",
    source: "gmb",
    contact: "Sarah Mitchell",
    initials: "SM",
    lastMessage: "Thank you for getting back to me! Will the new hours start from Monday?",
    time: "2m ago",
    unread: 2,
    messages: [
      { id: "m1", from: "customer", text: "Hi, I wanted to ask about your opening hours on public holidays.", time: "9:42 AM" },
      { id: "m2", from: "business", text: "Hi Sarah! We're open 10am–4pm on most public holidays. Is there a specific date you're asking about?", time: "9:55 AM" },
      { id: "m3", from: "customer", text: "Thank you for getting back to me! Will the new hours start from Monday?", time: "10:02 AM" },
    ],
  },
  {
    id: "2",
    source: "whatsapp",
    contact: "James Okonkwo",
    initials: "JO",
    lastMessage: "Yes, I'll come in at 3pm. See you then!",
    time: "18m ago",
    unread: 0,
    messages: [
      { id: "m1", from: "customer", text: "Hey, is it possible to book a table for 4 tonight?", time: "Yesterday" },
      { id: "m2", from: "business", text: "Absolutely! We have availability at 7pm or 8:30pm. Which works for you?", time: "Yesterday" },
      { id: "m3", from: "customer", text: "Yes, I'll come in at 3pm. See you then!", time: "Yesterday" },
    ],
  },
  {
    id: "3",
    source: "gmb",
    contact: "Priya Sharma",
    initials: "PS",
    lastMessage: "I left a review — hope that helps!",
    time: "1h ago",
    unread: 1,
    messages: [
      { id: "m1", from: "customer", text: "I left a review — hope that helps!", time: "1h ago" },
    ],
  },
  {
    id: "4",
    source: "email",
    contact: "David Chen",
    initials: "DC",
    lastMessage: "Could you send me the menu PDF? Planning a work lunch.",
    time: "3h ago",
    unread: 1,
    messages: [
      { id: "m1", from: "customer", text: "Could you send me the menu PDF? Planning a work lunch.", time: "3h ago" },
    ],
  },
  {
    id: "5",
    source: "whatsapp",
    contact: "Aisha Osei",
    initials: "AO",
    lastMessage: "Thanks! I'll bring a friend.",
    time: "Yesterday",
    unread: 0,
    messages: [
      { id: "m1", from: "customer", text: "Do you have vegan options?", time: "Yesterday" },
      { id: "m2", from: "business", text: "Yes! We have a full vegan menu available. Feel free to ask our staff when you arrive.", time: "Yesterday" },
      { id: "m3", from: "customer", text: "Thanks! I'll bring a friend.", time: "Yesterday" },
    ],
  },
]

// ── Source badge ───────────────────────────────────────────────
function SourceDot({ source }) {
  const colors = {
    gmb:      "#4285F4",
    whatsapp: "#25D366",
    email:    "#8B5CF6",
  }
  return (
    <span
      className="size-2 rounded-full shrink-0"
      style={{ background: colors[source] ?? MUTED }}
      title={source}
    />
  )
}

function SourceIcon({ source }) {
  const icons = {
    gmb:      <MapPin className="size-3" />,
    whatsapp: <Phone className="size-3" />,
    email:    <Mail className="size-3" />,
  }
  return icons[source] ?? <MessageSquare className="size-3" />
}

// ── Thread list item ───────────────────────────────────────────
function ThreadItem({ thread, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 px-4 py-3 text-left transition-all"
      style={{
        background: active ? "oklch(0.58 0.24 350 / 6%)" : "transparent",
        borderLeft: active ? `2px solid ${PINK}` : "2px solid transparent",
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "oklch(0.94 0.003 270)" } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent" } }}
    >
      <div
        className="size-9 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
        style={{ background: `${PINK}18`, color: PINK }}
      >
        {thread.initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[13px] font-semibold truncate" style={{ color: TEXT }}>
            {thread.contact}
          </span>
          <SourceDot source={thread.source} />
          <span className="ml-auto text-[10px] shrink-0" style={{ color: FAINT }}>{thread.time}</span>
        </div>
        <p className="text-[12px] truncate" style={{ color: MUTED }}>{thread.lastMessage}</p>
      </div>

      {thread.unread > 0 && (
        <span
          className="size-4.5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 mt-0.5"
          style={{ background: PINK }}
        >
          {thread.unread}
        </span>
      )}
    </button>
  )
}

// ── Message bubble ─────────────────────────────────────────────
function Bubble({ msg }) {
  const isUs = msg.from === "business"
  return (
    <div className={`flex ${isUs ? "justify-end" : "justify-start"}`}>
      <div
        className="max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
        style={isUs
          ? { background: PINK, color: "white" }
          : { background: CARD, color: TEXT, border: `1px solid ${BORDER}` }
        }
      >
        {msg.text}
        <div
          className="text-[10px] mt-1 text-right"
          style={{ color: isUs ? "rgba(255,255,255,0.6)" : FAINT }}
        >
          {msg.time}
        </div>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────
export default function ConversationsPage() {
  const [activeId, setActiveId] = useState(MOCK_THREADS[0].id)
  const [search, setSearch] = useState("")
  const [reply, setReply] = useState("")
  const [threads, setThreads] = useState(MOCK_THREADS)
  const [generating, setGenerating] = useState(false)

  const active = threads.find(t => t.id === activeId)

  const filtered = threads.filter(t =>
    t.contact.toLowerCase().includes(search.toLowerCase()) ||
    t.lastMessage.toLowerCase().includes(search.toLowerCase())
  )

  const handleSend = () => {
    if (!reply.trim() || !active) return
    const newMsg = { id: `m${Date.now()}`, from: "business", text: reply.trim(), time: "Just now" }
    setThreads(prev => prev.map(t =>
      t.id === active.id
        ? { ...t, messages: [...t.messages, newMsg], lastMessage: reply.trim(), time: "Just now", unread: 0 }
        : t
    ))
    setReply("")
  }

  const handleAI = async () => {
    setGenerating(true)
    // Simulate AI draft
    await new Promise(r => setTimeout(r, 900))
    const drafts = [
      "Thanks for reaching out! Happy to help. Could you share a bit more detail so I can assist you better?",
      "Hi! Thanks for your message. We'd love to help — let us know what you need and we'll get back to you shortly.",
      "Thank you for contacting us! I'll look into this and get back to you with an answer as soon as possible.",
    ]
    setReply(drafts[Math.floor(Math.random() * drafts.length)])
    setGenerating(false)
  }

  return (
    <div className="flex h-full overflow-hidden" style={{ background: BG }}>

      {/* Thread list */}
      <div
        className="w-72 shrink-0 flex flex-col border-r overflow-hidden"
        style={{ background: CARD, borderColor: BORDER }}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b shrink-0" style={{ borderColor: BORDER }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold" style={{ color: TEXT }}>Conversations</span>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: `${PINK}12`, color: PINK }}
            >
              {threads.filter(t => t.unread > 0).length} new
            </span>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5" style={{ color: FAINT }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full pl-7 pr-3 py-1.5 rounded-lg text-[12px] outline-none transition-all"
              style={{ background: "oklch(0.96 0.003 270)", border: `1px solid ${BORDER}`, color: TEXT }}
              onFocus={e => e.target.style.borderColor = PINK}
              onBlur={e => e.target.style.borderColor = BORDER}
            />
          </div>
        </div>

        {/* Source filter pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b shrink-0" style={{ borderColor: BORDER }}>
          {["all", "gmb", "whatsapp", "email"].map(s => (
            <button
              key={s}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide transition-all"
              style={{ background: "oklch(0.94 0.005 270)", color: MUTED }}
            >
              {s === "all" ? "All" : s === "gmb" ? "GMB" : s === "whatsapp" ? "WA" : "Email"}
            </button>
          ))}
        </div>

        {/* Thread items */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map(t => (
            <ThreadItem
              key={t.id}
              thread={t}
              active={t.id === activeId}
              onClick={() => {
                setActiveId(t.id)
                setThreads(prev => prev.map(x => x.id === t.id ? { ...x, unread: 0 } : x))
              }}
            />
          ))}
        </div>
      </div>

      {/* Chat view */}
      {active ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat header */}
          <div
            className="flex items-center gap-3 px-5 py-3 border-b shrink-0"
            style={{ background: CARD, borderColor: BORDER }}
          >
            <div
              className="size-9 rounded-full flex items-center justify-center text-[12px] font-bold"
              style={{ background: `${PINK}18`, color: PINK }}
            >
              {active.initials}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold" style={{ color: TEXT }}>{active.contact}</span>
                <span
                  className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md font-semibold"
                  style={{ color: MUTED, background: "oklch(0.93 0.005 270)" }}
                >
                  <SourceIcon source={active.source} />
                  {active.source === "gmb" ? "Google Business" : active.source === "whatsapp" ? "WhatsApp" : "Email"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px]" style={{ color: FAINT }}>
                <Clock className="size-2.5" />
                Last active {active.time}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3" style={{ background: BG }}>
            {active.messages.map(msg => (
              <Bubble key={msg.id} msg={msg} />
            ))}
          </div>

          {/* Compose */}
          <div className="px-5 py-4 border-t" style={{ background: CARD, borderColor: BORDER }}>
            <div
              className="flex items-end gap-2 rounded-2xl p-3"
              style={{ border: `1px solid ${BORDER}`, background: "oklch(0.985 0.003 270)" }}
            >
              <textarea
                rows={2}
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder="Write a reply…"
                className="flex-1 text-sm resize-none outline-none bg-transparent"
                style={{ color: TEXT, fontFamily: "inherit" }}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleAI}
                  disabled={generating}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-60"
                  style={{ background: `${PINK}12`, border: `1px solid ${PINK}25`, color: PINK }}
                >
                  <Sparkles className="size-3" />
                  {generating ? "…" : "AI"}
                </button>
                <button
                  onClick={handleSend}
                  disabled={!reply.trim()}
                  className="size-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 hover:opacity-90"
                  style={{ background: PINK }}
                >
                  <Send className="size-3.5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center" style={{ color: FAINT }}>
          <p className="text-sm">Select a conversation</p>
        </div>
      )}
    </div>
  )
}
