/**
 * ComboBox — Accessible typeahead/autocomplete input.
 * - Type to filter matching items from the provided list.
 * - Only values present in the list are accepted (validated on blur).
 * - Shows a filtered dropdown as you type.
 * - Keyboard accessible: Arrow Up/Down + Enter + Escape.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface ComboBoxItem {
  value: string; // internal key (e.g. country ISO code)
  label: string; // display string (e.g. "United States")
}

interface ComboBoxProps {
  items:        ComboBoxItem[];
  value:        string;           // current selected value (the `value` field)
  onChange:     (value: string) => void;
  placeholder?: string;
  className?:   string;
  hasError?:    boolean;
  disabled?:    boolean;
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export const ComboBox: React.FC<ComboBoxProps> = ({
  items, value, onChange, placeholder = 'Type to search…', className = '', hasError, disabled,
}) => {
  const selectedItem  = items.find((i) => i.value === value);
  const [query,   setQuery]   = useState(selectedItem?.label ?? '');
  const [open,    setOpen]    = useState(false);
  const [cursor,  setCursor]  = useState(-1);
  const inputRef  = useRef<HTMLInputElement>(null);
  const listRef   = useRef<HTMLUListElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);

  // Keep query in sync when value changes externally
  useEffect(() => {
    setQuery(items.find((i) => i.value === value)?.label ?? '');
  }, [value, items]);

  const normalizedQuery = normalizeText(query);
  const filtered = normalizedQuery
    ? [...items]
        .filter((i) => normalizeText(i.label).includes(normalizedQuery))
        .sort((a, b) => {
          const aNorm = normalizeText(a.label);
          const bNorm = normalizeText(b.label);

          const aStarts = aNorm.startsWith(normalizedQuery) ? 1 : 0;
          const bStarts = bNorm.startsWith(normalizedQuery) ? 1 : 0;
          if (aStarts !== bStarts) return bStarts - aStarts;

          return a.label.localeCompare(b.label);
        })
        .slice(0, 50)
    : items.slice(0, 50);

  const select = useCallback((item: ComboBoxItem) => {
    setQuery(item.label);
    onChange(item.value);
    setOpen(false);
    setCursor(-1);
  }, [onChange]);

  // Validate on blur: revert to last valid value if invalid
  const handleBlur = () => {
    setTimeout(() => {
      if (!wrapRef.current?.contains(document.activeElement)) {
        setOpen(false);
        // Revert to last accepted label if query doesn't match any item
        const normalizedInput = normalizeText(query);
        const match = items.find((i) => normalizeText(i.label) === normalizedInput);
        if (match) {
          select(match);
        } else if (value) {
          // Reset to the currently selected value's label
          setQuery(selectedItem?.label ?? '');
        } else {
          setQuery('');
          onChange('');
        }
      }
    }, 120);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setCursor((c) => Math.min(c + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === 'Enter' && cursor >= 0 && filtered[cursor]) {
      e.preventDefault();
      select(filtered[cursor]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (cursor >= 0 && listRef.current) {
      const li = listRef.current.children[cursor] as HTMLElement;
      li?.scrollIntoView({ block: 'nearest' });
    }
  }, [cursor]);

  return (
    <div className={`combobox-wrapper ${className}`} ref={wrapRef}>
      <input
        ref={inputRef}
        className={`form-input combobox-input ${hasError ? 'input-error' : ''}`}
        value={query}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setCursor(-1); }}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        onKeyDown={handleKey}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <ul className="combobox-dropdown" ref={listRef} role="listbox">
          {filtered.map((item, idx) => (
            <li
              key={item.value}
              className={`combobox-option ${idx === cursor ? 'combobox-option--active' : ''}`}
              role="option"
              aria-selected={item.value === value}
              onMouseDown={(e) => { e.preventDefault(); select(item); }}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
