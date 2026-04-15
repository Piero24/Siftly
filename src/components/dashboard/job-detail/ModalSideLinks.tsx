/**
 * ModalSideLinks — Sidebar external link buttons (job post, LinkedIn, website).
 */
import React from 'react';
import { LinkIcon, LinkedinIcon, GlobeIcon } from '../../common/Icons';

interface ModalSideLinksProps {
  links?: {
    job?: string;
    linkedin?: string;
    website?: string;
  };
}

export const ModalSideLinks: React.FC<ModalSideLinksProps> = ({ links }) => {
  if (!links?.job && !links?.linkedin && !links?.website) return null;

  return (
    <div className="modal-side-card" style={{ background: 'transparent', border: 'none', padding: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {links?.job && (
          <a href={links.job} className="sidebar-link-btn" target="_blank" rel="noreferrer">
            <div className="sidebar-link-left"><LinkIcon size={16} /> Job Post</div>
            <span style={{ color: 'var(--text-secondary)' }}>↗</span>
          </a>
        )}
        {links?.linkedin && (
          <a href={links.linkedin} className="sidebar-link-btn" target="_blank" rel="noreferrer">
            <div className="sidebar-link-left"><LinkedinIcon size={16} /> Profile Link</div>
            <span style={{ color: 'var(--text-secondary)' }}>↗</span>
          </a>
        )}
        {links?.website && (
          <a href={links.website} className="sidebar-link-btn" target="_blank" rel="noreferrer">
            <div className="sidebar-link-left"><GlobeIcon size={16} /> Website</div>
            <span style={{ color: 'var(--text-secondary)' }}>↗</span>
          </a>
        )}
      </div>
    </div>
  );
};
