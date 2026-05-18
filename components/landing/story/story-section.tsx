"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

/* ── Transition presets ─────────────────────────────────────── */

const spring = { type: "spring" as const, stiffness: 300, damping: 24 };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: spring,
  },
};

/* ── Data ───────────────────────────────────────────────────── */

const acts = [
  {
    number: "01",
    eyebrow: "Listen",
    title: "Every call, answered in your shop's voice.",
    description:
      "Retilo Voice picks up when you can't. It books, holds, and remembers — in Hindi, Tamil, English, or a mix. Calls become structured intent your team can act on.",
    pull: "It is not a chatbot. It is the other half of your counter.",
    stats: [
      { label: "Pickup rate", value: "100%" },
      { label: "Languages", value: "11" },
      { label: "Median resp.", value: "1.4s" },
    ],
    visual: "voice" as const,
  },
  {
    number: "02",
    eyebrow: "Understand",
    title: "Your street is not the city.",
    description:
      "Local Intelligence reads the four blocks around your shop — search demand, footfall windows, neighbour shifts, weather pulls — and tells you when the corner is yours.",
    pull: "Macro trends lie. Pin codes don't.",
    stats: [
      { label: "Coverage", value: "4-block" },
      { label: "Refresh", value: "Hourly" },
      { label: "Cohorts", value: "14" },
    ],
    visual: "heat" as const,
  },
  {
    number: "03",
    eyebrow: "Predict",
    title: "The signal before the rush.",
    description:
      "Demand Signals layers searches, weather, payday cycles, events, and returns into a live spectrum. You see the wave forming — three days before it hits the till.",
    pull: "Forecasting is just listening to five things at once.",
    stats: [
      { label: "Sources", value: "5+" },
      { label: "Lead time", value: "72 hr" },
      { label: "Accuracy", value: "91%" },
    ],
    visual: "spec" as const,
  },
  {
    number: "04",
    eyebrow: "Audit",
    title: "How does your shop actually score?",
    description:
      "The Grader runs a 60-second audit on everything customers see — photos, hours, reviews, catalog, search rank — and tells you what to fix first. Then it watches the score climb.",
    pull: "What gets graded gets fixed.",
    stats: [
      { label: "Scan time", value: "60s" },
      { label: "Signals", value: "120+" },
      { label: "Avg lift", value: "+45 pts" },
    ],
    visual: "grader" as const,
  },
];

/* ── Noise grain overlay ────────────────────────────────────── */

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

/* ── Deterministic noise helper ─────────────────────────────── */

function det(i: number, ch: number): number {
  let n = i * 127 + ch * 311 + 9973;
  n = (n * 9301 + 49_297) % 233_280;
  return n / 233_280;
}

/* ── Visual: Voice waveform ─────────────────────────────────── */

