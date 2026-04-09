---
sidebar_position: 1
slug: /intro
---

# Welcome to Siftly

**Siftly** is a professional job application tracker designed to give you full control over your job search. Available as a **Chrome extension** and a **self-hosted web app**, it combines powerful analytics with a clean, modern interface.

![Siftly dashboard overview](/img/screenshots/dashboard-top.png)

## What is Siftly?

Siftly helps you:

- **Track applications** — Log every job you apply to with company, position, salary, status, and more.
- **Manage interviews** — Track interview rounds, interviewer details, and meeting links.
- **Analyze your search** — Interactive dashboard with charts, world map, KPIs, and funnel analysis.
- **Import from LinkedIn** — One-click scraping from LinkedIn job pages (coming soon).
- **Stay organized** — CSV import/export, multiple CV profiles, and automatic "no response" detection.

## How It Works

Siftly runs in two modes depending on how you deploy it:

| Mode                     | Storage           | Authentication                | Best For          |
| ------------------------ | ----------------- | ----------------------------- | ----------------- |
| **Chrome Extension**     | Cloud (Supabase)  | OAuth (Google, GitHub)        | Multi-device sync |
| **Self-Hosted (Docker)** | Local (IndexedDB) | Simple profile creation       | Full privacy      |

Both modes share the same codebase and feature set.

## Quick Start

- **Chrome Extension** → [Install the extension](./getting-started/chrome-extension)
- **Self-Hosted** → [Docker setup guide](./getting-started/docker)
- **Development** → [Local development setup](./getting-started/installation)

## For Developers

If you're contributing to Siftly or building on top of it:

- [Architecture overview](./developer/architecture)
- [Storage system](./developer/storage)
- [Contributing guide](./developer/contributing)

## License

Siftly is released under the [Prosperity Public License 3.0.0](https://github.com/Piero24/Siftly/blob/main/LICENSE).
