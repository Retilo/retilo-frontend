"use client";

import React, { useState } from "react";
import Image from "next/image";
import Script from "next/script";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight, Mic2, Phone, X } from "lucide-react";
import { NeuroNoise } from "@paper-design/shaders-react";
import { Button } from "@/components/ui/button";

// ── Design tokens (match /voice page) ────────────────────────────
const SWIGGY      = "#FC8019";
const SWIGGY_DEEP = "#a04000";
const FIELD_BACK  = "#080300";
const AMBER       = "#FBA649";
const CREAM       = "#FFEDCC";

const EL_LOGO_LIGHT = "https://eleven-public-cdn.elevenlabs.io/payloadcms/cy7rxce8uki-IIElevenLabsGrants%201.webp";
const EL_HREF       = "https://elevenlabs.io/startup-grants";

const ElevenLabsWidget = () =>
  React.createElement("elevenlabs-convai", { "agent-id": "agent_4101kqefg6fffqnrv8mv7j5fntrn" });

const MemoNeuroNoise = React.memo(NeuroNoise);

// ── Demo call modal ───────────────────────────────────────────────
function DemoCallModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key="modal"
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", bounce: 0.18, duration: 0.45 }}
          >
            <div
              className="relative w-full max-w-sm rounded-3xl overflow-hidden"
              style={{ background: FIELD_BACK, border: `1px solid ${SWIGGY}30` }}
            >
              <div
                className="flex items-center justify-between px-6 py-4 border-b"
                style={{ borderColor: `${SWIGGY}18` }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="size-2 rounded-full animate-pulse" style={{ background: SWIGGY }} />
                  <span className="text-sm font-semibold" style={{ color: CREAM }}>
                    Live demo call
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="size-7 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
                  style={{ color: `${CREAM}60` }}
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="flex flex-col items-center gap-5 px-6 py-8">
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: `${AMBER}80` }}>
                    Retilo Voice · ElevenLabs Agent
                  </p>
                  <p className="text-sm" style={{ color: `${CREAM}70` }}>
                    Click the button below to start a live AI ordering call
                  </p>
                </div>
                <div className="flex items-center justify-center w-full py-2">
                  <ElevenLabsWidget />
                </div>
                <div className="flex items-center gap-2 text-[10px]" style={{ color: `${CREAM}35` }}>
                  <a
                    href={EL_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                  >
                    Powered by
                    <Image
                      src={EL_LOGO_LIGHT}
                      alt="ElevenLabs"
                      width={60}
                      height={14}
                      className="h-3 w-auto object-contain opacity-50"
                    />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Section ───────────────────────────────────────────────────────
export function VoiceSection() {
  const [demoOpen, setDemoOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const words = ["Restaurants", "get", "orders", "from", "phone", "calls."];

  const wordVariants: Variants = {
    hidden: {
      opacity: 0,
      transform: shouldReduceMotion ? "translate3d(0,0,0)" : "translate3d(0,14px,0)",
      filter: shouldReduceMotion ? "blur(0px)" : "blur(4px)",
    },
    visible: {
      opacity: 1,
      transform: "translate3d(0,0,0)",
      filter: "blur(0px)",
      transition: { type: "spring", bounce: 0.05, duration: 0.62 },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      transform: shouldReduceMotion ? "translate3d(0,0,0)" : "translate3d(0,20px,0)",
    },
    visible: {
      opacity: 1,
      transform: "translate3d(0,0,0)",
      transition: { type: "spring", bounce: 0.06, duration: 0.58 },
    },
  };

  return (
    <section id="voice-section" className="relative overflow-hidden">
      <Script src="https://unpkg.com/@elevenlabs/convai-widget-embed" strategy="lazyOnload" />
      <DemoCallModal open={demoOpen} onClose={() => setDemoOpen(false)} />

      {/* NeuroNoise background */}
      <div className="relative min-h-[600px] lg:min-h-[680px]" style={{ background: FIELD_BACK }}>
        <MemoNeuroNoise
          brightness={0.44}
          className="pointer-events-none absolute inset-0 z-0"
          colorBack={FIELD_BACK}
          colorMid={SWIGGY_DEEP}
          colorFront={SWIGGY}
          contrast={0.48}
          height={680}
          rotation={22}
          scale={0.5}
          speed={1.2}
          style={{ width: "100%", height: "100%" }}
          width={1440}
        />

        {/* Vignette */}
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background: "linear-gradient(to bottom, rgba(8,3,0,0.35) 0%, transparent 40%, rgba(8,3,0,0.5) 100%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-5xl px-6 py-20 lg:px-10 lg:py-28">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              staggerChildren: shouldReduceMotion ? 0 : 0.08,
              delayChildren: shouldReduceMotion ? 0 : 0.1,
            }}
            className="flex flex-col gap-6 max-w-2xl"
          >
            {/* Badge */}
            <motion.div variants={itemVariants}>
              <span
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-medium text-xs tracking-wide backdrop-blur-sm"
                style={{
                  borderColor: `${SWIGGY}35`,
                  background: `${FIELD_BACK}70`,
                  color: AMBER,
                  boxShadow: `0 0 0 1px ${SWIGGY}22, 0 8px 28px ${SWIGGY_DEEP}25`,
                }}
              >
                <Mic2 className="h-3.5 w-3.5" style={{ color: SWIGGY }} />
                Retilo Voice · Powered by ElevenLabs
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              className="font-bold text-[#fff8f0] leading-[1.06] tracking-[-0.035em] [text-shadow:0_2px_28px_rgba(0,0,0,0.55)] text-[2.6rem] sm:text-[3.2rem] lg:text-[4rem]"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: shouldReduceMotion ? 0 : 0.055,
                    delayChildren: shouldReduceMotion ? 0 : 0.04,
                  },
                },
              }}
            >
              {words.map((word, i) => (
                <motion.span
                  key={i}
                  className="mr-[0.25em] inline-block last:mr-0"
                  variants={wordVariants}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h2>

            {/* Body copy */}
            <motion.p
              className="text-lg font-medium leading-relaxed [text-shadow:0_1px_18px_rgba(0,0,0,0.45)] sm:text-xl"
              style={{ color: `${CREAM}99` }}
              variants={itemVariants}
            >
              GMB drives inbound calls → ElevenLabs AI handles the conversation → orders placed automatically.
              One pipeline. Zero missed revenue.
            </motion.p>

            {/* CTAs */}
            <motion.div className="flex flex-col gap-3 sm:flex-row sm:gap-4 pt-2" variants={itemVariants}>
              <motion.div
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <a href="/voice">
                  <Button
                    className="rounded-full px-7 font-medium text-white"
                    size="lg"
                    style={{
                      background: SWIGGY,
                      boxShadow: `0 0 0 1px ${SWIGGY}55, 0 4px 28px ${SWIGGY}35`,
                    }}
                  >
                    See Retilo Voice
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </motion.div>

              <motion.div
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  onClick={() => setDemoOpen(true)}
                  className="rounded-full px-7 font-medium backdrop-blur-sm"
                  size="lg"
                  variant="outline"
                  style={{
                    border: `2px solid ${SWIGGY}55`,
                    background: `${FIELD_BACK}60`,
                    color: CREAM,
                    boxShadow: `0 0 0 1px ${SWIGGY}18, 0 4px 24px rgba(0,0,0,0.35)`,
                  }}
                >
                  <Phone className="mr-2 h-4 w-4" /> Hear a demo call
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Stat strip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16 grid grid-cols-3 gap-6 max-w-lg border-t pt-8"
            style={{ borderColor: `${SWIGGY}20` }}
          >
            {[
              { stat: "3×",   label: "more inbound calls" },
              { stat: "24/7", label: "AI call coverage"   },
              { stat: "< 2s", label: "order confirmed"    },
            ].map(s => (
              <div key={s.stat} className="text-left">
                <div className="text-2xl font-black tracking-tight" style={{ color: SWIGGY }}>{s.stat}</div>
                <div className="text-xs font-medium mt-0.5" style={{ color: `${CREAM}60` }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
