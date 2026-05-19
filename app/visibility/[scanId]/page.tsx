"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight, Check, Loader2, Copy, CheckCheck,
  ChevronDown, ChevronUp, SkipForward, Globe, TrendingUp,
  Zap, AlertTriangle,
} from "lucide-react";
import { api } from "@/lib/api";
import { OrganicButton } from "@/components/organic-button";

// ── Types ──────────────────────────────────────────────────────────────────────

type ScanView = "running" | "report" | "fixes";

interface ScanStatus {
  status: "pending" | "running" | "completed" | "failed";
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

interface FixBlock { filename: string; language: string; instruction: string; code: string; }
interface Fix {
  id: string; order: number; priority: number;
  severity: "critical" | "high" | "medium" | "low";
  area: string; title: string; description: string;
  effort: "low" | "medium" | "high";
  estimatedImpact: number; fix: FixBlock; verification: string;
}
interface ScanFixes {
  currentScore: number; scoreLabel: string; fixCount: number;
  estimatedScoreGain: number; estimatedScoreAfterFixes: number; fixes: Fix[];
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
  const s = (v: number): "critical" | "warning" | "passing" =>
    v >= 70 ? "passing" : v >= 35 ? "warning" : "critical";
  return [
    { name: "AI Crawlers", score: scores.aiCrawlerAccess, status: s(scores.aiCrawlerAccess) },
    { name: "Citability",  score: scores.citability,      status: s(scores.citability) },
    { name: "E-E-A-T",     score: scores.eeat,            status: s(scores.eeat) },
    { name: "Technical",   score: scores.technical,       status: s(scores.technical) },
    { name: "Schema",      score: scores.schema,          status: s(scores.schema) },
  ];
}

function toEngines(scores: ScanResult["scores"]) {
  return [
    { name: "ChatGPT",    color: "#10a37f", ok: scores.aiCrawlerAccess >= 60, status: scores.aiCrawlerAccess >= 60 ? "Indexed" : "Not cited",   issue: scores.aiCrawlerAccess < 60 ? "GPTBot blocked" : null },
    { name: "Claude",     color: "#c96442", ok: scores.citability >= 50,      status: scores.citability >= 50 ? "Citable" : "Low signal",        issue: scores.citability < 50 ? "Low E-E-A-T" : null },
    { name: "Perplexity", color: "#20808d", ok: scores.aiCrawlerAccess >= 50, status: scores.aiCrawlerAccess >= 50 ? "Indexed" : "Blocked",      issue: scores.aiCrawlerAccess < 50 ? "robots.txt rule" : null },
    { name: "Google AI",  color: "#4285F4", ok: scores.schema >= 30,          status: scores.schema >= 30 ? "Structured" : "No schema",          issue: scores.schema < 30 ? "JSON-LD missing" : null },
  ];
}

// ── Score ring ─────────────────────────────────────────────────────────────────

function ScoreRing({ score, label }: { score: number; label: string }) {
  const R = 80, cx = 100, cy = 100;
  const arc = Math.PI * R;
  const offset = arc * (1 - Math.min(100, Math.max(0, score)) / 100);
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";
  const glow  = score >= 70 ? "rgba(34,197,94,0.55)"  : score >= 40 ? "rgba(245,158,11,0.55)"  : "rgba(239,68,68,0.55)";

  return (
    <div className="relative flex flex-col items-center select-none">
      <svg width="200" height="125" viewBox="0 0 200 125">
        <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" strokeLinecap="round" />
        {/* glow copy */}
        <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
          fill="none" stroke={glow} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${arc} ${arc}`} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.23,1,0.32,1)", filter: `blur(6px)` }} />
        <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
          fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${arc} ${arc}`} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.23,1,0.32,1)" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
        <span className="font-black tabular-nums leading-none" style={{ fontSize: 60, color, textShadow: `0 0 40px ${glow}` }}>{score}</span>
        <span className="text-xs font-semibold mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>/ 100</span>
        <span className="text-xs font-bold mt-2 px-3 py-0.5 rounded-full uppercase tracking-wide"
          style={{ background: `${color}20`, color, border: `1px solid ${color}45` }}>{label}</span>
      </div>
    </div>
  );
}

