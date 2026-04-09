import React, { useState, useCallback } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useJobApplications } from '../hooks/useJobApplications';
import { EXTENSION_IFRAME_DRAG_START, EXTENSION_PANEL_SOURCE } from '../lib/extensionPanelMessages';
import { DEFAULT_FORM_STATE, FormState } from '../constants/form';
import { toJobApplication } from '../components/dashboard/NewApplicationModal';

import { CompanySection } from '../components/dashboard/form-sections/CompanySection';
import { RoleSection } from '../components/dashboard/form-sections/RoleSection';
import { LocationSection } from '../components/dashboard/form-sections/LocationSection';
import { LinksSection } from '../components/dashboard/form-sections/LinksSection';
import { ApplicationSection } from '../components/dashboard/form-sections/ApplicationSection';
import { DetailsSection } from '../components/dashboard/form-sections/DetailsSection';
import {
  ArrowLeftIcon,
  SpinnerIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '../components/common/Icons';
import { AutoCloseTimer } from '../components/common/AutoCloseTimer';

interface ManualInsertFormProps {
  onCancel: () => void;
  onBack: () => void;
  onSuccess: () => void;
}

export const ManualInsertForm: React.FC<ManualInsertFormProps> = ({
  onCancel,
  onBack,
  onSuccess,
}) => {
  const {
    cvProfiles,
    autoNoResponse,
    autoNoResponseDays,
    storageMode,
    isDraggable,
    autoCloseEnabled,
    autoCloseTimer,
  } = useSettings();
  const { isAuthenticated } = useAuth();
  const { addApplication } = useJobApplications(autoNoResponse, autoNoResponseDays, storageMode);

  const [form, setForm] = useState<FormState>({ ...DEFAULT_FORM_STATE });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<string | null>(null);

  const handleDragStart = (e: React.PointerEvent) => {
    if (!isDraggable) return;
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    window.parent.postMessage(
      {
        type: EXTENSION_IFRAME_DRAG_START,
        source: EXTENSION_PANEL_SOURCE,
        clientX: e.clientX,
        clientY: e.clientY,
      },
      '*'
    );
  };

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

  const handleSend = async () => {
    if (!validate()) return;

    if (!navigator.onLine) {
      setErrorState('No internet connection. Please verify your network and try again.');
      return;
    }

    if (!isAuthenticated) {
      setErrorState('You are logged out. Please log in from the dashboard first.');
      return;
    }

    setIsSubmitting(true);
    setErrorState(null);
    try {
      const newApp = toJobApplication(form);
      await addApplication(newApp, true);
      setSuccessResult(newApp.id);
    } catch (err: any) {
      setErrorState(err?.message || 'Failed to preserve application data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = async () => {
    setIsSubmitting(true);
    // Artificial delay for better UX
    await new Promise((r) => setTimeout(r, 600));

    try {
      const newApp = toJobApplication(form);
      await addApplication(newApp, true);
      setSuccessResult(newApp.id);
      setErrorState(null);
    } catch (err: any) {
      setErrorState(err?.message || 'Failed to preserve application data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShowApplication = () => {
    if (successResult) {
      chrome.tabs.create({
        url: chrome.runtime.getURL(`src/dashboard/index.html?jobId=${successResult}`),
      });
    }
    onSuccess();
  };

  if (errorState || (isSubmitting && errorState !== null)) {
    return (
      <div className="popup-form-view">
        <div
          className="popup-form-header"
          onPointerDown={handleDragStart}
          style={{
            justifyContent: 'space-between',
            cursor: isDraggable ? 'grab' : 'default',
            touchAction: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="popup-icon-button"
              onClick={onBack}
              aria-label="Go back"
              disabled={isSubmitting}
            >
              <ArrowLeftIcon size={18} />
            </button>
            <span className="popup-form-title">Error</span>
          </div>
          {!isSubmitting && autoCloseEnabled && (
            <AutoCloseTimer
              onComplete={onCancel}
              durationMs={autoCloseTimer * 1000}
              color="#d93025"
            />
          )}
        </div>
        <div
          className="popup-form-body"
          style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', flex: 1 }}
        >
          {isSubmitting ? (
            <>
              <div className="popup-spinner" style={{ marginBottom: '16px', color: '#007AFF' }}>
                <SpinnerIcon size={48} />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>Retrying...</h3>
              <p style={{ margin: '0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                Attempting to save application
              </p>
            </>
          ) : (
            <>
              <XCircleIcon
                size={48}
                color="#d93025"
                style={{ marginBottom: '16px', flexShrink: 0 }}
              />
              <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>Submission Failed</h3>
              <p style={{ margin: '0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                {errorState}
              </p>
            </>
          )}
        </div>
        <div className="popup-form-footer">
          <button
            className="btn-apple btn-outline popup-form-btn"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Close
          </button>
          <button
            className="btn-apple btn-primary popup-form-btn"
            onClick={handleRetry}
            disabled={isSubmitting}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (successResult) {
    return (
      <div className="popup-form-view">
        <div
          className="popup-form-header"
          onPointerDown={handleDragStart}
          style={{
            justifyContent: 'space-between',
            cursor: isDraggable ? 'grab' : 'default',
            touchAction: 'none',
          }}
        >
          <span className="popup-form-title" style={{ paddingLeft: '8px' }}>
            Success
          </span>
          {autoCloseEnabled && (
            <AutoCloseTimer
              onComplete={onSuccess}
              durationMs={autoCloseTimer * 1000}
              color="#34C759"
            />
          )}
        </div>
        <div
          className="popup-form-body"
          style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', flex: 1 }}
        >
          <CheckCircleIcon
            size={48}
            color="#34C759"
            style={{ marginBottom: '16px', flexShrink: 0 }}
          />
          <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>Application Saved!</h3>
          <p style={{ margin: '0', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Your job application has been successfully added.
          </p>
        </div>
        <div className="popup-form-footer" style={{ flexDirection: 'column' }}>
          <button className="btn-apple btn-primary popup-form-btn" onClick={handleShowApplication}>
            Show in Application Table
          </button>
          <button className="btn-apple btn-outline popup-form-btn" onClick={onSuccess}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-form-view">
      <div
        className="popup-form-header"
        onPointerDown={handleDragStart}
        style={{ cursor: isDraggable ? 'grab' : 'default', touchAction: 'none' }}
      >
        <button
          type="button"
          className="popup-icon-button"
          onClick={onBack}
          aria-label="Go back"
          disabled={isSubmitting}
        >
          <ArrowLeftIcon size={18} />
        </button>
        <span className="popup-form-title">Add Application</span>
      </div>

      <div
        className="popup-form-body"
        style={{ opacity: isSubmitting ? 0.6 : 1, pointerEvents: isSubmitting ? 'none' : 'auto' }}
      >
        <CompanySection form={form} errors={errors} onChange={handleChange} />
        <RoleSection form={form} errors={errors} cvProfiles={cvProfiles} onChange={handleChange} />
        <LocationSection form={form} errors={errors} setForm={setForm} />
        <ApplicationSection form={form} onChange={handleChange} setForm={setForm} />
        <LinksSection form={form} onChange={handleChange} />
        <DetailsSection form={form} onChange={handleChange} setForm={setForm} />
      </div>

      <div className="popup-form-footer">
        <button
          className="btn-apple btn-outline popup-form-btn"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          className="btn-apple btn-primary popup-form-btn"
          onClick={handleSend}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="popup-spinner">
              <SpinnerIcon size={16} />
            </span>
          ) : (
            'Send'
          )}
        </button>
      </div>
    </div>
  );
};
