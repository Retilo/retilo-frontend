"use client";

import { ChevronDown, ChevronUp, Palette, Search } from "lucide-react";
import { motion, useInView, useReducedMotion, type Variants } from "motion/react";
import Image from "next/image";
import * as React from "react";
import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/utils";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const surfaceShadow = cn(
  "transition-shadow duration-200",
  "shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06),0px_2px_4px_0px_rgba(0,0,0,0.04)]",
  "dark:shadow-[0px_0px_0px_1px_rgba(255,255,255,0.06),0px_1px_2px_-1px_rgba(255,255,255,0.03),0px_2px_4px_0px_rgba(0,0,0,0.2)]"
);

/** Layered depth for mock knowledge-base panels (SKILL-DESIGN: ring + lift + ambient). */
const mockKnowledgePanelShadow = cn(
  "bg-background/80 transition-shadow duration-200",
  "shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06),0px_2px_4px_0px_rgba(0,0,0,0.04)]",
  "dark:shadow-[0px_0px_0px_1px_rgba(255,255,255,0.06),0px_1px_2px_-1px_rgba(255,255,255,0.03),0px_2px_4px_0px_rgba(0,0,0,0.2)]"
);

const mockKnowledgeRowShadow = cn(
  "transition-shadow duration-200",
  "shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.05)]",
  "dark:shadow-[0px_0px_0px_1px_rgba(255,255,255,0.08),0px_1px_2px_-1px_rgba(255,255,255,0.04)]"
);

/** Expanded / selected row — stronger lift (SKILL-DESIGN selected state). */
const mockKnowledgeActiveShadow = cn(
  "transition-shadow duration-200",
  "shadow-[0px_0px_0px_1px_rgba(0,0,0,0.1),0px_2px_4px_-1px_rgba(0,0,0,0.1),0px_4px_8px_0px_rgba(0,0,0,0.06)]",
  "dark:shadow-[0px_0px_0px_1px_rgba(255,255,255,0.12),0px_2px_4px_-1px_rgba(255,255,255,0.06),0px_4px_8px_0px_rgba(0,0,0,0.3)]"
);

const CARD_MOCK_BASE = "relative flex shrink-0 flex-col overflow-hidden";
const CARD_MOCK_BAND_LG = cn(CARD_MOCK_BASE, "h-[190px] sm:h-[210px]");
const CARD_MOCK_BAND_SM = cn(CARD_MOCK_BASE, "h-[130px] sm:h-[140px]");

function CardShell({
  className,
  children,
  variants,
}: {
  className?: string;
  children: React.ReactNode;
  variants?: Variants;
}) {
  return (
    <motion.article
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-3xl bg-card p-5 sm:p-6 md:p-7",
        surfaceShadow,
        className
      )}
      variants={variants}
    >
      {children}
    </motion.article>
  );
}

function CardHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mt-5 shrink-0 space-y-1.5">
      <h3 className="text-balance font-semibold text-base text-foreground tracking-tight sm:text-lg">{title}</h3>
      <p className="text-pretty text-muted-foreground text-sm leading-relaxed">{subtitle}</p>
    </div>
  );
}

function BrandAgentMaskGlyph({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} fill="none" viewBox="0 0 16 16">
      <ellipse cx="5.25" cy="6.75" fill="currentColor" rx="1.15" ry="1.35" />
      <ellipse cx="10.75" cy="6.75" fill="currentColor" rx="1.15" ry="1.35" />
      <path d="M5.25 10.75c1.1 1.35 4.4 1.35 5.5 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.25" />
    </svg>
  );
}

function GradientOrb({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 via-fuchsia-500 to-pink-500 text-white/95 shadow-sm",
        className
      )}
    >
      <BrandAgentMaskGlyph className="size-3.5" />
    </div>
  );
}

const MOCK_KB_NAV_GHOST_WIDTHS = ["w-[62%]", "w-[54%]", "w-[71%]", "w-[48%]"] as const;

const MOCK_KB_DOC_TOP_LINES = [
  "w-full",
  "w-[94%]",
  "w-[88%]",
  "w-full",
  "w-[72%]",
  "w-[91%]",
  "w-[85%]",
  "w-full",
] as const;

const MOCK_KB_DOC_BOTTOM_LINES = [
  "w-[40%]",
  "w-full",
  "w-[68%]",
  "w-[79%]",
  "w-[96%]",
  "w-[55%]",
  "w-full",
  // "w-[82%]",
  // "w-[64%]",
  // "w-[58%]",
] as const;

