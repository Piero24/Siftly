/**
 * Navbar — Sticky liquid-glass navigation bar.
 * App logo from public/icons/logo.svg; icons from lucide-react.
 *
 * Includes hamburger menu for mobile responsive layout.
 * The Profile button opens a dropdown with user info and sign-out.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SettingsIcon, UserIcon } from '../common/Icons';
import { APP_INFO } from '../../config/app';
import { ViewType } from '../../types/ui';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onViewChange }) => {
  const { user, isLocalOnly, signOut } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const displayName = user?.user_metadata?.full_name ?? user?.email ?? 'Local User';
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

  const handleNavClick = (view: ViewType) => {
    onViewChange(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="main-navbar">
      <div className="nav-left">
        <img src={APP_INFO.logo.path} alt={APP_INFO.logo.alt} width={32} height={32} />
        <span className="app-name">{APP_INFO.name}</span>
      </div>

      {/* Hamburger button — visible on mobile only */}
      <button
        className={`nav-hamburger ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen((prev) => !prev)}
        aria-label="Toggle navigation menu"
      >
        <span /><span /><span />
      </button>

      <nav className={`nav-center ${mobileMenuOpen ? 'nav-center--open' : ''}`}>
        <div className="nav-menu-pill">
          {(['dashboard', 'table', 'interviewing'] as ViewType[]).map((view) => (
            <button
              key={view}
              className={`nav-link-btn ${currentView === view ? 'active' : ''}`}
              onClick={() => handleNavClick(view)}
            >
              {view === 'table' ? 'Applications' : view === 'interviewing' ? 'Interviewing' : 'Dashboard'}
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
                  {user?.email && <div className="profile-dropdown-email">{user.email}</div>}
                  {isLocalOnly && <div className="profile-dropdown-email">Local mode</div>}
                </div>
              </div>
              <div className="profile-dropdown-divider" />
              <button
                className="profile-dropdown-item"
                onClick={() => { handleNavClick('account'); setShowProfile(false); }}
              >
                Account Settings
              </button>
              <button
                className="profile-dropdown-item profile-dropdown-item--danger"
                onClick={() => { signOut(); setShowProfile(false); }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
