import pandas as pd
import matplotlib.pyplot as plt
import os
import glob
from tqdm import tqdm
from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler
from scipy.spatial import ConvexHull
import numpy as np
import joblib
import json
import warnings
warnings.filterwarnings('ignore')

def load_all_raw_earthquake_data():
    """Load all raw earthquake data from 2018 onwards"""
    print("Loading all raw earthquake data from 2018 onwards...")
    
    raw_data_dir = r"c:\Users\ADMIN\Documents\GitHub\ALISTO\ml\dataset\earthquake\raw"
    csv_files = sorted(glob.glob(os.path.join(raw_data_dir, "raw_eq_data_201[89]*.csv")) + 
                       glob.glob(os.path.join(raw_data_dir, "raw_eq_data_202*.csv")))
    
    print(f"Found {len(csv_files)} files")
    
    all_data = []
    for csv_file in tqdm(csv_files):
        try:
            df = pd.read_csv(csv_file)
            all_data.append(df)
        except Exception as e:
            print(f"Error reading {csv_file}: {e}")
    
    df_all = pd.concat(all_data, ignore_index=True)
    print(f"Total records loaded: {len(df_all):,}")
    
    return df_all

def extract_province_from_location(location):
    """Extract province from location string"""
    if pd.isna(location):
        return None
    
    if '(' in location and ')' in location:
        province = location.split('(')[-1].split(')')[0].strip()
        return province
    
    return None

def extract_features_by_province(df):
    """Extract 2 core features per province for clustering"""
    print("\nExtracting 2 core features by province...")
    
    features_list = []
    
    for province in tqdm(df['province'].unique()):
        province_data = df[df['province'] == province]
        
        # 2 core clustering features
        total_quakes = len(province_data)  # Total activity
        major_quakes = len(province_data[province_data['magnitude'] >= 3.0])  # Significant earthquakes (M≥3.0)
        
        # Additional statistics
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

def cluster_with_filtered_model(provinces_features, filter_threshold=4000, n_clusters=2):
    """
    Train K-Means on filtered data (< threshold), then predict all data
    This ensures outliers get classified by the model trained on clean data
    """
    print(f"\nClustering Strategy:")
    print(f"  1. Train K-Means on provinces with total_quakes < {filter_threshold}")
    print(f"  2. Predict risk for ALL provinces (including outliers)")
    print("Features: total_quakes, major_quakes_m3plus")
    
    # 2 core features only
    features = [
        'total_quakes',           # Total activity
        'major_quakes_m3plus',    # Significant earthquakes (M≥3.0)
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
    kmeans = KMeans(n_clusters=2, random_state=42, n_init=10)
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
    print(f"  Cluster 0: avg_total={cluster_0['total_quakes'].mean():.1f}, avg_major={cluster_0['major_quakes_m3plus'].mean():.1f}")
    print(f"  Cluster 1: avg_total={cluster_1['total_quakes'].mean():.1f}, avg_major={cluster_1['major_quakes_m3plus'].mean():.1f}")
    
    # Determine which cluster is low risk vs medium risk
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
    output_csv = os.path.join(output_dir, 'province_risk_clustering_results.csv')
    
    # Sort by total_quakes descending
    export_df = provinces_features.sort_values('total_quakes', ascending=False).copy()
    
    # Select columns to export and reorder
    columns_to_export = [
        'province',
        'risk_level',
        'total_quakes',
        'major_quakes_m3plus',
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
    export_df_final['avg_magnitude'] = export_df_final['avg_magnitude'].round(2)
    export_df_final['max_magnitude'] = export_df_final['max_magnitude'].round(2)
    export_df_final['min_magnitude'] = export_df_final['min_magnitude'].round(2)
    export_df_final['avg_depth'] = export_df_final['avg_depth'].round(2)
    export_df_final['max_depth'] = export_df_final['max_depth'].round(2)
    
    export_df_final.to_csv(output_csv, index=False)
    print(f"\n✓ Full results exported to: {output_csv}")
    
    # Export summary by risk level
    summary_csv = os.path.join(output_dir, 'province_risk_clustering_summary.csv')
    
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
    output_json = os.path.join(output_dir, 'province_risk_clustering_results.json')
    
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
            'features': ['total_quakes', 'major_quakes_m3plus'],
        },
        'provinces': provinces_list
    }
    
    with open(output_json, 'w') as f:
        json.dump(full_json, f, indent=2)
    
    print(f"\n✓ Full results exported to: {output_json}")
    
    # Summary as JSON
    summary_json = os.path.join(output_dir, 'province_risk_clustering_summary.json')
    
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
                    'avg_magnitude': round(risk_data['avg_magnitude'].mean(), 2),
                    'max_magnitude': round(risk_data['max_magnitude'].max(), 2),
                    'avg_depth_km': round(risk_data['avg_depth'].mean(), 2),
                }
            }
    
    with open(summary_json, 'w') as f:
        json.dump(summary_data, f, indent=2)
    
    print(f"✓ Summary exported to: {summary_json}")

