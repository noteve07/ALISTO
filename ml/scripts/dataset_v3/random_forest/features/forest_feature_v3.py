import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
from tqdm import tqdm

def create_earthquake_features_dataset(csv_path, output_path, start_date='2018-01-01', window_days=30, prediction_days=7):
    """
    Create a feature engineering dataset from earthquake data.
    label_risk_level is left as None for now for later clustering.
    
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
        province_data = df_filtered[df_filtered['province'] == province].copy()
        
        for current_date in tqdm(date_range, desc=f"Processing {province}", leave=False):
            if current_date < start_dt + timedelta(days=window_days):
                continue
            if current_date > df_filtered['date_time'].max() - timedelta(days=prediction_days):
                continue
            
            row_id = f"{province}_{current_date.strftime('%Y_%m_%d')}"
            
            # Features window
            feature_start = current_date - timedelta(days=window_days)
            feature_end = current_date
            feature_data = province_data[
                (province_data['date_time'] >= feature_start) &
                (province_data['date_time'] < feature_end)
            ]
            
            # Labels window
            label_start = current_date
            label_end = current_date + timedelta(days=prediction_days)
            label_data = province_data[
                (province_data['date_time'] >= label_start) &
                (province_data['date_time'] < label_end)
            ]
            
            features = {
                'row_id': row_id,
                'province': province,
                'date': current_date.strftime('%Y-%m-%d'),
                
                # Historical features
                'eq_count_last_30d': len(feature_data),
                'max_magnitude_last_30d': feature_data['magnitude'].max() if len(feature_data) > 0 else 0.0,
                'avg_magnitude_last_30d': feature_data['magnitude'].mean() if len(feature_data) > 0 else 0.0,
                'min_magnitude_last_30d': feature_data['magnitude'].min() if len(feature_data) > 0 else 0.0,
                'std_magnitude_last_30d': feature_data['magnitude'].std() if len(feature_data) > 0 else 0.0,
                
                'avg_depth_last_30d': feature_data['depth'].mean() if len(feature_data) > 0 else 0.0,
                'max_depth_last_30d': feature_data['depth'].max() if len(feature_data) > 0 else 0.0,
                'min_depth_last_30d': feature_data['depth'].min() if len(feature_data) > 0 else 0.0,
                
                # Time-based features
                'days_since_last_eq': (current_date - feature_data['date_time'].max()).days if len(feature_data) > 0 else window_days,
                'days_since_last_major_eq': (current_date - feature_data[feature_data['magnitude'] >= 4.0]['date_time'].max()).days if len(feature_data[feature_data['magnitude'] >= 4.0]) > 0 else window_days,
                
                # Frequency features
                'eq_count_last_7d': len(feature_data[feature_data['date_time'] >= current_date - timedelta(days=7)]),
                'eq_count_last_14d': len(feature_data[feature_data['date_time'] >= current_date - timedelta(days=14)]),
                
                # Labels (next 7 days)
                'label_eq_count_next_7d': len(label_data),
                'label_max_magnitude_next_7d': label_data['magnitude'].max() if len(label_data) > 0 else 0.0,
                'label_avg_magnitude_next_7d': label_data['magnitude'].mean() if len(label_data) > 0 else 0.0,
                
                # Risk categories (can be used for classification)
                'label_risk_level': 'Low',  # Will calculate below
                'label_has_major_eq': 0,  # 1 if magnitude >= 4.0 in next 7 days
            }
            
            # Calculate days since last earthquake
            if len(feature_data) > 0:
                last_eq_date = feature_data['date_time'].max()
                features['days_since_last_eq'] = (current_date - last_eq_date).days
            else:
                features['days_since_last_eq'] = window_days  # Max possible

            # Calculate days since last major earthquake (magnitude >= 4.0)
            major_eq_data = feature_data[feature_data['magnitude'] >= 4.0]
            if len(major_eq_data) > 0:
                last_major_eq_date = major_eq_data['date_time'].max()
                features['days_since_last_major_eq'] = (current_date - last_major_eq_date).days
            else:
                features['days_since_last_major_eq'] = window_days  # Max possible
            
            # Calculate risk level based on predicted earthquake count and magnitude
            if features['label_eq_count_next_7d'] >= 5 or features['label_max_magnitude_next_7d'] >= 4.0:
                features['label_risk_level'] = 'High'
            else:
                features['label_risk_level'] = 'Low'
            
            # Has major earthquake flag
            features['label_has_major_eq'] = 1 if features['label_max_magnitude_next_7d'] >= 4.0 else 0
            features_list.append(features)
    
    features_df = pd.DataFrame(features_list)
    
    print(f"\nGenerated {len(features_df)} feature rows")
    print(f"Date range: {features_df['date'].min()} to {features_df['date'].max()}")
    print(f"Provinces: {features_df['province'].nunique()}")
    
    # Save CSV
    features_df.to_csv(output_path, index=False)
    print(f"\n✓ Feature dataset saved to: {output_path}")
    
    return features_df

def main():
    script_dir = os.path.dirname(__file__)
    csv_path = os.path.join(script_dir, 'dataset_v3.csv')
    output_path = os.path.join(script_dir, 'dataset_v3_features.csv')
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    print("=" * 60)
    print("EARTHQUAKE FEATURE ENGINEERING")
    print("=" * 60)
    print(f"Input: {csv_path}")
    print(f"Output: {output_path}\n")
    
    features_df = create_earthquake_features_dataset(
        csv_path=csv_path,
        output_path=output_path,
        start_date='2018-01-01',
        window_days=30,
        prediction_days=7
    )
    
    print("\nFirst 5 rows of the feature dataset:")
    print(features_df.head())
    
    print("\nFeature columns:")
    for i, col in enumerate(features_df.columns, 1):
        print(f"  {i:2d}. {col}")

if __name__ == "__main__":
    main()
