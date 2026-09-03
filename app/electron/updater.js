// GMD self-update.
//
// Every control here is backed by real logic: checking hits the GitHub releases
// API, downloading is resumable and verified against the published size, and
// installing takes the path that actually applies to how this copy was packaged.
// An AppImage replaces itself; a deb/rpm copy is handed to the system package
// manager through pkexec; an unpackaged dev tree says so instead of pretending.

const { app, shell } = require('electron')
const https = require('https')
const fs = require('fs')
const path = require('path')
const os = require('os')
const { execFile } = require('child_process')

const REPO = 'SalehGNUTUX/GMD'
const API_HOST = 'api.github.com'
const UA = `GMD/${app.getVersion()} (+https://github.com/${REPO})`
const CACHE_DIR = path.join(os.homedir(), '.cache', 'gmd-gui', 'updates')

let activeDownload = null      // { req, file, aborted }

// ── version helpers ──────────────────────────────────────────────────────────
// الوسوم كُتبت بصيغ شتّى عبر الزمن — "GMD-26.05" و"GMD_1.92..." و"v1.1" — فيُنتزع
// أوّل رقم منقَّط منها بدل الوثوق بشكلها. ومعه لاحقة ما قبل الإصدار إن وُجدت:
// إهمالها كان يجعل "26.9.0-beta.1" و"26.9.0-alpha.1" سواءً في المقارنة، فلا ينتقل
// البرنامج بين إصدارين تجريبيَّين يشتركان في الرقم، ولا من تجريبيّ إلى مستقرّ يحمله.
function parseVersion(str) {
  const m = String(str || '').match(/(\d+)\.(\d+)(?:\.(\d+))?(?:-([0-9A-Za-z.-]+))?/)
  if (!m) return null
  const pre = m[4] ? m[4].split('.').filter(Boolean) : []
  return { num: [Number(m[1]), Number(m[2]), Number(m[3] || 0)], pre }
}

/** نصّ الإصدار كما يُعرض للمستخدم: بلاحقته لا مبتوراً منها. */
function versionText(v) {
  return v.num.join('.') + (v.pre.length ? '-' + v.pre.join('.') : '')
}

/** ترتيب semver: سالبٌ إن كان a أقدم، موجبٌ إن كان أحدث. */
function compareVersion(a, b) {
  for (let i = 0; i < 3; i++) if (a.num[i] !== b.num[i]) return a.num[i] - b.num[i]

  // المستقرّ يسبق ما قبله عند تساوي الرقم: 26.9.0 أحدث من 26.9.0-beta.1
  if (!a.pre.length && !b.pre.length) return 0
  if (!a.pre.length) return 1
  if (!b.pre.length) return -1

  // ثمّ تُقارَن المعرّفات واحداً واحداً: الرقميّ يسبق النصّيّ، والرقميّ يُقارَن
  // عدداً لا حرفاً — فـbeta.10 بعد beta.9 لا قبلها.
  for (let i = 0; i < Math.max(a.pre.length, b.pre.length); i++) {
    if (i >= a.pre.length) return -1
    if (i >= b.pre.length) return 1
    const x = a.pre[i], y = b.pre[i]
    const xn = /^\d+$/.test(x), yn = /^\d+$/.test(y)
    let c
    if (xn && yn) c = Number(x) - Number(y)
    else if (xn) c = -1
    else if (yn) c = 1
    else c = x < y ? -1 : x > y ? 1 : 0
    if (c !== 0) return c
  }
  return 0
}

function isNewer(candidate, current) {
  const a = parseVersion(candidate), b = parseVersion(current)
  if (!a || !b) return false
  return compareVersion(a, b) > 0
}

// ── how was this copy installed? ─────────────────────────────────────────────
function run(bin, args) {
  return new Promise(resolve => {
    execFile(bin, args, { timeout: 8000 }, (err, stdout) => resolve(err ? null : String(stdout)))
  })
}

async function detectChannel() {
  // AppImage sets APPIMAGE to the absolute path of the running image
  if (process.env.APPIMAGE && fs.existsSync(process.env.APPIMAGE)) {
    return { kind: 'appimage', target: process.env.APPIMAGE, ext: '.AppImage' }
  }
  if (!app.isPackaged) {
    return { kind: 'dev', target: process.execPath, ext: null }
  }
  const exe = process.execPath
  if (await run('dpkg', ['-S', exe])) return { kind: 'deb', target: exe, ext: '.deb' }
  if (await run('rpm',  ['-qf', exe])) return { kind: 'rpm', target: exe, ext: '.rpm' }
  // Packaged, but no package manager claims it — treat it as a manual install
  return { kind: 'unknown', target: exe, ext: null }
}

