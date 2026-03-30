import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Siftly Docs',
  tagline: 'Your job search control panel — comprehensive documentation for users and developers.',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://piero24.github.io',
  baseUrl: '/Siftly/',

  organizationName: 'Piero24',
  projectName: 'Siftly',

  onBrokenLinks: 'warn',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

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
          editUrl: 'https://github.com/Piero24/Siftly/tree/main/documentation/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/Piero24/Siftly/tree/main/documentation/',
          blogTitle: 'Siftly Blog',
          blogDescription: 'Updates, changelogs, and announcements from the Siftly team.',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/siftly-social-card.png',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    announcementBar: {
      id: 'beta_notice',
      content:
        '🚀 Siftly is in active development. <a href="/Siftly/docs/intro">Check the docs</a> for the latest updates!',
      backgroundColor: '#007AFF',
      textColor: '#ffffff',
      isCloseable: true,
    },
    navbar: {
      title: 'Siftly',
      logo: {
        alt: 'Siftly logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          to: '/blog',
          label: 'Blog',
          position: 'left',
        },
        {
          href: 'https://github.com/Piero24/Siftly',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            { label: 'Getting Started', to: '/docs/intro' },
            { label: 'User Guide', to: '/docs/category/user-guide' },
            { label: 'Developer Guide', to: '/docs/category/developer-guide' },
          ],
        },
        {
          title: 'Community',
          items: [
            { label: 'GitHub Discussions', href: 'https://github.com/Piero24/Siftly/discussions' },
            { label: 'Issues', href: 'https://github.com/Piero24/Siftly/issues' },
            {
              label: 'Contributing',
              href: 'https://github.com/Piero24/Siftly/blob/main/CONTRIBUTING.md',
            },
          ],
        },
        {
          title: 'Project',
          items: [
            { label: 'Repository', href: 'https://github.com/Piero24/Siftly' },
            {
              label: 'Changelog',
              href: 'https://github.com/Piero24/Siftly/blob/main/CHANGELOG.md',
            },
            { label: 'License (Prosperity-3.0.0)', href: 'https://github.com/Piero24/Siftly/blob/main/LICENSE' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Siftly — Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'yaml', 'json', 'sql', 'docker'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
