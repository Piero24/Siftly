/**
 * useSalary — Hook to resolve and convert a Salary object to the user's
 * preferred currency using the live exchange rate API.
 *
 * Returns a formatted string ready for display.
 * Falls back gracefully to the original amount if conversion fails.
 */
import { useState, useEffect } from 'react';
import { Salary } from '../types/job';
import { convertCurrency, formatCurrency } from '../lib/currency';

export function useSalary(salary: Salary, targetCurrency: string): string {
  const [display, setDisplay] = useState<string>(
    formatCurrency(salary.amount, salary.currency),
  );

  useEffect(() => {
    if (salary.currency.toUpperCase() === targetCurrency.toUpperCase()) {
      setDisplay(formatCurrency(salary.amount, salary.currency));
      return;
    }

    let cancelled = false;

    convertCurrency(salary.amount, salary.currency, targetCurrency).then((converted) => {
      if (!cancelled) {
        if (converted !== null) {
          setDisplay(formatCurrency(converted, targetCurrency));
        } else {
          // Fallback: show original with a note
          setDisplay(`${formatCurrency(salary.amount, salary.currency)}*`);
        }
      }
    });

    return () => { cancelled = true; };
  }, [salary.amount, salary.currency, targetCurrency]);

  return display;
}
