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

/**
 * حاويةُ الفيديو الناتجة — إعادةُ تغليفٍ لا إعادةُ ترميز.
 *
 * `--merge-output-format` ينقلُ التيّارَين كما هما إلى حاويةٍ أخرى في ثوانٍ، بينما
 * إعادةُ الترميزِ دقائقُ وخسارةٌ في الجودة. ولذلك تُفضَّلُ الصيغةُ في **الاختيارِ**
 * أيضاً (`ext:` في ترتيبِ yt-dlp) فيُنتقى تيّارٌ لا يحتاجُ تغليفاً من أصلِه.
 *
 * و`best` لا يفرضُ شيئاً: يأخذُ ما يُعطيه الموقعُ كما هو. و`mkv` تقبلُ كلَّ ترميزٍ
 * فلا تحتاجُ تفضيلاً في الاختيار.
 *
 * ونسخةُ الهاتفِ تحملُ هذه الأربعةَ نفسَها في `Downloader.VideoFormat`.
 */
export const containers = [
  { id: 'mp4',  label: 'video.containerMp4',  ext: 'mp4',  sort: 'ext:mp4'  },
  { id: 'webm', label: 'video.containerWebm', ext: 'webm', sort: 'ext:webm' },
  { id: 'mkv',  label: 'video.containerMkv',  ext: 'mkv',  sort: null       },
  { id: 'best', label: 'video.containerBest', ext: null,   sort: null       },
]

/**
 * وُسَطاءُ yt-dlp لاختيارِ الجودةِ والحاوية — مصفوفةٌ لا نصٌّ، فلا صدفةَ ولا حقنَ أوامر.
 *
 * والقيدانِ في `-S` واحدٍ مفصولٍ بفواصل: تكرارُ الخيارِ يُلغي أوّلَه فتضيعُ الجودةُ
 * المطلوبةُ لأجلِ الحاوية.
 *
 * [containerId] يُترَكُ `best` افتراضاً كي لا تتبدّلَ سلوكيّاتُ من يستدعيها بلا
 * حاوية — شاشةُ التنزيلِ مع التحويلِ مثلاً — فتبقى كما كانت.
 */
export function videoFormatArgs(id, containerId = 'best') {
  const q = qualities.find(x => x.id === id) || qualities[qualities.length - 1]
  const c = containers.find(x => x.id === containerId) || containers[containers.length - 1]
  const sort = [q.sort, c.sort].filter(Boolean).join(',')
  const args = ['-f', q.format]
  if (sort) args.push('-S', sort)
  if (c.ext) args.push('--merge-output-format', c.ext)
  return args
}
