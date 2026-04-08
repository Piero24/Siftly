---
sidebar_position: 2
---

# Storage System

Siftly uses an adapter pattern for data storage, allowing the same codebase to work with different backends.

## Adapters

### LocalAdapter

- Uses **IndexedDB** via the Dexie.js library
- No network requests
- Data persists in the browser
- Used in `web` deployment mode

### RemoteAdapter

- Uses **Supabase** (PostgreSQL + REST API)
- Requires authentication
- Data syncs across devices
- Used in `extension` deployment mode

### DualAdapter

- Writes to **both** local and remote
- Uses local as primary (faster reads)
- Syncs to remote in background
- Available in `dev` mode

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
      return new LocalAdapter();
    case 'remote':
      return new RemoteAdapter();
    case 'both':
      return new DualAdapter();
  }
}
```

## Schema

Both adapters use the same `JobApplication` interface. The Supabase schema is defined in `supabase/supabase-schema.sql`.
