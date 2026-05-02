import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Link, Info, Film, User, Clock, Monitor, FileType, Eye, Globe, Loader2 } from 'lucide-react'

function MediaInfo({ setCurrentView }) {
  const { t } = useTranslation()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState(null)

  const handleFetch = async () => {
    if (!url.trim()) { alert(t('errors.noUrl')); return }
    setLoading(true)
    setInfo(null)
    const data = await window.electronAPI.getMediaInfo(url)
    setInfo(data)
    setLoading(false)
  }

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-4 p-4 bg-dark-800/50 rounded-xl border border-dark-700/50">
      <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-gmd-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-dark-400 uppercase tracking-wider">{label}</div>
        <div className="font-medium text-white truncate">{value || '—'}</div>
      </div>
    </div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-600 to-blue-500 flex items-center justify-center">
          <Info className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold">{t('info.title')}</h2>
      </div>

      <div className="glass-panel p-6 space-y-4">
        <label className="block text-sm font-medium text-dark-300">{t('common.url')}</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
            <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder={t('common.enterUrl')} className="input-field pl-12" />
          </div>
          <button onClick={handleFetch} disabled={loading} className="btn-primary whitespace-nowrap">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('common.run')}
          </button>
        </div>
      </div>

      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-12 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-gmd-500 mx-auto mb-4" />
          <p className="text-dark-400">{t('info.fetching')}</p>
        </motion.div>
      )}

      {info && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <InfoRow icon={Film} label={t('info.mediaTitle')} value={info.title} />
          <InfoRow icon={User} label={t('info.uploader')} value={info.uploader} />
          <InfoRow icon={Clock} label={t('info.duration')} value={info.duration} />
          <InfoRow icon={Monitor} label={t('info.resolution')} value={info.resolution} />
          <InfoRow icon={FileType} label={t('info.format')} value={info.ext} />
          <InfoRow icon={Eye} label={t('info.views')} value={info.views} />

          {info.webpage_url && info.webpage_url !== '—' && (
            <div className="flex items-center gap-4 p-4 bg-dark-800/50 rounded-xl border border-dark-700/50">
              <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-gmd-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-dark-400 uppercase tracking-wider">URL</div>
                <a href={info.webpage_url} target="_blank" rel="noopener noreferrer" 
                   className="font-medium text-gmd-400 hover:text-gmd-300 truncate block">
                  {info.webpage_url}
                </a>
              </div>
            </div>
          )}
        </motion.div>
      )}

      <div className="flex gap-3 pt-4">
        <button onClick={() => setCurrentView('menu')} className="btn-secondary flex-1">{t('common.back')}</button>
      </div>
    </motion.div>
  )
}

export default MediaInfo