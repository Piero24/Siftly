---
sidebar_position: 4
---

# Configuration

## Environment Variables

Siftly is configured via Vite environment variables in the `.env` file.

| Variable                        | Type               | Default     | Description                               |
| ------------------------------- | ------------------ | ----------- | ----------------------------------------- |
| `VITE_SUPABASE_URL`             | `string`           | —           | Supabase project URL                      |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `string`           | —           | Supabase publishable key                  |
| `VITE_SUPABASE_SECRET_KEY`      | `string`           | —           | Supabase secret key                       |
| `SUPABASE_DB_PASSWORD`          | `string`           | —           | Supabase database password                |
| `VITE_ALLOW_LOCAL_ONLY`         | `boolean`          | `false`     | Allow skipping login                      |
| `VITE_DEBUG_MODE`               | `boolean`          | `false`     | Enable debug toolbar and auth bypass      |
| `VITE_BUILD_TARGET`             | `web \| extension` | `extension` | Build target (determines deployment mode) |
| `VITE_BASE_PATH`                | `string`           | `/`         | Base URL path for web builds              |

## Deployment Modes

The combination of `VITE_BUILD_TARGET` and `VITE_DEBUG_MODE` determines the **deployment mode**:

| Build Target | Debug Mode | Deployment Mode | Storage           | Auth          |
| ------------ | ---------- | --------------- | ----------------- | ------------- |
| `extension`  | `false`    | `extension`     | Remote (Supabase) | OAuth         |
| `web`        | `false`    | `web`           | Local (IndexedDB) | Local profile |
| any          | `true`     | `dev`           | Switchable        | All methods   |

See [Deployment Modes](../developer/deployment-modes) for details.

## Supabase Setup

To enable cloud storage and OAuth authentication:

1. Create a project at [supabase.com](https://supabase.com)
2. Run the schema SQL from `supabase/supabase-schema.sql` in the SQL Editor
3. Copy the project URL and anon key to your `.env` file
4. Configure OAuth providers in Supabase → Authentication → Providers

## Feature Flags

Feature visibility is controlled in `src/config/features.ts`. Features can be toggled for:

- Authentication methods
- Dashboard sections
- Settings sections
- Debug tools

## Product Metadata (Single Source of Truth)

Siftly product metadata is centralized in `metadata.json` at the repository root.

Use this file for:

- Version
- Product/app names
- Tagline and extension description
- Shared links (GitHub/docs/support/privacy)
- Branding assets (logo paths and docs images)

After editing metadata, run:

```bash
npm run metadata:sync
npm run metadata:verify
```

This keeps `package.json`, `public/manifest.json`, `documentation/package.json`, and the README version badge synchronized.

For full ownership rules and field-by-field guidance, see [Product Metadata](../developer/product-metadata).
