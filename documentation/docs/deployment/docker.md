---
sidebar_position: 1
---

# Docker Deployment

For self-hosting Siftly, Docker is the recommended approach. This guide assumes you have **Docker** and **Docker Compose** installed.

## Pre-built Image

The easiest way to run Siftly is using the official image from GitHub Container Registry:

```bash
docker run -d \
  -p 8080:80 \
  --name siftly \
  ghcr.io/piero24/siftly:latest
```

## Docker Compose (Recommended)

Using Docker Compose allows for easier management and configuration.

```yaml
version: '3.8'

services:
  siftly:
    image: ghcr.io/piero24/siftly:latest
    container_name: siftly
    restart: unless-stopped
    ports:
      - '8080:80'
    environment:
      - VITE_BASE_PATH=/
      - VITE_ALLOW_LOCAL_ONLY=true
```

## Deployment for CasaOS

Siftly is fully compatible with **CasaOS**. To install:

1. Copy the `docker-compose.yml` above.
2. Go to your CasaOS dashboard.
3. Click "App Store" → "Custom Install".
4. Paste the YAML into the configuration.
5. Set the Web UI port to `8080` (or your preferred local port).
6. Click "Install".

## Data & Backups

In Docker (web) mode, Siftly stores data in the browser's **IndexedDB**.

- **Backup**: Use the "Export CSV" feature in Settings → Data & Storage frequently.
- **Persistence**: Data is persistent within the same browser and domain, even if the container is restarted. However, clearing browser data will wipe your applications.

## Reverse Proxy (Nginx)

If you are running behind a proxy like Nginx:

```nginx
server {
    listen 80;
    server_name siftly.example.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
