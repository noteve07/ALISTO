"""
This script cleans the earthquake dataset by performing the following operations:
1. Convert the 'date_time' column to ISO 8601 format.
2. Convert the 'depth' column to integer type.
3. Extract the province from the 'location' column and create a new 'province' column
"""

import pandas as pd
import re
import os

VERSION = 2    # change accordingly

# Get the absolute path to the project root directory
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))

# Use project root to construct absolute paths
input_path = os.path.join(project_root, 'ml', 'dataset', 'earthquake', 'raw', 'all_raw_eq_data_2018_to_2025.csv')
output_dir = os.path.join(project_root, 'ml', 'dataset', 'earthquake', 'interim')
output_path = os.path.join(output_dir, f'cleaned_v{VERSION}_eq_data.csv')

# Create interim directory if it doesn't exist
os.makedirs(output_dir, exist_ok=True)
print(f"Ensured directory exists: {output_dir}")

# Load the dataset
print(f"Loading data from: {input_path}")
df = pd.read_csv(input_path, encoding="utf-8")
print(f"Loaded {len(df)} rows.")

# 1. Convert date_time to ISO 8601
def parse_date(dt):
    try:
        dt_clean = re.sub(r'(\d{2}:\d{2})\s*(AM|PM)', r'\1 \2', dt)
        return pd.to_datetime(dt_clean, format='%d %B %Y - %I:%M %p', errors='coerce')
    except Exception:
        return pd.NaT

df['date_time'] = df['date_time'].apply(parse_date)
df['date_time'] = df['date_time'].dt.strftime('%Y-%m-%d %H:%M:%S')
print("Converted date_time to ISO 8601.")

# 2. Convert depth to integer
df['depth'] = pd.to_numeric(df['depth'], errors='coerce').astype('Int64')
print("Converted depth to integer.")

# 3. Extract province from location
def extract_province(location):
    matches = re.findall(r'\(([^)]+)\)', str(location))
    if len(matches) == 0:
        return None
    elif len(matches) == 1:
        return matches[0]
    else:
        return matches[-1]

df['province'] = df['location'].apply(extract_province)
print("Extracted province from location.")

# 4. Save cleaned data
df.to_csv(output_path, index=False, encoding='utf-8')
print(f"Saved cleaned data to {output_path}")