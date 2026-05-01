"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type Insight = { id: string; title: string; description: string; badge?: string };

const INSIGHTS: Insight[] = [
  {
    id: "reviews",
    title: "Reviews",
    description:
      "Restaurants with a 4+ star average get 89% more clicks from local search. Every review reply boosts trust by 18%.",
  },
  {
    id: "seo",
    title: "Local SEO",
    description:
      "The top-3 local pack captures 60% of all restaurant discovery searches within 5 km of your location.",
  },
  {
    id: "photos",
    title: "Photos & Menu",
    description:
      "Listings with 10+ quality photos drive 3× more enquiries. A complete menu raises conversions by 40%.",
    badge: "Quick win",
  },
];

/* ─── Reviews: animated star-distribution bars ─── */
function ReviewsPanel() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    const dur = 1800;
    let raf: number;
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      setProgress(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const rows = [
    { stars: 5, pct: 62, color: "#16a34a" },
    { stars: 4, pct: 21, color: "#65a30d" },
    { stars: 3, pct: 9,  color: "#ca8a04" },
    { stars: 2, pct: 5,  color: "#ea580c" },
    { stars: 1, pct: 3,  color: "#dc2626" },
  ];

  return (
    <div
      style={{
        background: "var(--ri-surface)",
        borderRadius: 16,
        padding: "20px 24px",
        boxShadow: "var(--ri-shadow)",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <div
          style={{
            fontSize: 40,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: "var(--ri-fg)",
            lineHeight: 1,
          }}
        >
          4.3
        </div>
        <div>
          <div style={{ color: "#f59e0b", fontSize: 16, letterSpacing: 2 }}>★★★★☆</div>
          <div style={{ fontSize: 11, color: "var(--ri-fg-muted)", marginTop: 2 }}>847 Google reviews</div>
        </div>
      </div>
      {rows.map(({ stars, pct, color }) => (
        <div key={stars} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: "var(--ri-fg-muted)", width: 18, textAlign: "right" }}>
            {stars}★
          </span>
          <div
            style={{
              flex: 1,
              height: 6,
              background: "var(--ri-track)",
              borderRadius: 9999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: color,
                borderRadius: 9999,
                width: `${pct * progress}%`,
                transition: "width 40ms linear",
              }}
            />
          </div>
          <span style={{ fontSize: 11, color: "var(--ri-fg-muted)", width: 28 }}>
            {Math.round(pct * progress)}%
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── SEO: local-pack rank animation ─── */
function SEOPanel({ brandName }: { brandName: string }) {
  const rankSteps = [11, 9, 7, 5, 4, 3];
  const [stepIdx, setStepIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    setStepIdx(0);
    setFade(true);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      if (i >= rankSteps.length) { clearInterval(iv); return; }
      setFade(false);
      setTimeout(() => { setStepIdx(i); setFade(true); }, 160);
    }, 620);
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandName]);

  const rank = rankSteps[stepIdx];
  const listings = [
    { name: "The Harvest Table", rating: 4.6, reviews: "1.2k" },
    { name: "Café Delight", rating: 4.4, reviews: "892" },
    { name: brandName || "Your restaurant", rating: 4.3, reviews: "847", you: true },
    { name: "Oak & Ember", rating: 4.1, reviews: "523" },
    { name: "Sunrise Kitchen", rating: 3.9, reviews: "214" },
  ];

  const rankColor = rank <= 3 ? "#16a34a" : rank <= 6 ? "#ca8a04" : "#dc2626";
  const rankBg   = rank <= 3 ? "#dcfce7" : rank <= 6 ? "#fef9c3" : "#fee2e2";

  return (
    <div
      style={{
        background: "var(--ri-surface)",
        borderRadius: 16,
        padding: "20px 24px",
        boxShadow: "var(--ri-shadow)",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: rankBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 300ms ease",
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: rankColor,
              opacity: fade ? 1 : 0,
              transition: "opacity 160ms ease, color 300ms ease",
            }}
          >
            #{rank}
          </span>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ri-fg)" }}>Local search rank</div>
          <div style={{ fontSize: 11, color: "var(--ri-fg-muted)" }}>"restaurants near me"</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {listings.map((l, i) => (
          <div
            key={l.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 10px",
              borderRadius: 8,
              background: l.you ? "rgba(124,58,237,0.06)" : "transparent",
              border: l.you ? "1px solid rgba(124,58,237,0.15)" : "1px solid transparent",
            }}
          >
            <span
              style={{
                fontSize: 11,
                width: 16,
                color: l.you ? "#7c3aed" : "var(--ri-fg-muted)",
                fontWeight: l.you ? 700 : 400,
              }}
            >
              {i + 1}
            </span>
            <span
              style={{
                flex: 1,
                fontSize: 12,
                color: l.you ? "#7c3aed" : "var(--ri-fg)",
                fontWeight: l.you ? 600 : 400,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {l.name}
            </span>
            <span style={{ fontSize: 11, color: "#f59e0b" }}>★{l.rating}</span>
            <span style={{ fontSize: 10, color: "var(--ri-fg-muted)" }}>({l.reviews})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Photos: grid fills in + completeness bar ─── */
function PhotosPanel() {
  const total = 12;
  const [loaded, setLoaded] = useState(0);

  useEffect(() => {
    setLoaded(0);
    let n = 0;
    const iv = setInterval(() => {
      n++;
      setLoaded(n);
      if (n >= total) clearInterval(iv);
    }, 180);
    return () => clearInterval(iv);
  }, []);

  const palette = [
    "#fde68a","#fca5a5","#6ee7b7","#93c5fd","#c4b5fd","#fcd34d",
    "#f9a8d4","#86efac","#7dd3fc","#a5f3fc","#fbbf24","#fb7185",
  ];
  const pct = Math.round((loaded / total) * 100);

  return (
    <div
      style={{
        background: "var(--ri-surface)",
        borderRadius: 16,
        padding: "20px 24px",
        boxShadow: "var(--ri-shadow)",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ri-fg)" }}>
          Profile photos found
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: pct >= 80 ? "#16a34a" : "#ca8a04",
            transition: "color 400ms ease",
          }}
        >
          {loaded}/{total}
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 5,
          marginBottom: 14,
        }}
      >
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            style={{
              aspectRatio: "1",
              borderRadius: 6,
              background: i < loaded ? palette[i % palette.length] : "var(--ri-track)",
              opacity: i < loaded ? 1 : 0.35,
              transition: "background 200ms ease, opacity 200ms ease",
            }}
          />
        ))}
      </div>
      <div
        style={{
          height: 5,
          background: "var(--ri-track)",
          borderRadius: 9999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            background: "linear-gradient(90deg, oklch(0.55 0.24 280), oklch(0.58 0.24 350))",
            borderRadius: 9999,
            width: `${pct}%`,
            transition: "width 200ms ease",
          }}
        />
      </div>
      <div style={{ fontSize: 11, color: "var(--ri-fg-muted)", marginTop: 6 }}>
        {pct}% profile completeness
      </div>
    </div>
  );
}

/* ─── Tab button ─── */
function TabButton({
  active,
  title,
  badge,
  progress,
  onClick,
}: {
  active: boolean;
  title: string;
  badge?: string;
  progress: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        all: "unset",
        cursor: "pointer",
        display: "block",
        padding: "10px 0",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
      }}
      type="button"
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: active ? "var(--ri-fg)" : "var(--ri-fg-muted)",
            transition: "color 200ms cubic-bezier(0.23,1,0.32,1)",
          }}
        >
          {title}
        </span>
        {badge && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "#7c3aed",
              background: "rgba(124,58,237,0.08)",
              padding: "1px 7px",
              borderRadius: 99,
              opacity: active ? 1 : 0.6,
              transition: "opacity 200ms ease",
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <div
        style={{
          height: 2,
          marginTop: 4,
          borderRadius: 9999,
          background: active ? "rgba(0,0,0,0.1)" : "transparent",
          overflow: "hidden",
          transition: "background 200ms ease",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 9999,
            background: "var(--ri-fg)",
            width: active ? `${progress * 100}%` : "0%",
            transition: active ? "none" : "width 0ms",
          }}
        />
      </div>
    </button>
  );
}

