---
sidebar_position: 2
---

# Job Portal Scraper with LLM (Planned)

:::info
This feature is currently in the planning stage. The skeleton code is in `src/scraper/linkedin-llm/`.
:::

## Overview

An AI-enhanced version of the job portal scraper that uses a Large Language Model to intelligently parse unstructured job posting text into structured data.

## Why LLM?

CSS selectors break frequently when job portals update their UI. The LLM approach:

- Is **robust to DOM changes** — it reads text, not HTML structure
- Handles **edge cases** better — unusual salary formats, multilingual postings
- Can **summarize descriptions** — extract key requirements and responsibilities

## Supported Providers

| Provider             | Type                | Cost                  |
| -------------------- | ------------------- | --------------------- |
| OpenAI (GPT-4o-mini) | Cloud               | ~$0.0003 / extraction |
| Ollama               | Local (self-hosted) | Free                  |
| OpenRouter           | Cloud               | Variable              |
| Custom endpoint      | Any                 | Variable              |

All providers use the OpenAI-compatible chat completions API.

## Hybrid Approach

The recommended approach combines both methods:

1. **CSS selectors** for fast, free field extraction (company, title)
2. **LLM** for complex fields (salary parsing, location, description summary)
3. **Merge** — selector results take priority for high-confidence fields

## Privacy

When using cloud LLM providers, job description text is sent to an external API. For full privacy, use **Ollama** (local LLM) — no data leaves your device.

## Implementation Status

| Phase                     | Status         | Description                              |
| ------------------------- | -------------- | ---------------------------------------- |
| Phase A — Provider Setup  | 🔲 Not started | Config UI, API client, connection test   |
| Phase B — Prompt Pipeline | 🔲 Not started | Prompt templates, response parsing       |
| Phase C — Hybrid Merge    | 🔲 Not started | Merge LLM + selector results             |
| Phase D — Polish          | 🔲 Not started | Ollama auto-detect, cost tracking, tests |

## Technical Details

See [PLAN.md](https://github.com/Piero24/Siftly/blob/main/src/scraper/linkedin-llm/PLAN.md) for the full implementation plan.
