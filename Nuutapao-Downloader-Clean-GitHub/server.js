// Ensure UTF-8 encoding across all subprocesses (yt-dlp, Python, FFmpeg, etc.)
process.env.PYTHONIOENCODING = 'utf-8';
process.env.PYTHONUTF8 = '1';
if (!process.env.LANG) process.env.LANG = 'en_US.UTF-8';
if (!process.env.LC_ALL) process.env.LC_ALL = 'en_US.UTF-8';

const express = require('express');
const { WebSocketServer } = require('ws');
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const path = require('path');
const fs = require('fs');
const os = require('os');
const multer = require('multer');
const { createAppStateStore, HISTORY_LIMIT } = require('./app-state');

function getSpawnEnv() {
  return {
    ...process.env,
    PYTHONIOENCODING: 'utf-8',
    PYTHONUTF8: '1',
    LANG: 'en_US.UTF-8',
    LC_ALL: 'en_US.UTF-8'
  };
}

let runtimeConfig = {
  isPackaged: false,
  resourcesPath: '',
  userDataPath: ''
};

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Multer for file uploads (converter)
const uploadDir = path.join(os.tmpdir(), 'nuutapao-converter');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir });

// Store active downloads
const activeDownloads = new Map();
let downloadHistory = [];
let stateStore = null;

// Store active conversions
const activeConversions = new Map();

// Default download folder: Desktop/YT Downloads
const defaultDownloadPath = path.join(os.homedir(), 'Desktop', 'YT Downloads');
if (!fs.existsSync(defaultDownloadPath)) {
  fs.mkdirSync(defaultDownloadPath, { recursive: true });
}

function getStateStore() {
  if (!stateStore) {
    stateStore = createAppStateStore({
      userDataPath: runtimeConfig.userDataPath,
      defaultDownloadPath
    });
    const state = stateStore.load();
    downloadHistory = state.history;
  }
  return stateStore;
}

function recordHistory(download) {
  const state = getStateStore().appendHistory(download);
  downloadHistory = state.history;
  broadcast({ type: 'history', data: downloadHistory });
}

// Provide config to frontend
app.get('/api/config', (req, res) => {
  const st = getStateStore().get();
  res.json({
    defaultPath: st.downloadDefaults.savePath || defaultDownloadPath,
    converterSavePath: st.downloadDefaults.converterSavePath || st.downloadDefaults.savePath || defaultDownloadPath
  });
});

app.get('/api/app-state', (req, res) => {
  res.json(getStateStore().get());
});

app.patch('/api/app-state', (req, res) => {
  const updated = getStateStore().patch(req.body);
  downloadHistory = updated.history;
  res.json(updated);
});

// One-time migration from client localStorage
app.post('/api/migrate', (req, res) => {
  const updated = getStateStore().migrateFromClient(req.body);
  downloadHistory = updated.history;
  broadcast({ type: 'history', data: downloadHistory });
  res.json(updated);
});

// History endpoints — server is the single source of truth
app.get('/api/history', (req, res) => {
  res.json({ history: getStateStore().get().history });
});

app.delete('/api/history', (req, res) => {
  const state = getStateStore().clearHistory();
  downloadHistory = state.history;
  broadcast({ type: 'history', data: downloadHistory });
  res.json({ history: downloadHistory });
});

app.delete('/api/history/:id', (req, res) => {
  const state = getStateStore().removeHistory(req.params.id);
  downloadHistory = state.history;
  broadcast({ type: 'history', data: downloadHistory });
  res.json({ history: downloadHistory });
});

// WebSocket clients
const wsClients = new Set();

wss.on('connection', (ws) => {
  wsClients.add(ws);
  // Send current history & yt-dlp status
  ws.send(JSON.stringify({ type: 'history', data: downloadHistory }));
  ws.send(JSON.stringify({ type: 'ytdlp-status', data: ytDlpStatus }));
  ws.on('close', () => wsClients.delete(ws));
});

function broadcast(data) {
  const msg = JSON.stringify(data);
  wsClients.forEach(ws => {
    if (ws.readyState === 1) ws.send(msg);
  });
}

function getYtDlpPath() {
  const baseDir = runtimeConfig.userDataPath || path.join(os.homedir(), '.nuutapao-downloader');
  const userToolsDir = path.join(baseDir, 'tools');
  if (!fs.existsSync(userToolsDir)) {
    try { fs.mkdirSync(userToolsDir, { recursive: true }); } catch (e) {}
  }
  const targetPath = path.join(userToolsDir, 'yt-dlp.exe');

  // If user data copy doesn't exist yet, copy initial bundled binary
  if (!fs.existsSync(targetPath)) {
    let bundlePath = null;
    if (runtimeConfig.isPackaged && runtimeConfig.resourcesPath) {
      bundlePath = path.join(runtimeConfig.resourcesPath, 'tools', 'yt-dlp.exe');
    } else {
      bundlePath = path.join(__dirname, 'tools', 'yt-dlp.exe');
    }
    if (bundlePath && fs.existsSync(bundlePath)) {
      try {
        fs.copyFileSync(bundlePath, targetPath);
      } catch (err) {
        return bundlePath;
      }
    }
  }
  return targetPath;
}

function getToolPath(name) {
  if (name === 'yt-dlp') return getYtDlpPath();
  if (runtimeConfig.isPackaged && runtimeConfig.resourcesPath) {
    return path.join(runtimeConfig.resourcesPath, 'tools', `${name}.exe`);
  }
  try {
    return require('ffmpeg-static');
  } catch {
    return null;
  }
}

// ── yt-dlp Auto-Update Manager ──────────────────────────────────────────────
let ytDlpStatus = {
  version: '',
  status: 'idle', // idle | checking | updating | up-to-date | updated | error
  lastChecked: null,
  message: ''
};

function checkYtDlpVersion() {
  const ytDlpPath = getToolPath('yt-dlp');
  if (!ytDlpPath || !fs.existsSync(ytDlpPath)) return;
  try {
    const proc = spawn(ytDlpPath, ['--version'], { env: getSpawnEnv() });
    let out = '';
    proc.stdout.on('data', d => out += d.toString());
    proc.on('close', (code) => {
      if (code === 0 && out.trim()) {
        ytDlpStatus.version = out.trim();
        broadcast({ type: 'ytdlp-status', data: ytDlpStatus });
      }
    });
  } catch (e) {}
}

