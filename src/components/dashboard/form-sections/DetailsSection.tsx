/**
 * DetailsSection — Job description, company rating, and personal notes.
 */
import React from 'react';
import { BookOpenIcon } from '../../common/Icons';
import { FormSectionHeader } from './FormSectionHeader';
import { StarPicker } from '../../common/StarPicker';
import { MarkdownEditor } from '../../common/MarkdownEditor';
import type { FormState } from '../../../constants/form';

interface DetailsSectionProps {
  form: FormState;
  onChange: (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}

export const DetailsSection: React.FC<DetailsSectionProps> = ({ form, onChange, setForm }) => (
  <section className="form-section">
    <FormSectionHeader icon={<BookOpenIcon size={16} />} title="Details" />
    <div className="form-field">
      <label>Job Description</label>
      <MarkdownEditor rows={4} placeholder="Paste the job description or your key observations…" value={form.description} onChange={onChange('description')} />
    </div>
    <div className="form-field">
      <label>Company Rating</label>
      <StarPicker value={form.rating} onChange={(r) => setForm((p) => ({ ...p, rating: r }))} />
    </div>
    <div className="form-field">
      <label>Personal Notes</label>
      <MarkdownEditor rows={3} placeholder="Interview tips, contacts, gut feelings…" value={form.notes} onChange={onChange('notes')} />
    </div>
  </section>
);
