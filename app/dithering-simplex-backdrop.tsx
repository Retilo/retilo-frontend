"use client";

import { Dithering } from "@paper-design/shaders-react";
import React, { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const MemoizedDithering = React.memo(Dithering);

interface DitheringSimplexBackdropProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  colorFront?: string;
  colorBack?: string;
}

export const DitheringSimplexBackdrop: React.FC<DitheringSimplexBackdropProps> = React.memo(
  ({ children, className, colorFront = "#FD5BFF", colorBack = "#301c2a", ...props }) => {
    return (
      <div
        className={cn("relative flex min-h-0 flex-1 flex-col overflow-hidden", className)}
        style={{ backgroundColor: colorBack }}
        {...props}
      >
        <MemoizedDithering
          className="pointer-events-none absolute inset-0 z-0"
          colorBack={colorBack}
          colorFront={colorFront}
          height={720}
          shape="simplex"
          size={2.5}
          speed={0.6}
          style={{ width: "100%", height: "100%" }}
          type="4x4"
          width={1280}
        />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    );
  }
);

DitheringSimplexBackdrop.displayName = "DitheringSimplexBackdrop";
