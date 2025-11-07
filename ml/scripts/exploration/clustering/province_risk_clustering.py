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
    """Extract multiple features per province for clustering"""
    print("\nExtracting multi-dimensional features by province...")
    
    features_list = []
    
    for province in tqdm(df['province'].unique()):
        province_data = df[df['province'] == province]
        
        # Calculate features
        total_quakes = len(province_data)
        major_quakes = len(province_data[province_data['magnitude'] >= 4.0])
        avg_magnitude = province_data['magnitude'].mean()
        max_magnitude = province_data['magnitude'].max()
        min_magnitude = province_data['magnitude'].min()
        std_magnitude = province_data['magnitude'].std()
        
        # Convert date_time to datetime
        province_data['date_parsed'] = pd.to_datetime(province_data['date_time'], format='%d %B %Y - %I:%M %p', errors='coerce')
        
        # Calculate swarm frequency (earthquakes within 7 days)
        swarm_count = 0
        for idx, row in province_data.iterrows():
            time_window = province_data[
                (province_data['date_parsed'] >= row['date_parsed']) &
                (province_data['date_parsed'] <= row['date_parsed'] + pd.Timedelta(days=7))
            ]
            if len(time_window) >= 3:  # Swarm = 3+ earthquakes in 7 days
                swarm_count += 1
        
        swarm_frequency = swarm_count / max(total_quakes, 1)
        
        # Calculate seasonal variation (coefficient of variation by month)
        province_data['month'] = province_data['date_parsed'].dt.month
        monthly_counts = province_data.groupby('month').size()
        seasonal_variation = monthly_counts.std() / max(monthly_counts.mean(), 1) if len(monthly_counts) > 1 else 0
        
        features_list.append({
            'province': province,
            'total_quakes': total_quakes,
            'major_quakes_count': major_quakes,
            'avg_magnitude': avg_magnitude if not np.isnan(avg_magnitude) else 0,
            'max_magnitude': max_magnitude if not np.isnan(max_magnitude) else 0,
            'min_magnitude': min_magnitude if not np.isnan(min_magnitude) else 0,
            'std_magnitude': std_magnitude if not np.isnan(std_magnitude) else 0,
            'swarm_frequency': swarm_frequency if not np.isnan(swarm_frequency) else 0,
            'seasonal_variation': seasonal_variation if not np.isnan(seasonal_variation) else 0
        })
    
    return pd.DataFrame(features_list)

def cluster_base_risk(provinces_features, n_clusters=3):
    """Cluster provinces based on multi-dimensional risk features"""
    print("\nClustering provinces based on risk features...")
    
    # Select features for clustering
    features = ['total_quakes', 'major_quakes_count', 'avg_magnitude', 
                'max_magnitude', 'std_magnitude', 'swarm_frequency', 'seasonal_variation']
    
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
    
    cluster_stats = provinces_features.groupby('risk_cluster')[['total_quakes', 'major_quakes_count', 'avg_magnitude']].mean()
    print("\nCluster Statistics:")
    print(cluster_stats)
    
    # Sort clusters by risk (higher values = higher risk)
    cluster_risk_score = (
        cluster_stats['total_quakes'].rank() +
        cluster_stats['major_quakes_count'].rank() +
        cluster_stats['avg_magnitude'].rank()
    )
    
    # Map to risk levels
    cluster_to_risk = {}
    risk_labels = ['Low', 'Medium', 'High']
    for risk_idx, (cluster_id, _) in enumerate(sorted(enumerate(cluster_risk_score), key=lambda x: x[1])):
        cluster_to_risk[cluster_id] = risk_labels[risk_idx]
    
    provinces_features['risk_level'] = provinces_features['risk_cluster'].map(cluster_to_risk)
    
    return provinces_features, cluster_to_risk