const CYCLE_MS = 6000;

/* ─── Main export ─── */
export default function RetailInsightsWidget({ brandName = "" }: { brandName?: string }) {
  const [activeTab, setActiveTab] = useState("reviews");
  const [panelKey, setPanelKey] = useState(0);
  const [progress, setProgress] = useState(1);
  const startRef = useRef(Date.now());
  const rafRef = useRef<number | null>(null);

  const advanceTab = useCallback(() => {
    setActiveTab((prev) => {
      const idx = INSIGHTS.findIndex((f) => f.id === prev);
      return INSIGHTS[(idx + 1) % INSIGHTS.length].id;
    });
    setPanelKey((k) => k + 1);
    startRef.current = Date.now();
  }, []);

  useEffect(() => {
    function tick() {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(1 - elapsed / CYCLE_MS, 0);
      setProgress(remaining);
      if (remaining <= 0) advanceTab();
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [advanceTab]);

  const handleTabChange = useCallback(
    (id: string) => {
      if (id === activeTab) return;
      setActiveTab(id);
      setPanelKey((k) => k + 1);
      startRef.current = Date.now();
      setProgress(1);
    },
    [activeTab]
  );

  return (
    <>
      <style>{`
        [data-retail-insights] {
          --ri-bg: #fafafa;
          --ri-surface: #fff;
          --ri-fg: #000;
          --ri-fg-muted: #888;
          --ri-track: #eee;
          --ri-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04);
        }
        :is(.dark) [data-retail-insights] {
          --ri-bg: #0a0a0a;
          --ri-surface: #1a1a1a;
          --ri-fg: #ededed;
          --ri-fg-muted: #a0a0a0;
          --ri-track: #333;
          --ri-shadow: 0 1px 3px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.06);
        }
        @keyframes riPanelIn {
          from { opacity:0; transform:scale(0.97) translateY(6px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes riDescIn {
          from { opacity:0; transform:translateY(4px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
      <div
        data-retail-insights
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          minHeight: 380,
          background: "var(--ri-bg)",
          overflow: "hidden",
          fontFamily: '"Geist","Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
        }}
      >
        {/* Left: tabs + description */}
        <div
          style={{
            flex: 1,
            padding: "48px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--ri-fg)",
              margin: "0 0 8px",
              letterSpacing: "-0.03em",
              lineHeight: 1.25,
            }}
          >
            While you wait
          </h2>
          <p style={{ fontSize: 12, color: "var(--ri-fg-muted)", margin: "0 0 28px", lineHeight: 1.5 }}>
            Tips that move the needle for restaurants
          </p>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {INSIGHTS.map((ins) => {
              const isActive = ins.id === activeTab;
              return (
                <div key={ins.id}>
                  <TabButton
                    active={isActive}
                    badge={ins.badge}
                    onClick={() => handleTabChange(ins.id)}
                    progress={isActive ? progress : 0}
                    title={ins.title}
                  />
                  <div
                    style={{
                      overflow: "hidden",
                      maxHeight: isActive ? 120 : 0,
                      opacity: isActive ? 1 : 0,
                      transition:
                        "max-height 350ms cubic-bezier(0.23,1,0.32,1), opacity 250ms cubic-bezier(0.23,1,0.32,1)",
                    }}
                  >
                    <p
                      key={`d-${ins.id}-${isActive}`}
                      style={{
                        fontSize: 14,
                        lineHeight: 1.6,
                        color: "var(--ri-fg-muted)",
                        margin: "0 0 16px",
                        maxWidth: 320,
                        animation: isActive ? "riDescIn 400ms cubic-bezier(0.23,1,0.32,1) both" : "none",
                      }}
                    >
                      {ins.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: "rgba(0,0,0,0.07)", alignSelf: "stretch" }} />

        {/* Right: animated panel */}
        <div
          style={{
            flex: 1,
            padding: 40,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <div
            key={panelKey}
            style={{
              width: "100%",
              animation: "riPanelIn 400ms cubic-bezier(0.23,1,0.32,1) both",
            }}
          >
            {activeTab === "reviews"  && <ReviewsPanel />}
            {activeTab === "seo"      && <SEOPanel brandName={brandName} />}
            {activeTab === "photos"   && <PhotosPanel />}
          </div>
        </div>
      </div>
    </>
  );
}
