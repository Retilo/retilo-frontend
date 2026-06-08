# Retilo Backend — API Reference

**Base URL:** `https://api.retilo.com` (or `http://localhost:<PORT>` locally)

All responses follow the shape:
```json
{ "code": 200, "data": { ... } }
```
Errors return `{ "code": 4xx|5xx, "message": "..." }`.

---

## Changelog

> **For the frontend team** — every API change (new endpoint, schema change, breaking change, deprecation) is logged here with the date and section. Check this first before starting a new integration sprint.

---

### v1.4.0 — 2026-05-07

**New module: Demand Signals** (Section 19)

| Change | Type | Detail |
|--------|------|--------|
| `POST /v1/demand-signals/refresh` | ✅ New | Recompute and persist the demand index window (today + N days) for a merchant location |
| `GET /v1/demand-signals/today` | ✅ New | Today's demand index for a merchant location |
| `GET /v1/demand-signals/forecast` | ✅ New | Next N days demand outlook (default 7, max 14) |
| `GET /v1/demand-signals/calendar` | ✅ New | Public holidays + Indian festivals + sports/movie events for next N days (max 90) |

**What it does:** Pulls weather (OpenWeatherMap), public holidays (date.nager.at), Indian festival calendar (curated), and major events (cricket matches, blockbuster releases) for a merchant location. Computes a per-day **composite demand multiplier** (e.g. `1.32` = 32% above baseline) with explainable drivers and an owner-facing recommendation. Calibrated from arXiv 1711.08325 (Walmart weather), arXiv 2405.13995 (events→demand), arXiv 2506.05941 (modern retail forecasting), and McKinsey demand-sensing benchmarks.

---

### v1.3.0 — 2026-05-07

**New module: Location Intelligence** (Section 18)

| Change | Type | Detail |
|--------|------|--------|
| `POST /v1/location-intelligence/scan` | ✅ New | Run a neighbourhood scan from a Google Place ID or lat/lng. Returns competitors, demand drivers, hex-grid density, area profile, opportunity score, insights. |
| `GET /v1/location-intelligence/scans` | ✅ New | List recent scans for the merchant (compact form). |
| `GET /v1/location-intelligence/scans/:id` | ✅ New | Fetch a full scan with the rich intelligence payload. |

**What it does:** For any merchant location, classifies all nearby POIs into direct competitors, indirect competitors, and demand drivers (transit, malls, hospitals, offices, hotels, education). Computes a 0-100 **Opportunity Score** combining driver intensity, competition density, and competitor quality gap. Buckets POIs into a pure-JS hex grid for map visualization. Generates prioritized, action-oriented insights.

---

### v1.2.0 — 2026-05-07

**New module: Integration Layer — Data Ingestion & Webhooks** (Section 17)

| Change | Type | Detail |
|--------|------|--------|
| `POST /v1/integrations/connect` | ✅ New | Connect PetPooja, Posist, Swiggy, Zomato, Razorpay, PhonePe, Practo, or Generic source |
| `GET /v1/integrations` | ✅ New | List all integrations for the merchant |
| `GET /v1/integrations/:id` | ✅ New | Get integration status + last sync info |
| `DELETE /v1/integrations/:id` | ✅ New | Disconnect an integration |
| `POST /v1/integrations/:id/sync` | ✅ New | Trigger manual pull sync |
| `POST /v1/integrations/webhook/petpooja` | ✅ New | PetPooja POS webhook receiver (HMAC-SHA256) |
| `POST /v1/integrations/webhook/posist` | ✅ New | Posist POS webhook receiver (HMAC-SHA256) |
| `POST /v1/integrations/webhook/swiggy` | ✅ New | Swiggy order + review webhook receiver |
| `POST /v1/integrations/webhook/zomato` | ✅ New | Zomato order + review webhook receiver |
| `POST /v1/integrations/webhook/razorpay` | ✅ New | Razorpay payment webhook receiver (HMAC-SHA256) |
| `POST /v1/integrations/webhook/phonepe` | ✅ New | PhonePe UPI payment webhook receiver |
| `POST /v1/integrations/webhook/practo` | ✅ New | Practo appointment webhook receiver (clinics) |
| `POST /v1/integrations/webhook/generic` | ✅ New | Generic webhook for any unsupported system |
| `POST /v1/integrations/ingest` | ✅ New | Universal bulk ingest (JWT-auth, max 500 events/request) |

**Retail Event Schema:** All sources normalize into a unified schema with `type`, `channel`, `occurredAt`, `locationId`, `payload` fields. See Section 17 for full spec.

**External signals (auto-pull, no config needed):** OpenWeatherMap forecasts, public holidays, Google Places competitor data.

---

### v1.1.1 — 2026-05-01

| Change | Type | Detail |
|--------|------|--------|
| `GET /v1/places/autocomplete` | ✅ New | Google Places autocomplete proxy — frontend gets place_id + name + address without holding the API key. |

---

### v1.1.0 — 2026-04-30

**New module: Business Report Pipeline Engine** (Section 16)

| Change | Type | Detail |
|--------|------|--------|
| `POST /v1/pipelines` | ✅ New | Start an async brand report pipeline from a Google Place ID. Returns 202 with a poll URL. |
| `GET /v1/pipelines` | ✅ New | List pipelines (paginated). Scoped to authenticated merchant. |
| `GET /v1/pipelines/:id` | ✅ New | Poll pipeline status + per-task progress. |
| `GET /v1/pipelines/:pipelineId/report` | ✅ New | Fetch the generated report once the pipeline is `completed`. |
| `GET /v1/reports/:id` | ✅ New | Fetch report by report ID directly. |
| `PATCH /v1/pipelines/:id/tasks` | ✅ New | Internal endpoint (Lambda workers only, `x-internal-key` header). Do not call from frontend. |

**Pipeline status lifecycle:**
```
created → processing → completed
                     → partial   (non-critical task failures)
                     → failed    (critical task exhausted retries)
```

**Scoring model:**
| Dimension | Max | Key checks |
|-----------|-----|-----------|
| Guest Experience (UX) | 40 | CTA, no 3rd-party ordering, HTTPS, schema markup, CLS, LCP |
| Reputation | 20 | Rating ≥4.0, 100+ reviews, social presence |
| Search Visibility | 40 | Keyword coverage (SERP integration stub) |
| **Overall** | **100** | |

---

### v1.0.0 — Initial release

All endpoints in Sections 1–15 (Auth, Customers, Conversations, Events, AI, GMB, GEO+SEO, Swiggy, Voice).

---

## Authentication

Most routes require a **Bearer JWT** in the `Authorization` header:
```
Authorization: Bearer <token>
```
The token is obtained after login or Google OAuth.

---

## Multi-location support

Several GMB endpoints support querying **multiple locations at once** using the `locationIds` query param (comma-separated):

```
?locationIds=uuid1,uuid2,uuid3
```

- When `locationIds` contains **2+ IDs**, the response is grouped/keyed by `locationId` (see per-endpoint docs).
- When `locationIds` contains a **single ID**, or when `locationId` (singular) is used, the response is the same flat shape as before — no breaking change.

---

## 1. Merchant Auth (Public)

### POST `/v1/auth/register`
Register a new merchant account.

**Body:**
```json
{
  "name": "string (required)",
  "email": "string email (required)",
  "password": "string min 8 chars (required)"
}
```

**Response `201`:**
```json
{ "code": 201, "data": { "id": "...", "name": "...", "email": "..." } }
```

---

### POST `/v1/auth/login`
Login with email and password. Returns a JWT.

**Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response `200`:**
```json
{ "code": 200, "data": { "token": "<jwt>", "merchant": { ... } } }
```

---

### GET `/v1/auth/google`
Redirect the browser here to start Google OAuth login (for merchant login, not GMB).
No body or query params. Redirects to Google consent screen.

---

### GET `/v1/auth/google/callback`
Google redirects here after consent. On success, browser is redirected to:
```
{FRONTEND_URL}/auth/callback?token=<jwt>
```
On failure:
```
{FRONTEND_URL}/auth/callback?error=google_auth_failed
```
> This is a browser redirect — not a fetch/XHR endpoint.

---

### GET `/v1/auth/me` `JWT required`
Returns the currently authenticated merchant's profile.

**Response `200`:**
```json
{ "code": 200, "data": { "id": "...", "name": "...", "email": "..." } }
```

---

## 2. Customers `JWT required`

### GET `/v1/customers`
List all customers for the merchant.

**Query params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 20 | Results per page |
| `offset` | number | 0 | Pagination offset |

**Response `200`:**
```json
{ "data": [ { "id": "...", "name": "...", "email": "...", "phone": "..." } ], "total": 100 }
```

---

### GET `/v1/customers/:id`
Get a single customer by ID.

---

### POST `/v1/customers`
Create a new customer. At least one of `phone` or `email` is required.

**Body:**
```json
{
  "name": "string (optional)",
  "phone": "string max 20 (optional)",
  "email": "string email (optional)",
  "metadata": {}
}
```

**Response `201`:**
```json
{ "data": { "id": "...", ... } }
```

---

### PUT `/v1/customers/:id`
Update an existing customer. All body fields optional.

**Body:**
```json
{ "name": "string", "phone": "string", "email": "string", "metadata": {} }
```

---

### DELETE `/v1/customers/:id`
Delete a customer. Returns `204 No Content`.

---

## 3. Conversations `JWT required`

### GET `/v1/conversations`
List conversations.

**Query params:** `limit` (default 20), `offset` (default 0), `status` (e.g. `open`, `resolved`)

---

### GET `/v1/conversations/:id`
Get a single conversation.

---

### POST `/v1/conversations`
Open a new conversation.

**Body:**
```json
{
  "customerId": "uuid (required)",
  "channel": "whatsapp | instagram | email | sms | web (required)",
  "metadata": {}
}
```

---

### PATCH `/v1/conversations/:id/resolve`
Mark resolved. No body.

---

### PATCH `/v1/conversations/:id/assign`
Assign to an agent.

**Body:** `{ "agentId": "uuid (required)" }`

---

## 4. Events `JWT required`

### POST `/v1/events/track`
Track a single customer event.

**Body:**
```json
{
  "customerId": "uuid (optional)",
  "type": "string max 100 (required)",
  "payload": {},
  "source": "string max 50 (optional)"
}
```

---

### POST `/v1/events/track/batch`
Track up to 100 events at once.

**Body:**
```json
{
  "events": [
    { "customerId": "uuid", "type": "string (required)", "payload": {}, "source": "string" }
  ]
}
```

---

### GET `/v1/events/customers/:customerId/history`
Get event history for a customer.

**Query params:** `limit` (default 50), `offset` (default 0)

---

## 5. AI `JWT required`

### GET `/v1/ai/conversations/:conversationId/summary`
AI-generated summary of a conversation.

---

### POST `/v1/ai/conversations/:conversationId/suggest-reply`
**Body:** `{ "hint": "string max 500 (optional)" }`

