---
sidebar_position: 3
---

# CI/CD Pipeline

Siftly uses GitHub Actions for continuous integration and delivery. All workflows are located in `.github/workflows/`.

## Workflow Overview

### 1. CI (`ci.yml`)

Runs on every pull request and push to `main`.

- **Install**: `npm ci --legacy-peer-deps`
- **Commit message policy (PRs)**: commitlint enforces Conventional Commits
- **Release PR auto-sync**: on `release-please--*` PR branches, CI runs `npm run metadata:sync` and pushes synced generated files back to that branch
- **Main fallback sync**: on push to `main`, CI runs a fallback metadata sync before verify (self-healing if release PR sync was missed)
- **Metadata consistency**: `npm run metadata:verify`
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
npm run metadata:verify
npm run format:check
npx tsc --noEmit
npm run test:coverage
npm run build:web
npm run build:extension
cd documentation && npm ci --legacy-peer-deps && npm run build && cd ..
```

### 2. Deploy Docs (`deploy-docs.yml`)

Runs on push to `main` when files in `documentation/` or `metadata.json` are changed.

- Builds the Docusaurus site.
- Deploys the result to **GitHub Pages**.

### 3. Release Please (`release-please.yml`)

Runs on push to `main`.

- Scans Conventional Commits.
- Opens/updates a release PR with calculated version bumps and changelog updates.
- Default auto-bump policy is patch-only (`always-bump-patch`).
- Also updates `metadata.json` version through JSONPath (`extra-files`), so metadata remains source-of-truth.
- On release PR merge, creates the Git tag and GitHub release.

This is the canonical release entrypoint. Avoid manual tagging in normal flow.

### Metadata Drift Troubleshooting

If CI fails after merging a release PR with an error like:

`metadata sync check failed ... documentation/package.json, public/manifest.json, README.md`

Use this recovery flow:

1. Run `npm run metadata:sync` locally.
2. Commit and push synced files to `main`.
3. Re-run failed workflow.

This means metadata changed, but one or more derived files did not land in the merged release commit.

### 4. Deploy Docker (`deploy-docker.yml`)

Runs when a version tag (`v*`) is pushed.

- Builds a multi-arch Docker image (AMD64 and ARM64).
- Pushes the image to **GitHub Container Registry** (`ghcr.io`).

### 5. Release Extension (`release-extension.yml`)

Runs when a version tag (`v*`) is pushed.

- Verifies metadata sync state (`npm run metadata:verify`)
- Builds the Chrome extension.
- Creates a GitHub Release with the extension ZIP attached.
- If `package.json` version is stable (no `alpha`, `beta`, `rc`, `dev`), it publishes to the **Chrome Web Store**.

In the standard flow, this tag is created automatically by Release Please after the release PR merge.

## Release Versioning

For the official alpha/beta/rc/prod strategy and release-PR flow, see [Versioning and Releases](./versioning-and-releases).

### 6. DB Migration (`db-migration.yml`)

Runs automatically on pushes to `main` when `supabase/migrations/*.sql` changes, and can also be triggered manually.

- Requires `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, and `SUPABASE_PROJECT_ID`.
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
| `SUPABASE_PROJECT_ID`   | Project Identifier       | DB Migration      |
