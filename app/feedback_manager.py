"""
Finding AI — Feedback Ledger & Model Monitoring
Handles the "Report Incorrect Detection" loop: every correction is appended
to a real, human-readable CSV file on disk (feedback_log.csv). The model
monitoring tab reads this same CSV to derive mock-but-reactive metrics
(accuracy, F1, dataset scale) — these move as real corrections are logged,
even though no retraining actually happens (there's no model to retrain).
"""

import csv
import os
import random
from datetime import datetime

FEEDBACK_CSV_HEADERS = [
    "timestamp", "filename", "sha256", "predicted_label",
    "predicted_ai_probability", "corrected_label", "user_notes",
    "system_confidence", "layer_snapshot",
]

DEFAULT_CSV_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "feedback_log.csv")


def ensure_csv_exists(path=DEFAULT_CSV_PATH):
    if not os.path.exists(path):
        with open(path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(FEEDBACK_CSV_HEADERS)
    return path


def append_feedback(record: dict, path=DEFAULT_CSV_PATH):
    ensure_csv_exists(path)
    with open(path, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FEEDBACK_CSV_HEADERS)
        row = {k: record.get(k, "") for k in FEEDBACK_CSV_HEADERS}
        row["timestamp"] = record.get("timestamp", datetime.now().isoformat(timespec="seconds"))
        writer.writerow(row)


def read_all_feedback(path=DEFAULT_CSV_PATH):
    ensure_csv_exists(path)
    with open(path, "r", newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def compute_mock_monitoring_metrics(path=DEFAULT_CSV_PATH):
    """
    Derives reactive (not real-model) monitoring metrics from the feedback
    ledger's row count. More logged corrections -> mock dataset scale grows
    and accuracy/F1 nudge (deterministically, seeded off row count) to
    illustrate what a live monitoring dashboard would show.
    """
    rows = read_all_feedback(path)
    n_corrections = len(rows)

    rng = random.Random(1000 + n_corrections)
    base_dataset = 48213
    dataset_scale = base_dataset + n_corrections * rng.randint(35, 90)

    base_accuracy = 91.4
    accuracy = min(99.2, base_accuracy + n_corrections * 0.03 + rng.uniform(-0.15, 0.15))

    base_f1 = 0.904
    f1 = min(0.99, base_f1 + n_corrections * 0.0004 + rng.uniform(-0.002, 0.002))

    history_points = []
    for i in range(max(1, min(n_corrections, 20)) + 1):
        history_points.append(round(base_accuracy + i * 0.03 + rng.uniform(-0.2, 0.2), 2))
    if not history_points:
        history_points = [base_accuracy]

    return {
        "accuracy": round(accuracy, 2),
        "f1_score": round(f1, 3),
        "dataset_scale": dataset_scale,
        "total_corrections_logged": n_corrections,
        "accuracy_history": history_points,
    }
