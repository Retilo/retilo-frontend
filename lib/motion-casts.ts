import type { Variants } from "motion/react";

// Casts a plain object to motion/react Variants without requiring explicit typing at each call site.
export function asMotionVariants(v: Record<string, unknown>): Variants {
  return v as Variants;
}
