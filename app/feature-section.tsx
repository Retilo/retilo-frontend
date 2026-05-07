"use client";

import { motion, useInView, useReducedMotion, type Variants } from "motion/react";
import React, { useCallback, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
 * Transition presets
 * ----------------------------------------------------------------------- */

const spring = { type: "spring" as const, stiffness: 300, damping: 24 };

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.12 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: spring,
  },
};

/* ---------------------------------------------------------------------------
 * Noise grain overlay
 * ----------------------------------------------------------------------- */

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`;

/* ---------------------------------------------------------------------------
 * Feature data
 * ----------------------------------------------------------------------- */

const features = [
  {
    id: "models",
    number: "01",
    label: "Adaptive Models",
    title: "Train once, deploy everywhere",
    description:
      "Access 50+ pre-trained architectures. Fine-tune on your data in minutes — not days. Models auto-optimize for you.",
    stats: [
      { label: "Models", value: "50+" },
      { label: "Fine-tune", value: "<5 min" },
      { label: "Accuracy", value: "97.8%" },
    ],
    glowColor: "rgba(20, 184, 166, 0.10)",
    glowColorLight: "rgba(13, 148, 136, 0.18)",
  },
  {
    id: "inference",
    number: "02",
    label: "Live Inference",
    title: "Zero to global in one deploy",
    description:
      "Serverless inference that scales from zero to millions. Sub-200ms cold starts, 99.99% uptime SLA, pay-per-token pricing.",
    stats: [
      { label: "Cold start", value: "180ms" },
      { label: "Latency p99", value: "42ms" },
      { label: "Uptime", value: "99.99%" },
    ],
    glowColor: "rgba(139, 92, 246, 0.10)",
    glowColorLight: "rgba(124, 58, 237, 0.16)",
  },
  {
    id: "prompts",
    number: "03",
    label: "Prompt Studio",
    title: "Version-controlled prompts",
    description:
      "Visual prompt editor with real-time testing. Branch, compare, and roll back. Built-in eval metrics track quality across iterations.",
    stats: [
      { label: "Templates", value: "120+" },
      { label: "Eval score", value: "94%" },
      { label: "Iterations", value: "∞" },
    ],
    glowColor: "rgba(245, 158, 11, 0.10)",
    glowColorLight: "rgba(217, 119, 6, 0.18)",
  },
];

/* ---------------------------------------------------------------------------
 * SpotlightCard — cursor-reactive glow + spring hover
 * ----------------------------------------------------------------------- */

function SpotlightCard({
  children,
  className,
  glowColor,
  glowColorLight,
  index = 0,
}: {
  children: React.ReactNode;
  className?: string;
  glowColor: string;
  glowColorLight: string;
  index?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const prefersReduced = useReducedMotion();

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }, []);

  return (
    <motion.div
      animate={
        inView
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : prefersReduced
            ? { opacity: 0 }
            : { opacity: 0, y: 32, filter: "blur(8px)" }
      }
      initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 32, filter: "blur(8px)" }}
      ref={ref}
      transition={{
        type: "spring",
        stiffness: 180,
        damping: 26,
        delay: index * 0.12,
      }}
      whileHover={prefersReduced ? {} : { y: -6 }}
    >
      <div
        className={cn(
          "group relative overflow-hidden rounded-[20px] border border-border bg-card text-card-foreground transition-shadow duration-300",
          "shadow-black/5 shadow-sm",
          "hover:shadow-black/10 hover:shadow-md",
          "dark:bg-[#0c0c10] dark:shadow-[0px_0px_0px_1px_rgba(255,255,255,0.06),0px_2px_4px_-1px_rgba(0,0,0,0.3),0px_4px_12px_0px_rgba(0,0,0,0.5)]",
          "dark:hover:shadow-[0px_0px_0px_1px_rgba(255,255,255,0.1),0px_4px_8px_-2px_rgba(0,0,0,0.4),0px_8px_24px_0px_rgba(0,0,0,0.6)]",
          className
        )}
        onMouseMove={handleMouseMove}
      >
        {/* Cursor spotlight overlay */}
        {!prefersReduced && (
          <>
            <div
              className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:hidden"
              style={{
                background: `radial-gradient(420px circle at var(--mx, -1000px) var(--my, -1000px), ${glowColorLight}, transparent 70%)`,
              }}
            />
            <div
              className="pointer-events-none absolute inset-0 z-10 hidden opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:block"
              style={{
                background: `radial-gradient(420px circle at var(--mx, -1000px) var(--my, -1000px), ${glowColor}, transparent 70%)`,
              }}
            />
          </>
        )}

        {/* Hover border glow */}
        <div className="-outline-offset-1 pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-0 outline-1 outline-zinc-400/45 transition-opacity duration-500 group-hover:opacity-100 dark:outline-white/8" />

        {children}
      </div>
    </motion.div>
  );
}

/* ---------------------------------------------------------------------------
 * Visual 1 — Constellation mesh
 * Connected nodes with orbiting accent particle.
 * ----------------------------------------------------------------------- */

function ConstellationVisual() {
  const prefersReduced = useReducedMotion();

  const nodes = useMemo(
    () => [
      { x: 55, y: 35 },
      { x: 140, y: 22 },
      { x: 225, y: 48 },
      { x: 310, y: 28 },
      { x: 385, y: 52 },
      { x: 95, y: 88 },
      { x: 180, y: 78 },
      { x: 265, y: 92 },
      { x: 345, y: 82 },
      { x: 50, y: 142 },
      { x: 130, y: 132 },
      { x: 215, y: 148 },
      { x: 295, y: 138 },
      { x: 375, y: 128 },
      { x: 165, y: 185 },
      { x: 250, y: 192 },
      { x: 330, y: 178 },
    ],
    []
  );

  const edges = useMemo(
    () => [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [0, 5],
      [1, 6],
      [2, 7],
      [3, 8],
      [5, 6],
      [6, 7],
      [7, 8],
      [5, 9],
      [5, 10],
      [6, 11],
      [7, 12],
      [8, 13],
      [9, 10],
      [10, 11],
      [11, 12],
      [12, 13],
      [10, 14],
      [11, 15],
      [12, 16],
      [14, 15],
      [15, 16],
    ],
    []
  );

  const particlePath = useMemo(
    () =>
      `M${nodes[0].x},${nodes[0].y} L${nodes[1].x},${nodes[1].y} L${nodes[6].x},${nodes[6].y} L${nodes[11].x},${nodes[11].y} L${nodes[15].x},${nodes[15].y} L${nodes[16].x},${nodes[16].y} L${nodes[12].x},${nodes[12].y} L${nodes[7].x},${nodes[7].y} L${nodes[2].x},${nodes[2].y} L${nodes[3].x},${nodes[3].y} L${nodes[8].x},${nodes[8].y} L${nodes[13].x},${nodes[13].y} L${nodes[4].x},${nodes[4].y} L${nodes[3].x},${nodes[3].y} L${nodes[2].x},${nodes[2].y} L${nodes[1].x},${nodes[1].y} L${nodes[0].x},${nodes[0].y}`,
    [nodes]
  );

  return (
    <svg aria-hidden className="h-full w-full" fill="none" viewBox="0 0 420 210">
      {/* Edges */}
      {edges.map(([a, b], i) => (
        <line
          className="animate-[edgeFade_1.5s_ease-out_forwards] stroke-zinc-400/35 dark:stroke-white/5"
          key={`e-${i}`}
          strokeWidth={0.8}
          style={{
            opacity: 0,
            animationDelay: `${i * 40}ms`,
          }}
          x1={nodes[a].x}
          x2={nodes[b].x}
          y1={nodes[a].y}
          y2={nodes[b].y}
        />
      ))}

      {/* Nodes */}
      {nodes.map((node, i) => (
        <React.Fragment key={`n-${i}`}>
          <circle
            className={cn(
              "animate-[nodeScale_0.5s_ease-out_forwards]",
              i % 4 === 0 ? "fill-teal-600/75 dark:fill-teal-400/70" : "fill-zinc-500/45 dark:fill-white/35"
            )}
            cx={node.x}
            cy={node.y}
            r={i % 4 === 0 ? 2.5 : 1.8}
            style={{
              opacity: 0,
              transformOrigin: `${node.x}px ${node.y}px`,
              animationDelay: `${400 + i * 40}ms`,
            }}
          />
          {/* Pulse halos on accent nodes */}
          {!prefersReduced && i % 4 === 0 && (
            <circle
              className="animate-[halo_3s_ease-in-out_infinite] stroke-teal-600/35 dark:stroke-teal-400/30"
              cx={node.x}
              cy={node.y}
              fill="none"
              r={2.5}
              strokeWidth={1}
              style={{ animationDelay: `${i * 500}ms` }}
            />
          )}
        </React.Fragment>
      ))}

      {/* Traveling particle */}
      {!prefersReduced && (
        <circle className="fill-teal-600 dark:fill-teal-400" r={3}>
          <animateMotion dur="14s" path={particlePath} repeatCount="indefinite" />
        </circle>
      )}

      <style>{`
        @keyframes edgeFade { to { opacity: 1; } }
        @keyframes nodeScale { to { opacity: 1; } }
        @keyframes halo {
          0%, 100% { r: 2.5; opacity: 0.3; }
          50% { r: 10; opacity: 0; }
        }
      `}</style>
    </svg>
  );
}

/* ---------------------------------------------------------------------------
 * Visual 2 — Signal waveform
 * Layered sine waves with a scanning sweep line.
 * ----------------------------------------------------------------------- */

function SignalWaveVisual() {
  const prefersReduced = useReducedMotion();

  const subtleWaveStroke = useMemo(
    () =>
      [
        "stroke-zinc-400/10 dark:stroke-white/5",
        "stroke-zinc-400/15 dark:stroke-white/6",
        "stroke-zinc-400/12 dark:stroke-white/5",
        "stroke-zinc-500/20 dark:stroke-white/8",
        "stroke-zinc-500/25 dark:stroke-white/10",
      ] as const,
    []
  );

  const waves = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const baseY = 105;
      const amplitude = 15 + i * 10;
      const frequency = 2.5 + i * 0.6;
      const phaseOffset = i * 50;
      const points: string[] = [];

      for (let x = 0; x <= 420; x += 2) {
        const y = baseY + Math.sin((((x + phaseOffset) * Math.PI) / 180) * frequency) * amplitude;
        points.push(`${x === 0 ? "M" : "L"}${x},${y.toFixed(1)}`);
      }

      return {
        d: points.join(" "),
        isAccent: i === 2,
        width: i === 2 ? 1.8 : 0.8,
        delay: i * 200,
        strokeClass: i === 2 ? "stroke-violet-600/55 dark:stroke-violet-400/60" : subtleWaveStroke[i],
      };
    });
  }, [subtleWaveStroke]);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <svg aria-hidden className="h-full w-full" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 420 210">
        {waves.map((wave, i) => (
          <path
            className={cn("animate-[waveDraw_2s_ease-out_forwards]", wave.strokeClass)}
            d={wave.d}
            fill="none"
            key={i}
            strokeWidth={wave.width}
            style={{
              strokeDasharray: 1200,
              strokeDashoffset: 1200,
              animationDelay: `${wave.delay}ms`,
            }}
          />
        ))}

        {/* Scanning sweep */}
        {!prefersReduced && (
          <>
            <line
              className="animate-[sweep_5s_ease-in-out_infinite] stroke-violet-500/25 dark:stroke-violet-400/20"
              strokeWidth={1}
              x1={0}
              x2={0}
              y1={0}
              y2={210}
            />
            <circle
              className="animate-[sweepDot_5s_ease-in-out_infinite] fill-violet-600/75 dark:fill-violet-400/70"
              cy={105}
              r={4}
            />
          </>
        )}

        <style>{`
          @keyframes waveDraw {
            to { stroke-dashoffset: 0; }
          }
          @keyframes sweep {
            0%, 100% { transform: translateX(0px); }
            50% { transform: translateX(420px); }
          }
          @keyframes sweepDot {
            0%, 100% { cx: 0; }
            50% { cx: 420; }
          }
        `}</style>
      </svg>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Visual 3 — Heat grid
 * Animated grid of cells that pulse in a wave pattern.
 * ----------------------------------------------------------------------- */

function HeatGridVisual() {
  const prefersReduced = useReducedMotion();
  const cols = 14;
  const rows = 7;
  const cellSize = 22;
  const gap = 4;

  const cells = useMemo(() => {
    const result: {
      x: number;
      y: number;
      delay: number;
      isHot: boolean;
    }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * (cellSize + gap) + 16;
        const y = r * (cellSize + gap) + 14;
        const intensity = Math.abs(Math.sin(c * 0.55) * Math.cos(r * 0.75));
        const delay = (c + r) * 60;
        result.push({ x, y, delay, isHot: intensity > 0.55 });
      }
    }
    return result;
  }, []);

  return (
    <svg aria-hidden className="h-full w-full" fill="none" viewBox="0 0 420 210">
      {cells.map((cell, i) => (
        <rect
          className={cn(
            cell.isHot ? "fill-amber-500/22 dark:fill-amber-400/25" : "fill-zinc-300/70 dark:fill-white/2.5",
            "animate-[cellFade_0.4s_ease-out_forwards]",
            !prefersReduced && cell.isHot && "animate-[cellPulse_2.8s_ease-in-out_infinite]"
          )}
          height={cellSize}
          key={i}
          rx={4}
          style={{
            opacity: 0,
            animationDelay: `${cell.delay}ms`,
          }}
          width={cellSize}
          x={cell.x}
          y={cell.y}
        />
      ))}

      <style>{`
        @keyframes cellFade {
          to { opacity: 1; }
        }
        @keyframes cellPulse {
          0%, 100% { opacity: 0.18; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </svg>
  );
}

