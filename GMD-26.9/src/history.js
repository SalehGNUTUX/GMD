/**
 * سجلّ المحاولات.
 *
 * يحفظ كلّ رابط جُرِّب — نجح أو فشل — بمعلوماته وسبب فشله. والفرق بينه وبين
 * مجلَّد الحفظ جوهريّ: المحاولة الفاشلة لا ملفَّ لها، والملفّ الذي حذفه المستخدم
 * تبقى محاولته. وأنفعُ ما فيه إعادة المحاولة: كان إغلاق صندوق النتيجة يُضيع
 * الرابط وسبب الفشل معاً فلا يبقى ما تُعاد به الكرّة.
 *
 * يُخزَّن في localStorage كبقيّة إعدادات البرنامج. والرابط قد يحمل رمز جلسة أو
 * معرّفاً خاصّاً بصاحبه، فالسجلّ محلّيّ لا يُرفَع ولا يُشارَك.
 */

const KEY = 'gmd-history'

/** سقف يمنع النموّ بلا حدّ؛ الأقدم يسقط أوّلاً. */
export const MAX_ENTRIES = 500

export function loadHistory() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    // سجلّ تالف راحةٌ ضائعةٌ لا بياناتٌ لا تُعوَّض، فيُهمَل ولا يُسقِط الواجهة
    return []
  }
}

function save(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_ENTRIES)))
  } catch {
    // قد تمتلئ الحصّة؛ لا يُسقَط شيء لأجل السجلّ
  }
}

/**
 * يضيف محاولةً إلى رأس السجلّ.
 * @param {object} e {url, title, kind, choice, ok, error, savePath, playlist}
 */
export function addHistory(e) {
  const list = loadHistory()
  list.unshift({ id: Date.now() + Math.random(), at: Date.now(), ...e })
  save(list)
  return list.slice(0, MAX_ENTRIES)
}

/**
 * يفتح مدخلاً موسوماً «يجري» لحظةَ بدء المهمّة، ويُعيد معرّفه.
 *
 * وكان السجلّ يُكتَب عند الانتهاء وحدَه، فما قُتل في منتصفه — إغلاقُ البرنامج أو
 * انطفاءُ الجهاز — لا يترك أثراً إطلاقاً: لا الرابط ولا الجودة ولا أنّ محاولةً
 * وقعت أصلاً. وهذا سلوك نسخة الهاتف نفسه.
 */
export function startHistory(meta) {
  const id = Date.now() + Math.random()
  const list = loadHistory()
  list.unshift({ id, at: Date.now(), status: 'running', ok: false, ...meta })
  save(list)
  return id
}

/** يُغلق مدخلاً فُتِح عند البدء: نجاحاً أو فشلاً أو إلغاءً. */
export function finishHistory(id, { ok, error, savePath, cancelled = false }) {
  const list = loadHistory().map(e => (
    e.id === id
      ? { ...e, status: cancelled ? 'cancelled' : (ok ? 'ok' : 'failed'), ok: !!ok, error, savePath }
      : e
  ))
  save(list)
  return list
}

/**
 * يُسوّي ما بقي موسوماً «يجري» من جلسةٍ سابقة.
 *
 * لا مهمّةَ تنجو من إغلاق البرنامج، فكلُّ «يجري» عند الإقلاع محاولةٌ انقطعت.
 */
export function settleOrphans() {
  const list = loadHistory()
  if (!list.some(e => e.status === 'running')) return list
  const next = list.map(e => (e.status === 'running' ? { ...e, status: 'cancelled' } : e))
  save(next)
  return next
}

/** حالةُ المدخل، ومداخلُ ما قبل هذا الإصدار لا تحمل الحقل فتُقرَأ من `ok`. */
export function statusOf(e) {
  return e.status || (e.ok ? 'ok' : 'failed')
}

/**
 * مفتاحُ الرابط للمقارنة: مضيفٌ ومسارٌ ومعرّفا المقطع والقائمة.
 *
 * الرابط الواحد يُكتَب بصور: `youtu.be/x` و`www.youtube.com/watch?v=x&t=90`
 * ووسوم تتبُّعٍ تُلحَق به. فلولا التطبيع لما عُرِف السابق من الجديد.
 */
export function urlKey(url) {
  try {
    const u = new URL(String(url).trim())
    const v = u.searchParams.get('v')
    const list = u.searchParams.get('list')
    let key = u.host.replace(/^www\./, '').replace(/^m\./, '') + u.pathname.replace(/\/+$/, '')
    if (v) key += `?v=${v}`
    if (list) key += `&list=${list}`
    return key.toLowerCase()
  } catch {
    return String(url || '').trim().toLowerCase()
  }
}

/** أسبقَ لهذا الرابط تنزيلٌ ناجح؟ يُعيد المدخل أو `null`. */
export function previousSuccess(url) {
  const key = urlKey(url)
  return loadHistory().find(e => statusOf(e) === 'ok' && urlKey(e.url) === key) || null
}

export function removeHistory(ids) {
  const set = new Set(ids)
  const list = loadHistory().filter(e => !set.has(e.id))
  save(list)
  return list
}

export function clearHistory() {
  save([])
  return []
}

/** سطر الخطأ وحده: خرج yt-dlp يفتح بتحذير قِدَم النسخة فيغرق سطر ERROR تحته. */
export function errorLine(text) {
  const lines = String(text || '').split('\n').filter(l => l.trimStart().startsWith('ERROR:'))
  return (lines.length ? lines.join('\n') : String(text || '')).trim()
}
