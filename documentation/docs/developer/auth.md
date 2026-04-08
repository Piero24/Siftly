---
sidebar_position: 3
---

# Authentication

Siftly uses deployment-aware authentication — different auth flows depending on how the app is deployed.

## Auth Modes

| Deployment     | Auth Mode     | Flow                                       |
| -------------- | ------------- | ------------------------------------------ |
| `web` (Docker) | Local profile | Name-only sign-up, stored in localStorage  |
| `extension`    | OAuth         | Google, GitHub, or Apple via Supabase Auth |
| `dev`          | Debug bypass  | Auto-authenticated as "Debug User"         |

## Local Profile (Web Mode)

For self-hosted Docker deployments:

- User creates a profile by entering their name
- No password required (single-user, self-hosted)
- Profile is stored in `localStorage` under `siftly-local-profile`
- Implemented in `src/lib/localAuth.ts`

```typescript
interface LocalProfile {
  id: string;
  displayName: string;
  email?: string; // optional, for display only
  createdAt: string;
}
```

## OAuth (Extension Mode)

For the Chrome extension:

- Uses Supabase Auth with OAuth providers
- Supported providers: Google, GitHub, Apple
- Session is persisted and refreshed automatically
- Implemented via `@supabase/supabase-js`

## AuthContext

The `AuthContext` provides a unified API regardless of auth mode:

```typescript
interface AuthContextValue {
  user: User | null; // Supabase user (null in web mode)
  localProfile: LocalProfile | null; // Local profile (null in extension mode)
  displayName: string; // Works for both modes
  isAuthenticated: boolean; // True when signed in (either mode)
  isLoading: boolean;
  isLocalOnly: boolean; // True when using local profile
  signIn: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  createLocalProfile: (name: string, email?: string) => void;
  deleteAccount: () => Promise<void>;
}
```

## Login Page Behavior

The `LoginPage` component checks `FEATURES.auth` to determine what to render:

- `showLocalProfile = true` → Shows the profile creation form
- `showOAuth = true` → Shows OAuth provider buttons
- Both → Shows both with a divider (dev mode only)
