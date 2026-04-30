"use client";

import { GodRays } from "@paper-design/shaders-react";
import React, { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const MemoizedGodRays = React.memo(GodRays);

interface HyperspaceTunnelProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Passed through to `GodRays` (default matches the warp-style preset). */
  speed?: number;
}

export const HyperspaceTunnel: React.FC<HyperspaceTunnelProps> = React.memo(
  ({ children, className, speed = 2, ...props }) => {
    return (
      <div
        className={cn("relative overflow-hidden", className)}
        style={{ backgroundColor: "#000000" }}
        {...props}
      >
        <MemoizedGodRays
          bloom={0.4}
          className="pointer-events-none absolute inset-0 h-full w-full"
          colorBack="#000000"
          colorBloom="#222287"
          colors={["#ff47d4", "#ff8c00", "#ffffff"]}
          density={0.45}
          intensity={0.79}
          midIntensity={0.4}
          midSize={0.33}
          offsetX={0}
          offsetY={0}
          speed={speed}
          spotty={0.15}
        />

        <div className="relative z-10 flex h-full items-center justify-center">{children}</div>
      </div>
    );
  }
);

HyperspaceTunnel.displayName = "HyperspaceTunnel";
