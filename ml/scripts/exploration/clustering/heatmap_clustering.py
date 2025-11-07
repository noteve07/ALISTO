import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os
import glob
from tqdm import tqdm
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
    """Extract comprehensive features per province for clustering"""
    print("\nExtracting features by province...")
    
    features_list = []
    
    for province in tqdm(df['province'].unique()):
        province_data = df[df['province'] == province]
        
        # Basic statistics
        total_quakes = len(province_data)
        major_quakes = len(province_data[province_data['magnitude'] >= 4.0])
        avg_magnitude = province_data['magnitude'].mean()
        max_magnitude = province_data['magnitude'].max()
        min_magnitude = province_data['magnitude'].min()
        std_magnitude = province_data['magnitude'].std()
        median_magnitude = province_data['magnitude'].median()
        
        # Depth statistics
        avg_depth = province_data['depth'].mean()
        max_depth = province_data['depth'].max()
        
        # Magnitude distribution
        m2_plus = len(province_data[province_data['magnitude'] >= 2.0])
        m3_plus = len(province_data[province_data['magnitude'] >= 3.0])
        m4_plus = len(province_data[province_data['magnitude'] >= 4.0])
        
        # Earthquake intensity levels
        low_mag_ratio = len(province_data[province_data['magnitude'] < 2.0]) / max(total_quakes, 1)
        mid_mag_ratio = len(province_data[(province_data['magnitude'] >= 2.0) & (province_data['magnitude'] < 4.0)]) / max(total_quakes, 1)
        high_mag_ratio = len(province_data[province_data['magnitude'] >= 4.0]) / max(total_quakes, 1)
        
        # Parse dates for temporal analysis
        province_data['date_parsed'] = pd.to_datetime(province_data['date_time'], format='%d %B %Y - %I:%M %p', errors='coerce')
        
        # Time span
        date_range = (province_data['date_parsed'].max() - province_data['date_parsed'].min()).days
        earthquake_rate = total_quakes / max(date_range, 1)  # EQs per day
        
        # Temporal clustering (earthquakes per month)
        province_data['month'] = province_data['date_parsed'].dt.month
        monthly_counts = province_data.groupby('month').size()
        temporal_variation = monthly_counts.std() / max(monthly_counts.mean(), 1) if len(monthly_counts) > 1 else 0
        
        # Recency (how active recently)
        recent_cutoff = province_data['date_parsed'].max() - pd.Timedelta(days=30)
        recent_quakes = len(province_data[province_data['date_parsed'] >= recent_cutoff])
        
        features_list.append({
            'province': province,
            'total_quakes': total_quakes,
            'major_quakes': major_quakes,
            'avg_magnitude': avg_magnitude if not np.isnan(avg_magnitude) else 0,
            'max_magnitude': max_magnitude if not np.isnan(max_magnitude) else 0,
            'std_magnitude': std_magnitude if not np.isnan(std_magnitude) else 0,
            'median_magnitude': median_magnitude if not np.isnan(median_magnitude) else 0,
            'avg_depth': avg_depth if not np.isnan(avg_depth) else 0,
            'max_depth': max_depth if not np.isnan(max_depth) else 0,
            'm2_plus_count': m2_plus,
            'm3_plus_count': m3_plus,
            'm4_plus_count': m4_plus,
            'low_mag_ratio': low_mag_ratio,
            'mid_mag_ratio': mid_mag_ratio,
            'high_mag_ratio': high_mag_ratio,
            'earthquake_rate': earthquake_rate,
            'temporal_variation': temporal_variation if not np.isnan(temporal_variation) else 0,
            'recent_quakes': recent_quakes,
        })
    
    return pd.DataFrame(features_list)

def main():
    print("="*70)
    print("FEATURE CORRELATION HEATMAP FOR EARTHQUAKE CLUSTERING")
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
    print("\nFeatures Summary:")
    print(provinces_features.describe())
    
    # Select features for correlation analysis
    feature_columns = [
        'total_quakes', 'major_quakes', 'avg_magnitude', 'max_magnitude', 'std_magnitude',
        'median_magnitude', 'avg_depth', 'max_depth', 'm2_plus_count', 'm3_plus_count',
        'm4_plus_count', 'low_mag_ratio', 'mid_mag_ratio', 'high_mag_ratio',
        'earthquake_rate', 'temporal_variation', 'recent_quakes'
    ]
    
    correlation_matrix = provinces_features[feature_columns].corr()
    
    # Create heatmap
    fig, ax = plt.subplots(figsize=(14, 12))
    
    sns.heatmap(correlation_matrix, 
                annot=True, 
                fmt='.2f', 
                cmap='coolwarm', 
                center=0,
                square=True,
                linewidths=0.5,
                cbar_kws={'label': 'Correlation Coefficient'},
                ax=ax)
    
    plt.title('Feature Correlation Heatmap for Earthquake Risk Clustering', 
             fontsize=14, fontweight='bold', pad=20)
    plt.xticks(rotation=45, ha='right', fontsize=9)
    plt.yticks(rotation=0, fontsize=9)
    plt.tight_layout()
    
    # Save the plot
    output_path = os.path.join(os.path.dirname(__file__), 'feature_correlation_heatmap.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"\n✓ Heatmap saved to: {output_path}")
    
    # Print correlation insights
    print("\n" + "="*70)
    print("FEATURE CORRELATION INSIGHTS")
    print("="*70)
    
    # Find highly correlated features
    print("\nHighly Correlated Feature Pairs (|correlation| > 0.8):")
    for i in range(len(correlation_matrix.columns)):
        for j in range(i+1, len(correlation_matrix.columns)):
            if abs(correlation_matrix.iloc[i, j]) > 0.8:
                feat1 = correlation_matrix.columns[i]
                feat2 = correlation_matrix.columns[j]
                corr_val = correlation_matrix.iloc[i, j]
                print(f"  {feat1:<20} <-> {feat2:<20} : {corr_val:7.3f}")
    
    plt.show()

if __name__ == "__main__":
    main()
