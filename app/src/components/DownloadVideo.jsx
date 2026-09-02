import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, Folder, Film, ListVideo, Check, Loader2 } from 'lucide-react'
import UrlInput from './UrlInput'
import { qualities, videoFormatArgs } from '../quality'

function PlaylistModal({ info, onDownloadAll, onDownloadSelected, onClose, t }) {
  const [selected, setSelected] = useState(() => new Set(info.entries.map((_, i) => i)))

  const toggleAll = () => {
    if (selected.size === info.entries.length)
      setSelected(new Set())
    else
      setSelected(new Set(info.entries.map((_, i) => i)))
  }

  const toggle = i => setSelected(prev => {
    const s = new Set(prev)
    s.has(i) ? s.delete(i) : s.add(i)
    return s
  })

  const selectedItems = info.entries.filter((_, i) => selected.has(i))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="glass-panel w-full max-w-lg overflow-hidden">
        <div className="p-6 border-b border-dark-700/50">
          <div className="flex items-center gap-3 mb-1">
            <ListVideo className="w-6 h-6 text-gmd-400 flex-shrink-0" />
            <h3 className="text-lg font-bold text-gmd-200">{t('errors.playlistDetected')}</h3>
          </div>
          <p className="text-sm text-dark-400 truncate">{info.title}</p>
          <p className="text-xs text-dark-500 mt-1">{t('errors.playlistWarning', { n: info.count })}</p>
        </div>

        <div className="px-4 py-2 border-b border-dark-700/30 flex items-center justify-between">
          <span className="text-xs text-dark-400">{selected.size} / {info.entries.length}</span>
          <button onClick={toggleAll} className="text-xs text-gmd-400 hover:text-gmd-300">
            {selected.size === info.entries.length ? t('errors.playlistDeselectAll') : t('errors.playlistSelectAll')}
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {info.entries.map((entry, i) => (
            <button key={i} onClick={() => toggle(i)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-dark-800/60 transition-colors border-b border-dark-800/30 ${selected.has(i) ? 'bg-dark-800/30' : ''}`}>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                selected.has(i) ? 'bg-gmd-500 border-gmd-500' : 'border-dark-500'
              }`}>
                {selected.has(i) && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-xs text-dark-300 flex-shrink-0 w-6">{entry.index}.</span>
              <span className="text-sm text-white flex-1 truncate">{entry.title}</span>
              {entry.duration && <span className="text-xs text-dark-500 flex-shrink-0">{entry.duration}</span>}
            </button>
          ))}
        </div>

        <div className="p-4 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm py-2">{t('common.cancel')}</button>
          <button onClick={() => onDownloadSelected(selectedItems)} disabled={selected.size === 0}
            className="btn-primary flex-1 text-sm py-2 disabled:opacity-40">
            {t('errors.playlistDownloadSelected')} ({selected.size})
          </button>
          <button onClick={onDownloadAll} className="btn-secondary flex-1 text-sm py-2 border-gmd-700/40 text-gmd-300 hover:bg-gmd-900/30">
            {t('errors.playlistDownloadAll', { n: info.count })}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function DownloadVideo({ setCurrentView, handleRunCommand }) {
  const { t } = useTranslation()
  const [url, setUrl]                   = useState('')
  const [savePath, setSavePath]         = useState('')
  const [selectedQuality, setSelectedQuality] = useState('1080p')
  const [checkingPlaylist, setCheckingPlaylist] = useState(false)
  const [playlistInfo, setPlaylistInfo] = useState(null)

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem('gmd-settings') || '{}')
    if (s.defaultPaths?.enabled && s.defaultPaths?.video) setSavePath(s.defaultPaths.video)
    else if (s.lastSaveDirs?.video) setSavePath(s.lastSaveDirs.video)
  }, [])

  const chooseFolder = async () => {
    const folder = await window.electronAPI.selectFolder()
    if (folder) setSavePath(folder)
  }

  const runDownload = async (quality, urlOverride, playlistItems) => {
    if (!savePath) { alert(t('errors.noFolder')); return }
    const homeDir = await window.electronAPI.getHomeDir()
    const ytdlp = `${homeDir}/.local/bin/yt-dlp`
    const target = urlOverride || url

    const args = videoFormatArgs(quality)
    if (playlistItems) {
      // Download specific items: build a comma-separated indices list
      args.push('--playlist-items', playlistItems.map(e => e.index).join(','))
      args.push('-o', `${savePath}/%(playlist_index)s - %(title)s.%(ext)s`)
    } else {
      args.push('-o', `${savePath}/%(title)s.%(ext)s`)
    }
    args.push('--', target)

    const s = JSON.parse(localStorage.getItem('gmd-settings') || '{}')
    localStorage.setItem('gmd-settings', JSON.stringify({ ...s, lastSaveDirs: { ...(s.lastSaveDirs || {}), video: savePath } }))
    await handleRunCommand({ bin: ytdlp, args }, t('video.title'), t('video.downloading'), savePath)
  }

  const handleDownload = async () => {
    if (!url.trim()) { alert(t('errors.noUrl')); return }
    if (!savePath)   { alert(t('errors.noFolder')); return }

    // Check if playlist
    setCheckingPlaylist(true)
    const pInfo = await window.electronAPI.checkPlaylist(url)
    setCheckingPlaylist(false)

    if (pInfo?.isPlaylist && pInfo.count > 1) {
      setPlaylistInfo(pInfo)
      return
    }
    await runDownload(selectedQuality)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center">
          <Film className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold">{t('video.title')}</h2>
      </div>

      <div className="glass-panel p-6 space-y-4">
        <label className="block text-sm font-medium text-dark-300 mb-2">{t('common.url')}</label>
        <UrlInput value={url} onChange={setUrl} placeholder={t('common.enterUrl')} icon={Link} />
      </div>

      <div className="glass-panel p-6 space-y-4">
        <label className="block text-sm font-medium text-dark-300 mb-2">{t('video.quality')}</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {qualities.map(q => (
            <button key={q.id} onClick={() => setSelectedQuality(q.id)}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                selectedQuality === q.id ? 'border-gmd-500 bg-gmd-900/30' : 'border-dark-600 bg-dark-800/50 hover:border-dark-500'
              }`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedQuality === q.id ? 'border-gmd-500' : 'border-dark-500'}`}>
                {selectedQuality === q.id && <div className="w-2.5 h-2.5 rounded-full bg-gmd-500" />}
              </div>
              <span className="font-medium">{t(q.label)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel p-6 space-y-4">
        <label className="block text-sm font-medium text-dark-300 mb-2">{t('common.savePath')}</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Folder className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500 pointer-events-none z-10" />
            <input type="text" value={savePath} readOnly placeholder={t('common.chooseFolder')} className="input-field ps-12" />
          </div>
          <button onClick={chooseFolder} className="btn-secondary whitespace-nowrap">{t('common.chooseFolder')}</button>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button onClick={() => setCurrentView('menu')} className="btn-secondary flex-1">{t('common.back')}</button>
        <button onClick={handleDownload} disabled={checkingPlaylist}
          className="btn-primary flex-1 flex items-center justify-center gap-2">
          {checkingPlaylist ? (
            <><Loader2 className="w-4 h-4 animate-spin" />{t('errors.playlistChecking')}</>
          ) : t('common.run')}
        </button>
      </div>

      <AnimatePresence>
        {playlistInfo && (
          <PlaylistModal
            info={playlistInfo}
            t={t}
            onClose={() => setPlaylistInfo(null)}
            onDownloadAll={() => { setPlaylistInfo(null); runDownload(selectedQuality) }}
            onDownloadSelected={items => { setPlaylistInfo(null); runDownload(selectedQuality, url, items) }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default DownloadVideo
