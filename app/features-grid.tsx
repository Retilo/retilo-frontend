import { AgentsCard } from "./agents-card";
import { AIAppsCard } from "./ai-apps-card";
import { CommerceCard } from "./commerce-card";
import { PlatformCard } from "./platform-card";
import { WebAppsCard } from "./web-apps-card";

export function FeaturesGrid() {
  return (
    <section className="w-full border-border border-y">
      {/* Top row */}
      <div className="bento-grid border-border border-b">
        {/* Hero heading */}
        <div className="flex flex-col justify-center border-border border-b p-8 bento-border-r md:p-12">
          <h1 className="mb-4 font-bold text-3xl text-foreground tracking-tight md:text-4xl">
            Your product,
            <br />
            delivered.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Security, speed, and AI included, so you can focus on your user.
          </p>
        </div>

        {/* Agents card */}
        <div className="border-border border-b bento-border-r">
          <AgentsCard />
        </div>

        {/* AI Apps card */}
        <div className="border-border border-b">
          <AIAppsCard />
        </div>
      </div>

      {/* Bottom row */}
      <div className="bento-grid">
        {/* Web Apps card */}
        <div className="border-border border-b bento-border-r">
          <WebAppsCard />
        </div>

        {/* Composable Commerce card */}
        <div className="border-border border-b bento-border-r">
          <CommerceCard />
        </div>

        {/* Multi-tenant Platform card */}
        <div>
          <PlatformCard />
        </div>
      </div>
    </section>
  );
}