function updateYtDlp() {
  const ytDlpPath = getToolPath('yt-dlp');
  if (!ytDlpPath || !fs.existsSync(ytDlpPath)) {
    ytDlpStatus = { ...ytDlpStatus, status: 'error', message: 'yt-dlp binary not found' };
    broadcast({ type: 'ytdlp-status', data: ytDlpStatus });
    return Promise.resolve(ytDlpStatus);
  }

  ytDlpStatus = { ...ytDlpStatus, status: 'checking', message: 'Checking for yt-dlp updates...' };
  broadcast({ type: 'ytdlp-status', data: ytDlpStatus });

  return new Promise((resolve) => {
    const proc = spawn(ytDlpPath, ['--encoding', 'utf-8', '-U'], { env: getSpawnEnv() });
    let output = '';
    let errOutput = '';

    proc.stdout.on('data', d => output += d.toString());
    proc.stderr.on('data', d => errOutput += d.toString());

    proc.on('close', (code) => {
      const fullLog = (output + errOutput).trim();
      const verMatches = fullLog.match(/\d{4}\.\d{2}\.\d{2}/g);
      const latestVer = verMatches ? verMatches[verMatches.length - 1] : ytDlpStatus.version;

      ytDlpStatus.lastChecked = new Date().toISOString();
      getStateStore().patch({ engine: { lastChecked: ytDlpStatus.lastChecked } });

      if (fullLog.includes('up to date') || fullLog.includes('Up to date')) {
        ytDlpStatus = {
          ...ytDlpStatus,
          status: 'up-to-date',
          version: latestVer || ytDlpStatus.version,
          message: `yt-dlp is up to date (${latestVer || ytDlpStatus.version})`
        };
      } else if (fullLog.includes('Updated') || fullLog.includes('updated')) {
        ytDlpStatus = {
          ...ytDlpStatus,
          status: 'updated',
          version: latestVer || ytDlpStatus.version,
          message: `Updated yt-dlp to version ${latestVer}`
        };
      } else if (code === 0) {
        ytDlpStatus = {
          ...ytDlpStatus,
          status: 'up-to-date',
          version: latestVer || ytDlpStatus.version,
          message: fullLog || 'yt-dlp check complete'
        };
      } else {
        ytDlpStatus = {
          ...ytDlpStatus,
          status: 'error',
          message: errOutput.trim() || 'yt-dlp update failed'
        };
      }

      broadcast({ type: 'ytdlp-status', data: ytDlpStatus });
      resolve(ytDlpStatus);
    });
  });
}

app.get('/api/ytdlp-status', (req, res) => {
  res.json(ytDlpStatus);
});

app.post('/api/update-ytdlp', async (req, res) => {
  const result = await updateYtDlp();
  res.json(result);
});

function getToolStatus() {
  const ytDlpPath = getToolPath('yt-dlp');
  const ffmpegPath = getToolPath('ffmpeg');
  return {
    ready: Boolean(ytDlpPath && ffmpegPath && fs.existsSync(ytDlpPath) && fs.existsSync(ffmpegPath)),
    ytDlp: { available: Boolean(ytDlpPath && fs.existsSync(ytDlpPath)) },
    ffmpeg: { available: Boolean(ffmpegPath && fs.existsSync(ffmpegPath)) }
  };
}

function toolUnavailable(res, toolName) {
  return res.status(503).json({ error: `${toolName} is missing from this installation. Please reinstall Nuutapao Downloader.` });
}

app.get('/api/health', (req, res) => {
  const tools = getToolStatus();
  res.status(tools.ready ? 200 : 503).json({ ok: tools.ready, tools });
});

// ── Internal Secure DNS (DoH) Proxy ─────────────────────────────────────────
const net = require('net');
const https = require('https');

let internalDohPort = null;
let currentDnsProvider = 'cloudflare';
let currentCustomDnsUrl = '';
const dohCache = new Map();
const DOH_CACHE_TTL_MS = 5 * 60 * 1000;
const DOH_CACHE_LIMIT = 512;

function getDohUrl(provider, customUrl) {
  if (provider === 'google') return 'https://dns.google/resolve';
  if (provider === 'opendns') return 'https://doh.opendns.com/dns-query';
  if (provider === 'quad9') return 'https://dns.quad9.net/dns-query';
  if (provider === 'adguard') return 'https://dns.adguard-dns.com/dns-query';
  if (provider === 'custom' && customUrl) return customUrl;
  return 'https://1.1.1.1/dns-query';
}

function resolveDoH(domain, provider, customUrl) {
  if (!domain || domain === 'localhost' || domain === '127.0.0.1') return Promise.resolve(null);
  const cacheKey = `${provider}:${domain}`;
  const cached = dohCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.value);
  if (cached) dohCache.delete(cacheKey);

  return new Promise(resolve => {
    const isGoogle = provider === 'google';
    const baseUrl = getDohUrl(provider, customUrl);
    const fullUrl = isGoogle 
      ? `${baseUrl}?name=${encodeURIComponent(domain)}&type=A`
      : `${baseUrl}?name=${encodeURIComponent(domain)}&type=A`;
    const headers = isGoogle ? {} : { 'accept': 'application/dns-json' };

    https.get(fullUrl, { headers, timeout: 4000 }, r => {
      let data = '';
      r.on('data', c => data += c);
      r.on('end', () => {
        try {
          const json = JSON.parse(data);
          const ans = json.Answer || json.answer;
          if (ans && ans.length) {
            const ip = ans.find(a => a.type === 1)?.data;
            if (ip) {
              if (dohCache.size >= DOH_CACHE_LIMIT) dohCache.delete(dohCache.keys().next().value);
              dohCache.set(cacheKey, { value: ip, expiresAt: Date.now() + DOH_CACHE_TTL_MS });
              return resolve(ip);
            }
          }
        } catch (e) {}
        resolve(null);
      });
    }).on('error', () => resolve(null));
  });
}

const dohProxy = http.createServer();
let dohProxyStarted = false;
dohProxy.on('connect', async (req, clientSocket, head) => {
  const [host, portStr] = req.url.split(':');
  const targetPort = parseInt(portStr) || 443;
  const resolvedIp = (currentDnsProvider !== 'os') 
    ? (await resolveDoH(host, currentDnsProvider, currentCustomDnsUrl) || host)
    : host;

  const serverSocket = net.connect(targetPort, resolvedIp, () => {
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    serverSocket.write(head);
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
  });

  serverSocket.on('error', () => clientSocket.end());
  clientSocket.on('error', () => serverSocket.end());
});

function startDohProxy() {
  if (dohProxyStarted) return;
  dohProxyStarted = true;
  dohProxy.listen(0, '127.0.0.1', () => {
    internalDohPort = dohProxy.address().port;
    console.log(`🔒 Internal Secure DNS (DoH) Proxy running on port ${internalDohPort}`);
  });
}

