// Update download + install test — OPT IN, it really downloads the release.
//
// Run with `npm run test:download`. It is not part of `npm test` because it
// fetches the full published AppImage (~105 MB) from GitHub.
//
// This is the path that cannot be faked usefully: it downloads the real asset,
// cuts the connection partway, resumes from the partial file, verifies the size
// against what the API declared, and performs the atomic AppImage self-replace
// against a stand-in file. It is what caught the cancel-never-settles bug —
// req.destroy() emits 'close' but no 'error', so the promise hung forever and
// the progress dialog would have stayed open after the user pressed cancel.
const Module = require('module'), path = require('path'), fs = require('fs'), os = require('os')
const APP = process.env.APP || path.join(__dirname, '..')
const orig = Module._load
Module._load = function (req) {
  if (req === 'electron') return {
    app: { getVersion: () => '26.4.0', isPackaged: true },
    shell: { showItemInFolder: () => {} },
  }
  return orig.apply(this, arguments)
}

const FAKE = '/home/gnutux/gmd-build/fake-current.AppImage'
fs.writeFileSync(FAKE, 'this is the OLD appimage\n')
process.env.APPIMAGE = FAKE

const up = require(path.join(APP, 'electron/updater.js'))
const CACHE = path.join(os.homedir(), '.cache', 'gmd-gui', 'updates')
let pass = 0, fail = 0
const ck = (l, ok, x='') => { ok ? pass++ : fail++; console.log(`${ok?'PASS':'FAIL'}  ${l}${x?'  — '+x:''}`) }
const MB = n => (n/1048576).toFixed(1) + ' MB'

;(async () => {
  const r = await up.check({ allowPrerelease: false })
  ck('an older AppImage is offered the update', r.updateAvailable === true && !!r.asset,
     `${r.current} -> ${r.version}, asset=${r.asset && r.asset.name}`)
  const asset = r.asset
  const dest = path.join(CACHE, asset.name), part = dest + '.part'
  for (const f of [dest, part]) if (fs.existsSync(f)) fs.unlinkSync(f)

  // --- 1. start a download and cut it off partway ---
  let seen = 0
  const p1 = up.download(asset, p => {
    seen = p.received
    if (p.received > 8 * 1024 * 1024 && !p1.killed) { p1.killed = true; up.cancelDownload() }
  })
  const r1 = await p1
  ck('an interrupted download reports cancellation', r1.ok === false && r1.cancelled === true)
  const partial = fs.existsSync(part) ? fs.statSync(part).size : 0
  ck('the partial file survives the interruption', partial > 4 * 1024 * 1024 && partial < asset.size,
     MB(partial) + ' of ' + MB(asset.size))

  // --- 2. resume: the progress must start from what is already on disk ---
  let firstReport = null
  const r2 = await up.download(asset, p => { if (firstReport === null) firstReport = p.received })
  ck('resume picks up from the partial file, not from zero',
     firstReport > partial * 0.9, 'first progress report at ' + MB(firstReport))
  ck('the resumed download completes and verifies its size',
     r2.ok === true && fs.statSync(r2.file).size === asset.size, MB(fs.statSync(r2.file).size))
  ck('the .part file is renamed away on success', !fs.existsSync(part))

  // --- 3. the downloaded AppImage is the real thing ---
  const head = fs.readFileSync(r2.file, { encoding: null }).subarray(0, 4)
  ck('the downloaded file is an ELF binary (a real AppImage)',
     head[0] === 0x7f && head[1] === 0x45 && head[2] === 0x4c && head[3] === 0x46)

  // --- 4. a second call reuses the finished file instead of re-downloading ---
  const t0 = Date.now()
  const r3 = await up.download(asset, () => {})
  ck('a completed download is reused, not fetched again',
     r3.ok === true && r3.reused === true && Date.now() - t0 < 2000)

  // --- 5. install: the AppImage replaces itself atomically ---
  const before = fs.readFileSync(FAKE, 'utf8')
  const inst = await up.install(r2.file)
  ck('install reports success and asks for a restart', inst.ok === true && inst.restart === true,
     inst.error || '')
  const after = fs.statSync(FAKE)
  ck('the running AppImage path now holds the new build',
     after.size === asset.size && before.startsWith('this is the OLD'), MB(after.size))
  ck('the replacement is executable', (after.mode & 0o111) !== 0,
     '0' + (after.mode & 0o777).toString(8))
  ck('no stray .new file left behind', !fs.existsSync(FAKE + '.new'))

  fs.unlinkSync(FAKE)
  console.log(`\n${pass} passed, ${fail} failed`)
  process.exit(fail ? 1 : 0)
})().catch(e => { console.log('HARNESS ERROR:', e.stack); process.exit(2) })
