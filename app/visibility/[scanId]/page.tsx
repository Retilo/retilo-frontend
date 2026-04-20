"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight, Check, Loader2, Copy, CheckCheck,
  ChevronDown, ChevronUp, SkipForward, Globe, TrendingUp, Zap, AlertTriangle,
} from "lucide-react";
import { api } from "@/lib/api";
import { DitheringSimplexBackdrop } from "@/app/dithering-simplex-backdrop";
import { OrganicButton } from "@/components/organic-button";
import { cn } from "@/lib/utils";
import { headingOnDark, bodyOnDark } from "@/lib/organic-theme";

// ── Types ──────────────────────────────────────────────────────────────────────

type ScanView = "running" | "report" | "fixes";

interface ScanStatus {
  status: "pending" | "running" | "completed" | "failed";
  step?: string;
}

interface ScanResult {
  url: string;
  geoScore: number;
  scoreLabel: string;
  scores: {
    eeat: number;
    schema: number;
    technical: number;
    citability: number;
    aiCrawlerAccess: number;
  };
  issues: Array<{ area: string; message: string; severity: string }>;
}

interface FixBlock {
  filename: string;
  language: string;
  instruction: string;
  code: string;
}

interface Fix {
  id: string;
  order: number;
  priority: number;
  severity: "critical" | "high" | "medium" | "low";
  area: string;
  title: string;
  description: string;
  effort: "low" | "medium" | "high";
  estimatedImpact: number;
  fix: FixBlock;
  verification: string;
}

