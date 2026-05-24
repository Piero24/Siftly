---
sidebar_position: 11
---

# LinkedIn Scraper — Technical Guide

This document covers the internal architecture, bundling constraints, and extension points for the LinkedIn job scraper subsystem.

## Architecture

```
┌─────────────────────────────────────────────────┐
│              LinkedIn Job Page                  │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │  contentScript.ts (IIFE, injected)        │  │
│  │                                           │  │
│  │  ┌─────────────┐   ┌──────────────────┐  │  │
│  │  │ DOM Extract │──►│ chrome.runtime   │  │  │
│  │  │ (selectors) │   │ .sendResponse()  │  │  │
│  │  └─────────────┘   └───────┬──────────┘  │  │
│  └────────────────────────────┼──────────────┘  │
│                               │                 │
│  ┌────────────────────────────▼──────────────┐  │
│  │  Background Script                        │  │
│  │  messageHandler.ts                        │  │
│  │                                           │  │
│  │  ┌──────────────┐   ┌─────────────────┐  │  │
│  │  │ normalizer   │──►│ StorageAdapter  │  │  │
│  │  │ .ts          │   │ .upsert()       │  │  │
│  │  └──────────────┘   └─────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**Flow:**

1. User clicks "Scrape Job Portal" in the popup.
2. The popup sends a `SIFT_SCRAPE_PAGE` message via `chrome.runtime.sendMessage`.
3. The background script (`messageHandler.ts`) injects `linkedinScraper.js` into the active tab via `chrome.scripting.executeScript`.
4. The content script (`contentScript.ts`) extracts raw data from the LinkedIn DOM and responds via `sendResponse`.
5. The background script passes the raw data through `normalizer.ts` to produce a partial `FormState`.
6. The popup receives the normalized data and pre-fills the application form.

## File Structure

```
src/scraper/linkedin/
├── constants.json        # Single source of truth for selectors, keywords, blacklists
├── contentScript.ts      # DOM extraction logic (bundled as linkedinScraper.js)
├── messageHandler.ts     # Background script message routing + tab injection
├── normalizer.ts         # Raw data → FormState transformation
├── normalizer.test.ts    # Unit tests for normalizer (23 tests)
├── types.ts              # RawLinkedInJob interface definition
└── PLAN.md               # Original implementation plan (historical reference)
```

## Bundling Constraints

### Why `contentScript.ts` Cannot Import Shared Modules

Chrome Extension content scripts are loaded as a single file via `chrome.scripting.executeScript`. If Vite detects a shared import with other entries (background, popup, dashboard), it extracts the shared code into a **separate chunk**. The content script runtime has no mechanism to load that chunk, causing:

```
GET chrome-extension://invalid/ net::ERR_FAILED
```

**Rule:** `contentScript.ts` must only use `import type` (erased at compile time) — never value imports from shared modules.

### Why the IIFE Wrapper

The content script is wrapped in an **Immediately Invoked Function Expression** (IIFE) with a global guard:

```typescript
(() => {
  if (window.__SIFT_SCRAPER_INJECTED__) return;
  window.__SIFT_SCRAPER_INJECTED__ = true;
  // ... all logic here
})();
```

Without this, re-injecting the script (e.g., when the user clicks the extension icon again on the same tab) would cause:

```
Uncaught SyntaxError: Identifier 'X' has already been declared
```

All `const` declarations must live inside the IIFE scope to avoid this.

### Build-Time Constants via `define`

The `constants.json` file contains all selectors, translation dictionaries, and domain blacklists. It's consumed differently by the two entry points:

| Consumer                     | Import Method                              | Why                                                                                                                               |
| ---------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `normalizer.ts` (background) | `import constants from './constants.json'` | Standard ES module — Vite handles it normally                                                                                     |
| `contentScript.ts` (content) | `JSON.parse(__SCRAPER_CONSTANTS_RAW__)`    | Vite's `define` in `vite.config.ts` replaces the identifier with a string literal at build time — no top-level `const` is emitted |

The `define` configuration in `vite.config.ts`:

```typescript
import { readFileSync } from 'node:fs';

const scraperConstantsJson = readFileSync('./src/scraper/linkedin/constants.json', 'utf-8');

export default defineConfig({
  define: {
    __SCRAPER_CONSTANTS_RAW__: JSON.stringify(scraperConstantsJson),
  },
  // ...
});
```

## Constants Management

All scraper configuration lives in a single file: [`constants.json`](https://github.com/Piero24/Siftly/blob/main/src/scraper/linkedin/constants.json).

### Structure

| Key                  | Purpose                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------- |
| `SELECTORS`          | CSS selectors for each job field (primary + fallback)                                       |
| `employmentTypeData` | Multi-language keywords grouped by type: `permanent`, `intern`, `fixed-term`                |
| `workTypeData`       | Multi-language keywords grouped by type: `remote`, `hybrid`, `onsite`                       |
| `corporateBlacklist` | Domains to exclude when searching for company websites (e.g., `linkedin.com`, `google.com`) |
| `socialDomains`      | Social media domains to deprioritize (e.g., `twitter.com`, `github.com`)                    |

### Adding a New Translation

To support a new language for employment type or work type detection:

1. Open `src/scraper/linkedin/constants.json`.
2. Add the localized keyword to the appropriate array (e.g., `employmentTypeData.permanent`).
3. Both `contentScript.ts` and `normalizer.ts` will automatically pick up the change — no code modifications needed.

### Adding a New Extracted Field

1. Add the raw field to `RawLinkedInJob` in `types.ts`.
2. Add an extractor function in `contentScript.ts` (inside the IIFE).
3. Call the extractor from `extractJobData()` and assign it to the new field.
4. Add normalization logic in `normalizer.ts` → `normalizeToFormState()`.
5. Add unit tests in `normalizer.test.ts`.

## Multi-Language Location Resolution

The normalizer uses the [`i18n-iso-countries`](https://www.npmjs.com/package/i18n-iso-countries) library with **30+ locale packs** registered at module load. This allows `resolveCountryCode()` to match country names in any language:

- `"Italia"` → `IT`
- `"Allemagne"` → `DE`
- `"Estados Unidos"` → `US`

The resolution strategy:

1. Direct ISO-2 code match (e.g., `"US"`)
2. Exact name lookup across all registered locales
3. Fuzzy partial match (normalized, accent-stripped)

## Testing

The normalizer has **23 unit tests** covering:

- Location parsing (multi-part, parenthetical work types, various delimiters)
- Work type inference (all categories, multi-language, precedence rules)
- Employment type inference (all categories, multi-language)
- Edge cases (empty input, unknown keywords, fallback defaults)

Run tests:

```bash
npm run test:run -- src/scraper/linkedin/normalizer.test.ts
```
