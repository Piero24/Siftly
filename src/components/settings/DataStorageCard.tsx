/**
 * DataStorageCard — Storage mode display, CSV import/export, and data reset.
 */
import React, { useState } from 'react';
import { LayoutIcon, DownloadIcon, UploadIcon, TrashIcon } from '../common/Icons';
import { SettingsCard } from '../common/SettingsCard';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { exportToCSV, downloadCSV } from '../../lib/csv';
import { CSVImportModal } from '../dashboard/CSVImportModal';
import { JobApplication } from '../../types/job';

interface DataStorageCardProps {
  applications: JobApplication[];
  onImportCSV?: (apps: JobApplication[]) => void;
  onResetAll?: () => Promise<void>;
}

export const DataStorageCard: React.FC<DataStorageCardProps> = ({
  applications, onImportCSV, onResetAll,
}) => {
  const { storageMode } = useSettings();
  const { showToast } = useToast();
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetInput, setResetInput] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const storageModeLabel = storageMode === 'remote'
    ? 'Cloud (Supabase)'
    : storageMode === 'local'
      ? 'Local (Server SQLite)'
      : 'Synced (Cloud + Local)';

  const handleExportCSV = () => {
    const csv = exportToCSV(applications);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `siftly-export-${dateStr}.csv`);
  };

  const handleImportCSV = async (apps: JobApplication[]) => {
    try {
      await onImportCSV?.(apps);
      showToast(`Successfully imported ${apps.length} applications.`, 'success');
    } catch (err: any) {
      showToast(`Failed to import applications: ${err.message || 'Unknown error'}`, 'error');
    }
  };

  const handleResetAll = async () => {
    if (resetInput !== 'RESET') return;
    setIsResetting(true);
    try {
      await onResetAll?.();
      setShowResetConfirm(false);
      setResetInput('');
      showToast('All applications cleared successfully.', 'success');
    } catch (err) {
      console.error('Reset failed:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <SettingsCard icon={<LayoutIcon size={22} />} title="Data & Storage">
        <div className="setting-item">
          <label>Storage Mode</label>
          <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>{storageModeLabel}</span>
        </div>

        <div style={{ borderTop: '1px solid var(--divider)', paddingTop: 18, marginTop: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            Import & Export
          </label>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.4 }}>
            Manage your data locally. Export your applications as a CSV or import them from a backup file.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-apple btn-outline" style={{ flex: 1, padding: '10px' }} onClick={handleExportCSV}>
              <DownloadIcon size={14} /> Export CSV
            </button>
            <button className="btn-apple btn-outline" style={{ flex: 1, padding: '10px' }} onClick={() => setShowCSVImport(true)}>
              <UploadIcon size={14} /> Import CSV
            </button>
          </div>
        </div>

        {/* Reset Section */}
        <div style={{ borderTop: '1px solid var(--divider)', paddingTop: 18, marginTop: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 14, fontWeight: 700, color: '#ff453a' }}>
            <TrashIcon size={14} /> Critical Actions
          </label>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.4 }}>
            Permanently delete all applications from this profile. This process cannot be reversed.
          </p>
          {!showResetConfirm ? (
            <button className="btn-apple btn-destructive" style={{ width: '100%', height: 40, borderRadius: 10 }} onClick={() => setShowResetConfirm(true)}>
              Clear All Data
            </button>
          ) : (
            <div className="delete-confirm-box" style={{ background: 'rgba(255, 59, 48, 0.08)', backdropFilter: 'blur(10px)' }}>
              <div className="auth-confirm-label" style={{ marginBottom: 4 }}>
                <TrashIcon size={14} /> Reset Data
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                To confirm full deletion, please type <strong>RESET</strong> below:
              </p>
              <input
                className="auth-confirm-input"
                value={resetInput}
                onChange={(e) => setResetInput(e.target.value)}
                placeholder="Type RESET here..."
                autoFocus
              />
              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  className="btn-apple btn-confirm-cancel" 
                  style={{ flex: 1, height: 40, borderRadius: 10, fontWeight: 600 }} 
                  onClick={() => { setShowResetConfirm(false); setResetInput(''); }}
                >
                  Cancel
                </button>
                <button
                  className="btn-apple btn-confirm-delete"
                  style={{ 
                    flex: 1, 
                    height: 40, 
                    borderRadius: 10,
                    fontWeight: 700,
                    opacity: resetInput === 'RESET' ? 1 : 0.45,
                    pointerEvents: resetInput === 'RESET' ? 'auto' : 'none',
                    background: resetInput === 'RESET' 
                      ? undefined 
                      : 'var(--surface-muted)',
                    boxShadow: resetInput === 'RESET' 
                      ? undefined 
                      : 'none',
                    color: resetInput === 'RESET' ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  disabled={resetInput !== 'RESET' || isResetting}
                  onClick={handleResetAll}
                >
                  {isResetting ? 'Resetting...' : 'Reset All'}
                </button>
              </div>
            </div>
          )}
        </div>
      </SettingsCard>

      {showCSVImport && (
        <CSVImportModal
          onClose={() => setShowCSVImport(false)}
          onImport={handleImportCSV}
        />
      )}
    </>
  );
};
