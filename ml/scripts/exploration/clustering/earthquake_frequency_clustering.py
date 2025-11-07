import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import os
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

def load_earthquake_data(csv_path):
    """Load the earthquake dataset"""
    print("Loading earthquake data...")
    df = pd.read_csv(csv_path)
    
    # Convert date column to datetime
    df['date'] = pd.to_datetime(df['date'])
    df['year'] = df['date'].dt.year
    df['month'] = df['date'].dt.month
    df['day_of_year'] = df['date'].dt.dayofyear
    
    print(f"Dataset shape: {df.shape}")
    print(f"Date range: {df['date'].min()} to {df['date'].max()}")
    print(f"Provinces: {df['province'].nunique()}")
    
    return df

def explore_earthquake_frequency_patterns(df):
    """Explore earthquake frequency patterns for clustering"""
    
    print("\n" + "="*60)
    print("EARTHQUAKE FREQUENCY EXPLORATION & CLUSTERING")
    print("="*60)
    
    # 1. Province-level frequency analysis
    print("\n1. PROVINCE-LEVEL FREQUENCY ANALYSIS")
    print("-" * 40)
    
    province_stats = df.groupby('province').agg({
        'eq_count_last_30d': ['mean', 'std', 'max', 'min'],
        'max_magnitude_last_30d': ['mean', 'max'],
        'label_eq_count_next_7d': 'mean',
        'label_has_major_eq': 'mean'
    }).round(3)
    
    # Flatten column names
    province_stats.columns = ['_'.join(col).strip() for col in province_stats.columns]
    province_stats = province_stats.reset_index()
    
    print(f"Top 10 most earthquake-active provinces (by average 30-day count):")
    top_provinces = province_stats.nlargest(10, 'eq_count_last_30d_mean')
    for _, row in top_provinces.iterrows():
        print(f"  {row['province']:<25} Avg: {row['eq_count_last_30d_mean']:6.2f}  Max: {row['eq_count_last_30d_max']:6.0f}")
    
    return province_stats

