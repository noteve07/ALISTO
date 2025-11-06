"""
This script combines the September and October 2025 processed earthquake data
and appends them to the existing cleaned_v2_eq_data.csv file
"""

import pandas as pd
import os

# Get the absolute path to the project root directory
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))

# Define paths
interim_dir = os.path.join(project_root, 'ml', 'dataset', 'earthquake', 'interim')
sep_2025_path = os.path.join(interim_dir, 'eq_data_2025_09_processed.csv')
oct_2025_path = os.path.join(interim_dir, 'eq_data_2025_10_processed.csv')
cleaned_v2_path = os.path.join(interim_dir, 'cleaned_v2_eq_data.csv')

print("="*70)
print("COMBINING SEPTEMBER & OCTOBER 2025 DATA WITH cleaned_v2_eq_data.csv")
print("="*70)

# Load existing cleaned data
print(f"\n📖 Loading existing data from: cleaned_v2_eq_data.csv")
df_existing = pd.read_csv(cleaned_v2_path, encoding="utf-8")
print(f"✓ Loaded {len(df_existing)} existing records")

# Load September 2025 data
print(f"\n📖 Loading September 2025 data...")
df_sep = pd.read_csv(sep_2025_path, encoding="utf-8")
print(f"✓ Loaded {len(df_sep)} September records")

# Load October 2025 data
print(f"\n📖 Loading October 2025 data...")
df_oct = pd.read_csv(oct_2025_path, encoding="utf-8")
print(f"✓ Loaded {len(df_oct)} October records")

# Combine all data
print(f"\n🔗 Combining all datasets...")
df_combined = pd.concat([df_existing, df_sep, df_oct], ignore_index=True)
print(f"✓ Combined total: {len(df_combined)} records")

# Sort by date_time (descending - newest first)
print(f"\n📅 Sorting by date_time (descending)...")
df_combined['date_time'] = pd.to_datetime(df_combined['date_time'])
df_combined = df_combined.sort_values('date_time', ascending=False)
df_combined['date_time'] = df_combined['date_time'].dt.strftime('%Y-%m-%d %H:%M:%S')
print("✓ Sorted successfully")

# Remove duplicates (if any)
print(f"\n🔍 Checking for duplicates...")
duplicates_before = len(df_combined)
df_combined = df_combined.drop_duplicates(subset=['date_time', 'latitude', 'longitude', 'magnitude'], keep='first')
duplicates_removed = duplicates_before - len(df_combined)
if duplicates_removed > 0:
    print(f"⚠️  Removed {duplicates_removed} duplicate records")
else:
    print("✓ No duplicates found")

# Save combined data
print(f"\n💾 Saving combined data to: cleaned_v2_eq_data.csv")
df_combined.to_csv(cleaned_v2_path, index=False, encoding='utf-8')
print(f"✓ Saved {len(df_combined)} total records")

print("\n" + "="*70)
print("COMBINATION COMPLETED SUCCESSFULLY!")
print("="*70)
print(f"\n📊 Summary:")
print(f"  - Existing records: {len(df_existing)}")
print(f"  - September 2025 records: {len(df_sep)}")
print(f"  - October 2025 records: {len(df_oct)}")
print(f"  - Total combined: {len(df_combined)}")
print(f"  - Duplicates removed: {duplicates_removed}")
print(f"  - Date range: {df_combined['date_time'].min()} to {df_combined['date_time'].max()}")
print(f"  - Unique provinces: {df_combined['province'].nunique()}")
print("="*70 + "\n")
