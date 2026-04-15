/**
 * TableDisplayCard — Table column visibility, sort order, and rows-per-page.
 */
import React from 'react';
import { LayoutIcon } from '../common/Icons';
import { SettingsCard } from '../common/SettingsCard';
import { useSettings } from '../../context/SettingsContext';

const COLUMN_LABELS = [
  'Company',
  'Sector',
  'Position',
  'Country',
  'City',
  'Work',
  'Salary',
  'CV',
  'Date',
  'Status',
];

export const TableDisplayCard: React.FC = () => {
  const { tableDisplay, setTableDisplay } = useSettings();

  return (
    <SettingsCard icon={<LayoutIcon size={22} />} title="Table Display">
      <div className="setting-item">
        <label>Rows Per Page</label>
        <select
          value={tableDisplay.rowsPerPage}
          onChange={(e) =>
            setTableDisplay((prev) => ({ ...prev, rowsPerPage: parseInt(e.target.value) }))
          }
          className="apple-select"
        >
          <option value={10}>10 rows</option>
          <option value={20}>20 rows</option>
          <option value={50}>50 rows</option>
          <option value={100}>100 rows</option>
        </select>
      </div>
      <div className="setting-item">
        <label>Default Sort</label>
        <select
          value={tableDisplay.defaultSort}
          onChange={(e) => setTableDisplay((prev) => ({ ...prev, defaultSort: e.target.value }))}
          className="apple-select"
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="salary-desc">Highest Salary</option>
          <option value="rating-desc">Highest Rating</option>
        </select>
      </div>
      <div style={{ marginTop: 16 }}>
        <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
          Visible Columns
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {COLUMN_LABELS.map((col) => {
            const colKey = col.toLowerCase();
            const isVisible = tableDisplay.visibleColumns.includes(colKey);
            return (
              <label
                key={col}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                }}
              >
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={(e) => {
                    const newCols = e.target.checked
                      ? [...tableDisplay.visibleColumns, colKey]
                      : tableDisplay.visibleColumns.filter((c) => c !== colKey);
                    setTableDisplay((prev) => ({ ...prev, visibleColumns: newCols }));
                  }}
                />
                {col}
              </label>
            );
          })}
        </div>
      </div>
    </SettingsCard>
  );
};
