"use client";

import { motion } from "motion/react";

const COLS = 14, ROWS = 10;
const YOU_COL = 7, YOU_ROW = 5;

type CellClass = "hot" | "warm" | "tepid" | "cool" | "you";

interface Cell { c: number; r: number; cls: CellClass }

function buildCells(): Cell[] {
  const cells: Cell[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const dx = c - YOU_COL, dy = r - YOU_ROW;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const noise =
        Math.sin(c * 1.7) * Math.cos(r * 0.9) * 0.7 +
        Math.sin((c + r) * 0.4) * 0.5;
      const demand = Math.max(0, 1.6 - dist * 0.18) + noise;

      let cls: CellClass = "cool";
      if (c === YOU_COL && r === YOU_ROW) cls = "you";
      else if (demand > 1.2) cls = "hot";
      else if (demand > 0.7) cls = "warm";
      else if (demand > 0.2) cls = "tepid";

      cells.push({ c, r, cls });
    }
  }
  return cells;
}

const CELLS = buildCells();

export function HeatmapVisual() {
  return (
    // AnimatedCard shell (no header variant) — cult-ui-pro spring entrance
    <motion.div
      className="heat-card"
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
    >
      <div className="heat-head">
        <span className="city">Indiranagar · 12 Main</span>
        <span>Demand · last 7 days</span>
      </div>

      <div className="heat-grid-wrap">
        <div
          className="heat-grid"
          style={{
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          }}
        >
          {CELLS.map((cell, i) => (
            <div
              key={i}
              className={`heat-cell ${cell.cls}`}
              style={{
                animation: `story-cell-fade 0.6s ${(cell.c + cell.r) * 0.025}s both ease-out`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="heat-foot">
        <span>
          <span className="swatch" style={{ background: "var(--accent)" }} />
          peak
        </span>
        <span>
          <span className="swatch" style={{ background: "rgba(217,154,58,0.5)" }} />
          warm
        </span>
        <span>
          <span className="swatch" style={{ background: "rgba(26,20,16,0.07)" }} />
          quiet
        </span>
        <span style={{ marginLeft: "auto", color: "var(--ink)" }}>14 cohorts · 9 categories</span>
      </div>
    </motion.div>
  );
}
