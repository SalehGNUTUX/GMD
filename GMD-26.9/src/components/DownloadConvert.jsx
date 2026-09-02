import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Link, Folder, Brain, FileAudio, Film } from 'lucide-react'
import UrlInput from './UrlInput'
import { qualities, videoFormatArgs } from '../quality'

const formats = [
  { id: 'mp3', label: 'MP3', type: 'audio', ext: 'mp3' },
  { id: 'm4a', label: 'M4A', type: 'audio', ext: 'm4a' },
  { id: 'ogg', label: 'OGG', type: 'audio', ext: 'ogg' },
  { id: 'wav', label: 'WAV', type: 'audio', ext: 'wav' },
  { id: 'flac', label: 'FLAC', type: 'audio', ext: 'flac' },
  { id: 'mp4', label: 'MP4', type: 'video', ext: 'mp4' },
  { id: 'webm', label: 'WEBM', type: 'video', ext: 'webm' },
]

function DownloadConvert({ setCurrentView, handleRunCommand }) {
  const { t } = useTranslation()
  const [url, setUrl] = useState('')
  const [savePath, setSavePath] = useState('')
  const [selectedFormat, setSelectedFormat] = useState('mp3')
  const [selectedQuality, setSelectedQuality] = useState('best')
  const [showQuality, setShowQuality] = useState(false)

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem('gmd-settings') || '{}')
    const fmt = formats.find(f => f.id === selectedFormat)
    if (s.defaultPaths?.enabled) {
      setSavePath(fmt?.type === 'video' ? (s.defaultPaths.video || '') : (s.defaultPaths.audio || ''))
    } else if (s.lastSaveDirs?.smart) {
      setSavePath(s.lastSaveDirs.smart)
    }
  }, [])

  const chooseFolder = async () => {
    const folder = await window.electronAPI.selectFolder()
    if (folder) setSavePath(folder)
  }

  const handleFormatChange = (fmtId) => {
    setSelectedFormat(fmtId)
    const fmt = formats.find(f => f.id === fmtId)
    setShowQuality(fmt.type === 'video')
  }

  const handleDownload = async () => {
    if (!url.trim()) { alert(t('errors.noUrl')); return }
    if (!savePath) { alert(t('errors.noFolder')); return }

    const homeDir = await window.electronAPI.getHomeDir()
    const ytdlp = `${homeDir}/.local/bin/yt-dlp`
    const fmt = formats.find(f => f.id === selectedFormat)
    let args

    if (fmt.type === 'video') {
      args = [...videoFormatArgs(selectedQuality), '--merge-output-format', fmt.ext]
    } else {
      args = ['--extract-audio', '--audio-format', fmt.ext, '--audio-quality', '0']
    }
    args.push('-o', `${savePath}/%(title)s.%(ext)s`, '--', url)

    await handleRunCommand({ bin: ytdlp, args }, t('menu.downloadConvert'), t('common.processing'), savePath)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold">{t('menu.downloadConvert')}</h2>
      </div>

      <div className="glass-panel p-6 space-y-4">
        <label className="block text-sm font-medium text-dark-300">{t('common.url')}</label>
        <UrlInput value={url} onChange={setUrl} placeholder={t('common.enterUrl')} icon={Link} />
      </div>

      <div className="glass-panel p-6 space-y-4">
        <label className="block text-sm font-medium text-dark-300">{t('convert.outputFormat')}</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {formats.map((f) => (
            <button key={f.id} onClick={() => handleFormatChange(f.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                selectedFormat === f.id ? 'border-gmd-500 bg-gmd-900/30' : 'border-dark-600 bg-dark-800/50 hover:border-dark-500'
              }`}>
              {f.type === 'video' ? <Film className="w-6 h-6" /> : <FileAudio className="w-6 h-6" />}
              <span className="font-medium text-sm">{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {showQuality && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-panel p-6 space-y-4">
          <label className="block text-sm font-medium text-dark-300">{t('video.quality')}</label>
          <div className="grid grid-cols-2 gap-3">
            {qualities.map((q) => (
              <button key={q.id} onClick={() => setSelectedQuality(q.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  selectedQuality === q.id ? 'border-gmd-500 bg-gmd-900/30' : 'border-dark-600 bg-dark-800/50'
                }`}>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedQuality === q.id ? 'border-gmd-500' : 'border-dark-500'}`}>
                  {selectedQuality === q.id && <div className="w-2 h-2 rounded-full bg-gmd-500" />}
                </div>
                <span className="text-sm">{t(q.label)}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      <div className="glass-panel p-6 space-y-4">
        <label className="block text-sm font-medium text-dark-300">{t('common.savePath')}</label>
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
        <button onClick={handleDownload} className="btn-primary flex-1">{t('common.run')}</button>
      </div>
    </motion.div>
  )
}

export default DownloadConvert