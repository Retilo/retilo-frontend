"use client";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import MarqueeAlongSvgPath from "./ribbon";
import { RIBBON_TILES } from "./ribbon-tile-images";

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.06 },
  },
};

function staggerItemVariants(reduce: boolean): Variants {
  return {
    hidden: { opacity: 0, y: reduce ? 0 : 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
  };
}

/** Multi-segment cubic loop; viewBox fits y≈−43…326 and x≈1…995. */
const RIBBON_PATH =
  "M1 209.434C58.5872 255.935 387.926 325.938 482.583 209.434C600.905 63.8051 525.516 -43.2211 427.332 19.9613C329.149 83.1436 352.902 242.723 515.041 267.302C644.752 286.966 943.56 181.94 995 156.5";

/** Slower drift along the path (default in ribbon.tsx is 5). */
const MARQUEE_BASE_VELOCITY = 5.5;

export function HeroRibbon() {
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? "visible" : "hidden";
  const itemVariants = staggerItemVariants(!!shouldReduceMotion);

  return (
    <section className="relative flex min-h-svh w-full flex-col bg-background">
      {/* Quiet depth — neutral wash only */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-18%,color-mix(in_oklab,var(--color-muted)_38%,transparent),transparent_62%)] dark:bg-[radial-gradient(ellipse_85%_55%_at_50%_-18%,color-mix(in_oklab,var(--color-muted)_22%,transparent),transparent_58%)]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-16 sm:px-6 sm:py-20 lg:py-0">
        <div className="grid flex-1 grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-10 lg:py-16 xl:gap-14">
          <motion.div
            animate="visible"
            className="mx-auto w-full max-w-2xl text-center lg:mx-0 lg:max-w-none lg:pr-4 lg:text-left"
            initial={initial}
            variants={staggerContainer}
          >
            <motion.p
              className="mb-6 inline-flex items-center rounded-md border border-border/80 bg-background/60 px-3 py-1 font-medium text-muted-foreground text-xs backdrop-blur-sm sm:text-sm lg:mx-0"
              variants={itemVariants}
            >
              Now in public beta
            </motion.p>

            <motion.h1
              className="text-balance font-semibold text-[2.25rem] text-foreground leading-[1.08] tracking-tight sm:text-5xl md:text-6xl md:leading-[1.05]"
              variants={itemVariants}
            >
              <span className="bg-linear-to-b from-foreground to-foreground/75 bg-clip-text text-transparent dark:from-neutral-100 dark:to-neutral-400">
                Build products
              </span>
              <br />
              <span className="text-foreground/90">people remember.</span>
            </motion.h1>

            <motion.p
              className="mx-auto mt-5 max-w-lg text-pretty text-muted-foreground text-sm leading-relaxed sm:mt-6 sm:text-base lg:mx-0"
              variants={itemVariants}
            >
              One place for your team to ship, review, and learn — without the noise.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4 lg:justify-start"
              variants={itemVariants}
            >
              <Button className="h-11 min-w-38 px-6" size="default">
                Start free
                <ArrowRight className="ml-1 size-4" />
              </Button>
              <Button className="h-11 px-6" variant="outline">
                View demo
              </Button>
            </motion.div>

            <motion.p className="mt-10 text-muted-foreground text-xs sm:text-sm" variants={itemVariants}>
              Trusted by <span className="font-medium text-foreground tabular-nums">12,000+</span> teams
            </motion.p>
          </motion.div>

          <div
            aria-hidden
            className="-translate-x-6 sm:-translate-x-8 lg:-translate-x-14 xl:-translate-x-20 relative z-5 min-h-[min(42vh,320px)] w-full shrink-0 rotate-45 select-none sm:min-h-[min(40vh,360px)] lg:max-h-[min(72vh,600px)] lg:min-h-[min(64vh,520px)]"
          >
            <MarqueeAlongSvgPath
              baseVelocity={MARQUEE_BASE_VELOCITY}
              className="h-full w-full text-muted-foreground/20 dark:text-muted-foreground/15"
              path={RIBBON_PATH}
              repeat={4}
              responsive
              slowDownFactor={0.28}
              slowdownOnHover
              viewBox="0 -50 1000 390"
              zIndexBase={1}
              zIndexRange={12}
            >
              {RIBBON_TILES.map((tile) => (
                <div
                  className={cn(
                    "size-15 shrink-0 overflow-hidden rounded-[2px] shadow-sm ring-1 ring-black/6 sm:size-16",
                    "dark:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)] dark:ring-white/10"
                  )}
                  key={tile.alt}
                >
                  <img
                    alt={tile.alt}
                    className="size-full object-cover"
                    decoding="async"
                    draggable={false}
                    height={128}
                    loading="lazy"
                    src={tile.src}
                    width={128}
                  />
                </div>
              ))}
            </MarqueeAlongSvgPath>
          </div>
        </div>
      </div>
    </section>
  );
}
