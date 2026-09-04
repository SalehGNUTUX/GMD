/**
 * اقتصاص جزء من المادّة عند التنزيل.
 *
 * على الحاسوب هذا توفير في البيانات والزمن لا زينة: يُطلب الجزء من الخادم فلا
 * يُنزَّل ما لا يُراد. وترفض بعض المواقع ذلك — يوتيوب يردّ 403 على جلب ffmpeg
 * نطاقاً من روابطه — فيبقى قصُّ ملفّ منزَّل عبر شاشة «قصّ فيديو/صوت» طريقاً ثانياً.
 *
 * ولا يُمرَّر `--force-keyframes-at-cuts`: يُدقّق الحدّ لكنّه يعيد الترميز كاملاً،
 * وذلك دقائق من المعالجة لأجل جزء من ثانية. فالقطع يقع عند أقرب إطار مفتاحيّ.
 */

/** يقبل ثوانيَ مجرّدة، أو m:ss، أو h:mm:ss. ويُعيد null إن لم يصحّ. */
export function parseClock(text) {
  const t = String(text ?? '').trim()
  if (!t) return null
  const parts = t.split(':')
  if (parts.length > 3) return null
  let total = 0
  for (const p of parts) {
    const n = Number(p.trim())
    if (!Number.isInteger(n) || n < 0 || p.trim() === '') return null
    total = total * 60 + n
  }
  return total
}

/** وُسَطاء yt-dlp للاقتصاص، أو مصفوفة فارغة إن لم يكن مطلوباً أو صالحاً. */
export function clipArgs(enabled, fromText, toText) {
  if (!enabled) return []
  // الفراغ وحده يعني البداية؛ أمّا نصٌّ غير صالح فيُرفَض ولا يُقرأ صفراً صامتاً،
  // وإلّا نزّل من كتب «abc» من أوّل المقطع وهو يظنّ أنّه حدّد موضعاً.
  const blank = String(fromText ?? '').trim() === ''
  const from = blank ? 0 : parseClock(fromText)
  const to = parseClock(toText)
  if (from === null || to === null || to <= from) return []
  return ['--download-sections', `*${from}-${to}`]
}

/** أصالحٌ المدى المكتوب؟ يُستعمل لتعطيل زرّ التنزيل وإظهار التنبيه. */
export function clipValid(enabled, fromText, toText) {
  if (!enabled) return true
  return clipArgs(enabled, fromText, toText).length > 0
}
