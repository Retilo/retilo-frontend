"use client";

import { EnterpriseBanner } from "./enterprise-banner";
import { FeaturesGrid } from "./features-grid";
import { FrameworkInfrastructure } from "./framework-infrastructure";

export function MarketingBentoVercelDemo() {
  return (
    <div className="w-full bg-background">
      <FeaturesGrid />
      <FrameworkInfrastructure />
      <EnterpriseBanner />
    </div>
  );
}
