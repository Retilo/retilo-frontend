"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2, XCircle, AlertCircle, Share2, MessageCircle,
  Mail, Camera, Star, MapPin, Globe, Phone, Zap, ArrowLeft,
  TrendingUp, Shield, Search, ExternalLink, ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ScoreBreakdown { name: string; status: "pass" | "fail" | "partial"; points: number; maxPoints: number }

interface DimensionScore {
  score: number;
  max: number;
  breakdown?: ScoreBreakdown[];
  metrics?: Record<string, number>;
  rating?: number;
  reviewCount?: number;
  keywords?: { primary: string; secondary?: string[] };
}

interface TaskCheck { name: string; status: "pass" | "fail" | "partial"; issue: string | null }

interface TaskGroup {
  name: string;
  score: number;
  max: number;
  checks: TaskCheck[];
  metrics?: Record<string, number>;
}

interface Insight {
  id: number;
  type: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  action: string;
}

interface Review {
  author: string;
  rating: number;
  text: string;
  source: string;
  reviewedAt: string;
}

interface Report {
  id: string;
  status: string;
  metadata: {
    name: string;
    rating: number;
    priceLevel?: number;
    cuisines?: string[];
    description?: string;
    numLocations?: number;
    userRatingsTotal: number;
    website?: string;
    phone?: string;
    address?: { street?: string; city?: string; state?: string; zip?: string; country?: string };
    coordinates?: { latitude: number; longitude: number };
  };
  overallScore: number;
  maxScore: number;
  scores: {
    overall: DimensionScore;
    guestExperience: DimensionScore;
    reputation: DimensionScore;
    searchResults: DimensionScore;
  };
  taskGroups?: TaskGroup[];
  insights?: Insight[];
  media?: {
    photos?: string[];
    logo?: string;
    screenshots?: { mobile?: string; desktop?: string };
  };
  topReviews?: Review[];
  generatedAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function gradeLabel(score: number, max: number): { letter: string; label: string; color: string; bg: string; border: string; track: string } {
  const pct = max > 0 ? (score / max) * 100 : 0;
  if (pct >= 85) return { letter: "A", label: "Excellent",   color: "#16a34a", bg: "#dcfce7", border: "#bbf7d0", track: "#bbf7d0" };
  if (pct >= 70) return { letter: "B", label: "Good",        color: "#2563eb", bg: "#dbeafe", border: "#bfdbfe", track: "#93c5fd" };
  if (pct >= 55) return { letter: "C", label: "Average",     color: "#d97706", bg: "#fef3c7", border: "#fde68a", track: "#fcd34d" };
  if (pct >= 40) return { letter: "D", label: "Fair",        color: "#ea580c", bg: "#ffedd5", border: "#fed7aa", track: "#fdba74" };
  return             { letter: "F", label: "Needs Work",  color: "#dc2626", bg: "#fee2e2", border: "#fecaca", track: "#fca5a5" };
}

function useCountUp(target: number, duration = 1400, delay = 300) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let rafId: number;
    const timeout = setTimeout(() => {
      let startTime: number | null = null;
      const animate = (ts: number) => {
        if (!startTime) startTime = ts;
        const progress = Math.min((ts - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * target));
        if (progress < 1) rafId = requestAnimationFrame(animate);
      };
      rafId = requestAnimationFrame(animate);
    }, delay);
    return () => { clearTimeout(timeout); cancelAnimationFrame(rafId); };
  }, [target, duration, delay]);
  return count;
}

function priorityBadge(priority: "high" | "medium" | "low") {
  if (priority === "high") return { label: "High", color: "#dc2626", bg: "#fee2e2", border: "#fecaca" };
  if (priority === "medium") return { label: "Medium", color: "#ca8a04", bg: "#fef9c3", border: "#fef08a" };
  return { label: "Low", color: "#16a34a", bg: "#dcfce7", border: "#bbf7d0" };
}

function vitalStatus(name: string, value: number): "good" | "needs-work" | "poor" {
  if (name === "lcp") return value <= 2500 ? "good" : value <= 4000 ? "needs-work" : "poor";
  if (name === "cls") return value <= 100 ? "good" : value <= 250 ? "needs-work" : "poor";
  if (name === "inp") return value <= 200 ? "good" : value <= 500 ? "needs-work" : "poor";
  return "good";
}

const VITAL_COLORS = { good: "#16a34a", "needs-work": "#ca8a04", poor: "#dc2626" } as const;

