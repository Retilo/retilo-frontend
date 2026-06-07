"use client";

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import {
  Children,
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EASE_UI = "[transition-timing-function:cubic-bezier(0.23,1,0.32,1)]";

const stepIndicatorVariants = cva("flex items-center justify-center gap-2 overflow-visible", {
  variants: { variant: { dots: "", pills: "" } },
  defaultVariants: { variant: "dots" },
});

const stepDotVariants = cva(
  cn("rounded-full duration-200", EASE_UI, "motion-reduce:transition-none"),
  {
    variants: {
      variant: {
        dots: "size-2 shrink-0 origin-center bg-muted-foreground/30 transition-[transform,background-color] data-[state=active]:scale-125 data-[state=inactive]:scale-100 data-[state=active]:bg-foreground data-[state=completed]:bg-foreground/60",
        pills:
          "h-1 min-h-1 max-w-8 flex-1 rounded-full bg-muted-foreground/30 transition-[background-color] data-[state=active]:bg-foreground data-[state=completed]:bg-foreground/60",
      },
    },
    defaultVariants: { variant: "dots" },
  }
);

export interface StepIndicatorProps
  extends React.ComponentPropsWithoutRef<"div">,
    VariantProps<typeof stepIndicatorVariants>,
    VariantProps<typeof stepDotVariants> {
  currentStep: number;
  totalSteps: number;
  dotClassName?: string;
}

export function StepIndicator({
  currentStep,
  totalSteps,
  variant = "dots",
  className,
  dotClassName,
  ...props
}: StepIndicatorProps) {
  return (
    <div
      aria-label={`Step ${currentStep} of ${totalSteps}`}
      aria-valuemax={totalSteps}
      aria-valuemin={1}
      aria-valuenow={currentStep}
      className={cn(stepIndicatorVariants({ variant }), className)}
      data-slot="onboarding-step-indicator"
      role="progressbar"
      {...props}
    >
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNumber = i + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;
        const stepState: "active" | "completed" | "inactive" = isActive
          ? "active"
          : isCompleted
          ? "completed"
          : "inactive";
        return (
          <div
            aria-hidden
            className={cn(stepDotVariants({ variant }), dotClassName)}
            data-slot="onboarding-step-dot"
            data-state={stepState}
            key={stepNumber}
          />
        );
      })}
    </div>
  );
}

// ─── Context ────────────────────────────────────────────────────────────────

export interface OnboardingContextValue {
  currentStep: number;
  totalSteps: number;
  stepValue: number;
  setStep: (step: number | ((prev: number) => number)) => void;
  setStepValue: (value: number | ((prev: number) => number)) => void;
  maxStepValue: number;
  canGoNext: boolean;
  canGoBack: boolean;
  handleBack: () => void;
  handleNext: () => void;
  handleComplete: () => void;
  onComplete?: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("Onboarding components must be used within Onboarding.Root");
  return ctx;
}

// ─── Root ────────────────────────────────────────────────────────────────────

export interface OnboardingRootProps
  extends PropsWithChildren,
    Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (step: number) => void;
  stepValue?: number;
  defaultStepValue?: number;
  onStepValueChange?: (value: number) => void;
  totalSteps: number;
  maxStepValue?: number;
  onComplete?: () => void;
  canGoNext?: (step: number, stepValue: number) => boolean;
}

