"use client";

import createGlobe from "cobe";
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
import { useTheme } from "next-themes";
import * as React from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Theme → RGB (0–1) for cobe (reads computed sRGB from CSS variables)
// ---------------------------------------------------------------------------

const CSS_RGB_RE = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i;

function probeCssColorToRgb01(color: string): [number, number, number] {
  if (typeof document === "undefined") {
    return [0.5, 0.5, 0.5];
  }
  const el = document.createElement("div");
  el.style.color = color;
  el.style.position = "fixed";
  el.style.left = "0";
  el.style.top = "0";
  el.style.opacity = "0";
  el.style.pointerEvents = "none";
  document.body.appendChild(el);
  const rgb = getComputedStyle(el).color;
  document.body.removeChild(el);
  const m = rgb.match(CSS_RGB_RE);
  if (!m) {
    return [0.5, 0.5, 0.5];
  }
  return [Number(m[1]) / 255, Number(m[2]) / 255, Number(m[3]) / 255];
}

function cssVarTriplet(name: `--${string}`): [number, number, number] {
  return probeCssColorToRgb01(`var(${name})`);
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

/** Push sRGB triplets toward vivid (for cobe markers / glow). */
function saturateRgb(rgb: [number, number, number], amount: number): [number, number, number] {
  const lum = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  return [
    clamp01(lum + (rgb[0] - lum) * amount),
    clamp01(lum + (rgb[1] - lum) * amount),
    clamp01(lum + (rgb[2] - lum) * amount),
  ];
}

function useResolvedIsDark(): boolean {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "dark";
}

// ---------------------------------------------------------------------------
// Animation variants
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

export function AnimatedCounter({
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
// Trend arrow icons
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
// Globe markers & arcs (cobe v2: ids enable CSS anchor + visibility vars)
// ---------------------------------------------------------------------------

export interface StatsGlobeMarker {
  id: string;
  label: string;
  location: [number, number];
  size: number;
  color?: [number, number, number];
}

export interface StatsGlobeArc {
  id: string;
  label?: string;
  from: [number, number];
  to: [number, number];
  color?: [number, number, number];
}

const GLOBE_MARKERS: StatsGlobeMarker[] = [
  { id: "stats-sf", label: "San Francisco", location: [37.7595, -122.4367], size: 0.062 },
  { id: "stats-nyc", label: "New York", location: [40.7128, -74.006], size: 0.074 },
  { id: "stats-london", label: "London", location: [51.5074, -0.1278], size: 0.066 },
  { id: "stats-tokyo", label: "Tokyo", location: [35.6762, 139.6503], size: 0.066 },
  { id: "stats-sydney", label: "Sydney", location: [-33.8688, 151.2093], size: 0.056 },
  { id: "stats-saopaulo", label: "São Paulo", location: [-23.5505, -46.6333], size: 0.06 },
  { id: "stats-paris", label: "Paris", location: [48.8566, 2.3522], size: 0.056 },
  { id: "stats-singapore", label: "Singapore", location: [1.3521, 103.8198], size: 0.056 },
];

const GLOBE_ARCS: StatsGlobeArc[] = [
  {
    id: "stats-arc-sf-tokyo",
    label: "Pacific",
    from: [37.7595, -122.4367],
    to: [35.6762, 139.6503],
  },
  {
    id: "stats-arc-nyc-london",
    label: "Atlantic",
    from: [40.7128, -74.006],
    to: [51.5074, -0.1278],
  },
  {
    id: "stats-arc-london-singapore",
    label: "Eurasia",
    from: [51.5074, -0.1278],
    to: [1.3521, 103.8198],
  },
];

function toCobeMarkers(markers: StatsGlobeMarker[]) {
  return markers.map((m) => ({
    id: m.id,
    location: m.location,
    size: m.size,
    ...(m.color ? { color: m.color } : {}),
  }));
}

function toCobeArcs(
  arcs: StatsGlobeArc[],
  palette: { strong: [number, number, number]; soft: [number, number, number] }
) {
  return arcs.map((a, i) => ({
    id: a.id,
    from: a.from,
    to: a.to,
    ...(a.color ? { color: a.color } : { color: i === 0 ? palette.strong : palette.soft }),
  }));
}

/** cobe@2 instance (v1 typings / tooling sometimes lag package exports) */
type CobeGlobeHandle = {
  update: (state: Record<string, unknown>) => void;
  destroy: () => void;
};

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
}

export interface StatsGlobeRootProps extends Omit<React.ComponentPropsWithoutRef<"section">, "title"> {
  srTitle?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  stats?: StatItem[];
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface StatsGlobeContextValue {
  srTitle: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  description: React.ReactNode;
  stats: StatItem[];
}

const StatsGlobeContext = React.createContext<StatsGlobeContextValue | undefined>(undefined);

function useStatsGlobeContext() {
  const ctx = React.useContext(StatsGlobeContext);
  if (!ctx) {
    throw new Error("StatsGlobe components must be used within StatsGlobeRoot");
  }
  return ctx;
}

export function useStatsGlobe() {
  return useStatsGlobeContext();
}

// ---------------------------------------------------------------------------
// Default data
// ---------------------------------------------------------------------------

const defaultStats: StatItem[] = [
  {
    value: 142,
    label: "Countries Reached",
    suffix: "+",
    description: "Active users across six continents",
    trend: { value: "+18%", direction: "up" },
  },
  {
    value: 99.98,
    label: "Global Uptime",
    suffix: "%",
    decimals: 2,
    description: "Multi-region redundancy across 14 data centers",
    trend: { value: "+0.03%", direction: "up" },
  },
  {
    value: 3_200_000,
    label: "API Requests / Day",
    suffix: "+",
    description: "Processed with sub-50ms median latency",
    trend: { value: "+41%", direction: "up" },
  },
  {
    value: 48_000,
    label: "Active Teams",
    suffix: "+",
    description: "From startups to Fortune 500 enterprises",
    trend: { value: "+26%", direction: "up" },
  },
];

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export const StatsGlobeRoot = React.forwardRef<HTMLElement, StatsGlobeRootProps>(
  (
    {
      className,
      children,
      srTitle = "Global reach metrics",
      title = "Powering teams",
      subtitle = "across the globe",
      description = "Our infrastructure spans 14 regions worldwide, delivering sub-50ms latency to users on every continent. Real-time analytics, zero downtime deploys, and enterprise-grade reliability — everywhere.",
      stats = defaultStats,
      ...props
    },
    ref
  ) => {
    const contextValue = React.useMemo<StatsGlobeContextValue>(
      () => ({ srTitle, title, subtitle, description, stats }),
      [srTitle, title, subtitle, description, stats]
    );

    return (
      <StatsGlobeContext.Provider value={contextValue}>
        <section
          className={cn("relative w-full overflow-hidden bg-background text-foreground", className)}
          data-slot="stats-globe-root"
          ref={ref}
          {...props}
        >
          <h2 className="sr-only">{srTitle}</h2>
          {children}
        </section>
      </StatsGlobeContext.Provider>
    );
  }
);
StatsGlobeRoot.displayName = "StatsGlobeRoot";

// ---------------------------------------------------------------------------
// Background
// ---------------------------------------------------------------------------

export function StatsGlobeBackground({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
      data-slot="stats-globe-background"
      {...props}
    >
      <div className="absolute inset-0 bg-background" />
      <div
        className={cn(
          "absolute inset-0",
          "bg-[radial-gradient(ellipse_60%_50%_at_30%_60%,var(--color-chart-2)_0%,transparent_60%)] opacity-[0.10]",
          "dark:opacity-[0.12]"
        )}
      />
      <div
        className={cn(
          "absolute inset-0",
          "bg-[radial-gradient(ellipse_50%_40%_at_70%_40%,var(--color-chart-3)_0%,transparent_60%)] opacity-[0.06]",
          "dark:opacity-[0.08]"
        )}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Container
// ---------------------------------------------------------------------------

export function StatsGlobeContainer({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "container relative z-10 flex flex-col gap-12 py-16 sm:gap-16 sm:py-20 lg:gap-20 lg:py-28",
        className
      )}
      data-slot="stats-globe-container"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Heading
// ---------------------------------------------------------------------------

export interface StatsGlobeHeadingProps extends Omit<React.ComponentPropsWithoutRef<"div">, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headingClassName?: string;
}

export function StatsGlobeHeading({
  className,
  title,
  subtitle,
  headingClassName,
  children,
  ...props
}: StatsGlobeHeadingProps) {
  const context = useStatsGlobeContext();
  const resolvedTitle = title ?? context.title;
  const resolvedSubtitle = subtitle ?? context.subtitle;

  return (
    <div className={cn("text-center", className)} data-slot="stats-globe-heading-wrap" {...props}>
      {children ?? (
        <div
          aria-hidden="true"
          className={cn(
            "text-balance font-medium text-3xl text-foreground tracking-[-0.04em] sm:text-4xl md:text-5xl lg:tracking-[-0.06em] xl:text-6xl",
            headingClassName
          )}
          data-slot="stats-globe-heading"
        >
          {typeof resolvedTitle === "string" ? (
            <AnimatedWords className="justify-center">{resolvedTitle}</AnimatedWords>
          ) : (
            resolvedTitle
          )}
          <br className="hidden sm:block" />
          {resolvedSubtitle && (
            <span className="text-chart-4 dark:text-chart-2">
              {" "}
              {typeof resolvedSubtitle === "string" ? (
                <AnimatedWords className="justify-center">{resolvedSubtitle}</AnimatedWords>
              ) : (
                resolvedSubtitle
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Description
// ---------------------------------------------------------------------------

export interface StatsGlobeDescriptionProps extends HTMLMotionProps<"div"> {
  description?: React.ReactNode;
  descriptionClassName?: string;
}

export function StatsGlobeDescription({
  className,
  description,
  descriptionClassName,
  children,
  ...props
}: StatsGlobeDescriptionProps) {
  const context = useStatsGlobeContext();
  const resolvedDescription = description ?? context.description;
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      className={cn("mx-auto max-w-2xl text-center", className)}
      data-slot="stats-globe-description-wrap"
      initial={{ opacity: 0, y: 16 }}
      ref={ref}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
      {...props}
    >
      {children ?? (
        <p
          className={cn("text-pretty text-base text-foreground/80 sm:text-lg", descriptionClassName)}
          data-slot="stats-globe-description"
        >
          {resolvedDescription}
        </p>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Globe visual (cobe v2: arcs, marker ids, globe.update + rAF)
// ---------------------------------------------------------------------------

export interface StatsGlobeVisualProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  markers?: StatsGlobeMarker[];
  arcs?: StatsGlobeArc[];
  globeSize?: number;
}

function anchorLabelStyle(id: string, kind: "marker" | "arc"): React.CSSProperties {
  const visible = kind === "marker" ? `--cobe-visible-${id}` : `--cobe-visible-arc-${id}`;
  const anchor = kind === "marker" ? `--cobe-${id}` : `--cobe-arc-${id}`;
  return {
    position: "absolute",
    bottom: "anchor(top)",
    filter: `blur(calc((1 - var(${visible}, 0)) * 6px))`,
    left: "anchor(center)",
    opacity: `var(${visible}, 0)`,
    // CSS anchor positioning (Chrome 125+)
    positionAnchor: anchor,
    transform: "translateX(-50%)",
    transition: "opacity 0.35s ease, filter 0.35s ease",
  } as React.CSSProperties;
}

export function StatsGlobeVisual({
  className,
  markers = GLOBE_MARKERS,
  arcs = GLOBE_ARCS,
  globeSize = 600,
  ...props
}: StatsGlobeVisualProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, margin: "200px" });
  const shouldReduceMotion = useReducedMotion();
  const isDark = useResolvedIsDark();
  const phiRef = React.useRef(0.3);
  const bufferSize = globeSize * 2;

  const cobeMarkers = React.useMemo(() => toCobeMarkers(markers), [markers]);

  React.useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    if (!isInView) {
      return;
    }

    const canvas = canvasRef.current;
    const logicalSize = bufferSize;
    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 640 ? 1.8 : 2);

    const markerRgb = saturateRgb(cssVarTriplet("--chart-3"), isDark ? 1.35 : 1.45);
    const arcStrong = saturateRgb(cssVarTriplet("--chart-4"), isDark ? 1.2 : 1.28);
    const arcSoft = saturateRgb(cssVarTriplet("--chart-2"), isDark ? 1.15 : 1.22);
    const cardRgb = cssVarTriplet("--card");
    const mutedRgb = cssVarTriplet("--muted");

    const baseColor: [number, number, number] = isDark
      ? [cardRgb[0] * 0.5 + 0.03, cardRgb[1] * 0.52 + 0.06, Math.min(0.96, cardRgb[2] * 0.62 + 0.1)]
      : [mutedRgb[0] * 0.88 + 0.02, mutedRgb[1] * 0.9 + 0.04, Math.min(0.98, mutedRgb[2] * 0.92 + 0.08)];

    const glowRgb = markerRgb.map((c) => Math.min(1, c * (isDark ? 0.88 : 0.78))) as [number, number, number];

    const cobeArcsResolved = toCobeArcs(arcs, { strong: arcStrong, soft: arcSoft });

    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: logicalSize,
      height: logicalSize,
      phi: phiRef.current,
      theta: 0.22,
      dark: isDark ? 1 : 0,
      diffuse: isDark ? 1.78 : 1.58,
      mapSamples: 18_000,
      mapBrightness: isDark ? 6.6 : 9,
      baseColor,
      markerColor: markerRgb,
      glowColor: glowRgb,
      scale: 1.04,
      offset: [0, 0],
      opacity: isDark ? 0.98 : 0.96,
      markers: cobeMarkers,
      arcs: cobeArcsResolved,
      arcColor: arcStrong,
      arcWidth: 0.72,
      arcHeight: 0.34,
      markerElevation: 0.025,
    } as never) as unknown as CobeGlobeHandle;

    let raf = 0;
    const tick = () => {
      if (!shouldReduceMotion) {
        phiRef.current += 0.003;
      }
      globe.update({
        phi: phiRef.current,
        width: logicalSize,
        height: logicalSize,
        markers: cobeMarkers,
        arcs: cobeArcsResolved,
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      globe.destroy();
    };
  }, [isInView, cobeMarkers, arcs, bufferSize, shouldReduceMotion, isDark]);

  return (
    <motion.div
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      className={cn("relative mx-auto flex aspect-square w-full max-w-[600px] items-center justify-center", className)}
      data-slot="stats-globe-visual"
      initial={{ opacity: 0, scale: 0.9 }}
      ref={containerRef}
      transition={{ duration: 1.2, ease: [0.25, 0.4, 0.25, 1] }}
      {...props}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-full",
          "bg-[radial-gradient(circle_at_50%_50%,var(--color-chart-3)_0%,transparent_68%)] opacity-[0.22] dark:opacity-[0.26]"
        )}
      />
      <div
        className="relative mx-auto aspect-square w-full max-w-[min(100%,600px)]"
        style={{
          width: globeSize,
          height: globeSize,
          maxWidth: globeSize,
        }}
      >
        <canvas
          className="block size-full max-h-full max-w-full"
          height={bufferSize}
          ref={canvasRef}
          style={{ contain: "layout paint size" }}
          width={bufferSize}
        />
        {markers.map((m) => (
          <div
            className="pointer-events-none z-10 whitespace-nowrap rounded-full border-2 border-border bg-background/95 px-2 py-0.5 font-semibold text-[10px] text-foreground shadow-md backdrop-blur-sm sm:text-xs"
            key={m.id}
            style={anchorLabelStyle(m.id, "marker")}
          >
            {m.label}
          </div>
        ))}
        {arcs
          .filter((a) => a.label)
          .map((a) => (
            <div
              className="pointer-events-none z-10 whitespace-nowrap rounded-md border-2 border-chart-4/55 bg-background/95 px-1.5 py-0.5 font-semibold text-[9px] text-foreground uppercase tracking-wider shadow-md backdrop-blur-sm sm:text-[10px] dark:border-chart-2/50"
              key={a.id}
              style={anchorLabelStyle(a.id, "arc")}
            >
              {a.label}
            </div>
          ))}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Content area (globe + stats side-by-side)
// ---------------------------------------------------------------------------

export interface StatsGlobeContentProps extends React.ComponentPropsWithoutRef<"div"> {
  stats?: StatItem[];
}

export function StatsGlobeContent({ className, stats, children, ...props }: StatsGlobeContentProps) {
  const context = useStatsGlobeContext();
  const resolvedStats = stats ?? context.stats;
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div
      className={cn("grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16", className)}
      data-slot="stats-globe-content"
      ref={ref}
      {...props}
    >
      {children ?? (
        <>
          <StatsGlobeVisual />
          <motion.div
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
            initial="hidden"
            variants={statsGridVariants}
          >
            {resolvedStats.map((stat) => (
              <StatsGlobeCard key={stat.label} stat={stat} />
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

export interface StatsGlobeCardProps extends HTMLMotionProps<"div"> {
  stat: StatItem;
}

export function StatsGlobeCard({ className, stat, ...props }: StatsGlobeCardProps) {
  return (
    <motion.div
      className={cn(
        "group relative flex flex-col gap-2.5 overflow-hidden rounded-xl border border-border bg-card/85 p-5 shadow-sm backdrop-blur-sm transition-colors duration-200 sm:p-6",
        "hover:bg-accent/30 dark:hover:bg-accent/20",
        className
      )}
      data-slot="stats-globe-card"
      variants={statCardVariants}
      {...props}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-3xl text-foreground tracking-tight sm:text-4xl">
          <AnimatedCounter decimals={stat.decimals} prefix={stat.prefix} suffix={stat.suffix} target={stat.value} />
        </span>

        {stat.trend && (
          <motion.span
            className={cn(
              "mt-1 inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 font-medium text-xs",
              stat.trend.direction === "up" &&
                "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
              stat.trend.direction === "down" && "bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-400",
              stat.trend.direction === "neutral" && "bg-muted text-muted-foreground"
            )}
            variants={trendBadgeVariants}
          >
            {stat.trend.direction === "up" && <TrendUpIcon />}
            {stat.trend.direction === "down" && <TrendDownIcon />}
            {stat.trend.value}
          </motion.span>
        )}
      </div>

      <span className="font-medium text-card-foreground text-sm sm:text-base">{stat.label}</span>

      {stat.description && <span className="text-muted-foreground text-xs sm:text-sm">{stat.description}</span>}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Composed shorthand
// ---------------------------------------------------------------------------

export interface StatsGlobeProps extends StatsGlobeRootProps {
  containerClassName?: string;
  headingWrapClassName?: string;
  headingClassName?: string;
  descriptionWrapClassName?: string;
  descriptionClassName?: string;
  contentClassName?: string;
}

export function StatsGlobe({
  containerClassName,
  headingWrapClassName,
  headingClassName,
  descriptionWrapClassName,
  descriptionClassName,
  contentClassName,
  ...props
}: StatsGlobeProps) {
  return (
    <StatsGlobeRoot {...props}>
      <StatsGlobeBackground />
      <StatsGlobeContainer className={containerClassName}>
        <StatsGlobeHeading className={headingWrapClassName} headingClassName={headingClassName} />
        <StatsGlobeDescription className={descriptionWrapClassName} descriptionClassName={descriptionClassName} />
        <StatsGlobeContent className={contentClassName} />
      </StatsGlobeContainer>
    </StatsGlobeRoot>
  );
}

export default StatsGlobe;
