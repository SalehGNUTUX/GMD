// GMD smoke test.
//
// Drives the real renderer over the Chrome DevTools protocol, so nothing
// test-only ever lands in src/. Run it with `npm test`, which starts the Vite
// dev server and Electron first (see test/run.sh).
//
// It guards the invariants the 26.9.0 release established:
//   - the version has exactly one source of truth (package.json)
//   - the IPC listeners are registered once, not once per operation
//   - success is decided by exit code and output file, never by grepping output
//   - a batch stops at its first failure and a missing binary is reported
//   - media:// serves only files the user picked
const http = require('http'), fs = require('fs'), path = require('path')

// The version lives in package.json only; tests read it rather than repeat it,
// so a release bump never means editing the test suite.
const PKG_VERSION = require(path.join(__dirname, '..', 'package.json')).version
const WS_TIMEOUT = 60000
const get = u => new Promise((res, rej) => http.get(u, r => { let d=''; r.on('data',c=>d+=c); r.on('end',()=>res(JSON.parse(d))) }).on('error', rej))

;(async () => {
  let targets = []
  for (let i = 0; i < 40 && !targets.length; i++) {
    try {
      targets = (await get('http://127.0.0.1:9222/json'))
        .filter(t => t.type === 'page' && t.webSocketDebuggerUrl && !/devtools:\/\//.test(t.url))
    } catch(e) {}
    if (!targets.length) await new Promise(r => setTimeout(r, 500))
  }
  if (!targets.length) { console.log('FAIL: no debuggable page'); process.exit(1) }

  // Node 22 ships a global WebSocket
  const ws = new WebSocket(targets[0].webSocketDebuggerUrl)
  let id = 0
  const pending = new Map()
  const consoleErrors = []
  await new Promise(r => ws.addEventListener('open', r))
  ws.addEventListener('message', ev => {
    const msg = JSON.parse(ev.data)
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id) }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error')
      consoleErrors.push(msg.params.args.map(a => a.value || a.description || '').join(' '))
    if (msg.method === 'Runtime.exceptionThrown')
      consoleErrors.push('EXCEPTION: ' + (msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text))
  })
  const send = (method, params={}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({id:i, method, params})) })
  const evalJS = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })
    if (r.result?.exceptionDetails) return { error: r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text }
    return { value: r.result?.result?.value }
  }

  await send('Runtime.enable')
  await new Promise(r => setTimeout(r, 2500))

  let pass = 0, fail = 0
  const check = (label, ok, extra='') => { ok ? pass++ : fail++; console.log(`${ok?'PASS':'FAIL'}  ${label}${extra?'  — '+extra:''}`) }

  // 1. app mounted and the version comes from package.json over IPC
  const title = await evalJS(`document.querySelector('h1,header h1,[class*="text-lg"]')?.textContent || document.body.innerText.slice(0,80)`)
  const ver = await evalJS(`window.electronAPI.getAppVersion()`)
  check('renderer mounted', !!title.value, JSON.stringify(String(title.value).slice(0,50)))
  check('version from package.json via IPC', ver.value === PKG_VERSION, 'got ' + JSON.stringify(ver.value))
  const shown = await evalJS(`document.body.innerText.includes(${JSON.stringify('v' + PKG_VERSION)})`)
  check('version rendered in the header', shown.value === true)

  // 2. exactly one listener pair, no matter how many operations ran
  const src = fs.readFileSync(path.join(process.env.SRC, 'src/App.jsx'), 'utf8')
  check('listeners registered once (mount effect only)',
        (src.match(/onCommandOutput\(/g)||[]).length === 1 && (src.match(/onCommandDone\(/g)||[]).length === 1)

  // 3. a REAL conversion through the real IPC, twice, with a hostile filename
  const dir = process.env.FFDIR
  // a real path carrying shell metacharacters and a space; with argv it is just a name
  const evil = dir + '/in put$(echo hi).mp4'
  if (!fs.existsSync(evil)) { console.log('FAIL: fixture missing'); process.exit(1) }

  const runJob = async (out, label) => {
    const r = await evalJS(`window.electronAPI.runCommand({ title: ${JSON.stringify(label)}, jobs: [
      { bin:'ffmpeg', args:['-i', ${JSON.stringify(evil)}, '-c:a','libmp3lame','-b:a','192k','-y', ${JSON.stringify(out)}], outFile: ${JSON.stringify(out)} }
    ]})`)
    return r.value
  }
  const r1 = await runJob(dir + '/ipc1.mp3', 'run one')
  check('IPC conversion succeeds', r1 && r1.success === true && fs.existsSync(dir + '/ipc1.mp3'), 'exit=' + (r1&&r1.code))
  check('a path with $( ) and a space round-trips to ffmpeg', r1 && r1.success === true)

  // 4. exit code, not the word "error", decides success
  const r2 = await evalJS(`window.electronAPI.runCommand({ title:'err', jobs:[{ bin:'sh', args:['-c','echo ERROR: this is only a warning; exit 0'] }] })`)
  check('output containing "ERROR" with exit 0 counts as success', r2.value?.success === true)
  const r3 = await evalJS(`window.electronAPI.runCommand({ title:'fail', jobs:[{ bin:'sh', args:['-c','echo all good; exit 3'] }] })`)
  check('non-zero exit counts as failure even with clean output', r3.value?.success === false && r3.value?.code === 3)
  const r4 = await evalJS(`window.electronAPI.runCommand({ title:'noout', jobs:[{ bin:'sh', args:['-c','exit 0'], outFile:'/tmp/gmd-never-made-this' }] })`)
  check('exit 0 with a missing output file counts as failure', r4.value?.success === false)

  // 5. a batch stops at the first failure and reports the job counter
  const r5 = await evalJS(`window.electronAPI.runCommand({ title:'batch', jobs:[
    { bin:'sh', args:['-c','echo one'] }, { bin:'sh', args:['-c','exit 4'] }, { bin:'sh', args:['-c','echo three'] } ]})`)
  check('batch stops at the first failing job', r5.value?.success === false && !String(r5.value?.output).includes('three'))

  // 6. a missing binary is reported, not swallowed
  const r6 = await evalJS(`window.electronAPI.runCommand({ title:'missing', jobs:[{ bin:'gmd-no-such-binary-xyz', args:[] }] })`)
  check('missing binary reported as failure', r6.value?.success === false && String(r6.value?.output).includes('[gmd]'))

  // 7. media:// only serves files the user picked
  const denied = await evalJS(`fetch('media:///etc/passwd').then(r=>'status:'+r.status).catch(e=>'blocked')`)
  check('media:// refuses an un-picked path', denied.value === 'blocked' || denied.error, String(denied.value||denied.error).slice(0,40))


  // 8. self-update: real check against the GitHub releases API
  const up = await evalJS(`window.electronAPI.updateCheck({ allowPrerelease: false })`)
  const u = up.value
  check('update check reaches the releases API', u && u.ok === true, u && (u.error || ''))
  if (u && u.ok) {
    check('update check reports a comparable version', /^\d+\.\d+\.\d+$/.test(u.version || ''), 'version=' + u.version)
    check('update check knows the current version', u.current === PKG_VERSION)
    check('a dev tree is reported as an uninstallable channel', u.channel === 'dev', 'channel=' + u.channel)
    // this build is ahead of anything published, so nothing should be offered
    check('a newer local build is not offered a downgrade', u.updateAvailable === false,
          'latest published = ' + u.version)
  }
  const pre = await evalJS(`window.electronAPI.updateCheck({ allowPrerelease: true })`)
  check('prerelease channel also resolves', pre.value?.ok === true)
  const ch = await evalJS(`window.electronAPI.updateChannel()`)
  check('packaging channel is detectable', typeof ch.value === 'string' && ch.value.length > 0, 'channel=' + ch.value)
  const cancelled = await evalJS(`window.electronAPI.updateCancel()`)
  check('cancelling with no download in flight is a no-op', cancelled.value === false)
  const badInstall = await evalJS(`window.electronAPI.updateInstall('/tmp/gmd-no-such-package.deb')`)
  check('installing a missing file fails cleanly', badInstall.value?.ok === false && badInstall.value?.error === 'file-missing')

  // 9. every user-visible string exists in both languages
  const ar = JSON.parse(fs.readFileSync(path.join(process.env.SRC, 'src/locales/ar.json'), 'utf8'))
  const en = JSON.parse(fs.readFileSync(path.join(process.env.SRC, 'src/locales/en.json'), 'utf8'))
  const flat = (o, p = '') => Object.entries(o).reduce((acc, [k, v]) =>
    Object.assign(acc, v && typeof v === 'object' ? flat(v, p + k + '.') : { [p + k]: v }), {})
  const ka = Object.keys(flat(ar)), ke = Object.keys(flat(en))
  const onlyAr = ka.filter(k => !ke.includes(k)), onlyEn = ke.filter(k => !ka.includes(k))
  check('ar/en translation keys are in parity', !onlyAr.length && !onlyEn.length,
        onlyAr.concat(onlyEn).slice(0, 5).join(', '))

  check('no console errors in the renderer', consoleErrors.length === 0, consoleErrors.slice(0,3).join(' | '))

  console.log(`\n${pass} passed, ${fail} failed`)
  process.exit(fail ? 1 : 0)
})().catch(e => { console.log('HARNESS ERROR:', e.message); process.exit(2) })
