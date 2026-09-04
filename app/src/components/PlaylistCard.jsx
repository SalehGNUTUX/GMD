import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ListVideo, Check, Loader2 } from 'lucide-react'

/**
 * قائمةُ التشغيلِ بطاقةً في الشاشةِ لا نافذةً منبثقة.
 *
 * كانت نافذةً تُغلَقُ لحظةَ بدءِ التنزيل، فيُنزَّلُ ثلاثونَ مقطعاً ولا يرى صاحبُها
 * أيَّها تمَّ وأيَّها يجري. وبالبطاقةِ تبقى العناصرُ أمامَه: ما تمَّ بعلامةِ صحٍّ وما
 * يجري بدوّارة.
 *
 * [current] موضعُ العنصرِ الجاري في **المختارِ** لا في القائمةِ كلِّها: `--playlist-items`
 * يجعلُ «العنصر 3 من 7» ترتيباً في المطلوبِ لا رقمَ الفهرس.
 */
function PlaylistCard({ info, selected, onToggle, onToggleAll, current = 0, done = false, running = false }) {
  const { t } = useTranslation()
  if (!info) return null

  const chosen = selected || []
  const order = [...chosen].sort((a, b) => a - b)

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-5 space-y-3">
      <div className="flex items-center gap-3">
        <ListVideo className="w-5 h-5 text-gmd-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{info.title || t('errors.playlistDetected')}</p>
          <p className="text-xs text-dark-400">
            {t('playlist.selectedOf', { n: chosen.length, total: info.entries.length })}
          </p>
        </div>
        <button onClick={onToggleAll} disabled={running}
          className="text-xs text-gmd-400 hover:text-gmd-300 disabled:opacity-40">
          {chosen.length === info.entries.length
            ? t('errors.playlistDeselectAll') : t('errors.playlistSelectAll')}
        </button>
      </div>

      <p className="text-xs text-dark-500">{t('playlist.folderNote')}</p>

      <div className="max-h-56 overflow-y-auto rounded-xl border border-dark-700/40 divide-y divide-dark-800/40">
        {info.entries.map(entry => {
          const picked = chosen.includes(entry.index)
          const position = order.indexOf(entry.index) + 1
          const itemDone = picked && (done || (current > 0 && position > 0 && position < current))
          const itemNow = picked && current > 0 && position === current
          return (
            <button key={entry.index} onClick={() => !running && onToggle(entry.index)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-start transition-colors ${
                picked ? 'bg-dark-800/30' : ''
              } ${running ? 'cursor-default' : 'hover:bg-dark-800/60'}`}>
              {/* أثناءَ العملِ تحلُّ علامةُ الحالِ محلَّ مربّعِ الاختيار: الاختيارُ انتهى
                  والذي يهمُّ الآنَ ما تمَّ وما يجري */}
              {itemDone ? (
                <Check className="w-5 h-5 text-gmd-400 flex-shrink-0" />
              ) : itemNow ? (
                <Loader2 className="w-5 h-5 text-gmd-400 animate-spin flex-shrink-0" />
              ) : (
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  picked ? 'bg-gmd-500 border-gmd-500' : 'border-dark-500'
                }`}>
                  {picked && <Check className="w-3 h-3 text-white" />}
                </div>
              )}
              <span className="text-xs text-dark-400 flex-shrink-0 w-6" dir="ltr">{entry.index}.</span>
              <span className="text-sm flex-1 truncate">{entry.title}</span>
              {entry.duration && (
                <span className="text-xs text-dark-500 flex-shrink-0" dir="ltr">{entry.duration}</span>
              )}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

export default PlaylistCard
