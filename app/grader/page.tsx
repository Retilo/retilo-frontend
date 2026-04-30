"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Search, TrendingUp, Utensils, BarChart2, ShieldCheck, MapPin } from "lucide-react";
import { api } from "@/lib/api";
import AnalyticsHero from "@/components/marketing-hero-analytics";
import { MarketingBentoCoreCapabilities } from "@/components/marketing-bento-core-capabilities";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PlacePrediction {
  place_id: string;
  name: string;
  address: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATS = [
  { icon: Utensils,    value: "50K+", label: "restaurants in India" },
  { icon: BarChart2,   value: "10+",  label: "growth signals analyzed" },
  { icon: ShieldCheck, value: "60s",  label: "to get your full score" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function GraderLandingPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [selected, setSelected] = useState<PlacePrediction | null>(null);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Call backend — it holds the Google API key
  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.length < 2) { setSuggestions([]); setOpen(false); return; }
    setSearching(true);
    try {
      const res = await api.get("/v1/places/autocomplete", {
        params: { input, country: "in" },
      });
      const results: PlacePrediction[] = res.data?.predictions ?? res.data ?? [];
      setSuggestions(results.slice(0, 5));
      setOpen(results.length > 0);
    } catch {
      setSuggestions([]);
      setOpen(false);
    } finally {
      setSearching(false);
    }
  }, []);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    setSelected(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  }

  function handleSelect(place: PlacePrediction) {
    setSelected(place);
    setQuery(place.name);
    setSuggestions([]);
    setOpen(false);
    inputRef.current?.blur();
  }

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        dropdownRef.current?.contains(e.target as Node) ||
        inputRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setError("");
    setSubmitting(true);
    try {
      const res = await api.post("/v1/pipelines", {
        type: "brand-from-place-id",
        params: { googlePlaceId: selected.place_id, source: "grader" },
      });
      const pipelineId = res.data?.id ?? res.data?.data?.id;
      if (!pipelineId) throw new Error("No pipeline ID returned");
      router.push(`/grader/${pipelineId}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 border-b bg-background/80 backdrop-blur-sm">
        <a href="/" className="font-semibold text-sm text-foreground flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          Retilo Grader
        </a>
        <a href="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Sign in →
        </a>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen pt-14 pb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center w-full max-w-2xl mx-auto"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 mb-6">
            <MapPin className="w-3 h-3" />
            Free Restaurant Growth Report · India
          </span>

          <h1
            className="font-bold tracking-tight text-foreground mb-4"
            style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)", lineHeight: 1.08, letterSpacing: "-0.03em" }}
          >
            How does your<br />
            restaurant <span className="text-primary">really score?</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-10 max-w-md leading-relaxed">
            Search your restaurant the same way your customers do — get a free growth report in 60 seconds.
          </p>

          {/* Search */}
          <form onSubmit={handleSubmit} className="w-full max-w-xl">
            <div className="relative">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={handleInput}
                  onFocus={() => suggestions.length > 0 && setOpen(true)}
                  placeholder="e.g. Barbeque Nation, Connaught Place…"
                  autoComplete="off"
                  className="w-full h-14 pl-11 pr-10 rounded-2xl border-2 bg-background text-foreground placeholder:text-muted-foreground text-base focus:outline-none focus:border-primary transition-colors shadow-sm"
                />
                {searching && (
                  <div className="absolute right-4 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              {/* Dropdown */}
              <AnimatePresence>
                {open && suggestions.length > 0 && (
                  <motion.div
                    ref={dropdownRef}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.13 }}
                    className="absolute top-full left-0 right-0 mt-2 rounded-2xl border bg-card shadow-2xl z-50 overflow-hidden"
                  >
                    {suggestions.map((place, i) => (
                      <button
                        key={place.place_id}
                        type="button"
                        onMouseDown={() => handleSelect(place)}
                        className={`w-full text-left px-4 py-3.5 flex items-start gap-3 hover:bg-muted/60 transition-colors ${i > 0 ? "border-t" : ""}`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-foreground truncate">{place.name}</div>
                          <div className="text-xs text-muted-foreground truncate mt-0.5">{place.address}</div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CTA */}
            <button
              type="submit"
              disabled={submitting || !selected}
              className="mt-4 w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {submitting
                ? "Starting your report…"
                : selected
                ? `Get Report for "${query}" →`
                : "Select your restaurant above"}
            </button>

            {error && <p className="mt-2.5 text-sm text-red-500 text-center">{error}</p>}
          </form>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-14 w-full max-w-lg">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <Icon className="w-5 h-5 text-primary mx-auto mb-2 opacity-80" />
                <div className="text-2xl font-bold text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground mt-1 leading-tight">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Analytics preview */}
      <AnalyticsHero
        title="Your restaurant, fully visible"
        description="Real-time scores across guest experience, reputation, and local search — everything a growing restaurant needs to track."
        deployLabel="Get Your Report"
        demoLabel="See a Sample"
      />

      {/* What we analyze */}
      <MarketingBentoCoreCapabilities />

      <footer className="py-8 text-center text-xs text-muted-foreground border-t">
        © 2026 Retilo · Free restaurant growth reports powered by Google Places
      </footer>
    </div>
  );
}
