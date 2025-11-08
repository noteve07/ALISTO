import os
import json
from typing import List, Dict
import math

import matplotlib.pyplot as plt
import seaborn as sns

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
CENTROID_DIST_PATH = os.path.join(THIS_DIR, "province_fault_distance_centroid.json")
BAR_OUTPUT = os.path.join(THIS_DIR, "nearest_fault_distance_bar.png")
HIST_OUTPUT = os.path.join(THIS_DIR, "nearest_fault_distance_hist.png")
TOP_BOTTOM_OUTPUT = os.path.join(THIS_DIR, "nearest_fault_distance_top_bottom.png")


def load_data(path: str) -> List[Dict]:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    # Filter out entries without distance
    filtered = [d for d in data if isinstance(d.get("nearest_fault_distance_km"), (int, float))]
    return filtered


def plot_bar(data: List[Dict], output_path: str):
    # Sort ascending by distance
    data_sorted = sorted(data, key=lambda d: d["nearest_fault_distance_km"])
    names = [d["province_name"] for d in data_sorted]
    distances = [d["nearest_fault_distance_km"] for d in data_sorted]

    # Dynamic figure height (cap at 32 inches for readability)
    height = min(0.35 * len(data_sorted) + 2, 32)
    plt.figure(figsize=(14, height))
    cmap = sns.color_palette("viridis", n_colors=len(distances))

    plt.barh(names, distances, color=cmap)
    plt.xlabel("Nearest Fault Distance (km)")
    plt.title("Province Nearest Fault Distance (Centroid-Based)")
    plt.grid(axis="x", linestyle="--", alpha=0.4)

    # Annotate bars (only if not too many)
    if len(distances) <= 120:
        for i, v in enumerate(distances):
            plt.text(v + max(distances) * 0.005, i, f"{v:.1f}", va="center", fontsize=8)

    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close()


def plot_histogram(data: List[Dict], output_path: str):
    distances = [d["nearest_fault_distance_km"] for d in data]
    plt.figure(figsize=(10, 6))
    sns.histplot(distances, bins=20, kde=True, color="steelblue")
    plt.xlabel("Nearest Fault Distance (km)")
    plt.ylabel("Count of Provinces")
    plt.title("Distribution of Nearest Fault Distances (Centroid-Based)")
    plt.grid(axis="y", linestyle="--", alpha=0.4)
    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close()


def plot_top_bottom(data: List[Dict], output_path: str, top_n: int = 10):
    data_sorted = sorted(data, key=lambda d: d["nearest_fault_distance_km"])
    top = data_sorted[:top_n]
    bottom = data_sorted[-top_n:][::-1]

    fig, axes = plt.subplots(1, 2, figsize=(16, 8))

    # Closest
    axes[0].barh([d["province_name"] for d in top], [d["nearest_fault_distance_km"] for d in top], color="darkgreen")
    axes[0].set_title(f"Top {top_n} Closest Provinces")
    axes[0].set_xlabel("Distance (km)")
    axes[0].invert_yaxis()
    for i, dct in enumerate(top):
        axes[0].text(dct["nearest_fault_distance_km"] + 0.5, i, f"{dct['nearest_fault_distance_km']:.2f}", va="center")

    # Farthest
    axes[1].barh([d["province_name"] for d in bottom], [d["nearest_fault_distance_km"] for d in bottom], color="firebrick")
    axes[1].set_title(f"Top {top_n} Farthest Provinces")
    axes[1].set_xlabel("Distance (km)")
    axes[1].invert_yaxis()
    for i, dct in enumerate(bottom):
        axes[1].text(dct["nearest_fault_distance_km"] + 0.5, i, f"{dct['nearest_fault_distance_km']:.2f}", va="center")

    plt.suptitle("Nearest Fault Distance Extremes (Centroid-Based)", fontsize=14)
    plt.tight_layout(rect=[0, 0, 1, 0.96])
    plt.savefig(output_path, dpi=150)
    plt.close()


def main():
    if not os.path.exists(CENTROID_DIST_PATH):
        raise FileNotFoundError(f"Missing centroid distance file: {CENTROID_DIST_PATH}")

    data = load_data(CENTROID_DIST_PATH)
    if not data:
        raise RuntimeError("No valid distance entries found.")

    plot_bar(data, BAR_OUTPUT)
    plot_histogram(data, HIST_OUTPUT)
    plot_top_bottom(data, TOP_BOTTOM_OUTPUT)

    print("Generated visualization files:")
    print(f" - {BAR_OUTPUT}")
    print(f" - {HIST_OUTPUT}")
    print(f" - {TOP_BOTTOM_OUTPUT}")


if __name__ == "__main__":
    main()
