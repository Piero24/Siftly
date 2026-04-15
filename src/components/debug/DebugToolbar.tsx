import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { IS_DEBUG, MOCK_MODE_KEY, DEBUG_CONFIG } from '../../config/app';
import { DEPLOYMENT_MODE } from '../../config/deploymentMode';
import { StorageMode } from '../../lib/storage';
import '../../styles/debug.css';

/**
 * DebugToolbar — Siftly Developer Utility
 *
 * Only renders when IS_DEBUG is true. Provides shortcuts to
 * inspect app state, switch storage modes (3-way toggle),
 * and simulate various deployment scenarios.
 */
export const DebugToolbar: React.FC = () => {
  const { storageMode, setStorageMode } = useSettings();
  const { user, isLocalOnly, displayName } = useAuth();

  if (!IS_DEBUG) return null;

  const handleClearCache = () => {
    if (window.confirm('Clear all local settings and app cache?')) {
      window.localStorage.clear();
      window.location.reload();
    }
  };

  const toggleMockMode = () => {
    const next = !DEBUG_CONFIG.useMockData;
    localStorage.setItem(MOCK_MODE_KEY, String(next));
    window.location.reload();
  };

  const storageModes: StorageMode[] = ['local', 'remote', 'both'];

  return (
    <div className="debug-toolbar">
      <div className="debug-badge">Debug</div>

      <div className="debug-info">
        <span>
          Deploy: <b>{DEPLOYMENT_MODE}</b>
        </span>
        <span>
          Target: <b>{import.meta.env.VITE_BUILD_TARGET}</b>
        </span>
        <span>
          Storage: <b>{storageMode}</b>
        </span>
        <span>
          Auth: <b>{isLocalOnly ? `Local (${displayName})` : user?.email || 'Guest'}</b>
        </span>
      </div>

      <div className="debug-actions">
        {/* 3-way storage toggle */}
        <div className="debug-storage-toggle">
          {storageModes.map((mode) => (
            <button
              key={mode}
              className={`debug-btn debug-btn-sm ${storageMode === mode ? 'debug-btn-active' : ''}`}
              onClick={() => setStorageMode(mode)}
            >
              {mode === 'local' ? '💾 Local' : mode === 'remote' ? '☁️ Remote' : '🔄 Both'}
            </button>
          ))}
        </div>

        <button
          className={`debug-btn ${DEBUG_CONFIG.useMockData ? 'debug-btn-active' : ''}`}
          style={DEBUG_CONFIG.useMockData ? { background: '#32d74b', color: '#1c1c1e' } : {}}
          onClick={toggleMockMode}
        >
          Mock: {DEBUG_CONFIG.useMockData ? 'ON' : 'OFF'}
        </button>
        <button className="debug-btn debug-btn-danger" onClick={handleClearCache}>
          Hard Reset
        </button>
      </div>
    </div>
  );
};
