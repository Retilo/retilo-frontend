"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, ChevronRight, Star, Zap, CheckCircle2, TrendingUp, Shield, Search } from "lucide-react";
import { AnimatedSearchInput } from "@/components/animated-search";
import { api } from "@/lib/api";

const STATS = [
  { value: "16", label: "checks per report" },
  { value: "60s", label: "to generate" },
  { value: "Free", label: "always" },
];

const CHECKS = [
  { icon: TrendingUp, label: "SEO & search ranking" },
  { icon: Shield, label: "Reputation score" },
  { icon: Search, label: "Website UX audit" },
];

const INDUSTRIES = ["restaurant", "clinic", "hotel", "spa", "gym", "salon", "cafe", "bakery"];

function CyclingIndustry() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % INDUSTRIES.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="relative inline-block overflow-hidden align-bottom" style={{ minWidth: "5.5ch" }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={INDUSTRIES[index]}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block"
          style={{
            backgroundImage: "linear-gradient(135deg, oklch(0.55 0.24 280) 0%, oklch(0.58 0.24 350) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {INDUSTRIES[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

type Prediction = { place_id: string; name: string; address: string };

export default function GraderPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPredictions = useCallback(async (input: string) => {
    if (input.length < 2) { setPredictions([]); return; }
    setIsSearching(true);
    try {
      const res = await api.get("/v1/places/autocomplete", { params: { input } });
      setPredictions(res.data?.predictions ?? []);
    } catch { setPredictions([]); }
    finally { setIsSearching(false); }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setPredictions([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPredictions(val), 380);
  };

  const handleSelect = async (p: Prediction) => {
    setError("");
    setIsStarting(true);
    setPredictions([]);
    setQuery(p.name);
    try {
      const res = await api.post("/v1/pipelines", {
        type: "brand-from-place-id",
        params: { googlePlaceId: p.place_id, source: "grader" },
      });
      const id = res.data?.id;
      if (!id) throw new Error("no id");
      router.push(`/grader/${id}`);
    } catch {
      setError("Failed to start. Please try again.");
      setIsStarting(false);
    }
  };

  return (
    <div
      className="min-h-screen antialiased"
      style={{ background: "oklch(0.985 0.003 350)", fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, sans-serif' }}
    >
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 max-w-6xl mx-auto border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <a href="/" className="flex items-center gap-2.5 text-gray-900 font-bold text-sm">
          <div className="relative w-8 h-8 rounded-xl flex items-center justify-center shadow-md" style={{ background: "oklch(0.58 0.24 350)" }}>
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          Retilo
        </a>
        <a href="/auth" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          Sign in →
        </a>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] px-4 pb-16 pt-8">

        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <span
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-8"
            style={{ background: "#ede9fe", color: "#6d28d9", border: "1px solid #ddd6fe" }}
          >
            <Star className="w-3 h-3 fill-violet-600 text-violet-600" />
            Free Business Growth Report
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="text-center font-bold text-gray-900 mb-4"
          style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)", lineHeight: 1.06, letterSpacing: "-0.035em", maxWidth: "22ch" }}
        >
          How does your <CyclingIndustry /> score online?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.16 }}
          className="text-center mb-10 text-gray-500 text-lg max-w-[42ch]"
          style={{ lineHeight: 1.55 }}
        >
          Search your business — we'll audit your SEO, website UX, reputation and guest experience in 60 seconds.
        </motion.p>

        {/* Search + Autocomplete */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.24 }}
          className="relative w-full max-w-2xl"
        >
          <AnimatedSearchInput
            placeholder="Search your business name…"
            value={query}
            onChange={handleChange}
            onClear={() => { setQuery(""); setPredictions([]); }}
            isLoading={isSearching || isStarting}
            loadingText={isStarting ? "Starting your report…" : "Searching…"}
            blobTranslucent
          />

          <AnimatePresence>
            {predictions.length > 0 && !isStarting && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.13 }}
                className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50 bg-white"
                style={{ border: "1px solid #e5e7eb", boxShadow: "0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.05)" }}
              >
                {predictions.map((p, i) => (
                  <motion.button
                    key={p.place_id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => handleSelect(p)}
                    className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-violet-50 transition-colors group"
                    style={{ borderBottom: i < predictions.length - 1 ? "1px solid #f3f4f6" : undefined }}
                  >
                    <div className="w-7 h-7 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">{p.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5 truncate">{p.address}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-violet-500 transition-colors shrink-0 mt-1" />
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-sm text-center text-red-500">
              {error}
            </motion.p>
          )}
        </motion.div>

        {/* Check pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.38 }}
          className="flex flex-wrap items-center justify-center gap-2 mt-5"
        >
          {CHECKS.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-500 bg-white border border-gray-200"
            >
              <Icon className="w-3 h-3 text-violet-500" />
              {label}
            </span>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.46 }}
          className="grid grid-cols-3 gap-4 mt-12 max-w-md w-full"
        >
          {STATS.map((s) => (
            <div key={s.label} className="text-center bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="font-bold text-violet-600" style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Trust */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex items-center gap-2 mt-8 text-gray-400 text-xs"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          No sign-up · No credit card · Results in 60 seconds
        </motion.div>
      </div>
    </div>
  );
}
