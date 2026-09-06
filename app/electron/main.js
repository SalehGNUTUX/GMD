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

/**
 * المهامُّ الجارية، لكلٍّ معرِّفٌ يُولِّده المُصيِّر قبل الطلب.
 *
 * كان الحال مقبضاً واحداً (`activeChild`) وعَلَمَ إلغاءٍ واحداً على مستوى الوحدة،
 * فطلبٌ ثانٍ أثناء الأوّل يدهسه: يُصفّر إلغاءه، ويسرق مقبضه، فيقتل `cancel-command`
 * آخرَ ما بدأ لا ما قصده المستخدم. والأحداث لا تحمل إلّا العنوان فلا يُميَّز خرجُ
 * مهمّةٍ من أختها. وبالمعرِّف صار لكلّ مهمّةٍ مقبضُها وإلغاؤها ومسارُ خرجها.
 *
 * القيمة: `{ child, cancelled, title }`.
 */
const jobs = new Map()

/** يمنع نافذة السؤال من الظهور مرّتين حين نُغلق النافذة بأنفسنا بعد الموافقة. */
let closeConfirmed = false

/** يقتل عمليّة مهمّةٍ ويَسِمها ملغاةً؛ تُستعمل للإلغاء وللإغلاق. */
function killJob(job) {
  if (!job) return false
  job.cancelled = true
  const child = job.child
  if (!child) return true
  try {
    child.kill('SIGTERM')
    setTimeout(() => { try { child.kill('SIGKILL') } catch {} }, 2000)
  } catch {}
  return true
}

/**
 * نصٌّ بلغة الواجهة. عمليّة main لا ترى i18next الذي يعمل في المُصيِّر، ولغة
 * المستخدم محفوظة في localStorage هناك — فتُقرأ من لغة النظام، وهي ما اختاره
 * المستخدم في الغالب. والبديل تمرير كلّ نصّ عبر IPC لأجل نافذتَي حوار.
 */
function t(ar, en) {
  const locale = (app.getLocale() || '').toLowerCase()
  return locale.startsWith('ar') ? ar : en
}

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

  // إغلاق النافذة وتنزيلٌ جارٍ يقتل العمليّة الابنة فيضيع ما نزل. وخلافاً لنسخة
  // الهاتف لا خدمة تُكمل هنا، فالسؤال قبل الإغلاق هو كلّ ما يمنع الضياع.
  mainWindow.on('close', event => {
    if (jobs.size === 0 || closeConfirmed) return
    event.preventDefault()
    const { response } = { response: dialog.showMessageBoxSync(mainWindow, {
      type: 'question',
      buttons: [t('ابقَ', 'Stay'), t('أغلق وألغِ التنزيل', 'Close and cancel')],
      defaultId: 0,
      cancelId: 0,
      title: t('تنزيلٌ جارٍ', 'Download in progress'),
      message: jobs.size > 1
        ? t(`هناك ${jobs.size} مهامّ جارية الآن.`, `${jobs.size} jobs are running.`)
        : t('هناك تنزيلٌ جارٍ الآن.', 'A download is running.'),
      detail: t(
        'إغلاق النافذة يُلغيه وما نزل يُهمَل. أتغلق؟',
        'Closing the window cancels it and discards what has been downloaded. Close anyway?',
      ),
    }) }
    if (response === 1) {
      closeConfirmed = true
      jobs.forEach(killJob)
      mainWindow.close()
    }
  })

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
/**
 * ينفّذ مهامَّ متتابعةً تحت معرِّفٍ واحد، ويبثُّ خرجها موسوماً بذلك المعرِّف.
 *
 * [jobId] يُولِّده المُصيِّر قبل الطلب لأنّ الخرج يبدأ بالوصول قبل أن يعود ردُّ
 * هذا النداء — فلو وَلَّدَه main لما عرف المُصيِّر لمن يُنسَب أوّلُ سطر. ومهمّتان
 * بمعرِّفٍ واحد لا تجتمعان: الثانية تُرَدُّ فوراً بدل أن تدهس الأولى.
 */
ipcMain.handle('run-command', async (event, { jobs: list0, title, jobId }) => {
  const list = Array.isArray(list0) ? list0.filter(j => j && j.bin) : []
  const id = String(jobId || `job-${Date.now()}`)
  if (!list.length) return { success: false, output: '', code: null, cancelled: false, jobId: id }
  if (jobs.has(id)) {
    return { success: false, output: '[gmd] a job with this id is already running\n',
             code: null, cancelled: false, jobId: id }
  }

  const job = { child: null, cancelled: false, title }
  jobs.set(id, job)

  let output = ''
  let lastCode = 0
  let failed = false

  const send = (data, type, jobIndex) => {
    output += data
    mainWindow?.webContents.send('command-output', {
      jobId: id, title, data, type, jobIndex: jobIndex + 1, jobCount: list.length
    })
  }

  try {
    for (let i = 0; i < list.length; i++) {
      if (job.cancelled) break
      const { bin, args, outFile } = list[i]
      const argv = Array.isArray(args) ? args.map(String) : []
      log(`Running ${id} [${i + 1}/${list.length}]: ${bin} ${JSON.stringify(argv)}`)

      lastCode = await new Promise(resolve => {
        let settled = false
        const finish = code => {
          if (settled) return
          settled = true
          job.child = null
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
        job.child = child
        child.stdout.on('data', d => send(d.toString(), 'stdout', i))
        child.stderr.on('data', d => send(d.toString(), 'stderr', i))
        child.on('error', e => { send(`[gmd] ${e.message}\n`, 'stderr', i); finish(127) })
        child.on('close', code => finish(code))
      })

      // null / SIGINT / SIGTERM mean the user cancelled, not that the job failed
      if (job.cancelled || lastCode === null || lastCode === 130 || lastCode === 143) {
        job.cancelled = true
        break
      }
      if (lastCode !== 0) { failed = true; break }
      if (outFile && !fs.existsSync(outFile)) {
        send(`[gmd] expected output file was not created: ${outFile}\n`, 'stderr', i)
        failed = true
        break
      }
    }
  } finally {
    jobs.delete(id)
  }

  const cancelled = job.cancelled
  const success = !cancelled && !failed
  mainWindow?.webContents.send('command-done', { jobId: id, title, success, output, cancelled })
  return { success, output, code: lastCode, cancelled, jobId: id }
})

// ── Cancel a running command ─────────────────────────────────────────────────
/**
 * [jobId] المهمّة المقصودة. وبلا معرِّفٍ تُلغى كلُّ المهامّ — وهو ما يفعله زرُّ
 * «أوقف الكلّ». والعَلَمُ يوقف أيضاً ما لم يبدأ من مهامّ المتتابعة.
 */
ipcMain.handle('cancel-command', async (event, jobId) => {
  if (jobId) return killJob(jobs.get(String(jobId)))
  if (jobs.size === 0) return false
  jobs.forEach(killJob)
  return true
})

/** ما يجري الآن، ليستعيد المُصيِّر حالته بعد إعادة تحميل الواجهة. */
ipcMain.handle('running-jobs', async () =>
  Array.from(jobs.entries()).map(([id, j]) => ({ jobId: id, title: j.title })))

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

// ── ملفُّ العملِ المؤقّتُ للاقتصاص ────────────────────────────────────────────
//
// المسلكُ الثاني للاقتصاصِ يُنزّلُ المادّةَ كاملةً ثمّ يقتصُّها، فيبقى الكاملُ
// على القرصِ ولا حاجةَ إليه. والحذفُ مقصورٌ على ما أنشأناه نحن: اسمٌ ببادئتِنا
// ولاحقةِ وسائطٍ معروفة، وإلّا صارَ النداءُ ممحاةً لأيِّ مسارٍ يُرسَلُ إليه.
const CLIP_TEMP_PREFIX = 'gmd-clip-'

ipcMain.handle('delete-temp', async (event, filePath) => {
  const target = path.resolve(String(filePath || ''))
  const name = path.basename(target)
  if (!name.startsWith(CLIP_TEMP_PREFIX)) return false
  const ext = path.extname(name).toLowerCase()
  if (!VIDEO_EXT.has(ext) && !AUDIO_EXT.has(ext)) return false
  try { fs.unlinkSync(target); return true } catch (e) { return false }
})

// ── المعرض: ما في مجلَّدَي الحفظ ──────────────────────────────────────────────
//
// نسخةُ الهاتفِ تقرأُ `Movies/GMD` و`Music/GMD` لأنّ أندرويد يفرضُهما، وهنا
// المسارُ يختارُه المستخدم — فيُقرَأُ مجلَّدا الحفظِ الافتراضيّانِ من الإعدادات،
// ومعهما مستوىً واحدٌ من المجلَّدات: كلُّ قائمةِ تشغيلٍ تُنزَّلُ في مجلَّدٍ باسمِها،
// فذلك المستوى هو القوائم، وما في الجذرِ مفردات.
const VIDEO_EXT = new Set(['.mp4', '.mkv', '.webm', '.avi', '.mov', '.m4v', '.ts', '.flv'])
const AUDIO_EXT = new Set(['.mp3', '.m4a', '.opus', '.flac', '.wav', '.ogg', '.oga', '.aac'])

const COVER_DIR = () => path.join(app.getPath('userData'), 'covers')

function scanDir(dir, folder, out, depth) {
  let entries
  try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch (e) { return }
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (depth > 0) scanDir(full, entry.name, out, depth - 1)
      continue
    }
    if (!entry.isFile()) continue
    const ext = path.extname(entry.name).toLowerCase()
    const isAudio = AUDIO_EXT.has(ext)
    if (!isAudio && !VIDEO_EXT.has(ext)) continue
    let st
    try { st = fs.statSync(full) } catch (e) { continue }
    if (!st.size) continue
    out.push({
      path: full,
      name: entry.name,
      folder,
      isAudio,
      size: st.size,
      mtime: Math.floor(st.mtimeMs),
    })
  }
}

