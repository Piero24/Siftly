/**
 * ModalReferralCard — Referral information sidebar card.
 */
import React from 'react';
import { UserPlusIcon, CalendarIcon, LinkIcon } from '../../common/Icons';
import type { Referral } from '../../../types/job';

interface ModalReferralCardProps {
  referral: Referral;
}

export const ModalReferralCard: React.FC<ModalReferralCardProps> = ({ referral }) => (
  <div className="modal-side-card">
    <h3 className="side-card-title">Referral Info</h3>
    <div className="side-detail-row">
      <span className="side-detail-label">
        <UserPlusIcon size={14} /> Referrer
      </span>
      <span className="side-detail-value">{referral.referrer}</span>
    </div>
    {(referral.date || referral.note) && (
      <div
        className="side-detail-row"
        style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}
      >
        <span className="side-detail-label">
          <CalendarIcon size={14} /> {referral.date}
        </span>
        {referral.note && (
          <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>"{referral.note}"</span>
        )}
      </div>
    )}
    {(referral.link || referral.code) && (
      <div className="side-detail-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <span className="side-detail-label">
          <LinkIcon size={14} /> Details
        </span>
        <span className="side-detail-value" style={{ display: 'flex', gap: '8px' }}>
          {referral.code && (
            <span
              className="copyable-pill"
              title="Click to copy"
              onClick={() => navigator.clipboard.writeText(referral.code!)}
            >
              {referral.code}
            </span>
          )}
          {referral.link && (
            <a
              href={referral.link}
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--apple-blue)', textDecoration: 'none', fontSize: '13px' }}
            >
              Link ↗
            </a>
          )}
        </span>
      </div>
    )}
  </div>
);
