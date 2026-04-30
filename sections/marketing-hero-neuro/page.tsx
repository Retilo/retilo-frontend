"use client";

import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import type { Variants } from "motion/react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NeuroBackdrop } from "./neuro-backdrop";

const HEADING_TEXT = "Signals Worth Following";
const DESCRIPTION =
  "Fluid gradients, synaptic motion, and a quiet pulse of color — a hero that feels intelligent without the clinical coldness.";

const FOOTER_LINKS = [
  { href: "#noise-field", label: "Noise field" },
  { href: "#synaptic-tuning", label: "Synaptic tuning" },
  { href: "https://github.com", label: "View source" },
] as const;

const CUTOUT_R = 48;
const HERO_SHELL_RADIUS_CLASS = "rounded-bl-2xl lg:rounded-bl-3xl rounded-tr-2xl lg:rounded-tr-3xl";

const HERO_PAD = "p-6 md:p-8 lg:p-10";

const HERO_PAD_PULL = "-mt-6 -ml-6 md:-mt-8 md:-ml-8 lg:-mt-10 lg:-ml-10";

const HERO_PAD_TL = "pt-6 pl-6 md:pt-8 md:pl-8 lg:pt-10 lg:pl-10";

const HERO_COL_XB = "px-6 pb-6 md:px-8 md:pb-8 lg:px-10 lg:pb-10";

const HERO_HEADLINE_PB = "pb-6 md:pb-8 lg:pb-10";

const HERO_PAGE_GUTTER = "pt-6 pb-6 pl-6 md:pt-8 md:pb-8 md:pl-8 lg:pt-10 lg:pb-10 lg:pl-10";
const HERO_PAGE_GUTTER_R = "pr-4 md:pr-6 lg:pr-8";

function cornerLayerLight(at: string): string {
  return `radial-gradient(circle at ${at}, transparent ${CUTOUT_R}px, white ${CUTOUT_R}px)`;
}

function cornerLayerDark(at: string): string {
  return `radial-gradient(circle at ${at}, transparent ${CUTOUT_R}px, rgb(10, 10, 10) ${CUTOUT_R}px)`;
}