---

### POST `/v1/ai/classify-intent`
**Body:** `{ "text": "string max 2000 (required)" }`

---

### POST `/v1/ai/kb/query`
**Body:** `{ "question": "string max 1000 (required)" }`

---

### POST `/v1/ai/workflows/generate`
**Body:** `{ "description": "string max 2000 (required)" }`

---

## 6. GMB — OAuth / Connection `JWT required (except callback)`

### GET `/v1/gmb/oauth/connect`
Returns the Google authorization URL to redirect the user to.

**Response `200`:**
```json
{ "code": 200, "data": { "url": "https://accounts.google.com/o/oauth2/auth?..." } }
```
> Frontend should redirect the user's browser to `data.url`.

---

### GET `/v1/gmb/oauth/callback` `PUBLIC`
Google redirects here after GMB consent. Exchanges code, stores tokens, syncs accounts + locations, then redirects to:
```
{FRONTEND_URL}/onboarding/locations
```
> Browser redirect only — do not call with fetch/XHR.

---

### GET `/v1/gmb/oauth/connections`
List all connected Google accounts for the merchant.

**Response `200`:**
```json
{
  "code": 200,
  "data": [
    {
      "email": "user@gmail.com",
      "isActive": true,
      "connectedAt": "2024-01-01T00:00:00Z",
      "lastRefreshedAt": "2024-01-10T00:00:00Z"
    }
  ]
}
```

---

### DELETE `/v1/gmb/oauth/:email`
Disconnect a Google account. `:email` = the Google account email.

**Response `200`:**
```json
{ "code": 200, "message": "Google account disconnected" }
```

---

## 7. GMB — Locations `JWT required`

### GET `/v1/gmb/locations`
List **all** locations for the merchant (no filter needed — returns everything).

**Response `200`:**
```json
{
  "code": 200,
  "data": [
    {
      "id": "uuid",
      "name": "My Store Downtown",
      "google_location_id": "locations/123",
      "email": "linked-google@gmail.com",
      "ai_enable": true,
      "auto_replies": false,
      "status": true,
      "average_rating": 4.3,
      "total_review_count": 120,
      "response_rate": 85
    }
  ]
}
```

---

### GET `/v1/gmb/locations/:id`
Get a single location by its internal ID.

---

### POST `/v1/gmb/locations/sync`
Sync specific locations from Google. Accepts an array of `google_location_id` values.

**Body:**
```json
{
  "payload": {
    "email": "google-account@gmail.com",
    "google_location_id": ["locations/123", "locations/456"]
  }
}
```

**Response `200`:**
```json
{ "code": 200, "data": { "synced": 2 }, "message": "Locations synced" }
```

---

### PATCH `/v1/gmb/locations/:id/settings`
Update AI / auto-reply settings for a location. All fields optional.

**Body:**
```json
{ "ai_enable": true, "auto_replies": false, "status": true }
```

**Response `200`:**
```json
{ "code": 200, "message": "Settings updated" }
```

---

## 8. GMB — Reviews `JWT required`

Supports both single-location and multi-location queries.

### GET `/v1/gmb/reviews`

**Single location:**
```
GET /v1/gmb/reviews?locationId=<uuid>&startDate=&endDate=&rating=5&replied=false
```

**Multiple locations:**
```
GET /v1/gmb/reviews?locationIds=uuid1,uuid2,uuid3&startDate=&endDate=&rating=&replied=
```

**Query params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `locationId` | uuid | One of these two | Single location |
| `locationIds` | comma-separated uuids | One of these two | Multiple locations |
| `startDate` | ISO date | No | |
| `endDate` | ISO date | No | |
| `rating` | number 1-5 | No | Filter by star rating |
| `replied` | `true` / `false` | No | Filter by reply status |

**Single response `200`:**
```json
{
  "code": 200,
  "data": [
    { "id": "...", "reviewer": "Jane", "rating": 5, "review": "Great!", "replied": false, "review_time": "..." }
  ]
}
```

**Multi response `200`** (all reviews across locations, ordered by location then date):
```json
{
  "code": 200,
  "data": [
    { "location_id": "uuid1", "reviewer": "Jane", "rating": 5, ... },
    { "location_id": "uuid2", "reviewer": "Bob", "rating": 4, ... }
  ]
}
```

---

### GET `/v1/gmb/reviews/:reviewId`
Get a single review by its Google review ID.

---

### POST `/v1/gmb/reviews/sync`
Sync reviews from Google for a **single location**.

**Body:**
```json
{
  "locationId": "uuid (required)",
  "email": "google-account@gmail.com (optional)"
}
```

**Response `200`:**
```json
{ "code": 200, "data": { "newUnreplied": 3 }, "message": "Reviews synced" }
```

---

### POST `/v1/gmb/reviews/sync/all`
Sync reviews from Google for **all** of the merchant's active locations in parallel.
No body required.

**Response `200`:**
```json
{
  "code": 200,
  "data": [
    { "locationId": "uuid1", "name": "Store A", "newUnreplied": 2, "status": "ok" },
    { "locationId": "uuid2", "name": "Store B", "newUnreplied": 0, "status": "ok" },
    { "locationId": null, "status": "error", "reason": "Token expired" }
  ],
  "message": "Bulk review sync complete"
}
```

---

### POST `/v1/gmb/reviews/:reviewId/reply`
Post a manual reply to a review.

**Body:**
```json
{
  "replyText": "Thank you for your review! (required)",
  "email": "google-account@gmail.com (optional)"
}
```

---

### POST `/v1/gmb/reviews/:reviewId/ai-reply`
Generate an AI reply. Optionally auto-post it.

**Body:**
```json
{
  "email": "google-account@gmail.com (optional)",
  "send": false
}
```

- `send: false` (default) — returns preview text, does **not** post.
- `send: true` — generates and immediately posts the reply.

**Response `200`:**
```json
{ "code": 200, "data": { "replyText": "Thank you so much...", "sent": false } }
```

---

## 9. GMB — Analytics `JWT required`

All analytics GET endpoints accept either `locationId` (single) or `locationIds` (comma-separated, 2+).
When `locationIds` is used the response shape changes to include a `byLocation` object — see per-endpoint docs.

---

### GET `/v1/gmb/analytics/overview`
Full dashboard snapshot.

**Query params:** `locationId` OR `locationIds`, `startDate`, `endDate`

**Single response `200`:**
```json
{
  "code": 200,
  "data": {
    "healthScore": { "score": 82, "breakdown": { ... } },
    "ratingAnalytics": { "distribution": { ... }, "trend": [...] },
    "sentimentBreakdown": { "sentiment": { ... }, "topTopics": [...] },
    "metricsSummary": [ { "metric_type": "VIEWS_MAPS", "total": 3400, "daily_avg": 37.8 } ]
  }
}
```

**Multi response `200`:**
```json
{
  "code": 200,
  "data": {
    "byLocation": {
      "uuid1": { "healthScore": {...}, "ratingAnalytics": {...}, "sentiment": {...}, "metricsSummary": [...] },
      "uuid2": { ... }
    },
    "aggregate": {
      "sentiment": { "positive": 140, "neutral": 30, "negative": 20 },
      "metrics": [ { "metric_type": "VIEWS_MAPS", "total": 6800 } ]
    }
  }
}
```

---

### GET `/v1/gmb/analytics/health`
Location health score (0–100).

**Query params:** `locationId` OR `locationIds`

**Single response `200`:**
```json
{
  "code": 200,
  "data": {
    "score": 82,
    "breakdown": { "rating": 34, "responseRate": 25, "velocity": 16, "recency": 5 },
    "meta": { "averageRating": 4.3, "totalReviews": 120, "responseRate": 85, "recentReviews": 8 }
  }
}
```

**Multi response `200`:**
```json
{
  "code": 200,
  "data": {
    "uuid1": { "score": 82, "breakdown": {...}, "meta": {...} },
    "uuid2": { "score": 71, "breakdown": {...}, "meta": {...} }
  }
}
```

---

### GET `/v1/gmb/analytics/metrics`
Raw daily metrics time-series.

**Query params:** `locationId` OR `locationIds`, `startDate`, `endDate`, `metricType`

Common `metricType` values: `VIEWS_MAPS`, `VIEWS_SEARCH`, `ACTIONS_WEBSITE`, `ACTIONS_DRIVING_DIRECTIONS`, `ACTIONS_PHONE`

**Single response `200`:**
```json
{
  "code": 200,
  "data": [ { "date": "2024-01-01", "metric_type": "VIEWS_MAPS", "value": 120 } ]
}
```

**Multi response `200`** (keyed by `location_id`):
```json
{
  "code": 200,
  "data": {
    "uuid1": [ { "date": "2024-01-01", "metric_type": "VIEWS_MAPS", "value": 120 } ],
    "uuid2": [ ... ]
  }
}
```

---

### GET `/v1/gmb/analytics/metrics/summary`
Totals per metric type over a date range.

**Query params:** `locationId` OR `locationIds`, `startDate`, `endDate`

**Single response `200`:**
```json
{
  "code": 200,
  "data": [ { "metric_type": "VIEWS_MAPS", "total": 3400, "daily_avg": 37.8 } ]
}
```

**Multi response `200`:**
```json
{
  "code": 200,
  "data": {
    "byLocation": {
      "uuid1": [ { "metric_type": "VIEWS_MAPS", "total": 3400, "daily_avg": 37.8 } ],
      "uuid2": [ ... ]
    },
    "aggregate": [
      { "metric_type": "VIEWS_MAPS", "total": 6800 }
    ]
  }
}
```

---

### GET `/v1/gmb/analytics/keywords`
Search keyword impressions.

**Query params:** `locationId` OR `locationIds`, `month` (YYYY-MM, optional)

**Single response `200`:**
```json
{ "code": 200, "data": [ { "keyword": "coffee shop", "insights_value": 540 } ] }
```

**Multi response `200`** (keyed by `location_id`):
```json
{
  "code": 200,
  "data": {
    "uuid1": [ { "keyword": "coffee shop", "insights_value": 540 } ],
    "uuid2": [ ... ]
  }
}
```

---

### GET `/v1/gmb/analytics/sentiment`
Sentiment + topic breakdown from reviews.

**Query params:** `locationId` OR `locationIds`, `startDate`, `endDate`

**Single response `200`:**
```json
{
  "code": 200,
  "data": {
    "sentiment": { "positive": 72, "neutral": 15, "negative": 13 },
    "topTopics": [ { "topic": "service", "count": 30 } ]
  }
}
```

**Multi response `200`:**
```json
{
  "code": 200,
  "data": {
    "byLocation": {
      "uuid1": { "sentiment": {...}, "topTopics": [...] },
      "uuid2": { ... }
    },
    "aggregate": {
      "sentiment": { "positive": 140, "neutral": 30, "negative": 20 }
    }
  }
}
```

---

### GET `/v1/gmb/analytics/ratings`
Rating distribution + trend.

**Query params:** `locationId` OR `locationIds`, `startDate`, `endDate`, `groupBy` (`month` / `week` / `day`)

**Single response `200`:**
```json
{
  "code": 200,
  "data": {
    "distribution": { "1": 2, "2": 5, "3": 10, "4": 30, "5": 53 },
    "trend": [ { "period": "2024-01-01T00:00:00Z", "avg_rating": 4.2, "count": 18 } ]
  }
}
```

**Multi response `200`** (keyed by `location_id`):
```json
{
  "code": 200,
  "data": {
    "uuid1": { "distribution": {...}, "trend": [...] },
    "uuid2": { ... }
  }
}
```

---

### POST `/v1/gmb/analytics/sync`
Sync metrics + keywords from Google for a **single location**.

**Body:**
```json
{
  "locationId": "uuid (required)",
  "email": "google-account@gmail.com (optional)",
  "startDate": "ISO date (optional — defaults to 90 days ago)",
  "endDate": "ISO date (optional — defaults to today)"
}
```

**Response `200`:**
```json
{
  "code": 200,
  "data": { "metrics": { "synced": 270 }, "keywords": { "synced": 45 } },
  "message": "Analytics synced"
}
```

---

### POST `/v1/gmb/analytics/sync/all`
Sync metrics + keywords for **all** of the merchant's active locations in parallel.

**Body:** (all optional)
```json
{
  "startDate": "ISO date (optional — defaults to 90 days ago)",
  "endDate": "ISO date (optional — defaults to today)"
}
```

**Response `200`:**
```json
{
  "code": 200,
  "data": [
    { "locationId": "uuid1", "name": "Store A", "metrics": { "synced": 270 }, "keywords": { "synced": 45 }, "status": "ok" },
    { "locationId": "uuid2", "name": "Store B", "metrics": { "synced": 180 }, "keywords": { "synced": 30 }, "status": "ok" },
    { "locationId": null, "status": "error", "reason": "Token expired" }
  ],
  "message": "Bulk analytics sync complete"
}
```

---

## 10. GMB — Competitors `JWT required`

### POST `/v1/gmb/competitors/discover`
Find nearby competitors via Google Places API and save them.

**Body:**
```json
{
  "locationId": "uuid (required)",
  "radiusMeters": 1000,
  "keyword": "coffee shop",
  "limit": 10
}
```

---

### GET `/v1/gmb/competitors`
List tracked competitors.

**Query params:** `locationId` OR `locationIds`

**Single response `200`:**
```json
{ "code": 200, "data": [ { "id": "...", "name": "Rival Store", "rating": 4.1 } ] }
```

**Multi response `200`:**
```json
{
  "code": 200,
  "data": [
    { "locationId": "uuid1", "competitors": [ { "id": "...", "name": "...", "rating": 4.1 } ] },
    { "locationId": "uuid2", "competitors": [ ... ] }
  ]
}
```

---

### GET `/v1/gmb/competitors/compare`
Side-by-side comparison table.

**Query params:** `locationId` OR `locationIds`

**Single response `200`:**
```json
{
  "code": 200,
  "data": {
    "yours": { "name": "My Store", "rating": 4.5, "reviewCount": 120 },
    "competitors": [ { "name": "Rival Store", "rating": 4.1, "reviewCount": 80 } ]
  }
}
```

**Multi response `200`:**
```json
{
  "code": 200,
  "data": [
    {
      "locationId": "uuid1",
      "comparison": { "yours": {...}, "competitors": [...] }
    }
  ]
}
```

---

### DELETE `/v1/gmb/competitors/:id`
Stop tracking a competitor. `:id` = competitor record ID.

---

## 11. GMB — Review Request Campaigns `JWT required`

### GET `/v1/gmb/campaigns`
List all campaigns for the merchant (all locations).

---

### POST `/v1/gmb/campaigns`
Create a review request campaign.

**Body:**
```json
{
  "locationId": "uuid (required)",
  "name": "string (required)",
  "channel": "sms | email | whatsapp (optional)",
  "messageTemplate": "Hi {name}, we'd love your review! (optional)"
}
```

---

### GET `/v1/gmb/campaigns/link`
Quick Google review link for a location — no campaign needed.

**Query params:** `locationId` (required)

**Response `200`:**
```json
{ "code": 200, "data": { "reviewLink": "https://g.page/r/..." } }
```

---

### GET `/v1/gmb/campaigns/:id/link`
Review link for a specific campaign's location.

---

### POST `/v1/gmb/campaigns/:id/send`
Send review request messages to a list of customers.

**Body:**
```json
{
  "customers": [
    { "name": "John", "email": "john@example.com", "phone": "+1234567890" }
  ]
}
```

**Response `200`:**
```json
{ "code": 200, "data": { "sent": 3, "failed": 0 } }
```

---

## 12. GMB — Posts `JWT required`

### GET `/v1/gmb/posts`
List Google Business posts.

**Query params:** `locationId` OR `locationIds`, `email` (optional)

**Single response `200`:**
```json
{ "code": 200, "data": [ { "name": "locations/.../localPosts/...", "summary": "...", "topicType": "STANDARD" } ] }
```

**Multi response `200`:**
```json
{
  "code": 200,
  "data": [
    { "locationId": "uuid1", "posts": [ ... ] },
    { "locationId": "uuid2", "posts": [ ... ] }
  ]
}
```

---

### POST `/v1/gmb/posts`
Create a new Google Business post.

**Body:**
```json
{
  "locationId": "uuid (required)",
  "email": "google-account@gmail.com (optional)",
  "topicType": "STANDARD | EVENT | OFFER (required)",
  "summary": "Post text content (required)",
  "callToAction": {
    "actionType": "LEARN_MORE | BOOK | ORDER | SHOP | SIGN_UP | CALL",
    "url": "https://..."
  },
  "event": {
    "title": "Event name",
    "schedule": {
      "startDate": { "year": 2024, "month": 6, "day": 1 },
      "endDate": { "year": 2024, "month": 6, "day": 2 }
    }
  },
  "offer": {
    "couponCode": "SAVE10",
    "redeemOnlineUrl": "https://..."
  }
}
```

**Response `201`:**
```json
{ "code": 201, "data": { "name": "locations/.../localPosts/...", "summary": "..." } }
```

---

## Error Response Format

```json
{ "code": 400, "message": "locationId or locationIds is required" }
```

| Code | Meaning |
|------|---------|
| 400 | Bad request / missing required field |
| 401 | Missing or invalid JWT |
| 403 | Forbidden — resource belongs to another merchant |
| 404 | Resource not found |

---

## GEO+SEO Module

Analyzes any URL for AI search engine visibility (GEO — Generative Engine Optimization) and traditional SEO signals.

**All routes:** `Authorization: Bearer <token>` required.

### Score Breakdown

| Component | Weight | What it measures |
|-----------|--------|-----------------|
| Citability | 25% | How easily AI systems can quote the content (passage length, structure, stats) |
| AI Crawler Access | 25% | robots.txt access for GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc. |
| E-E-A-T | 20% | Experience, Expertise, Authoritativeness, Trustworthiness signals |
| Technical | 15% | HTTPS, meta tags, SSR vs CSR, canonical, mobile, security headers |
| Schema | 10% | JSON-LD / Schema.org structured data coverage and quality |

**GEO Score labels:** 80-100 Excellent · 60-79 Good · 40-59 Fair · 20-39 Poor · 0-19 Critical

---

### POST `/v1/geo-seo/scan`

Enqueue a GEO+SEO scan for a URL. Returns immediately with a `scanId`.
Poll `GET /v1/geo-seo/status/:scanId` to check progress.

**Body:**
```json
{ "url": "https://example.com" }
```

**Response `202`:**
```json
{
  "code": 202,
  "data": {
    "scanId": "uuid",
    "status": "pending",
    "triggerRunId": "trigger-run-id",
    "message": "Scan enqueued. Poll GET /v1/geo-seo/status/<scanId> to check progress."
  }
}
```

---

### GET `/v1/geo-seo/status/:scanId`

Poll the status of a scan.

**Response `200` (pending/running):**
```json
{
  "code": 200,
  "data": { "scanId": "uuid", "url": "https://example.com", "status": "pending" }
}
```

**Response `200` (completed):**
```json
{
  "code": 200,
  "data": {
    "scanId": "uuid",
    "url": "https://example.com",
    "status": "completed",
    "geoScore": 72,
    "citabilityScore": 65,
    "eeeatScore": 80,
    "technicalScore": 85,
    "schemaScore": 20,
    "crawlerScore": 100,
    "report": { ... }
  }
}
```

**Response `200` (failed):**
```json
{
  "code": 200,
  "data": { "scanId": "uuid", "status": "failed", "error": "URL returned HTTP 403" }
}
```

---

### GET `/v1/geo-seo/scan/:scanId`

Fetch the full JSON report for a specific completed scan.

**Response `200`:**
```json
{
  "code": 200,
  "data": {
    "url": "https://example.com",
    "geoScore": 72,
    "scoreLabel": "Good",
    "scores": {
      "citability": 65, "aiCrawlerAccess": 100, "eeat": 80,
      "technical": 85, "schema": 20
    },
    "aiCrawlers": {
      "crawlerStatus": {
        "GPTBot":        { "engine": "ChatGPT",    "tier": 1, "access": "allowed" },
        "ClaudeBot":     { "engine": "Claude",     "tier": 1, "access": "allowed" },
        "PerplexityBot": { "engine": "Perplexity", "tier": 1, "access": "allowed" }
      },
      "hasLlmsTxt": false,
      "blockedTier1Count": 0
    },
    "issues": [
      { "severity": "high",   "area": "Schema",    "message": "No JSON-LD structured data found" },
      { "severity": "medium", "area": "E-E-A-T",   "message": "No author attribution found" }
    ],
    "quickWins": [ ... ]
  }
}
```

---

### GET `/v1/geo-seo/results/:merchantId`

List the latest completed scans for a merchant.
The `:merchantId` must match the authenticated user's merchant ID.

**Query params:**
- `limit` (optional, default 10, max 50)

**Response `200`:**
```json
{
  "code": 200,
  "data": [
    {
      "id": "uuid",
      "url": "https://example.com",
      "geo_score": 72,
      "citability_score": 65,
      "eeat_score": 80,
      "technical_score": 85,
      "schema_score": 20,
      "crawler_score": 100,
      "created_at": "2026-04-15T10:00:00.000Z",
      "status": "completed"
    }
  ]
}
```

---

## 14. Swiggy `JWT required`

Swiggy MCP integration — OAuth connection, competitor intelligence, and food ordering context.

### Swiggy OAuth Flow

```
1. POST /v1/swiggy/auth/connect   → get authorizeUrl
2. Redirect user browser to authorizeUrl
3. Swiggy redirects back to GET /v1/auth/swiggy/callback (public)
4. Token stored. Now call GET /v1/swiggy/auth/status to confirm.
```

---

### POST `/v1/swiggy/auth/connect`
Start Swiggy OAuth PKCE flow. Returns the URL to redirect the user to.

**Body:**
```json
{
  "locationId": "integer (optional — GMB location to link)",
  "redirectUri": "string (optional — override default callback URL)"
}
```

**Response `200`:**
```json
{
  "code": 200,
  "data": {
    "authorizeUrl": "https://mcp.swiggy.com/auth/authorize?...",
    "state": "abc123",
    "expiresAt": "2026-04-30T10:10:00.000Z"
  }
}
```
> Redirect the user's browser to `data.authorizeUrl`. Do not fetch it as XHR.

---

### GET `/v1/swiggy/auth/status`
Check whether Swiggy is connected and the token is valid.

**Response `200`:**
```json
{
  "code": 200,
  "data": {
    "connected": true,
    "isValid": true,
    "expiresAt": "2026-05-05T00:00:00.000Z",
    "addressId": "addr_xyz",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "ownSwiggyRestaurantId": "rest_123",
    "lastSyncedAt": "2026-04-29T08:00:00.000Z"
  }
}
```

When not connected: `{ "connected": false }`

---

### DELETE `/v1/swiggy/auth/disconnect`
Revoke and clear Swiggy credentials.

**Response `200`:**
```json
{ "code": 200, "data": { "disconnected": true } }
```

---

### PATCH `/v1/swiggy/auth/context`
Set the merchant's default delivery address and own Swiggy restaurant ID. Required before scan or voice ordering tools work.

**Body:**
```json
{
  "addressId": "string (Swiggy delivery address ID)",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "ownSwiggyRestaurantId": "string (your restaurant's Swiggy ID)"
}
```

**Response `200`:**
```json
{
  "code": 200,
  "data": { "addressId": "addr_xyz", "latitude": 12.9716, "longitude": 77.5946, "ownSwiggyRestaurantId": "rest_123" }
}
```

---

### POST `/v1/swiggy/scan/trigger`
Trigger a background competitor intelligence scan (Trigger.dev task).

**Body:**
```json
{
  "locationId": "integer (optional)",
  "keywords": ["biryani", "pizza", "chinese"] 
}
```
`keywords` defaults to the restaurant's cuisine if omitted. Max 8 keywords.

**Response `200`:**
```json
{ "code": 200, "data": { "triggered": true } }
```

---

### GET `/v1/swiggy/competitors`
List tracked Swiggy competitors for the merchant.

**Query params:** none required (scoped to merchant automatically)

**Response `200`:**
```json
{
  "code": 200,
  "data": [
    {
      "id": "uuid",
      "name": "Rival Biryani House",
      "swiggy_restaurant_id": "rest_456",
      "rating": 4.2,
      "cuisine": "Biryani",
      "rank_for_keyword": { "biryani": 3, "chicken biryani": 5 }
    }
  ]
}
```

---

### DELETE `/v1/swiggy/competitors/:id`
Stop tracking a competitor.

**Response `200`:**
```json
{ "code": 200, "data": { "removed": true } }
```

---

### GET `/v1/swiggy/competitors/:id/menu`
Latest menu snapshot for a tracked competitor.

**Response `200`:**
```json
{
  "code": 200,
  "data": {
    "restaurantId": "rest_456",
    "snapshotAt": "2026-04-29T08:00:00.000Z",
    "categories": [
      { "name": "Biryani", "items": [ { "name": "Chicken Biryani", "price": 249 } ] }
    ]
  }
}
```

---

### GET `/v1/swiggy/intelligence/pricing`
Price comparison — your items vs tracked competitors.

**Response `200`:**
```json
{
  "code": 200,
  "data": {
    "yours": { "avgPrice": 280 },
    "competitors": [
      { "name": "Rival Biryani", "avgPrice": 249, "delta": -31 }
    ]
  }
}
```

---

### GET `/v1/swiggy/intelligence/ranking`
Your restaurant's rank for tracked cuisine keywords.

**Response `200`:**
```json
{
  "code": 200,
  "data": [
    { "keyword": "biryani", "rank": 4, "totalResults": 30 },
    { "keyword": "chicken biryani", "rank": 7, "totalResults": 22 }
  ]
}
```

---

### GET `/v1/swiggy/intelligence/occupancy`
Competitor table slot availability trends (Dineout).

**Response `200`:**
```json
{
  "code": 200,
  "data": [
    {
      "restaurantId": "rest_456",
      "name": "Rival Biryani",
      "slotAvailability": [
        { "date": "2026-04-30", "lunch": 3, "dinner": 0 }
      ]
    }
  ]
}
```

---

## 15. Voice — AI Phone Receptionist `JWT required`

Manages ElevenLabs AI voice agents per restaurant location. Each location gets one agent with its own menu knowledge base and Swiggy tool access.

### Setup order for a new location:
```
1. POST /v1/swiggy/auth/connect       → connect Swiggy
2. PATCH /v1/swiggy/auth/context      → set own restaurantId + lat/lng
3. POST /v1/voice/agents/provision    → create ElevenLabs agent
4. POST /v1/voice/numbers             → register Exotel virtual number
5. (Manual) configure Exotel SIP → sip:sip.rtc.elevenlabs.io:5060;transport=tcp
```

---

### POST `/v1/voice/agents/provision`
Create an ElevenLabs voice agent for a restaurant location. This provisions the agent, creates knowledge base docs, creates Swiggy tool webhooks, and activates everything in one call (~5–10s, do not timeout before 30s).

**Body:**
```json
{
  "locationId": "string (required — GMB location ID or any stable location key)",
  "restaurantName": "Sharma Ji Ka Dhaba (required)",
  "menuText": "string (optional — full menu as plain text; can be updated later)",
  "restaurantAddress": "12, MG Road, Bengaluru",
  "restaurantHours": "Mon–Sun 11am–11pm",
  "restaurantCuisine": "North Indian",
  "restaurantPhone": "+919876543210",
  "voiceId": "cjVigY5qzO86Huf0OWal (optional — ElevenLabs voice ID)",
  "primaryLanguage": "hi (optional — default: hi)"
}
```

**Response `201`:**
```json
{
  "code": 201,
  "data": { "agentId": "el_agent_xyz", "status": "active" }
}
```

**Error — agent already exists:**
```json
{ "code": 400, "message": "Agent already provisioned for this location" }
```

---

### GET `/v1/voice/agents`
List all voice agents for the merchant.

**Response `200`:**
```json
{
  "code": 200,
  "data": {
    "agents": [
      {
        "id": "uuid",
        "location_id": "locations/abc",
        "elevenlabs_agent_id": "el_agent_xyz",
        "restaurant_name": "Sharma Ji Ka Dhaba",
        "status": "active",
        "primary_language": "hi",
        "voice_id": "cjVigY5qzO86Huf0OWal",
        "created_at": "2026-04-30T10:00:00.000Z"
      }
    ]
  }
}
```

---

### GET `/v1/voice/agents/:locationId`
Get agent details + linked phone number for a location.

**Response `200`:**
```json
{
  "code": 200,
  "data": {
    "agent": { "id": "uuid", "elevenlabs_agent_id": "el_agent_xyz", "status": "active", ... },
    "phoneNumber": {
      "id": "uuid",
      "phone_number": "+919876543210",
      "provider": "exotel",
      "sip_configured": true,
      "is_active": true
    }
  }
}
```
`phoneNumber` is `null` if no number has been added yet.

---

### DELETE `/v1/voice/agents/:locationId`
Decommission a voice agent — deletes the ElevenLabs agent, knowledge base docs, and marks the DB row inactive.

**Response `200`:**
```json
{ "code": 200, "data": { "decommissioned": true } }
```

---

### PUT `/v1/voice/agents/:locationId/menu`
Replace the menu knowledge base for an agent. Use this whenever the menu changes. Previous KB doc is deleted and a new one is created.

**Body:**
```json
{ "menuText": "string (required — full menu as plain text)" }
```

**Response `200`:**
```json
{ "code": 200, "data": { "updated": true, "kbId": "kb_doc_abc" } }
```

---

### GET `/v1/voice/calls`
List call records for the merchant.

**Query params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `locationId` | string | — | Filter by location |
| `startDate` | ISO date | — | |
| `endDate` | ISO date | — | |
| `status` | string | — | `completed` · `missed` · `failed` · `in_progress` |
| `orderPlaced` | `true`/`false` | — | Filter calls where an order was placed |
| `limit` | number | 20 | Max 100 |
| `offset` | number | 0 | |

**Response `200`:**
```json
{
  "code": 200,
  "data": {
    "calls": [
      {
        "id": "uuid",
        "location_id": "locations/abc",
        "elevenlabs_conversation_id": "conv_xyz",
        "direction": "inbound",
        "caller_number": "+919876543210",
        "called_number": "+918765432100",
        "duration_secs": 142,
        "status": "completed",
        "call_successful": "success",
        "language_detected": "hi",
        "order_placed": true,
        "swiggy_order_id": "ORD123",
        "table_booked": false,
        "transcript_summary": "Customer ordered 2 butter chicken...",
        "created_at": "2026-04-30T14:32:00.000Z"
      }
    ],
    "total": 48,
    "limit": 20,
    "offset": 0
  }
}
```

---

### GET `/v1/voice/calls/:callId`
Full call record including raw transcript array and ElevenLabs analysis.

**Response `200`:**
```json
{
  "code": 200,
  "data": {
    "id": "uuid",
    "transcript": [
      { "role": "agent", "message": "Namaste! Main Sharma Ji Ka Dhaba ka AI receptionist hun..." },
      { "role": "user",  "message": "Haan, ek butter chicken aur do naan chahiye" }
    ],
    "analysis": {
      "evaluation_results": [ { "criteria_id": "...", "result": "success" } ],
      "data_collection_results": {
        "order_placed": true,
        "swiggy_order_id": "ORD123",
        "caller_intent": "order"
      }
    },
    "duration_secs": 142,
    "call_successful": "success"
  }
}
```

---

### GET `/v1/voice/analytics`
Call analytics dashboard for a merchant.

**Query params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `locationId` | string | — | Filter by location |
| `period` | string | `7d` | `7d` · `30d` · `90d` |

**Response `200`:**
```json
{
  "code": 200,
  "data": {
    "totalCalls": 124,
    "answeredCalls": 118,
    "missedCalls": 6,
    "answerRate": 95,
    "ordersPlaced": 43,
    "bookingsMade": 12,
    "avgDuration": 98,
    "callsByDay": [
      { "date": "2026-04-23", "count": 18 },
      { "date": "2026-04-24", "count": 22 }
    ],
    "topIntents": [
      { "intent": "order",       "count": 43 },
      { "intent": "info",        "count": 38 },
      { "intent": "reservation", "count": 12 },
      { "intent": "complaint",   "count": 5 }
    ]
  }
}
```

---

