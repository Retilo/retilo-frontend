"use client";

import { ArrowRight, Layers, Palette, Sparkles, Target } from "lucide-react";
import type { Variants } from "motion/react";
import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { scrollMarginAnchor, sectionGutter, sectionGutterX } from "@/lib/organic-theme";
import { OrganicCard, OrganicCardBand, OrganicCardBody, OrganicCardFooter } from "./organic-card";
import { OrganicSectionAngle } from "./organic-section-angle";
import { OrganicShapeBadge } from "./organic-shape-badge";

const CASES = [
  {
    icon: Palette,
    title: "Brand & launch sites",
    description:
      "Heroes and sections that read intentional—dither, contrast, and motion aligned so marketing feels bespoke, not template-y.",
  },
  {
    icon: Layers,
    title: "Portfolios & studios",
    description:
      "Show process and taste: shader-backed surfaces, organic cards, and tabbed stories without rebuilding layout every time.",
  },
  {
    icon: Sparkles,
    title: "Shader-forward marketing",
    description:
      "When the product is visual—AI, render, or design tools—match the landing to the pipeline: specs, toggles, and export language built in.",
  },
] as const;

export function UseCasesSection({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? "visible" : "hidden";

  const containerVariants: Variants = useMemo(
    () => ({
      hidden: {},
      visible: {
        transition: { staggerChildren: shouldReduceMotion ? 0 : 0.08, delayChildren: shouldReduceMotion ? 0 : 0.05 },
      },
    }),
    [shouldReduceMotion]
  );

  const headerVariants: Variants = useMemo(
    () => ({
      hidden: {},
      visible: {
        transition: { staggerChildren: shouldReduceMotion ? 0 : 0.07, delayChildren: shouldReduceMotion ? 0 : 0.02 },
      },
    }),
    [shouldReduceMotion]
  );

  const headerLineVariants: Variants = useMemo(
    () => ({
      hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 8 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", bounce: 0.05, duration: 0.45 },
      },
    }),
    [shouldReduceMotion]
  );

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
      aria-label="Who this template is for"
      className={cn(
        "relative isolate overflow-hidden bg-[#2d1f16] text-[#FFDDCC] antialiased",
        "shadow-[inset_0_1px_0_0_rgba(251,166,73,0.08)]",
        sectionGutter,
        scrollMarginAnchor,
        className
      )}
      data-slot="organic-use-cases"
      id="use-cases"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_0%,rgba(251,166,73,0.08),transparent_58%)]"
      />
      <div className={cn("relative mx-auto max-w-6xl", sectionGutterX)}>
        <motion.div
          className="mx-auto mb-12 max-w-2xl text-center md:mb-14"
          initial={initial}
          variants={headerVariants}
          viewport={{ once: true, margin: "-80px" }}
          whileInView="visible"
        >
          <motion.div className="mb-4 flex justify-center" variants={headerLineVariants}>
            <OrganicShapeBadge
              icon={<Target aria-hidden className="stroke-[1.75]" />}
              label="Who it's for"
              variantColor="dark"
            />
          </motion.div>
          <motion.h2
            className="text-balance font-bold text-3xl tracking-[-0.035em] [text-shadow:0_2px_28px_rgba(0,0,0,0.5)] sm:text-4xl"
            variants={headerLineVariants}
          >
            Three audiences, one system
          </motion.h2>
          <motion.p
            className="mt-4 text-pretty text-[#FFDDCC]/88 text-lg leading-relaxed [text-shadow:0_1px_16px_rgba(0,0,0,0.35)]"
            variants={headerLineVariants}
          >
            Different from the pattern guide (how the system works)—this is who ships it. Pick the lane that matches
            your site.
          </motion.p>
        </motion.div>

        <motion.ul
          className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6 lg:gap-8"
          initial={initial}
          variants={containerVariants}
          viewport={{ once: true, margin: "-60px" }}
          whileInView="visible"
        >
          {CASES.map(({ icon: Icon, title, description }) => (
            <motion.li key={title} variants={itemVariants}>
              <OrganicCard
                backgroundColor="#1a1410"
                className={cn(
                  "max-w-none rounded-[1.25rem] border-none",
                  // "shadow-[0_0_0_1px_rgba(251,166,73,0.14),0_1px_0_rgba(255,255,255,0.04)_inset,0_12px_40px_-16px_rgba(0,0,0,0.55)]",
                  "transition-[transform,box-shadow] duration-300 ease-out"
                  // "[@media(hover:hover)]:hover:-translate-y-0.5"
                  // "[@media(hover:hover)]:hover:shadow-[0_0_0_1px_rgba(251,166,73,0.22),0_1px_0_rgba(255,255,255,0.06)_inset,0_20px_48px_-18px_rgba(0,0,0,0.6)]"
                )}
              >
                <OrganicCardBody className="rounded-t-[1.25rem] p-6 text-[#FFDDCC] md:p-7">
                  <div>
                    <div className="mb-5 inline-flex size-11 items-center justify-center rounded-[0.65rem] border border-[#FBA649]/28 bg-[#2d1f16] text-[#FBA649] shadow-[0_0_0_1px_rgba(0,0,0,0.2)_inset]">
                      <Icon aria-hidden className="size-[1.15rem]" strokeWidth={1.75} />
                    </div>
                    <h3 className="text-balance font-semibold text-[#FFDDCC] text-lg tracking-[-0.02em]">{title}</h3>
                    <p className="mt-2.5 text-[#FFDDCC]/82 text-sm leading-relaxed">{description}</p>
                  </div>
                </OrganicCardBody>
                <OrganicCardBand className="h-16 w-full shrink-0 md:h-[72px]" />
                <OrganicCardFooter className="bottom-3 pl-4 md:bottom-4">
                  <p className="text-[#FFDDCC]/86 text-sm">Use case</p>
                  <div className="flex size-8 items-center justify-center rounded-full bg-[#FFDDCC] text-[#2d1f16] transition-transform duration-300 group-hover/organic-card:scale-110">
                    <ArrowRight aria-hidden className="size-4" />
                  </div>
                </OrganicCardFooter>
              </OrganicCard>
            </motion.li>
          ))}
        </motion.ul>
      </div>
      <OrganicSectionAngle position="bottom" />
    </section>
  );
}
