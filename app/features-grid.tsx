import { AgentsCard } from "./feature-cards/agents-card";
import { AIAppsCard } from "./feature-cards/ai-apps-card";
import { CommerceCard } from "./feature-cards/commerce-card";
import { PlatformCard } from "./feature-cards/platform-card";
import { WebAppsCard } from "./feature-cards/web-apps-card";

export function FeaturesGrid() {
  return (
    <section className="w-full border-border border-y">
      {/* Top row */}
      <div className="grid grid-cols-1 border-border border-b md:grid-cols-3">
        {/* Hero heading */}
        <div className="flex flex-col justify-center border-border border-b p-8 md:border-r md:border-b-0 md:p-12">
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
        <div className="border-border border-b md:border-r md:border-b-0">
          <AgentsCard />
        </div>

        {/* AI Apps card */}
        <div className="border-border border-b md:border-b-0">
          <AIAppsCard />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-3">
        {/* Web Apps card */}
        <div className="border-border border-b md:border-r md:border-b-0">
          <WebAppsCard />
        </div>

        {/* Composable Commerce card */}
        <div className="border-border border-b md:border-r md:border-b-0">
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
