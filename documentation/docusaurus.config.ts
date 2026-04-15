import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import metadata from '../metadata.json';

const docsEditUrl = `${metadata.links.github}/${metadata.docs.editPath}`;
const docsIntroLink = `${metadata.docs.baseUrl}docs/intro`;

const config: Config = {
  title: metadata.docs.title,
  tagline: metadata.docs.tagline,
  favicon: metadata.branding.docsFavicon,

  url: metadata.docs.url,
  baseUrl: metadata.docs.baseUrl,

  organizationName: metadata.docs.organizationName,
  projectName: metadata.docs.projectName,

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: docsEditUrl,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: metadata.branding.docsSocialCard,
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    announcementBar: {
      id: 'beta_notice',
      content: `🚀 Siftly is in active development. <a href="${docsIntroLink}">Check the docs</a> for the latest updates!`,
      backgroundColor: '#007AFF',
      textColor: '#ffffff',
      isCloseable: true,
    },
    navbar: {
      title: metadata.product.name,
      logo: {
        alt: metadata.branding.logoAlt,
        src: metadata.branding.docsLogo,
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'userSidebar',
          position: 'left',
          label: 'User Guide',
        },
        {
          type: 'docSidebar',
          sidebarId: 'devSidebar',
          position: 'left',
          label: 'Developer Guide',
        },
        {
          href: metadata.links.github,
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'User Guide',
          items: [
            { label: 'Getting Started', to: '/docs/intro' },
            { label: 'Dashboard', to: '/docs/user-guide/dashboard' },
            { label: 'Applications', to: '/docs/user-guide/applications' },
            { label: 'Settings', to: '/docs/user-guide/settings' },
          ],
        },
        {
          title: 'Developer Guide',
          items: [
            { label: 'Architecture', to: '/docs/developer/architecture' },
            { label: 'Contributing', to: '/docs/developer/contributing' },
            { label: 'CI/CD Pipeline', to: '/docs/deployment/ci-cd' },
          ],
        },
        {
          title: 'Community',
          items: [
            { label: 'GitHub Discussions', href: metadata.links.community },
            { label: 'Issues', href: metadata.links.issues },
            {
              label: 'Contributing',
              href: metadata.links.contributing,
            },
          ],
        },
        {
          title: 'Project',
          items: [
            { label: 'Repository', href: metadata.links.github },
            {
              label: 'Changelog',
              href: metadata.links.changelog,
            },
            {
              label: 'License (Prosperity-3.0.0)',
              href: metadata.links.license,
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ${metadata.product.name} — Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'yaml', 'json', 'sql', 'docker'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
