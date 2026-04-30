"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Check, X, Star, Globe, MapPin, TrendingUp,
  Share2, MessageCircle, Mail, Phone, AlertTriangle,
} from "lucide-react";
import { api } from "@/lib/api";
import { GraderMap } from "@/components/grader-map";
import {
  AnimatedCard,
  AnimatedCardHeader,
  AnimatedCardTitle,
  AnimatedCardDescription,
  AnimatedCardContent,
  AnimatedCardFooter,
  AnimatedCardButton,
} from "@/components/animated-card";
import { AnimatedProgress } from "@/components/animated-progress";
import { AnimatedBadge } from "@/components/animated-badge";
import {
  SocialProofViteRoot,
  SocialProofViteTestimonials,
} from "@/components/social-proof-vite";
import { CTAVite } from "@/components/cta-vite";
import {
  ShadowCard,
  ShadowCardBackdrop,
  ShadowCardBevel,
  ShadowCardPixelGradient,
} from "@/components/shadow-card";

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
        className="w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatedCard padding="lg" aria-label="Send report">
          <AnimatedCardHeader>
            <div className="flex items-center justify-between">
              <AnimatedCardTitle>Send Report</AnimatedCardTitle>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">×</button>
            </div>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            <div className="flex gap-2 p-1 bg-muted rounded-xl">
              {(["whatsapp", "email"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
                  {t === "whatsapp" ? "WhatsApp" : "Email"}
                </button>
              ))}
            </div>

            {done ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <p className="font-medium text-foreground">Sent!</p>
                <button onClick={onClose} className="mt-4 text-sm text-muted-foreground hover:text-foreground underline">Close</button>
              </div>
            ) : tab === "whatsapp" ? (
              <div className="space-y-3">
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
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
          </AnimatedCardContent>
        </AnimatedCard>
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
  const [reportUrl, setReportUrl] = useState("");

  useEffect(() => {
    setReportUrl(window.location.href);
  }, []);

  useEffect(() => {
    api
      .get<Report>(`/v1/pipelines/${pipelineId}/report`)
      .then((r) => setReport(r.data))
      .catch(() => setFetchError("Could not load report. Please try again."));
  }, [pipelineId]);

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <AnimatedCard padding="lg" aria-label="Error" interactive={false} className="max-w-sm">
          <AnimatedCardHeader>
            <div className="flex flex-col items-center gap-3 text-center">
              <AlertTriangle className="w-10 h-10 text-amber-500" />
              <AnimatedCardTitle>Report unavailable</AnimatedCardTitle>
              <AnimatedCardDescription>{fetchError}</AnimatedCardDescription>
            </div>
          </AnimatedCardHeader>
          <AnimatedCardFooter className="justify-center">
            <a href="/grader" className="text-sm text-primary underline">Try another business →</a>
          </AnimatedCardFooter>
        </AnimatedCard>
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
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <AnimatedCard padding="md" aria-label={metadata.name}>
            <AnimatedCardHeader>
              <div className="flex items-start gap-4">
                {media?.logo && (
                  <img
                    src={media.logo}
                    alt={metadata.name}
                    className="w-14 h-14 rounded-xl object-cover border bg-muted shrink-0"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <AnimatedCardTitle className="text-xl">{metadata.name}</AnimatedCardTitle>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    {metadata.rating > 0 && (
                      <AnimatedCardDescription className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        {metadata.rating} ({metadata.userRatingsTotal?.toLocaleString()} reviews)
                      </AnimatedCardDescription>
                    )}
                    {metadata.address && (
                      <AnimatedCardDescription className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {metadata.address.city}, {metadata.address.state}
                      </AnimatedCardDescription>
                    )}
                    {metadata.phone && (
                      <AnimatedCardDescription className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> {metadata.phone}
                      </AnimatedCardDescription>
                    )}
                    {metadata.website && (
                      <a href={metadata.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Globe className="w-3.5 h-3.5" /> Website
                      </a>
                    )}
                  </div>
                  {metadata.cuisines?.length && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {metadata.cuisines.map((c) => (
                        <AnimatedBadge key={c} variant="outline" interactive={false}>{c}</AnimatedBadge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </AnimatedCardHeader>
          </AnimatedCard>
        </motion.div>

        {/* Overall score card ───────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <AnimatedCard padding="lg" aria-label="Overall score">
            <AnimatedCardHeader>
              <div className="flex items-center gap-3">
                <AnimatedCardTitle className="text-2xl">
                  {overallScore}
                  <span className="text-muted-foreground font-normal text-base">/{maxScore}</span>
                </AnimatedCardTitle>
                <AnimatedBadge
                  variant={pct >= 70 ? "secondary" : pct >= 45 ? "default" : "destructive"}
                  interactive={false}
                >
                  {scoreLabel}
                </AnimatedBadge>
              </div>
              <AnimatedCardDescription>
                Overall growth score across guest experience, reputation, and search visibility.
              </AnimatedCardDescription>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              <AnimatedProgress value={pct} label="Overall" showValue />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <AnimatedProgress
                  value={Math.round((scores.guestExperience.score / scores.guestExperience.max) * 100)}
                  label={`Guest Experience · ${scores.guestExperience.score}/${scores.guestExperience.max}`}
                  showValue
                />
                <AnimatedProgress
                  value={Math.round((scores.reputation.score / scores.reputation.max) * 100)}
                  label={`Reputation · ${scores.reputation.score}/${scores.reputation.max}`}
                  showValue
                />
                <AnimatedProgress
                  value={Math.round((scores.searchResults.score / scores.searchResults.max) * 100)}
                  label={`Search Visibility · ${scores.searchResults.score}/${scores.searchResults.max}`}
                  showValue
                />
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>

        {/* Location map ────────────────────────────────────────────────── */}
        {metadata.coordinates && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}>
            <h2 className="text-base font-semibold text-foreground mb-3">Location</h2>
            <GraderMap
              markers={[{
                lat: metadata.coordinates.latitude,
                lng: metadata.coordinates.longitude,
                type: "business",
                label: metadata.name,
              }]}
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
          >
            <AnimatedCard padding="none" aria-label={group.name}>
              <div className="px-6 py-4 border-b flex items-center justify-between gap-4">
                <h2 className="font-semibold text-foreground">{group.name}</h2>
                <div className="flex items-center gap-3 shrink-0">
                  <AnimatedProgress
                    value={Math.round((group.score / group.max) * 100)}
                    className="w-32"
                    showValue
                  />
                  <span className="text-sm text-muted-foreground tabular-nums">{group.score}/{group.max}</span>
                </div>
              </div>
              <div className="px-6 divide-y">
                {group.checks.map((check) => (
                  <div key={check.name} className="flex items-start gap-3 py-3.5">
                    <AnimatedBadge
                      variant={check.status === "pass" ? "secondary" : "destructive"}
                      interactive={false}
                      className="mt-0.5 shrink-0"
                    >
                      {check.status === "pass" ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                    </AnimatedBadge>
                    <div>
                      <div className="text-sm font-medium text-foreground">{CHECK_LABELS[check.name] ?? check.name}</div>
                      {check.issue && <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{check.issue}</div>}
                    </div>
                  </div>
                ))}
              </div>
              {group.metrics && (
                <div className="px-6 py-3 bg-muted/30 border-t flex gap-6 text-xs text-muted-foreground rounded-b-[15px]">
                  <span>LCP <strong className="text-foreground">{(group.metrics.lcp / 1000).toFixed(1)}s</strong></span>
                  <span>CLS <strong className="text-foreground">{(group.metrics.cls / 1000).toFixed(3)}</strong></span>
                  <span>INP <strong className="text-foreground">{group.metrics.inp}ms</strong></span>
                </div>
              )}
            </AnimatedCard>
          </motion.div>
        ))}

        {/* Insights ─────────────────────────────────────────────────────── */}
        {insights?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-xl font-bold text-foreground mb-4">Growth Insights</h2>
            <div className="space-y-3">
              {insights.map((insight) => (
                <AnimatedCard key={insight.id} padding="md" aria-label={insight.title}>
                  <AnimatedCardHeader>
                    <div className="flex items-start gap-3">
                      <AnimatedBadge
                        variant={insight.priority === "high" ? "destructive" : insight.priority === "medium" ? "default" : "secondary"}
                        interactive={false}
                        className="mt-0.5 shrink-0 uppercase"
                      >
                        {insight.priority}
                      </AnimatedBadge>
                      <div>
                        <AnimatedCardTitle className="text-sm">{insight.title}</AnimatedCardTitle>
                        <AnimatedCardDescription className="mt-1">{insight.description}</AnimatedCardDescription>
                        <p className="text-xs text-primary mt-2 font-medium">→ {insight.action}</p>
                      </div>
                    </div>
                  </AnimatedCardHeader>
                </AnimatedCard>
              ))}
            </div>
          </motion.div>
        )}

        {/* Camera & Reels upsell ────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}>
          <CTAVite
            title="Great Visuals = Higher Score"
            subtitle="book a shoot today"
            description="Professional food photography & Reels for your restaurant. We visit, capture your food and space, and deliver ready-to-post content for Google, Instagram, and TikTok."
            primaryCta={{ label: "Book a Shoot", href: "mailto:hello@retilo.com?subject=Photography%20%26%20Reels%20Inquiry" }}
            secondaryCta={{ label: "See Examples", href: "/grader" }}
            socialProof={{
              avatars: [
                { name: "Ravi Kumar" },
                { name: "Priya Nair" },
                { name: "Ahmed Khan" },
                { name: "Sunita Sharma" },
              ],
              text: "50+ restaurants already shooting with us",
            }}
          />
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
            <SocialProofViteRoot
              testimonials={topReviews.slice(0, 3).map((r) => ({
                quote: r.text,
                name: r.author,
                role: `${r.rating}★ · ${r.source}`,
                accentColor: r.rating >= 4 ? "#6ef7cc" : r.rating >= 3 ? "#f9cb28" : "#ef4444",
              }))}
            >
              <SocialProofViteTestimonials />
            </SocialProofViteRoot>
          </motion.div>
        )}

        {/* Share CTA ───────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}>
          <AnimatedCard padding="lg" aria-label="Share this report" className="text-center">
            <AnimatedCardHeader>
              <AnimatedCardTitle className="text-xl text-center">Send this to the owner</AnimatedCardTitle>
              <AnimatedCardDescription className="text-center mx-auto max-w-sm">
                Share this free growth report via WhatsApp or Email — they&apos;ll see exactly how to improve.
              </AnimatedCardDescription>
            </AnimatedCardHeader>
            <AnimatedCardFooter className="justify-center gap-3 flex-wrap">
              <AnimatedCardButton
                variant="secondary"
                onClick={() => setShareOpen(true)}
              >
                <MessageCircle className="w-4 h-4" /> Send via WhatsApp
              </AnimatedCardButton>
              <AnimatedCardButton
                variant="primary"
                onClick={() => setShareOpen(true)}
              >
                <Mail className="w-4 h-4" /> Send via Email
              </AnimatedCardButton>
            </AnimatedCardFooter>
          </AnimatedCard>
        </motion.div>

        <div className="pb-8 text-center text-xs text-muted-foreground">
          Report generated {new Date(report.generatedAt).toLocaleDateString()} · Powered by Retilo
        </div>
      </div>
    </div>
  );
}
