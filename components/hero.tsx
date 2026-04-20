"use client";

import { ArrowRight, Grid3x3 } from "lucide-react";
import type { Variants } from "motion/react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { scrollMarginAnchor } from "@/lib/organic-theme";
import { DitheringSimplexBackdrop } from "./dithering-simplex-backdrop";
import { OrganicButton } from "./organic-button";
import { OrganicShapeBadge } from "./organic-shape-badge";

const HEADING_TEXT = "Precision in Every Pixel";
const DESCRIPTION =
  "Ordered noise, acid contrast, and motion you can almost hear - a hero for brands that live in the details.";

const FOOTER_LINKS = [
  { href: "#banner", label: "Gallery" },
  { href: "#pattern-guide", label: "Pattern guide" },
  { href: "#shader-settings", label: "Shader settings" },
  { href: "#tabs-illustration", label: "Interactive tabs" },
] as const;

const CUTOUT_R = 48;
const HERO_SHELL_RADIUS_CLASS = "rounded-bl-2xl lg:rounded-bl-3xl rounded-tr-2xl lg:rounded-tr-3xl";

/** Responsive inset shared by the top bar, copy column, footer panel, and headline spacing (replaces fluid `vmax` gutters). */
const HERO_PAD = "p-6 md:p-8 lg:p-10";

/** Pulls the top-left brand panel flush with the hero shell; must stay in sync with `HERO_PAD_TL`. */
const HERO_PAD_PULL = "-mt-6 -ml-6 md:-mt-8 md:-ml-8 lg:-mt-10 lg:-ml-10";

/** Top/left padding on the brand panel only (`pr` / `pb` stay fixed for optical balance). */
const HERO_PAD_TL = "pt-6 pl-6 md:pt-8 md:pl-8 lg:pt-10 lg:pl-10";

const HERO_COL_XB = "px-6 pb-6 md:px-8 md:pb-8 lg:px-10 lg:pb-10";

const HERO_HEADLINE_PB = "pb-6 md:pb-8 lg:pb-10";

/** Page frame: same vertical/left gutter as inner hero; right inset stays slightly tighter. */
const HERO_PAGE_GUTTER = "pt-6 pb-6 pl-6 md:pt-8 md:pb-8 md:pl-8 lg:pt-10 lg:pb-10 lg:pl-10";
const HERO_PAGE_GUTTER_R = "pr-4 md:pr-6 lg:pr-8";

function cornerLayerLight(at: string): string {
  return `radial-gradient(circle at ${at}, transparent ${CUTOUT_R}px, white ${CUTOUT_R}px)`;
}

function cornerLayerDark(at: string): string {
  return `radial-gradient(circle at ${at}, transparent ${CUTOUT_R}px, rgb(10, 10, 10) ${CUTOUT_R}px)`;
}

