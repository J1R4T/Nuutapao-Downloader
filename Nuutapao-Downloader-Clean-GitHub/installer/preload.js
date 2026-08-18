const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('installerAPI', {
  getDefaultPath: () => ipcRenderer.invoke('get-default-path'),
  selectDirectory: (currentPath) => ipcRenderer.invoke('select-directory', currentPath),
  startInstallation: (targetPath, createDesktopShortcut, createStartMenuShortcut) =>
    ipcRenderer.invoke('start-installation', { targetPath, createDesktopShortcut, createStartMenuShortcut }),
  launchApp: (targetPath) => ipcRenderer.invoke('launch-app', targetPath),
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  onProgress: (callback) => ipcRenderer.on('install-progress', (event, data) => callback(data)),
  onLog: (callback) => ipcRenderer.on('install-log', (event, data) => callback(data))
});
