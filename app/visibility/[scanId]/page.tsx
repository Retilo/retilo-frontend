"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Check, Loader2, Copy, CheckCheck, ChevronDown, ChevronUp, SkipForward, Globe, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────────────────

type ScanView = "running" | "report" | "fixes";

interface ScanStatus {
  status: "pending" | "running" | "completed" | "failed";
  step?: string;
  completedSteps?: string[];
}

interface CategoryScore {
  name: string;
  score: number;
  maxScore: number;
  status: "critical" | "warning" | "passing";
}

// Actual API shape from GET /v1/geo-seo/scan/:scanId
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

// Actual API shape from GET /v1/geo-seo/scan/:scanId/fixes
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

// Derives CategoryScore[] from the flat scores object
function toCategories(scores: ScanResult["scores"]): CategoryScore[] {
  const toStatus = (s: number): "critical" | "warning" | "passing" =>
    s >= 70 ? "passing" : s >= 35 ? "warning" : "critical";
  return [
    { name: "AI Crawlers", score: scores.aiCrawlerAccess, maxScore: 100, status: toStatus(scores.aiCrawlerAccess) },
    { name: "Citability",  score: scores.citability,      maxScore: 100, status: toStatus(scores.citability) },
    { name: "E-E-A-T",     score: scores.eeat,            maxScore: 100, status: toStatus(scores.eeat) },
    { name: "Technical",   score: scores.technical,       maxScore: 100, status: toStatus(scores.technical) },
    { name: "Schema",      score: scores.schema,          maxScore: 100, status: toStatus(scores.schema) },
  ];
}

// ── Progress steps shown during scan ──────────────────────────────────────────

const SCAN_STEPS = [
  "Fetching robots.txt",
  "Checking AI crawler access (GPTBot, ClaudeBot, Perplexity…)",
  "Scanning structured data",
  "Analyzing content citability",
  "Reviewing E-E-A-T signals",
  "Computing final score",
];

