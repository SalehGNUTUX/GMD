#!/bin/bash
# Boots the Vite dev server + Electron, runs test/smoke.js against them, cleans up.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FIX="$ROOT/test/fixtures"
cd "$ROOT"

command -v ffmpeg >/dev/null || { echo "ffmpeg is required to run the tests"; exit 1; }

# A fixture whose name carries a space and shell metacharacters. With argv these
# are just characters; with the old `bash -c` command strings they were code.
mkdir -p "$FIX"
if [ ! -f "$FIX/in put\$(echo hi).mp4" ]; then
  ffmpeg -v error -f lavfi -i testsrc=duration=3:size=320x240:rate=15 \
         -f lavfi -i sine=frequency=440:duration=3 \
         -c:v libx264 -c:a aac -shortest -y "$FIX/in put\$(echo hi).mp4" || exit 1
fi

cleanup() {
  [ -n "${EPID:-}" ] && { kill -TERM "$EPID" 2>/dev/null; sleep 1; kill -KILL "$EPID" 2>/dev/null; }
  [ -n "${VPID:-}" ] && { kill -TERM "$VPID" 2>/dev/null; sleep 1; kill -KILL "$VPID" 2>/dev/null; }
}
trap cleanup EXIT

# A stale Electron holding the debug port would silently make the harness attach
# to yesterday's build and report failures the current source does not have.
if ss -ltn 2>/dev/null | grep -q ':9222 '; then
  echo "port 9222 is already in use — close the other Electron instance first"
  exit 1
fi

npx vite > /tmp/gmd-test-vite.log 2>&1 &
VPID=$!
for _ in $(seq 1 40); do
  curl -sf -o /dev/null http://localhost:5173/ && break
  sleep 0.5
done

npx electron . --remote-debugging-port=9222 > /tmp/gmd-test-electron.log 2>&1 &
EPID=$!
sleep 8

SRC="$ROOT" FFDIR="$FIX" node "$ROOT/test/smoke.js"
