import pandas as pd
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D  # noqa: F401
import os
import glob
from tqdm import tqdm
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from scipy.spatial import ConvexHull
import numpy as np
import json
import warnings
warnings.filterwarnings('ignore')

# Paths
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
FAULT_DISTANCE_JSON = os.path.join(THIS_DIR, 'province_fault_distance.json')  # boundary-based distances copy in this folder
RAW_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(THIS_DIR)))), 'dataset', 'earthquake', 'raw')


def load_all_raw_earthquake_data():
    """Load all raw earthquake data from 2018 onwards"""
    print("Loading all raw earthquake data from 2018 onwards...")

    # Match pattern: raw_eq_data_YYYY_MM.csv
    csv_files = sorted(glob.glob(os.path.join(RAW_DATA_DIR, "raw_eq_data_*.csv")))
    
    # Filter to only include monthly files (exclude aggregated files like all_raw_eq_data_2018_to_2025.csv)
    csv_files = [f for f in csv_files if os.path.basename(f).count('_') == 4]  # raw_eq_data_YYYY_MM.csv has 4 underscores

    print(f"Found {len(csv_files)} files")
    all_data = []
    for csv_file in tqdm(csv_files):
        try:
            df = pd.read_csv(csv_file)
            all_data.append(df)
        except Exception as e:
            print(f"Error reading {csv_file}: {e}")
    
    if len(all_data) == 0:
        raise ValueError("No CSV files loaded. Check RAW_DATA_DIR path and file patterns.")
    
    df_all = pd.concat(all_data, ignore_index=True)
    print(f"Total records loaded: {len(df_all):,}")
    return df_all


def normalize_province_name(name: str) -> str:
    if not isinstance(name, str):
        return ''
    s = name.strip().lower()
    # Basic normalization: remove periods and multiple spaces
    for ch in [".", ",", "'", "\"", "(", ")"]:
        s = s.replace(ch, "")
    s = " ".join(s.split())
    # Common aliases
    s = s.replace('metro manila', 'metropolitan manila')
    return s


def extract_province_from_location(location):
    """Extract province from location string like 'Somewhere (Province Name)'."""
    if pd.isna(location):
        return None
    if '(' in location and ')' in location:
        province = location.split('(')[-1].split(')')[0].strip()
        return province
    return None


def extract_features_by_province(df):
    """Extract 2 core features per province for clustering"""
    print("\nExtracting core features by province...")
    features_list = []
    for province in tqdm(df['province'].dropna().unique()):
        province_data = df[df['province'] == province]
        total_quakes = len(province_data)
        major_quakes = len(province_data[province_data['magnitude'] >= 3.0])
        avg_magnitude = province_data['magnitude'].mean()
        max_magnitude = province_data['magnitude'].max()
        min_magnitude = province_data['magnitude'].min()
        avg_depth = province_data['depth'].mean()
        max_depth = province_data['depth'].max()
        features_list.append({
            'province': province,
            'total_quakes': total_quakes,
            'major_quakes_m3plus': major_quakes,
            'avg_magnitude': avg_magnitude,
            'max_magnitude': max_magnitude,
            'min_magnitude': min_magnitude,
            'avg_depth': avg_depth,
            'max_depth': max_depth,
        })
    return pd.DataFrame(features_list)


def load_fault_distances(path=FAULT_DISTANCE_JSON) -> pd.DataFrame:
    with open(path, 'r', encoding='utf-8') as f:
        rows = json.load(f)
    df = pd.DataFrame(rows)
    # Normalize join key
    df['province_norm'] = df['province_name'].apply(normalize_province_name)
    df = df.rename(columns={'nearest_fault_distance_km': 'nearest_fault_km'})
    return df[['province_norm', 'nearest_fault_km', 'province_name', 'province_id']]


def cluster_with_filtered_model_3d(provinces_features, filter_threshold=2000, n_clusters=2):
    """
    Train K-Means on filtered data (< threshold), then predict all data.
    Features: total_quakes, major_quakes_m3plus, nearest_fault_km
    """
    print(f"\nClustering Strategy (3D features):")
    print(f"  1) Train K-Means on provinces with total_quakes < {filter_threshold}")
    print(f"  2) Predict risk for ALL provinces")
    print("Features: total_quakes, major_quakes_m3plus, nearest_fault_km")

    features = ['total_quakes', 'major_quakes_m3plus', 'nearest_fault_km']
    X = provinces_features[features].fillna(0)

    filtered_mask = provinces_features['total_quakes'] < filter_threshold
    filtered = provinces_features[filtered_mask]

    print(f"\n  Training set: {len(filtered)} provinces; Predicting: {len(provinces_features)} provinces")

    scaler = StandardScaler()
    X_filt = filtered[features].fillna(0)
    X_filt_scaled = scaler.fit_transform(X_filt)

    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    kmeans.fit(X_filt_scaled)

    X_all_scaled = scaler.transform(X)
    clusters = kmeans.predict(X_all_scaled)

    provinces_features['risk_cluster'] = clusters
    provinces_features['is_outlier'] = ~filtered_mask
    return provinces_features, kmeans, scaler


