"use client";

import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(0);
  const containerRef = useRef<HTMLElement>(null);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isScrolling, setIsScrolling] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [cpuLoad, setCpuLoad] = useState(20);
  const [requestCount, setRequestCount] = useState(1200);

  // Update viewport height on mount and resize
  useEffect(() => {
    const updateHeight = () => setViewportHeight(window.innerHeight);
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuLoad((prev) => {
        const newValue = prev + (Math.random() * 6 - 3);
        return Math.min(Math.max(newValue, 15), 35); // Keep between 15-35%
      });

      setRequestCount((prev) => {
        const newValue = prev + (Math.random() * 200 - 100);
        return Math.round(Math.min(Math.max(newValue, 800), 1800)); // Keep between 800-1800
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      id: "models",
      title: "Pre-trained models",
      description:
        "Access state-of-the-art models without setup. Fine-tune with your data in minutes.",
      color: "from-blue-500 to-indigo-600",
      icon: (
        <svg
          fill="none"
          height="24"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 3C10.9 3 10 3.9 10 5C10 6.1 10.9 7 12 7C13.1 7 14 6.1 14 5C14 3.9 13.1 3 12 3Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M8 10C6.9 10 6 10.9 6 12C6 13.1 6.9 14 8 14C9.1 14 10 13.1 10 12C10 10.9 9.1 10 8 10Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M16 10C14.9 10 14 10.9 14 12C14 13.1 14.9 14 16 14C17.1 14 18 13.1 18 12C18 10.9 17.1 10 16 10Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M12 17C10.9 17 10 17.9 10 19C10 20.1 10.9 21 12 21C13.1 21 14 20.1 14 19C14 17.9 13.1 17 12 17Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M10 5H7C5.89543 5 5 5.89543 5 7V8"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M14 5H17C18.1046 5 19 5.89543 19 7V8"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M10 19H7C5.89543 19 5 18.1046 5 17V16"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M14 19H17C18.1046 19 19 18.1046 19 17V16"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      ),
      stats: [
        { label: "Available models", value: "50+" },
        { label: "Fine-tuning time", value: "5 min" },
        { label: "Avg. accuracy", value: "97.8%" },
      ],
      visual: "/placeholder.svg?height=400&width=400",
    },
    {
      id: "inference",
      title: "Serverless inference",
      description:
        "Scale from zero to millions of requests. Pay only for what you use with 99.9% uptime.",
      color: "from-purple-500 to-pink-600",
      icon: (
        <svg
          fill="none"
          height="24"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13 10V3L4 14H11V21L20 10H13Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      ),
      stats: [
        { label: "Cold start", value: "300ms" },
        { label: "Avg. latency", value: "120ms" },
        { label: "Cost per request", value: "$0.0001" },
      ],
      visual: "/placeholder.svg?height=400&width=400",
    },
    {
      id: "prompts",
      title: "Prompt engineering",
      description:
        "Design and optimize prompts with our visual editor. Version control your prompts in real-time.",
      color: "from-emerald-500 to-teal-600",
      icon: (
        <svg
          fill="none"
          height="24"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 16.5V21"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M7 21H17"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M7 3.5H17"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M11 8.5H16"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M8 12.5H16"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M7 16.5H17"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M12 3.5V8.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      ),
      stats: [
        { label: "Prompt templates", value: "100+" },
        { label: "Version control", value: "Built-in" },
        { label: "Avg. improvement", value: "32%" },
      ],
      visual: "/placeholder.svg?height=400&width=400",
    },
  ];

  // Scroll-linked navigation
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Track scroll position to update active feature
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Only update if we're actually scrolling (prevents auto-scroll from changing active feature)
    if (!isScrolling) return;

    // Calculate which feature should be active based on scroll position
    const scrollPosition = latest * (features.length - 1);
    const newActiveFeature = Math.round(scrollPosition);

    if (
      newActiveFeature !== activeFeature &&
      newActiveFeature >= 0 &&
      newActiveFeature < features.length
    ) {
      setActiveFeature(newActiveFeature);
    }
  });

  // Handle manual feature selection
  const selectFeature = (index: number) => {
    if (activeFeature === index) return;

    setActiveFeature(index);
    setIsScrolling(false); // Disable scroll tracking temporarily

    // Scroll to the selected feature with improved behavior
    if (featureRefs.current[index]) {
      const targetElement = featureRefs.current[index];
      const offset = 80; // Account for header height

      if (targetElement) {
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }

      // Add haptic feedback on mobile if available
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(5);
      }

      // Re-enable scroll tracking after animation completes
      setTimeout(() => setIsScrolling(true), 1000);
    }
  };

  // Enable scroll tracking on mount
  useEffect(() => {
    setIsScrolling(true);
  }, []);

  useEffect(() => {
    // Add keyboard navigation for the feature tabs
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "BUTTON" &&
        document.activeElement.getAttribute("aria-pressed") === "true"
      ) {
        if (e.key === "ArrowRight" && activeFeature < features.length - 1) {
          selectFeature(activeFeature + 1);
        } else if (e.key === "ArrowLeft" && activeFeature > 0) {
          selectFeature(activeFeature - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeFeature, features.length]);

  // Handle keyboard focus management for accessibility
  const setFocusToElement = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <main
      className="relative bg-white dark:bg-black"
      id="features"
      ref={containerRef}
    >
      {/* Accessibility: Add skip link */}
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-4 focus:rounded focus:bg-white focus:p-4 focus:text-primary dark:focus:bg-black"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          setFocusToElement("main-content");
        }}
      >
        Skip to main content
      </a>

      {/* Header content - existing code continues... */}
      <section className="sticky top-0 z-10 border-gray-200/70 border-b bg-white/90 shadow-sm backdrop-blur-xl dark:border-gray-800/70 dark:bg-black/90">
        <motion.div
          className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600"
          style={{ width: `${scrollYProgress.get() * 100}%` }}
        />
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-5 md:flex-row">
          <h2 className="font-bold text-xl tracking-tight md:text-2xl">
            AI Development Platform
          </h2>

          <div className="scrollbar-hide -mx-4 flex w-full gap-2 overflow-x-auto px-4 pb-2 md:w-auto md:pb-0">
            {features.map((feature, index) => (
              <motion.button
                aria-label={`Show ${feature.title} feature`}
                aria-pressed={activeFeature === index}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 font-medium text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500",
                  activeFeature === index
                    ? `bg-gradient-to-r ${feature.color} text-white shadow-md`
                    : "bg-gray-100/80 text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-800/80 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                )}
                id={`feature-button-${index}`}
                key={feature.id}
                onClick={() => selectFeature(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative flex h-4 w-4 items-center justify-center">
                  {activeFeature === index && (
                    <motion.div
                      animate={{ opacity: 0.2 }}
                      className="absolute inset-0 rounded-full bg-white"
                      initial={{ opacity: 0 }}
                      layoutId="activeIndicator"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  <span className={activeFeature === index ? "text-white" : ""}>
                    {feature.icon}
                  </span>
                </span>
                {feature.title}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Feature sections */}
      <section className="relative" id="main-content" tabIndex={-1}>
        {features.map((feature, index) => (
          <div
            className={cn(
              "relative flex min-h-[90vh] items-center overflow-hidden py-24 md:py-32",
              index % 2 === 0
                ? "bg-gray-50 dark:bg-gray-900/30"
                : "bg-white dark:bg-black"
            )}
            key={feature.id}
            ref={(el) => {
              featureRefs.current[index] = el;
            }}
          >
            {index % 2 === 0 && (
              <div className="pointer-events-none absolute inset-0 bg-[length:20px_20px] bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
            )}
            <div className="container mx-auto px-4">
              <div className="grid items-center gap-12 md:grid-cols-2">
                <div
                  className={cn(
                    "order-2 md:order-1",
                    index % 2 === 1 && "md:order-2"
                  )}
                >
                  <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true, margin: "-100px" }}
                    whileInView={{ opacity: 1, y: 0 }}
                  >
                    <div
                      className={cn(
                        "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r shadow-lg",
                        feature.color
                      )}
                    >
                      <span className="text-white">{feature.icon}</span>
                    </div>

                    <h3 className="font-bold text-3xl md:text-4xl">
                      {feature.title}
                    </h3>

                    <p className="max-w-md text-gray-600 text-lg dark:text-gray-300">
                      {feature.description}
                    </p>

                    <div className="grid grid-cols-3 gap-4 pt-4">
                      {feature.stats.map((stat, i) => (
                        <motion.div
                          className="space-y-1"
                          initial={{ opacity: 0, y: 20 }}
                          key={i}
                          transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                          viewport={{ once: true, margin: "-100px" }}
                          whileInView={{ opacity: 1, y: 0 }}
                        >
                          <p className="text-gray-500 text-sm dark:text-gray-400">
                            {stat.label}
                          </p>
                          <p className="font-bold text-2xl">{stat.value}</p>
                        </motion.div>
                      ))}
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      viewport={{ once: true, margin: "-100px" }}
                      whileInView={{ opacity: 1, y: 0 }}
                    >
                      <Button
                        className={cn(
                          "mt-4 rounded-lg bg-gradient-to-r text-white shadow-md transition-shadow hover:shadow-lg",
                          feature.color
                        )}
                      >
                        Learn more
                      </Button>
                    </motion.div>
                  </motion.div>
                </div>

                <div
                  className={cn(
                    "order-1 md:order-2",
                    index % 2 === 1 && "md:order-1"
                  )}
                >
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    viewport={{ once: true, margin: "-100px" }}
                    whileInView={{ opacity: 1, scale: 1 }}
                  >
                    {/* Feature-specific visualization */}
                    {index === 0 && (
                      <div className="relative mx-auto aspect-square max-w-md">
                        {/* Enhanced background gradient with subtle animation */}
                        <motion.div
                          animate={{
                            opacity: [0.7, 0.9, 0.7],
                            scale: [0.95, 1.05, 0.95],
                          }}
                          className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 to-indigo-600/20 blur-2xl"
                          transition={{
                            duration: 8,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "mirror",
                            ease: "easeInOut",
                          }}
                        />

                        {/* Main window with refined styling */}
                        <div className="relative h-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
                          {/* Window header with interactive elements */}
                          <div className="absolute top-0 right-0 left-0 flex h-12 items-center border-gray-200 border-b bg-gray-100 px-4 dark:border-gray-700 dark:bg-gray-800">
                            <div className="flex space-x-2">
                              <motion.div
                                className="group relative h-3 w-3 cursor-pointer rounded-full bg-red-500"
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <span className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 text-[8px] text-red-900 opacity-0 transition-opacity group-hover:opacity-100">
                                  ×
                                </span>
                              </motion.div>
                              <motion.div
                                className="group relative h-3 w-3 cursor-pointer rounded-full bg-yellow-500"
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <span className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 text-[8px] text-yellow-900 opacity-0 transition-opacity group-hover:opacity-100">
                                  −
                                </span>
                              </motion.div>
                              <motion.div
                                className="group relative h-3 w-3 cursor-pointer rounded-full bg-green-500"
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <span className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 text-[10px] text-green-900 opacity-0 transition-opacity group-hover:opacity-100">
                                  +
                                </span>
                              </motion.div>
                            </div>
                            <div className="ml-4 flex items-center font-medium text-gray-500 text-sm dark:text-gray-400">
                              <svg
                                className="mr-1.5 h-4 w-4 text-blue-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M12 3C10.9 3 10 3.9 10 5C10 6.1 10.9 7 12 7C13.1 7 14 6.1 14 5C14 3.9 13.1 3 12 3Z"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.5"
                                />
                                <path
                                  d="M8 10C6.9 10 6 10.9 6 12C6 13.1 6.9 14 8 14C9.1 14 10 13.1 10 12C10 10.9 9.1 10 8 10Z"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.5"
                                />
                                <path
                                  d="M16 10C14.9 10 14 10.9 14 12C14 13.1 14.9 14 16 14C17.1 14 18 13.1 18 12C18 10.9 17.1 10 16 10Z"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.5"
                                />
                                <path
                                  d="M12 17C10.9 17 10 17.9 10 19C10 20.1 10.9 21 12 21C13.1 21 14 20.1 14 19C14 17.9 13.1 17 12 17Z"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.5"
                                />
                              </svg>
                              Model Explorer
                            </div>
                            <div className="ml-auto flex items-center">
                              <div className="flex h-4 w-4 cursor-pointer items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <svg
                                  fill="none"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  width="16"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M15 19L8 12L15 5"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                  />
                                </svg>
                              </div>
                              <div className="ml-2 flex h-4 w-4 cursor-pointer items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <svg
                                  fill="none"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  width="16"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M9 5L16 12L9 19"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Content area with staggered animation */}
                          <div className="h-full p-6 pt-16">
                            <div className="grid h-full grid-cols-2 gap-4">
                              {[
                                {
                                  name: "GPT-4o",
                                  types: "Text, Chat, Reasoning",
                                  accuracy: 96,
                                },
                                {
                                  name: "Claude 3",
                                  types: "Text, Vision, Analysis",
                                  accuracy: 94,
                                },
                                {
                                  name: "DALL-E 3",
                                  types: "Image, Creation",
                                  accuracy: 89,
                                },
                                {
                                  name: "Whisper",
                                  types: "Audio, Transcription",
                                  accuracy: 92,
                                },
                              ].map((model, i) => (
                                <motion.div
                                  animate={{ opacity: 1, y: 0 }}
                                  className="group flex cursor-pointer flex-col rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors duration-300 hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600"
                                  initial={{ opacity: 0, y: 15 }}
                                  key={i}
                                  transition={{
                                    delay: 0.1 * i,
                                    duration: 0.5,
                                    type: "spring",
                                    stiffness: 100,
                                    damping: 15,
                                  }}
                                  whileHover={{
                                    y: -2,
                                    transition: { duration: 0.2 },
                                  }}
                                >
                                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 transition-colors duration-300 group-hover:bg-blue-200 dark:bg-blue-900 dark:group-hover:bg-blue-800">
                                    <span className="font-bold text-blue-600 text-xs transition-colors duration-300 group-hover:text-blue-700 dark:text-blue-300 dark:group-hover:text-blue-200">
                                      AI
                                    </span>
                                  </div>
                                  <h4 className="mb-1 font-medium text-sm">
                                    {model.name}
                                  </h4>
                                  <p className="mb-3 text-gray-500 text-xs dark:text-gray-400">
                                    {model.types}
                                  </p>
                                  <div className="mt-auto">
                                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                      <motion.div
                                        animate={{
                                          width: `${model.accuracy}%`,
                                        }}
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                                        initial={{ width: 0 }}
                                        transition={{
                                          delay: 0.3 + 0.1 * i,
                                          duration: 1.5,
                                          ease: "easeOut",
                                        }}
                                      />
                                    </div>
                                    <div className="mt-2 flex justify-between">
                                      <span className="text-gray-500 text-xs dark:text-gray-400">
                                        Accuracy
                                      </span>
                                      <motion.span
                                        animate={{ opacity: 1 }}
                                        className="font-medium text-xs"
                                        initial={{ opacity: 0 }}
                                        transition={{
                                          delay: 0.8 + 0.1 * i,
                                          duration: 0.3,
                                        }}
                                      >
                                        {model.accuracy}%
                                      </motion.span>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {index === 1 && (
                      <FeatureTwoVisual
                        cpuLoad={cpuLoad}
                        requestCount={requestCount}
                      />
                    )}

                    {index === 2 && <FeatureThreeVisual />}
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* CTA section */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white py-24 dark:from-gray-900/30 dark:to-black">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            className="mx-auto max-w-2xl space-y-6"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="font-bold text-3xl md:text-4xl">
              Ready to build smarter apps?
            </h2>
            <p className="text-gray-600 text-lg dark:text-gray-300">
              Start building with our AI platform today. No credit card
              required.
            </p>

            <div className="pt-8">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  className="h-auto rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6 font-semibold text-base text-white shadow-lg transition-all duration-300 hover:shadow-xl"
                  size="lg"
                >
                  Start building for free
                </Button>
              </motion.div>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-gray-500 text-sm dark:text-gray-400">
                <span>No credit card required</span>
                <span className="inline-block h-1 w-1 rounded-full bg-gray-400 dark:bg-gray-600" />
                <span>Cancel anytime</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

// Feature Two Visual Component
function FeatureTwoVisual({
  cpuLoad,
  requestCount,
}: {
  cpuLoad: number;
  requestCount: number;
}) {
  return (
    <div className="relative mx-auto aspect-square max-w-md">
      {/* Enhanced background gradient with subtle animation */}
      <motion.div
        animate={{
          opacity: [0.7, 0.9, 0.7],
          scale: [0.95, 1.05, 0.95],
        }}
        className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 to-pink-600/20 blur-2xl"
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />

      {/* Main window with refined styling */}
      <div className="relative h-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        {/* Window header with interactive elements */}
        <div className="absolute top-0 right-0 left-0 flex h-12 items-center border-gray-200 border-b bg-gray-100 px-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex space-x-2">
            <motion.div
              className="group relative h-3 w-3 cursor-pointer rounded-full bg-red-500"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 text-[8px] text-red-900 opacity-0 transition-opacity group-hover:opacity-100">
                ×
              </span>
            </motion.div>
            <motion.div
              className="group relative h-3 w-3 cursor-pointer rounded-full bg-yellow-500"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 text-[8px] text-yellow-900 opacity-0 transition-opacity group-hover:opacity-100">
                −
              </span>
            </motion.div>
            <motion.div
              className="group relative h-3 w-3 cursor-pointer rounded-full bg-green-500"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 text-[10px] text-green-900 opacity-0 transition-opacity group-hover:opacity-100">
                +
              </span>
            </motion.div>
          </div>
          <div className="ml-4 flex items-center font-medium text-gray-500 text-sm dark:text-gray-400">
            <svg
              className="mr-1.5 h-4 w-4 text-purple-500"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13 10V3L4 14H11V21L20 10H13Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
            Inference Dashboard
          </div>
          <div className="ml-auto flex space-x-2">
            <div className="flex items-center rounded bg-purple-100 px-1.5 py-0.5 text-purple-600 text-xs dark:bg-purple-900/30 dark:text-purple-300">
              <span className="mr-1 h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              Live
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="h-full p-6 pt-16">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="flex items-center font-medium text-sm">
                  <svg
                    className="mr-1.5 h-4 w-4 text-purple-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M12 7V12L15 15"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                    />
                  </svg>
                  Real-time metrics
                </h4>
                <span className="rounded-full bg-gray-100 px-1.5 py-0.5 font-medium text-gray-500 text-xs dark:bg-gray-800 dark:text-gray-400">
                  Last 5 minutes
                </span>
              </div>

              <div className="relative h-28 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                <div className="absolute top-3 left-3 flex flex-col">
                  <span className="text-gray-500 text-xs dark:text-gray-400">
                    Requests per second
                  </span>
                  <motion.span
                    animate={{ opacity: [1, 0.7, 1] }}
                    className="font-bold text-lg"
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  >
                    {requestCount.toLocaleString()}/s
                  </motion.span>
                </div>

                <div className="absolute top-3 right-3 flex flex-col items-end">
                  <span className="text-gray-500 text-xs dark:text-gray-400">
                    CPU Load
                  </span>
                  <motion.div
                    animate={{ opacity: [1, 0.7, 1] }}
                    className="flex items-center gap-1 font-bold text-lg"
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  >
                    {cpuLoad.toFixed(1)}%
                    <span
                      className={`h-2 w-2 rounded-full ${
                        cpuLoad > 30 ? "bg-yellow-500" : "bg-green-500"
                      }`}
                    />
                  </motion.div>
                </div>

                <svg
                  className="mt-5 h-full w-full"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 40"
                >
                  <motion.path
                    animate={{ pathLength: 1 }}
                    d="M0,30 C5,28 10,32 15,30 C20,28 25,25 30,18 C35,16 40,25 45,24 C50,23 55,12 60,20 C65,18 70,25 75,18 C80,16 85,19 90,18 C95,17 100,20 100,20"
                    fill="transparent"
                    initial={{ pathLength: 0 }}
                    stroke="url(#purpleStrokeGradient)"
                    strokeLinecap="round"
                    strokeWidth="2"
                    transition={{ duration: 2, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient
                      id="purpleGradient"
                      x1="0%"
                      x2="0%"
                      y1="0%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        stopColor="rgb(147, 51, 234)"
                        stopOpacity="0.3"
                      />
                      <stop
                        offset="100%"
                        stopColor="rgb(147, 51, 234)"
                        stopOpacity="0.05"
                      />
                    </linearGradient>
                    <linearGradient
                      id="purpleStrokeGradient"
                      x1="0%"
                      x2="100%"
                      y1="0%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="rgb(147, 51, 234)" />
                      <stop offset="100%" stopColor="rgb(219, 39, 119)" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  label: "Avg. Latency",
                  value: "120ms",
                  color: "bg-purple-500",
                  icon: "clock",
                },
                {
                  label: "Success Rate",
                  value: "99.9%",
                  color: "bg-pink-500",
                  icon: "check",
                },
                {
                  label: "Cold Starts",
                  value: "0.3%",
                  color: "bg-indigo-500",
                  icon: "zap",
                },
                {
                  label: "Cost/1K",
                  value: "$0.10",
                  color: "bg-violet-500",
                  icon: "dollar",
                },
              ].map((stat, i) => (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="group cursor-pointer rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors duration-300 hover:border-purple-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-600"
                  initial={{ opacity: 0, y: 10 }}
                  key={i}
                  transition={{
                    delay: 0.2 + 0.1 * i,
                    duration: 0.5,
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                  }}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                >
                  <div className="mb-2 flex items-center">
                    <div
                      className={`h-2 w-2 rounded-full ${stat.color} mr-2`}
                    />
                    <h4 className="text-gray-500 text-xs dark:text-gray-400">
                      {stat.label}
                    </h4>
                    {stat.icon === "check" && (
                      <svg
                        className="ml-auto h-3 w-3 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5 13L9 17L19 7"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                    )}
                  </div>
                  <p className="font-bold text-lg">{stat.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Feature Three Visual Component
function FeatureThreeVisual() {
  const [currentLine, setCurrentLine] = useState(0);
  const [typingText, setTypingText] = useState("");

  // Simulate typing animation for prompt preview
  useEffect(() => {
    const responses = [
      "I'm an AI assistant trained to help with customer questions.",
      "Based on our knowledge base, the refund policy allows returns within 30 days of purchase.",
      "Would you like me to guide you through the return process?",
    ];

    let currentCharIndex = 0;
    let currentResponse = responses[currentLine];
    let typingTimer: NodeJS.Timeout;

    const typeNextChar = () => {
      if (currentCharIndex < currentResponse.length) {
        setTypingText((prev) => prev + currentResponse[currentCharIndex]);
        currentCharIndex++;

        // Random typing speed for realism
        const typingSpeed = Math.random() * 50 + 30;
        typingTimer = setTimeout(typeNextChar, typingSpeed);
      } else if (currentLine < responses.length - 1) {
        // Move to next line after a pause
        setTimeout(() => {
          setCurrentLine((prev) => prev + 1);
          setTypingText("");
          currentCharIndex = 0;
          currentResponse = responses[currentLine + 1];
          typeNextChar();
        }, 1000);
      }
    };

    // Start typing with a small delay
    const startTimer = setTimeout(() => {
      typeNextChar();
    }, 1000);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(typingTimer);
    };
  }, [currentLine]);

  return (
    <div className="relative mx-auto aspect-square max-w-md">
      {/* Enhanced background gradient with subtle animation */}
      <motion.div
        animate={{
          opacity: [0.7, 0.9, 0.7],
          scale: [0.95, 1.05, 0.95],
        }}
        className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/20 to-teal-600/20 blur-2xl"
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />

      {/* Main window with refined styling */}
      <div className="relative h-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        {/* Window header with interactive elements */}
        <div className="absolute top-0 right-0 left-0 flex h-12 items-center border-gray-200 border-b bg-gray-100 px-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex space-x-2">
            <motion.div
              className="group relative h-3 w-3 cursor-pointer rounded-full bg-red-500"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 text-[8px] text-red-900 opacity-0 transition-opacity group-hover:opacity-100">
                ×
              </span>
            </motion.div>
            <motion.div
              className="group relative h-3 w-3 cursor-pointer rounded-full bg-yellow-500"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 text-[8px] text-yellow-900 opacity-0 transition-opacity group-hover:opacity-100">
                −
              </span>
            </motion.div>
            <motion.div
              className="group relative h-3 w-3 cursor-pointer rounded-full bg-green-500"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 text-[10px] text-green-900 opacity-0 transition-opacity group-hover:opacity-100">
                +
              </span>
            </motion.div>
          </div>
          <div className="ml-4 flex items-center font-medium text-gray-500 text-sm dark:text-gray-400">
            <svg
              className="mr-1.5 h-4 w-4 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 16.5V21"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <path
                d="M7 21H17"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <path
                d="M7 3.5H17"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <path
                d="M12 3.5V8.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
            Prompt Editor
          </div>
          <div className="ml-auto flex items-center space-x-3">
            <div className="flex items-center rounded px-1.5 py-0.5 text-emerald-600 text-xs dark:text-emerald-400">
              <span className="mr-1 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Template v1.2
            </div>
          </div>
        </div>

        {/* Prompt editor content */}
        <div className="flex h-full flex-col p-6 pt-16">
          <div className="mb-4 flex gap-4">
            <motion.div
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
              initial={{ opacity: 0, x: -10 }}
              transition={{
                delay: 0.2,
                duration: 0.5,
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
              whileHover={{ x: -2, transition: { duration: 0.2 } }}
            >
              <div className="mb-2 flex items-center">
                <div className="mr-2 h-2 w-2 rounded-full bg-emerald-500" />
                <h4 className="font-medium text-xs">Prompt Template</h4>
                <span className="ml-auto text-emerald-600 text-xs dark:text-emerald-400">
                  System
                </span>
              </div>
              <div className="rounded border border-gray-200 bg-white p-2 font-mono text-xs dark:border-gray-700 dark:bg-gray-900">
                <div className="text-emerald-600 dark:text-emerald-400">
                  You are a helpful customer &lt;br/&gt; support agent for
                  &#123;&#123;company_name&#125;&#125;.
                </div>
                <div className="mt-2 text-gray-500 dark:text-gray-400">
                  Knowledge base: {"{{kb}}"}
                </div>
                <div className="mt-2 text-gray-500 dark:text-gray-400">
                  User question: {"{{question}}"}
                </div>
                <div className="mt-2 text-gray-500 dark:text-gray-400">
                  Provide a helpful, friendly response
                  <br />
                  based on the knowledge base.
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
              initial={{ opacity: 0, x: 10 }}
              transition={{
                delay: 0.3,
                duration: 0.5,
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
              whileHover={{ x: 2, transition: { duration: 0.2 } }}
            >
              <div className="mb-2 flex items-center">
                <div className="mr-2 h-2 w-2 rounded-full bg-teal-500" />
                <h4 className="font-medium text-xs">Parameters</h4>
                <motion.span
                  className="ml-auto rounded-full bg-teal-100 px-1.5 py-0.5 font-medium text-teal-600 text-xs dark:bg-teal-900/30 dark:text-teal-400"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Edit
                </motion.span>
              </div>
              <div className="space-y-3">
                {[
                  { name: "Temperature", value: 0.7, max: 1 },
                  { name: "Top P", value: 0.95, max: 1 },
                  { name: "Max tokens", value: 500, max: 1000 },
                ].map((param, i) => (
                  <motion.div
                    animate={{ opacity: 1 }}
                    className="space-y-1"
                    initial={{ opacity: 0 }}
                    key={i}
                    transition={{ delay: 0.4 + 0.1 * i, duration: 0.5 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs dark:text-gray-400">
                        {param.name}
                      </span>
                      <span className="font-medium text-xs">{param.value}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <motion.div
                        animate={{
                          width: `${(param.value / param.max) * 100}%`,
                        }}
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500"
                        initial={{ width: 0 }}
                        transition={{
                          delay: 0.5 + 0.1 * i,
                          duration: 0.8,
                          ease: "easeOut",
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="relative flex-1 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
            initial={{ opacity: 0, y: 10 }}
            transition={{
              delay: 0.6,
              duration: 0.5,
              type: "spring",
              stiffness: 100,
              damping: 15,
            }}
          >
            <div className="mb-2 flex items-center">
              <div className="mr-2 h-2 w-2 rounded-full bg-emerald-500" />
              <h4 className="font-medium text-xs">Preview</h4>
              <span className="ml-auto text-gray-500 text-xs dark:text-gray-400">
                ChatBot Preview
              </span>
            </div>

            <div className="absolute inset-0 m-3 mt-8 overflow-hidden rounded border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex h-full flex-col">
                <div className="mb-4 flex items-start">
                  <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 font-medium text-gray-600 text-xs dark:bg-gray-700 dark:text-gray-300">
                    U
                  </div>
                  <div className="max-w-[80%] rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
                    <p className="text-sm">What's your refund policy?</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                    <span className="text-emerald-600 text-xs dark:text-emerald-400">
                      AI
                    </span>
                  </div>
                  <div className="relative max-w-[80%] rounded-lg bg-emerald-50 p-2 dark:bg-emerald-900/20">
                    <p className="text-sm">{typingText}</p>
                    {typingText.length < 30 && (
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        className="absolute ml-1 inline-block h-4 w-1.5 bg-emerald-500 dark:bg-emerald-400"
                        transition={{
                          duration: 0.8,
                          repeat: Number.POSITIVE_INFINITY,
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
