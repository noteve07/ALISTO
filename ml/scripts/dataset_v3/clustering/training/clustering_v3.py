import pandas as pd
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import os
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from scipy.spatial import ConvexHull
import numpy as np
import joblib
import json
import warnings
warnings.filterwarnings('ignore')

# Paths
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_CSV = os.path.join(THIS_DIR, 'province_features_v3.csv')


def load_province_features():
    """Load province features CSV with fault distance"""
    print(f"Loading province features from: {INPUT_CSV}")
    
    if not os.path.exists(INPUT_CSV):
        raise FileNotFoundError(f"Input CSV not found: {INPUT_CSV}")
    
    df = pd.read_csv(INPUT_CSV)
    print(f"Loaded {len(df)} provinces with {len(df.columns)} features")
    
    return df


def cluster_with_filtered_model_3d(provinces_features, filter_threshold=2000, n_clusters=2):
    """
    Train K-Means on filtered data (< threshold), then predict all data
    This ensures outliers get classified by the model trained on clean data
    Now with 3 features including fault distance
    """
    print(f"\nClustering Strategy (3D):")
    print(f"  1. Train K-Means on provinces with total_quakes < {filter_threshold}")
    print(f"  2. Predict risk for ALL provinces (including outliers)")
    print("Features: total_quakes, major_quakes_m3plus, nearest_fault_km")
    
    # 3 core features
    features = [
        'total_quakes',           # Total activity
        'major_quakes_m3plus',    # Significant earthquakes (M≥3.0)
        'nearest_fault_km',       # Distance to nearest fault line
    ]
    
    X = provinces_features[features].fillna(0)
    
    # Split into filtered (for training) and all data
    filtered_mask = provinces_features['total_quakes'] < filter_threshold
    filtered_provinces = provinces_features[filtered_mask]
    outlier_provinces = provinces_features[~filtered_mask]
    
    print(f"\n  Step 1: Train K-Means on filtered data (< {filter_threshold} quakes)...")
    print(f"    Training set: {len(filtered_provinces)} provinces")
    print(f"    Outliers to predict: {len(outlier_provinces)} provinces")
    
    # Standardize features
    scaler = StandardScaler()
    X_filtered = filtered_provinces[features].fillna(0)
    X_scaled_filtered = scaler.fit_transform(X_filtered)
    
    # Train K-Means only on filtered data
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    base_clusters = kmeans.fit_predict(X_scaled_filtered)
    
    print(f"    Filtered Cluster 0: {sum(base_clusters == 0)} provinces")
    print(f"    Filtered Cluster 1: {sum(base_clusters == 1)} provinces")
    
    # Now predict all data using the trained model
    print(f"\n  Step 2: Predict all provinces using trained K-Means...")
    X_scaled_all = scaler.transform(X)
    all_clusters = kmeans.predict(X_scaled_all)
    
    print(f"    All Cluster 0: {sum(all_clusters == 0)} provinces")
    print(f"    All Cluster 1: {sum(all_clusters == 1)} provinces")
    
    provinces_features['risk_cluster'] = all_clusters
    provinces_features['is_outlier'] = ~filtered_mask
    
    return provinces_features, kmeans, scaler


