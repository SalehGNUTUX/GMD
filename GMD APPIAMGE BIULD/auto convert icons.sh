#!/bin/bash

# اسم الأيقونة الأصلية عالية الدقة (مثلاً 512x512)
SOURCE_ICON="gmd-icon.png"
APPDIR="GMD.AppDir"
ICON_SIZES=(16 32 64 128 256)

echo "🎨 توليد الأيقونات..."

for size in "${ICON_SIZES[@]}"; do
    TARGET_DIR="$APPDIR/usr/share/icons/hicolor/${size}x${size}/apps"
    mkdir -p "$TARGET_DIR"
    magick "$SOURCE_ICON" -resize ${size}x${size} "$TARGET_DIR/gmd-icon.png"
    echo "✅ تم إنشاء: $TARGET_DIR/gmd-icon.png"
done

echo "🎉 تم توليد جميع الأيقونات."