function archTokens() {
  return process.arch === 'arm64'
    ? ['arm64', 'aarch64']
    : ['x86_64', 'x64', 'amd64']
}

// Prefer an asset that matches both the format and this machine's architecture;
// fall back to the only asset of that format when the name carries no arch.
function pickAsset(assets, ext) {
  if (!ext) return null
  const ofType = assets.filter(a => a.name.toLowerCase().endsWith(ext.toLowerCase()))
  if (!ofType.length) return null
  const tokens = archTokens()
  const matched = ofType.filter(a => tokens.some(t => a.name.toLowerCase().includes(t)))
  if (matched.length) return matched[0]
  const otherArch = process.arch === 'arm64' ? ['x86_64', 'x64', 'amd64'] : ['arm64', 'aarch64']
  const neutral = ofType.filter(a => !otherArch.some(t => a.name.toLowerCase().includes(t)))
  return neutral[0] || null
}

// ── HTTP ─────────────────────────────────────────────────────────────────────
function getJSON(pathname) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { host: API_HOST, path: pathname, headers: { 'User-Agent': UA, Accept: 'application/vnd.github+json' } },
      res => {
        if (res.statusCode === 403 && res.headers['x-ratelimit-remaining'] === '0') {
          res.resume(); reject(new Error('rate-limited')); return
        }
        if (res.statusCode !== 200) { res.resume(); reject(new Error(`HTTP ${res.statusCode}`)); return }
        let body = ''
        res.setEncoding('utf8')
        res.on('data', c => body += c)
        res.on('end', () => { try { resolve(JSON.parse(body)) } catch (e) { reject(e) } })
      }
    )
    req.setTimeout(20000, () => req.destroy(new Error('timeout')))
    req.on('error', reject)
    req.end()
  })
}

// ── check ────────────────────────────────────────────────────────────────────
async function check({ allowPrerelease = false } = {}) {
  const channel = await detectChannel()
  const current = app.getVersion()
  let releases
  try {
    releases = await getJSON(`/repos/${REPO}/releases?per_page=20`)
  } catch (e) {
    return { ok: false, error: e.message, current, channel: channel.kind }
  }
  if (!Array.isArray(releases)) return { ok: false, error: 'bad-response', current, channel: channel.kind }

  const usable = releases
    .filter(r => !r.draft)
    .filter(r => allowPrerelease || !r.prerelease)
    .filter(r => parseVersion(r.tag_name))
    .sort((a, b) => compareVersion(parseVersion(b.tag_name), parseVersion(a.tag_name)))

  const latest = usable[0]
  if (!latest) return { ok: true, updateAvailable: false, current, channel: channel.kind }

  const version = versionText(parseVersion(latest.tag_name))
  const asset = pickAsset(latest.assets || [], channel.ext)

  return {
    ok: true,
    updateAvailable: isNewer(latest.tag_name, current),
    current,
    version,
    tag: latest.tag_name,
    prerelease: !!latest.prerelease,
    publishedAt: latest.published_at,
    notes: (latest.body || '').slice(0, 4000),
    releaseUrl: latest.html_url,
    channel: channel.kind,
    // installable only when we found a package matching how this copy was installed
    asset: asset ? { name: asset.name, size: asset.size, url: asset.browser_download_url } : null,
  }
}

