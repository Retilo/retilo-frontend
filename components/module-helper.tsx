"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { AnimatedPolishedNotification } from "@/components/animated-notification";
import type { RimVariant } from "@/components/animated-notification";

export interface ModuleHelperProps {
  moduleKey: string;
  title: string;
  description: string;
  rimVariant?: RimVariant;
  /** Auto-dismiss after ms (0 = never) */
  autoDismissMs?: number;
  className?: string;
}

export function ModuleHelper({
  moduleKey,
  title,
  description,
  rimVariant = "default",
  autoDismissMs = 0,
  className,
}: ModuleHelperProps) {
  const storageKey = `retilo_helper_dismissed_${moduleKey}`;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(storageKey) === "1";
    setVisible(!dismissed);
  }, [storageKey]);

  useEffect(() => {
    if (autoDismissMs > 0 && visible) {
      const t = setTimeout(() => setVisible(false), autoDismissMs);
      return () => clearTimeout(t);
    }
  }, [autoDismissMs, visible]);

  const dismiss = () => {
    localStorage.setItem(storageKey, "1");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <AnimatedPolishedNotification
          key={moduleKey}
          title={title}
          description={description}
          rimVariant={rimVariant}
          onDismiss={dismiss}
          slideFrom="top"
          className={className}
        />
      )}
    </AnimatePresence>
  );
}
