const { app, BrowserWindow, ipcMain, dialog, shell, protocol } = require('electron')
const path = require('path')
const { spawn, exec } = require('child_process')
const fs = require('fs')
const os = require('os')

// Must be called before app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app',   privileges: { secure: true, standard: true, supportFetchAPI: true } },
  { scheme: 'media', privileges: { secure: true, bypassCSP: true, stream: true, supportFetchAPI: true } }
])

const isDev = !app.isPackaged
const BIN_DIR = path.join(os.homedir(), '.local', 'bin')
const YTDLP = path.join(BIN_DIR, 'yt-dlp')
const LOG_FILE = path.join(os.homedir(), '.config', 'gmd-gui', 'gmd.log')

let mainWindow
let activeChild = null

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function log(msg) {
  try {
    ensureDir(path.dirname(LOG_FILE))
    fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${msg}\n`)
  } catch(e) {}
}

async function showDialog(fn) {
  if (mainWindow) {
    mainWindow.moveTop()
    mainWindow.focus()
  }
  const result = await fn()
  if (mainWindow) {
    mainWindow.moveTop()
    mainWindow.focus()
  }
  return result
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 900,
    minHeight: 600,
    title: 'GMD v26.05',
    icon: path.join(__dirname, '../public/gmd-icon.png'),
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadURL('app://localhost/index.html')
  }

  mainWindow.once('ready-to-show', () => mainWindow.show())
}

// Register 'app://' protocol before window creation to bypass ASAR file:// restriction in Electron v28+
// With standard: true, URLs are parsed as app://hostname/pathname — use 'localhost' as host
app.whenReady().then(() => {
  protocol.registerFileProtocol('app', (request, callback) => {
    const { pathname } = new URL(request.url)
    const filePath = pathname === '/' ? 'index.html' : pathname.slice(1)
    callback({ path: path.normalize(path.join(__dirname, '../dist', decodeURIComponent(filePath))) })
  })

  // Serve local filesystem files for media preview (video/audio player)
  protocol.registerFileProtocol('media', (request, callback) => {
    const filePath = decodeURIComponent(request.url.slice('media://'.length))
    callback({ path: filePath })
  })

  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// ── Window controls ──────────────────────────────────────────────────────────
ipcMain.handle('minimize', () => mainWindow?.minimize())
ipcMain.handle('maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize()
  else mainWindow?.maximize()
})
ipcMain.handle('close', () => mainWindow?.close())

// ── Open external link ───────────────────────────────────────────────────────
ipcMain.handle('open-external', (event, url) => shell.openExternal(url))

// ── File / folder dialogs ────────────────────────────────────────────────────
ipcMain.handle('select-folder', async () => {
  return showDialog(() => dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    defaultPath: path.join(os.homedir(), 'Downloads')
  })).then(result => result.canceled ? null : result.filePaths[0])
})

ipcMain.handle('select-file', async () => {
  return showDialog(() => dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      {
        name: 'Media & Image Files',
        extensions: ['mp4', 'mkv', 'avi', 'mov', 'webm', 'flv',
                     'mp3', 'm4a', 'flac', 'wav', 'ogg', 'opus',
                     'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'svg']
      },
      { name: 'All Files', extensions: ['*'] }
    ]
  })).then(result => result.canceled ? null : result.filePaths[0])
})

ipcMain.handle('select-multiple-files', async () => {
  return showDialog(() => dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      {
        name: 'Media & Image Files',
        extensions: ['mp4', 'mkv', 'avi', 'mov', 'webm', 'flv',
                     'mp3', 'm4a', 'flac', 'wav', 'ogg', 'opus',
                     'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff']
      },
      { name: 'All Files', extensions: ['*'] }
    ]
  })).then(result => result.canceled ? [] : result.filePaths)
})

ipcMain.handle('open-folder', async (event, folderPath) => shell.openPath(folderPath))

// ── Dependency checks ────────────────────────────────────────────────────────
ipcMain.handle('check-ytdlp', async () =>
  fs.existsSync(YTDLP) && fs.statSync(YTDLP).isFile()
)

ipcMain.handle('check-ffmpeg', async () =>
  new Promise(resolve => exec('which ffmpeg', e => resolve(!e)))
)

ipcMain.handle('check-tool', async (event, tool) =>
  new Promise(resolve => exec(`which ${tool}`, e => resolve(!e)))
)

ipcMain.handle('get-tool-version', async (event, tool) =>
  new Promise(resolve => {
    const cmds = {
      'yt-dlp': `"${YTDLP}" --version`,
      'wget':   'wget --version',
      'aria2c': 'aria2c --version',
      'ffmpeg': 'ffmpeg -version',
    }
    const cmd = cmds[tool]
    if (!cmd) { resolve(null); return }
    exec(cmd, { timeout: 5000 }, (error, stdout) => {
      if (error || !stdout) { resolve(null); return }
      const m = stdout.match(/(\d+\.\d+[\d.]*[-\w]*)/)?.[1] || null
      resolve(m)
    })
  })
)

// ── Package manager detection ─────────────────────────────────────────────────
ipcMain.handle('detect-package-manager', async () => {
  const managers = ['apt', 'dnf', 'pacman', 'zypper', 'yum', 'apk', 'emerge']
  for (const pm of managers) {
    const found = await new Promise(r => exec(`which ${pm}`, e => r(!e)))
    if (found) return pm
  }
  return null
})

// ── Install tool via package manager ─────────────────────────────────────────
ipcMain.handle('install-tool', async (event, { tool, pm }) => {
  const pkgName = tool === 'aria2c' ? 'aria2' : tool
  let installCmd
  switch (pm) {
    case 'apt':    installCmd = `apt install -y ${pkgName}`; break
    case 'dnf':    installCmd = `dnf install -y ${pkgName}`; break
    case 'pacman': installCmd = `pacman -S --noconfirm ${pkgName}`; break
    case 'zypper': installCmd = `zypper install -y ${pkgName}`; break
    case 'yum':    installCmd = `yum install -y ${pkgName}`; break
    case 'apk':    installCmd = `apk add ${pkgName}`; break
    default: return { success: false, error: 'unsupported', cmd: `sudo ${pm} install ${pkgName}` }
  }

  return new Promise(resolve => {
    const child = spawn('pkexec', installCmd.split(' '), { stdio: ['ignore', 'pipe', 'pipe'] })
    let out = ''
    child.stdout?.on('data', d => { out += d.toString() })
    child.stderr?.on('data', d => { out += d.toString() })
    child.on('close', code => {
      if (code === 0) resolve({ success: true })
      else resolve({ success: false, error: out, cmd: `sudo ${installCmd}` })
    })
    child.on('error', () => {
      resolve({ success: false, error: 'pkexec not found', cmd: `sudo ${installCmd}` })
    })
  })
})

// ── yt-dlp install / update ──────────────────────────────────────────────────
ipcMain.handle('install-ytdlp', async () => {
  ensureDir(BIN_DIR)
  return new Promise(resolve => {
    const cmd = `curl -fsSL 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp' -o "${YTDLP}" && chmod a+rx "${YTDLP}"`
    exec(cmd, (error, stdout, stderr) => {
      if (error) { log(`yt-dlp install error: ${error.message}`); resolve({ success: false, error: error.message }) }
      else resolve({ success: true })
    })
  })
})

