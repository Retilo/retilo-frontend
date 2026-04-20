"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type ButtonHTMLAttributes, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const LABEL_STAGGER_SEC = 0.018;
const LABEL_CHAR_DURATION_SEC = 0.16;
const DEFAULT_LOADING_STAGGER_SEC = 0.038;
const DEFAULT_LOADING_CHAR_DURATION_SEC = 0.36;
const TRAILING_EXIT_DURATION_SEC = 0.2;

const layoutSpring = { type: "spring" as const, bounce: 0.12, damping: 34, stiffness: 420 };

function ButtonSpinner({ className, reduceMotion }: { className?: string; reduceMotion: boolean }) {
  return (
    <span className={cn("inline-flex origin-center text-muted-foreground", !reduceMotion && "animate-spin", className)}>
      <svg aria-hidden className="h-3.5 w-3.5" focusable="false" viewBox="0 0 24 24">
        <circle className="opacity-[0.22]" cx="12" cy="12" fill="none" r="9" stroke="currentColor" strokeWidth="2.25" />
        <circle cx="12" cy="12" fill="none" r="9" stroke="currentColor" strokeDasharray="14 42" strokeLinecap="round" strokeWidth="2.25" />
      </svg>
    </span>
  );
}

function StaggeredTextLabel({ text, reduceMotion, staggerSec = LABEL_STAGGER_SEC, charDurationSec = LABEL_CHAR_DURATION_SEC }: { text: string; reduceMotion: boolean; staggerSec?: number; charDurationSec?: number }) {
  const chars = useMemo(() => {
    const counts = new Map<string, number>();
    return Array.from(text, (char) => {
      const count = counts.get(char) ?? 0;
      counts.set(char, count + 1);
      return { char, key: `${char}-${count}` };
    });
  }, [text]);

  return (
    <motion.span animate="visible" className="inline-flex items-center font-medium text-foreground text-sm tracking-tight antialiased" initial="hidden" key={text} variants={{ hidden: {}, visible: { transition: { staggerChildren: reduceMotion ? 0 : staggerSec } } }}>
      {chars.map((glyph) => (
        <motion.span className="inline-block whitespace-pre" key={glyph.key} transition={{ duration: reduceMotion ? 0 : charDurationSec, ease: "easeOut" }} variants={{ hidden: { opacity: reduceMotion ? 1 : 0 }, visible: { opacity: 1 } }}>
          {glyph.char}
        </motion.span>
      ))}
    </motion.span>
  );
}

function TrailingLoadingSlot({ reduceMotion, reveal }: { reduceMotion: boolean; reveal: boolean }) {
  return (
    <motion.div
      animate={reveal ? { opacity: 1, scale: 1 } : { opacity: 0, scale: reduceMotion ? 1 : 0.88 }}
      aria-hidden
      className={cn("absolute inset-0 flex items-center justify-center rounded-full", "pointer-events-none bg-muted text-muted-foreground shadow-foreground/10 shadow-sm ring-1 ring-foreground/10")}
      exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.88, transition: { duration: reduceMotion ? 0 : TRAILING_EXIT_DURATION_SEC, ease: "easeOut" } }}
      initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.88 }}
      key="trailing-loading"
      transition={reduceMotion ? { duration: 0 } : reveal ? { ...layoutSpring } : { duration: 0 }}
    >
      <ButtonSpinner reduceMotion={reduceMotion} />
    </motion.div>
  );
}

export interface AnimatedButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children: ReactNode;
  translucent?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  loadingStaggerSec?: number;
  loadingCharDurationSec?: number;
  staggerLabel?: boolean;
  className?: string;
}

