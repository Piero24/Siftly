---
sidebar_position: 2
---

# Storage System

Siftly uses an adapter pattern for data storage, allowing the same codebase to work with different backends.

## Adapters

### SelfHostedAdapter

- Uses standard `fetch()` API to call the local, built-in Node.js server.
- The server writes directly to a native **SQLite** database (`siftly.db`).
- Fully self-contained local backend.
- Uses profile-scoped requests through the `X-User-Id` header to isolate users on the same self-hosted instance.
- Used in `web` (self-hosted) deployment mode.

See [Local API](./local-api) for full endpoint contracts and payload behavior.

### SupabaseAdapter

- Uses **Supabase** (PostgreSQL + PostgREST API)
- Requires authentication — all queries are scoped via Row Level Security
- Data syncs across devices automatically
- All deletions are **soft deletes** — records are archived, not removed (see [Database](./database))
- Used in `extension` deployment mode

### Concept of Dual Sync

- Older versions supported `DualSyncAdapter` which wrote to both remote Postgres and IndexedDB.
- With the transition to server-side SQLite for the web build, dual sync has been simplified out. The architecture now strictly segments environments: Extension = Supabase, Web = SQLite-backed local API.

## Storage Mode Selection

The active storage mode is determined by the deployment configuration:

```typescript
// src/config/deploymentMode.ts
const CAPABILITIES_MAP = {
  web: { storageMode: 'local', storageEditable: false },
  extension: { storageMode: 'remote', storageEditable: false },
  dev: { storageMode: 'local', storageEditable: true }, // changeable in debug toolbar
};
```

In production deployments, the storage mode is **locked**:

- Web → always `local`
- Extension → always `remote`

In dev mode, the debug toolbar provides a 3-way toggle to switch between local, remote, and both.

## Factory Function

```typescript
// src/lib/storage.ts
export function createAdapter(mode: StorageMode): StorageAdapter {
  switch (mode) {
    case 'local':
      return new SelfHostedAdapter();
    case 'remote':
      return new SupabaseAdapter();
    case 'both':
      return new SupabaseAdapter(); // Fallback conceptually
  }
}
```

## Interface

All adapters implement the same interface:

```typescript
interface StorageAdapter {
  getAll(): Promise<JobApplication[]>;
  upsert(app: JobApplication): Promise<void>;
  remove(id: string): Promise<void>; // Soft delete in Supabase
  removeAll(): Promise<void>; // Soft delete in Supabase
  importBatch(apps: JobApplication[]): Promise<void>;
}
```

## Schema

Both adapters use the same `JobApplication` TypeScript interface. The Supabase schema is defined in `supabase/migrations/` and includes automatic camelCase ↔ snake_case mapping in the storage adapter.

## Settings Persistence

Application settings are persisted through a hybrid strategy:

- **Local-first**: `SettingsContext` hydrates immediately from localStorage for instant UI boot.
- **Remote sync (when available)**: in extension/remote-capable modes, settings are loaded and saved to Supabase `user_settings`.

This behavior is implemented in:

- `src/context/SettingsContext.tsx` (state + hydration + debounced save)
- `src/lib/settingsStorage.ts` (Supabase row mapping and upsert logic)

### Sync Behavior

1. Read localStorage defaults immediately.
2. If an authenticated Supabase session exists, fetch `user_settings` and apply remote values.
3. Persist setting changes to localStorage and (debounced) to the active backend.

### Persisted Settings Scope

The remote snapshot includes dashboard and popup preferences, including:

- language, currency, theme
- automation settings (`auto_no_response`, days)
- dashboard defaults (`default_time_range`, `default_overview_scope`)
- storage mode and CV profiles
- notifications/privacy/table display JSON fields
- popup behavior (`is_draggable`, `auto_close_enabled`, `auto_close_timer`)

In pure web/local deployment mode, the local Node.js API (`/api/settings`) acts as the persistence target, storing settings snapshots in SQLite per profile.
