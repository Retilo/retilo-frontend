"use client"

import { LandingNav } from "./nav"
import { HeroSection } from "./hero-section"
import { BrandVisibilitySection } from "./brand-visibility-section"
import { StorySection } from "./story/story-section"
import { VoiceSection } from "./voice-section"
import { GlobeStatsSection } from "./globe-stats-section"
import { AnalyticsSection } from "./analytics-section"
import { CtaSection } from "./cta-cosmic-section"
import { LandingFooter } from "./footer"
import { SectionDivider } from "./section-divider"
import { FloatingWhatsApp } from "./floating-whatsapp"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <FloatingWhatsApp />
      <main>

        {/* ── 01 · Introduction ─────────────────────────────────── */}
        <HeroSection />

        {/* ── 02 · The Problem ─────────────────────────────────── */}
        <SectionDivider n="01" label="The Problem" />
        <div id="ai-visibility">
          <BrandVisibilitySection />
        </div>

        {/* ── 03 · The Platform — dark chapter flows through ─────── */}
        <div id="how-it-works">
          <StorySection />
        </div>

        {/* ── 04 · Voice — continues the dark chapter ──────────── */}
        <div id="voice">
          <VoiceSection />
        </div>

        {/* ── 05 · Scale ───────────────────────────────────────── */}
        <GlobeStatsSection />

        {/* ── 06 · The Results ─────────────────────────────────── */}
        <SectionDivider n="02" label="The Results" />
        <AnalyticsSection />

        {/* ── 07 · Action ──────────────────────────────────────── */}
        <CtaSection />

      </main>
      <LandingFooter />
    </div>
  )
}
