import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Folder, FileAudio, Film, RefreshCw, File, Image, Plus, X, Sliders, ChevronDown } from 'lucide-react'

const videoFormats = [
  { id: 'mp4',  label: 'MP4',  type: 'video', defaultOpts: '-c:v libx264 -crf 23 -c:a aac -b:a 192k',
    codecs: { video: ['libx264', 'libx265', 'copy'], audio: ['aac', 'libmp3lame', 'copy'] } },
  { id: 'mkv',  label: 'MKV',  type: 'video', defaultOpts: '-c:v libx264 -crf 23 -c:a aac',
    codecs: { video: ['libx264', 'libx265', 'libvpx-vp9', 'copy'], audio: ['aac', 'libvorbis', 'libopus', 'flac', 'copy'] } },
  { id: 'webm', label: 'WEBM', type: 'video', defaultOpts: '-c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus',
    codecs: { video: ['libvpx-vp9', 'libvpx'], audio: ['libopus', 'libvorbis'] } },
  { id: 'avi',  label: 'AVI',  type: 'video', defaultOpts: '-c:v libxvid -q:v 5 -c:a libmp3lame',
    codecs: { video: ['libxvid', 'libx264', 'copy'], audio: ['libmp3lame', 'copy'] } },
]

const audioFormats = [
  { id: 'mp3',  label: 'MP3',  type: 'audio', defaultOpts: '-c:a libmp3lame -b:a 192k',  codecs: { audio: ['libmp3lame'] } },
  { id: 'm4a',  label: 'M4A',  type: 'audio', defaultOpts: '-c:a aac -b:a 192k',          codecs: { audio: ['aac'] } },
  { id: 'ogg',  label: 'OGG',  type: 'audio', defaultOpts: '-c:a libvorbis -q:a 4',        codecs: { audio: ['libvorbis', 'libopus'] } },
  { id: 'wav',  label: 'WAV',  type: 'audio', defaultOpts: '',                             codecs: { audio: ['pcm_s16le', 'pcm_s24le', 'pcm_f32le'] } },
  { id: 'flac', label: 'FLAC', type: 'audio', defaultOpts: '-c:a flac',                    codecs: { audio: ['flac'] } },
  { id: 'opus', label: 'OPUS', type: 'audio', defaultOpts: '-c:a libopus -b:a 128k',       codecs: { audio: ['libopus'] } },
]

const imageFormats = [
  { id: 'jpg',  label: 'JPG',  type: 'image', defaultOpts: '-q:v 2' },
  { id: 'png',  label: 'PNG',  type: 'image', defaultOpts: '' },
  { id: 'webp', label: 'WebP', type: 'image', defaultOpts: '-q:v 80' },
  { id: 'gif',  label: 'GIF',  type: 'image', defaultOpts: '-vf fps=15,scale=640:-1' },
  { id: 'bmp',  label: 'BMP',  type: 'image', defaultOpts: '' },
]

const allFormats = [...videoFormats, ...audioFormats, ...imageFormats]

