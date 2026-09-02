import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  Link, Folder, Scissors, File, HardDrive, Film, Music2,
  Info, ToggleLeft, ToggleRight, ChevronDown, ChevronUp
} from 'lucide-react'
import UrlInput from './UrlInput'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pad(n) { return String(Math.floor(n)).padStart(2, '0') }

function secsToHMS(total) {
  const s = Math.max(0, Math.floor(total))
  return { h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 }
}

function hmsToSecs(h, m, s) {
  return (parseInt(h) || 0) * 3600 + (parseInt(m) || 0) * 60 + (parseInt(s) || 0)
}

function secsToTimecode(total) {
  const { h, m, s } = secsToHMS(total)
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

function ffmpegTimecode(total) {
  const { h, m, s } = secsToHMS(total)
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

// ─── Time field (HH:MM:SS with wheel, arrow key & spinner buttons) ───────────
function TimeInput({ label, valueSecs, onChange, maxSecs }) {
  const { h, m, s } = secsToHMS(valueSecs)

  // Keep latest state in ref so wheel handlers don't go stale
  const stateRef = useRef({ h, m, s, onChange, maxSecs })
  stateRef.current = { h, m, s, onChange, maxSecs }

  const spin = useCallback((part, delta) => {
    const { h, m, s, onChange, maxSecs } = stateRef.current
    const cur = part === 'h' ? h : part === 'm' ? m : s
    const val = Math.max(0, Math.min(part === 'h' ? 99 : 59, cur + delta))
    const next = part === 'h' ? hmsToSecs(val, m, s) : part === 'm' ? hmsToSecs(h, val, s) : hmsToSecs(h, m, val)
    onChange(Math.min(next, maxSecs || 999999))
  }, [])

  const update = useCallback((part, raw) => {
    const { h, m, s, onChange, maxSecs } = stateRef.current
    const val = Math.max(0, Math.min(part === 'h' ? 99 : 59, parseInt(raw) || 0))
    const next = part === 'h' ? hmsToSecs(val, m, s) : part === 'm' ? hmsToSecs(h, val, s) : hmsToSecs(h, m, val)
    onChange(Math.min(next, maxSecs || 999999))
  }, [])

  // Individual refs for non-passive wheel listeners
  const hRef = useRef(null)
  const mRef = useRef(null)
  const sRef = useRef(null)
  const partRefs = { h: hRef, m: mRef, s: sRef }

  useEffect(() => {
    const entries = [['h', hRef], ['m', mRef], ['s', sRef]]
    const handlers = entries.map(([part, ref]) => {
      const handler = (e) => { e.preventDefault(); spin(part, e.deltaY < 0 ? 1 : -1) }
      ref.current?.addEventListener('wheel', handler, { passive: false })
      return [ref, handler]
    })
    return () => handlers.forEach(([ref, handler]) => ref.current?.removeEventListener('wheel', handler))
  }, [spin])

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-dark-400">{label}</label>
      <div dir="ltr" className="flex items-center input-field py-1 px-2 gap-1 w-fit">
        {[['h', h], ['m', m], ['s', s]].map(([part, val], i) => (
          <React.Fragment key={part}>
            <div className="flex flex-col items-center">
              <button type="button" onClick={() => spin(part, 1)}
                className="text-dark-600 hover:text-gmd-300 transition-colors leading-none py-0.5 px-1">
                <ChevronUp className="w-3 h-3" />
              </button>
              <input
                ref={partRefs[part]}
                type="number"
                value={pad(val)}
                onChange={e => update(part, e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'ArrowUp') { e.preventDefault(); spin(part, 1) }
                  if (e.key === 'ArrowDown') { e.preventDefault(); spin(part, -1) }
                }}
                min={0} max={part === 'h' ? 99 : 59}
                className="w-9 bg-transparent text-center text-white text-sm font-mono focus:outline-none focus:text-gmd-300 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button type="button" onClick={() => spin(part, -1)}
                className="text-dark-600 hover:text-gmd-300 transition-colors leading-none py-0.5 px-1">
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            {i < 2 && <span className="text-dark-500 select-none self-center">:</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

// ─── Output format options ────────────────────────────────────────────────────
const outFormats = [
  { id: 'mp4',  label: 'MP4',  opts: '-c:v libx264 -crf 23 -c:a aac -b:a 192k' },
  { id: 'mkv',  label: 'MKV',  opts: '-c:v libx264 -crf 23 -c:a aac' },
  { id: 'mp3',  label: 'MP3',  opts: '-vn -c:a libmp3lame -b:a 192k' },
  { id: 'm4a',  label: 'M4A',  opts: '-vn -c:a aac -b:a 192k' },
  { id: 'webm', label: 'WebM', opts: '-c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus' },
  { id: 'ogg',  label: 'OGG',  opts: '-vn -c:a libvorbis -q:a 4' },
]

// ─── Main component ───────────────────────────────────────────────────────────
function ClipMedia({ setCurrentView, handleRunCommand }) {
  const { t } = useTranslation()
  const [clipType, setClipType]     = useState('url')
  const [url, setUrl]               = useState('')
  const [filePath, setFilePath]     = useState('')
  const [savePath, setSavePath]     = useState('')
  const [startSec, setStartSec]     = useState(0)
  const [endSec, setEndSec]         = useState(10)
  const [fileInfo, setFileInfo]     = useState(null)
  const [loadingInfo, setLoadingInfo] = useState(false)
  const [convertMode, setConvertMode] = useState(false)
  const [outFormat, setOutFormat]   = useState('mp4')
  const [dragging, setDragging]     = useState(null)  // 'start' | 'end' | null
  const [hovered, setHovered]       = useState(null)  // 'start' | 'end' | null
  const trackRef = useRef(null)

  const duration = fileInfo?.durationSeconds || 0

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem('gmd-settings') || '{}')
    if (s.defaultPaths?.enabled && s.defaultPaths?.documents) setSavePath(s.defaultPaths.documents)
    else if (s.lastSaveDirs?.clip) setSavePath(s.lastSaveDirs.clip)
  }, [])

  const chooseFile = async () => {
    const file = await window.electronAPI.selectFile()
    if (!file) return
    setFilePath(file)
    setLoadingInfo(true)
    const info = await window.electronAPI.getFileInfo(file)
    setLoadingInfo(false)
    if (info) {
      setFileInfo(info)
      const dur = info.durationSeconds || 0
      setStartSec(0)
      setEndSec(Math.min(dur, 60))
    }
    if (!savePath) setSavePath(file.substring(0, file.lastIndexOf('/')))
  }

  const chooseFolder = async () => {
    const folder = await window.electronAPI.selectFolder()
    if (folder) setSavePath(folder)
  }

  // ─── Custom drag logic for trim bar ────────────────────────────────────────
  const posFromEvent = (e) => {
    const rect = trackRef.current.getBoundingClientRect()
    return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration
  }

  const handleTrackPointerDown = (e) => {
    e.preventDefault()
    const pos = posFromEvent(e)
    const dS = Math.abs(pos - startSec)
    const dE = Math.abs(pos - endSec)
    const handle = dS <= dE ? 'start' : 'end'
    setDragging(handle)
    setHovered(handle)
    trackRef.current.setPointerCapture(e.pointerId)
    if (handle === 'start') setStartSec(Math.max(0, Math.min(pos, endSec - 0.5)))
    else                    setEndSec(Math.max(startSec + 0.5, Math.min(pos, duration)))
  }

  const handleTrackPointerMove = (e) => {
    if (!trackRef.current) return
    const pos = posFromEvent(e)
    if (dragging) {
      if (dragging === 'start') setStartSec(Math.max(0, Math.min(pos, endSec - 0.5)))
      else                      setEndSec(Math.max(startSec + 0.5, Math.min(pos, duration)))
    } else {
      const rect = trackRef.current.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const sx = (startSec / duration) * rect.width
      const ex = (endSec   / duration) * rect.width
      const T  = 18
      if      (Math.abs(mx - sx) <= T) setHovered('start')
      else if (Math.abs(mx - ex) <= T) setHovered('end')
      else                              setHovered(null)
    }
  }

  const handleTrackPointerUp = () => { setDragging(null); setHovered(null) }

  const handleClip = async () => {
    if (clipType === 'url' && !url.trim()) { alert(t('errors.noUrl')); return }
    if (clipType === 'file' && !filePath)  { alert(t('errors.noFile')); return }
    if (!savePath) { alert(t('errors.noFolder')); return }

    const start = ffmpegTimecode(startSec)
    const end   = ffmpegTimecode(endSec)
    const homeDir = await window.electronAPI.getHomeDir()
    const ytdlp = `${homeDir}/.local/bin/yt-dlp`
    let job

    if (clipType === 'url') {
      job = {
        bin: ytdlp,
        args: ['--download-sections', `*${start}-${end}`, '--force-keyframes-at-cuts',
               '-o', `${savePath}/%(title)s_clip.%(ext)s`, '--', url]
      }
    } else {
      const ext  = convertMode ? outFormat : filePath.split('.').pop()
      const base = filePath.split('/').pop().replace(/\.[^/.]+$/, '')
      const out  = `${savePath}/${base}_clip.${ext}`
      // encOpts comes from the constant outFormats table, so splitting it is safe
      const encOpts = (convertMode ? outFormats.find(f => f.id === outFormat)?.opts || '-c copy' : '-c copy')
        .split(' ').filter(Boolean)
      job = {
        bin: 'ffmpeg',
        args: ['-ss', start, '-to', end, '-i', filePath, ...encOpts, '-y', out],
        outFile: out
      }
    }

    const s = JSON.parse(localStorage.getItem('gmd-settings') || '{}')
    localStorage.setItem('gmd-settings', JSON.stringify({ ...s, lastSaveDirs: { ...(s.lastSaveDirs || {}), clip: savePath } }))

    await handleRunCommand(job, t('clip.title'), t('clip.trimming'), savePath)
  }

  // Media preview URL (media:// protocol serves local files)
  const mediaUrl = filePath ? `media://${filePath}` : null

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center">
          <Scissors className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold">{t('clip.title')}</h2>
      </div>

      {/* Type */}
      <div className="glass-panel p-6 space-y-4">
        <label className="block text-sm font-medium text-dark-300">{t('clip.type')}</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'url',  icon: <Link className="w-5 h-5" />,  label: 'clip.fromUrl',  desc: 'clip.fromUrlDesc' },
            { id: 'file', icon: <File className="w-5 h-5" />,  label: 'clip.fromFile', desc: 'clip.fromFileDesc' },
          ].map(opt => (
            <button key={opt.id} onClick={() => setClipType(opt.id)}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                clipType === opt.id ? 'border-gmd-500 bg-gmd-900/30' : 'border-dark-600 bg-dark-800/50'
              }`}>
              {opt.icon}
              <div className="text-start">
                <div className="font-medium">{t(opt.label)}</div>
                <div className="text-xs text-dark-400">{t(opt.desc)}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* URL or File */}
      {clipType === 'url' ? (
        <div className="glass-panel p-6 space-y-4">
          <label className="block text-sm font-medium text-dark-300">{t('common.url')}</label>
          <UrlInput value={url} onChange={setUrl} placeholder={t('common.enterUrl')} icon={Link} />
        </div>
      ) : (
        <div className="glass-panel p-6 space-y-4">
          <label className="block text-sm font-medium text-dark-300">{t('convert.file')}</label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <File className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
              <input type="text" value={filePath} readOnly
                placeholder={t('convert.chooseFile')} className="input-field ps-12" />
            </div>
            <button onClick={chooseFile} disabled={loadingInfo} className="btn-secondary whitespace-nowrap">
              {loadingInfo ? '...' : t('convert.chooseFile')}
            </button>
          </div>

          {/* File Info */}
          {fileInfo && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-dark-800/60 border border-dark-700/50">
              <div className="flex items-center gap-2 mb-3 text-xs text-dark-400 uppercase tracking-wider">
                <Info className="w-3.5 h-3.5" />
                {t('clip.fileInfo')}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { icon: HardDrive, label: t('clip.size'),       val: fileInfo.size },
                  { icon: Scissors,  label: t('clip.duration'),   val: fileInfo.duration },
                  fileInfo.width && fileInfo.height && { icon: Film, label: t('clip.resolution'), val: `${fileInfo.width}×${fileInfo.height}` },
                  fileInfo.videoCodec && { icon: Film,   label: t('clip.videoCodec'), val: fileInfo.videoCodec },
                  fileInfo.audioCodec && { icon: Music2, label: t('clip.audioCodec'), val: fileInfo.audioCodec },
                ].filter(Boolean).map(({ icon: Icon, label, val }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gmd-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-dark-500">{label}</p>
                      <p className="text-sm font-medium text-white">{val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Media Preview */}
          {mediaUrl && fileInfo && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl overflow-hidden border border-dark-700/50 bg-dark-900">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-dark-700/50 text-xs text-dark-400 uppercase tracking-wider">
                {fileInfo.isVideo ? <Film className="w-4 h-4" /> : <Music2 className="w-4 h-4" />}
                {t('clip.preview')}
              </div>
              <div className="p-3">
                {fileInfo.isVideo ? (
                  <video key={mediaUrl} src={mediaUrl} controls
                    className="w-full rounded-lg max-h-44 bg-black" style={{ outline: 'none' }} />
                ) : (
                  <audio key={mediaUrl} src={mediaUrl} controls className="w-full" />
                )}
              </div>

              {/* Trim Range — force LTR to avoid RTL flip */}
              {duration > 0 && (
                <div className="px-4 pb-4 space-y-2">
                  <p className="text-xs text-dark-400 uppercase tracking-wider">{t('clip.trimRange')}</p>
                  <p className="text-xs text-dark-600">{t('clip.dragToTrim')}</p>

                  <div
                    ref={trackRef}
                    dir="ltr"
                    className="relative h-10 flex items-center select-none"
                    style={{ cursor: dragging ? 'grabbing' : hovered ? 'grab' : 'default' }}
                    onPointerDown={handleTrackPointerDown}
                    onPointerMove={handleTrackPointerMove}
                    onPointerUp={handleTrackPointerUp}
                    onPointerLeave={() => { if (!dragging) setHovered(null) }}
                  >
                    {/* Track */}
                    <div className="absolute inset-x-0 h-2 bg-dark-700 rounded-full" />
                    {/* Selected region */}
                    <div className="absolute h-2 bg-gmd-600/60 rounded-full pointer-events-none"
                      style={{ left: `${(startSec / duration) * 100}%`, right: `${(1 - endSec / duration) * 100}%` }} />
                    {/* Start handle */}
                    <div className="absolute pointer-events-none"
                      style={{ left: `${(startSec / duration) * 100}%`, top: '50%', transform: 'translate(-50%, -50%)' }}>
                      {(dragging === 'start' || hovered === 'start') && (
                        <div className="absolute rounded-full bg-gmd-400/30 animate-pulse"
                          style={{ inset: '-8px' }} />
                      )}
                      <div className={`rounded-full border-2 border-white transition-all duration-150 ${
                        dragging === 'start' || hovered === 'start'
                          ? 'w-5 h-5 bg-gmd-300 shadow-lg shadow-gmd-400/70'
                          : 'w-4 h-4 bg-gmd-400 shadow'
                      }`} />
                    </div>
                    {/* End handle */}
                    <div className="absolute pointer-events-none"
                      style={{ left: `${(endSec / duration) * 100}%`, top: '50%', transform: 'translate(-50%, -50%)' }}>
                      {(dragging === 'end' || hovered === 'end') && (
                        <div className="absolute rounded-full bg-emerald-400/30 animate-pulse"
                          style={{ inset: '-8px' }} />
                      )}
                      <div className={`rounded-full border-2 border-white transition-all duration-150 ${
                        dragging === 'end' || hovered === 'end'
                          ? 'w-5 h-5 bg-emerald-300 shadow-lg shadow-emerald-400/70'
                          : 'w-4 h-4 bg-emerald-400 shadow'
                      }`} />
                    </div>
                  </div>

                  <div dir="ltr" className="flex justify-between text-xs text-dark-500">
                    <span className="text-gmd-400">{secsToTimecode(startSec)}</span>
                    <span className="text-dark-600">{secsToTimecode(endSec - startSec)}</span>
                    <span className="text-emerald-400">{secsToTimecode(endSec)}</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Trim + Convert toggle (only for local file) */}
          <button onClick={() => setConvertMode(p => !p)}
            className="flex items-center gap-3 w-full p-3 rounded-xl border border-dark-600 bg-dark-800/50 hover:border-gmd-500/40 transition-all">
            {convertMode
              ? <ToggleRight className="w-6 h-6 text-gmd-400 flex-shrink-0" />
              : <ToggleLeft  className="w-6 h-6 text-dark-500 flex-shrink-0" />}
            <div className="text-start">
              <p className={`font-medium text-sm ${convertMode ? 'text-gmd-300' : 'text-dark-400'}`}>
                {t('clip.trimAndConvert')}
              </p>
              <p className="text-xs text-dark-600">{t('clip.trimAndConvertDesc')}</p>
            </div>
          </button>

          {/* Format selector */}
          {convertMode && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
              <label className="text-xs text-dark-400">{t('clip.outputFormat')}</label>
              <div className="relative">
                <select value={outFormat} onChange={e => setOutFormat(e.target.value)}
                  className="input-field appearance-none pr-8">
                  {outFormats.map(f => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" />
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Time inputs */}
      <div className="glass-panel p-6 space-y-4">
        <label className="block text-sm font-medium text-dark-300">{t('clip.trimRange')}</label>
        <div className="grid grid-cols-2 gap-4">
          <TimeInput label={t('clip.startTime')} valueSecs={startSec} onChange={v => setStartSec(Math.min(v, endSec - 1))} maxSecs={duration || 999999} />
          <TimeInput label={t('clip.endTime')}   valueSecs={endSec}   onChange={v => setEndSec(Math.max(v, startSec + 1))} maxSecs={duration || 999999} />
        </div>
      </div>

      {/* Save path */}
      <div className="glass-panel p-6 space-y-4">
        <label className="block text-sm font-medium text-dark-300">{t('common.savePath')}</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Folder className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
            <input type="text" value={savePath} readOnly placeholder={t('common.chooseFolder')} className="input-field ps-12" />
          </div>
          <button onClick={chooseFolder} className="btn-secondary whitespace-nowrap">{t('common.chooseFolder')}</button>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button onClick={() => setCurrentView('menu')} className="btn-secondary flex-1">{t('common.back')}</button>
        <button onClick={handleClip} className="btn-primary flex-1">{t('clip.trim')}</button>
      </div>
    </motion.div>
  )
}

export default ClipMedia
