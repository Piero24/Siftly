/**
 * Navbar — Sticky liquid-glass navigation bar.
 * App logo from APP_INFO config (base-aware public logo); icons from lucide-react.
 *
 * Includes hamburger menu for mobile responsive layout.
 * The Profile button opens a dropdown with user info and sign-out.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LogOutIcon, SettingsIcon, UserIcon } from '../common/Icons';
import { APP_INFO } from '../../config/app';
import { ViewType } from '../../types/ui';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const PRIMARY_VIEWS: Array<{ view: ViewType; label: string }> = [
  { view: 'dashboard', label: 'Dashboard' },
  { view: 'table', label: 'Applications' },
  { view: 'interviewing', label: 'Interviewing' },
];

export const Navbar: React.FC<NavbarProps> = ({ currentView, onViewChange }) => {
  const { user, localProfile, displayName: authDisplayName, isLocalOnly, signOut } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const displayName = authDisplayName || 'Local User';
  const email = localProfile?.email ?? user?.email;
  const avatarUrl = user?.user_metadata?.avatar_url;

  // Close dropdown on outside click
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
      setShowProfile(false);
    }
  }, []);

  useEffect(() => {
    if (showProfile) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfile, handleClickOutside]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        setShowProfile(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  useEffect(() => {
    document.body.classList.toggle('nav-mobile-menu-open', mobileMenuOpen);
    return () => document.body.classList.remove('nav-mobile-menu-open');
  }, [mobileMenuOpen]);

  const handleNavClick = (view: ViewType) => {
    onViewChange(view);
    setShowProfile(false);
    setMobileMenuOpen(false);
  };

  const handleMobileToggle = () => {
    setShowProfile(false);
    setMobileMenuOpen((prev) => !prev);
  };

  const handleSignOut = () => {
    setMobileMenuOpen(false);
    setShowProfile(false);
    signOut();
  };

  return (
    <header className="main-navbar">
      <div className="nav-left">
        <button
          type="button"
          className="nav-brand-btn"
          onClick={() => handleNavClick('dashboard')}
          aria-label="Go to dashboard"
        >
          <img src={APP_INFO.logo.path} alt={APP_INFO.logo.alt} width={32} height={32} />
          <span className="app-name">{APP_INFO.name}</span>
        </button>
      </div>

      {/* Hamburger button — visible on mobile only */}
      <button
        className={`nav-hamburger ${mobileMenuOpen ? 'open' : ''}`}
        onClick={handleMobileToggle}
        aria-label="Toggle navigation menu"
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-nav-drawer"
      >
        <span />
        <span />
        <span />
      </button>

      <nav className="nav-center">
        <div className="nav-menu-pill">
          {PRIMARY_VIEWS.map(({ view, label }) => (
            <button
              key={view}
              className={`nav-link-btn ${currentView === view ? 'active' : ''}`}
              onClick={() => handleNavClick(view)}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      <div className="nav-right">
        <button
          className={`nav-action-btn ${currentView === 'settings' ? 'active' : ''}`}
          onClick={() => handleNavClick('settings')}
          title="Settings"
        >
          <SettingsIcon size={20} />
        </button>

        {/* Profile button with dropdown */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            className={`nav-action-btn ${currentView === 'account' ? 'active' : ''}`}
            title="Profile"
            onClick={() => setShowProfile((prev) => !prev)}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <UserIcon size={20} />
            )}
          </button>

          {showProfile && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-header">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="profile-dropdown-avatar" />
                ) : (
                  <div className="profile-dropdown-avatar profile-dropdown-avatar--placeholder">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="profile-dropdown-name">{displayName}</div>
                  {email ? (
                    <div className="profile-dropdown-email">{email}</div>
                  ) : (
                    isLocalOnly && <div className="profile-dropdown-email">Local mode</div>
                  )}
                </div>
              </div>
              <div className="profile-dropdown-divider" />
              <button
                className="profile-dropdown-item"
                onClick={() => {
                  handleNavClick('account');
                  setShowProfile(false);
                }}
              >
                <UserIcon size={14} style={{ marginRight: 8, opacity: 0.8 }} /> Account Settings
              </button>
              <button
                className="profile-dropdown-item profile-dropdown-item--danger"
                onClick={handleSignOut}
              >
                <LogOutIcon size={14} style={{ marginRight: 8, opacity: 0.8 }} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        className={`nav-mobile-backdrop ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-label="Close navigation menu"
      />

      <aside
        id="mobile-nav-drawer"
        className={`nav-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="nav-mobile-drawer-header">
          <div className="nav-mobile-profile-meta">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="profile-dropdown-avatar" />
            ) : (
              <div className="profile-dropdown-avatar profile-dropdown-avatar--placeholder">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="profile-dropdown-name">{displayName}</div>
              {email ? (
                <div className="profile-dropdown-email">{email}</div>
              ) : (
                isLocalOnly && <div className="profile-dropdown-email">Local mode</div>
              )}
            </div>
          </div>
          <button
            type="button"
            className="nav-mobile-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <div className="nav-mobile-section">
          {PRIMARY_VIEWS.map(({ view, label }) => (
            <button
              key={view}
              type="button"
              className={`nav-mobile-link ${currentView === view ? 'active' : ''}`}
              onClick={() => handleNavClick(view)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="nav-mobile-section">
          <button
            type="button"
            className={`nav-mobile-link ${currentView === 'settings' ? 'active' : ''}`}
            onClick={() => handleNavClick('settings')}
          >
            Settings
          </button>
          <button
            type="button"
            className={`nav-mobile-link ${currentView === 'account' ? 'active' : ''}`}
            onClick={() => handleNavClick('account')}
          >
            Account
          </button>
        </div>

        <button
          type="button"
          className="nav-mobile-link nav-mobile-link--danger"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </aside>
    </header>
  );
};
