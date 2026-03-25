/**
 * Navbar — Sticky liquid-glass navigation bar.
 * App logo from public/icons/logo.svg; icons from lucide-react.
 */
import React from 'react';
import { SettingsIcon, UserIcon } from '../common/Icons';
import { APP_INFO } from '../../config/app';

type ViewType = 'dashboard' | 'table' | 'interviewing' | 'settings';

interface NavbarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onViewChange }) => (
  <header className="main-navbar">
    <div className="nav-left">
      <img src={APP_INFO.logo.path} alt={APP_INFO.logo.alt} width={32} height={32} />
      <span className="app-name">{APP_INFO.name}</span>
    </div>

    <nav className="nav-center">
      <div className="nav-menu-pill">
        {(['dashboard', 'table', 'interviewing'] as ViewType[]).map((view) => (
          <button
            key={view}
            className={`nav-link-btn ${currentView === view ? 'active' : ''}`}
            onClick={() => onViewChange(view)}
          >
            {view === 'table' ? 'Applications' : view === 'interviewing' ? 'Interviewing' : 'Dashboard'}
          </button>
        ))}
      </div>
    </nav>

    <div className="nav-right">
      <button
        className={`nav-action-btn ${currentView === 'settings' ? 'active' : ''}`}
        onClick={() => onViewChange('settings')}
        title="Settings"
      >
        <SettingsIcon size={20} />
      </button>
      <button className="nav-action-btn" title="Profile">
        <UserIcon size={20} />
      </button>
    </div>
  </header>
);
