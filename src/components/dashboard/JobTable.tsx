/**
 * JobTable — Searchable table of job applications.
 * Accepts displayCurrency to show converted salary values.
 */
import React from 'react';
import { CVProfile, JobApplication, JobStatus } from '../../types/job';
import { getFlagClass } from '../../lib/countries';
import { capitalizeCompanyName } from '../../lib/format';
import { CompanyIcon } from './CompanyIcon';
import { WorkTypeBadge } from './WorkTypeBadge';
import { EmploymentTypeBadge } from './EmploymentTypeBadge';
import { StatusDropdown } from './StatusDropdown';
import { LinkIcon, LinkedinIcon, GlobeIcon } from '../common/Icons';
import { useSalary } from '../../hooks/useSalary';
import { useSettings } from '../../context/SettingsContext';

interface JobTableProps {
  applications: JobApplication[];
  displayCurrency: string;
  cvProfiles: CVProfile[];
  visibleColumns: string[];
  selectorMode: boolean;
  selectedIds: Set<string>;
  onToggleRowSelection: (id: string) => void;
  allRowsSelected: boolean;
  someRowsSelected: boolean;
  onToggleAllRowsSelection: (checked: boolean) => void;
  onStatusChange: (id: string, newStatus: JobStatus) => void;
  onRowClick: (app: JobApplication) => void;
}

const SelectAllCheckbox: React.FC<{
  checked: boolean;
  indeterminate: boolean;
  onChange: (checked: boolean) => void;
}> = ({ checked, indeterminate, onChange }) => {
  const checkboxRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={checkboxRef}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      aria-label="Select or unselect all rows"
    />
  );
};

