/**
 * CompanySection — Company name and sector fields.
 */
import React from 'react';
import { BuildingIcon } from '../../common/Icons';
import { FormSectionHeader } from './FormSectionHeader';
import type { FormState } from '../../../constants/form';

interface CompanySectionProps {
  form: FormState;
  errors: Partial<Record<keyof FormState, string>>;
  onChange: (
    field: keyof FormState
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const CompanySection: React.FC<CompanySectionProps> = ({ form, errors, onChange }) => (
  <section className="form-section">
    <FormSectionHeader icon={<BuildingIcon size={16} />} title="Company" />
    <div className="form-grid-2">
      <div className="form-field">
        <label>
          Company Name <span className="required">*</span>
        </label>
        <input
          className={`form-input ${errors.company ? 'input-error' : ''}`}
          placeholder="e.g. Google"
          value={form.company}
          onChange={onChange('company')}
        />
        {errors.company && <span className="error-msg">{errors.company}</span>}
      </div>
      <div className="form-field">
        <label>Sector</label>
        <input
          className="form-input"
          placeholder="e.g. Technology"
          value={form.sector}
          onChange={onChange('sector')}
        />
      </div>
    </div>
  </section>
);
