/**
 * contentScript.ts — LinkedIn content script for DOM extraction.
 *
 * Runs inside the page context on linkedin.com/jobs/view/* pages.
 * Listens for SIFT_SCRAPE_PAGE messages from the background script,
 * extracts job data from the DOM via CSS selectors, and responds
 * with the raw extracted data.
 *
 * IMPORTANT: This file is loaded as a content script. It CANNOT
 * import shared modules due to Vite chunking constraints (same
 * limitation as src/content/index.ts). All constants and selectors
 * are injected at build time via `define` from `constants.json`. Keep in sync with:
 *   - src/lib/scrapeMessages.ts
 *   - src/scraper/linkedin/constants.json
 *   - src/scraper/linkedin/types.ts
 *
 * @see PLAN.md §6 for UI integration details.
 */

import type { RawLinkedInJob } from './types';
import type { ContentScriptScrapeResponse } from '../../lib/scrapeMessages';

// Injected at build time by Vite's `define` in vite.config.ts.
// This avoids a top-level `const` that would cause "Identifier already declared"
// errors when the Chrome Extension content script is re-injected into the same tab.
declare const __SCRAPER_CONSTANTS_RAW__: string;

declare global {
  interface Window {
    __SIFT_SCRAPER_INJECTED__?: boolean;
  }
}

