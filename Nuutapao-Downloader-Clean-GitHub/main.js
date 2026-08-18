// Ensure UTF-8 encoding across all subprocesses (yt-dlp, Python, etc.)
process.env.PYTHONIOENCODING = 'utf-8';
process.env.PYTHONUTF8 = '1';
if (!process.env.LANG) process.env.LANG = 'en_US.UTF-8';
if (!process.env.LC_ALL) process.env.LC_ALL = 'en_US.UTF-8';

const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const appServer = require('./server');
const path = require('path');

let mainWindow;
let isMaximizedState = false;
let saveWindowStateTimer = null;

function saveWindowState() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const bounds = mainWindow.getNormalBounds();
  appServer.patchAppState({
    window: {
      bounds: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height },
      maximized: mainWindow.isMaximized()
    }
  });
}

function scheduleWindowStateSave() {
  clearTimeout(saveWindowStateTimer);
  saveWindowStateTimer = setTimeout(saveWindowState, 300);
}

function createWindow(port) {
  const savedWindow = appServer.getAppState().window || {};
  const savedBounds = savedWindow.bounds || {};
  mainWindow = new BrowserWindow({
    width: Math.max(900, Number(savedBounds.width) || 1050),
    height: Math.max(650, Number(savedBounds.height) || 700),
    ...(Number.isFinite(savedBounds.x) && Number.isFinite(savedBounds.y) ? { x: savedBounds.x, y: savedBounds.y } : {}),
    minWidth: 900,
    minHeight: 650,
    show: false,
    backgroundColor: '#00000000',
    frame: false, // Frameless for cute rounded UI
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.once('ready-to-show', () => {
    if (savedWindow.maximized) {
      mainWindow.maximize();
    }
    mainWindow.show();
  });

  isMaximizedState = false;

  mainWindow.on('maximize', () => {
    isMaximizedState = true;
    scheduleWindowStateSave();
    mainWindow.webContents.send('window-maximized-status', true);
  });

  mainWindow.on('unmaximize', () => {
    isMaximizedState = false;
    scheduleWindowStateSave();
    mainWindow.webContents.send('window-maximized-status', false);
  });

  mainWindow.on('resize', scheduleWindowStateSave);
  mainWindow.on('move', scheduleWindowStateSave);
  mainWindow.on('close', saveWindowState);

  mainWindow.loadURL(`http://127.0.0.1:${port}`);
}

app.whenReady().then(async () => {
  appServer.configureRuntime({
    isPackaged: app.isPackaged,
    resourcesPath: process.resourcesPath,
    userDataPath: app.getPath('userData')
  });
  appServer.setDialog(dialog);
  const port = await appServer.startServer();
  createWindow(port);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(appServer.getPort());
    }
  });
}).catch((err) => {
  dialog.showErrorBox('Nuutapao Downloader could not start', err.message);
  app.quit();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  clearTimeout(saveWindowStateTimer);
  saveWindowState();
  appServer.flushState();
});

// IPC for custom window controls
ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-maximize', () => {
  if (isMaximizedState) {
    mainWindow?.unmaximize();
    isMaximizedState = false;
    mainWindow?.webContents.send('window-maximized-status', false);
  } else {
    mainWindow?.maximize();
    isMaximizedState = true;
    mainWindow?.webContents.send('window-maximized-status', true);
  }
});
ipcMain.on('window-close', () => mainWindow?.close());
ipcMain.on('window-always-on-top', (event, val) => {
  mainWindow?.setAlwaysOnTop(val);
});
ipcMain.on('open-external', (event, url) => {
  if (url) shell.openExternal(url);
});
