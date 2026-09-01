# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (Vite dev server only — no Electron)
npm run dev

# Development with Electron (builds first then launches)
npm run electron:dev

# Production build (Vite only)
npm run build

# Package as AppImage + deb + rpm
npm run electron:build

# Package a specific target
npx electron-builder --linux AppImage
npx electron-builder --linux deb
npx electron-builder --linux rpm
```

There are no tests or linters configured.

## Architecture

This is an **Electron 28 + React 18 + Vite** desktop app. The renderer is a standard React SPA; the main process handles all system calls.

### Process boundary

All OS operations happen in `electron/main.js` via `ipcMain.handle` and are called from the renderer through `window.electronAPI` which is exposed by `electron/preload.js` via `contextBridge`. Never call Node.js APIs directly from React components.

### Key data flows

- **External processes** (yt-dlp, ffmpeg): `handleRunCommand(jobs, title, text, savePath)` in `src/App.jsx` → `run-command` IPC → `spawn(bin, argv)` in `main.js`.
  - `jobs` is `[{ bin, args, outFile? }]` (a single object is accepted and wrapped). Jobs run **sequentially**; the first non-zero exit stops the rest.
  - **Never build a command as a string and never use `bash -c`.** Every user-controlled value (URL, save path, file path) must occupy its own `args` slot. Constant option strings from the module-level format tables may be `.split(' ')`, but nothing that came from an input field or a file dialog. Pass `--` before a URL so a leading `-` cannot be read as a flag.
  - Success = exit code 0 for every job, plus `fs.existsSync(outFile)` when a job declares one. Do **not** grep the output for "error": yt-dlp and ffmpeg both print it on recoverable warnings.
  - Output streams back via `command-output` (carrying `jobIndex` / `jobCount`) and `command-done`. `activeChild` holds the running process and `cancelRequested` also stops jobs that have not started yet; both are reset by `cancel-command`.
  - The IPC listeners are registered **once** in an `App.jsx` mount effect and dispatch through `onOutputRef` / `onDoneRef`. Never call `onCommandOutput` / `onCommandDone` per operation — that was the cause of duplicated result dialogs.
- **File dialogs**: All calls go through `showDialog()` helper in `main.js` which calls `mainWindow.moveTop()` + `focus()` before and after to keep the dialog in front of the window.
- **Version**: `package.json` is the single source of truth, read via `app.getVersion()` and exposed through the `get-app-version` IPC. Do not hardcode it anywhere else. Versions follow a year.month series, written as plain semver with no leading zero: the 26.09 series is `26.9.0`, not `26.09.0`. electron-builder normalises leading zeros away in artifact names, which is what made the tag, the source and the package files disagree before 26.9.0. Tests read the version from `package.json`, so a bump never means editing them.
- **Settings**: Stored in `localStorage` under the key `gmd-settings` as JSON. Structure: `{ defaultPaths: { enabled, video, audio, documents, downloads }, advancedEncoding: bool, lastSaveDirs: { video, audio, convert, extra, smart, clip } }`. Read at component mount via `useEffect`.
- **Language**: Persisted automatically by `i18next-browser-languagedetector` in `localStorage` as `i18nextLng`. Default fallback is `'ar'`.

### Routing

There is no router. `src/App.jsx` holds a `currentView` string state and `renderView()` renders the matching component. Views: `menu`, `video`, `audio`, `smart`, `convert`, `extra`, `clip`, `info`, `settings`.

### Custom protocols (packaged app)

Two protocols are registered in `app.whenReady()` after `registerSchemesAsPrivileged()`:
- `app://localhost/` — serves files from `dist/` (replaces `file://` which Chromium blocks for ASAR in Electron v28). Main window loads `app://localhost/index.html`.
- `media://` — serves local files to the in-app video/audio preview player (e.g. `media:///home/user/video.mp4`). Restricted to paths the user picked through `select-file` / `select-multiple-files`; anything else gets `ERR_ACCESS_DENIED`. If a new dialog starts returning paths the preview must render, pass them through `remember()` in `main.js`.

### Translations

Two JSON files: `src/locales/ar.json` (Arabic, RTL, default) and `src/locales/en.json` (English). All user-visible strings must have entries in both files. Direction is set on `<html>` in `App.jsx`'s `useEffect` when the language changes.

### Styling conventions

- Dark theme only. Color palette: `dark-*` (backgrounds/borders) and `gmd-*` (red accent) — both defined in `tailwind.config.js`.
- Reusable CSS classes in `src/index.css`: `.glass-panel`, `.btn-primary`, `.btn-secondary`, `.input-field`.
- RTL-safe spacing: use `ps-*`/`pe-*` (logical) instead of `pl-*`/`pr-*`, and `start-*`/`end-*` instead of `left-*`/`right-*` in components that must work in both directions.
- Range/slider elements must have `dir="ltr"` explicitly, otherwise they invert in RTL mode.

### External tools

- **yt-dlp**: installed per-user at `~/.local/bin/yt-dlp`. Path resolved at runtime via `getHomeDir` IPC.
- **ffmpeg / ffprobe**: expected on system `$PATH`. `ffprobe` is used by `get-file-info` IPC for media metadata (via `execFile`, not `exec`).
- **Package manager detection**: `detect-package-manager` IPC checks for `apt`, `dnf`, `pacman`, `zypper`, `yum`, `apk` in order.
- **Tool installation**: uses `pkexec` for GUI privilege escalation. Falls back to returning the manual `sudo` command string for the user to copy.
