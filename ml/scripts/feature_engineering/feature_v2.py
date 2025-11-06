import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
from tqdm import tqdm

def create_earthquake_features_dataset_v2(csv_path, output_path, start_date='2018-01-01', window_days=30, prediction_days=7):
    """
    Create a feature engineering dataset from earthquake data (Version 2).
    
    NEW RISK CLASSIFICATION:
    - Low Risk: No expected M4.0+ AND no M2.0+ swarms (count < 5)
    - Medium Risk: Has expected M2.0+ swarms (count >= 5) but no M4.0+
    - High Risk: Has expected M4.0+
    
    Parameters:
    - csv_path: Path to the cleaned earthquake CSV
    - output_path: Path to save the new feature dataset
    - start_date: Start date for the dataset (default: 2018-01-01)
    - window_days: Number of days to look back for features (default: 30)
    - prediction_days: Number of days to predict forward for labels (default: 7)
    """
    
    print("Loading earthquake data...")
    df = pd.read_csv(csv_path)
    
    # Convert date_time to datetime
    df['date_time'] = pd.to_datetime(df['date_time'])
    df['date'] = df['date_time'].dt.date
    
    # Filter from start_date onwards
    start_dt = pd.to_datetime(start_date)
    df_filtered = df[df['date_time'] >= start_dt].copy()
    
    # Remove rows with missing province data
    df_filtered = df_filtered.dropna(subset=['province'])
    
    print(f"Data range: {df_filtered['date_time'].min()} to {df_filtered['date_time'].max()}")
    print(f"Total earthquakes: {len(df_filtered)}")
    
    # Get unique provinces and dates
    provinces = sorted(df_filtered['province'].unique())
    date_range = pd.date_range(start=start_dt, end=df_filtered['date_time'].max(), freq='D')
    
    print(f"Provinces: {len(provinces)}")
    print(f"Date range: {len(date_range)} days")
    
    # Create feature dataset
    features_list = []
    
    print("Generating features for each province-date combination...")
    
    for province in tqdm(provinces, desc="Processing provinces"):
        # Get earthquake data for this province
        province_data = df_filtered[df_filtered['province'] == province].copy()
        
        for current_date in tqdm(date_range, desc=f"Processing {province}", leave=False):
            # Skip if we don't have enough historical data or future data
            if current_date < start_dt + timedelta(days=window_days):
                continue
            if current_date > df_filtered['date_time'].max() - timedelta(days=prediction_days):
                continue
            
            # Create row identifier
            row_id = f"{province}_{current_date.strftime('%Y_%m_%d')}"
            
            # Calculate features (last N days)
            feature_start = current_date - timedelta(days=window_days)
            feature_end = current_date
            
            feature_data = province_data[
                (province_data['date_time'] >= feature_start) & 
                (province_data['date_time'] < feature_end)
            ]
            
            # Calculate label (next N days)
            label_start = current_date
            label_end = current_date + timedelta(days=prediction_days)
            
            label_data = province_data[
                (province_data['date_time'] >= label_start) & 
                (province_data['date_time'] < label_end)
            ]
            
            # Feature calculations (SAME AS V1)
            features = {
                'row_id': row_id,
                'province': province,
                'date': current_date.strftime('%Y-%m-%d'),
                
                # Historical features (last 30 days) - UNCHANGED
                'eq_count_last_30d': len(feature_data),
                'max_magnitude_last_30d': feature_data['magnitude'].max() if len(feature_data) > 0 else 0.0,
                'avg_magnitude_last_30d': feature_data['magnitude'].mean() if len(feature_data) > 0 else 0.0,
                'min_magnitude_last_30d': feature_data['magnitude'].min() if len(feature_data) > 0 else 0.0,
                'std_magnitude_last_30d': feature_data['magnitude'].std() if len(feature_data) > 0 else 0.0,
                
                # Depth features - UNCHANGED
                'avg_depth_last_30d': feature_data['depth'].mean() if len(feature_data) > 0 else 0.0,
                'max_depth_last_30d': feature_data['depth'].max() if len(feature_data) > 0 else 0.0,
                'min_depth_last_30d': feature_data['depth'].min() if len(feature_data) > 0 else 0.0,
                
                # Time-based features - UNCHANGED
                'days_since_last_eq': 0,  # Will calculate below
                'days_since_last_major_eq': 0,  # Will calculate below (magnitude >= 4.0)
                
                # Frequency features - UNCHANGED
                'eq_count_last_7d': len(feature_data[feature_data['date_time'] >= current_date - timedelta(days=7)]),
                'eq_count_last_14d': len(feature_data[feature_data['date_time'] >= current_date - timedelta(days=14)]),
                
                # Labels (next 7 days) - ENHANCED
                'label_eq_count_next_7d': len(label_data),
                'label_max_magnitude_next_7d': label_data['magnitude'].max() if len(label_data) > 0 else 0.0,
                'label_avg_magnitude_next_7d': label_data['magnitude'].mean() if len(label_data) > 0 else 0.0,
                
                # NEW: More detailed label analysis
                'label_eq_count_m2_plus': len(label_data[label_data['magnitude'] >= 2.0]),  # M2.0+ count
                'label_eq_count_m3_plus': len(label_data[label_data['magnitude'] >= 3.0]),  # M3.0+ count
                'label_eq_count_m4_plus': len(label_data[label_data['magnitude'] >= 4.0]),  # M4.0+ count
                
                # Binary flags
                'label_has_major_eq': 0,  # 1 if magnitude >= 4.0 in next 7 days
                'label_has_swarm': 0,     # 1 if M2.0+ count >= 5 in next 7 days
                
                # NEW RISK CLASSIFICATION
                'label_risk_level_v2': 'Low',  # Will calculate below based on new criteria
            }
            
            # Calculate days since last earthquake (UNCHANGED)
            if len(feature_data) > 0:
                last_eq_date = feature_data['date_time'].max()
                features['days_since_last_eq'] = (current_date - last_eq_date).days
            else:
                features['days_since_last_eq'] = window_days  # Max possible
            
            # Calculate days since last major earthquake (UNCHANGED)
            major_eq_data = feature_data[feature_data['magnitude'] >= 4.0]
            if len(major_eq_data) > 0:
                last_major_eq_date = major_eq_data['date_time'].max()
                features['days_since_last_major_eq'] = (current_date - last_major_eq_date).days
            else:
                features['days_since_last_major_eq'] = window_days  # Max possible
            
            # NEW RISK CLASSIFICATION LOGIC
            has_major_eq = features['label_eq_count_m4_plus'] > 0
            has_swarm = features['label_eq_count_m2_plus'] >= 5  # Define swarm as 5+ M2.0+ earthquakes
            
            # Set binary flags
            features['label_has_major_eq'] = 1 if has_major_eq else 0
            features['label_has_swarm'] = 1 if has_swarm else 0
            
            # Apply NEW risk classification
            if has_major_eq:
                features['label_risk_level_v2'] = 'High'     # Has M4.0+
            elif has_swarm:
                features['label_risk_level_v2'] = 'Medium'   # Has M2.0+ swarm but no M4.0+
            else:
                features['label_risk_level_v2'] = 'Low'      # No M4.0+ and no swarms
            
            features_list.append(features)
    
    # Create DataFrame
    features_df = pd.DataFrame(features_list)
    
    print(f"\nGenerated {len(features_df)} feature rows")
    print(f"Date range: {features_df['date'].min()} to {features_df['date'].max()}")
    print(f"Provinces: {features_df['province'].nunique()}")
    
    # Show some statistics
    print("\n" + "="*60)
    print("FEATURE STATISTICS (V2)")
    print("="*60)
    print(f"Total rows: {len(features_df)}")
    print(f"Average earthquakes per 30-day window: {features_df['eq_count_last_30d'].mean():.2f}")
    print(f"Average earthquakes per 7-day prediction: {features_df['label_eq_count_next_7d'].mean():.2f}")
    print(f"Max magnitude in features: {features_df['max_magnitude_last_30d'].max():.1f}")
    print(f"Max magnitude in labels: {features_df['label_max_magnitude_next_7d'].max():.1f}")
    
    print("\nV2 Risk level distribution:")
    risk_counts = features_df['label_risk_level_v2'].value_counts()
    for risk, count in risk_counts.items():
        percentage = (count / len(features_df)) * 100
        print(f"  {risk}: {count} ({percentage:.1f}%)")
    
    print(f"\nMajor earthquakes (≥4.0) in next 7 days: {features_df['label_has_major_eq'].sum()} ({(features_df['label_has_major_eq'].sum()/len(features_df)*100):.1f}%)")
    print(f"Earthquake swarms (≥5 M2.0+) in next 7 days: {features_df['label_has_swarm'].sum()} ({(features_df['label_has_swarm'].sum()/len(features_df)*100):.1f}%)")
    
    # Additional magnitude breakdown
    print(f"\nMagnitude breakdown (next 7 days):")
    print(f"  M2.0+ earthquakes: {features_df['label_eq_count_m2_plus'].sum()} total")
    print(f"  M3.0+ earthquakes: {features_df['label_eq_count_m3_plus'].sum()} total")
    print(f"  M4.0+ earthquakes: {features_df['label_eq_count_m4_plus'].sum()} total")
    
    # Save to CSV
    features_df.to_csv(output_path, index=False)
    print(f"\n✓ Feature dataset V2 saved to: {output_path}")
    
    return features_df

