import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime
import os

# Define paths
csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'dataset', 'earthquake', 'interim', 'cleaned_v2_eq_data.csv')

# Read CSV (READ ONLY)
df = pd.read_csv(csv_path)

# Convert date_time to datetime
df['date_time'] = pd.to_datetime(df['date_time'])

# Extract year and date
df['date'] = df['date_time'].dt.date
df['year'] = df['date_time'].dt.year

# Filter for Batangas province
batangas_df = df[df['province'] == 'Batangas'].copy()

print("=" * 60)
print("BATANGAS EARTHQUAKE FREQUENCY ANALYSIS - January 2018 onwards")
print("=" * 60)

if len(batangas_df) == 0:
    print("\nNo earthquakes recorded in Batangas for this dataset.")
else:
    # Filter from January 2018 onwards
    start_date = pd.to_datetime('2018-01-01')
    batangas_filtered = batangas_df[batangas_df['date_time'] >= start_date]
    
    if len(batangas_filtered) == 0:
        print(f"\nNo earthquakes recorded in Batangas from January 2018 onwards.")
        print(f"Total earthquakes in dataset: {len(batangas_df)}")
    else:
        # Daily frequency
        daily_freq = batangas_filtered.groupby('date').size().reset_index(name='count')
        daily_freq['date'] = pd.to_datetime(daily_freq['date'])
        daily_freq = daily_freq.sort_values('date')
        
        print(f"\nTotal earthquakes in Batangas (Jan 2018 onwards): {len(batangas_filtered)}")
        print(f"Days with earthquakes: {len(daily_freq)}")
        print(f"Average earthquakes per active day: {len(batangas_filtered) / len(daily_freq):.2f}")
        print(f"Date range: {daily_freq['date'].min().date()} to {daily_freq['date'].max().date()}")
        
        print("\n" + "-" * 60)
        print("DAILY BREAKDOWN:")
        print("-" * 60)
        print(f"{'Date':<15} {'Count':<10} {'Magnitude Range':<20}")
        print("-" * 60)
        
        for _, row in daily_freq.iterrows():
            date = row['date'].date()
            count = row['count']
            
            # Get magnitude range for that day
            day_data = batangas_filtered[batangas_filtered['date'] == date]
            mag_min = day_data['magnitude'].min()
            mag_max = day_data['magnitude'].max()
            
            print(f"{str(date):<15} {count:<10} {mag_min:.1f} - {mag_max:.1f}")
        
        print("-" * 60)
        print(f"Total: {daily_freq['count'].sum()} earthquakes")
        
        # Get max magnitude for each day to determine color
        max_mag_per_day = batangas_filtered.groupby('date')['magnitude'].max().reset_index()
        max_mag_per_day['date'] = pd.to_datetime(max_mag_per_day['date'])
        
        # Merge with daily_freq
        daily_freq = daily_freq.merge(max_mag_per_day, on='date', how='left')
        
        # Determine colors: red if max magnitude >= 4.0, else steelblue
        colors = ['#d62728' if mag >= 4.0 else '#1f77b4' for mag in daily_freq['magnitude']]
        
        # Create visualization
        fig, axes = plt.subplots(2, 1, figsize=(14, 10))
        
        # Plot 1: Daily frequency bar chart
        ax1 = axes[0]
        bars = ax1.bar(daily_freq['date'], daily_freq['count'], color=colors, alpha=0.75, linewidth=0.5)
        ax1.set_xlabel('Date', fontsize=11, fontweight='bold')
        ax1.set_ylabel('Number of Earthquakes', fontsize=11, fontweight='bold')
        ax1.set_title('Batangas Earthquake Frequency - Daily (January 2018 onwards)', fontsize=13, fontweight='bold')
        ax1.set_ylim(0, daily_freq['count'].max() * 1.1)  # Add 10% padding at top
        ax1.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
        ax1.xaxis.set_major_locator(mdates.AutoDateLocator())
        plt.setp(ax1.xaxis.get_majorticklabels(), rotation=45, ha='right')
        ax1.grid(True, alpha=0.3, axis='y')
        
        # Add legend
        from matplotlib.patches import Patch
        legend_elements = [Patch(facecolor='#1f77b4', alpha=0.75, label='Magnitude < 4.0'),
                          Patch(facecolor='#d62728', alpha=0.75, label='Magnitude ≥ 4.0')]
        ax1.legend(handles=legend_elements, loc='upper left')
        
        # Plot 2: Cumulative earthquakes
        daily_freq['cumulative'] = daily_freq['count'].cumsum()
        ax2 = axes[1]
        ax2.plot(daily_freq['date'], daily_freq['cumulative'], marker='o', 
                linewidth=2.5, markersize=6, color='darkred', label='Cumulative')
        ax2.fill_between(daily_freq['date'], daily_freq['cumulative'], alpha=0.3, color='red')
        ax2.set_xlabel('Date', fontsize=11, fontweight='bold')
        ax2.set_ylabel('Cumulative Count', fontsize=11, fontweight='bold')
        ax2.set_title('Batangas Cumulative Earthquake Frequency (January 2018 onwards)', fontsize=13, fontweight='bold')
        ax2.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
        ax2.xaxis.set_major_locator(mdates.AutoDateLocator())
        plt.setp(ax2.xaxis.get_majorticklabels(), rotation=45, ha='right')
        ax2.grid(True, alpha=0.3)
        
        plt.tight_layout()
        
        # Save figure
        output_path = os.path.join(os.path.dirname(__file__), 'batangas_earthquake_analysis.png')
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        print(f"\n✓ Visualization saved to: {output_path}")
        
        plt.show()
