"use client";

import { SlidersHorizontal } from "lucide-react";
import type { Variants } from "motion/react";
import { motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { scrollMarginAnchor, sectionGutter, sectionGutterX } from "@/lib/organic-theme";
import { OrganicButton } from "./organic-button";
import { OrganicShapeBadge } from "./organic-shape-badge";

type ParamRow = {
  id: string;
  label: string;
  value: string;
  hint: string;
  /** Shown next to value chip when set */
  suffix?: string;
};

const TOGGLES = [
  { label: "Live preview", mode: 0 as const },
  { label: "HDR-safe", mode: 1 as const },
  { label: "Export LUT", mode: 2 as const },
] as const;

/** Each mode changes the spec rows + status copy so toggles do real work in the UI. */
const MODE_ROWS: ParamRow[][] = [
  [
    {
      id: "01",
      label: "Dither matrix",
      value: "4 × 4 Bayer",
      hint: "Fixed pattern; swaps with ordered noise intensity.",
      suffix: "locked",
    },
    {
      id: "02",
      label: "Simplex scale",
      value: "1.35",
      hint: "Spatial frequency of the procedural layer.",
    },
    {
      id: "03",
      label: "Chroma hold",
      value: "Orange",
      hint: "Locks accent to brand peach/cream surfaces.",
    },
    {
      id: "04",
      label: "Grain blend",
      value: "62%",
      hint: "How much filmic noise rides on top of the lattice.",
    },
  ],
  [
    {
      id: "01",
      label: "Dither matrix",
      value: "4 × 4 Bayer",
      hint: "Unchanged in HDR-safe; matrix stays deterministic.",
      suffix: "locked",
    },
    {
      id: "02",
      label: "Simplex scale",
      value: "1.12",
      hint: "Reduced so highlights don’t clip when mapped to SDR.",
    },
    {
      id: "03",
      label: "Chroma hold",
      value: "Rec.709",
      hint: "Gamut mapped to display primaries for safe output.",
    },
    {
      id: "04",
      label: "Grain blend",
      value: "38%",
      hint: "Grain capped so combined signal stays within nominal white.",
    },
  ],
  [
    {
      id: "01",
      label: "Dither matrix",
      value: "4 × 4 Bayer",
      hint: "Baked into LUT header; no runtime toggles in export.",
      suffix: "baked",
    },
    {
      id: "02",
      label: "Simplex scale",
      value: "1.35 → LUT",
      hint: "Sampled at 33³ lattice; matches last preview commit.",
    },
    {
      id: "03",
      label: "Chroma hold",
      value: "Orange",
      hint: "Written as ACEScg → display transform in the cube.",
    },
    {
      id: "04",
      label: "Grain blend",
      value: "62% (static)",
      hint: "Filmic layer stored as per-channel curves in the LUT.",
    },
  ],
];

const MODE_STATUS: { title: string; body: string }[] = [
  {
    title: "Live preview",
    body: "Chip values mirror the running dither pass. Switch modes to compare HDR-safe and export presets.",
  },
  {
    title: "HDR-safe",
    body: "Simplex scale, chroma, and grain are clamped for SDR / limited-range output—no blown highlights.",
  },
  {
    title: "Export LUT",
    body: "Readouts lock to a bake-ready snapshot (33³ cube). Use your pipeline to emit .cube / .3dl from these values.",
  },
];

const EASE_OUT = [0.2, 0, 0, 1] as const;

export function ShaderSettingsSection({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? "visible" : "hidden";
  const [active, setActive] = useState(0);

  const rows = MODE_ROWS[active] ?? MODE_ROWS[0];
  const status = MODE_STATUS[active] ?? MODE_STATUS[0];

  const itemVariants: Variants = useMemo(
    () => ({
      hidden: {
        opacity: shouldReduceMotion ? 1 : 0,
        y: shouldReduceMotion ? 0 : 16,
        filter: shouldReduceMotion ? "blur(0px)" : "blur(3px)",
      },
      visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { type: "spring", bounce: 0.05, duration: 0.5 },
      },
    }),
    [shouldReduceMotion]
  );

  const toggleRowEnter = useMemo(() => {
    if (shouldReduceMotion) {
      return { opacity: 1, y: 0, filter: "blur(0px)" };
    }
    return { opacity: 0, y: 10, filter: "blur(4px)" };
  }, [shouldReduceMotion]);

  const toggleRowAnimate = useMemo(() => {
    if (shouldReduceMotion) {
      return { opacity: 1, y: 0, filter: "blur(0px)" };
    }
    return { opacity: 1, y: 0, filter: "blur(0px)" };
  }, [shouldReduceMotion]);

  return (
    <section
      className={cn(
        "relative bg-white antialiased dark:bg-neutral-950",
        sectionGutter,
        scrollMarginAnchor,
        className
      )}
      data-active-mode={active}
      data-slot="organic-shader-settings"
      id="shader-settings"
    >
      <div className={cn("mx-auto max-w-3xl", sectionGutterX)}>
        <motion.div
          className="mb-10"
          initial={initial}
          variants={itemVariants}
          viewport={{ once: true, margin: "-80px" }}
          whileInView="visible"
        >
          <OrganicShapeBadge
            className="mb-4"
            icon={<SlidersHorizontal aria-hidden className="stroke-[1.75]" />}
            label="Shader settings"
          />
          <h2 className="font-bold text-3xl text-neutral-900 tracking-[-0.03em] sm:text-4xl dark:text-[#FFDDCC]">
            Parameters we ship with
          </h2>
          <p className="mt-4 max-w-xl text-pretty text-lg text-neutral-600 leading-relaxed dark:text-neutral-400">
            Spec-style rows with monospace indices—tune the look without opening a node graph. Values are illustrative;
            wire them to your pipeline when you integrate.
          </p>

          <motion.div
            className="mt-8 flex flex-wrap gap-2"
            initial={initial}
            variants={itemVariants}
            viewport={{ once: true, margin: "-40px" }}
            whileInView="visible"
          >
            <p className="w-full font-medium text-neutral-600 text-sm dark:text-neutral-500">Quick toggles</p>
            {TOGGLES.map(({ label, mode }) => {
              const isOn = active === mode;
              return (
                <OrganicButton
                  className={cn(
                    isOn &&
                      "shadow-[0_0_0_1px_rgba(251,166,73,0.2)] ring-1 ring-[#FBA649]/50 ring-offset-2 ring-offset-white dark:ring-offset-neutral-950"
                  )}
                  href="#shader-settings"
                  key={label}
                  label={label}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive(mode);
                  }}
                  size="sm"
                  variantColor="dither"
                />
              );
            })}
          </motion.div>
        </motion.div>

        {/* key={active} remounts so enter animations run on every toggle (whileInView only fires once). */}
        <motion.div className="mb-4 space-y-4" key={active}>
          <motion.div
            animate={toggleRowAnimate}
            aria-live="polite"
            className="rounded-xl border border-neutral-200/90 bg-neutral-100/50 px-4 py-3 dark:border-white/10 dark:bg-[#1f1218]"
            initial={toggleRowEnter}
            transition={{
              duration: 0.22,
              ease: EASE_OUT,
            }}
          >
            <p className="font-medium text-neutral-800 text-sm dark:text-[#FFDDCC]">{status.title}</p>
            <p className="mt-1 text-pretty text-neutral-600 text-sm leading-relaxed dark:text-neutral-400">
              {status.body}
            </p>
          </motion.div>

          <ul className="flex min-h-[280px] flex-col gap-0 overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-50/80 dark:border-white/10 dark:bg-[#1a1410]">
            {rows.map((row, i) => (
              <motion.li
                animate={toggleRowAnimate}
                className={cn(
                  "flex flex-col gap-2 border-neutral-200/80 border-b px-5 py-5 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8 sm:px-6 dark:border-white/10"
                )}
                initial={toggleRowEnter}
                key={row.id}
                transition={{
                  duration: 0.22,
                  ease: EASE_OUT,
                  delay: shouldReduceMotion ? 0 : 0.04 + i * 0.045,
                }}
              >
                <div className="flex min-w-0 flex-1 items-baseline gap-3">
                  <span className="shrink-0 font-mono text-[10px] text-neutral-400 tracking-[0.22em] dark:text-neutral-500">
                    {row.id}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-neutral-900 dark:text-[#FFDDCC]">{row.label}</p>
                    <p className="mt-1 text-neutral-500 text-sm dark:text-neutral-500">{row.hint}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:justify-end">
                  <span
                    className={cn(
                      "inline-block rounded-full border border-[#FBA649]/40 bg-white px-3 py-1 font-medium text-[#2d1f16] text-sm tabular-nums dark:bg-[#2d1f16]/60 dark:text-[#FFDDCC]"
                    )}
                    style={{
                      boxShadow: "0 0 0 1px rgba(251,166,73,0.15), 0 4px 16px rgba(0,0,0,0.08)",
                    }}
                  >
                    {row.value}
                  </span>
                  {row.suffix ? (
                    <span className="font-mono text-neutral-400 text-xs dark:text-neutral-600">{row.suffix}</span>
                  ) : null}
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
