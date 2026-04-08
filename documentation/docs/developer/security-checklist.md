---
sidebar_position: 8
---

# Security Checklist

Use this checklist when setting up a production deployment of Siftly. Each section covers a different platform or layer.

---

## Supabase Dashboard

- [ ] **RLS is enabled** on all tables: `profiles`, `job_applications`, `user_settings`
- [ ] **Anon key** is used client-side (not the service role key)
- [ ] **Service role key** is never exposed in client code or environment variables prefixed with `VITE_`
- [ ] **Auth redirect URLs** are restricted to your domain only (Settings → Authentication → URL Configuration)
- [ ] **OAuth providers** are configured with production credentials (not test/dev)
- [ ] **Email confirmations** are enabled for email/password sign-up (if applicable)
- [ ] **MFA** is enabled on your Supabase dashboard account (Settings → Account)
- [ ] **API rate limiting** is configured appropriately (Settings → API)
- [ ] **Database password** is strong and rotated periodically
- [ ] **No public read access** on `profiles` table — users can only see their own profile

### RLS Policy Verification

Run this query in the SQL editor to confirm all tables have RLS enabled:

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

All rows should show `rowsecurity = true`.

---

## Google Cloud Console (OAuth)

- [ ] **OAuth consent screen** is set to "Production" (not "Testing") for public use
- [ ] **Authorized redirect URIs** include only your Supabase auth callback URL (`https://<project>.supabase.co/auth/v1/callback`)
- [ ] **No stale credentials** — delete unused OAuth client IDs
- [ ] **Client secret** is stored only in GitHub Secrets, never in code
- [ ] **Scopes** are minimal — only `openid`, `email`, `profile`

---

## GitHub Repository

- [ ] **Repository secrets** are set (not hardcoded in workflows):
  - `CHROME_EXTENSION_ID`, `CHROME_CLIENT_ID`, `CHROME_CLIENT_SECRET`, `CHROME_REFRESH_TOKEN`
  - `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_ID`
- [ ] **Secrets are not logged** — workflows use `::add-mask::` or avoid `echo` on sensitive values
- [ ] **Branch protection** is enabled on `main`:
  - Require PR reviews before merging
  - Require status checks (CI) to pass
  - No force pushes
- [ ] **`.env`** is in `.gitignore` (never committed)
- [ ] **`.env.example`** contains no real credentials
- [ ] **GITHUB_TOKEN** permissions are scoped to minimum needed per workflow

---

## Application Code

- [ ] **`VITE_SUPABASE_SECRET_KEY`** does NOT exist — secret keys must never have the `VITE_` prefix (Vite bundles all `VITE_*` vars into the client bundle)
- [ ] **Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`** are prefixed with `VITE_`
- [ ] **All database operations** go through the `StorageAdapter` interface, which enforces RLS via `auth.uid()`
- [ ] **Soft-delete RPCs** (`soft_delete_application`, `soft_delete_all_applications`, `soft_delete_account`) use `SECURITY DEFINER` with `SET search_path = public`
- [ ] **No raw SQL** is executed client-side — all queries go through the Supabase JS client
- [ ] **No `console.log`** with sensitive data — use the `logger` utility instead

---

## Chrome Extension

- [ ] **Content Security Policy** in `manifest.json` restricts external connections to Supabase URLs only
- [ ] **Extension permissions** are minimal (only what's needed)
- [ ] **OAuth redirect** works correctly in the extension context
- [ ] **No sensitive data** stored in `chrome.storage.local` (use Supabase for persistent data)