function MockKnowledgeBase() {
  const inner = "rounded-[calc(var(--radius)-2px)] ";
  return (
    <div className={cn(CARD_MOCK_BAND_LG, "p-1.5 sm:p-2")}>
      <div className="flex h-full min-h-0 gap-1.5 sm:gap-2">
        <div className={cn("flex min-h-0 w-[38%] flex-col space-y-1.5 p-2", inner, mockKnowledgePanelShadow)}>
          <div className="font-medium text-[9px] text-muted-foreground uppercase tracking-[0.14em]">
            Content library
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-1">
            <div
              className={cn(
                "flex shrink-0 items-center justify-between gap-1 rounded-md bg-background/90 px-2 py-1 text-[10px] text-foreground",
                mockKnowledgeRowShadow
              )}
            >
              <span>Workspace</span>
              <ChevronDown aria-hidden className="size-3 shrink-0 text-muted-foreground" strokeWidth={2} />
            </div>
            <div className={cn("shrink-0 rounded-md bg-background/95 px-2 py-1.5", mockKnowledgeActiveShadow)}>
              <div className="mb-1 flex items-center justify-between gap-1 font-medium text-[10px] text-foreground">
                <span>Tone &amp; Messaging Guides</span>
                <ChevronUp aria-hidden className="size-3 shrink-0 text-muted-foreground" strokeWidth={2} />
              </div>
              <div className="space-y-1">
                <div className="h-1 rounded-full bg-muted-foreground/15" />
                <div className="h-1 w-4/5 rounded-full bg-muted-foreground/12" />
                <div className="h-1 w-3/5 rounded-full bg-muted-foreground/10" />
                <div className="h-1 w-4/5 rounded-full bg-muted-foreground/12" />
                <div className="h-1 w-3/5 rounded-full bg-muted-foreground/10" />
              </div>
            </div>
            <div className="flex min-h-0 flex-1 flex-col justify-start gap-1 pt-0.5">
              {MOCK_KB_NAV_GHOST_WIDTHS.map((w, i) => (
                <div
                  className={cn(
                    "flex shrink-0 items-center justify-between gap-1 rounded-md bg-background/85 px-2 py-1",
                    mockKnowledgeRowShadow
                  )}
                  key={i}
                >
                  <div className={cn("h-1.5 min-w-0 rounded-full bg-muted-foreground/12", w)} />
                  <ChevronDown aria-hidden className="size-3 shrink-0 text-muted-foreground/40" strokeWidth={2} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={cn("flex min-h-0 flex-1 flex-col gap-2 p-2", inner, mockKnowledgePanelShadow)}>
          <div className="h-2 w-2/5 shrink-0 rounded-full bg-muted-foreground/15 sm:w-1/3" />
          <div className="flex min-h-0 flex-1 flex-col justify-between gap-3 overflow-hidden pt-1">
            <div className="space-y-1.5">
              {MOCK_KB_DOC_TOP_LINES.map((w, i) => (
                <div
                  className={cn(
                    "h-1.5 rounded-full",
                    i % 4 === 0 ? "bg-muted-foreground/13" : "bg-muted-foreground/10",
                    w
                  )}
                  key={i}
                />
              ))}
            </div>
            <div className="space-y-1.5">
              {MOCK_KB_DOC_BOTTOM_LINES.map((w, i) => (
                <div
                  className={cn(
                    "h-1.5 rounded-full",
                    i % 4 === 0 ? "bg-muted-foreground/12" : "bg-muted-foreground/9",
                    w
                  )}
                  key={i}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mask-b-from-100% mask-t-from-60% pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-card sm:h-36" />
    </div>
  );
}

function MockResearchChat() {
  return (
    <div
      className={cn(CARD_MOCK_BAND_LG, "gap-2 rounded-xl border border-border/60 bg-muted/15 p-2 sm:gap-2.5 sm:p-2.5")}
    >
      <div className="flex min-h-0 flex-1 items-start gap-2">
        <GradientOrb className="size-8 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <div className="font-semibold text-[11px] text-foreground">Research Copilot</div>
            <div className="mt-0.5 flex items-center gap-1 text-[9px] text-muted-foreground">
              <ChevronDown aria-hidden className="size-3 shrink-0 opacity-80" strokeWidth={2} />
              <span>Reasoning for a moment</span>
            </div>
          </div>
          <p className="text-[9px] text-muted-foreground leading-relaxed">
            I&apos;m building a competitive readout on a major marketing-automation player—starting with how they price
            every tier, bundle features, and position against peers.
          </p>
          <div className="space-y-1.5 rounded-lg border border-border/50 bg-background px-2 py-2 shadow-sm">
            <div className="flex items-start gap-1.5 text-[9px] text-foreground/90 leading-snug">
              <Search aria-hidden className="mt-0.5 size-3 shrink-0 text-muted-foreground" strokeWidth={2} />
              <span>Enterprise marketing automation 2025 pricing tiers feature comparison</span>
            </div>
            <div className="space-y-0.5 border-border/40 border-t pt-1.5">
              <div className="flex items-center gap-1.5 text-[9px] leading-snug">
                <span aria-hidden className="size-2 shrink-0 rounded-full bg-muted-foreground/35" />
                <span className="font-medium text-foreground/80">Automation Suite X | Plans &amp; Packaging</span>
              </div>
              <p className="pl-3.5 text-[8px] text-muted-foreground/80 leading-snug">
                Review month-to-month and annual plans built for startups through global orgs.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mask-b-from-100% mask-t-from-60% pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-card sm:h-32" />
    </div>
  );
}

const MicrosoftExcel = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 486 500">
    <defs>
      <radialGradient
        cx="-746.66"
        cy="781.44"
        fx="-746.66"
        fy="781.44"
        gradientTransform="matrix(-28.32596 -29.80763 -23.11916 21.97986 -2596.39 -38900.31)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_excel__a"
        r="13.89"
      >
        <stop offset=".06" stopColor="#379539" />
        <stop offset=".42" stopColor="#297c2d" />
        <stop offset=".7" stopColor="#15561c" />
      </radialGradient>
      <radialGradient
        cx="-773.19"
        cy="771.25"
        fx="-773.19"
        fy="771.25"
        gradientTransform="matrix(-11.97612 -11.58137 -8.95853 9.26806 -2155.12 -15858.88)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_excel__b"
        r="13.89"
      >
        <stop offset="0" stopColor="#073b10" />
        <stop offset=".99" stopColor="#084a13" stopOpacity="0" />
      </radialGradient>
      <radialGradient
        cx="-824.11"
        cy="810.99"
        fx="-824.11"
        fy="810.99"
        gradientTransform="matrix(-9.02 0 0 19.09 -7120.4 -15378.69)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_excel__f"
        r="13.89"
      >
        <stop offset=".29" stopColor="#4eb43b" />
        <stop offset="1" stopColor="#72cc61" stopOpacity="0" />
      </radialGradient>
      <radialGradient
        cx="-769.14"
        cy="808.9"
        fx="-769.14"
        fy="808.9"
        gradientTransform="matrix(-16.9077 -13.68182 13.64112 -16.86345 -23523.37 3309.71)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_excel__h"
        r="13.89"
      >
        <stop offset=".44" stopColor="#79e96d" />
        <stop offset="1" stopColor="#d0eb76" />
      </radialGradient>
      <radialGradient
        cx="-675.64"
        cy="793.28"
        fx="-675.64"
        fy="793.28"
        gradientTransform="matrix(15.99196 15.99755 45.54153 -45.54797 -25315.85 47178.18)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_excel__i"
        r="13.89"
      >
        <stop offset="0" stopColor="#20a85e" />
        <stop offset=".94" stopColor="#09442a" />
      </radialGradient>
      <radialGradient
        cx="-657.62"
        cy="853.99"
        fx="-657.62"
        fy="853.99"
        gradientTransform="matrix(0 11.2 12.9 0 -10902.85 7734.8)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_excel__j"
        r="13.89"
      >
        <stop offset=".58" stopColor="#33a662" stopOpacity="0" />
        <stop offset=".97" stopColor="#98f0b0" />
      </radialGradient>
      <linearGradient
        gradientTransform="matrix(1 0 0 -1 0 502)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_excel__c"
        x1="69.43"
        x2="260.84"
        y1="210.33"
        y2="210.33"
      >
        <stop offset="0" stopColor="#52d17c" />
        <stop offset=".33" stopColor="#4aa647" />
      </linearGradient>
      <linearGradient
        gradientTransform="matrix(1 0 0 -1 0 502)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_excel__d"
        x1="194.4"
        x2="194.4"
        y1="335.33"
        y2="161.68"
      >
        <stop offset="0" stopColor="#29852f" />
        <stop offset=".5" stopColor="#4aa647" stopOpacity="0" />
      </linearGradient>
      <linearGradient
        gradientTransform="matrix(1 0 0 -1 0 502)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_excel__e"
        x1="80.49"
        x2="311.45"
        y1="297.22"
        y2="497.54"
      >
        <stop offset="0" stopColor="#66d052" />
        <stop offset="1" stopColor="#85e972" />
      </linearGradient>
      <linearGradient
        gradientTransform="matrix(1 0 0 -1 0 502)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_excel__g"
        x1="182.11"
        x2="69.43"
        y1="377"
        y2="377"
      >
        <stop offset=".18" stopColor="#c0e075" stopOpacity="0" />
        <stop offset="1" stopColor="#d1eb95" />
      </linearGradient>
    </defs>
    <path
      d="M69.43 159.72c0-34.52 27.98-62.5 62.49-62.5h354.09v361.11c0 23.01-18.65 41.67-41.66 41.67H152.74c-46.01 0-83.31-37.31-83.31-83.33V159.72Z"
      style={{ fill: "url(#microsoft_excel__a)" }}
    />
    <path
      d="M69.43 159.72c0-34.52 27.98-62.5 62.49-62.5h354.09v361.11c0 23.01-18.65 41.67-41.66 41.67H152.74c-46.01 0-83.31-37.31-83.31-83.33V159.72Z"
      style={{ fill: "url(#microsoft_excel__b)", fillOpacity: ".7" }}
    />
    <path
      d="M69.43 229.17c0-34.52 27.98-62.5 62.49-62.5h187.46c-23.01 0-41.66 18.66-41.66 41.67v83.33c0 23.01-18.65 41.67-41.66 41.67h-83.31c-46.01 0-83.31 37.31-83.31 83.33v-187.5Z"
      style={{ fill: "url(#microsoft_excel__c)" }}
    />
    <path
      d="M69.43 229.17c0-34.52 27.98-62.5 62.49-62.5h187.46c-23.01 0-41.66 18.66-41.66 41.67v83.33c0 23.01-18.65 41.67-41.66 41.67h-83.31c-46.01 0-83.31 37.31-83.31 83.33v-187.5Z"
      style={{ fill: "url(#microsoft_excel__d)", fillOpacity: ".3" }}
    />
    <path
      d="M69.43 83.33C69.43 37.31 106.73 0 152.74 0h166.63v166.67H152.74c-46.01 0-83.31 37.31-83.31 83.33V83.33Z"
      style={{ fill: "url(#microsoft_excel__e)" }}
    />
    <path
      d="M69.43 83.33C69.43 37.31 106.73 0 152.74 0h166.63v166.67H152.74c-46.01 0-83.31 37.31-83.31 83.33V83.33Z"
      style={{ fill: "url(#microsoft_excel__f)" }}
    />
    <path
      d="M69.43 83.33C69.43 37.31 106.73 0 152.74 0h166.63v166.67H152.74c-46.01 0-83.31 37.31-83.31 83.33V83.33Z"
      style={{ fill: "url(#microsoft_excel__g)" }}
    />
    <rect
      height="166.67"
      rx="41.66"
      ry="41.66"
      style={{ fill: "url(#microsoft_excel__h)" }}
      width="208.29"
      x="277.71"
    />
    <rect
      height="222.22"
      rx="45.13"
      ry="45.13"
      style={{ fill: "url(#microsoft_excel__i)" }}
      width="222.17"
      y="236.11"
    />
    <rect
      height="222.22"
      rx="45.13"
      ry="45.13"
      style={{ fillOpacity: ".3", fill: "url(#microsoft_excel__j)" }}
      width="222.17"
      y="236.11"
    />
    <path
      d="M169.48 410.71h-34.25l-21.5-40.47c-.77-1.42-1.36-2.54-1.77-3.37-.35-.88-.74-1.89-1.15-3.01h-.35c-.53 1.42-1.03 2.57-1.5 3.45-.47.89-1.03 1.98-1.68 3.28l-22.3 40.11h-32.3l38.76-63.58-36.1-63.4h33.8l19.11 36.13c.77 1.48 1.42 2.78 1.95 3.9.59 1.06 1.18 2.33 1.77 3.81h.35l1.95-4.07c.53-1 1.24-2.33 2.12-3.98l19.82-35.77h32.21l-36.63 62.43 37.7 64.55Z"
      style={{ fill: "#fff" }}
    />
  </svg>
);

const MicrosoftWord = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 486 500">
    <defs>
      <radialGradient
        cx="-689.34"
        cy="753.93"
        fx="-689.34"
        fy="753.93"
        gradientTransform="matrix(47.56 0 0 -20.15 33260.63 15691.18)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_word__a"
        r="13.89"
      >
        <stop offset=".18" stopColor="#1657f4" />
        <stop offset=".57" stopColor="#0036c4" />
      </radialGradient>
      <radialGradient
        cx="-730.97"
        cy="806.4"
        fx="-730.97"
        fy="806.4"
        gradientTransform="matrix(-20.22495 21.28288 52.40647 49.82267 -56559.12 -24498.36)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_word__c"
        r="13.89"
      >
        <stop offset=".14" stopColor="#d471ff" />
        <stop offset=".83" stopColor="#509df5" stopOpacity="0" />
      </radialGradient>
      <radialGradient
        cx="-682.21"
        cy="801.86"
        fx="-682.21"
        fy="801.86"
        gradientTransform="matrix(0 18.62 101.62 0 -81063.08 13022.32)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_word__d"
        r="13.89"
      >
        <stop offset=".28" stopColor="#4f006f" stopOpacity="0" />
        <stop offset="1" stopColor="#4f006f" />
      </radialGradient>
      <radialGradient
        cx="-749.58"
        cy="798.74"
        fx="-749.58"
        fy="798.74"
        gradientTransform="matrix(-28.7167 6.70901 16.06567 68.78884 -33867.69 -49911.37)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_word__f"
        r="13.89"
      >
        <stop offset=".06" stopColor="#e4a7fe" />
        <stop offset=".54" stopColor="#e4a7fe" stopOpacity="0" />
      </radialGradient>
      <radialGradient
        cx="-675.64"
        cy="797.48"
        fx="-675.64"
        fy="797.48"
        gradientTransform="matrix(15.99196 15.99755 15.99476 -15.99476 -1949 23805.98)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_word__g"
        r="13.89"
      >
        <stop offset=".08" stopColor="#367af2" />
        <stop offset=".87" stopColor="#001a8f" />
      </radialGradient>
      <radialGradient
        cx="-657.62"
        cy="854.65"
        fx="-657.62"
        fy="854.65"
        gradientTransform="matrix(0 11.2 12.76 0 -10796.09 7734.8)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_word__h"
        r="13.89"
      >
        <stop offset=".59" stopColor="#2763e5" stopOpacity="0" />
        <stop offset=".97" stopColor="#58aafe" />
      </radialGradient>
      <linearGradient
        gradientTransform="matrix(1 0 0 -1 0 502)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_word__b"
        x1="69.43"
        x2="388.45"
        y1="238.11"
        y2="238.11"
      >
        <stop offset="0" stopColor="#66c0ff" />
        <stop offset=".26" stopColor="#0094f0" />
      </linearGradient>
      <linearGradient
        gradientTransform="matrix(1 0 0 -1 0 502)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_word__e"
        x1="69.48"
        x2="485.94"
        y1="380.04"
        y2="373.16"
      >
        <stop offset="0" stopColor="#9deaff" />
        <stop offset=".2" stopColor="#3bd5ff" />
      </linearGradient>
    </defs>
    <path
      d="m69.43 376.25 194.4-237.36L486 293.13v158.26c0 26.85-21.76 48.61-48.6 48.61H152.74c-46.01 0-83.31-37.31-83.31-83.33v-40.42Z"
      style={{ fill: "url(#microsoft_word__a)" }}
    />
    <path
      d="M69.43 208.87c0-34.52 27.98-62.5 62.49-62.5h283.11L486 111.11v173.61c0 26.85-21.76 48.61-48.6 48.61H152.74c-46.01 0-83.31 37.31-83.31 83.33v-207.8Z"
      style={{ fill: "url(#microsoft_word__b)" }}
    />
    <path
      d="M69.43 208.87c0-34.52 27.98-62.5 62.49-62.5h283.11L486 111.11v173.61c0 26.85-21.76 48.61-48.6 48.61H152.74c-46.01 0-83.31 37.31-83.31 83.33v-207.8Z"
      style={{ fill: "url(#microsoft_word__c)", fillOpacity: ".6" }}
    />
    <path
      d="M69.43 208.87c0-34.52 27.98-62.5 62.49-62.5h283.11L486 111.11v173.61c0 26.85-21.76 48.61-48.6 48.61H152.74c-46.01 0-83.31 37.31-83.31 83.33v-207.8Z"
      style={{ fill: "url(#microsoft_word__d)", fillOpacity: ".1" }}
    />
    <path
      d="M69.43 83.33C69.43 37.31 106.73 0 152.74 0H437.4C464.24 0 486 21.76 486 48.61v69.44c0 26.85-21.76 48.61-48.6 48.61H152.74c-46.01 0-83.31 37.31-83.31 83.33V83.33Z"
      style={{ fill: "url(#microsoft_word__e)" }}
    />
    <path
      d="M69.43 83.33C69.43 37.31 106.73 0 152.74 0H437.4C464.24 0 486 21.76 486 48.61v69.44c0 26.85-21.76 48.61-48.6 48.61H152.74c-46.01 0-83.31 37.31-83.31 83.33V83.33Z"
      style={{ fill: "url(#microsoft_word__f)", fillOpacity: ".8" }}
    />
    <rect height="222.22" rx="45.13" ry="45.13" style={{ fill: "url(#microsoft_word__g)" }} width="222.17" y="236.11" />
    <rect
      height="222.22"
      rx="45.13"
      ry="45.13"
      style={{ fill: "url(#microsoft_word__h)", fillOpacity: ".65" }}
      width="222.17"
      y="236.11"
    />
    <path
      d="M187.26 283.73 159.92 410.7l-32.69.02-16.14-76.19-16.9 76.19h-33L34.91 283.75h26.95l16.21 83.79 16.11-83.79h33.04l16.87 83.79 15.82-83.79 27.34-.02Z"
      style={{ fill: "#fff" }}
    />
  </svg>
);

const MicrosoftTeams = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="4 4 36 38">
    <path d="M22 20h12a6 6 0 0 1 6 6v10a6 6 0 0 1-12 0V26a6 6 0 0 0-6-6Z" fill="url(#microsoft_teams__a)" />
    <path
      d="M8 24a6 6 0 0 1 6-6h8a6 6 0 0 1 6 6v12a6 6 0 0 0 6 6H18c-5.523 0-10-4.477-10-10v-8Z"
      fill="url(#microsoft_teams__b)"
    />
    <path
      d="M8 24a6 6 0 0 1 6-6h8a6 6 0 0 1 6 6v12a6 6 0 0 0 6 6H18c-5.523 0-10-4.477-10-10v-8Z"
      fill="url(#microsoft_teams__c)"
      fillOpacity=".7"
    />
    <path
      d="M8 24a6 6 0 0 1 6-6h8a6 6 0 0 1 6 6v12a6 6 0 0 0 6 6H18c-5.523 0-10-4.477-10-10v-8Z"
      fill="url(#microsoft_teams__d)"
      fillOpacity=".7"
    />
    <path d="M33 18a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" fill="url(#microsoft_teams__e)" />
    <path d="M33 18a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" fill="url(#microsoft_teams__f)" fillOpacity=".46" />
    <path d="M33 18a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" fill="url(#microsoft_teams__g)" fillOpacity=".4" />
    <path d="M18 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" fill="url(#microsoft_teams__h)" />
    <path d="M18 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" fill="url(#microsoft_teams__i)" fillOpacity=".6" />
    <path d="M18 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" fill="url(#microsoft_teams__j)" fillOpacity=".5" />
    <rect fill="url(#microsoft_teams__k)" height="16" rx="3.25" width="16" x="4" y="23" />
    <rect fill="url(#microsoft_teams__l)" fillOpacity=".7" height="16" rx="3.25" width="16" x="4" y="23" />
    <path d="M15.48 28.105h-2.448v7.466h-2.065v-7.466H8.52V26.43h6.96v1.676Z" fill="#fff" />
    <defs>
      <radialGradient
        cx="0"
        cy="0"
        gradientTransform="matrix(13.4784 0 0 33.2694 39.797 22.174)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_teams__a"
        r="1"
      >
        <stop stopColor="#A98AFF" />
        <stop offset=".14" stopColor="#8C75FF" />
        <stop offset=".565" stopColor="#5F50E2" />
        <stop offset=".9" stopColor="#3C2CB8" />
      </radialGradient>
      <radialGradient
        cx="0"
        cy="0"
        gradientTransform="matrix(12.1875 30.39997 -30.74442 12.3256 8.812 16.4)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_teams__b"
        r="1"
      >
        <stop stopColor="#85C2FF" />
        <stop offset=".69" stopColor="#7588FF" />
        <stop offset="1" stopColor="#6459FE" />
      </radialGradient>
      <radialGradient
        cx="0"
        cy="0"
        gradientTransform="rotate(113.326 8.093 17.645) scale(19.2186 15.4273)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_teams__d"
        r="1"
      >
        <stop stopColor="#BD96FF" />
        <stop offset=".687" stopColor="#BD96FF" stopOpacity="0" />
      </radialGradient>
      <radialGradient
        cx="0"
        cy="0"
        gradientTransform="matrix(0 -10 12.6216 0 33 11.571)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_teams__e"
        r="1"
      >
        <stop offset=".268" stopColor="#6868F7" />
        <stop offset="1" stopColor="#3923B1" />
      </radialGradient>
      <radialGradient
        cx="0"
        cy="0"
        gradientTransform="matrix(5.47024 4.59847 -6.65117 7.91208 28.867 10.544)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_teams__f"
        r="1"
      >
        <stop offset=".271" stopColor="#A1D3FF" />
        <stop offset=".813" stopColor="#A1D3FF" stopOpacity="0" />
      </radialGradient>
      <radialGradient
        cx="0"
        cy="0"
        gradientTransform="rotate(-41.658 32.118 -43.42) scale(8.51275 20.8824)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_teams__g"
        r="1"
      >
        <stop stopColor="#E3ACFD" />
        <stop offset=".816" stopColor="#9FA2FF" stopOpacity="0" />
      </radialGradient>
      <radialGradient
        cx="0"
        cy="0"
        gradientTransform="matrix(0 -12 15.146 0 18 8.286)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_teams__h"
        r="1"
      >
        <stop offset=".268" stopColor="#8282FF" />
        <stop offset="1" stopColor="#3923B1" />
      </radialGradient>
      <radialGradient
        cx="0"
        cy="0"
        gradientTransform="rotate(40.052 -3.155 21.416) scale(8.57554 12.4035)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_teams__i"
        r="1"
      >
        <stop offset=".271" stopColor="#A1D3FF" />
        <stop offset=".813" stopColor="#A1D3FF" stopOpacity="0" />
      </radialGradient>
      <radialGradient
        cx="0"
        cy="0"
        gradientTransform="rotate(-41.658 20.382 -26.516) scale(10.2153 25.0589)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_teams__j"
        r="1"
      >
        <stop stopColor="#E3ACFD" />
        <stop offset=".816" stopColor="#9FA2FF" stopOpacity="0" />
      </radialGradient>
      <radialGradient
        cx="0"
        cy="0"
        gradientTransform="rotate(45 -25.763 16.328) scale(22.6274)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_teams__k"
        r="1"
      >
        <stop offset=".047" stopColor="#688EFF" />
        <stop offset=".947" stopColor="#230F94" />
      </radialGradient>
      <radialGradient
        cx="0"
        cy="0"
        gradientTransform="matrix(0 11.2 -13.0702 0 12 32.6)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_teams__l"
        r="1"
      >
        <stop offset=".571" stopColor="#6965F6" stopOpacity="0" />
        <stop offset="1" stopColor="#8F8FFF" />
      </radialGradient>
      <linearGradient gradientUnits="userSpaceOnUse" id="microsoft_teams__c" x1="20.594" x2="20.594" y1="18" y2="42">
        <stop offset=".801" stopColor="#6864F6" stopOpacity="0" />
        <stop offset="1" stopColor="#5149DE" />
      </linearGradient>
    </defs>
  </svg>
);

const MicrosoftPowerPoint = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="60 78.75 581.25 562.5">
    <defs>
      <radialGradient
        cx="0"
        cy="0"
        fx="0"
        fy="0"
        gradientTransform="rotate(135 185.459 218.557) scale(564.67953 950.43148)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_powerpoint__b"
        r="1"
      >
        <stop offset=".152" style={{ stopColor: "#aa1d2d", stopOpacity: "1" }} />
        <stop offset=".381" style={{ stopColor: "#d12b18", stopOpacity: ".439216" }} />
        <stop offset=".602" style={{ stopColor: "#ff3c00", stopOpacity: "0" }} />
      </radialGradient>
      <radialGradient
        cx="0"
        cy="0"
        fx="0"
        fy="0"
        gradientTransform="matrix(484.01207 -228.61784 414.17447 876.85825 -19.41 588.618)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_powerpoint__c"
        r="1"
      >
        <stop offset=".407" style={{ stopColor: "#ff66fb", stopOpacity: ".501961" }} />
        <stop offset="1" style={{ stopColor: "#ea3d01", stopOpacity: "0" }} />
      </radialGradient>
      <radialGradient
        cx="0"
        cy="0"
        fx="0"
        fy="0"
        gradientTransform="matrix(355.8576 74.56878 -71.0897 339.25471 312.756 393.631)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_powerpoint__e"
        r="1"
      >
        <stop offset=".786" style={{ stopColor: "#ffa05c", stopOpacity: "0" }} />
        <stop offset=".905" style={{ stopColor: "#ffce84", stopOpacity: "1" }} />
      </radialGradient>
      <radialGradient
        cx="0"
        cy="0"
        fx="0"
        fy="0"
        gradientTransform="matrix(307.21144 -201.01593 192.23383 293.78981 369.795 355.78)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_powerpoint__f"
        r="1"
      >
        <stop offset=".295" style={{ stopColor: "#ff99e9", stopOpacity: ".8" }} />
        <stop offset=".728" style={{ stopColor: "#ff99e9", stopOpacity: "0" }} />
      </radialGradient>
      <radialGradient
        cx="0"
        cy="0"
        fx="0"
        fy="0"
        gradientTransform="matrix(257.14316 -294.39511 268.86446 234.84308 328.567 398.718)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_powerpoint__g"
        r="1"
      >
        <stop offset="0" style={{ stopColor: "#fd6ef9", stopOpacity: "1" }} />
        <stop offset=".637" style={{ stopColor: "#f94", stopOpacity: "1" }} />
        <stop offset=".852" style={{ stopColor: "#fcc479", stopOpacity: "1" }} />
      </radialGradient>
      <radialGradient
        cx="0"
        cy="0"
        fx="0"
        fy="0"
        gradientTransform="matrix(-29.04584 196.8193 -444.81484 -65.64406 302.985 115.92)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_powerpoint__h"
        r="1"
      >
        <stop offset=".144" style={{ stopColor: "#ff8d13", stopOpacity: "1" }} />
        <stop offset=".537" style={{ stopColor: "#ff7f29", stopOpacity: "0" }} />
      </radialGradient>
      <radialGradient
        cx="0"
        cy="0"
        fx="0"
        fy="0"
        gradientTransform="rotate(45 -386.466 244.891) scale(339.41099)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_powerpoint__i"
        r="1"
      >
        <stop offset="0" style={{ stopColor: "#f8193e", stopOpacity: "1" }} />
        <stop offset=".939" style={{ stopColor: "#920616", stopOpacity: "1" }} />
      </radialGradient>
      <radialGradient
        cx="0"
        cy="0"
        fx="0"
        fy="0"
        gradientTransform="matrix(0 168 -191.25 0 179.97 489)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_powerpoint__j"
        r="1"
      >
        <stop offset=".576" style={{ stopColor: "#ffb055", stopOpacity: "0" }} />
        <stop offset=".974" style={{ stopColor: "#fff2be", stopOpacity: ".301961" }} />
      </radialGradient>
      <linearGradient
        gradientTransform="scale(15)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_powerpoint__a"
        x1="22.096"
        x2="-.876"
        y1="4.056"
        y2="26.033"
      >
        <stop offset=".058" style={{ stopColor: "#ff7f48", stopOpacity: "1" }} />
        <stop offset="1" style={{ stopColor: "#e5495b", stopOpacity: "1" }} />
      </linearGradient>
      <linearGradient
        gradientTransform="scale(15)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_powerpoint__d"
        x1="27.549"
        x2="47.729"
        y1="28.172"
        y2="13.216"
      >
        <stop offset=".311" style={{ stopColor: "#ff6e30", stopOpacity: "1" }} />
        <stop offset=".635" style={{ stopColor: "#ffa05c", stopOpacity: "1" }} />
      </linearGradient>
    </defs>
    <path
      d="M641.2 360c0-155.332-125.907-281.25-281.223-281.25C204.66 78.75 78.75 204.668 78.75 360s125.91 281.25 281.227 281.25c155.316 0 281.222-125.918 281.222-281.25Zm0 0"
      style={{
        stroke: "none",
        fillRule: "nonzero",
        fill: "url(#microsoft_powerpoint__a)",
      }}
    />
    <path
      d="M641.2 360c0-155.332-125.907-281.25-281.223-281.25C204.66 78.75 78.75 204.668 78.75 360s125.91 281.25 281.227 281.25c155.316 0 281.222-125.918 281.222-281.25Zm0 0"
      style={{
        stroke: "none",
        fillRule: "nonzero",
        fill: "url(#microsoft_powerpoint__b)",
      }}
    />
    <path
      d="M641.2 360c0-155.332-125.907-281.25-281.223-281.25C204.66 78.75 78.75 204.668 78.75 360s125.91 281.25 281.227 281.25c155.316 0 281.222-125.918 281.222-281.25Zm0 0"
      style={{
        stroke: "none",
        fillRule: "nonzero",
        fill: "url(#microsoft_powerpoint__c)",
      }}
    />
    <path
      d="M360.016 78.75c155.312.004 281.218 125.922 281.218 281.25 0 51.672-13.96 100.07-38.273 141.68l4.57-10.121c27.832-61.797-17.406-131.727-85.183-131.676l-111.93.086c-27.824.023-50.402-22.535-50.402-50.36V197.477c-.004-67.805-70.012-112.993-131.793-85.067l-8.996 4.074c41.406-23.992 89.492-37.734 140.789-37.734Zm0 0"
      style={{
        stroke: "none",
        fillRule: "nonzero",
        fill: "url(#microsoft_powerpoint__d)",
      }}
    />
    <path
      d="M360.016 78.75c155.312.004 281.218 125.922 281.218 281.25 0 51.672-13.96 100.07-38.273 141.68l4.57-10.121c27.832-61.797-17.406-131.727-85.183-131.676l-111.93.086c-27.824.023-50.402-22.535-50.402-50.36V197.477c-.004-67.805-70.012-112.993-131.793-85.067l-8.996 4.074c41.406-23.992 89.492-37.734 140.789-37.734Zm0 0"
      style={{
        stroke: "none",
        fillRule: "nonzero",
        fill: "url(#microsoft_powerpoint__e)",
      }}
    />
    <path
      d="M360.016 78.75c155.312.004 281.218 125.922 281.218 281.25 0 51.672-13.96 100.07-38.273 141.68l4.57-10.121c27.832-61.797-17.406-131.727-85.183-131.676l-111.93.086c-27.824.023-50.402-22.535-50.402-50.36V197.477c-.004-67.805-70.012-112.993-131.793-85.067l-8.996 4.074c41.406-23.992 89.492-37.734 140.789-37.734Zm0 0"
      style={{
        stroke: "none",
        fillRule: "nonzero",
        fill: "url(#microsoft_powerpoint__f)",
      }}
    />
    <path
      d="M360.016 78.75c155.312.004 281.218 125.922 281.218 281.25 0 51.672-13.96 100.07-38.273 141.68l4.57-10.121c27.832-61.797-17.406-131.727-85.183-131.676l-111.93.086c-27.824.023-50.402-22.535-50.402-50.36V197.477c-.004-67.805-70.012-112.993-131.793-85.067l-8.996 4.074c41.406-23.992 89.492-37.734 140.789-37.734Zm0 0"
      style={{
        stroke: "none",
        fillRule: "nonzero",
        fill: "url(#microsoft_powerpoint__g)",
      }}
    />
    <path
      d="M360.016 78.75c155.312.004 281.218 125.922 281.218 281.25 0 51.672-13.96 100.07-38.273 141.68l4.57-10.121c27.832-61.797-17.406-131.727-85.183-131.676l-111.93.086c-27.824.023-50.402-22.535-50.402-50.36V197.477c-.004-67.805-70.012-112.993-131.793-85.067l-8.996 4.074c41.406-23.992 89.492-37.734 140.789-37.734Zm0 0"
      style={{
        stroke: "none",
        fillRule: "nonzero",
        fill: "url(#microsoft_powerpoint__h)",
      }}
    />
    <path
      d="M108.75 345h142.5c26.926 0 48.75 21.824 48.75 48.75v142.5c0 26.926-21.824 48.75-48.75 48.75h-142.5C81.824 585 60 563.176 60 536.25v-142.5C60 366.824 81.824 345 108.75 345Zm0 0"
      style={{
        stroke: "none",
        fillRule: "nonzero",
        fill: "url(#microsoft_powerpoint__i)",
      }}
    />
    <path
      d="M108.75 345h142.5c26.926 0 48.75 21.824 48.75 48.75v142.5c0 26.926-21.824 48.75-48.75 48.75h-142.5C81.824 585 60 563.176 60 536.25v-142.5C60 366.824 81.824 345 108.75 345Zm0 0"
      style={{
        stroke: "none",
        fillRule: "nonzero",
        fill: "url(#microsoft_powerpoint__j)",
      }}
    />
    <path
      d="M168.293 488.906v44.664h-30.875V396.426h47.7c17.077 0 30.077 3.73 39 11.191 8.987 7.457 13.48 18.52 13.48 33.184 0 15.113-5.036 26.906-15.106 35.387-10.004 8.48-23.453 12.718-40.34 12.718Zm0-68.761v45.043h12.906c7.645 0 13.543-2.004 17.684-6.024 4.14-4.016 6.215-9.785 6.215-17.309 0-6.949-2.043-12.304-6.121-16.07-4.016-3.762-9.782-5.64-17.301-5.64Zm0 0"
      style={{
        stroke: "none",
        fillRule: "nonzero",
        fill: "#fff",
        fillOpacity: "1",
      }}
    />
  </svg>
);

const MicrosoftOutlook = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="60 90.4 570.02 539.67">
    <defs>
      <linearGradient
        gradientTransform="scale(15)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_outlook__a"
        x1="9.989"
        x2="30.932"
        y1="22.365"
        y2="9.375"
      >
        <stop offset="0" style={{ stopColor: "#20a7fa", stopOpacity: "1" }} />
        <stop offset=".4" style={{ stopColor: "#3bd5ff", stopOpacity: "1" }} />
        <stop offset="1" style={{ stopColor: "#c4b0ff", stopOpacity: "1" }} />
      </linearGradient>
      <linearGradient
        gradientTransform="scale(15)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_outlook__b"
        x1="17.197"
        x2="28.856"
        y1="26.794"
        y2="8.126"
      >
        <stop offset="0" style={{ stopColor: "#165ad9", stopOpacity: "1" }} />
        <stop offset=".501" style={{ stopColor: "#1880e5", stopOpacity: "1" }} />
        <stop offset="1" style={{ stopColor: "#8587ff", stopOpacity: "1" }} />
      </linearGradient>
      <linearGradient
        gradientTransform="scale(15)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_outlook__c"
        x1="25.701"
        x2="12.756"
        y1="27.048"
        y2="16.501"
      >
        <stop offset=".237" style={{ stopColor: "#448aff", stopOpacity: "0" }} />
        <stop offset=".792" style={{ stopColor: "#0032b1", stopOpacity: ".2" }} />
      </linearGradient>
      <linearGradient
        gradientTransform="scale(15)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_outlook__d"
        x1="24.053"
        x2="44.51"
        y1="31.11"
        y2="18.018"
      >
        <stop offset="0" style={{ stopColor: "#1a43a6", stopOpacity: "1" }} />
        <stop offset=".492" style={{ stopColor: "#2052cb", stopOpacity: "1" }} />
        <stop offset="1" style={{ stopColor: "#5f20cb", stopOpacity: "1" }} />
      </linearGradient>
      <linearGradient
        gradientTransform="scale(15)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_outlook__e"
        x1="29.828"
        x2="17.397"
        y1="30.327"
        y2="19.571"
      >
        <stop offset="0" style={{ stopColor: "#0045b9", stopOpacity: "0" }} />
        <stop offset=".67" style={{ stopColor: "#0d1f69", stopOpacity: ".2" }} />
      </linearGradient>
      <linearGradient
        gradientTransform="scale(15)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_outlook__g"
        x1="41.998"
        x2="23.852"
        y1="29.943"
        y2="29.943"
      >
        <stop offset="0" style={{ stopColor: "#4dc4ff", stopOpacity: "1" }} />
        <stop offset=".196" style={{ stopColor: "#0fafff", stopOpacity: "1" }} />
      </linearGradient>
      <linearGradient
        gradientTransform="scale(15)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_outlook__k"
        x1="3.458"
        x2="20.929"
        y1="37.872"
        y2="37.86"
      >
        <stop offset=".206" style={{ stopColor: "#6ce0ff", stopOpacity: "1" }} />
        <stop offset=".535" style={{ stopColor: "#50d5ff", stopOpacity: "0" }} />
      </linearGradient>
      <radialGradient
        cx="0"
        cy="0"
        fx="0"
        fy="0"
        gradientTransform="matrix(0 -405.04051 438.393 0 360.027 102.268)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_outlook__f"
        r="1"
      >
        <stop offset=".568" style={{ stopColor: "#275ff0", stopOpacity: "0" }} />
        <stop offset=".992" style={{ stopColor: "#002177", stopOpacity: "1" }} />
      </radialGradient>
      <radialGradient
        cx="0"
        cy="0"
        fx="0"
        fy="0"
        gradientTransform="scale(173.58) rotate(-45 5.168 -1.292)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_outlook__h"
        r="1"
      >
        <stop offset=".259" style={{ stopColor: "#0060d1", stopOpacity: ".4" }} />
        <stop offset=".908" style={{ stopColor: "#0383f1", stopOpacity: "0" }} />
      </radialGradient>
      <radialGradient
        cx="0"
        cy="0"
        fx="0"
        fy="0"
        gradientTransform="matrix(357.40702 -468.44593 423.59457 323.18709 159.471 697.08)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_outlook__i"
        r="1"
      >
        <stop offset=".732" style={{ stopColor: "#f4a7f7", stopOpacity: "0" }} />
        <stop offset="1" style={{ stopColor: "#f4a7f7", stopOpacity: ".501961" }} />
      </radialGradient>
      <radialGradient
        cx="0"
        cy="0"
        fx="0"
        fy="0"
        gradientTransform="matrix(-170.86087 259.7254 -674.01813 -443.40415 278.562 412.979)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_outlook__j"
        r="1"
      >
        <stop offset="0" style={{ stopColor: "#49deff", stopOpacity: "1" }} />
        <stop offset=".724" style={{ stopColor: "#29c3ff", stopOpacity: "1" }} />
      </radialGradient>
      <radialGradient
        cx="0"
        cy="0"
        fx="0"
        fy="0"
        gradientTransform="rotate(46.924 -378.504 245.25) scale(315.927)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_outlook__l"
        r="1"
      >
        <stop offset=".039" style={{ stopColor: "#0091ff", stopOpacity: "1" }} />
        <stop offset=".919" style={{ stopColor: "#183dad", stopOpacity: "1" }} />
      </radialGradient>
      <radialGradient
        cx="0"
        cy="0"
        fx="0"
        fy="0"
        gradientTransform="matrix(0 168 -193.782 0 180 491.159)"
        gradientUnits="userSpaceOnUse"
        id="microsoft_outlook__m"
        r="1"
      >
        <stop offset=".558" style={{ stopColor: "#0fa5f7", stopOpacity: "0" }} />
        <stop offset="1" style={{ stopColor: "#74c6ff", stopOpacity: ".501961" }} />
      </radialGradient>
    </defs>
    <path
      d="m463.984 140.145-344.347 218.27-29.614-46.72v-40.257a43.26 43.26 0 0 1 19.72-36.293L309.91 105.258c30.496-19.79 69.777-19.793 100.277-.008Zm0 0"
      style={{
        stroke: "none",
        fillRule: "nonzero",
        fill: "url(#microsoft_outlook__a)",
      }}
    />
    <path
      d="M407.102 103.34a91.293 91.293 0 0 1 3.082 1.914l156.214 101.332-387.336 245.52-59.437-93.77L403.895 177.8c26.925-17.102 28.105-55.57 3.207-74.461Zm0 0"
      style={{
        stroke: "none",
        fillRule: "nonzero",
        fill: "url(#microsoft_outlook__b)",
      }}
    />
    <path
      d="M407.102 103.34a91.293 91.293 0 0 1 3.082 1.914l156.214 101.332-387.336 245.52-59.437-93.77L403.895 177.8c26.925-17.102 28.105-55.57 3.207-74.461Zm0 0"
      style={{
        stroke: "none",
        fillRule: "nonzero",
        fill: "url(#microsoft_outlook__c)",
      }}
    />
    <path
      d="M333.602 498.988 179.066 452.11 507.63 243.836c27.672-17.54 27.601-57.938-.133-75.379l-1.48-.93 4.261 2.649 99.996 64.867a43.263 43.263 0 0 1 19.723 36.3v38.962Zm0 0"
      style={{
        stroke: "none",
        fillRule: "nonzero",
        fill: "url(#microsoft_outlook__d)",
      }}
    />
    <path
      d="M333.602 498.988 179.066 452.11 507.63 243.836c27.672-17.54 27.601-57.938-.133-75.379l-1.48-.93 4.261 2.649 99.996 64.867a43.263 43.263 0 0 1 19.723 36.3v38.962Zm0 0"
      style={{
        stroke: "none",
        fillRule: "nonzero",
        fill: "url(#microsoft_outlook__e)",
      }}
    />
    <path
      d="M410.188 105.25c-30.5-19.785-69.782-19.781-100.282.008L109.742 235.145a43.26 43.26 0 0 0-19.719 36.292v1.97a44.479 44.479 0 0 0 20.735 36.16l248.887 156.91L609.16 309.805a44.468 44.468 0 0 0 20.824-37.664v38.168l.008-38.965c0-14.66-7.426-28.32-19.722-36.301Zm0 0"
      style={{
        stroke: "none",
        fillRule: "nonzero",
        fill: "url(#microsoft_outlook__f)",
      }}
    />
    <path
      d="M315.77 630.05h220.449c51.777 0 93.75-41.972 93.75-93.75V272.14c0 15.301-7.864 29.528-20.82 37.665l-327.907 205.89a60.712 60.712 0 0 0-28.422 51.414c.004 34.762 28.184 62.942 62.95 62.942Zm0 0"
      style={{
        stroke: "none",
        fillRule: "nonzero",
        fill: "url(#microsoft_outlook__g)",
      }}
    />
    <path
      d="M315.77 630.05h220.449c51.777 0 93.75-41.972 93.75-93.75V272.14c0 15.301-7.864 29.528-20.82 37.665l-327.907 205.89a60.712 60.712 0 0 0-28.422 51.414c.004 34.762 28.184 62.942 62.95 62.942Zm0 0"
      style={{
        stroke: "none",
        fillRule: "nonzero",
        fill: "url(#microsoft_outlook__h)",
      }}
    />
    <path
      d="M315.77 630.05h220.449c51.777 0 93.75-41.972 93.75-93.75V272.14c0 15.301-7.864 29.528-20.82 37.665l-327.907 205.89a60.712 60.712 0 0 0-28.422 51.414c.004 34.762 28.184 62.942 62.95 62.942Zm0 0"
      style={{
        stroke: "none",
        fillRule: "nonzero",
        fill: "url(#microsoft_outlook__i)",
      }}
    />
    <path
      d="M405.402 630.035H183.738c-51.777 0-93.75-41.972-93.75-93.75v-264.34a44.473 44.473 0 0 0 20.754 37.621l327.582 206.52a61.737 61.737 0 0 1 28.809 52.226c-.004 34.09-27.64 61.723-61.73 61.723Zm0 0"
      style={{
        stroke: "none",
        fillRule: "nonzero",
        fill: "url(#microsoft_outlook__j)",
      }}
    />
    <path
      d="M405.402 630.035H183.738c-51.777 0-93.75-41.972-93.75-93.75v-264.34a44.473 44.473 0 0 0 20.754 37.621l327.582 206.52a61.737 61.737 0 0 1 28.809 52.226c-.004 34.09-27.64 61.723-61.73 61.723Zm0 0"
      style={{
        stroke: "none",
        fillRule: "nonzero",
        fill: "url(#microsoft_outlook__k)",
      }}
    />
    <path
      d="M108.75 345h142.5c26.926 0 48.75 21.824 48.75 48.75v142.5c0 26.926-21.824 48.75-48.75 48.75h-142.5C81.824 585 60 563.176 60 536.25v-142.5C60 366.824 81.824 345 108.75 345Zm0 0"
      style={{
        stroke: "none",
        fillRule: "nonzero",
        fill: "url(#microsoft_outlook__l)",
      }}
    />
    <path
      d="M108.75 345h142.5c26.926 0 48.75 21.824 48.75 48.75v142.5c0 26.926-21.824 48.75-48.75 48.75h-142.5C81.824 585 60 563.176 60 536.25v-142.5C60 366.824 81.824 345 108.75 345Zm0 0"
      style={{
        stroke: "none",
        fillRule: "nonzero",
        fill: "url(#microsoft_outlook__m)",
      }}
    />
    <path
      d="M179.387 534c-19.848 0-36.137-6.21-48.875-18.625-12.739-12.414-19.11-28.617-19.11-48.605 0-21.11 6.465-38.18 19.395-51.22C143.73 402.517 160.66 396 181.594 396c19.781 0 35.879 6.238 48.297 18.715 12.484 12.476 18.726 28.93 18.726 49.351 0 20.985-6.469 37.899-19.398 50.75C216.352 527.606 199.742 534 179.387 534Zm.574-26.352c10.816 0 19.523-3.695 26.117-11.082 6.594-7.386 9.89-17.664 9.89-30.824 0-13.719-3.202-24.394-9.6-32.031-6.403-7.637-14.95-11.453-25.638-11.453-11.011 0-19.878 3.941-26.597 11.824-6.723 7.824-10.082 18.191-10.082 31.102 0 13.101 3.36 23.468 10.082 31.101 6.719 7.574 15.328 11.363 25.828 11.363Zm0 0"
      style={{
        stroke: "none",
        fillRule: "nonzero",
        fill: "#fff",
        fillOpacity: "1",
      }}
    />
    <path
      d="M179.332 535.848c-19.77 0-36-6.375-48.691-19.13-12.688-12.753-19.036-29.398-19.036-49.929 0-21.684 6.442-39.219 19.325-52.61 12.882-13.394 29.75-20.09 50.601-20.09 19.703 0 35.742 6.411 48.114 19.227 12.437 12.82 18.652 29.72 18.652 50.7 0 21.55-6.442 38.93-19.32 52.129-12.82 13.136-29.368 19.703-49.645 19.703Zm.57-27.067c10.778 0 19.453-3.797 26.02-11.383 6.57-7.59 9.851-18.144 9.851-31.664 0-14.093-3.187-25.058-9.562-32.902-6.379-7.844-14.89-11.766-25.54-11.766-10.972 0-19.804 4.047-26.5 12.149-6.694 8.031-10.042 18.683-10.042 31.945 0 13.457 3.348 24.106 10.043 31.95 6.695 7.78 15.273 11.671 25.73 11.671Zm0 0"
      style={{
        stroke: "none",
        fillRule: "nonzero",
        fill: "#fff",
        fillOpacity: "1",
      }}
    />
  </svg>
);

function MockIntegrations() {
  const nodes: Array<{ Icon: ComponentType<SVGProps<SVGSVGElement>> }> = [
    { Icon: MicrosoftOutlook },
    { Icon: MicrosoftTeams },
    { Icon: MicrosoftWord },
    { Icon: MicrosoftExcel },
    { Icon: MicrosoftPowerPoint },
  ];
  return (
    <div className={cn(CARD_MOCK_BAND_SM, "items-center justify-center")}>
      <svg aria-hidden className="absolute inset-0 size-full text-muted-foreground/25">
        <line stroke="currentColor" strokeDasharray="3 4" strokeWidth="1" x1="50%" x2="14%" y1="50%" y2="24%" />
        <line stroke="currentColor" strokeDasharray="3 4" strokeWidth="1" x1="50%" x2="50%" y1="50%" y2="10%" />
        <line stroke="currentColor" strokeDasharray="3 4" strokeWidth="1" x1="50%" x2="86%" y1="50%" y2="24%" />
        <line stroke="currentColor" strokeDasharray="3 4" strokeWidth="1" x1="50%" x2="14%" y1="50%" y2="76%" />
        <line stroke="currentColor" strokeDasharray="3 4" strokeWidth="1" x1="50%" x2="86%" y1="50%" y2="76%" />
      </svg>
      <div className="relative z-1 flex flex-wrap items-center justify-center gap-3">
        <GradientOrb className="size-10 rounded-xl" />
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative size-[88%] max-w-[220px]">
          {nodes.map((n, i) => {
            const positions = [
              "left-[4%] top-[12%]",
              "left-1/2 top-[1%] -translate-x-1/2",
              "right-[4%] top-[12%]",
              "left-[4%] bottom-[12%]",
              "right-[4%] bottom-[12%]",
            ];
            const pos = positions[i] ?? "hidden";
            return (
              <div
                className={cn(
                  "absolute flex size-8 items-center justify-center rounded-lg border border-border/60 bg-background/95 shadow-sm",
                  pos
                )}
                key={i}
              >
                <n.Icon aria-hidden className="size-[18px] shrink-0" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProfilePhotoPlaceholder({ className, img = 12 }: { className?: string; img?: number }) {
  return (
    <Image
      alt=""
      aria-hidden
      className={cn("shrink-0 rounded-full object-cover ring-1 ring-foreground/10 dark:ring-white/15", className)}
      height={32}
      src={`https://i.pravatar.cc/128?img=${img}`}
      width={32}
    />
  );
}

function MockProfiles() {
  return (
    <div
      className={cn(
        CARD_MOCK_BAND_SM,
        "space-y-1.5 rounded-xl border border-border/60 bg-muted/15 p-2 sm:space-y-2 sm:p-2.5"
      )}
    >
      <div className="font-medium text-[9px] text-muted-foreground uppercase tracking-[0.14em]">Personas</div>
      <div className="flex gap-2 rounded-lg bg-background/80 p-2 shadow-sm">
        <ProfilePhotoPlaceholder className="size-8" img={47} />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="space-y-1">
            <div className="h-1.5 w-[45%] rounded-full bg-muted-foreground/12" />
            <div className="h-1 w-[32%] rounded-full bg-muted-foreground/10" />
          </div>
          <div className="text-[9px] text-foreground leading-snug">
            Voice: Warm, precise, results-led. Short paragraphs with calm authority and zero fluff.
          </div>
        </div>
      </div>
      <div className="pointer-events-none flex gap-2 rounded-lg bg-background/80 p-2 opacity-45 shadow-sm">
        <ProfilePhotoPlaceholder className="size-8" img={68} />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="h-1.5 w-[40%] rounded-full bg-muted-foreground/10" />
          <div className="text-[8px] text-muted-foreground/60 leading-snug">Warm, precise, results...</div>
        </div>
      </div>
    </div>
  );
}

function MockVisualIdentity() {
  return (
    <div
      className={cn(
        CARD_MOCK_BAND_SM,
        "space-y-2 rounded-xl border border-border/60 bg-muted/15 p-2 sm:space-y-2.5 sm:p-2.5"
      )}
    >
      <div className="flex flex-wrap gap-0 border-border/60 border-b">
        <div
          className="-mb-px flex items-center gap-1 border-transparent border-b-2 px-2 pb-1.5 text-[9px] text-muted-foreground"
          role="presentation"
        >
          Brand basics
        </div>
        <div className="-mb-px flex items-center gap-1 border-violet-500 border-b-2 px-2 pb-1.5 text-[9px] text-foreground">
          <Palette aria-hidden className="size-3 text-violet-600 dark:text-violet-400" strokeWidth={2} />
          Palette
        </div>
        <div
          className="-mb-px flex items-center gap-1 border-transparent border-b-2 px-2 pb-1.5 text-[9px] text-muted-foreground"
          role="presentation"
        >
          Type
        </div>
      </div>
      <div className="flex flex-wrap gap-4 pt-0.5">
        <div className="flex min-w-0 items-center gap-2">
          <div className="size-10 shrink-0 rounded-lg bg-linear-to-br from-violet-600 to-indigo-500 shadow-sm" />
          <div className="flex min-w-0 flex-col justify-center gap-1">
            <div className="h-1.5 rounded-full bg-muted-foreground/12" />
            <div className="h-1.5 w-[88%] rounded-full bg-muted-foreground/10" />
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <div className="size-10 shrink-0 rounded-lg bg-linear-to-br from-sky-400 to-cyan-300 shadow-sm" />
          <div className="flex min-w-0 flex-col justify-center gap-1">
            <div className="h-1.5 rounded-full bg-muted-foreground/12" />
            <div className="h-1.5 w-[82%] rounded-full bg-muted-foreground/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

function getVariants(reduced: boolean): { container: Variants; item: Variants } {
  if (reduced) {
    return {
      container: { hidden: {}, visible: { transition: { staggerChildren: 0.02 } } },
      item: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.25, ease: EASE_OUT } } },
    };
  }
  return {
    container: {
      hidden: {},
      visible: { transition: { staggerChildren: 0.07, delayChildren: 0.06 } },
    },
    item: {
      hidden: { opacity: 0, y: 14, filter: "blur(4px)" },
      visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.45, ease: [0.25, 0.4, 0.25, 1] },
      },
    },
  };
}

function HeaderBlock({ variants }: { variants: Variants }) {
  return (
    <motion.header
      className="mb-10 flex flex-col gap-6 lg:mb-14 lg:flex-row lg:items-end lg:justify-between lg:gap-10 xl:gap-14"
      variants={variants}
    >
      <div className="min-w-0 flex-1">
        <p className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-[0.2em]">
          Foundational toolkit
        </p>
        <h2 className="text-balance font-semibold text-3xl text-foreground tracking-tight sm:text-4xl lg:text-[3.5rem] lg:leading-[1.15]">
          <span className="text-foreground">
            Design, govern, and <br />
          </span>
          <span className="text-muted-foreground">scale your brand</span>
        </h2>
      </div>
      <div className="w-full shrink-0 lg:min-w-0 lg:max-w-lg lg:basis-2/5 xl:max-w-2xl">
        <p className="text-pretty text-muted-foreground text-xs leading-relaxed sm:text-sm">
          From messaging pillars and ICP clarity to palette choices and ongoing research, your assistant holds every
          brand decision—then surfaces it the moment teams write, design, or launch campaigns.
        </p>
      </div>
    </motion.header>
  );
}

export function MarketingBentoCoreCapabilities() {
  const ref = React.useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reducedMotion = useReducedMotion();
  const reduced = reducedMotion === true;
  const { container, item } = React.useMemo(() => getVariants(reduced), [reduced]);

  return (
    <section className="relative w-full bg-background px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24" ref={ref}>
      <div className="mx-auto max-w-6xl">
        <motion.div animate={inView ? "visible" : "hidden"} className="w-full" initial="hidden" variants={container}>
          <HeaderBlock variants={item} />

          <div className="space-y-4 rounded-4xl bg-muted p-5 lg:space-y-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
              <CardShell variants={item}>
                <MockKnowledgeBase />
                <CardHeading
                  subtitle="Unify voice, ideal customers, rivals, and value props in one living source your whole team trusts."
                  title="Organize Your Brand Library"
                />
              </CardShell>

              <CardShell variants={item}>
                <MockResearchChat />
                <CardHeading
                  subtitle="Pull competitive intel, persona detail, and trending signals—summarized by your assistant and ready to ship."
                  title="Run Deep Research"
                />
              </CardShell>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              <CardShell variants={item}>
                <MockIntegrations />
                <CardHeading
                  subtitle="Sync mail, files, and decks from Outlook, Teams, and the rest of Microsoft 365 for full context."
                  title="Plug In Your Favorite Apps"
                />
              </CardShell>
              <CardShell variants={item}>
                <MockProfiles />
                <CardHeading
                  subtitle="Document tone, pacing, and vocabulary so every draft hits the same brand note."
                  title="Lock In Your Tone of Voice"
                />
              </CardShell>
              <CardShell className="sm:col-span-2 lg:col-span-1" variants={item}>
                <MockVisualIdentity />
                <CardHeading
                  subtitle="Keep palettes, type, and imagery aligned everywhere campaigns and content appear."
                  title="Guard Your Visual Guidelines"
                />
              </CardShell>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
