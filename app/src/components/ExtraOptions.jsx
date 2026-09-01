import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Link, Folder, Zap, ListVideo, Tv, Subtitles, Image, Package, Download, AlertCircle } from 'lucide-react'
import UrlInput from './UrlInput'

const ytdlpOptions = [
  { id: 'PLAYLIST',      label: 'extra.playlist',      desc: 'extra.playlistDesc',      icon: ListVideo },
  { id: 'CHANNEL',       label: 'extra.channel',        desc: 'extra.channelDesc',       icon: Tv },
  { id: 'SUBS',          label: 'extra.subtitles',      desc: 'extra.subtitlesDesc',     icon: Subtitles },
  { id: 'THUMBS',        label: 'extra.thumbnails',     desc: 'extra.thumbnailsDesc',    icon: Image },
  { id: 'COMPLETE',      label: 'extra.complete',       desc: 'extra.completeDesc',      icon: Package },
  { id: 'DIRECT_WGET',   label: 'extra.directDownload', desc: 'extra.wgetDesc',          icon: Download },
  { id: 'DIRECT_ARIA2C', label: 'extra.directDownload', desc: 'extra.aria2cDesc',        icon: Download },
]

function ExtraOptions({ setCurrentView, handleRunCommand }) {
  const { t } = useTranslation()
  const [url, setUrl] = useState('')
  const [savePath, setSavePath] = useState('')
  const [selectedOption, setSelectedOption] = useState('PLAYLIST')
  const [wgetInstalled, setWgetInstalled] = useState(null)
  const [aria2cInstalled, setAria2cInstalled] = useState(null)

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem('gmd-settings') || '{}')
    if (s.defaultPaths?.enabled && s.defaultPaths?.downloads) {
      setSavePath(s.defaultPaths.downloads)
    } else if (s.lastSaveDirs?.extra) {
      setSavePath(s.lastSaveDirs.extra)
    }
    // Check direct download tools
    window.electronAPI.checkTool('wget').then(r => setWgetInstalled(r))
    window.electronAPI.checkTool('aria2c').then(r => setAria2cInstalled(r))
  }, [])

  const chooseFolder = async () => {
    const folder = await window.electronAPI.selectFolder()
    if (folder) setSavePath(folder)
  }

  const isDirect = selectedOption.startsWith('DIRECT_')

  const handleRun = async () => {
    if (!url.trim()) { alert(t('errors.noUrl')); return }
    if (!savePath) { alert(t('errors.noFolder')); return }

    // Check tool availability for direct download
    if (selectedOption === 'DIRECT_WGET' && !wgetInstalled) {
      return // handled by UI
    }
    if (selectedOption === 'DIRECT_ARIA2C' && !aria2cInstalled) {
      return // handled by UI
    }

    const homeDir = await window.electronAPI.getHomeDir()
    const ytdlp = `${homeDir}/.local/bin/yt-dlp`
    let job, title, text, finalSavePath = savePath

    switch (selectedOption) {
      case 'PLAYLIST':
        title = t('extra.playlist')
        text = t('common.processing')
        job = { bin: ytdlp, args: ['-o', `${savePath}/%(playlist_title)s/%(title)s.%(ext)s`, '--', url] }
        break
      case 'CHANNEL':
        title = t('extra.channel')
        text = t('common.processing')
        job = { bin: ytdlp, args: ['-o', `${savePath}/%(uploader)s/%(title)s.%(ext)s`, '--', url] }
        break
      case 'SUBS':
        title = t('extra.subtitles')
        text = t('common.processing')
        job = { bin: ytdlp, args: ['--write-auto-sub', '--skip-download',
                                   '-o', `${savePath}/%(title)s`, '--', url] }
        break
      case 'THUMBS':
        title = t('extra.thumbnails')
        text = t('common.processing')
        job = { bin: ytdlp, args: ['--write-thumbnail', '--skip-download',
                                   '-o', `${savePath}/%(title)s`, '--', url] }
        break
      case 'COMPLETE': {
        title = t('extra.complete')
        text = t('common.processing')
        const stamp = new Date().toISOString().slice(0,19).replace(/[^0-9]/g,'')
        const completeDir = `${savePath}/complete_${stamp}`
        job = { bin: ytdlp, args: [
          '-f', 'bestvideo+bestaudio/best',
          '--write-thumbnail', '--write-sub', '--write-auto-sub', '--all-subs',
          '--write-description', '--write-info-json',
          '-o', `${completeDir}/%(title)s.%(ext)s`, '--', url
        ] }
        finalSavePath = completeDir
        break
      }
      case 'DIRECT_WGET':
        title = 'wget'
        text = t('common.processing')
        job = { bin: 'wget', args: ['-P', savePath, '--', url] }
        break
      case 'DIRECT_ARIA2C':
        title = 'aria2c'
        text = t('common.processing')
        job = { bin: 'aria2c', args: ['-d', savePath, '--', url] }
        break
    }

    // Remember last dir
    const s = JSON.parse(localStorage.getItem('gmd-settings') || '{}')
    localStorage.setItem('gmd-settings', JSON.stringify({
      ...s, lastSaveDirs: { ...(s.lastSaveDirs || {}), extra: savePath }
    }))

    await handleRunCommand(job, title, text, finalSavePath)
  }

  const toolMissing = (selectedOption === 'DIRECT_WGET' && wgetInstalled === false) ||
                      (selectedOption === 'DIRECT_ARIA2C' && aria2cInstalled === false)

  const toolName = selectedOption === 'DIRECT_WGET' ? 'wget' : 'aria2c'

  const displayOptions = [
    ...ytdlpOptions.slice(0, 5),
    { id: 'DIRECT_WGET',   label: 'extra.directDownload', desc: 'extra.wgetDesc',   icon: Download, badge: 'wget' },
    { id: 'DIRECT_ARIA2C', label: 'extra.directDownload', desc: 'extra.aria2cDesc', icon: Download, badge: 'aria2c' },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-600 to-orange-500 flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold">{t('extra.title')}</h2>
      </div>

      {/* URL */}
      <div className="glass-panel p-6 space-y-4">
        <label className="block text-sm font-medium text-dark-300">{t('common.url')}</label>
        <UrlInput value={url} onChange={setUrl} placeholder={t('common.enterUrl')} icon={Link} />
      </div>

      {/* Options */}
      <div className="glass-panel p-6 space-y-3">
        <label className="block text-sm font-medium text-dark-300 mb-2">{t('extra.title')}</label>

        {/* yt-dlp options */}
        <div className="space-y-2">
          {displayOptions.slice(0, 5).map((opt) => {
            const Icon = opt.icon
            return (
              <button key={opt.id} onClick={() => setSelectedOption(opt.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                  selectedOption === opt.id ? 'border-gmd-500 bg-gmd-900/30' : 'border-dark-600 bg-dark-800/50 hover:border-dark-500'
                }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  selectedOption === opt.id ? 'bg-gmd-600' : 'bg-dark-700'
                }`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-start">
                  <div className="font-medium">{t(opt.label)}</div>
                  <div className="text-sm text-dark-400">{t(opt.desc)}</div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Direct download separator */}
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-dark-700" />
          <span className="text-xs text-dark-500 uppercase tracking-wider">{t('extra.directDownload')}</span>
          <div className="flex-1 h-px bg-dark-700" />
        </div>

        {/* wget & aria2c */}
        {[
          { id: 'DIRECT_WGET',   tool: 'wget',   desc: 'extra.wgetDesc',   installed: wgetInstalled },
          { id: 'DIRECT_ARIA2C', tool: 'aria2c', desc: 'extra.aria2cDesc', installed: aria2cInstalled },
        ].map(({ id, tool, desc, installed }) => (
          <button key={id} onClick={() => setSelectedOption(id)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
              selectedOption === id ? 'border-gmd-500 bg-gmd-900/30' : 'border-dark-600 bg-dark-800/50 hover:border-dark-500'
            }`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              selectedOption === id ? 'bg-gmd-600' : 'bg-dark-700'
            }`}>
              <Download className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium font-mono text-sm">{tool}</span>
                {installed === true && (
                  <span className="text-xs text-emerald-400 bg-emerald-900/30 px-1.5 py-0.5 rounded">{t('common.alreadyInstalled')}</span>
                )}
                {installed === false && (
                  <span className="text-xs text-red-400 bg-red-900/30 px-1.5 py-0.5 rounded">{t('extra.toolNotInstalled', { tool })}</span>
                )}
              </div>
              <div className="text-sm text-dark-400">{t(desc)}</div>
            </div>
          </button>
        ))}

        {/* Tool not installed warning */}
        {toolMissing && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-yellow-900/20 border border-yellow-700/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-yellow-300 font-medium mb-1">
                {t('extra.toolNotInstalled', { tool: toolName })}
              </p>
              <p className="text-xs text-yellow-500/80">{t('extra.installFromSettings')}</p>
              <button
                onClick={() => setCurrentView('settings')}
                className="mt-2 text-xs text-gmd-400 hover:text-gmd-300 underline underline-offset-2"
              >
                {t('extra.goToSettings')}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Save path */}
      <div className="glass-panel p-6 space-y-4">
        <label className="block text-sm font-medium text-dark-300">{t('common.savePath')}</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Folder className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500 pointer-events-none z-10" />
            <input type="text" value={savePath} readOnly
              placeholder={t('common.chooseFolder')} className="input-field ps-12" />
          </div>
          <button onClick={chooseFolder} className="btn-secondary whitespace-nowrap">{t('common.chooseFolder')}</button>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button onClick={() => setCurrentView('menu')} className="btn-secondary flex-1">{t('common.back')}</button>
        <button onClick={handleRun} disabled={toolMissing} className="btn-primary flex-1 disabled:opacity-50">
          {t('common.run')}
        </button>
      </div>
    </motion.div>
  )
}

export default ExtraOptions
