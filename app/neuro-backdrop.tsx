"use client";

import { NeuroNoise } from "@paper-design/shaders-react";
import React, { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const MemoizedNeuroNoise = React.memo(NeuroNoise);

/** Deep sea base + teal mid + bright cyan front — cooler read than the prior pink/magenta field. */
const NEURO_FIELD_BACK = "#0c1222";
const NEURO_FIELD_MID = "#0f766e";
const NEURO_FIELD_FRONT = "#2dd4bf";

interface NeuroBackdropProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const NeuroBackdrop: React.FC<NeuroBackdropProps> = React.memo(({ children, className, ...props }) => {
  return (
    <div
      className={cn("relative flex min-h-0 flex-1 flex-col overflow-hidden", className)}
      style={{ backgroundColor: NEURO_FIELD_BACK }}
      {...props}
    >
      <MemoizedNeuroNoise
        brightness={0.48}
        className="pointer-events-none absolute inset-0 z-0"
        colorBack={NEURO_FIELD_BACK}
        colorFront={NEURO_FIELD_FRONT}
        colorMid={NEURO_FIELD_MID}
        contrast={0.42}
        height={720}
        rotation={18}
        scale={0.46}
        speed={1.35}
        style={{ width: "100%", height: "100%" }}
        width={1280}
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
});

NeuroBackdrop.displayName = "NeuroBackdrop";
