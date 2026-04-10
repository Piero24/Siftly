---
sidebar_position: 1
---

# Job Portal Scraper (Planned)

:::info
This feature is currently in the planning stage. The skeleton code is in `src/scraper/linkedin/`.
:::

## Overview

The job portal scraper will allow you to import job applications directly from supported job pages with a single click.

## How It Will Work

1. Navigate to a supported job posting page (LinkedIn first, then Indeed and others)
2. A floating **Sift** button appears on the page
3. Click the button to extract job details
4. Review the extracted data in a confirmation modal
5. The application is saved to your Siftly dashboard

## Extracted Fields

- Company name and logo
- Job title / position
- Location (city + country)
- Salary range (if listed)
- Work type (remote / hybrid / onsite)
- Employment type (full-time / contract / intern)
- Job description
- Posted date

## Implementation Status

| Phase                     | Status         | Description                                      |
| ------------------------- | -------------- | ------------------------------------------------ |
| Phase A — Foundation      | 🔲 Not started | Content script, FAB injection, basic extraction  |
| Phase B — Full Extraction | 🔲 Not started | All field extractors, normalizer, storage bridge |
| Phase C — Polish          | 🔲 Not started | Review modal, error handling, tests              |

## Technical Details

See [PLAN.md](https://github.com/Piero24/Siftly/blob/main/src/scraper/linkedin/PLAN.md) for the full implementation plan.