### POST `/v1/voice/numbers`
Register an Exotel virtual phone number for a location. SIP configuration to ElevenLabs is done manually — this just stores the number record.

**Body:**
```json
{
  "locationId": "string (required)",
  "phoneNumber": "+919876543210 (required — E.164 format)"
}
```

**Response `201`:**
```json
{
  "code": 201,
  "data": {
    "id": "uuid",
    "phone_number": "+919876543210",
    "provider": "exotel",
    "sip_configured": false,
    "is_active": true
  }
}
```

---

### GET `/v1/voice/numbers`
List all virtual numbers for the merchant.

**Response `200`:**
```json
{
  "code": 200,
  "data": {
    "numbers": [
      { "id": "uuid", "location_id": "locations/abc", "phone_number": "+919876543210", "sip_configured": true }
    ]
  }
}
```

---

### POST `/v1/voice/webhooks/elevenlabs` `PUBLIC — HMAC verified`
ElevenLabs posts here after every call ends. Do not call this directly. The endpoint verifies the `elevenlabs-signature` header and returns `200` immediately; all processing is async.

---

### EventBus events emitted by Voice module

These events are published after each call and can trigger workflows (see `/v1/workflows`):

| Event | Payload | When |
|-------|---------|------|
| `voice.call.completed` | `{ callId, locationId, orderPlaced, tableBooked, callerIntent, duration, callSuccessful }` | Every completed call |
| `voice.call.missed` | `{ locationId, callerPhone, calledNumber, timestamp }` | Missed / failed to answer |
| `voice.order.placed` | `{ callId, swiggyOrderId, callerPhone }` | When AI placed a Swiggy order |
| `voice.agent.provisioned` | `{ locationId, agentId }` | New agent created |

**Example workflow you can build in `/v1/workflows`:**
- Trigger: `voice.order.placed` → Wait 35 min → Action: send WhatsApp review request to `callerPhone`
- Trigger: `voice.call.missed` → Action: send WhatsApp "We missed your call" to `callerPhone`

---

---

## 16. Business Report Pipeline Engine `Public (no JWT required by default)`

Generates a scored growth report for any business from a Google Place ID.
Pipeline runs async across 4 Lambda phases. Frontend polls `/pipelines/:id` until `status` is `completed`, then fetches `/pipelines/:id/report`.

**Typical integration flow:**
```
0. GET  /v1/places/autocomplete?input=Barbeque Nation&country=in  → pick a place_id
1. POST /v1/pipelines            → { id, pollUrl }
2. GET  {pollUrl}                → poll every 3s until status = "completed"
3. GET  /v1/pipelines/:id/report → full report with scores + insights
```

---

### GET `/v1/places/autocomplete`

Proxy for Google Places Autocomplete (New API). The backend holds the API key — frontend sends nothing sensitive.

**Query params:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `input` | string | Yes | Search text (min 2 chars) |
| `country` | string | No | ISO 3166-1 alpha-2 country code to restrict results (e.g. `in`, `us`) |

**Example request:**
```
GET /v1/places/autocomplete?input=Barbeque+Nation&country=in
```

**Response `200`:**
```json
{
  "predictions": [
    {
      "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
      "name": "Barbeque Nation",
      "address": "Connaught Place, New Delhi, Delhi"
    },
    {
      "place_id": "ChIJrTLr-GyuEmsRBfy61i59si0",
      "name": "Barbeque Nation",
      "address": "Koramangala, Bengaluru, Karnataka"
    }
  ]
}
```

> Pass the `place_id` from a chosen prediction as `params.googlePlaceId` in `POST /v1/pipelines`.

---

### POST `/v1/pipelines`

Start an async brand report pipeline.

**Body:**
```json
{
  "type": "brand-from-place-id",
  "params": {
    "googlePlaceId": "ChIJN1t_tDeuEmsRUsoyG83frY4",
    "source": "grader"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | No | Default: `brand-from-place-id` |
| `params.googlePlaceId` | string | Yes | Google Places `place_id` |
| `params.source` | string | No | Analytics source tag (e.g. `grader`, `dashboard`) |

**Response `202`:**
```json
{
  "id": "uuid",
  "type": "brand-from-place-id",
  "status": "created",
  "createdAt": "2026-04-30T10:00:00.000Z",
  "pollUrl": "/v1/pipelines/uuid"
}
```

> Idempotent — if a non-failed pipeline already exists for the same `googlePlaceId`, it is returned instead of creating a new one.

---

### GET `/v1/pipelines/:id`

Poll pipeline status and per-task progress.

**Response `200` (processing):**
```json
{
  "id": "uuid",
  "type": "brand-from-place-id",
  "status": "processing",
  "progress": { "total": 16, "completed": 8, "failed": 0, "percentage": 50 },
  "tasks": [
    { "name": "fetch-place-details", "phase": "ingestion",   "status": "complete",    "startedAt": "...", "completedAt": "..." },
    { "name": "create-brand",        "phase": "ingestion",   "status": "complete",    "startedAt": "...", "completedAt": "..." },
    { "name": "fetch-reviews",       "phase": "enrichment",  "status": "processing",  "startedAt": "...", "completedAt": null },
    { "name": "seo-analysis",        "phase": "analysis",    "status": "pending",     "startedAt": null,  "completedAt": null },
    { "name": "compute-scores",      "phase": "scoring",     "status": "pending",     "startedAt": null,  "completedAt": null }
  ],
  "brandId": "uuid",
  "reportId": null,
  "brand": { "id": "uuid", "name": "Bakers Haus", "rating": 4.3, "website": "https://bakershausict.com" },
  "createdAt": "2026-04-30T10:00:00.000Z",
  "updatedAt": "2026-04-30T10:00:15.000Z",
  "completedAt": null
}
```

**Response `200` (completed):**
```json
{
  "status": "completed",
  "progress": { "total": 16, "completed": 16, "failed": 0, "percentage": 100 },
  "brandId": "uuid",
  "reportId": "uuid",
  "completedAt": "2026-04-30T10:01:30.000Z"
}
```

**Pipeline status values:**
| Status | Meaning |
|--------|---------|
| `created` | Pipeline row created, ingestion Lambda queued |
| `processing` | Workers actively running |
| `partial` | Some non-critical tasks failed, report still generated |
| `completed` | All tasks done, `reportId` is available |
| `failed` | Critical task exhausted retries, no report |

**Task phases:**
| Phase | Tasks |
|-------|-------|
| `ingestion` | fetch-place-details, create-brand, create-location, save-google-photos |
| `enrichment` | fetch-reviews, desktop-screenshot, mobile-screenshot, create-logo |
| `analysis` | seo-analysis, ux-analysis, reputation-analysis, keyword-detection, identify-nearby-areas |
| `scoring` | compute-scores, generate-insights, generate-report |

---

### GET `/v1/pipelines`

List pipelines. Scoped to authenticated merchant if JWT is provided.

**Query params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | string | — | Filter: `created` · `processing` · `partial` · `completed` · `failed` |
| `page` | number | 1 | |
| `limit` | number | 20 | Max 100 |

**Response `200`:**
```json
{
  "items": [ { "id": "uuid", "type": "brand-from-place-id", "status": "completed", ... } ],
  "meta": { "total": 42, "page": 1, "limit": 20, "pages": 3 }
}
```

---

### GET `/v1/pipelines/:pipelineId/report`

Get the full growth report for a completed pipeline.
Returns `404` if the pipeline is not yet `completed`.

**Response `200`:**
```json
{
  "id": "uuid",
  "status": "ready",
  "metadata": {
    "brandId": "uuid",
    "googlePlaceId": "ChIJN1t_tDeuEmsRUsoyG83frY4",
    "name": "Bakers Haus",
    "rating": 4.3,
    "priceLevel": 2,
    "cuisines": ["breakfast", "bagels", "coffee"],
    "description": "Casual spot serving New York-style bagels",
    "numLocations": 2,
    "userRatingsTotal": 304,
    "website": "https://bakershausict.com",
    "phone": "+13165551234",
    "address": {
      "street": "8641 W 13th St N #100",
      "city": "Wichita",
      "state": "KS",
      "zip": "67212",
      "country": "USA"
    },
    "coordinates": { "latitude": 37.708208, "longitude": -97.441339 }
  },
  "overallScore": 64,
  "maxScore": 100,
  "scores": {
    "overall":         { "score": 64, "max": 100 },
    "guestExperience": { "score": 26, "max": 40, "breakdown": [...], "metrics": { "cls": 73, "inp": 138, "lcp": 3285 } },
    "reputation":      { "score": 17, "max": 20, "breakdown": [...], "rating": 4.3, "reviewCount": 304 },
    "searchResults":   { "score": 21, "max": 40, "breakdown": [...], "keywords": { "primary": "bagels in Wichita", "secondary": [...] } }
  },
  "taskGroups": [
    {
      "name": "Guest Experience",
      "score": 26, "max": 40,
      "checks": [
        { "name": "has-cta",                    "status": "pass", "issue": null },
        { "name": "no-external-ordering-links",  "status": "fail", "issue": "External 3rd-party ordering link detected" },
        { "name": "has-ssl",                     "status": "pass", "issue": null },
        { "name": "has-schema-markup",           "status": "fail", "issue": "No structured data (schema.org) detected" },
        { "name": "good-lcp",                    "status": "fail", "issue": "LCP 3285ms exceeds 2.5s" }
      ],
      "metrics": { "cls": 73, "inp": 138, "lcp": 3285 }
    }
  ],
  "insights": [
    {
      "id": 1,
      "type": "revenue",
      "priority": "high",
      "title": "Remove Third-Party Ordering Links",
      "description": "Each order through DoorDash / UberEats costs ~30% in commission.",
      "action": "Switch to a first-party ordering system (e.g., owner.com, Slice, Square Online)."
    }
  ],
  "media": {
    "photos": ["https://maps.googleapis.com/..."],
    "logo": "https://logo.clearbit.com/bakershausict.com",
    "screenshots": {
      "mobile": "https://...",
      "desktop": "https://..."
    }
  },
  "topReviews": [
    { "author": "Jane D.", "rating": 5, "text": "Best bagels in Wichita!", "source": "google", "reviewedAt": "..." }
  ],
  "generatedAt": "2026-04-30T10:01:30.000Z"
}
```

---

### GET `/v1/reports/:id`

Same as above but by report ID directly.

---

### Check status values

| Check name | Dimension | Pass condition |
|------------|-----------|---------------|
| `has-cta` | UX | Page has order/book/reserve CTA |
| `no-external-ordering-links` | UX | No DoorDash/UberEats links |
| `has-online-ordering` | UX | Direct ordering present |
| `has-ssl` | UX | Website is HTTPS |
| `has-schema-markup` | UX | JSON-LD or schema.org detected |
| `good-cls` | UX | CLS < 100 (0.1) |
| `good-lcp` | UX | LCP < 2500ms |
| `high-rating` | Reputation | Google rating ≥ 4.0 |
| `sufficient-reviews` | Reputation | 100+ reviews |
| `has-social-presence` | Reputation | Social links on website |

---

## 17. Integration Layer — Data Ingestion & Webhooks `JWT required (management endpoints) / Signature verified (webhook receivers)`

This is the spine of the Yield Management Engine. All external data — POS transactions, delivery orders, payments, reservations — flows in through this layer, gets normalized into the **Retail Event Schema**, and is published to the internal event bus for the Intelligence Engine to consume.

---

### Architecture Overview

```
External Source              Retilo Ingestion Layer           Internal Bus
────────────────             ──────────────────────────────   ─────────────────────
PetPooja (POS)    ──push──►  POST /webhook/petpooja           event.tracked
Posist (POS)      ──push──►  POST /webhook/posist             → Intelligence Engine
Swiggy            ──push──►  POST /webhook/swiggy             → Agent Engine
Zomato            ──push──►  POST /webhook/zomato             → Workflow Engine
Razorpay          ──push──►  POST /webhook/razorpay
PhonePe Biz       ──push──►  POST /webhook/phonepe
Practo            ──push──►  POST /webhook/practo
Any system        ──push──►  POST /ingest (SDK / manual)
                  ──pull──►  Scheduled sync (weather, events)
