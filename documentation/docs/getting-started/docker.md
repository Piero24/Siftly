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

| Variable                        | Default   | Description                                       |
| ------------------------------- | --------- | ------------------------------------------------- |
| `VITE_BASE_PATH`                | `/`       | Base URL path (for reverse proxy subpaths)        |
| `VITE_SUPABASE_URL`             | _(empty)_ | Supabase project URL (leave empty for local-only) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | _(empty)_ | Supabase publishable key                          |
| `VITE_ALLOW_LOCAL_ONLY`         | `true`    | Allow local-only mode (always true in Docker)     |

## Authentication

In self-hosted mode, Siftly uses **simple profile creation** — just enter your name to get started. No passwords, no external accounts. All data is securely stored in a local SQLite database file on your server (persisted via Docker volumes).

![Self-hosted login screen](/img/screenshots/login-web.png)

## Data Persistence

:::warning
Data is automatically persisted to a local SQLite file mapped in your Docker volume (\`./data\`). It remains safe even if you clear your browser cache! However, it's always good practice to use **CSV Export** in Settings to back up your data occasionally.:::

### What Is Persistent vs. Not

- **Container restart/recreate**: your data remains as long as the `./data` volume is preserved.
- **Docker volume deletion**: your data is lost, because SQLite lives inside that volume.
- **Browser data cleanup** (clear site data, private/incognito profile reset): session/profile cache can reset, but persisted applications/settings remain in SQLite.
- **Origin changes** (`http` vs `https`, different host, different port): does not remove SQLite data, but users may need to reselect/login profile in the new origin.

### How To Avoid Losing Data

1. Keep a stable URL for your deployment (same host/protocol/port).
2. Keep the `./data` Docker volume mounted and backed up.
3. Export backups from **Settings -> Data & Storage -> Export CSV** before upgrades.

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
