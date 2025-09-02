import pandas as pd
import geopandas as gpd
import matplotlib.pyplot as plt
import os
import numpy as np

# load earthquake data
input_path = os.path.join('ml', 'dataset', 'earthquake', 'interim', 'cleaned_v1_eq_data.csv')
df = pd.read_csv(input_path, encoding='utf-8')

# filter magnitude > 4
df = df[df['magnitude'] > 5].copy()

# convert date_time to datetime
df['date_time'] = pd.to_datetime(df['date_time'], errors='coerce')

# drop rows with missing date_time
df = df.dropna(subset=['date_time'])

# normalize date recency for opacity (newest = 1, oldest = 0.3)
date_min = df['date_time'].min()
date_max = df['date_time'].max()
df['opacity'] = 0.3 + 0.7 * ((df['date_time'] - date_min) / (date_max - date_min)).clip(0, 1)

# load Philippines map (GeoJSON)
geojson_path = os.path.join('ml', 'dataset', 'gis_data', 'country.0.1.json')
ph_map = gpd.read_file(geojson_path)

# plot
fig, ax = plt.subplots(figsize=(7, 8))
fig.patch.set_facecolor('#2d2d2d')
ax.set_facecolor('#444')

ph_map.plot(ax=ax, color='#888', edgecolor='#bbb')

# plot earthquakes with gradient opacity
for _, row in df.iterrows():
    ax.scatter(row['longitude'], row['latitude'],
               s=row['magnitude']*3,
               c="#e6886b",
               alpha=row['opacity'],
               edgecolors='none')

plt.title('Earthquakes in the Philippines (Magnitude > 4)', color='white')
plt.xlabel('Longitude', color='white')
plt.ylabel('Latitude', color='white')
plt.tight_layout()
plt.show()