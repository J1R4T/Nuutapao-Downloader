/* ===== Nuutapao Downloader — Frontend Logic ===== */

// ── i18n Translations ──────────────────────────────────────────────────────
const translations = {
  en: {
    appNameShort: 'Nuutapao',
    appNameSub: 'Downloader',
    navHome: 'Home',
    navConverter: 'Converter',
    navHistory: 'History',
    navSettings: 'Settings',
    navAbout: 'About',
    headerDesc: 'Download videos from any platform easily! 💖',
    converterTitle: '🔄 File Converter',
    converterDesc: 'Convert video, audio, and image files to any format with ease.',
    converterDropTitle: 'Drag & drop files here',
    converterDropSub: 'or click to browse files',
    converterEmpty: 'Add files to start converting',
    converterStartAll: 'Convert All',
    converterConverting: 'Converting...',
    converterDone: 'Done!',
    converterError: 'Error',
    converterCancelled: 'Cancelled',
    toastConvertStarted: 'Conversion started! 🔄',
    toastConvertDone: 'Conversion complete! ✅',
    toastConvertError: 'Conversion failed ❌',
    toastFilesAdded: 'Files added! 📂',
    qualityHigh: 'High',
    qualityMedium: 'Medium',
    qualityLow: 'Low',
    urlPlaceholder: 'Paste any video link here (YouTube, TikTok, IG, X...)',
    btnDownload: 'Download',
    labelFormat: 'Format',
    labelQuality: 'Quality',
    qualityBest: 'Best Available (Auto)',
    labelSaveTo: 'Save to',
    btnBrowse: 'Browse',
    labelThumbnail: 'Thumbnail',
    recentTitle: '🕒 Recent Downloads',
    btnClearAll: 'Clear All',
    emptyRecent: 'No downloads yet. Paste a link to get started!',
    historyTitle: '🕒 Download History',
    historyDesc: 'Browse through your complete list of previously downloaded media.',
    historySearchPlaceholder: 'Search history...',
    emptyHistory: 'No download history available yet.',
    settingsTitle: '⚙️ Settings',
    settingsDesc: 'Configure Nuutapao Downloader preferences and customize your download experience.',
    settingsAppearance: '🎨 Appearance',
    settingDarkTheme: 'Dark Theme',
    settingDarkThemeDesc: 'Switch between light and dark modes',
    settingZoomLevel: 'Zoom Level',
    settingZoomLevelDesc: 'Adjust the interface size',
    settingsLanguage: '🌐 Language',
    settingLanguageTitle: 'Interface Language',
    settingLanguageDesc: 'Choose the language for the interface',
    settingsHistoryMgmt: '📋 History Management',
    settingAutoDeleteTitle: 'Auto-delete History',
    settingAutoDeleteDesc: 'Automatically remove history older than selected days',
    autoDeleteNever: 'Never',
    autoDelete1: 'After 1 day',
    autoDelete3: 'After 3 days',
    autoDelete7: 'After 7 days',
    autoDelete14: 'After 14 days',
    autoDelete30: 'After 30 days',
    settingClearAllTitle: 'Clear All History',
    settingClearAllDesc: 'Remove all download history records permanently',
    btnDeleteAll: '🗑️ Delete All',
    settingsWindow: '🖥️ Application Window',
    settingAlwaysOnTop: 'Always on Top',
    settingAlwaysOnTopDesc: 'Keep Nuutapao Downloader window above all other windows',
    settingsCookies: '🍪 Cookies',
    settingsCookiesDesc: 'Use cookies from a signed-in account with access permissions to download private videos, age-restricted contents, or member-only videos.',
    settingCookieSource: 'Cookies Source',
    settingCookieSourceDesc: 'Choose whether to use browser cookies, custom file, or none',
    cookieNone: 'None (No cookies)',
    cookieBrowser: 'Use Browser Cookies',
    cookieFile: 'Use cookies.txt File',
    settingSelectBrowser: 'Select Browser',
    settingSelectBrowserDesc: 'yt-dlp will import cookies from the selected browser',
    settingCookieFilePath: 'Cookies File Path',
    settingCookieFilePathDesc: 'Select your custom cookies.txt file',
    browserCookieTipText: '<b>Browser Tip:</b> If downloading age-restricted videos, make sure your browser is completely closed or use a <code>cookies.txt</code> file to avoid database locking.',
    fileCookieTipText: '<b>Recommended:</b> Export YouTube cookies via <i>Cookie-Editor</i> or <i>Get cookies.txt LOCALLY</i> browser extension for 100% reliable age-restricted & private downloads!',
    aboutTitle: '🦊 About Nuutapao Downloader™',
    aboutSubtitle: 'Sleek, adorable, and powerful frontend for yt-dlp.',
    aboutDesc: 'This app was created by Nuutapao and is exclusively for Nuutapao.',
    followTitle: '✨ Follow me :',
    featureUltraFast: 'Ultra Fast Downloads',
    featureUltraFastDesc: 'Spawns highly-optimized multi-threaded yt-dlp processes.',
    featureAesthetics: 'Tailored Aesthetics',
    featureAestheticsDesc: 'Support for Light/Dark themes and interactive visual responses.',
    featureCookie: 'Secure Cookie Handling',
    featureCookieDesc: 'Supports importing cookies directly from browsers or using Netscape format cookies files.',
    btnCancel: 'Cancel',
    btnConfirm: 'Confirm',
    toastDownloadStarted: 'Download started! 🚀',
    toastPasteLink: 'Please paste a video link first! 💖',
    platformOther: 'Other',
    toastCancelled: 'Cancelled',
    toastCannotBrowse: 'Cannot open folder browser',
    toastCannotBrowseCookie: 'Cannot browse for cookies file',
    toastHistoryCleared: 'All history cleared! 🧹',
    settingsEngine: '🚀 Downloader Engine (yt-dlp)',
    settingsEngineDesc: 'yt-dlp handles video extraction. Keeps itself updated automatically to fix website changes.',
    btnUpdateEngine: 'Update Engine',
    toastYtdlpUpdated: 'yt-dlp updated to the latest version! ✨',
    toastYtdlpUpToDate: 'yt-dlp is already up to date! ✅',
    toastItemDeleted: 'Item removed from history',
    toastRedownloadStarted: 'Re-download started! 🔄',
    confirmClearTitle: 'Clear All History?',
    confirmClearDesc: 'This will permanently delete all your download history records. This action cannot be undone.',
    confirmDeleteTitle: 'Delete this item?',
    confirmDeleteDesc: 'This record will be permanently removed from your history.',
    statusCompleted: 'Completed',
    statusError: 'Error',
    settingsDns: '🔒 Secure DNS (DoH)',
    settingsDnsDesc: 'Use Secure DNS (DoH) to resolve domains and bypass ISP domain blocks. Note: Secure DNS cannot bypass region-locked content.',
    settingEnableDns: 'Use Secure DNS (DoH)',
    settingEnableDnsDesc: 'Encrypt and resolve DNS queries via Cloudflare, Google, or OpenDNS',
    settingSelectDnsProvider: 'Select DNS provider',
    settingSelectDnsProviderDesc: 'Choose a secure DNS-over-HTTPS provider',
    settingCustomDnsUrl: 'Custom DoH Provider URL',
    settingCustomDnsUrlDesc: 'Format: https://dns.example.com/dns-query',
    customDnsPlaceholder: 'https://1.1.1.1/dns-query',
    settingsProxy: '🌐 Network Proxy & VPN',
    settingsProxyDesc: 'Route downloads through a permitted proxy or VPN to bypass network restrictions or access region-locked content in supported regions.',
    settingEnableProxy: 'Enable Network Proxy / Bypass',
    settingEnableProxyDesc: 'Route downloads through Proxy or Local Server',
    settingProxyPreset: 'Proxy Preset',
    settingProxyPresetDesc: 'Select a pre-configured local proxy server or custom URL',
    settingProxyUrl: 'Custom Proxy Server URL',
    settingProxyUrlDesc: 'Format: http://127.0.0.1:1080 or socks5://127.0.0.1:10808',
    proxyPlaceholder: 'e.g. http://127.0.0.1:1080 or socks5://127.0.0.1:10808',
    proxyNoticeText: 'Select a Proxy preset above or use Cloudflare WARP/VPN to route traffic or bypass network restrictions.',
  },
  th: {
    appNameShort: 'Nuutapao',
    appNameSub: 'ตัวดาวน์โหลด',
    navHome: 'หน้าหลัก',
    navConverter: 'ตัวแปลงไฟล์',
    navHistory: 'ประวัติ',
    navSettings: 'ตั้งค่า',
    navAbout: 'เกี่ยวกับ',
    headerDesc: 'ดาวน์โหลดวิดีโอจากทุกแพลตฟอร์มได้ง่ายๆ! 💖',
    converterTitle: '🔄 ตัวแปลงไฟล์',
    converterDesc: 'แปลงไฟล์วิดีโอ เสียง และรูปภาพเป็นทุกนามสกุลได้ง่ายๆ',
    converterDropTitle: 'ลากไฟล์มาวางที่นี่',
    converterDropSub: 'หรือคลิกเพื่อเลือกไฟล์',
    converterEmpty: 'เพิ่มไฟล์เพื่อเริ่มแปลง',
    converterStartAll: 'แปลงทั้งหมด',
    converterConverting: 'กำลังแปลง...',
    converterDone: 'เสร็จสิ้น!',
    converterError: 'ผิดพลาด',
    converterCancelled: 'ยกเลิกแล้ว',
    toastConvertStarted: 'เริ่มแปลงไฟล์แล้ว! 🔄',
    toastConvertDone: 'แปลงไฟล์เสร็จสิ้น! ✅',
    toastConvertError: 'แปลงไฟล์ล้มเหลว ❌',
    toastFilesAdded: 'เพิ่มไฟล์แล้ว! 📂',
    qualityHigh: 'สูง',
    qualityMedium: 'กลาง',
    qualityLow: 'ต่ำ',
    urlPlaceholder: 'วางลิงก์วิดีโอที่นี่ (YouTube, TikTok, IG, X...)',
    btnDownload: 'ดาวน์โหลด',
    labelFormat: 'รูปแบบ',
    labelQuality: 'คุณภาพ',
    qualityBest: 'ดีที่สุด (อัตโนมัติ)',
    labelSaveTo: 'บันทึกไปที่',
    btnBrowse: 'เลือก',
    labelThumbnail: 'ภาพปก',
    recentTitle: '🕒 ดาวน์โหลดล่าสุด',
    btnClearAll: 'ล้างทั้งหมด',
    emptyRecent: 'ยังไม่มีรายการดาวน์โหลด วางลิงก์เพื่อเริ่มต้น!',
    historyTitle: '🕒 ประวัติการดาวน์โหลด',
    historyDesc: 'ดูรายการสื่อที่ดาวน์โหลดก่อนหน้าทั้งหมดของคุณ',
    historySearchPlaceholder: 'ค้นหาประวัติ...',
    emptyHistory: 'ยังไม่มีประวัติการดาวน์โหลด',
    settingsTitle: '⚙️ ตั้งค่า',
    settingsDesc: 'ปรับแต่งการตั้งค่า Nuutapao Downloader ตามความต้องการของคุณ',
    settingsAppearance: '🎨 ธีม',
    settingDarkTheme: 'ธีมมืด',
    settingDarkThemeDesc: 'สลับระหว่างโหมดสว่างและมืด',
    settingZoomLevel: 'ระดับการซูม',
    settingZoomLevelDesc: 'ปรับขนาดการแสดงผลของหน้าจอแอป',
    settingsLanguage: '🌐 ภาษา',
    settingLanguageTitle: 'ภาษาของแอป',
    settingLanguageDesc: 'เลือกภาษาสำหรับหน้าจอการใช้งาน',
    settingsHistoryMgmt: '📋 จัดการประวัติ',
    settingAutoDeleteTitle: 'ลบประวัติอัตโนมัติ',
    settingAutoDeleteDesc: 'ลบประวัติที่เก่ากว่าจำนวนวันที่เลือกโดยอัตโนมัติ',
    autoDeleteNever: 'ไม่เลย',
    autoDelete1: 'หลังจาก 1 วัน',
    autoDelete3: 'หลังจาก 3 วัน',
    autoDelete7: 'หลังจาก 7 วัน',
    autoDelete14: 'หลังจาก 14 วัน',
    autoDelete30: 'หลังจาก 30 วัน',
    settingClearAllTitle: 'ล้างประวัติทั้งหมด',
    settingClearAllDesc: 'ลบประวัติการดาวน์โหลดทั้งหมดอย่างถาวร',
    btnDeleteAll: '🗑️ ลบทั้งหมด',
    settingsWindow: '🖥️ หน้าต่างแอป',
    settingAlwaysOnTop: 'อยู่ด้านบนเสมอ',
    settingAlwaysOnTopDesc: 'ให้หน้าต่าง Nuutapao Downloader อยู่เหนือหน้าต่างอื่นทั้งหมด',
    settingsCookies: '🍪 คุกกี้',
    settingsCookiesDesc: 'ใช้คุกกี้จากบัญชีที่มีสิทธิ์เข้าถึง เพื่อดาวน์โหลดวิดีโอส่วนตัว วิดีโอที่จำกัดอายุ หรือวิดีโอสำหรับสมาชิก',
    settingCookieSource: 'แหล่งที่มาของคุกกี้',
    settingCookieSourceDesc: 'เลือกว่าจะใช้คุกกี้จากเบราว์เซอร์ ไฟล์ หรือไม่ใช้',
    cookieNone: 'ไม่ใช้ (ไม่มีคุกกี้)',
    cookieBrowser: 'ใช้คุกกี้จากเบราว์เซอร์',
    cookieFile: 'ใช้ไฟล์ cookies.txt',
    settingSelectBrowser: 'เลือกเบราว์เซอร์',
    settingSelectBrowserDesc: 'yt-dlp จะนำเข้าคุกกี้จากเบราว์เซอร์ที่เลือก',
    settingCookieFilePath: 'พาธไฟล์คุกกี้',
    settingCookieFilePathDesc: 'เลือกไฟล์ cookies.txt ของคุณ',
    browserCookieTipText: '<b>คำแนะนำเบราว์เซอร์:</b> สำหรับวิดีโอจำกัดอายุ กรุณาปิดเบราว์เซอร์ให้สนิทก่อนดาวน์โหลด หรือใช้ไฟล์ <code>cookies.txt</code> เพื่อป้องกันฐานข้อมูลถูกล็อก',
    fileCookieTipText: '<b>แนะนำ:</b> ส่งออกคุกกี้ YouTube ด้วยส่วนเสริม <i>Cookie-Editor</i> หรือ <i>Get cookies.txt LOCALLY</i> เพื่อดาวน์โหลดวิดีโอจำกัดอายุและวิดีโอส่วนตัวได้ 100%!',
    aboutTitle: '🦊 เกี่ยวกับ Nuutapao Downloader™',
    aboutSubtitle: 'สวยงาม น่ารัก และทรงพลัง สำหรับ yt-dlp',
    aboutDesc: 'This app was created by Nuutapao and is exclusively for Nuutapao.',
    followTitle: '✨ Follow me :',
    featureUltraFast: 'ดาวน์โหลดเร็วสุดๆ',
    featureUltraFastDesc: 'เรียกใช้กระบวนการ yt-dlp แบบ multi-threaded ที่ปรับแต่งมาอย่างดี',
    featureAesthetics: 'ธีมสวยงาม',
    featureAestheticsDesc: 'รองรับธีมสว่าง/มืด และการตอบสนองทางภาพแบบโต้ตอบ',
    featureCookie: 'จัดการคุกกี้อย่างปลอดภัย',
    featureCookieDesc: 'รองรับการนำเข้าคุกกี้โดยตรงจากเบราว์เซอร์ หรือใช้ไฟล์คุกกี้รูปแบบ Netscape',
    btnCancel: 'ยกเลิก',
    btnConfirm: 'ยืนยัน',
    toastDownloadStarted: 'เริ่มดาวน์โหลดแล้ว! 🚀',
    toastPasteLink: 'กรุณาวางลิงก์วิดีโอก่อน! 💖',
    platformOther: 'อื่นๆ',
    toastCancelled: 'ยกเลิกแล้ว',
    toastCannotBrowse: 'ไม่สามารถเปิดตัวเลือกโฟลเดอร์ได้',
    toastCannotBrowseCookie: 'ไม่สามารถเลือกไฟล์คุกกี้ได้',
    toastHistoryCleared: 'ล้างประวัติทั้งหมดแล้ว! 🧹',
    settingsEngine: '🚀 ตัวดาวน์โหลดหลัก (yt-dlp)',
    settingsEngineDesc: 'yt-dlp ทำหน้าที่ดึงไฟล์วิดีโอจากเว็บต่างๆ ระบบจะอัปเดตให้อัตโนมัติเมื่อเว็บเปลี่ยนโครงสร้าง',
    btnUpdateEngine: 'อัปเดตเดี๋ยวนี้',
    toastYtdlpUpdated: 'อัปเดต yt-dlp เป็นเวอร์ชันล่าสุดแล้ว! ✨',
    toastYtdlpUpToDate: 'yt-dlp เป็นเวอร์ชันล่าสุดแล้ว! ✅',
    toastItemDeleted: 'ลบรายการจากประวัติแล้ว',
    toastRedownloadStarted: 'เริ่มดาวน์โหลดซ้ำแล้ว! 🔄',
    confirmClearTitle: 'ล้างประวัติทั้งหมด?',
    confirmClearDesc: 'การดำเนินการนี้จะลบประวัติการดาวน์โหลดทั้งหมดอย่างถาวร ไม่สามารถย้อนกลับได้',
    confirmDeleteTitle: 'ลบรายการนี้?',
    confirmDeleteDesc: 'รายการนี้จะถูกลบออกจากประวัติอย่างถาวร',
    statusCompleted: 'เสร็จสิ้น',
    statusError: 'ผิดพลาด',
    settingsDns: '🔒 Secure DNS (DoH)',
    settingsDnsDesc: 'ใช้ Secure DNS (DoH) เพื่อช่วยแก้ไขชื่อโดเมนและเลี่ยงการบล็อก DNS ของผู้ให้บริการอินเทอร์เน็ต (หมายเหตุ: Secure DNS ไม่สามารถเปลี่ยนประเทศหรือปลดล็อกเนื้อหาที่จำกัดประเทศได้)',
    settingEnableDns: 'เปิดใช้งาน Secure DNS (DoH)',
    settingEnableDnsDesc: 'ถอดรหัสและเชื่อมต่อ DNS ผ่าน Cloudflare, Google หรือ OpenDNS',
    settingSelectDnsProvider: 'เลือกผู้ให้บริการ DNS (Select DNS provider)',
    settingSelectDnsProviderDesc: 'เลือกเซิร์ฟเวอร์ DNS ปลอดภัยที่ต้องการใช้งาน',
    settingCustomDnsUrl: 'URL เซิร์ฟเวอร์ DoH กำหนดเอง',
    settingCustomDnsUrlDesc: 'รูปแบบ: https://dns.example.com/dns-query',
    customDnsPlaceholder: 'https://1.1.1.1/dns-query',
    settingsProxy: '🌐 เครือข่ายและพร็อกซี (Proxy / VPN)',
    settingsProxyDesc: 'ส่งต่อการดาวน์โหลดผ่าน Proxy หรือเซิร์ฟเวอร์ VPN เพื่อเลี่ยงการจำกัดเครือข่าย หรือเข้าถึงเนื้อหาที่จำกัดเฉพาะบางประเทศ',
    settingEnableProxy: 'เปิดใช้งาน Network Proxy / Bypass',
    settingEnableProxyDesc: 'ส่งการดาวน์โหลดผ่าน Proxy หรือเซิร์ฟเวอร์ในเครื่อง',
    settingProxyPreset: 'พรีเซ็ต Proxy',
    settingProxyPresetDesc: 'เลือกเซิร์ฟเวอร์ Proxy สำเร็จรูปในเครื่อง หรือใส่ URL เอง',
    settingProxyUrl: 'URL ของเซิร์ฟเวอร์ Proxy แบบกำหนดเอง',
    settingProxyUrlDesc: 'รูปแบบ: http://127.0.0.1:1080 หรือ socks5://127.0.0.1:10808',
    proxyPlaceholder: 'เช่น http://127.0.0.1:1080 หรือ socks5://127.0.0.1:10808',
    proxyNoticeText: 'เลือกพรีเซ็ต Proxy ด้านบน หรือใช้ Cloudflare WARP/VPN เพื่อส่งผ่านข้อมูลหรือเลี่ยงการจำกัดเครือข่าย',
  }
};

