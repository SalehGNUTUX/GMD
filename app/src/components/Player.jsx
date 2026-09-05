import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { AudioLines, Library, Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import Thumb from './Thumb'
import { clockOf } from '../library'

/**
 * المشغّلُ كاملاً: المقطعُ الجاري ومقبضُ الزمنِ وأزرارُه، ثمّ صفُّ التشغيل.
 *
 * وعنصرُ الصوتِ نفسُه ليس هنا بل في `App`: هذه الشاشةُ تُفكَّكُ عندَ الخروجِ منها،
 * فلو كانَ فيها لانقطعَ الصوتُ كلَّما نظرَ المستخدمُ في شاشةٍ أخرى — والاستماعُ لا
 * يُلغي التصفُّحَ ولا التنزيل.
 */
function Player({ setCurrentView, player }) {
  const { t } = useTranslation()
  const { queue, index, playing, position, duration, toggle, next, previous, seek, jump } = player
  const track = queue[index] || null

  if (!track) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-600 to-purple-500 flex items-center justify-center">
            <AudioLines className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold">{t('player.title')}</h2>
        </div>
        <div className="glass-panel p-8 text-center space-y-4">
          <p className="text-dark-300">{t('player.empty')}</p>
          <button onClick={() => setCurrentView('gallery')} className="btn-primary inline-flex items-center gap-2">
            <Library className="w-4 h-4" />
            {t('gallery.title')}
          </button>
        </div>
        <button onClick={() => setCurrentView('menu')} className="btn-secondary w-full">
          {t('common.back')}
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-600 to-purple-500 flex items-center justify-center">
          <AudioLines className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold">{t('player.title')}</h2>
      </div>

      <div className="glass-panel p-6 space-y-5">
        <div className="flex justify-center">
          <Thumb entry={track} className="w-56 h-40" rounded="rounded-2xl" />
        </div>

        <div className="text-center space-y-1">
          <div className="font-medium break-words">{track.name}</div>
          {queue.length > 1 && (
            <div className="text-xs text-dark-400">
              {t('player.itemOf', { i: index + 1, n: queue.length })}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <input
            type="range" min={0} max={Math.max(1, duration)} step="1" value={position}
            onChange={e => seek(Number(e.target.value))}
            className="w-full accent-gmd-500"
            dir="ltr"
          />
          <div className="flex justify-between text-xs text-dark-400" dir="ltr">
            <span>{clockOf(position)}</span>
            <span>{clockOf(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6" dir="ltr">
          <button onClick={previous} className="p-2 text-dark-300 hover:text-white" title={t('player.previous')}>
            <SkipBack className="w-7 h-7" />
          </button>
          <button onClick={toggle}
            className="w-16 h-16 rounded-full bg-gmd-500 hover:bg-gmd-400 text-white flex items-center justify-center"
            title={playing ? t('player.pause') : t('player.play')}>
            {playing ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7" />}
          </button>
          <button onClick={next} disabled={index + 1 >= queue.length}
            className="p-2 text-dark-300 hover:text-white disabled:opacity-30" title={t('player.next')}>
            <SkipForward className="w-7 h-7" />
          </button>
        </div>
      </div>

      {queue.length > 1 && (
        <div className="space-y-2">
          <div className="text-sm text-dark-300">{t('player.queue')}</div>
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {queue.map((entry, i) => (
              <button key={entry.path} onClick={() => jump(i)}
                className={`w-full text-start p-2 rounded-lg flex items-center gap-3 transition-colors
                            ${i === index ? 'bg-gmd-500/15 text-white' : 'text-dark-300 hover:bg-dark-700/60'}`}>
                <span className="text-xs text-dark-500 w-6 text-center flex-shrink-0">{i + 1}</span>
                <span className="flex-1 truncate text-sm">{entry.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <button onClick={() => setCurrentView('menu')} className="btn-secondary w-full">
        {t('common.back')}
      </button>
    </motion.div>
  )
}

export default Player