ipcMain.handle('gallery-list', async (event, roots) => {
  const seen = new Set()
  const out = []
  for (const root of [].concat(roots || [])) {
    if (!root) continue
    const resolved = path.resolve(String(root))
    if (seen.has(resolved) || !fs.existsSync(resolved)) continue
    seen.add(resolved)
    scanDir(resolved, null, out, 1)
  }
  // ما في المعرضِ مقروءٌ للمشغّلِ الداخليّ: `media://` لا يخدمُ إلّا ما اختارَه
  // المستخدم، ومجلَّدُ الحفظِ اختيارُه
  remember(out.map(e => e.path))
  out.sort((a, b) => b.mtime - a.mtime)
  return out
})

/**
 * صورةُ المقطع: إطارٌ من المرئيِّ أو غلافٌ مدموجٌ في الصوت.
 *
 * تُستخرَجُ مرّةً وتُخزَّنُ في `userData/covers` ببصمةِ المسارِ وحجمِه وزمنِه، فلا
 * يُشغَّلُ ffmpeg على ملفٍّ مرّتين. ومن لا صورةَ له تُكتَبُ له علامةٌ فارغةٌ فلا
 * يُعادُ السؤالُ عنه كلَّما فُتِحَ المعرض.
 */
ipcMain.handle('gallery-thumb', async (event, filePath) => {
  const target = path.resolve(String(filePath || ''))
  if (!pickedFiles.has(target)) return null
  let st
  try { st = fs.statSync(target) } catch (e) { return null }

  const key = require('crypto').createHash('sha1')
    .update(`${target}:${st.size}:${Math.floor(st.mtimeMs)}`).digest('hex')
  const dir = COVER_DIR()
  ensureDir(dir)
  const jpg = path.join(dir, key + '.jpg')
  const none = path.join(dir, key + '.none')

  if (fs.existsSync(none)) return null
  if (fs.existsSync(jpg)) {
    try { return 'data:image/jpeg;base64,' + fs.readFileSync(jpg).toString('base64') }
    catch (e) { return null }
  }

  const isAudio = AUDIO_EXT.has(path.extname(target).toLowerCase())
  // الصوتُ: الغلافُ تيّارُ صورةٍ داخلَه. والمرئيُّ: إطارٌ بعدَ ثوانٍ من أوّلِه —
  // فأوّلُ إطارٍ سوادٌ في أكثرِ المقاطع.
  const argv = isAudio
    ? ['-v', 'error', '-i', target, '-an', '-frames:v', '1',
       '-vf', 'scale=320:-1', '-y', jpg]
    : ['-v', 'error', '-ss', '3', '-i', target, '-frames:v', '1',
       '-vf', 'scale=320:-1', '-y', jpg]

  const ok = await new Promise(resolve => {
    execFile('ffmpeg', argv, { timeout: 20000 }, error => resolve(!error))
  })
  if (!ok || !fs.existsSync(jpg) || !fs.statSync(jpg).size) {
    try { fs.writeFileSync(none, '') } catch (e) {}
    try { if (fs.existsSync(jpg)) fs.unlinkSync(jpg) } catch (e) {}
    return null
  }
  try { return 'data:image/jpeg;base64,' + fs.readFileSync(jpg).toString('base64') }
  catch (e) { return null }
})

/** الحذفُ إلى سلّةِ المهملاتِ لا محواً: خطأُ نقرةٍ لا يُهلِكُ تنزيلَ ساعة. */
ipcMain.handle('gallery-trash', async (event, paths) => {
  const list = [].concat(paths || [])
  let done = 0
  let message = null
  for (const p of list) {
    const target = path.resolve(String(p))
    if (!pickedFiles.has(target)) continue
    try { await shell.trashItem(target); done++; pickedFiles.delete(target) }
    catch (e) { message = e.message || String(e) }
  }
  return { count: done, error: done === list.length ? null : message }
})

ipcMain.handle('gallery-reveal', async (event, filePath) => {
  const target = path.resolve(String(filePath || ''))
  if (!pickedFiles.has(target)) return false
  shell.showItemInFolder(target)
  return true
})

ipcMain.handle('gallery-open', async (event, filePath) => {
  const target = path.resolve(String(filePath || ''))
  if (!pickedFiles.has(target)) return false
  const err = await shell.openPath(target)
  return !err
})

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
