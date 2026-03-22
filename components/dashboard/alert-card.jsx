import { cn } from "@/lib/utils"

const severityConfig = {
  high: {
    dot: "bg-red-500",
    label: "HIGH",
    labelClass: "text-red-500 bg-red-50 border border-red-200",
    rowClass: "hover:bg-red-50/60",
    countClass: "bg-red-100 text-red-700",
  },
  medium: {
    dot: "bg-amber-400",
    label: "MED",
    labelClass: "text-amber-600 bg-amber-50 border border-amber-200",
    rowClass: "hover:bg-amber-50/50",
    countClass: "bg-amber-100 text-amber-700",
  },
  low: {
    dot: "bg-blue-400",
    label: "LOW",
    labelClass: "text-blue-500 bg-blue-50 border border-blue-200",
    rowClass: "hover:bg-blue-50/50",
    countClass: "bg-blue-100 text-blue-700",
  },
}

export function AlertCard({ severity = "medium", title, description, count }) {
  const cfg = severityConfig[severity] ?? severityConfig.medium

  return (
    <div
      className={cn(
        "group flex items-center gap-3.5 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 transition-colors",
        cfg.rowClass
      )}
    >
      {/* Severity dot */}
      <div className={cn("size-2 shrink-0 rounded-full", cfg.dot)} />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-zinc-900">{title}</span>
          {count && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums",
                cfg.countClass
              )}
            >
              {count}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{description}</p>
        )}
      </div>

      {/* Severity chip */}
      <span
        className={cn(
          "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest",
          cfg.labelClass
        )}
      >
        {cfg.label}
      </span>
    </div>
  )
}
