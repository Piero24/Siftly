import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/docs/intro">
            Get Started →
          </Link>
          <Link
            className="button button--outline button--lg"
            to="https://github.com/Piero24/Siftly"
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', marginLeft: 12 }}
          >
            ⭐ GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}

const features = [
  {
    emoji: '📊',
    title: 'Analytics Dashboard',
    description:
      'Track your job search with interactive charts, world maps, KPIs, and funnel analysis.',
  },
  {
    emoji: '🔍',
    title: 'LinkedIn Scraper',
    description: 'One-click import from LinkedIn job pages with optional AI-powered extraction.',
  },
  {
    emoji: '🧩',
    title: 'Chrome Extension',
    description: 'Lightweight popup for quick saves, with a full dashboard for deep management.',
  },
  {
    emoji: '🐳',
    title: 'Self-Hosted',
    description: 'Run Siftly on your own server with Docker. Full privacy, no cloud required.',
  },
  {
    emoji: '🔐',
    title: 'Flexible Auth',
    description:
      'OAuth for the extension, simple local profiles for self-hosted — deployment-aware.',
  },
  {
    emoji: '📦',
    title: 'Import & Export',
    description: 'CSV import/export, dual-sync storage (local + cloud), and full data portability.',
  },
];

function HomepageFeatures() {
  return (
    <section style={{ padding: '4rem 0' }}>
      <div className="container">
        <div className="row">
          {features.map((f, i) => (
            <div key={i} className="col col--4" style={{ marginBottom: '2rem' }}>
              <div className="feature-card">
                <span className="feature-emoji">{f.emoji}</span>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Siftly — Job Search Control Panel"
      description="Siftly is a professional job application tracker available as a Chrome extension and self-hosted web app."
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
