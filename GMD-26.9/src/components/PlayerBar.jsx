import React from 'react'
import { useTranslation } from 'react-i18next'
import { Pause, Play, SkipBack, SkipForward, X } from 'lucide-react'
import Thumb from './Thumb'
import { clockOf } from '../library'

/**
 * شريطُ المشغّلِ المصغَّر.
 *
 * يبقى ظاهراً في كلِّ شاشةٍ ما دامَ في المشغّلِ مقطع، فالاستماعُ لا يُلغي التصفُّحَ
 * ولا التنزيل. والاسمُ في سطرٍ رفيعٍ فوقَ الأدوات: لو زاحمَها في صفٍّ واحدٍ لم يبقَ
 * له إلّا كلمتان، ولضاقَ الصفُّ عن زرِّ «السابق» — والمستمعُ إلى قائمةٍ يرجعُ فيها
 * كما يتقدّم. والنقرةُ على الشريطِ تفتحُ المشغّلَ كاملاً، وهو عُرفٌ يعرفُه كلُّ
 * مستمع.
 */
function PlayerBar({ player, onOpen }) {
  const { t } = useTranslation()
  const { queue, index, playing, position, duration, toggle, next, previous, stop } = player
  const track = queue[index]
  if (!track) return null

  const fraction = duration > 0 ? Math.min(100, (position / duration) * 100) : 0

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-dark-900/95 backdrop-blur border-t border-dark-700">
      <div className="h-0.5 bg-dark-700">
        <div className="h-full bg-gmd-500" style={{ width: `${fraction}%` }} />
      </div>

      <button onClick={onOpen}
        className="w-full px-4 pt-1.5 flex items-center gap-3 text-start hover:bg-dark-800/60">
        <span className="flex-1 truncate text-sm">{track.name}</span>
        {queue.length > 1 && (
          <span className="text-xs text-dark-400 flex-shrink-0">
            {t('player.itemOf', { i: index + 1, n: queue.length })}
          </span>
        )}
      </button>

      <div className="px-3 pb-2 pt-1 flex items-center gap-2">
        <button onClick={onOpen} className="flex-shrink-0">
          <Thumb entry={track} className="w-10 h-10" />
        </button>
        <span className="text-xs text-dark-400 flex-1" dir="ltr">
          {clockOf(position)} / {clockOf(duration)}
        </span>
        <div className="flex items-center gap-1" dir="ltr">
          <button onClick={previous} className="p-2 text-dark-300 hover:text-white" title={t('player.previous')}>
            <SkipBack className="w-4 h-4" />
          </button>
          <button onClick={toggle}
            className="w-9 h-9 rounded-full bg-gmd-500 hover:bg-gmd-400 text-white flex items-center justify-center"
            title={playing ? t('player.pause') : t('player.play')}>
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button onClick={next} disabled={index + 1 >= queue.length}
            className="p-2 text-dark-300 hover:text-white disabled:opacity-30" title={t('player.next')}>
            <SkipForward className="w-4 h-4" />
          </button>
          <button onClick={stop} className="p-2 text-dark-400 hover:text-white" title={t('player.stop')}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlayerBar
