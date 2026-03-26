"use client";

import { ArrowRight, Sparkles, Users } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Custom hook to detect if device is mobile
const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      return window.innerWidth < 768;
    };

    setIsMobile(checkMobile());

    const handleResize = () => {
      setIsMobile(checkMobile());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};

// Refined floating element component
const FloatingElement = ({
  children,
  className,
  delay = 0,
  duration = 4,
  yOffset = 8,
  xOffset = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  xOffset?: number;
}) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      animate={{
        y: [0, -yOffset, 0],
        x: [0, xOffset, 0],
      }}
      className={className}
      initial={{ y: 0, x: 0 }}
      transition={{
        duration,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
        ease: [0.4, 0.0, 0.2, 1], // Custom easing for more natural movement
        delay,
      }}
    >
      {children}
    </motion.div>
  );
};

// Refined glowing blob component
const GlowingBlob = ({
  color,
  size = 200,
  top,
  left,
  right,
  bottom,
  delay = 0,
  opacity = 0.15,
  blur = 60,
  duration = 8,
}: {
  color: string;
  size?: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  delay?: number;
  opacity?: number;
  blur?: number;
  duration?: number;
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={{
        scale: prefersReducedMotion ? 1 : [0.8, 1.1, 0.8], // Reduced movement for subtlety
        opacity,
      }}
      className="pointer-events-none absolute rounded-full"
      exit={{
        scale: prefersReducedMotion ? 1 : [0.8, 1.1, 0.8], // Reduced movement for subtlety
        opacity: 0,
        transition: {
          duration: 1.8,
          delay: delay * 0.5,
        },
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      style={{
        width: size,
        height: size,
        top,
        left,
        right,
        bottom,
        background: color,
        filter: `blur(${blur}px)`,
        opacity: 0,
      }}
      transition={{
        scale: {
          duration,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          ease: "easeInOut",
          delay,
        },
        opacity: {
          duration: 1.8,
          delay: delay * 0.5,
        },
      }}
    />
  );
};

// Refined 3D Button component
const Button3D = ({
  children,
  variant = "primary",
  icon,
  href = "#",
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  icon?: React.ReactNode;
  href?: string;
  className?: string;
  delay?: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const prefersReducedMotion = useReducedMotion();

  // Memoize button styles to prevent unnecessary re-renders
  const buttonStyles = useMemo(() => {
    const styles: React.CSSProperties = {
      transformStyle: "preserve-3d",
      transform: isPressed ? "translateY(1px)" : "translateY(0)",
    };

    if (isPressed) {
      styles.boxShadow = "none";
    } else if (variant === "primary") {
      styles.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.15)";
    } else {
      styles.boxShadow = "none";
    }

    return styles;
  }, [isPressed, variant]);

  return (
    <motion.a
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.6,
          ease: [0.23, 1, 0.32, 1],
          delay,
        },
      }}
      aria-label={typeof children === "string" ? children : "Button"}
      className={cn(
        "group relative overflow-hidden rounded-full",
        "inline-flex items-center justify-center",
        "px-5 py-2.5 font-medium text-sm",
        "transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        variant === "primary"
          ? "bg-primary text-primary-foreground"
          : "border border-input bg-background text-foreground",
        className
      )}
      href={href}
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      onBlur={() => setIsFocused(false)}
      onFocus={() => setIsFocused(true)}
      onMouseDown={() => setIsPressed(true)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseUp={() => setIsPressed(false)}
      onTouchEnd={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      role="button"
      style={buttonStyles}
      whileHover={{
        scale: prefersReducedMotion ? 1 : 1.03,
        y: prefersReducedMotion ? 0 : -2,
        transition: { duration: 0.2 },
      }}
      whileTap={{
        scale: 0.97,
        y: 1,
        transition: { duration: 0.1 },
      }}
    >
      {/* Button highlight effect */}
      <motion.div
        animate={{ opacity: isHovered || isFocused ? 1 : 0 }}
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity",
          variant === "primary" ? "bg-white/10" : "bg-black/5"
        )}
        transition={{ duration: 0.2 }}
      />

      {/* Button content */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {icon && (
          <motion.span
            animate={{
              x: (isHovered || isFocused) && !prefersReducedMotion ? 3 : 0,
              scale:
                (isHovered || isFocused) && !prefersReducedMotion ? 1.1 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.span>
        )}
      </span>
    </motion.a>
  );
};

// Refined animated text component
const AnimatedText = ({
  text,
  className,
  delay = 0,
  staggerChildren = 0.03,
  fontSize = "text-2xl",
  fontWeight = "font-bold",
}: {
  text: string;
  className?: string;
  delay?: number;
  staggerChildren?: number;
  fontSize?: string;
  fontWeight?: string;
}) => {
  const words = text.split(" ");
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <span className={cn(fontSize, fontWeight, className)}>{text}</span>;
  }

  return (
    <span className={cn(fontSize, fontWeight, className)}>
      {words.map((word, i) => (
        <span
          className="mr-[0.25em] inline-block overflow-hidden pb-0.5 text-black"
          key={i}
        >
          <motion.span
            animate={{
              y: 0,
              opacity: 1,
              rotateX: 0,
            }}
            className="inline-block"
            initial={{ y: 35, opacity: 0, rotateX: 15 }}
            transition={{
              duration: 0.7,
              ease: [0.23, 1, 0.32, 1],
              delay: delay + i * staggerChildren,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

// Refined user avatar component
const UserAvatar = ({ index, delay }: { index: number; delay: number }) => {
  const colors = [
    "bg-fuchsia-400",
    "bg-cyan-400",
    "bg-pink-400",
    "bg-purple-400",
    "bg-indigo-400",
  ];

  return (
    <motion.div
      animate={{
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 20,
          delay,
        },
      }}
      className={cn(
        "h-7 w-7 rounded-full border-[1.5px] border-background",
        "flex items-center justify-center",
        "font-medium text-[10px] text-neutral-800",
        "relative hover:z-10",
        colors[index % colors.length]
      )}
      initial={{ opacity: 0, x: -10, scale: 0.8 }}
      whileHover={{
        scale: 1.15,
        transition: { duration: 0.2 },
      }}
    >
      {String.fromCharCode(65 + index)}
    </motion.div>
  );
};

// Refined grid background component
const CardGridBackground = ({ isDark }: { isDark: boolean }) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <motion.div
      animate={{
        opacity: 1,
        transition: { duration: 1.5 },
      }}
      className="absolute inset-0 overflow-hidden rounded-xl"
      initial={{ opacity: 0 }}
    >
      <motion.div
        animate={{
          rotateX: 60,
          y: 0,
          opacity: 0.4,
          transition: {
            duration: 1.2,
            ease: [0.23, 1, 0.32, 1],
          },
        }}
        className="absolute inset-x-0 bottom-0 h-[700px]"
        initial={{ rotateX: 65, y: 20, opacity: 0 }}
        style={{
          perspective: 800,
          transformStyle: "preserve-3d",
          transformOrigin: "center bottom",
        }}
      >
        <div
          className="h-full w-full"
          style={{
            backgroundSize: "20px 20px",
            backgroundImage: isDark
              ? "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)"
              : "linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)",
          }}
        />
      </motion.div>
    </motion.div>
  );
};

// Refined subtle particle effect
const Particles = ({
  count = 12,
  isDark = false,
}: {
  count?: number;
  isDark?: boolean;
}) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) return null;

  // Memoize particles to prevent re-renders
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const size = Math.random() * 2 + 1;
      const duration = Math.random() * 10 + 15; // Slower for more subtlety
      const initialX = Math.random() * 100;
      const initialY = Math.random() * 100;
      const delay = Math.random() * 5;

      return { id: i, size, duration, initialX, initialY, delay };
    });
  }, [count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map(({ id, size, duration, initialX, initialY, delay }) => (
        <motion.div
          animate={{
            x: [`${initialX}%`, `${initialX + (Math.random() * 8 - 4)}%`],
            y: [`${initialY}%`, `${initialY - Math.random() * 12}`],
            opacity: [0, 0.3, 0], // Reduced opacity for subtlety
          }}
          className={`absolute rounded-full ${
            isDark ? "bg-white/8" : "bg-black/4"
          }`}
          initial={{ opacity: 0 }}
          key={id}
          style={{
            width: size,
            height: size,
            x: `${initialX}%`,
            y: `${initialY}%`,
          }}
          transition={{
            duration,
            ease: "linear",
            repeat: Number.POSITIVE_INFINITY,
            delay,
          }}
        />
      ))}
    </div>
  );
};

