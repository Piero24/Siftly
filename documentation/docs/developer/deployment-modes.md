---
sidebar_position: 4
---

# Deployment Modes

Siftly's behavior adapts based on its deployment mode, which is derived from build-time environment variables.

## How It Works

The deployment mode is computed in `src/config/deploymentMode.ts`:

```typescript
export const DEPLOYMENT_MODE: DeploymentMode = isDebug
  ? 'dev'
  : buildTarget === 'web'
    ? 'web'
    : 'extension';
```

## Mode Details

### `web` — Self-Hosted Docker

- **Storage**: Local Server (Native Node SQLite via `SelfHostedAdapter`)
- **Auth**: Simple profile creation (name only)
- **Storage editable**: No (locked to local)
- **Debug toolbar**: Hidden
- **Use case**: Personal self-hosted deployment

### `extension` — Chrome Extension

- **Storage**: Remote only (Supabase)
- **Auth**: OAuth (Google, GitHub, Apple)
- **Storage editable**: No (locked to remote)
- **Debug toolbar**: Hidden
- **Use case**: Published Chrome extension

### `dev` — Development Mode

- **Storage**: Default local, switchable via debug toolbar
- **Auth**: Bypassed (auto-authenticated as Debug User)
- **Storage editable**: Yes (3-way toggle in debug toolbar)
- **Debug toolbar**: Visible
- **Use case**: Local development and testing

## Capabilities API

Each mode exports a `DeploymentCapabilities` object:

```typescript
interface DeploymentCapabilities {
  storageMode: StorageMode; // 'local' | 'remote' | 'both'
  storageEditable: boolean; // Can the user change it?
  authMode: AuthMode; // 'local-profile' | 'oauth' | 'all'
  showOAuth: boolean; // Show OAuth buttons?
  showLocalProfile: boolean; // Show profile creation form?
}
```

Access it anywhere via:

```typescript
import { DEPLOYMENT, DEPLOYMENT_MODE } from '../config/deploymentMode';

if (DEPLOYMENT.storageEditable) {
  // Allow storage mode switching
}
```

## Debug Toolbar

In dev mode, a toolbar at the bottom of the screen provides:

- Current deployment mode badge
- Build target display
- 3-way storage toggle (Local / Remote / Both)
- Mock data mode toggle
- Hard reset button (clear all localStorage)
