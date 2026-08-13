# Finding AI — Advanced AI Image Forensics Platform

A standalone dark-mode desktop app for reviewing image authenticity signals,
built with **CustomTkinter**, **Pillow**, **NumPy**, and **Matplotlib**.

> ⚠️ **Honesty note:** This app performs *real* image forensics for hashing,
> EXIF extraction, Error Level Analysis, edge mapping, and FFT frequency
> spectra. The higher-level "is this AI-generated" probability fusion is a
> **simulated** scoring pipeline (seeded deterministically per file) meant to
> demonstrate the full application architecture end-to-end. It is **not** a
> validated deepfake-detection model. See `app/detection_engine.py` for where
> to plug in a real trained classifier.

---

## 1. Quick Start (run from source, no build needed)

```bash
# 1. Create a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the app
python main.py
```

`tkinterdnd2` (native drag-and-drop) is optional — if it's not installed or
fails to load on your platform, the app automatically falls back to a
"Select Image File" button with identical functionality.

---

## 2. Building a Standalone Double-Clickable App

### Windows (.exe)
```bat
build_scripts\build_windows.bat
```
This creates `dist\FindingAI\FindingAI.exe`. To put an icon on your Desktop:
1. Right-click `dist\FindingAI\FindingAI.exe` → **Send to → Desktop (create shortcut)**, **or**
2. Run `python build_scripts\create_windows_shortcut.py` (requires `pip install pywin32`) to script it automatically.

Double-clicking the Desktop icon launches the full UI directly — no terminal,
no command-line flags.

### macOS (.app)
```bash
chmod +x build_scripts/build_macos.sh
./build_scripts/build_macos.sh
```
This creates `dist/FindingAI.app`. Drag it into `/Applications` or your
Desktop. Since the app isn't notarized with an Apple Developer ID, the first
launch requires **right-click → Open** to bypass Gatekeeper (one-time).

### What the build does
`FindingAI.spec` (PyInstaller) bundles:
- `main.py` and the entire `app/` package
- The CustomTkinter theme assets
- `assets/icon.ico` / `icon.icns` / `icon.png` (your Finding AI logo)
- All dependencies (Pillow, NumPy, Matplotlib, etc.) into a single folder/app

The result runs with **zero** external setup — the person double-clicking
never sees Python, pip, or a terminal.

---

## 3. Project Structure

```
FindingAI/
├── main.py                        # Entry point
├── requirements.txt
├── FindingAI.spec                 # PyInstaller build config
├── app/
│   ├── theme.py                   # Dark cyber-forensics color palette
│   ├── forensics_utils.py         # REAL: hashing, EXIF, ELA, edges, FFT, watermarking
│   ├── detection_engine.py        # SIMULATED: multi-layer AI-probability fusion
│   ├── feedback_manager.py        # CSV feedback ledger + mock monitoring metrics
│   └── ui_dashboard.py            # CustomTkinter UI (all pages/tabs)
├── assets/
│   ├── icon.ico / icon.icns / icon.png   # App icons (from your logo)
├── build_scripts/
│   ├── build_windows.bat
│   ├── build_macos.sh
│   └── create_windows_shortcut.py
├── feedback_log.csv               # Auto-created on first run
└── output_scans/                  # Auto-created for saved watermark outputs
```

---

## 4. Feature Walkthrough

| Feature | Location |
|---|---|
| Drag-and-drop / browse ingest (≤50MB) | Analysis Workspace |
| SHA-256 / MD5 / EXIF / resolution readout | File Intelligence card |
| Chain-of-Custody timeline | Analysis Workspace |
| Original / Edge / FFT / ELA synchronized views | Canvas tabs |
| Per-layer AI-probability + diagnostics | Evidence Fusion breakdown |
| Base-generator profiling (Midjourney/DALL·E/SD/Firefly) | Generator Profile card |
| Probabilistic forensic verdict paragraph | Verdict card |
| Auto watermark ("AI GENERATED" banner or "Verified Authentic" badge) + secure download | Verdict card actions |
| "Report Incorrect Detection" → CSV ledger | Feedback dialog |
| Mock accuracy/F1/dataset-scale dashboard | Model Monitoring page |

---

## 5. Extending to a Real Model

Replace the body of the `analyze_*` functions in `app/detection_engine.py`
with calls to a real trained model (e.g. load an ONNX/PyTorch classifier and
run inference on the image tensor). The rest of the app — UI, chain-of-
custody logging, watermarking, CSV feedback loop — requires no changes since
they consume the same `LayerResult` / `FusionResult` data classes.
