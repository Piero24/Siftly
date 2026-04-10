---
sidebar_position: 9
---

# Contributing

See the full [CONTRIBUTING.md](https://github.com/Piero24/Siftly/blob/main/CONTRIBUTING.md) in the repository root.

## Quick Reference

### Setup

```bash
git clone https://github.com/<your-username>/Siftly.git
cd Siftly
npm install --legacy-peer-deps
VITE_DEBUG_MODE=true npm run dev:web
```

### Before Submitting a PR

Run the full CI check suite locally:

```bash
npm run metadata:verify    # Metadata/source-of-truth consistency
npm run format:check      # Prettier formatting
npx tsc --noEmit          # TypeScript type check
npm run test:coverage     # Unit tests with coverage
npm run build:web         # Web build
npm run build:extension   # Extension build
npm run docs:build        # Documentation build
```

All checks must pass — these are the exact checks that run in CI.

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `test:` — tests
- `chore:` — tooling, deps, CI
- `style:` — formatting, CSS
- `ci:` — CI/CD workflow changes

## Project Structure

When contributing, follow the existing directory conventions:

```
src/
├── assets/          # Static assets (logo, icons)
├── background/      # Extension background script
├── components/      # React components by feature
│   ├── auth/        # Login page
│   ├── common/      # Shared UI components
│   ├── dashboard/   # Dashboard views & modals
│   ├── debug/       # Debug toolbar
│   └── layout/      # Layout wrappers
├── config/          # App config, features, links, deployment mode
├── constants/       # Shared constants and enums
├── content/         # Extension content script
├── context/         # React context providers
├── dashboard/       # Dashboard entrypoint
├── hooks/           # Custom React hooks
├── lib/             # Utility libraries (storage, analytics, CSV)
├── popup/           # Extension popup entrypoint
├── scraper/         # Job portal scraper modules (planned)
├── styles/          # CSS files (tokens, components)
├── test/            # Test setup
├── types/           # TypeScript type definitions
└── web/             # Web (self-hosted) entrypoint

metadata.json         # Canonical product metadata (version/name/links/images)
scripts/              # Repo scripts (metadata sync/check)
```

### Directory Conventions

- **Views go in `components/`** — grouped by feature area
- **State logic goes in `hooks/`** — keep views render-focused
- **Configuration goes in `config/`** — not inside component files
- **Tests go next to the code** — `foo.ts` → `foo.test.ts` in the same directory
- **Styles go in `styles/`** — one CSS file per feature area

## Key Rules

- Keep views render-focused — logic goes in hooks/contexts
- Use design tokens from `tokens.css` — no hardcoded colors
- Use the `logger` utility — not `console.log`
- Import from centralized configs (`APP_INFO`, `FEATURES`, `DEPLOYMENT`)
- Update product metadata only in `metadata.json` and run `npm run metadata:sync`
- All database schemas are in `supabase/migrations/` — never modify the database manually

## Commit and Release Rules

- PR commits must follow Conventional Commits. CI enforces this via commitlint.
- Do not create release tags manually in normal flow.
- Releases are prepared by Release Please from `main` and published by tag-triggered workflows after the release PR is merged.
- See [Product Metadata](./product-metadata) and [Versioning and Releases](../deployment/versioning-and-releases) for the complete process.

## Provider Boundaries

The app uses separate context providers — keep their boundaries stable:

| Provider              | Responsibility                        |
| --------------------- | ------------------------------------- |
| `AuthProvider`        | Authentication state                  |
| `SettingsProvider`    | User preferences, theme, storage mode |
| `UIProvider`          | View navigation, modal state          |
| `SelectionProvider`   | Row selection, bulk actions           |
| `TableFilterProvider` | Table search and filter state         |
| `ToastProvider`       | Toast notifications                   |
