import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import Header from './components/Header'
import MainMenu from './components/MainMenu'
import DownloadVideo from './components/DownloadVideo'
import DownloadAudio from './components/DownloadAudio'
import DownloadConvert from './components/DownloadConvert'
import ConvertLocal from './components/ConvertLocal'
import ExtraOptions from './components/ExtraOptions'
import ClipMedia from './components/ClipMedia'
import MediaInfo from './components/MediaInfo'
import Settings from './components/Settings'
import ProgressModal from './components/ProgressModal'
import ResultModal from './components/ResultModal'
import { AlertTriangle, ArrowUpCircle, X } from 'lucide-react'
import { readUpdatePrefs } from './components/UpdateManager'

function App() {
  const { t, i18n } = useTranslation()
  const [currentView, setCurrentView] = useState('menu')
  const [progress, setProgress] = useState(null)
  const [result, setResult] = useState(null)
  const [ytdlpInstalled, setYtdlpInstalled] = useState(true)
  const [ffmpegInstalled, setFfmpegInstalled] = useState(true)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [appVersion, setAppVersion] = useState('')
  const [updateInfo, setUpdateInfo] = useState(null)

  // The IPC listeners are registered exactly once for the lifetime of the app;
  // each operation swaps the handlers these refs point at. Registering them per
  // operation (as before) left every previous listener attached, so the Nth
  // download processed each output line N times and opened N result dialogs.
  const onOutputRef = useRef(null)
  const onDoneRef   = useRef(null)

  useEffect(() => {
    window.electronAPI.onCommandOutput(data => onOutputRef.current?.(data))
    window.electronAPI.onCommandDone(data => onDoneRef.current?.(data))
    return () => {
      window.electronAPI.removeAllListeners('command-output')
      window.electronAPI.removeAllListeners('command-done')
    }
  }, [])

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
    window.electronAPI.setLanguage(i18n.language)
    checkDependencies()
  }, [i18n.language])

  // package.json is the only place the version is written
  useEffect(() => {
    window.electronAPI.getAppVersion().then(v => setAppVersion(v))
  }, [])

  // Quiet check on launch. Throttled to once every six hours so a user who opens
  // GMD repeatedly does not burn through GitHub's unauthenticated rate limit.
  useEffect(() => {
    const { autoCheck, allowPrerelease, lastCheck } = readUpdatePrefs()
    if (!autoCheck) return
    if (Date.now() - lastCheck < 6 * 60 * 60 * 1000) return
    const timer = setTimeout(async () => {
      const res = await window.electronAPI.updateCheck({ allowPrerelease })
      const s = JSON.parse(localStorage.getItem('gmd-settings') || '{}')
      localStorage.setItem('gmd-settings', JSON.stringify({ ...s, lastUpdateCheck: Date.now() }))
      if (res.ok && res.updateAvailable) setUpdateInfo(res)
    }, 3000)   // let the window settle first
    return () => clearTimeout(timer)
  }, [])

  // Apply saved font on mount
  useEffect(() => {
    const s = JSON.parse(localStorage.getItem('gmd-settings') || '{}')
    document.documentElement.setAttribute('data-font', s.fontFamily || 'noto')
  }, [])

  const checkDependencies = async () => {
    const ytdlp = await window.electronAPI.checkYtdlp()
    const ffmpeg = await window.electronAPI.checkFfmpeg()
    setYtdlpInstalled(ytdlp)
    setFfmpegInstalled(ffmpeg)
  }

  const handleInstallYtdlp = async () => {
    setProgress({ title: t('settings.updateYtdlp'), text: t('common.loading') })
    const res = await window.electronAPI.installYtdlp()
    setProgress(null)
    if (res.success) {
      setResult({ success: true, message: t('common.success') })
      setYtdlpInstalled(true)
    } else {
      setResult({ success: false, message: res.error || t('common.failed') })
    }
  }

  // jobs: [{ bin, args, outFile? }] — one entry per process to run in sequence.
  const handleRunCommand = async (jobs, title, text, savePath) => {
    const list = Array.isArray(jobs) ? jobs : [jobs]
    setProgress({ title, text, output: '', jobCount: list.length, jobIndex: 1 })

    const handleOutput = (data) => {
      setProgress(prev => {
        if (!prev) return null
        const newOutput = (prev.output || '') + data.data
        const base = {
          ...prev,
          output: newOutput,
          jobIndex: data.jobIndex || prev.jobIndex,
          jobCount: data.jobCount || prev.jobCount,
        }

        // --- yt-dlp progress ---
        // [download]  45.2% of 10.23MiB at 1.24MiB/s ETA 00:07
        const lines = newOutput.split('\n')
        for (let i = lines.length - 1; i >= Math.max(0, lines.length - 8); i--) {
          const line = lines[i]
          const full = line.match(/\[download\]\s+([\d.]+)%.*?at\s+([\d.]+\s*\S+)\s+ETA\s+([\d:]+)/)
          if (full) {
            return { ...base, percent: parseFloat(full[1]), speed: full[2].trim(), eta: full[3] }
          }
          const simple = line.match(/\[download\]\s+([\d.]+)%/)
          if (simple) {
            return { ...base, percent: parseFloat(simple[1]) }
          }
        }

        // --- ffmpeg progress (time= based) ---
        const durM = newOutput.match(/Duration:\s*(\d+):(\d+):([\d.]+)/)
        if (durM) {
          const totalSecs = +durM[1] * 3600 + +durM[2] * 60 + parseFloat(durM[3])
          for (let i = lines.length - 1; i >= 0; i--) {
            const tm = lines[i].match(/time=(\d+):(\d+):([\d.]+)/)
            if (!tm) continue
            const curSecs = +tm[1] * 3600 + +tm[2] * 60 + parseFloat(tm[3])
            const percent = totalSecs > 0 ? Math.min(99, (curSecs / totalSecs) * 100) : null
            const spM = lines[i].match(/speed=\s*([\d.]+)x/)
            const speed = spM ? spM[1] + 'x' : null
            let eta = null
            if (spM && parseFloat(spM[1]) > 0 && totalSecs > 0) {
              const rem = (totalSecs - curSecs) / parseFloat(spM[1])
              eta = `${String(Math.floor(rem / 60)).padStart(2, '0')}:${String(Math.floor(rem % 60)).padStart(2, '0')}`
            }
            return { ...base, percent, speed, eta }
          }
        }

        return base
      })
    }

    const handleDone = (data) => {
      setTimeout(() => {
        setProgress(null)
        if (data.cancelled) return
        setResult({
          success: data.success,
          message: data.success ? t('common.success') : t('common.failed'),
          output: data.output,
          savePath: data.success ? savePath : null
        })
      }, 500)
    }

    onOutputRef.current = handleOutput
    onDoneRef.current   = handleDone

    // The handlers stay installed after the call returns: 'command-done' is sent
    // just before the IPC reply, and clearing them here would race that event and
    // leave the progress dialog open forever. The next operation overwrites them.
    return window.electronAPI.runCommand({ jobs: list, title })
  }

  const handleCancel = async () => {
    await window.electronAPI.cancelCommand()
    setProgress(null)
  }

  const handleExit = () => {
    setShowExitConfirm(true)
  }

  const confirmExit = () => {
    window.electronAPI.close()
  }

  const renderView = () => {
    const props = { setCurrentView, handleRunCommand }
    switch (currentView) {
      case 'menu': return <MainMenu setCurrentView={setCurrentView} onExit={handleExit} />
      case 'video': return <DownloadVideo {...props} />
      case 'audio': return <DownloadAudio {...props} />
      case 'smart': return <DownloadConvert {...props} />
      case 'convert': return <ConvertLocal {...props} />
      case 'extra': return <ExtraOptions {...props} />
      case 'clip': return <ClipMedia {...props} />
      case 'info': return <MediaInfo {...props} />
      case 'settings': return <Settings {...props} setYtdlpInstalled={setYtdlpInstalled} setFfmpegInstalled={setFfmpegInstalled} />
      default: return <MainMenu setCurrentView={setCurrentView} onExit={handleExit} />
    }
  }

  return (
    <div className="h-screen w-screen bg-dark-950 flex flex-col overflow-hidden select-none">
      <Header 
        title={appVersion ? `${t('app.title')} v${appVersion}` : t('app.title')}
        
        onBack={currentView !== 'menu' ? () => setCurrentView('menu') : null}
      />

      {/* A new release is out */}
      <AnimatePresence>
        {updateInfo && currentView !== 'settings' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-emerald-900/25 border-b border-emerald-700/30 px-6 py-3 overflow-hidden"
          >
            <div className="flex items-center gap-3 max-w-4xl mx-auto">
              <ArrowUpCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="flex-1 text-sm text-emerald-100">
                {t('update.bannerTitle', { version: updateInfo.version })}
              </span>
              <button onClick={() => setCurrentView('settings')}
                className="btn-primary text-sm py-1.5 px-3 flex-shrink-0">
                {t('update.bannerAction')}
              </button>
              <button onClick={() => setUpdateInfo(null)}
                aria-label={t('update.bannerDismiss')}
                className="text-emerald-300/60 hover:text-emerald-200 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dependency Warnings */}
      {(!ytdlpInstalled || !ffmpegInstalled) && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-gmd-900/50 border-b border-gmd-700/30 px-6 py-3"
        >
          <div className="flex items-center gap-3 max-w-4xl mx-auto">
            <AlertTriangle className="w-5 h-5 text-gmd-400 flex-shrink-0" />
            <div className="flex-1 text-sm text-gmd-200">
              {!ytdlpInstalled && (
                <span className="block">{t('errors.ytdlpNotInstalled')}</span>
              )}
              {!ffmpegInstalled && (
                <span className="block">{t('errors.ffmpegNotInstalled')}</span>
              )}
            </div>
            {!ytdlpInstalled && (
              <button onClick={handleInstallYtdlp} className="btn-primary text-sm py-2 px-4">
                {t('settings.updateYtdlp')}
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="h-full overflow-y-auto p-6"
          >
            <div className="max-w-4xl mx-auto">
              {renderView()}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {progress && (
          <ProgressModal
            title={progress.title}
            text={progress.text}
            output={progress.output}
            jobIndex={progress.jobIndex}
            jobCount={progress.jobCount}
            percent={progress.percent}
            speed={progress.speed}
            eta={progress.eta}
            onCancel={handleCancel}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <ResultModal 
            success={result.success}
            message={result.message}
            output={result.output}
            savePath={result.savePath}
            onClose={() => setResult(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExitConfirm && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel p-8 max-w-md w-full mx-4 text-center"
            >
              <h3 className="text-xl font-bold mb-4">{t('common.confirmExit')}</h3>
              <div className="flex gap-3 justify-center mt-6">
                <button onClick={() => setShowExitConfirm(false)} className="btn-secondary">
                  {t('common.cancel')}
                </button>
                <button onClick={confirmExit} className="btn-primary bg-red-600 hover:bg-red-500">
                  {t('common.yes')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App