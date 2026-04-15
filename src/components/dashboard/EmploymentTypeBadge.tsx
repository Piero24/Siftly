import React from 'react';
import { EmploymentType } from '../../types/job';

interface EmploymentTypeBadgeProps {
  type?: EmploymentType;
  compact?: boolean;
}

const LABEL: Record<EmploymentType, string> = {
  permanent: 'Permanent',
  intern: 'Intern',
  'fixed-term': 'Fixed Term',
};

const SYMBOL: Record<Exclude<EmploymentType, 'permanent'>, string> = {
  intern: 'I',
  'fixed-term': 'F',
};

const CLASS_NAME: Record<EmploymentType, string> = {
  permanent: 'badge',
  intern: 'badge badge-intern',
  'fixed-term': 'badge badge-fixed-term',
};

export const EmploymentTypeBadge: React.FC<EmploymentTypeBadgeProps> = ({
  type = 'permanent',
  compact = false,
}) => {
  if (type === 'permanent') return null;

  if (compact) {
    return (
      <span className={`employment-type-symbol employment-type-symbol-${type}`} title={LABEL[type]}>
        {SYMBOL[type]}
      </span>
    );
  }

  return <span className={CLASS_NAME[type]}>{LABEL[type]}</span>;
};
