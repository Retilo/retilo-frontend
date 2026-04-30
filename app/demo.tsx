"use client";

import { EnterpriseBanner } from "../vercel-bento/enterprise-banner";
import { FeaturesGrid } from "../vercel-bento/features-grid";
import { FrameworkInfrastructure } from "../vercel-bento/framework-infrastructure";

export function MarketingBentoVercelDemo() {
  return (
    <div className="w-full bg-background">
      <FeaturesGrid />
      <FrameworkInfrastructure />
      <EnterpriseBanner />
    </div>
  );
}
