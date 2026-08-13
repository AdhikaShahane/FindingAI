"""
Finding AI — Advanced AI Image Forensics Platform
Entry point. Double-click FindingAI.exe / FindingAI.app in the packaged
build, or run `python main.py` during development.
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.ui_dashboard import FindingAIApp
from app import feedback_manager as fm


def main():
    fm.ensure_csv_exists()
    app = FindingAIApp()
    app.mainloop()


if __name__ == "__main__":
    main()
