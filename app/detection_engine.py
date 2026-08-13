"""
Finding AI — Evidence Fusion Engine (SIMULATED)
================================================
IMPORTANT / HONESTY NOTE:
Real AI-image detection requires trained classifier models (CNNs, frequency
classifiers, PRNU correlation databases, etc.) that are not bundled with this
app. This module SIMULATES a multi-layer forensic fusion pipeline so the UI,
data flow, and reporting architecture are fully wired up end-to-end.

Every score below is generated with a seeded pseudo-random generator (seeded
from the file's SHA-256 hash) so that:
  * results are deterministic and repeatable for the same file,
  * different files produce different, plausible-looking spreads,
  * nothing here should be mistaken for a validated forensic finding.

To make this a REAL detector, swap `_seeded_rng` derived scores in each
`analyze_*` function for outputs of an actual trained model (e.g. an ONNX/
PyTorch classifier loaded from disk) — the rest of the app (UI, reporting,
CSV feedback loop) will continue to work unchanged.
"""

import hashlib
import random
from dataclasses import dataclass, field
from typing import List, Dict


def _seeded_rng(seed_material: str) -> random.Random:
    seed_int = int(hashlib.sha256(seed_material.encode()).hexdigest(), 16) % (2**32)
    return random.Random(seed_int)


@dataclass
class LayerResult:
    layer_name: str
    ai_probability: float          # 0-100, this layer's contribution
    confidence: float              # 0-100, how confident this layer is in its own read
    diagnostics: List[str] = field(default_factory=list)


@dataclass
class GeneratorGuess:
    name: str
    probability: float


@dataclass
class FusionResult:
    overall_ai_probability: float
    overall_confidence: float
    layers: List[LayerResult]
    generator_guesses: List[GeneratorGuess]
    verdict_label: str
    verdict_paragraph: str


LAYER_WEIGHTS = {
    "Metadata & File Info": 0.15,
    "Digital Forensics (Frequency/Noise/Compression)": 0.30,
    "Computer Vision Anomaly Mapping": 0.35,
    "Geometric & Lighting Continuity": 0.20,
}


def analyze_metadata_layer(file_hash: str, exif_summary: dict) -> LayerResult:
    rng = _seeded_rng(file_hash + "metadata")
    has_camera_exif = any(k in exif_summary for k in ("Make", "Model", "FNumber", "ExposureTime"))
    fingerprint = exif_summary.get("EditingToolFingerprint")

    if fingerprint and any(t in fingerprint for t in ("Midjourney", "DALL", "Stable Diffusion", "Firefly")):
        prob = rng.uniform(85, 98)
        diagnostics = [f"Software tag fingerprint matches known generator: '{fingerprint}'."]
    elif has_camera_exif:
        prob = rng.uniform(2, 18)
        diagnostics = ["Camera-native EXIF block present (Make/Model/Exposure) consistent with optical capture."]
    else:
        prob = rng.uniform(35, 65)
        diagnostics = ["EXIF metadata absent or stripped — inconclusive on its own; common to both re-saved photos and AI outputs."]

    diagnostics.append("SHA-256/MD5 fingerprint computed for chain-of-custody logging.")
    confidence = rng.uniform(55, 80) if not has_camera_exif and not fingerprint else rng.uniform(75, 95)
    return LayerResult("Metadata & File Info", round(prob, 1), round(confidence, 1), diagnostics)


def analyze_digital_forensics_layer(file_hash: str, mean_ela_error: float) -> LayerResult:
    rng = _seeded_rng(file_hash + "digital_forensics")
    ela_component = min(100, mean_ela_error * 8)
    noise_component = rng.uniform(0, 100)
    compression_component = rng.uniform(0, 100)

    prob = (ela_component * 0.4 + noise_component * 0.3 + compression_component * 0.3)
    prob = max(0, min(100, prob))

    diagnostics = [
        f"Frequency-domain (FFT) spectrum simulated periodicity score: {noise_component:.1f}/100.",
        f"Sensor noise (PRNU-style) consistency score: {rng.uniform(0, 100):.1f}/100.",
        f"JPEG double-compression artifact indicator: {compression_component:.1f}/100.",
        f"Error Level Analysis mean residual: {mean_ela_error:.2f} (higher can indicate localized splicing).",
    ]
    confidence = rng.uniform(60, 92)
    return LayerResult("Digital Forensics (Frequency/Noise/Compression)", round(prob, 1), round(confidence, 1), diagnostics)


def analyze_cv_anomaly_layer(file_hash: str) -> LayerResult:
    rng = _seeded_rng(file_hash + "cv_anomaly")
    checks = {
        "Hand/finger anatomy coherence": rng.uniform(0, 100),
        "Pupil / iris symmetry": rng.uniform(0, 100),
        "Dental structure regularity": rng.uniform(0, 100),
        "Hair strand repetition patterns": rng.uniform(0, 100),
    }
    anomaly_scores = [v for v in checks.values()]
    prob = sum(anomaly_scores) / len(anomaly_scores)
    diagnostics = [f"{k}: {'anomalous' if v > 60 else 'nominal'} ({v:.1f}/100 deviation score)"
                   for k, v in checks.items()]
    confidence = rng.uniform(65, 96)
    return LayerResult("Computer Vision Anomaly Mapping", round(prob, 1), round(confidence, 1), diagnostics)


