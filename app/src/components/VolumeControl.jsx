import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Volume1, Volume2, VolumeX } from 'lucide-react'

/**
 * مستوى الصوت: أيقونةٌ تفتحُ مِزلاقاً عموديّاً.
 *
 * والعموديُّ في فقاعةٍ لا مِزلاقٌ أفقيٌّ في الشريط: الشريطُ السفليُّ ضيّقٌ أصلاً
 * فيه الاسمُ والزمنُ وخمسةُ أزرار، ومِزلاقٌ أفقيٌّ يقتطعُ منه ما يضيقُ به الاسمُ.
 * فالأيقونةُ وحدَها ظاهرةٌ، والمِزلاقُ لا يظهرُ إلّا حينَ يُطلَب.
 *
 * والنقرُ على الأيقونةِ نفسِها يكتمُ الصوتَ ويُعيدُه — عُرفٌ في كلِّ مشغّل —
 * والنقرُ على السهمِ الصغيرِ يفتحُ المِزلاق... بل جُعِلَ أبسطَ من ذلك: النقرةُ
 * تفتحُ المِزلاقَ، والنقرُ المطوَّلُ لا يلزم، والكتمُ زرٌّ داخلَ الفقاعة. فالنقرةُ
 * الواحدةُ لا تحتملُ معنيَين.
 */
function VolumeControl({ volume, muted, onVolume, onToggleMute, up = true }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)

  // نقرةٌ خارجَ الفقاعةِ تُغلِقُها: فقاعةٌ عالقةٌ تحجبُ ما تحتَها
  useEffect(() => {
    if (!open) return
    const away = e => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', away)
    return () => document.removeEventListener('mousedown', away)
  }, [open])

  const Icon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2
  const percent = Math.round((muted ? 0 : volume) * 100)

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={() => setOpen(o => !o)}
        title={t('player.volume')}
        className="p-2 text-dark-300 hover:text-white"
      >
        <Icon className="w-4 h-4" />
      </button>

      {open && (
        <div
          className={`absolute ${up ? 'bottom-full mb-2' : 'top-full mt-2'} start-1/2 -translate-x-1/2
                      glass-panel px-2 py-3 flex flex-col items-center gap-2 z-50 shadow-lg`}
        >
          <span className="text-xs text-dark-400 tabular-nums">{percent}</span>
          <input
            type="range" min="0" max="100" step="1"
            value={percent}
            onChange={e => onVolume(Number(e.target.value) / 100)}
            className="accent-gmd-500 h-24"
            style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
            aria-label={t('player.volume')}
          />
          <button
            onClick={onToggleMute}
            title={muted ? t('player.unmute') : t('player.mute')}
            className="p-1 text-dark-300 hover:text-white"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  )
}

export default VolumeControl
