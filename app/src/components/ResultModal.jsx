import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, FolderOpen, Terminal } from 'lucide-react'

function ResultModal({ success, message, output, savePath, onClose }) {
  const { t } = useTranslation()

  const handleOpenFolder = () => {
    if (savePath) window.electronAPI.openFolder(savePath)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-panel w-full max-w-lg overflow-hidden"
      >
        <div className="p-8 text-center">
          {success ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}>
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            </motion.div>
          ) : (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            </motion.div>
          )}

          <h3 className={`text-2xl font-bold mb-2 ${success ? 'text-emerald-400' : 'text-red-400'}`}>
            {message}
          </h3>

          {success && savePath && (
            <p className="text-dark-400 text-sm mb-6 break-all">{savePath}</p>
          )}
        </div>

        {!success && output && (
          <div className="px-8 pb-4">
            <div className="flex items-center gap-2 mb-2 text-xs text-dark-500 uppercase tracking-wider">
              <Terminal className="w-4 h-4" />
              <span>{t('common.errorDetails')}</span>
            </div>
            <div className="h-32 bg-dark-950 rounded-xl p-4 font-mono text-xs text-red-300 overflow-y-auto border border-red-900/30">
              {output.split('\n').slice(-20).map((line, i) => (
                <div key={i} className="break-all">{line}</div>
              ))}
            </div>
          </div>
        )}

        <div className="p-6 flex gap-3 justify-center border-t border-dark-700/50">
          {success && savePath && (
            <button onClick={handleOpenFolder} className="btn-secondary flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              {t('common.openFolder')}
            </button>
          )}
          <button onClick={onClose} className="btn-primary">
            {t('common.done')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ResultModal
