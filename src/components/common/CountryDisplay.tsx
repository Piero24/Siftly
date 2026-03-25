/**
 * CountryDisplay — Reusable component for rendering a country flag + name.
 * Uses the `flag-icons` CSS library (via global CSS import) and
 * `i18n-iso-countries` for accurate English country names.
 *
 * Usage:
 *   <CountryDisplay code="US" />
 *   <CountryDisplay code="IT" showName={false} />
 */
import React from 'react';
import { getCountryName, getFlagClass } from '../../lib/countries';

interface CountryDisplayProps {
  /** ISO 3166-1 alpha-2 code (e.g. "US", "IT") */
  code: string;
  /** Show the full country name alongside the flag. Default: true */
  showName?: boolean;
  className?: string;
}

export const CountryDisplay: React.FC<CountryDisplayProps> = ({
  code,
  showName = true,
  className,
}) => {
  const name = getCountryName(code);
  const flagClass = getFlagClass(code);

  return (
    <span className={`country-display ${className ?? ''}`}>
      <span className={flagClass} style={{ borderRadius: '3px', fontSize: '16px' }} />
      {showName && <span className="country-display__name">{name}</span>}
    </span>
  );
};
