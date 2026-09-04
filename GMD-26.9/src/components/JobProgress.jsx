import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Loader2, XCircle, Zap, Clock } from 'lucide-react'

/**
 * تقدُّمُ مهمّةٍ داخلَ شاشتِها، لا غشاءً يحجبُ البرنامجَ كلَّه.
 *
 * كان صندوقُ التقدُّمِ يملأُ النافذةَ فلا يستطيعُ المستخدمُ أن يبدأَ تنزيلاً آخرَ ولا
 * أن ينظرَ في شاشةٍ ثانيةٍ ما دامَ يعمل — وهو حاجزٌ لا فائدةَ منه بعدَ أن صارت
 * النواةُ تحملُ مهامَّ متوازية.
 *
 * والمرحلةُ مكتوبةٌ مع النسبة: النسبةُ تقفُ عندَ 100٪ حينَ ينتهي التنزيلُ ويبدأُ
 * ما بعدَه — استخراجُ صوتٍ أو تجميعُ تيّارَين — فيظنُّ المستخدمُ أنّ البرنامجَ تجمّد.
 */
function JobProgress({ job, onCancel }) {
  const { t } = useTranslation()
  if (!job) return null

  const phaseLabel = t(`phase.${job.phase || 'downloading'}`)
  // ما بعدَ التنزيلِ لا نسبةَ له عندَ yt-dlp، فيُعرَضُ شريطٌ متحرّكٌ بلا رقمٍ كاذب
  const determinate = (job.phase || 'downloading') === 'downloading' &&
    job.percent !== null && job.percent !== undefined
  const percent = determinate ? Math.min(Math.round(job.percent), 100) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-5 space-y-3 border-gmd-700/40"
    >
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-gmd-400 flex-shrink-0" />
        <span className="font-medium flex-1">{phaseLabel}</span>
        {job.itemCount > 1 && job.item > 0 && (
          <span dir="ltr" className="font-mono text-xs text-gmd-300 bg-gmd-900/40 border border-gmd-700/40 rounded-lg px-2 py-0.5">
            {job.item} / {job.itemCount}
          </span>
        )}
        {percent !== null && (
          <span dir="ltr" className="font-mono text-sm text-gmd-300">{percent}%</span>
        )}
      </div>

      <div className="h-2 rounded-full bg-dark-800 overflow-hidden">
        {percent !== null ? (
          <div className="h-full bg-gmd-500 transition-all duration-300"
               style={{ width: `${percent}%` }} />
        ) : (
          <div className="h-full w-1/3 bg-gmd-500/70 animate-pulse" />
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-dark-400">
        {job.speed && (
          <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> <span dir="ltr">{job.speed}</span></span>
        )}
        {job.eta && (
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> <span dir="ltr">{job.eta}</span></span>
        )}
        <button onClick={onCancel}
          className="ms-auto flex items-center gap-1 text-red-400 hover:text-red-300">
          <XCircle className="w-4 h-4" /> {t('common.cancel')}
        </button>
      </div>
    </motion.div>
  )
}

export default JobProgress
