/**
 * ApplicationSection — Status, date, and salary fields.
 */
import React from 'react';
import { CalendarIcon, DollarIcon } from '../../common/Icons';
import { FormSectionHeader } from './FormSectionHeader';
import { STATUS_OPTIONS } from '../../../constants/status';
import { CURRENCIES } from '../../../constants/form';
import type { FormState, SalaryType } from '../../../constants/form';

interface ApplicationSectionProps {
  form: FormState;
  onChange: (
    field: keyof FormState
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}

export const ApplicationSection: React.FC<ApplicationSectionProps> = ({
  form,
  onChange,
  setForm,
}) => (
  <section className="form-section">
    <FormSectionHeader icon={<CalendarIcon size={16} />} title="Application" />
    <div className="form-grid-2">
      <div className="form-field">
        <label>Status</label>
        <select className="form-select" value={form.status} onChange={onChange('status')}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <label>Applied Date</label>
        <input type="date" className="form-input" value={form.date} onChange={onChange('date')} />
      </div>
    </div>

    {/* Salary */}
    <div className="form-field">
      <label>
        <DollarIcon size={12} /> Salary
      </label>
      <div className="salary-type-toggle">
        {(['single', 'range'] as SalaryType[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`salary-toggle-btn ${form.salaryType === t ? 'active' : ''}`}
            onClick={() => setForm((p) => ({ ...p, salaryType: t }))}
          >
            {t === 'single' ? 'Single' : 'Range'}
          </button>
        ))}
      </div>
      <div className="form-grid-2" style={{ marginTop: '8px' }}>
        {form.salaryType === 'single' ? (
          <div className="form-field">
            <input
              type="number"
              className="form-input"
              placeholder="e.g. 120000"
              value={form.salaryAmount}
              onChange={onChange('salaryAmount')}
              min="0"
            />
          </div>
        ) : (
          <>
            <div className="form-field">
              <input
                type="number"
                className="form-input"
                placeholder="Min (e.g. 90000)"
                value={form.salaryMin}
                onChange={onChange('salaryMin')}
                min="0"
              />
            </div>
            <div className="form-field">
              <input
                type="number"
                className="form-input"
                placeholder="Max (e.g. 140000)"
                value={form.salaryMax}
                onChange={onChange('salaryMax')}
                min="0"
              />
            </div>
          </>
        )}
        <div className="form-field">
          <select
            className="form-select"
            value={form.salaryCurrency}
            onChange={onChange('salaryCurrency')}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  </section>
);