function DimensionCard({
  label, color, icon: Icon, data, index
}: {
  label: string; color: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  data: DimensionScore; index: number;
}) {
  const animatedScore = useCountUp(data.score, 1200, 400 + index * 120);
  const pct = data.max > 0 ? (data.score / data.max) * 100 : 0;
  const animatedPct = data.max > 0 ? (animatedScore / data.max) * 100 : 0;
  const breakdown = data.breakdown ?? [];
  const passFails = breakdown.slice(0, 5);
  const grade = gradeLabel(data.score, data.max);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.07 }}
      className="rounded-2xl p-5 flex flex-col gap-4 bg-white"
      style={{ border: "1px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
            <Icon className="w-3.5 h-3.5" style={{ color }} />
          </div>
          <span className="text-gray-600 text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: grade.color, background: grade.bg }}>
            {grade.label}
          </span>
          <span className="font-bold text-lg tabular-nums" style={{ color }}>
            {animatedScore}<span className="text-gray-300 text-sm font-normal">/{data.max}</span>
          </span>
        </div>
      </div>

      {/* Overall bar */}
      <div>
        <div className="h-1.5 w-full rounded-full bg-gray-100">
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 + index * 0.1 }}
          />
        </div>
        <div className="text-xs text-gray-400 mt-1">{Math.round(animatedPct)}% of max score</div>
      </div>

      {/* Breakdown bars */}
      {passFails.length > 0 && (
        <div className="space-y-2">
          {passFails.map((item, i) => {
            const itemPct = item.maxPoints > 0 ? (item.points / item.maxPoints) * 100 : (item.status === "pass" ? 100 : 0);
            const itemColor = item.status === "pass" ? "#16a34a" : item.status === "partial" ? "#ca8a04" : "#dc2626";
            return (
              <div key={item.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500 capitalize">{item.name.replace(/-/g, " ")}</span>
                  <span style={{ color: itemColor }}>{item.points}/{item.maxPoints}</span>
                </div>
                <div className="h-1 w-full rounded-full bg-gray-100">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: itemColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${itemPct}%` }}
                    transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 + i * 0.06 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Web vitals */}
      {data.metrics && Object.keys(data.metrics).length > 0 && (
        <div className="grid grid-cols-3 gap-2 pt-1">
          {Object.entries(data.metrics).map(([k, v]) => {
            const status = vitalStatus(k, v as number);
            const vc = VITAL_COLORS[status];
            const display = (v as number) > 1000 ? `${((v as number)/1000).toFixed(1)}s` : `${v}`;
            return (
              <div key={k} className="text-center p-2 rounded-lg bg-gray-50">
                <div className="text-xs font-bold" style={{ color: vc }}>{display}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">{k}</div>
              </div>
            );
          })}
        </div>
      )}
      {data.rating !== undefined && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400 pt-1">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          {data.rating} rating · {data.reviewCount?.toLocaleString()} reviews
        </div>
      )}
      {data.keywords?.primary && (
        <div className="text-xs pt-1">
          <span className="text-gray-400">Top keyword: </span>
          <span style={{ color }}>{data.keywords.primary}</span>
        </div>
      )}
    </motion.div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InitialsAvatar({ name, size = 56 }: { name: string; size?: number }) {
  const initials = name
    ? name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";
  const colors = ["#7c3aed", "#2563eb", "#059669", "#d97706", "#dc2626"];
  const bg = colors[name ? name.charCodeAt(0) % colors.length : 0];
  return (
    <div
      className="rounded-2xl flex items-center justify-center shrink-0 font-bold text-white"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.33 }}
    >
      {initials}
    </div>
  );
}

function PresenceCard({ report }: { report: Report }) {
  const checks = (report.taskGroups ?? []).flatMap((g) => g.checks ?? []);
  const pass = (name: string) => checks.find((c) => c.name === name)?.status === "pass";

  const items = [
    { label: "Google Business verified", ok: true },
    { label: `Rating ${report.metadata?.rating ?? "?"} / 5`, ok: pass("high-rating") },
    { label: `${(report.metadata?.userRatingsTotal ?? 0).toLocaleString()} Google reviews`, ok: pass("sufficient-reviews") },
    { label: "HTTPS / SSL secure", ok: pass("has-ssl") },
    { label: "Booking / order CTA on website", ok: pass("has-cta") },
    { label: "Schema markup (rich results)", ok: pass("has-schema-markup") },
    { label: "Direct online ordering", ok: pass("has-online-ordering") },
    { label: "No 3rd-party commission links", ok: pass("no-external-ordering-links") },
    { label: "Social media presence", ok: pass("has-social-presence") },
  ];

  const passCount = items.filter((i) => i.ok).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-gray-900 font-semibold text-sm">Online presence</span>
        <span className="text-gray-400 text-xs">{passCount}/{items.length} passed</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-gray-100">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, oklch(0.55 0.24 280), oklch(0.58 0.24 350))" }}
          initial={{ width: 0 }}
          animate={{ width: `${(passCount / items.length) * 100}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>
      <div className="space-y-2">
        {items.map(({ label, ok }) => (
          <div key={label} className="flex items-center gap-2.5">
            {ok ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span className="text-sm" style={{ color: ok ? "#374151" : "#d1d5db" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreRing({ score, max, size = 80, showLabel = false }: { score: number; max: number; size?: number; showLabel?: boolean }) {
  const animated = useCountUp(score, 1400, 300);
  const pct = max > 0 ? animated / max : 0;
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  const grade = gradeLabel(score, max);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="7" />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={grade.color} strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${circ}`}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - dash }}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-bold leading-none tabular-nums"
            style={{ fontSize: size * 0.3, color: grade.color }}
          >
            {animated}
          </motion.span>
          <span className="text-gray-400 leading-none mt-0.5" style={{ fontSize: size * 0.13 }}>/{max}</span>
        </div>
      </div>
      {showLabel && (
        <motion.span
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0, duration: 0.3 }}
          className="text-xs font-bold px-2.5 py-0.5 rounded-full"
          style={{ color: grade.color, background: grade.bg, border: `1px solid ${grade.border}` }}
        >
          {grade.label}
        </motion.span>
      )}
    </div>
  );
}

function CheckRow({ check }: { check: TaskCheck }) {
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-gray-50">
      <div className="shrink-0 mt-0.5">
        {check.status === "pass" ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        ) : check.status === "partial" ? (
          <AlertCircle className="w-4 h-4 text-yellow-500" />
        ) : (
          <XCircle className="w-4 h-4 text-red-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-700 font-medium capitalize">{check.name.replace(/-/g, " ")}</div>
        {check.issue && <div className="text-xs text-gray-400 mt-0.5">{check.issue}</div>}
      </div>
    </div>
  );
}

function InsightCard({ insight, index }: { insight: Insight; index: number }) {
  const badge = priorityBadge(insight.priority);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      className="p-5 rounded-2xl flex flex-col gap-3 bg-white"
      style={{ border: "1px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
          style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}
        >
          {badge.label}
        </span>
        <span className="text-xs text-gray-400 capitalize">{insight.type}</span>
      </div>
      <div>
        <h4 className="text-gray-900 font-semibold text-sm leading-snug">{insight.title}</h4>
        <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">{insight.description}</p>
      </div>
      <div className="text-xs rounded-xl p-3 leading-relaxed bg-violet-50 text-violet-700"
        style={{ border: "1px solid #ddd6fe" }}>
        <span className="font-semibold">Action: </span>{insight.action}
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function GraderReportPage() {
  const { pipelineId } = useParams<{ pipelineId: string }>();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!pipelineId) return;
    api.get(`/v1/pipelines/${pipelineId}/report`)
      .then((res) => setReport(res.data))
      .catch(() => setError("Report not ready yet. Please wait a moment."))
      .finally(() => setLoading(false));
  }, [pipelineId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(0.985 0.003 350)" }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 rounded-full" style={{ border: "2px solid #ddd6fe", borderTopColor: "#7c3aed" }} />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "oklch(0.985 0.003 350)" }}>
        <p className="text-gray-500 text-sm">{error || "Report unavailable."}</p>
        <button onClick={() => router.push(`/grader/${pipelineId}`)} className="text-violet-600 text-sm hover:underline">
          ← Back to scanning
        </button>
      </div>
    );
  }

  const { metadata: meta, overallScore, maxScore, scores, taskGroups, insights, media, topReviews } = report;
  const reportUrl = typeof window !== "undefined" ? window.location.href : "";

  const shareWhatsApp = () => {
    const text = `Check out my growth report for ${meta.name}: ${reportUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };
  const shareEmail = () => {
    window.open(
      `mailto:?subject=Business Growth Report: ${meta.name}&body=${encodeURIComponent(`Here's the growth report:\n\n${reportUrl}`)}`,
      "_blank"
    );
  };

  const DIMENSIONS = [
    { key: "guestExperience", label: "Guest Experience", icon: TrendingUp, data: scores.guestExperience, color: "#7c3aed" },
    { key: "reputation",      label: "Reputation",       icon: Star,        data: scores.reputation,      color: "#16a34a" },
    { key: "searchResults",   label: "Search Visibility", icon: Search,     data: scores.searchResults,   color: "#2563eb" },
  ];

  return (
    <div
      className="min-h-screen antialiased"
      style={{ background: "oklch(0.985 0.003 350)", fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, sans-serif' }}
    >
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 border-b border-gray-100 bg-white/80 backdrop-blur-md" style={{ maxWidth: "100%" }}>
        <button
          onClick={() => router.push("/grader")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          New report
        </button>
        <div className="flex items-center gap-2.5 text-gray-900 font-bold text-sm">
          <div className="relative w-8 h-8 rounded-xl flex items-center justify-center shadow-md" style={{ background: "oklch(0.58 0.24 350)" }}>
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          Retilo
        </div>
        <div className="flex gap-2">
          <button
            onClick={shareWhatsApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0" }}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </button>
          <button
            onClick={shareEmail}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ background: "#ede9fe", color: "#7c3aed", border: "1px solid #ddd6fe" }}
          >
            <Mail className="w-3.5 h-3.5" />
            Email
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 pb-24 pt-6">

        {/* ── Hero Score ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl p-8 mb-6 flex flex-col md:flex-row items-center gap-8 bg-white"
          style={{ border: "1px solid #f3f4f6", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}
        >
          {/* Logo / initials fallback */}
          {media?.logo ? (
            <div className="relative w-20 h-20 shrink-0">
              <img
                src={media.logo}
                alt={meta.name}
                className="w-20 h-20 rounded-2xl object-cover"
                style={{ border: "1px solid #f3f4f6" }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  (e.currentTarget.nextSibling as HTMLElement).style.display = "flex";
                }}
              />
              <div style={{ display: "none" }}>
                <InitialsAvatar name={meta.name} size={80} />
              </div>
            </div>
          ) : (
            <InitialsAvatar name={meta.name} size={80} />
          )}

          {/* Brand info */}
          <div className="flex-1 min-w-0 text-center md:text-left">
            <h1 className="text-gray-900 font-bold" style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", letterSpacing: "-0.025em" }}>
              {meta.name}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
              {meta.rating && (
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  {meta.rating} ({meta.userRatingsTotal?.toLocaleString()} reviews)
                </span>
              )}
              {meta.address?.city && (
                <span className="flex items-center gap-1 text-sm text-gray-400">
                  <MapPin className="w-3.5 h-3.5" />
                  {meta.address.city}{meta.address.state ? `, ${meta.address.state}` : ""}
                </span>
              )}
              {meta.website && (
                <a href={meta.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 transition-colors">
                  <Globe className="w-3.5 h-3.5" />
                  Website
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            {meta.cuisines && meta.cuisines.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3 justify-center md:justify-start">
                {meta.cuisines.slice(0, 5).map((c) => (
                  <span key={c} className="px-2 py-0.5 rounded-full text-xs capitalize"
                    style={{ background: "#ede9fe", color: "#7c3aed", border: "1px solid #ddd6fe" }}>
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Overall score */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <ScoreRing score={overallScore} max={maxScore} size={108} showLabel />
          </div>
        </motion.div>

        {/* ── 3 Dimension Score Cards ───────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {DIMENSIONS.map(({ key, label, icon: Icon, data, color }, i) => (
            <DimensionCard key={key} label={label} color={color} icon={Icon} data={data} index={i} />
          ))}
        </div>

        {/* ── Two-column: Checks + Presence ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Checks */}
          {taskGroups && taskGroups.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="rounded-2xl p-6 bg-white"
              style={{ border: "1px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
            >
              <h3 className="text-gray-900 font-semibold mb-4">Detailed Checks</h3>
              {taskGroups.map((group) => (
                <div key={group.name} className="mb-5 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-sm font-medium">{group.name}</span>
                    <span className="text-xs text-gray-400">{group.score}/{group.max}</span>
                  </div>
                  <div>
                    {group.checks.map((c) => <CheckRow key={c.name} check={c} />)}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Dynamic presence card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
            className="rounded-2xl p-6 flex flex-col gap-4 bg-white"
            style={{ border: "1px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
          >
            <PresenceCard report={report} />
            {(meta.phone || meta.numLocations) && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                {meta.phone && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-violet-50" style={{ border: "1px solid #ddd6fe" }}>
                    <Phone className="w-3.5 h-3.5 text-violet-600" />
                    <span className="text-xs text-gray-600">{meta.phone}</span>
                  </div>
                )}
                {meta.numLocations && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-violet-50" style={{ border: "1px solid #ddd6fe" }}>
                    <MapPin className="w-3.5 h-3.5 text-violet-600" />
                    <span className="text-xs text-gray-600">{meta.numLocations} location{meta.numLocations > 1 ? "s" : ""}</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Insights Bento ────────────────────────────────────────────── */}
        {insights && insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-violet-600" />
              Growth Opportunities ({insights.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {insights.map((ins, i) => <InsightCard key={ins.id} insight={ins} index={i} />)}
            </div>
          </motion.div>
        )}

        {/* ── Screenshots ───────────────────────────────────────────────── */}
        {(media?.screenshots?.desktop || media?.screenshots?.mobile) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="rounded-2xl p-6 mb-6 bg-white"
            style={{ border: "1px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
          >
            <h3 className="text-gray-900 font-semibold mb-4">Website Screenshots</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {media.screenshots.desktop && (
                <div>
                  <p className="text-gray-400 text-xs mb-2">Desktop</p>
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <img src={media.screenshots.desktop} alt="Desktop screenshot" className="w-full object-cover" />
                  </div>
                </div>
              )}
              {media.screenshots.mobile && (
                <div>
                  <p className="text-gray-400 text-xs mb-2">Mobile</p>
                  <div className="rounded-xl overflow-hidden max-w-[200px] border border-gray-200">
                    <img src={media.screenshots.mobile} alt="Mobile screenshot" className="w-full object-cover" />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Top Reviews ───────────────────────────────────────────────── */}
        {topReviews && topReviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl p-6 mb-6 bg-white"
            style={{ border: "1px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
          >
            <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              Top Reviews
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topReviews.slice(0, 4).map((rev, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 * i }}
                  className="p-4 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-800 text-sm font-medium">{rev.author}</span>
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: Math.min(5, rev.rating) }).map((_, j) => (
                        <Star key={j} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      ))}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">{rev.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Camera Upsell ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="rounded-2xl p-6 mb-6 flex flex-col md:flex-row items-center gap-6"
          style={{
            background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
            border: "1px solid #ddd6fe",
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-white"
            style={{ border: "1px solid #ddd6fe", boxShadow: "0 1px 4px rgba(124,58,237,0.1)" }}
          >
            <Camera className="w-7 h-7 text-violet-600" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-gray-900 font-semibold text-lg mb-1">Upgrade your restaurant photos & reels</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Professional photography and Reels can boost your Google ranking and footfall.
              We bring the camera to you — call, WhatsApp or email us to book a shoot.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <a
              href="https://wa.me/917288807097"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors bg-white"
              style={{ color: "#16a34a", border: "1px solid #bbf7d0" }}
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp us
            </a>
            <a
              href={`mailto:satwik@retilo.io?subject=Restaurant Photography for ${meta.name}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors bg-white"
              style={{ color: "#7c3aed", border: "1px solid #ddd6fe" }}
            >
              <Mail className="w-4 h-4" />
              Email us
            </a>
          </div>
        </motion.div>

        {/* ── Waitlist / Platform CTA ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-2xl p-8 text-center bg-white"
          style={{ border: "1px solid #f3f4f6", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: "#ede9fe", color: "#7c3aed", border: "1px solid #ddd6fe" }}
          >
            <Zap className="w-3 h-3 fill-violet-600" />
            Get the Full Growth Playbook
          </div>
          <h3
            className="text-gray-900 font-bold mb-3"
            style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", letterSpacing: "-0.02em" }}
          >
            Fix every issue in this report — in one platform
          </h3>
          <p className="text-gray-500 text-sm mb-6 max-w-[40ch] mx-auto leading-relaxed">
            Retilo helps you automate guest engagement, get more reviews and grow your online presence — without a marketing team.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-2.5 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none bg-gray-50"
              style={{ border: "1px solid #e5e7eb" }}
            />
            <button
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 whitespace-nowrap"
              style={{ background: "linear-gradient(135deg, oklch(0.55 0.24 280), oklch(0.58 0.24 350))" }}
            >
              Join waitlist
              <ChevronRight className="w-4 h-4 inline ml-1" />
            </button>
          </div>
          <p className="text-gray-400 text-xs mt-4">Free while in beta · Cancel anytime</p>
        </motion.div>

        {/* Footer share */}
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            onClick={shareWhatsApp}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0" }}
          >
            <MessageCircle className="w-4 h-4" />
            Share on WhatsApp
          </button>
          <button
            onClick={shareEmail}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: "#ede9fe", color: "#7c3aed", border: "1px solid #ddd6fe" }}
          >
            <Mail className="w-4 h-4" />
            Share via Email
          </button>
        </div>

        <p className="text-center text-gray-300 text-xs mt-6">
          Report generated by Retilo · {new Date(report.generatedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
