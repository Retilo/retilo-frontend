"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { MapPin, Star, TrendingUp, Utensils, BarChart2, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import AnalyticsHero from "@/components/marketing-hero-analytics";
import { MarketingBentoCoreCapabilities } from "@/components/marketing-bento-core-capabilities";

interface GPlacesAutocomplete {
  addListener: (event: string, cb: () => void) => void;
  getPlace: () => { place_id?: string; name?: string };
}

declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Autocomplete: new (input: HTMLInputElement, options?: any) => GPlacesAutocomplete;
        };
      };
    };
    initGooglePlacesGrader?: () => void;
  }
}

const STATS = [
  { icon: Utensils, value: "2.3B+", label: "restaurant searches / month" },
  { icon: BarChart2, value: "10+", label: "growth signals analyzed" },
  { icon: ShieldCheck, value: "60s", label: "to get your full score" },
];

export default function GraderLandingPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const acRef = useRef<GPlacesAutocomplete | null>(null);
  const [query, setQuery] = useState("");
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mapsReady, setMapsReady] = useState(false);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;
    if (window.google?.maps?.places) { setMapsReady(true); return; }
    window.initGooglePlacesGrader = () => setMapsReady(true);
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGooglePlacesGrader`;
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    if (!mapsReady || !inputRef.current || acRef.current) return;
    acRef.current = new window.google!.maps.places.Autocomplete(inputRef.current, {
      types: ["establishment"],
    });
    acRef.current.addListener("place_changed", () => {
      const p = acRef.current!.getPlace();
      if (p?.place_id) {
        setPlaceId(p.place_id);
        setQuery(p.name ?? "");
      }
    });
  }, [mapsReady]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = placeId ?? query.trim();
    if (!id) return;
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/v1/pipelines", {
        type: "brand-from-place-id",
        params: { googlePlaceId: id, source: "grader" },
      });
      const pipelineId = res.data?.id ?? res.data?.data?.id;
      if (!pipelineId) throw new Error("No pipeline ID returned");
      router.push(`/grader/${pipelineId}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Failed to start scan. Please try again.");
      setLoading(false);
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
            <Star className="w-3 h-3 fill-current" />
            Free Restaurant Growth Report
          </span>

          <h1
            className="font-bold tracking-tight text-foreground mb-4"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", lineHeight: 1.08, letterSpacing: "-0.03em" }}
          >
            How does your<br />
            restaurant <span className="text-primary">really score?</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-10 max-w-md leading-relaxed">
            Get a free scored report — guest experience, reputation, and search visibility — in 60 seconds. No sign-up required.
          </p>

          {/* Search */}
          <form onSubmit={handleSubmit} className="w-full max-w-xl">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPlaceId(null); }}
                  placeholder={mapsReady ? "Search your restaurant name…" : "Paste your Google Place ID…"}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading || (!placeId && !query.trim())}
                className="h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap shadow-sm"
              >
                {loading ? "Starting…" : "Get Free Report →"}
              </button>
            </div>
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

      {/* Analytics preview — "here's what your data looks like" */}
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
