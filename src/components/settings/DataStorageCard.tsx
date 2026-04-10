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
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{storageModeLabel}</span>
        </div>

        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 16, marginTop: 12 }}>
          <label style={{ display: 'block', marginBottom: 12, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            Import & Export
          </label>
          <div className="support-actions">
            <button className="btn-apple btn-outline" onClick={handleExportCSV}>
              <DownloadIcon size={14} /> Export CSV
            </button>
            <button className="btn-apple btn-outline" onClick={() => setShowCSVImport(true)}>
              <UploadIcon size={14} /> Import CSV
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
            Export all your applications as a CSV file or import from a previously exported file.
          </p>
        </div>

        {/* Reset Section */}
        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 16, marginTop: 12 }}>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: 'var(--color-rejected, #FF3B30)' }}>
            <TrashIcon size={14} /> Reset Data
          </label>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, margin: '0 0 12px' }}>
            Permanently delete all applications. This cannot be undone.
          </p>
          {!showResetConfirm ? (
            <button className="btn-apple btn-destructive" onClick={() => setShowResetConfirm(true)}>
              <TrashIcon size={14} /> Clear All Applications
            </button>
          ) : (
            <div className="delete-confirm-box">
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 12px' }}>
                Type <strong>RESET</strong> to confirm:
              </p>
              <input
                className="apple-select"
                style={{ width: '100%', marginBottom: 12, boxSizing: 'border-box' }}
                value={resetInput}
                onChange={(e) => setResetInput(e.target.value)}
                placeholder="Type RESET"
                autoFocus
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-apple btn-outline" onClick={() => { setShowResetConfirm(false); setResetInput(''); }}>
                  Cancel
                </button>
                <button
                  className="btn-apple btn-destructive"
                  disabled={resetInput !== 'RESET' || isResetting}
                  onClick={handleResetAll}
                >
                  {isResetting ? 'Resetting…' : 'Delete All'}
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
