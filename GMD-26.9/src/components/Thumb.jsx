import React, { useEffect, useState } from 'react'
import { Film, Music } from 'lucide-react'

/**
 * صورةُ المقطع: إطارٌ من المرئيِّ أو غلافٌ مدموجٌ في الصوت.
 *
 * تُطلَبُ عندَ ظهورِ الصفِّ لا عندَ قراءةِ المجلَّد: استخراجُها يُشغِّلُ ffmpeg،
 * وثلاثونَ مقطعاً دفعةً واحدةً ثلاثونَ عمليّة. والمُستخرَجُ مخزَّنٌ في العمليّةِ
 * الرئيسة، فالطلبُ الثاني قراءةُ ملفٍّ لا عملُ ترميز.
 */
function Thumb({ entry, className = 'w-24 h-16', rounded = 'rounded-lg' }) {
  const [src, setSrc] = useState(null)

  useEffect(() => {
    let alive = true
    setSrc(null)
    window.electronAPI.galleryThumb(entry.path).then(data => {
      if (alive) setSrc(data || null)
    }).catch(() => {})
    return () => { alive = false }
  }, [entry.path])

  const Icon = entry.isAudio ? Music : Film
  return (
    <div className={`${className} ${rounded} bg-dark-700 flex items-center justify-center overflow-hidden flex-shrink-0`}>
      {src
        ? <img src={src} alt="" className="w-full h-full object-cover" />
        : <Icon className="w-5 h-5 text-dark-500" />}
    </div>
  )
}

export default Thumb
