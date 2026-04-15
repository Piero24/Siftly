/**
 * currency.ts — Lightweight exchange rate utility.
 *
 * Uses the free Open Exchange Rates compatible endpoint from
 * https://open.er-api.com (no API key needed for basic USD base rates).
 * Results are cached in-memory per session to avoid redundant fetches.
 */

const CACHE: Record<string, Record<string, number>> = {};

/**
 * Fetch exchange rates for the given base currency.
 * Example: fetchRates("USD") → { EUR: 0.92, GBP: 0.79, … }
 */
async function fetchRates(base: string): Promise<Record<string, number>> {
  if (CACHE[base]) return CACHE[base];

  const res = await fetch(`https://open.er-api.com/v6/latest/${base}`);
  if (!res.ok) throw new Error(`Exchange rate fetch failed: ${res.status}`);

  const data = await res.json();
  CACHE[base] = data.rates as Record<string, number>;
  return CACHE[base];
}

/**
 * Convert `amount` from `from` currency to `to` currency.
 * Returns `null` if the request fails or currencies are unknown.
 */
export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<number | null> {
  if (from.toUpperCase() === to.toUpperCase()) return amount;

  try {
    const rates = await fetchRates(from.toUpperCase());
    const rate = rates[to.toUpperCase()];
    if (!rate) return null;
    return Math.round(amount * rate);
  } catch {
    return null;
  }
}

/**
 * Format a number as a currency string.
 * Example: formatCurrency(180000, "USD") → "$180,000"
 * With compact: true → "$180k"
 */
export function formatCurrency(amount: number, currency: string, compact: boolean = false): string {
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
      ...(compact ? { notation: 'compact', compactDisplay: 'short' } : {}),
    })
      .format(amount)
      .toLowerCase(); // toLowerCase for "k" instead of "K"
  } catch {
    let formatted = amount.toLocaleString();
    if (compact && amount >= 1000) {
      formatted = `${(amount / 1000).toFixed(0)}k`;
    }
    return `${currency} ${formatted}`;
  }
}
