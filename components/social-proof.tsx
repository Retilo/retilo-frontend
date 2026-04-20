"use client";

import { Users } from "lucide-react";
import type { Variants } from "motion/react";
import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { scrollMarginAnchor, sectionGutter, sectionGutterX } from "@/lib/organic-theme";
import { OrganicShapeBadge } from "./organic-shape-badge";

/** Placeholder marks — monochrome wordmarks for template installs */
const LOGOS = ["Northwind", "Lumen", "Atelier", "Convex", "Studio 4K", "Grain"] as const;

export function SocialProofSection({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? "visible" : "hidden";

  const containerVariants: Variants = useMemo(
    () => ({
      hidden: {},
      visible: {
        transition: { staggerChildren: shouldReduceMotion ? 0 : 0.05, delayChildren: shouldReduceMotion ? 0 : 0.06 },
      },
    }),
    [shouldReduceMotion]
  );

  const itemVariants: Variants = useMemo(
    () => ({
      hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 10 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", bounce: 0.06, duration: 0.48 },
      },
    }),
    [shouldReduceMotion]
  );

  return (
    <section
      aria-label="Social proof"
      className={cn("relative isolate overflow-hidden", sectionGutter, scrollMarginAnchor, className)}
      data-slot="organic-social-proof"
      id="social-proof"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(251,166,73,0.06),transparent_55%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(251,166,73,0.09),transparent_55%)]"
      />
      <div className={cn("relative mx-auto max-w-6xl", sectionGutterX)}>
        <motion.div
          className="flex flex-col items-center text-center"
          initial={initial}
          variants={containerVariants}
          viewport={{ once: true, margin: "-80px" }}
          whileInView="visible"
        >
          <motion.div className="mb-5 flex justify-center" variants={itemVariants}>
            <OrganicShapeBadge
              icon={<Users aria-hidden className="stroke-[1.75]" />}
              label="Social proof"
              // variantColor="dark"
            />
          </motion.div>
          <motion.h2
            className="max-w-2xl text-balance font-semibold text-2xl text-neutral-900 tracking-[-0.035em] sm:text-3xl dark:text-[#FFDDCC]"
            variants={itemVariants}
          >
            Used by teams who care about craft
          </motion.h2>
        </motion.div>

        <motion.ul
          className="mt-12 flex min-h-13 flex-wrap items-center justify-center gap-x-8 gap-y-6 sm:gap-x-12 md:gap-x-14"
          initial={initial}
          variants={containerVariants}
          viewport={{ once: true, margin: "-40px" }}
          whileInView="visible"
        >
          {LOGOS.map((name) => (
            <motion.li className="flex" key={name} variants={itemVariants}>
              <span
                aria-hidden
                className="inline-flex min-h-11 select-none items-center justify-center rounded-xl px-3 py-2 font-semibold text-[0.65rem] text-neutral-500 uppercase tracking-[0.32em] transition-[opacity,color] duration-200 ease-out sm:text-xs dark:text-neutral-400 [@media(hover:hover)]:hover:text-neutral-700 dark:[@media(hover:hover)]:hover:text-neutral-200"
              >
                {name}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
