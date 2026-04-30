"use client";

import { Settings2 } from "lucide-react";
import { LayoutGroup, motion } from "motion/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { ArrowButton, FeatureCardHeader } from "./shared";

const initialBadges = [
  { id: "fluid", icon: <Settings2 className="h-3.5 w-3.5" />, label: "Fluid" },
  { id: "sdk", label: "AI", badge: "SDK" },
  { id: "gateway", label: "AI", badge: "GATEWAY" },
  { id: "workflow", label: "Workflow" },
  { id: "sandbox", label: "Sandbox" },
  { id: "botid", label: "BotID" },
];

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function AIAppsCard() {
  const [badges, setBadges] = useState(initialBadges);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isHovered) {
      // Shuffle immediately on hover
      setBadges(shuffleArray(initialBadges));
      // Continue shuffling every 800ms
      intervalRef.current = setInterval(() => {
        setBadges(shuffleArray(initialBadges));
      }, 800);
    } else {
      // Reset to original order when not hovered
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setBadges(initialBadges);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovered]);

  return (
    <div className="flex h-full flex-col bg-secondary/50 p-8 md:p-10">
      <FeatureCardHeader
        description="Enrich any product or feature with the latest models and tools."
        title="AI Apps"
      />
      <ArrowButton />

      {/* Badges grid */}
      <LayoutGroup>
        <div
          className="mt-auto flex cursor-pointer flex-wrap gap-2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {badges.map((badge) => (
            <Badge
              badge={badge.badge}
              icon={badge.icon}
              key={badge.id}
              label={badge.label}
              layoutId={badge.id}
            />
          ))}
        </div>
      </LayoutGroup>
    </div>
  );
}

function Badge({
  icon,
  label,
  badge,
  layoutId,
}: {
  icon?: React.ReactNode;
  label: string;
  badge?: string;
  layoutId: string;
}) {
  return (
    <motion.div
      className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-foreground text-sm"
      layout
      layoutId={layoutId}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 30,
      }}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span className="rounded bg-secondary px-1.5 py-0.5 font-medium text-[10px] text-muted-foreground">
          {badge}
        </span>
      )}
    </motion.div>
  );
}
