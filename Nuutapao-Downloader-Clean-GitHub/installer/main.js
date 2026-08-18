const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = process.versions.electron ? require('original-fs') : require('fs');
const os = require('os');
const { spawn, execSync } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 832,
    height: 468,
    frame: false,
    transparent: true,
    resizable: false,
    show: false,
    backgroundColor: '#00000000',
    icon: path.join(__dirname, '..', 'public', 'logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Window controls
ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-close', () => mainWindow?.close());

// Get default installation path
ipcMain.handle('get-default-path', () => {
  const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
  return path.join(localAppData, 'Programs', 'Nuutapao Downloader');
});

// Directory selection dialog
ipcMain.handle('select-directory', async (event, currentPath) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Installation Directory',
    defaultPath: currentPath || os.homedir(),
    properties: ['openDirectory', 'createDirectory']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    let chosen = result.filePaths[0];
    if (!chosen.toLowerCase().endsWith('nuutapao downloader')) {
      chosen = path.join(chosen, 'Nuutapao Downloader');
    }
    return chosen;
  }
  return null;
});

// Copy directory recursively using original-fs (Bypasses ASAR interception)
async function copyDirWithProgress(src, dest, onFileCopied) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirWithProgress(srcPath, destPath, onFileCopied);
    } else {
      fs.copyFileSync(srcPath, destPath);
      if (onFileCopied) onFileCopied(destPath);
    }
  }
}

// Count total files in directory
function countFiles(dir) {
  let count = 0;
  if (!fs.existsSync(dir)) return 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += countFiles(fullPath);
    } else {
      count++;
    }
  }
  return count;
}

// Resolve all active Windows Desktop and Start Menu directories (including OneDrive & localized paths)
function getWindowsSpecialFolders() {
  const desktops = new Set();
  const defaultDesktop = path.join(os.homedir(), 'Desktop');
  if (fs.existsSync(defaultDesktop)) desktops.add(defaultDesktop);

  // Check OneDrive Desktop locations
  const oneDriveDir = path.join(os.homedir(), 'OneDrive');
  if (fs.existsSync(oneDriveDir)) {
    const onedriveEn = path.join(oneDriveDir, 'Desktop');
    if (fs.existsSync(onedriveEn)) desktops.add(onedriveEn);
    const onedriveTh = path.join(oneDriveDir, 'เดสก์ท็อป');
    if (fs.existsSync(onedriveTh)) desktops.add(onedriveTh);
  }

  let programs = path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'Microsoft', 'Windows', 'Start Menu', 'Programs');

  // Also query WScript.Shell SpecialFolders
  const vbsPath = path.join(os.tmpdir(), `get_folders_${Date.now()}.vbs`);
  const vbsContent = [
    'Set oWS = WScript.CreateObject("WScript.Shell")',
    'WScript.Echo "DESKTOP:" & oWS.SpecialFolders("Desktop")',
    'WScript.Echo "PROGRAMS:" & oWS.SpecialFolders("Programs")'
  ].join('\r\n');

  try {
    fs.writeFileSync(vbsPath, vbsContent, 'utf8');
    const out = execSync(`cscript //nologo "${vbsPath}"`, { encoding: 'utf8', stdio: 'pipe' });
    for (const line of out.split(/\r?\n/)) {
      if (line.startsWith('DESKTOP:')) {
        const d = line.substring('DESKTOP:'.length).trim();
        if (d && fs.existsSync(d)) desktops.add(d);
      }
      if (line.startsWith('PROGRAMS:')) {
        const p = line.substring('PROGRAMS:'.length).trim();
        if (p) programs = p;
      }
    }
  } catch (err) {
  } finally {
    try { if (fs.existsSync(vbsPath)) fs.unlinkSync(vbsPath); } catch (_) {}
  }

  if (desktops.size === 0) desktops.add(defaultDesktop);
  return { desktops: Array.from(desktops), programs };
}

// Create Windows Shortcut reliably via native WSH VBScript (No ExecutionPolicy restrictions)
function createWindowsShortcut(targetExe, shortcutPath, description) {
  const targetFolder = path.dirname(shortcutPath);
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
  }

  const vbsPath = path.join(os.tmpdir(), `create_lnk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.vbs`);
  const vbsContent = [
    'Set oWS = WScript.CreateObject("WScript.Shell")',
    `sLinkFile = "${shortcutPath.replace(/"/g, '""')}"`,
    'Set oLink = oWS.CreateShortcut(sLinkFile)',
    `oLink.TargetPath = "${targetExe.replace(/"/g, '""')}"`,
    `oLink.WorkingDirectory = "${path.dirname(targetExe).replace(/"/g, '""')}"`,
    `oLink.Description = "${(description || 'Nuutapao Downloader').replace(/"/g, '""')}"`,
    `oLink.IconLocation = "${targetExe.replace(/"/g, '""')},0"`,
    'oLink.Save'
  ].join('\r\n');

  try {
    fs.writeFileSync(vbsPath, vbsContent, 'utf8');
    execSync(`cscript //nologo "${vbsPath}"`, { stdio: 'pipe' });
    return fs.existsSync(shortcutPath);
  } catch (err) {
    return false;
  } finally {
    try { if (fs.existsSync(vbsPath)) fs.unlinkSync(vbsPath); } catch (_) {}
  }
}

