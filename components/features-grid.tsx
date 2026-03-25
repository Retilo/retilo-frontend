"use client";

import type { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";
import { motion, useAnimation, useInView } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

import { GlowEffect, SpotlightBorder } from "./effects";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 50,
      damping: 20,
    },
  },
};

interface Feature {
  title: string;
  description: string;
  icon: string;
  gridClassName?: string;
  isLarge?: boolean;
  features?: string[];
  mysticalSymbol?:
    | "alchemy"
    | "pentagram"
    | "triquetra"
    | "flower-of-life"
    | "metatron"
    | "tree-of-life";
  customContent?: {
    type: "grid" | "animation" | "terminal" | "api";
    data: any;
  };
}

interface BentoGridProps {
  features: Feature[];
}

const MysticalSymbols = {
  alchemy: (
    <svg
      className="h-32 w-32 transform-gpu text-pink-500/50 dark:text-pink-400/50"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      viewBox="0 0 100 100"
    >
      <circle cx="50" cy="50" r="45" />
      <path d="M50 5 L50 95" />
      <path d="M20 20 L80 80" />
      <path d="M20 80 L80 20" />
      <circle cx="50" cy="30" r="10" />
      <circle cx="50" cy="70" r="10" />
      <path d="M30 50 L70 50" />
      <motion.path d="M50 10 A40 40 0 0 1 90 50 A40 40 0 0 1 50 90 A40 40 0 0 1 10 50 A40 40 0 0 1 50 10" />
    </svg>
  ),
  pentagram: (
    <svg
      className="h-32 w-32 transform-gpu text-pink-500/50 dark:text-pink-400/50"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      viewBox="0 0 100 100"
    >
      <circle cx="50" cy="50" r="45" />
      <path d="M50 5 L20 95 L95 35 L5 35 L80 95 Z" />
      <circle cx="50" cy="50" fill="currentColor" r="5" />
      <motion.path d="M50 5 A45 45 0 0 1 95 50 A45 45 0 0 1 50 95 A45 45 0 0 1 5 50 A45 45 0 0 1 50 5" />
    </svg>
  ),
  triquetra: (
    <svg
      className="h-32 w-32 transform-gpu text-pink-500/50 dark:text-pink-400/50"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      viewBox="0 0 100 100"
    >
      <circle cx="50" cy="50" r="45" />
      <path d="M50 10 A20 20 0 0 1 85 60 A20 20 0 0 1 15 60 A20 20 0 0 1 50 10" />
      <path d="M50 10 A20 20 0 0 1 85 60 A20 20 0 0 1 50 10" />
      <path d="M85 60 A20 20 0 0 1 15 60 A20 20 0 0 1 85 60" />
      <circle cx="50" cy="50" fill="currentColor" r="5" />
    </svg>
  ),
  "flower-of-life": (
    <svg
      className="h-32 w-32 transform-gpu text-pink-500/50 dark:text-pink-400/50"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      viewBox="0 0 100 100"
    >
      <circle cx="50" cy="50" r="45" />
      <circle cx="50" cy="25" r="20" />
      <circle cx="72" cy="38" r="20" />
      <circle cx="72" cy="62" r="20" />
      <circle cx="50" cy="75" r="20" />
      <circle cx="28" cy="62" r="20" />
      <circle cx="28" cy="38" r="20" />
      <motion.circle cx="50" cy="50" r="15" />
    </svg>
  ),
  metatron: (
    <svg
      className="h-32 w-32 transform-gpu text-pink-500/50 dark:text-pink-400/50"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      viewBox="0 0 100 100"
    >
      <circle cx="50" cy="50" r="45" />
      <path d="M50 5 L95 50 L50 95 L5 50 Z" />
      <path d="M50 20 L80 50 L50 80 L20 50 Z" />
      <path d="M50 35 L65 50 L50 65 L35 50 Z" />
      <circle cx="50" cy="50" fill="currentColor" r="5" />
      <motion.path d="M50 5 L95 50 L50 95 L5 50 Z" />
    </svg>
  ),
  "tree-of-life": (
    <svg
      className="h-32 w-32 transform-gpu text-pink-500/50 dark:text-pink-400/50"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      viewBox="0 0 100 100"
    >
      <circle cx="50" cy="50" r="45" />
      <circle cx="50" cy="10" r="5" />
      <circle cx="30" cy="30" r="5" />
      <circle cx="70" cy="30" r="5" />
      <circle cx="50" cy="50" r="5" />
      <circle cx="30" cy="70" r="5" />
      <circle cx="70" cy="70" r="5" />
      <circle cx="50" cy="90" r="5" />
      <path d="M50 10 L30 30 L70 30 Z" />
      <path d="M30 30 L70 30 L50 50 Z" />
      <path d="M30 70 L70 70 L50 50 Z" />
      <path d="M50 90 L30 70 L70 70 Z" />
      <motion.path d="M50 10 L30 30 L30 70 L50 90 L70 70 L70 30 Z" />
    </svg>
  ),
};

