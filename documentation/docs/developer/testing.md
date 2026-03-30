---
sidebar_position: 7
---

# Testing

Siftly uses **Vitest** for unit and integration testing.

## Running Tests

```bash
npm run test:run        # Run all tests once
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage report
```

## Test Structure

Tests live alongside or near the code they test:

```
src/
├── lib/
│   ├── analytics.ts
│   └── analytics.test.ts
├── hooks/
│   ├── useJobApplications.ts
│   └── useJobApplications.test.ts
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
| Hooks             | State transitions, data loading logic                      |
| Normalizers       | Scraper data normalization                                 |
| Context providers | Auth flow, settings persistence                            |

## Mock Data

The `src/test/mockData.ts` file provides 50 realistic job applications for testing. This data is also used by the debug toolbar's "Mock Mode".