function resolveProxyUrl(body = {}) {
  const dnsEnabled = body.dnsEnabled !== undefined ? body.dnsEnabled : true;
  const dnsProvider = body.dnsProvider || 'cloudflare';
  const customDnsUrl = body.customDnsUrl || '';
  const proxyEnabled = body.proxyEnabled || false;
  const proxyPreset = body.proxyPreset || 'warp';
  // Accept both field names: frontend historically sent `proxy`, server schema uses `proxyUrl`
  const proxyUrl = body.proxyUrl || body.proxy || '';

  currentDnsProvider = dnsProvider || 'cloudflare';
  currentCustomDnsUrl = customDnsUrl || '';

  if (proxyEnabled) {
    if (proxyPreset === 'warp') return 'socks5://127.0.0.1:10808';
    if (proxyPreset === 'clash') return 'http://127.0.0.1:7890';
    if (proxyPreset === 'shadowsocks') return 'socks5://127.0.0.1:1080';
    if (proxyPreset === 'custom') return proxyUrl || '';
    return proxyUrl || '';
  }

  if (dnsEnabled !== false && dnsProvider !== 'os' && internalDohPort) {
    return `http://127.0.0.1:${internalDohPort}`;
  }

  return '';
}

function getLocalProxyPort(preset) {
  if (preset === 'warp') return 10808;
  if (preset === 'clash') return 7890;
  if (preset === 'shadowsocks') return 1080;
  return null;
}

function validateAccessSettings(body = {}) {
  const cookieSource = body.cookieSource || 'none';
  if (cookieSource === 'file') {
    if (!body.cookieFile) {
      return 'No cookies file selected. Choose a valid cookies.txt file or use browser cookies.';
    }
    if (!fs.existsSync(body.cookieFile)) {
      return `Cookies file not found at "${body.cookieFile}". Choose a valid cookies.txt file or use browser cookies.`;
    }
  }
  if (body.proxyEnabled) {
    if (body.proxyPreset === 'custom') {
      const proxyUrl = body.proxyUrl || body.proxy || '';
      if (!proxyUrl) {
        return 'Custom proxy URL is empty. Enter a proxy URL or choose a preset.';
      }
      try {
        const parsed = new URL(proxyUrl);
        if (!['http:', 'https:', 'socks4:', 'socks4a:', 'socks5:', 'socks5h:'].includes(parsed.protocol)) {
          return `Proxy scheme "${parsed.protocol.replace(':', '')}" is not supported. Use http, https, socks4, socks4a, socks5, or socks5h.`;
        }
      } catch {
        return 'Custom proxy URL is invalid. Use format like http://127.0.0.1:1080 or socks5://127.0.0.1:10808';
      }
    }
  }
  return null;
}

function extractCleanUrl(rawUrl = '') {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  const match = trimmed.match(/https?:\/\/[^\s"'<>]+/i);
  return match ? match[0] : trimmed;
}

function ensureNetscapeCookieFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return filePath;
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    // Strip UTF-8 BOM if present
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    const trimmed = content.trim();

    // If JSON format (from Cookie-Editor / EditThisCookie extension)
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      const parsed = JSON.parse(trimmed);
      const cookieArray = Array.isArray(parsed) ? parsed : [parsed];
      let netscapeLines = ['# Netscape HTTP Cookie File', '# Auto-converted by Nuutapao Downloader', ''];
      cookieArray.forEach(c => {
        if (!c.domain || !c.name) return;
        let domain = c.domain;
        const flag = domain.startsWith('.') ? 'TRUE' : 'FALSE';
        const path = c.path || '/';
        const secure = (c.secure !== undefined) ? (c.secure ? 'TRUE' : 'FALSE') : 'FALSE';
        const expiry = Math.round(c.expirationDate || c.expiry || (Date.now() / 1000 + 86400 * 365));
        const name = c.name;
        const value = c.value || '';
        netscapeLines.push(`${domain}\t${flag}\t${path}\t${secure}\t${expiry}\t${name}\t${value}`);
      });
      const netscapePath = path.join(os.tmpdir(), `nuu-netscape-cookies-${path.basename(filePath)}.txt`);
      fs.writeFileSync(netscapePath, netscapeLines.join('\r\n'), 'utf8');
      return netscapePath;
    }

    // Ensure Netscape header exists if it's already a text file
    if (!trimmed.includes('# Netscape HTTP Cookie File') && !trimmed.includes('# HTTP Cookie File')) {
      const formatted = `# Netscape HTTP Cookie File\r\n# Auto-fixed by Nuutapao Downloader\r\n\r\n${content}`;
      const netscapePath = path.join(os.tmpdir(), `nuu-fixed-cookies-${path.basename(filePath)}.txt`);
      fs.writeFileSync(netscapePath, formatted, 'utf8');
      return netscapePath;
    }
  } catch {}
  return filePath;
}

function buildPlatformArgs(url = '', hasCookies = false) {
  const args = [
    '--encoding', 'utf-8',
    '--windows-filenames',
    '--trim-filenames', '180',
    '--no-playlist',
    '--no-check-certificates',
    '--compat-options', 'no-youtube-unavailable-videos'
  ];

  if (/youtu\.?be|youtube\.com/i.test(url)) {
    // When cookies are present, web/mweb clients must be first so web session cookies (SSID, SID, HSID, LOGIN_INFO)
    // authenticate age-restricted videos properly.
    // When no cookies are present, tv_embedded/mweb/web can bypass age gate on embeddable videos without login.
    if (hasCookies) {
      args.push('--extractor-args', 'youtube:player_client=web,mweb,tv_embedded,tv,ios,android;player_skip=configs');
    } else {
      args.push('--extractor-args', 'youtube:player_client=tv_embedded,web,mweb,ios,android;player_skip=configs');
    }
  } else {
    args.push('--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36');
    if (/tiktok\.com|vm\.tiktok|vt\.tiktok/i.test(url)) {
      args.push('--referer', 'https://www.tiktok.com/');
    } else if (/instagram\.com|instagr\.am/i.test(url)) {
      args.push('--referer', 'https://www.instagram.com/');
    } else if (/twitter\.com|x\.com|t\.co/i.test(url)) {
      args.push('--referer', 'https://x.com/');
    } else if (/facebook\.com|fb\.watch|fb\.com/i.test(url)) {
      args.push('--referer', 'https://www.facebook.com/');
    } else if (/bilibili\.com/i.test(url)) {
      args.push('--referer', 'https://www.bilibili.com/');
    } else if (/douyin\.com/i.test(url)) {
      args.push('--referer', 'https://www.douyin.com/');
    } else if (/reddit\.com|redd\.it/i.test(url)) {
      args.push('--referer', 'https://www.reddit.com/');
    }
  }
  return args;
}

function isCookieDbError(errMessage = '') {
  const normalized = (errMessage || '').toLowerCase();
  return (
    normalized.includes('cookies database') ||
    normalized.includes('cookie database') ||
    normalized.includes('could not find opera cookies') ||
    (normalized.includes('could not extract') && normalized.includes('cookie')) ||
    (normalized.includes('could not copy') && normalized.includes('cookie')) ||
    normalized.includes('cookie file is not valid') ||
    normalized.includes('cookies file must be netscape') ||
    normalized.includes('database is locked')
  );
}

