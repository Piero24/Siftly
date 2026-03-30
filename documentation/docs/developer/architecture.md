---
sidebar_position: 1
---

# Architecture

Siftly follows a modular architecture designed to run as both a Chrome extension and a standalone web app from a single codebase.

## High-Level Overview

```
┌──────────────────────────────────────────────────────┐
│                    Entrypoints                       │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐  │
│  │  Popup   │  │   Web    │  │  Background Script │  │
│  │  (ext)   │  │  (web)   │  │  (ext)             │  │
│  └────┬─────┘  └────┬─────┘  └────────────────────┘  │
│       │              │                               │
│  ┌────▼──────────────▼──────┐                        │
│  │     React App (shared)   │                        │
│  │  ┌─────────────────────┐ │                        │
│  │  │ Context Providers   │ │                        │
│  │  │ Auth│Settings│UI│...│ │                        │
│  │  └─────────┬───────────┘ │                        │
│  │  ┌─────────▼───────────┐ │                        │
│  │  │ Components + Hooks  │ │                        │
│  │  └─────────┬───────────┘ │                        │
│  │  ┌─────────▼───────────┐ │                        │
│  │  │ Storage Adapter     │ │                        │
│  │  │ (Local│Remote│Both) │ │                        │
│  │  └─────────────────────┘ │                        │
│  └──────────────────────────┘                        │
└──────────────────────────────────────────────────────┘
```

## Key Design Decisions

### Deployment-Aware Configuration

A central `DeploymentMode` module (`src/config/deploymentMode.ts`) derives the runtime context from environment variables. All storage and auth behavior flows from this single source of truth.

### Storage Adapter Pattern

The storage layer uses an adapter pattern with three implementations:

- **LocalAdapter** — IndexedDB via Dexie.js
- **RemoteAdapter** — Supabase PostgreSQL
- **DualAdapter** — Syncs both local and remote

The active adapter is determined by the deployment mode.

### Context Provider Hierarchy

```
AuthProvider
  └─ SettingsProvider
       └─ UIProvider
            └─ SelectionProvider
                 └─ TableFilterProvider
                      └─ ToastProvider
                           └─ App
```

Each provider has a single responsibility and clear boundary.

### Feature Flags

`src/config/features.ts` centralizes feature visibility. This enables:

- Emergency feature shutdowns
- Environment-specific feature sets
- A/B testing (future)

## Technology Stack

| Layer         | Technology                             |
| ------------- | -------------------------------------- |
| UI Framework  | React 18                               |
| Build Tool    | Vite                                   |
| Language      | TypeScript (strict)                    |
| Styling       | Vanilla CSS with design tokens         |
| Local DB      | IndexedDB (Dexie.js)                   |
| Remote DB     | Supabase (PostgreSQL)                  |
| Auth          | Supabase Auth (OAuth) / Local profiles |
| Testing       | Vitest                                 |
| Documentation | Docusaurus                             |
| CI/CD         | GitHub Actions                         |
