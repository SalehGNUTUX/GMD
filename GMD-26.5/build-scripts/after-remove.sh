#!/bin/sh
# Refresh desktop + icon caches after DEB removal
if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database /usr/share/applications 2>/dev/null || true
fi
if command -v gtk-update-icon-cache >/dev/null 2>&1; then
    gtk-update-icon-cache -f -q /usr/share/icons/hicolor 2>/dev/null || true
fi
