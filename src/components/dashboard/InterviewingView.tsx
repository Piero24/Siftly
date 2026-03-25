import React from 'react';
import { JobApplication, JobStatus, InterviewRound } from '../../types/job';
import { CompanyIcon }    from './CompanyIcon';
import { EmploymentTypeBadge } from './EmploymentTypeBadge';
import { StatusDropdown } from './StatusDropdown';
import { PhoneIcon, CodeIcon, SumIcon, UserIcon, MailIcon, VideoIcon, MapPinIcon } from '../common/Icons';

interface InterviewingViewProps {
  applications:    JobApplication[];
  onStatusChange:  (id: string, newStatus: JobStatus) => void;
  onRowClick:      (app: JobApplication) => void;
}

const HEADERS = [
  '', 'Company', 'Position', 'Recruiter Contact',
  'Phone Screens', 'Interviews', 'Total Rounds', 'Date', 'Status', 'Next Round'
];

const NextRoundDisplay: React.FC<{ rounds: InterviewRound[] }> = ({ rounds }) => {
  const sorted = rounds ? [...rounds].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];
  const now = new Date().getTime();
  const nextIndex = sorted.findIndex(r => r.date && new Date(r.date).getTime() > now);
  
  if (!rounds || rounds.length === 0) {
    return <span style={{ color: 'var(--text-secondary)' }}>-</span>;
  }

  if (nextIndex === -1) {
    return (
      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-secondary)', padding: '12px 0' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-success, #34C759)' }}>Done 🎉</span>
        <span style={{ fontSize: '11px' }}>{sorted.length} round{sorted.length > 1 ? 's' : ''} finished</span>
      </div>
    );
  }

  const r = sorted[nextIndex];
  
  return (
    <div style={{ 
      display: 'inline-flex', 
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
      color: 'var(--text-primary)',
      lineHeight: 1.3,
      padding: '8px 0',
      textAlign: 'left'
    }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
        <span style={{ color: 'var(--text-secondary)', opacity: 0.8 }}>#{r.roundNumber}</span>
        <span style={{ whiteSpace: 'nowrap' }}>{new Date(r.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '')}</span>
        {r.meetingLink && <VideoIcon size={12} style={{ color: '#AF52DE', flexShrink: 0 }} />}
        {r.location && <MapPinIcon size={12} style={{ color: '#FF3B30', flexShrink: 0 }} />}
      </div>
      
      {(r.interviewerName || r.interviewerContact) && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginTop: '4px' }}>
          {r.interviewerName && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)' }}>
              <UserIcon size={10} style={{ flexShrink: 0 }} />
              <span className="table-ellipsis" style={{ maxWidth: '180px' }} title={r.interviewerName}>{r.interviewerName}</span>
            </div>
          )}
          {r.interviewerContact && (
            r.interviewerContact.includes('@') ? (
              <a href={`mailto:${r.interviewerContact}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '11px', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()} title={r.interviewerContact}>
                <MailIcon size={10} style={{ flexShrink: 0 }} />
                <span className="table-ellipsis" style={{ maxWidth: '180px' }}>{r.interviewerContact}</span>
              </a>
            ) : (
              <a href={`tel:${r.interviewerContact}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '11px', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()} title={r.interviewerContact}>
                <PhoneIcon size={10} style={{ flexShrink: 0 }} />
                <span className="table-ellipsis" style={{ maxWidth: '180px' }}>{r.interviewerContact}</span>
              </a>
            )
          )}
        </div>
      )}
    </div>
  );
};