```

All webhook receivers verify the source signature before processing. On success they return `202 Accepted` immediately — processing is async.

---

### Retail Event Schema (normalized output)

Every source produces a different shape. Retilo normalizes all of them into this schema before publishing to the event bus:

```json
{
  "id": "uuid-v4",
  "merchantId": "uuid",
  "integrationId": "uuid",
  "source": "petpooja | posist | swiggy | zomato | razorpay | phonepe | practo | manual",
  "type": "order.placed | order.completed | order.cancelled | payment.captured | customer.visited | reservation.created | reservation.no_show | review.received | inventory.low",
  "channel": "dine-in | delivery | takeaway | online | walk-in | phone",
  "occurredAt": "2026-05-07T14:30:00.000Z",
  "locationId": "uuid (outlet)",
  "payload": {
    "orderId": "string",
    "amount": 450,
    "currency": "INR",
    "items": [
      { "id": "string", "name": "Butter Chicken", "qty": 2, "price": 220 }
    ],
    "customerId": "string (if known)",
    "customerPhone": "string (normalized E.164)",
    "tableId": "string (for dine-in)",
    "reservationId": "string (if applicable)",
    "paymentMethod": "cash | card | upi | wallet"
  },
  "raw": { "...original payload from source unchanged..." }
}
```

**Event type reference:**

| Type | Trigger |
|------|---------|
| `order.placed` | New order created in POS or delivery platform |
| `order.completed` | Order delivered / bill settled |
| `order.cancelled` | Order cancelled before completion |
| `order.refunded` | Refund issued post-completion |
| `payment.captured` | Successful payment received |
| `payment.failed` | Payment attempt failed |
| `customer.identified` | Customer phone/email captured (loyalty, booking) |
| `customer.visited` | Physical visit confirmed |
| `reservation.created` | Booking/appointment made |
| `reservation.confirmed` | Booking confirmed by staff |
| `reservation.cancelled` | Booking cancelled |
| `reservation.no_show` | Customer didn't show — high-value signal |
| `review.received` | New review posted (any platform) |
| `inventory.low` | Item stock dropped below threshold |

---

### Integration Management Endpoints

#### POST `/v1/integrations/connect`
Connect a new integration for the authenticated merchant.

**Body:**
```json
{
  "source": "petpooja",
  "locationId": "uuid (outlet this integration belongs to)",
  "config": {
    "restaurantId": "PETPOOJA_RESTAURANT_ID",
    "apiKey": "PETPOOJA_API_KEY",
    "webhookSecret": "secret you set in PetPooja console"
  }
}
```

`source` must be one of: `petpooja`, `posist`, `swiggy`, `zomato`, `razorpay`, `phonepe`, `practo`, `generic`

**Response `201`:**
```json
{
  "code": 201,
  "data": {
    "id": "uuid",
    "source": "petpooja",
    "status": "active",
    "webhookUrl": "https://api.retilo.com/v1/integrations/webhook/petpooja",
    "webhookSecret": "retilo_whs_...",
    "createdAt": "..."
  }
}
```

The `webhookUrl` and `webhookSecret` are what you paste into the source platform's developer console.

---

#### GET `/v1/integrations`
List all integrations for the merchant.

**Response `200`:**
```json
{
  "code": 200,
  "data": [
    {
      "id": "uuid",
      "source": "petpooja",
      "locationId": "uuid",
      "status": "active | paused | error",
      "lastEventAt": "2026-05-07T13:00:00Z",
      "eventCount": 1842,
      "errorMessage": null
    }
  ]
}
```

---

#### GET `/v1/integrations/:id`
Get a single integration's status and recent sync info.

---

#### DELETE `/v1/integrations/:id`
Disconnect an integration. Stops processing new webhooks from that source. Historical data is retained.

---

#### POST `/v1/integrations/:id/sync`
Trigger a manual pull sync for integrations that support polling (e.g. Swiggy historical orders). Fire-and-forget — returns `202` immediately.

---

### Webhook Receivers

All webhook receivers are at `/v1/integrations/webhook/:source`. They do **not** require a JWT. They verify authenticity via the source platform's signature mechanism.

#### POST `/v1/integrations/webhook/petpooja`

**Developer Console:** `https://developer.petpooja.com` → Partner Dashboard → Webhooks

**What PetPooja sends:**
- New orders placed at the outlet
- Order status updates (KOT printed, bill settled, cancelled)
- Table status changes
- Item 86 (out of stock) alerts

**Signature verification:** PetPooja signs each request with HMAC-SHA256 using the shared secret you configured in the console. Retilo verifies `X-PetPooja-Signature` header.

**Console setup steps:**
1. Login at `partners.petpooja.com`
2. Navigate to: Settings → Webhooks → Add Webhook
3. Paste `https://api.retilo.com/v1/integrations/webhook/petpooja` as the URL
4. Copy the generated secret → paste into Retilo's `connect` endpoint as `webhookSecret`
5. Select events: `order_placed`, `order_status_update`, `item_oos`

**Responds:** `202 Accepted` always (processing is async)

---

#### POST `/v1/integrations/webhook/posist`

**Developer Console:** `https://partners.posist.com` → API & Integrations → Webhooks

**What Posist sends:**
- Order lifecycle events (placed, KOT, served, billed, cancelled)
- Payment captured / split payments
- Inventory depletion alerts
- Table turn events (cover count)

**Signature verification:** `X-Posist-HMAC-SHA256` header, HMAC-SHA256 of raw body with your partner secret.

**Console setup steps:**
1. Login at `business.posist.com` → Settings → Integrations → Webhook Manager
2. Add endpoint URL: `https://api.retilo.com/v1/integrations/webhook/posist`
3. Select event categories: Orders, Payments, Inventory
4. Copy signing secret → Retilo `connect` config

---

#### POST `/v1/integrations/webhook/swiggy`

Retilo already has Swiggy OAuth (Section 14). This receiver handles real-time order push events from Swiggy's partner webhook system.

**Developer Console:** `https://partner.swiggy.com` → API Settings → Webhook Configuration

**What Swiggy sends:**
- `order.placed` — new delivery order
- `order.accepted` / `order.rejected` — restaurant action
- `order.dispatched` / `order.delivered` / `order.cancelled`
- `review.posted` — new customer review

**Signature verification:** `X-Swiggy-Signature` header, HMAC-SHA256 of `timestamp + "." + body` with your Swiggy partner secret.

**Console setup steps:**
1. `partner.swiggy.com` → Restaurant Dashboard → Settings → Integrations → Webhooks
2. Add URL: `https://api.retilo.com/v1/integrations/webhook/swiggy`
3. Select all order and review events
4. Copy the webhook signing key → Retilo `connect` config

---

#### POST `/v1/integrations/webhook/zomato`

**Developer Console:** `https://www.zomato.com/developer` (restricted — requires partner program enrollment via restaurant@zomato.com)

**What Zomato sends:**
- New online orders
- Order status updates
- Customer ratings / reviews
- Menu change confirmations

**Signature verification:** `X-Zomato-Secret` header (static shared secret, no HMAC — validate exact string match).

**Console setup steps:**
1. Enroll in Zomato Restaurant Technology Partner program
2. Once approved: Zomato Partner Portal → API Keys → Webhook URL
3. Set URL: `https://api.retilo.com/v1/integrations/webhook/zomato`
4. Copy the webhook secret → Retilo `connect` config

> **Note:** Zomato API access is gated behind their partner program. Email `restaurant-tech@zomato.com` with your use case to apply.

---

#### POST `/v1/integrations/webhook/razorpay`

**Developer Console:** `https://dashboard.razorpay.com` → Settings → Webhooks → + Add New Webhook

**What Razorpay sends:**
- `payment.captured` — successful payment with amount + customer info
- `payment.failed` — failed attempt (churn signal for clinics)
- `order.paid` — full order payment confirmed
- `refund.processed` — refund issued

**Signature verification:** `X-Razorpay-Signature` header, HMAC-SHA256 of raw body with Razorpay webhook secret.

**Console setup steps:**
1. `dashboard.razorpay.com` → Settings → Webhooks → Add New Webhook
2. URL: `https://api.retilo.com/v1/integrations/webhook/razorpay`
3. Check events: `payment.captured`, `payment.failed`, `order.paid`, `refund.processed`
4. Copy the Webhook Secret shown (one-time) → Retilo `connect` config

---

#### POST `/v1/integrations/webhook/phonepe`

**Developer Console:** `https://developer.phonepe.com` → Business Dashboard → Webhooks

**What PhonePe sends:**
- `PAYMENT_SUCCESS` — UPI/wallet payment captured
- `PAYMENT_FAILURE` — payment failed
- `REFUND_SUCCESS` — refund processed

**Signature verification:** `X-VERIFY` header = SHA256(`base64(body)` + `/v1/integrations/webhook/phonepe` + salt) + `###` + saltIndex.

**Console setup steps:**
1. `business.phonepe.com` → Developers → Webhook Settings
2. Set callback URL: `https://api.retilo.com/v1/integrations/webhook/phonepe`
3. Set `s2s` (server-to-server) callback: same URL
4. Copy Salt Key + Salt Index → Retilo `connect` config

---

#### POST `/v1/integrations/webhook/practo`

For clinics using Practo for appointment management.

**Developer Console:** `https://developer.practo.com` → App Dashboard → Webhooks (requires Practo Technology Partner approval)

**What Practo sends:**
- `appointment.booked` — new appointment
- `appointment.confirmed` — confirmed by clinic
- `appointment.cancelled` — cancelled by patient or clinic
- `appointment.completed` — visit happened
- `appointment.no_show` — patient didn't arrive (critical signal)

