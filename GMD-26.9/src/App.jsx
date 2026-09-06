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
import Gallery from './components/Gallery'
import Player from './components/Player'
import PlayerBar from './components/PlayerBar'
import Settings from './components/Settings'
import History from './components/History'
import ProgressModal from './components/ProgressModal'
import ResultModal from './components/ResultModal'
import { AlertTriangle, ArrowUpCircle, X, Loader2 } from 'lucide-react'
import { readUpdatePrefs } from './components/UpdateManager'
import { addHistory } from './history'
import { clearPosition, loadQueue, positionOf, savePosition, saveQueue } from './library'

/** حالةُ قسمٍ فارغة. الحقولُ كلُّها هنا كي لا يُنسى واحدٌ عندَ التصفير. */
const EMPTY_SECTION = {
  url: '', savePath: '', quality: '1080p', container: 'mp4', format: 'mp3',
  playlist: null, selected: null, clipOn: false, clipFrom: '', clipTo: '',
  // معلوماتُ الرابطِ تُجلَبُ من تلقائِها بعدَ لصقِه — انظر `useAutoInfo`
  info: null, infoLoading: false, infoError: null,
}

/**
 * يقرأُ خرجَ yt-dlp/ffmpeg فيعرفُ المرحلةَ وموضعَ العنصرِ والنسبة.
 *
 * والمرحلةُ ليست زينة: النسبةُ تقفُ عندَ 100٪ حينَ ينتهي التنزيلُ ويبدأُ ما بعدَه —
 * استخراجُ صوتٍ أو تجميعُ تيّارَين — فيظنُّ المستخدمُ أنّ البرنامجَ تجمّد. ويُقرَأُ
 * من الخرجِ لأنّ yt-dlp لا يُعلنُ مرحلتَه إلّا فيه.
 */
function readProgress(output, prev) {
  const next = { ...prev }
  const lines = output.split('\n')

  for (const line of lines.slice(-14)) {
    if (line.includes('[ExtractAudio]')) next.phase = 'converting'
    else if (line.includes('[Merger]')) next.phase = 'merging'
    else if (line.includes('[VideoConvertor]') || line.includes('[Fixup')) next.phase = 'converting'
    else if (line.includes('[download]')) next.phase = 'downloading'
    const item = line.match(/Downloading (?:item|video) (\d+) of (\d+)/)
    if (item) { next.item = +item[1]; next.itemCount = +item[2] }
  }

  // نسبةُ yt-dlp: من آخرِ سطرِ تنزيلٍ لا من أوّلِه
  for (let i = lines.length - 1; i >= Math.max(0, lines.length - 10); i--) {
    const full = lines[i].match(/\[download\]\s+([\d.]+)%.*?at\s+([\d.]+\s*\S+)\s+ETA\s+([\d:]+)/)
    if (full) {
      return { ...next, percent: parseFloat(full[1]), speed: full[2].trim(), eta: full[3] }
    }
    const simple = lines[i].match(/\[download\]\s+([\d.]+)%/)
    if (simple) return { ...next, percent: parseFloat(simple[1]) }
  }

  // نسبةُ ffmpeg من `time=` مقيسةً على المدّة — وهي مرحلةُ تحويلٍ لا تنزيل
  const dur = output.match(/Duration:\s*(\d+):(\d+):([\d.]+)/)
  if (dur) {
    const total = +dur[1] * 3600 + +dur[2] * 60 + parseFloat(dur[3])
    for (let i = lines.length - 1; i >= 0; i--) {
      const tm = lines[i].match(/time=(\d+):(\d+):([\d.]+)/)
      if (!tm) continue
      const cur = +tm[1] * 3600 + +tm[2] * 60 + parseFloat(tm[3])
      const sp = lines[i].match(/speed=\s*([\d.]+)x/)
      let eta = null
      if (sp && parseFloat(sp[1]) > 0 && total > 0) {
        const rem = (total - cur) / parseFloat(sp[1])
        eta = `${String(Math.floor(rem / 60)).padStart(2, '0')}:${String(Math.floor(rem % 60)).padStart(2, '0')}`
      }
      return {
        ...next,
        phase: next.phase === 'downloading' ? 'converting' : next.phase,
        percent: total > 0 ? Math.min(99, (cur / total) * 100) : next.percent,
        speed: sp ? sp[1] + 'x' : next.speed,
        eta,
      }
    }
  }
  return next
}

