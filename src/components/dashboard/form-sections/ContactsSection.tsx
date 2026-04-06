/**
 * ContactsSection — Recruiter/HR contact and referral fields.
 */
import React from 'react';
import { UserPlusIcon } from '../../common/Icons';
import { FormSectionHeader } from './FormSectionHeader';
import type { FormState } from '../../../constants/form';

interface ContactsSectionProps {
  form: FormState;
  onChange: (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const ContactsSection: React.FC<ContactsSectionProps> = ({ form, onChange }) => (
  <section className="form-section">
    <FormSectionHeader icon={<UserPlusIcon size={16} />} title="Contacts & Referrals" />
    <div className="form-grid-2">
      <div className="form-field" style={{ gridColumn: '1 / -1' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Recruiter / HR Contact</h4>
      </div>
      <div className="form-field">
        <label>Recruiter Name</label>
        <input className="form-input" placeholder="e.g. Alice HR" value={form.recruiterName} onChange={onChange('recruiterName')} />
      </div>
      <div className="form-field">
        <label>Recruiter Email</label>
        <input type="email" className="form-input" placeholder="e.g. alice@company.com" value={form.recruiterEmail} onChange={onChange('recruiterEmail')} />
      </div>
      <div className="form-field">
        <label>Recruiter Phone</label>
        <input type="tel" className="form-input" placeholder="e.g. +1 555-0100" value={form.recruiterPhone} onChange={onChange('recruiterPhone')} />
      </div>

      <div className="form-field" style={{ gridColumn: '1 / -1', margin: '16px 0 8px 0' }}>
        <h4 style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Referral (Who referred you)</h4>
      </div>
      <div className="form-field">
        <label>Referrer Name</label>
        <input className="form-input" placeholder="e.g. Jane Smith" value={form.referrer} onChange={onChange('referrer')} />
      </div>
      <div className="form-field">
        <label>Referral Date</label>
        <input type="date" className="form-input" value={form.referralDate} onChange={onChange('referralDate')} />
      </div>
      <div className="form-field" style={{ gridColumn: '1 / -1' }}>
        <label>Note</label>
        <input className="form-input" placeholder="How do you know them?" value={form.referralNote} onChange={onChange('referralNote')} />
      </div>
      <div className="form-field">
        <label>Referral Link</label>
        <input type="url" className="form-input" placeholder="https://careers.company.com/ref/…" value={form.referralLink} onChange={onChange('referralLink')} />
      </div>
      <div className="form-field">
        <label>Referral Code</label>
        <input className="form-input" placeholder="e.g. JANE-G24" value={form.referralCode} onChange={onChange('referralCode')} style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }} />
      </div>
    </div>
  </section>
);
