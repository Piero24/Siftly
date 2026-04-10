# Local Development (No Docker)

Siftly is designed to be highly portable. While Docker is the recommended way to self-host, you can run the entire stack locally on your Mac or Linux machine without any containers.

## Prerequisites

- **Node.js 22+**: Required for the native SQLite engine (`node:sqlite`).
- **NPM**: Standard package manager.

## Quick Start (Connected Mode)

To start both the **Backend API** and the **Vite Dev Server** simultaneously:

```bash
npm run dev:full
```

Your dashboard will be available at `http://localhost:5173`. Any changes you make to the code will live-reload automatically.

---

## Running Components Separately

For better debugging, you might want to run the components in separate terminal windows.

### 1. Start the Backend API

This starts the Node.js server that manages the SQLite database.

```bash
npm run server
```

- **Port**: Defined in `metadata.json` (Default: `8080`)
- **Database**: Saved to `./data/siftly.db`
- **User Scope**: API routes use `X-User-Id` headers to isolate profile data

### 2. Start the Frontend Dev Server

This starts the Vite server with Hot Module Replacement (HMR).

```bash
npm run dev:web
```

- **Port**: `5173`
- **Proxy**: Automatically forwards `/api` requests to the backend on port `8080`.

---

## Configuration

Siftly uses a centralized `metadata.json` file in the root directory to manage its operating environment.

```json
"server": {
  "port": 8080,
  "apiBase": "/api"
}
```

If you need to change the port (e.g., if `8080` is in use), simply update it in `metadata.json` and restart the servers. Both the backend and the Vite proxy will pick up the new port automatically.

## Storage Isolation

- **Local Mode**: Uses the SQLite backend on your machine. Perfect for private, offline tracking.
- **Extension Mode**: Uses your remote Supabase instance. Used when building for the Chrome Web Store.

In local web mode, data is persisted in the SQLite file (`./data/siftly.db`) and survives browser cache clears as long as your `data` directory is preserved.

Data created in Local Mode is stored purely on your server/machine and is never synchronized with Supabase.
