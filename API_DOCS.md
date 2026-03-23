# Retilo Backend — API Reference

**Base URL:** `https://api.retilo.com` (or `http://localhost:<PORT>` locally)

All responses follow the shape:
```json
{ "code": 200, "data": { ... } }
```
Errors return `{ "code": 4xx|5xx, "message": "..." }`.

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
| 500 | Internal server error |
