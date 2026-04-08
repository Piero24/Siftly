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

- **IndexedDBAdapter** — Browser-local IndexedDB (raw API, no ORM)
- **SupabaseAdapter** — Supabase PostgreSQL with Row Level Security
- **DualSyncAdapter** — Writes to both; reads from remote, falls back to local

The active adapter is determined by the deployment mode. All write operations go through the same `StorageAdapter` interface, so the rest of the codebase is storage-agnostic.

### Data Integrity

All data operations use **soft deletion** — records are marked with a `deleted_at` timestamp rather than being physically removed. This enables:

- **Undo / recovery** — accidentally deleted applications can be restored
- **Graceful account management** — account deactivation preserves data for potential reactivation
- **Audit trail** — full history of user activity is preserved

See [Database](./database) for schema details.

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
| UI Framework  | React 19                               |
| Build Tool    | Vite                                   |
| Language      | TypeScript (strict)                    |
| Styling       | Vanilla CSS with design tokens         |
| Local DB      | IndexedDB (raw API)                    |
| Remote DB     | Supabase (PostgreSQL + RLS)            |
| Auth          | Supabase Auth (OAuth) / Local profiles |
| Testing       | Vitest + React Testing Library         |
| Documentation | Docusaurus                             |
| CI/CD         | GitHub Actions                         |
