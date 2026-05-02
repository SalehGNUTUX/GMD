#!/bin/bash
set -e

APP_NAME="GMD"
BUILD_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_VERSION="$(node -p "require('${BUILD_DIR}/package.json').version" 2>/dev/null || echo '26.05.0')"

echo "=========================================="
echo "  $APP_NAME v$APP_VERSION - RPM Build"
echo "=========================================="

cd "$BUILD_DIR"

if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🔨 Building application..."
npm run build

# ── Method 1: electron-builder native (requires rpmbuild) ─────────────────
if command -v rpmbuild &>/dev/null; then
    echo "📦 Building RPM via electron-builder..."
    if npx electron-builder --linux rpm --publish never 2>&1; then
        echo ""
        echo "✅ RPM built successfully!"
        ls -lh dist-electron/*.rpm 2>/dev/null || echo "   Check dist-electron/ for output files"
        exit 0
    fi
    echo "⚠  electron-builder RPM failed — trying alien fallback..."
fi

# ── Method 2: alien DEB→RPM (common on Debian/Ubuntu) ────────────────────
if ! command -v alien &>/dev/null || ! command -v rpmbuild &>/dev/null; then
    echo "📦 Installing alien + rpm..."
    if command -v apt-get &>/dev/null; then
        sudo apt-get install -y alien rpm 2>/dev/null || true
    fi
fi

if command -v alien &>/dev/null; then
    # Build DEB first if needed
    DEB_FILE="$(ls dist-electron/*.deb 2>/dev/null | head -1)"
    if [ -z "$DEB_FILE" ]; then
        echo "📦 Building DEB first (needed for alien)..."
        npx electron-builder --linux deb --publish never
        DEB_FILE="$(ls dist-electron/*.deb 2>/dev/null | head -1)"
    fi

    if [ -n "$DEB_FILE" ]; then
        echo "📦 Converting DEB → RPM via alien..."
        TMPDIR="$(mktemp -d)"
        cp "$DEB_FILE" "$TMPDIR/"

        # Generate RPM spec from DEB
        (cd "$TMPDIR" && fakeroot alien -r -g "$(basename "$DEB_FILE")") 2>&1 || true

        SPEC="$(find "$TMPDIR" -name "*.spec" | head -1)"
        if [ -n "$SPEC" ]; then
            # Fix empty Summary field (common alien issue)
            sed -i 's/^Summary:[[:space:]]*$/Summary: GNU Media Downloader for GNU\/Linux/' "$SPEC"

            PKGDIR="$(dirname "$SPEC")"
            ARCH="$(uname -m)"

            if (cd "$PKGDIR" && fakeroot rpmbuild \
                --buildroot="$PKGDIR" \
                -bb --target "$ARCH" \
                "$(basename "$SPEC")") 2>&1; then

                RPM_FILE="$(find "$TMPDIR" -name "*.rpm" | head -1)"
                if [ -n "$RPM_FILE" ]; then
                    DEST="dist-electron/$(basename "$RPM_FILE")"
                    cp "$RPM_FILE" "$DEST"
                    rm -rf "$TMPDIR"
                    echo ""
                    echo "✅ RPM built successfully via alien!"
                    ls -lh "$DEST"
                    exit 0
                fi
            fi
        fi
        rm -rf "$TMPDIR"
    fi
fi

echo ""
echo "❌ RPM build failed. Install rpmbuild manually:"
echo "   Debian/Ubuntu: sudo apt install alien rpm"
echo "   Fedora/RHEL:   sudo dnf install rpm-build"
exit 1
