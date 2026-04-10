---
sidebar_position: 6
---

# Testing

Siftly uses **Vitest** for unit/integration testing across frontend and backend.

- Frontend/UI: React Testing Library
- Backend API: Supertest against the Node HTTP server

## Running Tests

```bash
npm run test:run        # Run all tests once
npm run test            # Watch mode (re-runs on file changes)
npm run test:coverage   # With coverage report
```

## Test Structure

Tests live alongside or near the code they test:

```
src/
├── lib/
│   ├── analytics.ts
│   ├── analytics.test.ts
│   ├── countries.ts
│   ├── countries.test.ts
│   ├── csv.ts
│   ├── csv.test.ts
│   └── iconColor.test.ts
├── hooks/
│   ├── useApplicationFilters.ts
│   ├── useApplicationFilters.test.ts
│   ├── useInterviewingFilters.ts
│   └── useInterviewingFilters.test.ts
├── context/
│   ├── SettingsContext.tsx
│   ├── SettingsContext.test.tsx
│   ├── SelectionContext.test.tsx
│   ├── UIContext.test.tsx
│   └── TableFilterContext.test.tsx
├── dashboard/
│   └── App.integration.test.tsx
└── test/
    └── setup.ts          # Global test setup
```

## Writing Tests

```typescript
import { describe, it, expect } from 'vitest';
import { computeKPIs } from '../lib/analytics';

describe('computeKPIs', () => {
  it('counts total applications', () => {
    const apps = [
      /* mock data */
    ];
    const kpis = computeKPIs(apps);
    expect(kpis.total).toBe(apps.length);
  });
});
```

## What to Test

| Layer             | What to Test                                               |
| ----------------- | ---------------------------------------------------------- |
| `lib/` utilities  | Pure functions (analytics, CSV parsing, salary formatting) |
| Hooks             | State transitions, filtering logic, data loading           |
| Context providers | Auth flow, settings persistence, selection state           |
| Local API         | Profiles/applications/settings routes, headers, validation |
| Integration       | Full component interaction flows (table, modal, filters)   |

## Mock Data

The `src/lib/mockData.ts` file provides 50+ realistic job applications for testing. This data is also used by the debug toolbar's "Mock Mode" for UI development and demos.

## CI Integration

Tests run automatically in the CI pipeline on every push and pull request. The pipeline requires all tests to pass before the build stage begins. See [CI/CD Pipeline](../deployment/ci-cd) for the full pipeline flow.