def draw_cluster_boundaries(ax, provinces_features, scaler, kmeans, risk_colors):
    """Draw convex hull boundaries around clusters"""
    
    features = ['total_quakes', 'major_quakes_m3plus']
    X = provinces_features[features].fillna(0).values
    X_scaled = scaler.transform(X)
    
    # Get cluster assignments and risk levels
    clusters = kmeans.predict(X_scaled)
    
    # Draw boundary for each cluster
    for cluster_id in [0, 1]:
        cluster_points_scaled = X_scaled[clusters == cluster_id]
        cluster_points = X[clusters == cluster_id]
        
        if len(cluster_points) >= 3:
            try:
                # Get the risk level for this cluster
                cluster_mask = (clusters == cluster_id)
                risk_level = provinces_features[cluster_mask]['risk_level'].iloc[0]
                color = risk_colors.get(risk_level, '#cccccc')
                
                # Compute convex hull
                hull = ConvexHull(cluster_points_scaled)
                
                # Get hull vertices in original space
                hull_vertices = cluster_points[hull.vertices]
                
                # Close the polygon
                hull_vertices_closed = np.vstack([hull_vertices, hull_vertices[0]])
                
                # Draw polygon
                ax.plot(hull_vertices_closed[:, 0], hull_vertices_closed[:, 1],
                       color=color, linewidth=2.5, linestyle='--', alpha=0.7)
                ax.fill(hull_vertices_closed[:, 0], hull_vertices_closed[:, 1],
                       color=color, alpha=0.05)
            except:
                pass  # Skip if ConvexHull fails (e.g., collinear points)

