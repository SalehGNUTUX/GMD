// Self-update tests.
//
// Loads electron/updater.js behind a stubbed `electron` module, so the update
// logic is exercised without booting a browser. The checks hit the real GitHub
// releases API on purpose: the tag scheme has drifted over the project's life
// ("GMD-26.05", "GMD_1.92_...", "v1.1") and the parser has to keep coping with
// whatever is actually published, not with a fixture that says it does.
//
// Run via `npm test` (or on its own: APP=. node test/updater.js).
const Module = require('module')
const path = require('path')
const APP = process.env.APP || path.join(__dirname, '..')

const orig = Module._load
Module._load = function (req, parent, isMain) {
  if (req === 'electron') return {
    app: { getVersion: () => process.env.FAKE_VERSION || '26.5.1', isPackaged: false },
    shell: { showItemInFolder: () => {} },
  }
  return orig.apply(this, arguments)
}

const up = require(path.join(APP, 'electron/updater.js'))
let pass = 0, fail = 0
const check = (l, ok, extra='') => { ok ? pass++ : fail++; console.log(`${ok?'PASS':'FAIL'}  ${l}${extra?'  — '+extra:''}`) }

;(async () => {
  // channel detection in a plain dev tree
  const ch = await up.detectChannel()
  check('dev tree detected as dev', ch.kind === 'dev', 'kind=' + ch.kind)

  // a live check against the real repo
  const r = await up.check({ allowPrerelease: false })
  check('check() reaches the GitHub releases API', r.ok === true, r.error || '')
  if (r.ok) {
    check('newest stable release resolves to a version', /^\d+\.\d+\.\d+$/.test(r.version), 'version=' + r.version)
    check('tag "GMD-26.05" parses to 26.5.0', r.version === '26.5.0', 'tag=' + r.tag + ' version=' + r.version)
    check('26.5.1 is not offered an update from 26.5.0', r.updateAvailable === false)
    check('release notes and url returned', typeof r.notes === 'string' && /github\.com/.test(r.releaseUrl || ''))
    check('dev channel gets no installable asset', r.asset === null, 'asset=' + JSON.stringify(r.asset))
  }

  // an older copy IS offered the update, and gets the right asset for its format
  process.env.FAKE_VERSION = '26.4.0'
  delete require.cache[require.resolve(path.join(APP, 'electron/updater.js'))]
  // pretend this copy is an installed AppImage
  const fs = require('fs')
  const fake = '/tmp/gmd-fake.AppImage'
  fs.writeFileSync(fake, 'x')
  process.env.APPIMAGE = fake
  const up2 = require(path.join(APP, 'electron/updater.js'))
  const r2 = await up2.check({ allowPrerelease: false })
  check('an older AppImage copy is offered the update', r2.updateAvailable === true, 'current=' + r2.current)
  check('AppImage channel detected from $APPIMAGE', r2.channel === 'appimage', 'channel=' + r2.channel)
  check('the .AppImage asset is selected for an AppImage copy',
        !!r2.asset && /\.AppImage$/i.test(r2.asset.name), 'asset=' + (r2.asset && r2.asset.name))
  check('asset carries a real size to verify the download against',
        !!r2.asset && r2.asset.size > 1000000, 'size=' + (r2.asset && r2.asset.size))
  fs.unlinkSync(fake)

  // prereleases are excluded unless asked for
  const stable = await up2.check({ allowPrerelease: false })
  const beta   = await up2.check({ allowPrerelease: true })
  check('stable channel never returns a prerelease', stable.prerelease === false)
  check('prerelease channel resolves too', beta.ok === true)

  // install refuses a file that is not there
  const bad = await up2.install('/tmp/gmd-definitely-not-here.AppImage')
  check('install() refuses a missing file', bad.ok === false && bad.error === 'file-missing')

  console.log(`\n${pass} passed, ${fail} failed`)
  process.exit(fail ? 1 : 0)
})().catch(e => { console.log('HARNESS ERROR:', e.stack); process.exit(2) })
