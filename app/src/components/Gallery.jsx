import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Check, Film, FolderOpen, Library, ListMusic, ListPlus, Music,
  PlayCircle, Scissors, Trash2, Pencil, ChevronUp, ChevronDown, X, RefreshCw,
} from 'lucide-react'
import Thumb from './Thumb'
import {
  loadPlaylists, createPlaylist, addToPlaylist, removeFromPlaylist,
  movePlaylistItem, renamePlaylist, deletePlaylist, formatSize,
} from '../library'

/**
 * معرضُ ما نزّله البرنامج، كنسخةِ الهاتف.
 *
 * والمصدرُ مجلَّدا الحفظِ الافتراضيّانِ ومستوىً واحدٌ تحتَهما: كلُّ قائمةِ تشغيلٍ
 * تُنزَّلُ في مجلَّدٍ باسمِها، فذلك المستوى هو القوائمُ وما في الجذرِ مفردات.
 * ولا يُقرَأُ القرصُ كلُّه: المعرضُ لما نزّله GMD لا مستكشفُ ملفّات.
 */
function Gallery({ setCurrentView, onPlay, onClip }) {
  const { t } = useTranslation()
  const [items, setItems] = useState(null)
  const [audioTab, setAudioTab] = useState(false)
  const [selected, setSelected] = useState([])
  const [openFolder, setOpenFolder] = useState(null)
  const [openUser, setOpenUser] = useState(null)
  const [playlists, setPlaylists] = useState([])
  const [adding, setAdding] = useState(null)
  const [newName, setNewName] = useState('')
  const [renaming, setRenaming] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  /**
   * حذفٌ مؤجَّلٌ بمهلةِ تراجع.
   *
   * التأكيدُ وحدَه لا يكفي: من نقرَ «احذف» وهو ساهٍ لا يُنقِذُه سؤالٌ نقرَ عليه
   * ساهياً أيضاً. فالمقاطعُ تختفي من المعرضِ فوراً — فيرى أثرَ فعلِه — ولا تُنقَلُ
   * إلى المهملاتِ إلّا بعدَ المهلة، وزرُّ «تراجع» يُلغي كلَّ شيءٍ فتعودُ مكانَها.
   */
  const [pending, setPending] = useState(null)   // { paths, count }
  const [left, setLeft] = useState(0)
  const pendingTimer = useRef(null)

  const roots = useMemo(() => {
    const s = JSON.parse(localStorage.getItem('gmd-settings') || '{}')
    const list = [
      s.defaultPaths?.video, s.defaultPaths?.audio,
      s.lastSaveDirs?.video, s.lastSaveDirs?.audio,
    ].filter(Boolean)
    return [...new Set(list)]
  }, [])

  const reload = async () => {
    setItems(await window.electronAPI.galleryList(roots))
    setPlaylists(loadPlaylists())
  }

  useEffect(() => { reload() }, [])

  const openPlaylist = playlists.find(p => p.id === openUser) || null

  /** المعروضُ الآن: قائمةُ مستخدمٍ بترتيبِها، أو مجلَّدُ تنزيلٍ، أو مفرداتُ التبويب. */
  const list = useMemo(() => {
    if (!items) return null
    // المحذوفُ المعلَّقُ يغيبُ عن العرضِ فوراً، ويعودُ إن تراجعَ صاحبُه
    if (openPlaylist) {
      return openPlaylist.paths
        .map(p => items.find(e => e.path === p))
        .filter(Boolean)
    }
    if (openFolder) {
      return items
        .filter(e => e.folder === openFolder.name && e.isAudio === openFolder.isAudio)
        .sort((a, b) => a.name.localeCompare(b.name))
    }
    return items.filter(e => !e.folder && e.isAudio === audioTab)
  }, [items, openPlaylist, openFolder, audioTab])

  const visible = useMemo(
    () => (list || []).filter(e => !pending?.paths.includes(e.path)),
    [list, pending],
  )

  const folders = useMemo(() => {
    if (!items) return []
    const map = new Map()
    for (const e of items) {
      if (!e.folder) continue
      const key = e.folder + ' ' + e.isAudio
      if (!map.has(key)) map.set(key, { name: e.folder, isAudio: e.isAudio, entries: [] })
      map.get(key).entries.push(e)
    }
    return [...map.values()]
      .map(f => ({ ...f, entries: f.entries.sort((a, b) => a.name.localeCompare(b.name)) }))
      .filter(f => f.isAudio === audioTab)
  }, [items, audioTab])

  const userPlaylists = playlists.filter(p => p.isAudio === audioTab)
  const entriesOf = pl => pl.paths.map(p => (items || []).find(e => e.path === p)).filter(Boolean)

  const chosen = (list || []).filter(e => selected.includes(e.path))
  const toggle = p => setSelected(s => s.includes(p) ? s.filter(x => x !== p) : [...s, p])
  const leave = () => { setOpenFolder(null); setOpenUser(null); setSelected([]) }

  const play = (queue, index) => {
    const audio = queue.filter(e => e.isAudio)
    if (!audio.length) return
    onPlay(audio, Math.max(0, index))
  }

  /** مهلةُ التراجعِ بالثواني: تكفي لإدراكِ الخطأِ ولا تُطيلُ انتظارَ من قصد. */
  const UNDO_SECONDS = 8

  /** يُنفّذُ الحذفَ فعلاً — يُستدعى عندَ انقضاءِ المهلةِ أو عندَ مغادرةِ الشاشة. */
  const commitTrash = async paths => {
    if (!paths?.length) return
    const r = await window.electronAPI.galleryTrash(paths)
    if (r?.error) alert(r.error)
    reload()
  }

  const startTrash = () => {
    setConfirmDelete(false)
    const paths = chosen.map(e => e.path)
    if (!paths.length) return
    // حذفٌ سابقٌ ما زالَ في مهلتِه: يُنفَّذُ الآنَ ولا يُنسى
    if (pending) commitTrash(pending.paths)
    clearInterval(pendingTimer.current)
    setSelected([])
    setPending({ paths, count: paths.length })
    setLeft(UNDO_SECONDS)
    let remaining = UNDO_SECONDS
    pendingTimer.current = setInterval(() => {
      remaining -= 1
      setLeft(remaining)
      if (remaining <= 0) {
        clearInterval(pendingTimer.current)
        setPending(cur => { if (cur) commitTrash(cur.paths); return null })
      }
    }, 1000)
  }

  const undoTrash = () => {
    clearInterval(pendingTimer.current)
    setPending(null)
  }

  // مغادرةُ الشاشةِ لا تُلغي الحذفَ ولا تُبقيه معلَّقاً إلى الأبد: يُنفَّذُ حالاً
  useEffect(() => () => {
    clearInterval(pendingTimer.current)
    setPending(cur => { if (cur) commitTrash(cur.paths); return null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const commitAdd = (id) => {
    if (id) addToPlaylist(id, adding)
    setPlaylists(loadPlaylists())
    setAdding(null)
    setNewName('')
    setSelected([])
  }

  const Row = ({ entry, index }) => {
    const isSelected = selected.includes(entry.path)
    return (
      <div
        className={`glass-panel p-3 flex items-center gap-3 cursor-pointer transition-colors
                    ${isSelected ? 'border-gmd-500/60 bg-gmd-500/10' : 'hover:bg-dark-700/60'}`}
        onClick={() => {
          if (selected.length) { toggle(entry.path); return }
          if (entry.isAudio) play(list, list.indexOf(entry))
          else window.electronAPI.galleryOpen(entry.path)
        }}
      >
        <button
          onClick={e => { e.stopPropagation(); toggle(entry.path) }}
          className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0
                      ${isSelected ? 'bg-gmd-500 border-gmd-500' : 'border-dark-600'}`}
          title={t('gallery.select')}
        >
          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
        </button>
        <Thumb entry={entry} />
        <div className="min-w-0 flex-1">
          <div className="text-sm text-white break-words">{entry.name}</div>
          <div className="text-xs text-dark-400">{formatSize(entry.size)}</div>
        </div>
        {openPlaylist && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button title={t('gallery.moveUp')} disabled={index === 0}
              onClick={e => {
                e.stopPropagation()
                const from = openPlaylist.paths.indexOf(entry.path)
                const to = openPlaylist.paths.indexOf(list[index - 1].path)
                movePlaylistItem(openPlaylist.id, from, to)
                setPlaylists(loadPlaylists())
              }}
              className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 disabled:opacity-30">
              <ChevronUp className="w-4 h-4" />
            </button>
            <button title={t('gallery.moveDown')} disabled={index === list.length - 1}
              onClick={e => {
                e.stopPropagation()
                const from = openPlaylist.paths.indexOf(entry.path)
                const to = openPlaylist.paths.indexOf(list[index + 1].path)
                movePlaylistItem(openPlaylist.id, from, to)
                setPlaylists(loadPlaylists())
              }}
              className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 disabled:opacity-30">
              <ChevronDown className="w-4 h-4" />
            </button>
            <button title={t('gallery.removeFromPlaylist')}
              onClick={e => {
                e.stopPropagation()
                removeFromPlaylist(openPlaylist.id, entry.path)
                setPlaylists(loadPlaylists())
              }}
              className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-dark-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <button
          title={t('gallery.reveal')}
          onClick={e => { e.stopPropagation(); window.electronAPI.galleryReveal(entry.path) }}
          className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 flex-shrink-0"
        >
          <FolderOpen className="w-4 h-4" />
        </button>
      </div>
    )
  }

  const FolderCard = ({ name, entries, isAudio, onOpen, onRename, onDelete }) => (
    <div className="glass-panel p-3 flex items-center gap-3 cursor-pointer hover:bg-dark-700/60"
         onClick={onOpen}>
      <Thumb entry={entries[0] || { path: '', isAudio }} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <ListMusic className="w-4 h-4 text-gmd-400 flex-shrink-0" />
          <span className="text-sm text-white truncate">{name}</span>
        </div>
        <div className="text-xs text-dark-400">
          {t('gallery.itemCount', { n: entries.length })}
          {entries.length > 0 && ' - ' + formatSize(entries.reduce((a, e) => a + e.size, 0))}
        </div>
      </div>
      {isAudio && entries.length > 0 && (
        <button title={t('gallery.playAll')}
          onClick={e => { e.stopPropagation(); play(entries, 0) }}
          className="p-1.5 rounded-lg text-gmd-400 hover:bg-dark-700 flex-shrink-0">
          <PlayCircle className="w-5 h-5" />
        </button>
      )}
      {onRename && (
        <button title={t('gallery.rename')}
          onClick={e => { e.stopPropagation(); onRename() }}
          className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 flex-shrink-0">
          <Pencil className="w-4 h-4" />
        </button>
      )}
      {onDelete && (
        <button title={t('gallery.deletePlaylist')}
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-dark-700 flex-shrink-0">
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center">
          <Library className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold flex-1">{t('gallery.title')}</h2>
        <button onClick={reload} className="btn-secondary" title={t('gallery.refresh')}>
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {(openFolder || openPlaylist) && (
        <div className="flex items-center gap-2">
          <button onClick={leave} className="btn-secondary px-3 py-2"><ArrowLeft className="w-4 h-4" /></button>
          <span className="font-medium truncate">{openPlaylist?.name || openFolder?.name}</span>
        </div>
      )}

      {!openFolder && !openPlaylist && (
        <div className="flex gap-2">
          {[false, true].map(a => (
            <button key={String(a)}
              onClick={() => { setAudioTab(a); setSelected([]) }}
              className={`flex-1 py-2 rounded-xl border transition-colors flex items-center justify-center gap-2
                          ${audioTab === a ? 'border-gmd-500 bg-gmd-500/10 text-white'
                                           : 'border-dark-700 text-dark-400 hover:text-white'}`}>
              {a ? <Music className="w-4 h-4" /> : <Film className="w-4 h-4" />}
              {a ? t('gallery.audios') : t('gallery.videos')}
            </button>
          ))}
        </div>
      )}

      {list && (list.length > 0 || userPlaylists.length > 0 || folders.length > 0) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-dark-400 flex-1">
            {selected.length
              ? t('gallery.selected', { n: selected.length })
              : t('gallery.count', { n: list.length })}
          </span>
          <button className="btn-secondary px-3 py-2 text-sm"
            onClick={() => setSelected(selected.length === list.length ? [] : list.map(e => e.path))}>
            {selected.length === list.length && list.length > 0
              ? t('gallery.selectNone') : t('gallery.selectAll')}
          </button>
          <button className="btn-secondary px-3 py-2 text-sm disabled:opacity-40"
            disabled={!chosen.length}
            onClick={() => { setAdding(chosen.map(e => e.path)); setNewName('') }}
            title={t('gallery.addToPlaylist')}>
            <ListPlus className="w-4 h-4" />
          </button>
          <button className="btn-secondary px-3 py-2 text-sm disabled:opacity-40"
            disabled={chosen.length !== 1}
            onClick={() => onClip(chosen[0].path)}
            title={t('gallery.clip')}>
            <Scissors className="w-4 h-4" />
          </button>
          <button className="btn-secondary px-3 py-2 text-sm disabled:opacity-40"
            disabled={!chosen.length}
            onClick={() => setConfirmDelete(true)}
            title={t('gallery.trash')}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {!list ? (
        <div className="glass-panel p-10 text-center text-dark-400">{t('gallery.loading')}</div>
      ) : (openPlaylist || openFolder) ? (
        <div className="space-y-2">
          {visible.length === 0 && (
            <div className="glass-panel p-8 text-center text-dark-400">{t('gallery.playlistEmpty')}</div>
          )}
          {visible.map((e, i) => <Row key={e.path} entry={e} index={i} />)}
        </div>
      ) : (list.length === 0 && folders.length === 0 && userPlaylists.length === 0) ? (
        <div className="glass-panel p-8 text-center space-y-2">
          <p className="text-dark-300">{t('gallery.empty')}</p>
          <p className="text-sm text-dark-400">{t('gallery.emptyHint')}</p>
        </div>
      ) : (
        <div className="space-y-5">
          {userPlaylists.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-dark-300">
                <ListMusic className="w-4 h-4 text-gmd-400" />
                {t('gallery.myPlaylists')} - {userPlaylists.length}
              </div>
              {userPlaylists.map(pl => (
                <FolderCard key={pl.id} name={pl.name} entries={entriesOf(pl)}
                  isAudio={pl.isAudio}
                  onOpen={() => { setOpenUser(pl.id); setSelected([]) }}
                  onRename={() => { setRenaming(pl); setNewName(pl.name) }}
                  onDelete={() => {
                    deletePlaylist(pl.id)
                    setPlaylists(loadPlaylists())
                  }} />
              ))}
            </div>
          )}

          {folders.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-dark-300">
                <ListMusic className="w-4 h-4 text-gmd-400" />
                {t('gallery.downloadedPlaylists')} - {folders.length}
              </div>
              {folders.map(f => (
                <FolderCard key={f.name + f.isAudio} name={f.name} entries={f.entries}
                  isAudio={f.isAudio}
                  onOpen={() => { setOpenFolder({ name: f.name, isAudio: f.isAudio }); setSelected([]) }} />
              ))}
            </div>
          )}

          {list.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-dark-300">
                {audioTab ? <Music className="w-4 h-4 text-gmd-400" /> : <Film className="w-4 h-4 text-gmd-400" />}
                {t('gallery.singles')} - {list.length}
              </div>
              {visible.map((e, i) => <Row key={e.path} entry={e} index={i} />)}
              {userPlaylists.length === 0 && (
                <p className="text-xs text-dark-500">{t('gallery.playlistHint')}</p>
              )}
            </div>
          )}
        </div>
      )}

      {adding && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6"
             onClick={() => setAdding(null)}>
          <div className="glass-panel p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg">{t('gallery.addToPlaylist')}</h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {playlists.filter(p => p.isAudio === audioTab).map(pl => (
                <button key={pl.id} onClick={() => commitAdd(pl.id)}
                  className="w-full text-start glass-panel p-3 hover:bg-dark-700/60 flex items-center gap-2">
                  <ListMusic className="w-4 h-4 text-gmd-400" />
                  <span className="flex-1 truncate">{pl.name}</span>
                  <span className="text-xs text-dark-400">{pl.paths.length}</span>
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <label className="text-sm text-dark-300">{t('gallery.newPlaylist')}</label>
              <input className="input-field" value={newName} onChange={e => setNewName(e.target.value)}
                placeholder={t('gallery.playlistName')} />
            </div>
            <div className="flex gap-2">
              <button className="btn-primary flex-1 disabled:opacity-40" disabled={!newName.trim()}
                onClick={() => { createPlaylist(newName, adding, audioTab); commitAdd(null) }}>
                {t('gallery.create')}
              </button>
              <button className="btn-secondary flex-1" onClick={() => setAdding(null)}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {renaming && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6"
             onClick={() => setRenaming(null)}>
          <div className="glass-panel p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg">{t('gallery.rename')}</h3>
            <input className="input-field" value={newName} onChange={e => setNewName(e.target.value)} />
            <div className="flex gap-2">
              <button className="btn-primary flex-1 disabled:opacity-40" disabled={!newName.trim()}
                onClick={() => {
                  renamePlaylist(renaming.id, newName)
                  setPlaylists(loadPlaylists())
                  setRenaming(null)
                }}>
                {t('gallery.rename')}
              </button>
              <button className="btn-secondary flex-1" onClick={() => setRenaming(null)}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6"
             onClick={() => setConfirmDelete(false)}>
          <div className="glass-panel p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg">{t('gallery.trash')}</h3>
            <p className="text-sm text-dark-300">{t('gallery.trashConfirm', { n: chosen.length })}</p>
            <p className="text-xs text-dark-400">{t('gallery.trashUndoHint', { n: UNDO_SECONDS })}</p>
            <div className="flex gap-2">
              <button className="btn-primary flex-1" onClick={startTrash}>{t('gallery.trash')}</button>
              <button className="btn-secondary flex-1" onClick={() => setConfirmDelete(false)}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {pending && (
        <div className="fixed bottom-6 inset-x-0 flex justify-center z-40 pointer-events-none">
          <div className="glass-panel px-4 py-3 flex items-center gap-4 pointer-events-auto shadow-lg">
            <span className="text-sm">{t('gallery.trashed', { n: pending.count })}</span>
            <span className="text-xs text-dark-400">{left}</span>
            <button onClick={undoTrash} className="text-gmd-400 hover:text-gmd-300 font-medium text-sm">
              {t('gallery.undo')}
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={() => setCurrentView('menu')} className="btn-secondary flex-1">
          {t('common.back')}
        </button>
      </div>
    </motion.div>
  )
}

export default Gallery
