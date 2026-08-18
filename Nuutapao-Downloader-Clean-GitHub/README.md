# 🦊 Nuutapao Downloader

<p align="center">
  <img src="public/logo.png" alt="Nuutapao Downloader Logo" width="160" />
</p>

<p align="center">
  <b>A sleek, adorable, and high-performance video & audio downloader powered by yt-dlp and Electron.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Windows-blue.svg" alt="Platform Windows" />
  <img src="https://img.shields.io/badge/Node.js-18%2B-green.svg" alt="Node Version" />
  <img src="https://img.shields.io/badge/License-MIT-orange.svg" alt="License MIT" />
</p>

---

## ✨ Features

- ⚡ **Multi-Threaded Turbo Downloads**: Spawns optimized `yt-dlp` processes with fragment-level multi-threading for maximum download speeds.
- 🌐 **Comprehensive Platform Support**: Works with YouTube, TikTok, Instagram, Facebook, X (Twitter), Bilibili, Douyin, Reddit, Twitch, SoundCloud, Vimeo, and more.
- 🎨 **Adorable & Modern UI**: Tailored pastel/vibrant theme with light/dark mode support, cute animations, and responsive controls.
- 🇹🇭 **Full Multilingual Support**: Preserves all international characters (Thai, Japanese, Chinese, Korean, Arabic, Cyrillic, etc.) in video titles and metadata with native typography.
- 🔄 **Built-in File Converter**: Convert downloaded or local video, audio, and image files to MP4, WebM, MKV, MP3, WAV, M4A, PNG, and JPG.
- 🍪 **Advanced Cookie & Auth Handling**: Import cookies directly from browsers (Chrome, Edge, Brave, Opera, etc.) or use a Netscape `cookies.txt` file for private, member-only, and age-restricted downloads.
- 🔒 **Secure DNS (DoH) & Proxy / VPN**: Integrated Secure DNS-over-HTTPS (Cloudflare, Google, OpenDNS) and SOCKS5/HTTP proxy support to bypass ISP domain blocks.
- 🚀 **Auto-Updating Engine**: Automatically keeps `yt-dlp` up to date to adapt to website changes.

---

## 📥 Installation

Download the latest installer from the **[Releases](https://github.com/)** page:
- **`Setup.exe`** / **`Nuutapao Downloader Setup 2.6.7.exe`**: Standard Windows installer with start menu and desktop shortcuts.

---

## 🛠️ Development & Building from Source

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

### 1. Clone the repository
```bash
git clone https://github.com/your-username/nuutapao-downloader.git
cd nuutapao-downloader
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development mode
```bash
npm start
```

### 4. Run automated tests
```bash
npm test
```

### 5. Build production installers
```bash
# Build standard NSIS installer (dist/Nuutapao Downloader Setup 2.6.7.exe)
npm run build

# Build custom animated UI installer (dist/Nuutapao Downloader Custom Setup 2.6.7.exe)
npm run build:custom-setup
```

---

## 📂 Project Structure

```
Nuutapao Downloader/
├── main.js                  # Electron main process & window management
├── preload.js               # IPC preload bridge
├── server.js                # Express & WebSocket backend for yt-dlp/ffmpeg
├── app-state.js             # Atomic persistence & profile store
├── installer.nsh            # NSIS installer scripting
├── package.json             # App configuration and dependencies
├── installer/               # Custom UI installer source
├── public/                  # Frontend UI (HTML, CSS, JS, Assets)
├── scripts/                 # Custom build and packaging scripts
├── test/                    # Node test suite (32 unit tests)
└── tools/                   # Bundled yt-dlp binaries and notices
```

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
Bundled third-party binaries (`yt-dlp` and `FFmpeg`) are distributed under their respective open-source licenses (see `tools/NOTICE.txt`).
