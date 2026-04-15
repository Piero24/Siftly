/**
 * SupportCard — Links to GitHub, docs, and support email.
 */
import React from 'react';
import { LifeBuoyIcon, GithubIcon, BookOpenIcon, MessageIcon } from '../common/Icons';
import { SettingsCard } from '../common/SettingsCard';
import { APP_INFO } from '../../config/app';

export const SupportCard: React.FC = () => (
  <SettingsCard icon={<LifeBuoyIcon size={22} />} title="Support & Community">
    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
      Need help or have a suggestion? We're here for you.
    </p>
    <div className="support-actions">
      <a
        href={APP_INFO.links.github}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none' }}
      >
        <button className="btn-apple btn-outline">
          <GithubIcon size={14} /> GitHub
        </button>
      </a>
      <a
        href={APP_INFO.links.docs}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none' }}
      >
        <button className="btn-apple btn-outline">
          <BookOpenIcon size={14} /> Documentation
        </button>
      </a>
      <a
        href={APP_INFO.links.issues}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none' }}
      >
        <button className="btn-apple btn-outline">
          <MessageIcon size={14} /> Report an Issue
        </button>
      </a>
    </div>
    <div
      style={{
        marginTop: '16px',
        fontSize: '12px',
        color: 'var(--text-secondary)',
        textAlign: 'center',
      }}
    >
      Version {APP_INFO.version}
    </div>
  </SettingsCard>
);
