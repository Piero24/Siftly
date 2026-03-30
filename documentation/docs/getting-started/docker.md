---
sidebar_position: 3
---

# Docker Self-Hosting

Run Siftly on your own server with Docker. All data stays on your device — no cloud required.

## Quick Start

```bash
docker compose up -d
```

Siftly will be available at `http://localhost:8080`.

## Docker Compose

```yaml
services:
  siftly-web:
    image: ghcr.io/piero24/siftly:latest
    container_name: siftly-web
    ports:
      - '8080:8080'
    restart: unless-stopped
```

## Build from Source

```bash
docker compose up -d --build
```

## CasaOS

Siftly includes CasaOS metadata in `docker-compose.yml`. To install on CasaOS:

1. Open CasaOS dashboard
2. Go to **App Store** → **Custom Install**
3. Paste the `docker-compose.yml` contents
4. Click **Install**

## Environment Variables

| Variable                 | Default   | Description                                       |
| ------------------------ | --------- | ------------------------------------------------- |
| `VITE_BASE_PATH`         | `/`       | Base URL path (for reverse proxy subpaths)        |
| `VITE_SUPABASE_URL`      | _(empty)_ | Supabase project URL (leave empty for local-only) |
| `VITE_SUPABASE_ANON_KEY` | _(empty)_ | Supabase anonymous key                            |
| `VITE_ALLOW_LOCAL_ONLY`  | `true`    | Allow local-only mode (always true in Docker)     |

## Authentication

In self-hosted mode, Siftly uses **simple profile creation** — just enter your name to get started. No passwords, no external accounts. All data is stored locally in the browser's IndexedDB.

## Data Persistence

:::warning
Data is stored in the browser's IndexedDB, **not** in a Docker volume. If you clear your browser data, your applications will be lost. Use **CSV Export** in Settings to back up your data regularly.
:::

## Reverse Proxy

To run behind Nginx or Traefik at a subpath:

```yaml
services:
  siftly-web:
    build:
      args:
        VITE_BASE_PATH: /siftly/
    ports:
      - '8080:8080'
```
