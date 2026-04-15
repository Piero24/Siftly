/**
 * JobDetailModal — Full-detail view for a single job application.
 *
 * Orchestrates layout and delegates sections to focused sub-components
 * in `./job-detail/`. Supports live currency conversion via useSalary hook.
 */
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { XIcon, TrashIcon, EditIcon } from '../common/Icons';
import { CompanyIcon } from './CompanyIcon';
import { EmploymentTypeBadge } from './EmploymentTypeBadge';
import { StatusDropdown } from './StatusDropdown';
import { CountryDisplay } from '../common/CountryDisplay';
import { StarRating } from '../common/StarRating';
import { useSalary } from '../../hooks/useSalary';
import { CVProfile, JobApplication } from '../../types/job';
import type { JobStatus } from '../../types/job';

import { ModalHighlightRow } from './job-detail/ModalHighlightRow';
import { ModalSideLinks } from './job-detail/ModalSideLinks';
import { ModalTrackingCard } from './job-detail/ModalTrackingCard';
import { ModalRecruiterCard } from './job-detail/ModalRecruiterCard';
import { ModalReferralCard } from './job-detail/ModalReferralCard';
import { ModalRoundsSection } from './job-detail/ModalRoundsSection';

interface JobDetailModalProps {
  job: JobApplication;
  onClose: () => void;
  onStatusChange: (id: string, status: JobStatus) => void;
  onDelete: (id: string) => void;
  onEdit: () => void;
  /** ISO 4217 currency code from the user's settings. */
  displayCurrency: string;
  cvProfiles: CVProfile[];
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job, onClose, onStatusChange, onDelete, onEdit, displayCurrency, cvProfiles,
}) => {
  const formattedSalary = useSalary(job.salary, displayCurrency);
  const cvProfile = cvProfiles.find((profile) => profile.id === job.cvProfileId);

  const handleDelete = () => {
    if (window.confirm('Delete this application? This cannot be undone.')) {
      onDelete(job.id);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-container" onClick={(e) => e.stopPropagation()}>

        {/* ── Close ── */}
        <button className="modal-close-btn" onClick={onClose} title="Close">
          <XIcon size={14} />
        </button>

        {/* ── Scrollable Body ── */}
        <div className="modal-body-scrollable">
          {/* ── Company Header ── */}
          <div className="modal-header">
            <div className="modal-header-left">
              <CompanyIcon name={job.company} logo={job.logo} size={52} website={job.links?.website} linkedin={job.links?.linkedin} />
              <div className="modal-company-info">
                <span className="modal-company-name">{job.company}</span>
                {job.rating !== undefined && <StarRating value={job.rating} />}
              </div>
            </div>
          </div>

          {/* ── Hero: Title + Meta + Status ── */}
          <div className="modal-hero">
            <div className="modal-hero-left">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <EmploymentTypeBadge type={job.employmentType} />
              </div>
              <h1 className="modal-job-title">{job.position}</h1>
              
              <div className="modal-meta-row">
                <span className="modal-sector-tag">{job.sector}</span>
                <span className="modal-separator">•</span>
                <CountryDisplay code={job.country} />
                <span className="modal-city-pill">{job.city}</span>
              </div>
            </div>

            <div className="modal-status-box">
              <StatusDropdown
                status={job.status}
                onChange={(s) => onStatusChange(job.id, s)}
              />
            </div>
          </div>

          {/* ── Highlight Row ── */}
          <ModalHighlightRow job={job} formattedSalary={formattedSalary} />

          {/* ── Body Layout (main + sidebar) ── */}
          <div className="modal-body-layout">
            <div className="modal-main-column">
              {/* Description */}
              <section className="modal-section">
                <h3 className="section-title">Job Description</h3>
                <div className="modal-description-box markdown-body">
                  {job.description ? <ReactMarkdown>{job.description}</ReactMarkdown> : 'No description provided.'}
                </div>
              </section>

              {/* Notes */}
              {job.notes && (
                <section className="modal-section">
                  <h3 className="section-title">My Notes</h3>
                  <div className="modal-notes-box markdown-body"><ReactMarkdown>{job.notes}</ReactMarkdown></div>
                </section>
              )}

              {/* Interview Rounds */}
              <ModalRoundsSection rounds={job.rounds || []} />
            </div>

            {/* Sidebar */}
            <div className="modal-side-column">
              <ModalSideLinks links={job.links} />
              <ModalTrackingCard job={job} cvProfile={cvProfile} />
              {job.recruiter && <ModalRecruiterCard recruiter={job.recruiter} />}
              {job.referral && <ModalReferralCard referral={job.referral} />}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="modal-footer">
            <button className="btn-apple btn-destructive" onClick={handleDelete}>
              <TrashIcon size={14} /> Delete Application
            </button>
            <button className="btn-apple btn-primary" onClick={onEdit}>
              <EditIcon size={14} /> Edit Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
