/**
 * WorkTypeBadge — Displays a styled badge for a job's work type.
 * Uses lucide-react icons and the shared Badge component.
 */
import React from 'react';
import { BuildingIcon, HomeIcon, LaptopIcon } from '../common/Icons';
import type { LucideIcon } from '../common/Icons';

type WorkType = 'remote' | 'onsite' | 'hybrid';

interface WorkTypeBadgeProps {
  type: WorkType;
}

interface WorkTypeConfig {
  label: string;
  className: string;
  Icon: LucideIcon;
}

const WORK_TYPE_CONFIG: Record<WorkType, WorkTypeConfig> = {
  remote:  { label: 'Remote',  className: 'badge badge-remote',  Icon: HomeIcon },
  onsite:  { label: 'On-Site', className: 'badge badge-onsite',  Icon: BuildingIcon },
  hybrid:  { label: 'Hybrid',  className: 'badge badge-hybrid',  Icon: LaptopIcon },
};

export const WorkTypeBadge: React.FC<WorkTypeBadgeProps> = ({ type }) => {
  const config = WORK_TYPE_CONFIG[type] ?? WORK_TYPE_CONFIG.remote;
  const { label, className, Icon } = config;

  return (
    <span className={className}>
      <Icon size={12} />
      <span className="work-type-label">{label}</span>
    </span>
  );
};
