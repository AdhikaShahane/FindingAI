"""
Finding AI — Real Forensic Utilities
These functions perform GENUINE image analysis (not simulated):
  - Cryptographic hashing (SHA-256 / MD5)
  - EXIF metadata extraction
  - Error Level Analysis (ELA) via JPEG re-compression differencing
  - Edge / geometric continuity map via convolution filters
  - FFT-based frequency magnitude spectrum

Everything in this file operates on real pixel/byte data. The probabilistic
"is this AI generated" scoring layered on top (see detection_engine.py) is a
simulation intended for UI/UX demonstration, since real deepfake detection
requires a trained classifier model this app does not ship with.
"""

import hashlib
import io
import os
from datetime import datetime

import numpy as np
from PIL import Image, ImageFilter, ImageChops, ExifTags


def compute_hashes(filepath):
    sha256 = hashlib.sha256()
    md5 = hashlib.md5()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha256.update(chunk)
            md5.update(chunk)
    return sha256.hexdigest(), md5.hexdigest()


def get_file_info(filepath):
    stat = os.stat(filepath)
    img = Image.open(filepath)
    sha256, md5 = compute_hashes(filepath)
    return {
        "filename": os.path.basename(filepath),
        "filesize_bytes": stat.st_size,
        "filesize_readable": _human_size(stat.st_size),
        "resolution": f"{img.width} x {img.height}",
        "width": img.width,
        "height": img.height,
        "format": img.format,
        "mode": img.mode,
        "sha256": sha256,
        "md5": md5,
        "ingested_at": datetime.now().isoformat(timespec="seconds"),
    }


def _human_size(n):
    for unit in ["B", "KB", "MB", "GB"]:
        if n < 1024:
            return f"{n:.1f} {unit}"
        n /= 1024
    return f"{n:.1f} TB"


def extract_exif(filepath):
    """Extract real EXIF tags where present. Returns a dict (may be empty)."""
    result = {}
    try:
        img = Image.open(filepath)
        raw_exif = img.getexif()
        if not raw_exif:
            return result
        for tag_id, value in raw_exif.items():
            tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
            try:
                if isinstance(value, bytes):
                    value = value.decode(errors="ignore")
                result[tag_name] = value
            except Exception:
                continue
    except Exception:
        pass
    return result


def format_exif_summary(exif_dict):
    """Pull out the human-relevant fields commonly used in forensic review."""
    interesting = [
        "Make", "Model", "Software", "DateTime", "DateTimeOriginal",
        "ExposureTime", "FNumber", "ISOSpeedRatings", "ISO",
        "FocalLength", "LensModel", "Orientation", "ColorSpace",
    ]
    summary = {k: exif_dict[k] for k in interesting if k in exif_dict}
    editing_tools = ["Photoshop", "GIMP", "Lightroom", "Affinity", "Midjourney",
                      "DALL", "Stable Diffusion", "Firefly", "Canva"]
    software = str(exif_dict.get("Software", ""))
    fingerprint = next((tool for tool in editing_tools if tool.lower() in software.lower()), None)
    if fingerprint:
        summary["EditingToolFingerprint"] = fingerprint
    return summary


def generate_ela_image(filepath, quality=90):
    """
    Genuine Error Level Analysis:
    Re-save the image at a known JPEG quality and diff against the original.
    Regions with unusual error levels can indicate localized editing/splicing.
    Returns a PIL.Image (heatmap-enhanced) suitable for display.
    """
    original = Image.open(filepath).convert("RGB")
    buffer = io.BytesIO()
    original.save(buffer, "JPEG", quality=quality)
    buffer.seek(0)
    recompressed = Image.open(buffer)

    diff = ImageChops.difference(original, recompressed)
    diff_np = np.array(diff).astype(np.float32)

    max_diff = diff_np.max() if diff_np.max() > 0 else 1
    scale = 255.0 / max_diff
    enhanced = np.clip(diff_np * scale, 0, 255).astype(np.uint8)

    heat = _apply_heat_colormap(enhanced)
    return Image.fromarray(heat), float(diff_np.mean())


def _apply_heat_colormap(gray_rgb_array):
    """Map a grayscale-ish RGB error array onto a blue->amber->red heat scale."""
    intensity = gray_rgb_array.mean(axis=2)
    norm = intensity / 255.0
    h, w = norm.shape
    out = np.zeros((h, w, 3), dtype=np.uint8)
    out[..., 0] = np.clip(norm * 500, 0, 255)                 # R ramps fastest
    out[..., 1] = np.clip((norm - 0.3) * 500, 0, 255)          # G kicks in mid
    out[..., 2] = np.clip((1 - norm) * 180 + 40, 0, 255)       # B baseline glow
    return out


def generate_edge_map(filepath):
    """Real geometric-continuity edge detection (FIND_EDGES kernel)."""
    img = Image.open(filepath).convert("L")
    edges = img.filter(ImageFilter.FIND_EDGES)
    edges = edges.point(lambda p: min(255, p * 1.8))
    return edges.convert("RGB")


def generate_frequency_spectrum(filepath):
    """
    Real 2D FFT magnitude spectrum of the luminance channel.
    Used to visually flag unnatural periodicity (e.g. GAN upsampling artifacts).
    Returns a numpy array (H, W) of log-magnitude values, normalized 0-255.
    """
    img = Image.open(filepath).convert("L")
    img_small = img.resize((512, 512))
    arr = np.array(img_small, dtype=np.float32)
    f = np.fft.fft2(arr)
    fshift = np.fft.fftshift(f)
    magnitude = np.log1p(np.abs(fshift))
    norm = (magnitude - magnitude.min()) / (magnitude.max() - magnitude.min() + 1e-8)
    return (norm * 255).astype(np.uint8)


def apply_watermark(filepath, is_ai: bool, output_path):
    """
    Real overlay compositing:
      - AI verdict -> semi-transparent center banner "AI GENERATED — FINDING AI"
      - Authentic verdict -> corner "Verified Authentic" badge
    """
    from PIL import ImageDraw, ImageFont

    base = Image.open(filepath).convert("RGBA")
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    w, h = base.size
    try:
        font_big = ImageFont.truetype("arialbd.ttf", size=max(20, w // 18))
        font_small = ImageFont.truetype("arial.ttf", size=max(12, w // 40))
    except Exception:
        font_big = ImageFont.load_default()
        font_small = ImageFont.load_default()

    if is_ai:
        band_h = int(h * 0.16)
        band_y = (h - band_h) // 2
        draw.rectangle([0, band_y, w, band_y + band_h], fill=(239, 68, 68, 140))
        text = "AI GENERATED — FINDING AI"
        bbox = draw.textbbox((0, 0), text, font=font_big)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.text(((w - tw) / 2, band_y + (band_h - th) / 2 - bbox[1]),
                   text, fill=(255, 255, 255, 235), font=font_big)
    else:
        badge_w, badge_h = int(w * 0.34), int(h * 0.07)
        margin = int(w * 0.02)
        draw.rounded_rectangle(
            [margin, h - margin - badge_h, margin + badge_w, h - margin],
            radius=10, fill=(16, 185, 129, 170)
        )
        text = "✓ Verified Authentic — Finding AI"
        draw.text((margin + 12, h - margin - badge_h + badge_h / 2 - 8),
                   text, fill=(11, 15, 25, 255), font=font_small)

    result = Image.alpha_composite(base, overlay).convert("RGB")
    result.save(output_path, quality=95)
    return output_path
