import pandas as pd
import matplotlib.pyplot as plt
import os
import glob
from tqdm import tqdm
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import numpy as np

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

def main():
    print("="*60)
    print("EARTHQUAKE CLUSTERING BY PROVINCE COUNT")
    print("="*60)
    
    # Load raw earthquake data
    df = load_all_raw_earthquake_data()
    
    # Extract province from location
    print("\nExtracting province information...")
    df['province'] = df['location'].apply(extract_province_from_location)
    
    # Remove rows without province
    df = df[df['province'].notna()]
    print(f"Records with valid province: {len(df):,}")
    
    # Group by province and count earthquakes
    grouped = df.groupby('province').size().reset_index(name='earthquake_count')
    grouped = grouped.sort_values('earthquake_count', ascending=False)
    
    print(f"\nNumber of provinces: {len(grouped)}")
    
    # Use percentile-based clustering (balanced 50-50 distribution)
    # Split at 50th percentile (median) for balanced clusters
    threshold = grouped['earthquake_count'].quantile(0.5)
    grouped['cluster'] = (grouped['earthquake_count'] > threshold).astype(int)
    
    print(f"\nCluster threshold (50th percentile/median): {threshold:.0f} earthquakes")
    
    # Analyze clusters
    print(f"\n{'='*60}")
    print(f"PERCENTILE-BASED CLUSTERING (50th percentile/median threshold)")
    print(f"{'='*60}")
    
    optimal_k = 2
    for cluster in range(optimal_k):
        cluster_data = grouped[grouped['cluster'] == cluster]
        print(f"\nCluster {cluster}:")
        print(f"  Number of provinces: {len(cluster_data)}")
        print(f"  Earthquake count range: {cluster_data['earthquake_count'].min():.0f} - {cluster_data['earthquake_count'].max():.0f}")
        print(f"  Average count: {cluster_data['earthquake_count'].mean():.0f}")
        print(f"  Provinces:")
        for _, row in cluster_data.sort_values('earthquake_count', ascending=False).iterrows():
            print(f"    {row['province']:<30} {row['earthquake_count']:7,.0f}")
    
    # Create visualizations
    fig, axes = plt.subplots(1, 2, figsize=(16, 8))
    
    # Plot 1: Bar chart with cluster colors
    cluster_colors = ['#2ecc71', '#e74c3c']  # Green, Red
    colors = [cluster_colors[c] for c in grouped['cluster']]
    
    ax1 = axes[0]
    bars = ax1.barh(range(len(grouped)), grouped['earthquake_count'].values, 
                    color=colors, edgecolor='black', linewidth=0.5)
    ax1.set_yticks(range(len(grouped)))
    ax1.set_yticklabels(grouped['province'].values, fontsize=8)
    ax1.set_xlabel('Total Earthquake Count (2018+)', fontsize=11, fontweight='bold')
    ax1.set_title('Province Earthquake Count with K-Means Clusters', fontsize=12, fontweight='bold')
    ax1.grid(True, alpha=0.3, axis='x')
    
    # Add value labels
    for i, (idx, row) in enumerate(grouped.iterrows()):
        ax1.text(row['earthquake_count'], i, f"  {int(row['earthquake_count']):,}", 
                va='center', fontsize=7)
    
    # Plot 2: Scatter plot (1D with jitter)
    ax2 = axes[1]
    for cluster in range(optimal_k):
        cluster_data = grouped[grouped['cluster'] == cluster]
        # Add jitter for visibility
        y_jitter = np.random.normal(cluster, 0.04, size=len(cluster_data))
        ax2.scatter(cluster_data['earthquake_count'], y_jitter, 
                   s=100, alpha=0.6, color=cluster_colors[cluster], 
                   edgecolor='black', linewidth=0.5, label=f'Cluster {cluster}')
        
        # Add province labels
        for _, row in cluster_data.iterrows():
            ax2.text(row['earthquake_count'], cluster + 0.15, row['province'], 
                    fontsize=7, alpha=0.7, ha='center')
    
    ax2.set_xlabel('Total Earthquake Count (2018+)', fontsize=11, fontweight='bold')
    ax2.set_ylabel('Cluster', fontsize=11, fontweight='bold')
    ax2.set_yticks(range(optimal_k))
    ax2.set_yticklabels([f'Cluster {i}' for i in range(optimal_k)])
    ax2.set_title('Earthquake Count Distribution by Cluster', fontsize=12, fontweight='bold')
    ax2.grid(True, alpha=0.3, axis='x')
    ax2.legend()
    
    plt.tight_layout()
    
    # Save the plot
    output_path = os.path.join(os.path.dirname(__file__), 'province_earthquake_clustering.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"\n✓ Clustering visualization saved to: {output_path}")
    
    plt.show()

if __name__ == "__main__":
    main()
