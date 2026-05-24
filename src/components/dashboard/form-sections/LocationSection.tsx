/**
 * LocationSection — Country and city typeahead fields.
 */
import React, { useMemo } from 'react';
import { GlobeIcon } from '../../common/Icons';
import { ComboBox } from '../../common/ComboBox';
import { FormSectionHeader } from './FormSectionHeader';
import { getAllCountryOptions, getCitiesForCountry } from '../../../lib/geo';
import type { FormState } from '../../../constants/form';

interface LocationSectionProps {
  form: FormState;
  errors: Partial<Record<keyof FormState, string>>;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}

export const LocationSection: React.FC<LocationSectionProps> = ({ form, errors, setForm }) => {
  const countryOptions = useMemo(() => {
    const options = [...getAllCountryOptions()];
    if (form.country) {
      const exists = options.some((opt) => opt.value === form.country);
      if (!exists) {
        options.push({ value: form.country, label: form.country });
      }
    }
    return options;
  }, [form.country]);

  const cityOptions = useMemo(() => {
    if (!form.country) return [];
    const options = [...getCitiesForCountry(form.country)];
    if (form.city) {
      const normalizedCity = form.city.trim().toLowerCase();
      const exists = options.some((opt) => opt.value.trim().toLowerCase() === normalizedCity);
      if (!exists) {
        options.push({ value: form.city, label: form.city });
      }
    }
    return options;
  }, [form.country, form.city]);

  const handleCountryChange = (countryCode: string) => {
    setForm((prev) => ({ ...prev, country: countryCode, city: '' }));
  };

  return (
    <section className="form-section">
      <FormSectionHeader icon={<GlobeIcon size={16} />} title="Location" />
      <div className="form-grid-2">
        <div className="form-field">
          <label>
            Country <span className="required">*</span>
          </label>
          <ComboBox
            items={countryOptions}
            value={form.country}
            onChange={handleCountryChange}
            placeholder="Type to search country…"
            hasError={!!errors.country}
          />
          {errors.country && <span className="error-msg">{errors.country}</span>}
        </div>
        <div className="form-field">
          <label>
            City{' '}
            {!form.country && (
              <span style={{ opacity: 0.5, fontWeight: 400 }}>(select country first)</span>
            )}
          </label>
          <ComboBox
            items={cityOptions}
            value={form.city}
            onChange={(v) => setForm((p) => ({ ...p, city: v }))}
            placeholder={form.country ? 'Type to search city…' : 'Select a country first'}
            disabled={!form.country || cityOptions.length === 0}
          />
        </div>
      </div>
    </section>
  );
};