export function CTACard() {
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useMobile();
  const [isHovered, setIsHovered] = useState(false);

  // Memoize card shadow styles to prevent unnecessary re-renders
  const cardShadowStyle = useMemo(() => {
    const shadowStyle: React.CSSProperties = {};

    if (isHovered && !prefersReducedMotion) {
      shadowStyle.boxShadow =
        "0px 1px 1px 0px rgba(0, 0, 0, 0.05), 0px 1px 1px 0px rgba(255, 252, 240, 0.5) inset, 0px 0px 0px 1px hsla(0, 0%, 100%, 0.1) inset, 0px 0px 1px 0px rgba(28, 27, 26, 0.5), 0px 20px 50px -12px rgba(0, 0, 0, 0.15)";
    } else {
      shadowStyle.boxShadow =
        "0px 1px 1px 0px rgba(0, 0, 0, 0.05), 0px 1px 1px 0px rgba(255, 252, 240, 0.5) inset, 0px 0px 0px 1px hsla(0, 0%, 100%, 0.1) inset, 0px 0px 1px 0px rgba(28, 27, 26, 0.5)";
    }

    return shadowStyle;
  }, [isHovered, prefersReducedMotion]);

  return (
    <div className="flex flex-col items-center justify-center space-y-10">
      <motion.div
        animate={{
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.8,
            ease: [0.23, 1, 0.32, 1],
          },
        }}
        className="w-full max-w-5xl"
        initial={{ opacity: 0, y: 30 }}
        onHoverEnd={() => setIsHovered(false)}
        onHoverStart={() => setIsHovered(true)}
      >
        <Card
          className="relative overflow-hidden border-none transition-shadow duration-500 ease-out lg:rounded-4xl"
          style={cardShadowStyle}
        >
          {/* Card background with effects */}
          <div className="absolute inset-1 z-0">
            <CardGridBackground isDark={false} />
            <Particles count={isMobile ? 8 : 12} isDark={false} />

            {!prefersReducedMotion && (
              <>
                <GlowingBlob
                  blur={isHovered ? 70 : 50}
                  color="#8b5cf680"
                  delay={0.2}
                  duration={10}
                  left="-5%"
                  opacity={isHovered ? 0.65 : 0.15}
                  size={400}
                  top="-15%"
                />

                <GlowingBlob
                  blur={60}
                  bottom="-10%"
                  color="#ec489980"
                  delay={0.5}
                  duration={12}
                  opacity={isHovered ? 0.55 : 0.25}
                  right="-5%"
                  size={350}
                />
                <GlowingBlob
                  blur={80}
                  bottom="20%"
                  color="#3b82f680"
                  delay={0.8}
                  duration={15}
                  opacity={isHovered ? 0.55 : 0.25}
                  // opacity={isHovered ? 0.45 : 0.15}
                  right="15%"
                  size={300}
                />
              </>
            )}
          </div>

          <CardContent className="relative z-10 p-8 sm:p-10 lg:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between lg:text-left">
              {/* Content section - vertical on mobile/tablet, left side on desktop */}
              <div className="flex flex-col items-center text-center lg:max-w-xl lg:items-start lg:text-left">
                {/* Floating sparkle icon */}
                <FloatingElement
                  className="mb-4 text-primary"
                  delay={0.5}
                  yOffset={5} // Reduced movement
                >
                  <motion.div
                    animate={{
                      scale: 1,
                      rotate: 0,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 15,
                        delay: 0.2,
                      },
                    }}
                    initial={{ scale: 0, rotate: -20 }}
                  >
                    <AIIcon className="size-6 md:size-8 xl:size-10" />
                  </motion.div>
                </FloatingElement>

                {/* Heading */}
                <div className="mb-6 space-y-4 lg:mb-8">
                  <h2
                    className={cn("leading-tight tracking-tight", "text-white")}
                  >
                    <AnimatedText
                      className="pb-2 lg:text-left"
                      delay={0.3}
                      fontSize="text-2xl sm:text-3xl lg:text-4xl "
                      fontWeight="font-light"
                      text="Transform your digital"
                    />
                    <br />
                    <AnimatedText
                      className="lg:text-left"
                      delay={0.5}
                      fontSize="text-2xl sm:text-3xl lg:text-4xl"
                      fontWeight="font-bold"
                      text="experience today"
                    />
                  </h2>

                  <motion.p
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: {
                        type: "spring",
                        stiffness: 100,
                        damping: 15,
                        delay: 0.7,
                      },
                    }}
                    className={cn(
                      "mx-auto max-w-md text-sm sm:text-base lg:mx-0 lg:pr-4",
                      "text-neutral-700"
                    )}
                    initial={{ opacity: 0, y: 20 }}
                  >
                    Join thousands of innovators who are already building the
                    future with our cutting-edge platform.
                  </motion.p>
                </div>

                {/* Social proof - only visible on mobile/tablet */}
                <motion.div
                  animate={{
                    opacity: 1,
                    transition: {
                      duration: 0.5,
                      delay: 1.1,
                    },
                  }}
                  className="mb-8 flex flex-col items-center lg:hidden"
                  initial={{ opacity: 0 }}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <motion.div
                      animate={{
                        scale: 1,
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 15,
                          delay: 1.1,
                        },
                      }}
                      initial={{ scale: 0 }}
                    >
                      <Users className={"text-neutral-400"} size={14} />
                    </motion.div>
                    <div className="-space-x-1.5 flex">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <UserAvatar delay={1.2 + i * 0.08} index={i} key={i} />
                      ))}
                    </div>
                  </div>

                  <motion.p
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.4,
                        delay: 1.6,
                      },
                    }}
                    className={cn("text-xs", "text-neutral-400")}
                    initial={{ opacity: 0, y: 8 }}
                  >
                    <span className="font-medium">10,000+</span> companies trust
                    our platform
                  </motion.p>
                </motion.div>
              </div>

              {/* CTA section - vertical on mobile/tablet, right side on desktop */}
              <div className="flex flex-col lg:ml-8 lg:min-w-[240px] lg:items-end xl:ml-12">
                {/* CTA Buttons */}
                <div className="flex w-full flex-col gap-3">
                  <Button3D
                    className="w-full"
                    delay={0.9}
                    href="#get-started"
                    icon={<ArrowRight size={14} />}
                    variant="primary"
                  >
                    Get started
                  </Button3D>

                  <Button3D
                    className="w-full"
                    delay={1.0}
                    href="#learn-more"
                    variant="secondary"
                  >
                    Learn more
                  </Button3D>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      {/* Social proof - only visible on desktop */}
      <SocialProof isDark={false} />
    </div>
  );
}

