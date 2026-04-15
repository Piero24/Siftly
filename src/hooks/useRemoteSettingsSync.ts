/**
 * useRemoteSettingsSync — Manages bidirectional sync between local settings
 * state and the remote backend (Supabase or local API).
 *
 * Encapsulates:
 *  - Auth state change listener to trigger re-hydration
 *  - Initial hydration from the remote snapshot
 *  - Debounced save of changes back to the remote backend
 */
import { useEffect, useRef, useState } from 'react';

import { DEPLOYMENT } from '../config/deploymentMode';
import { logger } from '../lib/logger';
import {
  loadRemoteSettingsSnapshot,
  saveRemoteSettingsSnapshot,
  type SettingsSnapshot,
} from '../lib/settingsStorage';
import { supabase } from '../lib/supabaseClient';

const syncLogger = logger.for('RemoteSettingsSync');

/** Callback to apply a remote snapshot to local state. */
type ApplySnapshot = (snapshot: SettingsSnapshot) => void;

interface UseRemoteSettingsSyncOptions {
  /** The current settings state, assembled into a snapshot. */
  snapshot: SettingsSnapshot;
  /** Function to apply a loaded remote snapshot to local React state setters. */
  applySnapshot: ApplySnapshot;
}

/**
 * Hook that handles bidirectional remote settings synchronization.
 * Call this once inside SettingsProvider.
 */
export function useRemoteSettingsSync({
  snapshot,
  applySnapshot,
}: UseRemoteSettingsSyncOptions): void {
  const remoteSyncEnabled =
    DEPLOYMENT.storageMode === 'local' ||
    (Boolean(supabase) && (DEPLOYMENT.storageMode === 'remote' || DEPLOYMENT.storageEditable));

  const isApplyingRef = useRef(false);
  const hasHydratedRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);
  const [authSyncTick, setAuthSyncTick] = useState(0);

  // ── Auth listener: bump tick on sign-in/out to re-hydrate settings ──
  useEffect(() => {
    if (!remoteSyncEnabled || !supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      setAuthSyncTick((prev) => prev + 1);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [remoteSyncEnabled]);

  // ── Hydrate from remote on mount and on auth changes ──
  useEffect(() => {
    if (!remoteSyncEnabled) {
      hasHydratedRef.current = true;
      return;
    }

    let isCancelled = false;

    const hydrate = async () => {
      try {
        const remoteSnapshot = await loadRemoteSettingsSnapshot();
        if (!remoteSnapshot || isCancelled) return;

        isApplyingRef.current = true;
        applySnapshot(remoteSnapshot);
      } catch (error) {
        syncLogger.debug('Remote settings hydration skipped', error);
      } finally {
        hasHydratedRef.current = true;
        window.setTimeout(() => {
          if (!isCancelled) {
            isApplyingRef.current = false;
          }
        }, 0);
      }
    };

    hydrate();

    return () => {
      isCancelled = true;
    };
  }, [authSyncTick, remoteSyncEnabled, applySnapshot]);

  // ── Debounced save to remote when local state changes ──
  useEffect(() => {
    if (!remoteSyncEnabled) return;
    if (!hasHydratedRef.current) return;
    if (isApplyingRef.current) return;

    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      void saveRemoteSettingsSnapshot(snapshot);
    }, 700);

    return () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [authSyncTick, remoteSyncEnabled, snapshot]);
}
