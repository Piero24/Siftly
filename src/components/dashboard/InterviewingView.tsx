import React, { useState } from 'react';
import { JobApplication, JobStatus, InterviewRound, CVProfile } from '../../types/job';
import { CompanyIcon } from './CompanyIcon';
import { EmploymentTypeBadge } from './EmploymentTypeBadge';
import { StatusDropdown } from './StatusDropdown';
import { PhoneIcon, CodeIcon, SumIcon, UserIcon, MailIcon, VideoIcon, MapPinIcon, FilterIcon, UsersIcon, XCircleIcon, CheckCircleIcon, TrashIcon } from '../common/Icons';
import { SearchBar } from './SearchBar';
import { useInterviewingFilters } from '../../hooks/useInterviewingFilters';
import { INTERVIEWING_FILTER_FIELDS, INTERVIEWING_STATUS_OPTIONS } from '../../config/interviewingFilterConfig';

interface InterviewingViewProps {
  applications: JobApplication[];
  displayCurrency: string;
  cvProfiles: CVProfile[];
  visibleColumns: string[];
  onStatusChange: (id: string, newStatus: JobStatus) => void;
  onRowClick: (app: JobApplication) => void;
  onDelete: (id: string) => void;
}

const HEADERS = [
  'Company', 'Position', 'Recruiter Contact',
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
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '52px', color: 'var(--text-secondary)', padding: '6px 0' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-success, #34C759)' }}>Done 🎉</span>
        <span style={{ fontSize: '11px' }}>{sorted.length} round{sorted.length > 1 ? 's' : ''} finished</span>
      </div>
    );
  }

  const r = sorted[nextIndex];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
      minHeight: '52px',
      color: 'var(--text-primary)',
      lineHeight: 1.3,
      padding: '6px 0',
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
              <span className="table-ellipsis" style={{ maxWidth: '162px' }} title={r.interviewerName}>{r.interviewerName}</span>
            </div>
          )}
          {r.interviewerContact && (
            r.interviewerContact.includes('@') ? (
              <a href={`mailto:${r.interviewerContact}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '11px', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()} title={r.interviewerContact}>
                <MailIcon size={10} style={{ flexShrink: 0 }} />
                <span className="table-ellipsis" style={{ maxWidth: '162px' }}>{r.interviewerContact}</span>
              </a>
            ) : (
              <a href={`tel:${r.interviewerContact}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '11px', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()} title={r.interviewerContact}>
                <PhoneIcon size={10} style={{ flexShrink: 0 }} />
                <span className="table-ellipsis" style={{ maxWidth: '162px' }}>{r.interviewerContact}</span>
              </a>
            )
          )}
        </div>
      )}
    </div>
  );
};

