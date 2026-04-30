"use client";

import { ArrowRight, Search, Sparkles } from "lucide-react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { asMotionVariants } from "@/lib/motion-casts";

import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const PLACEHOLDER_QUERIES = [
  "Summarize last quarter's revenue trends…",
  "Find contracts expiring this month…",
  "What changed in the latest deploy?",
  "Draft a follow-up email to the client…",
  "Show me open issues assigned to my team…",
];

const SUGGESTION_CHIPS = ["Revenue trends", "Team updates", "Contract status", "Deploy history", "Customer feedback"];

const TRUST_LOGOS = ["Stripe", "Vercel", "Linear", "Notion", "Figma", "Raycast"];

/* ─── variants ─── */

const headingContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.25 },
  },
};

const wordReveal = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring" as const, damping: 22, stiffness: 120 },
  },
};

const chipContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 1.1 },
  },
};

const chipItem = {
  hidden: { opacity: 0, y: 12, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, damping: 20, stiffness: 200 },
  },
};

const logoContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 1.5 },
  },
};

const logoItem = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

/* ─── animated placeholder ─── */

function AnimatedPlaceholder({ queries }: { queries: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % queries.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [queries.length]);

  return (
    <div className="pointer-events-none absolute inset-y-0 right-28 left-14 flex items-center overflow-hidden sm:right-36 sm:left-16">
      <AnimatePresence mode="wait">
        <motion.span
          animate={{ opacity: 0.45, y: 0, filter: "blur(0px)" }}
          className="block truncate text-[15px] sm:text-[17px]"
          exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
          key={queries[index]}
          style={{ color: "var(--hero-muted)" }}
          transition={{ type: "spring", damping: 24, stiffness: 180 }}
        >
          {queries[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/* ─── component ─── */

export default function Page() {
  const shouldReduceMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleChipClick = useCallback((label: string) => {
    setInputValue(label);
    inputRef.current?.focus();
  }, []);

  const HEADLINE_L1 = ["Your", "data,"];
  const HEADLINE_L2 = ["one", "question", "away."];

  return (
    <MotionConfig transition={{ type: "spring", bounce: 0.08, duration: 0.5 }}>
      <div
        className="relative flex min-h-svh flex-col overflow-hidden"
        style={
          {
            "--hero-bg": "#FDFBF7",
            "--hero-fg": "#1a1714",
            "--hero-accent": "#E8573D",
            "--hero-muted": "#8A8478",
            "--hero-border": "rgba(26, 23, 20, 0.08)",
            "--hero-surface": "rgba(26, 23, 20, 0.03)",
            backgroundColor: "var(--hero-bg)",
            color: "var(--hero-fg)",
          } as React.CSSProperties
        }
      >
        {/* ambient radial glow */}
        <div
          aria-hidden="true"
          className="-translate-x-1/2 pointer-events-none absolute top-[-15%] left-1/2 h-[700px] w-[900px] rounded-full opacity-40 blur-[120px]"
          style={{ background: "radial-gradient(circle, #E8573D15, transparent 70%)" }}
        />
        <div
          aria-hidden="true"
          className="-translate-x-1/2 pointer-events-none absolute bottom-[-10%] left-1/2 h-[400px] w-[600px] rounded-full opacity-30 blur-[100px]"
          style={{ background: "radial-gradient(circle, #E8573D08, transparent 70%)" }}
        />

        {/* dot grid texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(26,23,20,0.07) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* main hero content */}
        <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 py-24 text-center sm:px-6">
          {/* badge */}
          <motion.div
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            className="mb-8 sm:mb-10"
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 120,
              delay: 0.1,
            }}
          >
            <motion.div
              className={cn(
                "inline-flex cursor-default items-center gap-2 rounded-full px-3.5 py-1.5",
                "shadow-[0px_0px_0px_1px_rgba(26,23,20,0.06),0px_1px_2px_-1px_rgba(26,23,20,0.06),0px_2px_4px_0px_rgba(26,23,20,0.04)]"
              )}
              style={{
                backgroundColor: "var(--hero-surface)",
                borderColor: "var(--hero-border)",
              }}
              whileHover={
                shouldReduceMotion
                  ? {}
                  : {
                      scale: 1.04,
                      transition: {
                        type: "spring",
                        stiffness: 400,
                        damping: 15,
                      },
                    }
              }
              whileTap={{ scale: 0.97 }}
            >
              <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--hero-accent)" }} />
              <span className="font-medium text-[13px]" style={{ color: "var(--hero-accent)" }}>
                AI-powered search
              </span>
            </motion.div>
          </motion.div>

          {/* heading — word-by-word staggered blur reveal */}
          <motion.h1
            animate="visible"
            className="mb-5 text-balance leading-[0.95] tracking-[-0.04em] sm:mb-6"
            initial="hidden"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(3rem, 9vw, 5.5rem)",
            }}
            variants={asMotionVariants(headingContainer)}
          >
            <span className="block">
              {HEADLINE_L1.map((word, i) => (
                <motion.span
                  className="mr-[0.22em] inline-block last:mr-0"
                  key={`l1-${i}`}
                  variants={asMotionVariants(
                    shouldReduceMotion
                      ? {
                          hidden: { opacity: 0 },
                          visible: { opacity: 1 },
                        }
                      : wordReveal
                  )}
                >
                  {word}
                </motion.span>
              ))}
            </span>
            <span className="block">
              {HEADLINE_L2.map((word, i) => (
                <motion.span
                  className={cn("mr-[0.22em] inline-block last:mr-0", i === HEADLINE_L2.length - 1 && "italic")}
                  key={`l2-${i}`}
                  style={i === HEADLINE_L2.length - 1 ? { color: "var(--hero-accent)" } : undefined}
                  variants={asMotionVariants(
                    shouldReduceMotion
                      ? {
                          hidden: { opacity: 0 },
                          visible: { opacity: 1 },
                        }
                      : wordReveal
                  )}
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </motion.h1>

          {/* subtitle */}
          <motion.p
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
            className="mb-10 max-w-lg text-pretty text-[16px] leading-relaxed sm:mb-14 sm:text-[18px]"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, filter: "blur(4px)" }}
            style={{ color: "var(--hero-muted)" }}
            transition={{
              type: "spring",
              damping: 22,
              stiffness: 110,
              delay: 0.65,
            }}
          >
            Connect your apps, documents, and databases. Ask a question in plain English and get answers instantly.
          </motion.p>

          {/* ── input ── */}
          <motion.div
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-xl"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.97 }}
            transition={{
              type: "spring",
              damping: 24,
              stiffness: 100,
              delay: 0.85,
            }}
          >
            <div className="group relative">
              {/* focus glow ring */}
              <div
                className={cn(
                  "-inset-1.5 absolute rounded-[22px] transition-opacity duration-500",
                  inputFocused ? "opacity-100" : "opacity-0"
                )}
                style={{
                  background: "radial-gradient(ellipse at center, rgba(232,87,61,0.12), transparent 70%)",
                }}
              />

              {/* input wrapper — concentric radius: outer = inner (16px) + padding (6px) = 22px */}
              <div
                className={cn(
                  "relative flex items-center rounded-[20px] transition-shadow duration-300",
                  inputFocused
                    ? "shadow-[0px_0px_0px_1px_rgba(232,87,61,0.25),0px_2px_8px_-2px_rgba(232,87,61,0.1),0px_4px_16px_0px_rgba(232,87,61,0.06)]"
                    : "shadow-[0px_0px_0px_1px_rgba(26,23,20,0.08),0px_1px_3px_-1px_rgba(26,23,20,0.07),0px_3px_8px_0px_rgba(26,23,20,0.04)]",
                  !inputFocused &&
                    "hover:shadow-[0px_0px_0px_1px_rgba(26,23,20,0.1),0px_2px_4px_-1px_rgba(26,23,20,0.08),0px_4px_12px_0px_rgba(26,23,20,0.05)]"
                )}
                style={{ backgroundColor: "var(--hero-bg)" }}
              >
                <Search
                  className="pointer-events-none ml-4 h-5 w-5 shrink-0 sm:ml-5"
                  style={{ color: "var(--hero-muted)", opacity: 0.6 }}
                />

                <div className="relative flex-1">
                  <input
                    aria-label="Ask a question"
                    className="h-14 w-full bg-transparent px-3 text-[15px] focus:outline-none sm:h-16 sm:px-4 sm:text-[17px]"
                    onBlur={() => setInputFocused(false)}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={() => setInputFocused(true)}
                    ref={inputRef}
                    style={{ color: "var(--hero-fg)" }}
                    type="text"
                    value={inputValue}
                  />

                  {!(inputValue || inputFocused) && <AnimatedPlaceholder queries={PLACEHOLDER_QUERIES} />}

                  {!inputValue && inputFocused && (
                    <span
                      className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[15px] sm:left-4 sm:text-[17px]"
                      style={{ color: "var(--hero-muted)", opacity: 0.4 }}
                    >
                      Ask anything…
                    </span>
                  )}
                </div>

                <div className="shrink-0 pr-2 sm:pr-2.5">
                  <motion.button
                    className="flex h-10 items-center gap-2 rounded-[14px] px-4 font-semibold text-[13px] text-white transition-colors sm:h-11 sm:px-5 sm:text-[14px]"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#d44e35";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--hero-accent)";
                    }}
                    style={{ backgroundColor: "var(--hero-accent)" }}
                    whileHover={
                      shouldReduceMotion
                        ? {}
                        : {
                            scale: 1.04,
                            transition: {
                              type: "spring",
                              stiffness: 400,
                              damping: 15,
                            },
                          }
                    }
                    whileTap={{ scale: 0.96 }}
                  >
                    Ask
                    <ArrowRight className="h-3.5 w-3.5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── suggestion chips ── */}
          <motion.div
            animate="visible"
            className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:mt-8"
            initial="hidden"
            variants={asMotionVariants(chipContainer)}
          >
            <motion.span
              className="mr-1 font-medium text-[12px] uppercase tracking-[0.08em] sm:text-[13px]"
              style={{ color: "var(--hero-muted)", opacity: 0.7 }}
              variants={asMotionVariants(chipItem)}
            >
              Try:
            </motion.span>

            {SUGGESTION_CHIPS.map((chip) => (
              <motion.button
                className={cn(
                  "rounded-full px-3 py-1.5 font-medium text-[12px] transition-colors duration-200 sm:px-3.5 sm:text-[13px]",
                  "shadow-[0px_0px_0px_1px_rgba(26,23,20,0.06),0px_1px_2px_-1px_rgba(26,23,20,0.05)]",
                  "hover:shadow-[0px_0px_0px_1px_rgba(232,87,61,0.15),0px_1px_3px_-1px_rgba(232,87,61,0.08)]"
                )}
                key={chip}
                onClick={() => handleChipClick(chip)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--hero-accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--hero-muted)";
                }}
                style={{
                  backgroundColor: "var(--hero-bg)",
                  color: "var(--hero-muted)",
                }}
                variants={asMotionVariants(chipItem)}
                whileHover={
                  shouldReduceMotion
                    ? {}
                    : {
                        scale: 1.06,
                        y: -2,
                        transition: {
                          type: "spring",
                          stiffness: 500,
                          damping: 15,
                        },
                      }
                }
                whileTap={{ scale: 0.95 }}
              >
                {chip}
              </motion.button>
            ))}
          </motion.div>

          {/* ── trust logos ── */}
          <motion.div
            animate="visible"
            className="mt-16 flex flex-col items-center gap-5 sm:mt-24"
            initial="hidden"
            variants={asMotionVariants(logoContainer)}
          >
            <motion.p
              className="font-medium text-[11px] uppercase tracking-[0.14em] sm:text-[12px]"
              style={{ color: "var(--hero-muted)", opacity: 0.5 }}
              variants={asMotionVariants(logoItem)}
            >
              Trusted by teams at
            </motion.p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:gap-x-10">
              {TRUST_LOGOS.map((logo) => (
                <motion.span
                  className="font-semibold text-[13px] tracking-tight opacity-30 transition-opacity duration-300 hover:opacity-60 sm:text-[15px]"
                  key={logo}
                  style={{ color: "var(--hero-fg)" }}
                  variants={asMotionVariants(logoItem)}
                >
                  {logo}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </MotionConfig>
  );
}
