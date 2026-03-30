/**
 * types.ts — Raw data types for LinkedIn job extraction.
 *
 * These represent the unprocessed data scraped from the DOM
 * before normalization into a Siftly JobApplication.
 */

/** Raw job data as extracted from the LinkedIn DOM. */
export interface RawLinkedInJob {
  /** Company name as displayed on the page. */
  company: string | null;
  /** Company logo URL. */
  companyLogo: string | null;
  /** Job title / position. */
  position: string | null;
  /** Raw location string (e.g. "Mountain View, CA, United States"). */
  locationRaw: string | null;
  /** Raw salary string (e.g. "$120K – $180K/yr"). */
  salaryRaw: string | null;
  /** Full job description text. */
  description: string | null;
  /** Work type hint (e.g. "Remote", "Hybrid", "On-site"). */
  workTypeHint: string | null;
  /** Employment type hint (e.g. "Full-time", "Contract"). */
  employmentTypeHint: string | null;
  /** Posted date string (e.g. "2 weeks ago"). */
  postedDateRaw: string | null;
  /** LinkedIn job URL. */
  jobUrl: string;
  /** LinkedIn company page URL. */
  companyUrl: string | null;
  /** Sector / industry if available. */
  industry: string | null;
}

/** Extraction result with metadata. */
export interface ExtractionResult {
  /** Whether extraction succeeded (at least company + position found). */
  success: boolean;
  /** Extracted data. */
  data: RawLinkedInJob;
  /** Fields that used fallback extraction. */
  fallbacksUsed: string[];
  /** Fields that could not be extracted. */
  missingFields: string[];
  /** Timestamp of extraction. */
  extractedAt: string;
  /** Selector version used. */
  selectorVersion: string;
}