def map_clusters_to_risk_levels(provinces_features):
    """Map K-Means clusters to risk levels with post-processing"""
    print("\nMapping clusters to risk levels...")
    
    # Calculate cluster statistics
    cluster_0 = provinces_features[provinces_features['risk_cluster'] == 0]
    cluster_1 = provinces_features[provinces_features['risk_cluster'] == 1]
    
    print("\nCluster Statistics:")
    print(f"  Cluster 0: avg_total={cluster_0['total_quakes'].mean():.1f}, avg_major={cluster_0['major_quakes_m3plus'].mean():.1f}, avg_fault_dist={cluster_0['nearest_fault_km'].mean():.1f}km")
    print(f"  Cluster 1: avg_total={cluster_1['total_quakes'].mean():.1f}, avg_major={cluster_1['major_quakes_m3plus'].mean():.1f}, avg_fault_dist={cluster_1['nearest_fault_km'].mean():.1f}km")
    
    # Determine which cluster is low risk vs medium risk
    # Higher activity + closer to faults = higher risk
    score_0 = cluster_0['total_quakes'].mean() + cluster_0['major_quakes_m3plus'].mean()
    score_1 = cluster_1['total_quakes'].mean() + cluster_1['major_quakes_m3plus'].mean()
    
    risk_mapping = {}
    if score_0 < score_1:
        risk_mapping[0] = 'Low'
        risk_mapping[1] = 'Medium'
        print("\n  Cluster 0 -> LOW RISK (lower activity)")
        print("  Cluster 1 -> MEDIUM RISK (higher activity)")
    else:
        risk_mapping[0] = 'Medium'
        risk_mapping[1] = 'Low'
        print("\n  Cluster 0 -> MEDIUM RISK (higher activity)")
        print("  Cluster 1 -> LOW RISK (lower activity)")
    
    provinces_features['risk_level'] = provinces_features['risk_cluster'].map(risk_mapping)
    
    # Post-processing: Apply rule-based corrections
    print("\nApplying post-processing rules...")
    initial_counts = provinces_features['risk_level'].value_counts()
    
    # Rule 1: Very low activity should always be Low risk
    # If total_quakes < 800 AND major_quakes < 150, force to Low risk
    low_activity_mask = (provinces_features['total_quakes'] < 800) & (provinces_features['major_quakes_m3plus'] < 150)
    corrections_made = sum((low_activity_mask) & (provinces_features['risk_level'] == 'Medium'))
    provinces_features.loc[low_activity_mask, 'risk_level'] = 'Low'
    
    if corrections_made > 0:
        print(f"  ✓ Corrected {corrections_made} provinces from Medium to Low (low activity rule)")
    
    final_counts = provinces_features['risk_level'].value_counts()
    print(f"\n  Before correction: Low={initial_counts.get('Low', 0)}, Medium={initial_counts.get('Medium', 0)}")
    print(f"  After correction:  Low={final_counts.get('Low', 0)}, Medium={final_counts.get('Medium', 0)}")
    
    return provinces_features, risk_mapping


def export_results_to_csv(provinces_features, output_dir):
    """Export clustering results to CSV files"""
    # All provinces with full details
    output_csv = os.path.join(output_dir, 'province_risk_clustering_3d_results.csv')
    
    # Sort by total_quakes descending
    export_df = provinces_features.sort_values('total_quakes', ascending=False).copy()
    
    # Select columns to export and reorder
    columns_to_export = [
        'province',
        'risk_level',
        'total_quakes',
        'major_quakes_m3plus',
        'nearest_fault_km',
        'avg_magnitude',
        'max_magnitude',
        'min_magnitude',
        'avg_depth',
        'max_depth',
        'risk_cluster',
        'is_outlier'
    ]
    
    export_df_final = export_df[columns_to_export]
    
    # Round numeric columns for better readability
    export_df_final['nearest_fault_km'] = export_df_final['nearest_fault_km'].round(2)
    export_df_final['avg_magnitude'] = export_df_final['avg_magnitude'].round(2)
    export_df_final['max_magnitude'] = export_df_final['max_magnitude'].round(2)
    export_df_final['min_magnitude'] = export_df_final['min_magnitude'].round(2)
    export_df_final['avg_depth'] = export_df_final['avg_depth'].round(2)
    export_df_final['max_depth'] = export_df_final['max_depth'].round(2)
    
    export_df_final.to_csv(output_csv, index=False)
    print(f"\n✓ Full results exported to: {output_csv}")
    
    # Export summary by risk level
    summary_csv = os.path.join(output_dir, 'province_risk_clustering_3d_summary.csv')
    
    summary_data = []
    for risk_level in ['Low', 'Medium']:
        risk_data = provinces_features[provinces_features['risk_level'] == risk_level]
        if len(risk_data) > 0:
            summary_data.append({
                'Risk Level': risk_level,
                'Number of Provinces': len(risk_data),
                'Total Earthquakes (Sum)': int(risk_data['total_quakes'].sum()),
                'Total Major Earthquakes (Sum)': int(risk_data['major_quakes_m3plus'].sum()),
                'Avg Total Earthquakes': risk_data['total_quakes'].mean().round(2),
                'Avg Major Earthquakes': risk_data['major_quakes_m3plus'].mean().round(2),
                'Avg Fault Distance (km)': risk_data['nearest_fault_km'].mean().round(2),
                'Avg Magnitude': risk_data['avg_magnitude'].mean().round(2),
                'Max Magnitude': risk_data['max_magnitude'].max().round(2),
                'Avg Depth': risk_data['avg_depth'].mean().round(2),
            })
    
    summary_df = pd.DataFrame(summary_data)
    summary_df.to_csv(summary_csv, index=False)
    print(f"✓ Summary exported to: {summary_csv}")
    
    return export_df_final, summary_df