def main():
    # Define paths
    script_dir = os.path.dirname(__file__)
    csv_path = os.path.join(script_dir, '..', '..', 'dataset', 'earthquake', 'interim', 'cleaned_v2_eq_data.csv')
    output_path = os.path.join(script_dir, '..', '..', 'dataset', 'earthquake', 'features', 'earthquake_features_dataset_v2.csv')
    
    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    print("=" * 60)
    print("EARTHQUAKE FEATURE ENGINEERING V2")
    print("=" * 60)
    print("NEW RISK CLASSIFICATION:")
    print("  Low Risk:    No M4.0+ AND no M2.0+ swarms")
    print("  Medium Risk: Has M2.0+ swarms (≥5) but no M4.0+")
    print("  High Risk:   Has M4.0+")
    print("=" * 60)
    print(f"Input: {csv_path}")
    print(f"Output: {output_path}")
    print()
    
    # Create the feature dataset
    features_df = create_earthquake_features_dataset_v2(
        csv_path=csv_path,
        output_path=output_path,
        start_date='2018-01-01',  # Start from January 2018
        window_days=30,           # Look back 30 days for features
        prediction_days=7         # Predict next 7 days
    )
    
    print("\nFirst 5 rows of the feature dataset:")
    print(features_df.head())
    
    print("\nFeature columns:")
    for i, col in enumerate(features_df.columns, 1):
        print(f"  {i:2d}. {col}")
    
    print("\nComparison with V1 risk distribution:")
    print("V2 focuses on practical seismic risk assessment:")
    print("- Swarms (≥5 M2.0+) often precede larger earthquakes")
    print("- M4.0+ earthquakes cause significant damage")
    print("- More balanced risk categories for better prediction")

if __name__ == "__main__":
    main()