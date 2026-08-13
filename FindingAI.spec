# -*- mode: python ; coding: utf-8 -*-
# PyInstaller spec for Finding AI — Advanced AI Image Forensics Platform
#
# Build with:
#   pyinstaller FindingAI.spec
#
# Output:
#   Windows -> dist/FindingAI/FindingAI.exe
#   macOS   -> dist/FindingAI.app

import sys
import os
import customtkinter

block_cipher = None

ctk_path = os.path.dirname(customtkinter.__file__)

added_files = [
    (os.path.join(ctk_path), "customtkinter"),
    ("assets", "assets"),
]

a = Analysis(
    ["main.py"],
    pathex=[],
    binaries=[],
    datas=added_files,
    hiddenimports=[
        "PIL._tkinter_finder",
        "matplotlib.backends.backend_tkagg",
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name="FindingAI",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,  # no terminal window — pure GUI launch
    icon="assets/icon.ico" if sys.platform.startswith("win") else "assets/icon.png",
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name="FindingAI",
)

if sys.platform == "darwin":
    app = BUNDLE(
        coll,
        name="FindingAI.app",
        icon="assets/icon.icns",
        bundle_identifier="com.findingai.forensics",
        info_plist={
            "NSHighResolutionCapable": "True",
            "CFBundleName": "Finding AI",
            "CFBundleDisplayName": "Finding AI",
            "CFBundleShortVersionString": "1.0.0",
        },
    )
