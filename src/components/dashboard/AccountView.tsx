/**
 * AccountView — User profile and danger-zone (delete account).
 */
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SettingsCard } from '../common/SettingsCard';
import { UserIcon, TrashIcon, MailIcon, AlertIcon, XCircleIcon } from '../common/Icons';

export const AccountView: React.FC = () => {
  const { user, localProfile, displayName: authDisplayName, isLocalOnly, signOut, deleteAccount } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const displayName = authDisplayName || 'Local User';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const email = localProfile?.email ?? user?.email;
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, padding: '4px 0' }}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                style={{
                  width: 64, height: 64, borderRadius: '50%',
                  border: '2.5px solid var(--glass-border)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
            ) : (
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--apple-blue), #5e5ce6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 24, fontWeight: 700,
                boxShadow: '0 4px 14px rgba(0, 122, 255, 0.3)',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div style={{
                fontSize: 20, fontWeight: 700, color: 'var(--text-primary)',
                letterSpacing: '-0.3px', marginBottom: 2
              }}>
                {displayName}
              </div>
              {email && (
                <div style={{
                  fontSize: 14, color: 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', gap: 6, opacity: 0.9
                }}>
                  <MailIcon size={14} style={{ opacity: 0.7 }} />{email}
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

          <div className="setting-item" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 12 }}>
            <label>Account Status</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: (user?.user_metadata?.is_active ?? true) ? 'var(--color-accepted)' : 'var(--color-warning)'
              }} />
              <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
                {(user?.user_metadata?.is_active ?? true) ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <button className="btn-apple btn-outline" onClick={signOut}>
              Sign Out
            </button>
          </div>
        </SettingsCard>

        {/* Danger Zone */}
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
              <div className="auth-confirm-label">
                <AlertIcon size={14} /> Attention
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Deleting your profile will purge all the data for this user. To confirm, please type <strong>DELETE</strong> below:
              </p>
              <input
                className="auth-confirm-input"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="Type DELETE here..."
                autoFocus
              />
              {deleteError && (
                <div style={{ color: '#ff453a', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <XCircleIcon size={14} /> {deleteError}
                </div>
              )}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  className="btn-apple btn-confirm-cancel"
                  style={{
                    flex: 1,
                    height: 42,
                    borderRadius: 12,
                    fontSize: 14,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                >
                  Cancel
                </button>
                <button
                  className="btn-apple btn-confirm-delete"
                  style={{
                    flex: 1,
                    height: 42,
                    borderRadius: 12,
                    fontSize: 14,
                    opacity: deleteInput === 'DELETE' ? 1 : 0.45,
                    pointerEvents: deleteInput === 'DELETE' ? 'auto' : 'none',
                    background: deleteInput === 'DELETE'
                      ? undefined
                      : 'var(--surface-muted)',
                    boxShadow: deleteInput === 'DELETE'
                      ? undefined
                      : 'none',
                    color: deleteInput === 'DELETE' ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  disabled={deleteInput !== 'DELETE' || isDeleting}
                  onClick={handleDeleteAccount}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          )}
        </SettingsCard>
      </div>
    </div>
  );
};
