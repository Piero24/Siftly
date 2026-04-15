/**
 * InterviewRow — Table row for a single application in the Interviewing view.
 *
 * Renders company info, position, recruiter contact, phone screens,
 * interviews, total rounds, date, status dropdown, and next round display.
 */
import React from 'react';
import { JobApplication, JobStatus } from '../../../types/job';
import { CompanyIcon } from '../CompanyIcon';
import { EmploymentTypeBadge } from '../EmploymentTypeBadge';
import { StatusDropdown } from '../StatusDropdown';
import { NextRoundDisplay } from './NextRoundDisplay';
import { capitalizeCompanyName } from '../../../lib/format';
import { PhoneIcon, CodeIcon, SumIcon, UserIcon, MailIcon } from '../../common/Icons';

interface InterviewRowProps {
  app: JobApplication;
  selectorMode: boolean;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onStatusChange: (id: string, s: JobStatus) => void;
  onRowClick: (app: JobApplication) => void;
  useSoftIconBackground: boolean;
}

/** Renders recruiter name, email, and phone in a compact stacked layout. */
const RecruiterCell: React.FC<{ recruiter?: JobApplication['recruiter'] }> = ({ recruiter }) => {
  if (!recruiter) {
    return <span style={{ color: 'var(--text-secondary)' }}>-</span>;
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '4px',
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
        <UserIcon size={12} style={{ color: 'var(--text-secondary)' }} />
        {recruiter.name}
      </div>
      {recruiter.email && (
        <a
          href={`mailto:${recruiter.email}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary)',
            fontSize: '11px',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <MailIcon size={10} />
          <span className="table-ellipsis" style={{ maxWidth: '140px' }} title={recruiter.email}>
            {recruiter.email}
          </span>
        </a>
      )}
      {recruiter.phone && (
        <a
          href={`tel:${recruiter.phone}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary)',
            fontSize: '11px',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <PhoneIcon size={10} />
          <span className="table-ellipsis" style={{ maxWidth: '140px' }} title={recruiter.phone}>
            {recruiter.phone}
          </span>
        </a>
      )}
    </div>
  );
};

export const InterviewRow: React.FC<InterviewRowProps> = ({
  app,
  selectorMode,
  isSelected,
  onToggleSelection,
  onStatusChange,
  onRowClick,
  useSoftIconBackground,
}) => {
  const phoneScreens = app.phoneScreens || 0;
  const interviews = app.interviews || 0;
  const totalRounds = phoneScreens + interviews;

  return (
    <tr
      className="job-row"
      style={{ borderBottom: '1px solid var(--divider)', cursor: 'pointer' }}
      onClick={() => {
        if (selectorMode) onToggleSelection(app.id);
        else onRowClick(app);
      }}
    >
      <td className="table-cell col-select" onClick={(e) => e.stopPropagation()}>
        {selectorMode && (
          <input type="checkbox" checked={isSelected} onChange={() => onToggleSelection(app.id)} />
        )}
      </td>

      <td className="table-cell col-icon">
        <div className="table-icon-cell">
          <CompanyIcon
            name={app.company}
            logo={app.logo}
            website={app.links?.website}
            linkedin={app.links?.linkedin}
            useAverageBg={useSoftIconBackground}
          />
        </div>
      </td>

      <td className="table-cell col-company" style={{ fontWeight: 500 }}>
        <span className="table-ellipsis" title={app.company}>
          {capitalizeCompanyName(app.company)}
        </span>
      </td>

      <td className="table-cell col-position" style={{ fontWeight: 600 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <EmploymentTypeBadge type={app.employmentType} compact />
          <span className="table-ellipsis" title={app.position}>
            {app.position}
          </span>
        </div>
      </td>

      <td
        className="table-cell col-recruiter"
        data-label="Recruiter"
        style={{ fontSize: '13px', textAlign: 'center' }}
      >
        <RecruiterCell recruiter={app.recruiter} />
      </td>

      <td
        className="table-cell col-phonescreens"
        data-label="Phone"
        style={{ textAlign: 'center' }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <PhoneIcon size={14} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontWeight: 500 }}>{phoneScreens}</span>
        </div>
      </td>

      <td
        className="table-cell col-interviews"
        data-label="Technical"
        style={{ textAlign: 'center' }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <CodeIcon size={14} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontWeight: 500 }}>{interviews}</span>
        </div>
      </td>

      <td className="table-cell col-totalrounds" data-label="Total" style={{ textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'var(--surface-muted)',
            borderRadius: '12px',
            padding: '2px 8px',
            fontSize: '12px',
            fontWeight: 600,
            gap: '4px',
          }}
        >
          <SumIcon size={12} style={{ opacity: 0.6 }} />
          {totalRounds}
        </div>
      </td>

      <td
        className="table-cell col-date"
        style={{ color: 'var(--text-secondary)', fontSize: '13px', whiteSpace: 'nowrap' }}
      >
        {new Date(app.date).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </td>

      <td className="table-cell col-status" onClick={(e) => e.stopPropagation()}>
        <StatusDropdown status={app.status} onChange={(s) => onStatusChange(app.id, s)} />
      </td>

      <td
        className="table-cell col-nextround"
        style={{ textAlign: 'center', verticalAlign: 'middle', width: '190px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <NextRoundDisplay rounds={app.rounds || []} />
      </td>
    </tr>
  );
};
