---
sidebar_position: 7
---

# LinkedIn Scraper (Beta)

:::tip
The LinkedIn scraper lets you import job applications directly from LinkedIn with a single click — no manual typing required.
:::

## Overview

When you're browsing a job posting on LinkedIn, Siftly can automatically extract the job details and pre-fill the application form for you. This saves time and reduces data-entry errors.

The scraper runs entirely inside your browser. No data is sent to any external server — everything stays local until you explicitly save the application.

## How to Use

1. **Navigate** to any job posting on [linkedin.com/jobs/view/\*](https://www.linkedin.com/jobs/).
2. **Click** the Siftly extension icon in your Chrome toolbar.
3. **Select** "Scrape Job Portal" (marked with a **BETA** badge).
4. Wait for the extraction spinner to finish (usually under 2 seconds).
5. **Review** the pre-filled form — all extracted fields are editable.
6. **Click Send** to save the application to your dashboard.

:::note
If the extraction fails, make sure you're on a LinkedIn job posting page (the URL should contain `/jobs/view/`). Try refreshing the page and attempting again.
:::

## Extracted Fields

The scraper attempts to extract the following fields from the LinkedIn job page:

| Field                     | Source                           | Notes                                    |
| ------------------------- | -------------------------------- | ---------------------------------------- |
| Company name              | Job card header                  | Primary + fallback selectors             |
| Position / title          | Job card header                  | Falls back to page `<title>` parsing     |
| Location (city + country) | Job card bullet + hidden JSON    | Multi-language country resolution        |
| Work type                 | Workplace type badge             | Remote / Hybrid / On-site                |
| Employment type           | Job insight spans                | Permanent / Intern / Fixed-term          |
| Job description           | Description panel                | HTML stripped, paragraphs preserved      |
| Company LinkedIn URL      | Company name link                | Full LinkedIn company page URL           |
| Company website           | Company card / description links | Filters out social media and ad trackers |

### Multi-Language Support

The scraper works regardless of your LinkedIn UI language. It recognizes employment type and work type keywords in **20+ languages** including English, Italian, German, French, Spanish, Portuguese, Polish, Turkish, Dutch, Swedish, Danish, Chinese, Japanese, and Korean.

## After Extraction

Once extracted, the data appears in the same form used by **Manual Insert**. You can:

- Edit any field before saving
- Change the status (default: "Applied")
- Add notes, salary, CV profile, or interview details
- The form shows a **SCRAPED** badge to indicate the data came from the scraper

If you prefer to enter data manually, use the **Manual Insert** button instead (it shows a **MANUAL** badge).

## Troubleshooting

| Issue                                 | Solution                                                                                           |
| ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| "Could not communicate with the page" | Refresh the LinkedIn page and try again                                                            |
| "Could not extract job data"          | Make sure you're on a `/jobs/view/` page, not a search results list                                |
| Missing fields                        | Some fields may not be available on all job postings — edit them manually                          |
| Wrong country detected                | The scraper uses LinkedIn's internal data when available; you can always correct it in the form    |
| Extension icon not responding         | Right-click the extension icon → "Manage Extension" → ensure it has permissions for `linkedin.com` |
