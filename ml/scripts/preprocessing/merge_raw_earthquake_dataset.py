import os
import glob

input_folder = os.path.join('ml', 'dataset', 'earthquake', 'raw')
output_file = os.path.join('ml', 'dataset', 'earthquake', 'all_raw_eq_data_2018_to_2025.csv')

csv_files = sorted(glob.glob(os.path.join(input_folder, '*.csv')), reverse=True)

with open(output_file, 'w', encoding='utf-8') as outfile:
    for i, fname in enumerate(csv_files):
        with open(fname, 'r', encoding='utf-8') as infile:
            lines = infile.readlines()
            if i == 0:
                outfile.writelines(lines)
            else:
                outfile.writelines(lines[1:])

print(f"Merged {len(csv_files)} files into {output_file}")