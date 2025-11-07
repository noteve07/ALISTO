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
    print("PROVINCE EARTHQUAKE COUNT & AVERAGE MAGNITUDE")
    print("="*60)
    
    # Load raw earthquake data
    df = load_all_raw_earthquake_data()
    
    # Extract province from location
    print("\nExtracting province information...")
    df['province'] = df['location'].apply(extract_province_from_location)
    
    # Remove rows without province
    df = df[df['province'].notna()]
    print(f"Records with valid province: {len(df):,}")
    
    # Group by province: count earthquakes and average magnitude
    grouped = df.groupby('province').agg({
        'location': 'count',  # Count of earthquakes
        'magnitude': 'mean'    # Average magnitude
    }).reset_index()
    
    grouped = grouped.rename(columns={'location': 'earthquake_count', 'magnitude': 'avg_magnitude'})
    
    # Sort by earthquake count descending
    grouped = grouped.sort_values('earthquake_count', ascending=False)
    
    print(f"\nNumber of provinces: {len(grouped)}")
    print("\nTop 20 provinces by earthquake count:")
    for i, row in grouped.head(20).iterrows():
        print(f"  {row['province']:<30} Count: {row['earthquake_count']:7,.0f}  Avg Mag: {row['avg_magnitude']:5.2f}")
    
    # Create the plot
    plt.figure(figsize=(16, 9))
    
    # Scatter plot
    scatter = plt.scatter(grouped['earthquake_count'], 
                         grouped['avg_magnitude'], 
                         s=120, 
                         alpha=0.6, 
                         c=grouped['earthquake_count'], 
                         cmap='RdYlGn_r',
                         edgecolors='black',
                         linewidth=0.5)
    
    # Add province labels
    for i, row in grouped.iterrows():
        plt.annotate(row['province'], 
                    (row['earthquake_count'], row['avg_magnitude']),
                    fontsize=7, 
                    alpha=0.8,
                    xytext=(5, 5),
                    textcoords='offset points')
    
    plt.xlabel('Total Earthquake Count (2018+)', fontsize=13, fontweight='bold')
    plt.ylabel('Average Magnitude', fontsize=13, fontweight='bold')
    plt.title('Province Earthquake Count vs Average Magnitude\n(All earthquakes from 2018 onwards)', 
             fontsize=14, fontweight='bold')
    plt.grid(True, alpha=0.3)
    cbar = plt.colorbar(scatter, label='Earthquake Count')
    plt.tight_layout()
    
    # Save the plot
    output_path = os.path.join(os.path.dirname(__file__), 'province_earthquake_count_vs_magnitude.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"\n✓ Plot saved to: {output_path}")
    
    plt.show()

if __name__ == "__main__":
    main()
