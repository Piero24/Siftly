/**
 * ModalRecruiterCard — HR / Recruiter contact information sidebar card.
 */
import React from 'react';
import { UserPlusIcon, GlobeIcon, ClockIcon } from '../../common/Icons';
import type { Recruiter } from '../../../types/job';

interface ModalRecruiterCardProps {
  recruiter: Recruiter;
}

export const ModalRecruiterCard: React.FC<ModalRecruiterCardProps> = ({ recruiter }) => (
  <div className="modal-side-card">
    <h3 className="side-card-title">HR / Recruiter</h3>
    <div className="side-detail-row">
      <span className="side-detail-label">
        <UserPlusIcon size={14} /> Name
      </span>
      <span className="side-detail-value">{recruiter.name}</span>
    </div>
    {recruiter.email && (
      <div className="side-detail-row">
        <span className="side-detail-label">
          <GlobeIcon size={14} /> Email
        </span>
        <span className="side-detail-value">
          <a
            href={`mailto:${recruiter.email}`}
            style={{ color: 'var(--apple-blue)', textDecoration: 'none' }}
          >
            Email ↗
          </a>
        </span>
      </div>
    )}
    {recruiter.phone && (
      <div className="side-detail-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <span className="side-detail-label">
          <ClockIcon size={14} /> Phone
        </span>
        <span className="side-detail-value">{recruiter.phone}</span>
      </div>
    )}
  </div>
);
