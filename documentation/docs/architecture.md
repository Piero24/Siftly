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

1. App-level state in dashboard container.
2. Derived analytics through pure functions in `src/lib/analytics.ts`.
3. Feature components consume filtered/derived data via props.

## Testing scope (current)

- Component interaction tests for navigation behavior.
- Utility tests for analytics aggregations.
