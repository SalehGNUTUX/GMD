/**
 * اختيارُ جودةِ الفيديو — مصدرٌ واحدٌ لشاشتَي التنزيلِ والتنزيلِ مع التحويل.
 *
 * الجودةُ سقفٌ على **الضلعِ الأصغر**، لا على الارتفاع.
 *
 * كانت السلسلةُ ترشِّحُ بـ`height` وحدَه: `bv*[height<=720]+ba/best[height<=720]`.
 * وهذا صحيحٌ في الفيديو الأفقيِّ حيثُ الارتفاعُ هو الضلعُ الأصغر، وخاطئٌ في
 * العموديِّ حيثُ ينقلبُ الأمر: مقطعُ «720p» عموديّاً مقاسُه 720×1280، فارتفاعُه
 * 1280 يتجاوزُ كلَّ سقفٍ يطلبُه المستخدم — حتّى سقفَ 1080 — فلا تُطابِقُ الشرطَ
 * صيغةٌ واحدةٌ ويموتُ التنزيلُ بـ`Requested format is not available`.
 *
 * فتُرِكَ الترشيحُ إلى `-S res:N`، وحقلُ `res` عندَ yt-dlp هو الضلعُ الأصغرُ نفسُه،
 * فيَصحُّ في الاتّجاهَين. وهو ترتيبٌ لا شرطٌ قاطع: يُقدِّمُ الأقربَ عندَ السقفِ أو
 * دونَه، فإن لم يكن في المصدرِ إلّا ما فوقَه اختارَ أصغرَ ما فوقَه بدلَ أن يفشل.
 * و`[height>0]` يستبعدُ الصيغَ التي لا تُعلِنُ مقاسَها من التفضيلِ الأوّل، لأنّ
 * المجهولَ يتصدّرُ ترتيبَ `res` زوراً، ويُبقيها احتياطاً أخيراً.
 *
 * ونسخةُ الهاتفِ تحملُ السلسلةَ نفسَها في `Downloader.kt` — أيُّ تغييرٍ هنا يُنقَلُ إليها.
 */
export const CAPPED = 'bv*[height>0]+ba/b[height>0]/bv*+ba/b'

export const qualities = [
  { id: '1080p', label: 'video.quality1080', format: CAPPED,     sort: 'res:1080' },
  { id: '720p',  label: 'video.quality720',  format: CAPPED,     sort: 'res:720'  },
  { id: '480p',  label: 'video.quality480',  format: CAPPED,     sort: 'res:480'  },
  { id: 'best',  label: 'video.qualityBest', format: 'bv*+ba/b', sort: null       },
]

/** وُسَطاءُ yt-dlp لاختيارِ الجودة — مصفوفةٌ لا نصٌّ، فلا صدفةَ ولا حقنَ أوامر. */
export function videoFormatArgs(id) {
  const q = qualities.find(x => x.id === id) || qualities[qualities.length - 1]
  return q.sort ? ['-f', q.format, '-S', q.sort] : ['-f', q.format]
}
