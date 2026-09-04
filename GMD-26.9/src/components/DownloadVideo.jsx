import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Link, Folder, Film, Loader2 } from 'lucide-react'
import UrlInput from './UrlInput'
import PlaylistCard from './PlaylistCard'
import JobProgress from './JobProgress'
import { qualities, containers, videoFormatArgs } from '../quality'
import { clipArgs, clipValid } from '../clip'
import ClipRange from './ClipRange'

/**
 * تنزيلُ فيديو.
 *
 * حالةُ الشاشةِ ليست فيها بل في [section] المرفوعِ إلى `App`: المكوّنُ يُفكَّكُ عندَ
 * الخروجِ من الشاشة، فكانَ الرابطُ والجودةُ والقائمةُ تضيعُ بمجرَّدِ النظرِ في شاشةٍ
 * أخرى ثمّ العودة. ولكلِّ قسمٍ حالتُه، فرابطُ الصوتِ لا يظهرُ هنا وتنزيلٌ هنا لا
 * يمنعُ تنزيلاً هناك.
 */
function DownloadVideo({ setCurrentView, handleRunCommand, retryUrl, section, patch, job, onCancel }) {
  const { t } = useTranslation()
  const [checking, setChecking] = useState(false)
  const running = !!job

  const { url, savePath, quality, container, playlist, selected, clipOn, clipFrom, clipTo } = section

  useEffect(() => {
    if (savePath) return
    const s = JSON.parse(localStorage.getItem('gmd-settings') || '{}')
    if (s.defaultPaths?.enabled && s.defaultPaths?.video) patch({ savePath: s.defaultPaths.video })
    else if (s.lastSaveDirs?.video) patch({ savePath: s.lastSaveDirs.video })
  }, [])

  // رابطٌ أُعيدت محاولته من السجلّ؛ الطابع الزمنيّ يجعل تكرار الرابط نفسه حدثاً جديداً
  useEffect(() => {
    if (retryUrl?.url) patch({ url: retryUrl.url, playlist: null, selected: null })
  }, [retryUrl?.at])

  const chooseFolder = async () => {
    const folder = await window.electronAPI.selectFolder()
    if (folder) patch({ savePath: folder })
  }

  const runDownload = async (playlistItems) => {
    if (!savePath) { alert(t('errors.noFolder')); return }
    const homeDir = await window.electronAPI.getHomeDir()
    const ytdlp = `${homeDir}/.local/bin/yt-dlp`
    const target = url

    const args = videoFormatArgs(quality, container)
    if (playlistItems?.length) {
      // Download specific items: build a comma-separated indices list
      args.push('--playlist-items', playlistItems.join(','))
      // ولكلّ قائمة مجلَّدها: كانت مقاطعها تُرمى في المجلَّد المختار مختلطةً بغيرها.
      // ويكتب yt-dlp اسم القائمة بنفسه، فيُنقّى بـ%(...)s ولا نبنيه نصّاً هنا.
      args.push('-o', `${savePath}/%(playlist_title,playlist_id|playlist)s/%(playlist_index)02d - %(title)s.%(ext)s`)
      // عنصر محجوب في قائمة من ثلاثين لا يُهدر التسعة والعشرين
      args.push('--ignore-errors')
    } else {
      args.push(...clipArgs(clipOn, clipFrom, clipTo))
      args.push('-o', `${savePath}/%(title)s.%(ext)s`)
    }
    args.push('--', target)

    const s = JSON.parse(localStorage.getItem('gmd-settings') || '{}')
    localStorage.setItem('gmd-settings', JSON.stringify({ ...s, lastSaveDirs: { ...(s.lastSaveDirs || {}), video: savePath } }))
    await handleRunCommand({ bin: ytdlp, args }, t('video.title'), t('video.downloading'), savePath, {
      url: target,
      kind: 'video',
      choice: quality,
      container,
      title: playlistItems?.length ? (playlist?.title || '') : '',
      playlist: playlistItems?.length
        ? { count: playlistItems.length, title: playlist?.title || '' } : null,
    })
  }

  /**
   * أوّلُ نقرةٍ تكشفُ القائمةَ إن كانت قائمةً، والثانيةُ تُنزّلُ المختار.
   * ولو نُزّلت من أوّلِ نقرةٍ لما رأى المستخدمُ ما يُنزَّلُ ولا اختارَ منه.
   */
  const handleRun = async () => {
    if (!url.trim()) { alert(t('errors.noUrl')); return }
    if (!savePath)   { alert(t('errors.noFolder')); return }

    if (playlist) { await runDownload(selected); return }

    setChecking(true)
    const info = await window.electronAPI.checkPlaylist(url)
    setChecking(false)

    if (info?.isPlaylist && info.count > 1) {
      patch({ playlist: info, selected: info.entries.map(e => e.index) })
      return
    }
    await runDownload()
  }

  const toggle = index => patch({
    selected: selected?.includes(index)
      ? selected.filter(i => i !== index)
      : [...(selected || []), index],
  })

  const toggleAll = () => patch({
    selected: selected?.length === playlist?.entries.length
      ? [] : playlist?.entries.map(e => e.index),
  })

  const ready = url.trim() && savePath && clipValid(clipOn, clipFrom, clipTo) &&
    (!playlist || (selected?.length ?? 0) > 0)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center">
          <Film className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold">{t('video.title')}</h2>
      </div>

      <div className="glass-panel p-6 space-y-4">
        <label className="block text-sm font-medium text-dark-300 mb-2">{t('common.url')}</label>
        <UrlInput value={url} onChange={v => patch({ url: v, playlist: null, selected: null })}
          placeholder={t('common.enterUrl')} icon={Link} disabled={running} />
      </div>

      <PlaylistCard
        info={playlist} selected={selected} onToggle={toggle} onToggleAll={toggleAll}
        current={job?.item || 0} running={running}
      />

      {!playlist && (
        <ClipRange
          enabled={clipOn} setEnabled={v => patch({ clipOn: v })}
          from={clipFrom} setFrom={v => patch({ clipFrom: v })}
          to={clipTo} setTo={v => patch({ clipTo: v })}
        />
      )}

      <div className="glass-panel p-6 space-y-4">
        <label className="block text-sm font-medium text-dark-300 mb-2">{t('video.quality')}</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {qualities.map(q => (
            <button key={q.id} onClick={() => patch({ quality: q.id })} disabled={running}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all disabled:opacity-50 ${
                quality === q.id ? 'border-gmd-500 bg-gmd-900/30' : 'border-dark-600 bg-dark-800/50 hover:border-dark-500'
              }`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${quality === q.id ? 'border-gmd-500' : 'border-dark-500'}`}>
                {quality === q.id && <div className="w-2.5 h-2.5 rounded-full bg-gmd-500" />}
              </div>
              <span className="font-medium">{t(q.label)}</span>
            </button>
          ))}
        </div>

        {/* الحاوية: كانت مفروضةً بلا خيار، وWEBM أخفُّ وMKV تقبل كلَّ ترميز */}
        <label className="block text-sm font-medium text-dark-300 pt-2">{t('video.container')}</label>
        <div className="flex flex-wrap gap-2">
          {containers.map(c => (
            <button key={c.id} onClick={() => patch({ container: c.id })} disabled={running}
              className={`px-4 py-2 rounded-xl border text-sm transition-all disabled:opacity-50 ${
                container === c.id ? 'border-gmd-500 bg-gmd-900/30 text-gmd-200'
                                   : 'border-dark-600 bg-dark-800/50 hover:border-dark-500'
              }`}>
              {t(c.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel p-6 space-y-4">
        <label className="block text-sm font-medium text-dark-300 mb-2">{t('common.savePath')}</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Folder className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500 pointer-events-none z-10" />
            <input type="text" value={savePath} readOnly placeholder={t('common.chooseFolder')} className="input-field ps-12" />
          </div>
          <button onClick={chooseFolder} disabled={running}
            className="btn-secondary whitespace-nowrap disabled:opacity-50">{t('common.chooseFolder')}</button>
        </div>
      </div>

      {running && <JobProgress job={job} onCancel={onCancel} />}

      <div className="flex gap-3 pt-4">
        <button onClick={() => setCurrentView('menu')} className="btn-secondary flex-1">{t('common.back')}</button>
        <button onClick={handleRun} disabled={checking || running || !ready}
          className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40">
          {checking ? (
            <><Loader2 className="w-4 h-4 animate-spin" />{t('errors.playlistChecking')}</>
          ) : playlist ? t('playlist.downloadN', { n: selected?.length ?? 0 })
            : t('common.run')}
        </button>
      </div>
    </motion.div>
  )
}

export default DownloadVideo
