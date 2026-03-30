# LinkedIn Scraper Architecture

This document outlines the technical strategy for implementing a one-click "Sift" feature to import job applications directly from LinkedIn into Siftly.

## 1. Overview

The scraper is designed as a browser extension component that operates in two stages:

1.  **Extraction**: A content script runs on `linkedin.com/jobs/view/*` to extract the DOM structure.
2.  **Normalization**: A background script (or local LLM bridge) cleans the raw data into a Siftly-compatible `JobApplication` object.

## 2. Technical Stack

- **Content Script**: Standard Web APIs (MutationObserver, querySelector).
- **Message Passing**: `chrome.runtime.sendMessage` for background communication.
- **Data Storage**: Unified `StorageAdapter` (the bridge to Siftly).

## 3. Data Extraction Strategy

Currently, LinkedIn job pages are highly dynamic. We will target the following selectors (subject to maintenance):

| Field           | LinkedIn Selector (Approx)                         | Fallback Logic                       |
| :-------------- | :------------------------------------------------- | :----------------------------------- |
| **Company**     | `.job-details-jobs-unified-top-card__company-name` | URL parsing or Meta tags             |
| **Position**    | `.job-details-jobs-unified-top-card__job-title`    | Page Title                           |
| **Location**    | `.job-details-jobs-unified-top-card__bullet`       | Heuristic search for City/Country    |
| **Description** | `#job-details`                                     | InnerText cleanup                    |
| **Salary**      | `.job-details-jobs-unified-top-card__job-insight`  | Regex search (e.g., `/\$\d{2,3}k/g`) |

## 4. Normalization Logic (The AI Bridge)

Since DOM selectors break frequently, the recommended approach is:

1.  Grab the entire `#job-details` text.
2.  Send the text + metadata to a **Normalization Function**.
3.  Use a small, local-friendly NLP model or OpenAI-compatible endpoint to structured it.

## 5. Security & Rate Limiting

> [!WARNING]
> To avoid account flagging:
>
> - Do **not** automate page navigation.
> - Only trigger extraction on **user action** (explicit "Sift" button click).
> - Use the existing session (no separate login needed).

## 6. UI Integration

- **Floating Action Button**: A subtle Siftly icon on the job detail pane.
- **Success Feedback**: A toast notification within the Siftly dashboard when a duplicate is found or a new app is added.

## 7. Implementation Roadmap

1.  **Phase A**: Create a basic content script that logs the company name to console.
2.  **Phase B**: Implement the message bridge to the `SelectionProvider`.
3.  **Phase C**: Add "Review Import" modal in the Siftly dashboard to double-check AI-extracted fields.
