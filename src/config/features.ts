/**
 * features.ts — Centralized feature visibility and behavior flags.
 *
 * Use these flags to enable/disable or show/hide UI components, cards,
 * and authentication methods. This allows for quick emergency shutdowns
 * and environment-specific feature sets.
 *
 * Auth and storage visibility is now driven by the deployment mode
 * (see deploymentMode.ts) rather than static booleans.
 */

import { IS_DEBUG } from './app';
import { DEPLOYMENT } from './deploymentMode';

export const FEATURES = {
  // Authentication Methods — driven by deployment mode
  auth: {
    /** Show OAuth buttons (Google, GitHub, Apple). */
    oauth: DEPLOYMENT.showOAuth,
    /** Per-provider visibility controls for OAuth buttons. */
    oauthProviders: {
      google: true,
      github: true,
      apple: false,
    },
    /** Show local profile creation form. */
    localProfile: DEPLOYMENT.showLocalProfile,
  },

  // Dashboard Sections (Cards)
  dashboard: {
    kpiStrip: true,
    worldMap: true,
    workTypes: true,
    cvProfiles: true,
    employmentTypes: true,
    companyCharts: true,
    timeline: true,
    funnel: true,
    responseRate: true,
    salaryDist: true,
  },

  // Settings Sections (Cards)
  settings: {
    automation: true,
    popupBehavior: true,
    localization: true,
    notifications: true,
    appearance: true,
    tableDisplay: true,
    privacy: false,
    dataStorage: true,
    support: true,
    cvProfiles: true,
  },

  // Debugging & Development
  debug: {
    showToolbar: IS_DEBUG,
    mockMode: IS_DEBUG,
    verboseLogs: IS_DEBUG,
  },
} as const;

/**
 * Helper to check if a feature is enabled.
 * Can be expanded for logic based on user roles or environment.
 */
export const isFeatureEnabled = (path: string): boolean => {
  const keys = path.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = FEATURES;
  for (const key of keys) {
    if (current[key] === undefined) return false;
    current = current[key];
  }
  return !!current;
};
