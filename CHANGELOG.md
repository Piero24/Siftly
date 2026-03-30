# Changelog

All notable changes to Siftly will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Deployment-aware storage mode: web (local), extension (remote), dev (switchable)
- Deployment-aware authentication: local profile for self-hosted, OAuth for extension
- LinkedIn scraper skeleton with implementation plan
- LinkedIn LLM scraper skeleton with implementation plan
- Comprehensive Docusaurus documentation
- CI/CD pipeline: lint, test, build web/extension/docs, Docker deploy, Chrome Web Store publish
- Automatic Supabase DB migration workflow
- Docker multi-arch builds (amd64 + arm64) with GitHub Container Registry
- GitHub issue templates (bug report, feature request)
- CONTRIBUTING.md with development guidelines
- This CHANGELOG

### Changed

- Storage mode toggle removed from Settings UI (now deployment-determined)
- Debug toolbar upgraded with 3-way storage toggle and deployment mode badge
- Login page shows profile creation form (web) or OAuth buttons (extension) based on deployment
- Features config now derives auth flags from deployment mode

### Removed

- `allowLocalOnly` flag from supabaseClient.ts (replaced by deployment mode)
- Storage mode selector from Settings view (read-only label instead)
- "Continue without account" button (replaced by profile creation flow)

## [1.0.0] - 2026-03-28

### Added

- Initial release of Siftly Job Tracker
- Chrome extension with popup and full dashboard
- Self-hosted Docker deployment with CasaOS support
- Job application CRUD with rich detail modals
- Interview round management
- Analytics dashboard with world map, charts, and KPIs
- CSV import/export
- Supabase remote storage with IndexedDB local fallback
- Dual-sync storage adapter
- Theme support (light/dark/system)
- CV profile management
- Auto "No Response" marking
- Debug toolbar with mock data mode