/* ---------------------------------------------------------------------------
 * Visuals array (mapped by feature index)
 * ----------------------------------------------------------------------- */

const visuals = [
  <ConstellationVisual key="constellation" />,
  <SignalWaveVisual key="signal" />,
  <HeatGridVisual key="heat" />,
];

/* ---------------------------------------------------------------------------
 * Main section export
 * ----------------------------------------------------------------------- */

export default function FeaturesSection() {
  const prefersReduced = useReducedMotion();
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.3 });

  return (
    <section
      className="relative min-h-screen overflow-hidden bg-background py-28 text-foreground selection:bg-teal-500/25 md:py-36 dark:selection:bg-teal-500/30"
      id="features"
      style={{
        backgroundImage: NOISE_SVG,
        backgroundRepeat: "repeat",
      }}
    >
      {/* Ambient gradient orbs */}
      <div className="-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-teal-500/7 blur-[120px] dark:bg-teal-500/3" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-[500px] w-[500px] translate-x-1/4 translate-y-1/4 rounded-full bg-violet-500/8 blur-[120px] dark:bg-violet-500/3" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* ── Section header ── */}
        <div className="mb-20 max-w-3xl md:mb-28" ref={headerRef}>
          <motion.div
            animate={headerInView ? "visible" : "hidden"}
            className="space-y-6"
            initial="hidden"
            variants={containerVariants}
          >
            <motion.span
              className="inline-block font-mono text-muted-foreground text-xs uppercase tracking-[0.25em]"
              variants={itemVariants}
            >
              Platform
            </motion.span>

            <motion.h2
              className="font-semibold text-4xl text-foreground leading-[1.08] tracking-tight [text-wrap:balance] md:text-5xl lg:text-6xl"
              variants={itemVariants}
            >
              Ship AI products,{" "}
              <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
                not infrastructure
              </span>
            </motion.h2>

            <motion.p
              className="max-w-xl text-base text-muted-foreground leading-relaxed [text-wrap:pretty] md:text-lg"
              variants={itemVariants}
            >
              From pre-trained models to production inference — everything your team needs to build, test, and deploy AI
              at scale.
            </motion.p>
          </motion.div>
        </div>

        {/* ── Feature cards grid ── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {features.map((feature, i) => (
            <SpotlightCard
              glowColor={feature.glowColor}
              glowColorLight={feature.glowColorLight}
              index={i}
              key={feature.id}
            >
              <div className="flex h-full flex-col p-5 md:p-6">
                {/* Visual area */}
                <div className="relative mb-6 h-52 w-full overflow-hidden rounded-[16px] bg-muted/80 transition-transform duration-500 group-hover:scale-[1.02] md:h-56 dark:bg-[#08080c]">
                  <div className="-outline-offset-1 pointer-events-none absolute inset-0 rounded-[inherit] outline-1 outline-zinc-300/60 dark:outline-white/4" />
                  {visuals[i]}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="font-[family-name:var(--font-mono)] text-muted-foreground text-xs tabular-nums">
                      {feature.number}
                    </span>
                    <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                      {feature.label}
                    </span>
                  </div>

                  <h3 className="mb-2.5 font-semibold text-card-foreground text-lg tracking-tight [text-wrap:balance] md:text-xl">
                    {feature.title}
                  </h3>

                  <p className="mb-6 text-muted-foreground text-sm leading-relaxed [text-wrap:pretty]">
                    {feature.description}
                  </p>

                  {/* Stats */}
                  <div className="mt-auto flex gap-6 border-border border-t pt-4">
                    {feature.stats.map((stat) => (
                      <div key={stat.label}>
                        <p className="font-[family-name:var(--font-mono)] text-[10px] text-muted-foreground uppercase tracking-wider">
                          {stat.label}
                        </p>
                        <p className="font-[family-name:var(--font-mono)] text-card-foreground text-sm tabular-nums">
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>

        {/* ── Bottom stats bar ── */}
        <motion.div
          className="mt-20 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 border-border border-t pt-12 md:mt-28 md:justify-between"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true, margin: "-60px" }}
          whileInView={{ opacity: 1 }}
        >
          {[
            { value: "50+", label: "Pre-trained Models" },
            { value: "14", label: "Global Regions" },
            { value: "<50ms", label: "P95 Latency" },
            { value: "99.99%", label: "Uptime SLA" },
          ].map((stat, i) => (
            <motion.div
              className="text-center md:text-left"
              initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
              key={stat.label}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 24,
                delay: 0.3 + i * 0.08,
              }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <p className="font-[family-name:var(--font-mono)] text-2xl text-foreground tabular-nums md:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-muted-foreground text-xs">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