// ── State ──────────────────────────────────────────────────────────────────
const state = {
  videoInfo: null,
  format: 'mp4',
  savePath: '',
  converterSavePath: '',
  activeDownloads: new Map(),
  settings: {
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
    zoomLevel: 1.0
  }
};

// ── i18n Functions ─────────────────────────────────────────────────────────
function t(key) {
  const lang = state.settings.language || 'en';
  return (translations[lang] && translations[lang][key]) || translations.en[key] || key;
}

function applyI18n() {
  // Text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translated = t(key);
    if (translated) el.textContent = translated;
  });
  // Placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const translated = t(key);
    if (translated) el.placeholder = translated;
  });
  // Update language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === state.settings.language);
  });
}

// ── DOM Refs ───────────────────────────────────────────────────────────────
const urlInput       = document.getElementById('urlInput');
const fetchBtn       = document.getElementById('fetchBtn');
const formatBtns     = document.querySelectorAll('.format-btn');
const qualitySelect  = document.getElementById('qualitySelect');
const savePathInput  = document.getElementById('savePath');
const browseBtn      = document.getElementById('browseBtn');
const thumbnailToggle= document.getElementById('thumbnailToggle');
const activeList     = document.getElementById('activeList');
const emptyState     = document.getElementById('emptyState');
const clearBtn       = document.getElementById('clearBtn');
const navItems       = document.querySelectorAll('.nav-item');

