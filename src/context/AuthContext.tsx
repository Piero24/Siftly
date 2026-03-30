/**
 * AuthContext — Deployment-aware authentication manager.
 *
 * Three modes based on deployment target:
 *   • web  → Simple local profile (name only, stored in localStorage)
 *   • extension → Supabase OAuth (Google, GitHub, Apple)
 *   • dev  → Debug bypass (auto-authenticated)
 */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { DEBUG_CONFIG } from '../config/app';
import { DEPLOYMENT_MODE, DEPLOYMENT } from '../config/deploymentMode';
import { getStoredProfile, createProfile, clearProfile, LocalProfile } from '../lib/localAuth';
import { logger } from '../lib/logger';

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
  createLocalProfile: (name: string, email?: string) => void;
  /** Delete the current user's account and all associated data. */
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [localProfile, setLocalProfile] = useState<LocalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

    // Web mode: check for existing local profile
    if (DEPLOYMENT_MODE === 'web') {
      const stored = getStoredProfile();
      if (stored) setLocalProfile(stored);
      setIsLoading(false);
      return;
    }

    // Extension mode: use Supabase OAuth
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (provider: OAuthProvider) => {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) authLogger.error('signIn error:', error);
  };

  const signOut = async () => {
    // Local profile sign-out
    if (localProfile) {
      clearProfile();
      setLocalProfile(null);
      return;
    }
    // OAuth sign-out
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) authLogger.error('signOut error:', error);
    setUser(null);
    setSession(null);
  };

  const handleCreateLocalProfile = (name: string, email?: string) => {
    const profile = createProfile(name, email);
    setLocalProfile(profile);
  };

  const deleteAccount = async () => {
    // Local profile deletion
    if (localProfile) {
      clearProfile();
      setLocalProfile(null);
      return;
    }
    // OAuth account deletion
    if (!supabase || !session) return;
    const { error: dataError } = await supabase.rpc('delete_user_data');
    if (dataError) {
      authLogger.error('Failed to delete user data:', dataError);
      throw new Error('Failed to delete account data. Please try again.');
    }
    await supabase.auth.signOut();
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