def main():
    print("="*70)
    print("MULTI-DIMENSIONAL EARTHQUAKE CLUSTERING FOR RISK ASSESSMENT")
    print("="*70)
    
    # Load raw earthquake data
    df = load_all_raw_earthquake_data()
    
    # Extract province from location
    print("\nExtracting province information...")
    df['province'] = df['location'].apply(extract_province_from_location)
    
    # Remove rows without province
    df = df[df['province'].notna()]
    print(f"Records with valid province: {len(df):,}")
    
    # Extract multi-dimensional features
    provinces_features = extract_features_by_province(df)
    
    print(f"\nNumber of provinces: {len(provinces_features)}")
    print("\nProvince Features Summary:")
    print(provinces_features.describe())
    
    # Cluster based on risk
    provinces_features, kmeans, scaler = cluster_base_risk(provinces_features, n_clusters=2)
    
    # Rename clusters to Low and Medium (instead of Low and High)
    risk_mapping = {0: 'Low', 1: 'Medium'}
    provinces_features['risk_cluster_label'] = provinces_features['risk_cluster'].map(risk_mapping)
    
    # Map clusters to risk levels
    provinces_features, cluster_to_risk = map_clusters_to_risk_levels(provinces_features)
    
    # Display results
    print("\n" + "="*70)
    print("RISK-BASED CLUSTERING RESULTS")
    print("="*70)
    
    for risk_level in ['Low', 'Medium']:
        risk_data = provinces_features[provinces_features['risk_level'] == risk_level]
        print(f"\n{risk_level.upper()} RISK ({len(risk_data)} provinces):")
        print(f"{'Province':<30} {'Total EQ':>10} {'Major EQ':>10} {'Avg Mag':>10} {'Max Mag':>10} {'Swarms':>10}")
        print("-" * 90)
        for _, row in risk_data.sort_values('total_quakes', ascending=False).iterrows():
            print(f"{row['province']:<30} {int(row['total_quakes']):>10} {int(row['major_quakes_count']):>10} "
                  f"{row['avg_magnitude']:>10.2f} {row['max_magnitude']:>10.2f} {row['swarm_frequency']:>10.2f}")
    
    # Create visualizations
    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    
    # Color mapping
    risk_colors = {'Low': '#2ecc71', 'Medium': '#f39c12'}
    colors = [risk_colors[level] for level in provinces_features['risk_level']]
    
    # Plot 1: Total Quakes vs Major Quakes (colored by risk)
    ax1 = axes[0, 0]
    for risk_level in ['Low', 'Medium']:
        data = provinces_features[provinces_features['risk_level'] == risk_level]
        ax1.scatter(data['total_quakes'], data['major_quakes_count'], 
                   s=100, alpha=0.6, label=risk_level, color=risk_colors[risk_level],
                   edgecolor='black', linewidth=0.5)
    
    ax1.set_xlabel('Total Earthquake Count', fontsize=11, fontweight='bold')
    ax1.set_ylabel('Major Earthquake Count (M≥4.0)', fontsize=11, fontweight='bold')
    ax1.set_title('Total Earthquakes vs Major Earthquakes by Risk', fontsize=12, fontweight='bold')
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    
    # Plot 2: Magnitude vs Swarm Frequency
    ax2 = axes[0, 1]
    for risk_level in ['Low', 'Medium']:
        data = provinces_features[provinces_features['risk_level'] == risk_level]
        ax2.scatter(data['avg_magnitude'], data['swarm_frequency'], 
                   s=100, alpha=0.6, label=risk_level, color=risk_colors[risk_level],
                   edgecolor='black', linewidth=0.5)
    
    ax2.set_xlabel('Average Magnitude', fontsize=11, fontweight='bold')
    ax2.set_ylabel('Swarm Frequency', fontsize=11, fontweight='bold')
    ax2.set_title('Average Magnitude vs Swarm Frequency by Risk', fontsize=12, fontweight='bold')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    # Plot 3: Risk Distribution
    ax3 = axes[1, 0]
    risk_counts = provinces_features['risk_level'].value_counts()
    risk_order = ['Low', 'Medium']
    risk_counts = risk_counts.reindex(risk_order)
    bars = ax3.bar(risk_order, risk_counts.values, color=[risk_colors[r] for r in risk_order], edgecolor='black', linewidth=1.5)
    
    ax3.set_ylabel('Number of Provinces', fontsize=11, fontweight='bold')
    ax3.set_title('Province Distribution by Risk Level', fontsize=12, fontweight='bold')
    ax3.grid(True, alpha=0.3, axis='y')
    
    # Add value labels on bars
    for bar in bars:
        height = bar.get_height()
        ax3.text(bar.get_x() + bar.get_width()/2., height,
                f'{int(height)}', ha='center', va='bottom', fontsize=11, fontweight='bold')
    
    # Plot 4: Province list by risk level
    ax4 = axes[1, 1]
    ax4.axis('off')
    
    y_pos = 0.95
    for risk_level in ['Medium', 'Low']:
        data = provinces_features[provinces_features['risk_level'] == risk_level].sort_values('total_quakes', ascending=False)
        ax4.text(0.05, y_pos, f"{risk_level.upper()} RISK ({len(data)} provinces):", 
                fontsize=10, fontweight='bold', color=risk_colors[risk_level],
                transform=ax4.transAxes)
        y_pos -= 0.04
        
        for _, row in data.head(5).iterrows():
            province_text = f"  • {row['province']:<25} ({int(row['total_quakes'])} earthquakes)"
            ax4.text(0.05, y_pos, province_text, fontsize=8, transform=ax4.transAxes)
            y_pos -= 0.03
        
        y_pos -= 0.02
    
    plt.tight_layout()
    
    # Save the plot
    output_path = os.path.join(os.path.dirname(__file__), 'province_risk_clustering.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"\n✓ Clustering visualization saved to: {output_path}")
    
    plt.show()

if __name__ == "__main__":
    main()