ipcMain.handle('update-ytdlp', async () =>
  new Promise(resolve => {
    exec(`"${YTDLP}" -U`, (error, stdout) => {
      if (error) resolve({ success: false, error: error.message })
      else resolve({ success: true, output: stdout })
    })
  })
)

// ── Run command (streaming) ──────────────────────────────────────────────────
ipcMain.handle('run-command', async (event, { cmd, title }) =>
  new Promise(resolve => {
    log(`Running: ${cmd}`)
    const child = spawn('bash', ['-c', cmd])
    activeChild = child
    let output = ''

    child.stdout.on('data', data => {
      const str = data.toString()
      output += str
      mainWindow.webContents.send('command-output', { title, data: str, type: 'stdout' })
    })

    child.stderr.on('data', data => {
      const str = data.toString()
      output += str
      mainWindow.webContents.send('command-output', { title, data: str, type: 'stderr' })
    })

    child.on('close', code => {
      activeChild = null
      const cancelled = code === null || code === 130 || code === 143
      const success = !cancelled && code === 0 && !output.match(/error|ERROR|failed|فشل/i)
      mainWindow.webContents.send('command-done', { title, success, output, cancelled })
      resolve({ success, output, code, cancelled })
    })
  })
)

// ── Cancel active command ─────────────────────────────────────────────────────
ipcMain.handle('cancel-command', async () => {
  if (activeChild) {
    try {
      activeChild.kill('SIGTERM')
      setTimeout(() => { try { activeChild?.kill('SIGKILL') } catch(e) {} }, 2000)
    } catch(e) {}
    activeChild = null
    return true
  }
  return false
})

// ── Check if URL is a playlist ────────────────────────────────────────────────
ipcMain.handle('check-playlist', async (event, url) =>
  new Promise(resolve => {
    const cmd = `"${YTDLP}" --flat-playlist --dump-single-json --no-warnings "${url}"`
    exec(cmd, { timeout: 20000 }, (error, stdout) => {
      if (error || !stdout) { resolve(null); return }
      try {
        const info = JSON.parse(stdout)
        if (info._type === 'playlist' || (info.entries && info.entries.length > 1)) {
          const entries = (info.entries || []).map((e, i) => ({
            index: i + 1,
            title: e.title || e.id || `Video ${i + 1}`,
            duration: e.duration_string || ''
          }))
          resolve({ isPlaylist: true, title: info.title || '', count: entries.length, entries })
        } else {
          resolve({ isPlaylist: false })
        }
      } catch(e) { resolve({ isPlaylist: false }) }
    })
  })
)