def export_results_to_json(provinces_features, output_dir):
    """Export clustering results to JSON files"""
    # Full results as JSON
    output_json = os.path.join(output_dir, 'province_risk_clustering_3d_results.json')
    
    # Sort by total_quakes descending
    export_df = provinces_features.sort_values('total_quakes', ascending=False).copy()
    
    # Convert to list of dicts
    provinces_list = []
    for idx, row in export_df.iterrows():
        province_dict = {
            'province': row['province'],
            'risk_level': row['risk_level'],
            'data': {
                'total_earthquakes': int(row['total_quakes']),
                'major_earthquakes_m3plus': int(row['major_quakes_m3plus']),
                'nearest_fault_distance_km': round(float(row['nearest_fault_km']), 2),
                'average_magnitude': round(float(row['avg_magnitude']), 2),
                'max_magnitude': round(float(row['max_magnitude']), 2),
                'min_magnitude': round(float(row['min_magnitude']), 2),
                'average_depth_km': round(float(row['avg_depth']), 2),
                'max_depth_km': round(float(row['max_depth']), 2),
            },
            'clustering_info': {
                'cluster_id': int(row['risk_cluster']),
                'is_outlier': bool(row['is_outlier']),
                'threshold_filter': 2000,
            }
        }
        provinces_list.append(province_dict)
    
    full_json = {
        'metadata': {
            'total_provinces': len(provinces_list),
            'clustering_algorithm': 'K-Means',
            'n_clusters': 2,
            'filter_threshold': 2000,
            'features': ['total_quakes', 'major_quakes_m3plus', 'nearest_fault_km'],
        },
        'provinces': provinces_list
    }
    
    with open(output_json, 'w') as f:
        json.dump(full_json, f, indent=2)
    
    print(f"\n✓ Full results exported to: {output_json}")
    
    # Summary as JSON
    summary_json = os.path.join(output_dir, 'province_risk_clustering_3d_summary.json')
    
    summary_data = {}
    for risk_level in ['Low', 'Medium']:
        risk_data = provinces_features[provinces_features['risk_level'] == risk_level]
        if len(risk_data) > 0:
            summary_data[risk_level] = {
                'number_of_provinces': len(risk_data),
                'province_names': risk_data['province'].tolist(),
                'statistics': {
                    'total_earthquakes_sum': int(risk_data['total_quakes'].sum()),
                    'total_major_earthquakes_sum': int(risk_data['major_quakes_m3plus'].sum()),
                    'avg_total_earthquakes': round(risk_data['total_quakes'].mean(), 2),
                    'avg_major_earthquakes': round(risk_data['major_quakes_m3plus'].mean(), 2),
                    'avg_fault_distance_km': round(risk_data['nearest_fault_km'].mean(), 2),
                    'avg_magnitude': round(risk_data['avg_magnitude'].mean(), 2),
                    'max_magnitude': round(risk_data['max_magnitude'].max(), 2),
                    'avg_depth_km': round(risk_data['avg_depth'].mean(), 2),
                }
            }
    
    with open(summary_json, 'w') as f:
        json.dump(summary_data, f, indent=2)
    
    print(f"✓ Summary exported to: {summary_json}")


