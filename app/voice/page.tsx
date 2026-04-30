"use client";

import { ArrowRight, ArrowUpRight, Mic2, Lock, Eye, Search, Phone, Zap } from "lucide-react";
import type { Variants } from "motion/react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { useState } from "react";
import Image from "next/image";
import { NeuroNoise, GodRays } from "@paper-design/shaders-react";
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MarketingWaitlistMinimal } from "@/components/marketing-waitlist-minimal";
import {
  OrganicCard,
  OrganicCardBody,
  OrganicCardBand,
  OrganicCardEyebrow,
  OrganicCardTitle,
  OrganicCardDescription,
  OrganicCardFooter,
  OrganicCardFooterLabel,
  OrganicCardFooterIcon,
} from "@/components/organic-card";

// ── ElevenLabs branding (Startup Grants) ─────────────────────────
const EL_LOGO_DARK  = "https://eleven-public-cdn.elevenlabs.io/payloadcms/pwsc4vchsqt-ElevenLabsGrants.webp";
const EL_LOGO_LIGHT = "https://eleven-public-cdn.elevenlabs.io/payloadcms/cy7rxce8uki-IIElevenLabsGrants%201.webp";
const EL_HREF       = "https://elevenlabs.io/startup-grants";

// ── Design tokens ─────────────────────────────────────────────────
const SWIGGY      = "#FC8019";   // Swiggy orange — the color of the field
const SWIGGY_DEEP = "#a04000";   // deeper orange for mid-tone shader layer
const FIELD_BACK  = "#080300";   // near-black with warm undertone — Retilo dark
const AMBER       = "#FBA649";   // warm amber highlight
const CREAM       = "#FFEDCC";

// ── Hero layout constants (from cult-ui-pro) ──────────────────────
const CUTOUT_R = 48;
const HERO_SHELL_RADIUS = "rounded-bl-2xl lg:rounded-bl-3xl rounded-tr-2xl lg:rounded-tr-3xl";
const HERO_PAD           = "p-6 md:p-8 lg:p-10";
const HERO_PAD_PULL      = "-mt-6 -ml-6 md:-mt-8 md:-ml-8 lg:-mt-10 lg:-ml-10";
const HERO_PAD_TL        = "pt-6 pl-6 md:pt-8 md:pl-8 lg:pt-10 lg:pl-10";
const HERO_COL_XB        = "px-6 pb-6 md:px-8 md:pb-8 lg:px-10 lg:pb-10";
const HERO_HEADLINE_PB   = "pb-6 md:pb-8 lg:pb-10";
const HERO_PAGE_GUTTER   = "pt-6 pb-6 pl-6 md:pt-8 md:pb-8 md:pl-8 lg:pt-10 lg:pb-10 lg:pl-10";
const HERO_PAGE_GUTTER_R = "pr-4 md:pr-6 lg:pr-8";

const FOOTER_LINK_EASE = [0.23, 1, 0.32, 1] as const;

const PIPELINE_LINKS = [
  { href: "#gmb",      label: "GMB call intent" },
  { href: "#voice",    label: "ElevenLabs Voice AI" },
  { href: "#pipeline", label: "Order pipeline · ???" },
] as const;

// ── Corner cutout helpers ─────────────────────────────────────────
function cornerLight(at: string) {
  return `radial-gradient(circle at ${at}, transparent ${CUTOUT_R}px, white ${CUTOUT_R}px)`;
}

function CornerCutoutsTopLeft() {
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 z-0 h-12 w-12"
        style={{ background: cornerLight("bottom right"), transform: "translateY(100%) translateZ(0)" }} />
      <div aria-hidden className="pointer-events-none absolute top-0 right-0 z-0 h-12 w-12"
        style={{ background: cornerLight("bottom right"), transform: "translateX(100%) translateZ(0)" }} />
    </>
  );
}

function CornerCutoutsFooter() {
  return (
    <>
      <div className="pointer-events-none absolute top-0 right-0 z-0 h-12 w-12"
        style={{ background: cornerLight("top left"), transform: "translateY(-100%) translateZ(0)" }} />
      <div className="pointer-events-none absolute bottom-0 left-0 z-0 h-12 w-12"
        style={{ background: cornerLight("top left"), transform: "translateX(-100%) translateZ(0)" }} />
    </>
  );
}

