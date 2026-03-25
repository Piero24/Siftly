/**
 * SearchBar — Full-width animated search input with a search icon.
 */
import React from 'react';
import { SearchIcon } from '../common/Icons';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => (
  <div className="search-bar-container">
    <span className="search-icon">
      <SearchIcon size={16} />
    </span>
    <input
      className="search-input"
      type="text"
      placeholder="Search by company, role, city…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);
