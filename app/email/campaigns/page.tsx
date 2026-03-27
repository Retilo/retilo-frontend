"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import {
  Mail, Sparkles, CheckCircle2, Clock, AlertCircle,
  Loader2, ArrowRight, Users, Eye, BarChart3,
} from "lucide-react"
import Link from "next/link"
import { apiFetch } from "@/lib/api"

type CampaignStatus = "draft" | "running" | "completed" | "failed"

interface Campaign {
  id: string
  name: string
  subject: string
  status: CampaignStatus
  total_recipients: number
  total_sent: number
  total_opened: number
  from_name: string
  from_email: string
  brief: string
  created_at: string
}

const STATUS_CONFIG: Record<CampaignStatus, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  draft: { label: "Draft", icon: Clock, color: "text-zinc-600", bg: "bg-zinc-100" },
  running: { label: "Sending", icon: Loader2, color: "text-blue-600", bg: "bg-blue-50" },
  completed: { label: "Sent", icon: CheckCircle2, color: "text-green-700", bg: "bg-green-50" },
  failed: { label: "Failed", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const cfg = STATUS_CONFIG[campaign.status] ?? STATUS_CONFIG.draft
  const StatusIcon = cfg.icon
  const openRate =
    campaign.total_sent > 0
      ? Math.round((campaign.total_opened / campaign.total_sent) * 100)
      : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-zinc-200 bg-white p-5 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-zinc-900 truncate text-sm leading-snug">
            {campaign.subject || campaign.name || "Untitled Campaign"}
          </p>
          <p className="text-xs text-zinc-400 mt-0.5 truncate">
            From: {campaign.from_name} &lt;{campaign.from_email}&gt;
          </p>
        </div>
        <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${cfg.bg} ${cfg.color}`}>
          <StatusIcon className={`size-3 ${campaign.status === "running" ? "animate-spin" : ""}`} />
          {cfg.label}
        </span>
      </div>

      {campaign.brief && (
        <p className="text-xs text-zinc-500 line-clamp-2 mb-3 leading-relaxed">
          {campaign.brief}
        </p>
      )}

      <div className="flex items-center gap-4 pt-3 border-t border-zinc-100">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Users className="size-3.5 text-zinc-400" />
          <span>{campaign.total_recipients ?? 0} recipients</span>
        </div>
        {campaign.total_sent > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Mail className="size-3.5 text-zinc-400" />
            <span>{campaign.total_sent} sent</span>
          </div>
        )}
        {openRate !== null && (
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Eye className="size-3.5 text-zinc-400" />
            <span>{openRate}% open rate</span>
          </div>
        )}
        <p className="ml-auto text-[11px] text-zinc-400">
          {new Date(campaign.created_at).toLocaleDateString("en-GB", {
            day: "numeric", month: "short", year: "numeric",
          })}
        </p>
      </div>
    </motion.div>
  )
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch("/v1/email/campaigns?limit=50")
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.campaigns ?? data?.data ?? [])
        setCampaigns(list)
      })
      .catch((err) => setError(err?.message ?? "Failed to load campaigns"))
      .finally(() => setLoading(false))
  }, [])

  const completed = campaigns.filter((c) => c.status === "completed").length
  const totalSent = campaigns.reduce((a, c) => a + (c.total_sent ?? 0), 0)
  const totalOpened = campaigns.reduce((a, c) => a + (c.total_opened ?? 0), 0)
  const avgOpenRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Email Campaigns</h1>
          <p className="text-sm text-zinc-500 mt-1">All AI-generated campaigns for your account</p>
        </div>
        <Link
          href="/email/agent"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white font-semibold text-sm shadow-md shadow-violet-200 hover:-translate-y-0.5 transition-all"
        >
          <Sparkles className="size-4" />
          New Campaign
        </Link>
      </div>

      {/* Stats row */}
      {!loading && campaigns.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {[
            { label: "Total campaigns", value: campaigns.length, icon: Mail },
            { label: "Emails sent", value: totalSent.toLocaleString(), icon: Users },
            { label: "Avg open rate", value: `${avgOpenRate}%`, icon: BarChart3 },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <stat.icon className="size-4 text-violet-500 mb-2" />
              <p className="text-2xl font-black text-zinc-900">{stat.value}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Campaign list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="size-8 text-violet-400 animate-spin" />
          <p className="text-sm text-zinc-500">Loading campaigns…</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="size-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <div className="mb-3 inline-flex size-12 items-center justify-center rounded-2xl bg-violet-50">
            <Mail className="size-6 text-violet-400" />
          </div>
          <h3 className="font-bold text-zinc-900 mb-1">No campaigns yet</h3>
          <p className="text-sm text-zinc-400 mb-5">
            Launch your first AI-powered email campaign
          </p>
          <Link
            href="/email/agent"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white font-semibold text-sm shadow-md shadow-violet-200 hover:-translate-y-0.5 transition-all"
          >
            <Sparkles className="size-4" />
            Launch Agent
            <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  )
}