function NeuroHeroTopLeftPanelCornerCutouts() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 z-0 h-12 w-12"
        style={{
          background: cornerLayerLight("bottom right"),
          transform: "translateY(100%) translateZ(0)",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 hidden dark:block"
          style={{ background: cornerLayerDark("bottom right") }}
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 z-0 h-12 w-12"
        style={{
          background: cornerLayerLight("bottom right"),
          transform: "translateX(100%) translateZ(0)",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 hidden dark:block"
          style={{ background: cornerLayerDark("bottom right") }}
        />
      </div>
    </>
  );
}

function NeuroHeroFooterCornerCutouts() {
  return (
    <>
      <div
        className="pointer-events-none absolute top-0 right-0 z-0 h-12 w-12"
        style={{
          background: cornerLayerLight("top left"),
          transform: "translateY(-100%) translateZ(0)",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 hidden dark:block"
          style={{ background: cornerLayerDark("top left") }}
        />
      </div>
      <div
        className="pointer-events-none absolute bottom-0 left-0 z-0 h-12 w-12"
        style={{
          background: cornerLayerLight("top left"),
          transform: "translateX(-100%) translateZ(0)",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 hidden dark:block"
          style={{ background: cornerLayerDark("top left") }}
        />
      </div>
    </>
  );
}

type TopBarProps = { itemVariants: Variants; shouldReduceMotion: boolean | null };

function NeuroHeroTopBar({ itemVariants, shouldReduceMotion }: TopBarProps) {
  return (
    <div className="relative z-10 min-h-0 w-full flex-1 overflow-visible">
      <div className={cn("relative z-10 flex justify-between gap-4 text-base md:text-lg", HERO_PAD)}>
        <div
          className={cn(
            "relative self-start rounded-br-3xl bg-white pr-5 pb-4 dark:bg-neutral-950",
            HERO_PAD_PULL,
            HERO_PAD_TL
          )}
        >
          <NeuroHeroTopLeftPanelCornerCutouts />
          <motion.div
            animate="visible"
            className="relative z-10 font-medium text-neutral-900 leading-tight dark:text-white"
            initial="hidden"
            transition={{ delay: shouldReduceMotion ? 0 : 0.05 }}
            variants={itemVariants}
          >
            Neuro AI
            <br />
            <span className="font-normal text-neutral-600 dark:text-white/80">Abyssal teal field</span>
          </motion.div>
        </div>

        <a
          className="hidden h-fit shrink-0 items-center justify-center rounded-full bg-[#2dd4bf]/18 px-4 py-2 font-medium text-[#ecfeff] text-sm backdrop-blur-sm transition-colors duration-200 hover:bg-[#2dd4bf]/28 md:inline-flex md:text-base"
          href="#"
          rel="noopener noreferrer"
          target="_blank"
        >
          Explore signals
        </a>
      </div>
    </div>
  );
}

type CopyColumnProps = {
  containerVariants: Variants;
  itemVariants: Variants;
  wordVariants: Variants;
  words: string[];
  shouldReduceMotion: boolean | null;
};

function NeuroHeroCopyColumn({
  containerVariants,
  itemVariants,
  wordVariants,
  words,
  shouldReduceMotion,
}: CopyColumnProps) {
  return (
    <div
      className={cn(
        "relative z-10 flex min-h-0 min-w-0 flex-1 flex-col text-left md:basis-[min(58%,32rem)] md:overflow-hidden lg:basis-[min(55%,36rem)]",
        HERO_COL_XB
      )}
    >
      <motion.div
        animate="visible"
        className="flex min-h-0 flex-1 flex-col"
        initial="hidden"
        transition={{ delay: shouldReduceMotion ? 0 : 0.08 }}
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <span
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#2dd4bf]/35 bg-[#0c1222]/45 px-3 py-1 font-medium text-[#ccfbf1] text-xs tracking-wide backdrop-blur-sm"
            style={{
              boxShadow: "0 0 0 1px rgba(45,212,191,0.2), 0 8px 28px rgba(13,148,136,0.15)",
            }}
          >
            <Sparkles className="h-3.5 w-3.5 text-[#5eead4]" />
            Neuro noise field
          </span>
        </motion.div>

        <motion.h1
          className={cn(
            "font-(family-name:--font-display) relative max-w-[min(100%,48rem)] text-balance font-bold text-[#ecfeff] text-[3rem] leading-[1.08] tracking-[-0.035em] [text-shadow:0_2px_28px_rgba(0,0,0,0.55)] sm:text-[3.5rem] md:text-[4rem] lg:text-[4.5rem]",
            HERO_HEADLINE_PB
          )}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: shouldReduceMotion ? 0 : 0.055,
                delayChildren: shouldReduceMotion ? 0 : 0.04,
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

        <motion.p
          className="-mt-2 mb-6 max-w-2xl text-pretty font-medium text-white text-xl leading-relaxed [text-shadow:0_1px_18px_rgba(0,0,0,0.45)] sm:text-2xl md:text-[1.75rem]"
          variants={itemVariants}
        >
          {DESCRIPTION}
        </motion.p>

        <motion.div className="mt-auto flex flex-col gap-3 sm:flex-row sm:gap-4" variants={itemVariants}>
          <motion.div
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              className="rounded-full bg-[#2dd4bf] px-7 font-medium text-[#042f2e] hover:bg-[#5eead4]"
              size="lg"
              style={{
                boxShadow:
                  "0 0 0 1px rgba(45,212,191,0.45), 0 4px 28px rgba(45,212,191,0.25), 0 6px 20px rgba(15,118,110,0.2)",
              }}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>

          <motion.div
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              className="rounded-full border-2 border-[#2dd4bf]/65 bg-[#0c1222]/45 px-7 font-medium text-[#ecfeff] shadow-[0_0_0_1px_rgba(45,212,191,0.15),0_4px_24px_rgba(0,0,0,0.35)] backdrop-blur-sm hover:border-[#5eead4] hover:bg-[#134e4a]/35 hover:shadow-[0_0_0_1px_rgba(94,234,212,0.3),0_6px_28px_rgba(45,212,191,0.12)]"
              size="lg"
              variant="outline"
            >
              Learn More
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

type FooterPanelProps = { footerListVariants: Variants; footerLinkVariants: Variants };

const FOOTER_LINK_EASE = [0.23, 1, 0.32, 1] as const;

function NeuroHeroFooterPanel({ footerListVariants, footerLinkVariants }: FooterPanelProps) {
  const shouldReduceMotion = useReducedMotion();

  const linkRowVariants: Variants = {
    rest: { x: 0 },
    hover: shouldReduceMotion
      ? { x: 0 }
      : {
          x: -4,
          transition: { duration: 0.2, ease: FOOTER_LINK_EASE },
        },
  };

  const linkWashVariants: Variants = {
    rest: { opacity: 0 },
    hover: shouldReduceMotion ? { opacity: 0 } : { opacity: 1, transition: { duration: 0.2, ease: "easeOut" } },
  };

  const linkIconVariants: Variants = {
    rest: { rotate: 0, x: 0, y: 0 },
    hover: shouldReduceMotion
      ? { rotate: 0, x: 0, y: 0 }
      : {
          rotate: -12,
          x: -1,
          y: -1,
          transition: { duration: 0.2, ease: FOOTER_LINK_EASE },
        },
  };

  return (
    <div
      className={cn(
        "relative flex min-h-36 w-2/3 shrink-0 flex-col items-end justify-end self-end rounded-tl-3xl bg-white font-light text-base max-md:min-h-44 md:min-h-0 md:w-full md:min-w-[min(100%,15rem)] md:flex-1 md:text-lg dark:bg-neutral-950",
        HERO_PAD
      )}
    >
      <NeuroHeroFooterCornerCutouts />

      <motion.ul
        animate="visible"
        className="relative z-10 flex w-full flex-col items-end gap-2.5 opacity-75 transition-opacity duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:opacity-100 md:gap-3"
        initial="hidden"
        variants={footerListVariants}
      >
        {FOOTER_LINKS.map((link, i) => (
          <motion.li
            className="w-full max-w-md md:w-full md:max-w-sm"
            key={`${link.label}-${i}`}
            variants={footerLinkVariants}
          >
            <motion.a
              className={cn(
                "group relative flex w-full items-center justify-end gap-2.5 overflow-hidden rounded-xl py-2.5 pr-2 pl-3.5 outline-none ring-offset-2 ring-offset-white backdrop-blur-[2px]",
                "bg-white/55 text-neutral-900 dark:bg-neutral-950/40 dark:text-white dark:ring-offset-neutral-950",
                "shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06),0px_2px_4px_0px_rgba(0,0,0,0.04)]",
                "dark:shadow-[0px_0px_0px_1px_rgba(255,255,255,0.07),0px_1px_2px_-1px_rgba(255,255,255,0.04),0px_2px_4px_0px_rgba(0,0,0,0.22)]",
                "transition-[box-shadow,background-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
                "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/80",
                "[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0px_0px_0px_1px_rgba(13,148,136,0.14),0px_2px_4px_-1px_rgba(45,212,191,0.12),0px_4px_10px_0px_rgba(0,0,0,0.06)]",
                "dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-neutral-950/55",
                "dark:[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0px_0px_0px_1px_rgba(94,234,212,0.14),0px_2px_4px_-1px_rgba(45,212,191,0.06),0px_4px_12px_0px_rgba(0,0,0,0.35)]",
                "focus-visible:ring-2 focus-visible:ring-[#0f766e] dark:focus-visible:ring-[#5eead4]"
              )}
              href={link.href}
              initial="rest"
              rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              transition={{ type: "tween", duration: 0.2, ease: FOOTER_LINK_EASE }}
              variants={linkRowVariants}
              whileHover="hover"
              whileTap={
                shouldReduceMotion ? undefined : { scale: 0.98, transition: { duration: 0.12, ease: FOOTER_LINK_EASE } }
              }
            >
              <span
                aria-hidden
                className="w-6 shrink-0 text-right font-medium text-[10px] text-neutral-400 uppercase tabular-nums tracking-[0.14em] dark:text-neutral-500"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="relative z-10 min-w-0 max-w-[min(100%,14rem)] flex-1 text-pretty text-right font-medium text-[0.95em] leading-snug tracking-tight md:text-base">
                {link.label}
              </span>
              <span
                aria-hidden
                className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-[10px] text-[#0f766e] dark:text-[#5eead4]"
                style={{
                  boxShadow: "0px 0px 0px 1px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.65)",
                }}
              >
                <motion.span
                  className={cn(
                    "flex size-full items-center justify-center rounded-[9px] bg-linear-to-br from-neutral-100/95 to-white/90",
                    "dark:from-neutral-900/95 dark:to-neutral-950/80",
                    "[@media(hover:hover)_and_(pointer:fine)]:group-hover:from-[#ecfdf5]/90 [@media(hover:hover)_and_(pointer:fine)]:group-hover:to-white",
                    "dark:[@media(hover:hover)_and_(pointer:fine)]:group-hover:from-teal-950/50 dark:[@media(hover:hover)_and_(pointer:fine)]:group-hover:to-neutral-950/90"
                  )}
                  initial="rest"
                  style={{
                    boxShadow: "0px 0px 0px 1px rgba(0,0,0,0.06), 0px 1px 2px -1px rgba(0,0,0,0.05)",
                  }}
                  variants={linkIconVariants}
                >
                  <ArrowUpRight className="size-[15px] translate-x-[0.5px] translate-y-[-0.5px]" strokeWidth={2} />
                </motion.span>
              </span>
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0"
                initial="rest"
                style={{
                  background:
                    "linear-gradient(115deg, transparent 40%, rgba(45,212,191,0.07) 100%), radial-gradient(120% 80% at 100% 0%, rgba(45,212,191,0.1), transparent 55%)",
                }}
                variants={linkWashVariants}
              />
            </motion.a>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

export default function NeuroHero() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
        delayChildren: shouldReduceMotion ? 0 : 0.22,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      transform: shouldReduceMotion ? "translate3d(0,0,0)" : "translate3d(0,20px,0)",
      filter: shouldReduceMotion ? "blur(0px)" : "blur(3px)",
    },
    visible: {
      opacity: 1,
      transform: "translate3d(0,0,0)",
      filter: "blur(0px)",
      transition: { type: "spring", bounce: 0.06, duration: 0.58 },
    },
  };

  const wordVariants: Variants = {
    hidden: {
      opacity: 0,
      transform: shouldReduceMotion ? "translate3d(0,0,0)" : "translate3d(0,14px,0)",
      filter: shouldReduceMotion ? "blur(0px)" : "blur(4px)",
    },
    visible: {
      opacity: 1,
      transform: "translate3d(0,0,0)",
      filter: "blur(0px)",
      transition: { type: "spring", bounce: 0.05, duration: 0.62 },
    },
  };

  const footerListVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.06,
        delayChildren: shouldReduceMotion ? 0 : 0.12,
      },
    },
  };

  const footerLinkVariants: Variants = {
    hidden: {
      opacity: 0,
      transform: shouldReduceMotion ? "translate3d(0,0,0)" : "translate3d(14px,0,0) scale(0.97)",
    },
    visible: {
      opacity: 1,
      transform: "translate3d(0,0,0) scale(1)",
      transition: { type: "spring", bounce: 0.08, duration: 0.52 },
    },
  };

  const words = HEADING_TEXT.split(" ");

  return (
    <main
      className={cn(
        "box-border flex min-h-dvh flex-col overflow-hidden bg-white antialiased dark:bg-neutral-950",
        HERO_PAGE_GUTTER,
        HERO_PAGE_GUTTER_R
      )}
    >
      <div
        className={cn("relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#0c1222]", HERO_SHELL_RADIUS_CLASS)}
      >
        <NeuroBackdrop className={cn("w-full", HERO_SHELL_RADIUS_CLASS)}>
          <div className="relative z-20 flex min-h-0 w-full flex-1 flex-col">
            <NeuroHeroTopBar itemVariants={itemVariants} shouldReduceMotion={shouldReduceMotion} />

            <div className="flex min-h-0 flex-col items-stretch md:flex-1 md:flex-row">
              <NeuroHeroCopyColumn
                containerVariants={containerVariants}
                itemVariants={itemVariants}
                shouldReduceMotion={shouldReduceMotion}
                words={words}
                wordVariants={wordVariants}
              />
              <NeuroHeroFooterPanel footerLinkVariants={footerLinkVariants} footerListVariants={footerListVariants} />
            </div>
          </div>
        </NeuroBackdrop>
      </div>
    </main>
  );
}
