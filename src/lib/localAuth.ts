/**
 * localAuth.ts — Simple profile-based authentication for self-hosted web mode.
 *
 * No passwords — users simply create a profile with their name.
 * The profile is stored in localStorage and persisted across sessions.
 * Designed for single-user, self-hosted Docker deployments.
 */
import { logger } from './logger';

const authLogger = logger.for('LocalAuth');

const PROFILE_STORAGE_KEY = 'siftly-local-profile';

export interface LocalProfile {
  /** Unique identifier for the profile. */
  id: string;
  /** Display name chosen by the user. */
  displayName: string;
  /** Email (optional, for display only — not validated). */
  email?: string;
  /** Timestamp when the profile was created. */
  createdAt: string;
}

/**
 * Create a new local profile and persist it.
 */
export function createProfile(displayName: string, email?: string): LocalProfile {
  const profile: LocalProfile = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    displayName: displayName.trim(),
    email: email?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    authLogger.info(`Profile created: ${profile.displayName}`);
  } catch (err) {
    authLogger.error('Failed to save profile:', err);
  }

  return profile;
}

/**
 * Retrieve the existing local profile, or null if none exists.
 */
export function getStoredProfile(): LocalProfile | null {
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LocalProfile;
  } catch {
    return null;
  }
}

/**
 * Delete the local profile (sign out).
 */
export function clearProfile(): void {
  try {
    window.localStorage.removeItem(PROFILE_STORAGE_KEY);
    authLogger.info('Profile cleared.');
  } catch {
    // Ignore storage failures.
  }
}

/**
 * Check if a local profile exists.
 */
export function hasProfile(): boolean {
  return getStoredProfile() !== null;
}