// Window Controls DOM Refs
const winMinBtn = document.getElementById('winMinBtn');
const winMaxBtn = document.getElementById('winMaxBtn');
const winCloseBtn = document.getElementById('winCloseBtn');

// Navigation Section DOM Refs
const tabContents = document.querySelectorAll('.tab-content');

// Settings DOM Refs
const themeToggle = document.getElementById('themeToggle');
const zoomSelect = document.getElementById('zoomSelect');
const alwaysOnTopToggle = document.getElementById('alwaysOnTopToggle');
const cookieSourceRadios = document.querySelectorAll('input[name="cookieSource"]');
const browserCookieSection = document.getElementById('browserCookieSection');
const fileCookieSection = document.getElementById('fileCookieSection');
const cookieBrowserSelect = document.getElementById('cookieBrowserSelect');
const cookieFilePathInput = document.getElementById('cookieFilePath');
const cookieFileBrowseBtn = document.getElementById('cookieFileBrowseBtn');
const dnsToggle = document.getElementById('dnsToggle');
const dnsProviderSection = document.getElementById('dnsProviderSection');
const dnsProviderSelect = document.getElementById('dnsProviderSelect');
const customDnsSection = document.getElementById('customDnsSection');
const customDnsInput = document.getElementById('customDnsInput');
const proxyToggle = document.getElementById('proxyToggle');
const proxyPresetSection = document.getElementById('proxyPresetSection');
const proxyPresetSelect = document.getElementById('proxyPresetSelect');
const proxyUrlSection = document.getElementById('proxyUrlSection');
const proxyUrlInput = document.getElementById('proxyUrlInput');
const autoDeleteDaysSelect = document.getElementById('autoDeleteDays');
const clearAllHistoryBtn = document.getElementById('clearAllHistoryBtn');
const langBtns = document.querySelectorAll('.lang-btn');

// Sync lists DOM Refs
const historyTabList = document.getElementById('historyTabList');
const historySearchInput = document.getElementById('historySearchInput');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// Converter DOM Refs
const converterDropzone = document.getElementById('converterDropzone');
const converterBrowseBtn = document.getElementById('converterBrowseBtn');
const converterSavePathInput = document.getElementById('converterSavePath');
const converterFileInput = document.getElementById('converterFileInput');
const converterQueue = document.getElementById('converterQueue');
const converterEmpty = document.getElementById('converterEmpty');

// Modal DOM Refs
const confirmModal = document.getElementById('confirmModal');
const confirmModalTitle = document.getElementById('confirmModalTitle');
const confirmModalDesc = document.getElementById('confirmModalDesc');
const confirmModalCancel = document.getElementById('confirmModalCancel');
const confirmModalConfirm = document.getElementById('confirmModalConfirm');

// ── Confirm Modal ──────────────────────────────────────────────────────────
let modalResolve = null;

function showConfirm(titleKey, descKey) {
  confirmModalTitle.textContent = t(titleKey);
  confirmModalDesc.textContent = t(descKey);
  confirmModalCancel.textContent = t('btnCancel');
  confirmModalConfirm.textContent = t('btnConfirm');
  confirmModal.classList.remove('hidden');
  return new Promise(resolve => { modalResolve = resolve; });
}

confirmModalCancel.addEventListener('click', () => {
  confirmModal.classList.add('hidden');
  if (modalResolve) modalResolve(false);
});
confirmModalConfirm.addEventListener('click', () => {
  confirmModal.classList.add('hidden');
  if (modalResolve) modalResolve(true);
});
confirmModal.addEventListener('click', (e) => {
  if (e.target === confirmModal) {
    confirmModal.classList.add('hidden');
    if (modalResolve) modalResolve(false);
  }
});

// ── WebSocket ──────────────────────────────────────────────────────────────
let ws;
function connectWS() {
  ws = new WebSocket(`ws://${location.host}`);
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.type === 'progress') handleProgress(msg);
    if (msg.type === 'history')  renderHistory(msg.data);
    if (msg.type === 'convert-progress') handleConvertProgress(msg);
    if (msg.type === 'ytdlp-status') renderYtDlpStatus(msg.data);
  };
  ws.onclose = () => setTimeout(connectWS, 2000);
}
connectWS();

// ── Helpers ────────────────────────────────────────────────────────────────
function formatSize(bytes) {
  if (!bytes) return 'Unknown size';
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + ' GB';
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + ' MB';
  return (bytes / 1e3).toFixed(0) + ' KB';
}

function truncate(str, max = 50) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// ── yt-dlp Status UI ──────────────────────────────────────────────────────
function renderYtDlpStatus(data) {
  if (!data) return;
  const versionEl = document.getElementById('ytdlpVersionLabel');
  const statusEl = document.getElementById('ytdlpStatusLabel');
  const updateBtn = document.getElementById('updateYtdlpBtn');

  const isTh = state.settings.language === 'th';

  if (versionEl) {
    versionEl.textContent = `${isTh ? 'เวอร์ชัน:' : 'Version:'} ${data.version || 'Checking...'}`;
  }
  if (statusEl) {
    let statusText = data.message || data.status;
    if (data.status === 'checking') statusText = isTh ? 'กำลังตรวจสอบอัปเดต...' : 'Checking for updates...';
    else if (data.status === 'up-to-date') statusText = isTh ? 'เป็นเวอร์ชันล่าสุดแล้ว ✅' : 'Up to date ✅';
    else if (data.status === 'updated') statusText = isTh ? 'อัปเดตสำเร็จ 🎉' : 'Updated successfully 🎉';
    else if (data.status === 'error') statusText = `${isTh ? 'ผิดพลาด:' : 'Error:'} ${data.message}`;

    statusEl.textContent = `${isTh ? 'สถานะ:' : 'Status:'} ${statusText}`;
  }
  if (updateBtn) {
    updateBtn.disabled = data.status === 'checking';
    updateBtn.textContent = data.status === 'checking' ? '...' : t('btnUpdateEngine');
  }
}

