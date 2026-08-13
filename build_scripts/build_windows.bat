@echo off
REM ============================================================
REM  Finding AI — Windows Build Script
REM  Produces dist\FindingAI\FindingAI.exe (double-clickable app)
REM ============================================================

cd /d "%~dp0\.."

echo [1/3] Creating virtual environment (if missing)...
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate.bat

echo [2/3] Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt

echo [3/3] Building standalone executable with PyInstaller...
pyinstaller FindingAI.spec --noconfirm

echo.
echo ============================================================
echo Build complete!
echo Your app is at:  dist\FindingAI\FindingAI.exe
echo.
echo To create a Desktop shortcut:
echo   1. Right-click dist\FindingAI\FindingAI.exe
echo   2. Choose "Send to" -^> "Desktop (create shortcut)"
echo   3. Double-click the new Desktop icon to launch Finding AI.
echo ============================================================
pause
