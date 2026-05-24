/**
 * messageHandler.ts — Chrome runtime message bridge for scraping.
 *
 * Handles messages from the popup and routes extraction requests
 * to the LinkedIn content script, then normalizes the results.
 *
 * Message flow:
 *   Popup  →  SIFT_SCRAPE_PAGE  →  Background  →  Content Script (active tab)
 *   Content Script  →  RawLinkedInJob  →  Background (normalize)  →  Popup (FormState)
 *
 * @see PLAN.md §2 for architecture diagram.
 */

import { SIFT_SCRAPE_PAGE } from '../../lib/scrapeMessages';
import type { ScrapeResponse, ContentScriptScrapeResponse } from '../../lib/scrapeMessages';
import { normalizeToFormState } from './normalizer';
import { logger } from '../../lib/logger';

const scrapeLogger = logger.for('Scraper');

/**
 * Check if a tab URL is a LinkedIn job page.
 */
function isLinkedInJobPage(url?: string): boolean {
  if (typeof url !== 'string') return false;
  const isDirectView = /\/jobs\/view\//i.test(url);
  const isSearchView =
    /\/jobs\/(search|collections|recommended|mymeets)\//i.test(url) &&
    url.includes('currentJobId=');
  return isDirectView || isSearchView;
}

/**
 * Check if a tab URL is at least on linkedin.com.
 */
function isLinkedInPage(url?: string): boolean {
  return typeof url === 'string' && /^https:\/\/(www\.)?linkedin\.com\//i.test(url);
}

/**
 * Send a scrape request to the content script on the given tab.
 */
function sendScrapeToContentScript(tabId: number): Promise<ContentScriptScrapeResponse> {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(
      tabId,
      { type: SIFT_SCRAPE_PAGE },
      (response: ContentScriptScrapeResponse | undefined) => {
        const lastError = chrome.runtime.lastError;
        if (lastError) {
          reject(new Error(lastError.message));
          return;
        }
        if (!response) {
          reject(new Error('No response from content script'));
          return;
        }
        resolve(response);
      }
    );
  });
}

/**
 * Inject the LinkedIn scraper content script into the tab.
 */
async function injectScraper(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['assets/linkedinScraper.js'],
  });
}

/**
 * Fetch additional company details (Sector, Website) from the company profile page.
 *
 * LinkedIn stores company data inside hidden <code> blocks as HTML-entity-encoded JSON.
 * We use DOMParser inside the tab context so the browser decodes entities automatically,
 * then parse the JSON to find "websiteUrl" / "website" fields reliably.
 */
