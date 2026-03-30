/**
 * contentScript.ts — LinkedIn content script entry point.
 *
 * Runs on linkedin.com/jobs/view/* pages. Responsibilities:
 * 1. Detect when a job detail page is loaded.
 * 2. Inject the floating "Sift" button.
 * 3. On click: extract job data from the DOM.
 * 4. Send extracted data to the background script via chrome.runtime.
 *
 * @see PLAN.md §6 for UI integration details.
 * @see PLAN.md §7 Phase A for MVP scope.
 */

import type { ExtractionResult } from './types';

// TODO: Phase A — Implement content script
//
// export function initSiftButton(): void { ... }
// export function extractJobData(): ExtractionResult { ... }
// function injectFloatingButton(): void { ... }
// function waitForDOMReady(): Promise<void> { ... }

// Placeholder export to prevent empty-module errors.
export const SCRAPER_VERSION = '0.0.0';
