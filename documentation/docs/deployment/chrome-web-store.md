---
sidebar_position: 2
---

# Chrome Web Store Publishing

This guide explains the process of publishing the Siftly extension to the Chrome Web Store.

## Manual Packaging

If you want to manually create a package for upload:

1. Build the production extension:
   ```bash
   npm run build:extension
   ```
2. Compress the contents of the `dist/` directory into a ZIP file:
   ```bash
   cd dist && zip -r ../siftly-extension.zip .
   ```
3. Upload `siftly-extension.zip` to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard).

## Automated Publishing (CI/CD)

The Siftly repository includes a GitHub Action to automate publishing on tag releases.

### Prerequisites

You must set up the following secrets in your GitHub repository:

- `CHROME_EXTENSION_ID`: The ID allocated by the Chrome Web Store.
- `CHROME_CLIENT_ID`: Google Cloud API Client ID.
- `CHROME_CLIENT_SECRET`: Google Cloud API Client Secret.
- `CHROME_REFRESH_TOKEN`: OAuth2 Refresh Token for the Chrome Web Store API.

### Workflow Trigger

The `Release Extension` workflow triggers when a new tag starting with `v` is pushed:

- **Beta/Alpha tags** (e.g., `v1.0.0-beta`): Create a pre-release on GitHub and upload the artifact, but **do not** publish to the Web Store.
- **Production tags** (e.g., `v1.0.0`): Create a release on GitHub and **automatically publish** to the Chrome Web Store.

## Store Assets Needed

When publishing, you will need to provide:

- **Icons**: 128x128px png.
- **Screenshots**: At least one 1280x800 or 640x400.
- **Promotional Tiles**: Small (440x280), Large (920x680), and Marquee (1400x560).
- **Description**: A clear overview of Siftly's features.
- **Privacy Policy**: Required for extensions that collect user data (even if only synced to Supabase).