async function fetchCompanyDetails(
  tabId: number,
  companyUrl: string,
  companyName?: string
): Promise<{ industry?: string; website?: string } | null> {
  try {
    // Ensure the URL is absolute and parse it
    let cleanUrl = companyUrl.startsWith('http')
      ? companyUrl
      : `https://www.linkedin.com${companyUrl}`;

    let aboutUrl = cleanUrl;
    let targetUniversalName = '';
    try {
      const urlObj = new URL(cleanUrl);
      urlObj.search = '';
      urlObj.hash = '';

      let pathname = urlObj.pathname;
      const parts = pathname.split('/').filter(Boolean);
      const companyIdx = parts.indexOf('company');
      if (companyIdx !== -1 && parts[companyIdx + 1]) {
        targetUniversalName = parts[companyIdx + 1].toLowerCase();
      }

      if (pathname.endsWith('/')) {
        pathname = pathname.slice(0, -1);
      }
      // Strip typical subpaths
      pathname = pathname.replace(
        /\/(life|jobs|people|posts|videos|newsletters|events|panoramica|overview)$/i,
        ''
      );
      if (!pathname.endsWith('/about')) {
        pathname = `${pathname}/about`;
      }
      urlObj.pathname = pathname + '/';
      aboutUrl = urlObj.toString();
    } catch (e) {
      scrapeLogger.error('Failed to parse clean URL', e);
    }

    scrapeLogger.info('Deep scraping target company:', {
      targetUniversalName,
      companyName,
      aboutUrl,
    });

    // Execute fetch + parse ENTIRELY inside the tab context.
    // DOMParser automatically decodes &quot; → " so we can parse JSON properly.
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: async (url: string, targetUniversalName: string, targetCompanyName?: string) => {
        try {
          let resp = await fetch(url);
          if (!resp.ok && url.endsWith('/about/')) {
            // Try base company URL if /about/ fails
            const baseUrl = url.replace(/\/about\/?$/, '/');
            resp = await fetch(baseUrl);
          }
          if (!resp.ok) return { error: `HTTP ${resp.status}` };
          const html = await resp.text();

          // Use DOMParser to decode HTML entities in <code> blocks
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const codeBlocks = doc.querySelectorAll('code');

          let targetCompanyObj: any = null;
          const industryMap = new Map<string, string>();

          // Parse and search JSON
          function processJson(obj: any): void {
            if (!obj || typeof obj !== 'object') return;
            if (Array.isArray(obj)) {
              for (const item of obj) processJson(item);
              return;
            }

            // Check if this is a Company object matching our target
            if (obj.$type === 'com.linkedin.voyager.dash.organization.Company') {
              const uName =
                typeof obj.universalName === 'string' ? obj.universalName.toLowerCase() : '';
              const name = typeof obj.name === 'string' ? obj.name.toLowerCase() : '';

              const isMatch =
                (targetUniversalName && uName === targetUniversalName) ||
                (targetCompanyName && name === targetCompanyName.toLowerCase());

              if (isMatch) {
                targetCompanyObj = obj;
              }
            }

            // Check if this is an Industry object
            if (
              typeof obj.$type === 'string' &&
              obj.$type.toLowerCase().includes('industry') &&
              typeof obj.entityUrn === 'string' &&
              typeof obj.name === 'string'
            ) {
              industryMap.set(obj.entityUrn, obj.name.trim());
            }

            for (const value of Object.values(obj)) {
              if (typeof value === 'object' && value !== null) {
                processJson(value);
              }
            }
          }

          // Parse each <code> block as JSON and search for our fields
          for (const block of codeBlocks) {
            const text = block.textContent;
            if (!text || text.length < 10) continue;
            try {
              const json = JSON.parse(text);
              processJson(json);
            } catch (e) {
              // Not valid JSON — skip
            }
          }

          let website: string | null = null;
          let industry: string | null = null;

          if (targetCompanyObj) {
            // Extract websiteUrl / website
            const rawWeb = targetCompanyObj.websiteUrl || targetCompanyObj.website;
            if (typeof rawWeb === 'string' && rawWeb.trim()) {
              const w = rawWeb.trim();
              // Auto-prepend protocol if missing (e.g. "www.quik-hire.com" -> "https://www.quik-hire.com")
              if (w.startsWith('http')) {
                website = w;
              } else {
                website = `https://${w}`;
              }
            }

            // Resolve industry URN
            const urns =
              targetCompanyObj['*industryV2Taxonomy'] || targetCompanyObj.industryV2 || [];
            const urnList = Array.isArray(urns) ? urns : [urns];
            for (const urn of urnList) {
              if (typeof urn === 'string' && industryMap.has(urn)) {
                industry = industryMap.get(urn)!;
                break;
              }
            }
          }

          // Fallback: Scan DOM for language-independent corporate website anchors
          if (!website) {
            const anchors = Array.from(doc.querySelectorAll('a')) as HTMLAnchorElement[];
            const externalLinks: string[] = [];

            for (const a of anchors) {
              const href = (a.getAttribute('href') || '').trim();
              if (!href) continue;

              // Check if it is a LinkedIn outbound redirect link
              if (href.includes('checkpoint/lg/external-site')) {
                try {
                  const urlParams = new URLSearchParams(href.split('?')[1] || '');
                  const targetUrl = urlParams.get('url');
                  if (targetUrl && !targetUrl.includes('linkedin.com')) {
                    externalLinks.push(targetUrl.trim());
                  }
                } catch (e) {}
              }

              // Check if it is a direct external URL
              if (href.startsWith('http') && !href.includes('linkedin.com')) {
                externalLinks.push(href);
              }
            }

            const blacklist = [
              'linkedin.com',
              'google.com',
              'doubleclick.net',
              'bing.com',
              'yahoo.com',
              'apple.com',
              'microsoft.com',
              'twitter.com',
              'facebook.com',
              'instagram.com',
              'youtube.com',
              'github.com',
              'medium.com',
              't.me',
              'bit.ly',
              'goo.gl',
            ];

            const corporateLink = externalLinks.find((link) => {
              try {
                const host = new URL(link).hostname.toLowerCase();
                return !blacklist.some((b) => host.includes(b));
              } catch (e) {
                return false;
              }
            });

            if (corporateLink) {
              const cleanLink = corporateLink.trim();
              if (cleanLink.startsWith('http')) {
                website = cleanLink;
              } else {
                website = `https://${cleanLink}`;
              }
            }
          }

          // Fallbacks for compatibility if targetCompanyObj not found or incomplete
          if (!website || !industry) {
            function findFallback(obj: any): void {
              if (!obj || typeof obj !== 'object') return;
              if (website && industry) return;

              if (Array.isArray(obj)) {
                for (const item of obj) findFallback(item);
                return;
              }

              for (const [key, value] of Object.entries(obj)) {
                if (website && industry) return;

                if (
                  !website &&
                  (key === 'websiteUrl' || key === 'website') &&
                  typeof value === 'string'
                ) {
                  const v = value.trim();
                  if (v.startsWith('http') && !v.includes('linkedin.com')) {
                    website = v;
                  }
                }

                if (
                  !industry &&
                  (key === 'industry' || key === 'industryName' || key === 'companyIndustry') &&
                  typeof value === 'string'
                ) {
                  industry = value.trim();
                }

                if (typeof value === 'object' && value !== null) {
                  findFallback(value);
                }
              }
            }

            for (const block of codeBlocks) {
              const text = block.textContent;
              if (!text || text.length < 10) continue;
              try {
                const json = JSON.parse(text);
                findFallback(json);
                if (website && industry) break;
              } catch (e) {}
            }
          }

          return { website, industry, error: null };
        } catch (e: any) {
          return { error: e.message, website: null, industry: null };
        }
      },
      args: [aboutUrl, targetUniversalName, companyName],
    });

    const result = results[0]?.result as
      | { website?: string | null; industry?: string | null; error?: string | null }
      | undefined;
    if (!result || result.error) {
      scrapeLogger.error('Tab deep scrape failed:', result?.error);
      return null;
    }

    if (!result.website && !result.industry) return null;

    return {
      website: result.website || undefined,
      industry: result.industry || undefined,
    };
  } catch (err) {
    scrapeLogger.error('Failed to fetch company details via tab', err);
    return null;
  }
}

