# Contributing to Siftly

Thank you for your interest in contributing to Siftly! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)

## Code of Conduct

Please be respectful, constructive, and inclusive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. **Create a branch** from `main` for your changes
4. **Make your changes** following the guidelines below
5. **Submit a pull request**

## Development Setup

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
# Clone your fork
git clone https://github.com/<your-username>/Siftly.git
cd Siftly

# Install dependencies
npm install --legacy-peer-deps

# Install docs dependencies
cd documentation && npm install && cd ..
```

### Run locally

```bash
# Extension mode (default)
npm run dev

# Web mode (self-hosted)
npm run dev:web

# With debug toolbar
VITE_DEBUG_MODE=true npm run dev:web

# Documentation
npm run docs:dev
```

### Run checks

```bash
npm run test:run        # Unit tests
npm run format:check    # Prettier
npx tsc --noEmit        # TypeScript
npm run build           # Extension build
npm run build:web       # Web build
npm run docs:build      # Docs build
```

## Project Structure

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
├── content/         # Extension content script
├── context/         # React context providers
├── dashboard/       # Dashboard entrypoint
├── hooks/           # Custom React hooks
├── lib/             # Utility libraries (storage, analytics, CSV)
├── popup/           # Extension popup entrypoint
├── scraper/         # LinkedIn scraper modules
│   ├── linkedin/    # Selector-based scraper
│   └── linkedin-llm/  # LLM-enhanced scraper
├── styles/          # CSS files (tokens, components)
├── test/            # Test setup
├── types/           # TypeScript type definitions
└── web/             # Web (self-hosted) entrypoint
```

## Making Changes

### Guidelines

- **Keep views render-focused** — state transitions belong in hooks/providers.
- **Put config in `src/config/`** — not inside component files.
- **Extract non-trivial logic into hooks** in `src/hooks/`.
- **Use existing design tokens** from `src/styles/tokens.css`.
- **Import from centralized configs** — `APP_INFO`, `FEATURES`, `DEPLOYMENT`, `LINKS`.
- **Use the logger** — `import { logger } from '../lib/logger'` instead of `console.log`.
- **Write tests** for new utilities, hooks, and complex logic.

### Provider Boundaries

The app uses separate context providers — keep their boundaries stable:

| Provider              | Responsibility                        |
| --------------------- | ------------------------------------- |
| `AuthProvider`        | Authentication state                  |
| `SettingsProvider`    | User preferences, theme, storage mode |
| `UIProvider`          | View navigation, modal state          |
| `SelectionProvider`   | Row selection, bulk actions           |
| `TableFilterProvider` | Table search and filter state         |
| `ToastProvider`       | Toast notifications                   |

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add interview round management
fix: correct salary parsing for EUR currencies
docs: update deployment guide
refactor: extract KPI strip into dedicated component
test: add analytics aggregation tests
chore: update dependencies
ci: add Docker multi-arch build
style: fix button alignment in settings
```

## Pull Request Process

1. **Update tests** — add or update tests for your changes.
2. **Run all checks** — `npm run test:run && npm run format:check && npx tsc --noEmit`
3. **Keep PRs focused** — one feature or fix per PR.
4. **Fill out the PR template** — describe what changed and why.
5. **Link issues** — reference related issues with `Fixes #123` or `Closes #456`.

### PR Title Format

Use the same convention as commits:

- `feat: add salary range chart`
- `fix: dashboard KPI calculation off by one`

## Code Style

- **Formatting**: Prettier (configured in `.prettierrc.json`)
- **TypeScript**: Strict mode, no `any` unless explicitly commented
- **CSS**: Vanilla CSS with design tokens, no CSS-in-JS
- **Components**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions/variables

---

Thank you for contributing! 🎉
