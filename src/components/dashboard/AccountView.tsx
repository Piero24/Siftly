/**
 * AccountView — User profile and danger-zone (delete account).
 */
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SettingsCard } from '../common/SettingsCard';
import { UserIcon, TrashIcon, MailIcon } from '../common/Icons';

export const AccountView: React.FC = () => {
  const { user, isLocalOnly, signOut, deleteAccount } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const displayName = user?.user_metadata?.full_name ?? user?.email ?? 'Local User';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const email = user?.email;
  const provider = user?.app_metadata?.provider ?? (isLocalOnly ? 'local' : 'unknown');

  const providerLabel: Record<string, string> = {
    google: 'Google',
    github: 'GitHub',
    apple: 'Apple',
    local: 'Local (no account)',
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteAccount();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="settings-container">
      <h2 className="settings-title">Account</h2>

      <div className="settings-grid">
        {/* Profile Section */}
        <SettingsCard icon={<UserIcon size={22} />} title="Profile">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid var(--glass-border)' }}
              />
            ) : (
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'var(--accent)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 22, fontWeight: 700,
              }}>
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>{displayName}</div>
              {email && (
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <MailIcon size={13} />{email}
                </div>
              )}
            </div>
          </div>

          <div className="setting-item">
            <label>Sign-in Provider</label>
            <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
              {providerLabel[provider] ?? provider}
            </span>
          </div>

          <div style={{ marginTop: 16 }}>
            <button className="btn-apple btn-outline" onClick={signOut}>
              Sign Out
            </button>
          </div>
        </SettingsCard>

        {/* Danger Zone */}
        {!isLocalOnly && (
          <SettingsCard icon={<TrashIcon size={22} />} title="Danger Zone">
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 16px' }}>
              Permanently delete your account and all associated data. This action <strong>cannot be undone</strong>.
            </p>

            {!showDeleteConfirm ? (
              <button
                className="btn-apple btn-destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <TrashIcon size={14} /> Delete My Account
              </button>
            ) : (
              <div className="delete-confirm-box">
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 12px' }}>
                  Type <strong>DELETE</strong> to confirm:
                </p>
                <input
                  className="apple-select"
                  style={{ width: '100%', marginBottom: 12 }}
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="Type DELETE"
                  autoFocus
                />
                {deleteError && (
                  <p style={{ color: 'var(--color-rejected)', fontSize: 13, margin: '0 0 8px' }}>{deleteError}</p>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-apple btn-outline" onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}>
                    Cancel
                  </button>
                  <button
                    className="btn-apple btn-destructive"
                    disabled={deleteInput !== 'DELETE' || isDeleting}
                    onClick={handleDeleteAccount}
                  >
                    {isDeleting ? 'Deleting…' : 'Permanently Delete'}
                  </button>
                </div>
              </div>
            )}
          </SettingsCard>
        )}
      </div>
    </div>
  );
};
