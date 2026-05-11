"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

const W = 600, H = 300;

const LAYERS = [
  { amp: 24, freq: 0.014, off: 0,   color: "var(--accent)",           width: 1.6, opacity: 0.85 },
  { amp: 36, freq: 0.009, off: 1.2, color: "var(--accent-3)",         width: 1.2, opacity: 0.7  },
  { amp: 18, freq: 0.022, off: 2.4, color: "var(--accent-2)",         width: 1.0, opacity: 0.55 },
  { amp: 50, freq: 0.006, off: 3.1, color: "rgba(26,20,16,0.35)",     width: 0.8, opacity: 0.5  },
  { amp: 12, freq: 0.038, off: 4.0, color: "rgba(26,20,16,0.2)",      width: 0.6, opacity: 0.4  },
];

function buildPath(l: typeof LAYERS[0], phase: number) {
  const pts: string[] = [];
  for (let x = 0; x <= W; x += 4) {
    const y =
      H / 2 +
      Math.sin(x * l.freq + l.off + phase) * l.amp +
      Math.sin(x * l.freq * 2.3 + l.off * 1.7 + phase * 1.5) * (l.amp * 0.4);
    pts.push(`${x === 0 ? "M" : "L"}${x},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

export function Spectrogram() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      setPhase((p) => p + 0.012);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const cursorCy =
    H / 2 + Math.sin(W * 0.78 * LAYERS[0].freq + phase) * LAYERS[0].amp;

  return (
    // ShadowCard + ShadowCardBackdrop — cult-ui-pro glow shell
    <motion.div
      className="spec-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ type: "spring", stiffness: 180, damping: 22 }}
      style={{
        /* ShadowCardBackdrop: ambient glow underneath */
        filter: "drop-shadow(0 8px 32px rgba(200,84,61,0.08))",
      }}
    >
      <div className="spec-head">
        <span className="label">Demand spectrum · live</span>
        <span>5 signal sources</span>
      </div>

      <div className="spec-canvas">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ height: "100%" }}>
          {[0.25, 0.5, 0.75].map((p) => (
            <line
              key={p}
              x1={0} x2={W}
              y1={H * p} y2={H * p}
              stroke="rgba(26,20,16,0.06)"
              strokeWidth={1}
            />
          ))}
          {LAYERS.map((l, i) => (
            <path
              key={i}
              d={buildPath(l, phase)}
              fill="none"
              stroke={l.color}
              strokeWidth={l.width}
              opacity={l.opacity}
              strokeLinecap="round"
            />
          ))}
          <line
            x1={W * 0.78} x2={W * 0.78}
            y1={0} y2={H}
            stroke="var(--accent)"
            strokeWidth={1}
            strokeDasharray="2 4"
            opacity={0.5}
          />
          <circle cx={W * 0.78} cy={cursorCy} r={5} fill="var(--accent)" />
        </svg>
      </div>

      <div className="spec-foot">
        <span>00:00 — searches · weather · payday · events · returns</span>
        <span className="now">now · +42% biryani · +18% velvet · −9% cold drinks</span>
      </div>
    </motion.div>
  );
}
