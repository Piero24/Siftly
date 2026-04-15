/**
 * useApplicationForm — Shared form logic for creating/editing job applications.
 *
 * Encapsulates form state, change handlers, validation, and Escape-key-to-close.
 * Used by both NewApplicationModal (dashboard) and ManualInsertForm (popup).
 */
import { useCallback, useState } from 'react';
import { FormState } from '../constants/form';

interface UseApplicationFormReturn {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  errors: Partial<Record<keyof FormState, string>>;
  /**
   * Returns a memoized change handler for a specific form field.
   * Clears the field's validation error when the user starts typing.
   */
  handleChange: (
    field: keyof FormState,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  /** Validates required fields. Returns `true` if the form is valid. */
  validate: () => boolean;
}

/**
 * Hook for shared application form logic.
 *
 * @param initialState - Initial form values (can be populated for editing)
 */
export function useApplicationForm(initialState: FormState): UseApplicationFormReturn {
  const [form, setForm] = useState<FormState>({ ...initialState });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const handleChange = useCallback(
    (field: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      },
    [],
  );

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.company.trim()) newErrors.company = 'Company is required';
    if (!form.position.trim()) newErrors.position = 'Position is required';
    if (!form.country) newErrors.country = 'Country is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { form, setForm, errors, handleChange, validate };
}
