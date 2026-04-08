import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
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
    {
      type: 'category',
      label: 'Developer Guide',
      items: [
        'developer/architecture',
        'developer/storage',
        'developer/auth',
        'developer/deployment-modes',
        'developer/theming',
        'developer/testing',
        'developer/contributing',
      ],
    },
    {
      type: 'category',
      label: 'Roadmap',
      items: ['roadmap/linkedin-scraper', 'roadmap/linkedin-llm'],
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
  ],
};

export default sidebars;