function buildAccessArgs(body = {}, excludeCookies = false) {
  const args = [];
  const effectiveProxy = resolveProxyUrl(body);
  if (effectiveProxy) args.push('--proxy', effectiveProxy);
  if (!excludeCookies) {
    if (body.cookieSource === 'browser' && body.cookieBrowser) {
      args.push('--cookies-from-browser', body.cookieBrowser);
    } else if (body.cookieSource === 'file' && body.cookieFile) {
      const netscapeCookiePath = ensureNetscapeCookieFile(body.cookieFile);
      args.push('--cookies', netscapeCookiePath);
    }
  }
  return args;
}

function classifyYtDlpError(message = '', cookieSource = 'none') {
  const normalized = (message || '').toLowerCase();
  if (/cookies file must be netscape formatted/i.test(normalized)) {
    return 'Cookies file must be in Netscape format. Export your cookies in Netscape format or select your browser under Browser Cookies.';
  }
  if (/could not find .* cookies database|could not copy .* cookie database|could not extract .* cookies|cookie database in|database is locked|resource busy/i.test(normalized)) {
    return 'Could not access the selected browser cookies. Make sure the browser is installed and closed (or check Cookie Settings / use cookies.txt).';
  }
  if (/unexpected response|tiktok.*error|anti.?bot|challenge/i.test(normalized) && /tiktok/i.test(normalized)) {
    return 'TikTok anti-bot verification returned an unexpected response. Try updating yt-dlp or using browser cookies in Settings.';
  }
  if (/age.?restricted|confirm your age|sign in to confirm/i.test(normalized)) {
    if (cookieSource === 'browser') {
      return 'Age-restricted video: Could not use browser cookies (browser may be open). Please close your browser completely or select "Use cookies.txt File" in Settings -> Cookies.';
    }
    return 'This video requires age verification. Select "Use Browser Cookies" (and close your browser) or select "Use cookies.txt File" in Settings -> Cookies.';
  }
  if (/not available in your country|geo.?restricted|not available in this location|country block/i.test(normalized)) {
    return 'This video is region-locked and not available in your country. Use a proxy or VPN server located in an allowed region. Secure DNS (DoH) cannot change your geographic location.';
  }
  if (/login required|sign in|required.*cookies|members.?only|private video/i.test(normalized)) {
    return 'This video requires account access (login/membership). Provide browser cookies or a cookies.txt file from an authorized account in Settings -> Cookies.';
  }
  if (/connection refused|failed to establish connection|proxy error|socks|tunnel connection failed/i.test(normalized)) {
    return 'The configured proxy could not be reached. Make sure the proxy/VPN application is running and check its address and port.';
  }
  if (/could not resolve host|getaddrinfo|name.*resolution|name or service not known|nodename nor servname|curl.*\(6\)/i.test(normalized)) {
    return 'DNS resolution failed. The site may be blocked by your ISP. Try enabling a proxy/VPN in Settings.';
  }
  if (/time.?out|timed.?out|gateway time-out|curl.*\(28\)|connection.*timed/i.test(normalized)) {
    return 'Connection timed out. Check your internet connection or try a different proxy/VPN.';
  }
  if (/too many requests|http error 429|rate.?limit/i.test(normalized)) {
    return 'Too many requests sent to this service. Please wait a moment before downloading again.';
  }
  if (/http error 403|403: forbidden/i.test(normalized)) {
    return 'Access was forbidden (HTTP 403). The platform may require cookies or an updated engine version.';
  }
  if (/video.*unavailable|removed|taken down|copyright/i.test(normalized)) {
    return 'This video is unavailable (removed, taken down, or blocked for copyright). It cannot be downloaded.';
  }
  if (/no space left on device|disk full/i.test(normalized)) {
    return 'Disk is full. Please free up disk space in your download folder.';
  }
  return (message || '').trim() || 'Download failed';
}

function ensureOutputDirectory(directory) {
  try {
    fs.mkdirSync(directory, { recursive: true });
    return fs.statSync(directory).isDirectory() ? null : 'Output path is not a folder.';
  } catch (error) {
    return `Unable to create output folder: ${error.message}`;
  }
}

// GET video info
app.post('/api/info', async (req, res) => {
  const rawUrl = req.body.url;
  const url = extractCleanUrl(rawUrl);
  if (!url) return res.status(400).json({ error: 'URL is required' });
  const accessError = validateAccessSettings(req.body);
  if (accessError) return res.status(400).json({ error: accessError });

  const ytDlpPath = getToolPath('yt-dlp');
  if (!ytDlpPath || !fs.existsSync(ytDlpPath)) return toolUnavailable(res, 'yt-dlp');

  function fetchInfo(excludeCookies = false) {
    const hasCookies = Boolean(!excludeCookies && req.body.cookieSource && req.body.cookieSource !== 'none');
    return new Promise((resolve) => {
      const args = [
        '--dump-json', '--no-playlist',
        '--socket-timeout', '45',
        '--extractor-retries', '5',
        ...buildPlatformArgs(url, hasCookies),
        ...buildAccessArgs(req.body, excludeCookies),
        url
      ];

      const proc = spawn(ytDlpPath, args, { env: getSpawnEnv() });
      let output = '';
      let errOutput = '';

      proc.stdout.on('data', d => output += d.toString());
      proc.stderr.on('data', d => errOutput += d.toString());
      proc.once('error', (err) => {
        resolve({ ok: false, error: `Unable to start yt-dlp: ${err.message}`, rawError: err.message });
      });

      proc.on('close', (code) => {
        if (code === 0) {
          try {
            const info = JSON.parse(output);
            const formats = (info.formats || [])
              .filter(f => f.vcodec !== 'none' || f.acodec !== 'none')
              .map(f => ({
                format_id: f.format_id,
                ext: f.ext,
                resolution: f.resolution || (f.height ? `${f.height}p` : 'audio only'),
                filesize: f.filesize || f.filesize_approx || null,
                vcodec: f.vcodec,
                acodec: f.acodec,
                fps: f.fps,
                tbr: f.tbr,
                note: f.format_note
              }))
              .reverse();

            return resolve({
              ok: true,
              data: {
                title: info.title,
                uploader: info.uploader,
                duration: info.duration,
                thumbnail: info.thumbnail,
                view_count: info.view_count,
                like_count: info.like_count,
                upload_date: info.upload_date,
                description: info.description,
                webpage_url: info.webpage_url,
                formats
              }
            });
          } catch (e) {
            return resolve({ ok: false, error: 'Failed to parse video info', rawError: output });
          }
        }
        resolve({ ok: false, code, rawError: errOutput });
      });
    });
  }

  let result = await fetchInfo(false);
  // If cookies failed to load, retry once without cookies for public media
  if (!result.ok && req.body.cookieSource === 'browser' && isCookieDbError(result.rawError || '')) {
    const retryResult = await fetchInfo(true);
    if (retryResult.ok) {
      result = retryResult;
    }
  }

  if (result.ok) {
    return res.json(result.data);
  }
  return res.status(500).json({ error: classifyYtDlpError(result.rawError || result.error || 'Failed to fetch video info', req.body.cookieSource) });
});

