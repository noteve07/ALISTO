import pandas as pd
import matplotlib.pyplot as plt
import os
import glob
from tqdm import tqdm
from sklearn.cluster import KMeans
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
    """Extract better features per province for clustering"""
    print("\nExtracting features by province...")
    
    features_list = []
    
    for province in tqdm(df['province'].unique()):
        province_data = df[df['province'] == province]
        
        # Core risk indicators
        total_quakes = len(province_data)
        major_quakes = len(province_data[province_data['magnitude'] >= 4.0])
        avg_magnitude = province_data['magnitude'].mean()
        max_magnitude = province_data['magnitude'].max()
        std_magnitude = province_data['magnitude'].std()
        
        # Magnitude distribution ratios
        m2_plus = len(province_data[province_data['magnitude'] >= 2.0])
        m3_plus = len(province_data[province_data['magnitude'] >= 3.0])
        m4_plus = len(province_data[province_data['magnitude'] >= 4.0])
        
        # High-magnitude percentage (% of earthquakes >= 3.0)
        high_mag_percentage = (m3_plus / max(total_quakes, 1)) * 100
        
        # Parse dates for temporal analysis
        province_data['date_parsed'] = pd.to_datetime(province_data['date_time'], format='%d %B %Y - %I:%M %p', errors='coerce')
        
        # Activity rate (earthquakes per month)
        date_range = (province_data['date_parsed'].max() - province_data['date_parsed'].min()).days
        activity_rate = (total_quakes / max(date_range, 1)) * 30  # EQs per month
        
        # Magnitude variability (std deviation indicates consistency of quakes)
        magnitude_variability = std_magnitude if not np.isnan(std_magnitude) else 0
        
        # Recent activity (last 30 days)
        recent_cutoff = province_data['date_parsed'].max() - pd.Timedelta(days=30)
        recent_quakes = len(province_data[province_data['date_parsed'] >= recent_cutoff])
        
        # Depth analysis (shallow earthquakes are more dangerous)
        avg_depth = province_data['depth'].mean()
        shallow_quakes = len(province_data[province_data['depth'] < 50])
        shallow_ratio = shallow_quakes / max(total_quakes, 1)
        
        features_list.append({
            'province': province,
            'total_quakes': total_quakes,
            'major_quakes': major_quakes,
            'avg_magnitude': avg_magnitude if not np.isnan(avg_magnitude) else 0,
            'max_magnitude': max_magnitude if not np.isnan(max_magnitude) else 0,
            'magnitude_variability': magnitude_variability,
            'high_mag_percentage': high_mag_percentage,
            'activity_rate': activity_rate,
            'recent_activity': recent_quakes,
            'avg_depth': avg_depth if not np.isnan(avg_depth) else 0,
            'shallow_ratio': shallow_ratio,
        })
    
    return pd.DataFrame(features_list)

def cluster_base_risk(provinces_features, n_clusters=2):
    """Cluster provinces based on multi-dimensional risk features"""
    print("\nClustering provinces based on risk features...")
    
    # Select better features for clustering (removed swarm_frequency)
    features = [
        'total_quakes', 
        'major_quakes', 
        'avg_magnitude', 
        'max_magnitude',
        'magnitude_variability',
        'high_mag_percentage',
        'activity_rate',
        'recent_activity',
        'shallow_ratio'
    ]
    
    X = provinces_features[features].fillna(0)
    
    # Standardize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Apply K-Means clustering
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    clusters = kmeans.fit_predict(X_scaled)
    
    provinces_features['risk_cluster'] = clusters
    
    return provinces_features, kmeans, scaler

def map_clusters_to_risk_levels(provinces_features):
    """Map clusters to risk levels based on feature averages"""
    print("\nMapping clusters to risk levels...")
    
    cluster_stats = provinces_features.groupby('risk_cluster')[['total_quakes', 'major_quakes', 'avg_magnitude']].mean()
    print("\nCluster Statistics:")
    print(cluster_stats)
    
    # Sort clusters by risk (higher values = higher risk)
    cluster_risk_score = (
        cluster_stats['total_quakes'].rank() +
        cluster_stats['major_quakes'].rank() +
        cluster_stats['avg_magnitude'].rank()
    )
    
    # Map to risk levels
    cluster_to_risk = {}
    risk_labels = ['Low', 'Medium']
    for risk_idx, (cluster_id, _) in enumerate(sorted(enumerate(cluster_risk_score), key=lambda x: x[1])):
        cluster_to_risk[cluster_id] = risk_labels[risk_idx]
    
    provinces_features['risk_level'] = provinces_features['risk_cluster'].map(cluster_to_risk)
    
    return provinces_features, cluster_to_risk