// ── Media info (online) ──────────────────────────────────────────────────────
ipcMain.handle('get-media-info', async (event, url) =>
  new Promise(resolve => {
    exec(`"${YTDLP}" --dump-json "${url}"`, { timeout: 30000 }, (error, stdout) => {
      if (error || !stdout) { resolve(null); return }
      try {
        const info = JSON.parse(stdout)
        resolve({
          title:      info.title || '—',
          uploader:   info.uploader || '—',
          duration:   info.duration_string || String(info.duration || '—'),
          resolution: info.resolution || '—',
          ext:        info.ext || '—',
          views:      info.view_count ? info.view_count.toLocaleString() : '—',
          webpage_url: info.webpage_url || url
        })
      } catch(e) { resolve(null) }
    })
  })
)

// ── File info (local, via ffprobe) ───────────────────────────────────────────
ipcMain.handle('get-file-info', async (event, filePath) => {
  return new Promise(resolve => {
    const escaped = filePath.replace(/"/g, '\\"')
    exec(`ffprobe -v quiet -print_format json -show_format -show_streams "${escaped}"`,
      { timeout: 15000 },
      (error, stdout) => {
        if (error || !stdout) { resolve(null); return }
        try {
          const data = JSON.parse(stdout)
          const format      = data.format || {}
          const videoStream = (data.streams || []).find(s => s.codec_type === 'video')
          const audioStream = (data.streams || []).find(s => s.codec_type === 'audio')

          const sizeBytes = parseInt(format.size) || 0
          const sizeMB    = (sizeBytes / 1024 / 1024).toFixed(2)
          const durSec    = parseFloat(format.duration) || 0
          const h = Math.floor(durSec / 3600)
          const m = Math.floor((durSec % 3600) / 60)
          const s = Math.floor(durSec % 60)
          const duration = h > 0
            ? `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'00')}`
            : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'00')}`

          resolve({
            size:            `${sizeMB} MB`,
            sizeBytes,
            duration,
            durationSeconds: durSec,
            videoCodec:      videoStream?.codec_name || null,
            audioCodec:      audioStream?.codec_name || null,
            width:           videoStream?.width  || null,
            height:          videoStream?.height || null,
            bitrate:         format.bit_rate ? `${Math.round(parseInt(format.bit_rate)/1000)} kbps` : null,
            isVideo:         !!videoStream,
            isAudio:         !videoStream && !!audioStream
          })
        } catch(e) { resolve(null) }
      }
    )
  })
})

// ── Desktop integration ──────────────────────────────────────────────────────
ipcMain.handle('install-desktop', async () => {
  const desktopDir = path.join(os.homedir(), '.local', 'share', 'applications')
  const iconDir    = path.join(os.homedir(), '.local', 'share', 'icons', 'hicolor', '256x256', 'apps')
  ensureDir(desktopDir)
  ensureDir(iconDir)

  const iconDest = path.join(iconDir, 'gmd.png')
  const iconSrc  = isDev
    ? path.join(__dirname, '../public/gmd-icon.png')
    : path.join(process.resourcesPath, 'public', 'gmd-icon.png')

  if (fs.existsSync(iconSrc)) fs.copyFileSync(iconSrc, iconDest)

  const desktopContent = `[Desktop Entry]
Version=1.0
Name=GMD
GenericName=Media Downloader
Comment=GNU Media Downloader — Download and convert media on GNU/Linux
Exec=${process.execPath}
Icon=${iconDest}
Terminal=false
Type=Application
Categories=AudioVideo;Network;Utility;
Keywords=download;video;audio;youtube;convert;media;
StartupNotify=true
`
  fs.writeFileSync(path.join(desktopDir, 'gmd.desktop'), desktopContent)
  exec(`update-desktop-database "${desktopDir}" 2>/dev/null || true`)
  return true
})

// ── Uninstall ────────────────────────────────────────────────────────────────
ipcMain.handle('uninstall', async () => {
  const toRemove = [
    YTDLP,
    path.join(os.homedir(), '.local', 'share', 'applications', 'gmd.desktop'),
    path.join(os.homedir(), '.local', 'share', 'icons', 'hicolor', '256x256', 'apps', 'gmd.png'),
  ]
  toRemove.forEach(f => { try { fs.unlinkSync(f) } catch(e) {} })
  app.quit()
  return true
})

// ── Misc ─────────────────────────────────────────────────────────────────────
ipcMain.handle('get-app-version', () => '26.05.0')
ipcMain.handle('get-home-dir',    () => os.homedir())
