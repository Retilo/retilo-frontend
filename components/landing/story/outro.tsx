"use client";

import { motion } from "motion/react";

const THREADS = [
  { lbl: "Voice", nm: "Listens" },
  { lbl: "Local", nm: "Sees" },
  { lbl: "Signals", nm: "Predicts" },
  { lbl: "Grader", nm: "Audits" },
];

export function Outro() {
  return (
    <section className="s-outro" data-screen-label="05 · Outro">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ type: "spring", stiffness: 160, damping: 22 }}
      >
        <div className="s-eyebrow" style={{ marginBottom: 22 }}>
          <span className="s-dot" />
          The whole machine
        </div>
        <h2 className="s-title-section">
          Four threads.
          <br />
          <span className="s-serif" style={{ color: "var(--accent)" }}>One shop.</span>
        </h2>
        <p className="s-lede" style={{ marginTop: 26 }}>
          Each module reads the world differently — Voice hears, Local sees, Signals predicts,
          Grader scores. They write to the same brain, and you get a single Monday plan that
          tells you what to do next, why, and what it should move.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 36, flexWrap: "wrap" }}>
          <motion.a
            href="/grader"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "inline-block",
              padding: "14px 24px", borderRadius: 999, border: "none",
              background: "var(--ink)", color: "var(--paper)", fontSize: 14, cursor: "pointer",
              textDecoration: "none",
            }}
          >
            Run a 60-second audit
          </motion.a>
          <motion.a
            href="https://wa.me/917288807097"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 24px", borderRadius: 999, border: "1px solid var(--rule)",
              background: "transparent", color: "var(--ink)", fontSize: 14, cursor: "pointer",
              textDecoration: "none",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#25d366" }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Talk to Expert
          </motion.a>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ type: "spring", stiffness: 160, damping: 22, delay: 0.1 }}
      >
        <div className="s-four-threads">
          {THREADS.map(({ lbl, nm }) => (
            <div key={lbl}>
              <div className="s-lbl">{lbl}</div>
              <div className="s-nm">{nm}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
