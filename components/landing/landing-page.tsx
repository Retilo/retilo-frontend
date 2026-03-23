"use client"

// Main landing page assembler
// Sections: Nav → Hero → Bento → Features Dark → Grid Hover → CTA → Footer

import { LandingNav } from "./nav"
import { HeroSection } from "./hero-section"
import { BentoSection } from "./bento-section"
import { FeaturesDarkSection } from "./features-dark-section"
import { GridHoverSection } from "./grid-hover-section"
import { CtaCosmicSection } from "./cta-cosmic-section"
import { LandingFooter } from "./footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[oklch(0.09_0.012_270)]">
      <LandingNav />
      <main>
        <HeroSection />
        <BentoSection />
        <div id="how-it-works">
          <FeaturesDarkSection />
        </div>
        <div id="templates">
          <GridHoverSection />
        </div>
        <CtaCosmicSection />
      </main>
      <LandingFooter />
    </div>
  )
}
