/**
 * Badge — Generic, styled pill badge component.
 *
 * Usage:
 *   <Badge label="Remote" variant="success" icon={<Laptop />} />
 *   <Badge label="Rejected" variant="danger" />
 */
import React from 'react';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'info' | 'danger' | 'purple';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  className?: string;
}

const VARIANT_CLASS_MAP: Record<BadgeVariant, string> = {
  default: 'badge',
  success: 'badge badge-remote', // green
  warning: 'badge badge-hybrid', // orange
  info: 'badge badge-onsite', // blue
  danger: 'badge badge-rejected',
  purple: 'badge badge-offer',
};

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', icon, className }) => (
  <span className={`${VARIANT_CLASS_MAP[variant]} ${className ?? ''}`}>
    {icon && icon}
    {label}
  </span>
);
