"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import type { Variants } from "motion/react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { HyperspaceTunnel } from "./hyperspace-tunnel";

const HEADING_TEXT = "Travel Beyond the Edge of Light";
const DESCRIPTION =
  "Experience the next frontier of immersive interfaces — where speed meets spectacle and every pixel pulls you deeper into the future.";

export default function HyperspaceHero() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
        delayChildren: shouldReduceMotion ? 0 : 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 24,
      filter: shouldReduceMotion ? "blur(0px)" : "blur(4px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring", bounce: 0.1, duration: 0.65 },
    },
  };

  const wordVariants: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 16,
      filter: shouldReduceMotion ? "blur(0px)" : "blur(6px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring", bounce: 0.08, duration: 0.7 },
    },
  };

  const words = HEADING_TEXT.split(" ");

  return (
    <main className="relative h-screen w-full overflow-hidden">
      <HyperspaceTunnel className="absolute inset-0 h-full w-full">
        <motion.div
          animate="visible"
          className="relative z-20 flex max-w-3xl flex-col items-center px-6 text-center"
          initial="hidden"
          variants={containerVariants}
        >
          {/* Pill badge */}
          <motion.div variants={itemVariants}>
            <span
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 font-medium text-muted-foreground text-xs tracking-wide"
              style={{
                boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 0 20px rgba(120,180,255,0.06)",
              }}
            >
              <Sparkles className="h-3.5 w-3.5 text-pink-400" />
              Now entering hyperspace
            </span>
          </motion.div>

          {/* Heading — per-word stagger */}
          <motion.h1
            className="mb-5 font-bold text-4xl text-[#EEEEF0] leading-[1.08] tracking-[-0.035em] [text-wrap:balance] sm:text-5xl md:text-6xl lg:text-7xl"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: shouldReduceMotion ? 0 : 0.06,
                  delayChildren: 0,
                },
              },
            }}
          >
            {words.map((word, i) => (
              <motion.span className="mr-[0.25em] inline-block last:mr-0" key={i} variants={wordVariants}>
                {word}
              </motion.span>
            ))}
          </motion.h1>

          {/* Description */}
          <motion.p
            className="mb-8 max-w-xl text-[#EEEEF0] text-base leading-relaxed [text-wrap:pretty] sm:text-lg"
            variants={itemVariants}
          >
            {DESCRIPTION}
          </motion.p>

          {/* CTA row */}
          <motion.div className="flex flex-col gap-3 sm:flex-row sm:gap-4" variants={itemVariants}>
            <motion.div
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                className="rounded-full bg-[#EEEEF0] px-7 font-medium text-[#050510] hover:bg-white"
                size="lg"
                style={{
                  boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.15), 0 2px 8px rgba(120,180,255,0.15), 0 4px 20px rgba(120,180,255,0.08)",
                }}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </HyperspaceTunnel>
    </main>
  );
}
