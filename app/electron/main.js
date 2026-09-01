const { app, BrowserWindow, ipcMain, dialog, shell, protocol, Menu } = require('electron')
const path = require('path')
const { spawn, execFile } = require('child_process')
const fs = require('fs')
const os = require('os')
const updater = require('./updater')

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
let cancelRequested = false

// Files the user explicitly picked through one of our dialogs. The media://
// protocol serves these and nothing else, so a crafted media:// URL cannot read
// an arbitrary path off the disk.
const pickedFiles = new Set()
function remember(paths) {
  for (const p of [].concat(paths || [])) {
    if (p) pickedFiles.add(path.resolve(p))
  }
  return paths
}
let appLanguage = 'ar'   // kept in sync via 'set-language' IPC

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
    title: `GMD v${app.getVersion()}`,
    icon: isDev
      ? path.join(__dirname, '../public/gmd-icon.png')
      : path.join(process.resourcesPath, 'app.asar.unpacked', 'public', 'gmd-icon.png'),
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

  // Native right-click context menu for editable fields
  mainWindow.webContents.on('context-menu', (event, params) => {
    if (!params.isEditable && !params.selectionText) return
    const ar = appLanguage === 'ar'
    const menu = Menu.buildFromTemplate([
      { label: ar ? 'قص'          : 'Cut',        role: 'cut',       enabled: params.editFlags.canCut },
      { label: ar ? 'نسخ'         : 'Copy',       role: 'copy',      enabled: params.editFlags.canCopy },
      { label: ar ? 'لصق'         : 'Paste',      role: 'paste',     enabled: params.editFlags.canPaste },
      { type: 'separator' },
      { label: ar ? 'تحديد الكل'  : 'Select All', role: 'selectAll' },
    ])
    menu.popup({ window: mainWindow })
  })
}

// Register 'app://' protocol before window creation to bypass ASAR file:// restriction in Electron v28+
// With standard: true, URLs are parsed as app://hostname/pathname — use 'localhost' as host
app.whenReady().then(() => {
  protocol.registerFileProtocol('app', (request, callback) => {
    const { pathname } = new URL(request.url)
    const filePath = pathname === '/' ? 'index.html' : pathname.slice(1)
    callback({ path: path.normalize(path.join(__dirname, '../dist', decodeURIComponent(filePath))) })
  })

  // Serve local files for the in-app preview player — restricted to files the
  // user picked through our dialogs (see pickedFiles).
  protocol.registerFileProtocol('media', (request, callback) => {
    const requested = path.resolve(decodeURIComponent(request.url.slice('media://'.length)))
    if (!pickedFiles.has(requested)) {
      log(`media:// denied for un-picked path: ${requested}`)
      callback({ error: -10 })   // net::ERR_ACCESS_DENIED
      return
    }
    callback({ path: requested })
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
  })).then(result => result.canceled ? null : remember(result.filePaths)[0])
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
  })).then(result => result.canceled ? [] : remember(result.filePaths))
})

ipcMain.handle('open-folder', async (event, folderPath) => shell.openPath(folderPath))

// ── Dependency checks ────────────────────────────────────────────────────────
ipcMain.handle('check-ytdlp', async () =>
  fs.existsSync(YTDLP) && fs.statSync(YTDLP).isFile()
)

ipcMain.handle('check-ffmpeg', async () =>
  new Promise(resolve => execFile('which', ['ffmpeg'], e => resolve(!e)))
)

ipcMain.handle('check-tool', async (event, tool) =>
  new Promise(resolve => execFile('which', [String(tool)], e => resolve(!e)))
)

