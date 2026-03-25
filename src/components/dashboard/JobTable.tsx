/**
 * JobTable — Searchable table of job applications.
 * Accepts displayCurrency to show converted salary values.
 */
import React from 'react';
import { CVProfile, JobApplication, JobStatus } from '../../types/job';
import { CompanyIcon }    from './CompanyIcon';
import { WorkTypeBadge }  from './WorkTypeBadge';
import { EmploymentTypeBadge } from './EmploymentTypeBadge';
import { StatusDropdown } from './StatusDropdown';
import { LinkIcon, LinkedinIcon, GlobeIcon } from '../common/Icons';
import { useSalary }      from '../../hooks/useSalary';

interface JobTableProps {
  applications:    JobApplication[];
  displayCurrency: string;
  cvProfiles: CVProfile[];
  selectorMode: boolean;
  selectedIds: Set<string>;
  onToggleRowSelection: (id: string) => void;
  onStatusChange:  (id: string, newStatus: JobStatus) => void;
  onDelete:        (id: string) => void;
  onEdit:          (app: JobApplication) => void;
  onRowClick:      (app: JobApplication) => void;
}

const HEADERS = [
  '', '', 'Company', 'Sector', 'Position',
  'Country', 'City', 'Work Type', 'Salary', 'CV', 'Date', 'Status', 'Links',
];

// Thin row component so each row gets its own useSalary hook call
const JobRow: React.FC<{
  app:             JobApplication;
  displayCurrency: string;
  cvProfiles: CVProfile[];
  selectorMode: boolean;
  isSelected: boolean;
  onToggleRowSelection: (id: string) => void;
  onStatusChange:  (id: string, s: JobStatus) => void;
  onRowClick:      (app: JobApplication) => void;
}> = ({ app, displayCurrency, cvProfiles, selectorMode, isSelected, onToggleRowSelection, onStatusChange, onRowClick }) => {
  const salary = useSalary(app.salary, displayCurrency);
  const cvProfile = cvProfiles.find((profile) => profile.id === app.cvProfileId);

  return (
    <tr
      className="job-row"
      style={{ borderBottom: '1px solid var(--divider)', cursor: 'pointer' }}
      onClick={() => {
        if (selectorMode) {
          onToggleRowSelection(app.id);
          return;
        }
        onRowClick(app);
      }}
    >
      <td className="table-cell col-select" onClick={(e) => e.stopPropagation()}>
        {selectorMode && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleRowSelection(app.id)}
          />
        )}
      </td>

      <td className="table-cell col-icon">
        <div className="table-icon-cell">
          <CompanyIcon name={app.company} website={app.links?.website} linkedin={app.links?.linkedin} />
        </div>
      </td>

      <td className="table-cell col-company" style={{ fontWeight: 500 }}>
        <span className="table-ellipsis" title={app.company}>
          {app.company.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
        </span>
      </td>

      <td className="table-cell col-sector" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
        <span className="table-ellipsis" title={app.sector}>{app.sector}</span>
      </td>

      <td className="table-cell col-position" style={{ fontWeight: 600 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <EmploymentTypeBadge type={app.employmentType} compact />
          <span className="table-ellipsis" title={app.position}>{app.position}</span>
        </div>
      </td>

      <td className="table-cell col-country">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <span className={`fi fi-${app.country.toLowerCase()}`} style={{ fontSize: '16px', borderRadius: '2px' }} />
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{app.country}</span>
        </div>
      </td>

      <td className="table-cell col-city">
        <span className="table-ellipsis" style={{ fontSize: '13px', fontWeight: 500 }} title={app.city}>{app.city}</span>
      </td>

      <td className="table-cell col-work"><WorkTypeBadge type={app.workType} /></td>

      <td className="table-cell col-salary" style={{ fontWeight: 500, fontSize: '13px' }}>{salary}</td>

      <td className="table-cell col-cv">
        {cvProfile ? (
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: cvProfile.color, display: 'inline-block' }} title={cvProfile.name} />
        ) : (
          <span style={{ color: 'var(--text-secondary)' }}>-</span>
        )}
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

      <td className="table-cell col-links" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <a href={app.links.job}      className="link-icon" title="Job Link"  target="_blank" rel="noreferrer"><LinkIcon     size={14} /></a>
          <a href={app.links.linkedin} className="link-icon" title="LinkedIn"  target="_blank" rel="noreferrer"><LinkedinIcon  size={14} /></a>
          <a href={app.links.website}  className="link-icon" title="Website"   target="_blank" rel="noreferrer"><GlobeIcon     size={14} /></a>
        </div>
      </td>
    </tr>
  );
};

export const JobTable: React.FC<JobTableProps> = ({
  applications, displayCurrency, cvProfiles, selectorMode, selectedIds, onToggleRowSelection, onStatusChange, onDelete: _onDelete, onEdit: _onEdit, onRowClick,
}) => (
  <div className="table-responsive">
    <table className="job-table" style={{ borderCollapse: 'collapse' }}>
      <colgroup>
        <col className="col-select" />
        <col className="col-icon" />
        <col className="col-company" />
        <col className="col-sector" />
        <col className="col-position" />
        <col className="col-country" />
        <col className="col-city" />
        <col className="col-work" />
        <col className="col-salary" />
        <col className="col-cv" />
        <col className="col-date" />
        <col className="col-status" />
        <col className="col-links" />
      </colgroup>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--border-strong)' }}>
          {HEADERS.map((h) => <th key={h} className="table-header">{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {applications.map((app) => (
          <JobRow
            key={app.id}
            app={app}
            displayCurrency={displayCurrency}
            cvProfiles={cvProfiles}
            selectorMode={selectorMode}
            isSelected={selectedIds.has(app.id)}
            onToggleRowSelection={onToggleRowSelection}
            onStatusChange={onStatusChange}
            onRowClick={onRowClick}
          />
        ))}
      </tbody>
    </table>
  </div>
);
