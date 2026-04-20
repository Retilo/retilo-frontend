"use client";

import { ArrowRight, Grid3x3, Home, Image as ImageIcon, LayoutPanelTop } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

/** Section `id`s in DOM order — must match `registry/pages/organic/app/page.tsx` */
const NAV_ITEMS = [
  { id: "hero", label: "Home", Icon: Home },
  { id: "banner", label: "Gallery", Icon: ImageIcon },
  { id: "pattern-guide", label: "Patterns", Icon: Grid3x3 },
  { id: "tabs-illustration", label: "Tabs", Icon: LayoutPanelTop },
  { id: "primary-cta", label: "Start", Icon: ArrowRight },
] as const;

export type OrganicNavSectionId = (typeof NAV_ITEMS)[number]["id"];

function sectionScrollTop(el: HTMLElement): number {
  return el.getBoundingClientRect().top + window.scrollY;
}

export interface OrganicNavbarProps {
  className?: string;
}

export function OrganicNavbar({ className }: OrganicNavbarProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<OrganicNavSectionId>("hero");

  /** Keep in sync with fixed bar: `top-*` + pill height + a few px buffer */
  const headerOffset = useMemo(() => 56, []);

  const updateActiveFromScroll = useCallback(() => {
    const y = window.scrollY + headerOffset;
    let current: OrganicNavSectionId = "hero";
    for (const { id } of NAV_ITEMS) {
      const el = document.getElementById(id);
      if (!el) {
        continue;
      }
      if (sectionScrollTop(el) <= y) {
        current = id;
      }
    }
    setActiveId(current);
  }, [headerOffset]);

  useEffect(() => {
    updateActiveFromScroll();
    window.addEventListener("scroll", updateActiveFromScroll, { passive: true });
    window.addEventListener("resize", updateActiveFromScroll);
    return () => {
      window.removeEventListener("scroll", updateActiveFromScroll);
      window.removeEventListener("resize", updateActiveFromScroll);
    };
  }, [updateActiveFromScroll]);

  const handleNavClick = useCallback(
    (id: OrganicNavSectionId) => {
      const section = document.getElementById(id);
      if (!section) {
        return;
      }
      section.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth", block: "start" });
      setActiveId(id);
    },
    [shouldReduceMotion]
  );

  return (
    <nav
      aria-label="Page sections"
      className={cn(
        "-translate-x-1/2 pointer-events-none fixed top-3 left-1/2 z-50 w-[min(100%-1.25rem,22rem)] md:w-[min(100%-1.75rem,28rem)]",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-auto flex rounded-full border border-[#FBA649]/25 bg-[#2d1f16]/85 px-0.5 py-0.5 shadow-[0_0_0_1px_rgba(0,0,0,0.35),0_6px_24px_-8px_rgba(0,0,0,0.5)] backdrop-blur-md",
          "dark:bg-[#1a1410]/90 dark:shadow-[0_0_0_1px_rgba(251,166,73,0.12),0_12px_40px_-10px_rgba(0,0,0,0.65)]"
        )}
      >
        <ul className="flex w-full justify-between gap-px">
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const isActive = activeId === id;
            return (
              <li className="flex min-w-0 flex-1" key={id}>
                <motion.button
                  aria-current={isActive ? "true" : undefined}
                  aria-label={label}
                  className={cn(
                    "relative flex min-h-9 min-w-9 flex-1 cursor-pointer items-center justify-center rounded-full px-0.5 py-1 outline-none",
                    "transition-[color] duration-200 ease-out",
                    "focus-visible:ring-2 focus-visible:ring-[#FBA649]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#2d1f16]",
                    "dark:focus-visible:ring-offset-[#1a1410]",
                    "[@media(hover:hover)]:hover:text-[#FFDDCC]"
                  )}
                  onClick={() => handleNavClick(id)}
                  style={{ WebkitTapHighlightColor: "transparent" }}
                  type="button"
                >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-[#FBA649]/18"
                      layoutId="organic-nav-highlight"
                      style={{ borderRadius: 9999 }}
                      transition={{
                        type: "spring",
                        bounce: shouldReduceMotion ? 0 : 0.18,
                        duration: shouldReduceMotion ? 0.01 : 0.45,
                      }}
                    />
                  )}
                  <Icon
                    aria-hidden
                    className={cn(
                      "relative z-10 size-[0.95rem] shrink-0 sm:size-4",
                      isActive ? "text-[#FBA649]" : "text-[#FFDDCC]/55"
                    )}
                    strokeWidth={1.75}
                  />
                </motion.button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

/** @deprecated Use `OrganicNavbar` — alias kept for older imports */
export const Navbar = OrganicNavbar;
