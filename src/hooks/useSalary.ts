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

export function useSalary(
  salary: Salary,
  targetCurrency: string,
  compact: boolean = false
): string {
  const maxAmount = (salary as any).max as number | undefined;

  const [display, setDisplay] = useState<string>(() => {
    const minStr = formatCurrency(salary.amount, salary.currency, compact);
    return maxAmount
      ? `${minStr} - ${formatCurrency(maxAmount, salary.currency, compact)}`
      : minStr;
  });

  useEffect(() => {
    let cancelled = false;

    const convert = async () => {
      // Fast path: no conversion needed
      if (salary.currency.toUpperCase() === targetCurrency.toUpperCase()) {
        const minStr = formatCurrency(salary.amount, salary.currency, compact);
        setDisplay(
          maxAmount ? `${minStr} - ${formatCurrency(maxAmount, salary.currency, compact)}` : minStr
        );
        return;
      }

      // Convert Min & Max concurrently if max exists
      const minPromise = convertCurrency(salary.amount, salary.currency, targetCurrency);
      const maxPromise = maxAmount
        ? convertCurrency(maxAmount, salary.currency, targetCurrency)
        : Promise.resolve(null);

      const [convertedMin, convertedMax] = await Promise.all([minPromise, maxPromise]);

      if (!cancelled) {
        if (convertedMin !== null) {
          const minStr = formatCurrency(convertedMin, targetCurrency, compact);
          if (maxAmount && convertedMax !== null) {
            setDisplay(`${minStr} - ${formatCurrency(convertedMax, targetCurrency, compact)}`);
          } else {
            setDisplay(minStr);
          }
        } else {
          // Fallback on HTTP conversion failure
          const minStr = formatCurrency(salary.amount, salary.currency, compact);
          setDisplay(
            maxAmount
              ? `${minStr} - ${formatCurrency(maxAmount, salary.currency, compact)}*`
              : `${minStr}*`
          );
        }
      }
    };

    convert();

    return () => {
      cancelled = true;
    };
  }, [salary.amount, maxAmount, salary.currency, targetCurrency, compact]);

  return display;
}
