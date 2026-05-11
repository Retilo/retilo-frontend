"use client";

import { motion } from "motion/react";

const ACTS_INDEX = [
  { chapter: "01 / 04", name: "Voice",              verb: "Listen" },
  { chapter: "02 / 04", name: "Local Intelligence", verb: "Understand" },
  { chapter: "03 / 04", name: "Demand Signals",     verb: "Predict" },
  { chapter: "04 / 04", name: "Grader",             verb: "Audit" },
];

export function ChapterIntro() {
  return (
    <section className="s-chapter-intro" data-screen-label="00 · Chapter intro">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ type: "spring", stiffness: 160, damping: 22 }}
      >
        <div className="s-eyebrow" style={{ marginBottom: 22 }}>
          <span className="s-dot" />
          The story · in four acts
        </div>
        <h2 className="s-title-section">
          We don&apos;t sell{" "}
          <span className="s-serif" style={{ color: "var(--accent)" }}>features.</span>
          <br />
          We sell a{" "}
          <span className="s-serif" style={{ color: "var(--accent-2)" }}>quieter Monday.</span>
        </h2>
        <p className="s-lede" style={{ marginTop: 26 }}>
          Retilo is four modules that read the same shop from four angles, and stitch the
          findings into one weekly plan. Scroll through the acts — each one stands on its
          own; together, they&apos;re the system.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ type: "spring", stiffness: 160, damping: 22, delay: 0.12 }}
      >
        <ul className="s-index-list">
          {ACTS_INDEX.map((a) => (
            <li key={a.name}>
              <span className="s-num">{a.chapter}</span>
              <span className="s-name">{a.name}</span>
              <span className="s-verb">{a.verb}</span>
            </li>
          ))}
        </ul>
        <p
          style={{
            marginTop: 28,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--fg-mute)",
          }}
        >
          ~ 9 min read · or scroll to your favourite
        </p>
      </motion.div>
    </section>
  );
}