// ── Category bar ───────────────────────────────────────────────────────────────

function CategoryBar({ name, score, status }: { name: string; score: number; status: string }) {
  const color = status === "critical" ? "#ef4444" : status === "warning" ? "#f59e0b" : "#22c55e";
  const icon  = status === "critical" ? "✗" : status === "warning" ? "△" : "✓";
  return (
    <div className="flex items-center gap-3 py-2.5 px-4 rounded-xl"
      style={{ background: "rgba(0,0,0,0.025)", border: "1px solid rgba(0,0,0,0.06)" }}>
      <span className="w-24 text-xs font-semibold text-gray-600 flex-shrink-0">{name}</span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.07)" }}>
        <motion.div className="h-full rounded-full"
          initial={{ width: 0 }} animate={{ width: `${score}%` }}
          transition={{ duration: 1.1, delay: 0.2, ease: "easeOut" }}
          style={{ background: color }} />
      </div>
      <span className="text-xs font-bold w-12 text-right tabular-nums" style={{ color }}>{score}/100</span>
      <span className="text-xs w-4 text-center font-bold" style={{ color }}>{icon}</span>
    </div>
  );
}

// ── Fix card ───────────────────────────────────────────────────────────────────

function FixCard({ fix, index, total, done, onDone, onSkip }: {
  fix: Fix; index: number; total: number;
  done: boolean; onDone: () => void; onSkip: () => void;
}) {
  const [expanded, setExpanded] = useState(index === 0);
  const [copied, setCopied] = useState(false);
  const sc = fix.severity === "critical" ? "#ef4444" : fix.severity === "high" ? "#f97316" : fix.severity === "medium" ? "#f59e0b" : "#22c55e";
  const ec = fix.effort === "low" ? "#22c55e" : fix.effort === "medium" ? "#f59e0b" : "#ef4444";

  async function copyCode() {
    await navigator.clipboard.writeText(fix.fix.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="rounded-2xl border overflow-hidden"
      style={{ background: done ? "rgba(34,197,94,0.03)" : "white", borderColor: done ? "rgba(34,197,94,0.3)" : "rgba(0,0,0,0.08)", opacity: done ? 0.65 : 1 }}>

      <button type="button" className="w-full text-left px-5 py-4 flex items-start gap-3"
        onClick={() => setExpanded(!expanded)}>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0 mt-0.5"
          style={{ background: `${sc}15`, color: sc }}>{fix.severity}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-gray-900 leading-tight">{fix.title}</span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${ec}15`, color: ec }}>{fix.effort} effort</span>
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

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="px-5 pb-5 space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">{fix.description}</p>
              <p className="text-xs text-gray-500 leading-relaxed italic">{fix.fix.instruction}</p>
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
                <div className="flex items-center justify-between px-4 py-2.5" style={{ background: "rgba(0,0,0,0.04)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <span className="text-xs font-mono font-medium text-gray-500">{fix.fix.filename}</span>
                  <button type="button" onClick={copyCode} className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition-all hover:bg-black/5"
                    style={{ color: copied ? "#22c55e" : "rgba(0,0,0,0.45)" }}>
                    {copied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied!" : "Copy code"}
                  </button>
                </div>
                <pre className="overflow-x-auto p-4 text-xs leading-relaxed"
                  style={{ background: "rgba(0,0,0,0.02)", fontFamily: "ui-monospace,SFMono-Regular,monospace", color: "#24292e", margin: 0 }}>
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
              {done && <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold"><Check className="w-4 h-4" /> Marked as done</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
      const [rRes, fRes] = await Promise.all([
        api.get(`/v1/geo-seo/scan/${scanId}`),
        api.get(`/v1/geo-seo/scan/${scanId}/fixes`),
      ]);
      setScanResult(rRes.data?.data ?? rRes.data);
      setScanFixes(fRes.data?.data ?? fRes.data);
    } catch {
      setScanResult(MOCK_RESULT);
      setScanFixes(MOCK_FIXES);
    }
    setView("report");
  }, [scanId]);

  useEffect(() => {
    let animIdx = 0;
    const stepTimer = setInterval(() => {
      setCompletedSteps((p) => [...p, animIdx]);
      setCurrentStep(animIdx + 1);
      animIdx++;
      if (animIdx >= SCAN_STEPS.length) clearInterval(stepTimer);
    }, 1400);

    const elapsedTimer = setInterval(() => setElapsed((e) => e + 1), 1000);

    async function checkStatus() {
      try {
        const res = await api.get(`/v1/geo-seo/status/${scanId}`);
        const s: ScanStatus = res.data?.data ?? res.data;
        if (s.status === "completed") {
          stopPolling(); clearInterval(stepTimer); clearInterval(elapsedTimer);
          setCompletedSteps(SCAN_STEPS.map((_, i) => i));
          setTimeout(loadReport, 400);
        } else if (s.status === "failed") {
          stopPolling(); clearInterval(stepTimer); clearInterval(elapsedTimer);
        }
      } catch { /* keep polling */ }
    }

    checkStatus();
    pollRef.current = setInterval(checkStatus, 4000);
    return () => { stopPolling(); clearInterval(stepTimer); clearInterval(elapsedTimer); };
  }, [scanId, stopPolling, loadReport]);

  // ── RUNNING ───────────────────────────────────────────────────────────────────
  if (view === "running") {
    const pct = Math.round((completedSteps.length / SCAN_STEPS.length) * 100);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#0e0914]" style={{ fontFamily: '"Geist",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
        {/* ambient glows */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px]" style={{ background: "radial-gradient(ellipse 60% 55% at 50% 0%, rgba(253,91,255,0.12) 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px]" style={{ background: "radial-gradient(ellipse 60% 55% at 100% 100%, rgba(121,40,202,0.1) 0%, transparent 70%)" }} />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 w-full max-w-md">
          {/* badge */}
          <div className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: "rgba(253,91,255,0.1)", color: "#FD5BFF", border: "1px solid rgba(253,91,255,0.22)" }}>
              <Zap className="w-3 h-3" /> AI Visibility Scanner
            </span>
          </div>

          {/* card */}
          <div className="rounded-3xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.09)", backdropFilter: "blur(24px)", boxShadow: "0 8px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)" }}>
            {/* header */}
            <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(253,91,255,0.12)", border: "1px solid rgba(253,91,255,0.18)" }}>
                <Globe className="w-5 h-5" style={{ color: "#FD5BFF" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold" style={{ color: "rgba(255,221,204,0.9)" }}>Analyzing your domain…</div>
                <div className="text-xs font-mono mt-0.5 truncate" style={{ color: "rgba(255,221,204,0.3)" }}>{scanId}</div>
              </div>
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" style={{ color: "#FD5BFF" }} />
            </div>

            {/* steps */}
            <div className="px-6 py-5 space-y-3.5">
              {SCAN_STEPS.map((step, i) => {
                const isDone = completedSteps.includes(i);
                const isCurr = currentStep === i;
                return (
                  <motion.div key={step} initial={{ opacity: 0.25 }} animate={{ opacity: isDone || isCurr ? 1 : 0.25 }}
                    className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: isDone ? "#22c55e" : isCurr ? "rgba(253,91,255,0.18)" : "rgba(255,255,255,0.05)" }}>
                      {isDone ? <Check className="w-3 h-3 text-white" />
                        : isCurr ? <Loader2 className="w-2.5 h-2.5 animate-spin" style={{ color: "#FD5BFF" }} />
                        : <span className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.18)" }} />}
                    </div>
                    <span style={{ color: isDone ? "#22c55e" : isCurr ? "rgba(255,221,204,0.9)" : "rgba(255,221,204,0.28)" }}>{step}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* progress */}
            <div className="px-6 pb-6">
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, #FD5BFF, #7928ca)" }}
                  animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: "easeOut" }} />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs" style={{ color: "rgba(255,221,204,0.28)" }}>{pct}% complete</span>
                {elapsed > 45 && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(245,158,11,0.75)" }}>
                    <AlertTriangle className="w-3 h-3" /> Deep scan in progress…
                  </motion.span>
                )}
              </div>
            </div>
          </div>

          <p className="text-center text-xs mt-5" style={{ color: "rgba(255,255,255,0.18)" }}>
            Full analysis takes 30–90 seconds. Don't close this tab.
          </p>
        </motion.div>
      </div>
    );
  }

  // ── REPORT ────────────────────────────────────────────────────────────────────
  if (view === "report" && scanResult) {
    const engines = toEngines(scanResult.scores);
    const scoreColor = scanResult.geoScore >= 70 ? "#22c55e" : scanResult.geoScore >= 40 ? "#f59e0b" : "#ef4444";
    const fixCount = scanFixes?.fixCount ?? scanResult.issues?.length ?? 0;

    return (
      <div className="min-h-screen bg-[#f4f4f7]" style={{ fontFamily: '"Geist",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
        {/* Nav */}
        <div className="bg-white/80 backdrop-blur px-4 md:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
          <button type="button" onClick={() => router.push("/visibility")}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 font-medium transition-colors">
            ← New scan
          </button>
          <span className="text-xs font-mono text-gray-300 truncate max-w-[240px] hidden sm:block">{scanResult.url}</span>
        </div>

        <div className="px-4 md:px-6 lg:px-8 pt-5 pb-4 max-w-5xl mx-auto">
          {/* ── Score hero card — dark, no shader ── */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="relative rounded-3xl overflow-hidden"
            style={{ background: "#14082a", boxShadow: "0 2px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.06)" }}>

            {/* ambient glows — CSS only, no shader */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute top-0 right-0 w-[400px] h-[300px]"
                style={{ background: "radial-gradient(ellipse 55% 60% at 100% 0%, rgba(253,91,255,0.1) 0%, transparent 70%)" }} />
              <div className="absolute bottom-0 left-0 w-[300px] h-[250px]"
                style={{ background: "radial-gradient(ellipse 60% 55% at 0% 100%, rgba(121,40,202,0.1) 0%, transparent 70%)" }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px]"
                style={{ background: `radial-gradient(ellipse 80% 80% at 50% 50%, ${scoreColor}12 0%, transparent 70%)` }} />
            </div>

            {/* header row */}
            <div className="relative z-10 flex items-center justify-between px-6 md:px-8 pt-6 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(253,91,255,0.15)" }}>
                  <Zap className="w-3.5 h-3.5" style={{ color: "#FD5BFF" }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: "rgba(255,221,204,0.45)" }}>Retilo · AI Visibility Score</span>
              </div>
              <span className="text-xs font-mono" style={{ color: "rgba(255,221,204,0.25)" }}>
                {scanResult.url.replace(/^https?:\/\//, "")}
              </span>
            </div>

            {/* main grid: score | engines */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6 px-6 md:px-8 pb-8 pt-4 items-center">

              {/* left: score ring + copy + CTA */}
              <div className="flex flex-col items-center md:items-start gap-5">
                <ScoreRing score={scanResult.geoScore} label={scanResult.scoreLabel} />

                <div className="text-center md:text-left">
                  <p className="text-sm font-medium" style={{ color: "rgba(255,221,204,0.55)" }}>
                    Fix{" "}
                    <strong style={{ color: "#FD5BFF" }}>{fixCount} issues</strong>
                    {" "}→ reach{" "}
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
              </div>

              {/* right: engine matrix */}
              <div className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", backdropFilter: "blur(12px)" }}>
                {/* card header */}
                <div style={{ padding: "11px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,221,204,0.38)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    Engine Visibility
                  </span>
                </div>
                {/* engine rows */}
                <div style={{ padding: "12px 16px 14px" }}>
                  {engines.map((e) => (
                    <div key={e.name} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: e.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,221,204,0.7)", width: 70, flexShrink: 0 }}>{e.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, flex: 1, color: e.ok ? "#22c55e" : "#ef4444" }}>
                        {e.ok ? "✓ " : "✗ "}{e.status}
                      </span>
                      {e.issue && (
                        <span style={{ fontSize: 9, color: "rgba(255,221,204,0.22)", textAlign: "right", maxWidth: 76, lineHeight: 1.3, flexShrink: 0 }}>{e.issue}</span>
                      )}
                    </div>
                  ))}
                </div>
                {/* footer */}
                <div style={{ padding: "9px 16px 13px", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
                  <p style={{ fontSize: 11, color: "rgba(255,221,204,0.3)" }}>
                    Apply all fixes → reach{" "}
                    <strong style={{ color: "#22c55e" }}>{scanFixes?.estimatedScoreAfterFixes ?? 90}/100</strong>
                  </p>
                </div>
              </div>

            </div>
          </motion.div>
        </div>

        {/* Score breakdown */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 pb-12">
          <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
            <h3 className="text-sm font-bold text-gray-800 mb-4">Score Breakdown</h3>
            <div className="space-y-2">
              {toCategories(scanResult.scores).map((c) => <CategoryBar key={c.name} {...c} />)}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── FIXES ─────────────────────────────────────────────────────────────────────
  if (view === "fixes" && scanFixes) {
    const doneCount = doneFixes.size;
    const totalFree = scanFixes.fixes.length;

    return (
      <div className="min-h-screen bg-[#f4f4f7]" style={{ fontFamily: '"Geist",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
        <div className="bg-[#14082a] px-4 md:px-8 py-4"
          style={{ borderBottom: "1px solid rgba(253,91,255,0.12)" }}>
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button type="button" onClick={() => setView("report")}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors"
              style={{ color: "rgba(255,221,204,0.45)" }}>
              ← Back to report
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.22)" }}>
              <TrendingUp className="w-3.5 h-3.5" />
              +{scanFixes.estimatedScoreGain} pts potential
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 md:px-6 py-6">
          {/* progress */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border p-5 mb-5 flex items-center gap-6"
            style={{ borderColor: "rgba(0,0,0,0.07)", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
            <div className="text-center flex-shrink-0">
              <div className="text-3xl font-black text-gray-900">{doneCount}</div>
              <div className="text-xs text-gray-400">of {totalFree} done</div>
            </div>
            <div className="flex-1">
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
                <motion.div className="h-full rounded-full bg-emerald-500"
                  animate={{ width: `${(doneCount / Math.max(1, totalFree)) * 100}%` }}
                  transition={{ duration: 0.5 }} />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-gray-400">Current: {scanFixes.currentScore}/100</span>
                <span className="text-xs font-semibold text-emerald-600">→ {scanFixes.estimatedScoreAfterFixes} after all fixes</span>
              </div>
            </div>
          </motion.div>

          <div className="space-y-3">
            {scanFixes.fixes.map((fix, i) => (
              <FixCard key={fix.order} fix={fix} index={i} total={scanFixes.fixes.length}
                done={doneFixes.has(fix.order)}
                onDone={() => setDoneFixes((p) => new Set([...p, fix.order]))}
                onSkip={() => setSkippedFixes((p) => new Set([...p, fix.order]))} />
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="mt-8 rounded-2xl p-6 text-center bg-white"
            style={{ border: "1px solid rgba(253,91,255,0.15)", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
            <p className="text-sm font-semibold text-gray-800 mb-1">Applied your fixes?</p>
            <p className="text-xs text-gray-500 mb-4">Re-run the scan to see your new score.</p>
            <button type="button" onClick={() => router.push("/visibility")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
              style={{ background: "linear-gradient(135deg,#FD5BFF,#7928ca)" }}>
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
  url: "example.com", geoScore: 34, scoreLabel: "Poor",
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
      fix: { filename: "HTML <head>", language: "html", instruction: "Paste this inside the <head>...</head> section.", code: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "Your Company",\n  "url": "https://yoursite.com"\n}\n</script>` },
      verification: "Re-run scan. Schema score should jump from 0 to 35+.",
    },
    {
      id: "mock-2", order: 2, priority: 2, severity: "medium", area: "E-E-A-T", effort: "medium", estimatedImpact: 8,
      title: "Add author bylines to content pages",
      description: "AI systems look for named authors to assess expertise and trust signals.",
      fix: { filename: "Content pages", language: "html", instruction: "Add a visible author byline to your main content pages.", code: `<div class="author-byline">\n  <span>Written by <a href="/about/author">Author Name</a></span>\n</div>` },
      verification: "Re-run scan. E-E-A-T author signals should improve.",
    },
  ],
};
