import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const actionConfig = {
  reply: {
    variant: "default",
    className: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  fix: {
    variant: "default",
    className: "bg-red-600 hover:bg-red-700 text-white",
  },
  investigate: {
    variant: "default",
    className: "bg-zinc-800 hover:bg-zinc-900 text-white",
  },
  review: {
    variant: "outline",
    className: "border-zinc-300 text-zinc-700 hover:bg-zinc-50",
  },
}

export function ActionCard({
  title,
  description,
  store,
  actionLabel,
  actionVariant = "reply",
  onAction,
}) {
  const cfg = actionConfig[actionVariant] ?? actionConfig.reply

  return (
    <div className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 transition-colors hover:bg-zinc-50/70">
      {/* Left: text */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-900">{title}</p>
        {store && (
          <p className="mt-0.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">
            {store}
          </p>
        )}
        {description && (
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {/* Right: CTA */}
      <Button
        size="sm"
        variant={cfg.variant}
        onClick={onAction}
        className={cn("h-8 shrink-0 gap-1.5 text-xs font-semibold", cfg.className)}
      >
        {actionLabel}
        <ArrowRight className="size-3" />
      </Button>
    </div>
  )
}
