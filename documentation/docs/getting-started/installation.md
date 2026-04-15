---
sidebar_position: 1
---

# Installation

## Prerequisites

- **Node.js** 20 or later
- **npm** 10 or later
- **Git**

## Clone the Repository

```bash
git clone https://github.com/Piero24/Siftly.git
cd Siftly
```

## Install Dependencies

```bash
npm install --legacy-peer-deps
```

### Why `--legacy-peer-deps`?

Siftly currently pins dependency versions that can trigger npm peer-resolution conflicts on strict installs. The project CI uses the same compatibility mode (`npm ci --legacy-peer-deps`), so using `--legacy-peer-deps` locally keeps your environment aligned with CI and avoids `ERESOLVE` failures.

Use plain `npm install` only if peer-resolution is fully clean for the current lockfile and CI workflow has been updated accordingly.

For the documentation site:

```bash
cd documentation && npm install --legacy-peer-deps && cd ..
```

## Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# ─── Supabase ─────────────────────────────────────────────
# Get these from: https://app.supabase.com → Project Settings → API
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key-here
SUPABASE_DB_PASSWORD=your-db-password-here

# ─── Local-only mode ─────────────────────────────────────
# Set to "true" to allow users to skip login and use local Server SQLite storage.
# Typically only enabled for self-hosted Docker deployments.
VITE_ALLOW_LOCAL_ONLY=false
VITE_DEBUG_MODE=true

```

## Run Locally

### Extension mode (default)

```bash
npm run dev
```

### Web mode (self-hosted)

```bash
npm run dev:web
```

### With debug toolbar

```bash
VITE_DEBUG_MODE=true npm run dev:web
```

### Documentation site

```bash
npm run docs:dev
```

## Build

```bash
npm run build           # Chrome extension
npm run build:web       # Web (Docker) target
npm run docs:build      # Documentation site
```

## Run Checks

```bash
npm run test:run        # Unit tests (all)
npm run test:coverage   # Tests with coverage report
npm run test:api        # API server tests only
npm run test:storage    # Storage adapter tests only
npm run format:check    # Verify Prettier formatting
npm run format          # Auto-fix Prettier formatting
npm run lint            # Alias for format:check
npx tsc --noEmit        # TypeScript type check
```

## Full CI Parity Commands

To run the same checks as GitHub Actions before pushing:

```bash
npm ci --legacy-peer-deps
npm run format:check
npx tsc --noEmit
npm run test:coverage
npm run build:web
npm run build:extension
cd documentation && npm ci --legacy-peer-deps && npm run build && cd ..
```

This mirrors the current workflow behavior in `.github/workflows/ci.yml`.
