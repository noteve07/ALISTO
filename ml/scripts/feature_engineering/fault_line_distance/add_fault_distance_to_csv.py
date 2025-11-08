import pandas as pd
import json
import os

# Paths
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
PROVINCE_FEATURES_CSV = os.path.join(THIS_DIR, 'province_features.csv')
FAULT_DISTANCE_JSON = os.path.join(THIS_DIR, 'province_fault_distance.json')
OUTPUT_CSV = os.path.join(THIS_DIR, 'province_features_with_fault_distance.csv')


def normalize_province_name(name: str) -> str:
    """Normalize province names for matching"""
    if not isinstance(name, str):
        return ''
    s = name.strip().lower()
    # Remove special characters
    for ch in [".", ",", "'", "\"", "(", ")"]:
        s = s.replace(ch, "")
    s = " ".join(s.split())
    # Common aliases
    s = s.replace('metro manila', 'metropolitan manila')
    s = s.replace('ncr', 'metropolitan manila')
    return s


def load_fault_distances(path=FAULT_DISTANCE_JSON) -> pd.DataFrame:
    """Load fault distance data from JSON"""
    print(f"Loading fault distances from: {path}")
    with open(path, 'r', encoding='utf-8') as f:
        rows = json.load(f)
    df = pd.DataFrame(rows)
    # Normalize join key
    df['province_norm'] = df['province_name'].apply(normalize_province_name)
    df = df.rename(columns={'nearest_fault_distance_km': 'nearest_fault_km'})
    return df[['province_norm', 'nearest_fault_km', 'province_name', 'province_id']]


def main():
    print("="*70)
    print("ADD FAULT DISTANCE TO PROVINCE FEATURES CSV")
    print("="*70)
    
    # Load province features CSV
    if not os.path.exists(PROVINCE_FEATURES_CSV):
        raise FileNotFoundError(f"Province features CSV not found: {PROVINCE_FEATURES_CSV}")
    
    print(f"\nLoading province features from: {PROVINCE_FEATURES_CSV}")
    df_features = pd.read_csv(PROVINCE_FEATURES_CSV)
    print(f"Loaded {len(df_features)} provinces with {len(df_features.columns)} features")
    
    # Normalize province names for matching
    df_features['province_norm'] = df_features['province'].apply(normalize_province_name)
    
    # Load fault distances
    if not os.path.exists(FAULT_DISTANCE_JSON):
        raise FileNotFoundError(f"Fault distance JSON not found: {FAULT_DISTANCE_JSON}")
    
    df_distances = load_fault_distances(FAULT_DISTANCE_JSON)
    print(f"Loaded fault distances for {len(df_distances)} provinces")
    
    # Merge on normalized province name
    print("\nMerging datasets...")
    df_merged = df_features.merge(
        df_distances[['province_norm', 'nearest_fault_km']], 
        on='province_norm', 
        how='left'
    )
    
    # Fill missing distances with a large value (300km) to indicate far from faults
    missing_count = df_merged['nearest_fault_km'].isna().sum()
    if missing_count > 0:
        print(f"⚠️  Warning: {missing_count} provinces have no matching fault distance (filling with 300.0 km)")
        df_merged['nearest_fault_km'] = df_merged['nearest_fault_km'].fillna(300.0)
    
    # Drop the normalized column (no longer needed)
    df_merged = df_merged.drop(columns=['province_norm'])
    
    # Reorder columns to put nearest_fault_km after major_quakes_m3plus
    cols = df_merged.columns.tolist()
    # Remove nearest_fault_km from its current position
    cols.remove('nearest_fault_km')
    # Find index of major_quakes_m3plus
    if 'major_quakes_m3plus' in cols:
        idx = cols.index('major_quakes_m3plus') + 1
        cols.insert(idx, 'nearest_fault_km')
    else:
        # If major_quakes_m3plus not found, add at end
        cols.append('nearest_fault_km')
    
    df_merged = df_merged[cols]
    
    # Save to new CSV
    df_merged.to_csv(OUTPUT_CSV, index=False)
    print(f"\n✓ Output saved to: {OUTPUT_CSV}")
    print(f"  Total provinces: {len(df_merged)}")
    print(f"  Total features: {len(df_merged.columns)}")
    
    # Show sample
    print("\nSample of merged data (top 10 provinces):")
    print(df_merged[['province', 'total_quakes', 'major_quakes_m3plus', 'nearest_fault_km']].head(10).to_string(index=False))
    
    # Show statistics
    print("\nFault distance statistics:")
    print(f"  Min: {df_merged['nearest_fault_km'].min():.2f} km")
    print(f"  Max: {df_merged['nearest_fault_km'].max():.2f} km")
    print(f"  Mean: {df_merged['nearest_fault_km'].mean():.2f} km")
    print(f"  Median: {df_merged['nearest_fault_km'].median():.2f} km")
    print(f"  Provinces at 0 km (on fault line): {(df_merged['nearest_fault_km'] == 0).sum()}")


if __name__ == '__main__':
    main()