// Create uninstaller batch script
function createUninstaller(targetPath, desktopPaths, startMenuPath) {
  const uninstallBat = path.join(targetPath, 'Uninstall Nuutapao Downloader.bat');
  const appName = 'Nuutapao Downloader';
  const startMenuShortcut = path.join(startMenuPath, `${appName}.lnk`);

  let desktopDeletes = '';
  for (const dPath of desktopPaths) {
    const lnk = path.join(dPath, `${appName}.lnk`);
    desktopDeletes += `if exist "${lnk}" del /f /q "${lnk}"\r\n`;
  }

  const batContent = `@echo off
title Uninstall ${appName}
echo.
echo ========================================
echo   Uninstalling ${appName}...
echo ========================================
echo.

:: Terminate running app instances
taskkill /F /IM "Nuutapao Downloader.exe" >nul 2>&1
timeout /t 1 /nobreak >nul

:: Remove Desktop Shortcuts
${desktopDeletes}echo Removed Desktop Shortcut(s).

:: Remove Start Menu Shortcut
if exist "${startMenuShortcut}" del /f /q "${startMenuShortcut}"
echo Removed Start Menu Shortcut.

:: Remove registry entries
reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\NuutapaoDownloader" /f >nul 2>&1
reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\Nuutapao Downloader.exe" /f >nul 2>&1
reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\nuutapao.exe" /f >nul 2>&1
echo Removed registry entries.

echo.
echo Removing application files...
cd /d "%TEMP%"
rmdir /s /q "${targetPath.replace(/\//g, '\\')}" 2>nul
echo.
echo ========================================
echo   ${appName} has been uninstalled!
echo ========================================
echo.
pause
`;
  fs.writeFileSync(uninstallBat, batContent, 'utf8');
  return uninstallBat;
}

// Register app in Windows Add/Remove Programs
function registerUninstall(targetPath, uninstallBatPath) {
  try {
    const exePath = path.join(targetPath, 'Nuutapao Downloader.exe');
    const regKey = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\NuutapaoDownloader';
    const uninstallCmd = `cmd.exe /c ""${uninstallBatPath}""`;
    const cmds = [
      `reg add "${regKey}" /v "DisplayName" /t REG_SZ /d "Nuutapao Downloader" /f`,
      `reg add "${regKey}" /v "UninstallString" /t REG_SZ /d "${uninstallCmd}" /f`,
      `reg add "${regKey}" /v "InstallLocation" /t REG_SZ /d "${targetPath}" /f`,
      `reg add "${regKey}" /v "DisplayIcon" /t REG_SZ /d "\\"${exePath}\\",0" /f`,
      `reg add "${regKey}" /v "Publisher" /t REG_SZ /d "Nuutapao" /f`,
      `reg add "${regKey}" /v "DisplayVersion" /t REG_SZ /d "2.6.7" /f`,
      `reg add "${regKey}" /v "NoModify" /t REG_DWORD /d 1 /f`,
      `reg add "${regKey}" /v "NoRepair" /t REG_DWORD /d 1 /f`,
    ];
    for (const cmd of cmds) {
      execSync(cmd, { stdio: 'ignore' });
    }
    return true;
  } catch (err) {
    return false;
  }
}

// Register in App Paths so Windows Search finds the app
function registerAppPaths(targetPath) {
  try {
    const exePath = path.join(targetPath, 'Nuutapao Downloader.exe');
    const appPathKey1 = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\Nuutapao Downloader.exe';
    const appPathKey2 = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\nuutapao.exe';
    const cmds = [
      `reg add "${appPathKey1}" /ve /t REG_SZ /d "\\"${exePath}\\"" /f`,
      `reg add "${appPathKey1}" /v "Path" /t REG_SZ /d "${targetPath}" /f`,
      `reg add "${appPathKey2}" /ve /t REG_SZ /d "\\"${exePath}\\"" /f`,
      `reg add "${appPathKey2}" /v "Path" /t REG_SZ /d "${targetPath}" /f`,
    ];
    for (const cmd of cmds) {
      execSync(cmd, { stdio: 'ignore' });
    }
    return true;
  } catch (err) {
    return false;
  }
}

