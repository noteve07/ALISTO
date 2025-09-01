import os
import glob
import pandas as pd

input_folder = os.path.join('ml', 'dataset', 'earthquake', 'raw')
output_file = os.path.join('ml', 'dataset', 'earthquake', 'all_raw_eq_data_2018_to_2025.csv')

csv_files = glob.glob(os.path.join(input_folder, '*.csv'))

dfs = []
for file in csv_files:
    df = pd.read_csv(file)
    dfs.append(df)

merged_df = pd.concat(dfs, ignore_index=True)

# Replace 'date' with your actual date column name
merged_df = merged_df.sort_values(by='date_time', ascending=False)

merged_df.to_csv(output_file, index=False)

print(f"Merged {len(csv_files)} files into {output_file} (latest dates on top)")