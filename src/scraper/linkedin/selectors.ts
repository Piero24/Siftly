/**
 * selectors.ts — CSS selector constants for LinkedIn job pages.
 *
 * These selectors target LinkedIn's DOM structure and WILL break
 * when LinkedIn updates their UI. Each selector has a primary
 * and fallback variant. Update SELECTOR_VERSION when modifying.
 *
 * @see PLAN.md §3 for the full selector strategy.
 */

/** Increment when selectors are updated. */
export const SELECTOR_VERSION = '1.0.0';

// TODO: Phase A — Implement primary + fallback selectors
// Example structure:
//
// export const SELECTORS = {
//   company: {
//     primary: '.job-details-jobs-unified-top-card__company-name',
//     fallback: '.topcard__org-name-link',
//   },
//   position: {
//     primary: '.job-details-jobs-unified-top-card__job-title',
//     fallback: '.topcard__title',
//   },
//   ...
// } as const;
