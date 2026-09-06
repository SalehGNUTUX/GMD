import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * حدٌّ زمنيٌّ في ثلاثِ خاناتٍ رقميّة: ساعاتٌ ودقائقُ وثوانٍ — كنسخةِ الهاتف.
 *
 * كانَ حقلاً واحداً يُكتَبُ فيه `1:05:20` بيدِ صاحبِه، فيُخطئُ في النقطتَينِ أو
 * يكتبُ ثوانيَ مجرَّدةً ولا يدري أقُبِلَت أم لا. والثلاثةُ تُلزِمُه الصيغةَ من
 * أصلِها.
 *
 * وخانةُ كلِّ وحدةٍ نصُّها مستقلٌّ عن القيمةِ المجموعة: لو اشتُقَّ منها لعادَ الصفرُ
 * إلى الخانةِ لحظةَ مسحِه — فالقيمةُ `H:MM:SS` لا تخلو من أصفارٍ أبداً — ولتعذّرَ
 * إفراغُها. والنقرُ يُحدِّدُ ما فيها فالكتابةُ تُبدِّلُه ولا تُلحَقُ به.
 *
 * والقيمةُ المرفوعةُ تبقى نصّاً على صيغةِ `H:MM:SS`، فلا يتغيّرُ ما يقرؤه
 * `clipArgs` ولا فحصُ الحدَّين. وإن خلت الخاناتُ الثلاثُ رُفِعَ نصٌّ فارغٌ — وهو
 * ما يعنيه «بلا حدّ».
 */
function ClockInput({ label, value, onChange, invalid = false, disabled = false }) {
  const { t } = useTranslation()
  const [boxes, setBoxes] = useState(() => split(value))
  const [emitted, setEmitted] = useState(value)

  // تغيَّرت القيمةُ من خارجِنا — كتعبئةِ المدّةِ تلقائيّاً — فتُعادُ بناءُ الخانات
  if (value !== emitted) {
    setBoxes(split(value))
    setEmitted(value)
  }

  const push = next => {
    setBoxes(next)
    const [h, m, s] = next
    const text = (h === '' && m === '' && s === '')
      ? ''
      : `${Number(h) || 0}:${String(Number(m) || 0).padStart(2, '0')}:${String(Number(s) || 0).padStart(2, '0')}`
    setEmitted(text)
    onChange(text)
  }

  const box = (i, placeholder) => (
    <input
      type="text"
      inputMode="numeric"
      dir="ltr"
      disabled={disabled}
      placeholder={placeholder}
      value={boxes[i]}
      onFocus={e => e.target.select()}
      onChange={e => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, 2)
        const next = [...boxes]
        next[i] = digits
        push(next)
      }}
      className={`input-field w-full px-1 py-2 ${invalid ? 'border-red-500' : ''}`}
    />
  )

  return (
    <div className="flex-1">
      <label className="block text-xs text-dark-400 mb-1">{label}</label>
      <div className="flex gap-1" dir="ltr">
        {box(0, t('clipRange.hours'))}
        {box(1, t('clipRange.minutes'))}
        {box(2, t('clipRange.seconds'))}
      </div>
    </div>
  )
}

/** يفكُّ `H:MM:SS` أو `M:SS` أو ثوانيَ مجرَّدةً إلى خاناتِه الثلاث. */
function split(value) {
  const text = String(value ?? '').trim()
  if (!text) return ['', '', '']
  const parts = text.split(':').map(p => p.trim())
  if (parts.length === 3) return [Number(parts[0]) ? parts[0] : '', parts[1], parts[2]]
  if (parts.length === 2) return ['', parts[0], parts[1]]
  const total = Number(parts[0])
  if (!Number.isFinite(total)) return ['', '', parts[0]]
  return [
    Math.floor(total / 3600) ? String(Math.floor(total / 3600)) : '',
    String(Math.floor((total % 3600) / 60)),
    String(total % 60),
  ]
}

/** ثوانٍ إلى `H:MM:SS` — تُملأُ بها حقولُ الوقتِ من مدّةٍ معروفة. */
export function clockOfSeconds(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0))
  return `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export default ClockInput
