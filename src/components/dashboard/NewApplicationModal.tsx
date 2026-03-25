/**
 * NewApplicationModal — Form to create a new job application entry.
 * Sections: Company · Role · Location · Application · Links · Details · Referral
 * 
 * Features:
 * - Country typeahead from full world list (country-state-city)
 * - City autocomplete locked to selected country
 * - Salary: single value or min–max range
 * - Visual star picker for company rating
 */
import React, { useState, useMemo } from 'react';
import {
  XIcon, BuildingIcon, BriefcaseIcon, GlobeIcon,
  LinkIcon, LinkedinIcon, CalendarIcon, UserPlusIcon, BookOpenIcon, DollarIcon, ClockIcon,
} from '../common/Icons';
import { ComboBox } from '../common/ComboBox';
import { StarPicker } from '../common/StarPicker';
import { getAllCountryOptions, getCitiesForCountry } from '../../lib/geo';
import type { ComboBoxItem } from '../common/ComboBox';
import { CVProfile, EmploymentType, JobApplication, JobStatus, WorkType, InterviewRound } from '../../types/job';

interface NewApplicationModalProps {
  initialData?: JobApplication;
  cvProfiles: CVProfile[];
  onClose: () => void;
  onSave:  (app: JobApplication) => void;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'SEK', 'CHF', 'JPY', 'CAD', 'AUD', 'JPY', 'INR'];
const WORK_TYPES: { value: WorkType; label: string }[] = [
  { value: 'remote',  label: 'Remote'  },
  { value: 'onsite',  label: 'On-Site' },
  { value: 'hybrid',  label: 'Hybrid'  },
];
const EMPLOYMENT_TYPES: { value: EmploymentType; label: string }[] = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'intern', label: 'Intern' },
  { value: 'fixed-term', label: 'Fixed-Term' },
];
const STATUSES: { value: JobStatus; label: string }[] = [
  { value: 'pending',      label: 'Pending'      },
  { value: 'applied',      label: 'Applied'      },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer',        label: 'Offer'        },
  { value: 'accepted',     label: 'Accepted'     },
  { value: 'rejected',     label: 'Rejected'     },
  { value: 'no-response',  label: 'No Response'  },
];

type SalaryType = 'single' | 'range';

type FormState = {
  company:        string;
  sector:         string;
  position:       string;
  workType:       WorkType;
  employmentType: EmploymentType;
  cvProfileId:    string;
  country:        string;
  city:           string;
  status:         JobStatus;
  date:           string;
  salaryType:     SalaryType;
  salaryAmount:   string;
  salaryMin:      string;
  salaryMax:      string;
  salaryCurrency: string;
  jobUrl:         string;
  linkedinUrl:    string;
  websiteUrl:     string;
  description:    string;
  rating:         number;
  notes:          string;
  referrer:       string;
  referralDate:   string;
  referralNote:   string;
  referralLink:   string;
  referralCode:   string;
  recruiterName:  string;
  recruiterEmail: string;
  recruiterPhone: string;
  phoneScreens:   number;
  interviews:     number;
  rounds:         InterviewRound[];
};

const DEFAULT: FormState = {
  company: '', sector: '', position: '', workType: 'hybrid',
  employmentType: 'permanent', cvProfileId: '',
  country: '', city: '', status: 'applied',
  date: new Date().toISOString().slice(0, 10),
  salaryType: 'single', salaryAmount: '', salaryMin: '', salaryMax: '',
  salaryCurrency: 'USD',
  jobUrl: '', linkedinUrl: '', websiteUrl: '',
  description: '', rating: 0, notes: '',
  referrer: '', referralDate: '', referralNote: '', referralLink: '', referralCode: '',
  recruiterName: '', recruiterEmail: '', recruiterPhone: '', phoneScreens: 0, interviews: 0, rounds: [],
};

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="form-section-header">
      {icon}
      <h3>{title}</h3>
    </div>
  );
}

