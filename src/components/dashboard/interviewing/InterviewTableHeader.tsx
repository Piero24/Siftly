/**
 * InterviewTableHeader — Column definitions and header row for the Interviewing table.
 */
import React from 'react';

interface InterviewTableHeaderProps {
  selectorMode: boolean;
  allRowsSelected: boolean;
  someRowsSelected: boolean;
  onToggleAllRowsSelection: (checked: boolean) => void;
}

/** Column headers displayed in the interviewing table. */
const HEADERS = [
  'Company',
  'Position',
  'Recruiter Contact',
  'Phone Screens',
  'Interviews',
  'Total Rounds',
  'Date',
  'Status',
  'Next Round',
];

/** Set of headers that should be center-aligned. */
const CENTERED_HEADERS = new Set([
  'Phone Screens',
  'Interviews',
  'Total Rounds',
  'Recruiter Contact',
  'Next Round',
]);

export const InterviewTableHeader: React.FC<InterviewTableHeaderProps> = ({
  selectorMode,
  allRowsSelected,
  someRowsSelected,
  onToggleAllRowsSelection,
}) => {
  const checkboxRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = someRowsSelected;
    }
  }, [someRowsSelected]);

  return (
    <>
      <colgroup>
        <col className="col-select" />
        <col className="col-icon" />
        <col className="col-company" />
        <col className="col-position" />
        <col className="col-recruiter" />
        <col className="col-phonescreens" />
        <col className="col-interviews" />
        <col className="col-totalrounds" />
        <col className="col-date" />
        <col className="col-status" />
        <col className="col-nextround" />
      </colgroup>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--border-strong)' }}>
          <th className="table-header col-select" onClick={(e) => e.stopPropagation()}>
            {selectorMode && (
              <input
                ref={checkboxRef}
                type="checkbox"
                checked={allRowsSelected}
                onChange={(e) => onToggleAllRowsSelection(e.target.checked)}
                aria-label="Select or unselect all rows"
              />
            )}
          </th>
          <th className="table-header col-icon"></th>
          {HEADERS.map((h, i) => (
            <th
              key={i}
              className="table-header"
              style={CENTERED_HEADERS.has(h) ? { textAlign: 'center' } : {}}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
    </>
  );
};