// ── Platform Detection ────────────────────────────────────────────────────
const PLATFORMS = [
  { id: 'youtube',   name: 'YouTube',   patterns: [/youtu\.?be/i, /youtube\.com/i] },
  { id: 'tiktok',    name: 'TikTok',    patterns: [/tiktok\.com/i, /vm\.tiktok/i, /vt\.tiktok/i] },
  { id: 'instagram', name: 'Instagram', patterns: [/instagram\.com/i, /instagr\.am/i] },
  { id: 'facebook',  name: 'Facebook',  patterns: [/facebook\.com/i, /fb\.watch/i, /fb\.com/i] },
  { id: 'x',         name: 'X',         patterns: [/twitter\.com/i, /x\.com/i, /t\.co/i] },
  { id: 'bilibili',  name: 'Bilibili',  patterns: [/bilibili\.com/i, /b23\.tv/i] },
  { id: 'douyin',    name: 'Douyin',    patterns: [/douyin\.com/i, /iesdouyin\.com/i] },
  { id: 'reddit',    name: 'Reddit',    patterns: [/reddit\.com/i, /redd\.it/i] },
  { id: 'twitch',    name: 'Twitch',    patterns: [/twitch\.tv/i] },
  { id: 'soundcloud',name: 'SoundCloud',patterns: [/soundcloud\.com/i] },
  { id: 'vimeo',     name: 'Vimeo',     patterns: [/vimeo\.com/i] }
];

function detectPlatform(url) {
  if (!url) return null;
  for (const p of PLATFORMS) {
    if (p.patterns.some(r => r.test(url))) return p;
  }
  // If it looks like a URL but doesn't match known platforms
  if (/^https?:\/\//i.test(url)) return { id: 'other', name: t('platformOther'), patterns: [] };
  return null;
}

function updatePlatformBar(url) {
  const detected = detectPlatform(url);
  const chips = document.querySelectorAll('.platform-chip');
  chips.forEach(chip => {
    const isActive = detected && chip.dataset.platform === detected.id;
    chip.classList.toggle('active', isActive);
  });
  return detected;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return state.settings.language === 'th' ? 'เมื่อสักครู่' : 'Just now';
  if (mins < 60) return state.settings.language === 'th' ? `${mins} นาทีที่แล้ว` : `${mins}m ago`;
  if (hours < 24) return state.settings.language === 'th' ? `${hours} ชั่วโมงที่แล้ว` : `${hours}h ago`;
  if (days < 7) return state.settings.language === 'th' ? `${days} วันที่แล้ว` : `${days}d ago`;
  return d.toLocaleDateString(state.settings.language === 'th' ? 'th-TH' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── History Storage (server is single source of truth) ─────────────────────
let serverHistory = [];

function getStoredHistory() {
  return serverHistory;
}

async function addToHistory(dl) {
  // The server already records history via recordHistory() on download completion.
  // This function exists for the UI to update the local cache when WebSocket pushes arrive.
  const idx = serverHistory.findIndex(h => h.id === dl.id);
  if (idx !== -1) serverHistory.splice(idx, 1);
  serverHistory.unshift({ ...dl, savedAt: dl.finishedAt || new Date().toISOString() });
  if (serverHistory.length > 200) serverHistory.length = 200;
}

async function removeFromHistory(id) {
  try {
    await fetch(`/api/history/${id}`, { method: 'DELETE' });
    serverHistory = serverHistory.filter(h => h.id !== id);
    const active = state.activeDownloads.get(id);
    if (active && active.status !== 'downloading') {
      state.activeDownloads.delete(id);
    }
    renderDownloads();
    renderHistoryTab();
  } catch {}
}

async function clearAllHistory() {
  try {
    await fetch('/api/history', { method: 'DELETE' });
    serverHistory = [];
    for (const [id, dl] of state.activeDownloads.entries()) {
      if (dl.status !== 'downloading') {
        state.activeDownloads.delete(id);
      }
    }
    renderDownloads();
    renderHistoryTab();
  } catch {}
}

function autoDeleteOldHistory() {
  // Auto-delete is handled server-side via normalizeHistory when state is loaded/saved.
  // Trigger a save to apply the setting.
  patchServerState({});
}

// ── UI Events ──────────────────────────────────────────────────────────────
formatBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    formatBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.format = btn.dataset.val;
    if(['mp3', 'wav', 'm4a'].includes(state.format)) {
      qualitySelect.disabled = true;
    } else {
      qualitySelect.disabled = false;
    }
    saveDownloadDefaults();
  });
});

function setActiveTab(targetTab) {
  if (!targetTab) return;
  navItems.forEach(n => n.classList.toggle('active', n.dataset.tab === targetTab));
  tabContents.forEach(content => {
    if (content.id === `${targetTab}-tab`) {
      content.classList.remove('hidden');
    } else {
      content.classList.add('hidden');
    }
  });
  if (targetTab === 'history') {
    renderHistoryTab();
  }
}

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const targetTab = item.dataset.tab;
    setActiveTab(targetTab);
    saveActiveTab(targetTab);
  });
});

if (qualitySelect) {
  qualitySelect.addEventListener('change', () => {
    saveDownloadDefaults();
  });
}

if (thumbnailToggle) {
  thumbnailToggle.addEventListener('change', () => {
    saveDownloadDefaults();
  });
}

browseBtn.addEventListener('click', async () => {
  try {
    const currentPath = encodeURIComponent(state.savePath || '');
    const res = await fetch(`/api/select-folder?current=${currentPath}`);
    const data = await res.json();
    if (data.path) {
      state.savePath = data.path;
      savePathInput.value = data.path;
      saveDownloadDefaults();
    }
  } catch (err) {
    toast(t('toastCannotBrowse'), 'error');
  }
});

// Platform auto-detection on URL input
urlInput.addEventListener('input', () => {
  updatePlatformBar(urlInput.value.trim());
});
urlInput.addEventListener('paste', () => {
  // Delay to let paste complete
  setTimeout(() => updatePlatformBar(urlInput.value.trim()), 50);
});

clearBtn.addEventListener('click', () => {
  for (const [id, dl] of state.activeDownloads.entries()) {
    if (dl.status !== 'downloading') {
      state.activeDownloads.delete(id);
    }
  }
  renderDownloads();
});

// ── History Search ─────────────────────────────────────────────────────────
if (historySearchInput) {
  historySearchInput.addEventListener('input', () => {
    renderHistoryTab();
  });
}

// ── History Tab Clear ──────────────────────────────────────────────────────
if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener('click', async () => {
    const confirmed = await showConfirm('confirmClearTitle', 'confirmClearDesc');
    if (confirmed) {
      await clearAllHistory();
      toast(t('toastHistoryCleared'), 'success');
    }
  });
}

// ── Start Download ─────────────────────────────────────────────────────────
fetchBtn.addEventListener('click', async () => {
  const url = urlInput.value.trim();
  if (!url) { toast(t('toastPasteLink'), 'error'); return; }

  const detectedPlatform = detectPlatform(url);

  fetchBtn.disabled = true;
  fetchBtn.textContent = '...';

  const formatVal = state.format;
  const audioOnly = ['mp3', 'wav', 'm4a'].includes(formatVal);
  const qualityVal = qualitySelect.value;

  try {
    const res = await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        format: qualityVal,
        audioOnly: audioOnly,
        ext: formatVal,
        outputPath: state.savePath,
        subtitles: false,
        embedThumbnail: thumbnailToggle.checked,
        cookieSource: state.settings.cookieSource,
        cookieBrowser: state.settings.cookieBrowser,
        cookieFile: state.settings.cookieFile,
        dnsEnabled: state.settings.dnsEnabled,
        dnsProvider: state.settings.dnsProvider,
        customDnsUrl: state.settings.customDnsUrl,
        proxyEnabled: state.settings.proxyEnabled,
        proxyPreset: state.settings.proxyPreset,
        proxyUrl: state.settings.proxyUrl
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed');

    state.activeDownloads.set(data.id, {
      id: data.id,
      url,
      title: '',
      status: 'downloading',
      progress: 0, speed: '', eta: '',
      audioOnly: audioOnly,
      ext: formatVal,
      thumbnail: thumbnailToggle.checked ? '' : null,
      platform: detectedPlatform ? detectedPlatform.id : null,
      savePath: state.savePath
    });

    renderDownloads();
    urlInput.value = '';
    updatePlatformBar('');
    toast(t('toastDownloadStarted'), 'success');
  } catch (err) {
    toast('Error: ' + err.message, 'error');
  } finally {
    fetchBtn.disabled = false;
    fetchBtn.textContent = t('btnDownload');
  }
});

// ── Handle Progress ────────────────────────────────────────────────────────
// Track cancelled download IDs so we never accept further updates for them
const cancelledDownloadIds = new Set();