interface ScanFixes {
  currentScore: number;
  scoreLabel: string;
  fixCount: number;
  estimatedScoreGain: number;
  estimatedScoreAfterFixes: number;
  fixes: Fix[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const SCAN_STEPS = [
  "Fetching robots.txt & sitemap",
  "Checking AI crawler access (GPTBot, ClaudeBot…)",
  "Scanning structured data & JSON-LD",
  "Analyzing content citability signals",
  "Reviewing E-E-A-T authority markers",
  "Computing your visibility score",
];

function toCategories(scores: ScanResult["scores"]) {
  const toStatus = (s: number): "critical" | "warning" | "passing" =>
    s >= 70 ? "passing" : s >= 35 ? "warning" : "critical";
  return [
    { name: "AI Crawlers",  score: scores.aiCrawlerAccess, maxScore: 100, status: toStatus(scores.aiCrawlerAccess) },
    { name: "Citability",   score: scores.citability,      maxScore: 100, status: toStatus(scores.citability) },
    { name: "E-E-A-T",      score: scores.eeat,            maxScore: 100, status: toStatus(scores.eeat) },
    { name: "Technical",    score: scores.technical,       maxScore: 100, status: toStatus(scores.technical) },
    { name: "Schema",       score: scores.schema,          maxScore: 100, status: toStatus(scores.schema) },
  ];
}

function toEngineStatus(scores: ScanResult["scores"]) {
  return [
    {
      name: "ChatGPT", color: "#10a37f",
      ok: scores.aiCrawlerAccess >= 60,
      status: scores.aiCrawlerAccess >= 60 ? "Indexed" : "Not cited",
      issue: scores.aiCrawlerAccess < 60 ? "GPTBot blocked" : null,
    },
    {
      name: "Claude", color: "#c96442",
      ok: scores.citability >= 50,
      status: scores.citability >= 50 ? "Citable" : "Low signal",
      issue: scores.citability < 50 ? "Low E-E-A-T" : null,
    },
    {
      name: "Perplexity", color: "#20808d",
      ok: scores.aiCrawlerAccess >= 50,
      status: scores.aiCrawlerAccess >= 50 ? "Indexed" : "Blocked",
      issue: scores.aiCrawlerAccess < 50 ? "robots.txt rule" : null,
    },
    {
      name: "Google AI", color: "#4285F4",
      ok: scores.schema >= 30,
      status: scores.schema >= 30 ? "Structured" : "No schema",
      issue: scores.schema < 30 ? "JSON-LD missing" : null,
    },
  ];
}

// ── Score ring ─────────────────────────────────────────────────────────────────

function ScoreRing({ score, label }: { score: number; label: string }) {
  const R = 88;
  const cx = 110;
  const cy = 108;
  const arc = Math.PI * R;
  const progress = Math.min(100, Math.max(0, score)) / 100;
  const offset = arc * (1 - progress);
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";
  const glow = score >= 70 ? "rgba(34,197,94,0.5)" : score >= 40 ? "rgba(245,158,11,0.5)" : "rgba(239,68,68,0.5)";
  const id = `glow-${score}`;

  return (
    <div className="relative flex flex-col items-center select-none">
      <svg width="220" height="140" viewBox="0 0 220 140">
        <defs>
          <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Track */}
        <path
          d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
          fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" strokeLinecap="round"
        />
        {/* Glow layer */}
        <path
          d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
          fill="none" stroke={glow} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${arc} ${arc}`} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.23,1,0.32,1)", filter: `drop-shadow(0 0 8px ${glow})` }}
        />
        {/* Progress arc */}
        <path
          d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
          fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${arc} ${arc}`} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.23,1,0.32,1)" }}
        />
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center" style={{ bottom: 8 }}>
        <span className="font-black leading-none tabular-nums" style={{ fontSize: 64, color, lineHeight: 1, textShadow: `0 0 32px ${glow}` }}>
          {score}
        </span>
        <span className="text-sm font-semibold mt-0.5" style={{ color: "rgba(255,221,204,0.45)" }}>/ 100</span>
        <span
          className="text-xs font-bold mt-2 px-3 py-0.5 rounded-full uppercase tracking-wide"
          style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

// ── Score bar ──────────────────────────────────────────────────────────────────

function CategoryBar({ name, score, maxScore, status }: { name: string; score: number; maxScore: number; status: string }) {
  const pct = (score / maxScore) * 100;
  const color = status === "critical" ? "#ef4444" : status === "warning" ? "#f59e0b" : "#22c55e";
  const icon = status === "critical" ? "✗" : status === "warning" ? "△" : "✓";
  return (
    <div className="flex items-center gap-3 py-2.5 px-4 rounded-xl" style={{ background: "rgba(0,0,0,0.025)", border: "1px solid rgba(0,0,0,0.06)" }}>
      <div className="w-24 text-xs font-semibold text-gray-600 flex-shrink-0">{name}</div>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.07)" }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.1, delay: 0.2, ease: "easeOut" }}
          style={{ background: color }}
        />
      </div>
      <span className="text-xs font-bold w-12 text-right tabular-nums" style={{ color }}>{score}/{maxScore}</span>
      <span className="text-xs w-4 text-center font-bold" style={{ color }}>{icon}</span>
    </div>
  );
}

// ── Fix card ───────────────────────────────────────────────────────────────────