// Thin row component so each row gets its own useSalary hook call
const JobRow: React.FC<{
  app: JobApplication;
  displayCurrency: string;
  cvProfiles: CVProfile[];
  visibleColumns: string[];
  selectorMode: boolean;
  isSelected: boolean;
  onToggleRowSelection: (id: string) => void;
  onStatusChange: (id: string, s: JobStatus) => void;
  onRowClick: (app: JobApplication) => void;
  useSoftIconBackground: boolean;
}> = ({
  app,
  displayCurrency,
  cvProfiles,
  visibleColumns,
  selectorMode,
  isSelected,
  onToggleRowSelection,
  onStatusChange,
  onRowClick,
  useSoftIconBackground,
}) => {
  const salary = useSalary(app.salary, displayCurrency, true);
  const cvProfile = cvProfiles.find((profile) => profile.id === app.cvProfileId);

  const isVisible = (col: string) => visibleColumns.includes(col);

  return (
    <tr
      className="job-row"
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
          <CompanyIcon
            name={app.company}
            website={app.links?.website}
            linkedin={app.links?.linkedin}
            useAverageBg={useSoftIconBackground}
          />
        </div>
      </td>

      {isVisible('company') && (
        <td className="table-cell col-company" data-label="Company">
          <span className="table-ellipsis" title={app.company}>
            {capitalizeCompanyName(app.company)}
          </span>
        </td>
      )}

      {isVisible('sector') && (
        <td className="table-cell col-sector" data-label="Sector">
          <span className="table-ellipsis" title={app.sector}>
            {app.sector}
          </span>
        </td>
      )}

      {isVisible('position') && (
        <td className="table-cell col-position" data-label="Position">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <EmploymentTypeBadge type={app.employmentType} compact />
            <span className="table-ellipsis" title={app.position}>
              {app.position}
            </span>
          </div>
        </td>
      )}

      {isVisible('country') && (
        <td className="table-cell col-country" data-label="Country">
          <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
          >
            <span
              className={getFlagClass(app.country)}
              style={{
                fontSize: '16px',
                borderRadius: '2px',
                border: '1px solid var(--border-subtle)',
              }}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{app.country}</span>
          </div>
        </td>
      )}

      {isVisible('city') && (
        <td className="table-cell col-city" data-label="City">
          <span className="table-ellipsis" title={app.city}>
            {app.city}
          </span>
        </td>
      )}

      {isVisible('work') && (
        <td className="table-cell col-work" data-label="Work Type">
          <WorkTypeBadge type={app.workType} />
        </td>
      )}

      {isVisible('salary') && (
        <td className="table-cell col-salary" data-label="Salary">
          {salary}
        </td>
      )}

      {isVisible('cv') && (
        <td className="table-cell col-cv" data-label="CV">
          {cvProfile ? (
            <span
              className="cv-dot-indicator"
              style={{ background: cvProfile.color }}
              title={cvProfile.name}
            />
          ) : (
            <span style={{ color: 'var(--text-secondary)' }}>-</span>
          )}
        </td>
      )}

      {isVisible('date') && (
        <td className="table-cell col-date" data-label="Applied On">
          {new Date(app.date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </td>
      )}

      {isVisible('status') && (
        <td
          className="table-cell col-status"
          data-label="Status"
          onClick={(e) => e.stopPropagation()}
        >
          <StatusDropdown status={app.status} onChange={(s) => onStatusChange(app.id, s)} />
        </td>
      )}

      <td className="table-cell col-links" data-label="Links" onClick={(e) => e.stopPropagation()}>
        <div className="table-links-cell">
          {app.links.job && (
            <a
              href={app.links.job}
              className="link-icon"
              title="Job Link"
              target="_blank"
              rel="noreferrer"
            >
              <LinkIcon size={14} />
            </a>
          )}
          {app.links.linkedin && (
            <a
              href={app.links.linkedin}
              className="link-icon"
              title="Profile Link"
              target="_blank"
              rel="noreferrer"
            >
              <LinkedinIcon size={14} />
            </a>
          )}
          {app.links.website && (
            <a
              href={app.links.website}
              className="link-icon"
              title="Website"
              target="_blank"
              rel="noreferrer"
            >
              <GlobeIcon size={14} />
            </a>
          )}
        </div>
      </td>
    </tr>
  );
};

export const JobTable: React.FC<JobTableProps> = ({
  applications,
  displayCurrency,
  cvProfiles,
  visibleColumns,
  selectorMode,
  selectedIds,
  onToggleRowSelection,
  allRowsSelected,
  someRowsSelected,
  onToggleAllRowsSelection,
  onStatusChange,
  onRowClick,
}) => {
  const { useSoftIconBackground } = useSettings();
  const isVisible = (col: string) => visibleColumns.includes(col);

  return (
    <div className="table-responsive">
      <table className="job-table">
        <colgroup>
          <col className="col-select" />
          <col className="col-icon" />
          {isVisible('company') && <col className="col-company" />}
          {isVisible('sector') && <col className="col-sector" />}
          {isVisible('position') && <col className="col-position" />}
          {isVisible('country') && <col className="col-country" />}
          {isVisible('city') && <col className="col-city" />}
          {isVisible('work') && <col className="col-work" />}
          {isVisible('salary') && <col className="col-salary" />}
          {isVisible('cv') && <col className="col-cv" />}
          {isVisible('date') && <col className="col-date" />}
          {isVisible('status') && <col className="col-status" />}
          <col className="col-links" />
        </colgroup>
        <thead>
          <tr className="table-header-row">
            <th className="table-header col-select" onClick={(e) => e.stopPropagation()}>
              {selectorMode && (
                <SelectAllCheckbox
                  checked={allRowsSelected}
                  indeterminate={someRowsSelected}
                  onChange={onToggleAllRowsSelection}
                />
              )}
            </th>
            <th className="table-header col-icon"></th>
            {isVisible('company') && <th className="table-header">Company</th>}
            {isVisible('sector') && <th className="table-header">Sector</th>}
            {isVisible('position') && <th className="table-header">Position</th>}
            {isVisible('country') && <th className="table-header">Country</th>}
            {isVisible('city') && <th className="table-header">City</th>}
            {isVisible('work') && <th className="table-header">Work Type</th>}
            {isVisible('salary') && <th className="table-header">Salary</th>}
            {isVisible('cv') && <th className="table-header">CV</th>}
            {isVisible('date') && <th className="table-header">Date</th>}
            {isVisible('status') && <th className="table-header">Status</th>}
            <th className="table-header">Links</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <JobRow
              key={app.id}
              app={app}
              displayCurrency={displayCurrency}
              cvProfiles={cvProfiles}
              visibleColumns={visibleColumns}
              selectorMode={selectorMode}
              isSelected={selectedIds.has(app.id)}
              onToggleRowSelection={onToggleRowSelection}
              onStatusChange={onStatusChange}
              onRowClick={onRowClick}
              useSoftIconBackground={useSoftIconBackground}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