function DitheringHeroTopLeftPanelCornerCutouts() {
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

function DitheringHeroFooterCornerCutouts() {
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

function DitheringHeroTopBar({ itemVariants, shouldReduceMotion }: TopBarProps) {
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
          <DitheringHeroTopLeftPanelCornerCutouts />
          <motion.div
            animate="visible"
            className="relative z-10 font-medium text-neutral-900 leading-tight dark:text-white"
            initial="hidden"
            transition={{ delay: shouldReduceMotion ? 0 : 0.05 }}
            variants={itemVariants}
          >
            Dither AI
            <br />
            <span className="font-normal text-neutral-600 dark:text-white/80">Dither Experiments</span>
          </motion.div>
        </div>

        <div className="hidden h-fit shrink-0 md:block">
          <OrganicButton href="#primary-cta" label="Build with Dither" size="sm" variantColor="dither" />
        </div>
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

function DitheringHeroCopyColumn({
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
          <OrganicShapeBadge
            className="mb-4"
            icon={<Grid3x3 aria-hidden className="stroke-[1.75]" />}
            label="Simplex dither · 4x4"
            variantColor="dark"
          />
        </motion.div>

        <motion.h1
          className={cn(
            "relative max-w-[min(100%,48rem)] text-balance font-bold text-[#FFDDCC] text-[3rem] leading-[1.08] tracking-[-0.035em] [text-shadow:0_2px_24px_rgba(0,0,0,0.55)] sm:text-[3.5rem] md:text-[4rem] lg:text-[4.5rem]",
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
          className="-mt-2 mb-6 max-w-2xl text-pretty font-medium text-[#FFDDCC] text-xl leading-relaxed [text-shadow:0_1px_20px_rgba(0,0,0,0.65),0_0_1px_rgba(0,0,0,0.4)] sm:text-2xl md:text-[1.75rem]"
          variants={itemVariants}
        >
          {DESCRIPTION}
        </motion.p>

        <motion.div className="mt-auto flex flex-col gap-3 sm:flex-row sm:gap-4" variants={itemVariants}>
          <OrganicButton
            animationSpeed="fast"
            // className="shadow-[0_0_0_1px_rgba(251,166,73,0.4),0_6px_24px_rgba(251,166,73,0.2),0_6px_22px_rgba(0,0,0,0.2)]"
            href="#primary-cta"
            icon={
              <ArrowRight className="organic-icon stroke-2 transition-transform duration-100 group-hover/organic:translate-x-0.5" />
            }
            label="Get Started"
            size="lg"
            variantColor="orange"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

type FooterPanelProps = { footerListVariants: Variants; footerLinkVariants: Variants };

/** Snappy, flat easing — reads crisp next to dither / grid. */
const SIMPLEX_LINK_EASE = [0.32, 0, 0.08, 1] as const;

function DitheringHeroFooterPanel({ footerListVariants, footerLinkVariants }: FooterPanelProps) {
  const shouldReduceMotion = useReducedMotion();

  const linkRowVariants: Variants = {
    rest: { x: 0 },
    hover: shouldReduceMotion ? { x: 0 } : { x: -5, transition: { duration: 0.2, ease: SIMPLEX_LINK_EASE } },
  };

  return (
    <div
      className={cn(
        "relative flex min-h-36 w-2/3 shrink-0 flex-col items-end justify-end self-end rounded-tl-3xl bg-white font-light text-base max-md:min-h-44 md:min-h-0 md:w-full md:min-w-[min(100%,15rem)] md:flex-1 md:text-lg dark:bg-neutral-950",
        HERO_PAD
      )}
    >
      <DitheringHeroFooterCornerCutouts />

      <motion.ul
        animate="visible"
        className="relative z-10 flex w-full flex-col items-end gap-3 transition-opacity duration-300 ease-out md:gap-3"
        initial="hidden"
        variants={footerListVariants}
      >
        {FOOTER_LINKS.map((link) => (
          <motion.li className="flex w-full justify-end" key={link.label} variants={footerLinkVariants}>
            <motion.div
              initial="rest"
              transition={{ duration: 0.2, ease: SIMPLEX_LINK_EASE }}
              variants={linkRowVariants}
              whileHover="hover"
              whileTap={
                shouldReduceMotion ? undefined : { scale: 0.99, transition: { duration: 0.1, ease: SIMPLEX_LINK_EASE } }
              }
            >
              <OrganicButton href={link.href} label={link.label} size="sm" variantColor="dither" />
            </motion.div>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

export default function DitheringSimplexHero() {
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
    <section
      aria-label="Hero"
      className={cn(
        "box-border flex min-h-dvh flex-col overflow-hidden bg-white antialiased dark:bg-neutral-950",
        scrollMarginAnchor,
        HERO_PAGE_GUTTER,
        HERO_PAGE_GUTTER_R
      )}
      id="hero"
    >
      <div
        className={cn("relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#2d1f16]", HERO_SHELL_RADIUS_CLASS)}
      >
        <DitheringSimplexBackdrop className={cn("w-full", HERO_SHELL_RADIUS_CLASS)}>
          <div className="relative z-20 flex min-h-0 w-full flex-1 flex-col">
            <DitheringHeroTopBar itemVariants={itemVariants} shouldReduceMotion={shouldReduceMotion} />

            <div className="flex min-h-0 flex-col items-stretch md:flex-1 md:flex-row">
              <DitheringHeroCopyColumn
                containerVariants={containerVariants}
                itemVariants={itemVariants}
                shouldReduceMotion={shouldReduceMotion}
                words={words}
                wordVariants={wordVariants}
              />
              <DitheringHeroFooterPanel
                footerLinkVariants={footerLinkVariants}
                footerListVariants={footerListVariants}
              />
            </div>
          </div>
        </DitheringSimplexBackdrop>
      </div>
    </section>
  );
}
