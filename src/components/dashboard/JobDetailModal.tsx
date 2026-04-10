/**
 * JobDetailModal — Full-detail view for a single job application.
 * Meta-row order: Sector · Country · City · Work Type
 * Supports live currency conversion via useSalary hook.
 */
import React from 'react';
import ReactMarkdown from 'react-markdown';
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
          <div className="modal-highlight-row">
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
              <div className="detail-value"><WorkTypeBadge type={job.workType} /></div>
            </div>
            <div className="detail-item">
              <div className="detail-label"><BookOpenIcon size={14} /> Employment</div>
              <div className="detail-value employment-type-value">
                {job.employmentType ? job.employmentType.replace('-', ' ') : 'permanent'}
              </div>
            </div>
          </div>

          <div className="modal-body-layout">
            <div className="modal-main-column">
              <section className="modal-section">
                <h3 className="section-title">Job Description</h3>
                <div className="modal-description-box markdown-body">
                  {job.description ? <ReactMarkdown>{job.description}</ReactMarkdown> : 'No description provided.'}
                </div>
              </section>

              {job.notes && (
                <section className="modal-section">
                  <h3 className="section-title">My Notes</h3>
                  <div className="modal-notes-box markdown-body"><ReactMarkdown>{job.notes}</ReactMarkdown></div>
                </section>
              )}

              {job.rounds && job.rounds.length > 0 && (
                <section className="modal-section">
                  <h3 className="section-title">Interview Rounds</h3>
                  <div className="modal-rounds-container">
                    {[...job.rounds].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(r => (
                      <div key={r.id} className="modal-round-card">
                        <div className="modal-round-header">
                          <h4 className="modal-round-title"><ClockIcon size={14} /> Round #{r.roundNumber}</h4>
                          <span className="modal-round-subtitle">{r.date ? new Date(r.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'TBD'}</span>
                        </div>
                        {(r.interviewerName || r.interviewerContact) && (
                          <div className="modal-round-detail" style={{ marginTop: '4px' }}>
                            <UserPlusIcon size={14} />
                            <span>{r.interviewerName || 'Unknown Contact'} {r.interviewerContact && `(${r.interviewerContact})`}</span>
                          </div>
                        )}
                        {(r.meetingLink || r.location) && (
                          <div className="modal-round-detail" style={{ gap: '12px' }}>
                            {r.meetingLink && (
                              <a href={r.meetingLink} target="_blank" rel="noreferrer" className="modal-round-link">
                                <VideoIcon size={14} style={{ color: '#AF52DE' }} /> Join Meeting
                              </a>
                            )}
                            {r.location && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <MapPinIcon size={14} style={{ color: '#FF3B30' }} /> {r.location}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="modal-side-column">
              <div className="modal-side-card" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {job.links?.job && (
                    <a href={job.links.job} className="sidebar-link-btn" target="_blank" rel="noreferrer">
                      <div className="sidebar-link-left"><LinkIcon size={16} /> Job Post</div>
                      <span style={{ color: 'var(--text-secondary)' }}>↗</span>
                    </a>
                  )}
                  {job.links?.linkedin && (
                    <a href={job.links.linkedin} className="sidebar-link-btn" target="_blank" rel="noreferrer">
                      <div className="sidebar-link-left"><LinkedinIcon size={16} /> Profile Link</div>
                      <span style={{ color: 'var(--text-secondary)' }}>↗</span>
                    </a>
                  )}
                  {job.links?.website && (
                    <a href={job.links.website} className="sidebar-link-btn" target="_blank" rel="noreferrer">
                      <div className="sidebar-link-left"><GlobeIcon size={16} /> Website</div>
                      <span style={{ color: 'var(--text-secondary)' }}>↗</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="modal-side-card">
                <h3 className="side-card-title">Tracking</h3>
                <div className="side-detail-row">
                  <span className="side-detail-label"><BookOpenIcon size={14} /> CV Profile</span>
                  <span className="side-detail-value">
                    {cvProfile ? (
                      <>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cvProfile.color }} />
                        {cvProfile.name}
                      </>
                    ) : <span style={{ color: 'var(--text-secondary)' }}>None</span>}
                  </span>
                </div>
                <div className="side-detail-row">
                  <span className="side-detail-label"><ClockIcon size={14} /> Phone Screens</span>
                  <span className="side-detail-value">{job.phoneScreens || 0}</span>
                </div>
                <div className="side-detail-row">
                  <span className="side-detail-label"><BookOpenIcon size={14} /> Interviews</span>
                  <span className="side-detail-value">{job.interviews || 0}</span>
                </div>
              </div>

              {job.recruiter && (
                <div className="modal-side-card">
                  <h3 className="side-card-title">HR / Recruiter</h3>
                  <div className="side-detail-row">
                    <span className="side-detail-label"><UserPlusIcon size={14} /> Name</span>
                    <span className="side-detail-value">{job.recruiter.name}</span>
                  </div>
                  {job.recruiter.email && (
                    <div className="side-detail-row">
                      <span className="side-detail-label"><GlobeIcon size={14} /> Email</span>
                      <span className="side-detail-value">
                         <a href={`mailto:${job.recruiter.email}`} style={{ color: 'var(--apple-blue)', textDecoration: 'none' }}>Email ↗</a>
                      </span>
                    </div>
                  )}
                  {job.recruiter.phone && (
                    <div className="side-detail-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                      <span className="side-detail-label"><ClockIcon size={14} /> Phone</span>
                      <span className="side-detail-value">{job.recruiter.phone}</span>
                    </div>
                  )}
                </div>
              )}

              {job.referral && (
                <div className="modal-side-card">
                  <h3 className="side-card-title">Referral Info</h3>
                  <div className="side-detail-row">
                    <span className="side-detail-label"><UserPlusIcon size={14} /> Referrer</span>
                    <span className="side-detail-value">{job.referral.referrer}</span>
                  </div>
                  {(job.referral.date || job.referral.note) && (
                    <div className="side-detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                      <span className="side-detail-label"><CalendarIcon size={14} /> {job.referral.date}</span>
                      {job.referral.note && <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>"{job.referral.note}"</span>}
                    </div>
                  )}
                  {(job.referral.link || job.referral.code) && (
                    <div className="side-detail-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                      <span className="side-detail-label"><LinkIcon size={14} /> Details</span>
                      <span className="side-detail-value" style={{ display: 'flex', gap: '8px' }}>
                        {job.referral.code && (
                          <span className="copyable-pill" title="Click to copy" onClick={() => navigator.clipboard.writeText(job.referral!.code!)}>
                            {job.referral.code}
                          </span>
                        )}
                        {job.referral.link && (
                          <a href={job.referral.link} target="_blank" rel="noreferrer" style={{ color: 'var(--apple-blue)', textDecoration: 'none', fontSize: '13px' }}>
                            Link ↗
                          </a>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Footer (now inside scrollable) ── */}
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
