/**
 * RoleSection — Position, work type, employment type, and CV profile fields.
 */
import React from 'react';
import { BriefcaseIcon } from '../../common/Icons';
import { FormSectionHeader } from './FormSectionHeader';
import {
  STATUS_OPTIONS as _,
  WORK_TYPE_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
} from '../../../constants/status';
import type { FormState } from '../../../constants/form';
import type { CVProfile } from '../../../types/job';

interface RoleSectionProps {
  form: FormState;
  errors: Partial<Record<keyof FormState, string>>;
  cvProfiles: CVProfile[];
  onChange: (
    field: keyof FormState
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const RoleSection: React.FC<RoleSectionProps> = ({ form, errors, cvProfiles, onChange }) => (
  <section className="form-section">
    <FormSectionHeader icon={<BriefcaseIcon size={16} />} title="Role" />
    <div className="form-grid-2">
      <div className="form-field">
        <label>
          Position <span className="required">*</span>
        </label>
        <input
          className={`form-input ${errors.position ? 'input-error' : ''}`}
          placeholder="e.g. Senior Engineer"
          value={form.position}
          onChange={onChange('position')}
        />
        {errors.position && <span className="error-msg">{errors.position}</span>}
      </div>
      <div className="form-field">
        <label>Work Type</label>
        <select className="form-select" value={form.workType} onChange={onChange('workType')}>
          {WORK_TYPE_OPTIONS.map((w) => (
            <option key={w.value} value={w.value}>
              {w.label}
            </option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <label>Employment Type</label>
        <select
          className="form-select"
          value={form.employmentType}
          onChange={onChange('employmentType')}
        >
          {EMPLOYMENT_TYPE_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <label>CV Profile</label>
        <select className="form-select" value={form.cvProfileId} onChange={onChange('cvProfileId')}>
          <option value="">None</option>
          {cvProfiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  </section>
);
