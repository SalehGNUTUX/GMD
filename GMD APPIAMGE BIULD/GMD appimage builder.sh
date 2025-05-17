#!/bin/bash

set -e

# إعداد
APP=gmd
APPNAME="GMD - GNU Media Downloader"
APPDIR=GMD.AppDir
ICON_NAME=gmd-icon
DESKTOP_FILE=$APPDIR/usr/share/applications/${APP}.desktop
EXECUTABLE=$APPDIR/usr/bin/$APP

# أدوات البناء
LINUXDEPLOY=./linuxdeploy-x86_64.AppImage

# التحقق من الأدوات
if [ ! -f "$LINUXDEPLOY" ]; then
    echo "❌ linuxdeploy-x86_64.AppImage غير موجود. حمّله من:"
    echo "➡ https://github.com/linuxdeploy/linuxdeploy/releases"
    exit 1
fi

chmod +x $LINUXDEPLOY

# التحقق من مكونات AppDir
echo "🔍 فحص المجلد $APPDIR..."

[[ -f "$EXECUTABLE" ]] || { echo "❌ الملف التنفيذي غير موجود: $EXECUTABLE"; exit 1; }
[[ -f "$DESKTOP_FILE" ]] || { echo "❌ ملف .desktop غير موجود: $DESKTOP_FILE"; exit 1; }
[[ -f "$APPDIR/usr/share/icons/hicolor/256x256/apps/${ICON_NAME}.png" ]] || { echo "❌ الأيقونة غير موجودة."; exit 1; }

echo "✅ كل المكونات موجودة. بدء التوليد..."

# توليد AppImage
ARCH=x86_64 \
$LINUXDEPLOY \
  --appdir $APPDIR \
  --output appimage \
  --desktop-file $DESKTOP_FILE \
  --icon-file $APPDIR/usr/share/icons/hicolor/256x256/apps/${ICON_NAME}.png

echo "🎉 تم توليد الحزمة بنجاح."

