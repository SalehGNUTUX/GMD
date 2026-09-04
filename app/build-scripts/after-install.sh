#!/bin/sh
# Post-install: copy icon to system paths then refresh desktop/icon caches.
# Icon is in app.asar.unpacked (asarUnpack in package.json) so it is readable by shell.

ICON_SRC=""
for CANDIDATE in \
    "/usr/lib/gmd/resources/app.asar.unpacked/public/gmd-icon.png" \
    "/usr/lib/gmd-gui/resources/app.asar.unpacked/public/gmd-icon.png" \
    "/opt/GMD/resources/app.asar.unpacked/public/gmd-icon.png" \
    "/opt/gmd/resources/app.asar.unpacked/public/gmd-icon.png" \
    "/usr/share/gmd/resources/app.asar.unpacked/public/gmd-icon.png"; do
    if [ -f "$CANDIDATE" ]; then
        ICON_SRC="$CANDIDATE"
        break
    fi
done

if [ -n "$ICON_SRC" ]; then
    for SIZE in 16 32 48 64 128 256 512; do
        IDIR="/usr/share/icons/hicolor/$SIZE""x""$SIZE/apps"
        mkdir -p "$IDIR"
        if command -v convert >/dev/null 2>&1; then
            convert "$ICON_SRC" -resize "$SIZE""x""$SIZE" "$IDIR/gmd.png" 2>/dev/null \
                || cp "$ICON_SRC" "$IDIR/gmd.png"
        else
            cp "$ICON_SRC" "$IDIR/gmd.png"
        fi
    done
    mkdir -p /usr/share/pixmaps
    cp "$ICON_SRC" /usr/share/pixmaps/gmd.png
fi

command -v gtk-update-icon-cache   >/dev/null 2>&1 && gtk-update-icon-cache   -f -q /usr/share/icons/hicolor 2>/dev/null || true
command -v gtk4-update-icon-cache  >/dev/null 2>&1 && gtk4-update-icon-cache  -f -q /usr/share/icons/hicolor 2>/dev/null || true
command -v xdg-icon-resource       >/dev/null 2>&1 && xdg-icon-resource       forceupdate                    2>/dev/null || true
command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database /usr/share/applications        2>/dev/null || true

# بطاقة AppStream وُضعت في /usr/share/metainfo، ومركز البرامج لا يراها حتى يُحدَّث
# مخزنه — فيُحدَّث الآن بدل أن ينتظر المستخدم دورةً يوميّة ليظهر مطوّر البرنامج
# ورخصته.
command -v appstreamcli >/dev/null 2>&1 && appstreamcli refresh --force >/dev/null 2>&1 || true
