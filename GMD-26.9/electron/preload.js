const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.invoke('minimize'),
  maximize: () => ipcRenderer.invoke('maximize'),
  close:    () => ipcRenderer.invoke('close'),

  // External links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // File / folder dialogs
  selectFolder:        ()       => ipcRenderer.invoke('select-folder'),
  selectFile:          ()       => ipcRenderer.invoke('select-file'),
  selectMultipleFiles: ()       => ipcRenderer.invoke('select-multiple-files'),
  openFolder:          (path)   => ipcRenderer.invoke('open-folder', path),

  // Dependency checks
  checkYtdlp:     ()     => ipcRenderer.invoke('check-ytdlp'),
  checkFfmpeg:    ()     => ipcRenderer.invoke('check-ffmpeg'),
  checkTool:      (tool) => ipcRenderer.invoke('check-tool', tool),
  getToolVersion: (tool) => ipcRenderer.invoke('get-tool-version', tool),

  // Package manager & tool installation
  detectPackageManager: ()             => ipcRenderer.invoke('detect-package-manager'),
  installTool:          (params)       => ipcRenderer.invoke('install-tool', params),

  // yt-dlp
  installYtdlp: () => ipcRenderer.invoke('install-ytdlp'),
  updateYtdlp:  () => ipcRenderer.invoke('update-ytdlp'),

  // Run shell command (streaming)
  runCommand:     (params) => ipcRenderer.invoke('run-command', params),
  /** بلا معرِّفٍ تُلغى كلُّ المهامّ الجارية؛ وبمعرِّفٍ تُلغى واحدةٌ بعينها. */
  cancelCommand:  (jobId)  => ipcRenderer.invoke('cancel-command', jobId),
  runningJobs:    ()       => ipcRenderer.invoke('running-jobs'),
  checkPlaylist:  (url)    => ipcRenderer.invoke('check-playlist', url),

  // المعرض والمشغّل
  galleryList:   (roots)    => ipcRenderer.invoke('gallery-list', roots),
  galleryThumb:  (filePath) => ipcRenderer.invoke('gallery-thumb', filePath),
  galleryTrash:  (paths)    => ipcRenderer.invoke('gallery-trash', paths),
  galleryReveal: (filePath) => ipcRenderer.invoke('gallery-reveal', filePath),
  galleryOpen:   (filePath) => ipcRenderer.invoke('gallery-open', filePath),

  // Media info
  getMediaInfo: (url)      => ipcRenderer.invoke('get-media-info', url),
  getFileInfo:  (filePath) => ipcRenderer.invoke('get-file-info', filePath),

  // Self-update
  updateCheck:    (opts) => ipcRenderer.invoke('update-check', opts),
  updateDownload: (asset)=> ipcRenderer.invoke('update-download', asset),
  updateCancel:   ()     => ipcRenderer.invoke('update-cancel'),
  updateInstall:  (file) => ipcRenderer.invoke('update-install', file),
  updateRestart:  ()     => ipcRenderer.invoke('update-restart'),
  updateReveal:   (file) => ipcRenderer.invoke('update-reveal', file),
  updateChannel:  ()     => ipcRenderer.invoke('update-channel'),
  onUpdateProgress: (cb) => ipcRenderer.on('update-progress', (event, data) => cb(data)),

  // App
  installDesktop: () => ipcRenderer.invoke('install-desktop'),
  uninstall:      () => ipcRenderer.invoke('uninstall'),
  getAppVersion:  () => ipcRenderer.invoke('get-app-version'),
  getHomeDir:     () => ipcRenderer.invoke('get-home-dir'),

  // Language sync for native context menu
  setLanguage: (lang) => ipcRenderer.send('set-language', lang),

  // Streaming events
  onCommandOutput:    (cb) => ipcRenderer.on('command-output', (event, data) => cb(data)),
  onCommandDone:      (cb) => ipcRenderer.on('command-done',   (event, data) => cb(data)),
  removeAllListeners: (ch) => ipcRenderer.removeAllListeners(ch),
})
