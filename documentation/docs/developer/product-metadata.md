---
sidebar_position: 8
---

# Product Metadata

Siftly now uses a single source of truth for product information:

- `metadata.json` in the repository root

If you need to change app name, version, logo paths, links, docs branding, or extension display metadata, edit `metadata.json` first.

## What Lives in `metadata.json`

| Section     | Purpose                                                        |
| ----------- | -------------------------------------------------------------- |
| `version`   | Canonical release version used across app/docs/manifest        |
| `product`   | App/package names, tagline, extension description              |
| `branding`  | Shared logo/image paths and alt text                           |
| `links`     | GitHub/docs/support/legal/community URLs                       |
| `docs`      | Docusaurus site metadata (title/tagline/url/baseUrl/edit path) |
| `extension` | Extension action title metadata                                |

## Update Workflow

1. Edit `metadata.json`.
2. Run metadata sync:

```bash
npm run metadata:sync
```

3. Validate everything is in sync:

```bash
npm run metadata:verify
```

## Files Generated/Synced from Metadata

`npm run metadata:sync` updates these files automatically:

- `package.json`
- `public/manifest.json`
- `documentation/package.json`
- `README.md` (version badge)
- `.release-please-manifest.json` (Release Please state)

## Which File to Edit for Common Changes

| Goal                                      | Edit                                                                                      | Then run                                  |
| ----------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------- |
| Bump app version                          | `metadata.json` → `version`                                                               | `npm run metadata:sync`                   |
| Rename product/package                    | `metadata.json` → `product.*`                                                             | `npm run metadata:sync`                   |
| Change extension display name/description | `metadata.json` → `product.name`, `product.manifestDescription`, `extension.defaultTitle` | `npm run metadata:sync`                   |
| Change docs title/tagline/base URL        | `metadata.json` → `docs.*`                                                                | `npm run docs:build`                      |
| Change external links                     | `metadata.json` → `links.*`                                                               | `npm run metadata:verify`                 |
| Change logos/images                       | `metadata.json` → `branding.*`                                                            | `npm run build:web && npm run docs:build` |

## CI Protection

CI enforces metadata consistency:

- `npm run metadata:verify` runs in CI and release workflows.
- If synced files are stale, CI fails with the list of files to update.

## Notes

- Keep legal and author identity fields where they already live (for example LICENSE and CasaOS author fields).
- Product metadata belongs in `metadata.json`.
- Release Please bumps `metadata.json` version and CI syncs the derived files listed above.

## Troubleshooting Release Merge Drift

If after merging a release PR CI reports metadata drift in derived files:

1. Run `npm run metadata:sync`.
2. Commit updated derived files.
3. Push to `main` and rerun CI.

The most common stale targets are `documentation/package.json`, `public/manifest.json`, and the `README.md` badge.
