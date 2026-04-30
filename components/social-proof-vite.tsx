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
import type { SVGProps } from "react";
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Animation variants (matching hero-vite vocabulary)
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

const testimonialContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const testimonialCardVariants: Variants = {
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
  className,
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const shouldReduceMotion = useReducedMotion();
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 80, damping: 30 });
  const display = useTransform(spring, (v) => {
    const rounded = Math.round(v);
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
// Types
// ---------------------------------------------------------------------------

export interface SocialProofLogo {
  name: string;
  icon: React.ComponentType<SVGProps<SVGSVGElement>>;
}

export interface SocialProofMetric {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  accentColor?: string;
}

export interface SocialProofTestimonial {
  quote: string;
  name: string;
  role: string;
  avatarUrl?: string;
  accentColor?: string;
}

export interface SocialProofViteRootProps extends Omit<React.ComponentPropsWithoutRef<"section">, "title"> {
  srTitle?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  logos?: SocialProofLogo[];
  metrics?: SocialProofMetric[];
  testimonials?: SocialProofTestimonial[];
  marqueeSpeed?: number;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface SocialProofViteContextValue {
  srTitle: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  logos: SocialProofLogo[];
  metrics: SocialProofMetric[];
  testimonials: SocialProofTestimonial[];
  marqueeSpeed: number;
}

const SocialProofViteContext = React.createContext<SocialProofViteContextValue | undefined>(undefined);

function useSocialProofViteContext() {
  const ctx = React.useContext(SocialProofViteContext);
  if (!ctx) {
    throw new Error("SocialProofVite components must be used within SocialProofViteRoot");
  }
  return ctx;
}

export function useSocialProofVite() {
  return useSocialProofViteContext();
}

// ---------------------------------------------------------------------------
// Default data
// ---------------------------------------------------------------------------

const VITE_COLORS = ["#ed40b3", "#6ef7cc", "#adfa1e", "#b054de"] as const;

const defaultLogos: SocialProofLogo[] = [
  { name: "Vercel", icon: VercelLogo },
  { name: "Stripe", icon: StripeLogo },
  { name: "GitHub", icon: GitHubLogo },
  { name: "Linear", icon: LinearLogo },
  { name: "Supabase", icon: SupabaseLogo },
  { name: "Clerk", icon: ClerkLogo },
  { name: "Resend", icon: ResendLogo },
  { name: "Planetscale", icon: PlanetscaleLogo },
];

const defaultMetrics: SocialProofMetric[] = [
  {
    value: 48_000,
    label: "Downloads",
    suffix: "+",
    accentColor: VITE_COLORS[0],
  },
  { value: 4200, label: "GitHub Stars", suffix: "+", accentColor: VITE_COLORS[1] },
  { value: 1800, label: "Teams", suffix: "+", accentColor: VITE_COLORS[2] },
  { value: 99, label: "Uptime", suffix: "%", accentColor: VITE_COLORS[3] },
];

const defaultTestimonials: SocialProofTestimonial[] = [
  {
    quote:
      "Completely changed how we ship UI. The composable primitives mean we're not fighting the framework — we're building with it.",
    name: "Alex Rivera",
    role: "Staff Engineer, Vercel",
    accentColor: VITE_COLORS[0],
  },
  {
    quote:
      "Our design system migration took days instead of months. The animation patterns are production-ready out of the box.",
    name: "Priya Sharma",
    role: "Engineering Lead, Linear",
    accentColor: VITE_COLORS[1],
  },
  {
    quote:
      "The best component library I've used in 10 years of frontend development. Everything just works, and the DX is unmatched.",
    name: "Marcus Chen",
    role: "CTO, Acme",
    accentColor: VITE_COLORS[2],
  },
];

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export const SocialProofViteRoot = React.forwardRef<HTMLElement, SocialProofViteRootProps>(
  (
    {
      className,
      children,
      srTitle = "Trusted by developers",
      title = "Trusted by developers",
      subtitle = "everywhere",
      logos = defaultLogos,
      metrics = defaultMetrics,
      testimonials = defaultTestimonials,
      marqueeSpeed = 30,
      ...props
    },
    ref
  ) => {
    const contextValue = React.useMemo<SocialProofViteContextValue>(
      () => ({
        srTitle,
        title,
        subtitle,
        logos,
        metrics,
        testimonials,
        marqueeSpeed,
      }),
      [srTitle, title, subtitle, logos, metrics, testimonials, marqueeSpeed]
    );

    return (
      <SocialProofViteContext.Provider value={contextValue}>
        <section
          className={cn("relative w-full overflow-hidden", className)}
          data-slot="social-proof-vite-root"
          ref={ref}
          {...props}
        >
          <h2 className="sr-only">{srTitle}</h2>
          {children}
        </section>
      </SocialProofViteContext.Provider>
    );
  }
);
SocialProofViteRoot.displayName = "SocialProofViteRoot";

// ---------------------------------------------------------------------------
// Container
// ---------------------------------------------------------------------------

export function SocialProofViteContainer({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "container relative z-10 flex flex-col gap-12 py-16 sm:gap-16 sm:py-20 lg:gap-20 lg:py-28",
        className
      )}
      data-slot="social-proof-vite-container"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Heading
// ---------------------------------------------------------------------------

export interface SocialProofViteHeadingProps extends Omit<React.ComponentPropsWithoutRef<"div">, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headingClassName?: string;
}

export function SocialProofViteHeading({
  className,
  title,
  subtitle,
  headingClassName,
  children,
  ...props
}: SocialProofViteHeadingProps) {
  const context = useSocialProofViteContext();
  const resolvedTitle = title ?? context.title;
  const resolvedSubtitle = subtitle ?? context.subtitle;

  return (
    <div className={cn("text-center", className)} data-slot="social-proof-vite-heading-wrap" {...props}>
      {children ?? (
        <div
          aria-hidden="true"
          className={cn(
            "text-balance font-medium text-3xl tracking-[-0.04em] sm:text-4xl md:text-5xl lg:tracking-[-0.06em] xl:text-6xl",
            headingClassName
          )}
          data-slot="social-proof-vite-heading"
        >
          {typeof resolvedTitle === "string" ? <AnimatedWords>{resolvedTitle}</AnimatedWords> : resolvedTitle}
          <br className="hidden sm:block" />
          {resolvedSubtitle && (
            <span className="text-foreground/50">
              {" "}
              {typeof resolvedSubtitle === "string" ? (
                <AnimatedWords>{resolvedSubtitle}</AnimatedWords>
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
// Logo Marquee
// ---------------------------------------------------------------------------

export interface SocialProofViteLogoMarqueeProps extends HTMLMotionProps<"div"> {
  logos?: SocialProofLogo[];
  speed?: number;
}

export function SocialProofViteLogoMarquee({ className, logos, speed, ...props }: SocialProofViteLogoMarqueeProps) {
  const context = useSocialProofViteContext();
  const resolvedLogos = logos ?? context.logos;
  const resolvedSpeed = speed ?? context.marqueeSpeed;
  const shouldReduceMotion = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      className={cn("relative w-full", className)}
      data-slot="social-proof-vite-logo-marquee"
      initial={{ opacity: 0 }}
      ref={ref}
      transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
      {...props}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent sm:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent sm:w-24" />

      <div
        className="flex overflow-hidden"
        style={
          {
            "--marquee-duration": `${resolvedSpeed}s`,
          } as React.CSSProperties
        }
      >
        {[0, 1].map((copy) => (
          <div
            aria-hidden={copy === 1}
            className={cn(
              "flex shrink-0 items-center gap-10 px-5 sm:gap-14 sm:px-7",
              !shouldReduceMotion && "animate-[marquee_var(--marquee-duration)_linear_infinite]"
            )}
            key={copy}
          >
            {resolvedLogos.map((logo, i) => {
              const Logo = logo.icon;
              return (
                <div className="group flex shrink-0 items-center justify-center" key={`${copy}-${logo.name}-${i}`}>
                  <Logo className="h-6 w-auto opacity-40 transition-opacity duration-300 group-hover:opacity-80 sm:h-7 md:h-8" />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: "@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-100%)}}",
        }}
      />
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

export interface SocialProofViteMetricsProps extends HTMLMotionProps<"div"> {
  metrics?: SocialProofMetric[];
}

export function SocialProofViteMetrics({ className, metrics, ...props }: SocialProofViteMetricsProps) {
  const context = useSocialProofViteContext();
  const resolvedMetrics = metrics ?? context.metrics;
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      animate={isInView ? "visible" : "hidden"}
      className={cn("grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4", className)}
      data-slot="social-proof-vite-metrics"
      initial="hidden"
      ref={ref}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1, delayChildren: 0.05 },
        },
      }}
      {...props}
    >
      {resolvedMetrics.map((metric) => (
        <motion.div
          className={cn(
            "flex flex-col items-center gap-1 rounded-xl bg-card p-6 text-center transition-shadow duration-200",
            "shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_2px_4px_-1px_rgba(0,0,0,0.08),0px_8px_24px_-4px_rgba(0,0,0,0.08)]",
            "dark:shadow-[0px_0px_0px_1px_rgba(255,255,255,0.06),0px_2px_4px_-1px_rgba(255,255,255,0.04),0px_8px_24px_-4px_rgba(0,0,0,0.35)]",
            "hover:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_12px_32px_-4px_rgba(0,0,0,0.1)]",
            "dark:hover:shadow-[0px_0px_0px_1px_rgba(255,255,255,0.1),0px_4px_6px_-1px_rgba(255,255,255,0.05),0px_12px_32px_-4px_rgba(0,0,0,0.45)]"
          )}
          data-slot="social-proof-vite-metric"
          key={metric.label}
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                type: "spring",
                stiffness: 260,
                damping: 24,
              },
            },
          }}
        >
          <span
            className="font-medium text-3xl tracking-tight sm:text-4xl"
            style={metric.accentColor ? { color: metric.accentColor } : undefined}
          >
            <AnimatedCounter prefix={metric.prefix} suffix={metric.suffix} target={metric.value} />
          </span>
          <span className="text-muted-foreground text-sm">{metric.label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Testimonials grid
// ---------------------------------------------------------------------------

export interface SocialProofViteTestimonialsProps extends HTMLMotionProps<"div"> {
  testimonials?: SocialProofTestimonial[];
}

export function SocialProofViteTestimonials({
  className,
  testimonials,
  children,
  ...props
}: SocialProofViteTestimonialsProps) {
  const context = useSocialProofViteContext();
  const resolvedTestimonials = testimonials ?? context.testimonials;
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      animate={isInView ? "visible" : "hidden"}
      className={cn("grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3", className)}
      data-slot="social-proof-vite-testimonials"
      initial="hidden"
      ref={ref}
      variants={testimonialContainerVariants}
      {...props}
    >
      {children ?? resolvedTestimonials.map((t) => <SocialProofViteTestimonialCard key={t.name} testimonial={t} />)}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Testimonial card
// ---------------------------------------------------------------------------

export interface SocialProofViteTestimonialCardProps extends HTMLMotionProps<"div"> {
  testimonial: SocialProofTestimonial;
}

export function SocialProofViteTestimonialCard({
  className,
  testimonial,
  ...props
}: SocialProofViteTestimonialCardProps) {
  const accent = testimonial.accentColor ?? VITE_COLORS[0];
  const initials = testimonial.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  return (
    <motion.div
      className={cn(
        "relative flex flex-col gap-4 overflow-hidden rounded-xl bg-card p-6 transition-shadow duration-200",
        "shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_2px_4px_-1px_rgba(0,0,0,0.08),0px_8px_24px_-4px_rgba(0,0,0,0.08)]",
        "dark:shadow-[0px_0px_0px_1px_rgba(255,255,255,0.06),0px_2px_4px_-1px_rgba(255,255,255,0.04),0px_8px_24px_-4px_rgba(0,0,0,0.35)]",
        "hover:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_12px_32px_-4px_rgba(0,0,0,0.1)]",
        "dark:hover:shadow-[0px_0px_0px_1px_rgba(255,255,255,0.1),0px_4px_6px_-1px_rgba(255,255,255,0.05),0px_12px_32px_-4px_rgba(0,0,0,0.45)]",
        className
      )}
      data-slot="social-proof-vite-testimonial"
      variants={testimonialCardVariants}
      {...props}
    >
      <p className="flex-1 text-pretty text-card-foreground/90 text-sm leading-relaxed sm:text-base">
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      <div className="flex items-center gap-3">
        <Avatar className="size-9">
          {testimonial.avatarUrl ? <AvatarImage alt={testimonial.name} src={testimonial.avatarUrl} /> : null}
          <AvatarFallback className="font-medium text-xs" style={{ backgroundColor: `${accent}20`, color: accent }}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium text-sm tracking-tight">{testimonial.name}</span>
          <span className="text-muted-foreground text-xs">{testimonial.role}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Composed shorthand
// ---------------------------------------------------------------------------

export interface SocialProofViteProps extends SocialProofViteRootProps {
  containerClassName?: string;
  headingWrapClassName?: string;
  headingClassName?: string;
  logoMarqueeClassName?: string;
  metricsClassName?: string;
  testimonialsClassName?: string;
}

export function SocialProofVite({
  containerClassName,
  headingWrapClassName,
  headingClassName,
  logoMarqueeClassName,
  metricsClassName,
  testimonialsClassName,
  ...props
}: SocialProofViteProps) {
  return (
    <SocialProofViteRoot {...props}>
      <SocialProofViteContainer className={containerClassName}>
        <SocialProofViteHeading className={headingWrapClassName} headingClassName={headingClassName} />
        <SocialProofViteLogoMarquee className={logoMarqueeClassName} />
        <SocialProofViteMetrics className={metricsClassName} />
        <SocialProofViteTestimonials className={testimonialsClassName} />
      </SocialProofViteContainer>
    </SocialProofViteRoot>
  );
}

// ---------------------------------------------------------------------------
// Real brand logos
// ---------------------------------------------------------------------------

function VercelLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="currentColor" viewBox="0 0 76 65" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Vercel</title>
      <path d="M37.532 0L75.064 65H0L37.532 0z" />
    </svg>
  );
}

function StripeLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="currentColor" viewBox="0 0 60 25" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Stripe</title>
      <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a12.2 12.2 0 0 1-4.56.84c-4.05 0-6.83-2.11-6.83-7.07 0-4.18 2.45-7.12 6.23-7.12 3.56 0 6.05 2.53 6.05 6.65 0 .7-.06 1.27-.08 1.78zm-4.32-5.35c-1.07 0-2.04.76-2.21 2.7h4.32c0-1.7-.73-2.7-2.11-2.7zm-10.53-2.59c1.39 0 2.4.35 3.18.79l-.93 3.43c-.69-.35-1.54-.62-2.56-.62-1.7 0-2.7 1.07-2.7 3.15v7.12h-4.38V6.67h4.12l.14 1.66c.73-1.28 1.88-1.99 3.13-1.99zm-10.14.33h4.38v13.48h-4.12l-.14-1.42c-.87 1.18-2.18 1.76-3.76 1.76-3.53 0-5.83-2.83-5.83-7.07s2.44-7.08 5.96-7.08c1.34 0 2.4.42 3.17 1.15l.34-1.15v.33zm-3.06 10.42c1.52 0 2.65-1.18 2.65-3.47s-1-3.4-2.56-3.4c-1.57 0-2.65 1.18-2.65 3.46s1.07 3.4 2.56 3.4zm-8.05-6.96v9.55h-4.38v-8.35c0-1.6-.56-2.27-1.8-2.27-1.34 0-2.24.84-2.24 2.9v7.73h-4.38V6.67h4.12l.14 1.5c.95-1.23 2.27-1.84 3.83-1.84 2.9 0 4.7 1.87 4.7 5.46zm-18.31-4.32h-3.9V2.9l4.38-1V5.8h3.3v3.47h-3.3v5.5c0 1.52.62 2.02 1.64 2.02.73 0 1.3-.14 1.88-.42v3.3c-.79.45-1.88.7-3.3.7-3 0-4.7-1.68-4.7-4.87V9.27h-1.34V5.8h1.34zm-9.2 10.42c1.57 0 2.94-.65 3.9-1.82l2.63 2.34c-1.52 1.87-3.87 2.9-6.67 2.9C5.22 20.14 2 17 2 12.53S5.08 4.85 9.66 4.85c4.05 0 7.2 2.94 7.2 7.42 0 .62-.06 1.27-.14 1.78H6.53c.37 2.21 1.84 3.08 3.5 3.08zM6.39 11.6h6.2c-.2-2.04-1.23-3.2-2.97-3.2-1.64 0-2.83 1.1-3.22 3.2z" />
    </svg>
  );
}

function GitHubLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="currentColor" viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>GitHub</title>
      <path
        clipRule="evenodd"
        d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
        fillRule="evenodd"
      />
    </svg>
  );
}

function LinearLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="currentColor" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Linear</title>
      <path d="M1.22541 61.5228c-.2225-.9485.6428-1.8138 1.5913-1.5765l13.4135 3.3578c.7872.197 1.3547.8781 1.3985 1.6852.172 3.1614.8819 6.2774 2.0944 9.1903.2025.4865.1583 1.0434-.1286 1.4885l-7.7133 11.5695c-.5286.7929-1.6027.8982-2.2614.2395C4.57 82.4327 1.4426 76.3198.4228 69.3857c-.3498-2.3773-.4832-4.8368-.3028-7.2865.0438-.5949.0655-1.1432.1054-1.5764zm16.3945 23.9613L7.5653 94.4743c-.4997.4463-.0673 1.2716.595 1.1352 3.8568-.7944 7.5369-2.1572 10.9483-3.9826.4872-.2608.6867-.8649.4451-1.3611l-1.9337-3.9817zm71.5543-36.5357c-.1226-.5059-.1861-1.0294-.1861-1.5649V37.4102l-20.262 19.1398c-2.3044 2.1776-4.8414 4.115-7.5774 5.7754l-18.9395 11.484c-3.6397 2.2076-7.7008 3.8065-12.0258 4.6888l-11.1002 2.2648c-.9698.1979-1.3322 1.3726-.5782 1.8807 2.8825 1.9416 6.0137 3.5457 9.3382 4.7589 5.1 1.8842 10.8142 2.8975 16.7561 2.8975 28.2763 0 51.191-22.9148 51.191-51.191 0-5.942-1.0133-11.6543-2.8975-16.9654-1.2133-3.4238-2.8174-6.6523-4.7589-9.6266-.5081-.7539-1.6827-.3915-1.8807.5782l-2.2648 11.1002c-.8823 4.3249-2.4812 8.386-4.6887 12.0257l-11.4841 18.9396c-1.6604 2.736-3.5978 5.273-5.7754 7.5773L26.1461 85.1003h9.9732c.5355 0 1.059.0635 1.5648.1861 5.4894 1.3289 11.2851 2.0401 17.2516 2.0401 18.1898 0 34.6653-6.9987 47.0163-18.4364.3277-.3038.1753-.845-.2624-.9337z" />
    </svg>
  );
}

function SupabaseLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="currentColor" viewBox="0 0 109 113" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Supabase</title>
      <path
        d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z"
        fillOpacity="0.5"
      />
      <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627H99.1935C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" />
      <path
        d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.16513 56.4175L45.317 2.07103Z"
        fillOpacity="0.5"
      />
    </svg>
  );
}

function ClerkLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Clerk</title>
      <path d="M19.5 3.29a1.007 1.007 0 0 0-1.091-.22l-3.026 1.237a1.007 1.007 0 0 0-.512 1.395l.006.012a8.4 8.4 0 0 1 .898 3.768 8.412 8.412 0 0 1-3.375 6.739 1.007 1.007 0 0 0-.166 1.47l2.058 2.36c.37.424 1.01.486 1.453.14A13.07 13.07 0 0 0 21 9.483a13.04 13.04 0 0 0-1.5-6.193z" />
      <path
        d="M12.464 17.512a3.946 3.946 0 0 1-3.94-3.94 3.92 3.92 0 0 1 1.382-3 1.007 1.007 0 0 0 .166-1.47l-2.058-2.36a1.007 1.007 0 0 0-1.453-.14A8.867 8.867 0 0 0 3.34 13.57a9.118 9.118 0 0 0 8.468 9.088 9.07 9.07 0 0 0 6.508-2.017 1.007 1.007 0 0 0 .09-1.49l-2.144-2.144a1.007 1.007 0 0 0-1.205-.176 3.93 3.93 0 0 1-2.594.681z"
        fillOpacity="0.5"
      />
    </svg>
  );
}

function ResendLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Resend</title>
      <path d="M2.023 0H1v24h3.996V14.13h3.168L13.76 24h4.47L12.236 13.698C15.252 12.96 17.28 10.598 17.28 7.2c0-4.56-3.024-7.2-7.872-7.2H2.023zm3.973 10.8V3.36h3.384c2.304 0 3.648 1.2 3.648 3.72s-1.344 3.72-3.648 3.72H5.996z" />
    </svg>
  );
}

function PlanetscaleLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Planetscale</title>
      <path d="M128 0C57.308 0 0 57.308 0 128c0 70.692 57.308 128 128 128 70.692 0 128-57.308 128-128C256 57.308 198.692 0 128 0zm83.118 130.714L130.714 211.06a83.573 83.573 0 0 1-2.666.058c-45.822 0-83.118-37.018-83.118-82.474h82.296l80.592-80.592c16.244 22.478 25.252 49.948 25.252 79.484 0 1.144-.024 2.282-.062 3.418l-.026-.24h.076z" />
    </svg>
  );
}

export default SocialProofVite;
