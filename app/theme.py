"""
Finding AI — Visual Theme
Dark-mode-only cyber-forensics palette, matched to the app logo.
"""

import customtkinter as ctk

# ---- Core Palette ----
DEEP_BLACK = "#0B0F19"
SURFACE = "#111827"          # panel background, slightly lifted from deep black
SLATE_BLUE = "#1E293B"       # card / sidebar background
SLATE_BLUE_LIGHT = "#27344A" # hover state
ELECTRIC_BLUE = "#2563EB"    # primary accent
ELECTRIC_BLUE_HOVER = "#1D4ED8"
ICE_WHITE = "#E5E9F0"        # primary text
MUTED_GRAY = "#8B96A8"       # secondary text
BORDER = "#232D3F"

# ---- Semantic Status Colors ----
VERDICT_AUTHENTIC = "#10B981"   # emerald green
VERDICT_AUTHENTIC_BG = "#052e22"
VERDICT_WARNING = "#F59E0B"     # amber
VERDICT_WARNING_BG = "#3a2a05"
VERDICT_CRITICAL = "#EF4444"    # red
VERDICT_CRITICAL_BG = "#3a0d0d"

FONT_FAMILY = "Segoe UI" if ctk.get_appearance_mode else "Helvetica"
FONT_MONO = "Consolas"


def status_color(ai_probability: float):
    """Return (fg_color, bg_color, label) for a given AI-probability percentage."""
    if ai_probability >= 65:
        return VERDICT_CRITICAL, VERDICT_CRITICAL_BG, "LIKELY AI-GENERATED"
    elif ai_probability >= 35:
        return VERDICT_WARNING, VERDICT_WARNING_BG, "INCONCLUSIVE — MANUAL REVIEW"
    else:
        return VERDICT_AUTHENTIC, VERDICT_AUTHENTIC_BG, "LIKELY AUTHENTIC"


def apply_base_theme():
    ctk.set_appearance_mode("dark")
    ctk.set_default_color_theme("blue")


def font(size=13, weight="normal", family=FONT_FAMILY):
    return ctk.CTkFont(family=family, size=size, weight=weight)
