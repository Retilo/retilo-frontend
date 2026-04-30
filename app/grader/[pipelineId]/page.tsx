"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, Globe, MapPin, Star, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";
import {
  AnimatedCard,
  AnimatedCardContent,
  AnimatedCardHeader,
  AnimatedCardTitle,
  AnimatedCardDescription,
} from "@/components/animated-card";
import { AnimatedProgress } from "@/components/animated-progress";
import { AnimatedBadge } from "@/components/animated-badge";

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
      <nav className="h-14 flex items-center px-6 border-b bg-background">
        <a href="/grader" className="font-semibold text-sm text-foreground flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          Retilo Grader
        </a>
      </nav>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Left: progress */}
        <div className="flex flex-col items-center justify-center px-6 py-16 border-r">
          <div className="w-full max-w-sm space-y-5">

            {/* Business card */}
            <AnimatePresence>
              {pipeline?.brand && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                  <AnimatedCard padding="md" aria-label={pipeline.brand.name}>
                    <AnimatedCardHeader>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <AnimatedCardTitle className="text-base">{pipeline.brand.name}</AnimatedCardTitle>
                          {pipeline.brand.rating > 0 && (
                            <AnimatedCardDescription className="flex items-center gap-1 mt-0.5">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              {pipeline.brand.rating}
                            </AnimatedCardDescription>
                          )}
                          {pipeline.brand.website && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Globe className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground truncate">
                                {pipeline.brand.website.replace(/^https?:\/\//, "")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </AnimatedCardHeader>
                  </AnimatedCard>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Rotating scan copy */}
            <div className="text-center h-7">
              <AnimatePresence mode="wait">
                <motion.p
                  key={failed ? "failed" : copyIdx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className={`text-base font-medium ${failed ? "text-destructive" : "text-foreground"}`}
                >
                  {failed ? "Scan failed. Please try again." : SCAN_COPY[copyIdx]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Progress bar */}
            <AnimatedProgress value={displayProgress} label="Scan progress" showValue />

            {/* Phase steps */}
            <AnimatedCard padding="md" aria-label="Scan phases">
              <AnimatedCardContent>
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
                      className="flex items-center gap-3 py-1"
                    >
                      <span className="text-sm font-medium flex-1 text-foreground">
                        {PHASE_LABELS[phase]}
                      </span>
                      {isDone && <AnimatedBadge variant="outline">Done</AnimatedBadge>}
                      {isActive && <AnimatedBadge variant="default" live>Running</AnimatedBadge>}
                    </motion.div>
                  );
                })}
              </AnimatedCardContent>
            </AnimatedCard>

            {/* Error state */}
            {failed && (
              <AnimatedCard padding="md" aria-label="Scan error" interactive={false}>
                <AnimatedCardHeader>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                    <div>
                      <AnimatedCardTitle className="text-destructive text-sm">Something went wrong</AnimatedCardTitle>
                      <a href="/grader" className="text-xs text-destructive underline mt-0.5 inline-block">
                        Try a different business →
                      </a>
                    </div>
                  </div>
                </AnimatedCardHeader>
              </AnimatedCard>
            )}
          </div>
        </div>

        {/* Right: radar animation */}
        <div className="hidden lg:flex items-center justify-center bg-muted/30 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative flex items-center justify-center">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="absolute rounded-full border border-primary/20"
                style={{ width: i * 120, height: i * 120 }}
              />
            ))}

            <div
              className="absolute w-40 h-0.5 origin-left"
              style={{
                background: "linear-gradient(to right, hsl(var(--primary)/0.6), transparent)",
                animation: "spin 3s linear infinite",
              }}
            />

            <div className="relative z-10 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>

            {[
              { top: "20%", left: "65%", delay: 1.5 },
              { top: "60%", left: "72%", delay: 2.2 },
              { top: "75%", left: "30%", delay: 1.8 },
            ].map((pos, i) => (
              <motion.div
                key={i}
                className="absolute w-5 h-5 rounded-full bg-slate-400 border-2 border-white shadow"
                style={{ top: pos.top, left: pos.left }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: pos.delay, duration: 0.4 }}
              />
            ))}

            {[
              { top: "18%", left: "73%", delay: 1.7 },
              { top: "58%", left: "79%", delay: 2.5 },
            ].map((pos, i) => (
              <motion.div
                key={i}
                className="absolute text-xs font-medium bg-background/90 border rounded-lg px-2 py-1 shadow-sm"
                style={{ top: pos.top, left: pos.left }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: pos.delay + 0.2 }}
              >
                Competitor
              </motion.div>
            ))}
          </div>

          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            <AnimatedBadge variant="secondary" live>Scanning nearby competitors…</AnimatedBadge>
          </div>
        </div>
      </div>
    </div>
  );
}
