"use client";

import { type HTMLMotionProps, motion, useInView, useReducedMotion, type Variants } from "motion/react";
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

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
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

const buttonContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.4,
    },
  },
};

const buttonVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
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
// Arrow icon
// ---------------------------------------------------------------------------

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CTAViteAvatar {
  name: string;
  image?: string;
}

interface CTAViteSocialProofData {
  avatars: CTAViteAvatar[];
  text: string;
}

interface CTAViteCTA {
  label: string;
  href: string;
}

export interface CTAViteRootProps extends Omit<React.ComponentPropsWithoutRef<"section">, "title"> {
  srTitle?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  primaryCta?: CTAViteCTA;
  secondaryCta?: CTAViteCTA;
  socialProof?: CTAViteSocialProofData;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface CTAViteContextValue {
  srTitle: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  description: React.ReactNode;
  primaryCta: CTAViteCTA;
  secondaryCta?: CTAViteCTA;
  socialProof?: CTAViteSocialProofData;
}

const CTAViteContext = React.createContext<CTAViteContextValue | undefined>(undefined);

function useCTAViteContext() {
  const ctx = React.useContext(CTAViteContext);
  if (!ctx) {
    throw new Error("CTAVite components must be used within CTAViteRoot");
  }
  return ctx;
}

export function useCTAVite() {
  return useCTAViteContext();
}

// ---------------------------------------------------------------------------
// Default data
// ---------------------------------------------------------------------------

const VITE_COLORS = ["#ed40b3", "#6ef7cc", "#adfa1e", "#b054de"] as const;

const defaultPrimaryCta: CTAViteCTA = {
  label: "Get Started",
  href: "#",
};

const defaultSecondaryCta: CTAViteCTA = {
  label: "Learn More",
  href: "#",
};

const defaultSocialProof: CTAViteSocialProofData = {
  avatars: [
    { name: "Alex Rivera" },
    { name: "Priya Sharma" },
    { name: "Marcus Chen" },
    { name: "Sofia Petrov" },
    { name: "Jordan Ellis" },
  ],
  text: "Join 10,000+ developers shipping faster",
};

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export const CTAViteRoot = React.forwardRef<HTMLElement, CTAViteRootProps>(
  (
    {
      className,
      children,
      srTitle = "Call to action",
      title = "Start building today",
      subtitle = "ship with confidence",
      description = "Everything you need to build production-grade interfaces — composable components, spring animations, and a design system that scales with your team.",
      primaryCta = defaultPrimaryCta,
      secondaryCta = defaultSecondaryCta,
      socialProof = defaultSocialProof,
      ...props
    },
    ref
  ) => {
    const contextValue = React.useMemo<CTAViteContextValue>(
      () => ({ srTitle, title, subtitle, description, primaryCta, secondaryCta, socialProof }),
      [srTitle, title, subtitle, description, primaryCta, secondaryCta, socialProof]
    );

    return (
      <CTAViteContext.Provider value={contextValue}>
        <section
          className={cn("relative w-full overflow-hidden", className)}
          data-slot="cta-vite-root"
          ref={ref}
          {...props}
        >
          <h2 className="sr-only">{srTitle}</h2>
          {children}
        </section>
      </CTAViteContext.Provider>
    );
  }
);
CTAViteRoot.displayName = "CTAViteRoot";

// ---------------------------------------------------------------------------
// Container
// ---------------------------------------------------------------------------

export function CTAViteContainer({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "container relative z-10 flex flex-col gap-12 py-16 sm:gap-16 sm:py-20 lg:gap-20 lg:py-28",
        className
      )}
      data-slot="cta-vite-container"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

export interface CTAViteCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children?: React.ReactNode;
}

