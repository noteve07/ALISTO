import pandas as pd
import matplotlib.pyplot as plt
import os
import glob
from tqdm import tqdm

def load_all_raw_earthquake_data():
    """Load all raw earthquake data from 2018 onwards"""
    print("Loading all raw earthquake data from 2018 onwards...")
    
    raw_data_dir = r"c:\Users\ADMIN\Documents\GitHub\ALISTO\ml\dataset\earthquake\raw"
    csv_files = sorted(glob.glob(os.path.join(raw_data_dir, "raw_eq_data_201[89]*.csv")) + 
                       glob.glob(os.path.join(raw_data_dir, "raw_eq_data_202*.csv")))
    
    print(f"Found {len(csv_files)} files")
    
    all_data = []
    for csv_file in tqdm(csv_files):
        try:
            df = pd.read_csv(csv_file)
            all_data.append(df)
        except Exception as e:
            print(f"Error reading {csv_file}: {e}")
    
    df_all = pd.concat(all_data, ignore_index=True)
    print(f"Total records loaded: {len(df_all):,}")
    
    return df_all

def extract_province_from_location(location):
    """Extract province from location string"""
    if pd.isna(location):
        return None
    
    # Split by '(' and take the part in parentheses
    if '(' in location and ')' in location:
        province = location.split('(')[-1].split(')')[0].strip()
        return province
    
    return None

def main():
    print("="*60)
    print("PROVINCE EARTHQUAKE COUNT (1D VISUALIZATION)")
    print("="*60)
    
    # Load raw earthquake data
    df = load_all_raw_earthquake_data()
    
    # Extract province from location
    print("\nExtracting province information...")
    df['province'] = df['location'].apply(extract_province_from_location)
    
    # Remove rows without province
    df = df[df['province'].notna()]
    print(f"Records with valid province: {len(df):,}")
    
    # Group by province and count earthquakes
    grouped = df.groupby('province').size().reset_index(name='earthquake_count')
    
    # Sort by earthquake count descending
    grouped = grouped.sort_values('earthquake_count', ascending=False)
    
    print(f"\nNumber of provinces: {len(grouped)}")
    print("\nAll provinces by earthquake count:")
    for i, row in grouped.iterrows():
        print(f"  {row['province']:<30} Count: {row['earthquake_count']:7,.0f}")
    
    # Create bar plot
    fig, ax = plt.subplots(figsize=(14, 10))
    
    # Create color gradient based on count
    colors = plt.cm.RdYlGn_r(grouped['earthquake_count'] / grouped['earthquake_count'].max())
    
    bars = ax.barh(range(len(grouped)), grouped['earthquake_count'].values, color=colors, edgecolor='black', linewidth=0.5)
    
    # Set y-axis labels
    ax.set_yticks(range(len(grouped)))
    ax.set_yticklabels(grouped['province'].values, fontsize=9)
    
    # Labels and title
    ax.set_xlabel('Total Earthquake Count (2018+)', fontsize=12, fontweight='bold')
    ax.set_title('Province Earthquake Count Distribution\n(All earthquakes from 2018 onwards)', 
                fontsize=14, fontweight='bold')
    ax.grid(True, alpha=0.3, axis='x')
    
    # Add value labels on bars
    for i, (idx, row) in enumerate(grouped.iterrows()):
        ax.text(row['earthquake_count'], i, f"  {int(row['earthquake_count']):,}", 
               va='center', fontsize=8)
    
    plt.tight_layout()
    
    # Save the plot
    output_path = os.path.join(os.path.dirname(__file__), 'province_earthquake_count_1d.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"\n✓ Plot saved to: {output_path}")
    
    plt.show()

if __name__ == "__main__":
    main()
