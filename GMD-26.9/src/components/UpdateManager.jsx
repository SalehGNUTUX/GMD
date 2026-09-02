import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download, RefreshCw, CheckCircle, AlertTriangle, XCircle,
  RotateCw, FolderOpen, Copy, ChevronDown, ChevronUp, Loader2
} from 'lucide-react'

const fmtBytes = (n) => {
  if (!n && n !== 0) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`
}

export const readUpdatePrefs = () => {
  const s = JSON.parse(localStorage.getItem('gmd-settings') || '{}')
  return {
    autoCheck: s.autoCheckUpdates !== false,       // on unless turned off
    allowPrerelease: s.allowPrerelease === true,
    lastCheck: s.lastUpdateCheck || 0,
  }
}

const writeUpdatePrefs = (patch) => {
  const s = JSON.parse(localStorage.getItem('gmd-settings') || '{}')
  localStorage.setItem('gmd-settings', JSON.stringify({ ...s, ...patch }))
}

function Toggle({ on, onClick, label, desc }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 text-start py-2">
      <div className={`w-10 h-6 rounded-full flex-shrink-0 transition-colors relative ${on ? 'bg-gmd-600' : 'bg-dark-700'}`}>
        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${on ? 'start-5' : 'start-1'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white">{label}</div>
        {desc && <div className="text-xs text-dark-400">{desc}</div>}
      </div>
    </button>
  )
}

function UpdateManager({ compact = false, onAvailable }) {
  const { t } = useTranslation()
  const [phase, setPhase]   = useState('idle')     // idle|checking|uptodate|available|downloading|downloaded|installing|done|error
  const [info, setInfo]     = useState(null)
  const [progress, setProgress] = useState(null)
  const [error, setError]   = useState(null)
  const [manual, setManual] = useState(null)       // { file, cmd }
  const [showNotes, setShowNotes] = useState(false)
  const [prefs, setPrefs]   = useState(readUpdatePrefs)
  const [channel, setChannel] = useState(null)
  const progressRef = useRef(null)

  useEffect(() => {
    window.electronAPI.updateChannel().then(setChannel)
    window.electronAPI.onUpdateProgress(p => progressRef.current?.(p))
    progressRef.current = setProgress
    return () => { progressRef.current = null }
  }, [])

  const doCheck = async (silent = false) => {
    if (!silent) { setPhase('checking'); setError(null) }
    const res = await window.electronAPI.updateCheck({ allowPrerelease: prefs.allowPrerelease })
    writeUpdatePrefs({ lastUpdateCheck: Date.now() })
    if (!res.ok) {
      if (!silent) { setError(res.error === 'rate-limited' ? t('update.rateLimited') : res.error); setPhase('error') }
      return
    }
    setInfo(res)
    if (res.updateAvailable) {
      setPhase('available')
      onAvailable && onAvailable(res)
    } else if (!silent) {
      setPhase('uptodate')
    }
  }

  const doDownload = async () => {
    if (!info?.asset) return
    setPhase('downloading'); setProgress(null); setError(null)
    const res = await window.electronAPI.updateDownload(info.asset)
    if (res.ok) { setPhase('downloaded'); setManual({ file: res.file }) }
    else if (res.cancelled) { setPhase('available'); setProgress(null) }
    else { setError(res.error); setPhase('error') }
  }

  const doInstall = async () => {
    setPhase('installing'); setError(null)
    const res = await window.electronAPI.updateInstall(manual.file)
    if (res.ok) setPhase('done')
    else {
      setManual({ file: res.file, cmd: res.cmd, reason: res.error })
      setError(res.error)
      setPhase('manual')
    }
  }

  const toggleAuto = () => {
    const v = !prefs.autoCheck
    setPrefs(p => ({ ...p, autoCheck: v })); writeUpdatePrefs({ autoCheckUpdates: v })
  }
  const togglePre = () => {
    const v = !prefs.allowPrerelease
    setPrefs(p => ({ ...p, allowPrerelease: v })); writeUpdatePrefs({ allowPrerelease: v })
  }

  const busy = phase === 'checking' || phase === 'downloading' || phase === 'installing'
  const pct = progress?.percent != null ? Math.min(100, Math.round(progress.percent)) : null

  return (
    <div className="space-y-4">
      {/* current state line */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => doCheck(false)} disabled={busy}
          className="btn-secondary text-sm py-2 px-4 flex items-center gap-2 disabled:opacity-40">
          {phase === 'checking'
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <RefreshCw className="w-4 h-4" />}
          {t('update.checkNow')}
        </button>
        {channel && (
          <span dir="ltr" className="text-xs font-mono text-dark-500 border border-dark-700 rounded-lg px-2 py-1">
            {channel}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {phase === 'uptodate' && (
          <motion.div key="up" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle className="w-4 h-4" />
            {t('update.upToDate', { version: info?.current })}
          </motion.div>
        )}

        {phase === 'error' && (
          <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-start gap-2 text-sm text-red-400">
            <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="break-all">{t('update.failed')}: {error}</span>
          </motion.div>
        )}

        {(phase === 'available' || phase === 'downloading' || phase === 'downloaded'
          || phase === 'installing' || phase === 'done' || phase === 'manual') && info && (
          <motion.div key="avail" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-xl border border-gmd-700/40 bg-gmd-900/20 p-4 space-y-3">

            <div className="flex items-center gap-2 flex-wrap">
              <Download className="w-4 h-4 text-gmd-400 flex-shrink-0" />
              <span className="font-semibold text-white">
                {t('update.available', { version: info.version })}
              </span>
              {info.prerelease && (
                <span className="text-[10px] uppercase tracking-wider bg-amber-900/40 text-amber-300 border border-amber-700/40 rounded px-1.5 py-0.5">
                  {t('update.prerelease')}
                </span>
              )}
              <span dir="ltr" className="text-xs font-mono text-dark-400 ms-auto">
                {info.current} → {info.version}
              </span>
            </div>

            {info.notes && (
              <div>
                <button onClick={() => setShowNotes(v => !v)}
                  className="text-xs text-dark-400 hover:text-dark-200 flex items-center gap-1">
                  {showNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {t('update.releaseNotes')}
                </button>
                {showNotes && (
                  <pre className="mt-2 max-h-40 overflow-y-auto text-xs text-dark-300 whitespace-pre-wrap bg-dark-950/60 rounded-lg p-3 border border-dark-800">
                    {info.notes}
                  </pre>
                )}
              </div>
            )}

            {/* no matching package for how this copy was installed */}
            {!info.asset && phase === 'available' && (
              <div className="flex items-start gap-2 text-sm text-amber-300">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  {t('update.noAsset')}{' '}
                  <button onClick={() => window.electronAPI.openExternal(info.releaseUrl)}
                    className="underline hover:text-amber-200">{t('update.openRelease')}</button>
                </span>
              </div>
            )}

            {info.asset && phase === 'available' && (
              <button onClick={doDownload} className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
                <Download className="w-4 h-4" />
                {t('update.downloadInstall')}
                <span dir="ltr" className="opacity-60 font-mono text-xs">({fmtBytes(info.asset.size)})</span>
              </button>
            )}

            {phase === 'downloading' && (
              <div className="space-y-2">
                <div className="h-2.5 bg-dark-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-gmd-600 to-gmd-400 rounded-full transition-all"
                       style={{ width: `${pct ?? 0}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs text-dark-400" dir="ltr">
                  <span className="font-mono">
                    {fmtBytes(progress?.received)} / {fmtBytes(info.asset.size)}
                    {progress?.bytesPerSecond ? ` · ${fmtBytes(progress.bytesPerSecond)}/s` : ''}
                  </span>
                  <span className="font-mono">{pct != null ? `${pct}%` : ''}</span>
                </div>
                <button onClick={() => window.electronAPI.updateCancel()}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />{t('common.cancel')}
                </button>
              </div>
            )}

            {phase === 'downloaded' && (
              <button onClick={doInstall} className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {t('update.installNow')}
              </button>
            )}

            {phase === 'installing' && (
              <div className="flex items-center gap-2 text-sm text-dark-300">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('update.installing')}
              </div>
            )}

            {phase === 'done' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircle className="w-4 h-4" />{t('update.installed')}
                </div>
                <button onClick={() => window.electronAPI.updateRestart()}
                  className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
                  <RotateCw className="w-4 h-4" />{t('update.restartNow')}
                </button>
              </div>
            )}

            {phase === 'manual' && manual && (
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm text-amber-300">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{t('update.manualNeeded')}</span>
                </div>
                <div dir="ltr" className="font-mono text-xs bg-dark-950/60 border border-dark-800 rounded-lg p-2.5 break-all text-dark-300">
                  {manual.cmd || manual.file}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => window.electronAPI.updateReveal(manual.file)}
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5" />{t('update.showFile')}
                  </button>
                  <button onClick={() => navigator.clipboard.writeText(manual.cmd || manual.file)}
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
                    <Copy className="w-3.5 h-3.5" />{t('about.copy')}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!compact && (
        <div className="pt-2 border-t border-dark-700/50 space-y-1">
          <Toggle on={prefs.autoCheck} onClick={toggleAuto}
            label={t('update.autoCheck')} desc={t('update.autoCheckDesc')} />
          <Toggle on={prefs.allowPrerelease} onClick={togglePre}
            label={t('update.allowPrerelease')} desc={t('update.allowPrereleaseDesc')} />
        </div>
      )}
    </div>
  )
}

export default UpdateManager
