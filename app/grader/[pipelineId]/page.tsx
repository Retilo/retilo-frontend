"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Check, Loader2, MapPin, Star, TrendingUp, Globe, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";

const PHASE_ORDER = ["ingestion", "enrichment", "analysis", "scoring"] as const;
type Phase = (typeof PHASE_ORDER)[number];

const PHASE_LABELS: Record<Phase, string> = {
  ingestion: "Fetching Google Business Profile",
  enrichment: "Collecting reviews & media",
  analysis: "Analyzing SEO & reputation",
  scoring: "Computing your growth score",
};

const SCAN_COPY = [
  "Scanning Google Business Profile…",
  "Reading customer reviews…",
  "Analyzing photos & media…",
  "Checking competitor rankings…",
  "Computing your growth score…",
  "Generating insights…",
];

type TaskStatus = "pending" | "processing" | "complete" | "failed";

interface Pipeline {
  id: string;
  status: "created" | "processing" | "partial" | "completed" | "failed";
  progress?: { total: number; completed: number; percentage: number };
  tasks?: Array<{ name: string; phase: Phase; status: TaskStatus }>;
  brand?: { id: string; name: string; rating: number; website?: string };
}

function phaseStatus(tasks: Pipeline["tasks"], phase: Phase): TaskStatus {
  if (!tasks) return "pending";
  const phaseTasks = tasks.filter((t) => t.phase === phase);
  if (phaseTasks.length === 0) return "pending";
  if (phaseTasks.every((t) => t.status === "complete")) return "complete";
  if (phaseTasks.some((t) => t.status === "processing")) return "processing";
  return "pending";
}

export default function GraderScanPage() {
  const { pipelineId } = useParams<{ pipelineId: string }>();
  const router = useRouter();
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [failed, setFailed] = useState(false);
  const [copyIdx, setCopyIdx] = useState(0);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const id = setInterval(() => setCopyIdx((i) => (i + 1) % SCAN_COPY.length), 3200);
    return () => clearInterval(id);
  }, []);

  const poll = useCallback(async () => {
    try {
      const res = await api.get<Pipeline>(`/v1/pipelines/${pipelineId}`);
      setPipeline(res.data);
      if (res.data.status === "completed") {
        router.replace(`/grader/${pipelineId}/report`);
        return;
      }
      if (res.data.status === "failed") { setFailed(true); return; }
      pollTimer.current = setTimeout(poll, 3000);
    } catch {
      setFailed(true);
    }
  }, [pipelineId, router]);

  useEffect(() => {
    poll();
    return () => { if (pollTimer.current) clearTimeout(pollTimer.current); };
  }, [poll]);

  const progress = pipeline?.progress?.percentage ?? 0;
  const displayProgress = Math.max(progress, failed ? progress : 4);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="h-14 flex items-center px-6 border-b bg-background">
        <a href="/grader" className="font-semibold text-sm text-foreground flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          Retilo Grader
        </a>
      </nav>

      {/* Two-column layout on lg+ */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0">

        {/* Left: progress */}
        <div className="flex flex-col items-center justify-center px-6 py-16 border-r">
          <div className="w-full max-w-sm">

            {/* Business card */}
            <AnimatePresence>
              {pipeline?.brand && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 p-4 rounded-2xl border bg-card flex items-start gap-4 shadow-sm"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground truncate">{pipeline.brand.name}</div>
                    {pipeline.brand.rating > 0 && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm text-muted-foreground">{pipeline.brand.rating}</span>
                      </div>
                    )}
                    {pipeline.brand.website && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Globe className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground truncate">{pipeline.brand.website.replace(/^https?:\/\//, "")}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scan message */}
            <div className="text-center mb-6 h-7">
              <AnimatePresence mode="wait">
                <motion.p
                  key={failed ? "failed" : copyIdx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className={`text-base font-medium ${failed ? "text-red-500" : "text-foreground"}`}
                >
                  {failed ? "Scan failed. Please try again." : SCAN_COPY[copyIdx]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-muted mb-8 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: "4%" }}
                animate={{ width: `${displayProgress}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            </div>

            {/* Phase steps */}
            <div className="space-y-4">
              {PHASE_ORDER.map((phase, i) => {
                const status = phaseStatus(pipeline?.tasks, phase);
                const isDone = status === "complete";
                const isActive = status === "processing";
                return (
                  <motion.div
                    key={phase}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: isDone || isActive ? 1 : 0.4, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.4 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${isDone ? "bg-primary" : isActive ? "border-2 border-primary bg-primary/10" : "bg-muted"}`}>
                      {isDone ? <Check className="w-3.5 h-3.5 text-primary-foreground" />
                        : isActive ? <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                        : <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />}
                    </div>
                    <span className={`text-sm font-medium flex-1 ${isDone || isActive ? "text-foreground" : "text-muted-foreground"}`}>
                      {PHASE_LABELS[phase]}
                    </span>
                    {isDone && <span className="text-xs text-green-500 font-medium">Done</span>}
                    {isActive && <span className="text-xs text-primary font-medium animate-pulse">Running…</span>}
                  </motion.div>
                );
              })}
            </div>

            {failed && (
              <div className="mt-8 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">Something went wrong</p>
                  <a href="/grader" className="text-xs text-red-500 underline mt-0.5 inline-block">Try a different business →</a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: radar scanning animation */}
        <div className="hidden lg:flex items-center justify-center bg-muted/30 relative overflow-hidden">
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Radar rings */}
          <div className="relative flex items-center justify-center">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="absolute rounded-full border border-primary/20"
                style={{ width: i * 120, height: i * 120 }}
              />
            ))}

            {/* Sweep line */}
            <div className="absolute w-40 h-0.5 origin-left"
              style={{
                background: "linear-gradient(to right, hsl(var(--primary)/0.6), transparent)",
                animation: "spin 3s linear infinite",
              }}
            />

            {/* Center pin */}
            <div className="relative z-10 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>

            {/* Simulated competitor dots */}
            {[
              { top: "20%", left: "65%", delay: "0.5s" },
              { top: "60%", left: "72%", delay: "1.2s" },
              { top: "75%", left: "30%", delay: "0.8s" },
            ].map((pos, i) => (
              <motion.div
                key={i}
                className="absolute w-5 h-5 rounded-full bg-slate-400 border-2 border-white shadow"
                style={{ top: pos.top, left: pos.left }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: parseFloat(pos.delay) + 1, duration: 0.4 }}
              />
            ))}

            {/* Competitor labels */}
            {[
              { top: "18%", left: "73%", delay: "0.7s" },
              { top: "58%", left: "79%", delay: "1.5s" },
            ].map((pos, i) => (
              <motion.div
                key={i}
                className="absolute text-xs font-medium bg-background/90 border rounded-lg px-2 py-1 shadow-sm"
                style={{ top: pos.top, left: pos.left }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: parseFloat(pos.delay) + 1.2 }}
              >
                Competitor
              </motion.div>
            ))}
          </div>

          {/* Status label */}
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <span className="text-xs text-muted-foreground font-medium">Scanning nearby competitors…</span>
          </div>
        </div>
      </div>
    </div>
  );
}