// ── download (resumable) ─────────────────────────────────────────────────────
function download(asset, onProgress) {
  return new Promise((resolve) => {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
    const dest = path.join(CACHE_DIR, asset.name)
    const part = dest + '.part'

    // A finished download from a previous run is reused as-is
    if (fs.existsSync(dest) && fs.statSync(dest).size === asset.size) {
      resolve({ ok: true, file: dest, reused: true }); return
    }

    let from = 0
    if (fs.existsSync(part)) {
      const got = fs.statSync(part).size
      if (got < asset.size) from = got
      else fs.unlinkSync(part)
    }

    const state = { aborted: false }
    activeDownload = state
    let received = from
    const started = Date.now()

    const request = (url, redirects = 0) => {
      if (redirects > 5) { finish({ ok: false, error: 'too-many-redirects' }); return }
      const headers = { 'User-Agent': UA }
      if (from > 0) headers.Range = `bytes=${from}-`
      const req = https.get(url, { headers }, res => {
        state.res = res
        if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
          res.resume(); request(res.headers.location, redirects + 1); return
        }
        if (res.statusCode === 416) {          // already complete
          res.resume()
          try { fs.renameSync(part, dest) } catch (e) {}
          finish({ ok: true, file: dest }); return
        }
        if (res.statusCode === 200 && from > 0) {
          from = 0; received = 0                // server ignored Range — start over
        } else if (res.statusCode !== 200 && res.statusCode !== 206) {
          res.resume(); finish({ ok: false, error: `HTTP ${res.statusCode}` }); return
        }

        const out = fs.createWriteStream(part, { flags: from > 0 ? 'a' : 'w' })
        state.out = out
        res.on('data', chunk => {
          received += chunk.length
          const elapsed = (Date.now() - started) / 1000
          onProgress && onProgress({
            received,
            total: asset.size,
            percent: asset.size ? Math.min(100, (received / asset.size) * 100) : null,
            bytesPerSecond: elapsed > 0 ? Math.round((received - from) / elapsed) : 0,
          })
        })
        // Cancelling destroys the request. A plain destroy() emits 'close' but no
        // 'error', so without this the promise would never settle and the caller
        // would wait forever on a download the user already stopped.
        res.on('close', () => { if (state.aborted) finish({ ok: false, cancelled: true }) })
        res.pipe(out)
        out.on('finish', () => {
          if (state.aborted) { finish({ ok: false, cancelled: true }); return }
          const size = fs.existsSync(part) ? fs.statSync(part).size : 0
          if (asset.size && size !== asset.size) {
            finish({ ok: false, error: `size mismatch: got ${size}, expected ${asset.size}` }); return
          }
          fs.renameSync(part, dest)
          finish({ ok: true, file: dest })
        })
        out.on('error', e => finish({ ok: false, error: e.message }))
      })
      state.req = req
      req.setTimeout(60000, () => req.destroy(new Error('timeout')))
      req.on('error', e => finish({ ok: false, error: state.aborted ? 'cancelled' : e.message, cancelled: state.aborted }))
      req.on('close', () => { if (state.aborted) finish({ ok: false, cancelled: true }) })
    }

    let settled = false
    const finish = r => {
      if (settled) return
      settled = true
      activeDownload = null
      resolve(r)
    }

    request(asset.url)
  })
}

function cancelDownload() {
  if (!activeDownload) return false
  const state = activeDownload
  state.aborted = true
  try { state.req?.destroy() } catch (e) {}
  // Flush and close the partial file so a later resume sees a consistent size
  try { state.out?.end() } catch (e) {}
  return true
}

// ── install ──────────────────────────────────────────────────────────────────
function pkexec(bin, args) {
  return new Promise(resolve => {
    execFile('pkexec', [bin, ...args], { timeout: 600000 }, (err, stdout, stderr) => {
      if (!err) { resolve({ ok: true }); return }
      resolve({ ok: false, error: String(stderr || err.message), cmd: `sudo ${bin} ${args.join(' ')}` })
    })
  })
}

async function install(file) {
  if (!file || !fs.existsSync(file)) return { ok: false, error: 'file-missing' }
  const channel = await detectChannel()

  if (channel.kind === 'appimage') {
    const target = channel.target
    try {
      fs.accessSync(path.dirname(target), fs.constants.W_OK)
    } catch (e) {
      // Cannot write where the AppImage lives — keep the download and say where it is
      return { ok: false, error: 'not-writable', file, manual: true }
    }
    try {
      const staged = target + '.new'
      fs.copyFileSync(file, staged)
      fs.chmodSync(staged, 0o755)
      fs.renameSync(staged, target)        // atomic; the running image stays mounted
      return { ok: true, restart: true }
    } catch (e) {
      return { ok: false, error: e.message, file, manual: true }
    }
  }

  if (channel.kind === 'deb') {
    let r = await pkexec('apt-get', ['install', '-y', '--allow-downgrades', file])
    if (!r.ok) r = await pkexec('dpkg', ['-i', file])
    return r.ok ? { ok: true, restart: true } : { ...r, file, manual: true }
  }

  if (channel.kind === 'rpm') {
    for (const [bin, args] of [['dnf', ['install', '-y', file]],
                               ['zypper', ['--non-interactive', 'install', '--allow-unsigned-rpm', file]],
                               ['rpm', ['-U', '--force', file]]]) {
      const r = await pkexec(bin, args)
      if (r.ok) return { ok: true, restart: true }
    }
    return { ok: false, error: 'install-failed', file, manual: true }
  }

  return { ok: false, error: channel.kind === 'dev' ? 'dev-build' : 'unknown-packaging', file, manual: true }
}

function restart() {
  const target = process.env.APPIMAGE
  if (target) app.relaunch({ execPath: target })
  else app.relaunch()
  app.exit(0)
}

module.exports = {
  check, download, cancelDownload, install, restart,
  detectChannel, revealFile: f => shell.showItemInFolder(f),
  CACHE_DIR,
}