const InterviewRow: React.FC<{
  app: JobApplication;
  selectorMode: boolean;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onStatusChange: (id: string, s: JobStatus) => void;
  onRowClick: (app: JobApplication) => void;
}> = ({ app, selectorMode, isSelected, onToggleSelection, onStatusChange, onRowClick }) => {
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
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection(app.id)}
          />
        )}
      </td>

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
                <MailIcon size={10} />
                <span className="table-ellipsis" style={{ maxWidth: '140px' }} title={app.recruiter.email}>{app.recruiter.email}</span>
              </a>
            )}
            {app.recruiter.phone && (
              <a href={`tel:${app.recruiter.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '11px', textDecoration: 'none', cursor: 'pointer' }} onClick={(e) => e.stopPropagation()}>
                <PhoneIcon size={10} />
                <span className="table-ellipsis" style={{ maxWidth: '140px' }} title={app.recruiter.phone}>{app.recruiter.phone}</span>
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

      <td className="table-cell col-nextround" style={{ textAlign: 'center', verticalAlign: 'middle', width: '190px' }} onClick={(e) => e.stopPropagation()}>
        <NextRoundDisplay rounds={app.rounds || []} />
      </td>
    </tr>
  );
};

export const InterviewingView: React.FC<InterviewingViewProps> = ({
  applications, displayCurrency: _, cvProfiles: __, visibleColumns: ___, onStatusChange, onRowClick, onDelete
}) => {
  const {
    searchTerm,
    setSearchTerm,
    showFilterRow,
    filterField,
    setFilterField,
    filterValue,
    setFilterValue,
    filterValueOptions,
    filteredApplications,
    toggleFilterRow,
    clearFilters,
  } = useInterviewingFilters(applications);

  const [selectorMode, setSelectorMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<JobStatus>('applied');

  const toggleSelectorMode = () => {
    setSelectorMode((prev) => !prev);
    setSelectedIds(new Set());
  };

  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkStatus = () => {
    if (selectedIds.size === 0) return;
    [...selectedIds].forEach((id) => onStatusChange(id, bulkStatus));
    setSelectedIds(new Set());
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected applications?`)) return;
    [...selectedIds].forEach((id) => onDelete(id));
    setSelectedIds(new Set());
  };

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
        <div className="applications-toolbar-left">
          <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0, whiteSpace: 'nowrap' }}>Interviewing Pipeline</h2>
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>
        <div className="applications-toolbar-right">
          <button className={`btn-apple selection-toggle-btn ${showFilterRow ? 'is-active' : ''}`} onClick={toggleFilterRow}><FilterIcon size={14} />Filters</button>
          <button className={`btn-apple selection-toggle-btn ${selectorMode ? 'is-active' : ''}`} onClick={toggleSelectorMode}><UsersIcon size={14} />{selectorMode ? 'Exit Selection' : 'Select Rows'}</button>
        </div>
      </div>

      {showFilterRow && (
        <div className="filter-actions-bar">
          <div className="filter-actions-group filter-actions-left">
            <span className="bulk-actions-count">Filter</span>
            <select
              className="apple-select bulk-actions-status filter-select"
              value={filterField}
              onChange={(e) => {
                setFilterField(e.target.value as 'company' | 'position' | 'date' | 'nextRound');
                setFilterValue('');
              }}
            >
              <option value="">Filter by...</option>
              {INTERVIEWING_FILTER_FIELDS.map((field) => (
                <option key={field.value} value={field.value}>{field.label}</option>
              ))}
            </select>

            <select
              className="apple-select bulk-actions-status filter-select"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              disabled={!filterField}
            >
              <option value="">Value...</option>
              {filterValueOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-actions-group filter-actions-right">
            <button
              className="btn-apple btn-outline bulk-actions-btn"
              onClick={clearFilters}
              disabled={!filterField && !filterValue}
            >
              <XCircleIcon size={14} /> Clear Filter
            </button>
          </div>
        </div>
      )}

      {selectorMode && (
        <div className="bulk-actions-bar">
          <div className="bulk-actions-group bulk-actions-left">
            <span className="bulk-actions-count">{selectedIds.size} selected</span>
            <select className="apple-select bulk-actions-status" value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value as JobStatus)}>
              {INTERVIEWING_STATUS_OPTIONS.map((statusOption) => (
                <option key={statusOption.value} value={statusOption.value}>{statusOption.label}</option>
              ))}
            </select>
            <button className="btn-apple btn-outline bulk-actions-btn" disabled={selectedIds.size === 0} onClick={handleBulkStatus}><CheckCircleIcon size={14} />Change Status</button>
          </div>

          <div className="bulk-actions-group bulk-actions-right">
            <button className="btn-apple btn-destructive bulk-actions-btn" disabled={selectedIds.size === 0} onClick={handleBulkDelete}><TrashIcon size={14} />Delete Selected</button>
          </div>
        </div>
      )}

      <div className="table-responsive">
        <table className="job-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <colgroup>
            <col className="col-select" />
            <col className="col-icon" />
            <col className="col-company" />
            <col className="col-position" />
            <col className="col-recruiter" />
            <col className="col-phonescreens" />
            <col className="col-interviews" />
            <col className="col-totalrounds" />
            <col className="col-date" />
            <col className="col-status" />
            <col className="col-nextround" />
          </colgroup>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-strong)' }}>
              <th className="table-header col-select"></th>
              <th className="table-header col-icon"></th>
              {HEADERS.map((h, i) => (
                <th key={i} className="table-header" style={h === 'Phone Screens' || h === 'Interviews' || h === 'Total Rounds' || h === 'Recruiter Contact' || h === 'Next Round' ? { textAlign: 'center' } : {}}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((app) => (
              <InterviewRow
                key={app.id}
                app={app}
                selectorMode={selectorMode}
                isSelected={selectedIds.has(app.id)}
                onToggleSelection={toggleRowSelection}
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
