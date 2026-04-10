import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read centralized metadata
const metadata = JSON.parse(fs.readFileSync(path.join(__dirname, '../metadata.json'), 'utf8'));
const { port: SERVER_PORT, apiBase: API_BASE, host: SERVER_HOST, protocol: SERVER_PROTOCOL } = metadata.server;

const DIST_DIR = path.join(__dirname, '../dist');
const DEFAULT_DB = fs.existsSync('/app') ? '/app/data/siftly.db' : path.join(__dirname, '../data/siftly.db');
const DB_PATH = process.env.DB_PATH || DEFAULT_DB;

// Ensure db directory exists
try {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
} catch (e) {
  console.log('Ensure dir ok:', e.message);
}

const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    data TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_apps_user ON applications(user_id);
  
  CREATE TABLE IF NOT EXISTS settings (
    user_id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const stmtInsertApp = db.prepare('INSERT OR REPLACE INTO applications (id, user_id, data) VALUES (?, ?, ?)');
const stmtGetApps = db.prepare('SELECT data FROM applications WHERE user_id = ? ORDER BY updated_at DESC');
const stmtDeleteApp = db.prepare('DELETE FROM applications WHERE id = ? AND user_id = ?');
const stmtDeleteAllApps = db.prepare('DELETE FROM applications WHERE user_id = ?');

const stmtGetSettings = db.prepare('SELECT data FROM settings WHERE user_id = ?');
const stmtInsertSettings = db.prepare('INSERT OR REPLACE INTO settings (user_id, data) VALUES (?, ?)');

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

const serveStatic = (req, res) => {
  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
  
  // Basic path traversal protection
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA routing
      filePath = path.join(DIST_DIR, 'index.html');
      fs.stat(filePath, (fallbackErr) => {
        if (fallbackErr) {
          res.writeHead(404);
          res.end('Not found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          fs.createReadStream(filePath).pipe(res);
        }
      });
      return;
    }

    const ext = path.extname(filePath);
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2'
    };

    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
};

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-Id');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // Intercept API routes
  if (req.url.startsWith(API_BASE)) {
    try {
      // Single-User Profile API (No X-User-Id required for GET)
      if (req.url === `${API_BASE}/profile`) {
        if (req.method === 'GET') {
          const row = stmtGetSettings.get('GLOBAL_PROFILE');
          if (!row) return sendJSON(res, 200, null);
          return sendJSON(res, 200, JSON.parse(row.data));
        }
        if (req.method === 'POST') {
          const body = await parseJSON(req);
          stmtInsertSettings.run('GLOBAL_PROFILE', JSON.stringify(body));
          return sendJSON(res, 200, { success: true });
        }
      }

      const userId = req.headers['x-user-id'];
      if (!userId) {
        return sendJSON(res, 401, { error: 'Missing X-User-Id header' });
      }

      // Applications API
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

      // Settings API
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

      // Not found
      return sendJSON(res, 404, { error: 'API route not found' });
      
    } catch (err) {
      console.error('API Error:', err);
      return sendJSON(res, 500, { error: err.message });
    }
  }

  // Fallback to static file server
  serveStatic(req, res);
});

const PORT = process.env.PORT || SERVER_PORT;
// Explicitly listen on the host from metadata (often 0.0.0.0 or 127.0.0.1)
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Siftly lightweight backend running on ${SERVER_PROTOCOL}://${SERVER_HOST}:${PORT}`);
});
