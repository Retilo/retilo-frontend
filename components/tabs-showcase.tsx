"use client";

import { LayoutGrid } from "lucide-react";
import type { Variants } from "motion/react";
import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { scrollMarginAnchor, sectionGutter, sectionGutterX } from "@/lib/organic-theme";
import { OrganicSectionAngle } from "./organic-section-angle";
import { OrganicShapeBadge } from "./organic-shape-badge";
import GenerateAnything from "./tabs-illustration";

const DITHER_FEATURES = [
  {
    id: "text",
    title: "Lattice",
    description:
      "Ordered noise and simplex fields stay locked to your grid—copy and metrics remain legible while the shader runs hot.",
  },
  {
    id: "image",
    title: "Contrast",
    description: "Orange on warm ink with peach halation at the edges—same palette as the hero, tuned for product UI.",
  },
  {
    id: "video",
    title: "Motion",
    description: "Tab cycles and panel swaps follow the same springy timing as the dither hero—no mush, no drift.",
    badge: "Live",
  },
] as const;

/** Scoped tokens so `GenerateAnything` matches the dither / organic page without editing the illustration file. */
const organicTabsOverrides = `
  .organic-tabs-showcase [data-generate-anything] {
    /* Shell radius comes from the rounded, overflow-hidden wrapper — avoids square ring vs rounded fill */
    --ga-shell-radius: 0;
    --ga-bg: #261a14;
    --ga-surface: #2d1f16;
    --ga-fg: #FFDDCC;
    --ga-fg-muted: rgba(255, 221, 204, 0.62);
    --ga-fg-body: rgba(255, 221, 204, 0.78);
    --ga-border: rgba(251,166,73, 0.22);
    --ga-border-subtle: rgba(251,166,73, 0.1);
    --ga-border-svg: rgba(251,166,73, 0.12);
    --ga-track: rgba(255, 255, 255, 0.08);
    --ga-fill: #FFDDCC;
    --ga-grid: rgba(251,166,73, 0.25);
    --ga-track-active: rgba(251,166,73, 0.2);
    --ga-badge: #FBA649;
    --ga-shadow: 0 0 0 1px rgba(251,166,73, 0.12), 0 12px 40px rgba(0, 0, 0, 0.35);
  }
`;

export function TabsShowcaseSection({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? "visible" : "hidden";

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
        transition: { type: "spring", bounce: 0.06, duration: 0.52 },
      },
    }),
    [shouldReduceMotion]
  );

  return (
    <section
      className={cn("relative bg-[#1a1410] antialiased", sectionGutter, scrollMarginAnchor, className)}
      data-slot="organic-tabs-showcase"
      id="tabs-illustration"
    >
      <OrganicSectionAngle position="top" />
      <style>{organicTabsOverrides}</style>
      <div className={cn("mx-auto max-w-6xl pt-36", sectionGutterX)}>
        <motion.div
          className="mb-10 max-w-2xl"
          initial={initial}
          variants={itemVariants}
          viewport={{ once: true, margin: "-80px" }}
          whileInView="visible"
        >
          <OrganicShapeBadge
            className="mb-4"
            icon={<LayoutGrid aria-hidden className="stroke-[1.75]" />}
            label="Interactive tabs"
            variantColor="dark"
          />
          <h2 className="font-bold text-3xl text-[#FFDDCC] tracking-[-0.03em] [text-shadow:0_2px_24px_rgba(0,0,0,0.45)] sm:text-4xl">
            One surface, three modes
          </h2>
          <p className="mt-4 max-w-xl text-pretty text-[#FFDDCC]/85 text-lg leading-relaxed">
            The same tab illustration used across marketing demos—here recolored to the dither system so it sits flush
            with the hero and shader sections.
          </p>
        </motion.div>

        <motion.div
          className={cn(
            "organic-tabs-showcase overflow-hidden rounded-2xl shadow-[0_0_0_1px_rgba(251,166,73,0.15)] lg:rounded-[1.25rem]"
          )}
          initial={initial}
          variants={itemVariants}
          viewport={{ once: true, margin: "-60px" }}
          whileInView="visible"
        >
          <GenerateAnything features={[...DITHER_FEATURES]} title="Dither experiments" />
        </motion.div>
      </div>
    </section>
  );
}
