# Grader — Component & Architecture Mindmap

## Routes

```
/grader                          → Landing (search)
/grader/[pipelineId]             → Scan (polling)
/grader/[pipelineId]/report      → Report (full results)
```

---

## Pipeline API Flow

```
POST /v1/pipelines
  └─ body: { placeId }
  └─ returns: { id }

GET /v1/pipelines/:id   (poll every 3s)
  └─ status: created → processing → partial → completed → failed
  └─ progress: { percentage }
  └─ tasks: [{ phase, status }]
  └─ brand: { name, rating, website }

GET /v1/pipelines/:id/report
  └─ metadata, overallScore, scores, taskGroups, insights, media, topReviews
```

---

## Landing Page (`/grader`)

### Cult-ui-pro Blocks
- `sections/marketing-hero-input/` — warm editorial hero, animated placeholder cycling
- `StatsVite` — 4 stats: 50K+ restaurants, 10+ signals, 60s scan, 4.1pts lift
- `CTAVite` — bottom CTA section

### Custom Logic
- **Autocomplete** → `GET /v1/places/autocomplete?input=...&country=in`
  - Dropdown suggestions rendered below input
  - On select → `POST /v1/pipelines` → navigate to scan page
- `PLACEHOLDER_QUERIES` — Indian restaurant examples (cycling)
- `SUGGESTION_CHIPS` — Biryani, Café, Fine Dining, Street Food, Fast Food
- `TRUST_LOGOS` — Swiggy, Zomato, Google, Yelp, TripAdvisor

---

## Scan Page (`/grader/[pipelineId]`)

### Cult-ui-pro Components
| Component | Used for |
|---|---|
| `AnimatedCard` | Business info card (name, rating, website) |
| `AnimatedCard` | Phase steps container |
| `AnimatedProgress` | Scan progress bar (0–100%) |
| `AnimatedBadge variant="outline"` | "Done" phase status |
| `AnimatedBadge variant="default" live` | "Running" phase status |
| `AnimatedBadge variant="secondary" live` | "Scanning competitors…" radar label |

### Custom Logic
- Poll `GET /v1/pipelines/:id` every 3s via `setTimeout` + `useCallback`
- On `completed` → `router.replace` to report
- On `failed` → show `AnimatedCard` error state
- `PHASE_ORDER`: ingestion → enrichment → analysis → scoring
- Rotating `SCAN_COPY` text every 3.2s via `AnimatePresence`

### Right Panel (CSS only)
- Grid background overlay
- Concentric circles (border-primary/20)
- Sweep line (Tailwind `animate-spin`)
- Competitor dots fade in via `motion.div`

---

## Report Page (`/grader/[pipelineId]/report`)

### Cult-ui-pro Components
| Component | Used for |
|---|---|
| `AnimatedCard` | Business header (logo, name, rating, address) |
| `AnimatedCard` + `AnimatedProgress` | Overall score + sub-scores (Guest Exp, Reputation, Search) |
| `AnimatedCard` + `AnimatedProgress` | Task group cards (score bars) |
| `AnimatedBadge variant="secondary"` | Pass check (✓) |
| `AnimatedBadge variant="destructive"` | Fail check (✗) |
| `AnimatedBadge variant="destructive/default/secondary"` | Insight priority (high/medium/low) |
| `AnimatedBadge variant="outline" interactive=false` | Cuisine tags |
| `SocialProofViteRoot` + `SocialProofViteTestimonials` | Top reviews from restaurant |
| `CTAVite` | Camera & Reels upsell (Book a Shoot CTA) |
| `AnimatedCard` + `AnimatedCardButton` | Share CTA (WhatsApp / Email buttons) |

### `CTAVite` — Camera Upsell
```
title: "Great Visuals = Higher Score"
subtitle: "book a shoot today"
primaryCta: { label: "Book a Shoot", href: "mailto:hello@retilo.com?subject=..." }
secondaryCta: { label: "See Examples", href: "/grader" }
socialProof: { avatars: [4 names], text: "50+ restaurants already shooting with us" }
```

### `SocialProofViteRoot` — Reviews
```
testimonials: topReviews.slice(0,3).map(r => ({
  quote: r.text,
  name: r.author,
  role: `${r.rating}★ · ${r.source}`,
  accentColor: r.rating >= 4 ? "#6ef7cc" : r.rating >= 3 ? "#f9cb28" : "#ef4444",
}))
```

### `ShareModal` (kept — needs phone/email input for WhatsApp/Email)
- Tab switcher: WhatsApp | Email
- WhatsApp: phone input → `https://wa.me/{phone}?text={msg}`
- Email: email input → `mailto:{email}?subject=...&body=...`
- Opens from nav "Share Report" button + share CTA AnimatedCardButtons

### Other Sections (non-cult-ui)
- `GraderMap` — MapLibre GL + CARTO Positron basemap (no API key)
- Screenshots — plain `<img>` in grid
- Photos strip — horizontal scroll `<img>` strip

---

## Supporting Files

| File | Purpose |
|---|---|
| `lib/motion-casts.ts` | `asMotionVariants()` utility for marketing-hero-input section |
| `components/grader-map.tsx` | MapLibre GL map with business + competitor pins |
| `next.config.ts` | Added remote patterns: pravatar.cc, clearbit.com, googleapis.com, googleusercontent.com |

---

## Backend Endpoints Needed

| Endpoint | Purpose |
|---|---|
| `GET /v1/places/autocomplete?input=&country=in` | Proxies Google Places API (server-side key) |
| `POST /v1/pipelines` | Creates pipeline, returns `{ id }` |
| `GET /v1/pipelines/:id` | Poll pipeline status |
| `GET /v1/pipelines/:id/report` | Fetch full report |

---

## Cult-ui-pro Components Installed (reference)

```
AnimatedCard, AnimatedCardHeader, AnimatedCardTitle, AnimatedCardDescription,
AnimatedCardContent, AnimatedCardFooter, AnimatedCardButton, AnimatedCardAction
  → @/components/animated-card

AnimatedProgress
  → @/components/animated-progress

AnimatedBadge
  → @/components/animated-badge

ShadowCard, ShadowCardBackdrop, ShadowCardBevel, ShadowCardPixelGradient,
ShadowCardFooter, ShadowCardGlow, ShadowCardVerticalText
  → @/components/shadow-card

SocialProofVite, SocialProofViteRoot, SocialProofViteContainer,
SocialProofViteHeading, SocialProofViteLogoMarquee, SocialProofViteMetrics,
SocialProofViteTestimonials, SocialProofViteTestimonialCard
  → @/components/social-proof-vite

CTAVite, CTAViteRoot, CTAViteContainer, CTAViteCard, CTAViteHeading,
CTAViteDescription, CTAViteButtons, CTAViteSocialProof
  → @/components/cta-vite

StatsVite → @/components/stats-vite
MarketingBentoCoreCapabilities → @/components/marketing-bento-core-capabilities
```
