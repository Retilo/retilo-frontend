"use client";

import { Sparkles } from "lucide-react";
import type { Variants } from "motion/react";
import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { bodyOnDark, headingOnDark, sectionGutter } from "@/lib/organic-theme";
import { OrganicButton } from "./organic-button";
import { OrganicShapeBadge } from "./organic-shape-badge";

export function OrganicPrimaryCtaSection({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? "visible" : "hidden";

  const itemVariants: Variants = useMemo(
    () => ({
      hidden: {
        opacity: shouldReduceMotion ? 1 : 0,
        y: shouldReduceMotion ? 0 : 18,
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
      className={cn("relative overflow-hidden bg-[#2d1f16] antialiased", sectionGutter, className)}
      data-slot="organic-primary-cta"
      id="primary-cta"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(251,166,73,0.12), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(255,221,204,0.1), transparent 50%)",
        }}
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <motion.div
          initial={initial}
          variants={itemVariants}
          viewport={{ once: true, margin: "-80px" }}
          whileInView="visible"
        >
          <div className="mb-5 flex justify-center">
            <OrganicShapeBadge
              icon={<Sparkles aria-hidden className="stroke-[1.75]" />}
              label="Dither AI"
              variantColor="dark"
            />
          </div>
          <h2 className={cn("text-3xl sm:text-4xl", headingOnDark)}>Ship a hero that feels this considered</h2>
          <p className={cn("mx-auto mt-4 max-w-xl text-lg sm:text-xl", bodyOnDark)}>
            Drop in the organic button for silhouette CTAs, or mirror the filled hero buttons—same tokens either way.
          </p>
        </motion.div>

        <motion.div
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
          initial={initial}
          variants={itemVariants}
          viewport={{ once: true, margin: "-60px" }}
          whileInView="visible"
        >
          <motion.div
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.03, y: -2 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
          >
            <OrganicButton href="#shape-button-section" label="Get Started" size="lg" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
