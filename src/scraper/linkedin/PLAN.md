# LinkedIn Scraper — Implementation Plan

> One-click "Sift" to import job applications from LinkedIn into Siftly.

## 1. Overview

The LinkedIn scraper is a **browser extension content script** that extracts structured job data from LinkedIn job pages. It runs on `linkedin.com/jobs/view/*` and injects a floating "Sift" button. When clicked, it extracts the current job's details, normalizes them into a Siftly `JobApplication` object, and sends them to the dashboard via Chrome messaging.

### Design Principles

- **User-initiated only** — never auto-navigate or auto-scrape. Only fires on explicit button click.
- **Session-based** — uses the user's existing LinkedIn session, no separate login.
- **Fault-tolerant** — DOM selectors break frequently; every field has fallback logic.
- **Privacy-first** — no data leaves the browser unless the user has cloud sync enabled.

---

## 2. Architecture

```
┌─────────────────────────────────────┐
│         LinkedIn Job Page           │
│  ┌───────────────────────────────┐  │
│  │   Content Script              │  │
│  │   ┌──────────────────────┐    │  │
│  │   │ DOM Extraction       │    │  │
│  │   │ (selectors.ts)       │    │  │
│  │   └──────────┬───────────┘    │  │
│  │              │                │  │
│  │   ┌──────────▼───────────┐    │  │
│  │   │ Normalizer           │    │  │
│  │   │ (normalizer.ts)      │    │  │
│  │   └──────────┬───────────┘    │  │
│  └──────────────┼────────────────┘  │
│                 │ chrome.runtime    │
│  ┌──────────────▼────────────────┐  │
│  │   Background Script           │  │
│  │   (messageHandler.ts)         │  │
│  │   → StorageAdapter.upsert()   │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 3. Data Extraction Strategy

### Target Selectors (subject to LinkedIn DOM changes)

| Field | Primary Selector | Fallback Strategy |
|---|---|---|
| **Company** | `.job-details-jobs-unified-top-card__company-name` | URL parsing, `<meta>` tags |
| **Position** | `.job-details-jobs-unified-top-card__job-title` | `<title>` parsing |
| **Location** | `.job-details-jobs-unified-top-card__bullet` | Heuristic city/country search |
| **Description** | `#job-details` | `.jobs-description__content` |
| **Salary** | `.job-details-jobs-unified-top-card__job-insight` | Regex (`/\$[\d,]+[kK]?/g`) |
| **Employment Type** | `.job-details-jobs-unified-top-card__job-insight` | Keyword matching |
| **Work Type** | `.job-details-jobs-unified-top-card__workplace-type` | Keyword matching (remote/hybrid/onsite) |
| **Posted Date** | `.jobs-unified-top-card__posted-date` | Relative date parsing |
| **Company Logo** | `.artdeco-entity-image img` | Company favicon |

### Selector Maintenance

Selectors **will** break as LinkedIn updates their UI. The strategy:

1. Version selectors in `selectors.ts` with a `SELECTOR_VERSION` constant.
2. Log warnings when a primary selector fails and a fallback is used.
3. Return `null` for fields that can't be extracted (never block the whole extraction).

---

## 4. Normalization Logic

The normalizer (`normalizer.ts`) maps raw extracted strings → `JobApplication`:

- **Location parsing**: Split "Mountain View, CA, United States" → `{ city: "Mountain View", country: "US" }`
- **Salary parsing**: Handle ranges ("$120K – $180K/yr"), currencies (€, £, $), and periods
- **Date parsing**: Convert relative dates ("2 weeks ago") to ISO format
- **Work type inference**: Look for keywords: "remote", "hybrid", "on-site"
- **Description cleanup**: Strip HTML, preserve markdown-like structure

---

## 5. Security & Rate Limiting

> [!WARNING]
> LinkedIn actively detects and blocks automated scraping.

Rules:
- ❌ Never auto-navigate between pages
- ❌ Never make background HTTP requests to LinkedIn
- ✅ Only extract from the currently visible DOM
- ✅ Only trigger on explicit user click
- ✅ Add random delay (100–500ms) before extraction to appear natural
- ✅ Rate-limit: max 1 extraction per 5 seconds

---

## 6. UI Integration

### Floating Action Button (FAB)
- Small Siftly icon positioned at the bottom-right of the job detail pane
- Appears only on `linkedin.com/jobs/view/*` URLs
- Tooltip: "Save to Siftly"
- Loading spinner during extraction
- Success/error feedback via color change + tooltip

### Dashboard Integration
- Toast notification when a new application is imported
- Duplicate detection: warn if the same job URL already exists
- "Review Import" step: show extracted data for user to verify before saving

---

## 7. Implementation Phases

### Phase A — Foundation (MVP)
1. Content script that detects LinkedIn job pages
2. Inject floating Siftly button
3. Extract company name + position title to console
4. Basic message bridge to background script

### Phase B — Full Extraction
1. Implement all field extractors with fallbacks
2. Normalizer with location/salary/date parsing
3. Save to StorageAdapter via background script
4. Duplicate detection

### Phase C — Polish
1. "Review Import" modal in dashboard
2. Error handling + user feedback
3. Selector versioning + update mechanism
4. Unit tests for normalizer

---

## 8. Testing Strategy

- **Unit tests**: Normalizer functions (salary parsing, location splitting, date conversion)
- **Snapshot tests**: Save sample LinkedIn DOM snippets, verify extraction output
- **Integration**: End-to-end flow from content script → background → storage
- **Manual**: Test on live LinkedIn pages across different job types and countries

---

## 9. Known Risks

| Risk | Mitigation |
|---|---|
| LinkedIn DOM changes | Fallback selectors, version tracking, easy update path |
| Account flagging | User-initiated only, no automated actions |
| Dynamic rendering (React) | Use MutationObserver to wait for DOM ready |
| CSP restrictions | Content scripts run in isolated world, not affected |
| Rate limiting | Max 1 extraction / 5 seconds |
