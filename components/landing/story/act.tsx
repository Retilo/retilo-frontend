"use client";

import { useEffect, useRef, useState } from "react";
import { VoicePlayer } from "./visuals/voice-player";
import { HeatmapVisual } from "./visuals/heatmap";
import { Spectrogram } from "./visuals/spectrogram";
import { GraderBeforeAfter } from "./visuals/grader-before-after";

export interface ActData {
  id: string;
  num: string;
  chapter: string;
  eyebrow: string;
  titleA: string;
  titleB: string;
  titleC: string;
  sub: string;
  pull: string;
  metrics: Array<{ lbl: string; val: string }>;
  visual: "voice" | "heat" | "spec" | "grader";
  flip: boolean;
}

interface ActProps {
  act: ActData;
  index: number;
  onActive: (i: number) => void;
}

const SECTION_HEIGHT = "150vh";

function VisualSlot({ visual }: { visual: ActData["visual"] }) {
  if (visual === "voice") return <VoicePlayer />;
  if (visual === "heat")  return <HeatmapVisual />;
  if (visual === "spec")  return <Spectrogram />;
  return <GraderBeforeAfter />;
}

export function Act({ act, index, onActive }: ActProps) {
  const wrapRef  = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const rect  = wrap.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const passed = -rect.top;
      const p = Math.max(0, Math.min(1, passed / total));
      setProgress(p);
      if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.6) {
        onActive(index);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [index, onActive]);

  const visualStyle: React.CSSProperties = {
    transform: `translateY(${(progress - 0.5) * 60}px) scale(${1 + Math.abs(progress - 0.5) * 0.04})`,
    transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
  };
  const textStyle: React.CSSProperties = {
    transform: `translateY(${(progress - 0.5) * -30}px)`,
    opacity: 0.4 + Math.min(1, 1 - Math.abs(progress - 0.5) * 1.4) * 0.6,
  };

  return (
    <section
      ref={wrapRef}
      className={`s-act${act.flip ? " flip" : ""}`}
      style={{ height: SECTION_HEIGHT }}
      data-screen-label={`Act ${index + 1} · ${act.eyebrow}`}
    >
      <div className="s-act-stage">
        {/* Text column */}
        <div className="s-act-text" style={textStyle}>
          <div className="s-chapter-num">
            <span>{act.num}</span>
            <span style={{ color: "var(--fg-sub)" }}>· {act.chapter}</span>
          </div>
          <h2 className="s-act-h2">
            {act.titleA}{" "}
            <span className="s-em">{act.titleB}</span>{" "}
            {act.titleC}
          </h2>
          <p className="s-act-sub">{act.sub}</p>
          <p className="s-act-pull">{act.pull}</p>
          <div className="s-meta-row">
            {act.metrics.map((m) => (
              <div key={m.lbl}>
                {m.lbl}
                <b>{m.val}</b>
              </div>
            ))}
          </div>
        </div>

        {/* Visual column */}
        <div className="s-act-visual" style={visualStyle}>
          <VisualSlot visual={act.visual} />
        </div>
      </div>
    </section>
  );
}
