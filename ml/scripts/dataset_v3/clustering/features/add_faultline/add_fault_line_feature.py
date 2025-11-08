import pandas as pd
import json

# load province features csv
df = pd.read_csv("province_features.csv")

# load fault distance json
with open("province_fault_distance.json") as f:
    fault_data = json.load(f)

# convert json to dataframe
fault_df = pd.DataFrame(fault_data)

# normalize province names for matching
df["province_clean"] = df["province"].str.lower().str.strip()
fault_df["province_clean"] = fault_df["province_name"].str.lower().str.strip()

# merge nearest_fault_distance_km
df = df.merge(
    fault_df[["province_clean", "nearest_fault_distance_km"]],
    on="province_clean",
    how="left"
)

# drop temporary clean column
df = df.drop(columns=["province_clean"])

# save updated csv
df.to_csv("province_features.csv", index=False)

print("province_features.csv updated with nearest_fault_distance_km")
