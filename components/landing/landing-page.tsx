"use client"

import { LandingNav } from "./nav"
import { HeroSection } from "./hero-section"
import { BrandVisibilitySection } from "./brand-visibility-section"
import { BentoSection } from "./bento-section"
import { VoiceSection } from "./voice-section"
import { StorySection } from "./story/story-section"
import { CtaSection } from "./cta-cosmic-section"
import { AnalyticsSection } from "./analytics-section"
import { GlobeStatsSection } from "./globe-stats-section"
import { LandingFooter } from "./footer"
import { SectionDivider } from "./section-divider"
import { FloatingWhatsApp } from "./floating-whatsapp"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <FloatingWhatsApp />
      <main>
        <HeroSection />
        <SectionDivider n="01" label="AI Visibility" />
        <div id="ai-visibility">
          <BrandVisibilitySection />
        </div>
        <SectionDivider n="02" label="Analytics" />
        <AnalyticsSection />
        <GlobeStatsSection />
        <SectionDivider n="03" label="Platform" />
        <div id="integrations">
          <BentoSection />
        </div>
        <SectionDivider n="04" label="Voice" />
        <VoiceSection />
        <SectionDivider n="05" label="How It Works" />
        <StorySection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