def main():
    print("="*70)
    print("PROVINCE RISK CLUSTERING V2 (IMPROVED FEATURES)")
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
    
    # Cluster based on risk
    provinces_features, kmeans, scaler = cluster_base_risk(provinces_features, n_clusters=2)
    
    # Map clusters to risk levels
    provinces_features, cluster_to_risk = map_clusters_to_risk_levels(provinces_features)
    
    # Display results
    print("\n" + "="*70)
    print("RISK-BASED CLUSTERING RESULTS (V2)")
    print("="*70)
    
    for risk_level in ['Low', 'Medium']:
        risk_data = provinces_features[provinces_features['risk_level'] == risk_level]
        print(f"\n{risk_level.upper()} RISK ({len(risk_data)} provinces):")
        print(f"{'Province':<30} {'Total EQ':>10} {'Major EQ':>10} {'Avg Mag':>10} {'Activity':>10}")
        print("-" * 70)
        for _, row in risk_data.sort_values('total_quakes', ascending=False).iterrows():
            print(f"{row['province']:<30} {int(row['total_quakes']):>10} {int(row['major_quakes']):>10} "
                  f"{row['avg_magnitude']:>10.2f} {row['activity_rate']:>10.2f}")
    
    # Create visualizations
    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    
    # Color mapping
    risk_colors = {'Low': '#2ecc71', 'Medium': '#f39c12'}
    
    # Plot 1: Total Quakes vs Major Quakes (colored by risk)
    ax1 = axes[0, 0]
    for risk_level in ['Low', 'Medium']:
        data = provinces_features[provinces_features['risk_level'] == risk_level]
        ax1.scatter(data['total_quakes'], data['major_quakes'], 
                   s=100, alpha=0.6, label=risk_level, color=risk_colors[risk_level],
                   edgecolor='black', linewidth=0.5)
    
    ax1.set_xlabel('Total Earthquake Count', fontsize=11, fontweight='bold')
    ax1.set_ylabel('Major Earthquake Count (M≥4.0)', fontsize=11, fontweight='bold')
    ax1.set_title('Total Earthquakes vs Major Earthquakes by Risk', fontsize=12, fontweight='bold')
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    
    # Plot 2: Average Magnitude vs Activity Rate
    ax2 = axes[0, 1]
    for risk_level in ['Low', 'Medium']:
        data = provinces_features[provinces_features['risk_level'] == risk_level]
        ax2.scatter(data['avg_magnitude'], data['activity_rate'], 
                   s=100, alpha=0.6, label=risk_level, color=risk_colors[risk_level],
                   edgecolor='black', linewidth=0.5)
    
    ax2.set_xlabel('Average Magnitude', fontsize=11, fontweight='bold')
    ax2.set_ylabel('Activity Rate (EQs/month)', fontsize=11, fontweight='bold')
    ax2.set_title('Average Magnitude vs Activity Rate by Risk', fontsize=12, fontweight='bold')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    # Plot 3: Risk Distribution
    ax3 = axes[1, 0]
    risk_counts = provinces_features['risk_level'].value_counts()
    risk_order = ['Low', 'Medium']
    risk_counts = risk_counts.reindex(risk_order)
    bars = ax3.bar(risk_order, risk_counts.values, color=[risk_colors[r] for r in risk_order], 
                   edgecolor='black', linewidth=1.5)
    
    ax3.set_ylabel('Number of Provinces', fontsize=11, fontweight='bold')
    ax3.set_title('Province Distribution by Risk Level', fontsize=12, fontweight='bold')
    ax3.grid(True, alpha=0.3, axis='y')
    
    # Add value labels on bars
    for bar in bars:
        height = bar.get_height()
        ax3.text(bar.get_x() + bar.get_width()/2., height,
                f'{int(height)}', ha='center', va='bottom', fontsize=11, fontweight='bold')
    
    # Plot 4: Magnitude Variability vs Recent Activity
    ax4 = axes[1, 1]
    for risk_level in ['Low', 'Medium']:
        data = provinces_features[provinces_features['risk_level'] == risk_level]
        ax4.scatter(data['magnitude_variability'], data['recent_activity'], 
                   s=100, alpha=0.6, label=risk_level, color=risk_colors[risk_level],
                   edgecolor='black', linewidth=0.5)
    
    ax4.set_xlabel('Magnitude Variability (Std Dev)', fontsize=11, fontweight='bold')
    ax4.set_ylabel('Recent Activity (Last 30 days)', fontsize=11, fontweight='bold')
    ax4.set_title('Magnitude Variability vs Recent Activity by Risk', fontsize=12, fontweight='bold')
    ax4.legend()
    ax4.grid(True, alpha=0.3)
    
    plt.tight_layout()
    
    # Save the plot
    output_path = os.path.join(os.path.dirname(__file__), 'province_risk_clustering_v2.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"\n✓ Clustering visualization saved to: {output_path}")
    
    plt.show()

if __name__ == "__main__":
    main()