function OnboardingRoot({
  value: controlledValue,
  defaultValue = 1,
  onValueChange,
  stepValue: controlledStepValue,
  defaultStepValue = 0,
  onStepValueChange,
  totalSteps,
  maxStepValue: controlledMaxStepValue = 0,
  onComplete,
  canGoNext: canGoNextFn,
  children,
  className,
  ...props
}: OnboardingRootProps) {
  const [currentStep, setCurrentStep] = useControllableState({
    prop: controlledValue,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });

  const [stepValue, setStepValueState] = useControllableState({
    prop: controlledStepValue,
    defaultProp: defaultStepValue,
    onChange: onStepValueChange,
  });

  const maxStepValue = controlledMaxStepValue ?? 0;
  const canGoNext = canGoNextFn ? canGoNextFn(currentStep, stepValue) : true;
  const canGoBack = currentStep > 1 || stepValue > 0;

  const handleNext = useCallback(() => {
    if (currentStep === 1 && stepValue < maxStepValue) {
      setStepValueState((prev) => prev + 1);
    } else if (currentStep < totalSteps) {
      setStepValueState(0);
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, stepValue, maxStepValue, totalSteps, setStepValueState, setCurrentStep]);

  const handleBack = useCallback(() => {
    if (currentStep === 1 && stepValue > 0) {
      setStepValueState((prev) => prev - 1);
    } else if (currentStep === 2) {
      setCurrentStep(1);
      setStepValueState(maxStepValue);
    } else if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep, stepValue, maxStepValue, setStepValueState, setCurrentStep]);

  const handleComplete = useCallback(() => onComplete?.(), [onComplete]);

  const contextValue = useMemo<OnboardingContextValue>(
    () => ({
      currentStep,
      totalSteps,
      stepValue,
      setStep: setCurrentStep,
      setStepValue: setStepValueState,
      maxStepValue,
      canGoNext,
      canGoBack,
      handleBack,
      handleNext,
      handleComplete,
      onComplete,
    }),
    [
      currentStep, totalSteps, stepValue, setCurrentStep, setStepValueState,
      maxStepValue, canGoNext, canGoBack, handleBack, handleNext, handleComplete, onComplete,
    ]
  );

  return (
    <OnboardingContext.Provider value={contextValue}>
      <div
        className={cn(
          "flex flex-col antialiased",
          "rounded-[calc(var(--radius)+6px)] bg-background p-6",
          "shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06),0px_2px_8px_0px_rgba(0,0,0,0.04)]",
          "dark:shadow-[0px_0px_0px_1px_rgba(255,255,255,0.06),0px_1px_2px_-1px_rgba(255,255,255,0.03),0px_2px_8px_0px_rgba(0,0,0,0.2)]",
          "transition-shadow duration-200 ease-out",
          className
        )}
        data-slot="onboarding"
        data-state={`step-${currentStep}`}
        {...props}
      >
        {children}
      </div>
    </OnboardingContext.Provider>
  );
}

// ─── Step ────────────────────────────────────────────────────────────────────

export interface OnboardingStepProps extends React.ComponentPropsWithoutRef<"div"> {
  step: number;
}

function OnboardingStep({ step, children, className, ...props }: OnboardingStepProps) {
  const { currentStep } = useOnboarding();
  if (currentStep !== step) return null;
  return (
    <div
      className={cn(
        "fade-in-0 slide-in-from-bottom-2 animate-in fill-mode-both duration-240",
        EASE_UI,
        "motion-reduce:translate-y-0 motion-reduce:animate-none motion-reduce:opacity-100",
        className
      )}
      data-slot="onboarding-step"
      data-state="active"
      {...props}
    >
      {children}
    </div>
  );
}

// ─── StepIndicator (context-aware) ───────────────────────────────────────────

export interface OnboardingStepIndicatorProps
  extends Omit<React.ComponentProps<typeof StepIndicator>, "currentStep" | "totalSteps"> {}

function OnboardingStepIndicator(props: OnboardingStepIndicatorProps) {
  const { currentStep, totalSteps } = useOnboarding();
  return <StepIndicator currentStep={currentStep} totalSteps={totalSteps} {...props} />;
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export interface OnboardingNavigationProps extends React.ComponentPropsWithoutRef<"fieldset"> {
  backLabel?: string;
  nextLabel?: string;
  completeLabel?: string;
  canGoNext?: boolean;
  children?: React.ReactNode;
}

function OnboardingNavigation({
  backLabel = "Back",
  nextLabel = "Next",
  completeLabel = "Done",
  canGoNext: canGoNextOverride,
  children,
  className,
  ...props
}: OnboardingNavigationProps) {
  const {
    currentStep,
    totalSteps,
    canGoNext: contextCanGoNext,
    canGoBack,
    handleBack,
    handleNext,
    handleComplete,
  } = useOnboarding();

  const canGoNext = canGoNextOverride ?? contextCanGoNext;
  const isLastStep = currentStep === totalSteps;

  if (children) {
    return (
      <fieldset className={cn("flex min-w-0 gap-3", className)} data-slot="onboarding-navigation" {...props}>
        {children}
      </fieldset>
    );
  }

  return (
    <fieldset
      aria-label="Onboarding navigation"
      className={cn("flex min-w-0 gap-3", className)}
      data-slot="onboarding-navigation"
      {...props}
    >
      <Button
        aria-label={backLabel}
        className="min-w-0 flex-1 rounded-xl py-5"
        data-slot="onboarding-back"
        disabled={!canGoBack}
        onClick={handleBack}
        variant="outline"
      >
        {backLabel}
      </Button>
      {isLastStep ? (
        <Button
          aria-label={completeLabel}
          className="min-w-0 flex-1 rounded-xl py-5"
          data-slot="onboarding-complete"
          onClick={handleComplete}
          variant="default"
        >
          {completeLabel}
        </Button>
      ) : (
        <Button
          aria-label={nextLabel}
          className="min-w-0 flex-1 rounded-xl py-5"
          data-slot="onboarding-next"
          disabled={!canGoNext}
          onClick={handleNext}
          variant="default"
        >
          {nextLabel}
        </Button>
      )}
    </fieldset>
  );
}

// ─── Export ──────────────────────────────────────────────────────────────────

export const Onboarding = Object.assign(OnboardingRoot, {
  Step: OnboardingStep,
  StepIndicator: OnboardingStepIndicator,
  Navigation: OnboardingNavigation,
});