def main():
    print("="*70)
    print("PROVINCE RISK CLUSTERING V8 (JSON + CLUSTER BOUNDARIES)")
    print("="*70)
    print("\nClustering Features:")
    print("1. total_quakes       - How active? (quantity)")
    print("2. major_quakes_m3plus - How dangerous? (M≥3.0)")
    print("\nStrategy: Train K-Means on clean data (< 2000), predict ALL provinces")
    print("Result: Low and Medium risk levels (outliers naturally → Medium)")
    print("Scope: ALL provinces (but model trained on filtered data)")
    print("="*70)
    
    # Load raw earthquake data
    df = load_all_raw_earthquake_data()
    
    # Convert magnitude and depth to numeric
    df['magnitude'] = pd.to_numeric(df['magnitude'], errors='coerce')
    df['depth'] = pd.to_numeric(df['depth'], errors='coerce')
    
    # Extract province from location
    print("\nExtracting province information...")
    df['province'] = df['location'].apply(extract_province_from_location)
    
    # Remove rows without province
    df = df[df['province'].notna()]
    print(f"Records with valid province: {len(df):,}")
    
    # Extract features
    provinces_features = extract_features_by_province(df)
    
    print(f"\nNumber of provinces: {len(provinces_features)}")
    print("\nProvince Features Summary:")
    print(provinces_features.describe())
    
    # Cluster with filtered model
    provinces_features, kmeans, scaler = cluster_with_filtered_model(
        provinces_features, 
        filter_threshold=2000,
        n_clusters=2
    )
    
    # Map clusters to risk levels
    provinces_features, cluster_to_risk = map_clusters_to_risk_levels(provinces_features)
    
    # Display results
    print("\n" + "="*70)
    print("RISK-BASED CLUSTERING RESULTS (V8 - WITH JSON & BOUNDARIES)")
    print("="*70)
    
    for risk_level in ['Low', 'Medium']:
        risk_data = provinces_features[provinces_features['risk_level'] == risk_level]
        if len(risk_data) > 0:
            print(f"\n{risk_level.upper()} RISK ({len(risk_data)} provinces):")
            print(f"{'Province':<30} {'Total EQ':>10} {'Major EQ':>10} {'Avg Mag':>10} {'Max Mag':>10} {'Is Outlier':>15}")
            print("-" * 90)
            for _, row in risk_data.sort_values('total_quakes', ascending=False).iterrows():
                outlier_mark = "YES (>2000)" if row['is_outlier'] else "No"
                print(f"{row['province']:<30} {int(row['total_quakes']):>10} {int(row['major_quakes_m3plus']):>10} {row['avg_magnitude']:>10.2f} {row['max_magnitude']:>10.2f} {outlier_mark:>15}")
    
    # Create visualizations
    fig = plt.figure(figsize=(16, 12))
    
    # Color mapping
    risk_colors = {'Low': '#2ecc71', 'Medium': '#f39c12'}
    
    # Plot 1: Total Quakes vs Major Quakes (FILTERED DATA ONLY - no outliers)
    ax1 = fig.add_subplot(2, 2, 1)
    filtered_data = provinces_features[provinces_features['total_quakes'] < 2000]
    for risk_level in ['Low', 'Medium']:
        data = filtered_data[filtered_data['risk_level'] == risk_level]
        if len(data) > 0:
            ax1.scatter(data['total_quakes'], data['major_quakes_m3plus'],
                       s=100, alpha=0.6, label=risk_level, color=risk_colors[risk_level],
                       edgecolor='black', linewidth=0.5)
    
    # Equal aspect ratio for balanced visualization (based on filtered data only)
    max_val_filtered = max(filtered_data['total_quakes'].max(), filtered_data['major_quakes_m3plus'].max())
    ax1.set_xlim(0, max_val_filtered * 1.1)
    ax1.set_ylim(0, max_val_filtered * 1.1)
    
    ax1.set_xlabel('Total Earthquakes', fontsize=10, fontweight='bold')
    ax1.set_ylabel('Major Earthquakes (M≥3.0)', fontsize=10, fontweight='bold')
    ax1.set_title('K-Means Training Data (< 2000 quakes only)', fontsize=11, fontweight='bold')
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    
    # Plot 2: Total Quakes vs Major Quakes (with labels, showing which are outliers + cluster boundaries)
    ax2 = fig.add_subplot(2, 2, 2)
    
    # Draw cluster boundaries first (so they appear behind)
    draw_cluster_boundaries(ax2, provinces_features, scaler, kmeans, risk_colors)
    
    for risk_level in ['Low', 'Medium']:
        data = provinces_features[provinces_features['risk_level'] == risk_level]
        if len(data) > 0:
            # Plot ALL points with EXACTLY same styling (no difference at all)
            ax2.scatter(data['total_quakes'], data['major_quakes_m3plus'],
                       s=100, alpha=0.6, label=risk_level, 
                       color=risk_colors[risk_level],
                       edgecolor='black', linewidth=0.5)
            
            # Add province labels for clarity
            for _, row in data.iterrows():
                ax2.annotate(row['province'], (row['total_quakes'], row['major_quakes_m3plus']),
                            fontsize=7, alpha=0.6, xytext=(5, 5), textcoords='offset points')
    
    # Equal aspect ratio for balanced visualization (based on all data)
    max_val = max(provinces_features['total_quakes'].max(), provinces_features['major_quakes_m3plus'].max())
    ax2.set_xlim(0, max_val * 1.1)
    ax2.set_ylim(0, max_val * 1.1)
    
    ax2.set_xlabel('Total Earthquake Count', fontsize=11, fontweight='bold')
    ax2.set_ylabel('Major Earthquake Count (M≥3.0)', fontsize=11, fontweight='bold')
    ax2.set_title('ALL Provinces with Cluster Boundaries', fontsize=12, fontweight='bold')
    ax2.legend(loc='upper left', fontsize=9)
    ax2.grid(True, alpha=0.3)
    
    # Plot 3: Distribution histogram
    ax3 = fig.add_subplot(2, 2, 3)
    for risk_level in ['Low', 'Medium']:
        data = provinces_features[provinces_features['risk_level'] == risk_level]
        if len(data) > 0:
            ax3.hist(data['total_quakes'], bins=10, alpha=0.6, label=risk_level,
                    color=risk_colors[risk_level], edgecolor='black')
    
    ax3.set_xlabel('Total Earthquake Count', fontsize=11, fontweight='bold')
    ax3.set_ylabel('Number of Provinces', fontsize=11, fontweight='bold')
    ax3.set_title('Distribution of Total Earthquakes by Risk Level', fontsize=12, fontweight='bold')
    ax3.legend()
    ax3.grid(True, alpha=0.3, axis='y')
    
    # Plot 4: Risk Distribution
    ax4 = fig.add_subplot(2, 2, 4)
    risk_counts = provinces_features['risk_level'].value_counts()
    risk_order = ['Low', 'Medium']
    risk_counts = risk_counts.reindex(risk_order, fill_value=0)
    bars = ax4.bar(risk_order, risk_counts.values, color=[risk_colors[r] for r in risk_order], 
                   edgecolor='black', linewidth=1.5)
    
    ax4.set_ylabel('Number of Provinces', fontsize=11, fontweight='bold')
    ax4.set_title('Province Distribution by Risk Level', fontsize=12, fontweight='bold')
    ax4.grid(True, alpha=0.3, axis='y')
    
    # Add value labels on bars
    for bar in bars:
        height = bar.get_height()
        if height > 0:
            ax4.text(bar.get_x() + bar.get_width()/2., height,
                    f'{int(height)}', ha='center', va='bottom', fontsize=12, fontweight='bold')
    
    plt.tight_layout()
    
    # Save outputs
    output_dir = os.path.dirname(__file__)
    
    # Save the plot
    output_path = os.path.join(output_dir, 'province_risk_clustering_v8.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"\n✓ Clustering visualization saved to: {output_path}")
    
    # Save the model and scaler
    model_path = os.path.join(output_dir, 'province_risk_kmeans_model.joblib')
    scaler_path = os.path.join(output_dir, 'province_risk_scaler.joblib')
    cluster_mapping_path = os.path.join(output_dir, 'province_risk_cluster_mapping.joblib')
    
    joblib.dump(kmeans, model_path)
    joblib.dump(scaler, scaler_path)
    joblib.dump(cluster_to_risk, cluster_mapping_path)
    
    print(f"✓ Model saved to: {model_path}")
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
    
    plt.show()

if __name__ == "__main__":
    main()
