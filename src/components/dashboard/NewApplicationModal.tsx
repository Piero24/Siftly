/**
 * NewApplicationModal — Create / Edit modal for a job application.
 *
 * Orchestrates form state, validation, and serialization.
 * Individual sections are rendered by focused sub-components.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { JobApplication } from '../../types/job';
import type { CVProfile } from '../../types/job';
import { XIcon } from '../common/Icons';
import { DEFAULT_FORM_STATE, FormState } from '../../constants/form';

import { CompanySection } from './form-sections/CompanySection';
import { RoleSection } from './form-sections/RoleSection';
import { LocationSection } from './form-sections/LocationSection';
import { ApplicationSection } from './form-sections/ApplicationSection';
import { LinksSection } from './form-sections/LinksSection';
import { DetailsSection } from './form-sections/DetailsSection';
import { ContactsSection } from './form-sections/ContactsSection';
import { InterviewRoundsSection } from './form-sections/InterviewRoundsSection';

interface NewApplicationModalProps {
  onClose: () => void;
  onSave: (app: JobApplication) => void;
  /** When provided, the modal pre-fills with existing data for editing. */
  editingApplication?: JobApplication | null;
  cvProfiles: CVProfile[];
}

// ── Helpers ──────────────────────────────────────────────

/** Deserialize a JobApplication into form state for editing. */
export const toFormState = (app: JobApplication): FormState => {
  const hasRange = (app.salary as any)?.max !== undefined;
  return {
    ...DEFAULT_FORM_STATE,
    company: app.company,
    sector: app.sector,
    position: app.position,
    workType: app.workType,
    employmentType: app.employmentType ?? 'permanent',
    cvProfileId: app.cvProfileId ?? '',
    country: app.country,
    city: app.city,
    status: app.status,
    date: app.date,
    salaryType: hasRange ? 'range' : 'single',
    salaryAmount: hasRange ? '' : String(app.salary?.amount || ''),
    salaryMin: hasRange ? String(app.salary?.amount || '') : '',
    salaryMax: hasRange ? String((app.salary as any)?.max || '') : '',
    salaryCurrency: app.salary?.currency || 'USD',
    jobUrl: app.links?.job || '',
    linkedinUrl: app.links?.linkedin || '',
    websiteUrl: app.links?.website || '',
    description: app.description || '',
    rating: app.rating ?? 0,
    notes: app.notes || '',
    referrer: app.referral?.referrer || '',
    referralDate: app.referral?.date || '',
    referralNote: app.referral?.note || '',
    referralLink: app.referral?.link || '',
    referralCode: app.referral?.code || '',
    recruiterName: app.recruiter?.name || '',
    recruiterEmail: app.recruiter?.email || '',
    recruiterPhone: app.recruiter?.phone || '',
    phoneScreens: app.phoneScreens ?? 0,
    interviews: app.interviews ?? 0,
    rounds: app.rounds ? [...app.rounds] : [],
  };
};

/** Serialize form state back into a JobApplication. */
export const toJobApplication = (form: FormState, existingId?: string): JobApplication => {
  const id = existingId || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const salaryObj =
    form.salaryType === 'range'
      ? {
          amount: Number(form.salaryMin) || 0,
          currency: form.salaryCurrency,
          max: Number(form.salaryMax) || 0,
        }
      : { amount: Number(form.salaryAmount) || 0, currency: form.salaryCurrency };

  const app: JobApplication = {
    id,
    company: form.company.trim(),
    sector: form.sector.trim(),
    position: form.position.trim(),
    workType: form.workType,
    employmentType: form.employmentType,
    cvProfileId: form.cvProfileId || undefined,
    country: form.country,
    city: form.city.trim(),
    status: form.status,
    date: form.date,
    salary: salaryObj as any,
    links: {
      job: form.jobUrl.trim(),
      linkedin: form.linkedinUrl.trim(),
      website: form.websiteUrl.trim(),
    },
    description: form.description.trim() || undefined,
    rating: form.rating || undefined,
    notes: form.notes.trim() || undefined,
    phoneScreens: form.phoneScreens,
    interviews: form.interviews,
    rounds: form.rounds.length > 0 ? form.rounds : undefined,
  };

  if (form.referrer.trim()) {
    app.referral = {
      referrer: form.referrer.trim(),
      date: form.referralDate,
      note: form.referralNote,
    };
    if (form.referralLink.trim()) app.referral.link = form.referralLink.trim();
    if (form.referralCode.trim()) app.referral.code = form.referralCode.trim();
  }

  if (form.recruiterName.trim()) {
    app.recruiter = { name: form.recruiterName.trim() };
    if (form.recruiterEmail.trim()) app.recruiter.email = form.recruiterEmail.trim();
    if (form.recruiterPhone.trim()) app.recruiter.phone = form.recruiterPhone.trim();
  }

  return app;
};

// ── Component ────────────────────────────────────────────

export const NewApplicationModal: React.FC<NewApplicationModalProps> = ({
  onClose,
  onSave,
  editingApplication,
  cvProfiles,
}) => {
  const [form, setForm] = useState<FormState>(
    editingApplication ? toFormState(editingApplication) : { ...DEFAULT_FORM_STATE }
  );
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  /** Generic change handler for text/select inputs. */
  const handleChange = useCallback(
    (field: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      },
    []
  );

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.company.trim()) newErrors.company = 'Company is required';
    if (!form.position.trim()) newErrors.position = 'Position is required';
    if (!form.country) newErrors.country = 'Country is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave(toJobApplication(form, editingApplication?.id));
    if (!editingApplication) setForm({ ...DEFAULT_FORM_STATE });
    onClose();
  };

  const isEditing = !!editingApplication;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass-container new-app-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="new-app-modal-header">
          <h2 className="new-app-modal-title">
            {isEditing ? 'Edit Application' : 'New Application'}
          </h2>
          <button className="modal-close-btn" onClick={onClose} title="Close">
            <XIcon size={14} />
          </button>
        </div>

        {/* Body — scrollable form */}
        <div className="new-app-form-body">
          <CompanySection form={form} errors={errors} onChange={handleChange} />
          <RoleSection
            form={form}
            errors={errors}
            cvProfiles={cvProfiles}
            onChange={handleChange}
          />
          <LocationSection form={form} errors={errors} setForm={setForm} />
          <ApplicationSection form={form} onChange={handleChange} setForm={setForm} />
          <LinksSection form={form} onChange={handleChange} />
          <DetailsSection form={form} onChange={handleChange} setForm={setForm} />
          <ContactsSection form={form} onChange={handleChange} />
          <InterviewRoundsSection form={form} setForm={setForm} />
        </div>

        {/* Footer */}
        <div className="new-app-modal-footer">
          <button className="btn-apple btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-apple btn-primary" onClick={handleSubmit}>
            {isEditing ? 'Save Changes' : 'Add Application'}
          </button>
        </div>
      </div>
    </div>
  );
};