/**
 * Register the scrape message handler on the background script.
 * Call this once during background script initialization.
 */
export function registerScrapeHandler(): void {
  chrome.runtime.onMessage.addListener(
    (
      message: unknown,
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response: ScrapeResponse) => void
    ) => {
      if (!message || typeof message !== 'object') return false;
      const msg = message as { type?: string };
      if (msg.type !== SIFT_SCRAPE_PAGE) return false;

      // Handle async work
      handleScrapeRequest()
        .then(sendResponse)
        .catch((err) => {
          scrapeLogger.error('Scrape request failed', err);
          sendResponse({
            success: false,
            error: err?.message || 'Unknown error during scraping',
          });
        });

      // Return true to indicate we will send the response asynchronously
      return true;
    }
  );

  scrapeLogger.info('Scrape message handler registered');
}

/**
 * Handle a scrape request: find the active LinkedIn tab,
 * inject the scraper, extract data, and normalize.
 */
async function handleScrapeRequest(): Promise<ScrapeResponse> {
  // Find the active tab
  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!activeTab?.id) {
    return {
      success: false,
      error: 'No active tab found.',
    };
  }

  if (!isLinkedInPage(activeTab.url)) {
    return {
      success: false,
      error: 'Please navigate to a LinkedIn job page first.',
    };
  }

  if (!isLinkedInJobPage(activeTab.url)) {
    return {
      success: false,
      error: 'Please open a specific job posting on LinkedIn (linkedin.com/jobs/view/...).',
    };
  }

  // Inject the scraper content script
  try {
    await injectScraper(activeTab.id);
  } catch (err: any) {
    scrapeLogger.error('Failed to inject scraper', err);
    return {
      success: false,
      error: 'Failed to inject scraper script. Please reload the page and try again.',
    };
  }

  // Small delay for the script to initialize
  await new Promise((r) => setTimeout(r, 500));

  // Send scrape request to the content script
  let csResponse: ContentScriptScrapeResponse;
  try {
    csResponse = await sendScrapeToContentScript(activeTab.id);
  } catch (err: any) {
    scrapeLogger.error('Content script communication failed', err);
    return {
      success: false,
      error: 'Could not communicate with the page. Please reload and try again.',
    };
  }

  if (!csResponse.success || !csResponse.data) {
    return {
      success: false,
      error: csResponse.error || 'Could not extract job data from this page.',
    };
  }

  // --- DEEP SCRAPE:  // 3. Deep scrape company details if URL is present
  if (csResponse.data.companyUrl) {
    const details = await fetchCompanyDetails(
      activeTab.id!,
      csResponse.data.companyUrl,
      csResponse.data.company || undefined
    );
    if (details) {
      if (details.industry) csResponse.data.industry = details.industry;
      if (details.website) csResponse.data.websiteUrl = details.website;
    }
  }

  // Normalize raw data into FormState
  try {
    const formState = normalizeToFormState(csResponse.data);

    scrapeLogger.info('Scrape result', {
      locationRaw: csResponse.data.locationRaw,
      jsonCity: csResponse.data.locationCity,
      jsonCountry: csResponse.data.locationCountryCode,
      finalCity: formState.city,
      finalCountry: formState.country,
    });

    scrapeLogger.info('Scrape successful', {
      company: formState.company,
      position: formState.position,
    });
    return { success: true, formState };
  } catch (err: any) {
    scrapeLogger.error('Normalization failed', err);
    return {
      success: false,
      error: 'Failed to process extracted data.',
    };
  }
}
