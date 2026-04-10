---
sidebar_position: 4
---

# Authentication

Siftly uses deployment-aware authentication — different auth flows depending on how the app is deployed.

## Auth Modes

| Deployment     | Auth Mode     | Flow                                         |
| -------------- | ------------- | -------------------------------------------- |
| `web` (Docker) | Local profile | Name-only profile, synced with local backend |
| `extension`    | OAuth         | Google or GitHub via Supabase Auth           |
| `dev`          | Debug bypass  | Auto-authenticated as "Debug User"           |

## Local Profile (Web Mode)

For self-hosted Docker deployments:

- User creates a profile by entering their name
- No password required
- Multiple profiles can exist on the same instance (account picker flow)
- Active profile is cached in `localStorage` under `siftly-local-profile`
- Profile records are synchronized with the local backend (`/api/profiles`)
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
- Supported providers: Google, GitHub, and Apple
- Session is persisted and refreshed automatically
- Implemented via `@supabase/supabase-js`

## AuthContext

The `AuthContext` provides a unified API regardless of auth mode:

```typescript
interface AuthContextValue {
  user: User | null; // Supabase user (null in web mode)
  localProfile: LocalProfile | null; // Local profile (null in extension mode)
  profiles: LocalProfile[]; // Account picker profile list (web mode)
  displayName: string; // Works for both modes
  isAuthenticated: boolean; // True when signed in (either mode)
  isLoading: boolean;
  isLocalOnly: boolean; // True when using local profile
  signIn: (provider: OAuthProvider) => Promise<void>;
  login: (profile: LocalProfile) => void;
  signOut: () => Promise<void>;
  createLocalProfile: (name: string, email?: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}
```

## Login Page Behavior

The `LoginPage` component checks `FEATURES.auth` to determine what to render:

- `showLocalProfile = true` → Shows the profile creation form
- `showOAuth = true` → Shows OAuth provider buttons
- Both → Shows both with a divider (dev mode only)

## Account Deletion

When a user deletes their account:

1. All active job applications are archived (soft-deleted)
2. User settings are archived
3. The user profile is marked as inactive
4. The user is signed out

This is a **graceful deactivation**, not a hard delete. Data is preserved to allow potential recovery if the user contacts support.

## Re-registration

If a previously deactivated user signs up again with the same email:

1. The old profile and all its associated data are moved to an **archive identity**
2. A brand new profile is created for the fresh registration
3. The new account starts completely clean — no data carries over
4. The archived data remains in the database under the old identity for audit purposes

This is handled automatically by the `handle_new_user()` database trigger.