function SocialProof({ isDark }: { isDark: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.8,
          ease: [0.23, 1, 0.32, 1],
          delay: 1.1,
        },
      }}
      className="hidden items-center lg:flex lg:flex-col"
      initial={{ opacity: 0, y: 20 }}
      onHoverEnd={() => setIsHovered(false)}
      onHoverStart={() => setIsHovered(true)}
    >
      <motion.div
        className={cn(
          "mb-3 flex items-center gap-4 rounded-full px-5 py-2.5",
          "backdrop-blur-sm transition-colors duration-500",
          isDark
            ? "border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04]"
            : "border border-black/[0.02] bg-black/[0.01] hover:bg-black/[0.02]"
        )}
      >
        <motion.div
          animate={{
            scale: 1,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 15,
              delay: 1.3,
            },
          }}
          initial={{ scale: 0 }}
          whileHover={{
            rotate: prefersReducedMotion ? 0 : 15,
            scale: prefersReducedMotion ? 1 : 1.1,
            transition: { duration: 0.2 },
          }}
        >
          <Users
            className={cn(
              "transition-colors duration-500",
              isDark
                ? isHovered
                  ? "text-primary"
                  : "text-neutral-400"
                : isHovered
                  ? "text-primary"
                  : "text-neutral-500"
            )}
            size={18}
          />
        </motion.div>

        <div className="-space-x-3 flex">
          {[0, 1, 2, 3, 4].map((i) => (
            <UserAvatar delay={1.4 + i * 0.08} index={i} key={i} />
          ))}
        </div>

        <motion.div
          animate={{
            opacity: 1,
            x: 0,
            transition: {
              duration: 0.4,
              delay: 1.8,
            },
          }}
          className={cn(
            "pl-1 font-medium text-sm transition-colors duration-500",
            isDark
              ? isHovered
                ? "text-primary"
                : "text-neutral-400"
              : isHovered
                ? "text-primary"
                : "text-neutral-600"
          )}
          initial={{ opacity: 0, x: -10 }}
        >
          <motion.span
            animate={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 2 }}
          >
            10k+
          </motion.span>
        </motion.div>
      </motion.div>

      <motion.p
        animate={{
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            delay: 1.9,
          },
        }}
        className={cn(
          "text-center text-xs",
          isDark ? "text-neutral-400" : "text-neutral-500"
        )}
        initial={{ opacity: 0, y: 8 }}
      >
        <motion.span
          className="font-medium"
          whileHover={{
            color: "var(--primary)",
            transition: { duration: 0.2 },
          }}
        >
          Trusted
        </motion.span>{" "}
        by innovative companies worldwide
      </motion.p>
    </motion.div>
  );
}

function AIIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      color={"#000000"}
      fill={"none"}
      height={24}
      viewBox="0 0 24 24"
      width={24}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M11.5 6C7.02166 6 4.78249 6 3.39124 7.17157C2 8.34315 2 10.2288 2 14C2 17.7712 2 19.6569 3.39124 20.8284C4.78249 22 7.02166 22 11.5 22C15.9783 22 18.2175 22 19.6088 20.8284C21 19.6569 21 17.7712 21 14C21 12.8302 21 11.8419 20.9585 11"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <path
        d="M18.5 2L18.7579 2.69703C19.0961 3.61102 19.2652 4.06802 19.5986 4.40139C19.932 4.73477 20.389 4.90387 21.303 5.24208L22 5.5L21.303 5.75792C20.389 6.09613 19.932 6.26524 19.5986 6.59861C19.2652 6.93198 19.0961 7.38898 18.7579 8.30297L18.5 9L18.2421 8.30297C17.9039 7.38898 17.7348 6.93198 17.4014 6.59861C17.068 6.26524 16.611 6.09613 15.697 5.75792L15 5.5L15.697 5.24208C16.611 4.90387 17.068 4.73477 17.4014 4.40139C17.7348 4.06802 17.9039 3.61102 18.2421 2.69703L18.5 2Z"
        opacity="0.4"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M12 10V18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M9 12V16"
        opacity="0.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M6 13V15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M15 12V16"
        opacity="0.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M18 13V15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
