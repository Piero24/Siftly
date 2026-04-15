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

The storage layer uses an adapter pattern with two active implementations:

- **SelfHostedAdapter** — Server-local Native Node SQLite backend
- **SupabaseAdapter** — Supabase PostgreSQL with Row Level Security

The active adapter is determined by deployment mode. All write operations go through the same `StorageAdapter` interface, so the rest of the codebase is storage-agnostic.

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

## UI Patterns & Behaviors

### Popup Navigation

The primary Chrome Extension popup uses a structured navigation pattern to handle user intent clearly:

- **Graceful Navigation (`onBack`)**: Standard "Back Arrow" buttons navigate the user back to the main dashboard within the popup, maintaining the extension instance.
- **Session Termination (`onCancel` / `onSuccess`)**: terminal states (like a successful job save or an unrecoverable error) trigger `window.close()`. This immediately kills the extension instance to clear the screen and prevent stale UI states.

### Draggable In-Page Panel

The in-page extension panel is draggable from header bars:

- Drag start is emitted from popup header pointer-down handlers (`SIFTLY_IFRAME_DRAG_START`).
- Action buttons (settings, close, back) are excluded from drag initiation.
- The content script applies movement to the fixed host using `transform: translate(x, y)` for smooth frame updates.
- Dragging stops on pointer-up and the panel remains at the released position.
- On close/reopen, translation is reset so the panel always reappears in the default top-right origin.

### Interactive Auto-Close

Siftly implements a mouse-aware auto-close mechanism for terminal screens:

- **AutoCloseTimer**: A circular SVG visual that only activates when the user's cursor physically leaves the popup viewport (`mouseleave`).
- **State Preservation**: The timer resets instantly if the mouse re-enters (`mouseenter`), ensuring users don't accidentally lose confirmation messages.
- **Native Binding**: Listens to a combination of React state and native `document.body` events for precision.

Auto-close timing and enablement are settings-driven (`autoCloseEnabled`, `autoCloseTimer`) and are persisted with user settings.

## Extracted Components & Hooks

Complex monolithic components have been decomposed into focused, reusable sub-components following a **thin orchestrator** pattern:

### Component Sub-Directories

| Directory                             | Parent Component      | Sub-Components                                                                                                                                          |
| ------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/dashboard/interviewing/`  | `InterviewingView`    | `NextRoundDisplay`, `InterviewRow`, `InterviewTableHeader`                                                                                              |
| `components/dashboard/job-detail/`    | `JobDetailModal`      | `ModalHighlightRow`, `ModalSideLinks`, `ModalTrackingCard`, `ModalRecruiterCard`, `ModalReferralCard`, `ModalRoundsSection`                             |
| `components/dashboard/form-sections/` | `NewApplicationModal` | `CompanySection`, `RoleSection`, `LocationSection`, `ApplicationSection`, `LinksSection`, `DetailsSection`, `ContactsSection`, `InterviewRoundsSection` |

### Shared Hooks

| Hook                    | Purpose                                                               |
| ----------------------- | --------------------------------------------------------------------- |
| `useLocalStorageState`  | Generic `useState` backed by `localStorage` with built-in serializers |
| `useRemoteSettingsSync` | Auth-reactive remote settings hydration + debounced save              |
| `useApplicationForm`    | Shared form state, change handlers, and validation                    |

### Shared Libraries

| Module                  | Purpose                                                                         |
| ----------------------- | ------------------------------------------------------------------------------- |
| `lib/formSerializer.ts` | Bidirectional conversion between `FormState` (UI) and `JobApplication` (domain) |

## Technology Stack

| Layer         | Technology                             |
| ------------- | -------------------------------------- |
| UI Framework  | React 19                               |
| Build Tool    | Vite                                   |
| Language      | TypeScript (strict)                    |
| Styling       | Vanilla CSS with design tokens         |
| Local DB      | Native Node.js SQLite API              |
| Remote DB     | Supabase (PostgreSQL + RLS)            |
| Auth          | Supabase Auth (OAuth) / Local profiles |
| Testing       | Vitest + React Testing Library         |
| Documentation | Docusaurus                             |
| CI/CD         | GitHub Actions                         |
