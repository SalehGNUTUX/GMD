import React from 'react'
import { useTranslation } from 'react-i18next'
import { Scissors } from 'lucide-react'
import { parseClock, clipValid } from '../clip'
import ClockInput, { clockOfSeconds } from './ClockInput'

/**
 * اقتصاص جزء من المادّة قبل تنزيلها.
 *
 * شاشة «قصّ فيديو/صوت» تقصّ ملفّاً منزَّلاً؛ وهذا يقصّ قبل التنزيل فلا يُنزَّل ما
 * لا يُراد. والفرق في الفاتورة لا في النتيجة: مقطع من ساعتين يُراد منه دقيقة.
 *
 * والوقت يُحلَّل عند الطلب لا مع كلّ حرف: لو حُوِّل رقماً مع كلّ ضغطة لمُسحت «:»
 * قبل أن يبلغها المستخدم فتعذّر عليه كتابة «1:05» أصلاً.
 */
function ClipRange({ enabled, setEnabled, from, setFrom, to, setTo, duration = null }) {
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
          onChange={e => {
            setEnabled(e.target.checked)
            // مدّةُ المقطعِ تُملأُ في «إلى» عندَ فتحِ القسم: القصُّ يُقلِّمُ طرفَي
            // مقطعٍ كامل، فالمدّةُ هي المبدأُ الطبيعيُّ لا حقلٌ فارغٌ يُملأُ باليد.
            // وهي من معلوماتِ الرابطِ المجلوبةِ تلقائيّاً، فإن لم تُعرَف بقيَ
            // الحقلُ فارغاً كما كان.
            if (e.target.checked && !to.trim() && duration) setTo(clockOfSeconds(duration))
          }}
          className="w-4 h-4 accent-gmd-500"
        />
        <Scissors className="w-4 h-4 text-gmd-400" />
        <span className="font-medium">{t('clipRange.title')}</span>
      </label>

      {enabled && (
        <>
          <div className="flex gap-3">
            <ClockInput label={t('clipRange.from')} value={from} onChange={setFrom}
              invalid={!fromOk} />
            <ClockInput label={t('clipRange.to')} value={to} onChange={setTo}
              invalid={!toOk} />
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