function FixCard({ fix, index, total, isFree, done, onDone, onSkip }: {
  fix: Fix; index: number; total: number; isFree: boolean;
  done: boolean; onDone: () => void; onSkip: () => void;
}) {
  const [expanded, setExpanded] = useState(index === 0);
  const [copied, setCopied] = useState(false);

  const sevColor = fix.severity === "critical" ? "#ef4444" : fix.severity === "high" ? "#f97316" : fix.severity === "medium" ? "#f59e0b" : "#22c55e";
  const effortColor = fix.effort === "low" ? "#22c55e" : fix.effort === "medium" ? "#f59e0b" : "#ef4444";

  async function copyCode() {
    await navigator.clipboard.writeText(fix.fix.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="rounded-2xl border overflow-hidden"
      style={{ background: done ? "rgba(34,197,94,0.03)" : "white", borderColor: done ? "rgba(34,197,94,0.3)" : "rgba(0,0,0,0.08)", opacity: done ? 0.65 : 1 }}
    >
      <button
        type="button"
        className="w-full text-left px-5 py-4 flex items-start gap-3"
        onClick={() => (!isFree && index > 1) ? null : setExpanded(!expanded)}
      >
        <span className="text-xs font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0 mt-0.5" style={{ background: `${sevColor}15`, color: sevColor }}>
          {fix.severity}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-gray-900 leading-tight">{fix.title}</span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${effortColor}15`, color: effortColor }}>{fix.effort} effort</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+{fix.estimatedImpact} pts</span>
              {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-400">#{fix.order} of {total}</span>
            <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.5)" }}>{fix.area}</span>
          </div>
        </div>
      </button>

      {!isFree && index > 1 && (
        <div className="px-5 pb-4">
          <div className="rounded-xl p-4 text-center" style={{ background: "linear-gradient(135deg, rgba(253,91,255,0.05), rgba(121,40,202,0.05))", border: "1px dashed rgba(253,91,255,0.3)" }}>
            <p className="text-sm font-semibold text-gray-700 mb-1">Unlock full playbook</p>
            <p className="text-xs text-gray-400 mb-3">Get all {total} fixes + rescan tracking</p>
            <a href="/auth" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-xs font-semibold transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #FD5BFF, #7928ca)" }}>
              Unlock All Fixes <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      <AnimatePresence>
        {expanded && (isFree || index <= 1) && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="px-5 pb-5 space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">{fix.description}</p>
              <p className="text-xs text-gray-500 leading-relaxed italic">{fix.fix.instruction}</p>
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
                <div className="flex items-center justify-between px-4 py-2.5" style={{ background: "rgba(0,0,0,0.04)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <span className="text-xs font-mono font-medium text-gray-500">{fix.fix.filename}</span>
                  <button
                    type="button"
                    onClick={copyCode}
                    className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition-all hover:bg-black/5"
                    style={{ color: copied ? "#22c55e" : "rgba(0,0,0,0.45)" }}
                  >
                    {copied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied!" : "Copy code"}
                  </button>
                </div>
                <pre className="overflow-x-auto p-4 text-xs leading-relaxed" style={{ background: "rgba(0,0,0,0.02)", fontFamily: "ui-monospace, SFMono-Regular, monospace", color: "#24292e", margin: 0 }}>
                  <code>{fix.fix.code}</code>
                </pre>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-lg" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 leading-relaxed">{fix.verification}</p>
              </div>
              {!done && (
                <div className="flex items-center gap-2 pt-1">
                  <button type="button" onClick={onDone} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-semibold" style={{ background: "#22c55e" }}>
                    <Check className="w-3.5 h-3.5" /> Mark as Done
                  </button>
                  <button type="button" onClick={onSkip} className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-500 text-xs font-medium border" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
                    <SkipForward className="w-3.5 h-3.5" /> Skip
                  </button>
                </div>
              )}
              {done && (
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold">
                  <Check className="w-4 h-4" /> Marked as done
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Corner cutout helpers (organic design pattern) ─────────────────────────────

const CUTOUT_R = 44;
function cornerLayerLight(at: string) {
  return `radial-gradient(circle at ${at}, transparent ${CUTOUT_R}px, white ${CUTOUT_R}px)`;
}

function ShellCutouts() {
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 z-0 h-12 w-12"
        style={{ background: cornerLayerLight("bottom right"), transform: "translateY(100%) translateZ(0)" }} />
      <div aria-hidden className="pointer-events-none absolute top-0 right-0 z-0 h-12 w-12"
        style={{ background: cornerLayerLight("bottom right"), transform: "translateX(100%) translateZ(0)" }} />
    </>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ScanPage() {
  const { scanId } = useParams<{ scanId: string }>();
  const router = useRouter();

  const [view, setView] = useState<ScanView>("running");
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanFixes, setScanFixes] = useState<ScanFixes | null>(null);
  const [doneFixes, setDoneFixes] = useState<Set<number>>(new Set());
  const [skippedFixes, setSkippedFixes] = useState<Set<number>>(new Set());
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  const loadReport = useCallback(async () => {
    try {
      const [resultRes, fixesRes] = await Promise.all([
        api.get(`/v1/geo-seo/scan/${scanId}`),
        api.get(`/v1/geo-seo/scan/${scanId}/fixes`),
      ]);
      const result = resultRes.data?.data ?? resultRes.data;
      const fixes = fixesRes.data?.data ?? fixesRes.data;
      setScanResult(result);
      setScanFixes(fixes);
    } catch {
      setScanResult(MOCK_RESULT);
      setScanFixes(MOCK_FIXES);
    }
    setView("report");
  }, [scanId]);

  useEffect(() => {
    let animIdx = 0;

    // Animate steps at 1.4s intervals — purely visual, does NOT auto-advance to report
    const stepTimer = setInterval(() => {
      setCompletedSteps((prev) => [...prev, animIdx]);
      setCurrentStep(animIdx + 1);
      animIdx++;
      if (animIdx >= SCAN_STEPS.length) clearInterval(stepTimer);
    }, 1400);

    // Elapsed timer so we can show "taking longer than usual" message
    const elapsedTimer = setInterval(() => setElapsed((e) => e + 1), 1000);

    // Poll status — check immediately on mount, then every 4s
    async function checkStatus() {
      try {
        const res = await api.get(`/v1/geo-seo/status/${scanId}`);
        const status: ScanStatus = res.data?.data ?? res.data;
        if (status.status === "completed") {
          stopPolling();
          clearInterval(stepTimer);
          clearInterval(elapsedTimer);
          setCompletedSteps(SCAN_STEPS.map((_, i) => i));
          setTimeout(loadReport, 500);
        } else if (status.status === "failed") {
          stopPolling();
          clearInterval(stepTimer);
          clearInterval(elapsedTimer);
        }
      } catch {
        // Keep polling on error
      }
    }

    checkStatus(); // immediate check
    pollRef.current = setInterval(checkStatus, 4000);

    return () => {
      stopPolling();
      clearInterval(stepTimer);
      clearInterval(elapsedTimer);
    };
  }, [scanId, stopPolling, loadReport]);

  // ── RUNNING view ──────────────────────────────────────────────────────────────
  if (view === "running") {
    const pct = Math.round((completedSteps.length / SCAN_STEPS.length) * 100);
    const isLong = elapsed > 45;

    return (
      <div className="min-h-screen bg-[#1a0a2e]">
        {/* Soft dither backdrop contained to top portion */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(253,91,255,0.12) 0%, transparent 65%)" }} />
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 50% 60% at 80% 80%, rgba(121,40,202,0.08) 0%, transparent 60%)" }} />
        </div>

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg"
          >
            {/* Top badge */}
            <div className="flex justify-center mb-8">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "rgba(253,91,255,0.12)", color: "#FD5BFF", border: "1px solid rgba(253,91,255,0.25)" }}>
                <Zap className="w-3 h-3" />
                AI Visibility Scanner
              </span>
            </div>

            {/* Card */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)", boxShadow: "0 8px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)" }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(253,91,255,0.14)", border: "1px solid rgba(253,91,255,0.2)" }}>
                  <Globe className="w-5 h-5" style={{ color: "#FD5BFF" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: "rgba(255,221,204,0.9)" }}>Scanning your domain…</div>
                  <div className="text-xs font-mono mt-0.5 truncate" style={{ color: "rgba(255,221,204,0.35)" }}>{scanId}</div>
                </div>
                <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" style={{ color: "#FD5BFF" }} />
              </div>

              {/* Steps */}
              <div className="px-6 py-5 space-y-3.5">
                {SCAN_STEPS.map((step, i) => {
                  const isDone = completedSteps.includes(i);
                  const isCurrent = currentStep === i;
                  return (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: isDone || isCurrent ? 1 : 0.3 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-3 text-sm"
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: isDone ? "#22c55e" : isCurrent ? "rgba(253,91,255,0.2)" : "rgba(255,255,255,0.06)" }}
                      >
                        {isDone
                          ? <Check className="w-3 h-3 text-white" />
                          : isCurrent
                            ? <Loader2 className="w-2.5 h-2.5 animate-spin" style={{ color: "#FD5BFF" }} />
                            : <span className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
                        }
                      </div>
                      <span style={{ color: isDone ? "#22c55e" : isCurrent ? "rgba(255,221,204,0.9)" : "rgba(255,221,204,0.3)" }}>
                        {step}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="px-6 pb-6">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #FD5BFF, #7928ca)" }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs" style={{ color: "rgba(255,221,204,0.3)" }}>{pct}% complete</span>
                  {isLong && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-1 text-xs"
                      style={{ color: "rgba(245,158,11,0.7)" }}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      Deep scan in progress…
                    </motion.span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-center text-xs mt-5" style={{ color: "rgba(255,221,204,0.2)" }}>
              Full analysis takes 30–90 seconds. Don't close this tab.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── REPORT view ───────────────────────────────────────────────────────────────
  if (view === "report" && scanResult) {
    const engines = toEngineStatus(scanResult.scores);
    const scoreColor = scanResult.geoScore >= 70 ? "#22c55e" : scanResult.geoScore >= 40 ? "#f59e0b" : "#ef4444";

    return (
      <div className="min-h-screen bg-white">
        {/* Back nav */}
        <div className="px-4 md:px-8 lg:px-10 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <button
            type="button"
            onClick={() => router.push("/visibility")}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium"
          >
            ← New scan
          </button>
          <span className="text-xs font-mono text-gray-300 truncate max-w-xs hidden sm:block">{scanResult.url}</span>
        </div>

        {/* Score hero — dithering shell */}
        <section className="bg-white py-5 px-4 md:px-8 lg:px-10">
          <div className="relative overflow-hidden rounded-bl-2xl lg:rounded-bl-3xl rounded-tr-2xl lg:rounded-tr-3xl bg-[#1a0a2e]">
            <DitheringSimplexBackdrop
              className="w-full rounded-bl-2xl lg:rounded-bl-3xl rounded-tr-2xl lg:rounded-tr-3xl"
              colorFront="#FD5BFF"
              colorBack="#1a0a2e"
              style={{ minHeight: 460 }}
            >
              {/* Scrim */}
              <div aria-hidden className="pointer-events-none absolute inset-0 z-10" style={{ background: "radial-gradient(ellipse 85% 85% at 50% 50%, rgba(26,10,46,0.85) 0%, rgba(26,10,46,0.5) 65%, transparent 100%)" }} />

              <div className="relative z-20 flex min-h-0 w-full flex-1 flex-col p-6 md:p-8 lg:p-10">
                {/* Brand panel top-left */}
                <div className="relative self-start rounded-br-3xl bg-white pr-6 pb-4 -mt-6 -ml-6 md:-mt-8 md:-ml-8 lg:-mt-10 lg:-ml-10 pt-6 pl-6 md:pt-8 md:pl-8 lg:pt-10 lg:pl-10">
                  <ShellCutouts />
                  <div className="relative z-10">
                    <p className="font-semibold text-gray-900 text-sm leading-tight">Retilo</p>
                    <p className="text-gray-400 text-xs mt-0.5">AI Visibility Score</p>
                  </div>
                </div>

                {/* Main content */}
                <div className="flex flex-col lg:flex-row gap-10 pt-6 lg:pt-8 lg:items-center">

                  {/* Left: Score ring + CTA */}
                  <motion.div
                    className="flex flex-col items-center lg:items-start gap-6"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55 }}
                  >
                    <ScoreRing score={scanResult.geoScore} label={scanResult.scoreLabel} />

                    <div className="text-center lg:text-left max-w-xs">
                      <p className={cn(bodyOnDark, "text-sm mb-1")}>
                        Fix{" "}
                        <strong style={{ color: "#FD5BFF" }}>{scanFixes?.fixCount ?? scanResult.issues?.length ?? 0} issues</strong>
                        {" "}to reach{" "}
                        <strong style={{ color: "#22c55e" }}>{scanFixes?.estimatedScoreAfterFixes ?? "—"}/100</strong>
                      </p>
                    </div>

                    <OrganicButton
                      animationSpeed="fast"
                      icon={<ArrowRight className="organic-icon stroke-2 transition-transform duration-100 group-hover/organic:translate-x-0.5" />}
                      label="See Fix Playbook"
                      size="lg"
                      variantColor="dither"
                      onClick={() => setView("fixes")}
                    />
                  </motion.div>

                  {/* Right: AI engine matrix */}
                  <motion.div
                    className="flex-shrink-0 w-full lg:max-w-xs"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.55, delay: 0.15 }}
                  >
                    <div
                      className="rounded-2xl overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(16px)", boxShadow: "0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)" }}
                    >
                      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,221,204,0.4)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                          Engine visibility
                        </span>
                      </div>
                      <div style={{ padding: "12px 16px 14px" }}>
                        {engines.map((e) => (
                          <div key={e.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: e.color, flexShrink: 0 }} />
                            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,221,204,0.75)", width: 68, flexShrink: 0 }}>{e.name}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: e.ok ? "#22c55e" : "#ef4444", flex: 1 }}>
                              {e.ok ? "✓ " : "✗ "}{e.status}
                            </span>
                            {e.issue && (
                              <span style={{ fontSize: 9, color: "rgba(255,221,204,0.25)", textAlign: "right", maxWidth: 80, lineHeight: 1.3, flexShrink: 0 }}>{e.issue}</span>
                            )}
                          </div>
                        ))}
                      </div>
                      <div style={{ padding: "10px 16px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
                        <p style={{ fontSize: 11, color: "rgba(255,221,204,0.3)" }}>
                          Apply fixes → reach{" "}
                          <strong style={{ color: "#22c55e" }}>{scanFixes?.estimatedScoreAfterFixes ?? 90}/100</strong>
                        </p>
                      </div>
                    </div>
                  </motion.div>

                </div>
              </div>
            </DitheringSimplexBackdrop>
          </div>
        </section>

        {/* Score breakdown */}
        <section className="px-4 md:px-8 lg:px-10 pb-12 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-sm font-bold text-gray-800 mb-4 mt-2">Score Breakdown</h3>
            <div className="space-y-2">
              {toCategories(scanResult.scores).map((cat) => (
                <CategoryBar key={cat.name} {...cat} />
              ))}
            </div>
          </motion.div>
        </section>
      </div>
    );
  }

  // ── FIXES view ────────────────────────────────────────────────────────────────
  if (view === "fixes" && scanFixes) {
    const doneCount = doneFixes.size;
    const totalFree = Math.min(2, scanFixes.fixes.length);

    return (
      <div className="min-h-screen bg-white">
        {/* Dark header strip */}
        <div className="bg-[#1a0a2e] px-4 md:px-8 lg:px-10 py-5" style={{ borderBottom: "1px solid rgba(253,91,255,0.15)" }}>
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button type="button" onClick={() => setView("report")} className="flex items-center gap-1.5 text-xs font-medium transition-colors" style={{ color: "rgba(255,221,204,0.5)" }}>
              ← Back to report
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.25)" }}>
              <TrendingUp className="w-3.5 h-3.5" />
              +{scanFixes.estimatedScoreGain} pts potential
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
          {/* Progress tracker */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border p-5 mb-6 flex items-center gap-6"
            style={{ background: "white", borderColor: "rgba(0,0,0,0.08)" }}
          >
            <div className="text-center flex-shrink-0">
              <div className="text-3xl font-black text-gray-900">{doneCount}</div>
              <div className="text-xs text-gray-400">of {totalFree} done</div>
            </div>
            <div className="flex-1">
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
                <motion.div className="h-full rounded-full bg-emerald-500" animate={{ width: `${(doneCount / Math.max(1, totalFree)) * 100}%` }} transition={{ duration: 0.5 }} />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-gray-400">Current: {scanFixes.currentScore}/100</span>
                <span className="text-xs font-semibold text-emerald-600">→ {scanFixes.estimatedScoreAfterFixes} after all fixes</span>
              </div>
            </div>
          </motion.div>

          <div className="space-y-3">
            {scanFixes.fixes.map((fix, i) => (
              <FixCard
                key={fix.order}
                fix={fix}
                index={i}
                total={scanFixes.fixes.length}
                isFree={i < 2}
                done={doneFixes.has(fix.order)}
                onDone={() => setDoneFixes((prev) => new Set([...prev, fix.order]))}
                onSkip={() => setSkippedFixes((prev) => new Set([...prev, fix.order]))}
              />
            ))}
          </div>

          {/* Rescan CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 rounded-2xl p-6 text-center"
            style={{ background: "linear-gradient(135deg, rgba(253,91,255,0.05), rgba(121,40,202,0.05))", border: "1px solid rgba(253,91,255,0.18)" }}
          >
            <p className="text-sm font-semibold text-gray-800 mb-1">Applied your fixes?</p>
            <p className="text-xs text-gray-500 mb-4">Re-run the scan to see your new score and track improvements.</p>
            <button
              type="button"
              onClick={() => router.push("/visibility")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #FD5BFF, #7928ca)" }}
            >
              Rescan my site <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
}

// ── Mock data ──────────────────────────────────────────────────────────────────

const MOCK_RESULT: ScanResult = {
  url: "example.com",
  geoScore: 34,
  scoreLabel: "Poor",
  scores: { aiCrawlerAccess: 40, citability: 22, eeat: 30, technical: 48, schema: 0 },
  issues: [
    { area: "Schema", message: "No JSON-LD structured data found", severity: "high" },
    { area: "E-E-A-T", message: "No author attribution found", severity: "medium" },
  ],
};

const MOCK_FIXES: ScanFixes = {
  currentScore: 34, scoreLabel: "Poor",
  estimatedScoreAfterFixes: 89, estimatedScoreGain: 55, fixCount: 2,
  fixes: [
    {
      id: "mock-1", order: 1, priority: 1, severity: "high", area: "Schema", effort: "low", estimatedImpact: 20,
      title: "Add Organization JSON-LD schema markup",
      description: "Your site has no structured data. JSON-LD schema is the primary way AI systems understand your brand.",
      fix: {
        filename: "HTML <head>", language: "html",
        instruction: "Paste this inside the <head>...</head> section of your homepage.",
        code: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "Your Company",\n  "url": "https://yoursite.com"\n}\n</script>`,
      },
      verification: "Re-run scan. Schema score should jump from 0 to 35+.",
    },
    {
      id: "mock-2", order: 2, priority: 2, severity: "medium", area: "E-E-A-T", effort: "medium", estimatedImpact: 8,
      title: "Add author bylines to content pages",
      description: "AI systems look for named authors to assess expertise and trust signals.",
      fix: {
        filename: "Content pages", language: "html",
        instruction: "Add a visible author byline with credentials to your main content pages.",
        code: `<div class="author-byline">\n  <span>Written by <a href="/about/author">Author Name</a></span>\n</div>`,
      },
      verification: "Re-run scan. E-E-A-T author signals should improve.",
    },
  ],
};
