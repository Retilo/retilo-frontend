"use client";

import { HelpCircle } from "lucide-react";
import type { Variants } from "motion/react";
import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { scrollMarginAnchor, sectionGutter, sectionGutterX } from "@/lib/organic-theme";
import { OrganicShapeBadge } from "./organic-shape-badge";

const FAQ_ITEMS = [
  {
    value: "deps",
    q: "What do I need to run the shaders?",
    a: "Install @paper-design/shaders-react alongside motion and your UI stack. The dither hero uses the Dithering component; no WebGL setup is required in your app code beyond dropping in the block.",
  },
  {
    value: "browser",
    q: "Which browsers are supported?",
    a: "Modern Chromium, Safari, and Firefox with Canvas and CSS filter support. For heavy shader panels, prefer latest evergreen browsers; we test against reduced-motion and respect prefers-reduced-motion for motion-heavy sections.",
  },
  {
    value: "install",
    q: "How do blocks install?",
    a: "Use the shadcn CLI against this registry: pages and components map to your app directory. Resolve registryDependencies (e.g. button, accordion) first, then add the page template files and env/docs as listed in the block README.",
  },
  {
    value: "theming",
    q: "How do I theme it without breaking the look?",
    a: "Organic tokens live in lib/organic-theme.ts—warm ink, orange accent (#FBA649), peach cream (#FFDDCC), and honey highlights. Swap hex values or map them to your CSS variables; keep concentric radii on nested shells so borders and fills stay flush.",
  },
  {
    value: "next",
    q: "Does it work with the App Router?",
    a: "Yes. Entry points are app/page.tsx and app/layout.tsx with client sections marked explicitly. Server Components are used where there is no motion or client-only APIs.",
  },
  {
    value: "prod",
    q: "Is this production-ready?",
    a: "It is a polished marketing template: illustrative shader params and logos are placeholders. Wire real analytics, swap copy, and run your own performance budget before high-traffic launches.",
  },
] as const;

export function OrganicFaqSection({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? "visible" : "hidden";

  const itemVariants: Variants = useMemo(
    () => ({
      hidden: {
        opacity: shouldReduceMotion ? 1 : 0,
        y: shouldReduceMotion ? 0 : 12,
        filter: shouldReduceMotion ? "blur(0px)" : "blur(3px)",
      },
      visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { type: "spring", bounce: 0.06, duration: 0.5 },
      },
    }),
    [shouldReduceMotion]
  );

  return (
    <section
      aria-label="Frequently asked questions"
      className={cn(
        "relative isolate overflow-hidden bg-white antialiased shadow-[inset_0_1px_0_0_rgba(251,166,73,0.06)] dark:bg-neutral-950 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]",
        sectionGutter,
        scrollMarginAnchor,
        className
      )}
      data-slot="organic-faq"
      id="faq"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,rgba(251,166,73,0.05),transparent_55%)] dark:bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,rgba(251,166,73,0.07),transparent_55%)]"
      />
      <div className={cn("relative mx-auto max-w-2xl", sectionGutterX)}>
        <motion.div
          className="mb-10 text-center"
          initial={initial}
          variants={itemVariants}
          viewport={{ once: true, margin: "-80px" }}
          whileInView="visible"
        >
          <div className="mb-4 flex justify-center">
            <OrganicShapeBadge icon={<HelpCircle aria-hidden className="stroke-[1.75]" />} label="FAQ" />
          </div>
          <h2 className="text-balance font-bold text-3xl text-neutral-900 tracking-[-0.035em] sm:text-4xl dark:text-[#FFDDCC]">
            Before you integrate
          </h2>
          <p className="mt-4 text-pretty text-lg text-neutral-600 leading-relaxed dark:text-neutral-400">
            Technical answers for buyers evaluating shaders, install paths, and theming.
          </p>
        </motion.div>

        <motion.div
          initial={initial}
          variants={itemVariants}
          viewport={{ once: true, margin: "-40px" }}
          whileInView="visible"
        >
          <Accordion
            className={cn(
              "w-full rounded-[1.25rem] border border-neutral-200/80 bg-neutral-50/70 px-1 py-0.5 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_8px_32px_-12px_rgba(0,0,0,0.08)]",
              "dark:border-white/9 dark:bg-[#1a1410]/95 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_12px_40px_-14px_rgba(0,0,0,0.55)]"
            )}
            collapsible
            type="single"
          >
            {FAQ_ITEMS.map((item) => (
              <AccordionItem
                className="border-neutral-200/75 px-1 last:border-b-0 dark:border-white/8"
                key={item.value}
                value={item.value}
              >
                <AccordionTrigger
                  className={cn(
                    "min-h-12 items-center py-4 text-left font-medium text-neutral-900 text-sm sm:min-h-13 sm:text-base dark:text-[#FFDDCC]",
                    "rounded-xl transition-[color,transform,box-shadow,text-decoration-color] duration-200 ease-out",
                    "hover:no-underline [@media(hover:hover)]:hover:bg-neutral-100/80 dark:[@media(hover:hover)]:hover:bg-white/4",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FBA649]/35 focus-visible:ring-offset-2",
                    "focus-visible:ring-offset-neutral-50 dark:focus-visible:ring-offset-[#1a1410]"
                  )}
                >
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-pretty text-neutral-600 text-sm leading-relaxed dark:text-neutral-400">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
