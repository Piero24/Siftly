---
sidebar_position: 2
---

# Project Structure

```
Siftly/
├── .github/
│   ├── ISSUE_TEMPLATE/          # Bug report, feature request templates
│   └── workflows/               # CI/CD pipelines
│       ├── ci.yml               # Lint, test, build
│       ├── deploy-docs.yml      # GitHub Pages deployment
│       ├── deploy-docker.yml    # GHCR Docker image
│       ├── release-extension.yml # Chrome Web Store release
│       └── db-migration.yml     # Supabase migrations
├── documentation/               # Docusaurus docs site
│   ├── docs/                    # Markdown documentation
│   ├── blog/                    # Blog posts
│   └── src/                     # Custom pages and CSS
├── public/                      # Static assets
├── src/
│   ├── assets/                  # Logo, icons, images
│   ├── background/              # Extension background script
│   ├── components/
│   │   ├── auth/                # LoginPage
│   │   ├── common/              # Shared UI (Badge, ComboBox, etc.)
│   │   ├── dashboard/           # Views (Overview, Apps, Interviews, Settings)
│   │   ├── debug/               # DebugToolbar
│   │   └── layout/              # Layout wrappers
│   ├── config/
│   │   ├── app.ts               # APP_INFO, DEBUG_CONFIG
│   │   ├── deploymentMode.ts    # DEPLOYMENT mode + capabilities
│   │   ├── features.ts          # Feature flags
│   │   └── links.ts             # External URLs
│   ├── content/                 # Extension content script
│   ├── context/
│   │   ├── AuthContext.tsx       # Authentication state
│   │   ├── SettingsContext.tsx   # User preferences
│   │   ├── UIContext.tsx         # Navigation state
│   │   ├── SelectionContext.tsx  # Row selection
│   │   ├── TableFilterContext.tsx # Table filters
│   │   └── ToastContext.tsx      # Toast notifications
│   ├── dashboard/               # Dashboard App entrypoint
│   ├── hooks/
│   │   └── useJobApplications.ts # Main data hook
│   ├── lib/
│   │   ├── storage.ts           # Storage adapter factory
│   │   ├── localAuth.ts         # Local profile management
│   │   ├── supabaseClient.ts    # Supabase singleton
│   │   ├── analytics.ts         # Chart data aggregation
│   │   ├── csv.ts               # CSV import/export
│   │   └── logger.ts            # Logging utility
│   ├── popup/                   # Extension popup entrypoint
│   ├── scraper/
│   │   ├── linkedin/            # DOM-based LinkedIn scraper
│   │   └── linkedin-llm/        # LLM-enhanced scraper
│   ├── styles/                  # CSS (tokens, glass, settings, debug)
│   ├── test/                    # Test setup and mocks
│   ├── types/                   # TypeScript definitions
│   └── web/                     # Web (self-hosted) entrypoint
├── supabase/                    # Database schema and migrations
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── Dockerfile.web
├── docker-compose.yml
└── vite.config.ts
```
