const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const appServer = require('../server');

describe('Server API Endpoints & State Management', () => {
  let serverPort;
  let tempDir;

  before(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nuu-api-test-'));
    appServer.configureRuntime({
      isPackaged: false,
      resourcesPath: '',
      userDataPath: tempDir
    });
    serverPort = await appServer.startServer();
  });

  after(async () => {
    await appServer.stopServer();
    if (tempDir && fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
      } catch {}
    }
  });

  test('GET /api/app-state returns initial profile state', async () => {
    const res = await fetch(`http://127.0.0.1:${serverPort}/api/app-state`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.version, 2);
    assert.equal(typeof data.settings, 'object');
    assert.equal(Array.isArray(data.history), true);
  });

  test('PATCH /api/app-state updates settings and persists profile', async () => {
    const patchBody = {
      settings: { theme: 'dark', language: 'th' },
      downloadDefaults: { format: 'wav', quality: 'high' }
    };
    const res = await fetch(`http://127.0.0.1:${serverPort}/api/app-state`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patchBody)
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.settings.theme, 'dark');
    assert.equal(data.settings.language, 'th');
    assert.equal(data.downloadDefaults.format, 'wav');
  });

  test('POST /api/migrate performs one-time migration from client payload', async () => {
    const migratePayload = {
      settings: { alwaysOnTop: true },
      converterSavePath: '/custom/save/path',
      history: [{ id: 'migrated-dl-1', title: 'Migrated Download', status: 'done' }]
    };
    const res = await fetch(`http://127.0.0.1:${serverPort}/api/migrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(migratePayload)
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.migrated, true);
    assert.equal(data.settings.alwaysOnTop, true);
    assert.equal(data.downloadDefaults.converterSavePath, '/custom/save/path');
    assert.equal(data.history.length, 1);
    assert.equal(data.history[0].id, 'migrated-dl-1');
  });

  test('GET /api/history returns history from server profile', async () => {
    const res = await fetch(`http://127.0.0.1:${serverPort}/api/history`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(Array.isArray(data.history), true);
    assert.equal(data.history.length, 1);
  });

  test('DELETE /api/history/:id deletes single history item', async () => {
    const res = await fetch(`http://127.0.0.1:${serverPort}/api/history/migrated-dl-1`, {
      method: 'DELETE'
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.history.length, 0);
  });

  test('DELETE /api/history clears all history', async () => {
    // Add item first via patch
    await fetch(`http://127.0.0.1:${serverPort}/api/app-state`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        history: [{ id: 'temp-1', title: 'Temp' }]
      })
    });

    const clearRes = await fetch(`http://127.0.0.1:${serverPort}/api/history`, {
      method: 'DELETE'
    });
    assert.equal(clearRes.status, 200);
    const clearData = await clearRes.json();
    assert.equal(clearData.history.length, 0);
  });

  test('GET /api/config returns default save paths from state', async () => {
    const res = await fetch(`http://127.0.0.1:${serverPort}/api/config`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.defaultPath);
    assert.ok(data.converterSavePath);
  });
});
