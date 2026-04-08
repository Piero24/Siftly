---
sidebar_position: 3
---

# CI/CD Pipeline

Siftly uses GitHub Actions for continuous integration and delivery. All workflows are located in `.github/workflows/`.

## Workflow Overview

### 1. CI (`ci.yml`)

Runs on every pull request and push to `main`.

- **Install**: `npm ci --legacy-peer-deps`
- **Linting**: `npm run format:check`
- **Type Check**: `npx tsc --noEmit`
- **Testing**: `npm run test:coverage`
- **Build (web)**: `npm run build:web`
- **Build (extension)**: `npm run build:extension`
- **Docs Build**: `cd documentation && npm ci --legacy-peer-deps && npm run build`

### Local Pre-Push Checklist (CI Parity)

Run this sequence locally to match CI behavior as closely as possible:

```bash
npm ci --legacy-peer-deps
npm run format:check
npx tsc --noEmit
npm run test:coverage
npm run build:web
npm run build:extension
cd documentation && npm ci --legacy-peer-deps && npm run build && cd ..
```

### 2. Deploy Docs (`deploy-docs.yml`)

Runs on push to `main` when files in `documentation/` are changed.

- Builds the Docusaurus site.
- Deploys the result to **GitHub Pages**.

### 3. Deploy Docker (`deploy-docker.yml`)

Runs when a version tag (`v*`) is pushed.

- Builds a multi-arch Docker image (AMD64 and ARM64).
- Pushes the image to **GitHub Container Registry** (`ghcr.io`).

### 4. Release Extension (`release-extension.yml`)

Runs when a version tag (`v*`) is pushed.

- Builds the Chrome extension.
- Creates a GitHub Release with the extension ZIP attached.
- If `package.json` version is stable (no `alpha`, `beta`, `rc`, `dev`), it publishes to the **Chrome Web Store**.

## Release Versioning

For the official alpha/beta/rc/prod strategy, required tag format, and release checklist, see [Versioning and Releases](./versioning-and-releases).

### 5. DB Migration (`db-migration.yml`)

A **manual-trigger** workflow for Supabase migrations.

- Requires `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, and `SUPABASE_PROJECT_REF`.
- Allows pushing database changes to the production Supabase instance safely.

## Repository Secrets

Ensure these secrets are configured in GitHub for the full pipeline to function:

| Secret                  | Description              | Used by           |
| ----------------------- | ------------------------ | ----------------- |
| `CHROME_EXTENSION_ID`   | Web Store ID             | Extension Release |
| `CHROME_CLIENT_ID`      | Google API Client ID     | Extension Release |
| `CHROME_CLIENT_SECRET`  | Google API Client Secret | Extension Release |
| `CHROME_REFRESH_TOKEN`  | Google API Refresh Token | Extension Release |
| `SUPABASE_ACCESS_TOKEN` | CLI Auth Token           | DB Migration      |
| `SUPABASE_DB_PASSWORD`  | Database Password        | DB Migration      |
| `SUPABASE_PROJECT_REF`  | Project Identifier       | DB Migration      |