function handleProgress(msg) {
  const { id, download } = msg;

  // If this download was already cancelled, block ALL further updates (including 'done')
  if (cancelledDownloadIds.has(id)) {
    return;
  }

  // If the existing entry is already cancelled/done/error, don't let a stale 'downloading' overwrite it
  const existing = state.activeDownloads.get(id) || {};
  const existingStatus = existing.status;
  if ((existingStatus === 'cancelled' || existingStatus === 'done' || existingStatus === 'error') 
      && download.status === 'downloading') {
    return;
  }

  if (download.status === 'cancelled') {
    cancelledDownloadIds.add(id);
  }

  if (download.status === 'done' || download.status === 'error' || download.status === 'cancelled') {
    if (download.status === 'done') {
      const cleanDoneName = (download.title || download.filename || 'File').replace(/\.f\d+(\.[a-zA-Z0-9]+)?$/i, '');
      toast(`✅ ${truncate(cleanDoneName)}`, 'success');
      addToHistory(download);
    }
    if (download.status === 'error') {
      const errLower = (download.error || '').toLowerCase();
      if (errLower.includes('could not resolve host') || errLower.includes('curl: (6)') || errLower.includes('connection timed out') || errLower.includes('curl: (28)')) {
        const blockMsg = state.settings.language === 'th'
          ? '❌ เว็บไซต์นี้ถูกบล็อกโดยอินเทอร์เน็ต (DNS Block) กรุณาเปิดใช้ Proxy หรือ VPN ในหน้า Settings'
          : '❌ Site blocked by ISP DNS. Please enable Proxy or VPN in Settings.';
        toast(blockMsg, 'error');
      } else {
        const errDisplay = download.error || (state.settings.language === 'th' ? 'ดาวน์โหลดล้มเหลว' : 'Download failed');
        toast(`❌ ${truncate(errDisplay, 50)}`, 'error');
      }
      addToHistory(download);
    }
    if (download.status === 'cancelled') {
      addToHistory(download);
    }
  }
  
  state.activeDownloads.set(id, { ...existing, ...download });

  renderDownloads();
}

// ── Render Downloads (Home + Downloads tab) ────────────────────────────────
function renderDownloads() {
  const items = Array.from(state.activeDownloads.values()).reverse();
  
  if (items.length === 0) {
    emptyState.textContent = t('emptyRecent');
    emptyState.classList.remove('hidden');
    Array.from(activeList.children).forEach(c => { if(c !== emptyState) c.remove(); });
    return;
  }

  emptyState.classList.add('hidden');

  // Smooth in-place DOM diffing (prevents flickering and keeps Cancel button clickable)
  const existingElements = new Map();
  Array.from(activeList.children).forEach(el => {
    if (el !== emptyState && el.getAttribute('data-id')) {
      existingElements.set(el.getAttribute('data-id'), el);
    }
  });

  const validIds = new Set(items.map(i => i.id));

  // Remove stale items
  existingElements.forEach((el, id) => {
    if (!validIds.has(id)) {
      el.remove();
    }
  });

  // Update or append active items in order
  items.forEach((dl) => {
    let el = existingElements.get(dl.id);
    if (el) {
      updateDlItem(el, dl, 'home');
    } else {
      el = makeDlItem(dl, 'home');
      activeList.insertBefore(el, emptyState);
    }
  });
}

function sanitizeTitle(dl) {
  const raw = dl.title || dl.filename || dl.url || '';
  return raw.replace(/\.f\d+(\.[a-zA-Z0-9]+)?$/i, '');
}

function updateDlItem(item, dl, context = 'home') {
  item.setAttribute('data-id', dl.id);
  
  const progress = Math.min(100, Math.round(dl.progress || 0));
  const isDownloading = dl.status === 'downloading';
  const isDone = dl.status === 'done';
  const ext = (dl.ext || (dl.audioOnly ? 'MP3' : 'MP4')).toUpperCase();
  const platformId = dl.platform || (dl.url ? (detectPlatform(dl.url) || {}).id : null);
  
  let statsText = '';
  if (isDownloading) {
    statsText = `${progress}% · ${dl.speed || ''} · ${ext}`;
  } else if (isDone) {
    statsText = `${t('statusCompleted')} · ${ext}`;
  } else {
    statsText = `${dl.status === 'error' ? t('statusError') : dl.status} · ${ext}`;
  }

  const lastStatus = item.getAttribute('data-status');
  if (lastStatus !== dl.status) {
    item.setAttribute('data-status', dl.status);
    const temp = makeDlItem(dl, context);
    item.innerHTML = temp.innerHTML;
    bindDlItemActions(item, dl, context);
    return;
  }

  const fill = item.querySelector('.dl-progress-fill');
  if (fill) {
    fill.style.width = `${progress}%`;
    if (isDone) fill.style.background = '#4CAF50';
    else if (dl.status === 'error') fill.style.background = '#F44336';
  }

  const stats = item.querySelector('.dl-stats');
  if (stats && stats.textContent !== statsText) {
    stats.textContent = statsText;
  }

  const titleEl = item.querySelector('.dl-title');
  const titleText = sanitizeTitle(dl);
  if (titleEl && titleText && !titleEl.textContent.includes(titleText)) {
    titleEl.innerHTML = `${platformId ? `<span class="dl-platform-badge ${platformId}">${(PLATFORMS.find(p=>p.id===platformId)||{name:platformId}).name}</span>` : ''}${titleText}`;
  }

  const thumbImg = item.querySelector('.dl-thumb');
  if (thumbImg && dl.thumbnail && dl.thumbnail.startsWith('http') && thumbImg.src !== dl.thumbnail) {
    thumbImg.src = dl.thumbnail;
    thumbImg.style.padding = '';
    thumbImg.style.opacity = '';
  }
}

// ── Render History Tab ─────────────────────────────────────────────────────
function renderHistoryTab() {
  if (!historyTabList) return;

  let history = getStoredHistory();
  
  // Apply search filter
  const searchQuery = (historySearchInput?.value || '').trim().toLowerCase();
  if (searchQuery) {
    history = history.filter(h => {
      const title = (h.title || h.filename || h.url || '').toLowerCase();
      return title.includes(searchQuery);
    });
  }

  if (history.length === 0) {
    historyTabList.innerHTML = `<div class="empty-state">${searchQuery ? (state.settings.language === 'th' ? 'ไม่พบรายการที่ค้นหา' : 'No matching items found') : t('emptyHistory')}</div>`;
    return;
  }

  historyTabList.innerHTML = '';
  history.forEach(dl => {
    historyTabList.appendChild(makeDlItem(dl, 'history'));
  });
}

function renderHistory(history) {
  serverHistory = Array.isArray(history) ? history : [];
  const historyIds = new Set(serverHistory.map(h => h.id));

  // Remove stale completed/inactive items from Recent Downloads
  for (const [id, dl] of state.activeDownloads.entries()) {
    if (dl.status !== 'downloading' && !historyIds.has(id)) {
      state.activeDownloads.delete(id);
    }
  }

  // Add history items to active downloads map
  serverHistory.forEach(dl => {
    if (!state.activeDownloads.has(dl.id)) {
      state.activeDownloads.set(dl.id, dl);
    }
  });

  renderDownloads();
  renderHistoryTab();
}

// ── Build Item DOM ─────────────────────────────────────────────────────────
function makeDlItem(dl, context = 'home') {
  const item = document.createElement('div');
  item.className = 'dl-item';
  item.setAttribute('data-id', dl.id);
  item.setAttribute('data-status', dl.status || '');
  
  const progress = Math.min(100, Math.round(dl.progress || 0));
  const isDownloading = dl.status === 'downloading';
  const isDone = dl.status === 'done';
  const ext = (dl.ext || (dl.audioOnly ? 'MP3' : 'MP4')).toUpperCase();
  const platformId = dl.platform || (dl.url ? (detectPlatform(dl.url) || {}).id : null);
  
  let statsText = '';
  if (isDownloading) {
    statsText = `${progress}% · ${dl.speed || ''} · ${ext}`;
  } else if (isDone) {
    statsText = `${t('statusCompleted')} · ${ext}`;
  } else {
    statsText = `${dl.status === 'error' ? t('statusError') : dl.status} · ${ext}`;
  }

  const fallbackSvg = 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23ff6b52" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3cpolygon points="23 7 16 12 23 17 23 7"%3e%3c/polygon%3e%3crect x="1" y="5" width="15" height="14" rx="2" ry="2"%3e%3c/rect%3e%3c/svg%3e';
  const hasHttpThumb = dl.thumbnail && dl.thumbnail.startsWith('http');
  const thumbSrc = hasHttpThumb ? dl.thumbnail : fallbackSvg;
  const isFallback = !hasHttpThumb;

  const dateStr = formatDate(dl.savedAt || dl.finishedAt || dl.startedAt);
  const titleText = sanitizeTitle(dl);

  let actionsHtml = '';
  if (context === 'history') {
    actionsHtml = `
      <button class="dl-btn btn-redownload" title="${state.settings.language === 'th' ? 'ดาวน์โหลดซ้ำ' : 'Re-download'}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </button>
      <button class="dl-btn btn-delete" title="${state.settings.language === 'th' ? 'ลบ' : 'Delete'}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>`;
  } else if (isDownloading) {
    actionsHtml = `
      <button class="dl-btn btn-cancel" title="Cancel">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
      </button>`;
  } else {
    actionsHtml = `
      <button class="dl-btn" title="Open Folder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
      </button>`;
  }

  item.innerHTML = `
    <div class="dl-thumb-wrap">
      <img src="${thumbSrc}" class="dl-thumb" style="${isFallback ? 'padding: 16px; opacity: 0.3;' : ''}" onerror="this.onerror=null; this.src='${fallbackSvg}'; this.style.padding='16px'; this.style.opacity='0.3';" />
    </div>
    <div class="dl-info">
      <div class="dl-title">${platformId ? `<span class="dl-platform-badge ${platformId}">${(PLATFORMS.find(p=>p.id===platformId)||{name:platformId}).name}</span>` : ''}${titleText}</div>
      <div class="dl-progress-bar">
        <div class="dl-progress-fill" style="width: ${progress}%; ${isDone ? 'background: #4CAF50;' : (dl.status==='error'?'background: #F44336;':'')}"></div>
      </div>
      <div class="dl-stats">${statsText}</div>
      ${dateStr && context === 'history' ? `<div class="dl-date">${dateStr}</div>` : ''}
    </div>
    <div class="dl-actions">
      ${actionsHtml}
    </div>
  `;

  bindDlItemActions(item, dl, context);

  return item;
}

