"use client";

import {
  motion,
  type SpringOptions,
  type Transition,
  useSpring,
  useTransform,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function SpotlightBorder({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-xl p-[1px] ${className}`}
    >
      <Spotlight
        className="-z-10 from-pink-600 via-pink-500 to-pink-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-pink-200 dark:via-pink-300 dark:to-pink-400"
        size="100%"
      />
      <div className="relative h-full w-full rounded-xl bg-white dark:bg-black">
        {children}
      </div>
    </div>
  );
}

export type SpotlightProps = {
  className?: string;
  size?: number | string;
  springOptions?: SpringOptions;
};

export function Spotlight({
  className = "",
  size = 300,
  springOptions = { bounce: 0 },
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [parentElement, setParentElement] = useState<HTMLElement | null>(null);

  const mouseX = useSpring(0, springOptions);
  const mouseY = useSpring(0, springOptions);

  const spotlightSize = typeof size === "number" ? `${size}px` : size;
  const spotlightLeft = useTransform(
    mouseX,
    (x) => `calc(${x}px - ${spotlightSize} / 2)`
  );
  const spotlightTop = useTransform(
    mouseY,
    (y) => `calc(${y}px - ${spotlightSize} / 2)`
  );

  useEffect(() => {
    if (containerRef.current) {
      const parent = containerRef.current.parentElement;
      if (parent) {
        parent.style.position = "relative";
        parent.style.overflow = "hidden";
        setParentElement(parent);
      }
    }
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!parentElement) return;
      const { left, top } = parentElement.getBoundingClientRect();
      mouseX.set(event.clientX - left);
      mouseY.set(event.clientY - top);
    },
    [mouseX, mouseY, parentElement]
  );

  useEffect(() => {
    if (!parentElement) return;

    parentElement.addEventListener("mousemove", handleMouseMove);
    parentElement.addEventListener("mouseenter", () => setIsHovered(true));
    parentElement.addEventListener("mouseleave", () => setIsHovered(false));

    return () => {
      parentElement.removeEventListener("mousemove", handleMouseMove);
      parentElement.removeEventListener("mouseenter", () => setIsHovered(true));
      parentElement.removeEventListener("mouseleave", () =>
        setIsHovered(false)
      );
    };
  }, [parentElement, handleMouseMove]);

  return (
    <motion.div
      className={cn(
        "-inset-px pointer-events-none absolute rounded-xl bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops),transparent_80%)] blur-md transition-opacity duration-500 group-hover:duration-200",
        isHovered ? "opacity-100" : "opacity-0",
        className
      )}
      ref={containerRef}
      style={{
        width: spotlightSize,
        height: spotlightSize,
        left: spotlightLeft,
        top: spotlightTop,
      }}
    />
  );
}

export type GlowEffectProps = {
  className?: string;
  style?: React.CSSProperties;
  colors?: string[];
  mode?:
    | "rotate"
    | "pulse"
    | "breathe"
    | "colorShift"
    | "flowHorizontal"
    | "static";
  blur?:
    | number
    | "softest"
    | "soft"
    | "medium"
    | "strong"
    | "stronger"
    | "strongest"
    | "none";
  transition?: Transition;
  scale?: number;
  duration?: number;
};

export function GlowEffect({
  className,
  style,
  colors = ["#FF5733", "#33FF57", "#3357FF", "#F1C40F"],
  mode = "rotate",
  blur = "medium",
  transition,
  scale = 1,
  duration = 5,
}: GlowEffectProps) {
  const BASE_TRANSITION = {
    repeat: Number.POSITIVE_INFINITY,
    duration,
    ease: "linear" as const,
  };

  const animations = {
    rotate: {
      background: [
        `conic-gradient(from 0deg at 50% 50%, ${colors.join(", ")})`,
        `conic-gradient(from 360deg at 50% 50%, ${colors.join(", ")})`,
      ],
      transition: {
        ...(transition ?? BASE_TRANSITION),
      },
    },
    pulse: {
      background: colors.map(
        (color) =>
          `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 100%)`
      ),
      scale: [1 * scale, 1.1 * scale, 1 * scale],
      opacity: [0.5, 0.8, 0.5],
      transition: {
        ...(transition ?? {
          ...BASE_TRANSITION,
          repeatType: "mirror",
        }),
      },
    },
    breathe: {
      background: [
        ...colors.map(
          (color) =>
            `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 100%)`
        ),
      ],
      scale: [1 * scale, 1.05 * scale, 1 * scale],
      transition: {
        ...(transition ?? {
          ...BASE_TRANSITION,
          repeatType: "mirror",
        }),
      },
    },
    colorShift: {
      background: colors.map((color, index) => {
        const nextColor = colors[(index + 1) % colors.length];
        return `conic-gradient(from 0deg at 50% 50%, ${color} 0%, ${nextColor} 50%, ${color} 100%)`;
      }),
      transition: {
        ...(transition ?? {
          ...BASE_TRANSITION,
          repeatType: "mirror",
        }),
      },
    },
    flowHorizontal: {
      background: colors.map((color) => {
        const nextColor = colors[(colors.indexOf(color) + 1) % colors.length];
        return `linear-gradient(to right, ${color}, ${nextColor})`;
      }),
      transition: {
        ...(transition ?? {
          ...BASE_TRANSITION,
          repeatType: "mirror",
        }),
      },
    },
    static: {
      background: `linear-gradient(to right, ${colors.join(", ")})`,
    },
  };

  const getBlurClass = (blur: GlowEffectProps["blur"]) => {
    if (typeof blur === "number") {
      return `blur-[${blur}px]`;
    }

    const presets = {
      softest: "blur-xs",
      soft: "blur-sm",
      medium: "blur-md",
      strong: "blur-lg",
      stronger: "blur-xl",
      strongest: "blur-xl",
      none: "blur-none",
    };

    return presets[blur as keyof typeof presets];
  };

  return (
    <motion.div
      animate={animations[mode]}
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full",
        "scale-[var(--scale)] transform-gpu",
        getBlurClass(blur),
        className
      )}
      style={
        {
          ...style,
          "--scale": scale,
          willChange: "transform",
          backfaceVisibility: "hidden",
        } as React.CSSProperties
      }
    />
  );
}
