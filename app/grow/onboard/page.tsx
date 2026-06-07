"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  Hash,
  Loader2,
  Send,
  Sparkles,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Onboarding } from "@/components/ui/onboarding";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Profile {
  profileId: string;
  keywords: string[];
  telegramLink: string;
  telegram_chat_id?: string | null;
}

type PageState = "loading" | "form" | "connect" | "connected";

// step index that maps to Onboarding primitives
const STATE_TO_STEP: Record<Exclude<PageState, "loading">, number> = {
  form: 1,
  connect: 2,
  connected: 3,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GrowOnboardPage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>("loading");
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({
    productName: "",
    productDescription: "",
    icpDescription: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Auth + profile check on mount ──────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("retilo_token");
    if (!token) {
      router.replace("/auth?redirect=/grow/onboard");
      return;
    }
    const merchant = JSON.parse(localStorage.getItem("retilo_merchant") ?? "null");
    const id: string | undefined = merchant?.id;
    if (!id) {
      router.replace("/auth?redirect=/grow/onboard");
      return;
    }
    setMerchantId(id);

    api
      .get(`/v1/grow/profile/${id}`)
      .then((res) => {
        const p: Profile = res.data?.data ?? res.data;
        if (p?.profileId) {
          setProfile(p);
          setPageState(p.telegram_chat_id ? "connected" : "connect");
        } else {
          setPageState("form");
        }
      })
      .catch(() => setPageState("form"));
  }, [router]);

  // ── Telegram polling ────────────────────────────────────────────────────────
  const startPolling = useCallback(
    (id: string) => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        try {
          const res = await api.get(`/v1/grow/profile/${id}`);
          const p: Profile = res.data?.data ?? res.data;
          if (p?.telegram_chat_id) {
            clearInterval(pollRef.current!);
            setProfile((prev) => (prev ? { ...prev, telegram_chat_id: p.telegram_chat_id } : p));
            setPageState("connected");
          }
        } catch {}
      }, 5000);
    },
    []
  );

  useEffect(() => {
    if (pageState === "connect" && merchantId) startPolling(merchantId);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pageState, merchantId, startPolling]);

  // ── Form submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantId) return;
    setError("");
    setSubmitting(true);
    try {
      const res = await api.post("/v1/grow/onboard", {
        merchantId,
        productName: form.productName,
        productDescription: form.productDescription,
        icpDescription: form.icpDescription,
      });
      const p: Profile = res.data?.data ?? res.data;
      setProfile(p);
      setPageState("connect");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading spinner ─────────────────────────────────────────────────────────
  if (pageState === "loading") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.985 0.003 350)" }}
      >
        <div className="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  const currentStep = STATE_TO_STEP[pageState];

  return (
    <div
      className="min-h-screen antialiased"
      style={{
        background: "oklch(0.985 0.003 350)",
        fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center gap-3 px-6 py-3.5 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md shrink-0"
          style={{ background: "oklch(0.58 0.24 350)" }}
        >
          <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="font-bold text-sm text-gray-900">Retilo Grow</span>
        <span className="ml-auto text-xs text-gray-400 font-medium">
          Step {currentStep} of 3
        </span>
      </nav>

      {/* Main */}
      <div className="flex flex-col items-center justify-start min-h-[calc(100vh-57px)] px-4 py-10">
        <div className="w-full max-w-[480px]">

          {/* Onboarding shell with step indicator */}
          <Onboarding
            value={currentStep}
            totalSteps={3}
            canGoNext={() => false}
            className="gap-6 bg-white"
          >
            {/* Step dots */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {pageState === "form" && "Set up profile"}
                {pageState === "connect" && "Connect Telegram"}
                {pageState === "connected" && "All done!"}
              </span>
              <Onboarding.StepIndicator variant="pills" className="w-24" />
            </div>

            {/* ── Step 1: Form ── */}
            <Onboarding.Step step={1}>
              <AnimatePresence mode="wait">
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h1 className="font-semibold text-xl text-foreground tracking-tight">
                      Build your lead profile
                    </h1>
                  </div>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                    We'll use AI to generate a keyword profile. Warm leads will land in your Telegram.
                  </p>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* Business name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-foreground">
                        Business / Product name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Glow Salon"
                        value={form.productName}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, productName: e.target.value }))
                        }
                        className={cn(
                          "h-10 w-full rounded-xl border border-border/50 bg-background/50 px-3 text-sm",
                          "placeholder:text-muted-foreground/60",
                          "focus:outline-none focus:border-primary/50 focus:bg-background focus:ring-1 focus:ring-primary/20",
                          "transition-colors"
                        )}
                      />
                    </div>

                    {/* Product description */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-foreground">
                        What does your product / service do?
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="e.g. Premium salon chain in Hyderabad with 12 locations offering hair, skin and nail services."
                        value={form.productDescription}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, productDescription: e.target.value }))
                        }
                        className={cn(
                          "w-full resize-none rounded-xl border border-border/50 bg-background/50 px-3 py-2.5 text-sm",
                          "placeholder:text-muted-foreground/60",
                          "focus:outline-none focus:border-primary/50 focus:bg-background focus:ring-1 focus:ring-primary/20",
                          "transition-colors"
                        )}
                      />
                    </div>

                    {/* ICP */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-foreground">
                        Who is your ideal customer?
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="e.g. Salon owners with 2+ locations struggling with Google review management."
                        value={form.icpDescription}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, icpDescription: e.target.value }))
                        }
                        className={cn(
                          "w-full resize-none rounded-xl border border-border/50 bg-background/50 px-3 py-2.5 text-sm",
                          "placeholder:text-muted-foreground/60",
                          "focus:outline-none focus:border-primary/50 focus:bg-background focus:ring-1 focus:ring-primary/20",
                          "transition-colors"
                        )}
                      />
                    </div>

                    {error && (
                      <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className={cn(
                        "flex items-center justify-center gap-2 w-full rounded-xl py-3 text-sm font-semibold text-white",
                        "transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0",
                        "bg-primary shadow-[0_4px_16px_oklch(0.58_0.24_350_/_30%)]"
                      )}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating keyword profile with AI…
                        </>
                      ) : (
                        <>
                          Generate my lead profile
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              </AnimatePresence>
            </Onboarding.Step>

            {/* ── Step 2: Connect Telegram ── */}
            <Onboarding.Step step={2}>
              {profile && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col gap-5"
                >
                  {/* Profile ready badge */}
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-700">
                      Profile created
                    </span>
                  </div>

                  <div>
                    <h2 className="font-semibold text-xl text-foreground tracking-tight mb-1">
                      Your keyword profile is ready
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      We'll track these topics and send matching leads straight to your Telegram.
                    </p>
                  </div>

                  {/* Keyword chips */}
                  {profile.keywords?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {profile.keywords.map((kw) => (
                        <Badge
                          key={kw}
                          variant="secondary"
                          className="rounded-lg border-primary/20 bg-primary/[0.05] px-2.5 py-1 font-medium text-xs hover:bg-primary/10"
                        >
                          <Hash className="w-3 h-3 mr-1 opacity-60" />
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Telegram CTA card */}
                  <Card className="relative overflow-hidden border-border/50 rounded-2xl">
                    <div className="-top-px absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#2AABEE]/40 to-transparent" />
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: "#2AABEE" }}
                        >
                          <Send className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base">Connect Telegram</CardTitle>
                          <CardDescription className="text-xs">
                            Receive leads directly in your DMs
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Tap the button, open in Telegram, then press{" "}
                        <strong className="text-foreground">Start</strong>. You'll receive leads
                        directly in your Telegram.
                      </p>
                      <a
                        href={profile.telegramLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "flex items-center justify-center gap-2 w-full rounded-xl py-3 text-sm font-semibold text-white",
                          "transition-all hover:-translate-y-0.5",
                          "shadow-[0_4px_16px_rgba(42,171,238,0.35)]"
                        )}
                        style={{ background: "#2AABEE" }}
                      >
                        <Send className="w-4 h-4" />
                        Connect Telegram →
                      </a>
                    </CardContent>
                  </Card>

                  {/* Polling indicator */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                    Waiting for Telegram connection… checking every 5 s
                  </div>
                </motion.div>
              )}
            </Onboarding.Step>

            {/* ── Step 3: Connected ── */}
            <Onboarding.Step step={3}>
              {profile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center gap-6 text-center"
                >
                  {/* Checkmark */}
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 280, damping: 22 }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
                      border: "1px solid #6ee7b7",
                    }}
                  >
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </motion.div>

                  <div>
                    <h2 className="font-semibold text-2xl text-foreground tracking-tight mb-1">
                      Telegram connected ✅
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-[36ch] mx-auto">
                      You're all set. Leads will arrive in your Telegram as they're found.
                    </p>
                  </div>

                  {/* Commands */}
                  <Card className="w-full text-left rounded-2xl border-border/50 overflow-hidden">
                    <div className="px-5 py-3 border-b border-border/50">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Commands to try
                      </p>
                    </div>
                    <div className="divide-y divide-border/40">
                      <div className="px-5 py-4">
                        <code className="text-sm font-mono font-semibold text-primary">
                          /run
                        </code>
                        <p className="text-xs text-muted-foreground mt-1">
                          Harvest leads across all your tracked keywords now
                        </p>
                      </div>
                      <div className="px-5 py-4">
                        <code className="text-sm font-mono font-semibold text-primary">
                          /run salons in hyderabad
                        </code>
                        <p className="text-xs text-muted-foreground mt-1">
                          Focus on a specific niche or location today
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Tracked keywords */}
                  {profile.keywords?.length > 0 && (
                    <div className="w-full text-left">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                        Tracked keywords
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.keywords.map((kw) => (
                          <Badge
                            key={kw}
                            variant="secondary"
                            className="rounded-lg border-primary/20 bg-primary/[0.05] px-2.5 py-1 font-medium text-xs"
                          >
                            <Hash className="w-3 h-3 mr-1 opacity-60" />
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </Onboarding.Step>
          </Onboarding>
        </div>
      </div>
    </div>
  );
}