function bindDlItemActions(item, dl, context = 'home') {
  const isDownloading = dl.status === 'downloading';
  if (context === 'history') {
    const redownloadBtn = item.querySelector('.btn-redownload');
    const deleteBtn = item.querySelector('.btn-delete');
    
    if (redownloadBtn) {
      redownloadBtn.onclick = (e) => {
        e.stopPropagation();
        if (!dl.url) return;
        urlInput.value = dl.url;
        navItems.forEach(n => n.classList.remove('active'));
        document.querySelector('[data-tab="home"]').classList.add('active');
        tabContents.forEach(c => c.classList.add('hidden'));
        document.getElementById('home-tab').classList.remove('hidden');
        toast(t('toastRedownloadStarted'), 'info');
        fetchBtn.click();
      };
    }
    
    if (deleteBtn) {
      deleteBtn.onclick = async (e) => {
        e.stopPropagation();
        const confirmed = await showConfirm('confirmDeleteTitle', 'confirmDeleteDesc');
        if (confirmed) {
          await removeFromHistory(dl.id);
          toast(t('toastItemDeleted'), 'info');
        }
      };
    }
  } else if (isDownloading) {
    const cancelBtn = item.querySelector('.btn-cancel');
    if (cancelBtn) {
      cancelBtn.onclick = async (e) => {
        e.stopPropagation();
        cancelBtn.disabled = true;
        try {
          await fetch(`/api/cancel/${dl.id}`, { method: 'POST' });
          toast(t('toastCancelled'), 'info');
        } catch(err) {}
      };
    }
  } else {
    const folderBtn = item.querySelector('.dl-actions button');
    if (folderBtn) {
      folderBtn.onclick = async (e) => {
        e.stopPropagation();
        const folderPath = dl.outputDir || dl.savePath || state.savePath || '';
        const fileName = dl.filename || '';
        await fetch(`/api/open-folder?path=${encodeURIComponent(folderPath)}&file=${encodeURIComponent(fileName)}`);
      };
    }
  }
}

// ── Window Controls ────────────────────────────────────────────────────────
if (winMinBtn) winMinBtn.addEventListener('click', () => window.electronAPI?.minimize());
if (winMaxBtn) winMaxBtn.addEventListener('click', () => window.electronAPI?.maximize());
if (winCloseBtn) winCloseBtn.addEventListener('click', () => window.electronAPI?.close());

if (window.electronAPI?.onMaximizedStatus && winMaxBtn) {
  window.electronAPI.onMaximizedStatus((isMaximized) => {
    document.body.classList.toggle('maximized', isMaximized);
    if (isMaximized) {
      winMaxBtn.title = state.settings.language === 'th' ? 'ย่อขนาดลง' : 'Restore';
      winMaxBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="8" y="4" width="12" height="12" rx="1.5" ry="1.5"/><path d="M4 8v10a2 2 0 0 0 2 2h10"/></svg>`;
    } else {
      winMaxBtn.title = state.settings.language === 'th' ? 'ขยายหน้าจอ' : 'Maximize';
      winMaxBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="5" y="5" width="14" height="14" rx="2" ry="2"/></svg>`;
    }
  });
}

// ── Settings Handlers ──────────────────────────────────────────────────────
// Debounced server state patch — merges pending patches so rapid calls don't lose data
let _patchTimer = null;
let _pendingPatch = {};
function patchServerState(partial) {
  // Deep-merge into pending patch so no data is lost
  for (const key of Object.keys(partial)) {
    if (typeof partial[key] === 'object' && partial[key] !== null && !Array.isArray(partial[key])
        && typeof _pendingPatch[key] === 'object' && _pendingPatch[key] !== null) {
      _pendingPatch[key] = { ..._pendingPatch[key], ...partial[key] };
    } else {
      _pendingPatch[key] = partial[key];
    }
  }
  clearTimeout(_patchTimer);
  _patchTimer = setTimeout(async () => {
    const toSend = _pendingPatch;
    _pendingPatch = {};
    try {
      await fetch('/api/app-state', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toSend)
      });
    } catch {}
  }, 200);
}

function saveSettings() {
  patchServerState({ settings: state.settings });
}

function saveDownloadDefaults() {
  patchServerState({ downloadDefaults: {
    savePath: state.savePath,
    converterSavePath: state.converterSavePath,
    format: state.format,
    quality: document.getElementById('qualitySelect')?.value || 'best',
    embedThumbnail: document.getElementById('thumbnailToggle')?.checked !== false
  }});
}

function saveActiveTab(tab) {
  patchServerState({ ui: { activeTab: tab } });
}

async function loadSettings() {
  try {
    const res = await fetch('/api/app-state');
    const serverState = await res.json();
    if (serverState.settings) {
      state.settings = { ...state.settings, ...serverState.settings };
    }
    if (serverState.downloadDefaults) {
      if (serverState.downloadDefaults.savePath) {
        state.savePath = serverState.downloadDefaults.savePath;
        if (savePathInput) savePathInput.value = state.savePath;
      }
      if (serverState.downloadDefaults.converterSavePath) {
        state.converterSavePath = serverState.downloadDefaults.converterSavePath;
        if (converterSavePathInput) converterSavePathInput.value = state.converterSavePath;
      }
      if (serverState.downloadDefaults.format) {
        state.format = serverState.downloadDefaults.format;
        formatBtns.forEach(btn => {
          btn.classList.toggle('active', btn.dataset.val === state.format);
        });
        if (['mp3', 'wav', 'm4a'].includes(state.format)) {
          if (qualitySelect) qualitySelect.disabled = true;
        } else {
          if (qualitySelect) qualitySelect.disabled = false;
        }
      }
      if (serverState.downloadDefaults.quality && qualitySelect) {
        qualitySelect.value = serverState.downloadDefaults.quality;
      }
      if (serverState.downloadDefaults.embedThumbnail !== undefined && thumbnailToggle) {
        thumbnailToggle.checked = Boolean(serverState.downloadDefaults.embedThumbnail);
      }
    }
    setActiveTab('home');
    if (serverState.history) {
      serverHistory = serverState.history;
    }
  } catch {}
  applySettings();
}

function applySettings() {
  // 1. Theme
  if (state.settings.theme === 'dark') {
    document.body.classList.add('dark-theme');
    if (themeToggle) themeToggle.checked = true;
  } else {
    document.body.classList.remove('dark-theme');
    if (themeToggle) themeToggle.checked = false;
  }

  // 2. Always on Top
  if (alwaysOnTopToggle) alwaysOnTopToggle.checked = state.settings.alwaysOnTop;
  window.electronAPI?.setAlwaysOnTop(state.settings.alwaysOnTop);

  // 3. Cookies Source
  cookieSourceRadios.forEach(radio => {
    if (radio.value === state.settings.cookieSource) {
      radio.checked = true;
    }
  });

  const browserCookieTip = document.getElementById('browserCookieTip');
  const fileCookieTip = document.getElementById('fileCookieTip');

  if (state.settings.cookieSource === 'browser') {
    browserCookieSection?.classList.remove('hidden');
    fileCookieSection?.classList.add('hidden');
    browserCookieTip?.classList.remove('hidden');
    fileCookieTip?.classList.add('hidden');
  } else if (state.settings.cookieSource === 'file') {
    browserCookieSection?.classList.add('hidden');
    fileCookieSection?.classList.remove('hidden');
    browserCookieTip?.classList.add('hidden');
    fileCookieTip?.classList.remove('hidden');
  } else {
    browserCookieSection?.classList.add('hidden');
    fileCookieSection?.classList.add('hidden');
    browserCookieTip?.classList.add('hidden');
    fileCookieTip?.classList.add('hidden');
  }

  if (cookieBrowserSelect) cookieBrowserSelect.value = state.settings.cookieBrowser;
  if (cookieFilePathInput) cookieFilePathInput.value = state.settings.cookieFile || '';

  // 4. Secure DNS
  if (dnsToggle) dnsToggle.checked = state.settings.dnsEnabled !== false;
  if (dnsProviderSelect) dnsProviderSelect.value = state.settings.dnsProvider || 'cloudflare';
  if (customDnsInput) customDnsInput.value = state.settings.customDnsUrl || '';

  if (state.settings.dnsEnabled !== false) {
    dnsProviderSection?.classList.remove('hidden');
    if (state.settings.dnsProvider === 'custom') {
      customDnsSection?.classList.remove('hidden');
    } else {
      customDnsSection?.classList.add('hidden');
    }
  } else {
    dnsProviderSection?.classList.add('hidden');
    customDnsSection?.classList.add('hidden');
  }

  // 5. Proxy
  if (proxyToggle) proxyToggle.checked = state.settings.proxyEnabled || false;
  if (proxyPresetSelect) proxyPresetSelect.value = state.settings.proxyPreset || 'warp';
  if (proxyUrlInput) proxyUrlInput.value = state.settings.proxyUrl || '';

  if (state.settings.proxyEnabled) {
    proxyPresetSection?.classList.remove('hidden');
    if (state.settings.proxyPreset === 'custom') {
      proxyUrlSection?.classList.remove('hidden');
    } else {
      proxyUrlSection?.classList.add('hidden');
    }
  } else {
    proxyPresetSection?.classList.add('hidden');
    proxyUrlSection?.classList.add('hidden');
  }

  // 5. Auto-delete days
  if (autoDeleteDaysSelect) autoDeleteDaysSelect.value = state.settings.autoDeleteDays || '0';

  // 6. Language
  applyI18n();

  // 7. Zoom Level
  if (state.settings.zoomLevel) {
    window.electronAPI?.setZoomFactor(parseFloat(state.settings.zoomLevel));
    if (zoomSelect) zoomSelect.value = state.settings.zoomLevel.toString();
  }
}

