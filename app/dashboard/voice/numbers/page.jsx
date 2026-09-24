"use client"

// Plivo calling provisioning panel (see retilo-backend API_DOCS §15b)
// Flow: activate (subaccount) → compliance (docs upload) → search → buy.
// Status:  GET  /v1/voice/plivo/status
// Onboard: POST /v1/voice/plivo/onboard { name, password }
// Docs:    POST /v1/voice/plivo/compliance/submit (multipart reg_cert + gst_file)
// Search:  GET  /v1/voice/plivo/numbers/search?pattern=
// Buy:     POST /v1/voice/plivo/numbers/buy { number }

import { useEffect, useRef, useState } from "react"
import {
  Phone, ShieldCheck, Search, Loader2, CheckCircle2, AlertCircle,
  Upload, Hourglass, Power, Hash, RefreshCw,
} from "lucide-react"
import { DashboardPageLayout } from "@/components/dashboard/page-layout"
import { ModuleHelper } from "@/components/module-helper"
import { api } from "@/lib/api"

const PINK = "oklch(0.58 0.24 350)"
const BLUE = "oklch(0.52 0.20 255)"
const CARD_BG = "oklch(1 0 0)"
const CARD_BORDER = "oklch(0.91 0.008 350)"
const TEXT = "oklch(0.14 0.008 270)"
const TEXT_MUTED = "oklch(0.55 0.008 270)"
const TEXT_FAINT = "oklch(0.65 0.008 270)"
const INPUT_BG = "oklch(0.96 0.005 350)"
const INPUT_BORDER = "oklch(0.90 0.008 350)"
const GREEN = "oklch(0.50 0.18 145)"
const RED = "oklch(0.52 0.22 25)"

function StepCard({ index, done, active, icon: Icon, title, children }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: CARD_BG,
        border: `1px solid ${active ? `${BLUE}55` : CARD_BORDER}`,
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: done ? `${GREEN}12` : `${BLUE}${active ? "12" : "08"}`,
            color: done ? GREEN : active ? BLUE : TEXT_FAINT,
          }}
        >
          {done ? <CheckCircle2 className="w-4.5 h-4.5" /> : <Icon className="w-4.5 h-4.5" />}
        </div>
        <div className="text-sm font-bold" style={{ color: TEXT }}>
          <span style={{ color: TEXT_FAINT }} className="mr-1.5">{index}.</span>
          {title}
        </div>
      </div>
      {children}
    </div>
  )
}

function DocPicker({ label, file, onPick }) {
  const ref = useRef(null)
  return (
    <button
      onClick={() => ref.current?.click()}
      className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all hover:opacity-90"
      style={{
        background: INPUT_BG,
        border: `1px solid ${file ? `${GREEN}55` : INPUT_BORDER}`,
      }}
    >
      <input
        ref={ref}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />
      {file
        ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: GREEN }} />
        : <Upload className="w-4 h-4 flex-shrink-0" style={{ color: TEXT_MUTED }} />}
      <div className="min-w-0">
        <div className="text-xs font-semibold" style={{ color: TEXT }}>{label}</div>
        {file && <div className="text-[11px] truncate" style={{ color: TEXT_MUTED }}>{file.name}</div>}
      </div>
    </button>
  )
}

