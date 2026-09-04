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
