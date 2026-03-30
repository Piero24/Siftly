/**
 * messageHandler.ts — Chrome runtime message bridge.
 *
 * Handles messages from the content script and routes
 * extracted job data to the StorageAdapter for persistence.
 *
 * Message types:
 * - SIFT_JOB_EXTRACTED → save to storage, respond with success/error
 * - SIFT_CHECK_DUPLICATE → check if job URL already exists
 *
 * @see PLAN.md §2 for architecture diagram.
 */

// TODO: Phase A — Implement message handler
//
// interface SiftMessage {
//   type: 'SIFT_JOB_EXTRACTED' | 'SIFT_CHECK_DUPLICATE';
//   payload: unknown;
// }
//
// export function registerMessageHandler(): void { ... }

// Placeholder export.
export const MESSAGE_HANDLER_VERSION = '0.0.0';