// Wire settings DOM listeners
if (themeToggle) {
  themeToggle.addEventListener('change', (e) => {
    state.settings.theme = e.target.checked ? 'dark' : 'light';
    saveSettings();
    applySettings();
  });
}

if (alwaysOnTopToggle) {
  alwaysOnTopToggle.addEventListener('change', (e) => {
    state.settings.alwaysOnTop = e.target.checked;
    saveSettings();
    applySettings();
  });
}

if (zoomSelect) {
  zoomSelect.addEventListener('change', (e) => {
    state.settings.zoomLevel = parseFloat(e.target.value);
    saveSettings();
    applySettings();
  });
}

cookieSourceRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    state.settings.cookieSource = e.target.value;
    saveSettings();
    applySettings();
  });
});

if (cookieBrowserSelect) {
  cookieBrowserSelect.addEventListener('change', (e) => {
    state.settings.cookieBrowser = e.target.value;
    saveSettings();
  });
}

if (cookieFileBrowseBtn) {
  cookieFileBrowseBtn.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/select-file');
      const data = await res.json();
      if (data.path) {
        state.settings.cookieFile = data.path;
        saveSettings();
        applySettings();
      }
    } catch (err) {
      toast(t('toastCannotBrowseCookie'), 'error');
    }
  });
}

if (dnsToggle) {
  dnsToggle.addEventListener('change', (e) => {
    state.settings.dnsEnabled = e.target.checked;
    saveSettings();
    applySettings();
  });
}

if (dnsProviderSelect) {
  dnsProviderSelect.addEventListener('change', (e) => {
    state.settings.dnsProvider = e.target.value;
    saveSettings();
    applySettings();
  });
}

if (customDnsInput) {
  customDnsInput.addEventListener('input', (e) => {
    state.settings.customDnsUrl = e.target.value.trim();
    saveSettings();
  });
}

if (proxyToggle) {
  proxyToggle.addEventListener('change', (e) => {
    state.settings.proxyEnabled = e.target.checked;
    saveSettings();
    applySettings();
  });
}

if (proxyPresetSelect) {
  proxyPresetSelect.addEventListener('change', (e) => {
    state.settings.proxyPreset = e.target.value;
    saveSettings();
    applySettings();
  });
}

if (proxyUrlInput) {
  proxyUrlInput.addEventListener('input', (e) => {
    state.settings.proxyUrl = e.target.value.trim();
    saveSettings();
  });
}

// Manual yt-dlp update button
const updateYtdlpBtn = document.getElementById('updateYtdlpBtn');
if (updateYtdlpBtn) {
  updateYtdlpBtn.addEventListener('click', async () => {
    updateYtdlpBtn.disabled = true;
    updateYtdlpBtn.textContent = '...';
    try {
      const res = await fetch('/api/update-ytdlp', { method: 'POST' });
      const data = await res.json();
      renderYtDlpStatus(data);
      if (data.status === 'updated') {
        toast(t('toastYtdlpUpdated'), 'success');
      } else if (data.status === 'up-to-date') {
        toast(t('toastYtdlpUpToDate'), 'info');
      } else if (data.status === 'error') {
        toast('yt-dlp update error: ' + data.message, 'error');
      }
    } catch (e) {
      toast('Failed to trigger update', 'error');
    } finally {
      updateYtdlpBtn.disabled = false;
      updateYtdlpBtn.textContent = t('btnUpdateEngine');
    }
  });
}

// Auto-delete days selector
if (autoDeleteDaysSelect) {
  autoDeleteDaysSelect.addEventListener('change', (e) => {
    state.settings.autoDeleteDays = parseInt(e.target.value);
    saveSettings();
    autoDeleteOldHistory();
    renderHistoryTab();
  });
}

// Clear all history button in settings
if (clearAllHistoryBtn) {
  clearAllHistoryBtn.addEventListener('click', async () => {
    const confirmed = await showConfirm('confirmClearTitle', 'confirmClearDesc');
    if (confirmed) {
      await clearAllHistory();
      toast(t('toastHistoryCleared'), 'success');
    }
  });
}

// Language toggle buttons
langBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    state.settings.language = btn.dataset.lang;
    saveSettings();
    applySettings();
    // Re-render dynamic content
    renderDownloads();
    renderHistoryTab();
    renderConverterQueue();
  });
});

// ── File Converter Logic ───────────────────────────────────────────────────
const converterFiles = [];

const FORMAT_OPTIONS = {
  video: ['mp4', 'mkv', 'avi', 'mov', 'webm', 'mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac'],
  audio: ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'opus'],
  image: ['png', 'jpg', 'webp', 'bmp', 'gif', 'tiff']
};

function getFileCategory(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const videoExts = ['mp4','mkv','avi','mov','wmv','flv','webm','m4v','3gp','ts','m2ts'];
  const audioExts = ['mp3','wav','m4a','aac','ogg','flac','wma','opus','alac'];
  const imageExts = ['png','jpg','jpeg','gif','bmp','tiff','tif','webp','svg','ico','heic','heif','avif'];
  if (videoExts.includes(ext)) return 'video';
  if (audioExts.includes(ext)) return 'audio';
  if (imageExts.includes(ext)) return 'image';
  return 'video'; // default
}

function getCategoryEmoji(category) {
  if (category === 'video') return '🎬';
  if (category === 'audio') return '🎵';
  if (category === 'image') return '🖼️';
  return '📄';
}

function getDefaultOutputFormat(filename, category) {
  const ext = filename.split('.').pop().toLowerCase();
  const options = FORMAT_OPTIONS[category] || FORMAT_OPTIONS.video;
  // Pick first format that's different from input
  for (const fmt of options) {
    if (fmt !== ext) return fmt;
  }
  return options[0];
}

function addConverterFiles(files) {
  files.forEach(f => {
    const category = getFileCategory(f.name || f.path);
    converterFiles.push({
      id: 'cf-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      name: f.name || f.path,
      path: f.path || null,
      size: f.size || 0,
      category,
      outputFormat: getDefaultOutputFormat(f.name || f.path, category),
      quality: 'high',
      status: 'pending', // pending | converting | done | error | cancelled
      progress: 0,
      serverId: null // server-side conversion ID
    });
  });
  renderConverterQueue();
  if (files.length > 0) toast(t('toastFilesAdded'), 'success');
}

async function browseConverterFiles() {
  try {
    const res = await fetch('/api/select-convert-files');
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      addConverterFiles(data.files);
      return;
    }

    // A cancelled Electron dialog returns no files; do not open a second dialog.
    if (navigator.userAgent.toLowerCase().includes(' electron/')) return;
  } catch (err) {
    // Fall back to the browser's file chooser when the Electron dialog is unavailable.
  }

  converterFileInput?.click();
}

// Drag & Drop
if (converterDropzone) {
  converterDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    converterDropzone.classList.add('drag-over');
  });
  converterDropzone.addEventListener('dragleave', () => {
    converterDropzone.classList.remove('drag-over');
  });
  converterDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    converterDropzone.classList.remove('drag-over');
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      // For dropped files, we use the path from Electron
      const fileInfos = droppedFiles.map(f => ({
        name: f.name,
        path: f.path, // Electron provides this
        size: f.size
      }));
      addConverterFiles(fileInfos);
    }
  });
  converterDropzone.addEventListener('click', browseConverterFiles);
}

if (converterBrowseBtn) {
  converterBrowseBtn.addEventListener('click', async () => {
    try {
      const currentPath = encodeURIComponent(state.converterSavePath || state.savePath || '');
      const res = await fetch(`/api/select-folder?current=${currentPath}`);
      const data = await res.json();
      if (data.path) {
        state.converterSavePath = data.path;
        converterSavePathInput.value = data.path;
        saveDownloadDefaults();
      }
    } catch (err) {
      toast(t('toastCannotBrowse'), 'error');
    }
  });
}

if (converterFileInput) {
  converterFileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    const fileInfos = files.map(f => ({
      name: f.name,
      path: f.path || f.name,
      size: f.size
    }));
    addConverterFiles(fileInfos);
    converterFileInput.value = '';
  });
}