const InterviewRow: React.FC<{
  app:             JobApplication;
  onStatusChange:  (id: string, s: JobStatus) => void;
  onRowClick:      (app: JobApplication) => void;
}> = ({ app, onStatusChange, onRowClick }) => {
  const phoneScreens = app.phoneScreens || 0;
  const interviews = app.interviews || 0;
  const totalRounds = phoneScreens + interviews;

  return (
    <tr
      className="job-row"
      style={{ borderBottom: '1px solid var(--divider)', cursor: 'pointer' }}
      onClick={() => onRowClick(app)}
    >
      <td className="table-cell col-icon">
        <div className="table-icon-cell">
          <CompanyIcon name={app.company} logo={app.logo} website={app.links?.website} linkedin={app.links?.linkedin} />
        </div>
      </td>

      <td className="table-cell col-company" style={{ fontWeight: 500 }}>
        <span className="table-ellipsis" title={app.company}>
          {app.company.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
        </span>
      </td>

      <td className="table-cell col-position" style={{ fontWeight: 600 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <EmploymentTypeBadge type={app.employmentType} compact />
          <span className="table-ellipsis" title={app.position}>{app.position}</span>
        </div>
      </td>

      <td className="table-cell" style={{ fontSize: '13px', textAlign: 'center' }}>
        {app.recruiter ? (
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
              <UserIcon size={12} style={{ color: 'var(--text-secondary)' }} />
              {app.recruiter.name}
            </div>
            {app.recruiter.email && (
              <a href={`mailto:${app.recruiter.email}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '11px', textDecoration: 'none', cursor: 'pointer' }} onClick={(e) => e.stopPropagation()}>
                <MailIcon size={10} /> {app.recruiter.email}
              </a>
            )}
            {app.recruiter.phone && (
              <a href={`tel:${app.recruiter.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '11px', textDecoration: 'none', cursor: 'pointer' }} onClick={(e) => e.stopPropagation()}>
                <PhoneIcon size={10} /> {app.recruiter.phone}
              </a>
            )}
          </div>
        ) : (
          <span style={{ color: 'var(--text-secondary)' }}>-</span>
        )}
      </td>

      <td className="table-cell" style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <PhoneIcon size={14} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontWeight: 500 }}>{phoneScreens}</span>
        </div>
      </td>

      <td className="table-cell" style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <CodeIcon size={14} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontWeight: 500 }}>{interviews}</span>
        </div>
      </td>

      <td className="table-cell" style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', background: 'var(--surface-muted)', borderRadius: '12px', padding: '2px 8px', fontSize: '12px', fontWeight: 600, gap: '4px' }}>
          <SumIcon size={12} style={{ opacity: 0.6 }} />
          {totalRounds}
        </div>
      </td>

      <td className="table-cell col-date" style={{ color: 'var(--text-secondary)', fontSize: '13px', whiteSpace: 'nowrap' }}>
        {new Date(app.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
      </td>

      <td className="table-cell col-status" onClick={(e) => e.stopPropagation()}>
        <StatusDropdown
          status={app.status}
          onChange={(s) => onStatusChange(app.id, s)}
        />
      </td>

      <td className="table-cell" style={{ textAlign: 'center', verticalAlign: 'middle', width: '220px' }} onClick={(e) => e.stopPropagation()}>
        <NextRoundDisplay rounds={app.rounds || []} />
      </td>
    </tr>
  );
};

export const InterviewingView: React.FC<InterviewingViewProps> = ({
  applications, onStatusChange, onRowClick,
}) => {
  if (applications.length === 0) {
    return (
      <div className="glass-container applications-card" style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '40px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No Applications in Interviewing</h3>
        <p style={{ color: 'var(--text-secondary)' }}>When an application status is changed to "Interviewing", it will appear here.</p>
      </div>
    );
  }

  return (
    <div className="glass-container applications-card" style={{ maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
      <div className="applications-toolbar">
        <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Interviewing Pipeline</h2>
      </div>
      <div className="table-responsive">
        <table className="job-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-strong)' }}>
              {HEADERS.map((h, i) => (
                <th key={i} className="table-header" style={h === 'Phone Screens' || h === 'Interviews' || h === 'Total Rounds' || h === 'Recruiter Contact' || h === 'Next Round' ? { textAlign: 'center' } : {}}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <InterviewRow
                key={app.id}
                app={app}
                onStatusChange={onStatusChange}
                onRowClick={onRowClick}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
