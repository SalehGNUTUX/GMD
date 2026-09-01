import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Loader2, Terminal, XCircle, Zap, Clock } from 'lucide-react'

function ProgressModal({ title, text, output, percent, speed, eta, jobIndex, jobCount, onCancel }) {
  const { t } = useTranslation()
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [output])

  const hasPercent = percent !== null && percent !== undefined
  const displayPercent = hasPercent ? Math.min(Math.round(percent), 100) : null
  const hasQueue = jobCount > 1

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-panel w-full max-w-2xl mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-dark-700/50">
          <div className="flex items-center gap-3 mb-2">
            <Loader2 className="w-6 h-6 animate-spin text-gmd-400 flex-shrink-0" />
            <h3 className="text-xl font-bold flex-1">{title}</h3>
            {hasQueue && (
              <span dir="ltr" className="font-mono text-sm text-gmd-300 bg-gmd-900/40 border border-gmd-700/40 rounded-lg px-2.5 py-1 flex-shrink-0">
                {jobIndex} / {jobCount}
              </span>
            )}
          </div>
          <p className="text-dark-400 text-sm">{text}</p>
        </div>

        {/* Progress */}
        <div className="px-6 pt-5 pb-2 space-y-2">
          {/* Bar */}
          <div className="h-3 bg-dark-800 rounded-full overflow-hidden">
            {hasPercent ? (
              <motion.div
                className="h-full bg-gradient-to-r from-gmd-600 to-gmd-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${displayPercent}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            ) : (
              /* Indeterminate animation when no percent */
              <motion.div
                className="h-full w-1/3 bg-gradient-to-r from-transparent via-gmd-500 to-transparent"
                animate={{ x: ['−100%', '400%'] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              {speed && (
                <span className="flex items-center gap-1 text-emerald-400">
                  <Zap className="w-3 h-3" />
                  {t('common.speed')}: {speed}
                </span>
              )}
              {eta && (
                <span className="flex items-center gap-1 text-sky-400">
                  <Clock className="w-3 h-3" />
                  {t('common.eta')}: {eta}
                </span>
              )}
            </div>
            {displayPercent !== null && (
              <span className="font-mono font-semibold text-gmd-300">{displayPercent}%</span>
            )}
          </div>
        </div>

        {/* Terminal output */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 mb-2 text-xs text-dark-500 uppercase tracking-wider">
            <Terminal className="w-4 h-4" />
            <span>{t('common.terminalOutput')}</span>
          </div>
          <div
            ref={scrollRef}
            className="h-36 bg-dark-950 rounded-xl p-3 font-mono text-xs text-dark-300 overflow-y-auto border border-dark-800"
          >
            {output ? (
              output.split('\n').slice(-100).map((line, i) => (
                <div key={i} className="break-all leading-5">{line}</div>
              ))
            ) : (
              <span className="text-dark-600">{t('common.waitingOutput')}</span>
            )}
          </div>
        </div>

        {/* Cancel */}
        {onCancel && (
          <div className="px-6 pb-5">
            <button
              onClick={onCancel}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-700/40 bg-red-900/20 text-red-400 hover:bg-red-900/40 transition-all text-sm font-medium"
            >
              <XCircle className="w-4 h-4" />
              {t('common.cancelOp')}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default ProgressModal