function App() {
  const { t, i18n } = useTranslation()
  const [currentView, setCurrentView] = useState('menu')
  /** رابطٌ أُعيدت محاولته من السجلّ؛ الطابع الزمنيّ يجعل كلّ إعادةٍ حدثاً جديداً. */
  const [retryUrl, setRetryUrl] = useState(null)
  /**
   * حالةُ كلِّ قسمٍ مرفوعةٌ هنا لا في مكوّنِه: المكوّنُ يُفكَّكُ عندَ الخروجِ من
   * الشاشة، فكانَ الرابطُ والجودةُ والقائمةُ تضيعُ بمجرَّدِ النظرِ في شاشةٍ أخرى.
   */
  const [sections, setSections] = useState({
    video: { ...EMPTY_SECTION },
    audio: { ...EMPTY_SECTION },
  })
  const patchSection = (kind, p) =>
    setSections(s => ({ ...s, [kind]: { ...s[kind], ...p } }))

  /** المهامُّ الجاريةُ بمفتاحِ قسمِها: فيديو وصوتٌ يعملانِ معاً. */
  const [jobs, setJobs] = useState({})
  const [progress, setProgress] = useState(null)
  const [result, setResult] = useState(null)
  const [ytdlpInstalled, setYtdlpInstalled] = useState(true)
  const [ffmpegInstalled, setFfmpegInstalled] = useState(true)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [appVersion, setAppVersion] = useState('')
  const [updateInfo, setUpdateInfo] = useState(null)
  /** ملفٌّ يُفتَحُ في شاشةِ الاقتصاصِ من المعرض؛ الطابعُ الزمنيُّ يجعلُ كلَّ طلبٍ حدثاً. */
  const [clipFile, setClipFile] = useState(null)

  /**
   * المشغّلُ الصوتيُّ الداخليّ.
   *
   * عنصرُ `<audio>` واحدٌ يعيشُ في `App` لا في شاشةِ المشغّل: الشاشةُ تُفكَّكُ عندَ
   * الخروجِ منها، فلو كانَ فيها لانقطعَ الصوتُ كلَّما نظرَ المستخدمُ في شاشةٍ أخرى.
   * والحالةُ هنا كذلك، فالشريطُ السفليُّ يراها من أيِّ شاشة.
   */
  const audioRef = useRef(null)
  const [queue, setQueue] = useState([])
  const [trackIndex, setTrackIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const currentTrack = queue[trackIndex] || null

  // آخرُ صفٍّ استمعَ إليه صاحبُه يعودُ موقوفاً عندَ موضعِه، فيجدُ المشغّلَ كما
  // تركَه بعدَ إغلاقِ البرنامجِ لا فارغاً
  useEffect(() => {
    const saved = loadQueue()
    if (saved?.queue?.length) {
      setQueue(saved.queue)
      setTrackIndex(Math.min(saved.index || 0, saved.queue.length - 1))
    }
  }, [])

  // لا يُكتَبُ الصفُّ قبلَ استعادتِه: أوّلُ تمريرةٍ حالتُها فارغةٌ، فكتابتُها
  // تمحو ما حُفِظَ في الجلسةِ السابقةِ قبلَ أن يُقرَأ
  const queueRestored = useRef(false)
  useEffect(() => {
    if (!queueRestored.current) { queueRestored.current = true; return }
    saveQueue(queue, trackIndex)
  }, [queue, trackIndex])

  // مصدرُ الصوتِ يتغيّرُ مع المقطع، ويُستأنَفُ من موضعِه المحفوظ
  useEffect(() => {
    const el = audioRef.current
    if (!el || !currentTrack) return
    el.src = `media://${currentTrack.path}`
    el.load()
    setPosition(0)
    setDuration(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.path])

  const playCurrent = () => { audioRef.current?.play().catch(() => {}) }

  const playerApi = {
    queue, index: trackIndex, playing, position, duration,
    toggle: () => {
      const el = audioRef.current
      if (!el || !currentTrack) return
      if (playing) el.pause()
      else playCurrent()
    },
    next: () => {
      if (trackIndex + 1 >= queue.length) return
      setTrackIndex(trackIndex + 1)
      setPlaying(true)
    },
    // الرجوعُ في أوّلِ ثوانٍ يعودُ إلى ما قبلَه، وبعدَها يُعيدُ المقطعَ نفسَه —
    // عُرفٌ يعرفُه كلُّ مستمع
    previous: () => {
      const el = audioRef.current
      if (el && el.currentTime > 5) { el.currentTime = 0; return }
      if (trackIndex === 0) { if (el) el.currentTime = 0; return }
      setTrackIndex(trackIndex - 1)
      setPlaying(true)
    },
    seek: (seconds) => {
      const el = audioRef.current
      if (!el) return
      el.currentTime = seconds
      setPosition(seconds)
    },
    jump: (i) => { setTrackIndex(i); setPlaying(true) },
    stop: () => {
      audioRef.current?.pause()
      setQueue([])
      setTrackIndex(0)
      setPlaying(false)
      saveQueue([], 0)
    },
  }

  /** يبدأُ صفّاً جديداً من المعرض. */
  const startQueue = (entries, index) => {
    setQueue(entries)
    setTrackIndex(index)
    setPlaying(true)
    setCurrentView('player')
  }

  // المقطعُ الجاهزُ يُشغَّلُ إن كانَ المستخدمُ قد طلبَ التشغيل، ويُستأنَفُ من موضعِه
  const onLoadedMetadata = () => {
    const el = audioRef.current
    if (!el || !currentTrack) return
    setDuration(el.duration || 0)
    const resume = positionOf(currentTrack.path, el.duration || 0)
    if (resume > 0) el.currentTime = resume
    if (playing) playCurrent()
  }

  const onTimeUpdate = () => {
    const el = audioRef.current
    if (!el) return
    setPosition(el.currentTime)
    // موضعُ الاستماعِ يُكتَبُ كلَّ خمسِ ثوانٍ: إغلاقٌ مفاجئٌ لا يُضيعُ أكثرَ من ذلك
    if (currentTrack && Math.floor(el.currentTime) % 5 === 0) {
      savePosition(currentTrack.path, el.currentTime)
    }
  }

  const onEnded = () => {
    if (currentTrack) clearPosition(currentTrack.path)
    if (trackIndex + 1 < queue.length) { setTrackIndex(trackIndex + 1); setPlaying(true) }
    else setPlaying(false)
  }

  // The IPC listeners are registered exactly once for the lifetime of the app;
  // each operation swaps the handlers these refs point at. Registering them per
  // operation (as before) left every previous listener attached, so the Nth
  // download processed each output line N times and opened N result dialogs.
  //
  // والتوزيع بمعرِّف المهمّة لا بمرجعَين مفردَين: كان كلّ استدعاءٍ يكتب فوقهما،
  // فمهمّةٌ ثانيةٌ تسرق مستمعَ الأولى فيضيع خرجُها ولا يُغلَق صندوقُ تقدُّمها.
  const handlersRef = useRef(new Map())

  useEffect(() => {
    const dispatch = which => data => {
      const entry = data?.jobId ? handlersRef.current.get(data.jobId) : null
      entry?.[which]?.(data)
    }
    window.electronAPI.onCommandOutput(dispatch('onOutput'))
    window.electronAPI.onCommandDone(dispatch('onDone'))
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
  /**
   * [meta] وصفُ المحاولة كما طلبها المستخدم — الرابط ونوعه وخياره وقائمة تشغيله —
   * يُسجَّل في سجلّ التنزيلات مهما آلت إليه. والعمليّات المحلّيّة (تحويل ملفّ، قصّ،
   * معلومات) تمرّ بلا meta فلا تُسجَّل: السجلّ للروابط لا لكلّ أمر يُنفَّذ.
   */
  /**
   * [opts.silent] محاولةٌ لها ما بعدَها: لا تُظهِرُ نتيجةً ولا تكتبُ سجلّاً.
   *
   * يستعملُها المسلكُ الأوّلُ للاقتصاصِ عندَ التنزيل: إن سقطَ تبعتْه محاولةٌ
   * ثانيةٌ تُنزّلُ كاملاً ثمّ تقتصّ، فلا يرى المستخدمُ صندوقَ فشلٍ لعملٍ ما زالَ
   * يجري، ولا يُكتَبُ في السجلِّ سطرُ فشلٍ لمحاولةٍ نجحَ بديلُها.
   */
  const handleRunCommand = async (jobList, title, text, savePath, meta, opts = {}) => {
    const list = Array.isArray(jobList) ? jobList : [jobList]
    const kind = meta?.kind || 'local'
    // المعرِّف يُولَّد هنا لا في العمليّة الرئيسة: الخرج يبدأ بالوصول قبل أن يعود
    // ردُّ النداء، فبلا معرِّفٍ سابقٍ لا يُعرَف لمن يُنسَب أوّلُ سطر.
    const jobId = `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const base = {
      jobId, kind, title, text, savePath, output: '',
      percent: null, phase: 'downloading', item: 0, itemCount: 0,
      speed: null, eta: null, jobIndex: 1, jobCount: list.length,
    }

    setJobs(prev => ({ ...prev, [kind]: base }))
    // العمليّاتُ المحلّيّة — تحويلٌ وقصٌّ ومعلومات — تبقى في صندوقها: هي هدفُ
    // الشاشة نفسها ولا شيء يُنتظَر بعدها، بخلاف تنزيلٍ يطول فيُتابَع من أيّ مكان.
    if (kind === 'local') setProgress(base)

    const handleOutput = data => {
      const apply = cur => {
        if (!cur || cur.jobId !== data.jobId) return cur
        const output = (cur.output || '') + data.data
        return {
          ...readProgress(output, cur),
          output,
          jobIndex: data.jobIndex || cur.jobIndex,
          jobCount: data.jobCount || cur.jobCount,
        }
      }
      setJobs(prev => (prev[kind] ? { ...prev, [kind]: apply(prev[kind]) } : prev))
      if (kind === 'local') setProgress(apply)
    }

    const handleDone = data => {
      handlersRef.current.delete(jobId)
      if (meta && !data.cancelled && !opts.silent) {
        addHistory({
          ...meta,
          ok: !!data.success,
          error: data.success ? null : String(data.output || '').slice(-4000),
          savePath: data.success ? savePath : null,
        })
      }
      setTimeout(() => {
        setJobs(prev => {
          if (prev[kind]?.jobId !== data.jobId) return prev
          const next = { ...prev }
          delete next[kind]
          return next
        })
        if (kind === 'local') setProgress(null)
        if (data.cancelled || opts.silent) return
        setResult({
          success: data.success,
          message: data.success ? t('common.success') : t('common.failed'),
          output: data.output,
          savePath: data.success ? savePath : null,
        })
      }, 500)
    }

    handlersRef.current.set(jobId, { onOutput: handleOutput, onDone: handleDone })

    // The handlers stay installed after the call returns: 'command-done' is sent
    // just before the IPC reply, and clearing them here would race that event and
    // leave the progress dialog open forever. They are dropped when it arrives.
    try {
      return await window.electronAPI.runCommand({ jobs: list, title, jobId })
    } finally {
      handlersRef.current.delete(jobId)
    }
  }

  /** إلغاءُ مهمّةِ قسمٍ بعينِها؛ ما يجري في غيرِه لا يُمَسّ. */
  const cancelJob = async kind => {
    const job = kind === 'local' ? progress : jobs[kind]
    if (!job) return
    await window.electronAPI.cancelCommand(job.jobId)
    if (kind === 'local') setProgress(null)
    else setJobs(prev => { const n = { ...prev }; delete n[kind]; return n })
  }

  /**
   * إعادة محاولة مدخل من السجلّ: يُملأ الرابط وتُفتح شاشته بنوعه نفسه.
   * كان إغلاق صندوق النتيجة يُضيع الرابط وسبب الفشل معاً.
   */
  const handleRetry = (entry) => {
    setRetryUrl({ url: entry.url, at: Date.now() })
    setCurrentView(entry.kind === 'audio' ? 'audio'
                 : entry.kind === 'convert' ? 'smart'
                 : entry.kind === 'extra' ? 'extra' : 'video')
  }

  const handleExit = () => {
    setShowExitConfirm(true)
  }

  const confirmExit = () => {
    window.electronAPI.close()
  }

  const renderView = () => {
    const props = { setCurrentView, handleRunCommand, retryUrl }
    switch (currentView) {
      case 'menu': return <MainMenu setCurrentView={setCurrentView} onExit={handleExit} />
      case 'video': return <DownloadVideo {...props}
        section={sections.video} patch={p => patchSection('video', p)}
        job={jobs.video} onCancel={() => cancelJob('video')} />
      case 'audio': return <DownloadAudio {...props}
        section={sections.audio} patch={p => patchSection('audio', p)}
        job={jobs.audio} onCancel={() => cancelJob('audio')} />
      case 'smart': return <DownloadConvert {...props} />
      case 'convert': return <ConvertLocal {...props} />
      case 'extra': return <ExtraOptions {...props} />
      case 'clip': return <ClipMedia {...props} presetFile={clipFile} />
      case 'gallery': return <Gallery setCurrentView={setCurrentView}
        onPlay={startQueue}
        onClip={path => { setClipFile({ path, at: Date.now() }); setCurrentView('clip') }} />
      case 'player': return <Player setCurrentView={setCurrentView} player={playerApi} />
      case 'info': return <MediaInfo {...props} />
      case 'history': return <History setCurrentView={setCurrentView} onRetry={handleRetry} />
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

      {/* المشغّلُ الصوتيُّ: عنصرٌ واحدٌ لا يُفكَّكُ مع الشاشات */}
      <audio
        ref={audioRef}
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="hidden"
      />
      {currentTrack && currentView !== 'player' && (
        <PlayerBar player={playerApi} onOpen={() => setCurrentView('player')} />
      )}

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
            onCancel={() => cancelJob('local')}
          />
        )}
      </AnimatePresence>

      {/* ما يجري الآن، من أيِّ شاشةٍ كان: المستخدم قد يبدأ تنزيلاً ثمّ ينظر في
          شاشةٍ أخرى، وكان الغشاء يمنعه من ذلك أصلاً */}
      <AnimatePresence>
        {Object.keys(jobs).filter(k => k !== 'local').length > 0 && (
          <motion.div
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            className="fixed bottom-0 inset-x-0 z-30 border-t border-dark-700/60 bg-dark-900/95 backdrop-blur px-4 py-2 flex flex-wrap items-center gap-3"
          >
            {Object.entries(jobs).filter(([k]) => k !== 'local').map(([kind, job]) => (
              <button key={kind} onClick={() => setCurrentView(kind)}
                className="flex items-center gap-2 text-sm rounded-lg px-3 py-1.5 bg-dark-800/70 hover:bg-dark-700/70 transition-colors">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-gmd-400" />
                <span className="font-medium">{job.title}</span>
                <span className="text-dark-400">{t(`phase.${job.phase || 'downloading'}`)}</span>
                {job.phase === 'downloading' && job.percent != null && (
                  <span dir="ltr" className="font-mono text-gmd-300">{Math.round(job.percent)}%</span>
                )}
                {job.itemCount > 1 && job.item > 0 && (
                  <span dir="ltr" className="font-mono text-xs text-dark-400">{job.item}/{job.itemCount}</span>
                )}
              </button>
            ))}
          </motion.div>
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