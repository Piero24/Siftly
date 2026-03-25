/**
 * JobDetailModal — Full-detail view for a single job application.
 * Meta-row order: Sector · Country · City · Work Type
 * Supports live currency conversion via useSalary hook.
 */
import React from 'react';
import {
  XIcon, TrashIcon, EditIcon,
  DollarIcon, CalendarIcon, ClockIcon,
  LinkIcon, LinkedinIcon, GlobeIcon,
  UserPlusIcon, BookOpenIcon, VideoIcon, MapPinIcon
} from '../common/Icons';
import { CompanyIcon }    from './CompanyIcon';
import { WorkTypeBadge }  from './WorkTypeBadge';
import { EmploymentTypeBadge } from './EmploymentTypeBadge';
import { StatusDropdown } from './StatusDropdown';
import { CountryDisplay } from '../common/CountryDisplay';
import { StarRating }     from '../common/StarRating';
import { useSalary }      from '../../hooks/useSalary';
import { CVProfile, JobApplication } from '../../types/job';
import type { JobStatus } from '../../types/job';

interface JobDetailModalProps {
  job:              JobApplication;
  onClose:          () => void;
  onStatusChange:   (id: string, status: JobStatus) => void;
  onDelete:         (id: string) => void;
  onEdit:           () => void;
  /** ISO 4217 currency code from the user's settings */
  displayCurrency:  string;
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

        {/* ── Company Header ── */}
        <div className="modal-header">
          <div className="modal-header-left">
            <CompanyIcon name={job.company} logo={job.logo} website={job.links?.website} linkedin={job.links?.linkedin} />
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
            {/* Order: Sector • Country • City • Work Type */}
            <div className="modal-meta-row">
              <span className="modal-sector-tag">{job.sector}</span>
              <span className="modal-separator">•</span>
              <CountryDisplay code={job.country} />
              <span className="modal-city-pill">{job.city}</span>
              <span className="modal-separator">•</span>
              <WorkTypeBadge type={job.workType} />
            </div>
          </div>
          <div className="modal-status-box">
            <StatusDropdown
              status={job.status}
              onChange={(s) => onStatusChange(job.id, s)}
            />
          </div>
        </div>

