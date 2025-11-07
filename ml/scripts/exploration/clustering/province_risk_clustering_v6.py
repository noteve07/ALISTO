import pandas as pd
import matplotlib.pyplot as plt
import os
import glob
from tqdm import tqdm
from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler
import numpy as np
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
        
        features_list.append({
            'province': province,
            'total_quakes': total_quakes,
            'major_quakes_m3plus': major_quakes,
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
    """Map K-Means clusters to risk levels"""
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
    
    return provinces_features, risk_mapping

def main():
    print("="*70)
    print("PROVINCE RISK CLUSTERING V6 (FILTERED MODEL + OUTLIER PREDICTION)")
    print("="*70)
    print("\nClustering Features:")
    print("1. total_quakes       - How active? (quantity)")
    print("2. major_quakes_m3plus - How dangerous? (M≥3.0)")
    print("\nStrategy: Train K-Means on clean data (< 4000), predict ALL provinces")
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
        filter_threshold=4000,
        n_clusters=2
    )
    
    # Map clusters to risk levels
    provinces_features, cluster_to_risk = map_clusters_to_risk_levels(provinces_features)
    
    # Display results
    print("\n" + "="*70)
    print("RISK-BASED CLUSTERING RESULTS (V6 - WITH OUTLIER PREDICTION)")
    print("="*70)
    
    for risk_level in ['Low', 'Medium']:
        risk_data = provinces_features[provinces_features['risk_level'] == risk_level]
        if len(risk_data) > 0:
            print(f"\n{risk_level.upper()} RISK ({len(risk_data)} provinces):")
            print(f"{'Province':<30} {'Total EQ':>10} {'Major EQ':>10} {'Is Outlier':>15}")
            print("-" * 65)
            for _, row in risk_data.sort_values('total_quakes', ascending=False).iterrows():
                outlier_mark = "YES (>4000)" if row['is_outlier'] else "No"
                print(f"{row['province']:<30} {int(row['total_quakes']):>10} {int(row['major_quakes_m3plus']):>10} {outlier_mark:>15}")
    
    # Create visualizations
    fig = plt.figure(figsize=(16, 12))
    
    # Color mapping
    risk_colors = {'Low': '#2ecc71', 'Medium': '#f39c12'}
    
    # Plot 1: Total Quakes vs Major Quakes (FILTERED DATA ONLY - no outliers)
    ax1 = fig.add_subplot(2, 2, 1)
    filtered_data = provinces_features[provinces_features['total_quakes'] < 4000]
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
    ax1.set_title('K-Means Training Data (< 4000 quakes only)', fontsize=11, fontweight='bold')
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    
    # Plot 2: Total Quakes vs Major Quakes (with labels, showing which are outliers)
    ax2 = fig.add_subplot(2, 2, 2)
    for risk_level in ['Low', 'Medium']:
        data = provinces_features[provinces_features['risk_level'] == risk_level]
        if len(data) > 0:
            # Separate outliers and normal points
            outliers = data[data['is_outlier']]
            normal = data[~data['is_outlier']]
            
            # Plot normal points
            if len(normal) > 0:
                ax2.scatter(normal['total_quakes'], normal['major_quakes_m3plus'],
                           s=100, alpha=0.6, label=f'{risk_level} (< 4000)', 
                           color=risk_colors[risk_level],
                           edgecolor='black', linewidth=0.5)
            
            # Plot outliers with solid circle (lighter orange, dark gray border)
            if len(outliers) > 0:
                ax2.scatter(outliers['total_quakes'], outliers['major_quakes_m3plus'],
                           s=120, alpha=0.7, label=f'{risk_level} outlier (≥ 4000)', 
                           color='#fcc876', 
                           edgecolor='#555555', linewidth=1.5)
            
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
    ax2.set_title('ALL Provinces (orange dashed = outliers ≥ 4000)', fontsize=12, fontweight='bold')
    ax2.legend()
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
    
    # Save the plot
    output_path = os.path.join(os.path.dirname(__file__), 'province_risk_clustering_v6.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"\n✓ Clustering visualization saved to: {output_path}")
    
    plt.show()

if __name__ == "__main__":
    main()