export function AnimatedButton({
  children, className, translucent = true, isLoading = false, loadingText = "Working…",
  loadingStaggerSec = DEFAULT_LOADING_STAGGER_SEC, loadingCharDurationSec = DEFAULT_LOADING_CHAR_DURATION_SEC,
  staggerLabel = true, disabled, onFocus, onBlur, onMouseEnter, onMouseLeave, style, ...props
}: AnimatedButtonProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [trailingRevealReady, setTrailingRevealReady] = useState(false);
  const reduceMotion = useReducedMotion() ?? false;
  const isLoadingRef = useRef(isLoading);
  isLoadingRef.current = isLoading;

  useEffect(() => {
    if (!isLoading) { setTrailingRevealReady(false); return; }
    if (reduceMotion) setTrailingRevealReady(true);
  }, [isLoading, reduceMotion]);

  useEffect(() => {
    if (!isLoading || reduceMotion) return;
    const id = window.setTimeout(() => setTrailingRevealReady(true), 480);
    return () => window.clearTimeout(id);
  }, [isLoading, reduceMotion]);

  const hoverAllowed = !(disabled || isLoading);
  const rimEmphasis = isFocused || (isHovered && hoverAllowed);

  const borderGlow = useMemo(() => {
    const idleOpacity = translucent ? (rimEmphasis ? 0.92 : 0.72) : (rimEmphasis ? 0.78 : 0.5);
    return {
      opacityIdle: idleOpacity,
      primaryBg: "linear-gradient(90deg, #ff0080, #7928ca, #00d4ff, #0070f3)",
      secondaryBg: "linear-gradient(90deg, #ff4d4d, #f9cb28, #ff0080)",
      tertiaryBg: "linear-gradient(90deg, #0070f3, #00d4ff, #7928ca)",
      primaryLeft: ["-5%", "75%", "-5%"] as [string, string, string],
      secondaryLeft: ["65%", "10%", "65%"] as [string, string, string],
      tertiaryLeft: ["25%", "55%", "25%"] as [string, string, string],
    };
  }, [translucent, rimEmphasis]);

  const labelContent = (() => {
    if (isLoading) {
      if (staggerLabel) return <StaggeredTextLabel charDurationSec={loadingCharDurationSec} reduceMotion={reduceMotion} staggerSec={loadingStaggerSec} text={loadingText} />;
      return <span className="font-medium text-foreground text-sm tracking-tight antialiased">{loadingText}</span>;
    }
    if (typeof children === "string" && staggerLabel) return <StaggeredTextLabel reduceMotion={reduceMotion} text={children} />;
    return <span className="font-medium text-foreground text-sm tracking-tight antialiased">{children}</span>;
  })();

  const fillBackground = translucent
    ? isHovered && hoverAllowed ? "linear-gradient(to bottom, color-mix(in oklch, var(--card) 88%, transparent) 0%, color-mix(in oklch, var(--card) 74%, transparent) 100%)" : "linear-gradient(to bottom, color-mix(in oklch, var(--card) 82%, transparent) 0%, color-mix(in oklch, var(--card) 70%, transparent) 100%)"
    : isHovered && hoverAllowed ? "linear-gradient(to bottom, var(--card) 0%, color-mix(in oklch, var(--card) 90%, var(--muted)) 100%)" : "linear-gradient(to bottom, var(--card) 0%, color-mix(in oklch, var(--card) 94%, var(--muted)) 100%)";

  return (
    <motion.div
      className={cn("relative inline-flex max-w-full", className)}
      layout={!reduceMotion}
      transition={reduceMotion ? undefined : { layout: layoutSpring }}
      onLayoutAnimationComplete={() => { if (isLoadingRef.current && !reduceMotion) setTrailingRevealReady(true); }}
    >
      <div className="relative rounded-full p-px">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
          <motion.div animate={{ opacity: borderGlow.opacityIdle }} className="absolute inset-x-0 bottom-0 h-1/2" transition={{ duration: 0.25, ease: "easeOut" }}>
            <motion.div animate={{ left: borderGlow.primaryLeft }} className="-bottom-4 absolute h-16 w-48 blur-xl" style={{ background: borderGlow.primaryBg }} transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }} />
            <motion.div animate={{ left: borderGlow.secondaryLeft }} className="-bottom-3 absolute h-12 w-32 blur-lg" style={{ background: borderGlow.secondaryBg }} transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }} />
            <motion.div animate={{ left: borderGlow.tertiaryLeft }} className="-bottom-2 absolute h-10 w-24 blur-lg" style={{ background: borderGlow.tertiaryBg }} transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }} />
          </motion.div>
        </div>

        <button
          aria-busy={isLoading || undefined}
          className={cn(
            "relative flex min-h-11 min-w-0 select-none items-center gap-2.5 rounded-full px-6 py-2.5",
            "border border-border/90",
            "shadow-[0_1px_0_rgba(255,255,255,0.1)_inset,0_1px_2px_rgba(0,0,0,0.04),0_4px_14px_rgba(0,0,0,0.05)]",
            "outline-none focus-visible:border-ring/70 focus-visible:ring-2 focus-visible:ring-ring/30",
            "transition-[transform,background-color,backdrop-filter,border-color,box-shadow] duration-200 ease-out",
            "hover:border-ring/50 hover:shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_2px_6px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.08)]",
            "active:scale-[0.96] motion-reduce:active:scale-100",
            "disabled:pointer-events-none disabled:opacity-50",
            translucent && "backdrop-blur-xl backdrop-saturate-150"
          )}
          disabled={disabled || isLoading}
          onBlur={(e) => { setIsFocused(false); onBlur?.(e); }}
          onFocus={(e) => { setIsFocused(true); onFocus?.(e); }}
          onMouseEnter={(e) => { setIsHovered(true); onMouseEnter?.(e); }}
          onMouseLeave={(e) => { setIsHovered(false); onMouseLeave?.(e); }}
          style={{ ...style, background: fillBackground }}
          type="button"
          {...props}
        >
          <span className="flex min-w-0 flex-1 items-center justify-center gap-2">{labelContent}</span>
          {isLoading ? (
            <div className="relative size-7 shrink-0">
              <AnimatePresence initial={false} mode="popLayout">
                <TrailingLoadingSlot reduceMotion={reduceMotion} reveal={trailingRevealReady} />
              </AnimatePresence>
            </div>
          ) : null}
        </button>
      </div>
    </motion.div>
  );
}
