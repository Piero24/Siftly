/**
 * scrapeMessages.ts — Message types for the scrape flow.
 *
 * Used by:
 *   - Popup → Background (request scrape)
 *   - Background → Content Script (trigger extraction)
 *   - Content Script → Background → Popup (return results)
 *
 * NOTE: The content script (`contentScript.ts`) cannot import this file
 * due to Vite chunking constraints. Constants are duplicated inline there.
 * Keep the values in sync manually.
 */
import type { FormState } from '../constants/form';
import type { RawLinkedInJob } from '../scraper/linkedin/types';

/** Message type sent from popup → background and background → content script. */
export const SIFT_SCRAPE_PAGE = 'SIFT_SCRAPE_PAGE' as const;

/** Request payload (popup → background → content script). */
export interface ScrapeRequest {
  type: typeof SIFT_SCRAPE_PAGE;
}

/** Response from the content script back to the background script. */
export interface ContentScriptScrapeResponse {
  success: boolean;
  data: RawLinkedInJob | null;
  error?: string;
}

/** Response from the background script back to the popup. */
export interface ScrapeResponse {
  success: boolean;
  formState?: Partial<FormState>;
  error?: string;
}