ipcMain.handle('get-tool-version', async (event, tool) =>
  new Promise(resolve => {
    const cmds = {
      'yt-dlp': [YTDLP,   ['--version']],
      'wget':   ['wget',   ['--version']],
      'aria2c': ['aria2c', ['--version']],
      'ffmpeg': ['ffmpeg', ['-version']],
    }
    const entry = cmds[tool]
    if (!entry) { resolve(null); return }
    execFile(entry[0], entry[1], { timeout: 5000 }, (error, stdout) => {
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
    const found = await new Promise(r => execFile('which', [pm], e => r(!e)))
    if (found) return pm
  }
  return null
})

// ── Install tool via package manager ─────────────────────────────────────────
ipcMain.handle('install-tool', async (event, { tool, pm }) => {
  const ALLOWED = ['wget', 'aria2c', 'ffmpeg']
  if (!ALLOWED.includes(tool)) return { success: false, error: 'unsupported-tool' }
  const pkgName = tool === 'aria2c' ? 'aria2' : tool

  const RECIPES = {
    apt:    ['apt',    ['install', '-y', pkgName]],
    dnf:    ['dnf',    ['install', '-y', pkgName]],
    pacman: ['pacman', ['-S', '--noconfirm', pkgName]],
    zypper: ['zypper', ['install', '-y', pkgName]],
    yum:    ['yum',    ['install', '-y', pkgName]],
    apk:    ['apk',    ['add', pkgName]],
  }
  const recipe = RECIPES[pm]
  if (!recipe) return { success: false, error: 'unsupported', cmd: `sudo ${pm} install ${pkgName}` }
  const installCmd = [recipe[0], ...recipe[1]].join(' ')

  return new Promise(resolve => {
    const child = spawn('pkexec', [recipe[0], ...recipe[1]], { stdio: ['ignore', 'pipe', 'pipe'] })
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
const YTDLP_URL = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp'

ipcMain.handle('install-ytdlp', async () => {
  ensureDir(BIN_DIR)
  return new Promise(resolve => {
    execFile('curl', ['-fsSL', YTDLP_URL, '-o', YTDLP], { timeout: 300000 }, error => {
      if (error) {
        log(`yt-dlp install error: ${error.message}`)
        resolve({ success: false, error: error.message })
        return
      }
      try {
        fs.chmodSync(YTDLP, 0o755)
        resolve({ success: true })
      } catch (e) {
        log(`yt-dlp chmod error: ${e.message}`)
        resolve({ success: false, error: e.message })
      }
    })
  })
})

ipcMain.handle('update-ytdlp', async () =>
  new Promise(resolve => {
    execFile(YTDLP, ['-U'], { timeout: 300000 }, (error, stdout) => {
      if (error) resolve({ success: false, error: error.message })
      else resolve({ success: true, output: stdout })
    })
  })
)

// ── Run jobs (streaming, sequential) ─────────────────────────────────────────
// jobs: [{ bin, args, outFile? }]
// Arguments are passed as an argv array and NEVER through a shell, so a URL or a
// file path containing $(...), backticks or quotes is data, not code.
// Success is decided by exit code (plus the existence of outFile when given) —
// never by grepping the output for the word "error", which yt-dlp and ffmpeg
// both print on recoverable warnings.
ipcMain.handle('run-command', async (event, { jobs, title }) => {
  const list = Array.isArray(jobs) ? jobs.filter(j => j && j.bin) : []
  if (!list.length) return { success: false, output: '', code: null, cancelled: false }

  cancelRequested = false
  let output = ''
  let lastCode = 0
  let failed = false

  const send = (data, type, jobIndex) => {
    output += data
    mainWindow?.webContents.send('command-output', {
      title, data, type, jobIndex: jobIndex + 1, jobCount: list.length
    })
  }

  for (let i = 0; i < list.length; i++) {
    if (cancelRequested) break
    const { bin, args, outFile } = list[i]
    const argv = Array.isArray(args) ? args.map(String) : []
    log(`Running [${i + 1}/${list.length}]: ${bin} ${JSON.stringify(argv)}`)

    lastCode = await new Promise(resolve => {
      let settled = false
      const finish = code => {
        if (settled) return
        settled = true
        activeChild = null
        resolve(code)
      }
      let child
      try {
        child = spawn(bin, argv)
      } catch (e) {
        send(`[gmd] ${e.message}\n`, 'stderr', i)
        finish(127)
        return
      }
      activeChild = child
      child.stdout.on('data', d => send(d.toString(), 'stdout', i))
      child.stderr.on('data', d => send(d.toString(), 'stderr', i))
      child.on('error', e => { send(`[gmd] ${e.message}\n`, 'stderr', i); finish(127) })
      child.on('close', code => finish(code))
    })

    // null / SIGINT / SIGTERM mean the user cancelled, not that the job failed
    if (cancelRequested || lastCode === null || lastCode === 130 || lastCode === 143) {
      cancelRequested = true
      break
    }
    if (lastCode !== 0) { failed = true; break }
    if (outFile && !fs.existsSync(outFile)) {
      send(`[gmd] expected output file was not created: ${outFile}\n`, 'stderr', i)
      failed = true
      break
    }
  }

  const cancelled = cancelRequested
  const success = !cancelled && !failed
  cancelRequested = false
  mainWindow?.webContents.send('command-done', { title, success, output, cancelled })
  return { success, output, code: lastCode, cancelled }
})

// ── Cancel active command ─────────────────────────────────────────────────────
ipcMain.handle('cancel-command', async () => {
  cancelRequested = true          // also stops any queued jobs that have not started
  if (activeChild) {
    const child = activeChild
    try {
      child.kill('SIGTERM')
      setTimeout(() => { try { child.kill('SIGKILL') } catch(e) {} }, 2000)
    } catch(e) {}
    return true
  }
  return false
})

// ── Check if URL is a playlist ────────────────────────────────────────────────
ipcMain.handle('check-playlist', async (event, url) =>
  new Promise(resolve => {
    const argv = ['--flat-playlist', '--dump-single-json', '--no-warnings', '--', String(url)]
    execFile(YTDLP, argv, { timeout: 20000, maxBuffer: 32 * 1024 * 1024 }, (error, stdout) => {
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
    execFile(YTDLP, ['--dump-json', '--', String(url)], { timeout: 30000, maxBuffer: 32 * 1024 * 1024 }, (error, stdout) => {
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
    const argv = ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', String(filePath)]
    execFile('ffprobe', argv,
      { timeout: 15000, maxBuffer: 8 * 1024 * 1024 },
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
    : path.join(process.resourcesPath, 'app.asar.unpacked', 'public', 'gmd-icon.png')

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
  execFile('update-desktop-database', [desktopDir], () => {})   // best effort
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

// ── Language sync (for native context menu) ───────────────────────────────────
ipcMain.on('set-language', (event, lang) => { appLanguage = lang })

// ── App self-update ──────────────────────────────────────────────────────────
ipcMain.handle('update-check', async (event, opts) => {
  const r = await updater.check(opts || {})
  log(`update check: ${JSON.stringify({ ok: r.ok, available: r.updateAvailable, version: r.version, channel: r.channel })}`)
  return r
})

ipcMain.handle('update-download', async (event, asset) => {
  const r = await updater.download(asset, p => mainWindow?.webContents.send('update-progress', p))
  log(`update download: ${r.ok ? 'ok ' + r.file : 'failed ' + (r.error || r.cancelled)}`)
  return r
})

ipcMain.handle('update-cancel',  ()             => updater.cancelDownload())
ipcMain.handle('update-install', (event, file)  => updater.install(file))
ipcMain.handle('update-restart', ()             => updater.restart())
ipcMain.handle('update-reveal',  (event, file)  => updater.revealFile(file))
ipcMain.handle('update-channel', async ()       => (await updater.detectChannel()).kind)

// ── Misc ─────────────────────────────────────────────────────────────────────
ipcMain.handle('get-app-version', () => app.getVersion())
ipcMain.handle('get-home-dir',    () => os.homedir())
