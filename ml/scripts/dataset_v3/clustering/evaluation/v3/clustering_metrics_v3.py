import pandas as pd
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score, davies_bouldin_score, calinski_harabasz_score
import numpy as np
import os, json, warnings
warnings.filterwarnings('ignore')

# paths
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_CSV = os.path.join(THIS_DIR, 'province_features_v3.csv')


def load_province_features():
    """load province features csv"""
    print(f"Loading province features from: {INPUT_CSV}")
    if not os.path.exists(INPUT_CSV):
        raise FileNotFoundError(f"Input CSV not found: {INPUT_CSV}")
    df = pd.read_csv(INPUT_CSV)
    print(f"Loaded {len(df)} provinces with {len(df.columns)} features")
    return df


def cluster_with_filtered_model_3d(provinces_features, filter_threshold=2000, n_clusters=2):
    """train kmeans on filtered data then predict all data"""
    print(f"\nClustering Strategy (3D): train <{filter_threshold}, predict all")

    features = ['total_quakes', 'major_quakes_m3plus', 'nearest_fault_km']
    X = provinces_features[features].fillna(0)

    filtered_mask = provinces_features['total_quakes'] < filter_threshold
    filtered_provinces = provinces_features[filtered_mask]

    scaler = StandardScaler()
    X_filtered = filtered_provinces[features].fillna(0)
    X_scaled_filtered = scaler.fit_transform(X_filtered)

    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    base_clusters = kmeans.fit_predict(X_scaled_filtered)

    X_scaled_all = scaler.transform(X)
    all_clusters = kmeans.predict(X_scaled_all)
    provinces_features['risk_cluster'] = all_clusters
    provinces_features['is_outlier'] = ~filtered_mask

    # compute distances to cluster centers for confidence score
    distances = np.min(kmeans.transform(X_scaled_all), axis=1)
    confidences = (1 / (1 + distances))
    provinces_features['confidence_score'] = confidences
    provinces_features.loc[provinces_features['is_outlier'], 'confidence_score'] = 0.99

    # compute metrics
    silhouette = silhouette_score(X_scaled_all, all_clusters)
    db_index = davies_bouldin_score(X_scaled_all, all_clusters)
    ch_score = calinski_harabasz_score(X_scaled_all, all_clusters)
    inertia = kmeans.inertia_

    metrics = {
        "silhouette_score": round(silhouette, 3),
        "davies_bouldin_index": round(db_index, 3),
        "calinski_harabasz_score": round(ch_score, 3),
        "kmeans_inertia": round(inertia, 3)
    }

    print("\nClustering Evaluation Metrics:")
    for k, v in metrics.items():
        print(f"  {k.replace('_', ' ').title()}: {v}")

    return provinces_features, kmeans, scaler, metrics


def map_clusters_to_risk_levels(provinces_features):
    """map kmeans clusters to risk levels"""
    print("\nMapping clusters to risk levels...")

    cluster_0 = provinces_features[provinces_features['risk_cluster'] == 0]
    cluster_1 = provinces_features[provinces_features['risk_cluster'] == 1]

    score_0 = cluster_0['total_quakes'].mean() + cluster_0['major_quakes_m3plus'].mean()
    score_1 = cluster_1['total_quakes'].mean() + cluster_1['major_quakes_m3plus'].mean()

    if score_0 < score_1:
        mapping = {0: 'Low', 1: 'Medium'}
    else:
        mapping = {0: 'Medium', 1: 'Low'}

    provinces_features['risk_level'] = provinces_features['risk_cluster'].map(mapping)

    # rule: low activity always low risk
    low_mask = (provinces_features['total_quakes'] < 800) & (provinces_features['major_quakes_m3plus'] < 150)
    provinces_features.loc[low_mask, 'risk_level'] = 'Low'

    return provinces_features, mapping


def create_3d_visualizations(provinces_features):
    """show 3d plots"""
    print("\nCreating 3D visualization...")

    risk_colors = {'Low': '#2ecc71', 'Medium': '#f39c12'}

    fig = plt.figure(figsize=(16, 10))
    ax = fig.add_subplot(111, projection='3d')

    for risk in ['Low', 'Medium']:
        data = provinces_features[provinces_features['risk_level'] == risk]
        ax.scatter(data['total_quakes'], data['major_quakes_m3plus'], data['nearest_fault_km'],
                   s=80, alpha=0.7, color=risk_colors[risk], label=risk, edgecolor='black', linewidth=0.5)

    ax.set_xlabel('Total Earthquakes', fontsize=10, fontweight='bold')
    ax.set_ylabel('Major EQs (M≥3.0)', fontsize=10, fontweight='bold')
    ax.set_zlabel('Fault Distance (km)', fontsize=10, fontweight='bold')
    ax.set_title('Province Risk Clustering (3D)', fontsize=12, fontweight='bold')
    ax.legend()
    ax.view_init(elev=20, azim=45)

    plt.tight_layout()
    plt.show()


def export_results_to_json(provinces_features, metrics):
    """export json results with metrics"""
    output_json = os.path.join(THIS_DIR, 'province_risk_clustering_3d_results.json')
    cluster_json = os.path.join(THIS_DIR, 'cluster_results.json')

    provinces_list = []
    cluster_list = []

    for _, row in provinces_features.iterrows():
        provinces_list.append({
            "province": row['province'],
            "risk_level": row['risk_level'],
            "data": {
                "total_earthquakes": int(row['total_quakes']),
                "major_earthquakes_m3plus": int(row['major_quakes_m3plus']),
                "nearest_fault_distance_km": round(float(row['nearest_fault_km']), 2),
                "average_magnitude": round(float(row['avg_magnitude']), 2),
                "max_magnitude": round(float(row['max_magnitude']), 2),
                "min_magnitude": round(float(row['min_magnitude']), 2),
                "average_depth_km": round(float(row['avg_depth']), 2),
                "max_depth_km": round(float(row['max_depth']), 2)
            },
            "clustering_info": {
                "cluster_id": int(row['risk_cluster']),
                "is_outlier": bool(row['is_outlier']),
                "confidence_score": float(row['confidence_score'])
            }
        })

        cluster_list.append({
            "province": row['province'],
            "cluster_id": int(row['risk_cluster']),
            "risk_level": row['risk_level'],
            "confidence_score": float(row['confidence_score'])
        })

    json_data = {
        "metadata": {
            "total_provinces": len(provinces_list),
            "clustering_algorithm": "K-Means",
            "n_clusters": 2,
            "filter_threshold": 2000,
            "features": ['total_quakes', 'major_quakes_m3plus', 'nearest_fault_km'],
            "evaluation_metrics": metrics
        },
        "provinces": provinces_list
    }

    # export detailed clustering results
    with open(output_json, 'w') as f:
        json.dump(json_data, f, indent=2)

    with open(cluster_json, 'w') as f:
        json.dump(cluster_list, f, indent=2)

    print(f"\n✓ Results exported to: {output_json}")
    print(f"✓ Cluster confidence results exported to: {cluster_json}")


def main():
    print("=" * 70)
    print("PROVINCE RISK CLUSTERING V9 + CONFIDENCE SCORE")
    print("=" * 70)

    df = load_province_features()

    df, kmeans, scaler, metrics = cluster_with_filtered_model_3d(df)
    df, mapping = map_clusters_to_risk_levels(df)

    create_3d_visualizations(df)
    export_results_to_json(df, metrics)

    print("\nClustering Complete.")


if __name__ == "__main__":
    main()
