"use client";

import { useCallback, useState } from "react";
import { ChapterIntro } from "./chapter-intro";
import { Act, type ActData } from "./act";
import { Connector } from "./connector";
import { Outro } from "./outro";

/* ── Data ──────────────────────────────────────────────────── */

const ACTS: ActData[] = [
  {
    id: "voice",
    num: "Act I",
    chapter: "01 / 04",
    eyebrow: "Listen",
    titleA: "Every call,",
    titleB: "answered",
    titleC: "in your shop's voice.",
    sub: "Retilo Voice picks up when you can't. It books, holds, and remembers — in Hindi, Tamil, English, or a mix. Calls become structured intent your team can act on.",
    pull: "It is not a chatbot. It is the other half of your counter.",
    metrics: [
      { lbl: "Pickup rate",  val: "100%" },
      { lbl: "Languages",   val: "11"   },
      { lbl: "Median resp.", val: "1.4s" },
    ],
    visual: "voice",
    flip: false,
  },
  {
    id: "local",
    num: "Act II",
    chapter: "02 / 04",
    eyebrow: "Understand",
    titleA: "Your street",
    titleB: "is not the city.",
    titleC: "",
    sub: "Local Intelligence reads the four blocks around your shop — search demand, footfall windows, neighbour shifts, weather pulls — and tells you when the corner is yours.",
    pull: "Macro trends lie. Pin codes don't.",
    metrics: [
      { lbl: "Coverage", val: "4-block" },
      { lbl: "Refresh",  val: "Hourly"  },
      { lbl: "Cohorts",  val: "14"      },
    ],
    visual: "heat",
    flip: true,
  },
  {
    id: "demand",
    num: "Act III",
    chapter: "03 / 04",
    eyebrow: "Predict",
    titleA: "The signal",
    titleB: "before",
    titleC: "the rush.",
    sub: "Demand Signals layers searches, weather, payday cycles, events, and returns into a live spectrum. You see the wave forming — three days before it hits the till.",
    pull: "Forecasting is just listening to five things at once.",
    metrics: [
      { lbl: "Sources",   val: "5+"  },
      { lbl: "Lead time", val: "72 hr" },
      { lbl: "Accuracy",  val: "91%" },
    ],
    visual: "spec",
    flip: false,
  },
  {
    id: "grader",
    num: "Act IV",
    chapter: "04 / 04",
    eyebrow: "Audit",
    titleA: "How does",
    titleB: "your shop",
    titleC: "actually score?",
    sub: "The Grader runs a 60-second audit on everything customers see — photos, hours, reviews, catalog, search rank — and tells you what to fix first. Then it watches the score climb.",
    pull: "What gets graded gets fixed.",
    metrics: [
      { lbl: "Scan time", val: "60s"     },
      { lbl: "Signals",   val: "120+"    },
      { lbl: "Avg lift",  val: "+45 pts" },
    ],
    visual: "grader",
    flip: true,
  },
];

const CONNECTORS = [
  {
    from: "Listen",
    to: "Understand",
    line: "What the caller says is one signal. Where they stand is another. We layer them.",
  },
  {
    from: "Understand",
    to: "Predict",
    line: "Now the corner has a heartbeat. We learn its rhythm and call the next note.",
  },
  {
    from: "Predict",
    to: "Audit",
    line: "Knowing the wave is half. Being ready for it — photos, stock, hours, replies — is the rest.",
  },
];

/* ── Progress rail ─────────────────────────────────────────── */

function ProgressRail({
  active,
  onJump,
}: {
  active: number;
  onJump: (i: number) => void;
}) {
  return (
    <div className="s-progress-rail">
      {ACTS.map((a, i) => (
        <div
          key={a.id}
          className={`s-item${active === i ? " active" : ""}`}
          onClick={() => onJump(i)}
        >
          <span>{a.eyebrow}</span>
          <span className="s-dash" />
        </div>
      ))}
    </div>
  );
}

/* ── Main export ────────────────────────────────────────────── */

export function StorySection() {
  const [active, setActive] = useState(0);

  const handleActive = useCallback((i: number) => setActive(i), []);

  const jump = (i: number) => {
    const acts = document.querySelectorAll(".s-act");
    const el = acts[i] as HTMLElement | undefined;
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <section data-ui="story" data-density="comfortable" id="how-it-works">
      <ChapterIntro />

      {ACTS.map((act, i) => (
        <div key={act.id}>
          <Act act={act} index={i} onActive={handleActive} />
          {i < CONNECTORS.length && (
            <Connector data={CONNECTORS[i]} idx={i} />
          )}
        </div>
      ))}

      <Outro />

      <ProgressRail active={active} onJump={jump} />
    </section>
  );
}