// ── Score gauge (SVG arc) ──────────────────────────────────────────────────────

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const R = 72;
  const cx = 90;
  const cy = 90;
  const circumference = Math.PI * R; // half circle arc
  const startAngle = 180;
  const endAngle = 0;
  const arcLength = circumference;
  const progress = Math.min(100, Math.max(0, score)) / 100;
  const dashOffset = arcLength * (1 - progress);

  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";
  const bgColor = score >= 70 ? "#22c55e20" : score >= 40 ? "#f59e0b20" : "#ef444420";

  return (
    <div className="relative flex flex-col items-center">
      <svg width="180" height="110" viewBox="0 0 180 110">
        {/* Background track */}
        <path
          d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Score arc */}
        <path
          d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${arcLength}`}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.23,1,0.32,1)" }}
        />
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center" style={{ bottom: 4 }}>
        <span className="font-black leading-none" style={{ fontSize: 48, color, lineHeight: 1 }}>{score}</span>
        <span className="text-sm font-semibold" style={{ color: "rgba(0,0,0,0.4)" }}>/ 100</span>
        <span className="text-xs font-bold mt-1 px-2 py-0.5 rounded-full" style={{ background: bgColor, color }}>{label}</span>
      </div>
    </div>
  );
}

// ── Category bar ───────────────────────────────────────────────────────────────

function CategoryBar({ name, score, maxScore, status }: CategoryScore) {
  const pct = (score / maxScore) * 100;
  const color = status === "critical" ? "#ef4444" : status === "warning" ? "#f59e0b" : "#22c55e";
  const icon = status === "critical" ? "✗" : status === "warning" ? "⚠" : "✓";
  return (
    <div className="flex items-center gap-3 py-2.5 px-4 rounded-xl" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)" }}>
      <div className="w-28 text-xs font-semibold text-gray-600 flex-shrink-0">{name}</div>
      <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(0,0,0,0.06)" }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          style={{ background: color }}
        />
      </div>
      <span className="text-xs font-bold w-14 text-right tabular-nums" style={{ color }}>{score}/{maxScore}</span>
      <span className="text-xs w-4 text-center" style={{ color }}>{icon}</span>
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

  const severityColor = fix.severity === "critical" ? "#ef4444" : fix.severity === "high" ? "#f97316" : fix.severity === "medium" ? "#f59e0b" : "#22c55e";
  const severityBg = fix.severity === "critical" ? "#ef444415" : fix.severity === "high" ? "#f9731615" : fix.severity === "medium" ? "#f59e0b15" : "#22c55e15";
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
      {/* Card header */}
      <button
        type="button"
        className="w-full text-left px-5 py-4 flex items-start gap-3"
        onClick={() => !isFree && index > 1 ? null : setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full uppercase" style={{ background: severityBg, color: severityColor }}>
            {fix.severity}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-gray-900 leading-tight">{fix.title}</span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${effortColor}15`, color: effortColor }}>
                {fix.effort} effort
              </span>
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

      {/* Paywall for non-free fixes */}
      {!isFree && index > 1 && (
        <div className="px-5 pb-4">
          <div className="rounded-xl p-4 text-center" style={{ background: "linear-gradient(135deg, rgba(253,91,255,0.05), rgba(121,40,202,0.05))", border: "1px dashed rgba(253,91,255,0.3)" }}>
            <p className="text-sm font-semibold text-gray-700 mb-1">🔒 Unlock full playbook</p>
            <p className="text-xs text-gray-400 mb-3">Get all {total} fixes + rescan tracking for $29/mo</p>
            <a href="/auth" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-xs font-semibold transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #FD5BFF, #7928ca)" }}>
              Unlock All Fixes <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (isFree || index <= 1) && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="px-5 pb-5 space-y-4">
              {/* Instruction */}
              <p className="text-sm text-gray-600 leading-relaxed">{fix.description}</p>
              <p className="text-xs text-gray-500 leading-relaxed italic">{fix.fix.instruction}</p>

              {/* Code block */}
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

              {/* Verification */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 leading-relaxed">{fix.verification}</p>
              </div>

              {/* Actions */}
              {!done && (
                <div className="flex items-center gap-2 pt-1">
                  <button type="button" onClick={onDone} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-semibold transition-all hover:opacity-90" style={{ background: "#22c55e" }}>
                    <Check className="w-3.5 h-3.5" /> Mark as Done
                  </button>
                  <button type="button" onClick={onSkip} className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-500 text-xs font-medium border transition-all hover:bg-gray-50" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
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

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ScanPage() {
  const { scanId } = useParams<{ scanId: string }>();
  const router = useRouter();

  const [view, setView] = useState<ScanView>("running");
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
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
    let stepIdx = 0;
    const stepTimer = setInterval(() => {
      setCompletedSteps((prev) => [...prev, stepIdx]);
      setCurrentStep(stepIdx + 1);
      stepIdx++;
      if (stepIdx >= SCAN_STEPS.length) clearInterval(stepTimer);
    }, 900);

    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/v1/geo-seo/status/${scanId}`);
        const status: ScanStatus = res.data?.data ?? res.data;
        if (status.status === "completed") {
          stopPolling();
          clearInterval(stepTimer);
          setCompletedSteps(SCAN_STEPS.map((_, i) => i));
          setTimeout(loadReport, 600);
        } else if (status.status === "failed") {
          stopPolling();
          clearInterval(stepTimer);
        }
      } catch {
        // Ignore polling errors
      }
    }, 3000);

    // Fallback: auto-advance after all steps complete (demo/dev mode)
    const fallbackTimer = setTimeout(() => {
      stopPolling();
      clearInterval(stepTimer);
      setCompletedSteps(SCAN_STEPS.map((_, i) => i));
      loadReport();
    }, SCAN_STEPS.length * 900 + 1500);

    return () => {
      stopPolling();
      clearInterval(stepTimer);
      clearTimeout(fallbackTimer);
    };
  }, [scanId, stopPolling, loadReport]);

  // ── RUNNING view ──
  if (view === "running") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "oklch(0.985 0.002 255)", fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="rounded-2xl border p-8 shadow-sm" style={{ background: "white", borderColor: "rgba(0,0,0,0.08)" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(253,91,255,0.12)" }}>
                <Globe className="w-5 h-5" style={{ color: "#FD5BFF" }} />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Analyzing your domain…</div>
                <div className="text-xs text-gray-400 font-mono mt-0.5">{scanId}</div>
              </div>
              <div className="ml-auto">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#FD5BFF" }} />
              </div>
            </div>

            <div className="space-y-3">
              {SCAN_STEPS.map((step, i) => {
                const isDone = completedSteps.includes(i);
                const isCurrent = currentStep === i;
                return (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0.4 }}
                    animate={{ opacity: isDone || isCurrent ? 1 : 0.35 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: isDone ? "#22c55e" : isCurrent ? "rgba(253,91,255,0.2)" : "rgba(0,0,0,0.06)" }}>
                      {isDone ? <Check className="w-3 h-3 text-white" /> : isCurrent ? <Loader2 className="w-2.5 h-2.5 animate-spin" style={{ color: "#FD5BFF" }} /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
                    </div>
                    <span style={{ color: isDone ? "#22c55e" : isCurrent ? "#374151" : "#9ca3af" }}>{step}</span>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-6 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #FD5BFF, #7928ca)" }}
                animate={{ width: `${Math.round((completedSteps.length / SCAN_STEPS.length) * 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── REPORT view ──
  if (view === "report" && scanResult) {
    return (
      <div className="min-h-screen px-4 py-12" style={{ background: "oklch(0.985 0.002 255)", fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <div className="max-w-2xl mx-auto">
          {/* Back */}
          <button type="button" onClick={() => router.push("/visibility")} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-8 transition-colors">
            ← New scan
          </button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Score card */}
            <div className="rounded-2xl border p-8 text-center shadow-sm" style={{ background: "white", borderColor: "rgba(0,0,0,0.08)" }}>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Your AI Visibility Score</p>
              <ScoreGauge score={scanResult.geoScore} label={scanResult.scoreLabel} />
              <p className="text-sm text-gray-500 mt-6 max-w-sm mx-auto">
                Fix these <strong>{scanFixes?.fixCount ?? scanResult.issues?.length ?? 0} issues</strong> → estimated score:{" "}
                <strong style={{ color: "#22c55e" }}>{scanFixes?.estimatedScoreAfterFixes ?? "—"}/100</strong>
              </p>
            </div>

            {/* Category breakdown */}
            <div className="rounded-2xl border p-6 shadow-sm" style={{ background: "white", borderColor: "rgba(0,0,0,0.08)" }}>
              <h3 className="text-sm font-bold text-gray-800 mb-4">Score Breakdown</h3>
              <div className="space-y-2">
                {toCategories(scanResult.scores).map((cat) => <CategoryBar key={cat.name} {...cat} />)}
              </div>
            </div>

            {/* CTA */}
            <motion.button
              type="button"
              onClick={() => setView("fixes")}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-semibold text-sm shadow-lg transition-all"
              style={{ background: "linear-gradient(135deg, #FD5BFF 0%, #7928ca 100%)", boxShadow: "0 8px 32px rgba(253,91,255,0.3)" }}
            >
              See My Fix Playbook <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── FIXES view ──
  if (view === "fixes" && scanFixes) {
    const doneCount = doneFixes.size;
    const totalFree = Math.min(2, scanFixes.fixes.length);

    return (
      <div className="min-h-screen px-4 py-12" style={{ background: "oklch(0.985 0.002 255)", fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button type="button" onClick={() => setView("report")} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
              ← Back to report
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a", border: "1px solid rgba(34,197,94,0.25)" }}>
              <TrendingUp className="w-3.5 h-3.5" />
              +{scanFixes.estimatedScoreGain} pts potential
            </div>
          </div>

          {/* Progress tracker */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border p-5 mb-6 flex items-center gap-6" style={{ background: "white", borderColor: "rgba(0,0,0,0.08)" }}>
            <div className="text-center flex-shrink-0">
              <div className="text-3xl font-black text-gray-900">{doneCount}</div>
              <div className="text-xs text-gray-400">of {totalFree} done</div>
            </div>
            <div className="flex-1">
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
                <motion.div className="h-full rounded-full bg-emerald-500" animate={{ width: `${(doneCount / Math.max(1, totalFree)) * 100}%` }} transition={{ duration: 0.5 }} />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-gray-400">Score: {scanFixes.currentScore}</span>
                <span className="text-xs font-semibold text-emerald-600">→ {scanFixes.estimatedScoreAfterFixes} after all fixes</span>
              </div>
            </div>
          </motion.div>

          {/* Fix cards */}
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 rounded-2xl p-6 text-center" style={{ background: "linear-gradient(135deg, rgba(253,91,255,0.06), rgba(121,40,202,0.06))", border: "1px solid rgba(253,91,255,0.2)" }}>
            <p className="text-sm font-semibold text-gray-800 mb-1">Applied your fixes?</p>
            <p className="text-xs text-gray-500 mb-4">Re-run the scan to see your new score and track improvements.</p>
            <button type="button" onClick={() => router.push("/visibility")} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #FD5BFF, #7928ca)" }}>
              Rescan my site <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
}

// ── Mock data (dev/fallback) ───────────────────────────────────────────────────

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
  currentScore: 34,
  scoreLabel: "Poor",
  estimatedScoreAfterFixes: 89,
  estimatedScoreGain: 55,
  fixCount: 2,
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
      description: "AI systems look for named authors to assess expertise.",
      fix: {
        filename: "Content pages", language: "html",
        instruction: "Add a visible author byline with credentials to your main content pages.",
        code: `<div class="author-byline">\n  <span>Written by <a href="/about/author">Author Name</a></span>\n</div>`,
      },
      verification: "Re-run scan. E-E-A-T author signals should improve.",
    },
  ],
};
