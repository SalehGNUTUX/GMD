import React from 'react'
import { useTranslation } from 'react-i18next'
import { Minus, Square, X, ChevronLeft, Monitor } from 'lucide-react'

function Header({ title, onBack }) {
  const { t } = useTranslation()

  const handleMinimize = () => window.electronAPI.minimize()
  const handleMaximize = () => window.electronAPI.maximize()
  const handleClose = () => window.electronAPI.close()

  return (
    <header className="h-14 bg-dark-900/90 backdrop-blur-md border-b border-dark-700/50 flex items-center justify-between px-4 drag-region"
      style={{ WebkitAppRegion: 'drag' }}
    >
      <div className="flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' }}>
        {onBack && (
          <button 
            onClick={onBack}
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-dark-300 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <img src="./gmd-icon.png" alt="GMD" className="w-7 h-7 rounded-md" />
          <span className="font-bold text-gmd-100 text-sm tracking-wide">{title}</span>
        </div>
      </div>

      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' }}>
        <button onClick={handleMinimize} className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-dark-400 hover:text-white">
          <Minus className="w-4 h-4" />
        </button>
        <button onClick={handleMaximize} className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-dark-400 hover:text-white">
          <Square className="w-4 h-4" />
        </button>
        <button onClick={handleClose} className="p-2 hover:bg-red-600/90 rounded-lg transition-colors text-dark-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}

export default Header