**Signature verification:** `X-Practo-Webhook-Signature` header, HMAC-SHA256 of body with partner secret.

**Console setup steps:**
1. Apply at `developer.practo.com` → Partner Program
2. Once approved: App Settings → Webhooks → Add URL
3. URL: `https://api.retilo.com/v1/integrations/webhook/practo`
4. Copy signing secret → Retilo `connect` config

---

#### POST `/v1/integrations/webhook/generic`

For any POS, billing software, or custom system that isn't natively supported. The caller pushes Retilo's normalized event schema directly.

**Auth:** `X-Retilo-Webhook-Key: <key from connect endpoint>` (HMAC-SHA256 not required — key in header is sufficient for generic)

**Body:** Retilo Retail Event Schema (see above) — the `type` and `payload` fields are required. `raw` is optional.

```json
{
  "type": "order.placed",
  "channel": "dine-in",
  "occurredAt": "2026-05-07T14:30:00.000Z",
  "payload": {
    "orderId": "ORD-001",
    "amount": 650,
    "currency": "INR",
    "items": [{ "name": "Paneer Tikka", "qty": 1, "price": 350 }],
    "customerPhone": "+919876543210",
    "tableId": "T-04"
  }
}
```

---

### Universal Ingest Endpoint

#### POST `/v1/integrations/ingest`

For SDK-based push or batch historical upload. Same as `/webhook/generic` but JWT-authenticated (not key-based) and accepts an array for bulk ingest.

**Headers:** `Authorization: Bearer <jwt>`

**Body:**
```json
{
  "events": [
    {
      "type": "order.placed",
      "channel": "dine-in",
      "occurredAt": "2026-05-07T14:30:00.000Z",
      "locationId": "uuid",
      "payload": { ... }
    }
  ]
}
```

Max 500 events per request. Events are queued and processed async.

**Response `202`:**
```json
{ "code": 202, "data": { "queued": 47 } }
```

---

### External Signal Integrations (pull-based, no webhook)

These are not merchant-configured — Retilo pulls them automatically as background signals for the Demand Forecasting Engine.

| Signal | Source | API | Key |
|--------|--------|-----|-----|
| Weather forecast | OpenWeatherMap | `api.openweathermap.org/data/3.0/forecast` | `OPENWEATHER_API_KEY` env var |
| Local events | BookMyShow (unofficial scrape) | Internal scraper | — |
| Public holidays | `date.nager.at/api/v3/publicholidays/IN` | Free, no key | — |
| Competitor data | Google Places API | Already used in business-report module | `GOOGLE_PLACES_API_KEY` |

These signals are aggregated per `(city, date)` and stored in the `demand_signals` table, consumed by the Forecasting Engine on every prediction run.

---

### Integration Source Summary

| Source | Type | Vertical | Console URL | Partner Approval Needed |
|--------|------|----------|-------------|------------------------|
| PetPooja | POS | Restaurant | `developer.petpooja.com` | No — self-serve |
| Posist | POS (enterprise) | Restaurant/QSR | `partners.posist.com` | Yes — email required |
| Swiggy | Delivery + Reviews | Restaurant | `partner.swiggy.com` | Yes — restaurant partner |
| Zomato | Delivery + Reviews | Restaurant | `zomato.com/developer` | Yes — tech partner program |
| Razorpay | Payments | All | `dashboard.razorpay.com` | No — self-serve |
| PhonePe | Payments (UPI) | All | `developer.phonepe.com` | No — self-serve |
| Practo | Appointments | Clinic | `developer.practo.com` | Yes — partner program |
| Generic | Any (SDK/manual) | All | — | No |

---

## 18. Location Intelligence `JWT required`

**The neighbourhood brain.** Given a merchant location, Retilo fetches every relevant POI within the catchment, classifies it, scores the location, and produces actionable insights — what's around you, who your real competitors are, where the foot traffic comes from, and when the area is busiest.

This is the data signal that powers hyper-local demand forecasting (more merchants in the same neighbourhood = sharper signal — the network-effect moat).

---

### How it works

```
1. Resolve location (Google Place ID → coords, or accept lat/lng directly)
2. Fetch nearby POIs via Google Places Nearby Search (parallel calls for
   competitor types and demand-driver types)
3. Classify:
     • Direct competitors  (same business type as merchant)
     • Indirect competitors (related types)
     • Demand drivers      (transit, mall, hospital, education, hotel,
                            entertainment, tourism, retail anchor)
4. Score:
     • Competition density  = direct competitors per km²
     • Driver score (0-100) = weighted sum of drivers, distance-decayed,
                              capped per category
     • Opportunity score    = driver_score − competition_penalty
                              + quality_gap_bonus
5. Bucket into pointy-top hex cells (~460m wide, ~H3 res 8 equivalent)
   for map visualization
6. Infer area profile (high-density commercial / tourist / campus /
   medical district / transit corridor / residential mixed) and peak
   dayparts
7. Generate prioritized insights (verdict, competition, opportunity,
   driver callouts, timing)
```

### Catchment radius defaults (auto-selected by `categoryHint`)

| Category | Default radius |
|----------|---------------|
| `cafe`, `bakery` | 800 m |
| `restaurant`, `bar`, `pharmacy`, `grocery` | 1500 m |
| `salon` | 2000 m |
| `gym` | 2500 m |
| `retail` | 3000 m |
| `clinic` | 3500 m |

Override with `radiusMeters` (200–10000).

---

### POST `/v1/location-intelligence/scan`

Run a neighbourhood scan and persist the result. Synchronous (typically completes in 1-3 seconds — two Google Places calls).

**Body — using a Place ID (preferred):**
```json
{
  "placeId": "ChIJbU60yXAWrjsR4E9-UejD3_g",
  "categoryHint": "cafe",
  "radiusMeters": 1200
}
```

**Body — using raw coords:**
```json
{
  "lat": 12.9716,
  "lng": 77.5946,
  "name": "Sip & Eat Cafe",
  "categoryHint": "cafe"
}
```

**Required:** either `placeId` OR (`lat` + `lng`).
**Optional:** `categoryHint`, `radiusMeters`, `name`.

`categoryHint` values: `restaurant`, `cafe`, `bar`, `bakery`, `clinic`, `salon`, `pharmacy`, `grocery`, `retail`, `gym`. Defaults to restaurant-style competitor matching when omitted.

**Response `201`:**
```json
{
  "code": 201,
  "data": {
    "id": "uuid",
    "merchantId": "uuid",
    "placeId": "ChIJ...",
    "name": "Sip & Eat Cafe",
    "address": "MG Road, Bengaluru",
    "location": { "latitude": 12.9716, "longitude": 77.5946 },
    "categoryHint": "cafe",
    "radiusMeters": 1200,
    "scores": {
      "opportunity": 64,
      "driver": 78,
      "competitionDensity": 5.6
    },
    "competitors": {
      "direct": [
        {
          "placeId": "ChIJ...",
          "name": "Third Wave Coffee",
          "primaryType": "cafe",
          "rating": 4.4,
          "userRatingsTotal": 812,
          "priceLevel": 2,
          "distance": 180,
          "lat": 12.9720, "lng": 77.5942
        }
      ],
      "indirect": [ /* food-adjacent but not direct */ ]
    },
    "demandDrivers": [
      {
        "placeId": "ChIJ...",
        "name": "MG Road Metro",
        "category": "transit",
        "weight": "high",
        "footfallEstimate": "5K-15K",
        "score": 25,
        "distance": 340,
        "lat": 12.9750, "lng": 77.5970
      }
    ],
    "hexGrid": {
      "origin": "h_0_0",
      "hexSize": 230,
      "cells": [
        {
          "hexId": "h_-1_2",
          "count": 4,
          "polygon": [{ "lat": ..., "lng": ... }, ... 6 points],
          "items": [ /* POIs in this hex */ ]
        }
      ]
    },
    "areaProfile": {
      "type": "high_density_commercial",
      "footfallBand": "high",
      "peakDayparts": ["lunch (12:30-2:30)", "evening (6:30-9:30)"],
      "driverCounts": { "transit": 1, "mall": 1, "retail_anchor": 2 }
    },
    "insights": [
      {
        "type": "verdict",
        "severity": "info",
        "title": "Opportunity Score: 64/100",
        "detail": "Decent location with execution risk — niche down to win."
      },
      {
        "type": "competition",
        "severity": "high",
        "title": "High competition zone — 14 direct competitors nearby",
        "detail": "Density of 12.4 competitors/km². Differentiate hard on cuisine, ambience, or pricing — generic positioning will not survive here."
      },
      {
        "type": "driver",
        "severity": "high",
        "title": "Transit hub — MG Road Metro (340m)",
        "detail": "Estimated 5K-15K daily footfall. Time your menu/offers to peaks driven by this anchor."
      },
      {
        "type": "timing",
        "severity": "info",
        "title": "Peak windows for a high density commercial area",
        "detail": "Concentrate staff, prep, and offers around: lunch (12:30-2:30) · evening (6:30-9:30)."
      }
    ],
    "createdAt": "2026-05-07T..."
  }
}
```

**Error responses:**
- `400` — missing `placeId` and lat/lng, or `radiusMeters` out of range
- `500` — `GOOGLE_PLACES_API_KEY` not configured, or upstream Places API failure

---

### GET `/v1/location-intelligence/scans`

List recent scans for the merchant. Compact form — no rich payloads.

**Query:** `limit` (default 20, max 100)

**Response `200`:**
```json
{
  "code": 200,
  "data": [
    {
      "id": "uuid",
      "name": "Sip & Eat Cafe",
      "address": "MG Road, Bengaluru",
      "location": { "latitude": 12.9716, "longitude": 77.5946 },
      "categoryHint": "cafe",
      "radiusMeters": 1200,
      "scores": { "opportunity": 64, "driver": 78, "competitionDensity": 5.6 },
      "createdAt": "..."
    }
  ]
}
```

---

### GET `/v1/location-intelligence/scans/:id`

Fetch the full scan payload (same shape as the POST response).

**Response `200`:** full scan object
**Response `404`:** scan not found or belongs to another merchant

---

### Score reference

| Score | Range | Meaning |
|-------|-------|---------|
| `opportunity` | 0-100 | Composite: driver score − competition penalty + quality-gap bonus |
| `driver` | 0-100 | Demand-driver intensity (distance-weighted, per-category capped) |
| `competitionDensity` | float | Direct competitors per km² in the catchment |

**Verdict bands:** ≥70 = strong location · 50–69 = decent with execution risk · 30–49 = marginal · <30 = weak signal.

---

### Demand driver categories

