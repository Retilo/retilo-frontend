"use client";

import { cn } from "@/lib/utils";
import { scrollMarginAnchor, sectionGutterX } from "@/lib/organic-theme";
import { OrganicImageBanner } from "./image-banner";

export function OrganicBannerSection({ className }: { className?: string }) {
  return (
    <section
      aria-label="Scrolling project gallery"
      className={cn(
        "relative isolate z-20 overflow-x-hidden overflow-y-visible",
        // "bg-neutral-50/95 dark:bg-neutral-950/95",
        // "shadow-[inset_0_1px_0_0_rgba(251,166,73,0.08)]",
        scrollMarginAnchor,
        className
      )}
      data-slot="organic-banner"
      id="banner"
    >
      <div className={cn("mx-auto w-full")}>
        <OrganicImageBanner />
      </div>
    </section>
  );
}
