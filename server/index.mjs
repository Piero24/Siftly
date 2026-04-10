import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  try {
    // Check Node Version Requirement for node:sqlite (22.5.0+)
    const [major, minor] = process.versions.node.split('.').map(Number);
    if (major < 22 || (major === 22 && minor < 5)) {
      console.error('❌ ERROR: Siftly requires Node.js version 22.5.0 or higher.');
      console.error(`   Your current version is ${process.versions.node}.`);
      process.exit(1);
    }

    const { DatabaseSync } = await import('node:sqlite');

    // Read centralized metadata
    const metadata = JSON.parse(fs.readFileSync(path.join(__dirname, '../metadata.json'), 'utf8'));
    const { port: SERVER_PORT, apiBase: API_BASE, host: SERVER_HOST, protocol: SERVER_PROTOCOL } = metadata.server;

    // Robust Database Path (always in project root/data)
    const ROOT_DIR = path.resolve(__dirname, '..');
    const DATA_DIR = path.join(ROOT_DIR, 'data');
    const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'siftly.db');

    // Ensure data directory exists and is writable
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Try to fix permissions if they are restricted
    try {
      fs.chmodSync(DATA_DIR, 0o755);
      if (fs.existsSync(DB_PATH)) {
        fs.chmodSync(DB_PATH, 0o644);
      }
    } catch (e) {
      console.warn('⚠️ Warning: Could not explicitly set file permissions:', e.message);
    }

    const db = new DatabaseSync(DB_PATH);

    // Schema Initialization
    db.exec(`
      -- Profiles table (Multi-User support)
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        displayName TEXT NOT NULL UNIQUE,
        email TEXT UNIQUE,
        avatarUrl TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Applications table
      CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_apps_user ON applications(user_id);
      
      -- Generic settings table
      CREATE TABLE IF NOT EXISTS settings (
        user_id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Prepared Statements
    const stmtGetAllProfiles = db.prepare('SELECT * FROM profiles ORDER BY updated_at DESC');
    const stmtGetProfile = db.prepare('SELECT * FROM profiles WHERE id = ?');
    const stmtInsertProfile = db.prepare('INSERT OR REPLACE INTO profiles (id, displayName, email, avatarUrl) VALUES (?, ?, ?, ?)');
    const stmtDeleteProfile = db.prepare('DELETE FROM profiles WHERE id = ?');
    
    const stmtInsertApp = db.prepare('INSERT OR REPLACE INTO applications (id, user_id, data) VALUES (?, ?, ?)');
    const stmtGetApps = db.prepare('SELECT data FROM applications WHERE user_id = ? ORDER BY updated_at DESC');
    const stmtDeleteApp = db.prepare('DELETE FROM applications WHERE id = ? AND user_id = ?');
    const stmtDeleteAllApps = db.prepare('DELETE FROM applications WHERE user_id = ?');

    const stmtGetSettings = db.prepare('SELECT data FROM settings WHERE user_id = ?');
    const stmtInsertSettings = db.prepare('INSERT OR REPLACE INTO settings (user_id, data) VALUES (?, ?)');
    const stmtDeleteSettings = db.prepare('DELETE FROM settings WHERE user_id = ?');

    // Helpers
    const parseJSON = (req) => new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', () => {
        try { resolve(body ? JSON.parse(body) : {}); } catch (e) { reject(e); }
      });
    });

    const sendJSON = (res, statusCode, data) => {
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };

    const server = http.createServer(async (req, res) => {
      // CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-Id');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
      }

      if (req.url.startsWith(API_BASE)) {
        try {
          // ── Profiles API (Multi-User) ──
          if (req.url === `${API_BASE}/profiles`) {
            if (req.method === 'GET') {
              const rows = stmtGetAllProfiles.all();
              return sendJSON(res, 200, rows);
            }
            if (req.method === 'POST') {
              const profile = await parseJSON(req);
              try {
                stmtInsertProfile.run(profile.id, profile.displayName, profile.email || null, profile.avatarUrl || null);
                return sendJSON(res, 200, { success: true });
              } catch (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                  return sendJSON(res, 409, { error: 'Username or email already in use.' });
                }
                throw err;
              }
            }
          }

          const profilesRoot = `${API_BASE}/profiles`;
          if (req.method === 'DELETE' && req.url.startsWith(profilesRoot)) {
            // Robust ID extraction: handles /api/profiles/ID and /api/profiles/ID/
            const parts = req.url.split('/');
            const id = parts[parts.length - 1] || parts[parts.length - 2];
            
            if (!id || id === 'profiles') {
              return sendJSON(res, 400, { error: 'Missing profile ID' });
            }

            try {
              // Direct execution instead of transaction block for maximum compatibility
              stmtDeleteProfile.run(id);
              stmtDeleteAllApps.run(id);
              stmtDeleteSettings.run(id);
              return sendJSON(res, 200, { success: true });
            } catch (err) {
              console.error(`Failed to delete profile ${id}:`, err);
              return sendJSON(res, 500, { error: err.message });
            }
          }

          // Compatibility: GET /api/profile returns the "last used" or a default
          if (req.url === `${API_BASE}/profile` && req.method === 'GET') {
            const rows = stmtGetAllProfiles.all();
            return sendJSON(res, 200, rows[0] || null);
          }

          const userId = req.headers['x-user-id'];
          if (!userId) {
            return sendJSON(res, 401, { error: 'Missing X-User-Id header' });
          }

          // ── Applications API ──
          if (req.url === `${API_BASE}/applications`) {
            if (req.method === 'GET') {
              const rows = stmtGetApps.all(userId);
              const apps = rows.map(r => JSON.parse(r.data));
              return sendJSON(res, 200, apps);
            }
            if (req.method === 'POST') {
              const body = await parseJSON(req);
              stmtInsertApp.run(body.id, userId, JSON.stringify(body));
              return sendJSON(res, 200, { success: true });
            }
            if (req.method === 'DELETE') {
              stmtDeleteAllApps.run(userId);
              return sendJSON(res, 200, { success: true });
            }
          }

          if (req.method === 'POST' && req.url === `${API_BASE}/applications/batch`) {
            const apps = await parseJSON(req);
            if (Array.isArray(apps)) {
              for (const app of apps) {
                stmtInsertApp.run(app.id, userId, JSON.stringify(app));
              }
            }
            return sendJSON(res, 200, { success: true });
          }

          const appDetailPrefix = `${API_BASE}/applications/`;
          if (req.method === 'DELETE' && req.url.startsWith(appDetailPrefix)) {
            const id = req.url.slice(appDetailPrefix.length);
            stmtDeleteApp.run(id, userId);
            return sendJSON(res, 200, { success: true });
          }

          // ── Settings API ──
          if (req.url === `${API_BASE}/settings`) {
            if (req.method === 'GET') {
              const row = stmtGetSettings.get(userId);
              if (!row) return sendJSON(res, 200, null);
              return sendJSON(res, 200, JSON.parse(row.data));
            }
            if (req.method === 'POST') {
              const body = await parseJSON(req);
              stmtInsertSettings.run(userId, JSON.stringify(body));
              return sendJSON(res, 200, { success: true });
            }
          }

          return sendJSON(res, 404, { error: 'API route not found' });
        } catch (err) {
          console.error('API Error:', err);
          return sendJSON(res, 500, { error: err.message });
        }
      }

      res.writeHead(404);
      res.end('Not found');
    });

    const PORT = process.env.PORT || SERVER_PORT;
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Siftly backend running on ${SERVER_PROTOCOL}://${SERVER_HOST}:${PORT}`);
      console.log(`📂 Database: ${DB_PATH}`);
    });
  } catch (err) {
    console.error('❌ FATAL STARTUP ERROR:', err.message);
    process.exit(1);
  }
}

startServer();
