import { cn } from "@/lib/utils"

export function StatCard({ label, value, sub, trend, variant = "default" }) {
  const variantStyles = {
    default: "bg-white border-zinc-200",
    danger: "bg-red-50 border-red-200",
    warning: "bg-amber-50 border-amber-200",
    success: "bg-green-50 border-green-200",
    blue: "bg-blue-50 border-blue-200",
  }

  const trendColor = {
    up: "text-green-600",
    down: "text-red-500",
    neutral: "text-zinc-400",
  }

  return (
    <div className={cn("rounded-xl border p-4", variantStyles[variant])}>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 text-2xl font-bold tabular-nums tracking-tight",
          variant === "danger"
            ? "text-red-600"
            : variant === "warning"
            ? "text-amber-600"
            : variant === "success"
            ? "text-green-600"
            : variant === "blue"
            ? "text-blue-600"
            : "text-zinc-900"
        )}
      >
        {value}
      </p>
      <div className="mt-1 flex items-center gap-1.5">
        {trend && (
          <span className={cn("text-xs font-medium", trendColor[trend.dir])}>
            {trend.label}
          </span>
        )}
        {sub && <span className="text-xs text-zinc-400">{sub}</span>}
      </div>
    </div>
  )
}
