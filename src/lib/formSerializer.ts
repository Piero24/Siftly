/**
 * formSerializer.ts — Shared serialization logic for the job application form.
 *
 * Converts between the `FormState` (flat field map used in UI forms)
 * and the `JobApplication` (structured domain model stored in the backend).
 *
 * Used by both NewApplicationModal (dashboard) and ManualInsertForm (popup).
 */
import { JobApplication } from '../types/job';
import { DEFAULT_FORM_STATE, FormState } from '../constants/form';

/**
 * Deserialize a `JobApplication` into `FormState` for editing in a form.
 */
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

/**
 * Serialize `FormState` back into a `JobApplication` for storage.
 *
 * @param form - The current form state
 * @param existingId - If editing, the existing application ID to preserve
 */
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