export function CTAViteCard({ className, children, ...props }: CTAViteCardProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      animate={isInView ? "visible" : "hidden"}
      className={cn(
        "relative mx-auto w-full max-w-4xl overflow-hidden rounded-xl bg-card text-center",
        "p-8 sm:p-12 lg:p-16",
        "shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0px_6px_12px_-3px_rgba(0,0,0,0.1),0px_16px_40px_-8px_rgba(0,0,0,0.12)]",
        "dark:shadow-[0px_0px_0px_1px_rgba(255,255,255,0.08),0px_6px_12px_-3px_rgba(255,255,255,0.05),0px_16px_40px_-8px_rgba(0,0,0,0.45)]",
        className
      )}
      data-slot="cta-vite-card"
      initial="hidden"
      ref={ref}
      variants={cardVariants}
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 20% 80%, rgba(237,64,179,0.04) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 80% 20%, rgba(110,247,204,0.03) 0%, transparent 60%)
          `,
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8">{children}</div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Heading
// ---------------------------------------------------------------------------

export interface CTAViteHeadingProps extends Omit<React.ComponentPropsWithoutRef<"div">, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headingClassName?: string;
}

export function CTAViteHeading({
  className,
  title,
  subtitle,
  headingClassName,
  children,
  ...props
}: CTAViteHeadingProps) {
  const context = useCTAViteContext();
  const resolvedTitle = title ?? context.title;
  const resolvedSubtitle = subtitle ?? context.subtitle;

  return (
    <div className={cn("text-center", className)} data-slot="cta-vite-heading-wrap" {...props}>
      {children ?? (
        <div
          aria-hidden="true"
          className={cn(
            "text-balance font-medium text-3xl tracking-[-0.04em] sm:text-4xl md:text-5xl lg:tracking-[-0.06em]",
            headingClassName
          )}
          data-slot="cta-vite-heading"
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
// Description
// ---------------------------------------------------------------------------

export interface CTAViteDescriptionProps extends HTMLMotionProps<"div"> {
  description?: React.ReactNode;
  descriptionClassName?: string;
}

export function CTAViteDescription({
  className,
  description,
  descriptionClassName,
  children,
  ...props
}: CTAViteDescriptionProps) {
  const context = useCTAViteContext();
  const resolvedDescription = description ?? context.description;
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      className={cn("mx-auto max-w-2xl text-center", className)}
      data-slot="cta-vite-description-wrap"
      initial={{ opacity: 0, y: 16 }}
      ref={ref}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
      {...props}
    >
      {children ?? (
        <p
          className={cn("text-pretty text-base text-foreground/60 sm:text-lg", descriptionClassName)}
          data-slot="cta-vite-description"
        >
          {resolvedDescription}
        </p>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Buttons
// ---------------------------------------------------------------------------

export interface CTAViteButtonsProps extends HTMLMotionProps<"div"> {
  primaryCta?: CTAViteCTA;
  secondaryCta?: CTAViteCTA;
}

export function CTAViteButtons({ className, primaryCta, secondaryCta, ...props }: CTAViteButtonsProps) {
  const context = useCTAViteContext();
  const resolvedPrimary = primaryCta ?? context.primaryCta;
  const resolvedSecondary = secondaryCta ?? context.secondaryCta;
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn("flex flex-col items-center justify-center gap-3 sm:flex-row", className)}
      data-slot="cta-vite-buttons"
      initial="hidden"
      variants={buttonContainerVariants}
      viewport={{ once: true, margin: "-60px" }}
      whileInView="visible"
      {...props}
    >
      <motion.a
        className={cn(
          "inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 font-medium text-background text-sm transition-opacity hover:opacity-90",
          "shadow-[0px_0px_20px_-4px_rgba(237,64,179,0.4)]",
          "dark:shadow-[0px_0px_20px_-4px_rgba(110,247,204,0.3)]"
        )}
        href={resolvedPrimary.href}
        variants={buttonVariants}
        whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
      >
        {resolvedPrimary.label}
        <ArrowRightIcon />
      </motion.a>

      {resolvedSecondary && (
        <motion.a
          className={cn(
            "inline-flex h-12 items-center gap-2 rounded-full border border-border bg-transparent px-6 font-medium text-sm transition-colors hover:bg-muted",
            "shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_2px_4px_-1px_rgba(0,0,0,0.06),0px_8px_20px_-6px_rgba(0,0,0,0.07)]",
            "dark:shadow-[0px_0px_0px_1px_rgba(255,255,255,0.08),0px_2px_4px_-1px_rgba(255,255,255,0.04),0px_8px_20px_-6px_rgba(0,0,0,0.3)]"
          )}
          href={resolvedSecondary.href}
          variants={buttonVariants}
          whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
        >
          {resolvedSecondary.label}
        </motion.a>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Social Proof
// ---------------------------------------------------------------------------

export interface CTAViteSocialProofProps extends HTMLMotionProps<"div"> {
  socialProof?: CTAViteSocialProofData;
}

export function CTAViteSocialProof({ className, socialProof, ...props }: CTAViteSocialProofProps) {
  const context = useCTAViteContext();
  const resolvedProof = socialProof ?? context.socialProof;
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  if (!resolvedProof) {
    return null;
  }

  return (
    <motion.div
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      className={cn("flex flex-col items-center gap-3 sm:flex-row", className)}
      data-slot="cta-vite-social-proof"
      initial={{ opacity: 0, y: 12 }}
      ref={ref}
      transition={{ duration: 0.6, delay: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      {...props}
    >
      <div className="-space-x-2 flex">
        {resolvedProof.avatars.map((avatar, i) => {
          const accent = VITE_COLORS[i % VITE_COLORS.length];
          const initials = avatar.name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2);

          return (
            <Avatar className="size-8 ring-2 ring-card" key={avatar.name}>
              {avatar.image ? <AvatarImage alt={avatar.name} src={avatar.image} /> : null}
              <AvatarFallback
                className="font-medium text-[10px]"
                style={{ backgroundColor: `${accent}20`, color: accent }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
          );
        })}
      </div>
      <span className="text-muted-foreground text-sm">{resolvedProof.text}</span>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Composed shorthand
// ---------------------------------------------------------------------------

export interface CTAViteProps extends CTAViteRootProps {
  containerClassName?: string;
  cardClassName?: string;
  headingWrapClassName?: string;
  headingClassName?: string;
  descriptionWrapClassName?: string;
  descriptionClassName?: string;
  buttonsClassName?: string;
  socialProofClassName?: string;
}

export function CTAVite({
  containerClassName,
  cardClassName,
  headingWrapClassName,
  headingClassName,
  descriptionWrapClassName,
  descriptionClassName,
  buttonsClassName,
  socialProofClassName,
  ...props
}: CTAViteProps) {
  return (
    <CTAViteRoot {...props}>
      <CTAViteContainer className={containerClassName}>
        <CTAViteCard className={cardClassName}>
          <CTAViteHeading className={headingWrapClassName} headingClassName={headingClassName} />
          <CTAViteDescription className={descriptionWrapClassName} descriptionClassName={descriptionClassName} />
          <CTAViteButtons className={buttonsClassName} />
          <CTAViteSocialProof className={socialProofClassName} />
        </CTAViteCard>
      </CTAViteContainer>
    </CTAViteRoot>
  );
}

export default CTAVite;
