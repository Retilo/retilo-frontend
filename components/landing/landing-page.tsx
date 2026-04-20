"use client"

// Landing page — light theme
// Sections: Nav → Hero (logo cloud) → Bento → Features (dark) → CTA → Footer

import { LandingNav } from "./nav"
import { HeroSection } from "./hero-section"
import { BrandVisibilitySection } from "./brand-visibility-section"
import { BentoSection } from "./bento-section"
import { EmailAgentSection } from "./email-agent-section"
import { FeaturesDarkSection } from "./features-dark-section"
import { CtaSection } from "./cta-cosmic-section"
import { AnalyticsSection } from "./analytics-section"
import { GlobeStatsSection } from "./globe-stats-section"
import { LandingFooter } from "./footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <main>
        <HeroSection />
        <div id="ai-visibility">
          <BrandVisibilitySection />
        </div>
        <AnalyticsSection />
        <GlobeStatsSection />
        <div id="integrations">
          <BentoSection />
        </div>
        <div id="email-agent">
          <EmailAgentSection />
        </div>
        <div id="how-it-works">
          <FeaturesDarkSection />
        </div>
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
