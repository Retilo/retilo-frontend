import { Building2, ShieldCheck } from "lucide-react";

export function EnterpriseBanner() {
  return (
    <section className="border-border border-b px-8 py-12">
      <div className="flex flex-wrap items-center justify-center gap-2 text-xl md:text-2xl">
        <span className="font-medium text-foreground">Scale your</span>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-foreground">
          <Building2 className="h-5 w-5" />
          <span>Enterprise</span>
        </span>
        <span className="font-medium text-foreground">
          without compromising
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-foreground">
          <ShieldCheck className="h-5 w-5" />
          <span>Security</span>
        </span>
      </div>
    </section>
  );
}
