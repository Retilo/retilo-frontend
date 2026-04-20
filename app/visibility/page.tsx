"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, Zap, Globe, Search } from "lucide-react";
import { DitheringSimplexBackdrop } from "@/app/dithering-simplex-backdrop";
import { AnimatedButton } from "@/components/ui/animated-button";
import { api } from "@/lib/api";

const AI_ENGINES = [
  { name: "ChatGPT", color: "#10a37f" },
  { name: "Claude", color: "#c96442" },
  { name: "Perplexity", color: "#20808d" },
  { name: "Google AI", color: "#4285F4" },
];

const STATS = [
  { value: "67%", label: "of brands are invisible to AI" },
  { value: "3×", label: "more traffic from AI-cited sites" },
  { value: "60s", label: "to get your visibility score" },
];

export default function GeoSeoPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setError("");
    setIsLoading(true);
    try {
      const normalized = url.startsWith("http") ? url : `https://${url}`;
      const res = await api.post("/v1/geo-seo/scan", { url: normalized });
      const { scanId } = res.data;
      router.push(`/visibility/${scanId}`);
    } catch {
      setError("Failed to start scan. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen antialiased" style={{ fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4" style={{ background: "rgba(48,28,42,0.7)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(253,91,255,0.15)" }}>
        <a href="/" className="flex items-center gap-2.5 text-[#f4f8e8] font-semibold text-sm">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(253,91,255,0.2)", border: "1px solid rgba(253,91,255,0.3)" }}>
            <Globe className="w-4 h-4" style={{ color: "#FD5BFF" }} />
          </div>
          Retilo Visibility
        </a>
        <a href="/auth" className="text-[#f4f8e8]/60 hover:text-[#f4f8e8] text-sm font-medium transition-colors">
          Sign in →
        </a>
      </nav>

      {/* Hero */}
      <DitheringSimplexBackdrop className="min-h-screen" style={{ background: "#301c2a" }}>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-20 pb-12">

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-8" style={{ background: "rgba(253,91,255,0.12)", color: "#FD5BFF", border: "1px solid rgba(253,91,255,0.3)", boxShadow: "0 0 0 1px rgba(171,250,25,0.1)" }}>
              <Zap className="w-3 h-3" />
              AI Brand Visibility Scanner
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center font-bold text-[#f4f8e8] mb-4"
            style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)", lineHeight: 1.06, letterSpacing: "-0.035em", textShadow: "0 2px 32px rgba(0,0,0,0.6)", maxWidth: "14ch" }}
          >
            Is your brand{" "}
            <span style={{ color: "#FD5BFF", textShadow: "0 0 40px rgba(253,91,255,0.4)" }}>invisible</span>
            {" "}to AI?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-10 font-medium"
            style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)", color: "rgba(244,248,232,0.65)", maxWidth: "38ch", lineHeight: 1.5, textShadow: "0 1px 12px rgba(0,0,0,0.5)" }}
          >
            We'll check ChatGPT, Claude, Perplexity & Google AI visibility in 60 seconds
          </motion.p>

          {/* Scan form */}
          <motion.form
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={handleScan}
            className="w-full max-w-xl"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(253,91,255,0.5)" }} />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="yourdomain.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-[#f4f8e8] placeholder-white/30 font-medium text-sm outline-none focus:ring-2"
                  style={{
                    background: "rgba(244,248,232,0.07)",
                    border: "1px solid rgba(253,91,255,0.3)",
                    backdropFilter: "blur(8px)",
                    fontSize: "1rem",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(253,91,255,0.7)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(253,91,255,0.3)")}
                />
              </div>
              <AnimatedButton
                isLoading={isLoading}
                loadingText="Scanning…"
                onClick={handleScan as unknown as React.MouseEventHandler}
                translucent={false}
                style={{
                  background: "#FD5BFF",
                  color: "#301c2a",
                  border: "none",
                  minWidth: 160,
                  boxShadow: "0 0 0 1px rgba(171,250,25,0.35), 0 4px 24px rgba(253,91,255,0.35)",
                }}
              >
                Scan Free →
              </AnimatedButton>
            </div>
            {error && (
              <p className="mt-2 text-sm text-center" style={{ color: "#ff6b6b" }}>{error}</p>
            )}
          </motion.form>

          {/* AI engine badges */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-2 mt-8"
          >
            <span className="text-xs font-medium" style={{ color: "rgba(244,248,232,0.4)" }}>Checks:</span>
            {AI_ENGINES.map((engine) => (
              <span key={engine.name} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(244,248,232,0.06)", border: "1px solid rgba(244,248,232,0.12)", color: "rgba(244,248,232,0.7)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: engine.color }} />
                {engine.name}
              </span>
            ))}
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-3 gap-6 mt-14 max-w-lg w-full"
          >
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-bold text-[#FD5BFF]" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", textShadow: "0 0 20px rgba(253,91,255,0.4)" }}>{stat.value}</div>
                <div className="text-xs mt-1" style={{ color: "rgba(244,248,232,0.45)", lineHeight: 1.4 }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Free tier note */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-8 text-xs text-center"
            style={{ color: "rgba(244,248,232,0.3)" }}
          >
            Free tier shows score + first 2 fixes. No account required.
          </motion.p>
        </div>
      </DitheringSimplexBackdrop>
    </div>
  );
}
