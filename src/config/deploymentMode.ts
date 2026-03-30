/**
 * deploymentMode.ts — Single source of truth for deployment context.
 *
 * Derives the deployment mode from Vite environment variables:
 *   • `web`       — Self-hosted Docker/container build (local DB, profile-based auth)
 *   • `extension` — Chrome extension build (remote Supabase, OAuth auth)
 *   • `dev`       — Debug/development mode (everything switchable)
 *
 * All storage and auth behavior throughout the app should reference
 * DEPLOYMENT instead of checking raw env vars.
 */
import type { StorageMode } from '../lib/storage';

// ── Deployment Mode ──────────────────────────────────────
export type DeploymentMode = 'web' | 'extension' | 'dev';

const buildTarget = import.meta.env.VITE_BUILD_TARGET ?? 'extension';
const isDebug = import.meta.env.VITE_DEBUG_MODE === 'true';

/**
 * Resolved deployment mode.
 * Debug mode overrides everything — even if BUILD_TARGET is set,
 * dev mode enables full flexibility.
 */
export const DEPLOYMENT_MODE: DeploymentMode = isDebug
  ? 'dev'
  : buildTarget === 'web'
    ? 'web'
    : 'extension';

// ── Auth Mode ────────────────────────────────────────────
export type AuthMode = 'local-profile' | 'oauth' | 'all';

// ── Capabilities ─────────────────────────────────────────
export interface DeploymentCapabilities {
  /** Fixed storage backend for this deployment. */
  storageMode: StorageMode;
  /** Whether the user (or dev toolbar) can change the storage mode. */
  storageEditable: boolean;
  /** Which authentication flow to present. */
  authMode: AuthMode;
  /** Show OAuth buttons (Google, GitHub, Apple). */
  showOAuth: boolean;
  /** Show local profile creation form. */
  showLocalProfile: boolean;
}

const CAPABILITIES_MAP: Record<DeploymentMode, DeploymentCapabilities> = {
  web: {
    storageMode: 'local',
    storageEditable: false,
    authMode: 'local-profile',
    showOAuth: false,
    showLocalProfile: true,
  },
  extension: {
    storageMode: 'remote',
    storageEditable: false,
    authMode: 'oauth',
    showOAuth: true,
    showLocalProfile: false,
  },
  dev: {
    storageMode: 'local',         // default in dev; can be changed
    storageEditable: true,
    authMode: 'all',
    showOAuth: true,
    showLocalProfile: true,
  },
};

export const DEPLOYMENT = CAPABILITIES_MAP[DEPLOYMENT_MODE];
