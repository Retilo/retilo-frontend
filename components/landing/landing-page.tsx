"use client"

// Narrative arc:
// [LIGHT] Hero — who we are + urgency
// [DARK]  Problem at scale — globe, AI query volume
// [LIGHT] Solution — scanner + score + fix playbook
// [LIGHT] Proof — analytics chart, results
// [LIGHT] Platform — full feature set (bento + email)
// [DARK]  How it works — 3 steps
// [LIGHT] CTA

import { LandingNav } from "./nav"
import { HeroSection } from "./hero-section"
import { GlobeStatsSection } from "./globe-stats-section"
import { BrandVisibilitySection } from "./brand-visibility-section"
import { AnalyticsSection } from "./analytics-section"
import { BentoSection } from "./bento-section"
import { EmailAgentSection } from "./email-agent-section"
import { FeaturesDarkSection } from "./features-dark-section"
import { CtaSection } from "./cta-cosmic-section"
import { LandingFooter } from "./footer"

// ── Section label — small uppercase tag above each act ────────────────────────
function SectionTag({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <div className={`flex items-center justify-center pt-16 pb-0 ${light ? "bg-[#0d0914]" : "bg-white"}`}>
      <span
        className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em]"
        style={{ color: light ? "rgba(255,221,204,0.35)" : "rgba(0,0,0,0.28)" }}
      >
        <span className="w-6 h-px" style={{ background: light ? "rgba(255,221,204,0.2)" : "rgba(0,0,0,0.15)" }} />
        {children}
        <span className="w-6 h-px" style={{ background: light ? "rgba(255,221,204,0.2)" : "rgba(0,0,0,0.15)" }} />
      </span>
    </div>
  )
}

// ── Gradient bridge between dark and light ─────────────────────────────────────
function BridgeDarkToLight() {
  return (
    <div
      aria-hidden
      style={{
        height: 80,
        background: "linear-gradient(180deg, #0d0914 0%, #ffffff 100%)",
        pointerEvents: "none",
      }}
    />
  )
}

function BridgeLightToDark() {
  return (
    <div
      aria-hidden
      style={{
        height: 80,
        background: "linear-gradient(180deg, #ffffff 0%, #0d0914 100%)",
        pointerEvents: "none",
      }}
    />
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />

      <main>
        {/* ── ACT 1: Hero — product positioning, light bg ── */}
        <HeroSection />

        {/* ── Transition to dark ── */}
        <BridgeLightToDark />

        {/* ── ACT 2: Problem at Scale — dark bg, globe shows AI query volume ── */}
        <div className="bg-[#0d0914]" id="ai-visibility">
          <SectionTag light>The Problem</SectionTag>
          <GlobeStatsSection />
        </div>

        {/* ── Transition back to light ── */}
        <BridgeDarkToLight />

        {/* ── ACT 3: Solution — scanner, score, fix playbook ── */}
        <div id="solution">
          <SectionTag>The Solution</SectionTag>
          <BrandVisibilitySection />
        </div>

        {/* ── ACT 4: Proof — results over time ── */}
        <div className="bg-[#f7f7fa]" id="results">
          <SectionTag>Proven Results</SectionTag>
          <AnalyticsSection />
        </div>

        {/* ── ACT 5: Platform — full feature set ── */}
        <div id="integrations">
          <SectionTag>The Platform</SectionTag>
          <BentoSection />
          <EmailAgentSection />
        </div>

        {/* ── Transition to dark ── */}
        <BridgeLightToDark />

        {/* ── ACT 6: How it works — 3 steps ── */}
        <div className="bg-[#0d0914]" id="how-it-works">
          <SectionTag light>How It Works</SectionTag>
          <FeaturesDarkSection />
        </div>

        {/* ── Transition to light ── */}
        <BridgeDarkToLight />

        {/* ── ACT 7: CTA ── */}
        <CtaSection />
      </main>

      <LandingFooter />
    </div>
  )
}
