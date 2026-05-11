"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";

const BEFORE = [
  { cap: "5 photos · low light",       icon: "✕" },
  { cap: "Hours missing on Sun",        icon: "✕" },
  { cap: "Last review: 47 days ago",    icon: "✕" },
  { cap: "No reply to 3★ reviews",      icon: "✕" },
  { cap: "Catalog SKUs not tagged",     icon: "✕" },
  { cap: "Local search rank · #14",     icon: "✕" },
];

const AFTER = [
  { cap: "27 photos · daylight set",    icon: "✓" },
  { cap: "Hours synced · all 7 days",   icon: "✓" },
  { cap: "12 fresh reviews this week",  icon: "✓" },
  { cap: "Replies under 4 hr · auto",   icon: "✓" },
  { cap: "98% catalog enriched",        icon: "✓" },
  { cap: "Local search rank · #3",      icon: "✓" },
];

function GraderCard({
  variant,
  items,
  score,
  delta,
  label,
  badgeLabel,
  barPct,
}: {
  variant: "before" | "after";
  items: typeof BEFORE;
  score: number;
  delta: string;
  label: string;
  badgeLabel: string;
  barPct: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setWidth(barPct), 200);
      return () => clearTimeout(t);
    }
  }, [inView, barPct]);

  return (
    // AnimatedCard + AnimatedProgress shell (cult-ui-pro)
    <motion.div
      ref={ref}
      className={`grader-card ${variant}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ type: "spring", stiffness: 200, damping: 24, delay: variant === "after" ? 0.12 : 0 }}
      whileHover={{ y: -3 }}
    >
      <div className="gh">
        <span>{label}</span>
        <span className="badge">{badgeLabel}</span>
      </div>
      <div className="gscore">
        <span className="num">{score}</span>
        <span className="of">/ 100</span>
        <span className="delta">{delta}</span>
      </div>
      {/* AnimatedProgress bar */}
      <div className="s-score-bar">
        <div className="s-score-bar-fill" style={{ width: `${width}%` }} />
      </div>
      <div className="glist">
        {items.map((it, i) => (
          <div className="grow" key={i}>
            <span className="icon">{it.icon}</span>
            <span style={{ color: variant === "after" ? "var(--fg)" : "var(--fg-sub)" }}>
              {it.cap}
            </span>
            <span className="cap">{variant === "after" ? "cleared" : "flag"}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function GraderBeforeAfter() {
  return (
    <div className="grader-stack">
      <GraderCard
        variant="before"
        items={BEFORE}
        score={42}
        delta="at risk"
        label="Before · day 0"
        badgeLabel="unaudited"
        barPct={42}
      />
      <GraderCard
        variant="after"
        items={AFTER}
        score={87}
        delta="+45 pts"
        label="After · 30 days"
        badgeLabel="graded ✓"
        barPct={87}
      />
    </div>
  );
}
