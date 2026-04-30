"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Check, X, Star, Globe, MapPin, TrendingUp,
  Share2, MessageCircle, Mail, Camera, ChevronRight, AlertTriangle, Phone,
} from "lucide-react";
import { api } from "@/lib/api";
import { MarketingBentoCoreCapabilities } from "@/components/marketing-bento-core-capabilities";
import { GraderMap } from "@/components/grader-map";

// ── Types ────────────────────────────────────────────────────────────────────

interface Report {
  id: string;
  metadata: {
    name: string;
    rating: number;
    userRatingsTotal: number;
    website?: string;
    phone?: string;
    cuisines?: string[];
    description?: string;
    address: { street: string; city: string; state: string; zip?: string; country?: string };
    coordinates?: { latitude: number; longitude: number };
  };
  overallScore: number;
  maxScore: number;
  scores: {
    guestExperience: { score: number; max: number; metrics?: { cls: number; inp: number; lcp: number } };
    reputation: { score: number; max: number; rating?: number; reviewCount?: number };
    searchResults: { score: number; max: number };
  };
  taskGroups: Array<{
    name: string;
    score: number;
    max: number;
    checks: Array<{ name: string; status: "pass" | "fail" | "warning"; issue: string | null }>;
    metrics?: { cls: number; inp: number; lcp: number };
  }>;
  insights: Array<{
    id: number;
    type: string;
    priority: "high" | "medium" | "low";
    title: string;
    description: string;
    action: string;
  }>;
  media?: {
    photos?: string[];
    logo?: string;
    screenshots?: { mobile?: string; desktop?: string };
  };
  topReviews?: Array<{ author: string; rating: number; text: string; source: string; reviewedAt?: string }>;
  generatedAt: string;
}

// ── Check name map ────────────────────────────────────────────────────────────

const CHECK_LABELS: Record<string, string> = {
  "has-cta": "Has call-to-action button",
  "no-external-ordering-links": "No 3rd-party ordering links",
  "has-online-ordering": "Direct online ordering",
  "has-ssl": "Secure HTTPS website",
  "has-schema-markup": "Structured data (schema.org)",
  "good-cls": "Stable layout (CLS < 0.1)",
  "good-lcp": "Fast load time (LCP < 2.5s)",
  "high-rating": "Google rating ≥ 4.0",
  "sufficient-reviews": "100+ Google reviews",
  "has-social-presence": "Social media links",
};

const PRIORITY_BADGE: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  low: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

// ── Score circle ──────────────────────────────────────────────────────────────

function ScoreCircle({ score, max, label, size = 80 }: { score: number; max: number; label: string; size?: number }) {
  const pct = Math.round((score / max) * 100);
  const color = pct >= 70 ? "#22c55e" : pct >= 45 ? "#f59e0b" : "#ef4444";
  const r = size / 2 - 7;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" className="text-muted" strokeWidth={6} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
            strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-bold text-foreground" style={{ fontSize: size > 90 ? 22 : size > 60 ? 16 : 13 }}>{score}</span>
          <span className="text-muted-foreground" style={{ fontSize: size > 60 ? 10 : 8 }}>/{max}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground text-center leading-tight max-w-[72px]">{label}</span>
    </div>
  );
}

// ── Share modal ───────────────────────────────────────────────────────────────

