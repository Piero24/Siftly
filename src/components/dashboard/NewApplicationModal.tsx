/**
 * NewApplicationModal — Create / Edit modal for a job application.
 *
 * Orchestrates form state, validation, and serialization.
 * Individual sections are rendered by focused sub-components.
 */
import React, { useEffect } from 'react';
import { JobApplication } from '../../types/job';
import type { CVProfile } from '../../types/job';
import { XIcon } from '../common/Icons';
import { DEFAULT_FORM_STATE } from '../../constants/form';
import { useApplicationForm } from '../../hooks/useApplicationForm';
import { toFormState, toJobApplication } from '../../lib/formSerializer';

import { CompanySection } from './form-sections/CompanySection';
import { RoleSection } from './form-sections/RoleSection';
import { LocationSection } from './form-sections/LocationSection';
import { ApplicationSection } from './form-sections/ApplicationSection';
import { LinksSection } from './form-sections/LinksSection';
import { DetailsSection } from './form-sections/DetailsSection';
import { ContactsSection } from './form-sections/ContactsSection';
import { InterviewRoundsSection } from './form-sections/InterviewRoundsSection';

// Re-export for backward compatibility with any existing consumers.
export { toFormState, toJobApplication } from '../../lib/formSerializer';

interface NewApplicationModalProps {
  onClose: () => void;
  onSave: (app: JobApplication) => void;
  /** When provided, the modal pre-fills with existing data for editing. */
  editingApplication?: JobApplication | null;
  cvProfiles: CVProfile[];
}

export const NewApplicationModal: React.FC<NewApplicationModalProps> = ({
  onClose,
  onSave,
  editingApplication,
  cvProfiles,
}) => {
  const initialState = editingApplication
    ? toFormState(editingApplication)
    : { ...DEFAULT_FORM_STATE };

  const { form, setForm, errors, handleChange, validate } = useApplicationForm(initialState);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

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
