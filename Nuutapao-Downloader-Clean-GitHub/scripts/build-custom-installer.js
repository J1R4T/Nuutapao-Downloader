const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const winUnpackedDir = path.join(distDir, 'win-unpacked');
const payloadZip = path.join(distDir, 'payload.zip');

console.log('🚀 Step 1: Building core application payload...');

execSync('node ./node_modules/electron-builder/out/cli/cli.js --dir --win --x64', {
  cwd: rootDir,
  stdio: 'inherit'
});

if (!fs.existsSync(winUnpackedDir)) {
  throw new Error('Failed to generate win-unpacked directory.');
}

console.log('📦 Step 2: Creating fast payload archive for instant installer startup...');
if (fs.existsSync(payloadZip)) {
  fs.unlinkSync(payloadZip);
}
// Create single zip archive for lightning-fast installer launch
execSync(`tar -cf "${payloadZip}" -C "${winUnpackedDir}" .`, {
  cwd: rootDir,
  stdio: 'inherit'
});

console.log('✨ Step 3: Packaging Custom Setup Installer...');

const customBuilderConfig = {
  appId: 'com.nuutapao.downloader.customsetup',
  productName: 'Nuutapao Downloader Custom Setup',
  directories: {
    output: 'dist/setup-out'
  },
  files: [
    'installer/**/*',
    'public/Nuutapao Human Head.png',
    'public/Nuutapao petting2.gif',
    'public/Nuutapao border.png',
    'public/logo.png'
  ],
  extraMetadata: {
    main: 'installer/main.js'
  },
  win: {
    target: [
      {
        target: 'portable',
        arch: ['x64']
      }
    ],
    icon: 'public/logo.png',
    artifactName: 'Nuutapao Downloader Custom Setup 2.6.7.exe'
  },
  portable: {
    splashImage: null
  },
  extraResources: [
    {
      from: 'dist/payload.zip',
      to: 'payload.zip'
    }
  ]
};

const configPath = path.join(rootDir, 'custom-installer-builder.json');
fs.writeFileSync(configPath, JSON.stringify(customBuilderConfig, null, 2), 'utf8');

try {
  execSync(`node ./node_modules/electron-builder/out/cli/cli.js --config "${configPath}" --win --x64`, {
    cwd: rootDir,
    stdio: 'inherit'
  });

  const builtExe = path.join(distDir, 'setup-out', 'Nuutapao Downloader Custom Setup 2.6.7.exe');
  const finalExe = path.join(distDir, 'Nuutapao Downloader Custom Setup 2.6.7.exe');
  if (fs.existsSync(builtExe)) {
    if (fs.existsSync(finalExe)) fs.unlinkSync(finalExe);
    fs.copyFileSync(builtExe, finalExe);
    fs.rmSync(path.join(distDir, 'setup-out'), { recursive: true, force: true });
  }

  console.log('\n🎉 Custom Setup Installer built successfully: dist/Nuutapao Downloader Custom Setup 2.6.7.exe\n');
} finally {
  if (fs.existsSync(configPath)) {
    fs.unlinkSync(configPath);
  }
  if (fs.existsSync(payloadZip)) {
    fs.unlinkSync(payloadZip);
  }
}