const renderCustomContent = (
  customContent: Feature["customContent"],
  isDark: boolean
) => {
  if (!customContent) return null;

  switch (customContent.type) {
    case "grid":
      return (
        <div className="mt-4 grid grid-cols-5 gap-2">
          {[...Array(customContent.data)].map((_, i) => (
            <motion.div
              animate={{ scale: 1, rotate: 0 }}
              className="aspect-square w-full rounded-sm bg-gray-200 dark:bg-zinc-800"
              initial={{ scale: 0, rotate: -10 }}
              key={i}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.5 + i * 0.05,
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            />
          ))}
        </div>
      );
    case "animation":
      return (
        <motion.div className="relative mt-4 h-24">
          <motion.div
            animate={{
              rotate: [0, 360],
              transition: {
                duration: 20,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              },
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotateY: [0, 180, 360],
                transition: {
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                },
              }}
              className="h-16 w-16 rounded-md border border-pink-500"
            />
          </motion.div>
        </motion.div>
      );
    case "terminal":
      return (
        <motion.div
          animate={{ width: "100%" }}
          className="mt-4 overflow-hidden rounded bg-gray-100 px-2 py-1 font-mono text-pink-500 text-xs dark:bg-zinc-800"
          initial={{ width: 0 }}
          transition={{ delay: 0.4, duration: 0.5, ease: "easeInOut" }}
        >
          <motion.span
            animate={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            {customContent.data}
          </motion.span>
        </motion.div>
      );
    case "api":
      return (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {customContent.data.map((api: string, i: number) => (
            <motion.div
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1 font-mono text-xs"
              initial={{ opacity: 0, x: -20 }}
              key={api}
              transition={{
                delay: 0.4 + i * 0.1,
                type: "spring",
                stiffness: 70,
              }}
            >
              <motion.span
                animate={{
                  opacity: [0.5, 1, 0.5],
                  transition: {
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  },
                }}
                className="text-gray-400 dark:text-zinc-500"
              >
                ......
              </motion.span>
              <span className="text-gray-600 dark:text-gray-400">{api}</span>
              <motion.span
                animate={{
                  opacity: [0.5, 1, 0.5],
                  transition: {
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 0.5,
                  },
                }}
                className="text-pink-500"
              >
                /v1/{api}
              </motion.span>
            </motion.div>
          ))}
        </div>
      );
    default:
      return null;
  }
};

const FeatureCard = ({
  feature,
  cardStyle,
}: {
  feature: Feature;
  cardStyle: React.CSSProperties;
}) => {
  const Icon = Icons[feature.icon] as LucideIcon;

  return (
    <MotionCard
      className={cn(
        "relative flex h-full flex-col rounded-xl p-6 backdrop-blur-sm",
        feature.isLarge ? "col-span-2 row-span-2" : "",
        "transition-colors duration-500",
        "bg-white/80 dark:bg-black/80"
      )}
      gridClassName={feature.gridClassName}
      isLarge={feature.isLarge}
      style={cardStyle}
    >
      {(isHovered: boolean) => (
        <>
          {feature.isLarge && (
            <div className="-z-10 absolute inset-0 overflow-hidden rounded-xl">
              {/* Base glow */}
              <GlowEffect
                blur="strong"
                colors={[
                  "rgba(255, 20, 147, 0.15)", // Softer pink
                  "rgba(147, 20, 255, 0.15)", // Softer purple
                  "rgba(20, 147, 255, 0.15)", // Soft blue
                  "rgba(255, 105, 180, 0.15)", // Light pink
                ]}
                duration={30}
                mode="rotate"
                scale={1.8}
                style={{
                  opacity: isHovered ? 0.9 : 0,
                  transform: `scale(${isHovered ? 1.4 : 0.8})`,
                  transition: "all 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                transition={{
                  delay: 0,
                  duration: 30,
                  ease: "linear",
                  repeat: Number.POSITIVE_INFINITY,
                }}
              />
              {/* Mystical Symbol */}
              {feature.mysticalSymbol && (
                <motion.div
                  animate={{
                    opacity: isHovered ? 0.12 : 0,
                    scale: isHovered ? 1.1 : 0.8,
                    rotate: isHovered ? 360 : 0,
                  }}
                  className="pointer-events-none absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    duration: 1.2,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                >
                  {MysticalSymbols[feature.mysticalSymbol]}
                </motion.div>
              )}
              {/* Accent glow */}
              <GlowEffect
                blur="medium"
                colors={[
                  "rgba(255, 20, 147, 0.2)", // Pink
                  "rgba(147, 20, 255, 0.15)", // Purple
                  "rgba(255, 105, 180, 0.1)", // Light pink
                  "rgba(180, 105, 255, 0.15)", // Light purple
                ]}
                duration={3}
                mode="breathe"
                scale={0.4}
                style={{
                  opacity: isHovered ? 0.85 : 0,
                  transform: `scale(${isHovered ? 1.1 : 0.9})`,
                  transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
                  borderRadius: 9999,
                }}
                transition={{
                  duration: 6,
                  ease: "easeInOut",
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "mirror",
                }}
              />
              {/* Subtle ambient glow */}
              <GlowEffect
                blur="soft"
                colors={[
                  "rgba(255, 182, 193, 0.07)", // Very light pink
                  "rgba(230, 230, 250, 0.07)", // Very light purple
                ]}
                duration={4}
                mode="pulse"
                scale={2}
                style={{
                  opacity: isHovered ? 0.6 : 0,
                  transform: `scale(${isHovered ? 1.5 : 1})`,
                  transition: "all 1.4s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                transition={{
                  duration: 8,
                  ease: "easeInOut",
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "mirror",
                }}
              />
            </div>
          )}
          <div className="relative z-10">
            <div
              className={cn(
                "flex items-start gap-4",
                !feature.isLarge && "flex-col"
              )}
            >
              <motion.div
                animate={{ scale: 1 }}
                initial={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <Icon className="h-6 w-6 text-pink-500" />
              </motion.div>
              <div className="space-y-2">
                <motion.h3
                  animate={{ opacity: 1, y: 0 }}
                  className="font-semibold text-base text-black dark:text-white"
                  initial={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                >
                  {feature.title}
                </motion.h3>
                <motion.p
                  animate={{ opacity: 1 }}
                  className="text-gray-600 text-sm dark:text-gray-400"
                  dangerouslySetInnerHTML={{ __html: feature.description }}
                  initial={{ opacity: 0 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 70 }}
                />
                {feature.features && (
                  <ul className="space-y-2 text-sm">
                    {feature.features.map((item, i) => (
                      <motion.li
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        key={i}
                        transition={{
                          delay: 0.4 + i * 0.1,
                          type: "spring",
                          stiffness: 70,
                        }}
                      >
                        <svg
                          className="h-3 w-3 flex-none text-pink-500"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <motion.path
                            animate={{ pathLength: 1 }}
                            d="M5 13l4 4L19 7"
                            initial={{ pathLength: 0 }}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            transition={{
                              duration: 0.5,
                              delay: 0.5 + i * 0.1,
                              ease: "easeInOut",
                            }}
                          />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-400">
                          {item}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            {feature.customContent &&
              renderCustomContent(feature.customContent, false)}
          </div>
        </>
      )}
    </MotionCard>
  );
};

const MotionCard = ({
  children,
  className,
  gridClassName,
  isLarge = false,
  ...props
}: {
  children?: React.ReactNode | ((isHovered: boolean) => React.ReactNode);
  className?: string;
  style?: React.CSSProperties;
  gridClassName?: string;
  isLarge?: boolean;
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isHovered, setIsHovered] = useState(false);

  const shadowClass = isDark
    ? "shadow-[0px_8px_16px_rgba(0,_0,_0,_0.5),_0px_4px_8px_rgba(0,_0,_0,_0.4),_0px_2px_4px_rgba(0,_0,_0,_0.3),_0px_1px_2px_rgba(255,_255,_255,_0.05)_inset,_0px_0px_0px_1px_rgba(255,_255,_255,_0.03)_inset,_0px_-2px_4px_rgba(0,_0,_0,_0.2)_inset,_0px_1px_1px_rgba(255,_255,_255,_0.01)] rounded-3xl"
    : "shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)] rounded-3xl";

  const CardContent = (
    <motion.div
      className={cn(
        "overflow-hidden backdrop-blur-[2px] transition-all duration-300",
        "transform-gpu",
        shadowClass,
        className
      )}
      onHoverEnd={() => setIsHovered(false)}
      onHoverStart={() => setIsHovered(true)}
      style={{
        transformOrigin: "center center",
        ...props.style,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 1,
        scale: {
          type: "spring",
          stiffness: 300,
          damping: 20,
        },
      }}
      variants={item}
      {...props}
    >
      {typeof children === "function" ? children(isHovered) : children}
    </motion.div>
  );

  return isLarge ? (
    <div className={cn("relative", gridClassName)}>{CardContent}</div>
  ) : (
    <SpotlightBorder className="group h-full">{CardContent}</SpotlightBorder>
  );
};

export default function BentoGrid({ features }: BentoGridProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref);

  useEffect(() => {
    if (inView) {
      controls.start("show");
    }
  }, [controls, inView]);

  const cardStyle = {
    background: isDark ? "rgb(17, 17, 17)" : "rgb(255, 255, 255)",
  };

  return (
    <motion.div
      animate={controls}
      className="mx-auto w-full max-w-7xl px-4"
      initial="hidden"
      ref={ref}
      variants={container}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 [&>*]:h-full">
        {features.map((feature, index) => (
          <FeatureCard cardStyle={cardStyle} feature={feature} key={index} />
        ))}
      </div>
    </motion.div>
  );
}