// Start Installation
ipcMain.handle('start-installation', async (event, { targetPath, createDesktopShortcut, createStartMenuShortcut }) => {
  try {
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }

    mainWindow.webContents.send('install-log', `Target installation directory: ${targetPath}`);
    mainWindow.webContents.send('install-progress', 5);

    const resourcesDir = process.resourcesPath || '';
    const payloadZip = path.join(resourcesDir, 'payload.zip');
    const payloadDir = path.join(resourcesDir, 'app-payload');
    const devPayload = path.join(__dirname, '..', 'dist', 'win-unpacked');

    if (fs.existsSync(payloadZip)) {
      mainWindow.webContents.send('install-log', 'Extracting package archive...');
      
      const tarProcess = spawn('tar', ['-xvf', payloadZip, '-C', targetPath]);
      let fileCount = 0;

      tarProcess.stdout.on('data', (data) => {
        const lines = data.toString().split(/\r?\n/).filter(Boolean);
        for (const line of lines) {
          fileCount++;
          const progress = Math.min(85, 5 + Math.round(fileCount * 1.0));
          mainWindow.webContents.send('install-progress', progress);
          mainWindow.webContents.send('install-log', path.join(targetPath, line.trim()));
        }
      });

      await new Promise((resolve, reject) => {
        tarProcess.on('close', (code) => {
          if (code === 0) resolve();
          else reject(new Error(`Archive extraction exited with code ${code}`));
        });
        tarProcess.on('error', reject);
      });
    } else {
      // Direct copying with original-fs (Bypasses ASAR)
      const source = fs.existsSync(payloadDir) ? payloadDir : devPayload;
      if (!fs.existsSync(source)) {
        return { success: false, error: `Payload not found at ${source}` };
      }

      const totalFiles = countFiles(source);
      let copied = 0;
      mainWindow.webContents.send('install-log', `Extracting ${totalFiles} package components...`);

      await copyDirWithProgress(source, targetPath, (destFile) => {
        copied++;
        const percent = Math.round((copied / Math.max(1, totalFiles)) * 82) + 5;
        mainWindow.webContents.send('install-progress', percent);
        mainWindow.webContents.send('install-log', destFile);
      });
    }

    const exePath = path.join(targetPath, 'Nuutapao Downloader.exe');
    const specialFolders = getWindowsSpecialFolders();

    // Create Uninstaller
    mainWindow.webContents.send('install-log', 'Creating uninstaller...');
    mainWindow.webContents.send('install-progress', 88);
    const uninstallBat = createUninstaller(targetPath, specialFolders.desktops, specialFolders.programs);
    mainWindow.webContents.send('install-log', `Created: ${uninstallBat}`);

    // Register in Add/Remove Programs
    mainWindow.webContents.send('install-log', 'Registering in Windows Add/Remove Programs...');
    mainWindow.webContents.send('install-progress', 90);
    registerUninstall(targetPath, uninstallBat);

    // Register App Paths for Windows Search
    mainWindow.webContents.send('install-log', 'Registering application in Windows Search...');
    mainWindow.webContents.send('install-progress', 93);
    registerAppPaths(targetPath);

    // Create Desktop Shortcuts
    if (createDesktopShortcut) {
      for (const desktopDir of specialFolders.desktops) {
        const desktopShortcut = path.join(desktopDir, 'Nuutapao Downloader.lnk');
        const ok = createWindowsShortcut(exePath, desktopShortcut, 'Nuutapao Downloader');
        if (ok) {
          mainWindow.webContents.send('install-log', `Created Desktop Shortcut: ${desktopShortcut}`);
        }
      }
      mainWindow.webContents.send('install-progress', 96);
    }

    // Create Start Menu Shortcut
    if (createStartMenuShortcut) {
      if (!fs.existsSync(specialFolders.programs)) fs.mkdirSync(specialFolders.programs, { recursive: true });
      const startMenuShortcut = path.join(specialFolders.programs, 'Nuutapao Downloader.lnk');
      const ok = createWindowsShortcut(exePath, startMenuShortcut, 'Nuutapao Downloader');
      if (ok) {
        mainWindow.webContents.send('install-log', `Created Start Menu Shortcut: ${startMenuShortcut}`);
      }
      mainWindow.webContents.send('install-progress', 98);
    }

    mainWindow.webContents.send('install-progress', 100);
    return { success: true, exePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Launch App
ipcMain.handle('launch-app', async (event, targetPath) => {
  const exePath = path.join(targetPath, 'Nuutapao Downloader.exe');
  if (fs.existsSync(exePath)) {
    const child = spawn(exePath, [], {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();
    return true;
  }
  return false;
});