// ── NeuroBackdrop — orange / Swiggy field ─────────────────────────
const MemoNeuroNoise = React.memo(NeuroNoise);

function SwiggyNeuroBackdrop({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn("relative flex min-h-0 flex-1 flex-col overflow-hidden", className)}
      style={{ backgroundColor: FIELD_BACK }}
    >
      {/* Neural noise — orange movement = ElevenLabs voice flowing through Retilo's cluster */}
      <MemoNeuroNoise
        brightness={0.44}
        className="pointer-events-none absolute inset-0 z-0"
        colorBack={FIELD_BACK}
        colorMid={SWIGGY_DEEP}
        colorFront={SWIGGY}
        contrast={0.48}
        height={720}
        rotation={22}
        scale={0.5}
        speed={1.2}
        style={{ width: "100%", height: "100%" }}
        width={1280}
      />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

// ── Top bar ───────────────────────────────────────────────────────
function HeroTopBar({ itemVariants, shouldReduceMotion }: { itemVariants: Variants; shouldReduceMotion: boolean | null }) {
  return (
    <div className="relative z-10 min-h-0 w-full flex-1 overflow-visible">
      <div className={cn("relative z-10 flex justify-between gap-4 text-base md:text-lg", HERO_PAD)}>
        {/* Product name panel with cutout corners */}
        <div className={cn("relative self-start rounded-br-3xl bg-white pr-5 pb-4", HERO_PAD_PULL, HERO_PAD_TL)}>
          <CornerCutoutsTopLeft />
          <motion.div
            animate="visible" initial="hidden"
            transition={{ delay: shouldReduceMotion ? 0 : 0.05 }}
            variants={itemVariants}
            className="relative z-10 font-medium text-neutral-900 leading-tight"
          >
            Retilo Voice
            <br />
            <span className="font-normal text-neutral-500">AI ordering infrastructure</span>
          </motion.div>
        </div>

        {/* ElevenLabs badge */}
        <a
          href={EL_HREF} target="_blank" rel="noopener noreferrer"
          className="hidden h-fit shrink-0 items-center gap-2 justify-center rounded-full px-4 py-2 text-sm font-medium backdrop-blur-sm transition-colors duration-200 md:inline-flex"
          style={{
            background: `${SWIGGY}1a`,
            border: `1px solid ${SWIGGY}35`,
            color: CREAM,
          }}
        >
          <span className="text-xs opacity-60">Powered by</span>
          <Image src={EL_LOGO_LIGHT} alt="ElevenLabs" width={80} height={18} className="h-4 w-auto object-contain" />
        </a>
      </div>
    </div>
  );
}

// ── Copy column ───────────────────────────────────────────────────
function HeroCopyColumn({
  containerVariants, itemVariants, wordVariants, shouldReduceMotion,
}: {
  containerVariants: Variants; itemVariants: Variants; wordVariants: Variants; shouldReduceMotion: boolean | null;
}) {
  const words = ["Restaurants", "get", "orders", "from", "phone", "calls."];

  return (
    <div className={cn("relative z-10 flex min-h-0 min-w-0 flex-1 flex-col text-left md:basis-[min(58%,32rem)] md:overflow-hidden lg:basis-[min(55%,36rem)]", HERO_COL_XB)}>
      <motion.div
        animate="visible" initial="hidden"
        transition={{ delay: shouldReduceMotion ? 0 : 0.08 }}
        variants={containerVariants}
        className="flex min-h-0 flex-1 flex-col"
      >
        {/* Badge */}
        <motion.div variants={itemVariants}>
          <span
            className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-medium text-xs tracking-wide backdrop-blur-sm"
            style={{
              borderColor: `${SWIGGY}35`,
              background: `${FIELD_BACK}70`,
              color: AMBER,
              boxShadow: `0 0 0 1px ${SWIGGY}22, 0 8px 28px ${SWIGGY_DEEP}25`,
            }}
          >
            <Mic2 className="h-3.5 w-3.5" style={{ color: SWIGGY }} />
            ElevenLabs · Voice AI · Swiggy MCP
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className={cn("relative max-w-[min(100%,48rem)] text-balance font-bold text-[#fff8f0] leading-[1.06] tracking-[-0.035em] [text-shadow:0_2px_28px_rgba(0,0,0,0.55)] text-[3rem] sm:text-[3.5rem] md:text-[4rem] lg:text-[4.5rem]", HERO_HEADLINE_PB)}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.055, delayChildren: shouldReduceMotion ? 0 : 0.04 } },
          }}
        >
          {words.map((word, i) => (
            <motion.span className="mr-[0.25em] inline-block last:mr-0" key={i} variants={wordVariants}>
              {word}
            </motion.span>
          ))}
        </motion.h1>

        {/* Body */}
        <motion.p
          className="-mt-2 mb-6 max-w-2xl text-pretty font-medium leading-relaxed text-lg [text-shadow:0_1px_18px_rgba(0,0,0,0.45)] sm:text-xl md:text-2xl"
          style={{ color: `${CREAM}99` }}
          variants={itemVariants}
        >
          GMB drives inbound calls → ElevenLabs AI handles the conversation → orders placed automatically.
          One pipeline. Zero missed revenue.
        </motion.p>

        {/* CTAs */}
        <motion.div className="mt-auto flex flex-col gap-3 sm:flex-row sm:gap-4" variants={itemVariants}>
          <motion.div
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
          >
            <a href="#waitlist">
              <Button
                className="rounded-full px-7 font-medium text-white"
                size="lg"
                style={{
                  background: SWIGGY,
                  boxShadow: `0 0 0 1px ${SWIGGY}55, 0 4px 28px ${SWIGGY}35, 0 6px 20px ${SWIGGY_DEEP}30`,
                }}
              >
                Request early access
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </motion.div>

          <motion.div
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
          >
            <Button
              className="rounded-full px-7 font-medium backdrop-blur-sm"
              size="lg"
              variant="outline"
              style={{
                border: `2px solid ${SWIGGY}55`,
                background: `${FIELD_BACK}60`,
                color: CREAM,
                boxShadow: `0 0 0 1px ${SWIGGY}18, 0 4px 24px rgba(0,0,0,0.35)`,
              }}
            >
              <Phone className="mr-2 h-4 w-4" /> Hear a demo call
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ── Footer panel — pipeline links ─────────────────────────────────
function HeroFooterPanel({ footerListVariants, footerLinkVariants }: { footerListVariants: Variants; footerLinkVariants: Variants }) {
  const shouldReduceMotion = useReducedMotion();

  const rowVariants: Variants = {
    rest: { x: 0 },
    hover: shouldReduceMotion ? { x: 0 } : { x: -4, transition: { duration: 0.2, ease: FOOTER_LINK_EASE } },
  };
  const washVariants: Variants = {
    rest: { opacity: 0 },
    hover: shouldReduceMotion ? { opacity: 0 } : { opacity: 1, transition: { duration: 0.2, ease: "easeOut" } },
  };
  const iconVariants: Variants = {
    rest: { rotate: 0, x: 0, y: 0 },
    hover: shouldReduceMotion ? {} : { rotate: -12, x: -1, y: -1, transition: { duration: 0.2, ease: FOOTER_LINK_EASE } },
  };

  return (
    <div className={cn("relative flex min-h-36 w-2/3 shrink-0 flex-col items-end justify-end self-end rounded-tl-3xl bg-white font-light text-base max-md:min-h-44 md:min-h-0 md:w-full md:min-w-[min(100%,15rem)] md:flex-1 md:text-lg", HERO_PAD)}>
      <CornerCutoutsFooter />
      <motion.ul
        animate="visible" initial="hidden"
        className="relative z-10 flex w-full flex-col items-end gap-2.5 opacity-75 transition-opacity duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:opacity-100 md:gap-3"
        variants={footerListVariants}
      >
        {PIPELINE_LINKS.map((link, i) => (
          <motion.li className="w-full max-w-md md:w-full md:max-w-sm" key={link.label} variants={footerLinkVariants}>
            <motion.a
              href={link.href}
              className={cn(
                "group relative flex w-full items-center justify-end gap-2.5 overflow-hidden rounded-xl py-2.5 pr-2 pl-3.5 outline-none ring-offset-2 ring-offset-white backdrop-blur-[2px]",
                "bg-white/55 text-neutral-900",
                "shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06),0px_2px_4px_0px_rgba(0,0,0,0.04)]",
                "transition-[box-shadow,background-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
                "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/80",
              )}
              style={{
                ["--tw-ring-color" as string]: `${SWIGGY}40`,
              }}
              initial="rest" whileHover="hover"
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98, transition: { duration: 0.12 } }}
              transition={{ type: "tween", duration: 0.2, ease: FOOTER_LINK_EASE }}
              variants={rowVariants}
            >
              <span aria-hidden className="w-6 shrink-0 text-right font-medium text-[10px] text-neutral-400 uppercase tabular-nums tracking-[0.14em]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="relative z-10 min-w-0 max-w-[min(100%,14rem)] flex-1 text-pretty text-right font-medium text-[0.95em] leading-snug tracking-tight md:text-base">
                {link.label}
              </span>
              <span
                aria-hidden
                className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-[10px]"
                style={{ color: SWIGGY, boxShadow: "0px 0px 0px 1px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.65)" }}
              >
                <motion.span
                  className="flex size-full items-center justify-center rounded-[9px] bg-linear-to-br from-neutral-100/95 to-white/90"
                  style={{ boxShadow: "0px 0px 0px 1px rgba(0,0,0,0.06), 0px 1px 2px -1px rgba(0,0,0,0.05)" }}
                  initial="rest" variants={iconVariants}
                >
                  <ArrowUpRight className="size-[15px] translate-x-[0.5px] translate-y-[-0.5px]" strokeWidth={2} />
                </motion.span>
              </span>
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0"
                initial="rest" variants={washVariants}
                style={{
                  background: `linear-gradient(115deg, transparent 40%, ${SWIGGY}0a 100%), radial-gradient(120% 80% at 100% 0%, ${SWIGGY}12, transparent 55%)`,
                }}
              />
            </motion.a>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// Below-hero sections
// ══════════════════════════════════════════════════════════════════

function GmbPreview() {
  const kws = [
    { kw: "pizza near me",         calls: 34, trend: "+18%" },
    { kw: "biryani home delivery", calls: 51, trend: "+27%" },
    { kw: "best burger Mumbai",    calls: 22, trend: "+9%"  },
  ];
  return (
    <div className="mt-5 space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <div className="size-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-[11px] font-semibold text-gray-500">Live call intent · Google Business</span>
      </div>
      {kws.map(r => (
        <div key={r.kw} className="flex items-center gap-3 rounded-xl px-3 py-2.5 border border-gray-100 bg-white">
          <Search className="size-3.5 shrink-0 text-gray-400" />
          <span className="flex-1 text-xs text-gray-700 font-medium">{r.kw}</span>
          <div className="text-right">
            <div className="text-xs font-bold text-gray-800">{r.calls} calls</div>
            <div className="text-[9px] font-semibold text-green-600">{r.trend}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function VoiceAgentPreview() {
  const lines = [
    { from: "Customer", text: "Hi, I want 2 paneer tikka rolls and a cold coffee." },
    { from: "AI",       text: "Got it! 2 Paneer Tikka Rolls + 1 Cold Coffee. Total ₹389. Placing your order now." },
  ];
  return (
    <div className="mt-5 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Mic2 className="size-3.5 text-amber-500" />
          <span className="text-[11px] font-semibold text-gray-500">Live call transcript</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="size-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] text-gray-400">Recording</span>
        </div>
      </div>
      {lines.map(l => (
        <div key={l.text} className={`flex ${l.from === "AI" ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[11px] leading-snug ${
              l.from === "AI" ? "text-white rounded-tr-sm" : "bg-white border border-gray-100 text-gray-700 rounded-tl-sm"
            }`}
            style={l.from === "AI" ? { background: SWIGGY } : {}}
          >
            <span className="block mb-1 text-[9px] font-bold opacity-50">{l.from}</span>
            {l.text}
          </div>
        </div>
      ))}
      <a href={EL_HREF} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 hover:text-gray-600 transition-colors pt-1"
      >
        Voice powered by
        <Image src={EL_LOGO_DARK} alt="ElevenLabs" width={72} height={18} className="h-4 w-auto object-contain opacity-60" />
      </a>
    </div>
  );
}

const MemoGodRays = React.memo(GodRays);

function SwiggyRevealCard() {
  const [revealed, setRevealed] = useState(false);

  return (
    <div
      className="relative rounded-2xl overflow-hidden mt-5 min-h-[220px] cursor-pointer select-none"
      style={{ border: `1px solid ${SWIGGY}30` }}
      onClick={() => !revealed && setRevealed(true)}
    >
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="locked"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {/* Hyperspace tunnel — Swiggy orange god rays */}
            <MemoGodRays
              bloom={0.55}
              className="absolute inset-0"
              colorBack="#070200"
              colorBloom="#7a2800"
              colors={[SWIGGY, "#FBA649", "#ffffff"]}
              density={0.5}
              intensity={0.88}
              midIntensity={0.42}
              midSize={0.32}
              offsetX={0}
              offsetY={0}
              speed={2.2}
              spotty={0.18}
              style={{ width: "100%", height: "100%" }}
            />

            {/* Vignette to ground the UI elements */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 30%, rgba(7,2,0,0.65) 100%)" }}
            />

            {/* Content */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
              {/* Lock with pulse rings */}
              <div className="relative flex items-center justify-center">
                <motion.div
                  className="absolute rounded-2xl"
                  style={{ width: 48, height: 48, background: SWIGGY }}
                  animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute rounded-2xl"
                  style={{ width: 48, height: 48, background: SWIGGY }}
                  animate={{ scale: [1, 1.7], opacity: [0.3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
                />
                <div
                  className="relative size-12 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `${SWIGGY}35`,
                    border: `1.5px solid ${SWIGGY}80`,
                    backdropFilter: "blur(6px)",
                    boxShadow: `0 0 20px ${SWIGGY}60`,
                  }}
                >
                  <Lock className="size-5 text-white" />
                </div>
              </div>

              <div className="text-center">
                <p className="text-white text-xs font-bold tracking-wide" style={{ textShadow: "0 1px 12px rgba(0,0,0,0.8)" }}>
                  Order destination
                </p>
                <p className="text-white/50 text-[10px] mt-0.5">Something big is loading…</p>
              </div>

              {/* CTA pill — bounces + glows */}
              <motion.div
                animate={{
                  y: [0, -7, 0],
                  boxShadow: [
                    `0 0 14px ${SWIGGY}55, 0 0 4px ${SWIGGY}30`,
                    `0 0 32px ${SWIGGY}99, 0 0 12px ${SWIGGY}60`,
                    `0 0 14px ${SWIGGY}55, 0 0 4px ${SWIGGY}30`,
                  ],
                }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center gap-2 rounded-full px-4 py-2"
                style={{
                  background: `${SWIGGY}28`,
                  border: `1.5px solid ${SWIGGY}88`,
                  backdropFilter: "blur(8px)",
                }}
              >
                <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}>
                  <Eye className="size-3.5 text-white" />
                </motion.span>
                <span className="text-[11px] font-bold text-white tracking-wide">Click to reveal</span>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5"
            style={{ background: `${SWIGGY}08` }}
          >
            <div
              className="size-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl"
              style={{ background: SWIGGY, boxShadow: `0 4px 20px ${SWIGGY}50` }}
            >
              S
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-800 text-sm">Swiggy Integration</p>
              <p className="text-gray-500 text-xs mt-1">AI places verified orders on Swiggy — straight from the call.</p>
            </div>
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold text-white"
              style={{ background: SWIGGY }}
            >
              <Zap className="size-3" /> Cooking — stay tuned
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const CARDS = [
  {
    bg: "#f9fafb", eyebrow: "GMB Intelligence", accentColor: "#4285F4",
    title: "Turn search into inbound calls",
    description: "Retilo tracks which keywords on Google are driving call intent to restaurants near you. Optimise your Business Profile so you rank for searches that convert.",
    preview: <GmbPreview />,
    footer: "See keyword dashboard",
  },
  {
    bg: "#f9fafb", eyebrow: "ElevenLabs Voice AI", accentColor: "#111",
    title: "An AI that sounds human — and takes orders",
    description: "Powered by ElevenLabs, the agent handles every inbound call — understands the order, upsells naturally, and confirms in real time. No hold music, no missed calls.",
    preview: <VoiceAgentPreview />,
    footer: "Hear a live demo",
  },
  {
    bg: "#f9fafb", eyebrow: "Order Destination · Reveal", accentColor: SWIGGY,
    title: "Where every call lands — coming soon",
    description: "We're integrating the final piece of the pipeline. Orders placed through the AI flow directly into the restaurant's system — frictionless, verified, tracked.",
    preview: <SwiggyRevealCard />,
    footer: "Stay tuned",
  },
];

// ══════════════════════════════════════════════════════════════════
// Page
// ══════════════════════════════════════════════════════════════════
export default function SwiggyPromoPage() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: shouldReduceMotion ? 0 : 0.1, delayChildren: shouldReduceMotion ? 0 : 0.22 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, transform: shouldReduceMotion ? "translate3d(0,0,0)" : "translate3d(0,20px,0)", filter: shouldReduceMotion ? "blur(0px)" : "blur(3px)" },
    visible: { opacity: 1, transform: "translate3d(0,0,0)", filter: "blur(0px)", transition: { type: "spring", bounce: 0.06, duration: 0.58 } },
  };

  const wordVariants: Variants = {
    hidden: { opacity: 0, transform: shouldReduceMotion ? "translate3d(0,0,0)" : "translate3d(0,14px,0)", filter: shouldReduceMotion ? "blur(0px)" : "blur(4px)" },
    visible: { opacity: 1, transform: "translate3d(0,0,0)", filter: "blur(0px)", transition: { type: "spring", bounce: 0.05, duration: 0.62 } },
  };

  const footerListVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.06, delayChildren: shouldReduceMotion ? 0 : 0.12 } },
  };

  const footerLinkVariants: Variants = {
    hidden: { opacity: 0, transform: shouldReduceMotion ? "translate3d(0,0,0)" : "translate3d(14px,0,0) scale(0.97)" },
    visible: { opacity: 1, transform: "translate3d(0,0,0) scale(1)", transition: { type: "spring", bounce: 0.08, duration: 0.52 } },
  };

  return (
    <div className={cn("box-border flex min-h-dvh flex-col overflow-hidden bg-white antialiased", HERO_PAGE_GUTTER, HERO_PAGE_GUTTER_R)}>

      {/* ── Neuro Hero ── */}
      <div className={cn("relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#080300]", HERO_SHELL_RADIUS)}>
        <SwiggyNeuroBackdrop className={cn("w-full", HERO_SHELL_RADIUS)}>
          <div className="relative z-20 flex min-h-0 w-full flex-1 flex-col">
            <HeroTopBar itemVariants={itemVariants} shouldReduceMotion={shouldReduceMotion} />
            <div className="flex min-h-0 flex-col items-stretch md:flex-1 md:flex-row">
              <HeroCopyColumn
                containerVariants={containerVariants}
                itemVariants={itemVariants}
                wordVariants={wordVariants}
                shouldReduceMotion={shouldReduceMotion}
              />
              <HeroFooterPanel footerListVariants={footerListVariants} footerLinkVariants={footerLinkVariants} />
            </div>
          </div>
        </SwiggyNeuroBackdrop>
      </div>

      {/* ── Stat strip ── */}
      <div className="border-b border-gray-100 py-8 px-4">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { stat: "3×",   label: "more inbound calls",  sub: "vs un-optimised GMB" },
            { stat: "24/7", label: "AI call coverage",    sub: "no staff needed after hours" },
            { stat: "< 2s", label: "order confirmed",     sub: "from end of call" },
          ].map(s => (
            <div key={s.stat}>
              <div className="text-3xl font-black tracking-tight" style={{ color: SWIGGY }}>{s.stat}</div>
              <div className="text-xs font-semibold text-gray-700 mt-0.5">{s.label}</div>
              <div className="text-[10px] text-gray-400">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Capability cards ── */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">The full stack</p>
            <h2 className="text-3xl font-black tracking-tight text-gray-900" style={{ letterSpacing: "-0.03em" }}>
              Every layer, built for restaurants
            </h2>
          </div>

          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
              <OrganicCard backgroundColor={CARDS[0].bg} className="max-w-full">
                <OrganicCardBody>
                  <div>
                    <OrganicCardEyebrow className="opacity-100" style={{ color: CARDS[0].accentColor, animationDelay: "0ms" }}>{CARDS[0].eyebrow}</OrganicCardEyebrow>
                    <OrganicCardTitle className="opacity-100" style={{ animationDelay: "0ms" }}>{CARDS[0].title}</OrganicCardTitle>
                    <OrganicCardDescription className="opacity-100" style={{ animationDelay: "0ms" }}>{CARDS[0].description}</OrganicCardDescription>
                  </div>
                  {CARDS[0].preview}
                </OrganicCardBody>
                <OrganicCardBand />
                <OrganicCardFooter>
                  <OrganicCardFooterLabel className="opacity-100" style={{ animationDelay: "0ms" }}>{CARDS[0].footer}</OrganicCardFooterLabel>
                  <OrganicCardFooterIcon className="opacity-100" style={{ background: "#111", animationDelay: "0ms" }} />
                </OrganicCardFooter>
              </OrganicCard>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {CARDS.slice(1).map((card, i) => (
                <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.1 }}>
                  <OrganicCard backgroundColor={card.bg} className="max-w-full">
                    <OrganicCardBody>
                      <div>
                        <OrganicCardEyebrow className="opacity-100" style={{ color: card.accentColor, animationDelay: "0ms" }}>{card.eyebrow}</OrganicCardEyebrow>
                        <OrganicCardTitle className="opacity-100" style={{ animationDelay: "0ms" }}>{card.title}</OrganicCardTitle>
                        <OrganicCardDescription className="opacity-100" style={{ animationDelay: "0ms" }}>{card.description}</OrganicCardDescription>
                      </div>
                      {card.preview}
                    </OrganicCardBody>
                    <OrganicCardBand />
                    <OrganicCardFooter>
                      <OrganicCardFooterLabel className="opacity-100" style={{ animationDelay: "0ms" }}>{card.footer}</OrganicCardFooterLabel>
                      <OrganicCardFooterIcon className="opacity-100" style={{ background: card.accentColor, animationDelay: "0ms" }} />
                    </OrganicCardFooter>
                  </OrganicCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ElevenLabs partnership band ── */}
      <div className="py-10 px-4 border-y" style={{ background: FIELD_BACK, borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: `${AMBER}70` }}>
            Voice infrastructure partner
          </p>
          <a href={EL_HREF} target="_blank" rel="noopener noreferrer" className="inline-block transition-opacity hover:opacity-80">
            <Image src={EL_LOGO_LIGHT} alt="ElevenLabs" width={180} height={40} className="h-8 w-auto object-contain mx-auto" />
          </a>
          <p className="mt-4 text-xs leading-relaxed" style={{ color: "rgba(255,237,204,0.45)" }}>
            Retilo Voice is part of the ElevenLabs Startup Grants Program.
            Every call is handled by their industry-leading conversational AI.
          </p>
        </div>
      </div>

      {/* ── Waitlist ── */}
      <section id="waitlist" className="px-4 py-20 bg-white">
        <div className="max-w-lg mx-auto">
          <div className="rounded-3xl border border-gray-100 bg-gray-50/60 p-10">
            <MarketingWaitlistMinimal
              headline="Get early access"
              subtext="We're onboarding restaurants in batches. Drop your email — we'll reach out when your slot opens."
              placeholder="hello@yourrestaurant.com"
              buttonLabel="Request access"
              successMessage="You're in — we'll be in touch soon!"
              accentColor={SWIGGY}
              count={89}
            />
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t px-6 py-6 text-center" style={{ borderColor: "rgba(255,255,255,0.06)", background: FIELD_BACK }}>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <p className="text-xs" style={{ color: "rgba(255,237,204,0.35)" }}>
            <span className="font-bold" style={{ color: `${CREAM}70` }}>Retilo Voice</span>
            {" "}· AI calling infrastructure for restaurants
          </p>
          <span className="hidden sm:block text-white/10">·</span>
          <a href={EL_HREF} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 transition-opacity hover:opacity-80">
            <span className="text-[10px]" style={{ color: "rgba(255,237,204,0.3)" }}>Voice by</span>
            <Image src={EL_LOGO_LIGHT} alt="ElevenLabs" width={70} height={16} className="h-3.5 w-auto object-contain opacity-50" />
          </a>
        </div>
      </footer>

    </div>
  );
}
