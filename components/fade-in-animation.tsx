"use client";

import { motion, useReducedMotion } from "motion/react";
import { createContext, useContext } from "react";
import type React from "react";

const FadeInStaggerContext = createContext(false);

const viewport = { once: true, margin: "0px 0px -200px" };

export function FadeIn(props: React.ComponentProps<typeof motion.div>) {
  const shouldReduceMotion = useReducedMotion();
  const isInStaggerGroup = useContext(FadeInStaggerContext);

  return (
    <motion.div
      transition={{ duration: 0.5 }}
      variants={{
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
        visible: { opacity: 1, y: 0 },
      }}
      {...(isInStaggerGroup
        ? {}
        : {
            initial: "hidden",
            whileInView: "visible",
            viewport,
          })}
      {...props}
    />
  );
}

export function FadeInDelay({ delay = 0, ...props }) {
  const shouldReduceMotion = useReducedMotion();
  const isInStaggerGroup = useContext(FadeInStaggerContext);

  return (
    <motion.div
      transition={{ duration: 0.5, delay }}
      variants={{
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
        visible: { opacity: 1, y: 0 },
      }}
      {...(isInStaggerGroup
        ? {}
        : {
            initial: "hidden",
            whileInView: "visible",
            viewport: { once: true, margin: "0px 0px -200px" },
          })}
      {...props}
    />
  );
}
export function FadeInStagger({ faster = false, ...props }) {
  return (
    <FadeInStaggerContext.Provider value={true}>
      <motion.div
        initial="hidden"
        transition={{ staggerChildren: faster ? 0.12 : 0.2 }}
        viewport={viewport}
        whileInView="visible"
        {...props}
      />
    </FadeInStaggerContext.Provider>
  );
}
