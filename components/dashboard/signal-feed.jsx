import { Star } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "size-3",
            i <= rating ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-200"
          )}
        />
      ))}
    </div>
  )
}

const sentimentStyles = {
  negative: { dot: "bg-red-500", badge: "text-red-600 bg-red-50 border-red-100" },
  positive: { dot: "bg-green-500", badge: "text-green-600 bg-green-50 border-green-100" },
  neutral:  { dot: "bg-zinc-400", badge: "text-zinc-500 bg-zinc-50 border-zinc-200" },
}

function FeedItem({ customerName, rating, storeName, platform, reviewText, timeAgo, sentiment }) {
  const initials = customerName?.slice(0, 2).toUpperCase() ?? "?"
  const style = sentimentStyles[sentiment] ?? sentimentStyles.neutral

  return (
    <div className="flex gap-3 py-4 border-b border-zinc-100 last:border-0">
      {/* Avatar + sentiment dot */}
      <div className="relative shrink-0">
        <Avatar className="size-8">
          <AvatarFallback className="bg-zinc-100 text-[11px] font-bold text-zinc-600">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white",
            style.dot
          )}
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Header row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-zinc-900">{customerName}</span>
          <StarRating rating={rating} />
          {platform && (
            <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold capitalize", style.badge)}>
              {platform}
            </span>
          )}
          <span className="ml-auto text-xs text-zinc-400 tabular-nums">{timeAgo}</span>
        </div>

        {/* Store */}
        <p className="mt-0.5 text-[11px] text-zinc-400 font-medium uppercase tracking-wide">
          {storeName}
        </p>

        {/* Review quote */}
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-700 line-clamp-2">
          &ldquo;{reviewText}&rdquo;
        </p>
      </div>
    </div>
  )
}

export function SignalFeed({ signals }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <ScrollArea className="h-[400px]">
        <div className="px-4">
          {signals.map((signal) => (
            <FeedItem key={signal.id} {...signal} />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

export function SignalFeedItem(props) {
  return <FeedItem {...props} />
}
