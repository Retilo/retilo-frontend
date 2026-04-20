"use client";

import type { Variants } from "motion/react";
import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { SIMPLEX_LINK_EASE, sectionGutterX } from "@/lib/organic-theme";

const LINKS: ReadonlyArray<{ href: string; label: string; external?: boolean }> = [
  { href: "#pattern-guide", label: "Pattern guide" },
  { href: "#shader-settings", label: "Shader settings" },
  { href: "https://github.com", label: "View source", external: true },
];

export function OrganicSiteFooter({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? "visible" : "hidden";

  const itemVariants: Variants = useMemo(
    () => ({
      hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 10 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: SIMPLEX_LINK_EASE },
      },
    }),
    [shouldReduceMotion]
  );

  return (
    <footer
      className={cn(
        "border-[#FBA649]/10 border-t bg-white py-12 dark:border-white/10 dark:bg-neutral-950",
        sectionGutterX,
        className
      )}
      data-slot="organic-site-footer"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <motion.p
          className="font-medium text-neutral-600 text-sm dark:text-neutral-400"
          initial={initial}
          variants={itemVariants}
          viewport={{ once: true, margin: "-20px" }}
          whileInView="visible"
        >
          © {new Date().getFullYear()} Dither Experiments. All rights reserved.
        </motion.p>

        <motion.nav
          aria-label="Footer"
          className="flex flex-wrap gap-x-6 gap-y-2"
          initial={initial}
          variants={itemVariants}
          viewport={{ once: true, margin: "-20px" }}
          whileInView="visible"
        >
          {LINKS.map((link) => (
            <a
              className="font-medium text-neutral-900 text-sm underline-offset-4 transition-colors hover:text-[#FBA649] hover:underline dark:text-[#FFDDCC] dark:hover:text-[#FBA649]"
              href={link.href}
              key={link.label}
              rel={link.external ? "noopener noreferrer" : undefined}
              target={link.external ? "_blank" : undefined}
            >
              {link.label}
            </a>
          ))}
        </motion.nav>
      </div>
    </footer>
  );
}
