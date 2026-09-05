import { useEffect } from 'react'

/** مهلةُ الهدوءِ قبلَ سؤالِ yt-dlp عن رابطٍ يُكتَبُ حرفاً حرفاً. */
const DELAY_MS = 700

/**
 * جلبُ معلوماتِ الرابطِ من تلقائِه، كما في نسخةِ الهاتف.
 *
 * كانَ المستخدمُ يلصقُ الرابطَ فلا يرى منه شيئاً حتّى يضغطَ «تنزيل»، فلا يعرفُ
 * أهو المقطعُ الذي أراد أم رابطٌ خاطئٌ نسخَه، ولا يُكشَفُ أنّه قائمةُ تشغيلٍ إلّا
 * بعدَ النقر. وشاشةُ «معلومات الوسائط» موجودةٌ لكنّها شاشةٌ أخرى، ونقلُ الرابطِ
 * إليها ثمّ العودةُ عملٌ لا يفعلُه أحد.
 *
 * والمهلةُ ليست زينة: الدالّةُ تُستدعى على كلِّ حرفٍ يُكتَب، وبلا تأخيرٍ يُشغَّلُ
 * yt-dlp عشراتِ المرّاتِ في ثانية. وكلُّ تغييرٍ يُلغي سابقَه، فلا تصلُ إلّا نتيجةُ
 * الرابطِ الأخير — ولا تُكتَبُ نتيجةٌ متأخّرةٌ فوقَ رابطٍ جديد.
 *
 * والكشفُ عن القائمةِ أوّلاً: `--flat-playlist` طلبٌ واحدٌ مهما طالت، ولو سألنا
 * عن المقطعِ أوّلاً لجلبنا بياناتِ أوّلِ عنصرٍ لا القائمة.
 */
export function useAutoInfo(url, patch, { disabled = false } = {}) {
  useEffect(() => {
    const target = String(url || '').trim()
    if (disabled) return
    if (!/^https?:\/\//i.test(target)) {
      patch({ info: null, infoError: null, infoLoading: false })
      return
    }

    let cancelled = false
    const timer = setTimeout(async () => {
      patch({ infoLoading: true, infoError: null })
      try {
        const pl = await window.electronAPI.checkPlaylist(target)
        if (cancelled) return
        if (pl?.isPlaylist && pl.count > 1) {
          patch({
            playlist: pl,
            selected: pl.entries.map(e => e.index),
            info: null, infoLoading: false,
          })
          return
        }
        const info = await window.electronAPI.getMediaInfo(target)
        if (cancelled) return
        patch({ info: info || null, infoError: info ? null : 'failed', infoLoading: false })
      } catch (e) {
        if (!cancelled) patch({ info: null, infoError: 'failed', infoLoading: false })
      }
    }, DELAY_MS)

    return () => { cancelled = true; clearTimeout(timer) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, disabled])
}
