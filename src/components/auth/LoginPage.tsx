/**
 * LoginPage — Deployment-aware authentication screen.
 *
 * • Web (self-hosted): profile creation form (name + optional email).
 * • Extension: OAuth buttons (Google, GitHub, Apple).
 * • Dev: both sections visible for testing.
 */
import React, { useState } from 'react';
import { APP_INFO } from '../../config/app';
import { useAuth } from '../../context/AuthContext';
import { FEATURES } from '../../config/features';
import { DEPLOYMENT_MODE } from '../../config/deploymentMode';
import './LoginPage.css';

const GoogleIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const GitHubIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const AppleIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

const UserIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const LoginPage: React.FC = () => {
  const { signIn, createLocalProfile, login, profiles, isLoading } = useAuth();
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = profileName.trim();
    if (!name) {
      setFormError('Please enter your name.');
      return;
    }
    setFormError('');
    try {
      await createLocalProfile(name, profileEmail || undefined);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create profile.');
    }
  };

  const showOAuth = FEATURES.auth.oauth;
  const showGoogle = FEATURES.auth.oauthProviders.google;
  const showGitHub = FEATURES.auth.oauthProviders.github;
  const showApple = FEATURES.auth.oauthProviders.apple;
  const showLocalProfile = FEATURES.auth.localProfile;
  const showBoth = showOAuth && showLocalProfile;

  // Multi-user state
  const hasProfiles = profiles.length > 0;
  const showAccountPicker = hasProfiles && !isAddingNew;

  return (
    <div className="login-page">
      <div className="login-card">
        <img src={APP_INFO.logo.path} alt={APP_INFO.logo.alt} className="login-logo" />
        <h1 className="login-title">{APP_INFO.name}</h1>
        <p className="login-subtitle">{APP_INFO.tagLine}</p>

        {/* ── Account Picker (Multi-User) ── */}
        {showAccountPicker ? (
          <div className="login-welcome-back">
            <h2 className="login-section-title">Welcome Back</h2>
            <p className="login-section-desc">Select an account to continue</p>

            <div className="login-accounts-list">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  className="login-account-item"
                  onClick={() => login(profile)}
                >
                  <div className="login-user-avatar">
                    {profile.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="login-account-info">
                    <div className="login-user-name">{profile.displayName}</div>
                    {profile.email && <div className="login-user-email">{profile.email}</div>}
                  </div>
                </button>
              ))}
            </div>

            <button className="login-switch-link" onClick={() => setIsAddingNew(true)}>
              + Add another account
            </button>
          </div>
        ) : (
          showLocalProfile && (
            /* ── Local Profile Form (web mode) ── */
            <form className="login-profile-form" onSubmit={handleCreateProfile}>
              <h2 className="login-section-title">
                {isAddingNew ? 'Add New Account' : 'Create Your Profile'}
              </h2>
              <p className="login-section-desc">
                {DEPLOYMENT_MODE === 'web'
                  ? 'All data stays secure on your local server. No cloud required.'
                  : 'Create a local-only profile for testing.'}
              </p>

              <div className="login-field">
                <label htmlFor="profile-name">Display Name</label>
                <input
                  id="profile-name"
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. John Doe"
                  autoFocus
                  autoComplete="name"
                />
              </div>

              <div className="login-field">
                <label htmlFor="profile-email">
                  Email <span className="login-optional">(optional)</span>
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="e.g. john@example.com"
                  autoComplete="email"
                />
              </div>

              {formError && <p className="login-form-error">{formError}</p>}

              <button type="submit" className="login-btn login-btn--profile">
                <UserIcon />
                {isAddingNew ? 'Add Account' : 'Get Started'}
              </button>

              {hasProfiles && (
                <button
                  type="button"
                  className="login-switch-link"
                  onClick={() => setIsAddingNew(false)}
                >
                  ← Back to accounts
                </button>
              )}
            </form>
          )
        )}

        {/* ── Divider ── */}
        {showBoth && <div className="login-divider">or</div>}

        {/* ── OAuth Providers (extension mode) ── */}
        {showOAuth && (
          <div className="login-providers">
            {showBoth && <h2 className="login-section-title">Sign in with a provider</h2>}
            {showGoogle && (
              <button className="login-btn login-btn--google" onClick={() => signIn('google')}>
                <GoogleIcon />
                Continue with Google
              </button>
            )}
            {showGitHub && (
              <button className="login-btn login-btn--github" onClick={() => signIn('github')}>
                <GitHubIcon />
                Continue with GitHub
              </button>
            )}
            {showApple && (
              <button className="login-btn login-btn--apple" onClick={() => signIn('apple')}>
                <AppleIcon />
                Continue with Apple
              </button>
            )}
          </div>
        )}

        {DEPLOYMENT_MODE === 'dev' && (
          <p className="login-dev-hint">
            🛠 Dev mode — both login methods are visible for testing.
          </p>
        )}
      </div>
    </div>
  );
};
