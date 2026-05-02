import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  Film, Music, Brain, RefreshCw, Zap, Scissors,
  Info, Settings, LogOut, ExternalLink
} from 'lucide-react'

const menuItems = [
  { id: 'video',    icon: Film,      color: 'from-red-600 to-red-500',       label: 'menu.downloadVideo',    desc: 'descriptions.downloadVideo' },
  { id: 'audio',    icon: Music,     color: 'from-orange-600 to-amber-500',   label: 'menu.downloadAudio',    desc: 'descriptions.downloadAudio' },
  { id: 'smart',    icon: Brain,     color: 'from-purple-600 to-pink-500',    label: 'menu.downloadConvert',  desc: 'descriptions.downloadConvert' },
  { id: 'convert',  icon: RefreshCw, color: 'from-blue-600 to-cyan-500',      label: 'menu.convertLocal',     desc: 'descriptions.convertLocal' },
  { id: 'extra',    icon: Zap,       color: 'from-yellow-600 to-orange-500',  label: 'menu.extraOptions',     desc: 'descriptions.extraOptions' },
  { id: 'clip',     icon: Scissors,  color: 'from-emerald-600 to-teal-500',   label: 'menu.clipMedia',        desc: 'descriptions.clipMedia' },
  { id: 'info',     icon: Info,      color: 'from-sky-600 to-blue-500',       label: 'menu.mediaInfo',        desc: 'descriptions.mediaInfo' },
  { id: 'settings', icon: Settings,  color: 'from-gray-600 to-gray-500',      label: 'menu.settings',         desc: 'descriptions.settings' },
]

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0 }
}

function MainMenu({ setCurrentView, onExit }) {
  const { t, i18n } = useTranslation()
  const isAr = i18n.language === 'ar'

  return (
    <div className="py-4">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block mb-4"
        >
          <img src="./gmd-icon.png" alt="GMD" className="w-20 h-20 rounded-2xl shadow-2xl shadow-gmd-900/50" />
        </motion.div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gmd-300 to-gmd-100 bg-clip-text text-transparent mb-2">
          {t('app.welcome')}
        </h1>
        <p className="text-dark-400">{t('app.subtitle')}</p>
      </motion.div>

      {/* Menu Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {menuItems.map((menuItem) => {
          const Icon = menuItem.icon
          return (
            <motion.button
              key={menuItem.id}
              variants={item}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setCurrentView(menuItem.id)}
              className="group relative glass-panel p-6 text-start hover:bg-dark-800/80 transition-all duration-300
                         border border-dark-700/50 hover:border-gmd-500/30 overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${menuItem.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${menuItem.color} flex items-center justify-center mb-4 shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg text-white mb-1 group-hover:text-gmd-200 transition-colors">
                {t(menuItem.label)}
              </h3>
              <p className="text-sm text-dark-400 group-hover:text-dark-300 transition-colors">
                {t(menuItem.desc)}
              </p>
            </motion.button>
          )
        })}
      </motion.div>

      {/* Exit Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 text-center"
      >
        <button
          onClick={onExit}
          className="inline-flex items-center gap-2 px-6 py-3 text-dark-400 hover:text-red-400
                     hover:bg-red-900/20 rounded-xl transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          <span>{t('menu.exit')}</span>
        </button>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 pt-6 border-t border-dark-800/60 text-center space-y-2"
      >
        <p className="text-xs text-dark-500">
          {t('footer.freeOpenSource')} · {t('footer.license')} · {t('footer.year')}
        </p>
        <p className="text-xs text-dark-600">
          {isAr ? 'المطور: ' : 'Developer: '}<span className="text-gmd-600">GNUTUX</span>
          {' · '}
          {t('footer.platform')}
        </p>
        <div className="flex items-center justify-center gap-4 pt-1">
          <a
            href="https://github.com/SalehGNUTUX/GMD"
            target="_blank"
            rel="noreferrer"
            onClick={(e) => { e.preventDefault(); window.electronAPI.openExternal('https://github.com/SalehGNUTUX/GMD') }}
            className="flex items-center gap-1 text-xs text-dark-600 hover:text-gmd-400 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            GitHub
          </a>
          <span className="text-dark-700">·</span>
          <a
            href="https://salehgnutux.github.io/GMD"
            target="_blank"
            rel="noreferrer"
            onClick={(e) => { e.preventDefault(); window.electronAPI.openExternal('https://salehgnutux.github.io/GMD') }}
            className="flex items-center gap-1 text-xs text-dark-600 hover:text-gmd-400 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            {isAr ? 'الموقع' : 'Website'}
          </a>
        </div>
      </motion.div>
    </div>
  )
}

export default MainMenu
