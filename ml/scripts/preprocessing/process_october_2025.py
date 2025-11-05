"""
This script processes the raw October 2025 earthquake dataset by performing the following operations:
1. Convert the 'date_time' column to ISO 8601 format (e.g., 2025-10-31 23:57:00)
2. Convert the 'depth' column to integer type
3. Extract the province from the 'location' column and create a new 'province' column
4. Save the processed data to the interim folder
"""

import pandas as pd
import re
import os

# Get the absolute path to the project root directory
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))

# Use project root to construct absolute paths
input_path = os.path.join(project_root, 'ml', 'dataset', 'earthquake', 'raw', 'raw_eq_data_2025_10.csv')
output_dir = os.path.join(project_root, 'ml', 'dataset', 'earthquake', 'interim')
output_path = os.path.join(output_dir, 'eq_data_2025_10_processed.csv')

# Create interim directory if it doesn't exist
os.makedirs(output_dir, exist_ok=True)
print(f"✓ Ensured directory exists: {output_dir}")

# Load the dataset
print(f"\n📖 Loading data from: {input_path}")
df = pd.read_csv(input_path, encoding="utf-8")
print(f"✓ Loaded {len(df)} rows")

# 1. Convert date_time to ISO 8601 format
def parse_date(dt):
    """
    Convert from format: "31 October 2025 - 11:57 PM" to "2025-10-31 23:57:00"
    """
    try:
        # Clean up spacing around AM/PM
        dt_clean = re.sub(r'(\d{2}:\d{2})\s*(AM|PM)', r'\1 \2', str(dt))
        # Parse the datetime
        parsed = pd.to_datetime(dt_clean, format='%d %B %Y - %I:%M %p', errors='coerce')
        return parsed
    except Exception as e:
        print(f"Error parsing: {dt} - {e}")
        return pd.NaT

print("\n⏰ Converting date_time to ISO 8601 format...")
df['date_time'] = df['date_time'].apply(parse_date)
df['date_time'] = df['date_time'].dt.strftime('%Y-%m-%d %H:%M:%S')
print(f"✓ Converted {len(df)} date_time values")

# 2. Convert depth to integer (remove leading zeros)
print("\n📏 Converting depth to integer...")
df['depth'] = pd.to_numeric(df['depth'], errors='coerce').astype('Int64')
print("✓ Converted depth to integer")

# 3. Extract province from location
def extract_province(location):
    """
    Extract province from location string
    Example: "025km S 52° W of City Of Bogo (Cebu)" -> "Cebu"
    """
    try:
        matches = re.findall(r'\(([^)]+)\)', str(location))
        if len(matches) == 0:
            return None
        elif len(matches) == 1:
            return matches[0]
        else:
            # Return the last match (usually the province)
            return matches[-1]
    except Exception:
        return None

print("\n🗺️  Extracting province from location...")
df['province'] = df['location'].apply(extract_province)
print("✓ Extracted province from location")

# 4. Reorder columns to match standard format
df = df[['date_time', 'latitude', 'longitude', 'depth', 'magnitude', 'location', 'province']]

# 5. Save processed data
print(f"\n💾 Saving processed data to: {output_path}")
df.to_csv(output_path, index=False, encoding='utf-8')
print(f"✓ Saved {len(df)} processed records")

print("\n" + "="*60)
print("Processing completed successfully!")
print("="*60)
print(f"\nOutput file: eq_data_2025_10_processed.csv")
print(f"Records: {len(df)}")
print(f"Date range: {df['date_time'].min()} to {df['date_time'].max()}")
print(f"Provinces: {df['province'].nunique()} unique provinces")
print("="*60 + "\n")
