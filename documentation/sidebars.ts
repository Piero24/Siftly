import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  userSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/installation',
        'getting-started/chrome-extension',
        'getting-started/docker',
        'getting-started/configuration',
        'getting-started/local-development',
      ],
    },
    {
      type: 'category',
      label: 'User Guide',
      items: [
        'user-guide/dashboard',
        'user-guide/applications',
        'user-guide/interviews',
        'user-guide/analytics',
        'user-guide/csv',
        'user-guide/settings',
      ],
    },
  ],
  devSidebar: [
    {
      type: 'category',
      label: 'Developer Guide',
      collapsed: false,
      items: [
        'developer/architecture',
        'developer/storage',
        'developer/local-api',
        'developer/database',
        'developer/auth',
        'developer/security-checklist',
        'developer/deployment-modes',
        'developer/theming',
        'developer/testing',
        'developer/product-metadata',
        'developer/contributing',
      ],
    },
    {
      type: 'category',
      label: 'Deployment',
      items: [
        'deployment/docker',
        'deployment/chrome-web-store',
        'deployment/ci-cd',
        'deployment/versioning-and-releases',
      ],
    },
    {
      type: 'category',
      label: 'Roadmap',
      items: ['roadmap/linkedin-scraper', 'roadmap/linkedin-llm'],
    },
  ],
};

export default sidebars;
