const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  createAppStateStore,
  normalizeHistory,
  sanitizeState,
  HISTORY_LIMIT,
  DEFAULT_SETTINGS
} = require('../app-state');

describe('AppStateStore & Persistence', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nuu-state-test-'));
  });

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('creates default state when state file does not exist', () => {
    const defaultPath = path.join(tempDir, 'downloads');
    const store = createAppStateStore({ userDataPath: tempDir, defaultDownloadPath: defaultPath });
    const state = store.get();

    assert.equal(state.version, 2);
    assert.equal(state.migrated, false);
    assert.deepEqual(state.settings, DEFAULT_SETTINGS);
    assert.equal(state.downloadDefaults.savePath, defaultPath);
    assert.equal(state.downloadDefaults.converterSavePath, defaultPath);
    assert.equal(state.downloadDefaults.format, 'mp4');
    assert.equal(state.downloadDefaults.quality, 'best');
    assert.equal(state.downloadDefaults.embedThumbnail, true);
    assert.equal(state.ui.activeTab, 'home');
    assert.equal(state.window.maximized, false);
    assert.deepEqual(state.history, []);
  });

  test('atomic write saves state to file and load() reads back exact state', () => {
    const store1 = createAppStateStore({ userDataPath: tempDir });
    store1.patch({
      settings: { theme: 'dark', language: 'th', autoDeleteDays: 7 },
      downloadDefaults: { format: 'mp3', quality: 'high', savePath: '/custom/path' },
      ui: { activeTab: 'converter' },
      window: { bounds: { x: 100, y: 150, width: 1200, height: 800 }, maximized: true }
    });

    // Check file exists
    assert.equal(fs.existsSync(store1.filePath), true);

    // Create a new store instance pointing to same file and load
    const store2 = createAppStateStore({ userDataPath: tempDir });
    const loaded = store2.load();

    assert.equal(loaded.settings.theme, 'dark');
    assert.equal(loaded.settings.language, 'th');
    assert.equal(loaded.settings.autoDeleteDays, 7);
    assert.equal(loaded.downloadDefaults.format, 'mp3');
    assert.equal(loaded.downloadDefaults.quality, 'high');
    assert.equal(loaded.downloadDefaults.savePath, '/custom/path');
    assert.equal(loaded.ui.activeTab, 'converter');
    assert.deepEqual(loaded.window.bounds, { x: 100, y: 150, width: 1200, height: 800 });
    assert.equal(loaded.window.maximized, true);
  });

  test('migrateFromClient correctly imports localStorage settings and history once', () => {
    const store = createAppStateStore({ userDataPath: tempDir });
    
    // Add an existing server history item
    store.appendHistory({ id: 'srv-1', title: 'Server Item' });

    const clientPayload = {
      settings: { theme: 'dark', language: 'th', proxyEnabled: true, proxyPreset: 'custom', proxyUrl: 'http://127.0.0.1:9090' },
      converterSavePath: '/custom/converter',
      history: [
        { id: 'client-1', title: 'Client Item 1' },
        { id: 'srv-1', title: 'Server Item (Duplicate from client)' }
      ]
    };

    const migrated = store.migrateFromClient(clientPayload);

    assert.equal(migrated.migrated, true);
    assert.equal(migrated.settings.theme, 'dark');
    assert.equal(migrated.settings.language, 'th');
    assert.equal(migrated.settings.proxyEnabled, true);
    assert.equal(migrated.settings.proxyUrl, 'http://127.0.0.1:9090');
    assert.equal(migrated.downloadDefaults.converterSavePath, '/custom/converter');
    
    // History should contain both items without duplicate srv-1
    assert.equal(migrated.history.length, 2);
    const ids = migrated.history.map(h => h.id);
    assert.ok(ids.includes('srv-1'));
    assert.ok(ids.includes('client-1'));

    // Second call should be ignored
    const secondCall = store.migrateFromClient({
      settings: { theme: 'light' },
      history: [{ id: 'client-2', title: 'Client Item 2' }]
    });
    assert.equal(secondCall.settings.theme, 'dark');
    assert.equal(secondCall.history.length, 2);
  });

  test('history operations: append, remove, and clear', () => {
    const store = createAppStateStore({ userDataPath: tempDir });
    
    store.appendHistory({ id: 'dl-1', title: 'Download 1', status: 'done' });
    store.appendHistory({ id: 'dl-2', title: 'Download 2', status: 'done' });
    assert.equal(store.get().history.length, 2);

    store.removeHistory('dl-1');
    assert.equal(store.get().history.length, 1);
    assert.equal(store.get().history[0].id, 'dl-2');

    store.clearHistory();
    assert.equal(store.get().history.length, 0);
  });

  test('enforces HISTORY_LIMIT of 200 items', () => {
    const store = createAppStateStore({ userDataPath: tempDir });
    
    for (let i = 1; i <= 250; i++) {
      store.appendHistory({ id: `dl-${i}`, title: `Download ${i}` });
    }

    const state = store.get();
    assert.equal(state.history.length, HISTORY_LIMIT);
    assert.equal(state.history.length, 200);
    // Most recent items should be at the front
    assert.equal(state.history[0].id, 'dl-250');
  });

  test('autoDeleteDays retention purges expired records', () => {
    const store = createAppStateStore({ userDataPath: tempDir });
    const now = Date.now();
    const oneDayMs = 86400000;

    const freshItem = { id: 'fresh', title: 'Fresh Item', savedAt: new Date(now).toISOString() };
    const oldItem = { id: 'old', title: 'Old Item', savedAt: new Date(now - 5 * oneDayMs).toISOString() };

    store.appendHistory(freshItem);
    store.appendHistory(oldItem);
    assert.equal(store.get().history.length, 2);

    // Apply 3 days autoDelete
    store.patch({ settings: { autoDeleteDays: 3 } });
    const updated = store.get();

    assert.equal(updated.history.length, 1);
    assert.equal(updated.history[0].id, 'fresh');
  });
});
