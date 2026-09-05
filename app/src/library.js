/**
 * ذاكرةُ المعرضِ والمشغّل: قوائمُ المستخدمِ ومواضعُ الاستماع.
 *
 * ‏`localStorage` كما في بقيّةِ تفضيلاتِ البرنامج (`gmd-settings`): الكتابةُ صغيرةٌ
 * ومتكرّرةٌ — موضعُ الاستماعِ يُكتَبُ كلَّ خمسِ ثوانٍ — ولا تستحقُّ طلبَ IPC.
 */

const PLAYLISTS_KEY = 'gmd-playlists'
const POSITIONS_KEY = 'gmd-positions'

/** ما دونَ هذا لا يُعَدُّ موضعاً يُستأنَفُ منه، وقربَ النهايةِ يُعادُ من أوّلِه. */
const MIN_RESUME = 10
const END_MARGIN = 15

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch (e) { return fallback }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch (e) {}
}

// ── قوائمُ المستخدم ─────────────────────────────────────────────────────────
//
// القائمةُ ترتيبٌ لا نسخة: مساراتُ الملفّاتِ تُحفَظُ لا الملفّاتُ نفسُها، فحذفُ
// القائمةِ لا يمسُّ مقطعاً، وما حُذِفَ من القرصِ يسقطُ منها عندَ العرض.

export function loadPlaylists() {
  const all = read(PLAYLISTS_KEY, [])
  return Array.isArray(all) ? all : []
}

export function savePlaylists(all) { write(PLAYLISTS_KEY, all) }

export function createPlaylist(name, paths, isAudio) {
  const playlist = {
    id: 'pl-' + Date.now().toString(36),
    name: String(name || '').trim(),
    paths: [...new Set(paths)],
    isAudio: !!isAudio,
    createdAt: Math.floor(Date.now() / 1000),
  }
  savePlaylists([...loadPlaylists(), playlist])
  return playlist
}

export function addToPlaylist(id, paths) {
  savePlaylists(loadPlaylists().map(p =>
    p.id === id ? { ...p, paths: [...new Set([...p.paths, ...paths])] } : p))
}

export function removeFromPlaylist(id, filePath) {
  savePlaylists(loadPlaylists().map(p =>
    p.id === id ? { ...p, paths: p.paths.filter(x => x !== filePath) } : p))
}

/** يُنقَلُ عنصرٌ إلى موضعِ جارِه، فالترتيبُ من صنعِ صاحبِ القائمة. */
export function movePlaylistItem(id, from, to) {
  savePlaylists(loadPlaylists().map(p => {
    if (p.id !== id) return p
    if (from < 0 || to < 0 || from >= p.paths.length || to >= p.paths.length) return p
    const paths = [...p.paths]
    paths.splice(to, 0, paths.splice(from, 1)[0])
    return { ...p, paths }
  }))
}

export function renamePlaylist(id, name) {
  savePlaylists(loadPlaylists().map(p =>
    p.id === id ? { ...p, name: String(name || '').trim() } : p))
}

export function deletePlaylist(id) {
  savePlaylists(loadPlaylists().filter(p => p.id !== id))
}

// ── مواضعُ الاستماع ─────────────────────────────────────────────────────────
//
// من تركَ كتاباً صوتيّاً في دقيقتِه الأربعينَ يعودُ إليها لا إلى أوّلِه، وهي حاجةٌ
// في الموادِّ الطويلةِ لا زينة.

export function positionOf(filePath, duration) {
  const saved = read(POSITIONS_KEY, {})[filePath]
  if (!saved || saved < MIN_RESUME) return 0
  if (duration > 0 && saved > duration - END_MARGIN) return 0
  return saved
}

export function savePosition(filePath, seconds) {
  const all = read(POSITIONS_KEY, {})
  all[filePath] = Math.floor(seconds)
  // الذاكرةُ لا تنتفخُ بلا حدّ: يُبقى على آخرِ مئتَي مقطعٍ سُمِعَت
  const keys = Object.keys(all)
  if (keys.length > 200) for (const k of keys.slice(0, keys.length - 200)) delete all[k]
  write(POSITIONS_KEY, all)
}

export function clearPosition(filePath) {
  const all = read(POSITIONS_KEY, {})
  delete all[filePath]
  write(POSITIONS_KEY, all)
}

// ── أدواتُ عرض ──────────────────────────────────────────────────────────────
export function formatSize(bytes) {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB'
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB'
  if (bytes >= 1024) return Math.round(bytes / 1024) + ' KB'
  return bytes + ' B'
}

export function clockOf(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0))
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
  const pad = n => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`
}

/** آخرُ صفٍّ استمعَ إليه صاحبُه، فيجدُ المشغّلَ كما تركَه لا فارغاً. */
const QUEUE_KEY = 'gmd-queue'
export function loadQueue() { return read(QUEUE_KEY, null) }
export function saveQueue(queue, index) {
  if (!queue?.length) { try { localStorage.removeItem(QUEUE_KEY) } catch (e) {} ; return }
  write(QUEUE_KEY, { queue, index })
}
