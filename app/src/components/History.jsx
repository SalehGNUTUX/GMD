import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { History as HistoryIcon, Trash2, RotateCcw, Copy, CheckCircle, XCircle, ListVideo, Loader2, CircleSlash } from 'lucide-react'
import { loadHistory, removeHistory, clearHistory, errorLine, statusOf } from '../history'

/**
 * سجلّ المحاولات.
 *
 * قائمة تشغيل تُعرض مدخلاً واحداً بمعلوماتها كاملة لا مدخلاً لكلّ ملفّ: المستخدم
 * طلب قائمةً فيُعرض له ما طلب لا ثلاثون سطراً متشابهاً.
 */
function History({ setCurrentView, onRetry }) {
  const { t } = useTranslation()
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [filter, setFilter] = useState('all')
  const [confirm, setConfirm] = useState(null)   // 'selected' | 'all'

  useEffect(() => { setItems(loadHistory()) }, [])

  // المرشِّحُ على الحالةِ لا على `ok` وحدَه: صارَ للمدخلِ أربعُ حالاتٍ لا حالتان
  const shown = items.filter(e => {
    const st = statusOf(e)
    if (filter === 'all') return true
    if (filter === 'ok') return st === 'ok'
    return st !== 'ok'
  })

  const toggle = id => setSelected(prev => {
    const s = new Set(prev)
    s.has(id) ? s.delete(id) : s.add(id)
    return s
  })

  const toggleAll = () =>
    setSelected(selected.size === shown.length ? new Set() : new Set(shown.map(e => e.id)))

  const doDelete = () => {
    setItems(confirm === 'all' ? clearHistory() : removeHistory([...selected]))
    setSelected(new Set())
    setConfirm(null)
  }

  const fmtDate = ms => new Date(ms).toLocaleString()

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
          <HistoryIcon className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold">{t('history.title')}</h2>
      </div>

      {items.length === 0 ? (
        <div className="glass-panel p-8 text-center space-y-2">
          <p className="font-medium">{t('history.empty')}</p>
          <p className="text-sm text-dark-400">{t('history.emptyHint')}</p>
        </div>
      ) : (
        <>
          <div className="glass-panel p-4 flex flex-wrap items-center gap-3">
            {['all', 'ok', 'failed'].map(f => (
              <button key={f} onClick={() => { setFilter(f); setSelected(new Set()) }}
                className={`px-3 py-1.5 rounded-full text-xs border transition ${
                  filter === f ? 'border-gmd-500 bg-gmd-900/30 text-gmd-200'
                               : 'border-dark-600 text-dark-400 hover:border-dark-500'}`}>
                {t(`history.filter_${f}`)}
              </button>
            ))}
            <span className="text-xs text-dark-400 ms-auto">
              {selected.size > 0 ? t('history.selected', { n: selected.size })
                                 : t('history.count', { n: shown.length })}
            </span>
            <button onClick={toggleAll} className="btn-secondary text-xs px-3 py-1.5">
              {selected.size === shown.length && shown.length > 0
                ? t('history.selectNone') : t('history.selectAll')}
            </button>
            <button onClick={() => setConfirm('selected')} disabled={selected.size === 0}
              className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">
              <Trash2 className="w-3 h-3 inline" /> {t('history.delete')}
            </button>
            <button onClick={() => setConfirm('all')} className="btn-secondary text-xs px-3 py-1.5">
              {t('history.clear')}
            </button>
          </div>

          <div className="space-y-2">
            {shown.map(e => (
              <div key={e.id}
                className={`glass-panel p-4 space-y-2 border ${
                  selected.has(e.id) ? 'border-gmd-500' : 'border-transparent'}`}>
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={selected.has(e.id)}
                    onChange={() => toggle(e.id)} className="mt-1 w-4 h-4 accent-gmd-500" />
                  {statusOf(e) === 'ok'
                    ? <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                    : statusOf(e) === 'running'
                      ? <Loader2 className="w-4 h-4 text-gmd-400 mt-0.5 animate-spin" />
                      : statusOf(e) === 'cancelled'
                        ? <CircleSlash className="w-4 h-4 text-amber-400 mt-0.5" />
                        : <XCircle className="w-4 h-4 text-red-400 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <div dir="auto" className="font-medium truncate flex items-center gap-2 text-start">
                      {e.playlist && <ListVideo className="w-3 h-3 text-gmd-400 shrink-0" />}
                      {e.title || e.url}
                    </div>
                    <div className="text-xs text-dark-400 truncate" dir="ltr">{e.url}</div>
                    <div className="text-xs text-dark-500 mt-1">
                      {e.playlist
                        ? t('history.playlistItems', { n: e.playlist.count })
                        : t(`history.kind_${e.kind || 'video'}`)}
                      {' · '}{fmtDate(e.at)}
                      {statusOf(e) === 'running' && ' · ' + t('history.state_running')}
                      {statusOf(e) === 'cancelled' && ' · ' + t('history.state_cancelled')}
                      {e.savePath ? ' · ' + e.savePath : ''}
                    </div>
                    {statusOf(e) === 'failed' && e.error && (
                      <pre className="mt-2 text-xs text-red-300 whitespace-pre-wrap max-h-24 overflow-y-auto">
                        {errorLine(e.error)}
                      </pre>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => onRetry(e)} className="btn-secondary text-xs px-3 py-1.5">
                    <RotateCcw className="w-3 h-3 inline" /> {statusOf(e) === 'ok' ? t('history.again') : t('history.retry')}
                  </button>
                  <button onClick={() => navigator.clipboard.writeText(e.url)}
                    className="btn-secondary text-xs px-3 py-1.5">
                    <Copy className="w-3 h-3 inline" /> {t('history.copyUrl')}
                  </button>
                  {!e.ok && e.error && (
                    <button onClick={() => navigator.clipboard.writeText(e.error)}
                      className="btn-secondary text-xs px-3 py-1.5">
                      {t('history.copyError')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <button onClick={() => setCurrentView('menu')} className="btn-secondary">
        {t('common.back')}
      </button>

      {confirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 max-w-sm w-full space-y-4">
            <h3 className="font-bold">{confirm === 'all' ? t('history.clear') : t('history.delete')}</h3>
            <p className="text-sm text-dark-300">
              {confirm === 'all' ? t('history.clearConfirm')
                                 : t('history.deleteConfirm', { n: selected.size })}
            </p>
            <div className="flex gap-3">
              <button onClick={doDelete} className="btn-primary flex-1">{t('history.delete')}</button>
              <button onClick={() => setConfirm(null)} className="btn-secondary flex-1">{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default History
