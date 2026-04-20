"use client";

import { Grid3x3 } from "lucide-react";
import type { Variants } from "motion/react";
import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { ORGANIC_STONE, scrollMarginAnchor, sectionGutter } from "@/lib/organic-theme";
import { OrganicCardSmall } from "./organic-card-small";
import { OrganicSectionAngle } from "./organic-section-angle";
import { OrganicShapeBadge } from "./organic-shape-badge";

const CARDS = [
  {
    category: "Pattern",
    date: "2026",
    title: "Bayer-simplex lattice that stays crisp at any scale.",
    image: "https://images.unsplash.com/photo-1557683316-973673baf926?w=670&h=400&fit=crop&q=80",
    href: "#pattern-guide",
  },
  {
    category: "Contrast",
    date: "2026",
    title: "Warm orange on ink so UI never goes mushy.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=670&h=400&fit=crop&q=80",
    href: "#pattern-guide",
  },
  {
    category: "Motion",
    date: "2026",
    title: "Springs and stagger tuned to the shader’s tempo.",
    image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=670&h=400&fit=crop&q=80",
    href: "#pattern-guide",
  },
  {
    category: "Noise",
    date: "2026",
    title: "Ordered grain you can feel without losing legibility.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=670&h=400&fit=crop&q=80",
    href: "#pattern-guide",
  },
] as const;

export function PatternGuideSection({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? "visible" : "hidden";

  const containerVariants: Variants = useMemo(
    () => ({
      hidden: {},
      visible: {
        transition: { staggerChildren: shouldReduceMotion ? 0 : 0.08, delayChildren: shouldReduceMotion ? 0 : 0.06 },
      },
    }),
    [shouldReduceMotion]
  );

  const itemVariants: Variants = useMemo(
    () => ({
      hidden: {
        opacity: shouldReduceMotion ? 1 : 0,
        y: shouldReduceMotion ? 0 : 20,
        filter: shouldReduceMotion ? "blur(0px)" : "blur(4px)",
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
      className={cn(
        "relative overflow-hidden bg-[#2d1f16] text-[#FFDDCC] antialiased",
        sectionGutter,
        scrollMarginAnchor,
        className,
        "-mt-14"
      )}
      data-slot="organic-pattern-guide"
      id="pattern-guide"
    >
      <OrganicSectionAngle position="top" />
      <div className="mx-auto max-w-6xl pt-14">
        <motion.div
          className="mb-12 max-w-2xl md:mb-14"
          initial={initial}
          variants={itemVariants}
          viewport={{ once: true, margin: "-80px" }}
          whileInView="visible"
        >
          <OrganicShapeBadge
            className="mb-4"
            icon={<Grid3x3 aria-hidden className="stroke-[1.75]" />}
            label="Pattern guide"
            variantColor="dark"
          />
          <h2 className="font-bold text-3xl text-[#FFDDCC] tracking-[-0.03em] [text-shadow:0_2px_24px_rgba(0,0,0,0.45)] sm:text-4xl">
            Four pillars of the dither system
          </h2>
          <p className="mt-4 max-w-xl text-pretty text-[#FFDDCC]/90 text-lg leading-relaxed">
            Same ingredients as the hero: lattice contrast, acid accents, motion you can almost hear, and grain that
            stays under control.
          </p>
        </motion.div>

        <motion.ul
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-10"
          initial={initial}
          variants={containerVariants}
          viewport={{ once: true, margin: "-60px" }}
          whileInView="visible"
        >
          {CARDS.map((card) => (
            <motion.li key={card.title} variants={itemVariants}>
              <OrganicCardSmall
                category={card.category}
                className="max-w-none"
                date={card.date}
                href={card.href}
                image={card.image}
                surfaceColor={ORGANIC_STONE}
                title={card.title}
              />
            </motion.li>
          ))}
        </motion.ul>
      </div>
      <OrganicSectionAngle position="bottom" />
    </section>
  );
}
