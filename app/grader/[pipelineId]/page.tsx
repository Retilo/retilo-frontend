"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Clock, AlertCircle, Zap } from "lucide-react";
import { api } from "@/lib/api";
import GenerateAnything from "@/components/tabs-illustration-vercel";

type TaskStatus = "complete" | "processing" | "pending" | "failed";
type Task = { name: string; phase: string; status: TaskStatus };

type Pipeline = {
  id: string;
  status: string;
  progress?: { total: number; completed: number; percentage: number };
  tasks?: Task[];
  brand?: { name: string; rating?: number };
};

const PHASES = [
  { key: "ingestion",  label: "Collecting your business data",       detail: "Google Business Profile, photos & contact info" },
  { key: "enrichment", label: "Building your restaurant profile",    detail: "Screenshots, reviews, logo & location mapping" },
  { key: "analysis",   label: "Running 16 checks",                   detail: "Website UX, SEO, reputation & performance" },
  { key: "scoring",    label: "Writing your personalised report",    detail: "Computing growth scores & finding opportunities" },
];

function getPhaseStatus(phaseKey: string, tasks: Task[]): TaskStatus {
  const pt = tasks.filter((t) => t.phase === phaseKey);
  if (!pt.length) return "pending";
  if (pt.every((t) => t.status === "complete")) return "complete";
  if (pt.some((t) => t.status === "processing")) return "processing";
  if (pt.some((t) => t.status === "failed")) return "failed";
  return "pending";
}

export default function GraderScanPage() {
  const { pipelineId } = useParams<{ pipelineId: string }>();
  const router = useRouter();
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [dots, setDots] = useState(".");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dotsRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    dotsRef.current = setInterval(() => setDots((d) => (d.length >= 3 ? "." : d + ".")), 600);
    return () => { if (dotsRef.current) clearInterval(dotsRef.current); };
  }, []);

  useEffect(() => {
    if (!pipelineId) return;
    async function poll() {
      try {
        const res = await api.get(`/v1/pipelines/${pipelineId}`);
        const data: Pipeline = res.data;
        setPipeline(data);
        if (data.status === "completed" || data.status === "partial") {
          if (pollRef.current) clearInterval(pollRef.current);
          router.push(`/grader/${pipelineId}/report`);
        } else if (data.status === "failed") {
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch { /* keep polling */ }
    }
    poll();
    pollRef.current = setInterval(poll, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [pipelineId, router]);

  const tasks = pipeline?.tasks ?? [];
  const percentage = pipeline?.progress?.percentage ?? 0;
  const brandName = pipeline?.brand?.name ?? "your restaurant";
  const isFailed = pipeline?.status === "failed";

  return (
    <div
      className="min-h-screen antialiased"
      style={{ background: "oklch(0.985 0.003 350)", fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, sans-serif' }}
    >
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 border-b border-gray-100 bg-white/80 backdrop-blur-md max-w-6xl mx-auto w-full" style={{ maxWidth: "100%" }}>
        <a href="/grader" className="flex items-center gap-2.5 text-gray-900 font-bold text-sm">
          <div className="relative w-8 h-8 rounded-xl flex items-center justify-center shadow-md" style={{ background: "oklch(0.58 0.24 350)" }}>
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          Retilo
        </a>
        <a href="/auth" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Sign in →</a>
      </nav>

      <div className="min-h-[calc(100vh-57px)] flex flex-col lg:flex-row">

        {/* Left: progress */}
        <div className="flex-1 flex items-center justify-center px-6 py-14">
          <div className="w-full max-w-md">

            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-bold text-gray-900 mb-1" style={{ fontSize: "clamp(1.5rem, 3vw, 2.1rem)", letterSpacing: "-0.025em" }}>
                Grading{" "}
                <span style={{ backgroundImage: "linear-gradient(135deg, oklch(0.55 0.24 280), oklch(0.58 0.24 350))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  {brandName}
                </span>
                {!isFailed && dots}
              </h1>
              <p className="text-gray-400 text-sm mb-7">Hang tight — this takes about 60 seconds</p>
            </motion.div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>{Math.round(percentage)}% complete</span>
                <span>{pipeline?.progress?.completed ?? 0}/{pipeline?.progress?.total ?? 16} checks</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-gray-100">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, oklch(0.55 0.24 280), oklch(0.58 0.24 350))" }}
                  animate={{ width: `${Math.max(percentage, 3)}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Phases */}
            <div className="space-y-2.5">
              {PHASES.map((phase, i) => {
                const status = getPhaseStatus(phase.key, tasks);
                return (
                  <motion.div
                    key={phase.key}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-3 p-3.5 rounded-xl"
                    style={{
                      background: status === "processing" ? "#f5f3ff" : status === "complete" ? "#f0fdf4" : "white",
                      border: status === "processing" ? "1px solid #ddd6fe" : status === "complete" ? "1px solid #bbf7d0" : "1px solid #f3f4f6",
                      boxShadow: status !== "pending" ? "0 1px 4px rgba(0,0,0,0.04)" : "none",
                      transition: "all 0.4s ease",
                    }}
                  >
                    <div className="mt-0.5 shrink-0">
                      {status === "complete" ? (
                        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>
                          <CheckCircle2 className="w-[18px] h-[18px] text-emerald-500" />
                        </motion.div>
                      ) : status === "processing" ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                          className="w-[18px] h-[18px] rounded-full"
                          style={{ border: "2px solid #ddd6fe", borderTopColor: "#7c3aed" }}
                        />
                      ) : status === "failed" ? (
                        <AlertCircle className="w-[18px] h-[18px] text-red-400" />
                      ) : (
                        <Clock className="w-[18px] h-[18px] text-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-medium"
                        style={{ color: status === "complete" ? "#16a34a" : status === "processing" ? "#7c3aed" : "#d1d5db" }}
                      >
                        {phase.label}
                      </div>
                      <AnimatePresence>
                        {status !== "pending" && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-xs text-gray-400 mt-0.5"
                          >
                            {phase.detail}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {isFailed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-5 p-4 rounded-xl bg-red-50 border border-red-100 text-center"
              >
                <p className="text-red-600 text-sm font-medium">Scan couldn't complete — try a different listing.</p>
                <button onClick={() => router.push("/grader")} className="mt-2 text-xs text-gray-400 hover:text-gray-700 underline">
                  Search again
                </button>
              </motion.div>
            )}

            <p className="text-gray-300 text-[11px] mt-8">ID: {pipelineId}</p>
          </div>
        </div>

        {/* Right: illustration */}
        <div
          className="hidden lg:flex flex-1 items-center justify-center px-8 py-14"
          style={{ borderLeft: "1px solid #f3f4f6" }}
        >
          <div className="w-full max-w-xl">
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white">
              <GenerateAnything />
            </div>
            <p className="text-center text-gray-400 text-xs mt-4">
              We check SEO, UX, reviews & website performance
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