def create_frequency_visualizations(df):
    """Create various frequency visualizations"""
    
    print("\n2. FREQUENCY DISTRIBUTION VISUALIZATIONS")
    print("-" * 40)
    
    # Set up the plotting style
    plt.style.use('default')
    fig = plt.figure(figsize=(20, 15))
    
    # 1. Earthquake frequency distribution
    plt.subplot(3, 3, 1)
    plt.hist(df['eq_count_last_30d'], bins=50, alpha=0.7, color='steelblue', edgecolor='black')
    plt.xlabel('Earthquake Count (Last 30 Days)')
    plt.ylabel('Frequency')
    plt.title('Distribution of 30-Day Earthquake Counts')
    plt.grid(True, alpha=0.3)
    
    # 2. Magnitude vs Frequency scatter
    plt.subplot(3, 3, 2)
    plt.scatter(df['eq_count_last_30d'], df['max_magnitude_last_30d'], 
                alpha=0.6, s=10, c='red')
    plt.xlabel('Earthquake Count (Last 30 Days)')
    plt.ylabel('Max Magnitude (Last 30 Days)')
    plt.title('Earthquake Count vs Max Magnitude')
    plt.grid(True, alpha=0.3)
    
    # 3. Risk level distribution
    plt.subplot(3, 3, 3)
    risk_counts = df['label_risk_level_v2'].value_counts()
    plt.pie(risk_counts.values, labels=risk_counts.index, autopct='%1.1f%%', 
            colors=['lightgreen', 'orange', 'red'])
    plt.title('Risk Level Distribution (V2)')
    
    # 4. Frequency by province (top 20)
    plt.subplot(3, 3, 4)
    province_freq = df.groupby('province')['eq_count_last_30d'].mean().nlargest(20)
    plt.barh(range(len(province_freq)), province_freq.values)
    plt.yticks(range(len(province_freq)), province_freq.index, fontsize=8)
    plt.xlabel('Average 30-Day Earthquake Count')
    plt.title('Top 20 Provinces by Earthquake Frequency')
    plt.grid(True, alpha=0.3, axis='x')
    
    # 5. Temporal patterns - Monthly
    plt.subplot(3, 3, 5)
    monthly_freq = df.groupby('month')['eq_count_last_30d'].mean()
    plt.plot(monthly_freq.index, monthly_freq.values, marker='o', linewidth=2, markersize=6)
    plt.xlabel('Month')
    plt.ylabel('Average 30-Day Count')
    plt.title('Seasonal Earthquake Frequency Pattern')
    plt.xticks(range(1, 13))
    plt.grid(True, alpha=0.3)
    
    # 6. Temporal patterns - Yearly
    plt.subplot(3, 3, 6)
    yearly_freq = df.groupby('year')['eq_count_last_30d'].mean()
    plt.plot(yearly_freq.index, yearly_freq.values, marker='o', linewidth=2, markersize=6)
    plt.xlabel('Year')
    plt.ylabel('Average 30-Day Count')
    plt.title('Annual Earthquake Frequency Trend')
    plt.xticks(rotation=45)
    plt.grid(True, alpha=0.3)
    
    # 7. Frequency vs Depth relationship
    plt.subplot(3, 3, 7)
    plt.scatter(df['eq_count_last_30d'], df['avg_depth_last_30d'], 
                alpha=0.6, s=10, c='purple')
    plt.xlabel('Earthquake Count (Last 30 Days)')
    plt.ylabel('Average Depth (Last 30 Days)')
    plt.title('Earthquake Count vs Average Depth')
    plt.grid(True, alpha=0.3)
    
    # 8. Box plot of frequency by risk level
    plt.subplot(3, 3, 8)
    df.boxplot(column='eq_count_last_30d', by='label_risk_level_v2', ax=plt.gca())
    plt.xlabel('Risk Level V2')
    plt.ylabel('30-Day Earthquake Count')
    plt.title('Earthquake Frequency by Risk Level')
    plt.suptitle('')  # Remove automatic title
    
    # 9. Heatmap of frequency by province and month (top 15 provinces)
    plt.subplot(3, 3, 9)
    top_15_provinces = df.groupby('province')['eq_count_last_30d'].mean().nlargest(15).index
    heatmap_data = df[df['province'].isin(top_15_provinces)].pivot_table(
        index='province', columns='month', values='eq_count_last_30d', aggfunc='mean'
    )
    sns.heatmap(heatmap_data, cmap='YlOrRd', cbar_kws={'label': 'Avg 30-Day Count'})
    plt.title('Earthquake Frequency Heatmap\n(Top 15 Provinces by Month)')
    plt.xlabel('Month')
    plt.ylabel('Province')
    
    plt.tight_layout()
    
    # Save the visualization
    script_dir = os.path.dirname(__file__)
    output_path = os.path.join(script_dir, 'earthquake_frequency_exploration.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"✓ Visualizations saved to: {output_path}")
    
    plt.show()

def perform_clustering_analysis(df):
    """Perform clustering analysis on earthquake frequency patterns"""
    
    print("\n3. CLUSTERING ANALYSIS")
    print("-" * 40)
    
    # Prepare features for clustering
    clustering_features = [
        'eq_count_last_30d', 'max_magnitude_last_30d', 'avg_magnitude_last_30d',
        'std_magnitude_last_30d', 'avg_depth_last_30d', 'days_since_last_eq',
        'eq_count_last_7d', 'eq_count_last_14d'
    ]
    
    # Remove rows with NaN values and create feature matrix
    cluster_data = df[clustering_features].fillna(0)
    
    # Standardize features
    scaler = StandardScaler()
    cluster_data_scaled = scaler.fit_transform(cluster_data)
    
    print(f"Clustering on {len(clustering_features)} features with {len(cluster_data)} samples")
    
    # K-Means Clustering
    print("\nK-Means Clustering:")
    inertias = []
    k_range = range(2, 11)
    
    for k in k_range:
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        kmeans.fit(cluster_data_scaled)
        inertias.append(kmeans.inertia_)
    
    # Find optimal K using elbow method
    optimal_k = 5  # You can adjust this based on the elbow curve
    
    # Final K-Means with optimal K
    kmeans_final = KMeans(n_clusters=optimal_k, random_state=42, n_init=10)
    df['kmeans_cluster'] = kmeans_final.fit_predict(cluster_data_scaled)
    
    print(f"K-Means with K={optimal_k} clusters:")
    cluster_summary = df.groupby('kmeans_cluster').agg({
        'eq_count_last_30d': ['count', 'mean', 'std'],
        'max_magnitude_last_30d': 'mean',
        'label_risk_level_v2': lambda x: x.value_counts().index[0],  # Most common risk level
        'label_has_major_eq': 'mean'
    }).round(3)
    
    for cluster in range(optimal_k):
        cluster_info = cluster_summary.loc[cluster]
        print(f"  Cluster {cluster}: {cluster_info[('eq_count_last_30d', 'count')]:6.0f} samples, "
              f"Avg EQ: {cluster_info[('eq_count_last_30d', 'mean')]:6.2f}, "
              f"Avg Mag: {cluster_info[('max_magnitude_last_30d', 'mean')]:5.2f}, "
              f"Risk: {cluster_info[('label_risk_level_v2', '<lambda>')]}")
    
    # DBSCAN Clustering
    print("\nDBSCAN Clustering:")
    dbscan = DBSCAN(eps=0.5, min_samples=50)
    df['dbscan_cluster'] = dbscan.fit_predict(cluster_data_scaled)
    
    n_clusters_dbscan = len(set(df['dbscan_cluster'])) - (1 if -1 in df['dbscan_cluster'] else 0)
    n_noise = list(df['dbscan_cluster']).count(-1)
    
    print(f"DBSCAN found {n_clusters_dbscan} clusters and {n_noise} noise points")
    
    if n_clusters_dbscan > 0:
        dbscan_summary = df[df['dbscan_cluster'] != -1].groupby('dbscan_cluster').agg({
            'eq_count_last_30d': ['count', 'mean'],
            'max_magnitude_last_30d': 'mean',
            'label_risk_level_v2': lambda x: x.value_counts().index[0]
        }).round(3)
        
        for cluster in dbscan_summary.index:
            cluster_info = dbscan_summary.loc[cluster]
            print(f"  Cluster {cluster}: {cluster_info[('eq_count_last_30d', 'count')]:6.0f} samples, "
                  f"Avg EQ: {cluster_info[('eq_count_last_30d', 'mean')]:6.2f}, "
                  f"Avg Mag: {cluster_info[('max_magnitude_last_30d', 'mean')]:5.2f}, "
                  f"Risk: {cluster_info[('label_risk_level_v2', '<lambda>')]}")
    
    return df

def create_cluster_visualizations(df):
    """Create visualizations for clustering results"""
    
    print("\n4. CLUSTER VISUALIZATIONS")
    print("-" * 40)
    
    # Create cluster visualization plots
    fig, axes = plt.subplots(2, 2, figsize=(15, 12))
    
    # 1. K-Means clusters in 2D (PCA)
    clustering_features = [
        'eq_count_last_30d', 'max_magnitude_last_30d', 'avg_magnitude_last_30d',
        'std_magnitude_last_30d', 'avg_depth_last_30d', 'days_since_last_eq',
        'eq_count_last_7d', 'eq_count_last_14d'
    ]
    
    cluster_data = df[clustering_features].fillna(0)
    scaler = StandardScaler()
    cluster_data_scaled = scaler.fit_transform(cluster_data)
    
    # PCA for visualization
    pca = PCA(n_components=2)
    cluster_data_pca = pca.fit_transform(cluster_data_scaled)
    
    # Plot K-Means clusters
    ax1 = axes[0, 0]
    scatter = ax1.scatter(cluster_data_pca[:, 0], cluster_data_pca[:, 1], 
                         c=df['kmeans_cluster'], cmap='viridis', alpha=0.6, s=10)
    ax1.set_xlabel(f'PC1 ({pca.explained_variance_ratio_[0]:.1%} variance)')
    ax1.set_ylabel(f'PC2 ({pca.explained_variance_ratio_[1]:.1%} variance)')
    ax1.set_title('K-Means Clusters (PCA Projection)')
    plt.colorbar(scatter, ax=ax1)
    
    # 2. Frequency distribution by cluster
    ax2 = axes[0, 1]
    for cluster in sorted(df['kmeans_cluster'].unique()):
        cluster_data_subset = df[df['kmeans_cluster'] == cluster]['eq_count_last_30d']
        ax2.hist(cluster_data_subset, bins=30, alpha=0.7, label=f'Cluster {cluster}')
    ax2.set_xlabel('30-Day Earthquake Count')
    ax2.set_ylabel('Frequency')
    ax2.set_title('Earthquake Frequency Distribution by Cluster')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    # 3. Risk level distribution by cluster
    ax3 = axes[1, 0]
    cluster_risk = pd.crosstab(df['kmeans_cluster'], df['label_risk_level_v2'], normalize='index') * 100
    cluster_risk.plot(kind='bar', ax=ax3, color=['lightgreen', 'orange', 'red'])
    ax3.set_xlabel('K-Means Cluster')
    ax3.set_ylabel('Percentage')
    ax3.set_title('Risk Level Distribution by Cluster')
    ax3.legend(title='Risk Level V2')
    ax3.grid(True, alpha=0.3, axis='y')
    
    # 4. Magnitude vs Frequency colored by cluster
    ax4 = axes[1, 1]
    scatter2 = ax4.scatter(df['eq_count_last_30d'], df['max_magnitude_last_30d'], 
                          c=df['kmeans_cluster'], cmap='viridis', alpha=0.6, s=10)
    ax4.set_xlabel('30-Day Earthquake Count')
    ax4.set_ylabel('Max Magnitude (Last 30 Days)')
    ax4.set_title('Earthquake Count vs Magnitude (Colored by Cluster)')
    plt.colorbar(scatter2, ax=ax4)
    
    plt.tight_layout()
    
    # Save cluster visualizations
    script_dir = os.path.dirname(__file__)
    output_path = os.path.join(script_dir, 'earthquake_clustering_analysis.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"✓ Cluster visualizations saved to: {output_path}")
    
    plt.show()

def analyze_high_frequency_periods(df):
    """Analyze periods of high earthquake frequency"""
    
    print("\n5. HIGH FREQUENCY PERIOD ANALYSIS")
    print("-" * 40)
    
    # Define high frequency threshold (top 5% of 30-day counts)
    high_freq_threshold = df['eq_count_last_30d'].quantile(0.95)
    high_freq_periods = df[df['eq_count_last_30d'] >= high_freq_threshold]
    
    print(f"High frequency threshold (95th percentile): {high_freq_threshold:.1f} earthquakes per 30 days")
    print(f"Number of high frequency periods: {len(high_freq_periods):,}")
    
    if len(high_freq_periods) > 0:
        print(f"\nTop provinces during high frequency periods:")
        high_freq_provinces = high_freq_periods['province'].value_counts().head(10)
        for province, count in high_freq_provinces.items():
            percentage = (count / len(high_freq_periods)) * 100
            print(f"  {province:<25} {count:4d} periods ({percentage:5.1f}%)")
        
        print(f"\nRisk level distribution during high frequency periods:")
        high_freq_risk = high_freq_periods['label_risk_level_v2'].value_counts()
        for risk, count in high_freq_risk.items():
            percentage = (count / len(high_freq_periods)) * 100
            print(f"  {risk:<10} {count:4d} periods ({percentage:5.1f}%)")

def main():
    # Define paths
    script_dir = os.path.dirname(__file__)
    csv_path = os.path.join(script_dir, '..', '..', 'dataset', 'earthquake', 'features', 'earthquake_features_dataset_v2.csv')
    
    print("=" * 60)
    print("EARTHQUAKE FREQUENCY CLUSTERING & EXPLORATION")
    print("=" * 60)
    print(f"Input: {csv_path}")
    print()
    
    # Load data
    df = load_earthquake_data(csv_path)
    
    # Explore frequency patterns
    province_stats = explore_earthquake_frequency_patterns(df)
    
    # Create frequency visualizations
    create_frequency_visualizations(df)
    
    # Perform clustering analysis
    df_with_clusters = perform_clustering_analysis(df)
    
    # Create cluster visualizations
    create_cluster_visualizations(df_with_clusters)
    
    # Analyze high frequency periods
    analyze_high_frequency_periods(df_with_clusters)
    
    print("\n" + "="*60)
    print("EXPLORATION COMPLETED!")
    print("="*60)
    print("✓ Frequency patterns analyzed")
    print("✓ Clustering performed (K-Means & DBSCAN)")
    print("✓ Visualizations created and saved")
    print("✓ High frequency periods identified")
    print("="*60)

if __name__ == "__main__":
    main()