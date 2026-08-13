#!/bin/bash
# ============================================================
#  Finding AI — macOS Build Script
#  Produces dist/FindingAI.app (double-clickable app bundle)
# ============================================================
set -e
cd "$(dirname "$0")/.."

echo "[1/3] Creating virtual environment (if missing)..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate

echo "[2/3] Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "[3/3] Building standalone .app with PyInstaller..."
pyinstaller FindingAI.spec --noconfirm

echo ""
echo "============================================================"
echo "Build complete!"
echo "Your app is at:  dist/FindingAI.app"
echo ""
echo "To add it to your Dock / Desktop:"
echo "  1. Drag dist/FindingAI.app into /Applications (or your Desktop)."
echo "  2. Double-click FindingAI.app to launch Finding AI."
echo "  (First launch: right-click -> Open, to bypass Gatekeeper"
echo "   since the app isn't notarized by an Apple Developer ID.)"
echo "============================================================"
