"use client"

// Landing page — light theme
// Sections: Nav → Hero (logo cloud) → Bento → Features (dark) → CTA → Footer

import { LandingNav } from "./nav"
import { HeroSection } from "./hero-section"
import { BentoSection } from "./bento-section"
import { FeaturesDarkSection } from "./features-dark-section"
import { CtaSection } from "./cta-cosmic-section"
import { LandingFooter } from "./footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <main>
        <HeroSection />
        <div id="integrations">
          <BentoSection />
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
