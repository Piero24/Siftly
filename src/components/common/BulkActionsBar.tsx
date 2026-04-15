/**
 * BulkActionsBar — Shared bulk actions row for table views.
 *
 * Provides status change, optional link opening, and delete actions
 * for selected rows.
 */
import React from 'react';
import { CheckCircleIcon, TrashIcon, LinkIcon, GlobeIcon, LinkedinIcon } from './Icons';
import { JobStatus } from '../../types/job';

interface StatusOption {
  value: string;
  label: string;
}

interface BulkActionsBarProps {
  selectedCount: number;
  bulkStatus: JobStatus;
  onBulkStatusChange: (status: JobStatus) => void;
  onApplyBulkStatus: () => void;
  onBulkDelete: () => void;
  statusOptions: StatusOption[];
  /** Link-opening actions (optional — used in Applications view, not Interviewing). */
  linkActions?: {
    bulkLinkKind: 'job' | 'website' | 'linkedin';
    onBulkLinkKindChange: (kind: 'job' | 'website' | 'linkedin') => void;
    onOpenLinks: () => void;
  };
}

const LINK_KIND_OPTIONS = [
  { value: 'job', label: 'Job Links' },
  { value: 'website', label: 'Websites' },
  { value: 'linkedin', label: 'Profile Links' },
] as const;

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  bulkStatus,
  onBulkStatusChange,
  onApplyBulkStatus,
  onBulkDelete,
  statusOptions,
  linkActions,
}) => {
  return (
    <div className="bulk-actions-bar">
      <div className="bulk-actions-group bulk-actions-left">
        <span className="bulk-actions-count">{selectedCount} selected</span>
        <select
          className="apple-select bulk-actions-status"
          value={bulkStatus}
          onChange={(e) => onBulkStatusChange(e.target.value as JobStatus)}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          className="btn-apple btn-outline bulk-actions-btn"
          disabled={selectedCount === 0}
          onClick={onApplyBulkStatus}
        >
          <CheckCircleIcon size={14} />
          Change Status
        </button>
      </div>

      {linkActions && (
        <div className="bulk-actions-group bulk-actions-center">
          <select
            className="apple-select bulk-actions-status"
            value={linkActions.bulkLinkKind}
            onChange={(e) =>
              linkActions.onBulkLinkKindChange(e.target.value as 'job' | 'website' | 'linkedin')
            }
          >
            {LINK_KIND_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            className="btn-apple btn-outline bulk-actions-btn"
            disabled={selectedCount === 0}
            onClick={linkActions.onOpenLinks}
          >
            {linkActions.bulkLinkKind === 'job' && <LinkIcon size={14} />}
            {linkActions.bulkLinkKind === 'website' && <GlobeIcon size={14} />}
            {linkActions.bulkLinkKind === 'linkedin' && <LinkedinIcon size={14} />}
            Open Links
          </button>
        </div>
      )}

      <div className="bulk-actions-group bulk-actions-right">
        <button
          className="btn-apple btn-destructive bulk-actions-btn"
          disabled={selectedCount === 0}
          onClick={onBulkDelete}
        >
          <TrashIcon size={14} />
          Delete Selected
        </button>
      </div>
    </div>
  );
};
