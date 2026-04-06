/**
 * format.ts — Shared text formatting utilities.
 */

/**
 * Capitalize each word in a company name.
 * e.g. "google deepmind" → "Google Deepmind"
 */
export function capitalizeCompanyName(name: string): string {
  return name
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