function FormatButton({ fmt, selected, onClick }) {
  const icon = fmt.type === 'video' ? <Film className="w-5 h-5" /> :
               fmt.type === 'audio' ? <FileAudio className="w-5 h-5" /> :
               <Image className="w-5 h-5" />
  return (
    <button onClick={() => onClick(fmt.id)}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
        selected ? 'border-gmd-500 bg-gmd-900/30' : 'border-dark-600 bg-dark-800/50 hover:border-dark-500'
      }`}>
      {icon}
      <span className="font-medium text-xs">{fmt.label}</span>
    </button>
  )
}

function ConvertLocal({ setCurrentView, handleRunCommand }) {
  const { t } = useTranslation()
  const [multiMode, setMultiMode] = useState(false)
  const [filePath, setFilePath] = useState('')
  const [fileList, setFileList] = useState([])
  const [savePath, setSavePath] = useState('')
  const [selectedFormat, setSelectedFormat] = useState('mp3')
  const [advancedEnabled, setAdvancedEnabled] = useState(false)
  const [videoCodec, setVideoCodec] = useState('')
  const [audioCodec, setAudioCodec] = useState('')

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem('gmd-settings') || '{}')
    setAdvancedEnabled(s.advancedEncoding || false)
    // Default save path
    if (s.defaultPaths?.enabled && s.defaultPaths?.documents) {
      setSavePath(s.defaultPaths.documents)
    } else if (s.lastSaveDirs?.convert) {
      setSavePath(s.lastSaveDirs.convert)
    }
  }, [])

  const currentFmt = allFormats.find(f => f.id === selectedFormat) || allFormats[0]

  const chooseFile = async () => {
    const file = await window.electronAPI.selectFile()
    if (file) {
      setFilePath(file)
      if (!savePath) setSavePath(file.substring(0, file.lastIndexOf('/')))
    }
  }

  const chooseFiles = async () => {
    const files = await window.electronAPI.selectMultipleFiles()
    if (files?.length) {
      setFileList(files)
      if (!savePath) setSavePath(files[0].substring(0, files[0].lastIndexOf('/')))
    }
  }

  const removeFile = (idx) => setFileList(prev => prev.filter((_, i) => i !== idx))

  const chooseFolder = async () => {
    const folder = await window.electronAPI.selectFolder()
    if (folder) setSavePath(folder)
  }

  // Returns an argv array. Every value here comes from the constant tables above
  // or from a <select> restricted to them — never from free user input.
  const buildOpts = () => {
    const asArgs = str => str ? str.split(' ').filter(Boolean) : []
    if (!advancedEnabled || !currentFmt.codecs) return asArgs(currentFmt.defaultOpts)
    const parts = []
    if (currentFmt.codecs.video && videoCodec) parts.push('-c:v', videoCodec)
    else if (currentFmt.codecs.video && currentFmt.defaultOpts.includes('-c:v'))
      parts.push(...asArgs(currentFmt.defaultOpts).slice(0, 4))
    if (currentFmt.codecs.audio && audioCodec) parts.push('-c:a', audioCodec)
    return parts.length ? parts : asArgs(currentFmt.defaultOpts)
  }

  // One ffmpeg job per input file; outFile lets the main process verify the
  // conversion actually produced something instead of trusting the exit code alone.
  const ffmpegJob = (input, opts) => {
    const base = input.split('/').pop().replace(/\.[^/.]+$/, '')
    const outFile = `${savePath}/${base}.${currentFmt.id}`
    return { bin: 'ffmpeg', args: ['-i', input, ...opts, '-y', outFile], outFile }
  }

  const rememberDir = () => {
    const s = JSON.parse(localStorage.getItem('gmd-settings') || '{}')
    localStorage.setItem('gmd-settings', JSON.stringify({
      ...s, lastSaveDirs: { ...(s.lastSaveDirs || {}), convert: savePath }
    }))
  }

  const handleConvert = async () => {
    const opts = buildOpts()
    if (!multiMode) {
      if (!filePath) { alert(t('errors.noFile')); return }
      if (!savePath) { alert(t('errors.noFolder')); return }
      rememberDir()
      await handleRunCommand(ffmpegJob(filePath, opts), t('convert.title'), t('convert.converting'), savePath)
    } else {
      if (!fileList.length) { alert(t('errors.noFiles')); return }
      if (!savePath) { alert(t('errors.noFolder')); return }
      rememberDir()
      await handleRunCommand(fileList.map(fp => ffmpegJob(fp, opts)),
        t('convert.title'), t('convert.converting'), savePath)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold">{t('convert.title')}</h2>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button onClick={() => setMultiMode(false)}
          className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            !multiMode ? 'border-gmd-500 bg-gmd-900/30 text-gmd-300' : 'border-dark-600 bg-dark-800/50 text-dark-400'
          }`}>
          <File className="w-4 h-4 inline me-2" />
          {t('convert.file')}
        </button>
        <button onClick={() => setMultiMode(true)}
          className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            multiMode ? 'border-gmd-500 bg-gmd-900/30 text-gmd-300' : 'border-dark-600 bg-dark-800/50 text-dark-400'
          }`}>
          <Plus className="w-4 h-4 inline me-2" />
          {t('convert.multiMode')}
        </button>
      </div>

      {/* File input */}
      <div className="glass-panel p-6 space-y-4">
        <label className="block text-sm font-medium text-dark-300">{multiMode ? t('convert.files') : t('convert.file')}</label>

        {!multiMode ? (
          <div className="flex gap-3">
            <div className="relative flex-1">
              <File className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
              <input type="text" value={filePath} readOnly
                placeholder={t('convert.chooseFile')} className="input-field pl-12" />
            </div>
            <button onClick={chooseFile} className="btn-secondary whitespace-nowrap">{t('convert.chooseFile')}</button>
          </div>
        ) : (
          <div className="space-y-3">
            <button onClick={chooseFiles}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-dark-600 hover:border-gmd-500/50 transition-all text-dark-400 hover:text-gmd-300">
              <Plus className="w-5 h-5" />
              {t('convert.addFiles')}
            </button>
            {fileList.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {fileList.map((fp, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-dark-800/60 border border-dark-700/50">
                    <File className="w-4 h-4 text-gmd-500 flex-shrink-0" />
                    <span className="flex-1 text-sm text-dark-300 truncate">{fp.split('/').pop()}</span>
                    <button onClick={() => removeFile(i)} className="text-dark-500 hover:text-red-400 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {fileList.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gmd-400">{t('convert.filesSelected', { n: fileList.length })}</span>
                <button onClick={() => setFileList([])} className="text-xs text-dark-500 hover:text-red-400">{t('convert.clearFiles')}</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Format selection */}
      <div className="glass-panel p-6 space-y-4">
        <label className="block text-sm font-medium text-dark-300">{t('convert.outputFormat')}</label>

        {/* Video */}
        <div>
          <p className="text-xs text-dark-500 mb-2 uppercase tracking-wider">{t('convert.videoFormats')}</p>
          <div className="grid grid-cols-4 gap-2">
            {videoFormats.map(f => (
              <FormatButton key={f.id} fmt={f} selected={selectedFormat === f.id} onClick={setSelectedFormat} />
            ))}
          </div>
        </div>
        {/* Audio */}
        <div>
          <p className="text-xs text-dark-500 mb-2 uppercase tracking-wider">{t('convert.audioFormats')}</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {audioFormats.map(f => (
              <FormatButton key={f.id} fmt={f} selected={selectedFormat === f.id} onClick={setSelectedFormat} />
            ))}
          </div>
        </div>
        {/* Images */}
        <div>
          <p className="text-xs text-dark-500 mb-2 uppercase tracking-wider">{t('convert.imageFormats')}</p>
          <div className="grid grid-cols-5 gap-2">
            {imageFormats.map(f => (
              <FormatButton key={f.id} fmt={f} selected={selectedFormat === f.id} onClick={setSelectedFormat} />
            ))}
          </div>
        </div>
      </div>

      {/* Advanced encoding (shown only when enabled in settings) */}
      {advancedEnabled && currentFmt.codecs && (
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gmd-300">
            <Sliders className="w-4 h-4" />
            {t('convert.advancedEncoding')}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentFmt.codecs.video && (
              <div>
                <label className="block text-xs text-dark-400 mb-1">{t('convert.videoCodec')}</label>
                <div className="relative">
                  <select
                    value={videoCodec}
                    onChange={e => setVideoCodec(e.target.value)}
                    className="input-field appearance-none pr-8"
                  >
                    <option value="">— {t('common.enable')} —</option>
                    {currentFmt.codecs.video.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" />
                </div>
              </div>
            )}
            {currentFmt.codecs.audio && (
              <div>
                <label className="block text-xs text-dark-400 mb-1">{t('convert.audioCodec')}</label>
                <div className="relative">
                  <select
                    value={audioCodec}
                    onChange={e => setAudioCodec(e.target.value)}
                    className="input-field appearance-none pr-8"
                  >
                    <option value="">— {t('common.enable')} —</option>
                    {currentFmt.codecs.audio.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save path */}
      <div className="glass-panel p-6 space-y-4">
        <label className="block text-sm font-medium text-dark-300">{t('common.savePath')}</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Folder className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
            <input type="text" value={savePath} readOnly
              placeholder={t('common.chooseFolder')} className="input-field pl-12" />
          </div>
          <button onClick={chooseFolder} className="btn-secondary whitespace-nowrap">{t('common.chooseFolder')}</button>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button onClick={() => setCurrentView('menu')} className="btn-secondary flex-1">{t('common.back')}</button>
        <button onClick={handleConvert} className="btn-primary flex-1">{t('common.run')}</button>
      </div>
    </motion.div>
  )
}

export default ConvertLocal
