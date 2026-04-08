---
sidebar_position: 2
---

# Chrome Extension Setup

## Install from Chrome Web Store

1. Visit the [Siftly Chrome Web Store page](#) (link available after first release).
2. Click **Add to Chrome**.
3. Pin the Siftly icon to your toolbar for quick access.

## Load as Unpacked Extension (Development)

1. Build the extension:
   ```bash
   npm run build:extension
   ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the `dist/` folder.
5. The Siftly icon should appear in your toolbar.

## Using the Extension

### Popup

Click the Siftly icon in your toolbar to open the quick-access popup. From here you can:

- Open the dashboard
- Manually insert the job application
- Automatically capture the job application

### Dashboard

Click **Open Dashboard** in the popup (or navigate to the dashboard URL) to access:

- Full application table with filtering and search
- Analytics charts and world map
- Interview management
- Settings and CV profiles

## Authentication

The Chrome extension uses **OAuth authentication** via Supabase:

- **Google** — Sign in with your Google account
- **GitHub** — Sign in with your GitHub account
- **Apple** — Sign in with your Apple ID (NOT IMPLMENTED YET)

Your data is stored securely in the cloud and synced across devices.

## Troubleshooting

| Issue                      | Solution                                                     |
| -------------------------- | ------------------------------------------------------------ |
| Extension icon not showing | Click the puzzle piece icon in Chrome toolbar and pin Siftly |
| Login not working          | Check that popups are allowed for the Supabase auth URL      |
| Data not syncing           | Verify your Supabase credentials in the extension settings   |
