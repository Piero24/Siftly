/**
 * FormSectionHeader — Shared header for modal form sections.
 */
import React from 'react';

interface FormSectionHeaderProps {
  icon: React.ReactNode;
  title: string;
}

export const FormSectionHeader: React.FC<FormSectionHeaderProps> = ({ icon, title }) => (
  <div className="form-section-header">
    {icon}
    <h3>{title}</h3>
  </div>
);
