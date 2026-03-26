"use client";

import { debounce } from "lodash-es";
import {
  BadgeDollarSign,
  BotIcon,
  Database,
  Palette,
  Sparkles,
  Triangle,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useAnimation,
  type Variants,
} from "motion/react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ClaudeAIIcon,
  NextjsIcon,
  OpenAIIcon,
  StripeIcon,
  SupabaseIconGreen,
  TailwindCSSIcon,
} from "./brand-icons";

interface ButtonProps {
  button: {
    label: string;
    icon: React.ReactNode;
    iconShape: React.ReactNode;
    description: string;
  };
  index: number;
  controls: any;
  variants: Variants;
  onClick: () => void;
  selectedIndex: number | null;
  stage: string;
  getLayoutId: (index: number) => string;
}

const Button: React.FC<ButtonProps> = React.memo(
  ({
    button,
    index,
    controls,
    variants,
    onClick,
    selectedIndex,
    stage,
    getLayoutId,
  }) => {
    const showColorIcon =
      (selectedIndex !== index && stage === "rotate") || stage === "orbit";
    const showPrimaryIcon = stage === "orbit" || stage === "rotate";
    const showInitialShape = stage === "bloom" || stage === "initial";

    return (
      <motion.button
        animate={controls}
        aria-label={`${button.label} button`}
        className="absolute flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-gray-200 shadow-md transition-colors sm:h-12 sm:w-12 lg:h-14 lg:w-14 xl:h-16 xl:w-16"
        custom={index}
        initial="initial"
        key={`button-${button.label}-${index}`}
        onClick={onClick}
        variants={variants}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {showColorIcon && (
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center"
              exit={{ opacity: 0, scale: 0.8 }}
              initial={{ opacity: 0, scale: 0.8 }}
              key={`secondary-icon-${index}`}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {React.cloneElement(button.icon as React.ReactElement<any>, {
                className:
                  "h-6 w-6 sm:h-7 sm:w-7 lg:h-10 lg:w-10 xl:h-12 xl:w-12",
              })}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence initial={false} mode="popLayout">
          {!showColorIcon && (
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center grayscale"
              exit={{ opacity: 0, scale: 0.8 }}
              initial={{ opacity: 0, scale: 0.8 }}
              key={`primary-icon-${index}`}
              layoutId={getLayoutId(index)}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {showPrimaryIcon
                ? React.cloneElement(button.icon as React.ReactElement<any>, {
                    className:
                      "h-6 w-6 sm:h-7 sm:w-7 lg:h-10 lg:w-10 xl:h-12 xl:w-12",
                  })
                : null}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence initial={false} mode="popLayout">
          {showInitialShape && (
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center"
              exit={{ opacity: 0, scale: 0.8 }}
              initial={{ opacity: 0, scale: 0.8 }}
              key={`initial-shape-${index}`}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {React.cloneElement(button.iconShape as React.ReactElement<any>, {
                className:
                  "h-6 w-6 sm:h-7 sm:w-7 lg:h-10 lg:w-10 xl:h-12 xl:w-12 stroke-1",
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }
);

interface ButtonData {
  label: string;
  icon: React.ReactNode;
  iconShape: React.ReactNode;
  description: string;
}

interface RotatingButtonCloudProps {
  buttons: ButtonData[];
  children: React.ReactNode;
}

const RotatingButtonCloud: React.FC<RotatingButtonCloudProps> = ({
  buttons,
  children,
}) => {
  const [stage, setStage] = useState<"initial" | "bloom" | "orbit" | "rotate">(
    "initial"
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const updateContainerSize = useCallback(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setContainerSize({ width, height });
      document.documentElement.style.setProperty(
        "--container-width",
        `${width}px`
      );
      document.documentElement.style.setProperty(
        "--container-height",
        `${height}px`
      );
    }
  }, []);

  const debouncedUpdateContainerSize = useMemo(
    () => debounce(updateContainerSize, 250),
    [updateContainerSize]
  );

  useEffect(() => {
    updateContainerSize();
    window.addEventListener("resize", debouncedUpdateContainerSize);
    return () => {
      window.removeEventListener("resize", debouncedUpdateContainerSize);
      debouncedUpdateContainerSize.cancel();
    };
  }, [debouncedUpdateContainerSize]);

  const runSequence = useCallback(async () => {
    const stages: ("initial" | "bloom" | "orbit" | "rotate")[] = [
      "initial",
      "bloom",
      "orbit",
      "rotate",
    ];
    for (const nextStage of stages) {
      setStage(nextStage);
      await controls.start(nextStage);
    }
  }, [controls]);

  useEffect(() => {
    runSequence();
    return () => {
      controls.stop();
    };
  }, [runSequence]);

  const buttonVariants: Variants = useMemo(() => {
    const getBloomPositions = () => {
      const baseSize =
        Math.min(containerSize.width, containerSize.height) * 0.15;

      return [
        { x: baseSize * 0.8, y: -baseSize * 0.8 },
        { x: baseSize * 0.8, y: baseSize * 0.8 },
        { x: 0, y: 0 },
        { x: -baseSize * 0.8, y: baseSize * 0.8 },
        { x: -baseSize * 0.8, y: -baseSize * 0.8 },
        { x: 0, y: baseSize * 1.6 },
      ];
    };

    const getOrbitRadius = () => {
      const minDimension = Math.min(containerSize.width, containerSize.height);
      return minDimension * 0.42;
    };

    const positions = getBloomPositions();
    const orbitRadius = getOrbitRadius();

    return {
      initial: (i: number) => ({
        x: positions[i].x,
        y: positions[i].y,
        scale: 0,
        opacity: 0,
        background: "#ffffff",
        filter: "blur(4px)",
      }),
      bloom: (i: number) => {
        const reverseIndex = buttons.length - 1 - i;
        return {
          scale: [1, 1.3],
          opacity: 1,
          x: positions[i].x,
          y: positions[i].y,
          background: "#ffffff",
          filter: ["blur(4px)", "blur(0px)"],
          rotate: [0, 360],
          transition: {
            type: "spring",
            stiffness: 200,
            damping: 20,
            duration: 0.4,
            delay: reverseIndex * 0.035,
            rotate: {
              duration: 0.4,
              delay: 0.2,
              type: "spring",
            },
          },
        };
      },
      orbit: (i: number) => {
        const angle = (i * (Math.PI * 2)) / buttons.length - Math.PI / 2;
        return {
          x: Math.cos(angle) * orbitRadius,
          y: Math.sin(angle) * orbitRadius,
          background: "#ffffff",
          transition: {
            duration: 0.35,
            type: "spring",
            stiffness: 100,
            damping: 20,
          },
        };
      },
    };
  }, [buttons, containerSize]);

  const getLayoutId = useCallback(
    (index: number) => {
      return `selected-${buttons[index]?.label || ""}-${index}`;
    },
    [buttons]
  );

  const centerContent = useMemo(
    () => (
      <AnimatePresence mode="wait">
        {selectedIndex !== null ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            initial={{ opacity: 0, y: 20 }}
            key={`selected-${buttons[selectedIndex].label}-${selectedIndex}`}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <motion.div className="mb-2 font-bold text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl">
              {buttons[selectedIndex].label}
            </motion.div>
            <motion.p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl">
              {buttons[selectedIndex].description}
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            key="default"
            transition={{ duration: 0.35, ease: "easeOut", delay: 0.2 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    ),
    [selectedIndex, buttons, children]
  );

  return (
    <div
      className="relative flex h-full w-full items-center justify-center"
      ref={containerRef}
    >
      <AnimatePresence mode="wait">
        {(stage === "orbit" || stage === "rotate") && (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="z-10 max-w-[70%] text-center lg:max-w-[60%]"
            exit={{ opacity: 0, scale: 0.9 }}
            initial={{ opacity: 0, scale: 0.9 }}
            key="center-content"
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {centerContent}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute">
        <motion.div className="flex w-full items-center justify-center">
          {buttons.map((button, index) => (
            <Button
              button={button}
              controls={controls}
              getLayoutId={getLayoutId}
              index={index}
              key={`button-${button.label}-${index}`}
              onClick={() => setSelectedIndex(index)}
              selectedIndex={selectedIndex}
              stage={stage}
              variants={buttonVariants}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export function LogoCloudAnimation({
  children,
  buttons: externalButtons,
}: {
  children: React.ReactNode;
  buttons?: ButtonData[];
}) {
  const defaultButtons = useMemo(
    () => [
      {
        label: "Next.js",
        icon: <NextjsIcon className="h-8 w-8" />,
        iconShape: <Triangle className="h-8 w-8 stroke-1" />,
        description: "The React Framework",
      },
      {
        label: "Supabase",
        icon: <SupabaseIconGreen className="h-8 w-8" />,
        iconShape: <Database className="h-8 w-8 stroke-1" />,
        description: "The Backend as a Service",
      },
      {
        label: "OpenAI",
        icon: <OpenAIIcon className="size-8 fill-white" />,
        iconShape: <Sparkles className="h-8 w-8 stroke-1" />,
        description: "The AI API",
      },
      {
        label: "Tailwind",
        icon: <TailwindCSSIcon className="h-8 w-8" />,
        iconShape: <Palette className="h-8 w-8 stroke-1" />,
        description: "The CSS Framework",
      },
      {
        label: "Stripe",
        icon: <StripeIcon className="h-8 w-8" />,
        iconShape: <BadgeDollarSign className="h-8 w-8 stroke-1" />,
        description: "The Payment API",
      },
      {
        label: "Anthropic",
        icon: <ClaudeAIIcon className="h-8 w-8 text-black" />,
        iconShape: <BotIcon className="h-8 w-8 stroke-1" />,
        description: "Anthropic AI",
      },
    ],
    []
  );

  const buttons = externalButtons ?? defaultButtons;

  return (
    <div className="h-full min-h-[400px] w-full">
      <RotatingButtonCloud buttons={buttons}>{children}</RotatingButtonCloud>
    </div>
  );
}
