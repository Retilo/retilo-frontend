import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUpRight } from "lucide-react";
import { type AnchorHTMLAttributes, forwardRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import {
  OrganicShapeAscendingWall as AscendingWall,
  OrganicShapeDescendingWall as DescendingWall,
  OrganicShapeFlatRoundedRight as FlatRoundedRight,
  OrganicShapeRoundedFlatLeft as RoundedFlatRight,
} from "./organic-shape-parts";

const organicButtonVariants = cva("flex w-fit flex-col", {
  variants: {
    variantColor: {
      primary:
        "text-[var(--organic-fg)] [--organic-fg:theme(colors.white)] [--organic-surface:theme(colors.neutral.950)]",
      secondary:
        "text-[var(--organic-fg)] [--organic-fg:var(--secondary-foreground)] [--organic-surface:var(--secondary)]",
      /** Warm orange CTA surface with ink text. */
      orange:
        "text-[var(--organic-fg)] [--organic-fg:#2d1f16] [--organic-surface:#FBA649] dark:[--organic-fg:#2d1f16] dark:[--organic-surface:#f59e42]",
      /** Warm ink surface + peach label — matches dither hero (colors only; same motion as primary) */
      dither: "text-[var(--organic-fg)] [--organic-fg:#FFDDCC] [--organic-surface:#2d1f16]",
      /** Light surface for inactive toggle chips (quick toggles, etc.) */
      toggleOff:
        "text-[var(--organic-fg)] [--organic-fg:#404040] [--organic-surface:#ffffff] dark:[--organic-fg:#a3a3a3] dark:[--organic-surface:#262626]",
    },
    size: {
      sm: "h-9 min-h-9 [&_.organic-icon]:size-3.5 [&_.organic-label]:text-sm",
      md: "h-11 min-h-11 [&_.organic-icon]:size-4 [&_.organic-label]:text-base",
      lg: "h-14 min-h-14 [&_.organic-icon]:size-5 [&_.organic-label]:text-lg",
    },
    animationSpeed: {
      slow: "[--organic-duration:500ms]",
      normal: "[--organic-duration:400ms]",
      fast: "[--organic-duration:300ms]",
    },
  },
  defaultVariants: {
    size: "md",
    variantColor: "primary",
    animationSpeed: "normal",
  },
});

interface OrganicShapeButtonProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof organicButtonVariants> {
  asChild?: boolean;
  label: string;
  icon?: ReactNode;
  animationSpeed?: "slow" | "normal" | "fast";
}

function isExternalHref(href: string | undefined): boolean {
  if (!href) {
    return false;
  }
  return href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//");
}

export const OrganicButton = forwardRef<HTMLAnchorElement, OrganicShapeButtonProps>(
  (
    {
      asChild,
      label,
      className,
      icon = (
        <ArrowUpRight className="organic-icon stroke-current transition-transform duration-100 group-hover/organic:rotate-45 group-hover/organic:scale-110" />
      ),
      size = "md",
      variantColor = "primary",
      animationSpeed = "normal",
      href,
      target,
      rel,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "a";

    const minWBySize = {
      sm: "min-w-[9rem]",
      md: "min-w-[10.5rem]",
      lg: "min-w-[12rem]",
    } as const;
    const minW = minWBySize[size ?? "md"];

    const resolvedTarget = target ?? (isExternalHref(href) ? "_blank" : "_self");
    const resolvedRel = rel ?? (isExternalHref(href) ? "noopener noreferrer" : undefined);

    return (
      <div
        className={cn(
          organicButtonVariants({
            variantColor,
            size,
            animationSpeed,
          })
        )}
      >
        <Comp
          className={cn(
            "group/organic inline-flex h-full min-h-0 w-full min-w-0 max-w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.96] active:transition-transform disabled:cursor-not-allowed",
            minW,
            className
          )}
          href={href}
          ref={ref}
          rel={resolvedRel}
          target={resolvedTarget}
          {...props}
        >
          <div className="flex h-full min-h-0 min-w-0 flex-1 flex-row items-stretch">
            <div className="flex h-full min-h-0 min-w-0 flex-1 items-stretch">
              <RoundedFlatRight />

              <div
                className={cn(
                  "flex h-full min-h-0 min-w-0 flex-1 items-center justify-start overflow-visible whitespace-nowrap bg-[var(--organic-surface)] pr-2 text-[var(--organic-fg)]"
                )}
              >
                <span className="flex items-center justify-start pl-2 transition-[padding] duration-[var(--organic-duration,400ms)] ease-in-out">
                  <span className="organic-label shrink-0 font-brand font-semibold leading-none">{label}</span>
                </span>
              </div>

              <DescendingWall />
            </div>

            <div className="-ml-px flex h-full min-h-0 w-max shrink-0 items-stretch">
              <AscendingWall />
              <div
                className={cn(
                  "flex h-full shrink-0 items-center justify-center overflow-visible whitespace-nowrap bg-[var(--organic-surface)] text-[var(--organic-fg)]"
                )}
              >
                <span className="flex items-center px-0 transition-[padding] duration-[var(--organic-duration,400ms)] ease-in-out group-hover/organic:px-2">
                  {icon}
                </span>
              </div>

              <FlatRoundedRight />
            </div>
          </div>
        </Comp>
      </div>
    );
  }
);

OrganicButton.displayName = "OrganicButton";