export default function PlivoNumbersPage() {
  const [status, setStatus] = useState(null)
  const [complianceLive, setComplianceLive] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  const [regFile, setRegFile] = useState(null)
  const [gstFile, setGstFile] = useState(null)

  const [pattern, setPattern] = useState("")
  const [offers, setOffers] = useState([])
  const [searching, setSearching] = useState(false)

  async function reload() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get("/v1/voice/plivo/status")
      const s = res.data?.data ?? null
      setStatus(s)
      if (s?.onboarded && s?.complianceStatus !== "not_started") {
        try {
          const c = await api.get("/v1/voice/plivo/compliance/status")
          setComplianceLive(c.data?.data?.status ?? null)
        } catch { /* status endpoint is best-effort */ }
      }
    } catch (e) {
      setError(e.response?.data?.message ?? "Could not load calling status")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload() }, [])

  const accepted = complianceLive === "accepted" || status?.complianceStatus === "accepted"
  const pending = complianceLive === "submitted" || status?.complianceStatus === "pending"
  const hasNumbers = (status?.numbers?.length ?? 0) > 0
  const step = !status?.onboarded ? 1 : !accepted && !hasNumbers ? 2 : 3

  async function activate() {
    setBusy(true); setError(null)
    try {
      const merchant = JSON.parse(localStorage.getItem("retilo_merchant") ?? "{}")
      const password = `Rt${Date.now().toString(36)}x!`
      await api.post("/v1/voice/plivo/onboard", {
        name: merchant.name || "retilo-merchant",
        password,
      })
      setNotice("Calling activated — your private telephony account is ready.")
      await reload()
    } catch (e) {
      setError(e.response?.data?.message ?? "Activation failed")
    } finally {
      setBusy(false)
    }
  }

  async function submitCompliance() {
    if (!regFile || !gstFile) return
    setBusy(true); setError(null)
    try {
      const form = new FormData()
      form.append("reg_cert", regFile)
      form.append("gst_file", gstFile)
      await api.post("/v1/voice/plivo/compliance/submit", form, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60_000,
      })
      setNotice("Documents submitted — Plivo usually reviews within 1–2 working days.")
      await reload()
    } catch (e) {
      setError(e.response?.data?.message ?? "Compliance submission failed")
    } finally {
      setBusy(false)
    }
  }

  async function search() {
    setSearching(true); setError(null)
    try {
      const res = await api.get("/v1/voice/plivo/numbers/search", {
        params: pattern ? { pattern } : {},
      })
      setOffers(res.data?.data?.numbers ?? [])
    } catch (e) {
      setError(e.response?.data?.message ?? "Number search failed")
    } finally {
      setSearching(false)
    }
  }

  async function buy(number) {
    if (!confirm(`Buy +${number}? Monthly rental will be billed to your account.`)) return
    setBusy(true); setError(null)
    try {
      await api.post("/v1/voice/plivo/numbers/buy", { number })
      setNotice(`+${number} is yours — incoming calls are wired up automatically.`)
      setOffers([])
      await reload()
    } catch (e) {
      setError(e.response?.data?.message ?? "Purchase failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <DashboardPageLayout
      title="Calling & Phone Numbers"
      subtitle="Buy a real business number in minutes — verification, purchase and call routing, all in one place"
      actions={
        <button
          onClick={reload}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
          style={{ background: `${BLUE}12`, color: BLUE, border: `1px solid ${BLUE}30` }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      }
    >
      <div className="max-w-3xl mx-auto px-8 py-6 space-y-5">
        <ModuleHelper
          moduleKey="plivo-numbers-v1"
          title="Your business number — how it works"
          description="Activate calling once, complete the one-time telecom verification (Registration/Udyam + GST), then search and buy an Indian number. It powers your AI receptionist and click-to-call — no SIM card needed."
          rimVariant="default"
        />

        {error && (
          <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-medium"
            style={{ background: `${RED}0d`, color: RED, border: `1px solid ${RED}30` }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}
        {notice && !error && (
          <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-medium"
            style={{ background: `${GREEN}0d`, color: GREEN, border: `1px solid ${GREEN}30` }}>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {notice}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }} />
            ))}
          </div>
        ) : (
          <>
            {/* Step 1 — Activate */}
            <StepCard index={1} icon={Power} title="Activate calling" done={!!status?.onboarded} active={step === 1}>
              {status?.onboarded ? (
                <div className="text-xs" style={{ color: TEXT_MUTED }}>
                  Active. {status.sipUri && <span style={{ color: TEXT_FAINT }}>{status.sipUri}</span>}
                </div>
              ) : (
                <>
                  <p className="text-xs mb-3" style={{ color: TEXT_MUTED }}>
                    One click creates your private telephony account — subaccount,
                    call routing apps and browser-calling endpoint.
                  </p>
                  <button
                    onClick={activate}
                    disabled={busy}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-xs font-semibold transition-all disabled:opacity-40 hover:opacity-90"
                    style={{ background: BLUE }}
                  >
                    {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Power className="w-3.5 h-3.5" />}
                    Activate calling
                  </button>
                </>
              )}
            </StepCard>

            {/* Step 2 — Compliance */}
            <StepCard index={2} icon={ShieldCheck} title="Business verification" done={accepted} active={step === 2}>
              {!status?.onboarded ? (
                <p className="text-xs" style={{ color: TEXT_FAINT }}>Activate calling first.</p>
              ) : accepted ? (
                <p className="text-xs" style={{ color: TEXT_MUTED }}>Verified — you can buy numbers.</p>
              ) : pending ? (
                <div className="flex items-center gap-2 text-xs" style={{ color: TEXT_MUTED }}>
                  <Hourglass className="w-4 h-4" style={{ color: BLUE }} />
                  Under review by Plivo — usually 1–2 working days. Hit Refresh to check.
                  {complianceLive === "rejected" && (
                    <span style={{ color: RED }}>Rejected — re-upload your documents.</span>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-xs mb-3" style={{ color: TEXT_MUTED }}>
                    Indian telecom rules require two documents before your first number
                    (PDF or photo).
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3 mb-3">
                    <DocPicker label="Registration / Udyam certificate" file={regFile} onPick={setRegFile} />
                    <DocPicker label="GST certificate" file={gstFile} onPick={setGstFile} />
                  </div>
                  <button
                    onClick={submitCompliance}
                    disabled={busy || !regFile || !gstFile}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-xs font-semibold transition-all disabled:opacity-40 hover:opacity-90"
                    style={{ background: BLUE }}
                  >
                    {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    Submit for verification
                  </button>
                </>
              )}
            </StepCard>

            {/* Step 3 — Numbers */}
            <StepCard index={3} icon={Hash} title="Get your number" done={hasNumbers} active={step === 3}>
              {!status?.onboarded ? (
                <p className="text-xs" style={{ color: TEXT_FAINT }}>Activate calling first.</p>
              ) : (
                <>
                  {hasNumbers && (
                    <div className="space-y-2 mb-4">
                      {status.numbers.map((n) => (
                        <div key={n} className="flex items-center gap-3 rounded-xl px-4 py-2.5"
                          style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}` }}>
                          <Phone className="w-4 h-4" style={{ color: GREEN }} />
                          <span className="text-sm font-bold" style={{ color: TEXT }}>+{n}</span>
                          <span className="ml-auto text-[11px] font-semibold" style={{ color: GREEN }}>Active</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {!accepted && !hasNumbers ? (
                    <p className="text-xs" style={{ color: TEXT_FAINT }}>
                      Complete verification above to unlock number purchase.
                    </p>
                  ) : (
                    <>
                      <div className="flex gap-2 mb-3">
                        <input
                          value={pattern}
                          onChange={(e) => setPattern(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && search()}
                          placeholder="Search pattern, e.g. 99"
                          className="flex-1 rounded-lg px-3 py-2 text-xs outline-none"
                          style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`, color: TEXT }}
                        />
                        <button
                          onClick={search}
                          disabled={searching}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-xs font-semibold transition-all disabled:opacity-40 hover:opacity-90"
                          style={{ background: PINK }}
                        >
                          {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                          Search
                        </button>
                      </div>
                      <div className="space-y-2">
                        {offers.slice(0, 10).map((o) => (
                          <div key={o.number} className="flex items-center gap-3 rounded-xl px-4 py-2.5"
                            style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}` }}>
                            <div className="min-w-0">
                              <div className="text-sm font-bold" style={{ color: TEXT }}>+{o.number}</div>
                              <div className="text-[11px]" style={{ color: TEXT_MUTED }}>
                                {[o.region, o.monthlyRentalRate && `$${o.monthlyRentalRate}/mo`].filter(Boolean).join(" · ")}
                              </div>
                            </div>
                            <button
                              onClick={() => buy(o.number)}
                              disabled={busy}
                              className="ml-auto px-4 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 hover:opacity-80"
                              style={{ background: `${PINK}12`, color: PINK, border: `1px solid ${PINK}30` }}
                            >
                              Buy
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </StepCard>
          </>
        )}
      </div>
    </DashboardPageLayout>
  )
}
