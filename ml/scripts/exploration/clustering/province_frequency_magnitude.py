import pandas as pd
import matplotlib.pyplot as plt
import os

def load_data():
    """Load earthquake dataset"""
    csv_path = r"c:\Users\ADMIN\Documents\GitHub\ALISTO\ml\dataset\earthquake\features\earthquake_features_dataset_v2.csv"
    print("Loading earthquake data...")
    df = pd.read_csv(csv_path)
    df['date'] = pd.to_datetime(df['date'])
    return df

def main():
    print("="*60)
    print("PROVINCE EARTHQUAKE FREQUENCY vs AVERAGE MAGNITUDE")
    print("="*60)
    
    # Load and filter data from January 2018
    df = load_data()
    df = df[df['date'] >= pd.Timestamp('2018-01-01')]
    print(f"Dataset: {len(df):,} records from {df['date'].min().date()} to {df['date'].max().date()}")
    
    # Group by province: count total earthquakes and get average magnitude
    grouped = df.groupby('province').agg({
        'row_id': 'count',  # Total count of earthquake records per province
        'avg_magnitude_last_30d': 'mean'  # Average magnitude per province
    }).reset_index()
    
    # Rename for clarity
    grouped = grouped.rename(columns={'row_id': 'total_count'})
    
    # Sort by total count for better visualization
    grouped = grouped.sort_values('total_count', ascending=False)
    
    print(f"\nNumber of provinces: {len(grouped)}")
    print("\nTop 10 provinces by total earthquake count:")
    for i, row in grouped.head(10).iterrows():
        print(f"  {row['province']:<25} Count: {row['total_count']:7,.0f}  Avg Mag: {row['avg_magnitude_last_30d']:5.2f}")
    
    # Create the plot
    plt.figure(figsize=(14, 8))
    
    # Scatter plot with province names
    scatter = plt.scatter(grouped['total_count'], 
                         grouped['avg_magnitude_last_30d'], 
                         s=100, 
                         alpha=0.6, 
                         c=grouped['total_count'], 
                         cmap='RdYlGn_r')
    
    # Add province labels
    for i, row in grouped.iterrows():
        plt.annotate(row['province'], 
                    (row['total_count'], row['avg_magnitude_last_30d']),
                    fontsize=8, 
                    alpha=0.8,
                    xytext=(5, 5),
                    textcoords='offset points')
    
    plt.xlabel('Total Earthquake Count (Jan 2018+)', fontsize=12, fontweight='bold')
    plt.ylabel('Average Magnitude', fontsize=12, fontweight='bold')
    plt.title('Province Total Earthquake Count vs Average Magnitude\n(Data from January 2018 onwards)', 
             fontsize=14, fontweight='bold')
    plt.grid(True, alpha=0.3)
    plt.colorbar(scatter, label='Total Count')
    plt.tight_layout()
    
    # Save the plot
    output_path = os.path.join(os.path.dirname(__file__), 'province_frequency_vs_magnitude.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"\n✓ Plot saved to: {output_path}")
    
    plt.show()

if __name__ == "__main__":
    main()
