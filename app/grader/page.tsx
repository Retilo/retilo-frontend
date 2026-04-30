"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { ArrowRight, MapPin, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { asMotionVariants } from "@/lib/motion-casts";
import { api } from "@/lib/api";
import { StatsVite } from "@/components/stats-vite";
import { CTAVite } from "@/components/cta-vite";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PlacePrediction {
  place_id: string;
  name: string;
  address: string;
}

// ── Hero constants ────────────────────────────────────────────────────────────

const PLACEHOLDER_QUERIES = [
  "Barbeque Nation, Connaught Place…",
  "Pizza Hut, MG Road, Bengaluru…",
  "Mainland China, Salt Lake, Kolkata…",
  "Social, Hauz Khas, Delhi…",
  "Truffles, Koramangala…",
];

const SUGGESTION_CHIPS = ["Biryani", "Café", "Fine Dining", "Fast Food", "Rooftop Bar", "Cloud Kitchen"];

const TRUST_LOGOS = ["Swiggy", "Zomato", "EazyDiner", "Dineout", "Google", "FSSAI"];

const HEADLINE_L1 = ["How does your"];
const HEADLINE_L2 = ["restaurant", "score?"];

// ── Motion variants ───────────────────────────────────────────────────────────

const headingContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.25 } },
};
const wordReveal = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring" as const, damping: 22, stiffness: 120 } },
};
const chipContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 1.1 } },
};
const chipItem = {
  hidden: { opacity: 0, y: 12, scale: 0.92 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, damping: 20, stiffness: 200 } },
};
const logoContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 1.5 } },
};
const logoItem = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

// ── Animated placeholder ──────────────────────────────────────────────────────

