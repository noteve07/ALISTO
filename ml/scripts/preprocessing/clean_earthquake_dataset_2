import pandas as pd
from geopy.geocoders import Nominatim
import time
import os

input_path = os.path.join('ml', 'dataset', 'earthquake', 'interim', 'cleaned_v1_eq_data.csv')

# Load cleaned data
df = pd.read_csv(input_path, encoding="utf-8")

# Get first 5 rows
sample_df = df.head(5).copy()

# Add 2 sample rows
extra_rows = [
    {
        'date_time': '2019-01-30 20:07:00',
        'latitude': 14.03,
        'longitude': 120.38,
        'depth': 67,
        'magnitude': 1.7,
        'location': '027km S 78° W of Nasugbu (Batangas)',
        'province': 'Batangas'
    },
    {
        'date_time': '2019-01-30 20:00:00',
        'latitude': 14.63,
        'longitude': 120.52,
        'depth': 131,
        'magnitude': 1.6,
        'location': '006km S 23° W of Balanga City (Bataan)',
        'province': 'Bataan'
    }
]
extra_df = pd.DataFrame(extra_rows)
sample_df = pd.concat([sample_df, extra_df], ignore_index=True)

# Reverse geocode to get municipality/city
geolocator = Nominatim(user_agent="epicentra_eq_locator")
municipalities = []
provinces = []

for idx, row in sample_df.iterrows():
    try:
        location = geolocator.reverse((row['latitude'], row['longitude']), language='en', timeout=10)
        address = location.raw.get('address', {})
        # Municipality/city/town/village/county
        muni = address.get('city') or address.get('town') or address.get('municipality') or address.get('village') or address.get('county')
        # Province/state/region
        prov = address.get('state') or address.get('region')
        municipalities.append(muni)
        provinces.append(prov)
        print(f"Row {idx+1}: {row['latitude']}, {row['longitude']} -> {muni}, {prov}")
        time.sleep(1)  # Be nice to Nominatim
    except Exception as e:
        municipalities.append(None)
        provinces.append(None)
        print(f"Row {idx+1}: {row['latitude']}, {row['longitude']} -> Not found ({e})")

sample_df['municipality'] = municipalities
sample_df['province_by_coord'] = provinces

print("\nSample Data with Municipality/City and Province:")
print(sample_df[['date_time', 'latitude', 'longitude', 'municipality', 'province_by_coord']])