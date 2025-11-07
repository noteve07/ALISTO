import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import os
from datetime import datetime

def load_and_explore_data():
    """Load earthquake dataset and create simple visualizations"""
    
    # Use absolute path to dataset for reliability
    csv_path = r"c:\Users\ADMIN\Documents\GitHub\ALISTO\ml\dataset\earthquake\features\earthquake_features_dataset_v2.csv"
    print("Loading earthquake frequency data...")
    df = pd.read_csv(csv_path)
    print(f"Dataset shape: {df.shape}")
    print(f"Columns: {df.columns.tolist()}")
    return df

def create_frequency_visualizations(df):
    """Create simple frequency visualizations"""
    
    # Filter for data from January 2018 onwards
    df['date'] = pd.to_datetime(df['date'])
    df = df[df['date'] >= pd.Timestamp('2018-01-01')]

    # Group by province: calculate earthquake frequency and average magnitude
    grouped = df.groupby('province').agg({
        'eq_count_last_30d': 'mean',
        'avg_magnitude_last_30d': 'mean'
    }).reset_index()

    # Plot: x-axis = earthquake frequency, y-axis = average magnitude
    plt.figure(figsize=(12, 8))
    plt.scatter(grouped['eq_count_last_30d'], grouped['avg_magnitude_last_30d'], s=60, alpha=0.7)
    for i, row in grouped.iterrows():
        plt.text(row['eq_count_last_30d'], row['avg_magnitude_last_30d'], row['province'], fontsize=8, alpha=0.7)
    plt.xlabel('Average 30-Day Earthquake Frequency (per Province)')
    plt.ylabel('Average Magnitude (per Province)')
    plt.title('Earthquake Frequency vs Average Magnitude by Province (Jan 2018+)')
    plt.grid(True, alpha=0.3)
    plt.tight_layout()

    # Save the plot
    output_path = os.path.join(os.path.dirname(__file__), 'earthquake_freq_vs_magnitude_by_province.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"✓ Visualization saved to: {output_path}")
    plt.show()

def print_basic_stats(df):
    """Print basic statistics about earthquake frequency"""
    
    print("\n" + "="*50)
    print("EARTHQUAKE FREQUENCY STATISTICS")
    print("="*50)
    
    print(f"Total records: {len(df):,}")
    print(f"Date range: {df['date'].min()} to {df['date'].max()}")
    print(f"Number of provinces: {df['province'].nunique()}")
    
    print(f"\n30-Day Earthquake Count Statistics:")
    print(f"  Mean: {df['eq_count_last_30d'].mean():.2f}")
    print(f"  Median: {df['eq_count_last_30d'].median():.2f}")
    print(f"  Max: {df['eq_count_last_30d'].max():.0f}")
    print(f"  Min: {df['eq_count_last_30d'].min():.0f}")
    print(f"  Standard Deviation: {df['eq_count_last_30d'].std():.2f}")
    
    print(f"\nTop 10 Most Active Provinces:")
    top_provinces = df.groupby('province')['eq_count_last_30d'].mean().nlargest(10)
    for i, (province, avg_count) in enumerate(top_provinces.items(), 1):
        print(f"  {i:2d}. {province:<25} {avg_count:6.2f} avg earthquakes/30 days")
    
    print(f"\nRisk Level Distribution:")
    risk_dist = df['label_risk_level_v2'].value_counts()
    for risk, count in risk_dist.items():
        percentage = (count / len(df)) * 100
        print(f"  {risk:<10} {count:7,} records ({percentage:5.1f}%)")

def main():
    print("="*50)
    print("SIMPLE EARTHQUAKE FREQUENCY VISUALIZATION")
    print("="*50)
    
    # Load data
    df = load_and_explore_data()
    
    # Print basic statistics
    print_basic_stats(df)
    
    # Create visualizations
    create_frequency_visualizations(df)
    
    print("\n" + "="*50)
    print("VISUALIZATION COMPLETED!")
    print("="*50)

if __name__ == "__main__":
    main()