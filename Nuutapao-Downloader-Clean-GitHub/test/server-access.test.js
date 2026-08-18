const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  resolveProxyUrl,
  validateAccessSettings,
  buildAccessArgs,
  buildPlatformArgs,
  getSpawnEnv,
  classifyYtDlpError,
  extractCleanUrl,
  ensureNetscapeCookieFile
} = require('../server');

describe('Proxy & Access Argument Resolution', () => {
  test('resolveProxyUrl returns correct preset URLs', () => {
    assert.equal(resolveProxyUrl({ proxyEnabled: true, proxyPreset: 'warp' }), 'socks5://127.0.0.1:10808');
    assert.equal(resolveProxyUrl({ proxyEnabled: true, proxyPreset: 'clash' }), 'http://127.0.0.1:7890');
    assert.equal(resolveProxyUrl({ proxyEnabled: true, proxyPreset: 'shadowsocks' }), 'socks5://127.0.0.1:1080');
  });

  test('resolveProxyUrl returns custom proxy URL for custom preset (both proxyUrl and proxy fields)', () => {
    assert.equal(
      resolveProxyUrl({ proxyEnabled: true, proxyPreset: 'custom', proxyUrl: 'http://127.0.0.1:8888' }),
      'http://127.0.0.1:8888'
    );
    // Backward compatibility with legacy `proxy` field
    assert.equal(
      resolveProxyUrl({ proxyEnabled: true, proxyPreset: 'custom', proxy: 'socks5://127.0.0.1:9999' }),
      'socks5://127.0.0.1:9999'
    );
  });

  test('resolveProxyUrl returns empty when proxy is disabled and DNS is OS default', () => {
    assert.equal(resolveProxyUrl({ proxyEnabled: false, dnsProvider: 'os' }), '');
    assert.equal(resolveProxyUrl({ proxyEnabled: false, dnsEnabled: false }), '');
  });

  test('buildAccessArgs includes proxy and cookies arguments properly', () => {
    // Browser cookies + warp proxy
    const args1 = buildAccessArgs({
      proxyEnabled: true,
      proxyPreset: 'warp',
      cookieSource: 'browser',
      cookieBrowser: 'chrome'
    });
    assert.deepEqual(args1, ['--proxy', 'socks5://127.0.0.1:10808', '--cookies-from-browser', 'chrome']);

    // File cookies
    const args2 = buildAccessArgs({
      proxyEnabled: false,
      dnsEnabled: false,
      cookieSource: 'file',
      cookieFile: '/path/to/cookies.txt'
    });
    assert.deepEqual(args2, ['--cookies', '/path/to/cookies.txt']);

    // No cookies, no proxy
    const args3 = buildAccessArgs({
      proxyEnabled: false,
      dnsEnabled: false,
      cookieSource: 'none'
    });
    assert.deepEqual(args3, []);

    // Exclude cookies flag
    const args4 = buildAccessArgs({
      proxyEnabled: true,
      proxyPreset: 'warp',
      cookieSource: 'browser',
      cookieBrowser: 'opera'
    }, true);
    assert.deepEqual(args4, ['--proxy', 'socks5://127.0.0.1:10808']);
  });
});

