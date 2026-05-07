"use client";

import NumberFlow from "@number-flow/react";
import { useMemo, useState } from "react";
import { Star, TrendingUp, Phone, Search, CheckCircle2, Zap } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const COMPARISON_FEATURES = [
  {
    icon: Star,
    name: "Reputation",
    retilo: "Auto-reply to every review + AI sentiment tracking",
    without: "Manually checking and responding — most go unanswered",
  },
  {
    icon: Search,
    name: "Discoverability",
    retilo: "GBP keyword tracking + GEO-SEO visibility scoring",
    without: "Zero visibility into how customers find you online",
  },
  {
    icon: Phone,
    name: "Voice Ordering",
    retilo: "AI receptionist answers 100% of calls, places orders",
    without: "Missed calls = missed revenue, especially after hours",
  },
  {
    icon: TrendingUp,
    name: "Demand Planning",
    retilo: "Demand signals: weather + festivals + events = daily prep guidance",
    without: "Gut-feel inventory — overstock or stockouts",
  },
];

export function ROICalculator() {
  const [monthlyCustomers, setMonthlyCustomers] = useState(400);
  const [avgOrderValue, setAvgOrderValue] = useState(450);
  const [missedCallsPerMonth, setMissedCallsPerMonth] = useState(30);
  const [currentRating, setCurrentRating] = useState(3.8);

  const calc = useMemo(() => {
    const ratingImprovementFactor = Math.max(0, (4.4 - currentRating) * 0.08);
    const reputationRevenue = monthlyCustomers * avgOrderValue * ratingImprovementFactor;
    const voiceRevenue = missedCallsPerMonth * avgOrderValue * 0.45;
    const seoRevenue = monthlyCustomers * avgOrderValue * 0.06;
    const demandRevenue = monthlyCustomers * avgOrderValue * 0.03;
    const totalMonthly = reputationRevenue + voiceRevenue + seoRevenue + demandRevenue;
    const totalAnnual = totalMonthly * 12;
    return { reputationRevenue, voiceRevenue, seoRevenue, demandRevenue, totalMonthly, totalAnnual };
  }, [monthlyCustomers, avgOrderValue, missedCallsPerMonth, currentRating]);

  const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

  return (
    <div className="rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-lg max-w-4xl mx-auto">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-gray-100" style={{ background: "oklch(0.985 0.003 350)" }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "oklch(0.58 0.24 350)" }}>
            <Zap className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Revenue Impact Calculator</h2>
        </div>
        <p className="text-gray-500 text-sm">See how much additional revenue Retilo can unlock for your business.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-0">
        {/* Left: Inputs */}
        <div className="p-8 border-r border-gray-100 space-y-8">
          <div>
            <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-3">
              <span>Monthly customers / orders</span>
              <span className="font-bold text-gray-900 tabular-nums">{monthlyCustomers}</span>
            </label>
            <Slider
              min={50} max={2000} step={50}
              value={[monthlyCustomers]}
              onValueChange={v => setMonthlyCustomers(v[0] ?? monthlyCustomers)}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1.5">
              <span>50</span><span>2,000+</span>
            </div>
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-3">
              <span>Avg. order / transaction value</span>
              <span className="font-bold text-gray-900 tabular-nums">₹{avgOrderValue}</span>
            </label>
            <Slider
              min={100} max={3000} step={50}
              value={[avgOrderValue]}
              onValueChange={v => setAvgOrderValue(v[0] ?? avgOrderValue)}
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1.5">
              <span>₹100</span><span>₹3,000</span>
            </div>
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-3">
              <span>Missed calls per month</span>
              <span className="font-bold text-gray-900 tabular-nums">{missedCallsPerMonth}</span>
            </label>
            <Slider
              min={0} max={200} step={5}
              value={[missedCallsPerMonth]}
              onValueChange={v => setMissedCallsPerMonth(v[0] ?? missedCallsPerMonth)}
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1.5">
              <span>0</span><span>200</span>
            </div>
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-3">
              <span>Current Google rating</span>
              <span className="font-bold text-gray-900 tabular-nums flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                {currentRating.toFixed(1)}
              </span>
            </label>
            <Slider
              min={1.0} max={5.0} step={0.1}
              value={[currentRating]}
              onValueChange={v => setCurrentRating(v[0] ?? currentRating)}
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1.5">
              <span>1.0★</span><span>5.0★</span>
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="p-8 flex flex-col gap-6">
          {/* Total */}
          <div className="rounded-2xl p-5 text-center" style={{ background: "linear-gradient(135deg, oklch(0.55 0.24 280) 0%, oklch(0.58 0.24 350) 100%)" }}>
            <div className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Est. Additional Revenue</div>
            <div className="text-white font-bold text-3xl mb-0.5 tabular-nums">
              <NumberFlow value={Math.round(calc.totalMonthly)} format={{ style: "currency", currency: "INR", maximumFractionDigits: 0 }} />
            </div>
            <div className="text-white/60 text-xs">per month</div>
            <div className="mt-3 text-white font-semibold text-lg tabular-nums">
              <NumberFlow value={Math.round(calc.totalAnnual)} format={{ style: "currency", currency: "INR", maximumFractionDigits: 0 }} /> /yr
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-3">
            {[
              { icon: Star,      label: "Reputation lift",   value: calc.reputationRevenue, color: "#7c3aed" },
              { icon: Phone,     label: "Recovered calls",    value: calc.voiceRevenue,      color: "#16a34a" },
              { icon: Search,    label: "SEO visibility",     value: calc.seoRevenue,        color: "#2563eb" },
              { icon: TrendingUp,label: "Demand planning",   value: calc.demandRevenue,     color: "#d97706" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700">{label}</span>
                    <span className="font-bold tabular-nums" style={{ color }}>{fmt(value)}/mo</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ background: color, width: `${calc.totalMonthly > 0 ? (value / calc.totalMonthly) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-gray-400 leading-relaxed border-t border-gray-100 pt-4">
            Based on industry benchmarks: reputation impact on conversion, voice ordering recovery rates, and SEO-driven traffic lift. Actual results vary.
          </div>
        </div>
      </div>

      {/* Feature comparison */}
      <div className="border-t border-gray-100 px-8 py-6">
        <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">With vs. Without Retilo</div>
        <div className="grid sm:grid-cols-2 gap-3">
          {COMPARISON_FEATURES.map(({ icon: Icon, name, retilo, without }) => (
            <div key={name} className="rounded-xl p-4 bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-3.5 h-3.5 text-violet-600" />
                <span className="text-xs font-bold text-gray-700">{name}</span>
              </div>
              <div className="flex items-start gap-1.5 mb-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-[11px] text-gray-700 leading-relaxed">{retilo}</span>
              </div>
              <div className="flex items-start gap-1.5 opacity-50">
                <div className="w-3 h-3 rounded-full border border-gray-400 mt-0.5 shrink-0 flex items-center justify-center">
                  <div className="w-1.5 h-0.5 bg-gray-400 rounded-full" />
                </div>
                <span className="text-[11px] text-gray-500 leading-relaxed">{without}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