| Category | Weight | Typical types | Footfall estimate |
|----------|--------|---------------|-------------------|
| `transit` | high | metro/train/bus stations | 5K-15K/day |
| `mall` | high | shopping_mall | 10K-25K/day |
| `tourist` | high | tourist_attraction, museum | varies |
| `retail_anchor` | medium | department_store, supermarket | 2K-8K/day |
| `hospital` | medium | hospital | 2K-6K/day |
| `education` | medium | university, school | 1K-5K/day |
| `entertainment` | medium | movie_theater, stadium | 1K-4K/day |
| `hotel` | medium | lodging | 0.5K-2K/day |
| `park` | low | park | 0.5K-2K/day |
| `fitness` | low | gym, fitness_center | 0.2K-1K/day |

---

### Area profile types

`high_density_commercial` · `commercial` · `tourist_zone` · `campus_adjacent` · `medical_district` · `transit_corridor` · `residential_mixed`

Each type has its own peak-daypart pattern that drives the timing insights.

---

### Hex grid

The response includes a hex-bucketed view of the surrounding POIs in `hexGrid.cells`. Each cell has:
- `hexId` — internal axial-coordinate ID (e.g. `h_-1_2`)
- `count` — number of POIs in the cell
- `polygon` — six lat/lng vertices (ready for `Polygon` overlay on Google Maps / Mapbox / Leaflet)
- `items` — POIs inside the cell with `kind` = `competitor_direct | competitor_indirect | driver_<category>`

Cell width is ~460 m (apothem 230 m), comparable to H3 resolution 8. Pure JavaScript — no native bindings, no dependency on `h3-js`.

---

## 19. Demand Signals `JWT required`

External factors that drive retail demand — weather, public holidays, Indian festivals, cricket matches, movie releases — fused into a per-day, per-location **composite demand multiplier** with explainable drivers.

This is the second pillar of the Yield Management Engine (the first is Location Intelligence, Section 18). Where Location Intelligence answers *"what's around me?"*, Demand Signals answers *"what's coming on each upcoming day, and how should I prep?"*.

---

### Research foundation

The signal weighting and impact magnitudes are calibrated against published research:

| Source | Influence on the model |
|---|---|
| [arXiv:1711.08325](https://arxiv.org/abs/1711.08325) — Walmart weather-sensitive products | Temperature + precipitation are the primary weather features for retail forecasting |
| [arXiv:2405.13995](https://arxiv.org/html/2405.13995v1) — World events → e-commerce demand | Sports / cultural events drive the largest forecast errors when ignored — explicitly modelled here as cricket + festival overrides |
| [arXiv:2506.05941](https://arxiv.org/abs/2506.05941) — Modern ML for retail forecasting | Calendar effects + competitor count + holidays are top-importance features; XGBoost > deep learning for tabular retail data |
| [aimspress 2025](https://www.aimspress.com/article/doi/10.3934/aci.2025011?viewType=HTML) — University restaurant flow | Top features for restaurant demand: prev-day count, holidays, day-of-week, weather |
| [McKinsey](https://www.mckinsey.com/industries/consumer-packaged-goods/our-insights/ensuring-high-service-levels-to-meet-high-consumer-demand-volatility) — Demand sensing | AI demand sensing reduces forecast error by 20–50%; weather + POS + foot-traffic are the canonical inputs |

---

### Signal sources & impact magnitudes

| Signal | Source | Effect on dine-in demand |
|---|---|---|
| Weekend (Sat/Sun) | Computed | +10% to +25% |
| Mon–Thu baseline | Computed | −5% to −15% |
| Public holiday | date.nager.at | +30% to +60% |
| Religious festival (peak) | Curated calendar | +40% to +80% (Diwali, Eid, Christmas) |
| Heavy rain (>10mm/day) | OpenWeatherMap | −30% (delivery: +30%) |
| Extreme weather (thunderstorm, gale) | OpenWeatherMap | −55% |
| Heatwave (>40°C) | OpenWeatherMap | −15% (cafes/bars: +25%) |
| Cold snap (<10°C) | OpenWeatherMap | −8% |
| Cricket knockout match (India) | Curated cricket schedule | dine-in −25% (bars: +50%) |
| Cricket regular match | Curated cricket schedule | dine-in −10% |
| Major movie release weekend | Curated calendar | +15% (mall-adjacent restaurants) |

---

### Composite multiplier

```
composite = clamp(weekday × weather × holiday × event, 0.1, 3.0)
```

Multipliers are **multiplicative** (not additive) — a Saturday + heavy rain + Eid don't all stack additively, they interact. The clamp prevents pathological compounding.

`confidence` is 0..1 — lower when weather is missing or no signals fire.

---

### POST `/v1/demand-signals/refresh`

Recompute and persist the demand index window for the merchant's location. Pulls weather + holidays + festivals + events in parallel, builds the daily index for each upcoming day, and upserts into `daily_demand_index`.

**Body:**
```json
{
  "lat": 12.9716,
  "lng": 77.5946,
  "categoryHint": "restaurant",
  "days": 7,
  "locationId": "outlet-a",
  "countryCode": "IN"
}
```

**Required:** `lat`, `lng` (numbers).
**Optional:** `categoryHint` (default `restaurant`), `days` (1–14, default 7), `locationId`, `countryCode` (default `IN`).

**Response `201`:** Array of daily index entries (same shape as `/forecast`).

---

### GET `/v1/demand-signals/forecast?days=7&locationId=`

Read the next N days from the cached index. If a date hasn't been refreshed, it won't appear — call `/refresh` first or schedule a daily refresh.

**Query:** `days` (1–14, default 7), `locationId` (optional).

**Response `200`:**
```json
{
  "code": 200,
  "data": [
    {
      "date": "2026-05-08",
      "location": { "latitude": 12.9716, "longitude": 77.5946 },
      "factors": {
        "weekday": 1.15,
        "weather": 0.88,
        "holiday": 1.0,
        "event":   1.0
      },
      "compositeMultiplier": 1.012,
      "confidence": 0.85,
      "drivers": [
        { "type": "weekday", "signal": "Friday",  "factor": 1.15, "impact": "+15%", "magnitude": 0.15 },
        { "type": "weather", "signal": "rain (3.2mm)", "factor": 0.88, "impact": "-12%", "magnitude": 0.32, "condition": "Rain" }
      ],
      "recommendation": "Roughly normal day. Run baseline staffing and prep.",
      "updatedAt": "2026-05-07T18:00:00Z"
    },
    {
      "date": "2026-06-07",
      "factors": { "weekday": 0.85, "weather": 1.03, "holiday": 1.595, "event": 1.0 },
      "compositeMultiplier": 1.396,
      "confidence": 0.85,
      "drivers": [
        { "type": "holiday", "signal": "Eid al-Adha", "factor": 1.595, "impact": "+60%", "magnitude": 0.85 },
        { "type": "weather", "signal": "pleasant (29°C)", "factor": 1.03, "impact": "+3%",  "magnitude": 0.2 },
        { "type": "weekday", "signal": "Sunday",   "factor": 1.10, "impact": "+10%", "magnitude": 0.10 }
      ],
      "recommendation": "Big day — Eid al-Adha. Pre-stock perishables 30-40% above norm and run full staffing. Pre-confirm reservations."
    }
  ]
}
```

---

### GET `/v1/demand-signals/today?locationId=`

Convenience — returns just today's index, or `null` with a hint to call `/refresh` first.

---

### GET `/v1/demand-signals/calendar?days=30&countryCode=IN`

A pure calendar view — public holidays, Indian festivals, cricket matches, movie releases — for the next N days. Doesn't require `/refresh` to have run.

**Query:** `days` (1–90, default 30), `countryCode` (default `IN`).

**Response `200`:**
```json
{
  "code": 200,
  "data": [
    { "date": "2026-05-26", "name": "IPL Final 2026",        "type": "cricket_knockout", "intensity": 1.0 },
    { "date": "2026-06-07", "name": "Eid al-Adha",           "type": "festival",         "intensity": 0.85 },
    { "date": "2026-08-15", "name": "Independence Day",      "type": "public_holiday",   "intensity": 0.6 }
  ]
}
```

---

### Driver types in responses

| `type` | Meaning |
|---|---|
| `weekday` | Day-of-week baseline factor |
| `weather` | Weather-condition factor (rain, heat, cold, extreme, pleasant) |
| `holiday` | Public holiday OR festival (whichever has stronger impact wins for the day) |
| `event` | Cricket / movie / concert / curated event |

Each driver carries `signal` (human-readable label), `factor` (multiplier), `impact` (formatted percentage like `+45%`), and `magnitude` (0..1 strength used for sorting).

---

### Operational notes

- **`OPENWEATHER_API_KEY` env var** — required for weather signals. If unset, weather defaults to factor `1.0` and `confidence` is reduced.
- **No key needed for holidays** — `date.nager.at` is free, public.
- **Festival + cricket calendars are seeded** in `holiday-provider.service.js` and `event-provider.service.js`. Extend them yearly. Production will swap to a CMS or partner feed.
- **Refresh cadence:** call `POST /refresh` once daily per merchant location (a Trigger.dev cron is the right home for this — not yet wired).
- **Network effect:** once multiple merchants in the same hex run refreshes, they share the same upstream weather/event data — cost per merchant decreases with scale.

---

### v1.6.0 — 2026-06-08

**Grow: zero-friction auto-onboard** (Section 20)

| Change | Type | Detail |
|--------|------|--------|
| `POST /v1/grow/onboard/auto` | ✅ New | Guest onboard — accepts any business input (Maps URL / website / plain text) + email; auto-resolves context, creates Merchant + grow_profile, returns JWT. No prior auth needed. |

---

### v1.5.0 — 2026-06-03

**New module: Grow (internal — OpenClaw)** (Section 20)

| Change | Type | Detail |
|--------|------|--------|
| `POST /v1/internal/grow/run` | ✅ New | Run a harvest→score→enrich cycle for a profile; returns enriched signals + `runId` for approval. Internal (no JWT). |
| `POST /v1/internal/grow/approve` | ✅ New | Resume a run by `runId` and send the approved signal indexes. Internal (no JWT). |
| `GET /v1/internal/grow/status` | ✅ New | Cumulative grow metrics (totals, sent, converted, conversion rate, per-profile). Internal (no JWT). |
| `POST /v1/internal/grow/autonomous` | ✅ New | Toggle Phase 2 autonomous mode (+ optional auto-approve threshold) for a profile. Internal (no JWT). |

**What it does:** A profile-aware growth agent (`src/modules/grow/`) that harvests warm leads from GitHub/HN/Reddit, scores them with Claude Haiku, drafts outreach with Claude Opus, and sends after approval (Telegram digest in Phase 1, auto-approve in Phase 2). These four endpoints are the OpenClaw integration surface — mounted **before** the JWT middleware in `src/config/express.js` (same pattern as the voice internal tools), so they require no merchant token. Keep them bound to localhost at the network layer.

---

## Error codes

| Code | Meaning |
|------|---------|
| 400 | Bad request / missing required field |
| 401 | Missing or invalid JWT / tool secret |
| 403 | Forbidden — resource belongs to another merchant |
| 404 | Resource not found |
| 500 | Internal server error |