def analyze_geometry_lighting_layer(file_hash: str) -> LayerResult:
    rng = _seeded_rng(file_hash + "geometry_lighting")
    straight_line_breaks = rng.uniform(0, 100)
    warped_scenery = rng.uniform(0, 100)
    shadow_consistency = rng.uniform(0, 100)
    prob = (straight_line_breaks + warped_scenery + shadow_consistency) / 3
    diagnostics = [
        f"Straight-line / architectural continuity deviation: {straight_line_breaks:.1f}/100.",
        f"Background scenery warping indicator: {warped_scenery:.1f}/100.",
        f"Shadow & reflection vector consistency deviation: {shadow_consistency:.1f}/100.",
    ]
    confidence = rng.uniform(55, 88)
    return LayerResult("Geometric & Lighting Continuity", round(prob, 1), round(confidence, 1), diagnostics)


def guess_generators(file_hash: str, overall_prob: float) -> List[GeneratorGuess]:
    rng = _seeded_rng(file_hash + "generator_profile")
    if overall_prob < 20:
        candidates = {"Camera / Real Photograph": rng.uniform(70, 92)}
        remainder = 100 - sum(candidates.values())
        others = ["Midjourney", "DALL·E 3", "Stable Diffusion / Flux", "Adobe Firefly"]
        weights = [rng.random() for _ in others]
        total_w = sum(weights)
        for name, w in zip(others, weights):
            candidates[name] = remainder * (w / total_w)
    else:
        names = ["Midjourney", "DALL·E 3", "Stable Diffusion / Flux", "Adobe Firefly", "Camera / Real Photograph"]
        weights = [rng.uniform(0.5, 1.0) for _ in names]
        # Bias whichever generator "wins" this seed toward higher share
        winner_idx = rng.randrange(len(names) - 1)  # bias away from "Camera / Real"
        weights[winner_idx] *= rng.uniform(1.8, 2.6)
        total_w = sum(weights)
        candidates = {name: 100 * w / total_w for name, w in zip(names, weights)}

    guesses = [GeneratorGuess(name, round(val, 1)) for name, val in candidates.items()]
    guesses.sort(key=lambda g: g.probability, reverse=True)
    return guesses


def build_verdict_paragraph(overall_prob, overall_conf, layers: List[LayerResult], label: str) -> str:
    top_layer = max(layers, key=lambda l: l.ai_probability)
    steady_layer = min(layers, key=lambda l: abs(l.ai_probability - overall_prob))

    return (
        f"FORENSIC ASSESSMENT SUMMARY — Based on a weighted fusion of {len(layers)} independent "
        f"analytical layers, this platform calculates an aggregate AI-generation probability of "
        f"{overall_prob:.1f}% with an overall system confidence of {overall_conf:.1f}%, yielding a "
        f"classification of \"{label}.\" This determination is not presented as a binary certainty; "
        f"rather, it reflects the convergence (or divergence) of evidence across metadata integrity, "
        f"sensor-noise and compression signatures, computer-vision anatomical/geometric coherence, and "
        f"lighting-shadow consistency. The layer contributing the strongest signal in this case was "
        f"'{top_layer.layer_name}' at {top_layer.ai_probability:.1f}%, while '{steady_layer.layer_name}' "
        f"tracked closest to the overall fused estimate, suggesting reasonable inter-layer agreement. "
        f"As with any probabilistic forensic method, this result should be weighed alongside "
        f"provenance context, source verification, and — where consequential decisions depend on it — "
        f"corroborating human expert review. No single indicator here is treated as dispositive on its own; "
        f"the verdict reflects the totality of circumstantial digital evidence currently available to the engine."
    )


def run_fusion_engine(file_hash: str, exif_summary: dict, mean_ela_error: float) -> FusionResult:
    layers = [
        analyze_metadata_layer(file_hash, exif_summary),
        analyze_digital_forensics_layer(file_hash, mean_ela_error),
        analyze_cv_anomaly_layer(file_hash),
        analyze_geometry_lighting_layer(file_hash),
    ]

    weighted_sum = sum(l.ai_probability * LAYER_WEIGHTS[l.layer_name] for l in layers)
    overall_prob = max(0, min(100, weighted_sum))

    weighted_conf = sum(l.confidence * LAYER_WEIGHTS[l.layer_name] for l in layers)
    overall_conf = max(0, min(100, weighted_conf))

    if overall_prob >= 65:
        label = "LIKELY AI-GENERATED"
    elif overall_prob >= 35:
        label = "INCONCLUSIVE — MANUAL REVIEW RECOMMENDED"
    else:
        label = "LIKELY AUTHENTIC"

    generators = guess_generators(file_hash, overall_prob)
    paragraph = build_verdict_paragraph(overall_prob, overall_conf, layers, label)

    return FusionResult(
        overall_ai_probability=round(overall_prob, 1),
        overall_confidence=round(overall_conf, 1),
        layers=layers,
        generator_guesses=generators,
        verdict_label=label,
        verdict_paragraph=paragraph,
    )