(() => {
  if (window.__SIFT_SCRAPER_INJECTED__) return;
  window.__SIFT_SCRAPER_INJECTED__ = true;

  interface ScraperConstants {
    SELECTORS: {
      [key: string]: {
        primary: string;
        fallback: string | null;
      };
    };
    employmentTypeData: {
      permanent: string[];
      intern: string[];
      'fixed-term': string[];
    };
    workTypeData: Record<string, string[]>;
    corporateBlacklist: string[];
    socialDomains: string[];
  }

  const constants = JSON.parse(__SCRAPER_CONSTANTS_RAW__) as ScraperConstants;
  const SELECTORS = constants.SELECTORS;
  const employmentTypeData = constants.employmentTypeData;
  const workTypeData = constants.workTypeData;

  // ── Inline constants ──
  // IMPORTANT: SIFT_SCRAPE_PAGE is duplicated here instead of imported from
  // scrapeMessages.ts because importing values (not just types) causes Vite
  // to create a shared chunk, breaking the content script which is injected
  // as a classic script, not a module.
  const SIFT_SCRAPE_PAGE = 'SIFT_SCRAPE_PAGE' as const;

  // ── Extraction helpers ──────────────────────────────────

  /**
   * Try a primary selector, then a fallback. Returns the trimmed
   * text content of the first match, or null if nothing is found.
   */
  function extractText(primary: string, fallback: string | null): string | null {
    const selectors = [primary];
    if (fallback) selectors.push(...fallback.split(',').map((s) => s.trim()));

    for (const sel of selectors) {
      for (const el of Array.from(document.querySelectorAll(sel))) {
        const text = el.textContent?.trim();
        if (text) return text;
      }
    }
    return null;
  }

  /**
   * Extract an attribute value (e.g. `src`, `href`) from the first match.
   */
  function extractAttr(primary: string, fallback: string | null, attr: string): string | null {
    const selectors = [primary];
    if (fallback) selectors.push(...fallback.split(',').map((s) => s.trim()));

    for (const sel of selectors) {
      for (const el of Array.from(document.querySelectorAll(sel))) {
        const val = el.getAttribute(attr)?.trim();
        if (val) return val;
      }
    }
    return null;
  }

  /**
   * Extract the job description text, stripping HTML but preserving
   * paragraph breaks for readability.
   */
  function extractDescription(): string | null {
    let targetEl: Element | null = null;
    const selectors: string[] = [SELECTORS.description.primary];
    if (SELECTORS.description.fallback) {
      selectors.push(...SELECTORS.description.fallback.split(',').map((s) => s.trim()));
    }

    for (const sel of selectors) {
      for (const el of Array.from(document.querySelectorAll(sel))) {
        if (el.textContent?.trim()) {
          targetEl = el;
          break;
        }
      }
      if (targetEl) break;
    }

    if (!targetEl) return null;

    // Walk block-level nodes and join with double newlines for paragraphs
    const blocks: string[] = [];
    const blockTags = new Set([
      'P',
      'DIV',
      'LI',
      'H1',
      'H2',
      'H3',
      'H4',
      'H5',
      'H6',
      'SECTION',
      'ARTICLE',
      'HEADER',
      'FOOTER',
      'BLOCKQUOTE',
    ]);

    function walk(node: Node): void {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) blocks.push(text);
        return;
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        if (blockTags.has(el.tagName)) {
          const inner = el.textContent?.trim();
          if (inner) {
            // Prefix list items with a bullet
            const prefix = el.tagName === 'LI' ? '• ' : '';
            blocks.push(prefix + inner);
          }
          return; // Don't recurse into already-captured block
        }
        for (const child of Array.from(node.childNodes)) {
          walk(child);
        }
      }
    }

    walk(targetEl);
    const result = blocks.join('\n\n').trim();
    return result.length > 0 ? result : null;
  }

  /**
   * Look through all job insight spans for an employment-type keyword.
   */
  function extractEmploymentType(description?: string | null): string | null {
    const selectors: string[] = [SELECTORS.employmentType.primary];
    if (SELECTORS.employmentType.fallback) selectors.push(SELECTORS.employmentType.fallback);

    // Broad fallback selectors to catch insight items if the specific classes changed
    selectors.push(
      '.job-details-jobs-unified-top-card span',
      '.jobs-unified-top-card span',
      '.job-details-preferences-and-skills span',
      '.ui-label'
    );
    const keywords = [
      ...employmentTypeData.permanent,
      ...employmentTypeData.intern,
      ...employmentTypeData['fixed-term'],
    ];

    const insightElements = document.querySelectorAll(selectors.filter(Boolean).join(', '));
    // Limit to the first 100 spans to stay within the top card area where insights live
    const insightArray = Array.from(insightElements).slice(0, 100);

    // 1. Look for exact matches (highly confident)
    for (const el of insightArray) {
      const text = el.textContent?.toLowerCase().trim() ?? '';
      if (text.length > 0 && text.length < 50) {
        for (const kw of keywords) {
          if (text === kw || text === `• ${kw}`) {
            return el.textContent?.trim() ?? null;
          }
        }
      }
    }

    // 2. Look for looser includes match (moderate confidence)
    for (const el of insightArray) {
      const text = el.textContent?.toLowerCase().trim() ?? '';
      if (text.length > 0 && text.length < 50) {
        for (const kw of keywords) {
          if (text.includes(kw)) {
            // Avoid false positives like "hiring" or "assumendo"
            if (
              !text.includes('hiring') &&
              !text.includes('assumendo') &&
              !text.includes('recrutement') &&
              !text.includes('einstellen')
            ) {
              return el.textContent?.trim() ?? null;
            }
          }
        }
      }
    }

    // Fallback: Scan description
    if (description) {
      const lowerDesc = description.toLowerCase();

      const permanentKeywords = employmentTypeData.permanent;
      const fixedTermKeywords = employmentTypeData['fixed-term'];
      const internKeywords = employmentTypeData.intern;

      // Match longest keywords first to prevent short keyword partial collisions
      const allKws: Array<[string, string]> = [];
      permanentKeywords.forEach((kw) => allKws.push([kw, 'Full-time']));
      fixedTermKeywords.forEach((kw) => allKws.push([kw, 'Contract']));
      internKeywords.forEach((kw) => allKws.push([kw, 'Internship']));
      allKws.sort((a, b) => b[0].length - a[0].length);

      for (const [kw, canonical] of allKws) {
        if (lowerDesc.includes(kw)) {
          return canonical;
        }
      }
    }

    return null;
  }

  /**
   * Look through all job insight spans for a work-type keyword.
   */
  function extractWorkType(
    description?: string | null,
    locationText?: string | null
  ): string | null {
    // Try the dedicated selector first
    const dedicated = extractText(SELECTORS.workType.primary, SELECTORS.workType.fallback);
    if (dedicated) return dedicated;

    // Try parsing location text for parentheticals (e.g. "(Ibrido)")
    if (locationText) {
      const parentheticalMatch = locationText.match(/\(([^)]+)\)/);
      if (parentheticalMatch && parentheticalMatch[1]) {
        return parentheticalMatch[1].trim();
      }
    }

    // Build sorted keyword list (longest first) with type labels
    const precedence: Record<string, number> = { hybrid: 0, remote: 1, onsite: 2 };
    const labelMap: Record<string, string> = {
      hybrid: 'Hybrid',
      remote: 'Remote',
      onsite: 'On-site',
    };
    const allKws: Array<[string, string]> = [];
    for (const [type, keywords] of Object.entries(workTypeData)) {
      for (const kw of keywords) {
        allKws.push([kw.toLowerCase(), type]);
      }
    }
    allKws.sort((a, b) => b[0].length - a[0].length);

    // 1. Fall back to scanning all insight spans and generic spans in the top area
    // This handles cases where LinkedIn obfuscates class names.
    const insightSelectors = [
      SELECTORS.employmentType.primary,
      SELECTORS.employmentType.fallback,
      '.job-details-jobs-unified-top-card span',
      '.jobs-unified-top-card span',
      '.job-details-preferences-and-skills span',
      '.ui-label',
      '.tvm__text',
      // Very broad fallbacks for the top card area
      '.jobs-search__job-details--container span',
      'main span',
    ]
      .filter(Boolean)
      .join(', ');

    const insights = document.querySelectorAll(insightSelectors);
    // Limit to the first 100 spans to stay within the top card area
    const insightArray = Array.from(insights).slice(0, 100);

    for (const el of insightArray) {
      const text = el.textContent?.toLowerCase().trim() ?? '';
      // Only process badges / short labels
      if (text.length > 0 && text.length < 50) {
        // Look for exact matches or parenthetical matches first (highly confident)
        for (const [kw, type] of allKws) {
          if (text === kw || text.includes(`(${kw})`) || text === `• ${kw}`) {
            return labelMap[type];
          }
        }
      }
    }

    // 2. Look for looser includes match in the spans (moderate confidence)
    for (const el of insightArray) {
      const text = el.textContent?.toLowerCase().trim() ?? '';
      if (text.length > 0 && text.length < 50) {
        for (const [kw, type] of allKws) {
          if (text.includes(kw)) {
            // Ignore if it's picking up irrelevant company names that happen to contain keywords
            if (!text.includes('hiring') && !text.includes('assumendo')) {
              return labelMap[type];
            }
          }
        }
      }
    }

    // 3. Fallback: Scan description with precedence (lowest confidence)
    if (description) {
      const lowerDesc = description.toLowerCase();
      let bestType: string | null = null;
      for (const [kw, type] of allKws) {
        if (lowerDesc.includes(kw)) {
          if (!bestType || precedence[type] < precedence[bestType]) {
            bestType = type;
          }
          if (bestType === 'hybrid') break;
        }
      }
      if (bestType) return labelMap[bestType];
    }

    return null;
  }

  /**
   * Scan the description and other areas for a likely company website.
   */
  function extractCompanyWebsite(description: string | null): string | null {
    // 1. Try specific LinkedIn Company Card selectors
    const cardSelectors = [
      'a.jobs-company-card__web-url',
      '.jobs-company-card a[href*="linkedin.com/checkpoint/lg/external-site"]',
      '.jobs-company-card a:not([href*="linkedin.com"])',
      'a[href*="linkedin.com/checkpoint/lg/external-site"]',
      'a.app-aware-link[href*="checkpoint/lg/external-site"]',
    ];

    for (const sel of cardSelectors) {
      const els = document.querySelectorAll(sel);
      for (const el of Array.from(els) as HTMLAnchorElement[]) {
        if (el && el.href) {
          let url = el.href;
          if (url.includes('linkedin.com/checkpoint/lg/external-site')) {
            try {
              const urlParams = new URLSearchParams(new URL(url).search);
              const cleanUrl = urlParams.get('url');
              if (cleanUrl) return cleanUrl;
            } catch (e) {}
          }
          if (!url.includes('linkedin.com')) return url;
        }
      }
    }

    // 2. Scan description text for explicit "Website: http..." labels
    if (description) {
      const websitePattern =
        /(?:website|sito web|sitio web|site web|url)[:\s]+(https?:\/\/[^\s]+)/i;
      const match = description.match(websitePattern);
      if (match) return match[1].trim();
    }

    // 3. Scan links specifically in the job description or company card
    const container = document.querySelector(
      '.jobs-description, .jobs-company-card, [class*="job-details"]'
    );
    if (container) {
      const externalLinks = Array.from(container.querySelectorAll('a'))
        .map((a) => a.href)
        .filter((href) => {
          if (!href || !href.startsWith('http')) return false;
          try {
            const url = new URL(href);
            const host = url.hostname.toLowerCase();
            const blacklist = constants.corporateBlacklist;
            return !blacklist.some((b) => host.includes(b));
          } catch (e) {
            return false;
          }
        });

      const socialDomains = constants.socialDomains;
      const corporateLink = externalLinks.find(
        (link) => !socialDomains.some((d) => link.includes(d))
      );
      if (corporateLink) return corporateLink;
    }

    return null;
  }

  /**
   * Extract English location data from the page's hidden <code> blocks.
   * LinkedIn stores internal JSON data (from the Voyager API) inside hidden <code> elements.
   * This data often contains English city/country names regardless of the user's UI language.
   */
  function extractLocationFromJSON(): { city?: string; countryCode?: string } {
    const result: { city?: string; countryCode?: string } = {};
    try {
      const codeBlocks = document.querySelectorAll('code');
      for (const block of codeBlocks) {
        const text = block.textContent;
        if (!text || text.length < 50) continue;
        try {
          const json = JSON.parse(text);
          findLocationInObject(json, result, 0);
          if (result.city && result.countryCode) break;
        } catch (e) {
          // Not valid JSON — skip
        }
      }
    } catch (e) {
      console.error('[Siftly Scraper] Failed to extract location from JSON', e);
    }
    return result;
  }

  /**
   * Recursively search for location fields in LinkedIn's JSON data.
   * Looks for patterns like { "city": "Paris", "country": "FR" } or
   * { "formattedLocation": "Paris, Île-de-France, France" }
   */
  function findLocationInObject(
    obj: any,
    result: { city?: string; countryCode?: string },
    depth: number
  ): void {
    if (depth > 10 || !obj || typeof obj !== 'object') return;
    if (result.city && result.countryCode) return;

    if (Array.isArray(obj)) {
      for (const item of obj) findLocationInObject(item, result, depth + 1);
      return;
    }

    // Look for a structured location object with "city" and "country" fields
    // These are common in LinkedIn's Voyager API responses
    if (typeof obj.city === 'string' && typeof obj.country === 'string' && obj.city.length > 0) {
      // Only use this if it looks like job-specific location data
      // (avoid picking up random addresses like company HQ from unrelated data)
      if (obj.country.length === 2) {
        // ISO country code — this is structured data
        if (!result.city) result.city = obj.city;
        if (!result.countryCode) result.countryCode = obj.country;
      }
    }

    // Also check for jobLocation-style keys
    if (
      !result.city &&
      (obj.locationName || obj.formattedLocation) &&
      typeof (obj.locationName || obj.formattedLocation) === 'string'
    ) {
      const loc = (obj.locationName || obj.formattedLocation) as string;
      // If this looks like "City, Region, Country" split it
      const parts = loc.split(',').map((p: string) => p.trim());
      if (parts.length >= 1 && !result.city) {
        result.city = parts[0];
      }
    }

    for (const value of Object.values(obj)) {
      if (typeof value === 'object' && value !== null) {
        findLocationInObject(value, result, depth + 1);
      }
    }
  }

  /**
   * Extract all job data from the current LinkedIn page DOM.
   */
  function extractJobData(): RawLinkedInJob {
    const locationRawVal = extractText(SELECTORS.location.primary, SELECTORS.location.fallback);
    const data: RawLinkedInJob = {
      company: extractText(SELECTORS.company.primary, SELECTORS.company.fallback),
      companyLogo: extractAttr(
        SELECTORS.companyLogo.primary,
        SELECTORS.companyLogo.fallback,
        'src'
      ),
      position: extractText(SELECTORS.position.primary, SELECTORS.position.fallback),
      locationRaw: locationRawVal,
      description: extractDescription(),
      workTypeHint: extractWorkType(null, locationRawVal),
      employmentTypeHint: extractEmploymentType(),
      postedDateRaw: extractText(SELECTORS.postedDate.primary, SELECTORS.postedDate.fallback),
      jobUrl: window.location.href,
      companyUrl: extractAttr(SELECTORS.companyUrl.primary, SELECTORS.companyUrl.fallback, 'href'),
      websiteUrl: null,
      industry: null,
      locationCity: null,
      locationCountryCode: null,
      locationCandidates: null,
    };

    // Extract English location from page's hidden JSON data
    const jsonLocation = extractLocationFromJSON();
    if (jsonLocation.city) data.locationCity = jsonLocation.city;
    if (jsonLocation.countryCode) data.locationCountryCode = jsonLocation.countryCode;

    // Heuristic for company website
    data.websiteUrl = extractCompanyWebsite(data.description);

    // Re-run work/employment type with description and position context
    if (data.description || data.position) {
      const locationString = [data.locationRaw, ...(data.locationCandidates || [])]
        .filter(Boolean)
        .join(' ');
      const combined = [data.position, data.description, locationString]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!data.workTypeHint) data.workTypeHint = extractWorkType(combined, locationString);
      if (!data.employmentTypeHint) data.employmentTypeHint = extractEmploymentType(combined);
    }

    // --- HEURISTIC FALLBACKS FOR OBFUSCATED LAYOUTS ---
    const docTitle = document.title || '';

    // Fallback for Position from document.title
    if (!data.position && docTitle.includes(' | LinkedIn')) {
      const cleanTitle = docTitle.replace(' | LinkedIn', '').trim();
      // Format: "Company is hiring Title in Location" or "Company sta assumendo Title in Location"
      const hiringMatch = cleanTitle.match(
        /.* (is hiring|sta assumendo|recrute|einstellen|está contratando) (.*?) in /i
      );
      if (hiringMatch && hiringMatch[2]) {
        data.position = hiringMatch[2].trim();
      } else if (cleanTitle.includes(' | ')) {
        // Format: "Title | Company"
        const parts = cleanTitle.split(' | ');
        data.position = parts[0].trim();
      } else {
        // Fallback: just use the whole title minus the company name if we have it
        data.position = cleanTitle;
      }
    }

    // Fallback for Location from document.title
    if (!data.locationRaw && docTitle.includes(' | LinkedIn')) {
      const cleanTitle = docTitle.replace(' | LinkedIn', '').trim();
      const hiringMatch = cleanTitle.match(
        /.* (is hiring|sta assumendo|recrute|einstellen|está contratando) .*? in (.*)/i
      );
      if (hiringMatch && hiringMatch[2]) {
        data.locationRaw = hiringMatch[2].trim();
      }
    }

    // Fallback using innerText (bypasses all DOM obfuscation!)
    const mainText = (document.querySelector('main') || document.body).innerText;
    const lines = mainText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    // Fallback for Location via innerText lines: Collect next 3 lines after company name as candidates
    if (!data.locationRaw && data.company) {
      const cName = data.company.toLowerCase();
      const companyLineIndex = lines.findIndex((l) => l.toLowerCase().includes(cName));

      if (companyLineIndex !== -1) {
        const fallbackCandidates = [];
        for (let i = 1; i <= 3; i++) {
          const candidate = lines[companyLineIndex + i];
          if (candidate && candidate.trim()) {
            fallbackCandidates.push(candidate.trim());
          }
        }
        if (fallbackCandidates.length > 0) {
          data.locationCandidates = [...(data.locationCandidates || []), ...fallbackCandidates];
        }
      }
    }

    // Global fallback for Location: scan all lines for a "City, Country" pattern
    if (!data.locationRaw) {
      const candidates: string[] = [];
      for (const line of lines) {
        if (line.includes(',') && line.length < 150) {
          candidates.push(line);
        }
      }
      if (candidates.length > 0) {
        data.locationCandidates = candidates;
      }
    }

    // Fallback for Description via innerText lines
    if (!data.description) {
      const startIdx = lines.findIndex((l) => {
        const lower = l.toLowerCase();
        return (
          lower.includes('about the job') ||
          lower.includes('informazioni sull') ||
          lower.includes('acerca de') ||
          lower.includes('über den')
        );
      });

      if (startIdx !== -1) {
        const descLines = [];
        for (let i = startIdx + 1; i < lines.length; i++) {
          const lower = lines[i].toLowerCase();
          // Stop if we hit the next major section
          if (
            lower.includes('about the company') ||
            lower.includes("informazioni sull'azienda") ||
            lower.includes('informazioni sull’azienda') ||
            lower === 'show more' ||
            lower === 'mostra altro' ||
            lower.includes('cerca lavoro in modo') ||
            lower === 'show less' ||
            lower === 'meno dettagli'
          ) {
            break;
          }
          descLines.push(lines[i]);
        }
        if (descLines.length > 0) {
          data.description = descLines.join('\n\n');
        }
      }
    }

    return data;
  }

  // ── Message Listener ────────────────────────────────────

  chrome.runtime.onMessage.addListener(
    (
      message: unknown,
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response: ContentScriptScrapeResponse) => void
    ) => {
      if (!message || typeof message !== 'object') return;
      const msg = message as { type?: string };
      if (msg.type !== SIFT_SCRAPE_PAGE) return;

      try {
        const data = extractJobData();
        console.log('[Siftly Scraper] Extracted data:', data);
        const success = !!(data.company || data.position);
        sendResponse({ success, data });
      } catch (err: any) {
        sendResponse({
          success: false,
          data: null,
          error: err?.message || 'Extraction failed',
        });
      }

      return undefined;
    }
  );
})();
