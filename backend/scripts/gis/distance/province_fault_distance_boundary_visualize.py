import os
import json
from typing import List, Dict
import matplotlib.pyplot as plt
import seaborn as sns

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
BOUNDARY_DIST_PATH = os.path.join(THIS_DIR, "province_fault_distance.json")
BAR_OUTPUT = os.path.join(THIS_DIR, "boundary_fault_distance_bar.png")
HIST_OUTPUT = os.path.join(THIS_DIR, "boundary_fault_distance_hist.png")
ZERO_SPLIT_OUTPUT = os.path.join(THIS_DIR, "boundary_fault_distance_zero_vs_nonzero.png")
TOP_NONZERO_OUTPUT = os.path.join(THIS_DIR, "boundary_fault_distance_top_nonzero.png")


def load_data(path: str) -> List[Dict]:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    filtered = [d for d in data if isinstance(d.get("nearest_fault_distance_km"), (int, float))]
    return filtered


def plot_bar(data: List[Dict], output_path: str):
    # Sort ascending by distance
    data_sorted = sorted(data, key=lambda d: d["nearest_fault_distance_km"])
    names = [d["province_name"] for d in data_sorted]
    distances = [d["nearest_fault_distance_km"] for d in data_sorted]

    height = min(0.35 * len(data_sorted) + 2, 28)
    plt.figure(figsize=(14, height))
    cmap = sns.color_palette("mako", n_colors=len(distances))
    plt.barh(names, distances, color=cmap)
    plt.xlabel("Nearest Fault Distance (km)")
    plt.title("Province Nearest Fault Distance (Boundary-Based)")
    plt.grid(axis="x", linestyle="--", alpha=0.4)

    # Annotate only non-zero distances if list small enough
    if len(distances) <= 120:
        for i, v in enumerate(distances):
            if v > 0:
                plt.text(v + max(distances) * 0.01, i, f"{v:.2f}", va="center", fontsize=7)
            else:
                plt.text(max(distances) * 0.005, i, "0", va="center", fontsize=7)

    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close()


def plot_histogram(data: List[Dict], output_path: str):
    distances = [d["nearest_fault_distance_km"] for d in data]
    plt.figure(figsize=(10, 6))
    # Separate zeros for clarity
    non_zero = [v for v in distances if v > 0]
    zeros = len(distances) - len(non_zero)

    # Histogram of non-zero distances
    sns.histplot(non_zero, bins=20, kde=True, color="steelblue")
    plt.xlabel("Nearest Fault Distance (km) - Non-zero")
    plt.ylabel("Count of Provinces")
    plt.title("Distribution of Non-zero Nearest Fault Distances (Boundary-Based)")
    plt.grid(axis="y", linestyle="--", alpha=0.4)
    plt.annotate(f"Zero-distance provinces: {zeros}", xy=(0.65, 0.92), xycoords="axes fraction", bbox=dict(boxstyle="round", fc="white", ec="gray"))
    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close()


def plot_zero_split(data: List[Dict], output_path: str):
    zero_count = sum(1 for d in data if d["nearest_fault_distance_km"] == 0)
    non_zero_count = len(data) - zero_count
    plt.figure(figsize=(6, 6))
    plt.pie([zero_count, non_zero_count], labels=["Zero Distance", "Non-zero Distance"], autopct="%1.1f%%", colors=["#ff9999", "#99ff99"], startangle=140)
    plt.title("Proportion of Provinces With Zero vs Non-zero Distance (Boundary-Based)")
    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close()


def plot_top_nonzero(data: List[Dict], output_path: str, top_n: int = 15):
    non_zero = [d for d in data if d["nearest_fault_distance_km"] > 0]
    if not non_zero:
        return
    sorted_non_zero = sorted(non_zero, key=lambda d: d["nearest_fault_distance_km"], reverse=True)[:top_n]
    names = [d["province_name"] for d in sorted_non_zero]
    distances = [d["nearest_fault_distance_km"] for d in sorted_non_zero]

    plt.figure(figsize=(12, 0.5 * len(names) + 2))
    sns.barplot(x=distances, y=names, palette="viridis")
    plt.xlabel("Nearest Fault Distance (km)")
    plt.title(f"Top {top_n} Provinces Farthest From Fault (Boundary-Based)")
    for i, v in enumerate(distances):
        plt.text(v + max(distances) * 0.01, i, f"{v:.2f}", va="center")
    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close()


def main():
    if not os.path.exists(BOUNDARY_DIST_PATH):
        raise FileNotFoundError(f"Missing boundary distance file: {BOUNDARY_DIST_PATH}")

    data = load_data(BOUNDARY_DIST_PATH)
    if not data:
        raise RuntimeError("No valid distance entries found.")

    plot_bar(data, BAR_OUTPUT)
    plot_histogram(data, HIST_OUTPUT)
    plot_zero_split(data, ZERO_SPLIT_OUTPUT)
    plot_top_nonzero(data, TOP_NONZERO_OUTPUT)

    print("Generated boundary visualization files:")
    print(f" - {BAR_OUTPUT}")
    print(f" - {HIST_OUTPUT}")
    print(f" - {ZERO_SPLIT_OUTPUT}")
    print(f" - {TOP_NONZERO_OUTPUT}")


if __name__ == "__main__":
    main()
