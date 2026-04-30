import { ArrowRight } from "lucide-react";

export function FeatureCardHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="mb-2 font-semibold text-foreground text-xl">{title}</h2>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export function ArrowButton() {
  return (
    <button className="mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-secondary">
      <ArrowRight className="h-4 w-4 text-foreground" />
    </button>
  );
}

export function TrafficLightDots({
  isAnimated = false,
  dotColor,
  active = false,
}: {
  isAnimated?: boolean;
  dotColor?: string;
  active?: boolean;
}) {
  const baseClass =
    "w-2.5 h-2.5 rounded-full transition-transform duration-300";
  const animatedClass = isAnimated ? "scale-125" : "";

  if (active) {
    return (
      <div className="flex items-center gap-1.5">
        <div className={`${baseClass} bg-red-400 ${animatedClass}`} />
        <div
          className={`${baseClass} bg-yellow-400 ${animatedClass} delay-75`}
        />
        <div
          className={`${baseClass} bg-green-400 ${animatedClass} delay-150`}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`${baseClass} ${dotColor || "bg-red-400"} ${animatedClass}`}
      />
      <div
        className={`${baseClass} ${dotColor || "bg-yellow-400"} ${animatedClass} delay-75`}
      />
      <div
        className={`${baseClass} ${dotColor || "bg-green-400"} ${animatedClass} delay-150`}
      />
    </div>
  );
}
