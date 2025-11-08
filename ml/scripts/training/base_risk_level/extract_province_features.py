import pandas as pd
import os
from tqdm import tqdm
import warnings
warnings.filterwarnings('ignore')

def load_cleaned_data():
    """Load the cleaned earthquake data with provinces"""
    print("Loading cleaned earthquake data...")
    
    # Path to the cleaned data
    cleaned_data_path = r"c:\Users\ADMIN\Documents\GitHub\ALISTO\ml\dataset\earthquake\interim\cleaned_v2_eq_data.csv"
    
    if not os.path.exists(cleaned_data_path):
        raise FileNotFoundError(f"Cleaned data file not found at: {cleaned_data_path}")
    
    df = pd.read_csv(cleaned_data_path)
    print(f"✓ Loaded {len(df):,} earthquake records")
    print(f"✓ Columns: {list(df.columns)}")
    print(f"✓ Unique provinces: {df['province'].nunique()}")
    
    return df

def extract_province_from_location(location):
    """Extract province from location string"""
    if pd.isna(location):
        return None
    
    if '(' in location and ')' in location:
        # Extract text in the last set of parentheses
        parts = location.split('(')
        if len(parts) > 1:
            province_part = parts[-1].split(')')[0].strip()
            return province_part
    
    return None

def extract_province_features(df):
    """Extract features by province for clustering"""
    print("\nExtracting features by province...")
    
    # Separate records with and without province
    df_with_province = df[df['province'].notna()]
    df_without_province = df[df['province'].isna()]
    
    print(f"Records with valid province: {len(df_with_province):,}")
    print(f"Records without province: {len(df_without_province):,}")
    
    # For records without province, try to extract from location column
    if len(df_without_province) > 0:
        print(f"\nAttempting to extract provinces from location column for {len(df_without_province):,} records...")
        
        extracted_provinces = []
        for _, row in df_without_province.iterrows():
            extracted_province = extract_province_from_location(row['location'])
            if extracted_province:
                extracted_provinces.append(extracted_province)
        
        if extracted_provinces:
            print(f"\nExtracted provinces from location column:")
            from collections import Counter
            province_counts = Counter(extracted_provinces)
            for province, count in sorted(province_counts.items()):
                print(f"  {province}: {count:,} records")
            
            print(f"\nTotal extractable: {len(extracted_provinces):,}")
            print(f"Still missing: {len(df_without_province) - len(extracted_provinces):,}")
        else:
            print("  No provinces could be extracted from location column")
    
    print(f"\nNote: Still filtering out records without province for clustering analysis")
    print(f"Processing {len(df_with_province):,} records with valid provinces...")
    
    features_list = []
    
    # Get unique provinces and sort them
    provinces = sorted(df_with_province['province'].unique())
    print(f"Processing {len(provinces)} unique provinces...")
    
    for province in tqdm(provinces):
        province_data = df_with_province[df_with_province['province'] == province]
        
        # Core Clustering Features (2 main ones)
        total_quakes = len(province_data)
        major_quakes_m3plus = len(province_data[province_data['magnitude'] >= 3.0])
        
        # Additional Features (for analysis but not clustering)
        avg_magnitude = province_data['magnitude'].mean()
        max_magnitude = province_data['magnitude'].max()
        min_magnitude = province_data['magnitude'].min()
        avg_depth = province_data['depth'].mean()
        max_depth = province_data['depth'].max()
        
        features_list.append({
            'province': province,
            'total_quakes': total_quakes,
            'major_quakes_m3plus': major_quakes_m3plus,
            'avg_magnitude': avg_magnitude,
            'max_magnitude': max_magnitude,
            'min_magnitude': min_magnitude,
            'avg_depth': avg_depth,
            'max_depth': max_depth,
        })
    
    features_df = pd.DataFrame(features_list)
    
    # Sort by total_quakes descending
    features_df = features_df.sort_values('total_quakes', ascending=False)
    
    print(f"\n✓ Features extracted for {len(features_df)} provinces")
    
    return features_df

def save_province_features(features_df, output_dir):
    """Save province features to CSV"""
    output_file = os.path.join(output_dir, 'province_features.csv')
    
    # Round numeric columns for better readability
    features_df_rounded = features_df.copy()
    features_df_rounded['avg_magnitude'] = features_df_rounded['avg_magnitude'].round(2)
    features_df_rounded['max_magnitude'] = features_df_rounded['max_magnitude'].round(2)
    features_df_rounded['min_magnitude'] = features_df_rounded['min_magnitude'].round(2)
    features_df_rounded['avg_depth'] = features_df_rounded['avg_depth'].round(2)
    features_df_rounded['max_depth'] = features_df_rounded['max_depth'].round(2)
    
    # Save to CSV
    features_df_rounded.to_csv(output_file, index=False)
    print(f"\n✓ Province features saved to: {output_file}")
    
    return output_file

def display_summary(features_df):
    """Display summary of extracted features"""
    print("\n" + "="*70)
    print("PROVINCE FEATURES SUMMARY")
    print("="*70)
    
    print(f"Total provinces: {len(features_df)}")
    print(f"Total earthquakes across all provinces: {features_df['total_quakes'].sum():,}")
    print(f"Total major earthquakes (M≥3.0): {features_df['major_quakes_m3plus'].sum():,}")
    
    print(f"\nTop 10 Most Active Provinces:")
    print(f"{'Province':<25} {'Total EQ':>10} {'Major EQ':>10} {'Avg Mag':>10} {'Max Mag':>10}")
    print("-" * 70)
    
    top_10 = features_df.head(10)
    for _, row in top_10.iterrows():
        print(f"{row['province']:<25} {int(row['total_quakes']):>10} {int(row['major_quakes_m3plus']):>10} {row['avg_magnitude']:>10.2f} {row['max_magnitude']:>10.2f}")
    
    print(f"\nFeature Statistics:")
    print(features_df.describe())

def main():
    print("="*70)
    print("PROVINCE FEATURE EXTRACTION")
    print("="*70)
    print("Input: Cleaned earthquake data with provinces")
    print("Output: Province-level features for clustering")
    print("="*70)
    
    # Load cleaned data
    df = load_cleaned_data()
    
    # Extract features by province
    features_df = extract_province_features(df)
    
    # Display summary
    display_summary(features_df)
    
    # Save features
    current_dir = os.path.dirname(__file__)
    output_file = save_province_features(features_df, current_dir)
    
    print("\n" + "="*70)
    print("FEATURE EXTRACTION COMPLETE")
    print("="*70)
    print(f"✓ {len(features_df)} provinces processed")
    print(f"✓ Features saved to: {os.path.basename(output_file)}")
    print(f"✓ Ready for clustering analysis!")

if __name__ == "__main__":
    main()