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

For the documentation site:

```bash
cd documentation && npm install && cd ..
```

## Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Supabase (optional — leave defaults for local-only mode)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key-here
VITE_SUPABASE_SECRET_KEY=your-secret-key-here

# Enable debug mode for development
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
npm run test:run        # Unit tests
npm run test:coverage   # Tests with coverage
npm run format:check    # Prettier formatting
npx tsc --noEmit        # TypeScript type check
```
