import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Plugin: serve fonts/ dir in dev + copy to dist/fonts/ on build
const fontsPlugin = () => ({
  name: 'fonts',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (!req.url?.startsWith('/fonts/')) return next()
      const fontPath = path.join(__dirname, 'fonts', decodeURIComponent(req.url.slice('/fonts/'.length)))
      if (!fs.existsSync(fontPath)) return next()
      const ext = path.extname(fontPath).toLowerCase()
      res.setHeader('Content-Type', ext === '.otf' ? 'font/otf' : 'font/ttf')
      res.end(fs.readFileSync(fontPath))
    })
  },
  closeBundle() {
    const src  = path.join(__dirname, 'fonts')
    const dest = path.join(__dirname, 'dist', 'fonts')
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
    for (const f of fs.readdirSync(src)) {
      fs.copyFileSync(path.join(src, f), path.join(dest, f))
    }
  },
})

export default defineConfig({
  plugins: [react(), fontsPlugin()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})