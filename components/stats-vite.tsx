"use client";

import {
  type HTMLMotionProps,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import * as React from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Animation variants (matching hero-vite / social-proof-vite vocabulary)
// ---------------------------------------------------------------------------

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const wordVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
};

const statsGridVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const statCardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 24,
    },
  },
};

const trendBadgeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      delay: 0.3,
    },
  },
};

// ---------------------------------------------------------------------------
// Animated text helpers
// ---------------------------------------------------------------------------

function AnimatedWords({ children, className }: { children: string; className?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const words = children.split(" ");

  return (
    <motion.span
      animate={isInView ? "visible" : "hidden"}
      className={cn("inline-flex flex-wrap", className)}
      initial="hidden"
      ref={ref}
      variants={containerVariants}
    >
      {words.map((word, index) => (
        <motion.span className="mr-[0.25em] inline-block" key={index} variants={wordVariants}>
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

// ---------------------------------------------------------------------------
// Animated counter (useMotionValue for 0-rerender counting)
// ---------------------------------------------------------------------------

function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
  decimals = 0,
  className,
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const shouldReduceMotion = useReducedMotion();
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 80, damping: 30 });
  const display = useTransform(spring, (v) => {
    if (decimals > 0) {
      return `${prefix}${v.toFixed(decimals)}${suffix}`;
    }
    const rounded = Math.round(v);
    if (target >= 1_000_000) {
      return `${prefix}${(rounded / 1_000_000).toFixed(rounded >= 1_000_000 ? 1 : 0)}M${suffix}`;
    }
    if (target >= 1000) {
      return `${prefix}${(rounded / 1000).toFixed(rounded >= 1000 ? 1 : 0)}k${suffix}`;
    }
    return `${prefix}${rounded.toLocaleString()}${suffix}`;
  });

  React.useEffect(() => {
    if (!isInView) {
      return;
    }
    if (shouldReduceMotion) {
      motionVal.jump(target);
    } else {
      motionVal.set(target);
    }
  }, [isInView, motionVal, target, shouldReduceMotion]);

  return (
    <motion.span className={cn("tabular-nums", className)} ref={ref}>
      {display}
    </motion.span>
  );
}

// ---------------------------------------------------------------------------
// Trend arrow icons (embedded SVG)
// ---------------------------------------------------------------------------

function TrendUpIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={cn("size-3.5", className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 16 16"
      {...props}
    >
      <path d="M3 12l5-5 2.5 2.5L14 4" />
      <path d="M10 4h4v4" />
    </svg>
  );
}

function TrendDownIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={cn("size-3.5", className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 16 16"
      {...props}
    >
      <path d="M3 4l5 5 2.5-2.5L14 12" />
      <path d="M10 12h4v-4" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StatItem {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  description?: string;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  accentColor?: string;
}

export interface StatsViteRootProps extends Omit<React.ComponentPropsWithoutRef<"section">, "title"> {
  srTitle?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  stats?: StatItem[];
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface StatsViteContextValue {
  srTitle: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  description: React.ReactNode;
  stats: StatItem[];
}

const StatsViteContext = React.createContext<StatsViteContextValue | undefined>(undefined);

function useStatsViteContext() {
  const ctx = React.useContext(StatsViteContext);
  if (!ctx) {
    throw new Error("StatsVite components must be used within StatsViteRoot");
  }
  return ctx;
}

export function useStatsVite() {
  return useStatsViteContext();
}

// ---------------------------------------------------------------------------
// Default data
// ---------------------------------------------------------------------------

const VITE_COLORS = ["#ed40b3", "#6ef7cc", "#adfa1e", "#b054de"] as const;

const defaultStats: StatItem[] = [
  {
    value: 99.9,
    label: "Uptime",
    suffix: "%",
    decimals: 1,
    description: "Enterprise-grade reliability across all services",
    trend: { value: "+0.2%", direction: "up" },
    accentColor: VITE_COLORS[0],
  },
  {
    value: 48_000,
    label: "Active Developers",
    suffix: "+",
    description: "Building with our component library daily",
    trend: { value: "+12%", direction: "up" },
    accentColor: VITE_COLORS[1],
  },
  {
    value: 2.4,
    label: "Faster Shipping",
    suffix: "x",
    decimals: 1,
    description: "Average team velocity improvement",
    trend: { value: "+0.3x", direction: "up" },
    accentColor: VITE_COLORS[2],
  },
  {
    value: 12_000_000,
    label: "Components Rendered",
    suffix: "+",
    description: "Across production applications worldwide",
    trend: { value: "+34%", direction: "up" },
    accentColor: VITE_COLORS[3],
  },
];

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export const StatsViteRoot = React.forwardRef<HTMLElement, StatsViteRootProps>(
  (
    {
      className,
      children,
      srTitle = "Performance metrics",
      title = "Built for scale",
      subtitle = "proven in production",
      description = "Our components power thousands of applications with enterprise-grade reliability, developer experience, and performance.",
      stats = defaultStats,
      ...props
    },
    ref
  ) => {
    const contextValue = React.useMemo<StatsViteContextValue>(
      () => ({ srTitle, title, subtitle, description, stats }),
      [srTitle, title, subtitle, description, stats]
    );

    return (
      <StatsViteContext.Provider value={contextValue}>
        <section
          className={cn(
            "relative w-full overflow-hidden border border-zinc-200 bg-zinc-50",
            "dark:border-zinc-800 dark:bg-zinc-950",
            className
          )}
          data-slot="stats-vite-root"
          ref={ref}
          {...props}
        >
          <h2 className="sr-only">{srTitle}</h2>
          {children}
        </section>
      </StatsViteContext.Provider>
    );
  }
);
StatsViteRoot.displayName = "StatsViteRoot";

// ---------------------------------------------------------------------------
// Background (subtle Vite-color gradient)
// ---------------------------------------------------------------------------

export function StatsViteBackground({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
      data-slot="stats-vite-background"
      {...props}
    >
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(168,85,247,0.12), transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(34,211,238,0.10), transparent 50%),
            linear-gradient(180deg, #f4f4f5 0%, #e4e4e7 100%)
          `,
        }}
      />
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(168,85,247,0.22), transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(34,211,238,0.18), transparent 50%),
            linear-gradient(180deg, #0d0f17 0%, #0b0d14 100%)
          `,
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Container
// ---------------------------------------------------------------------------

export function StatsViteContainer({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("relative z-10 flex flex-col gap-6 px-8 py-12 sm:px-12 sm:py-16 lg:py-20", className)}
      data-slot="stats-vite-container"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Heading
// ---------------------------------------------------------------------------

export interface StatsViteHeadingProps extends Omit<React.ComponentPropsWithoutRef<"div">, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  eyebrow?: string;
  headingClassName?: string;
}

export function StatsViteHeading({
  className,
  title,
  subtitle,
  eyebrow = "Metrics",
  headingClassName,
  children,
  ...props
}: StatsViteHeadingProps) {
  const context = useStatsViteContext();
  const resolvedTitle = title ?? context.title;
  const resolvedSubtitle = subtitle ?? context.subtitle;

  return (
    <div className={cn("space-y-4", className)} data-slot="stats-vite-heading-wrap" {...props}>
      {children ?? (
        <>
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.16em] dark:text-zinc-400">
            {eyebrow}
          </span>
          <div
            aria-hidden="true"
            className={cn(
              "max-w-[28rem] text-balance font-semibold text-4xl text-zinc-950 tracking-tight sm:text-5xl lg:text-6xl dark:text-zinc-50",
              headingClassName
            )}
            data-slot="stats-vite-heading"
          >
            {typeof resolvedTitle === "string" ? <AnimatedWords>{resolvedTitle}</AnimatedWords> : resolvedTitle}
            <br className="hidden sm:block" />
            {resolvedSubtitle && (
              <span className="text-zinc-500 dark:text-zinc-400">
                {" "}
                {typeof resolvedSubtitle === "string" ? (
                  <AnimatedWords>{resolvedSubtitle}</AnimatedWords>
                ) : (
                  resolvedSubtitle
                )}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Description
// ---------------------------------------------------------------------------

export interface StatsViteDescriptionProps extends HTMLMotionProps<"div"> {
  description?: React.ReactNode;
  descriptionClassName?: string;
}

export function StatsViteDescription({
  className,
  description,
  descriptionClassName,
  children,
  ...props
}: StatsViteDescriptionProps) {
  const context = useStatsViteContext();
  const resolvedDescription = description ?? context.description;
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      className={cn("max-w-[26rem]", className)}
      data-slot="stats-vite-description-wrap"
      initial={{ opacity: 0, y: 16 }}
      ref={ref}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
      {...props}
    >
      {children ?? (
        <p
          className={cn("text-pretty text-lg text-zinc-600 dark:text-zinc-300", descriptionClassName)}
          data-slot="stats-vite-description"
        >
          {resolvedDescription}
        </p>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Grid
// ---------------------------------------------------------------------------

export interface StatsViteGridProps extends HTMLMotionProps<"div"> {
  stats?: StatItem[];
}

export function StatsViteGrid({ className, stats, children, ...props }: StatsViteGridProps) {
  const context = useStatsViteContext();
  const resolvedStats = stats ?? context.stats;
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      animate={isInView ? "visible" : "hidden"}
      className={cn(
        "grid grid-cols-1 border-zinc-200 border-t sm:grid-cols-2 lg:grid-cols-4 dark:border-zinc-800",
        className
      )}
      data-slot="stats-vite-grid"
      initial="hidden"
      ref={ref}
      variants={statsGridVariants}
      {...props}
    >
      {children ??
        resolvedStats.map((stat, index) => (
          <StatsViteCard index={index} key={stat.label} stat={stat} total={resolvedStats.length} />
        ))}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

export interface StatsViteCardProps extends HTMLMotionProps<"div"> {
  stat: StatItem;
  index?: number;
  total?: number;
}

export function StatsViteCard({ className, stat, index = 0, total = 4, ...props }: StatsViteCardProps) {
  return (
    <motion.div
      className={cn(
        "group relative flex flex-col justify-between gap-6 bg-white/85 p-6 backdrop-blur sm:p-8",
        "dark:bg-zinc-950/70",
        "border-zinc-200 border-b dark:border-zinc-800",
        "[&:nth-child(odd)]:sm:border-r",
        "lg:border-r lg:border-b-0 lg:[&:last-child]:border-r-0",
        className
      )}
      data-slot="stats-vite-card"
      variants={statCardVariants}
      {...props}
    >
      <div className="space-y-4">
        <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.16em] dark:text-zinc-400">
          {stat.label}
        </span>

        <div className="flex items-end justify-between gap-3">
          <span className="font-semibold text-4xl text-zinc-950 tracking-tight sm:text-5xl dark:text-zinc-50">
            <AnimatedCounter decimals={stat.decimals} prefix={stat.prefix} suffix={stat.suffix} target={stat.value} />
          </span>

          {stat.trend && (
            <motion.span
              className={cn(
                "mb-1 inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 font-medium font-mono text-[10px]",
                stat.trend.direction === "up" &&
                  "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
                stat.trend.direction === "down" && "bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400",
                stat.trend.direction === "neutral" && "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              )}
              variants={trendBadgeVariants}
            >
              {stat.trend.direction === "up" && <TrendUpIcon />}
              {stat.trend.direction === "down" && <TrendDownIcon />}
              {stat.trend.value}
            </motion.span>
          )}
        </div>
      </div>

      {stat.description && <span className="text-sm text-zinc-500 dark:text-zinc-400">{stat.description}</span>}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Composed shorthand
// ---------------------------------------------------------------------------

export interface StatsViteProps extends StatsViteRootProps {
  containerClassName?: string;
  headingWrapClassName?: string;
  headingClassName?: string;
  descriptionWrapClassName?: string;
  descriptionClassName?: string;
  gridClassName?: string;
}

export function StatsVite({
  containerClassName,
  headingWrapClassName,
  headingClassName,
  descriptionWrapClassName,
  descriptionClassName,
  gridClassName,
  ...props
}: StatsViteProps) {
  return (
    <StatsViteRoot {...props}>
      <StatsViteBackground />
      <StatsViteContainer className={containerClassName}>
        <StatsViteHeading className={headingWrapClassName} headingClassName={headingClassName} />
        <StatsViteDescription className={descriptionWrapClassName} descriptionClassName={descriptionClassName} />
      </StatsViteContainer>
      <StatsViteGrid className={gridClassName} />
    </StatsViteRoot>
  );
}

export default StatsVite;