        {/* ── Details Grid ── */}
        <div className="modal-details-grid">
          <div className="detail-item">
            <div className="detail-label"><DollarIcon size={14} /> Salary</div>
            <div className="detail-value">{formattedSalary}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label"><CalendarIcon size={14} /> Applied</div>
            <div className="detail-value">{job.date}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label"><ClockIcon size={14} /> Work Type</div>
            <div className="detail-value" style={{ textTransform: 'capitalize' }}>{job.workType}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label"><BookOpenIcon size={14} /> Employment</div>
            <div className="detail-value" style={{ textTransform: 'capitalize' }}>
              {job.employmentType ? job.employmentType.replace('-', ' ') : 'permanent'}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label"><BookOpenIcon size={14} /> CV Profile</div>
            <div className="detail-value" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              {cvProfile ? (
                <>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: cvProfile.color, display: 'inline-block' }} />
                  {cvProfile.name}
                </>
              ) : 'None'}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label"><ClockIcon size={14} /> Phone Screens</div>
            <div className="detail-value">{job.phoneScreens || 0}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label"><BookOpenIcon size={14} /> Interviews</div>
            <div className="detail-value">{job.interviews || 0}</div>
          </div>
        </div>

        {/* ── Job Description ── */}
        <section className="modal-section">
          <h3 className="section-title">Job Description</h3>
          <div className="modal-description-box">
            {job.description || 'No description provided.'}
          </div>
        </section>

        {/* ── User Notes ── */}
        {job.notes && (
          <section className="modal-section">
            <h3 className="section-title">My Notes</h3>
            <div className="modal-notes-box">{job.notes}</div>
          </section>
        )}

        {/* ── Interview Rounds ── */}
        {job.rounds && job.rounds.length > 0 && (
          <section className="modal-section">
            <h3 className="section-title">Interview Rounds</h3>
            <div className="modal-referral-grid" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[...job.rounds].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(r => (
                <div key={r.id} style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface-muted)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><ClockIcon size={12} /> Round #{r.roundNumber}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{r.date ? new Date(r.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'TBD'}</span>
                  </div>
                  {(r.interviewerName || r.interviewerContact) && (
                    <div style={{ marginTop: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <UserPlusIcon size={12} style={{ color: 'var(--text-secondary)' }} />
                      <span>{r.interviewerName || 'Unknown Contact'} {r.interviewerContact && `(${r.interviewerContact})`}</span>
                    </div>
                  )}
                  {(r.meetingLink || r.location) && (
                    <div style={{ marginTop: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {r.meetingLink && (
                        <a href={r.meetingLink} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-primary)', textDecoration: 'none' }}>
                          <VideoIcon size={12} style={{ color: '#AF52DE' }} /> Join Meeting
                        </a>
                      )}
                      {r.location && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                          <MapPinIcon size={12} style={{ color: '#FF3B30' }} /> {r.location}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Recruiter Info ── */}
        {job.recruiter && (
          <section className="modal-section">
            <h3 className="section-title">HR / Recruiter Contact</h3>
            <div className="modal-referral-grid">
              <div className="detail-item">
                <div className="detail-label"><UserPlusIcon size={14} /> Name</div>
                <div className="detail-value">{job.recruiter.name}</div>
              </div>
              {job.recruiter.email && (
                <div className="detail-item">
                  <div className="detail-label"><GlobeIcon size={14} /> Email</div>
                  <div className="detail-value">{job.recruiter.email}</div>
                </div>
              )}
              {job.recruiter.phone && (
                <div className="detail-item">
                  <div className="detail-label"><ClockIcon size={14} /> Phone</div>
                  <div className="detail-value">{job.recruiter.phone}</div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Referral Info ── */}
        {job.referral && (
          <section className="modal-section">
            <h3 className="section-title">Referral Information</h3>
            <div className="modal-referral-grid">
              <div className="detail-item">
                <div className="detail-label"><UserPlusIcon size={14} /> Referrer</div>
                <div className="detail-value">{job.referral.referrer}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label"><CalendarIcon size={14} /> Date</div>
                <div className="detail-value">{job.referral.date}</div>
              </div>

              <div className="detail-item">
                <div className="detail-label"><EditIcon size={14} /> Note</div>
                <div className="detail-value">{job.referral.note}</div>
              </div>
              {job.referral.link && (
                <div className="detail-item">
                  <div className="detail-label"><LinkIcon size={14} /> Referral Link</div>
                  <div className="detail-value">
                    <a href={job.referral.link} className="referral-link" target="_blank" rel="noreferrer">
                      Open Link ↗
                    </a>
                  </div>
                </div>
              )}
              {job.referral.code && (
                <div className="detail-item">
                  <div className="detail-label"><GlobeIcon size={14} /> Referral Code</div>
                  <div className="detail-value">
                    <span
                      className="referral-code-pill"
                      title="Click to copy"
                      onClick={() => navigator.clipboard.writeText(job.referral!.code!)}
                    >
                      {job.referral.code}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Quick Links ── */}
        <section className="modal-links-section">
          <h3 className="section-title">Quick Links</h3>
          <div className="modal-links-grid">
            <a href={job.links.job}      className="modal-link-card" target="_blank" rel="noreferrer"><LinkIcon    size={16} /><span>Job Post</span></a>
            <a href={job.links.linkedin} className="modal-link-card" target="_blank" rel="noreferrer"><LinkedinIcon size={16} /><span>LinkedIn</span></a>
            <a href={job.links.website}  className="modal-link-card" target="_blank" rel="noreferrer"><GlobeIcon   size={16} /><span>Website</span></a>
          </div>
        </section>

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
  );
};
