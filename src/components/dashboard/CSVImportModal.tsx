/**
 * CSVImportModal — Drag-and-drop CSV import with preview.
 */
import React, { useCallback, useRef, useState } from 'react';
import { parseCSV } from '../../lib/csv';
import { JobApplication } from '../../types/job';
import { XCircleIcon } from '../common/Icons';

interface CSVImportModalProps {
  onClose: () => void;
  onImport: (apps: JobApplication[]) => void;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({ onClose, onImport }) => {
  const [parsed, setParsed] = useState<JobApplication[]>([]);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setError('');
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a .csv file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const apps = parseCSV(text);
        if (apps.length === 0) {
          setError('No valid rows found in the CSV file.');
        } else {
          setParsed(apps);
        }
      } catch {
        setError('Failed to parse CSV. Please check the file format.');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const confirmImport = () => {
    onImport(parsed);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 600, padding: 32 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Import CSV</h2>
          <button className="modal-close-btn" onClick={onClose} title="Close">
            <XCircleIcon size={20} />
          </button>
        </div>

        {parsed.length === 0 ? (
          <div
            className={`csv-dropzone ${isDragOver ? 'csv-dropzone--active' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="csv-dropzone-icon">📄</div>
            <p className="csv-dropzone-text">
              Drag & drop a <strong>.csv</strong> file here
            </p>
            <p className="csv-dropzone-sub">or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleInputChange}
            />
          </div>
        ) : (
          <div className="csv-preview">
            <div className="csv-preview-header">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span className="csv-preview-count">
                  {parsed.length} application{parsed.length !== 1 ? 's' : ''} found
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Partial data preview (showing all detected columns)
                </span>
              </div>
              <button className="btn-apple btn-outline" onClick={() => setParsed([])}>
                Choose another file
              </button>
            </div>
            <div
              className="csv-preview-table-wrapper"
              style={{
                overflowX: 'auto',
                borderRadius: 12,
                border: '1px solid var(--border-subtle)',
              }}
            >
              <table
                className="csv-preview-table"
                style={{ width: '100%', minWidth: 800, borderCollapse: 'collapse', fontSize: 13 }}
              >
                <thead>
                  <tr
                    style={{
                      background: 'var(--surface-solid)',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    {parsed.length > 0 &&
                      Object.keys(parsed[0])
                        .filter(
                          (k) =>
                            typeof parsed[0][k as keyof JobApplication] !== 'object' &&
                            k !== 'id' &&
                            k !== 'logo'
                        )
                        .map((key) => (
                          <th
                            key={key}
                            style={{
                              padding: '12px 14px',
                              textAlign: 'left',
                              fontWeight: 600,
                              color: 'var(--text-secondary)',
                              textTransform: 'uppercase',
                              fontSize: 11,
                              letterSpacing: '0.05em',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {key
                              .replace(/([A-Z])/g, ' $1')
                              .replace(/\./g, ' ')
                              .trim()}
                          </th>
                        ))}
                  </tr>
                </thead>
                <tbody>
                  {parsed.slice(0, 15).map((app, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      {Object.keys(app)
                        .filter(
                          (k) =>
                            typeof app[k as keyof JobApplication] !== 'object' &&
                            k !== 'id' &&
                            k !== 'logo'
                        )
                        .map((key) => {
                          const val = app[key as keyof JobApplication];
                          return (
                            <td
                              key={key}
                              style={{
                                padding: '10px 14px',
                                color: 'var(--text-primary)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: 200,
                              }}
                            >
                              {key === 'status' ? (
                                <span className={`status-badge status-${val}`}>
                                  {val as string}
                                </span>
                              ) : (
                                String(val || '')
                              )}
                            </td>
                          );
                        })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsed.length > 15 && (
                <div
                  style={{
                    padding: '12px',
                    background: 'var(--surface-subtle)',
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                    fontSize: 13,
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  …and {parsed.length - 15} more applications
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <p style={{ color: 'var(--color-rejected)', fontSize: 14, marginTop: 12 }}>{error}</p>
        )}

        <div className="modal-footer" style={{ marginTop: 20 }}>
          <button className="btn-apple btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-apple btn-primary"
            disabled={parsed.length === 0}
            onClick={confirmImport}
          >
            Import {parsed.length > 0 ? `(${parsed.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};
