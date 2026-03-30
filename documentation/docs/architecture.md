---
sidebar_position: 3
---

# Architecture Overview

## Main areas

- Dashboard application: analytics and management UI
- Popup/background/content scripts for extension behavior
- Shared styling tokens and component-level CSS modules

## Key folders

- `src/dashboard`: dashboard entrypoint and app container
- `src/components`: reusable UI components grouped by feature
- `src/hooks`: state and utility hooks
- `src/lib`: pure utilities and analytics derivations
- `src/styles`: design tokens and feature stylesheets
- `src/types`: domain models and shared types

## Data flow

1. Domain state is split by provider:
   - `SettingsProvider` for theme/localization/defaults.
   - `UIProvider` for view + modal navigation state.
   - `SelectionProvider` for row-selection and bulk actions.
   - `TableFilterProvider` for table search and filter-row controls.
2. App orchestrates composition and delegates feature logic to hooks.
3. Derived analytics remain in pure utilities (`src/lib/analytics.ts`).
4. Feature screens consume provider state + dedicated hooks.

## Refactor conventions

- Keep provider boundaries stable; avoid moving feature-specific logic back into `App.tsx`.
- Put options/config arrays in `src/config/*` rather than component files.
- Extract non-trivial filtering/derivation into hooks in `src/hooks/*`.
- Keep view components render-focused; state transitions belong in hooks/providers.

## PR scope guidance

When the working tree contains unrelated edits, prepare focused PRs with path-based staging.

Example:

```bash
git add src/context src/hooks src/config src/types/ui.ts src/dashboard/App.tsx src/dashboard/index.tsx documentation/docs/architecture.md
git commit -m "refactor: split dashboard state domains and add tests"
```

Use `git status` before commit to ensure only intended files are included.

## Testing scope (current)

- Component interaction tests for navigation behavior.
- Utility tests for analytics aggregations.
- Provider/hook tests for state domains and filtering logic.
- Integration test covering table search/filter/selection/modal flow.
