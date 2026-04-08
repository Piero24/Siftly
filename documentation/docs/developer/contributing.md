---
sidebar_position: 7
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

```bash
npm run test:run
npm run format:check
npx tsc --noEmit
```

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `test:` — tests
- `chore:` — tooling, deps, CI
- `style:` — formatting, CSS

### Key Rules

- Keep views render-focused — logic goes in hooks/contexts
- Use design tokens from `tokens.css` — no hardcoded colors
- Use the `logger` utility — not `console.log`
- Import from centralized configs (`APP_INFO`, `FEATURES`, `DEPLOYMENT`)