export const NewApplicationModal: React.FC<NewApplicationModalProps> = ({ initialData, cvProfiles, onClose, onSave }) => {
  const [form, setForm] = useState<FormState>(() => {
    if (!initialData) return DEFAULT;
    const isRange = 'max' in initialData.salary;
    const max = isRange ? String((initialData.salary as any).max) : '';
    return {
      company: initialData.company,
      sector: initialData.sector,
      position: initialData.position,
      workType: initialData.workType,
      employmentType: initialData.employmentType || 'permanent',
      cvProfileId: initialData.cvProfileId || '',
      country: initialData.country,
      city: initialData.city,
      status: initialData.status,
      date: initialData.date,
      salaryType: isRange ? 'range' : 'single',
      salaryAmount: isRange ? '' : String(initialData.salary.amount),
      salaryMin: isRange ? String(initialData.salary.amount) : '',
      salaryMax: max,
      salaryCurrency: initialData.salary.currency,
      jobUrl: initialData.links?.job !== '#' ? initialData.links?.job || '' : '',
      linkedinUrl: initialData.links?.linkedin !== '#' ? initialData.links?.linkedin || '' : '',
      websiteUrl: initialData.links?.website !== '#' ? initialData.links?.website || '' : '',
      description: initialData.description || '',
      rating: initialData.rating || 0,
      notes: initialData.notes || '',
      referrer: initialData.referral?.referrer || '',
      referralDate: initialData.referral?.date || '',
      referralNote: initialData.referral?.note || '',
      referralLink: initialData.referral?.link || '',
      referralCode: initialData.referral?.code || '',
      recruiterName: initialData.recruiter?.name || '',
      recruiterEmail: initialData.recruiter?.email || '',
      recruiterPhone: initialData.recruiter?.phone || '',
      phoneScreens: initialData.phoneScreens || 0,
      interviews: initialData.interviews || 0,
      rounds: initialData.rounds || [],
    };
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  // Memoize country list (expensive to build)
  const countryOptions = useMemo(() => getAllCountryOptions(), []);

  // City list derived from selected country
  const cityOptions: ComboBoxItem[] = useMemo(
    () => form.country ? getCitiesForCountry(form.country) : [],
    [form.country],
  );

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleCountryChange = (countryCode: string) => {
    setForm((prev) => ({ ...prev, country: countryCode, city: '' }));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.company.trim())  errs.company  = 'Required';
    if (!form.position.trim()) errs.position = 'Required';
    if (!form.country)         errs.country  = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const hasReferral = form.referrer || form.referralDate || form.referralNote || form.referralLink || form.referralCode;
    const hasRecruiter = form.recruiterName || form.recruiterEmail || form.recruiterPhone;

    // Build salary: for 'single' use salaryAmount; for 'range' store min in amount, max separately
    // The type stores amount as the lower bound; the display hook will show it correctly
    const salaryAmount = form.salaryType === 'single'
      ? parseFloat(form.salaryAmount) || 0
      : parseFloat(form.salaryMin)    || 0;

    const salaryMax = form.salaryType === 'range' ? parseFloat(form.salaryMax) || null : null;

    const app: JobApplication = {
      id:       initialData ? initialData.id : Date.now().toString(),
      company:  form.company.trim(),
      sector:   form.sector.trim() || 'General',
      position: form.position.trim(),
      workType: form.workType,
      employmentType: form.employmentType,
      cvProfileId: form.cvProfileId || undefined,
      country:  form.country,
      city:     form.city.trim(),
      status:   form.status,
      date:     form.date,
      salary: {
        amount:   salaryAmount,
        currency: form.salaryCurrency,
        ...(salaryMax !== null ? { max: salaryMax } : {}),
      } as any,
      links: {
        job:      form.jobUrl      || '#',
        linkedin: form.linkedinUrl || '#',
        website:  form.websiteUrl  || '#',
      },
      description: form.description.trim() || undefined,
      rating:      form.rating > 0 ? form.rating : undefined,
      notes:       form.notes.trim() || undefined,
      phoneScreens: form.phoneScreens > 0 ? Number(form.phoneScreens) : undefined,
      interviews:   form.interviews > 0 ? Number(form.interviews) : undefined,
      rounds:       form.rounds.length > 0 ? [...form.rounds] : undefined,
      referral: hasReferral ? {
        referrer: form.referrer.trim(),
        date:     form.referralDate,
        note:     form.referralNote.trim(),
        link:     form.referralLink.trim() || undefined,
        code:     form.referralCode.trim() || undefined,
      } : undefined,
      recruiter: hasRecruiter ? {
        name:  form.recruiterName.trim(),
        email: form.recruiterEmail.trim() || undefined,
        phone: form.recruiterPhone.trim() || undefined,
      } : undefined,
    };

    onSave(app);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content new-app-modal glass-container" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="new-app-modal-header">
          <div>
            <h2 className="new-app-modal-title">{initialData ? 'Edit Application' : 'New Application'}</h2>
            <p className="new-app-modal-subtitle">{initialData ? 'Update application details' : 'Track a new job opportunity'}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close">
            <XIcon size={14} />
          </button>
        </div>

        {/* ── Scrollable Form Body ── */}
        <div className="new-app-form-body" style={{ flex: '1 1 0%', minHeight: 0, overflowY: 'auto' }}>

          {/* Company */}
          <section className="form-section">
            <SectionHeader icon={<BuildingIcon size={16} />} title="Company" />
            <div className="form-grid-2">
              <div className="form-field">
                <label>Company Name <span className="required">*</span></label>
                <input className={`form-input ${errors.company ? 'input-error' : ''}`} placeholder="e.g. Google" value={form.company} onChange={set('company')} />
                {errors.company && <span className="error-msg">{errors.company}</span>}
              </div>
              <div className="form-field">
                <label>Sector</label>
                <input className="form-input" placeholder="e.g. Technology" value={form.sector} onChange={set('sector')} />
              </div>
            </div>
          </section>

          {/* Role */}
          <section className="form-section">
            <SectionHeader icon={<BriefcaseIcon size={16} />} title="Role" />
            <div className="form-grid-2">
              <div className="form-field">
                <label>Position <span className="required">*</span></label>
                <input className={`form-input ${errors.position ? 'input-error' : ''}`} placeholder="e.g. Senior Engineer" value={form.position} onChange={set('position')} />
                {errors.position && <span className="error-msg">{errors.position}</span>}
              </div>
              <div className="form-field">
                <label>Work Type</label>
                <select className="form-select" value={form.workType} onChange={set('workType')}>
                  {WORK_TYPES.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Employment Type</label>
                <select className="form-select" value={form.employmentType} onChange={set('employmentType')}>
                  {EMPLOYMENT_TYPES.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>CV Profile</label>
                <select className="form-select" value={form.cvProfileId} onChange={set('cvProfileId')}>
                  <option value="">None</option>
                  {cvProfiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>{profile.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Location — country-state-city typeahead */}
          <section className="form-section">
            <SectionHeader icon={<GlobeIcon size={16} />} title="Location" />
            <div className="form-grid-2">
              <div className="form-field">
                <label>Country <span className="required">*</span></label>
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
                <label>City {!form.country && <span style={{ opacity: 0.5, fontWeight: 400 }}>(select country first)</span>}</label>
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

          {/* Application Details */}
          <section className="form-section">
            <SectionHeader icon={<CalendarIcon size={16} />} title="Application" />
            <div className="form-grid-2">
              <div className="form-field">
                <label>Status</label>
                <select className="form-select" value={form.status} onChange={set('status')}>
                  {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Applied Date</label>
                <input type="date" className="form-input" value={form.date} onChange={set('date')} />
              </div>
            </div>

            {/* Salary */}
            <div className="form-field">
              <label><DollarIcon size={12} /> Salary</label>
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
                    <input type="number" className="form-input" placeholder="e.g. 120000" value={form.salaryAmount} onChange={set('salaryAmount')} min="0" />
                  </div>
                ) : (
                  <>
                    <div className="form-field">
                      <input type="number" className="form-input" placeholder="Min (e.g. 90000)" value={form.salaryMin} onChange={set('salaryMin')} min="0" />
                    </div>
                    <div className="form-field">
                      <input type="number" className="form-input" placeholder="Max (e.g. 140000)" value={form.salaryMax} onChange={set('salaryMax')} min="0" />
                    </div>
                  </>
                )}
                <div className="form-field">
                  <select className="form-select" value={form.salaryCurrency} onChange={set('salaryCurrency')}>
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Links */}
          <section className="form-section">
            <SectionHeader icon={<LinkIcon size={16} />} title="Links" />
            <div className="form-field">
              <label><LinkIcon size={12} /> Job Posting URL</label>
              <input type="url" className="form-input" placeholder="https://careers.company.com/job-id" value={form.jobUrl} onChange={set('jobUrl')} />
            </div>
            <div className="form-grid-2">
              <div className="form-field">
                <label><LinkedinIcon size={12} /> LinkedIn</label>
                <input type="url" className="form-input" placeholder="https://linkedin.com/jobs/…" value={form.linkedinUrl} onChange={set('linkedinUrl')} />
              </div>
              <div className="form-field">
                <label><GlobeIcon size={12} /> Company Website</label>
                <input type="url" className="form-input" placeholder="https://company.com" value={form.websiteUrl} onChange={set('websiteUrl')} />
              </div>
            </div>
          </section>

          {/* Details */}
          <section className="form-section">
            <SectionHeader icon={<BookOpenIcon size={16} />} title="Details" />
            <div className="form-field">
              <label>Job Description</label>
              <textarea className="form-textarea" rows={4} placeholder="Paste the job description or your key observations…" value={form.description} onChange={set('description')} />
            </div>
            <div className="form-field">
              <label>Company Rating</label>
              <StarPicker value={form.rating} onChange={(r) => setForm((p) => ({ ...p, rating: r }))} />
            </div>
            <div className="form-field">
              <label>Personal Notes</label>
              <textarea className="form-textarea" rows={3} placeholder="Interview tips, contacts, gut feelings…" value={form.notes} onChange={set('notes')} />
            </div>
          </section>

          {/* Contacts */}
          <section className="form-section">
            <SectionHeader icon={<UserPlusIcon size={16} />} title="Contacts & Referrals" />
            <div className="form-grid-2">
              <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Recruiter / HR Contact</h4>
              </div>
              <div className="form-field">
                <label>Recruiter Name</label>
                <input className="form-input" placeholder="e.g. Alice HR" value={form.recruiterName} onChange={set('recruiterName')} />
              </div>
              <div className="form-field">
                <label>Recruiter Email</label>
                <input type="email" className="form-input" placeholder="e.g. alice@company.com" value={form.recruiterEmail} onChange={set('recruiterEmail')} />
              </div>
              <div className="form-field">
                <label>Recruiter Phone</label>
                <input type="tel" className="form-input" placeholder="e.g. +1 555-0100" value={form.recruiterPhone} onChange={set('recruiterPhone')} />
              </div>
              
              <div className="form-field" style={{ gridColumn: '1 / -1', margin: '16px 0 8px 0' }}>
                <h4 style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Referral (Who referred you)</h4>
              </div>
              <div className="form-field">
                <label>Referrer Name</label>
                <input className="form-input" placeholder="e.g. Jane Smith" value={form.referrer} onChange={set('referrer')} />
              </div>
              <div className="form-field">
                <label>Referral Date</label>
                <input type="date" className="form-input" value={form.referralDate} onChange={set('referralDate')} />
              </div>
              <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                <label>Note</label>
                <input className="form-input" placeholder="How do you know them?" value={form.referralNote} onChange={set('referralNote')} />
              </div>
              <div className="form-field">
                <label>Referral Link</label>
                <input type="url" className="form-input" placeholder="https://careers.company.com/ref/…" value={form.referralLink} onChange={set('referralLink')} />
              </div>
              <div className="form-field">
                <label>Referral Code</label>
                <input className="form-input" placeholder="e.g. JANE-G24" value={form.referralCode} onChange={set('referralCode')} style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }} />
              </div>
            </div>
          </section>
          {/* ── Interview Rounds ── */}
          <section className="form-section" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
            <SectionHeader icon={<ClockIcon size={16} />} title="Interview Rounds" />
            
            {form.rounds.map((round, index) => (
              <div key={round.id} style={{ background: 'var(--surface-muted)', padding: '16px', borderRadius: '12px', marginBottom: '16px', position: 'relative', border: '1px solid var(--border-subtle)' }}>
                <button type="button" onClick={() => setForm(p => ({ ...p, rounds: p.rounds.filter(r => r.id !== round.id) }))} style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', boxShadow: 'var(--shadow-soft)' }}>
                  <XIcon size={12} />
                </button>
                <div className="form-grid-2" style={{ gap: '16px' }}>
                  <div className="form-field">
                    <label>Round #</label>
                    <input type="number" className="form-input" style={{ width: '80px' }} value={round.roundNumber} onChange={(e) => {
                      const newRounds = [...form.rounds];
                      newRounds[index].roundNumber = Number(e.target.value);
                      setForm(p => ({ ...p, rounds: newRounds }));
                    }} />
                  </div>
                  <div className="form-field">
                    <label>Date & Time</label>
                    <input type="datetime-local" className="form-input" value={round.date} onChange={(e) => {
                      const newRounds = [...form.rounds];
                      newRounds[index].date = e.target.value;
                      setForm(p => ({ ...p, rounds: newRounds }));
                    }} />
                  </div>
                  <div className="form-field">
                    <label>Interviewer Name</label>
                    <input className="form-input" placeholder="e.g. Bob Engineer" value={round.interviewerName || ''} onChange={(e) => {
                      const newRounds = [...form.rounds];
                      newRounds[index].interviewerName = e.target.value;
                      setForm(p => ({ ...p, rounds: newRounds }));
                    }} />
                  </div>
                  <div className="form-field">
                    <label>Contact (Email/Phone)</label>
                    <input className="form-input" placeholder="e.g. bob@company.com" value={round.interviewerContact || ''} onChange={(e) => {
                      const newRounds = [...form.rounds];
                      newRounds[index].interviewerContact = e.target.value;
                      setForm(p => ({ ...p, rounds: newRounds }));
                    }} />
                  </div>
                  <div className="form-field">
                    <label>Meeting Link</label>
                    <input type="url" className="form-input" placeholder="https://meet.google.com/..." value={round.meetingLink || ''} onChange={(e) => {
                      const newRounds = [...form.rounds];
                      newRounds[index].meetingLink = e.target.value;
                      setForm(p => ({ ...p, rounds: newRounds }));
                    }} />
                  </div>
                  <div className="form-field">
                    <label>Location (In-Person)</label>
                    <input className="form-input" placeholder="Office Address" value={round.location || ''} onChange={(e) => {
                      const newRounds = [...form.rounds];
                      newRounds[index].location = e.target.value;
                      setForm(p => ({ ...p, rounds: newRounds }));
                    }} />
                  </div>
                </div>
              </div>
            ))}
            
            <button type="button" className="btn-apple btn-outline" style={{ width: '100%', marginTop: '4px' }} onClick={() => setForm(p => ({ ...p, rounds: [...p.rounds, { id: Date.now().toString() + Math.random().toString(36).substring(7), roundNumber: p.rounds.length + 1, date: '' }] }))}>
              + Add Interview Round
            </button>
          </section>
        </div>

        {/* ── Footer ── */}
        <div className="new-app-modal-footer">
          <button className="btn-apple btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-apple btn-primary" onClick={handleSave}>Save Application</button>
        </div>
      </div>
    </div>
  );
};
