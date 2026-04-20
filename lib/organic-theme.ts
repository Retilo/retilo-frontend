import { cn } from "@/lib/utils";

/** Dither / simplex hero palette — single source of truth for organic page sections. */
export const ORGANIC_PLUM = "#2d1f16";
/**
 * Slightly lighter ink for organic shape badges on `ORGANIC_PLUM` sections.
 * If the badge fill matches the page exactly, the silhouette disappears (only label + icon read).
 */
export const ORGANIC_EYEBROW_INK = "#3a2f28";
/** Primary accent orange (pairs with ORGANIC_CREAM). */
export const ORGANIC_ORANGE = "#FBA649";
/** Hover / secondary highlight — warm cream-gold. */
export const ORGANIC_HONEY = "#FFD699";
export const ORGANIC_CREAM = "#FFDDCC";
/** Light card / panel fill (aligned with organic-card-small default) */
export const ORGANIC_STONE = "#f5ebe3";

export const headingOnDark =
  "font-bold text-balance text-[#FFDDCC] tracking-[-0.035em] [text-shadow:0_2px_24px_rgba(0,0,0,0.55)]";
export const bodyOnDark =
  "text-pretty font-medium text-[#FFDDCC] leading-relaxed [text-shadow:0_1px_20px_rgba(0,0,0,0.65),0_0_1px_rgba(0,0,0,0.4)]";

/** Horizontal padding aligned with hero shell gutters */
export const sectionGutterX = "px-6 md:px-8 lg:px-10";
export const sectionGutter = cn(sectionGutterX, "py-16 md:py-20 lg:py-24");

export const SIMPLEX_LINK_EASE = [0.32, 0, 0.08, 1] as const;

/** Scroll margin for in-page anchors */
export const scrollMarginAnchor = "scroll-mt-24";
