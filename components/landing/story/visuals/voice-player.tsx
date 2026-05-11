"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

// Pre-computed with toFixed to prevent SSR/client float-precision mismatch
// (Math.sin results and float multiplication can differ between Node and browser engines)
const BARS: Array<{ height: string; delay: string }> = Array.from(
  { length: 64 },
  (_, i) => ({
    height: `${((0.3 + Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.31)) * 0.7) * 100).toFixed(1)}%`,
    delay:  `${((i % 12) * 0.07).toFixed(2)}s`,
  })
);

const TOTAL = 11;

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${r}`;
}

export function VoicePlayer() {
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setT((prev) => {
        if (prev >= TOTAL) { setPlaying(false); return 0; }
        return prev + 0.1;
      });
    }, 100);
    return () => clearInterval(id);
  }, [playing]);

  return (
    // AnimatedCard shell — spring entrance + hover lift (cult-ui-pro style)
    <motion.div
      className="voice-card"
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      whileHover={{ y: -4, boxShadow: "0 20px 60px -20px rgba(26,20,16,0.28)" }}
    >
      {/* AnimatedCardHeader */}
      <div className="voice-head">
        <span className="live">
          <span className="pulse" />
          Live · 00:11
        </span>
        <span style={{ marginLeft: "auto", color: "var(--fg-mute)" }}>
          Inbound · +91 9XXXXXX
        </span>
      </div>

      {/* AnimatedCardContent */}
      <div className="voice-body">
        <div className="voice-transcript">
          <span className="speaker cust">Caller</span>
          <span>
            &ldquo;Do you have the velvet kurta in medium? My sister&apos;s wedding is on Saturday.&rdquo;
          </span>
          <span className="speaker">Retilo</span>
          <span style={{ color: "var(--fg-sub)" }}>
            &ldquo;Yes — one left in deep maroon, one in olive. Want me to hold it under your name and text you the address?&rdquo;
          </span>
        </div>

        {/* AnimatedBadge variant="outline" tags */}
        <div className="tag-list">
          {[
            { label: "intent · purchase", cls: "intent" },
            { label: "sku · velvet-kurta-m", cls: "" },
            { label: "urgency · this week", cls: "alert" },
          ].map(({ label, cls }) => (
            <motion.span
              key={label}
              className={cn("tag", cls)}
              whileHover={{ scale: 1.04, y: -1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              {label}
            </motion.span>
          ))}
        </div>
      </div>

      {/* AnimatedCardFooter */}
      <div className="voice-foot">
        <button className="play" onClick={() => setPlaying(!playing)}>
          {playing ? "❚❚" : "▶"}
        </button>
        <div className={cn("voice-wave", playing && "playing")}>
          {BARS.map((bar, i) => (
            <span
              key={i}
              style={{
                height: bar.height,
                animationDelay: bar.delay,
                opacity: playing ? (i / BARS.length < t / TOTAL ? 0.95 : 0.4) : 0.45,
              }}
            />
          ))}
        </div>
        <span className="time">{fmt(t)} / 0:11</span>
      </div>
    </motion.div>
  );
}