function VoiceVisual() {
  const shouldReduceMotion = useReducedMotion();
  const bars = Array.from({ length: 32 });

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-[340px] rounded-xl border border-white/8 bg-white/4 p-4">
        <div className="mb-3 flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full bg-emerald-400"
            style={{ animation: shouldReduceMotion ? "none" : "vs-pulse 1.6s infinite" }}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
            Live · Incoming call
          </span>
        </div>

        <div className="flex items-center gap-[2px] h-10">
          {bars.map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-blue-400"
              style={{
                height: `${(0.25 + det(i, 0) * 0.75) * 100}%`,
                opacity: 0.3 + det(i, 3) * 0.5,
                animation: shouldReduceMotion
                  ? "none"
                  : `vs-bar ${0.6 + det(i, 1) * 0.8}s ease-in-out ${det(i, 2) * 0.5}s infinite alternate`,
              }}
            />
          ))}
        </div>

        <div className="mt-4 space-y-2">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mb-1">
              Customer
            </p>
            <p className="text-sm text-zinc-200 leading-relaxed">
              &ldquo;Table for two, Saturday 8pm?&rdquo;
            </p>
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-blue-400 mb-1">
              Retilo Voice
            </p>
            <p className="text-sm text-zinc-200 leading-relaxed">
              &ldquo;Confirmed. Any dietary preferences?&rdquo;
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes vs-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(52,211,153,0.5); }
          50% { opacity: 0.7; box-shadow: 0 0 0 8px rgba(52,211,153,0); }
        }
        @keyframes vs-bar {
          from { transform: scaleY(0.3); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

/* ── Visual: Local heatmap ──────────────────────────────────── */

function HeatVisual() {
  const shouldReduceMotion = useReducedMotion();
  const COLS = 14;
  const ROWS = 10;

  const cells = useMemo(() => {
    const cx = COLS / 2;
    const cy = ROWS / 2;
    const maxDist = Math.sqrt(cx ** 2 + cy ** 2);
    return Array.from({ length: COLS * ROWS }, (_, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const dist = Math.sqrt((col - cx) ** 2 + (row - cy) ** 2);
      const heat = Math.max(0, Math.min(1, 1 - dist / maxDist + det(i, 0) * 0.3));
      return { heat, delay: (dist / maxDist) * 1.5 };
    });
  }, []);

  const heatColor = (h: number) => {
    if (h > 0.75) return "bg-blue-500";
    if (h > 0.5) return "bg-blue-400/70";
    if (h > 0.3) return "bg-blue-300/40";
    return "bg-white/[0.05]";
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <div className="w-full max-w-[360px] rounded-xl border border-white/8 bg-white/3 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
            Local demand
          </span>
          <span className="font-mono text-[10px] text-zinc-500">
            4-block radius
          </span>
        </div>

        <div
          className="grid gap-[3px] p-4"
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
        >
          {cells.map((cell, i) => (
            <div
              key={i}
              className={cn("aspect-square rounded-[2px]", heatColor(cell.heat))}
              style={{
                animation: shouldReduceMotion
                  ? "none"
                  : `heat-pulse 3s ease-in-out ${cell.delay}s infinite`,
              }}
            />
          ))}
        </div>

        <div className="flex items-center gap-3 border-t border-white/8 px-4 py-3">
          {[
            { c: "bg-blue-500", l: "High" },
            { c: "bg-blue-400/70", l: "Med" },
            { c: "bg-blue-300/40", l: "Low" },
          ].map(({ c, l }) => (
            <span
              key={l}
              className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-zinc-500"
            >
              <span className={cn("h-2 w-2 rounded-[2px]", c)} />
              {l}
            </span>
          ))}
          <span className="ml-auto font-mono text-[9px] text-emerald-400">
            ↻ Live
          </span>
        </div>
      </div>

      <style>{`
        @keyframes heat-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

/* ── Visual: Demand spectrogram ─────────────────────────────── */

function SpecVisual() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <div className="w-full max-w-[360px] rounded-xl border border-white/8 bg-white/3 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
            Demand Signals
          </span>
          <span className="font-mono text-[10px] text-blue-400">
            +72 hr ahead
          </span>
        </div>

        <div className="p-4">
          <svg viewBox="0 0 320 140" className="w-full" fill="none">
            <defs>
              <linearGradient id="spec-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgb(96 165 250 / 0.25)" />
                <stop offset="100%" stopColor="rgb(96 165 250 / 0)" />
              </linearGradient>
            </defs>
            {[35, 70, 105].map((y) => (
              <line key={y} x1="0" x2="320" y1={y} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            ))}
            <path
              d="M0,110 C32,95 64,105 96,75 S160,55 192,65 S256,40 320,50 L320,140 L0,140 Z"
              fill="url(#spec-fill)"
            />
            <path
              d="M0,110 C32,95 64,105 96,75 S160,55 192,65 S256,40 320,50"
              stroke="rgb(96 165 250)"
              strokeWidth="2"
              strokeLinecap="round"
              style={{
                animation: shouldReduceMotion
                  ? "none"
                  : "spec-draw 2s ease-out forwards",
              }}
            />
            <path
              d="M0,125 C32,118 64,122 96,105 S160,90 192,98 S256,78 320,82"
              stroke="rgb(52 211 153 / 0.5)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="4 4"
            />
            <line x1="220" x2="220" y1="0" y2="140" stroke="rgba(251,191,36,0.3)" strokeWidth="1" strokeDasharray="3 3" />
            <text x="224" y="18" fill="rgb(251 191 36 / 0.7)" fontSize="8" fontFamily="monospace">
              now+72h
            </text>
          </svg>
        </div>

        <div className="grid grid-cols-3 border-t border-white/8">
          {[
            { lbl: "Searches", val: "↑ 34%", c: "text-blue-400" },
            { lbl: "Events", val: "3 near", c: "text-amber-400" },
            { lbl: "Payday", val: "Fri", c: "text-emerald-400" },
          ].map(({ lbl, val, c }) => (
            <div key={lbl} className="px-4 py-3 border-r border-white/8 last:border-0">
              <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                {lbl}
              </p>
              <p className={cn("font-mono text-sm font-medium", c)}>{val}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spec-draw {
          from { stroke-dashoffset: 600; stroke-dasharray: 600; }
          to   { stroke-dashoffset: 0;   stroke-dasharray: 600; }
        }
      `}</style>
    </div>
  );
}

/* ── Visual: Grader before/after ────────────────────────────── */

function GraderVisual() {
  const shouldReduceMotion = useReducedMotion();

  const rows = [
    { label: "Photos", before: 38, after: 92 },
    { label: "Reviews", before: 61, after: 89 },
    { label: "Hours", before: 45, after: 98 },
    { label: "Search rank", before: 29, after: 74 },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <div className="w-full max-w-[360px] space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Before", score: 43, cls: "text-rose-400", bar: "bg-rose-500" },
            { label: "After", score: 88, cls: "text-emerald-400", bar: "bg-emerald-500" },
          ].map(({ label, score, cls, bar }) => (
            <div
              key={label}
              className="rounded-xl border border-white/8 bg-white/3 p-4"
            >
              <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mb-1">
                {label}
              </p>
              <p className={cn("text-5xl font-bold tabular-nums tracking-tight leading-none", cls)}>
                {score}
              </p>
              <p className="font-mono text-[9px] text-zinc-600 mt-1">/ 100</p>
              <div className="mt-3 h-1 rounded-full bg-white/8 overflow-hidden">
                <div
                  className={cn("h-full rounded-full", bar)}
                  style={{
                    width: `${score}%`,
                    animation: shouldReduceMotion
                      ? "none"
                      : "grader-bar 1.4s cubic-bezier(0.22,1,0.36,1) forwards",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-white/8 bg-white/3 overflow-hidden">
          {rows.map(({ label, before, after }) => (
            <div
              key={label}
              className="grid grid-cols-[1fr_auto_auto] gap-3 items-center px-4 py-2.5 border-b border-white/6 last:border-0"
            >
              <span className="text-sm text-zinc-300">{label}</span>
              <span className="font-mono text-xs text-rose-400 tabular-nums">
                {before}
              </span>
              <span className="font-mono text-xs text-emerald-400 tabular-nums">
                {after}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes grader-bar { from { width: 0; } }
      `}</style>
    </div>
  );
}

/* ── Act row ────────────────────────────────────────────────── */

const VISUALS = {
  voice: VoiceVisual,
  heat: HeatVisual,
  spec: SpecVisual,
  grader: GraderVisual,
} as const;

function ActRow({ act, index }: { act: (typeof acts)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const shouldReduceMotion = useReducedMotion();
  const reversed = index % 2 === 1;

  const Visual = VISUALS[act.visual];

  return (
    <div
      ref={ref}
      className={cn("border-zinc-800 border-t", index === acts.length - 1 && "border-b")}
    >
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32 lg:px-8">
        <motion.div
          animate={isInView ? "visible" : "hidden"}
          initial="hidden"
          variants={containerVariants}
          className={cn(
            "grid items-center gap-16 lg:grid-cols-12 lg:gap-20",
            reversed && "lg:[direction:rtl]"
          )}
        >
          {/* Text column */}
          <div className={cn("space-y-8 lg:col-span-5", reversed && "lg:[direction:ltr]")}>
            <motion.span
              variants={itemVariants}
              className="font-mono text-blue-400 text-sm tracking-widest"
            >
              {act.number} · {act.eyebrow}
            </motion.span>

            <motion.h3
              variants={itemVariants}
              className="text-4xl text-white font-bold leading-[1.05] [text-wrap:balance] md:text-5xl lg:text-6xl tracking-tight"
            >
              {act.title}
            </motion.h3>

            <motion.p
              variants={itemVariants}
              className="max-w-md text-base text-zinc-400 leading-relaxed [text-wrap:pretty]"
            >
              {act.description}
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="text-lg text-zinc-300 italic border-l border-zinc-700 pl-4 max-w-xs leading-snug"
            >
              {act.pull}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex gap-8 pt-2 border-t border-zinc-800"
            >
              {act.stats.map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <p className="font-mono text-zinc-500 text-xs uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="font-mono text-white text-lg tabular-nums">
                    {stat.value}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Visual column */}
          <motion.div
            className={cn("relative lg:col-span-7", reversed && "lg:[direction:ltr]")}
            variants={{
              hidden: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.92 },
              visible: { opacity: 1, scale: 1, transition: { ...spring, delay: 0.2 } },
            }}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[12px] border border-zinc-800 bg-zinc-900 shadow-[0px_0px_0px_1px_rgba(255,255,255,0.04),0px_4px_12px_0px_rgba(0,0,0,0.5)]">
              <Visual />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Section header ─────────────────────────────────────────── */

function SectionHeader() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="mx-auto max-w-7xl px-6 pt-32 pb-12 lg:px-8">
      <motion.div
        animate={isInView ? "visible" : "hidden"}
        initial="hidden"
        variants={containerVariants}
        className="max-w-2xl space-y-5"
      >
        <motion.span
          variants={itemVariants}
          className="font-mono text-zinc-500 text-xs uppercase tracking-[0.2em]"
        >
          How it works
        </motion.span>

        <motion.h2
          variants={itemVariants}
          className="text-5xl text-white font-bold leading-[1.05] [text-wrap:balance] md:text-6xl lg:text-7xl tracking-tight"
        >
          Four modules.{" "}
          <span className="text-zinc-400 italic font-normal">One quieter Monday.</span>
        </motion.h2>

        <motion.p
          variants={itemVariants}
          className="max-w-lg text-base text-zinc-400 leading-relaxed [text-wrap:pretty]"
        >
          Retilo reads your shop from four angles — Voice, Local Intelligence, Demand Signals,
          and Grader — then stitches findings into one plan. Each module stands alone; together
          they&apos;re the operating system.
        </motion.p>
      </motion.div>
    </div>
  );
}

/* ── Section outro ──────────────────────────────────────────── */

function SectionOutro() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="mx-auto max-w-7xl px-6 py-24 lg:px-8 border-t border-zinc-800">
      <motion.div
        animate={isInView ? "visible" : "hidden"}
        initial="hidden"
        variants={containerVariants}
        className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
      >
        <motion.div variants={itemVariants} className="space-y-4 max-w-lg">
          <p className="font-mono text-zinc-500 text-xs uppercase tracking-[0.2em]">
            The whole machine
          </p>
          <h2 className="text-4xl text-white font-bold tracking-tight md:text-5xl">
            Four threads.{" "}
            <span className="text-zinc-400 italic font-normal">One shop.</span>
          </h2>
          <p className="text-zinc-400 text-base leading-relaxed">
            They write to the same brain. You get a single Monday plan — what to do next, why,
            and what it moves.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
          <a
            href="/grader"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black hover:bg-zinc-100 transition-colors"
          >
            Run a 60-second audit
          </a>
          <a
            href="https://wa.me/917288807097"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-700 px-6 py-3 text-sm text-white hover:border-zinc-500 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-400">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Talk to Expert
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ── Main export ────────────────────────────────────────────── */

export function StorySection() {
  return (
    <section
      id="how-it-works"
      className="relative bg-[#09090b] text-zinc-50"
      style={{ backgroundImage: NOISE_SVG, backgroundRepeat: "repeat" }}
    >
      <SectionHeader />
      {acts.map((act, index) => (
        <ActRow key={act.number} act={act} index={index} />
      ))}
      <SectionOutro />
    </section>
  );
}