// Start download
app.post('/api/download', (req, res) => {
  const { format, audioOnly, outputPath, subtitles, ext, embedThumbnail } = req.body;
  const rawUrl = req.body.url;
  const url = extractCleanUrl(rawUrl);
  if (!url) return res.status(400).json({ error: 'URL is required' });
  const accessError = validateAccessSettings(req.body);
  if (accessError) return res.status(400).json({ error: accessError });

  const ytDlpPath = getToolPath('yt-dlp');
  if (!ytDlpPath || !fs.existsSync(ytDlpPath)) return toolUnavailable(res, 'yt-dlp');
  const id = uuidv4();
  const downloadDir = outputPath || defaultDownloadPath;
  const directoryError = ensureOutputDirectory(downloadDir);
  if (directoryError) return res.status(400).json({ error: directoryError });

  const ffmpegPath = getToolPath('ffmpeg');
  if (!ffmpegPath || !fs.existsSync(ffmpegPath)) return toolUnavailable(res, 'FFmpeg');

  function buildDownloadArgs(excludeCookies = false) {
    const hasCookies = Boolean(!excludeCookies && req.body.cookieSource && req.body.cookieSource !== 'none');
    let args = [
      '--newline',
      '--no-simulate',
      '--progress',
      '--print', 'before_dl:NuuMeta:%(title)s|||%(thumbnail)s',
      '--extractor-retries', '5',
      '--retries', '5',
      '--fragment-retries', '10',
      '--socket-timeout', '45',
      '--concurrent-fragments', '5',
      ...buildPlatformArgs(url, hasCookies),
      ...buildAccessArgs(req.body, excludeCookies)
    ];

    if (embedThumbnail !== false) {
      args.push('--embed-thumbnail');
    }

    if (audioOnly) {
      const audioExt = ext || 'mp3';
      args.push('-x', '--audio-format', audioExt, '--audio-quality', '0');
      if (audioExt === 'mp3') {
        args.push('--postprocessor-args', 'ffmpeg:-codec:a libmp3lame -b:a 320k');
      } else if (audioExt === 'm4a') {
        args.push('--postprocessor-args', 'ffmpeg:-codec:a aac -b:a 256k');
      } else if (audioExt === 'wav') {
        args.push('--postprocessor-args', 'ffmpeg:-codec:a pcm_s16le -ar 44100');
      }
    } else {
      const videoExt = ext || 'mp4';
      if (videoExt === 'mp4') {
        if (format && format !== 'best') {
          const heightMatch = format.match(/height<=(\d+)/);
          if (heightMatch) {
            const h = heightMatch[1];
            args.push('-f', `bestvideo[height<=${h}]+bestaudio/best[height<=${h}]/best`);
          } else {
            args.push('-f', format);
          }
        } else {
          args.push('-f', 'bestvideo+bestaudio/best');
        }
        args.push('--merge-output-format', 'mp4');
        args.push('--postprocessor-args', 'ffmpeg:-movflags +faststart');
      } else {
        if (format && format !== 'best') {
          args.push('-f', format);
        } else {
          args.push('-f', 'bestvideo+bestaudio/best');
        }
        args.push('--merge-output-format', videoExt);
        if (videoExt === 'webm' || videoExt === 'mkv') {
          args.push('--remux-video', videoExt);
        }
      }
    }

    if (subtitles) {
      args.push('--write-sub', '--write-auto-sub', '--sub-lang', 'en,th');
    }

    args.push('--ffmpeg-location', ffmpegPath);
    args.push('-o', path.join(downloadDir, '%(title)s.%(ext)s'), url);
    return args;
  }

  const download = {
    id,
    url,
    status: 'downloading',
    progress: 0,
    speed: '',
    eta: '',
    title: '',
    filename: '',
    thumbnail: '',
    outputDir: downloadDir,
    startedAt: new Date().toISOString(),
    audioOnly: audioOnly || false,
    error: null
  };

  const downloadEntry = { proc: null, info: download, isCancelled: false };
  activeDownloads.set(id, downloadEntry);

  let lastBroadcastTime = 0;

  function startProcess(excludeCookies = false) {
    const args = buildDownloadArgs(excludeCookies);
    const proc = spawn(ytDlpPath, args, { env: getSpawnEnv() });
    downloadEntry.proc = proc;

    let stderrBuffer = '';

    proc.once('error', (err) => {
      if (downloadEntry.isCancelled) return;
      activeDownloads.delete(id);
      download.status = 'error';
      download.error = `Unable to start yt-dlp: ${err.message}`;
      download.finishedAt = new Date().toISOString();
      recordHistory({ ...download });
      broadcast({ type: 'progress', id, download: { ...download } });
    });

    proc.stdout.on('data', (data) => {
      if (downloadEntry.isCancelled) return;
      const line = data.toString();

      if (line.includes('NuuMeta:')) {
        const metaMatch = line.match(/NuuMeta:(.*?)\|\|\|(.*)/);
        if (metaMatch) {
          const extractedTitle = metaMatch[1].trim();
          const extractedThumb = metaMatch[2].trim();
          if (extractedTitle) download.title = extractedTitle;
          if (extractedThumb && extractedThumb.startsWith('http')) download.thumbnail = extractedThumb;
        }
      }

      const progressMatch = line.match(/(\d+\.?\d*)%/);
      const speedMatch = line.match(/at\s+([\d.]+\w+\/s)/);
      const etaMatch = line.match(/ETA\s+([\d:]+)/);
      const destMatch = line.match(/\[download\] Destination: (.+)/);
      const mergeMatch = line.match(/\[Merger\] Merging formats into "(.+)"/);
      const extractAudioMatch = line.match(/\[ExtractAudio\] Destination: (.+)/);
      const alreadyMatch = line.match(/\[download\] (.+) has already been downloaded/);
      const fixupMatch = line.match(/\[Fixup[a-zA-Z0-9]+\] Moving file ".+" to "(.+)"/);
      const moveMatch = line.match(/\[MoveFiles\] Moving file ".+" to "(.+)"/);

      if (destMatch) {
        const rawName = path.basename(destMatch[1].trim());
        download.filename = rawName.replace(/\.f\d+(\.[a-zA-Z0-9]+)$/, '$1');
      }
      if (mergeMatch) download.filename = path.basename(mergeMatch[1].trim());
      if (extractAudioMatch) download.filename = path.basename(extractAudioMatch[1].trim());
      if (alreadyMatch) download.filename = path.basename(alreadyMatch[1].trim());
      if (fixupMatch) download.filename = path.basename(fixupMatch[1].trim());
      if (moveMatch) download.filename = path.basename(moveMatch[1].trim());
      if (progressMatch) download.progress = parseFloat(progressMatch[1]);
      if (speedMatch) download.speed = speedMatch[1];
      if (etaMatch) download.eta = etaMatch[1];

      const now = Date.now();
      if (now - lastBroadcastTime >= 100 || download.progress === 100) {
        lastBroadcastTime = now;
        broadcast({ type: 'progress', id, download: { ...download } });
      }
    });

    proc.stderr.on('data', (data) => {
      if (downloadEntry.isCancelled) return;
      const line = data.toString();
      stderrBuffer += line + '\n';
      broadcast({ type: 'log', id, message: line });
    });

    proc.on('close', (code) => {
      if (downloadEntry.isCancelled) return;

      // If failed due to cookie database error and we haven't retried yet, retry without cookies
      if (code !== 0 && !excludeCookies && req.body.cookieSource === 'browser' && isCookieDbError(stderrBuffer)) {
        return startProcess(true);
      }

      activeDownloads.delete(id);
      if (code === 0) {
        download.status = 'done';
        download.progress = 100;
        download.finishedAt = new Date().toISOString();

        // If filename wasn't captured from stdout lines, locate the newly created file in downloadDir
        if (!download.filename && download.title && fs.existsSync(downloadDir)) {
          try {
            const files = fs.readdirSync(downloadDir);
            const cleanTitle = download.title.replace(/[\\/:*?"<>|]/g, '').trim().toLowerCase();
            const matched = files.find(f => f.toLowerCase().startsWith(cleanTitle));
            if (matched) download.filename = matched;
          } catch {}
        }
      } else {
        download.status = 'error';
        const lines = stderrBuffer.split('\n').map(l => l.trim()).filter(l => l.startsWith('ERROR:') || l.toLowerCase().includes('error:'));
        const rawError = lines.length > 0
          ? lines[lines.length - 1].replace(/^ERROR:\s*/i, '')
          : (stderrBuffer.trim().split('\n').pop() || 'Download failed');
        download.error = classifyYtDlpError(rawError, req.body.cookieSource);
        download.rawError = rawError;
        download.finishedAt = new Date().toISOString();
        cleanupPartialFiles(downloadDir, download.title, download.filename);
      }
      recordHistory({ ...download });
      broadcast({ type: 'progress', id, download: { ...download } });
    });
  }

  startProcess(false);
  res.json({ id, message: 'Download started' });
});

function cleanupPartialFiles(outputDir, title, filename) {
  if (!outputDir || !fs.existsSync(outputDir)) return;

  const titleClean = (title || filename || '').replace(/[\\/:*?"<>|]/g, '').replace(/\.f\d+(\.[a-zA-Z0-9]+)?$/, '').trim();
  const titleWords = titleClean.split(/\s+/).filter(w => w.length > 3);

  try {
    const files = fs.readdirSync(outputDir);
    files.forEach(f => {
      let isMatch = false;

      // 1. Direct match on filename or title
      if (filename && f.includes(filename.replace(/\.f\d+\.[a-zA-Z0-9]+$/, ''))) isMatch = true;
      if (titleClean && f.includes(titleClean)) isMatch = true;

      // 2. Match if file contains main title words
      if (!isMatch && titleWords.length > 0) {
        const matchingWords = titleWords.filter(w => f.toLowerCase().includes(w.toLowerCase()));
        if (matchingWords.length >= Math.min(2, titleWords.length)) {
          isMatch = true;
        }
      }

      // 3. Match temporary extensions / fragment markers (.f137, .f401, .f251, .part, .ytdl, etc.)
      const isTempExt = f.endsWith('.part') || f.endsWith('.ytdl') || f.endsWith('.temp') || /\.f\d+/i.test(f) || /\.frag\d+/i.test(f);
      if (isTempExt || isMatch) {
        const filePath = path.join(outputDir, f);
        try {
          fs.unlinkSync(filePath);
        } catch (e) {}
      }
    });
  } catch (e) {}
}

// Cancel download
app.post('/api/cancel/:id', (req, res) => {
  const { exec } = require('child_process');
  const entry = activeDownloads.get(req.params.id);
  if (!entry) return res.status(404).json({ error: 'Download not found' });

  entry.isCancelled = true;
  entry.info.status = 'cancelled';
  entry.info.finishedAt = new Date().toISOString();

  // Force-kill process tree (yt-dlp + ffmpeg children)
  if (entry.proc) {
    // 1. Destroy stdio streams immediately to stop all data flow
    try { entry.proc.stdout.destroy(); } catch (e) {}
    try { entry.proc.stderr.destroy(); } catch (e) {}
    // 2. Kill main process synchronously 
    try { entry.proc.kill('SIGTERM'); } catch (e) {}
    // 3. Windows: force-kill entire process tree (includes ffmpeg child processes)
    if (entry.proc.pid) {
      if (process.platform === 'win32') {
        exec(`taskkill /pid ${entry.proc.pid} /T /F`, () => {});
      } else {
        try { entry.proc.kill('SIGKILL'); } catch (e) {}
      }
    }
  }

  // Delete partial downloaded files from disk immediately & retry 600ms later after Windows file handle release
  const filename = entry.info.filename;
  const title = entry.info.title;
  const outputDir = entry.info.outputDir || defaultDownloadPath;

  cleanupPartialFiles(outputDir, title, filename);
  setTimeout(() => {
    cleanupPartialFiles(outputDir, title, filename);
  }, 600);

  activeDownloads.delete(req.params.id);
  recordHistory({ ...entry.info });

  broadcast({ type: 'progress', id: req.params.id, download: { ...entry.info } });

  res.json({ message: 'Cancelled successfully' });
});

// Get active downloads
app.get('/api/downloads', (req, res) => {
  const active = Array.from(activeDownloads.values()).map(e => e.info);
  res.json({ active, history: downloadHistory });
});

// Open download folder / highlight file
app.get('/api/open-folder', (req, res) => {
  const { exec } = require('child_process');
  const folderPath = req.query.path || defaultDownloadPath;
  const fileName = req.query.file;

  const targetPath = fs.existsSync(folderPath) ? folderPath : defaultDownloadPath;
  const fullFilePath = fileName ? path.join(targetPath, fileName) : null;

  if (fullFilePath && fs.existsSync(fullFilePath)) {
    if (process.platform === 'win32') {
      exec(`explorer /select,"${fullFilePath}"`);
    } else if (process.platform === 'darwin') {
      exec(`open -R "${fullFilePath}"`);
    } else {
      exec(`xdg-open "${targetPath}"`);
    }
  } else {
    if (process.platform === 'win32') {
      exec(`explorer "${targetPath}"`);
    } else if (process.platform === 'darwin') {
      exec(`open "${targetPath}"`);
    } else {
      exec(`xdg-open "${targetPath}"`);
    }
  }
  res.json({ message: 'Opened' });
});

// Select folder via Electron dialog
let electronDialog = null;
app.get('/api/select-folder', async (req, res) => {
  if (electronDialog) {
    const currentPath = req.query.current || defaultDownloadPath;
    const dialogOpts = {
      properties: ['openDirectory'],
      defaultPath: currentPath
    };
    const { canceled, filePaths } = await electronDialog.showOpenDialog(dialogOpts);
    if (!canceled && filePaths.length > 0) {
      return res.json({ path: filePaths[0] });
    }
  }
  res.json({ path: null });
});

app.get('/api/select-file', async (req, res) => {
  if (electronDialog) {
    const { canceled, filePaths } = await electronDialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    if (!canceled && filePaths.length > 0) {
      return res.json({ path: filePaths[0] });
    }
  }
  res.json({ path: null });
});

// Select files for converter via Electron dialog
app.get('/api/select-convert-files', async (req, res) => {
  if (electronDialog) {
    const { canceled, filePaths } = await electronDialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Media Files', extensions: ['mp4','mkv','avi','mov','wmv','flv','webm','m4v','3gp','mp3','wav','m4a','aac','ogg','flac','wma','opus','png','jpg','jpeg','gif','bmp','tiff','webp','svg','ico','heic'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    if (!canceled && filePaths.length > 0) {
      const files = filePaths.map(fp => ({
        path: fp,
        name: path.basename(fp),
        size: fs.statSync(fp).size
      }));
      return res.json({ files });
    }
  }
  res.json({ files: [] });
});

// Get ffmpeg path helper
function getFFmpegPath() {
  return getToolPath('ffmpeg');
}

// Convert file
app.post('/api/convert', upload.single('file'), (req, res) => {
  const { outputFormat, quality, inputPath, outputPath: requestedOutputPath } = req.body;
  
  // Support both uploaded file and local file path
  let srcPath;
  let originalName;
  if (req.file) {
    srcPath = req.file.path;
    originalName = req.file.originalname;
  } else if (inputPath) {
    srcPath = inputPath;
    originalName = path.basename(inputPath);
  } else {
    return res.status(400).json({ error: 'No file provided' });
  }

  if (!outputFormat) return res.status(400).json({ error: 'Output format required' });

  const id = uuidv4();
  const baseName = path.parse(originalName).name;
  const outputFileName = `${baseName}.${outputFormat}`;
  const outputDir = requestedOutputPath || defaultDownloadPath;
  if (!fs.existsSync(outputDir) || !fs.statSync(outputDir).isDirectory()) {
    return res.status(400).json({ error: 'Output folder does not exist' });
  }
  let outputPath = path.join(outputDir, outputFileName);

  // Avoid overwriting
  let counter = 1;
  while (fs.existsSync(outputPath)) {
    outputPath = path.join(outputDir, `${baseName} (${counter}).${outputFormat}`);
    counter++;
  }

  const ffmpegBin = getFFmpegPath();
  if (!ffmpegBin || !fs.existsSync(ffmpegBin)) return toolUnavailable(res, 'FFmpeg');
  const args = ['-i', srcPath, '-y'];

  // Detect file type category from extension
  const inputExt = path.extname(originalName).toLowerCase().slice(1);
  const videoExts = ['mp4','mkv','avi','mov','wmv','flv','webm','m4v','3gp','ts','m2ts'];
  const audioExts = ['mp3','wav','m4a','aac','ogg','flac','wma','opus','alac'];
  const imageExts = ['png','jpg','jpeg','gif','bmp','tiff','tif','webp','svg','ico','heic','heif','avif'];

  const isVideo = videoExts.includes(inputExt);
  const isAudio = audioExts.includes(inputExt);
  const isImage = imageExts.includes(inputExt);

  const qualityLevel = quality || 'high';

  if (isVideo) {
    const outputIsVideo = videoExts.includes(outputFormat);
    const outputIsAudio = audioExts.includes(outputFormat);

    if (outputIsAudio) {
      // Extract audio from video
      args.push('-vn');
      if (outputFormat === 'mp3') {
        const br = qualityLevel === 'high' ? '320k' : qualityLevel === 'medium' ? '192k' : '128k';
        args.push('-c:a', 'libmp3lame', '-b:a', br);
      } else if (outputFormat === 'wav') {
        args.push('-c:a', 'pcm_s16le', '-ar', '44100');
      } else if (outputFormat === 'm4a' || outputFormat === 'aac') {
        const br = qualityLevel === 'high' ? '256k' : qualityLevel === 'medium' ? '192k' : '128k';
        args.push('-c:a', 'aac', '-b:a', br);
      } else if (outputFormat === 'ogg') {
        args.push('-c:a', 'libvorbis', '-q:a', qualityLevel === 'high' ? '8' : qualityLevel === 'medium' ? '5' : '3');
      } else if (outputFormat === 'flac') {
        args.push('-c:a', 'flac');
      } else if (outputFormat === 'opus') {
        const br = qualityLevel === 'high' ? '128k' : qualityLevel === 'medium' ? '96k' : '64k';
        args.push('-c:a', 'libopus', '-b:a', br);
      }
    } else if (outputIsVideo) {
      // Video to video
      if (outputFormat === 'mp4') {
        const crf = qualityLevel === 'high' ? '18' : qualityLevel === 'medium' ? '23' : '28';
        args.push('-c:v', 'libx264', '-preset', 'medium', '-crf', crf, '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart');
      } else if (outputFormat === 'webm') {
        const crf = qualityLevel === 'high' ? '20' : qualityLevel === 'medium' ? '30' : '40';
        args.push('-c:v', 'libvpx-vp9', '-crf', crf, '-b:v', '0', '-c:a', 'libopus', '-b:a', '128k');
      } else if (outputFormat === 'mkv') {
        const crf = qualityLevel === 'high' ? '18' : qualityLevel === 'medium' ? '23' : '28';
        args.push('-c:v', 'libx264', '-preset', 'medium', '-crf', crf, '-c:a', 'aac', '-b:a', '192k');
      } else if (outputFormat === 'avi') {
        args.push('-c:v', 'libx264', '-c:a', 'mp3', '-b:a', '192k');
      } else if (outputFormat === 'mov') {
        const crf = qualityLevel === 'high' ? '18' : qualityLevel === 'medium' ? '23' : '28';
        args.push('-c:v', 'libx264', '-preset', 'medium', '-crf', crf, '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k');
      } else {
        args.push('-c:v', 'libx264', '-c:a', 'aac');
      }
    }
  } else if (isAudio) {
    if (outputFormat === 'mp3') {
      const br = qualityLevel === 'high' ? '320k' : qualityLevel === 'medium' ? '192k' : '128k';
      args.push('-c:a', 'libmp3lame', '-b:a', br);
    } else if (outputFormat === 'wav') {
      args.push('-c:a', 'pcm_s16le', '-ar', '44100');
    } else if (outputFormat === 'm4a' || outputFormat === 'aac') {
      const br = qualityLevel === 'high' ? '256k' : qualityLevel === 'medium' ? '192k' : '128k';
      args.push('-c:a', 'aac', '-b:a', br);
    } else if (outputFormat === 'ogg') {
      args.push('-c:a', 'libvorbis', '-q:a', qualityLevel === 'high' ? '8' : qualityLevel === 'medium' ? '5' : '3');
    } else if (outputFormat === 'flac') {
      args.push('-c:a', 'flac');
    } else if (outputFormat === 'opus') {
      const br = qualityLevel === 'high' ? '128k' : qualityLevel === 'medium' ? '96k' : '64k';
      args.push('-c:a', 'libopus', '-b:a', br);
    }
  } else if (isImage) {
    if (outputFormat === 'jpg' || outputFormat === 'jpeg') {
      const q = qualityLevel === 'high' ? '2' : qualityLevel === 'medium' ? '5' : '10';
      args.push('-q:v', q);
    } else if (outputFormat === 'webp') {
      const q = qualityLevel === 'high' ? '90' : qualityLevel === 'medium' ? '75' : '50';
      args.push('-quality', q);
    } else if (outputFormat === 'png') {
      // PNG is lossless
    } else if (outputFormat === 'bmp') {
      // BMP is lossless
    } else if (outputFormat === 'gif') {
      args.push('-vf', 'fps=10,scale=320:-1:flags=lanczos');
    }
  }

  // Add progress output
  args.push('-progress', 'pipe:1', outputPath);

  const proc = spawn(ffmpegBin, args, { env: getSpawnEnv() });
  const conversion = {
    id,
    inputName: originalName,
    outputName: outputFileName,
    outputFormat,
    status: 'converting',
    progress: 0,
    startedAt: new Date().toISOString(),
    error: null
  };

  activeConversions.set(id, { proc, info: conversion });
  proc.once('error', (err) => {
    activeConversions.delete(id);
    conversion.status = 'error';
    conversion.error = `Unable to start FFmpeg: ${err.message}`;
    broadcast({ type: 'convert-progress', id, conversion: { ...conversion } });
  });

  // Get input file duration for progress calc
  let totalDuration = 0;
  const probeProc = spawn(ffmpegBin, ['-i', srcPath, '-hide_banner'], { env: getSpawnEnv() });
  let probeOutput = '';
  probeProc.stderr.on('data', d => probeOutput += d.toString());
  probeProc.once('error', () => {});
  probeProc.on('close', () => {
    const durMatch = probeOutput.match(/Duration: (\d+):(\d+):(\d+)\.(\d+)/);
    if (durMatch) {
      totalDuration = parseInt(durMatch[1]) * 3600 + parseInt(durMatch[2]) * 60 + parseInt(durMatch[3]) + parseFloat('0.' + durMatch[4]);
    }
  });

  proc.stdout.on('data', (data) => {
    const line = data.toString();
    const timeMatch = line.match(/out_time_us=(\d+)/);
    if (timeMatch && totalDuration > 0) {
      const currentSec = parseInt(timeMatch[1]) / 1000000;
      conversion.progress = Math.min(99, Math.round((currentSec / totalDuration) * 100));
      broadcast({ type: 'convert-progress', id, conversion: { ...conversion } });
    }
    const progressMatch = line.match(/progress=(\w+)/);
    if (progressMatch && progressMatch[1] === 'end') {
      conversion.progress = 100;
    }
  });

  proc.stderr.on('data', (data) => {
    const line = data.toString();
    // Also try to get duration from stderr
    if (totalDuration === 0) {
      const durMatch = line.match(/Duration: (\d+):(\d+):(\d+)\.(\d+)/);
      if (durMatch) {
        totalDuration = parseInt(durMatch[1]) * 3600 + parseInt(durMatch[2]) * 60 + parseInt(durMatch[3]) + parseFloat('0.' + durMatch[4]);
      }
    }
  });

  proc.on('close', (code) => {
    activeConversions.delete(id);
    // Clean up uploaded temp file
    if (req.file && fs.existsSync(srcPath)) {
      try { fs.unlinkSync(srcPath); } catch (e) {}
    }

    if (code === 0) {
      conversion.status = 'done';
      conversion.progress = 100;
      conversion.finishedAt = new Date().toISOString();
      conversion.outputPath = outputPath;
    } else {
      conversion.status = 'error';
      conversion.error = 'Conversion failed';
    }
    broadcast({ type: 'convert-progress', id, conversion: { ...conversion } });
  });

  res.json({ id, message: 'Conversion started', conversion });
});

// Cancel conversion
app.post('/api/cancel-convert/:id', (req, res) => {
  const entry = activeConversions.get(req.params.id);
  if (!entry) return res.status(404).json({ error: 'Conversion not found' });
  entry.proc.kill();
  entry.info.status = 'cancelled';
  activeConversions.delete(req.params.id);
  broadcast({ type: 'convert-progress', id: req.params.id, conversion: { ...entry.info } });
  res.json({ message: 'Cancelled' });
});

let serverPort = null;
const PORT = 0;
function startServer() {
  if (server.listening) return Promise.resolve(serverPort || server.address().port);
  getStateStore();
  startDohProxy();
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(PORT, '127.0.0.1', () => {
      serverPort = server.address().port;
      console.log(`\nNuutapao Downloader running at http://127.0.0.1:${serverPort}\n`);
      console.log(`📁 Downloads saved to: ${defaultDownloadPath}\n`);

      // Defer background checks to avoid blocking/slowing down initial launch
      setTimeout(() => {
        checkYtDlpVersion();
        const lastChecked = new Date(getStateStore().get().engine.lastChecked || 0).getTime();
        if (!lastChecked || Date.now() - lastChecked >= 24 * 60 * 60 * 1000) {
          updateYtDlp();
        }
      }, 3000);

      resolve(serverPort);
    });
  });
}

function stopServer() {
  return new Promise((resolve) => {
    try {
      wss.close(() => {});
      if (dohProxyStarted) {
        dohProxy.close(() => {});
        dohProxyStarted = false;
      }
      server.close(() => {
        serverPort = null;
        resolve();
      });
    } catch {
      resolve();
    }
  });
}

module.exports = {
  configureRuntime: (config) => { runtimeConfig = { ...runtimeConfig, ...config }; },
  getPort: () => serverPort,
  setDialog: (d) => electronDialog = d,
  startServer,
  stopServer,
  flushState: () => stateStore?.save(),
  getAppState: () => getStateStore().get(),
  patchAppState: (partial) => getStateStore().patch(partial),
  buildAccessArgs,
  buildPlatformArgs,
  getSpawnEnv,
  resolveProxyUrl,
  validateAccessSettings,
  classifyYtDlpError,
  extractCleanUrl,
  ensureNetscapeCookieFile
};
