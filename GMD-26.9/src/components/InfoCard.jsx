import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Clock, Film, Loader2, Monitor, User, AlertTriangle } from 'lucide-react'

/**
 * بطاقةُ المقطعِ تحتَ حقلِ الرابط.
 *
 * تظهرُ من تلقائِها بعدَ لصقِ الرابط، فيرى المستخدمُ ما سيُنزّلُه قبلَ أن ينزّلَه:
 * العنوانُ والمحمِّلُ والمدّةُ والجودةُ المتاحة. ولا تظهرُ مع قائمةِ التشغيل —
 * لتلك بطاقتُها التي تعرضُ عناصرَها.
 */
function InfoCard({ info, loading, error }) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className="glass-panel p-4 flex items-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-gmd-500 flex-shrink-0" />
        <span className="text-sm text-dark-400">{t('info.fetching')}</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-panel p-4 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
        <span className="text-sm text-dark-400">{t('info.unavailable')}</span>
      </div>
    )
  }

  if (!info) return null

  const rows = [
    { icon: User, label: t('info.uploader'), value: info.uploader },
    { icon: Clock, label: t('info.duration'), value: info.duration },
    { icon: Monitor, label: t('info.resolution'), value: info.resolution },
  ].filter(r => r.value && r.value !== '—')

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-4 space-y-3"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-dark-700 flex items-center justify-center flex-shrink-0">
          <Film className="w-5 h-5 text-gmd-400" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-dark-400">{t('info.mediaTitle')}</div>
          <div dir="auto" className="font-medium text-white break-words">{info.title}</div>
        </div>
      </div>
      {rows.length > 0 && (
        <div className="flex flex-wrap gap-x-6 gap-y-2 ps-12">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2 text-sm">
              <Icon className="w-4 h-4 text-dark-500" />
              <span className="text-dark-400">{label}:</span>
              <span className="text-dark-200">{value}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default InfoCard
