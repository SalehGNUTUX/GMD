import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  Settings, Globe, RefreshCw, Monitor, Trash2, AlertTriangle,
  Folder, FolderOpen, ToggleLeft, ToggleRight, Sliders,
  Package, CheckCircle, Copy, ExternalLink, Info, ChevronDown, ChevronUp, Type
} from 'lucide-react'

const REPO_URL = 'https://github.com/SalehGNUTUX/GMD'
const WEBSITE_URL = 'https://salehgnutux.github.io/GMD'

function SectionHeader({ icon: Icon, title, expanded, onToggle, color = 'text-gmd-400' }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 py-2 text-left group"
    >
      <Icon className={`w-5 h-5 ${color}`} />
      <span className="font-semibold text-white flex-1">{title}</span>
      {expanded ? (
        <ChevronUp className="w-4 h-4 text-dark-500 group-hover:text-dark-300" />
      ) : (
        <ChevronDown className="w-4 h-4 text-dark-500 group-hover:text-dark-300" />
      )}
    </button>
  )
}

function SettingsView({ setCurrentView, setYtdlpInstalled, setFfmpegInstalled }) {
  const { t, i18n } = useTranslation()
  const [loading, setLoading] = useState(null)
  const [showUninstall, setShowUninstall] = useState(false)
  const [showAbout, setShowAbout] = useState(false)

  // Sections expand state
  const [sections, setSections] = useState({
    general: true, fonts: false, paths: false, encoding: false, deps: false, app: false, about: false
  })

  const toggleSection = (key) =>
    setSections(prev => ({ ...prev, [key]: !prev[key] }))

  // Default paths settings (localStorage)
  const [pathsEnabled, setPathsEnabled] = useState(false)
  const [paths, setPaths] = useState({ video: '', audio: '', documents: '', downloads: '' })

  // Font family setting
  const [fontFamily, setFontFamily] = useState('noto')

  // Advanced encoding setting
  const [advancedEncoding, setAdvancedEncoding] = useState(false)

  // Deps management
  const [detectedPM, setDetectedPM] = useState(null)
  const [toolStatus, setToolStatus] = useState({ wget: null, aria2c: null })
  const [toolVersions, setToolVersions] = useState({ 'yt-dlp': null, wget: null, aria2c: null })
  const [depsLoading, setDepsLoading] = useState(null)
  const [installResult, setInstallResult] = useState({})

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('gmd-settings') || '{}')
    if (saved.defaultPaths) {
      setPathsEnabled(saved.defaultPaths.enabled || false)
      setPaths({
        video:     saved.defaultPaths.video     || '',
        audio:     saved.defaultPaths.audio     || '',
        documents: saved.defaultPaths.documents || '',
        downloads: saved.defaultPaths.downloads || '',
      })
    }
    setFontFamily(saved.fontFamily || 'noto')
    setAdvancedEncoding(saved.advancedEncoding || false)
  }, [])

  const saveSettings = (newSettings) => {
    const current = JSON.parse(localStorage.getItem('gmd-settings') || '{}')
    localStorage.setItem('gmd-settings', JSON.stringify({ ...current, ...newSettings }))
  }

  const handlePathsEnabledToggle = () => {
    const newVal = !pathsEnabled
    setPathsEnabled(newVal)
    saveSettings({ defaultPaths: { enabled: newVal, ...paths } })
  }

  const handlePathChange = async (key) => {
    const folder = await window.electronAPI.selectFolder()
    if (!folder) return
    const newPaths = { ...paths, [key]: folder }
    setPaths(newPaths)
    saveSettings({ defaultPaths: { enabled: pathsEnabled, ...newPaths } })
  }

  const handleAdvancedEncodingToggle = () => {
    const newVal = !advancedEncoding
    setAdvancedEncoding(newVal)
    saveSettings({ advancedEncoding: newVal })
  }

  const fetchVersions = async (tools) => {
    const updates = {}
    for (const tool of tools) {
      const v = await window.electronAPI.getToolVersion(tool)
      updates[tool] = v
    }
    setToolVersions(prev => ({ ...prev, ...updates }))
  }

  const handleDetectPM = async () => {
    setDepsLoading('detect')
    const pm = await window.electronAPI.detectPackageManager()
    setDetectedPM(pm)
    if (pm) {
      const wget  = await window.electronAPI.checkTool('wget')
      const aria2c = await window.electronAPI.checkTool('aria2c')
      setToolStatus({ wget, aria2c })
      const toFetch = ['yt-dlp']
      if (wget)  toFetch.push('wget')
      if (aria2c) toFetch.push('aria2c')
      await fetchVersions(toFetch)
    }
    setDepsLoading(null)
  }

  const handleInstallTool = async (tool) => {
    if (!detectedPM) { await handleDetectPM(); return }
    setDepsLoading(tool)
    const res = await window.electronAPI.installTool({ tool, pm: detectedPM })
    setDepsLoading(null)
    if (res.success) {
      setToolStatus(prev => ({ ...prev, [tool]: true }))
      setInstallResult(prev => ({ ...prev, [tool]: 'success' }))
      await fetchVersions([tool])
    } else {
      setInstallResult(prev => ({ ...prev, [tool]: res.cmd || 'error' }))
    }
  }

  const handleFontChange = (fontId) => {
    setFontFamily(fontId)
    saveSettings({ fontFamily: fontId })
    document.documentElement.setAttribute('data-font', fontId)
  }

  const handleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar'
    i18n.changeLanguage(newLang)
  }

  const handleUpdateYtdlp = async () => {
    setLoading('ytdlp')
    const res = await window.electronAPI.updateYtdlp()
    if (res.success) {
      setYtdlpInstalled(true)
      await fetchVersions(['yt-dlp'])
    } else {
      alert(t('common.failed') + ': ' + res.error)
    }
    setLoading(null)
  }

  const handleInstallDesktop = async () => {
    setLoading('desktop')
    await window.electronAPI.installDesktop()
    setLoading(null)
    alert(t('settings.desktopFixed'))
  }

  const handleUninstall = async () => {
    await window.electronAPI.uninstall()
  }

  const pathLabels = [
    { key: 'video',     label: 'settings.videoPath' },
    { key: 'audio',     label: 'settings.audioPath' },
    { key: 'documents', label: 'settings.documentsPath' },
    { key: 'downloads', label: 'settings.downloadsPath' },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-600 to-gray-500 flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold">{t('settings.title')}</h2>
      </div>

      {/* ── General ── */}
      <div className="glass-panel p-5">
        <SectionHeader icon={Globe} title={t('settings.language')} expanded={sections.general} onToggle={() => toggleSection('general')} />
        {sections.general && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 space-y-3">
            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              onClick={handleLanguage}
              className="w-full glass-panel p-4 flex items-center gap-4 text-left hover:bg-dark-800/80 hover:border-gmd-500/30"
            >
              <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-gmd-400" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white">{t('settings.language')}</div>
                <div className="text-sm text-dark-400">{t('settings.languageDesc')}</div>
                <div className="text-xs text-gmd-400 mt-1">
                  {i18n.language === 'ar' ? t('settings.currentLang') : 'Current Language: English'}
                </div>
              </div>
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* ── Fonts ── */}
      <div className="glass-panel p-5">
        <SectionHeader icon={Type} title={t('settings.fonts')} expanded={sections.fonts} onToggle={() => toggleSection('fonts')} color="text-violet-400" />
        {sections.fonts && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 space-y-3">
            <p className="text-xs text-dark-400">{t('settings.fontsDesc')}</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  id: 'noto',
                  label: t('settings.fontNoto'),
                  desc: t('settings.fontNotoDesc'),
                  previewRegular: 'وصف وتفاصيل البرنامج',
                  previewBold: 'عنوان رئيسي',
                  css: "'Noto Sans Arabic', sans-serif",
                },
                {
                  id: 'ubuntu',
                  label: t('settings.fontUbuntu'),
                  desc: t('settings.fontUbuntuDesc'),
                  previewRegular: 'وصف وتفاصيل البرنامج',
                  previewBold: 'عنوان رئيسي',
                  css: "'Ubuntu Arabic', sans-serif",
                },
              ].map(font => (
                <button key={font.id} onClick={() => handleFontChange(font.id)}
                  className={`p-4 rounded-xl border text-start transition-all ${
                    fontFamily === font.id
                      ? 'border-gmd-500 bg-gmd-900/30'
                      : 'border-dark-600 bg-dark-800/50 hover:border-dark-500'
                  }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-white">{font.label}</span>
                    {fontFamily === font.id && (
                      <CheckCircle className="w-4 h-4 text-gmd-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-dark-500 mb-3">{font.desc}</p>
                  <div style={{ fontFamily: font.css }} className="space-y-1 text-right" dir="rtl">
                    <p style={{ fontWeight: 700 }} className="text-sm text-white leading-relaxed">{font.previewBold}</p>
                    <p style={{ fontWeight: 400 }} className="text-xs text-dark-400 leading-relaxed">{font.previewRegular}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Default Save Paths ── */}
      <div className="glass-panel p-5">
        <SectionHeader icon={Folder} title={t('settings.defaultPaths')} expanded={sections.paths} onToggle={() => toggleSection('paths')} />
        {sections.paths && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 space-y-4">
            <p className="text-xs text-dark-400">{t('settings.enableDefaultPathsDesc')}</p>

            {/* Toggle */}
            <button
              onClick={handlePathsEnabledToggle}
              className="flex items-center gap-3 w-full p-3 rounded-xl border border-dark-600 bg-dark-800/50 hover:border-gmd-500/40 transition-all"
            >
              {pathsEnabled ? (
                <ToggleRight className="w-7 h-7 text-gmd-400 flex-shrink-0" />
              ) : (
                <ToggleLeft className="w-7 h-7 text-dark-500 flex-shrink-0" />
              )}
              <span className={`font-medium ${pathsEnabled ? 'text-gmd-300' : 'text-dark-400'}`}>
                {t('settings.enableDefaultPaths')}
              </span>
            </button>

            {/* Path inputs */}
            {pathLabels.map(({ key, label }) => (
              <div key={key} className={`transition-opacity ${pathsEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <label className="block text-xs text-dark-400 mb-1">{t(label)}</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                    <input
                      type="text"
                      value={paths[key]}
                      readOnly
                      placeholder={`~/${key}`}
                      className="input-field pl-9 text-sm py-2"
                    />
                  </div>
                  <button onClick={() => handlePathChange(key)} className="btn-secondary text-sm px-3 py-2 whitespace-nowrap">
                    {t('common.chooseFolder')}
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* ── Advanced Encoding ── */}
      <div className="glass-panel p-5">
        <SectionHeader icon={Sliders} title={t('settings.advancedEncoding')} expanded={sections.encoding} onToggle={() => toggleSection('encoding')} />
        {sections.encoding && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 space-y-3">
            <p className="text-xs text-dark-400">{t('settings.advancedEncodingDesc')}</p>
            <button
              onClick={handleAdvancedEncodingToggle}
              className="flex items-center gap-3 w-full p-3 rounded-xl border border-dark-600 bg-dark-800/50 hover:border-gmd-500/40 transition-all"
            >
              {advancedEncoding ? (
                <ToggleRight className="w-7 h-7 text-gmd-400 flex-shrink-0" />
              ) : (
                <ToggleLeft className="w-7 h-7 text-dark-500 flex-shrink-0" />
              )}
              <span className={`font-medium ${advancedEncoding ? 'text-gmd-300' : 'text-dark-400'}`}>
                {t('settings.enableAdvancedEncoding')}
              </span>
            </button>
          </motion.div>
        )}
      </div>

      {/* ── Dependencies ── */}
      <div className="glass-panel p-5">
        <SectionHeader icon={Package} title={t('settings.depsManagement')} expanded={sections.deps} onToggle={() => toggleSection('deps')} />
        {sections.deps && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 space-y-3">
            <p className="text-xs text-dark-400">{t('settings.depsInstallNote')}</p>

            {/* yt-dlp update */}
            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              onClick={handleUpdateYtdlp}
              disabled={loading === 'ytdlp'}
              className="w-full glass-panel p-4 flex items-center gap-4 text-left hover:bg-dark-800/80 hover:border-gmd-500/30"
            >
              <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center flex-shrink-0">
                <RefreshCw className={`w-5 h-5 text-gmd-400 ${loading === 'ytdlp' ? 'animate-spin' : ''}`} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white">{t('settings.updateYtdlp')}</div>
                <div className="text-sm text-dark-400">{t('settings.updateYtdlpDesc')}</div>
                {toolVersions['yt-dlp'] && (
                  <div className="text-xs text-gmd-400 mt-1 font-mono">v{toolVersions['yt-dlp']}</div>
                )}
              </div>
            </motion.button>

            {/* Detect PM */}
            <button
              onClick={handleDetectPM}
              disabled={depsLoading === 'detect'}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-dark-600 bg-dark-800/50 hover:border-gmd-500/40 transition-all"
            >
              {depsLoading === 'detect' ? (
                <RefreshCw className="w-5 h-5 animate-spin text-gmd-400 flex-shrink-0" />
              ) : (
                <Package className="w-5 h-5 text-gmd-400 flex-shrink-0" />
              )}
              <span className="font-medium text-white flex-1">{t('settings.detectPM')}</span>
              {detectedPM && (
                <span className="text-xs text-gmd-400 bg-gmd-900/30 px-2 py-1 rounded-lg">
                  {t('settings.detectedPM', { pm: detectedPM })}
                </span>
              )}
              {detectedPM === null && depsLoading !== 'detect' && (
                <span className="text-xs text-dark-500">{t('settings.notDetectedPM')}</span>
              )}
            </button>

            {/* Install wget / aria2c */}
            {(['wget', 'aria2c']).map((tool) => (
              <div key={tool} className="p-3 rounded-xl border border-dark-600 bg-dark-800/30 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white text-sm">{t(`settings.install${tool === 'wget' ? 'Wget' : 'Aria2'}`)}</span>
                      {toolStatus[tool] === true && (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      )}
                      {toolVersions[tool] && (
                        <span className="text-xs text-emerald-400 font-mono bg-emerald-900/20 px-1.5 py-0.5 rounded">
                          v{toolVersions[tool]}
                        </span>
                      )}
                    </div>
                    {installResult[tool] === 'success' && (
                      <p className="text-xs text-emerald-400 mt-1">{t('common.installed')}</p>
                    )}
                    {installResult[tool] && installResult[tool] !== 'success' && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-dark-400">{t('settings.manualInstall')}</p>
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-gmd-300 bg-dark-900 px-2 py-1 rounded-lg flex-1 break-all font-mono">
                            {installResult[tool]}
                          </code>
                          <button
                            onClick={() => navigator.clipboard.writeText(installResult[tool])}
                            className="p-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5 text-dark-300" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {toolStatus[tool] !== true && (
                    <button
                      onClick={() => handleInstallTool(tool)}
                      disabled={depsLoading === tool}
                      className="btn-secondary text-xs px-3 py-2 whitespace-nowrap flex items-center gap-1"
                    >
                      {depsLoading === tool ? (
                        <><RefreshCw className="w-3 h-3 animate-spin" /> {t('common.installing')}</>
                      ) : (
                        t('common.enable')
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* ── App Management ── */}
      <div className="glass-panel p-5">
        <SectionHeader icon={Monitor} title={t('settings.desktopIcon')} expanded={sections.app} onToggle={() => toggleSection('app')} />
        {sections.app && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 space-y-3">
            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              onClick={handleInstallDesktop}
              disabled={loading === 'desktop'}
              className="w-full glass-panel p-4 flex items-center gap-4 text-left hover:bg-dark-800/80 hover:border-gmd-500/30"
            >
              <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center flex-shrink-0">
                {loading === 'desktop' ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-gmd-400" />
                ) : (
                  <Monitor className="w-5 h-5 text-gmd-400" />
                )}
              </div>
              <div>
                <div className="font-semibold text-white">{t('settings.desktopIcon')}</div>
                <div className="text-sm text-dark-400">{t('settings.desktopIconDesc')}</div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              onClick={() => setShowUninstall(true)}
              className="w-full glass-panel p-4 flex items-center gap-4 text-left hover:bg-dark-800/80 hover:border-red-500/50"
            >
              <div className="w-10 h-10 rounded-xl bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="font-semibold text-red-400">{t('settings.uninstall')}</div>
                <div className="text-sm text-dark-400">{t('settings.uninstallDesc')}</div>
              </div>
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* ── About ── */}
      <div className="glass-panel p-5">
        <SectionHeader icon={Info} title={t('settings.about')} expanded={sections.about} onToggle={() => toggleSection('about')} color="text-sky-400" />
        {sections.about && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 space-y-4">
            <div className="flex items-center gap-4">
              <img src="./gmd-icon.png" alt="GMD" className="w-16 h-16 rounded-2xl shadow-lg" />
              <div>
                <h3 className="text-xl font-bold text-gmd-200">GMD</h3>
                <p className="text-sm text-dark-400">{t('about.description')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t('about.developer'), value: t('about.developerName') },
                { label: t('about.license'),   value: t('about.licenseName') },
                { label: t('about.year'),       value: t('about.yearValue') },
                { label: t('about.platform'),   value: t('about.platformValue') },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-xl bg-dark-800/50 border border-dark-700/50">
                  <p className="text-xs text-dark-500 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-gmd-300">{value}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.electronAPI.openExternal(REPO_URL)}
                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-dark-600 bg-dark-800/50 hover:border-gmd-500/40 transition-all text-sm text-dark-300 hover:text-white"
              >
                <ExternalLink className="w-4 h-4" />
                {t('about.repo')}
              </button>
              <button
                onClick={() => window.electronAPI.openExternal(WEBSITE_URL)}
                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-dark-600 bg-dark-800/50 hover:border-gmd-500/40 transition-all text-sm text-dark-300 hover:text-white"
              >
                <ExternalLink className="w-4 h-4" />
                {t('about.website')}
              </button>
            </div>

            <p className="text-center text-xs text-dark-600">
              {t('about.freeOpenSource')}
            </p>
          </motion.div>
        )}
      </div>

      <div className="flex gap-3 pt-2 pb-4">
        <button onClick={() => setCurrentView('menu')} className="btn-secondary flex-1">{t('common.back')}</button>
      </div>

      {/* Uninstall Confirm */}
      {showUninstall && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="glass-panel p-8 max-w-md w-full mx-4 border-red-500/30">
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">{t('settings.uninstall')}</h3>
            </div>
            <p className="text-dark-300 mb-2">{t('settings.uninstallConfirm')}</p>
            <p className="text-sm text-dark-500 mb-6">{t('settings.uninstallItems')}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowUninstall(false)} className="btn-secondary flex-1">{t('common.cancel')}</button>
              <button onClick={handleUninstall} className="btn-primary bg-red-600 hover:bg-red-500 flex-1">{t('common.yes')}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default SettingsView
