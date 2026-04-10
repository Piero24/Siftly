// @vitest-environment node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import { createServer } from './index.mjs';

const supportsNodeSqlite = (() => {
  const [major, minor] = process.versions.node.split('.').map(Number);
  return major > 22 || (major === 22 && minor >= 5);
})();

const runIfNodeSqlite = supportsNodeSqlite ? describe : describe.skip;

let activeDb = null;
let activeServer = null;
let activeTempDir = null;

async function createTestApi() {
  activeTempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'siftly-api-'));
  const dbPath = path.join(activeTempDir, 'siftly.db');
  const { server, db } = await createServer({ dbPath });

  activeDb = db;
  activeServer = server;

  return request(server);
}

async function closeActiveResources() {
  if (activeServer?.listening) {
    await new Promise((resolve) => {
      activeServer.close(() => resolve());
    });
  }

  if (activeDb) {
    activeDb.close();
  }

  if (activeTempDir) {
    fs.rmSync(activeTempDir, { recursive: true, force: true });
  }

  activeDb = null;
  activeServer = null;
  activeTempDir = null;
}

afterEach(async () => {
  await closeActiveResources();
});

runIfNodeSqlite('local SQLite API', () => {
  it('handles CORS preflight for API routes', async () => {
    const api = await createTestApi();

    const res = await api.options('/api/profiles');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('*');
    expect(res.headers['access-control-allow-methods']).toContain('GET');
    expect(res.headers['access-control-allow-headers']).toContain('X-User-Id');
  });

  it('creates and lists profiles and returns a compatibility profile', async () => {
    const api = await createTestApi();

    const createRes = await api.post('/api/profiles').send({
      id: 'u1',
      displayName: 'Alice',
      email: 'alice@example.com',
      avatarUrl: null,
    });

    expect(createRes.status).toBe(200);

    const listRes = await api.get('/api/profiles');
    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(1);
    expect(listRes.body[0].id).toBe('u1');

    const profileRes = await api.get('/api/profile');
    expect(profileRes.status).toBe(200);
    expect(profileRes.body.id).toBe('u1');
  });

  it('returns conflict when profile displayName or email is already used', async () => {
    const api = await createTestApi();

    await api.post('/api/profiles').send({
      id: 'u1',
      displayName: 'Alice',
      email: 'alice@example.com',
    });

    const duplicateRes = await api.post('/api/profiles').send({
      id: 'u2',
      displayName: 'Alice',
      email: 'alice2@example.com',
    });

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.error).toMatch(/already in use/i);
  });

  it('returns 400 when deleting profile without id', async () => {
    const api = await createTestApi();

    const res = await api.delete('/api/profiles/');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/missing profile id/i);
  });

  it('deletes profile and cascades local apps and settings', async () => {
    const api = await createTestApi();

    await api.post('/api/profiles').send({ id: 'u1', displayName: 'Alice' });

    await api
      .post('/api/applications')
      .set('X-User-Id', 'u1')
      .send({ id: 'a1', company: 'ACME', status: 'applied' });

    await api
      .post('/api/settings')
      .set('X-User-Id', 'u1')
      .send({ language: 'en', currency: 'USD' });

    const deleteRes = await api.delete('/api/profiles/u1');
    expect(deleteRes.status).toBe(200);

    const appsAfter = await api.get('/api/applications').set('X-User-Id', 'u1');
    expect(appsAfter.status).toBe(200);
    expect(appsAfter.body).toEqual([]);

    const settingsAfter = await api.get('/api/settings').set('X-User-Id', 'u1');
    expect(settingsAfter.status).toBe(200);
    expect(settingsAfter.body).toBeNull();
  });

  it('requires X-User-Id for user-scoped routes', async () => {
    const api = await createTestApi();

    const appsRes = await api.get('/api/applications');
    expect(appsRes.status).toBe(401);

    const settingsRes = await api.get('/api/settings');
    expect(settingsRes.status).toBe(401);
  });

  it('stores applications per user and enforces delete scoping', async () => {
    const api = await createTestApi();

    await api
      .post('/api/applications')
      .set('X-User-Id', 'u1')
      .send({ id: 'a1', company: 'One', status: 'applied' });

    await api
      .post('/api/applications')
      .set('X-User-Id', 'u2')
      .send({ id: 'a2', company: 'Two', status: 'pending' });

    const u1Before = await api.get('/api/applications').set('X-User-Id', 'u1');
    expect(u1Before.body).toHaveLength(1);

    await api.delete('/api/applications/a1').set('X-User-Id', 'u2');

    const u1AfterWrongDelete = await api.get('/api/applications').set('X-User-Id', 'u1');
    expect(u1AfterWrongDelete.body).toHaveLength(1);

    await api.delete('/api/applications/a1').set('X-User-Id', 'u1');

    const u1After = await api.get('/api/applications').set('X-User-Id', 'u1');
    const u2After = await api.get('/api/applications').set('X-User-Id', 'u2');

    expect(u1After.body).toEqual([]);
    expect(u2After.body).toHaveLength(1);
    expect(u2After.body[0].id).toBe('a2');
  });

  it('supports batch import and delete all for a user', async () => {
    const api = await createTestApi();

    const batchRes = await api
      .post('/api/applications/batch')
      .set('X-User-Id', 'u1')
      .send([
        { id: 'b1', company: 'Batch 1', status: 'applied' },
        { id: 'b2', company: 'Batch 2', status: 'interviewing' },
      ]);

    expect(batchRes.status).toBe(200);

    const apps = await api.get('/api/applications').set('X-User-Id', 'u1');
    expect(apps.body).toHaveLength(2);

    const deleteAll = await api.delete('/api/applications').set('X-User-Id', 'u1');
    expect(deleteAll.status).toBe(200);

    const after = await api.get('/api/applications').set('X-User-Id', 'u1');
    expect(after.body).toEqual([]);
  });

  it('upserts settings and keeps users isolated', async () => {
    const api = await createTestApi();

    await api
      .post('/api/settings')
      .set('X-User-Id', 'u1')
      .send({ language: 'en', autoCloseEnabled: true });

    await api
      .post('/api/settings')
      .set('X-User-Id', 'u1')
      .send({ language: 'it', autoCloseEnabled: false });

    await api
      .post('/api/settings')
      .set('X-User-Id', 'u2')
      .send({ language: 'es', autoCloseEnabled: true });

    const u1 = await api.get('/api/settings').set('X-User-Id', 'u1');
    const u2 = await api.get('/api/settings').set('X-User-Id', 'u2');

    expect(u1.body.language).toBe('it');
    expect(u2.body.language).toBe('es');
  });

  it('returns 500 on malformed JSON body', async () => {
    const api = await createTestApi();

    const res = await api
      .post('/api/applications')
      .set('X-User-Id', 'u1')
      .set('Content-Type', 'application/json')
      .send('{bad json');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeTruthy();
  });

  it('returns 404 for unknown API route', async () => {
    const api = await createTestApi();

    const res = await api.get('/api/unknown').set('X-User-Id', 'u1');

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('persists data across server restarts on the same DB path', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'siftly-api-persist-'));
    const dbPath = path.join(tempDir, 'persist.db');

    const first = await createServer({ dbPath });
    await request(first.server)
      .post('/api/applications')
      .set('X-User-Id', 'u1')
      .send({ id: 'persist-1', company: 'PersistCo', status: 'applied', rounds: [{ stage: 'HR' }] });

    first.db.close();

    const second = await createServer({ dbPath });
    const res = await request(second.server).get('/api/applications').set('X-User-Id', 'u1');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].rounds).toEqual([{ stage: 'HR' }]);

    second.db.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});

if (!supportsNodeSqlite) {
  describe('local SQLite API', () => {
    it('is skipped on Node versions below 22.5', () => {
      expect(true).toBe(true);
    });
  });
}
