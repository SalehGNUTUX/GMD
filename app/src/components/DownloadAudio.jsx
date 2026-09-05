import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Link, Folder, Music, FileAudio, Loader2 } from 'lucide-react'
import UrlInput from './UrlInput'
import PlaylistCard from './PlaylistCard'
import InfoCard from './InfoCard'
import JobProgress from './JobProgress'
import { clipArgs, clipValid } from '../clip'
import ClipRange from './ClipRange'
import { useAutoInfo } from '../autoInfo'

const formats = [
  { id: 'mp3',  label: 'audio.mp3',  opts: '--extract-audio --audio-format mp3 --audio-quality 0' },
  { id: 'm4a',  label: 'audio.m4a',  opts: '--extract-audio --audio-format m4a' },
  { id: 'ogg',  label: 'audio.ogg',  opts: '--extract-audio --audio-format vorbis' },
  { id: 'opus', label: 'audio.opus', opts: '--extract-audio --audio-format opus' },
  { id: 'flac', label: 'audio.flac', opts: '--extract-audio --audio-format flac' },
  { id: 'wav',  label: 'audio.wav',  opts: '--extract-audio --audio-format wav' },
]

/**
 * تنزيلُ صوت.
 *
 * حالتُه مرفوعةٌ إلى `App` كحالِ قسمِ الفيديو، فلا تضيعُ بالتنقُّلِ بينَ الشاشات،
 * والقسمانِ مستقلّانِ يعملانِ معاً على رابطَين مختلفَين.
 */
function DownloadAudio({ setCurrentView, handleRunCommand, retryUrl, section, patch, job, onCancel }) {
  const { t } = useTranslation()
  const [checking, setChecking] = useState(false)
  const running = !!job

  const { url, savePath, format, playlist, selected, clipOn, clipFrom, clipTo,
          info, infoLoading, infoError } = section

  // الرابطُ يُسأَلُ عنه من تلقائِه بعدَ لصقِه، فيرى المستخدمُ ما سيُنزّلُه — أو
  // عناصرَ قائمتِه — قبلَ أن ينقرَ شيئاً. ولا يُسأَلُ والتنزيلُ جارٍ: إنفاقُ شبكةٍ
  // على رابطٍ يُنزَّلُ الآن.
  useAutoInfo(url, patch, { disabled: running })

  useEffect(() => {
    if (savePath) return
    const s = JSON.parse(localStorage.getItem('gmd-settings') || '{}')
    if (s.defaultPaths?.enabled && s.defaultPaths?.audio) patch({ savePath: s.defaultPaths.audio })
    else if (s.lastSaveDirs?.audio) patch({ savePath: s.lastSaveDirs.audio })
  }, [])

  useEffect(() => {
    if (retryUrl?.url) patch({ url: retryUrl.url, playlist: null, selected: null })
  }, [retryUrl?.at])

  const chooseFolder = async () => {
    const folder = await window.electronAPI.selectFolder()
    if (folder) patch({ savePath: folder })
  }

  const runDownload = async (playlistItems) => {
    if (!savePath) { alert(t('errors.noFolder')); return }
    const fmt = formats.find(f => f.id === format) || formats[0]
    const homeDir = await window.electronAPI.getHomeDir()
    const ytdlp = `${homeDir}/.local/bin/yt-dlp`
    const target = url

    // fmt.opts is a fixed constant above — splitting it is safe, unlike the
    // user-supplied url and savePath which each get their own argv slot.
    const args = [...fmt.opts.split(' ')]
    if (playlistItems?.length) {
      args.push('--playlist-items', playlistItems.join(','))
      // ولكلّ قائمة مجلَّدها، ويكتب yt-dlp اسمها بنفسه فلا نبنيه نصّاً هنا
      args.push('-o', `${savePath}/%(playlist_title,playlist_id|playlist)s/%(playlist_index)02d - %(title)s.%(ext)s`)
      args.push('--ignore-errors')
    } else {
      args.push(...clipArgs(clipOn, clipFrom, clipTo))
      args.push('-o', `${savePath}/%(title)s.%(ext)s`)
    }
    args.push('--', target)

    const s = JSON.parse(localStorage.getItem('gmd-settings') || '{}')
    if (!s.defaultPaths?.enabled) {
      localStorage.setItem('gmd-settings', JSON.stringify({
        ...s, lastSaveDirs: { ...(s.lastSaveDirs || {}), audio: savePath }
      }))
    }
    await handleRunCommand({ bin: ytdlp, args }, t('audio.title'), t('audio.downloading'), savePath, {
      url: target,
      kind: 'audio',
      choice: format,
      title: playlistItems?.length ? (playlist?.title || '') : '',
      playlist: playlistItems?.length
        ? { count: playlistItems.length, title: playlist?.title || '' } : null,
    })
  }

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
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 to-amber-500 flex items-center justify-center">
          <Music className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold">{t('audio.title')}</h2>
      </div>

      <div className="glass-panel p-6 space-y-4">
        <label className="block text-sm font-medium text-dark-300">{t('common.url')}</label>
        <UrlInput value={url} onChange={v => patch({ url: v, playlist: null, selected: null })}
          placeholder={t('common.enterUrl')} icon={Link} disabled={running} />
      </div>

      {/* بطاقةُ المقطع: تُخفى مع قائمةِ التشغيلِ فلتلك بطاقتُها بعناصرِها */}
      {!playlist && (
        <InfoCard info={info} loading={infoLoading} error={infoError} />
      )}

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
        <label className="block text-sm font-medium text-dark-300">{t('audio.format')}</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {formats.map(f => (
            <button key={f.id} onClick={() => patch({ format: f.id })} disabled={running}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all disabled:opacity-50 ${
                format === f.id ? 'border-gmd-500 bg-gmd-900/30' : 'border-dark-600 bg-dark-800/50 hover:border-dark-500'
              }`}>
              <FileAudio className={`w-5 h-5 ${format === f.id ? 'text-gmd-400' : 'text-dark-500'}`} />
              <span className="font-medium">{t(f.label)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel p-6 space-y-4">
        <label className="block text-sm font-medium text-dark-300">{t('common.savePath')}</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Folder className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500 pointer-events-none z-10" />
            <input type="text" value={savePath} readOnly
              placeholder={t('common.chooseFolder')} className="input-field ps-12" />
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
          {checking
            ? <><Loader2 className="w-4 h-4 animate-spin" />{t('errors.playlistChecking')}</>
            : playlist ? t('playlist.downloadN', { n: selected?.length ?? 0 })
            : t('common.run')}
        </button>
      </div>
    </motion.div>
  )
}

export default DownloadAudio
