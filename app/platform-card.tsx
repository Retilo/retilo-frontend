import { Lock } from "lucide-react";
import { ArrowButton, FeatureCardHeader } from "./shared";

export function PlatformCard() {
  return (
    <div className="flex h-full flex-col p-8 md:p-10">
      <FeatureCardHeader
        description="Serve millions securely across isolated environments."
        title="Multi-tenant Platform"
      />
      <ArrowButton />

      {/* Stacked domain cards */}
      <div className="group relative mt-auto h-32 cursor-pointer">
        <DomainCard
          className="absolute top-0 right-0 left-8 scale-95 opacity-40 transition-all duration-300 ease-out group-hover:-top-2 group-hover:left-6 group-hover:opacity-60"
          domain="joe.domain.com"
          dotColor="bg-muted-foreground/30"
        />
        <DomainCard
          className="absolute top-4 right-0 left-4 scale-[0.97] opacity-60 transition-all delay-[50ms] duration-300 ease-out group-hover:top-5 group-hover:left-3 group-hover:opacity-75"
          domain="jane.domain.com"
          dotColor="bg-muted-foreground/50"
        />
        <DomainCard
          className="absolute top-8 right-0 left-2 scale-[0.99] opacity-80 transition-all delay-100 duration-300 ease-out group-hover:top-11 group-hover:left-1 group-hover:opacity-90"
          domain="project.domain.com"
          dotColor="bg-muted-foreground/70"
        />
        <DomainCard
          active
          className="absolute top-12 right-0 left-0 transition-all delay-150 duration-300 ease-out group-hover:top-16 group-hover:scale-[1.02]"
          domain="customer.domain.com"
          dotColor="bg-red-400"
        />
      </div>
    </div>
  );
}

function DomainCard({
  domain,
  className = "",
  dotColor = "bg-muted-foreground",
  active = false,
}: {
  domain: string;
  className?: string;
  dotColor?: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 ${className}`}
    >
      <div className="flex items-center gap-1">
        <div
          className={`h-2 w-2 rounded-full ${active ? "bg-red-400" : dotColor}`}
        />
        <div
          className={`h-2 w-2 rounded-full ${active ? "bg-yellow-400" : dotColor}`}
        />
        <div
          className={`h-2 w-2 rounded-full ${active ? "bg-green-400" : dotColor}`}
        />
      </div>
      <div className="flex flex-1 items-center justify-center gap-1.5 text-muted-foreground text-sm">
        <Lock className="h-3 w-3" />
        <span>{domain}</span>
      </div>
    </div>
  );
}
