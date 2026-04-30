"use client";

import { useState } from "react";
import { ArrowButton, FeatureCardHeader, TrafficLightDots } from "./shared";

export function WebAppsCard() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex h-full flex-col p-8 md:p-10">
      <FeatureCardHeader
        description="Ship beautiful interfaces that don't compromise speed or functionality."
        title="Web Apps"
      />
      <ArrowButton />

      {/* Browser mockup */}
      <div className="mt-auto">
        <div
          className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-secondary transition-shadow hover:shadow-lg"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Browser header */}
          <div className="flex items-center border-border border-b px-3 py-2">
            <TrafficLightDots active isAnimated={isHovered} />
          </div>
          {/* Browser content */}
          <div className="relative overflow-hidden bg-background p-6">
            <p
              className={`font-medium text-lg transition-all duration-500 ${isHovered ? "text-foreground" : "text-muted-foreground/50"}`}
            >
              What will you create?
              <span
                className={`ml-1 inline-block h-5 w-0.5 bg-foreground align-middle transition-opacity duration-300 ${isHovered ? "animate-pulse" : "opacity-0"}`}
              />
            </p>
            <div className="mt-4 flex gap-2">
              <div
                className={`h-8 rounded bg-secondary transition-all duration-500 ${isHovered ? "w-20 bg-blue-100" : "w-16"}`}
                style={{ transitionDelay: "0ms" }}
              />
              <div
                className={`h-8 rounded bg-secondary transition-all duration-500 ${isHovered ? "w-24 bg-green-100" : "w-16"}`}
                style={{ transitionDelay: "100ms" }}
              />
              <div
                className={`h-8 rounded bg-secondary transition-all duration-500 ${isHovered ? "w-16 bg-purple-100" : "w-16"}`}
                style={{ transitionDelay: "200ms" }}
              />
            </div>
            {/* Animated loading bar */}
            <div
              className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-700 ${isHovered ? "w-full" : "w-0"}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
