/**
 * AuthContext — Deployment-aware authentication manager.
 *
 * Three modes based on deployment target:
 *   • web  → Simple local profile (name only, stored in localStorage + synced to backend)
 *   • extension → Supabase OAuth (Google, GitHub, Apple)
 *   • dev  → Debug bypass (auto-authenticated)
 */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { DEBUG_CONFIG } from '../config/app';
import { DEPLOYMENT_MODE } from '../config/deploymentMode';
import { getStoredProfile, createProfile, clearProfile, LocalProfile, persistProfile } from '../lib/localAuth';
import { logger } from '../lib/logger';
import { useToast } from './ToastContext';

const authLogger = logger.for('Auth');

type OAuthProvider = 'google' | 'github' | 'apple';

interface AuthContextValue {
  /** Supabase user object, null if not logged in or in local mode. */
  user: User | null;
  /** Local profile for web (self-hosted) mode, null otherwise. */
  localProfile: LocalProfile | null;
  /** Display name (works for both OAuth and local profile). */
  displayName: string;
  /** True when the user has authenticated (OAuth, local profile, or debug). */
  isAuthenticated: boolean;
  /** True while the initial session check is in progress. */
  isLoading: boolean;
  /** True when operating with a local profile (web mode). */
  isLocalOnly: boolean;
  /** Initiate OAuth sign-in with a provider. */
  signIn: (provider: OAuthProvider) => Promise<void>;
  /** Sign out the current user. */
  signOut: () => Promise<void>;
  /** Create a local profile (web mode). */
  createLocalProfile: (name: string, email?: string) => Promise<void>;
  /** Delete the current user's account and all associated data. */
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [localProfile, setLocalProfile] = useState<LocalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // Restore session on mount
  useEffect(() => {
    // Dev mode: bypass auth entirely
    if (DEBUG_CONFIG.bypassAuth) {
      authLogger.info('Auth bypass active! Authenticating as Debug User.');
      setUser({
        id: 'debug-user-123',
        email: 'debug@siftly.dev',
        role: 'authenticated',
        app_metadata: {},
        user_metadata: { full_name: 'Debug User' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User);
      setIsLoading(false);
      return;
    }

    // Web mode: check for existing local profile OR global profile on backend
    if (DEPLOYMENT_MODE === 'web') {
      const initWebAuth = async () => {
        // 1. Check localStorage first (fastest)
        const stored = getStoredProfile();
        if (stored) {
          setLocalProfile(stored);
          setIsLoading(false);
          return;
        }

        // 2. Check backend for "Single User Mode" (allows other browsers to auto-login)
        try {
          const res = await fetch('/api/profile');
          if (res.ok) {
            const globalProfile = await res.json();
            if (globalProfile && globalProfile.id) {
              authLogger.info('Found global profile on backend. Auto-logging in.');
              persistProfile(globalProfile);
              setLocalProfile(globalProfile);
            }
          }
        } catch (err) {
          authLogger.warn('Backend profile check failed. Connection might be down.');
        } finally {
          setIsLoading(false);
        }
      };
      initWebAuth();
      return;
    }

    // Extension mode: use Supabase OAuth
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const initSession = async () => {
      if (!supabase) return;
      const { data: { session: s } } = await supabase.auth.getSession();
      if (s) {
        const { error } = await supabase.auth.getUser();
        if (error) {
          authLogger.warn('Stale session detected on boot. Wiping local cache.');
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
        } else {
          setSession(s);
          setUser(s.user);
        }
      } else {
        setSession(null);
        setUser(null);
      }
      setIsLoading(false);
    };
    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'SIGNED_OUT') {
        authLogger.info(`Auth event overridden eviction: ${event}`);
        setSession(null);
        setUser(null);
      } else {
        setSession(s);
        setUser(s?.user ?? null);
      }
    });

    // Sub-minute Heartbeat mechanism: actively poll DB to detect remote deletions rapidly
    const heartbeat = setInterval(async () => {
      if (!supabase) return;
      
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) return;
      
      const { error } = await supabase.auth.getUser();
      if (error) {
        const err = error as any;
        if (err.status === 401 || err.status === 403 || err.message.toLowerCase().includes('user not found')) {
          authLogger.warn('Heartbeat detected invalid user session. Evicting immediately.');
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          showToast('Your account is no longer active. You have been signed out.', 'error');
        }
      }
    }, 60000);

    return () => {
      subscription.unsubscribe();
      clearInterval(heartbeat);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (provider: OAuthProvider) => {
    if (!supabase) return;
    
    authLogger.info(`Initiating ${provider} sign-in...`);
    
    // In Extension mode, the redirect URL MUST be the extension's dashboard page.
    const redirectTo = window.location.href.split('?')[0];

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
    if (error) {
      authLogger.error('signIn error:', error);
      showToast(error.message || 'Failed to sign in. Please try again.', 'error');
    }
  };

  const signOut = async () => {
    // Local profile sign-out
    if (localProfile) {
      clearProfile();
      setLocalProfile(null);
      showToast('Signed out from local profile', 'info');
      return;
    }
    // OAuth sign-out
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      authLogger.error('signOut error:', error);
      showToast('Failed to sign out neatly. Session cleared.', 'warning');
    } else {
      showToast('Signed out successfully', 'success');
    }
    setUser(null);
    setSession(null);
  };

  const handleCreateLocalProfile = async (name: string, email?: string) => {
    try {
      const profile = createProfile(name, email);
      
      // Sync to backend for Single User Mode (auto-login on other browsers)
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });

      setLocalProfile(profile);
      showToast(`Welcome, ${name}! Profile created and synced.`, 'success');
    } catch (err) {
      authLogger.error('Failed to create local profile:', err);
      showToast('Failed to create profile. Check backend connection.', 'error');
    }
  };

  const deleteAccount = async () => {
    if (localProfile) {
      try {
        await fetch('/api/applications', {
          method: 'DELETE',
          headers: { 'X-User-Id': localProfile.id }
        });
        // Also clear global profile
        await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(null)
        });
      } catch (err) {
        authLogger.warn('Failed to delete data on backend:', err);
      }
      clearProfile();
      setLocalProfile(null);
      showToast('Local profile and data deleted.', 'info');
      return;
    }
    // OAuth account soft-deletion (starts 90-day retention period)
    if (!supabase || !session) return;
    const { error: dataError } = await supabase.rpc('soft_delete_account');
    if (dataError) {
      authLogger.error('Failed to initiate account deletion:', dataError);
      showToast('Failed to schedule account deletion. Please try again.', 'error');
      throw new Error('Failed to schedule account deletion. Please try again.');
    }
    await supabase.auth.signOut();
    showToast('Account and data deleted successfully.', 'success');
    setUser(null);
    setSession(null);
  };

  const isLocalOnly = !!localProfile;
  const isAuthenticated = isLocalOnly || !!user;
  const displayName = localProfile?.displayName
    ?? user?.user_metadata?.full_name
    ?? user?.email
    ?? '';

  const value = useMemo<AuthContextValue>(() => ({
    user,
    localProfile,
    displayName,
    isAuthenticated,
    isLoading,
    isLocalOnly,
    signIn,
    signOut,
    createLocalProfile: handleCreateLocalProfile,
    deleteAccount,
  }), [user, localProfile, isAuthenticated, isLoading, isLocalOnly, session, displayName]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
