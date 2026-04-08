---
sidebar_position: 2
---

# Storage System

Siftly uses an adapter pattern for data storage, allowing the same codebase to work with different backends.

## Adapters

### IndexedDBAdapter

- Uses the browser's native **IndexedDB** API (no ORM or wrapper library)
- No network requests — fully offline capable
- Data persists in the browser across sessions
- Used in `web` (self-hosted) deployment mode

### SupabaseAdapter

- Uses **Supabase** (PostgreSQL + PostgREST API)
- Requires authentication — all queries are scoped via Row Level Security
- Data syncs across devices automatically
- All deletions are **soft deletes** — records are archived, not removed (see [Database](./database))
- Used in `extension` deployment mode

### DualSyncAdapter

- Writes to **both** local and remote
- Reads from **remote first**, falls back to local if unavailable
- Keeps local IndexedDB in sync with the remote database
- Available in `dev` mode for testing

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
      return new IndexedDBAdapter();
    case 'remote':
      return new SupabaseAdapter();
    case 'both':
      return new DualSyncAdapter();
  }
}
```

## Interface

All adapters implement the same interface:

```typescript
interface StorageAdapter {
  getAll(): Promise<JobApplication[]>;
  upsert(app: JobApplication): Promise<void>;
  remove(id: string): Promise<void>;      // Soft delete in Supabase
  removeAll(): Promise<void>;             // Soft delete in Supabase
  importBatch(apps: JobApplication[]): Promise<void>;
}
```

## Schema

Both adapters use the same `JobApplication` TypeScript interface. The Supabase schema is defined in `supabase/migrations/` and includes automatic camelCase ↔ snake_case mapping in the storage adapter.