def create_3d_visualizations(provinces_features, kmeans, scaler, output_dir):
    """Create 3D visualizations"""
    print("\nCreating 3D visualizations...")
    
    # Color mapping
    risk_colors = {'Low': '#2ecc71', 'Medium': '#f39c12'}
    
    # Create figure with multiple subplots
    fig = plt.figure(figsize=(20, 12))
    
    # ========== Plot 1: 3D Scatter (Training Data Only) ==========
    ax1 = fig.add_subplot(2, 3, 1, projection='3d')
    filtered_data = provinces_features[provinces_features['total_quakes'] < 2000]
    
    for risk_level in ['Low', 'Medium']:
        data = filtered_data[filtered_data['risk_level'] == risk_level]
        if len(data) > 0:
            ax1.scatter(data['total_quakes'], data['major_quakes_m3plus'], data['nearest_fault_km'],
                       s=80, alpha=0.7, label=risk_level, color=risk_colors[risk_level],
                       edgecolor='black', linewidth=0.5)
    
    ax1.set_xlabel('Total Earthquakes', fontsize=9, fontweight='bold')
    ax1.set_ylabel('Major EQs (M≥3.0)', fontsize=9, fontweight='bold')
    ax1.set_zlabel('Fault Distance (km)', fontsize=9, fontweight='bold')
    ax1.set_title('Training Data (< 2000 quakes)', fontsize=10, fontweight='bold')
    ax1.legend(fontsize=8)
    ax1.view_init(elev=20, azim=45)
    
    # ========== Plot 2: 3D Scatter (All Data) ==========
    ax2 = fig.add_subplot(2, 3, 2, projection='3d')
    
    for risk_level in ['Low', 'Medium']:
        data = provinces_features[provinces_features['risk_level'] == risk_level]
        if len(data) > 0:
            ax2.scatter(data['total_quakes'], data['major_quakes_m3plus'], data['nearest_fault_km'],
                       s=80, alpha=0.7, label=risk_level, color=risk_colors[risk_level],
                       edgecolor='black', linewidth=0.5)
    
    # Annotate top provinces
    top_provinces = provinces_features.nlargest(10, 'total_quakes')
    for _, row in top_provinces.iterrows():
        ax2.text(row['total_quakes'], row['major_quakes_m3plus'], row['nearest_fault_km'],
                row['province'], fontsize=6, alpha=0.7)
    
    ax2.set_xlabel('Total Earthquakes', fontsize=9, fontweight='bold')
    ax2.set_ylabel('Major EQs (M≥3.0)', fontsize=9, fontweight='bold')
    ax2.set_zlabel('Fault Distance (km)', fontsize=9, fontweight='bold')
    ax2.set_title('All Provinces (with labels)', fontsize=10, fontweight='bold')
    ax2.legend(fontsize=8)
    ax2.view_init(elev=20, azim=45)
    
    # ========== Plot 3: 3D Scatter (Different Angle) ==========
    ax3 = fig.add_subplot(2, 3, 3, projection='3d')
    
    for risk_level in ['Low', 'Medium']:
        data = provinces_features[provinces_features['risk_level'] == risk_level]
        if len(data) > 0:
            ax3.scatter(data['total_quakes'], data['major_quakes_m3plus'], data['nearest_fault_km'],
                       s=80, alpha=0.7, label=risk_level, color=risk_colors[risk_level],
                       edgecolor='black', linewidth=0.5)
    
    ax3.set_xlabel('Total Earthquakes', fontsize=9, fontweight='bold')
    ax3.set_ylabel('Major EQs (M≥3.0)', fontsize=9, fontweight='bold')
    ax3.set_zlabel('Fault Distance (km)', fontsize=9, fontweight='bold')
    ax3.set_title('All Provinces (side view)', fontsize=10, fontweight='bold')
    ax3.legend(fontsize=8)
    ax3.view_init(elev=10, azim=0)
    
    # ========== Plot 4: 2D Projection (Total vs Major) ==========
    ax4 = fig.add_subplot(2, 3, 4)
    
    for risk_level in ['Low', 'Medium']:
        data = provinces_features[provinces_features['risk_level'] == risk_level]
        if len(data) > 0:
            ax4.scatter(data['total_quakes'], data['major_quakes_m3plus'],
                       s=80, alpha=0.6, label=risk_level, color=risk_colors[risk_level],
                       edgecolor='black', linewidth=0.5)
    
    ax4.set_xlabel('Total Earthquakes', fontsize=10, fontweight='bold')
    ax4.set_ylabel('Major Earthquakes (M≥3.0)', fontsize=10, fontweight='bold')
    ax4.set_title('2D Projection: Total vs Major', fontsize=11, fontweight='bold')
    ax4.legend()
    ax4.grid(True, alpha=0.3)
    
    # ========== Plot 5: 2D Projection (Total vs Fault Distance) ==========
    ax5 = fig.add_subplot(2, 3, 5)
    
    for risk_level in ['Low', 'Medium']:
        data = provinces_features[provinces_features['risk_level'] == risk_level]
        if len(data) > 0:
            ax5.scatter(data['total_quakes'], data['nearest_fault_km'],
                       s=80, alpha=0.6, label=risk_level, color=risk_colors[risk_level],
                       edgecolor='black', linewidth=0.5)
    
    ax5.set_xlabel('Total Earthquakes', fontsize=10, fontweight='bold')
    ax5.set_ylabel('Fault Distance (km)', fontsize=10, fontweight='bold')
    ax5.set_title('2D Projection: Total vs Fault Distance', fontsize=11, fontweight='bold')
    ax5.legend()
    ax5.grid(True, alpha=0.3)
    
    # ========== Plot 6: Risk Distribution Bar Chart ==========
    ax6 = fig.add_subplot(2, 3, 6)
    risk_counts = provinces_features['risk_level'].value_counts()
    risk_order = ['Low', 'Medium']
    risk_counts = risk_counts.reindex(risk_order, fill_value=0)
    bars = ax6.bar(risk_order, risk_counts.values, color=[risk_colors[r] for r in risk_order], 
                   edgecolor='black', linewidth=1.5)
    
    ax6.set_ylabel('Number of Provinces', fontsize=10, fontweight='bold')
    ax6.set_title('Province Distribution by Risk Level', fontsize=11, fontweight='bold')
    ax6.grid(True, alpha=0.3, axis='y')
    
    # Add value labels on bars
    for bar in bars:
        height = bar.get_height()
        if height > 0:
            ax6.text(bar.get_x() + bar.get_width()/2., height,
                    f'{int(height)}', ha='center', va='bottom', fontsize=11, fontweight='bold')
    
    plt.tight_layout()
    
    # Save the plot
    output_path = os.path.join(output_dir, 'province_risk_clustering_3d_v8.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"✓ 3D visualization saved to: {output_path}")
    
    plt.show()


def main():
    print("="*70)
    print("PROVINCE RISK CLUSTERING V8 (3D with Fault Distance)")
    print("="*70)
    print("\nClustering Features:")
    print("1. total_quakes        - How active? (quantity)")
    print("2. major_quakes_m3plus - How dangerous? (M≥3.0)")
    print("3. nearest_fault_km    - How close to fault lines?")
    print("\nStrategy: Train K-Means on clean data (< 2000), predict ALL provinces")
    print("Result: Low and Medium risk levels")
    print("="*70)
    
    # Load province features
    provinces_features = load_province_features()
    
    print(f"\nNumber of provinces: {len(provinces_features)}")
    print("\nProvince Features Summary:")
    print(provinces_features[['total_quakes', 'major_quakes_m3plus', 'nearest_fault_km']].describe())
    
    # Cluster with filtered model (3D)
    provinces_features, kmeans, scaler = cluster_with_filtered_model_3d(
        provinces_features, 
        filter_threshold=2000,
        n_clusters=2
    )
    
    # Map clusters to risk levels
    provinces_features, cluster_to_risk = map_clusters_to_risk_levels(provinces_features)
    
    # Display results
    print("\n" + "="*70)
    print("RISK-BASED CLUSTERING RESULTS (V8 3D)")
    print("="*70)
    
    for risk_level in ['Low', 'Medium']:
        risk_data = provinces_features[provinces_features['risk_level'] == risk_level]
        if len(risk_data) > 0:
            print(f"\n{risk_level.upper()} RISK ({len(risk_data)} provinces):")
            print(f"{'Province':<30} {'Total EQ':>10} {'Major EQ':>10} {'Fault Dist':>12} {'Avg Mag':>10} {'Is Outlier':>15}")
            print("-" * 100)
            for _, row in risk_data.sort_values('total_quakes', ascending=False).head(15).iterrows():
                outlier_mark = "YES (>2000)" if row['is_outlier'] else "No"
                print(f"{row['province']:<30} {int(row['total_quakes']):>10} {int(row['major_quakes_m3plus']):>10} {row['nearest_fault_km']:>11.2f}km {row['avg_magnitude']:>10.2f} {outlier_mark:>15}")
            if len(risk_data) > 15:
                print(f"  ... and {len(risk_data) - 15} more provinces")
    
    # Create visualizations
    output_dir = THIS_DIR
    create_3d_visualizations(provinces_features, kmeans, scaler, output_dir)
    
    # Save the model and scaler
    model_path = os.path.join(output_dir, 'province_risk_kmeans_3d_model.joblib')
    scaler_path = os.path.join(output_dir, 'province_risk_3d_scaler.joblib')
    cluster_mapping_path = os.path.join(output_dir, 'province_risk_3d_cluster_mapping.joblib')
    
    joblib.dump(kmeans, model_path)
    joblib.dump(scaler, scaler_path)
    joblib.dump(cluster_to_risk, cluster_mapping_path)
    
    print(f"\n✓ Model saved to: {model_path}")
    print(f"✓ Scaler saved to: {scaler_path}")
    print(f"✓ Cluster mapping saved to: {cluster_mapping_path}")
    
    # Export results to CSV
    print("\n" + "="*70)
    print("EXPORTING RESULTS TO CSV")
    print("="*70)
    export_results_to_csv(provinces_features, output_dir)
    
    # Export results to JSON
    print("\n" + "="*70)
    print("EXPORTING RESULTS TO JSON")
    print("="*70)
    export_results_to_json(provinces_features, output_dir)
    
    print("\n" + "="*70)
    print("CLUSTERING COMPLETE!")
    print("="*70)


if __name__ == "__main__":
    main()