function renderConverterQueue() {
  if (!converterQueue || !converterEmpty) return;
  
  if (converterFiles.length === 0) {
    converterQueue.innerHTML = '';
    converterEmpty.classList.remove('hidden');
    return;
  }

  converterEmpty.classList.add('hidden');
  converterQueue.innerHTML = '';

  converterFiles.forEach((file, index) => {
    const item = document.createElement('div');
    item.className = 'convert-item';
    
    const inputExt = file.name.split('.').pop().toUpperCase();
    const isConverting = file.status === 'converting';
    const isDone = file.status === 'done';
    const isError = file.status === 'error';
    const isPending = file.status === 'pending';

    const formatOptions = FORMAT_OPTIONS[file.category] || FORMAT_OPTIONS.video;

    let statusText = '';
    if (isConverting) statusText = `${t('converterConverting')} ${file.progress}%`;
    else if (isDone) statusText = t('converterDone');
    else if (isError) statusText = t('converterError');
    else statusText = `${inputExt} → ${file.outputFormat.toUpperCase()}`;

    const progressClass = isDone ? 'done' : isError ? 'error' : '';

    item.innerHTML = `
      <div class="convert-file-icon ${file.category}">
        ${getCategoryEmoji(file.category)}
      </div>
      <div class="convert-item-info">
        <div class="convert-item-name">${file.name}</div>
        <div class="convert-item-meta">
          <span class="convert-item-size">${formatSize(file.size)}</span>
          <span class="convert-arrow">→</span>
          ${isPending ? `
            <select class="convert-format-select" data-index="${index}">
              ${formatOptions.map(fmt => `<option value="${fmt}" ${fmt === file.outputFormat ? 'selected' : ''}>${fmt.toUpperCase()}</option>`).join('')}
            </select>
            <select class="convert-quality-select" data-index="${index}">
              <option value="high" ${file.quality === 'high' ? 'selected' : ''}>${t('qualityHigh')}</option>
              <option value="medium" ${file.quality === 'medium' ? 'selected' : ''}>${t('qualityMedium')}</option>
              <option value="low" ${file.quality === 'low' ? 'selected' : ''}>${t('qualityLow')}</option>
            </select>
          ` : `<span class="convert-item-size">${file.outputFormat.toUpperCase()}</span>`}
        </div>
        ${(isConverting || isDone || isError) ? `
          <div class="convert-item-progress">
            <div class="convert-item-progress-fill ${progressClass}" style="width: ${file.progress}%"></div>
          </div>
        ` : ''}
        <div class="convert-item-status">${statusText}</div>
      </div>
      <div class="convert-item-actions">
        ${isPending ? `
          <button class="convert-btn convert-btn-start" title="Convert" data-action="start" data-index="${index}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </button>
        ` : ''}
        ${isConverting ? `
          <button class="convert-btn convert-btn-cancel" title="Cancel" data-action="cancel" data-index="${index}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
          </button>
        ` : ''}
        ${(isPending || isDone || isError) ? `
          <button class="convert-btn convert-btn-remove" title="Remove" data-action="remove" data-index="${index}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        ` : ''}
      </div>
    `;

    // Event listeners
    const formatSelect = item.querySelector('.convert-format-select');
    if (formatSelect) {
      formatSelect.addEventListener('change', (e) => {
        converterFiles[index].outputFormat = e.target.value;
      });
    }

    const qualitySelect = item.querySelector('.convert-quality-select');
    if (qualitySelect) {
      qualitySelect.addEventListener('change', (e) => {
        converterFiles[index].quality = e.target.value;
      });
    }

    const actionBtns = item.querySelectorAll('[data-action]');
    actionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const idx = parseInt(btn.dataset.index);
        if (action === 'start') startConversion(idx);
        else if (action === 'cancel') cancelConversion(idx);
        else if (action === 'remove') removeConverterFile(idx);
      });
    });

    converterQueue.appendChild(item);
  });
}

async function startConversion(index) {
  const file = converterFiles[index];
  if (!file || file.status !== 'pending') return;

  file.status = 'converting';
  file.progress = 0;
  renderConverterQueue();

  try {
    const res = await fetch('/api/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputPath: file.path,
        outputFormat: file.outputFormat,
        quality: file.quality,
        outputPath: state.converterSavePath
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed');
    file.serverId = data.id;
    toast(t('toastConvertStarted'), 'info');
  } catch (err) {
    file.status = 'error';
    toast(t('toastConvertError') + ': ' + err.message, 'error');
  }
  renderConverterQueue();
}

async function cancelConversion(index) {
  const file = converterFiles[index];
  if (!file || !file.serverId) return;

  try {
    await fetch(`/api/cancel-convert/${file.serverId}`, { method: 'POST' });
    file.status = 'cancelled';
    toast(t('converterCancelled'), 'info');
  } catch (err) {}
  renderConverterQueue();
}

function removeConverterFile(index) {
  converterFiles.splice(index, 1);
  renderConverterQueue();
}

function handleConvertProgress(msg) {
  const { id, conversion } = msg;
  const file = converterFiles.find(f => f.serverId === id);
  if (!file) return;

  file.progress = conversion.progress || 0;
  file.status = conversion.status;

  if (conversion.status === 'done') {
    toast(`✅ ${truncate(conversion.outputName || 'File')}`, 'success');
  } else if (conversion.status === 'error') {
    toast(t('toastConvertError'), 'error');
  }

  renderConverterQueue();
}


// ── Init ───────────────────────────────────────────────────────────────────
(async () => {
  // 1. Parallel fetch of startup state, config, and downloads
  try {
    const [serverState, configData, downloadsData] = await Promise.all([
      fetch('/api/app-state').then(r => r.json()).catch(() => null),
      fetch('/api/config').then(r => r.json()).catch(() => null),
      fetch('/api/downloads').then(r => r.json()).catch(() => null)
    ]);

    if (serverState) {
      if (serverState.settings) {
        state.settings = { ...state.settings, ...serverState.settings };
      }
      if (serverState.downloadDefaults) {
        if (serverState.downloadDefaults.savePath) {
          state.savePath = serverState.downloadDefaults.savePath;
          if (savePathInput) savePathInput.value = state.savePath;
        }
        if (serverState.downloadDefaults.converterSavePath) {
          state.converterSavePath = serverState.downloadDefaults.converterSavePath;
          if (converterSavePathInput) converterSavePathInput.value = state.converterSavePath;
        }
        if (serverState.downloadDefaults.format) {
          state.format = serverState.downloadDefaults.format;
          formatBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.val === state.format);
          });
          if (['mp3', 'wav', 'm4a'].includes(state.format)) {
            if (qualitySelect) qualitySelect.disabled = true;
          } else {
            if (qualitySelect) qualitySelect.disabled = false;
          }
        }
        if (serverState.downloadDefaults.quality && qualitySelect) {
          qualitySelect.value = serverState.downloadDefaults.quality;
        }
        if (serverState.downloadDefaults.embedThumbnail !== undefined && thumbnailToggle) {
          thumbnailToggle.checked = Boolean(serverState.downloadDefaults.embedThumbnail);
        }
      }
      // Always start at the Home page on every application launch
      setActiveTab('home');
      saveActiveTab('home');
      if (serverState.history) {
        serverHistory = serverState.history;
      }
    }

    if (configData) {
      if (!state.savePath && configData.defaultPath) {
        state.savePath = configData.defaultPath;
        if (savePathInput) savePathInput.value = state.savePath;
      }
      if (!state.converterSavePath) {
        state.converterSavePath = configData.converterSavePath || state.savePath;
        if (converterSavePathInput) converterSavePathInput.value = state.converterSavePath;
      }
    }

    if (downloadsData) {
      if (Array.isArray(downloadsData.active)) {
        downloadsData.active.forEach(dl => state.activeDownloads.set(dl.id, dl));
      }
      renderHistory(downloadsData.history);
    }
  } catch {}

  applySettings();

  // 2. Format buttons state
  if (state.format) {
    formatBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.val === state.format);
    });
    if (['mp3', 'wav', 'm4a'].includes(state.format)) {
      if (qualitySelect) qualitySelect.disabled = true;
    }
  }

  // 3. Render history
  renderHistoryTab();

  // 4. One-time migration from legacy localStorage if any
  try {
    const oldSettings = localStorage.getItem('nuu_settings');
    const oldHistory = localStorage.getItem('nuu_history');
    const oldConverterPath = localStorage.getItem('nuu_converter_save_path');

    if (oldSettings || oldHistory) {
      let migrationPayload = {};
      if (oldSettings) {
        try { migrationPayload.settings = JSON.parse(oldSettings); } catch {}
      }
      if (oldHistory) {
        try { migrationPayload.history = JSON.parse(oldHistory); } catch {}
      }
      if (oldConverterPath) {
        migrationPayload.converterSavePath = oldConverterPath;
      }

      const migrateRes = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(migrationPayload)
      });
      const migrated = await migrateRes.json();

      if (migrated.settings) state.settings = { ...state.settings, ...migrated.settings };
      if (migrated.history) renderHistory(migrated.history);

      localStorage.removeItem('nuu_settings');
      localStorage.removeItem('nuu_history');
      localStorage.removeItem('nuu_converter_save_path');
      applySettings();
    }
  } catch {}

  // 5. Intercept link clicks to open in default browser
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="http"]');
    if (link) {
      e.preventDefault();
      const url = link.getAttribute('href');
      if (window.electronAPI?.openExternal) {
        window.electronAPI.openExternal(url);
      } else {
        window.open(url, '_blank');
      }
    }
  });
})();

