import React from 'react'
import { useTranslation } from 'react-i18next'
import { Scissors } from 'lucide-react'
import { parseClock, clipValid } from '../clip'

/**
 * اقتصاص جزء من المادّة قبل تنزيلها.
 *
 * شاشة «قصّ فيديو/صوت» تقصّ ملفّاً منزَّلاً؛ وهذا يقصّ قبل التنزيل فلا يُنزَّل ما
 * لا يُراد. والفرق في الفاتورة لا في النتيجة: مقطع من ساعتين يُراد منه دقيقة.
 *
 * والوقت يُحلَّل عند الطلب لا مع كلّ حرف: لو حُوِّل رقماً مع كلّ ضغطة لمُسحت «:»
 * قبل أن يبلغها المستخدم فتعذّر عليه كتابة «1:05» أصلاً.
 */
function ClipRange({ enabled, setEnabled, from, setFrom, to, setTo }) {
  const { t } = useTranslation()
  const fromOk = from.trim() === '' || parseClock(from) !== null
  const toOk = to.trim() === '' || parseClock(to) !== null
  const rangeOk = clipValid(enabled, from, to)

  return (
    <div className="glass-panel p-4 space-y-3">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={e => setEnabled(e.target.checked)}
          className="w-4 h-4 accent-gmd-500"
        />
        <Scissors className="w-4 h-4 text-gmd-400" />
        <span className="font-medium">{t('clipRange.title')}</span>
      </label>

      {enabled && (
        <>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-dark-400 mb-1">{t('clipRange.from')}</label>
              <input
                type="text" dir="ltr" placeholder="0:00"
                value={from} onChange={e => setFrom(e.target.value)}
                className={`input-field w-full ${fromOk ? '' : 'border-red-500'}`}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-dark-400 mb-1">{t('clipRange.to')}</label>
              <input
                type="text" dir="ltr" placeholder="1:30"
                value={to} onChange={e => setTo(e.target.value)}
                className={`input-field w-full ${toOk ? '' : 'border-red-500'}`}
              />
            </div>
          </div>
          <p className={`text-xs ${rangeOk ? 'text-dark-500' : 'text-red-400'}`}>
            {rangeOk ? t('clipRange.hint') : t('clipRange.invalid')}
          </p>
        </>
      )}
    </div>
  )
}

export default ClipRange
