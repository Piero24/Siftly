/**
 * LinksSection — Job URL, profile link, and company website fields.
 */
import React from 'react';
import { LinkIcon, LinkedinIcon, GlobeIcon } from '../../common/Icons';
import { FormSectionHeader } from './FormSectionHeader';
import type { FormState } from '../../../constants/form';

interface LinksSectionProps {
  form: FormState;
  onChange: (
    field: keyof FormState
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const LinksSection: React.FC<LinksSectionProps> = ({ form, onChange }) => (
  <section className="form-section">
    <FormSectionHeader icon={<LinkIcon size={16} />} title="Links" />
    <div className="form-field">
      <label>
        <LinkIcon size={12} /> Job Posting URL
      </label>
      <input
        type="url"
        className="form-input"
        placeholder="https://careers.company.com/job-id"
        value={form.jobUrl}
        onChange={onChange('jobUrl')}
      />
    </div>
    <div className="form-grid-2">
      <div className="form-field">
        <label>
          <LinkedinIcon size={12} /> Profile / Portal Link
        </label>
        <input
          type="url"
          className="form-input"
          placeholder="https://www.linkedin.com/company/... or https://www.indeed.com/viewjob?..."
          value={form.linkedinUrl}
          onChange={onChange('linkedinUrl')}
        />
      </div>
      <div className="form-field">
        <label>
          <GlobeIcon size={12} /> Company Website
        </label>
        <input
          type="url"
          className="form-input"
          placeholder="https://company.com"
          value={form.websiteUrl}
          onChange={onChange('websiteUrl')}
        />
      </div>
    </div>
  </section>
);
