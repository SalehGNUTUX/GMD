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
const PKG_VERSION = require(path.join(APP, 'package.json')).version

const orig = Module._load
Module._load = function (req, parent, isMain) {
  if (req === 'electron') return {
    app: { getVersion: () => process.env.FAKE_VERSION || PKG_VERSION, isPackaged: false },
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

  // صيغُ الوسمِ تبدَّلت عبرَ عمرِ المشروع، والمحلِّلُ يجبُ أن يقرأَها كلَّها.
  // وتُختبَرُ على وسومٍ مكتوبةٍ هنا لا على ما يُصادِفُ أن يكونَ أحدثَ إصدارٍ
  // منشورٍ يومَ تشغيلِ الفحص — فذاك يتبدّلُ مع كلِّ نشرٍ ويُسقِطُ الفحصَ بلا عطب.
  const parsed = tag => up._versionText(up._parseVersion(tag))
  check('tag "GMD-26.05" parses to 26.5.0', parsed('GMD-26.05') === '26.5.0', parsed('GMD-26.05'))
  check('tag "v26.9.0" parses to 26.9.0', parsed('v26.9.0') === '26.9.0', parsed('v26.9.0'))
  check('tag "v26.9.0-beta.2" keeps its pre-release suffix',
        parsed('v26.9.0-beta.2') === '26.9.0-beta.2', parsed('v26.9.0-beta.2'))
  check('a stable release outranks its own beta',
        up._compareVersion(up._parseVersion('v26.9.0'), up._parseVersion('v26.9.0-beta.9')) > 0)

  // a live check against the real repo
  const r = await up.check({ allowPrerelease: false })
  check('check() reaches the GitHub releases API', r.ok === true, r.error || '')
  if (r.ok) {
    check('newest stable release resolves to a version', /^\d+\.\d+\.\d+$/.test(r.version), 'version=' + r.version)
    check('the published tag parses to a comparable version',
          up._versionText(up._parseVersion(r.tag)) === r.version,
          'tag=' + r.tag + ' version=' + r.version)
    check('the current build is not offered an older release', r.updateAvailable === false,
          PKG_VERSION + ' vs published ' + r.version)
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
