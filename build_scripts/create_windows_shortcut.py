"""
Optional helper: programmatically creates a Windows Desktop shortcut (.lnk)
pointing at the packaged FindingAI.exe, with the custom icon.

Usage (after running build_windows.bat):
    pip install pywin32
    python build_scripts\\create_windows_shortcut.py
"""

import os
import sys

def main():
    if sys.platform != "win32":
        print("This helper only runs on Windows.")
        return

    try:
        import win32com.client
    except ImportError:
        print("Please install pywin32 first:  pip install pywin32")
        return

    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    exe_path = os.path.join(project_root, "dist", "FindingAI", "FindingAI.exe")
    icon_path = os.path.join(project_root, "assets", "icon.ico")

    if not os.path.exists(exe_path):
        print(f"Could not find {exe_path}. Run build_windows.bat first.")
        return

    desktop = os.path.join(os.path.expanduser("~"), "Desktop")
    shortcut_path = os.path.join(desktop, "Finding AI.lnk")

    shell = win32com.client.Dispatch("WScript.Shell")
    shortcut = shell.CreateShortCut(shortcut_path)
    shortcut.Targetpath = exe_path
    shortcut.WorkingDirectory = os.path.dirname(exe_path)
    shortcut.IconLocation = icon_path
    shortcut.Description = "Finding AI — Advanced AI Image Forensics Platform"
    shortcut.save()

    print(f"Desktop shortcut created: {shortcut_path}")


if __name__ == "__main__":
    main()
