/**
 * ModalTrackingCard — CV profile, phone screens, and interview count card.
 */
import React from 'react';
import { ClockIcon, BookOpenIcon } from '../../common/Icons';
import type { CVProfile, JobApplication } from '../../../types/job';

interface ModalTrackingCardProps {
  job: JobApplication;
  cvProfile?: CVProfile;
}

export const ModalTrackingCard: React.FC<ModalTrackingCardProps> = ({ job, cvProfile }) => (
  <div className="modal-side-card">
    <h3 className="side-card-title">Tracking</h3>
    <div className="side-detail-row">
      <span className="side-detail-label">
        <BookOpenIcon size={14} /> CV Profile
      </span>
      <span className="side-detail-value">
        {cvProfile ? (
          <>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: cvProfile.color,
              }}
            />
            {cvProfile.name}
          </>
        ) : (
          <span style={{ color: 'var(--text-secondary)' }}>None</span>
        )}
      </span>
    </div>
    <div className="side-detail-row">
      <span className="side-detail-label">
        <ClockIcon size={14} /> Phone Screens
      </span>
      <span className="side-detail-value">{job.phoneScreens || 0}</span>
    </div>
    <div className="side-detail-row">
      <span className="side-detail-label">
        <BookOpenIcon size={14} /> Interviews
      </span>
      <span className="side-detail-value">{job.interviews || 0}</span>
    </div>
  </div>
);
