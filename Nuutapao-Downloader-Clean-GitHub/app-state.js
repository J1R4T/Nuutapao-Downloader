const fs = require('fs');
const path = require('path');
const os = require('os');

const HISTORY_LIMIT = 200;

const DEFAULT_SETTINGS = {
  theme: 'light',
  language: 'en',
  alwaysOnTop: false,
  autoDeleteDays: 0,
  cookieSource: 'none',
  cookieBrowser: 'chrome',
  cookieFile: '',
  dnsEnabled: true,
  dnsProvider: 'cloudflare',
  customDnsUrl: '',
  proxyEnabled: false,
  proxyPreset: 'warp',
  proxyUrl: '',
  zoomLevel: 1
};

function createDefaultState(defaultDownloadPath) {
  return {
    version: 2,
    migrated: false,
    settings: { ...DEFAULT_SETTINGS },
    downloadDefaults: {
      savePath: defaultDownloadPath,
      converterSavePath: defaultDownloadPath,
      format: 'mp4',
      quality: 'best',
      embedThumbnail: true
    },
    ui: { activeTab: 'home' },
    window: { bounds: null, maximized: false },
    history: [],
    engine: { lastChecked: null }
  };
}

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function normalizeHistory(history, autoDeleteDays = 0) {
  const cutoff = autoDeleteDays > 0 ? Date.now() - autoDeleteDays * 86400000 : 0;
  const seen = new Set();
  return (Array.isArray(history) ? history : [])
    .filter(item => isPlainObject(item) && item.id && !seen.has(item.id) && seen.add(item.id))
    .filter(item => !cutoff || new Date(item.savedAt || item.finishedAt || item.startedAt || 0).getTime() > cutoff)
    .sort((a, b) => new Date(b.savedAt || b.finishedAt || b.startedAt || 0) - new Date(a.savedAt || a.finishedAt || a.startedAt || 0))
    .slice(0, HISTORY_LIMIT);
}

function sanitizeState(candidate, defaultDownloadPath) {
  const defaults = createDefaultState(defaultDownloadPath);
  const value = isPlainObject(candidate) ? candidate : {};
  const settings = { ...defaults.settings, ...(isPlainObject(value.settings) ? value.settings : {}) };
  const downloadDefaults = { ...defaults.downloadDefaults, ...(isPlainObject(value.downloadDefaults) ? value.downloadDefaults : {}) };
  const ui = { ...defaults.ui, ...(isPlainObject(value.ui) ? value.ui : {}) };
  const window = { ...defaults.window, ...(isPlainObject(value.window) ? value.window : {}) };
  const engine = { ...defaults.engine, ...(isPlainObject(value.engine) ? value.engine : {}) };
  return {
    version: 2,
    migrated: !!value.migrated,
    settings,
    downloadDefaults,
    ui,
    window,
    history: normalizeHistory(value.history, Number(settings.autoDeleteDays) || 0),
    engine
  };
}

function createAppStateStore({ userDataPath, defaultDownloadPath } = {}) {
  const basePath = userDataPath || path.join(os.homedir(), '.nuutapao-downloader');
  const fallbackPath = defaultDownloadPath || path.join(os.homedir(), 'Desktop', 'YT Downloads');
  const filePath = path.join(basePath, 'nuutapao-state.json');
  let state = createDefaultState(fallbackPath);

  function load() {
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      state = sanitizeState(JSON.parse(raw), fallbackPath);
    } catch (error) {
      state = createDefaultState(fallbackPath);
    }
    return get();
  }

  function save() {
    fs.mkdirSync(basePath, { recursive: true });
    const tempPath = `${filePath}.${process.pid}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(state, null, 2), 'utf8');
    fs.renameSync(tempPath, filePath);
  }

  function get() {
    return JSON.parse(JSON.stringify(state));
  }

  function replace(nextState) {
    state = sanitizeState(nextState, fallbackPath);
    save();
    return get();
  }

  function patch(partial) {
    const next = {
      ...state,
      ...(isPlainObject(partial) ? partial : {}),
      settings: { ...state.settings, ...(isPlainObject(partial?.settings) ? partial.settings : {}) },
      downloadDefaults: { ...state.downloadDefaults, ...(isPlainObject(partial?.downloadDefaults) ? partial.downloadDefaults : {}) },
      ui: { ...state.ui, ...(isPlainObject(partial?.ui) ? partial.ui : {}) },
      window: { ...state.window, ...(isPlainObject(partial?.window) ? partial.window : {}) },
      engine: { ...state.engine, ...(isPlainObject(partial?.engine) ? partial.engine : {}) }
    };
    return replace(next);
  }

  function appendHistory(item) {
    const existing = state.history.filter(entry => entry.id !== item.id);
    return replace({ ...state, history: [{ ...item, savedAt: item.savedAt || item.finishedAt || new Date().toISOString() }, ...existing] });
  }

  function removeHistory(id) {
    return replace({ ...state, history: state.history.filter(item => item.id !== id) });
  }

  function clearHistory() {
    return replace({ ...state, history: [] });
  }

  /**
   * Migrate settings and history from client-side localStorage payload.
   * This is called once when the frontend detects it still has localStorage data.
   * After migration, `state.migrated` is set to `true` so it never runs again.
   */
  function migrateFromClient(payload) {
    if (state.migrated) return get();

    const clientSettings = isPlainObject(payload.settings) ? payload.settings : {};
    const clientHistory = Array.isArray(payload.history) ? payload.history : [];
    const clientConverterPath = typeof payload.converterSavePath === 'string' ? payload.converterSavePath : '';

    // Merge settings (client wins for values it actually has)
    const mergedSettings = { ...state.settings, ...clientSettings };

    // Merge history — deduplicate by id, client entries supplement server entries
    const serverMap = new Map(state.history.map(h => [h.id, h]));
    clientHistory.forEach(h => {
      if (isPlainObject(h) && h.id && !serverMap.has(h.id)) {
        serverMap.set(h.id, h);
      }
    });
    const mergedHistory = Array.from(serverMap.values());

    const mergedDefaults = { ...state.downloadDefaults };
    if (clientConverterPath) mergedDefaults.converterSavePath = clientConverterPath;

    return replace({
      ...state,
      migrated: true,
      settings: mergedSettings,
      downloadDefaults: mergedDefaults,
      history: mergedHistory
    });
  }

  return { load, save, get, replace, patch, appendHistory, removeHistory, clearHistory, migrateFromClient, filePath };
}

module.exports = { HISTORY_LIMIT, DEFAULT_SETTINGS, createDefaultState, createAppStateStore, normalizeHistory, sanitizeState };
