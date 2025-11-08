import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import os

def load_features(filename="province_features_v3.csv"):
    path = os.path.join(os.path.dirname(__file__), filename)
    if not os.path.exists(path):
        raise FileNotFoundError(f"{filename} not found in current directory")
    df = pd.read_csv(path)
    return df

def plot_correlation_heatmaps(df):
    numeric = df.select_dtypes(include=np.number)
    corr = numeric.corr()

    fig, axes = plt.subplots(2, 2, figsize=(16, 12))

    # 1. Lower triangle correlation heatmap
    ax1 = axes[0, 0]
    mask = np.triu(np.ones_like(corr, dtype=bool))
    sns.heatmap(corr, mask=mask, annot=True, cmap='RdBu_r', center=0,
                square=True, linewidths=0.5, cbar_kws={"shrink": .8}, ax=ax1, fmt=".2f")
    ax1.set_title("Feature Correlation Heatmap\n(Lower Triangle)", fontsize=12, fontweight='bold')

    # 2. Full correlation heatmap
    ax2 = axes[0, 1]
    sns.heatmap(corr, annot=True, cmap='RdBu_r', center=0,
                square=True, linewidths=0.5, cbar_kws={"shrink": .8}, ax=ax2, fmt=".2f")
    ax2.set_title("Complete Correlation Matrix", fontsize=12, fontweight='bold')

    # 3. Correlation with core features
    ax3 = axes[1, 0]
    core_features = [f for f in ["total_quakes", "major_quakes_m3plus", "nearest_fault_km"] if f in corr.columns]
    sns.heatmap(corr[core_features], annot=True, cmap='viridis', linewidths=0.5,
                square=False, cbar_kws={"shrink": .8}, ax=ax3, fmt=".2f")
    ax3.set_title(f"Correlations with Core Features\n({', '.join(core_features)})",
                  fontsize=11, fontweight='bold')

    # 4. Top correlated feature pairs (for clustering)
    ax4 = axes[1, 1]
    pairs = []
    for i, f1 in enumerate(corr.columns):
        for j, f2 in enumerate(corr.columns):
            if i < j:
                corr_val = corr.loc[f1, f2]
                if corr_val > 0:  # only positive correlations
                    pairs.append((f1, f2, corr_val))

    # sort by correlation descending
    pairs.sort(key=lambda x: x[2], reverse=True)
    top_pairs = pairs[:10]  # top 10 positive correlations

    features_pairs = [f"{p[0]} ↔ {p[1]}" for p in top_pairs]
    values = [p[2] for p in top_pairs]
    colors = ['gold' if i < 3 else 'lightblue' for i in range(len(values))]  # highlight top 3

    # plot bars from 0 left-aligned
    y_pos = np.arange(len(features_pairs))
    ax4.barh(y_pos, values, color=colors, edgecolor='black', align='center')
    ax4.set_yticks(y_pos)
    ax4.set_yticklabels(features_pairs)
    ax4.set_xlabel("Correlation")
    ax4.set_title("Top Correlated Feature Pairs\n(Top 3 Highlighted)", fontweight='bold')

    # add value labels
    for i, val in enumerate(values):
        ax4.text(val + 0.01, i, f"{val:.2f}", va='center')

    # invert y-axis so strongest correlation is on top
    ax4.invert_yaxis()

    plt.tight_layout()
    return fig, corr

def main():
    df = load_features()
    fig, corr = plot_correlation_heatmaps(df)

    # save figure
    cur_dir = os.path.dirname(__file__)
    fig_path = os.path.join(cur_dir, "province_features_heatmaps.png")
    fig.savefig(fig_path, dpi=300, bbox_inches='tight')
    print(f"Heatmaps saved: {fig_path}")

    plt.show()

if __name__ == "__main__":
    main()
