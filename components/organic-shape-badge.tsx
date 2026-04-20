import { cva, type VariantProps } from "class-variance-authority";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { ORGANIC_EYEBROW_INK } from "../lib/organic-theme";

import {
  OrganicShapeAscendingWall,
  OrganicShapeDescendingWall,
  OrganicShapeFlatRoundedRight,
  OrganicShapeRoundedFlatLeft,
} from "./organic-shape-parts";

const organicShapeBadgeVariants = cva("flex w-fit max-w-full flex-col", {
  variants: {
    variantColor: {
      /** Light stone surface + ink label + orange icon — matches light “Shader settings” eyebrow */
      light:
        "text-[var(--organic-fg)] [--organic-fg:#2d1f16] [--organic-icon:#FBA649] [--organic-surface:#fafaf9] dark:[--organic-fg:#FFDDCC] dark:[--organic-icon:#FBA649] dark:[--organic-surface:#3a2f28]",
      /** Raised ink surface so the silhouette reads on `ORGANIC_PLUM` (see `ORGANIC_EYEBROW_INK`). */
      dark: "text-[var(--organic-fg)] [--organic-fg:#FFDDCC] [--organic-icon:#FBA649]",
    },
    size: {
      sm: "h-9 min-h-9 [&_.organic-badge-icon_svg]:size-3.5 [&_.organic-badge-label]:text-xs",
      md: "h-11 min-h-11 [&_.organic-badge-icon_svg]:size-4 [&_.organic-badge-label]:text-sm",
    },
  },
  defaultVariants: {
    size: "sm",
    variantColor: "light",
  },
});

/** Subtle ring + ambient depth for light surfaces. */
const BADGE_FILTER_LIGHT =
  "[filter:drop-shadow(0_0_0_1px_rgb(255_221_204))_drop-shadow(0_0_0_1px_rgba(45_31_22/0.18))_drop-shadow(0_3px_10px_rgba(45_31_22/0.12))]";
const BADGE_FILTER_LIGHT_ON_DARK_BG =
  "dark:[filter:drop-shadow(0_0_0_1px_rgba(251_166_73/0.26))_drop-shadow(0_10px_28px_rgba(0_0_0/0.30))]";
/** Always-on ring + lift for `variantColor="dark"` (hero, etc.). */
const BADGE_FILTER_DARK =
  "[filter:drop-shadow(0_0_0_0.75px_rgba(255_221_204/0.16))_drop-shadow(0_0_0_1px_rgba(251_166_73/0.26))_drop-shadow(0_10px_28px_rgba(0_0_0/0.30))]";

export type OrganicShapeBadgeProps = {
  label: string;
  icon?: ReactNode;
} & HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof organicShapeBadgeVariants>;

export function OrganicShapeBadge({
  label,
  icon,
  className,
  size = "sm",
  variantColor = "light",
  style,
  ...props
}: OrganicShapeBadgeProps) {
  const minWBySize = {
    sm: "min-w-[7.5rem]",
    md: "min-w-[9rem]",
  } as const;
  const minW = minWBySize[size ?? "sm"];

  const surfaceStyle: CSSProperties | undefined =
    variantColor === "dark" ? ({ ...style, "--organic-surface": ORGANIC_EYEBROW_INK } as CSSProperties) : style;

  return (
    <span
      className={cn(
        organicShapeBadgeVariants({ variantColor, size }),
        variantColor === "light" && cn(BADGE_FILTER_LIGHT, BADGE_FILTER_LIGHT_ON_DARK_BG),
        variantColor === "dark" && BADGE_FILTER_DARK,
        className
      )}
      style={surfaceStyle}
      {...props}
    >
      <span className={cn("inline-flex h-full min-h-0 w-fit min-w-0 max-w-full", minW)}>
        <span className="flex h-full min-h-0 min-w-0 flex-1 flex-row items-stretch">
          <span className="flex h-full min-h-0 min-w-0 flex-1 items-stretch">
            <OrganicShapeRoundedFlatLeft />

            <span
              className={cn(
                "flex h-full min-h-0 min-w-0 flex-1 items-center justify-start overflow-visible whitespace-nowrap bg-[var(--organic-surface)] pr-2 text-[var(--organic-fg)]"
              )}
            >
              <span className="flex items-center justify-start pl-2">
                <span className="organic-badge-label shrink-0 font-brand font-semibold leading-none tracking-wide">
                  {label}
                </span>
              </span>
            </span>

            <OrganicShapeDescendingWall />
          </span>

          <span className="-ml-px flex h-full min-h-0 w-max shrink-0 items-stretch">
            <OrganicShapeAscendingWall />
            <span
              className={cn(
                "flex h-full shrink-0 items-center justify-center overflow-visible whitespace-nowrap bg-[var(--organic-surface)] text-[var(--organic-icon)]"
              )}
            >
              <span className="organic-badge-icon flex items-center px-2">{icon}</span>
            </span>

            <OrganicShapeFlatRoundedRight />
          </span>
        </span>
      </span>
    </span>
  );
}