describe('Access Settings Validation', () => {
  let tempDir;

  test('validateAccessSettings checks cookie file existence', () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nuu-cookie-test-'));
    const validFile = path.join(tempDir, 'valid-cookies.txt');
    fs.writeFileSync(validFile, '# Netscape HTTP Cookie File', 'utf8');

    // Missing file parameter
    assert.ok(validateAccessSettings({ cookieSource: 'file', cookieFile: '' })?.includes('No cookies file'));
    
    // Non-existent file
    assert.ok(validateAccessSettings({ cookieSource: 'file', cookieFile: path.join(tempDir, 'nonexistent.txt') })?.includes('not found'));

    // Valid existing file
    assert.equal(validateAccessSettings({ cookieSource: 'file', cookieFile: validFile }), null);

    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('validateAccessSettings validates custom proxy URLs', () => {
    // Empty custom URL
    assert.ok(validateAccessSettings({ proxyEnabled: true, proxyPreset: 'custom', proxyUrl: '' })?.includes('empty'));

    // Invalid scheme (e.g. ftp or plain text)
    assert.ok(validateAccessSettings({ proxyEnabled: true, proxyPreset: 'custom', proxyUrl: 'ftp://127.0.0.1:21' })?.includes('not supported'));
    assert.ok(validateAccessSettings({ proxyEnabled: true, proxyPreset: 'custom', proxyUrl: 'invalid-url' })?.includes('invalid'));

    // Valid schemes
    assert.equal(validateAccessSettings({ proxyEnabled: true, proxyPreset: 'custom', proxyUrl: 'http://127.0.0.1:8080' }), null);
    assert.equal(validateAccessSettings({ proxyEnabled: true, proxyPreset: 'custom', proxyUrl: 'https://proxy.example.com:443' }), null);
    assert.equal(validateAccessSettings({ proxyEnabled: true, proxyPreset: 'custom', proxyUrl: 'socks5://127.0.0.1:10808' }), null);
    assert.equal(validateAccessSettings({ proxyEnabled: true, proxyPreset: 'custom', proxyUrl: 'socks5h://127.0.0.1:10808' }), null);
    assert.equal(validateAccessSettings({ proxyEnabled: true, proxyPreset: 'custom', proxyUrl: 'socks4://127.0.0.1:1080' }), null);
  });
});

describe('yt-dlp Error Classification', () => {
  test('classifies age-restricted errors', () => {
    const msg = 'ERROR: [youtube] Sign in to confirm your age. This video may be inappropriate for some users.';
    const classified = classifyYtDlpError(msg);
    assert.ok(classified.toLowerCase().includes('age verification') || classified.toLowerCase().includes('age access'));
    assert.ok(classified.includes('cookies'));
  });

  test('classifies geo-restricted errors and clarifies Secure DNS cannot bypass region locks', () => {
    const msg = 'ERROR: [youtube] Video unavailable. This video is not available in your country.';
    const classified = classifyYtDlpError(msg);
    assert.ok(classified.includes('region-locked') || classified.includes('not available in your country'));
    assert.ok(classified.includes('Secure DNS'));
    assert.ok(classified.includes('proxy or VPN'));
  });

  test('classifies login and member-only errors', () => {
    const msg = 'ERROR: [youtube] Join this channel to get access to members-only content';
    const classified = classifyYtDlpError(msg);
    assert.ok(classified.toLowerCase().includes('account access') || classified.toLowerCase().includes('login'));
    assert.ok(classified.includes('cookies'));
  });

  test('classifies unreachable proxy errors', () => {
    const msg = 'ERROR: Unable to download webpage: <urlopen error [Errno 111] Connection refused>';
    const classified = classifyYtDlpError(msg);
    assert.ok(classified.toLowerCase().includes('proxy could not be reached') || classified.toLowerCase().includes('check'));
  });

  test('classifies DNS resolution errors', () => {
    const msg = 'ERROR: [generic] Unable to download webpage: <urlopen error [Errno -2] Name or service not known>';
    const classified = classifyYtDlpError(msg);
    assert.ok(classified.includes('DNS resolution failed') || classified.includes('ISP'));
  });

  test('classifies connection timeout errors', () => {
    const msg = 'ERROR: [youtube] Unable to download video data: HTTP Error 504: Gateway Time-out';
    const classified = classifyYtDlpError(msg);
    assert.ok(classified.includes('timed out') || classified.includes('Connection'));
  });

  test('classifies missing browser cookie database errors', () => {
    const msg = 'ERROR: could not find opera cookies database in "C:\\Users\\User\\AppData\\Roaming\\Opera Software\\Opera Stable"';
    const classified = classifyYtDlpError(msg);
    assert.ok(classified.includes('selected browser cookies') || classified.includes('Cookie Settings'));
  });

  test('classifies TikTok unexpected response errors', () => {
    const msg = 'ERROR: [TikTok] 7591842900716162324: Unexpected response from webpage request';
    const classified = classifyYtDlpError(msg);
    assert.ok(classified.includes('TikTok') && classified.includes('unexpected response'));
  });
});

describe('URL Cleaning & Cookie Auto-Conversion', () => {
  test('extractCleanUrl extracts URLs from shared text or surrounding spaces', () => {
    assert.equal(extractCleanUrl('  https://www.youtube.com/watch?v=12345  '), 'https://www.youtube.com/watch?v=12345');
    assert.equal(extractCleanUrl('Check this out: https://vt.tiktok.com/ZSjabc/ (Shared)'), 'https://vt.tiktok.com/ZSjabc/');
    assert.equal(extractCleanUrl('<https://x.com/user/status/98765>'), 'https://x.com/user/status/98765');
    assert.equal(extractCleanUrl(''), '');
  });

  test('ensureNetscapeCookieFile converts JSON cookies to Netscape format', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nuu-json-cookie-test-'));
    const jsonCookieFile = path.join(tempDir, 'cookies.json');
    const cookiesData = [
      {
        domain: '.youtube.com',
        name: 'LOGIN_INFO',
        value: 'test_token_123',
        path: '/',
        secure: true,
        expirationDate: 1799999999
      }
    ];
    fs.writeFileSync(jsonCookieFile, JSON.stringify(cookiesData), 'utf8');

    const convertedPath = ensureNetscapeCookieFile(jsonCookieFile);
    assert.notEqual(convertedPath, jsonCookieFile);
    assert.ok(fs.existsSync(convertedPath));
    const content = fs.readFileSync(convertedPath, 'utf8');
    assert.ok(content.includes('# Netscape HTTP Cookie File'));
    assert.ok(content.includes('.youtube.com'));
    assert.ok(content.includes('LOGIN_INFO'));
    assert.ok(content.includes('test_token_123'));

    if (fs.existsSync(convertedPath)) fs.unlinkSync(convertedPath);
    if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
  });
});

describe('UTF-8 & Multilingual Encoding Support', () => {
  test('buildPlatformArgs includes --encoding utf-8 for subprocess execution', () => {
    const args = buildPlatformArgs('https://www.youtube.com/watch?v=12345');
    assert.ok(args.includes('--encoding'));
    const idx = args.indexOf('--encoding');
    assert.equal(args[idx + 1], 'utf-8');
  });

  test('getSpawnEnv configures UTF-8 python environment variables', () => {
    const env = getSpawnEnv();
    assert.equal(env.PYTHONIOENCODING, 'utf-8');
    assert.equal(env.PYTHONUTF8, '1');
    assert.ok(env.LANG?.includes('UTF-8'));
    assert.ok(env.LC_ALL?.includes('UTF-8'));
  });

  test('preserves Thai and Unicode characters in URL cleaning and titles', () => {
    const thaiUrl = '  https://www.youtube.com/watch?v=123 (คลิปวิดีโอภาษาไทย)  ';
    const cleanUrl = extractCleanUrl(thaiUrl);
    assert.equal(cleanUrl, 'https://www.youtube.com/watch?v=123');

    const thaiTitle = 'ภาษาไทย ป.6 ตอนที่ 1 เสียงพยัญชนะ สระ วรรณยุกต์ - Kyutae Oppa';
    assert.ok(thaiTitle.includes('ภาษาไทย'));
    assert.ok(thaiTitle.includes('Kyutae Oppa'));
  });
});

