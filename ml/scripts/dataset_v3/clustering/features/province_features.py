import pandas as pd

# load dataset
df = pd.read_csv("dataset_v3.csv")

# make sure numeric columns are proper dtype
df["magnitude"] = pd.to_numeric(df["magnitude"], errors="coerce")
df["depth"] = pd.to_numeric(df["depth"], errors="coerce")

# group by province and calculate features
province_stats = df.groupby("province").agg(
    total_quakes=("magnitude", "count"),
    major_quakes_m3plus=("magnitude", lambda x: (x >= 3).sum()),
    avg_magnitude=("magnitude", "mean"),
    max_magnitude=("magnitude", "max"),
    min_magnitude=("magnitude", "min"),
    avg_depth=("depth", "mean"),
    max_depth=("depth", "max")
).reset_index()

# calculate min depth separately
province_stats["min_depth"] = df.groupby("province")["depth"].min().values

# round averages to 2 decimals
province_stats["avg_magnitude"] = province_stats["avg_magnitude"].round(2)
province_stats["avg_depth"] = province_stats["avg_depth"].round(2)

# sort alphabetically
province_stats = province_stats.sort_values("province").reset_index(drop=True)

# save to csv and json
province_stats.to_csv("province_features.csv", index=False)
province_stats.to_json("province_features.json", orient="records", indent=4)

print("Aggregated features by province saved to 'province_features.csv' and 'province_features.json'")
print(province_stats.head())
