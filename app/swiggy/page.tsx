"use client"

import { motion } from "motion/react"
import { TrendingUp, DollarSign, Search, ShoppingBag, BarChart2, Zap, Hash, Star } from "lucide-react"
import { MarketingWaitlistMinimal } from "@/components/marketing-waitlist-minimal"

const ORANGE = "#FC8019"
const DARK = "#1a0a00"

// ── Capabilities built for Swiggy restaurants ─────────────────────

const CAPABILITIES = [
  {
    icon: Search,
    title: "Competitor Intelligence",
    description:
      "Auto-discover nearby restaurants on Swiggy. Track their menus, ratings, and positioning — updated every scan.",
    preview: (
      <div className="space-y-2 mt-4">
        {[
          { name: "Behrouz Biryani", rating: "4.5", cuisine: "Biryani", highlight: true },
          { name: "Faasos",          rating: "4.1", cuisine: "Wraps",   highlight: false },
          { name: "Box8",            rating: "4.3", cuisine: "Meals",   highlight: false },
        ].map((c) => (
          <div
            key={c.name}
            className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
            style={{
              background: c.highlight ? `${ORANGE}12` : "oklch(0.96 0.003 50)",
              border: `1px solid ${c.highlight ? `${ORANGE}28` : "oklch(0.91 0.005 50)"}`,
            }}
          >
            <div
              className="size-7 rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold text-white"
              style={{ background: ORANGE }}
            >
              {c.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-800 truncate">{c.name}</div>
              <div className="text-[10px] text-gray-400">{c.cuisine}</div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-gray-700">{c.rating}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: DollarSign,
    title: "Pricing Analysis",
    description:
      "See exactly how your average price stacks up against competitors. Spot pricing gaps before customers do.",
    preview: (
      <div className="space-y-2 mt-4">
        {[
          { label: "Your avg price", value: "₹245", delta: null,  you: true },
          { label: "Biryani Blues",  value: "₹280", delta: "+35", you: false },
          { label: "Behrouz",        value: "₹210", delta: "−35", you: false },
        ].map((r) => (
          <div
            key={r.label}
            className="flex items-center gap-3 rounded-lg px-3 py-2"
            style={{
              background: r.you ? `${ORANGE}10` : "oklch(0.96 0.003 50)",
              border: `1px solid ${r.you ? `${ORANGE}25` : "oklch(0.91 0.005 50)"}`,
            }}
          >
            <div className="flex-1 text-xs font-medium text-gray-700 truncate">{r.label}</div>
            <div className="text-sm font-bold" style={{ color: r.you ? ORANGE : "#374151" }}>{r.value}</div>
            {r.delta && (
              <div className="text-[10px] font-bold" style={{ color: r.delta.startsWith("+") ? "#16a34a" : "#dc2626" }}>
                {r.delta}
              </div>
            )}
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Hash,
    title: "Keyword Rankings",
    description:
      "Know where you rank when customers search 'biryani near me' or 'best pizza' on Swiggy. Track every keyword that matters.",
    preview: (
      <div className="space-y-2 mt-4">
        {[
          { keyword: "biryani near me", rank: 2,  results: 48 },
          { keyword: "chicken fried rice", rank: 5, results: 31 },
          { keyword: "late night food",  rank: 1,  results: 22 },
        ].map((r) => {
          const rankColor = r.rank <= 2 ? "#16a34a" : r.rank <= 5 ? ORANGE : "#6b7280"
          return (
            <div
              key={r.keyword}
              className="flex items-center gap-3 rounded-lg px-3 py-2"
              style={{ background: "oklch(0.96 0.003 50)", border: "1px solid oklch(0.91 0.005 50)" }}
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-700 truncate">{r.keyword}</div>
                <div className="text-[10px] text-gray-400">{r.results} restaurants</div>
              </div>
              <div className="text-lg font-black" style={{ color: rankColor }}>#{r.rank}</div>
            </div>
          )
        })}
      </div>
    ),
  },
]

// ── What's next (teaser) ──────────────────────────────────────────

const ROADMAP = [
  { icon: BarChart2, label: "Menu performance analytics" },
  { icon: Zap,       label: "AI-powered menu suggestions" },
  { icon: TrendingUp, label: "Demand forecasting" },
  { icon: Star,      label: "Review sentiment vs competitors" },
]

// ── Page ─────────────────────────────────────────────────────────

export default function SwiggyPromoPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Nav strip */}
      <div className="border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        <div
          className="size-7 rounded-lg flex items-center justify-center text-white font-black text-sm"
          style={{ background: ORANGE }}
        >
          S
        </div>
        <span className="font-bold text-gray-900 text-sm">Retilo × Swiggy</span>
        <span className="ml-auto text-xs text-gray-400">Private Beta</span>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-16 px-4">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 50% -10%, ${ORANGE}0f, transparent 65%)`,
          }}
        />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold mb-6"
              style={{ borderColor: `${ORANGE}35`, color: ORANGE, background: `${ORANGE}0d` }}
            >
              <ShoppingBag className="size-3.5" />
              Built for Swiggy Builders Club
            </div>

            <h1
              className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 mb-5 leading-[1.07]"
              style={{ letterSpacing: "-0.03em" }}
            >
              The intelligence layer<br />
              <span style={{ color: ORANGE }}>Swiggy restaurants</span>{" "}need
            </h1>

            <p className="text-gray-500 text-lg leading-relaxed max-w-xl mx-auto">
              Retilo plugs into your Swiggy account and gives you a live view of competitor pricing,
              keyword rankings, and market positioning — so you can act before orders drop.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {CAPABILITIES.map((cap, i) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-2xl p-5 border border-gray-100 bg-white hover:shadow-md transition-shadow"
            >
              <div
                className="size-9 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${ORANGE}14` }}
              >
                <cap.icon className="size-[18px]" style={{ color: ORANGE }} />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1.5">{cap.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{cap.description}</p>
              {cap.preview}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Roadmap teaser */}
      <section className="px-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-2xl p-6 border"
            style={{ background: `${ORANGE}06`, borderColor: `${ORANGE}20` }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: ORANGE }}>
              Coming next
            </p>
            <div className="grid grid-cols-2 gap-3">
              {ROADMAP.map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <item.icon className="size-4 shrink-0 text-gray-400" />
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section className="px-4 pb-28">
        <div className="max-w-lg mx-auto">
          <div className="rounded-3xl border border-gray-100 bg-gray-50/50 p-10 text-center">
            <MarketingWaitlistMinimal
              headline="Get early access"
              subtext="We're onboarding Swiggy restaurants in batches. Drop your email and we'll reach out when your slot opens."
              placeholder="restaurant@example.com"
              buttonLabel="Request access"
              successMessage="You're on the list — we'll be in touch!"
              accentColor={ORANGE}
              count={89}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="border-t border-gray-100 px-6 py-5 text-center">
        <p className="text-xs text-gray-400">
          Made by <span className="font-semibold text-gray-600">Retilo</span> · Built for Swiggy Builders Club 2026
        </p>
      </div>

    </div>
  )
}
