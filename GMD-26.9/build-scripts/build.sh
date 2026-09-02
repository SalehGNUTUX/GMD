#!/bin/bash
set -eo pipefail

BUILD_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_VERSION="$(node -p "require('${BUILD_DIR}/package.json').version" 2>/dev/null || echo '26.05.0')"
OUTPUT_DIR="$BUILD_DIR/dist-electron"

echo "=========================================="
echo "  GMD v$APP_VERSION - Full Build"
echo "  GNU Media Downloader"
echo "=========================================="

# Check Node.js
echo "🔍 Checking Node.js..."
if ! command -v node &>/dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to 18+."
    exit 1
fi
echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
cd "$BUILD_DIR"
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "   node_modules exists, skipping install"
fi

# Build React + copy fonts
echo ""
echo "🔨 Building React application..."
npm run build

# Build Electron packages
echo ""
echo "🚀 Building Electron packages..."

echo "📦 Building AppImage..."
npx electron-builder --linux AppImage --publish never

echo ""
echo "📦 Building DEB package..."
npx electron-builder --linux deb --publish never

echo ""
echo "📦 Building RPM package..."
# Try native rpmbuild, fall back to alien if unavailable
RPM_OK=0
if command -v rpmbuild &>/dev/null; then
    npx electron-builder --linux rpm --publish never 2>&1 && RPM_OK=1
fi
if [ "$RPM_OK" -eq 0 ] && command -v alien &>/dev/null; then
    echo "   → Falling back to alien (DEB→RPM)..."
    DEB_FILE="$(ls "$OUTPUT_DIR"/*.deb 2>/dev/null | head -1)"
    if [ -n "$DEB_FILE" ]; then
        TMPDIR="$(mktemp -d)"
        cp "$DEB_FILE" "$TMPDIR/"
        (cd "$TMPDIR" && fakeroot alien -r -g "$(basename "$DEB_FILE")") 2>&1 || true
        SPEC="$(find "$TMPDIR" -name "*.spec" | head -1)"
        if [ -n "$SPEC" ]; then
            sed -i 's/^Summary:[[:space:]]*$/Summary: GNU Media Downloader for GNU\/Linux/' "$SPEC"
            PKGDIR="$(dirname "$SPEC")"
            (cd "$PKGDIR" && fakeroot rpmbuild --buildroot="$PKGDIR" -bb --target "$(uname -m)" "$(basename "$SPEC")") 2>&1 && \
            find "$TMPDIR" -name "*.rpm" -exec cp {} "$OUTPUT_DIR/" \; && RPM_OK=1
        fi
        rm -rf "$TMPDIR"
    fi
fi
[ "$RPM_OK" -eq 0 ] && echo "⚠  RPM build failed — install: sudo apt install alien rpm"

echo ""
echo "=========================================="
echo "  ✅ Build completed successfully!"
echo "=========================================="
echo ""
echo "📁 Output files:"
ls -lh "$OUTPUT_DIR"/*.AppImage "$OUTPUT_DIR"/*.deb "$OUTPUT_DIR"/*.rpm 2>/dev/null \
  || ls -lh "$OUTPUT_DIR"/ 2>/dev/null \
  || echo "   Check $OUTPUT_DIR for output files"
echo ""
echo "🎉 Done! You can now distribute your application."
