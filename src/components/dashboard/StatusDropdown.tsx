/**
 * StatusDropdown — Styled badge dropdown identical in shape to WorkTypeBadge.
 * Shows: [Icon] [Label] [ChevronDown]
 * The native <select> is overlaid invisibly on top to capture interaction.
 */
import React from 'react';
import { ChevronDownIcon } from '../common/Icons';
import {
  CircleIcon, SendIcon, UsersIcon, GiftIcon, CheckCircleIcon, XCircleIcon, ClockIcon
} from '../common/Icons';
import { JobStatus } from '../../types/job';
import type { LucideIcon } from '../common/Icons';

interface StatusConfig {
  label:     string;
  className: string;
  Icon:      LucideIcon;
}

const STATUS_CONFIG: Record<JobStatus, StatusConfig> = {
  pending:      { label: 'Pending',      className: 'badge badge-pending',      Icon: CircleIcon        },
  applied:      { label: 'Applied',      className: 'badge badge-applied',      Icon: SendIcon          },
  interviewing: { label: 'Interviewing', className: 'badge badge-interviewing', Icon: UsersIcon         },
  offer:        { label: 'Offer',        className: 'badge badge-offer',        Icon: GiftIcon          },
  accepted:     { label: 'Accepted',     className: 'badge badge-accepted',     Icon: CheckCircleIcon   },
  rejected:     { label: 'Rejected',     className: 'badge badge-rejected',     Icon: XCircleIcon       },
  'no-response':{ label: 'No Response',  className: 'badge badge-no-response',  Icon: ClockIcon         },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG) as JobStatus[];

interface StatusDropdownProps {
  status:   JobStatus;
  onChange: (status: JobStatus) => void;
}

export const StatusDropdown: React.FC<StatusDropdownProps> = ({ status, onChange }) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const { label, className, Icon } = config;

  return (
    <span className={`${className} status-badge-dropdown`}>
      <Icon size={12} />
      <span className="status-badge-label">{label}</span>
      <ChevronDownIcon size={10} className="status-badge-chevron" />
      {/* Invisible native select overlaid on badge for interaction */}
      <select
        className="status-badge-select"
        value={status}
        onChange={(e) => onChange(e.target.value as JobStatus)}
        onClick={(e) => e.stopPropagation()}
        title="Change status"
      >
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_CONFIG[s].label}
          </option>
        ))}
      </select>
    </span>
  );
};