function ShareModal({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  const [tab, setTab] = useState<"whatsapp" | "email">("whatsapp");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const msg = `Hi! Here's a free growth report for ${name}: ${url}`;

  function sendWhatsApp() {
    window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
    setDone(true);
  }
  function sendEmail() {
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(`Growth Report: ${name}`)}&body=${encodeURIComponent(msg)}`;
    setDone(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card rounded-2xl border shadow-2xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-foreground">Send Report</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">×</button>
        </div>

        <div className="flex gap-2 mb-5 p-1 bg-muted rounded-xl">
          {(["whatsapp", "email"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
              {t === "whatsapp" ? "WhatsApp" : "Email"}
            </button>
          ))}
        </div>

        {done ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <p className="font-medium text-foreground">Sent!</p>
            <button onClick={onClose} className="mt-4 text-sm text-muted-foreground hover:text-foreground underline">Close</button>
          </div>
        ) : tab === "whatsapp" ? (
          <div className="space-y-3">
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 000 0000"
              className="w-full h-11 px-3.5 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <button onClick={sendWhatsApp} disabled={!phone.trim()}
              className="w-full h-11 rounded-xl bg-[#25d366] text-white font-semibold text-sm hover:bg-[#1fba58] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" /> Send via WhatsApp
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@restaurant.com"
              className="w-full h-11 px-3.5 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <button onClick={sendEmail} disabled={!email.trim()}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" /> Send via Email
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function GraderReportPage() {
  const { pipelineId } = useParams<{ pipelineId: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [fetchError, setFetchError] = useState("");
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    api
      .get<Report>(`/v1/pipelines/${pipelineId}/report`)
      .then((r) => setReport(r.data))
      .catch(() => setFetchError("Could not load report. Please try again."));
  }, [pipelineId]);

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <p className="font-medium text-foreground">{fetchError}</p>
          <a href="/grader" className="mt-4 inline-block text-sm text-primary underline">Try another business →</a>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { metadata, overallScore, maxScore, scores, taskGroups, insights, media, topReviews } = report;
  const pct = Math.round((overallScore / maxScore) * 100);
  const scoreLabel = pct >= 70 ? "Good" : pct >= 45 ? "Needs Work" : "Critical";
  const scoreLabelColor = pct >= 70 ? "text-green-500" : pct >= 45 ? "text-amber-500" : "text-red-500";
  const reportUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence>
        {shareOpen && (
          <ShareModal url={reportUrl} name={metadata.name} onClose={() => setShareOpen(false)} />
        )}
      </AnimatePresence>

      {/* Nav */}
      <nav className="sticky top-0 z-40 h-14 flex items-center justify-between px-6 border-b bg-background/80 backdrop-blur-sm">
        <a href="/grader" className="font-semibold text-sm text-foreground flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          Retilo Grader
        </a>
        <button
          onClick={() => setShareOpen(true)}
          className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share Report
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* Business header ──────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-5">
          {media?.logo && (
            <img
              src={media.logo}
              alt={metadata.name}
              className="w-16 h-16 rounded-2xl object-cover border bg-muted shrink-0"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground">{metadata.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-muted-foreground">
              {metadata.rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  {metadata.rating} ({metadata.userRatingsTotal?.toLocaleString()} reviews)
                </span>
              )}
              {metadata.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {metadata.address.city}, {metadata.address.state}
                </span>
              )}
              {metadata.website && (
                <a href={metadata.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Globe className="w-3.5 h-3.5" /> Website
                </a>
              )}
              {metadata.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {metadata.phone}
                </span>
              )}
            </div>
            {metadata.cuisines?.length && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {metadata.cuisines.map((c) => (
                  <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{c}</span>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Overall score card ───────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="rounded-3xl border bg-card p-8 flex flex-col sm:flex-row items-center gap-8 shadow-sm">
          <ScoreCircle score={overallScore} max={maxScore} label="Overall Score" size={120} />
          <div className="flex-1 text-center sm:text-left">
            <div className={`text-3xl font-bold ${scoreLabelColor}`}>{scoreLabel}</div>
            <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">
              Your restaurant scored <strong className="text-foreground">{pct}/100</strong> across guest experience, reputation, and search visibility.
            </p>
            <div className="flex gap-8 mt-6 justify-center sm:justify-start">
              <ScoreCircle score={scores.guestExperience.score} max={scores.guestExperience.max} label="Guest Exp." size={70} />
              <ScoreCircle score={scores.reputation.score} max={scores.reputation.max} label="Reputation" size={70} />
              <ScoreCircle score={scores.searchResults.score} max={scores.searchResults.max} label="Search" size={70} />
            </div>
          </div>
        </motion.div>

        {/* Location map ────────────────────────────────────────────────── */}
        {metadata.coordinates && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}>
            <h2 className="text-base font-semibold text-foreground mb-3">Location</h2>
            <GraderMap
              markers={[
                {
                  lat: metadata.coordinates.latitude,
                  lng: metadata.coordinates.longitude,
                  type: "business",
                  label: metadata.name,
                },
              ]}
              zoom={14}
              className="h-64"
            />
          </motion.div>
        )}

        {/* Screenshots ──────────────────────────────────────────────────── */}
        {(media?.screenshots?.desktop || media?.screenshots?.mobile) && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <h2 className="text-base font-semibold text-foreground mb-3">Website Preview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {media.screenshots.desktop && (
                <div className="rounded-2xl border overflow-hidden">
                  <div className="text-xs font-medium text-muted-foreground px-3 py-2 border-b bg-muted/40">Desktop</div>
                  <img src={media.screenshots.desktop} alt="Desktop screenshot" className="w-full object-cover object-top" style={{ maxHeight: 200 }} />
                </div>
              )}
              {media.screenshots.mobile && (
                <div className="rounded-2xl border overflow-hidden">
                  <div className="text-xs font-medium text-muted-foreground px-3 py-2 border-b bg-muted/40">Mobile</div>
                  <img src={media.screenshots.mobile} alt="Mobile screenshot" className="w-full object-cover object-top" style={{ maxHeight: 200 }} />
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Task groups ──────────────────────────────────────────────────── */}
        {taskGroups?.map((group, gi) => (
          <motion.div key={group.name}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 + gi * 0.06 }}
            className="rounded-3xl border bg-card overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-foreground">{group.name}</h2>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(group.score / group.max) * 100}%` }} />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{group.score}/{group.max}</span>
              </div>
            </div>
            <div className="divide-y">
              {group.checks.map((check) => (
                <div key={check.name} className="flex items-start gap-3 px-6 py-3.5">
                  <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${check.status === "pass" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                    {check.status === "pass"
                      ? <Check className="w-3 h-3 text-green-600" />
                      : <X className="w-3 h-3 text-red-600" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{CHECK_LABELS[check.name] ?? check.name}</div>
                    {check.issue && <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{check.issue}</div>}
                  </div>
                </div>
              ))}
            </div>
            {group.metrics && (
              <div className="px-6 py-3 bg-muted/30 border-t flex gap-6 text-xs text-muted-foreground">
                <span>LCP <strong className="text-foreground">{(group.metrics.lcp / 1000).toFixed(1)}s</strong></span>
                <span>CLS <strong className="text-foreground">{(group.metrics.cls / 1000).toFixed(3)}</strong></span>
                <span>INP <strong className="text-foreground">{group.metrics.inp}ms</strong></span>
              </div>
            )}
          </motion.div>
        ))}

        {/* Insights ─────────────────────────────────────────────────────── */}
        {insights?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-xl font-bold text-foreground mb-4">Growth Insights</h2>
            <div className="space-y-3">
              {insights.map((insight) => (
                <div key={insight.id} className="rounded-2xl border bg-card p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide shrink-0 mt-0.5 ${PRIORITY_BADGE[insight.priority]}`}>
                      {insight.priority}
                    </span>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{insight.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{insight.description}</p>
                      <p className="text-xs text-primary mt-2 font-medium">→ {insight.action}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Camera & Reels upsell ────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}
          className="rounded-3xl border-2 border-primary/25 bg-primary/[0.04] p-8">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
              <Camera className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Boost Your Score</div>
              <h3 className="text-xl font-bold text-foreground">Professional Photography & Reels</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Great visuals are the fastest way to improve your guest experience score and convert more online visitors
                into walk-ins. Our team visits your restaurant, captures your food, space, and story — and delivers
                ready-to-post content for Google, Instagram, and TikTok.
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "Food & ambiance photography",
                  "Instagram & TikTok Reels",
                  "Google Business Profile photo refresh",
                  "Menu shots & team portraits",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <a href="mailto:hello@retilo.com?subject=Photography%20%26%20Reels%20Inquiry"
                className="mt-5 inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm">
                Book a Shoot <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* Photos strip ────────────────────────────────────────────────── */}
        {media?.photos && media.photos.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2 className="text-base font-semibold text-foreground mb-3">Photos</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {media.photos.slice(0, 8).map((photo, i) => (
                <img key={i} src={photo} alt="" className="w-40 h-28 rounded-2xl object-cover shrink-0 border" />
              ))}
            </div>
          </motion.div>
        )}

        {/* Top reviews ─────────────────────────────────────────────────── */}
        {topReviews && topReviews.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}>
            <h2 className="text-xl font-bold text-foreground mb-4">Top Reviews</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {topReviews.slice(0, 4).map((review, i) => (
                <div key={i} className="rounded-2xl border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-foreground">{review.author}</span>
                    <div className="flex">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <Star key={j} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Share CTA ───────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}
          className="rounded-3xl border bg-card p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-2">Send this to the owner</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Share this free growth report via WhatsApp or Email — they'll see exactly how to improve.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <button onClick={() => setShareOpen(true)}
              className="flex items-center gap-2 h-11 px-6 rounded-xl bg-[#25d366] text-white font-semibold text-sm hover:bg-[#1fba58] transition-colors shadow-sm">
              <MessageCircle className="w-4 h-4" /> Send via WhatsApp
            </button>
            <button onClick={() => setShareOpen(true)}
              className="flex items-center gap-2 h-11 px-6 rounded-xl border bg-background text-foreground font-semibold text-sm hover:bg-muted transition-colors">
              <Mail className="w-4 h-4" /> Send via Email
            </button>
          </div>
        </motion.div>

        {/* What we analyze section ─────────────────────────────────────── */}
        <MarketingBentoCoreCapabilities />

        <div className="pb-8 text-center text-xs text-muted-foreground">
          Report generated {new Date(report.generatedAt).toLocaleDateString()} · Powered by Retilo
        </div>
      </div>
    </div>
  );
}
