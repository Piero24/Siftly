---
sidebar_position: 4
---

# Versioning and Releases

This page defines the official Siftly release flow for alpha, beta, rc, and stable versions.

## Current Workflow Behavior

Release behavior is driven by two inputs:

1. A pushed Git tag that starts with `v` (for example `v1.2.0` or `v1.2.0-beta.1`)
2. The `version` field in `package.json`

Important: for extension prerelease classification, the workflow reads `package.json` version text and checks for `alpha`, `beta`, `rc`, or `dev`.

## Supported Version Formats

Use SemVer with prerelease identifiers:

- Alpha: `1.2.0-alpha.1`
- Beta: `1.2.0-beta.1`
- RC: `1.2.0-rc.1`
- Stable production: `1.2.0`

## Required Tag Format

Tags must be `v` + package version:

- `v1.2.0-alpha.1`
- `v1.2.0-beta.1`
- `v1.2.0-rc.1`
- `v1.2.0`

## Outcome Matrix

| Version kind      | Example version | Example tag     | GitHub Release  | Chrome Web Store | Docker deploy |
| ----------------- | --------------- | --------------- | --------------- | ---------------- | ------------- |
| Alpha/Beta/RC/Dev | `1.2.0-beta.1`  | `v1.2.0-beta.1` | Prerelease      | Skipped          | Runs          |
| Stable            | `1.2.0`         | `v1.2.0`        | Regular release | Published        | Runs          |

## Release Checklist

1. Update `package.json` version.
2. Create a matching `v` tag.
3. Push commit and tag.
4. Verify workflow outputs.

### Commands (Manual)

```bash
# Example: beta release
npm version 1.2.0-beta.1
git push origin main
git push origin v1.2.0-beta.1
```

```bash
# Example: stable release
npm version 1.2.0
git push origin main
git push origin v1.2.0
```

### Commands (npm-managed tags)

`npm version` can also create the tag for you. In that case, push with:

```bash
git push origin main --follow-tags
```

## Consistency Check (Recommended)

Before pushing a tag, validate tag and package version are aligned:

```bash
PKG_VERSION=$(node -p "require('./package.json').version")
TAG_VERSION="v$PKG_VERSION"
echo "$TAG_VERSION"
```

If the tag and `package.json` version do not match, release behavior may be wrong (for example, accidental Chrome publish or mislabeled prerelease).

## Why This Matters

The extension workflow trigger uses tag pattern `v*`, but prerelease detection uses `package.json` version content. Keep both values in sync for predictable alpha/beta/rc/prod automation.
