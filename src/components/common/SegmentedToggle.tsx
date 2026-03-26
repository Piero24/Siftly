import React from 'react';

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedToggleProps<T extends string> {
  value: T;
  options: Array<SegmentedOption<T>>;
  onChange: (value: T) => void;
}

export const SegmentedToggle = <T extends string>({ value, options, onChange }: SegmentedToggleProps<T>) => (
  <div className="theme-toggle-group">
    {options.map((option) => (
      <button
        key={option.value}
        className={`theme-btn ${value === option.value ? 'active' : ''}`}
        onClick={() => onChange(option.value)}
      >
        {option.icon}
        {option.label}
      </button>
    ))}
  </div>
);