function AnimatedPlaceholder({ queries }: { queries: string[] }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((p) => (p + 1) % queries.length), 3200);
    return () => clearInterval(id);
  }, [queries.length]);
  return (
    <div className="pointer-events-none absolute inset-y-0 right-28 left-14 flex items-center overflow-hidden sm:right-36 sm:left-16">
      <AnimatePresence mode="wait">
        <motion.span
          key={queries[index]}
          animate={{ opacity: 0.45, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
          className="block truncate text-[15px] sm:text-[17px]"
          style={{ color: "var(--hero-muted)" }}
          transition={{ type: "spring", damping: 24, stiffness: 180 }}
        >
          {queries[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function GraderLandingPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [inputValue, setInputValue] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [selected, setSelected] = useState<PlacePrediction | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch suggestions from backend (no frontend API key needed)
  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.length < 2) { setSuggestions([]); setDropdownOpen(false); return; }
    setSearching(true);
    try {
      const res = await api.get("/v1/places/autocomplete", { params: { input, country: "in" } });
      const results: PlacePrediction[] = res.data?.predictions ?? res.data ?? [];
      setSuggestions(results.slice(0, 5));
      setDropdownOpen(results.length > 0);
    } catch {
      setSuggestions([]); setDropdownOpen(false);
    } finally {
      setSearching(false);
    }
  }, []);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInputValue(val);
    setSelected(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  }

  function handleSelect(place: PlacePrediction) {
    setSelected(place);
    setInputValue(place.name);
    setSuggestions([]); setDropdownOpen(false);
    inputRef.current?.blur();
  }

  function handleChipClick(label: string) {
    setInputValue(label);
    setSelected(null);
    inputRef.current?.focus();
    fetchSuggestions(label);
  }

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current?.contains(e.target as Node) || inputRef.current?.contains(e.target as Node)) return;
      setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setError(""); setSubmitting(true);
    try {
      const res = await api.post("/v1/pipelines", {
        type: "brand-from-place-id",
        params: { googlePlaceId: selected.place_id, source: "grader" },
      });
      const pipelineId = res.data?.id ?? res.data?.data?.id;
      if (!pipelineId) throw new Error("No pipeline ID");
      router.push(`/grader/${pipelineId}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <MotionConfig transition={{ type: "spring", bounce: 0.08, duration: 0.5 }}>
      <div
        className="relative flex min-h-svh flex-col overflow-hidden"
        style={{
          "--hero-bg": "#FDFBF7",
          "--hero-fg": "#1a1714",
          "--hero-accent": "#E8573D",
          "--hero-muted": "#8A8478",
          "--hero-border": "rgba(26,23,20,0.08)",
          "--hero-surface": "rgba(26,23,20,0.03)",
          backgroundColor: "var(--hero-bg)",
          color: "var(--hero-fg)",
        } as React.CSSProperties}
      >
        {/* Ambient glow */}
        <div aria-hidden className="-translate-x-1/2 pointer-events-none absolute top-[-15%] left-1/2 h-[700px] w-[900px] rounded-full opacity-40 blur-[120px]"
          style={{ background: "radial-gradient(circle, #E8573D15, transparent 70%)" }} />
        <div aria-hidden className="-translate-x-1/2 pointer-events-none absolute bottom-[-10%] left-1/2 h-[400px] w-[600px] rounded-full opacity-30 blur-[100px]"
          style={{ background: "radial-gradient(circle, #E8573D08, transparent 70%)" }} />

        {/* Dot grid */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(26,23,20,0.07) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        {/* Nav */}
        <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-8">
          <a href="/" className="font-semibold text-sm flex items-center gap-2" style={{ color: "var(--hero-fg)" }}>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "var(--hero-accent)" }}>
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            Retilo Grader
          </a>
          <a href="/auth" className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: "var(--hero-muted)" }}>
            Sign in →
          </a>
        </header>

        {/* Hero */}
        <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 py-16 text-center sm:px-6">

          {/* Badge */}
          <motion.div className="mb-8 sm:mb-10"
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            transition={{ type: "spring", damping: 20, stiffness: 120, delay: 0.1 }}>
            <motion.div
              className="inline-flex cursor-default items-center gap-2 rounded-full px-3.5 py-1.5 shadow-[0px_0px_0px_1px_rgba(26,23,20,0.06),0px_1px_2px_-1px_rgba(26,23,20,0.06),0px_2px_4px_0px_rgba(26,23,20,0.04)]"
              style={{ backgroundColor: "var(--hero-surface)", borderColor: "var(--hero-border)" }}
              whileHover={shouldReduceMotion ? {} : { scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--hero-accent)" }} />
              <span className="font-medium text-[13px]" style={{ color: "var(--hero-accent)" }}>
                Free Restaurant Growth Report · India
              </span>
            </motion.div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            animate="visible" initial="hidden"
            className="mb-5 text-balance leading-[0.95] tracking-[-0.04em] sm:mb-6"
            style={{ fontSize: "clamp(3rem, 9vw, 5.5rem)" }}
            variants={asMotionVariants(headingContainer)}>
            <span className="block">
              {HEADLINE_L1.map((word, i) => (
                <motion.span key={`l1-${i}`} className="mr-[0.22em] inline-block last:mr-0"
                  variants={asMotionVariants(shouldReduceMotion ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : wordReveal)}>
                  {word}
                </motion.span>
              ))}
            </span>
            <span className="block">
              {HEADLINE_L2.map((word, i) => (
                <motion.span key={`l2-${i}`}
                  className={cn("mr-[0.22em] inline-block last:mr-0", i === HEADLINE_L2.length - 1 && "italic")}
                  style={i === HEADLINE_L2.length - 1 ? { color: "var(--hero-accent)" } : undefined}
                  variants={asMotionVariants(shouldReduceMotion ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : wordReveal)}>
                  {word}
                </motion.span>
              ))}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mb-10 max-w-lg text-pretty text-[16px] leading-relaxed sm:mb-14 sm:text-[18px]"
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, filter: "blur(4px)" }}
            style={{ color: "var(--hero-muted)" }}
            transition={{ type: "spring", damping: 22, stiffness: 110, delay: 0.65 }}>
            Search your restaurant the same way your customers do — get a free scored report in 60 seconds. No sign-up needed.
          </motion.p>

          {/* Search form */}
          <motion.div
            className="w-full max-w-xl"
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", damping: 24, stiffness: 100, delay: 0.85 }}>
            <form onSubmit={handleSubmit}>
              <div className="group relative">
                {/* Focus glow */}
                <div className={cn("-inset-1.5 absolute rounded-[22px] transition-opacity duration-500", inputFocused ? "opacity-100" : "opacity-0")}
                  style={{ background: "radial-gradient(ellipse at center, rgba(232,87,61,0.12), transparent 70%)" }} />

                {/* Input wrapper */}
                <div className={cn(
                  "relative flex items-center rounded-[20px] transition-shadow duration-300",
                  inputFocused
                    ? "shadow-[0px_0px_0px_1px_rgba(232,87,61,0.25),0px_2px_8px_-2px_rgba(232,87,61,0.1),0px_4px_16px_0px_rgba(232,87,61,0.06)]"
                    : "shadow-[0px_0px_0px_1px_rgba(26,23,20,0.08),0px_1px_3px_-1px_rgba(26,23,20,0.07),0px_3px_8px_0px_rgba(26,23,20,0.04)] hover:shadow-[0px_0px_0px_1px_rgba(26,23,20,0.1),0px_2px_4px_-1px_rgba(26,23,20,0.08),0px_4px_12px_0px_rgba(26,23,20,0.05)]"
                )}
                  style={{ backgroundColor: "var(--hero-bg)" }}>
                  <Search className="pointer-events-none ml-4 h-5 w-5 shrink-0 sm:ml-5" style={{ color: "var(--hero-muted)", opacity: 0.6 }} />

                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      aria-label="Search your restaurant"
                      autoComplete="off"
                      onChange={handleInput}
                      onFocus={() => { setInputFocused(true); if (suggestions.length > 0) setDropdownOpen(true); }}
                      onBlur={() => setInputFocused(false)}
                      className="h-14 w-full bg-transparent px-3 text-[15px] focus:outline-none sm:h-16 sm:px-4 sm:text-[17px]"
                      style={{ color: "var(--hero-fg)" }}
                    />
                    {!inputValue && !inputFocused && <AnimatedPlaceholder queries={PLACEHOLDER_QUERIES} />}
                    {!inputValue && inputFocused && (
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[15px] sm:left-4 sm:text-[17px]"
                        style={{ color: "var(--hero-muted)", opacity: 0.4 }}>
                        Search your restaurant…
                      </span>
                    )}
                  </div>

                  {/* Spinner or Submit button */}
                  <div className="shrink-0 pr-2 sm:pr-2.5">
                    {searching ? (
                      <div className="h-10 sm:h-11 w-10 sm:w-11 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 rounded-full border-t-transparent animate-spin" style={{ borderColor: "var(--hero-accent)", borderTopColor: "transparent" }} />
                      </div>
                    ) : (
                      <motion.button
                        type="submit"
                        disabled={submitting || !selected}
                        className="flex h-10 items-center gap-2 rounded-[14px] px-4 font-semibold text-[13px] text-white transition-colors sm:h-11 sm:px-5 sm:text-[14px] disabled:opacity-40"
                        style={{ backgroundColor: "var(--hero-accent)" }}
                        whileHover={!selected ? {} : { scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        onMouseEnter={(e) => { if (selected) e.currentTarget.style.backgroundColor = "#d44e35"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--hero-accent)"; }}>
                        {submitting ? "Starting…" : selected ? <><span>Get Report</span><ArrowRight className="h-3.5 w-3.5" /></> : "Select"}
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Autocomplete dropdown */}
                <AnimatePresence>
                  {dropdownOpen && suggestions.length > 0 && (
                    <motion.div
                      ref={dropdownRef}
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.13 }}
                      className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50"
                      style={{ background: "var(--hero-bg)", boxShadow: "0px_0px_0px_1px_rgba(26,23,20,0.08),0px_8px_32px_-4px_rgba(26,23,20,0.12),0px_16px_48px_0px_rgba(26,23,20,0.08)", border: "1px solid var(--hero-border)" }}>
                      {suggestions.map((place, i) => (
                        <button key={place.place_id} type="button" onMouseDown={() => handleSelect(place)}
                          className={cn("w-full text-left px-4 py-3.5 flex items-start gap-3 transition-colors", i > 0 && "border-t")}
                          style={{ borderColor: "var(--hero-border)" }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(26,23,20,0.03)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ""; }}>
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(232,87,61,0.1)" }}>
                            <MapPin className="w-4 h-4" style={{ color: "var(--hero-accent)" }} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm truncate" style={{ color: "var(--hero-fg)" }}>{place.name}</div>
                            <div className="text-xs truncate mt-0.5" style={{ color: "var(--hero-muted)" }}>{place.address}</div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {error && <p className="mt-2.5 text-sm text-center" style={{ color: "#ef4444" }}>{error}</p>}
            </form>
          </motion.div>

          {/* Suggestion chips */}
          <motion.div animate="visible" initial="hidden" className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:mt-8"
            variants={asMotionVariants(chipContainer)}>
            <motion.span className="mr-1 font-medium text-[12px] uppercase tracking-[0.08em] sm:text-[13px]"
              style={{ color: "var(--hero-muted)", opacity: 0.7 }} variants={asMotionVariants(chipItem)}>
              Try:
            </motion.span>
            {SUGGESTION_CHIPS.map((chip) => (
              <motion.button key={chip} onClick={() => handleChipClick(chip)}
                className="rounded-full px-3 py-1.5 font-medium text-[12px] transition-colors duration-200 sm:px-3.5 sm:text-[13px] shadow-[0px_0px_0px_1px_rgba(26,23,20,0.06),0px_1px_2px_-1px_rgba(26,23,20,0.05)] hover:shadow-[0px_0px_0px_1px_rgba(232,87,61,0.15)]"
                style={{ backgroundColor: "var(--hero-bg)", color: "var(--hero-muted)" }}
                variants={asMotionVariants(chipItem)}
                whileHover={shouldReduceMotion ? {} : { scale: 1.06, y: -2 }} whileTap={{ scale: 0.95 }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--hero-accent)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--hero-muted)"; }}>
                {chip}
              </motion.button>
            ))}
          </motion.div>

          {/* Trust logos */}
          <motion.div animate="visible" initial="hidden" className="mt-16 flex flex-col items-center gap-5 sm:mt-24"
            variants={asMotionVariants(logoContainer)}>
            <motion.p className="font-medium text-[11px] uppercase tracking-[0.14em] sm:text-[12px]"
              style={{ color: "var(--hero-muted)", opacity: 0.5 }} variants={asMotionVariants(logoItem)}>
              Powering restaurants across
            </motion.p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:gap-x-10">
              {TRUST_LOGOS.map((logo) => (
                <motion.span key={logo} className="font-semibold text-[13px] tracking-tight opacity-30 hover:opacity-60 transition-opacity sm:text-[15px]"
                  style={{ color: "var(--hero-fg)" }} variants={asMotionVariants(logoItem)}>
                  {logo}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </main>
      </div>

      {/* Stats */}
      <StatsVite
        title="Built for Indian restaurants"
        subtitle="data you can trust"
        description="We analyze guest experience, online reputation, and local search visibility — everything that drives more covers."
        stats={[
          { value: 50000, label: "Restaurants Tracked", suffix: "+", description: "Across Tier 1, 2 & 3 cities in India", trend: { value: "+18%", direction: "up" }, accentColor: "#E8573D" },
          { value: 10, label: "Growth Signals", suffix: "+", description: "SEO, reviews, UX, photos & competitors", trend: { value: "New", direction: "up" }, accentColor: "#6ef7cc" },
          { value: 60, label: "Seconds", suffix: "s", description: "From search to full scored report", trend: { value: "Free", direction: "up" }, accentColor: "#adfa1e" },
          { value: 4.1, label: "Avg Score Lift", suffix: "pts", decimals: 1, description: "After acting on Retilo insights", trend: { value: "+22%", direction: "up" }, accentColor: "#b054de" },
        ]}
      />

      {/* Bottom CTA */}
      <CTAVite
        title="Send the report"
        subtitle="free, no sign-up"
        description="Found a restaurant that needs help? Share their free growth report via WhatsApp or email in one click."
        primaryCta={{ label: "Get a Free Report →", href: "/grader" }}
        secondaryCta={{ label: "Sign in to save reports", href: "/auth" }}
        socialProof={{ avatars: [{ name: "Rahul M" }, { name: "Priya S" }, { name: "Ankit V" }, { name: "Sneha R" }], text: "Sent to 200+ restaurants this week" }}
      />
    </MotionConfig>
  );
}