def map_clusters_to_risk_levels(provinces_features):
    print("\nMapping clusters to risk levels (based on mean totals + majors)...")
    c0 = provinces_features[provinces_features['risk_cluster'] == 0]
    c1 = provinces_features[provinces_features['risk_cluster'] == 1]
    score0 = c0['total_quakes'].mean() + c0['major_quakes_m3plus'].mean()
    score1 = c1['total_quakes'].mean() + c1['major_quakes_m3plus'].mean()
    mapping = {0: 'Low', 1: 'Medium'} if score0 < score1 else {0: 'Medium', 1: 'Low'}
    provinces_features['risk_level'] = provinces_features['risk_cluster'].map(mapping)

    # Rule: very low activity force Low
    low_mask = (provinces_features['total_quakes'] < 800) & (provinces_features['major_quakes_m3plus'] < 150)
    provinces_features.loc[low_mask, 'risk_level'] = 'Low'
    return provinces_features, mapping


def plot_3d(provinces_features, mapping, output_path):
    print("\nRendering 3D scatter plot...")
    fig = plt.figure(figsize=(14, 10))
    ax = fig.add_subplot(111, projection='3d')

    colors = {'Low': '#2ecc71', 'Medium': '#f39c12'}

    for risk in ['Low', 'Medium']:
        df_r = provinces_features[provinces_features['risk_level'] == risk]
        if df_r.empty:
            continue
        ax.scatter(
            df_r['total_quakes'],
            df_r['major_quakes_m3plus'],
            df_r['nearest_fault_km'],
            s=70,
            c=colors[risk],
            label=risk,
            edgecolor='k',
            alpha=0.75
        )
        # Optional: annotate few extreme points
        top = df_r.sort_values('total_quakes', ascending=False).head(5)
        for _, row in top.iterrows():
            ax.text(row['total_quakes'], row['major_quakes_m3plus'], row['nearest_fault_km'], row['province'], fontsize=7)

    ax.set_xlabel('Total Earthquakes')
    ax.set_ylabel('Major EQs (M≥3.0)')
    ax.set_zlabel('Nearest Fault Distance (km)')
    ax.set_title('Province Clustering (3D) with Nearest Fault Distance')
    ax.legend()

    # Slightly nicer viewing angle
    ax.view_init(elev=20, azim=35)
    plt.tight_layout()
    plt.savefig(output_path, dpi=200)
    print(f"✓ 3D plot saved to: {output_path}")


def main():
    print("="*70)
    print("PROVINCE RISK CLUSTERING 3D (includes nearest fault distance)")
    print("="*70)

    # Load EQ data
    df = load_all_raw_earthquake_data()
    df['magnitude'] = pd.to_numeric(df['magnitude'], errors='coerce')
    df['depth'] = pd.to_numeric(df['depth'], errors='coerce')
    df['province'] = df['location'].apply(extract_province_from_location)
    df = df[df['province'].notna()]

    # Features per province
    provinces_features = extract_features_by_province(df)
    provinces_features['province_norm'] = provinces_features['province'].apply(normalize_province_name)

    # Load distances and merge
    if not os.path.exists(FAULT_DISTANCE_JSON):
        raise FileNotFoundError(f"Missing distances file: {FAULT_DISTANCE_JSON}")
    dist_df = load_fault_distances(FAULT_DISTANCE_JSON)

    merged = provinces_features.merge(dist_df, how='left', left_on='province_norm', right_on='province_norm')
    # If distance missing, leave as NaN; fill NaN with large value (e.g., 300km) to avoid biasing to zero
    merged['nearest_fault_km'] = merged['nearest_fault_km'].fillna(300.0)

    print(f"\nMerged features shape: {merged.shape}")
    print(merged[['province', 'total_quakes', 'major_quakes_m3plus', 'nearest_fault_km']].head())

    # Cluster
    merged, kmeans, scaler = cluster_with_filtered_model_3d(merged, filter_threshold=2000, n_clusters=2)
    merged, mapping = map_clusters_to_risk_levels(merged)

    # 3D Plot
    out_dir = THIS_DIR
    plot_3d(merged, mapping, os.path.join(out_dir, 'province_clustering_3d_fault.png'))

    # Save CSV with distances
    out_csv = os.path.join(out_dir, 'province_clustering_3d_with_fault.csv')
    merged.sort_values('total_quakes', ascending=False)[[
        'province', 'total_quakes', 'major_quakes_m3plus', 'nearest_fault_km', 'risk_cluster', 'risk_level', 'is_outlier'
    ]].to_csv(out_csv, index=False)
    print(f"✓ CSV saved to: {out_csv}")


if __name__ == '__main__':
    main()
