#!/bin/bash
set -e

APP_NAME="GMD"
BUILD_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_VERSION="$(node -p "require('${BUILD_DIR}/package.json').version" 2>/dev/null || echo '26.05.0')"

echo "=========================================="
echo "  $APP_NAME v$APP_VERSION - DEB Build"
echo "=========================================="

cd "$BUILD_DIR"

if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🔨 Building application..."
npm run build

echo "📦 Building DEB package..."
npx electron-builder --linux deb --publish never

echo ""
echo "✅ DEB package built successfully!"
ls -lh dist-electron/*.deb 2>/dev/null || echo "   Check dist-electron/ for output files"
