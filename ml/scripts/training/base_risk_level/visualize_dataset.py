import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os
import numpy as np
import warnings
warnings.filterwarnings('ignore')

def load_province_features():
    """Load province features CSV"""
    print("Loading province features data...")
    
    current_dir = os.path.dirname(__file__)
    features_file = os.path.join(current_dir, 'province_features.csv')
    
    if not os.path.exists(features_file):
        raise FileNotFoundError(f"Province features file not found: {features_file}")
    
    df = pd.read_csv(features_file)
    print(f"✓ Loaded {len(df)} provinces with features")
    print(f"✓ Columns: {list(df.columns)}")
    
    return df

def create_dataset_visualizations(df):
    """Create comprehensive visualizations of the province dataset"""
    print("\nCreating dataset visualizations...")
    
    # Set up the plotting style
    plt.style.use('default')
    sns.set_palette("husl")
    
    # Create a large figure with multiple subplots
    fig = plt.figure(figsize=(20, 16))
    
    # 1. Top 20 Most Active Provinces (Bar Chart)
    ax1 = fig.add_subplot(3, 3, 1)
    top_20 = df.head(20)
    bars = ax1.barh(range(len(top_20)), top_20['total_quakes'], color='skyblue', edgecolor='navy')
    ax1.set_yticks(range(len(top_20)))
    ax1.set_yticklabels(top_20['province'], fontsize=9)
    ax1.set_xlabel('Total Earthquakes', fontweight='bold')
    ax1.set_title('Top 20 Most Active Provinces', fontweight='bold', fontsize=12)
    ax1.grid(axis='x', alpha=0.3)
    
    # Add value labels on bars
    for i, bar in enumerate(bars):
        width = bar.get_width()
        ax1.text(width + max(top_20['total_quakes']) * 0.01, bar.get_y() + bar.get_height()/2, 
                f'{int(width):,}', ha='left', va='center', fontsize=8)
    
    # 2. Total Quakes Distribution (Histogram)
    ax2 = fig.add_subplot(3, 3, 2)
    ax2.hist(df['total_quakes'], bins=30, color='lightcoral', edgecolor='darkred', alpha=0.7)
    ax2.set_xlabel('Total Earthquakes', fontweight='bold')
    ax2.set_ylabel('Number of Provinces', fontweight='bold')
    ax2.set_title('Distribution of Total Earthquakes', fontweight='bold')
    ax2.grid(axis='y', alpha=0.3)
    
    # 3. Major Quakes vs Total Quakes (Scatter Plot)
    ax3 = fig.add_subplot(3, 3, 3)
    scatter = ax3.scatter(df['total_quakes'], df['major_quakes_m3plus'], 
                         c=df['max_magnitude'], cmap='viridis', alpha=0.7, s=50)
    ax3.set_xlabel('Total Earthquakes', fontweight='bold')
    ax3.set_ylabel('Major Earthquakes (M≥3.0)', fontweight='bold')
    ax3.set_title('Major vs Total Earthquakes\n(Color = Max Magnitude)', fontweight='bold')
    ax3.grid(True, alpha=0.3)
    
    # Add colorbar
    cbar = plt.colorbar(scatter, ax=ax3)
    cbar.set_label('Max Magnitude', fontweight='bold')
    
    # 4. Average Magnitude Distribution
    ax4 = fig.add_subplot(3, 3, 4)
    ax4.hist(df['avg_magnitude'], bins=25, color='lightgreen', edgecolor='darkgreen', alpha=0.7)
    ax4.set_xlabel('Average Magnitude', fontweight='bold')
    ax4.set_ylabel('Number of Provinces', fontweight='bold')
    ax4.set_title('Distribution of Average Magnitude', fontweight='bold')
    ax4.grid(axis='y', alpha=0.3)
    
    # 5. Max Magnitude vs Total Quakes
    ax5 = fig.add_subplot(3, 3, 5)
    ax5.scatter(df['total_quakes'], df['max_magnitude'], alpha=0.6, color='orange')
    ax5.set_xlabel('Total Earthquakes', fontweight='bold')
    ax5.set_ylabel('Maximum Magnitude', fontweight='bold')
    ax5.set_title('Max Magnitude vs Activity Level', fontweight='bold')
    ax5.grid(True, alpha=0.3)
    
    # 6. Average Depth Distribution
    ax6 = fig.add_subplot(3, 3, 6)
    ax6.hist(df['avg_depth'], bins=25, color='mediumpurple', edgecolor='indigo', alpha=0.7)
    ax6.set_xlabel('Average Depth (km)', fontweight='bold')
    ax6.set_ylabel('Number of Provinces', fontweight='bold')
    ax6.set_title('Distribution of Average Depth', fontweight='bold')
    ax6.grid(axis='y', alpha=0.3)
    
    # 7. Max Depth vs Average Depth
    ax7 = fig.add_subplot(3, 3, 7)
    ax7.scatter(df['avg_depth'], df['max_depth'], alpha=0.6, color='crimson')
    ax7.set_xlabel('Average Depth (km)', fontweight='bold')
    ax7.set_ylabel('Maximum Depth (km)', fontweight='bold')
    ax7.set_title('Max Depth vs Average Depth', fontweight='bold')
    ax7.grid(True, alpha=0.3)
    
    # 8. Province Count by Activity Level (Binned)
    ax8 = fig.add_subplot(3, 3, 8)
    # Create activity level bins
    bins = [0, 100, 500, 1000, 2000, 5000, float('inf')]
    labels = ['<100', '100-500', '500-1K', '1K-2K', '2K-5K', '>5K']
    df['activity_level'] = pd.cut(df['total_quakes'], bins=bins, labels=labels, right=False)
    activity_counts = df['activity_level'].value_counts().sort_index()
    
    bars = ax8.bar(range(len(activity_counts)), activity_counts.values, 
                   color='gold', edgecolor='darkorange')
    ax8.set_xticks(range(len(activity_counts)))
    ax8.set_xticklabels(activity_counts.index, rotation=45)
    ax8.set_ylabel('Number of Provinces', fontweight='bold')
    ax8.set_title('Provinces by Activity Level', fontweight='bold')
    ax8.grid(axis='y', alpha=0.3)
    
    # Add value labels on bars
    for bar in bars:
        height = bar.get_height()
        if height > 0:
            ax8.text(bar.get_x() + bar.get_width()/2., height,
                    f'{int(height)}', ha='center', va='bottom', fontweight='bold')
    
    # 9. Summary Statistics Table
    ax9 = fig.add_subplot(3, 3, 9)
    ax9.axis('off')
    
    # Create summary stats
    summary_stats = {
        'Metric': [
            'Total Provinces',
            'Total Earthquakes',
            'Total Major Quakes (M≥3.0)',
            'Avg Earthquakes/Province',
            'Most Active Province',
            'Highest Max Magnitude',
            'Avg Magnitude (All)',
            'Avg Depth (All)'
        ],
        'Value': [
            f"{len(df):,}",
            f"{df['total_quakes'].sum():,}",
            f"{df['major_quakes_m3plus'].sum():,}",
            f"{df['total_quakes'].mean():.1f}",
            f"{df.iloc[0]['province']} ({df.iloc[0]['total_quakes']:,})",
            f"{df['max_magnitude'].max():.1f}",
            f"{df['avg_magnitude'].mean():.2f}",
            f"{df['avg_depth'].mean():.1f} km"
        ]
    }
    
    summary_df = pd.DataFrame(summary_stats)
    table = ax9.table(cellText=summary_df.values,
                     colLabels=summary_df.columns,
                     cellLoc='left',
                     loc='center',
                     colWidths=[0.6, 0.4])
    table.auto_set_font_size(False)
    table.set_fontsize(10)
    table.scale(1.2, 2)
    
    # Style the table
    for i in range(len(summary_df.columns)):
        table[(0, i)].set_facecolor('#4CAF50')
        table[(0, i)].set_text_props(weight='bold', color='white')
    
    ax9.set_title('Dataset Summary Statistics', fontweight='bold', fontsize=12, pad=20)
    
    plt.tight_layout()
    
    return fig

def display_top_provinces(df, n=15):
    """Display detailed information about top provinces"""
    print(f"\n{'='*80}")
    print(f"TOP {n} MOST ACTIVE PROVINCES - DETAILED VIEW")
    print(f"{'='*80}")
    
    top_n = df.head(n)
    
    print(f"{'Rank':<5} {'Province':<25} {'Total EQ':>10} {'Major EQ':>10} {'Avg Mag':>10} {'Max Mag':>10} {'Avg Depth':>12}")
    print("-" * 90)
    
    for rank, (_, row) in enumerate(top_n.iterrows(), 1):
        print(f"{rank:<5} {row['province']:<25} {int(row['total_quakes']):>10,} {int(row['major_quakes_m3plus']):>10,} "
              f"{row['avg_magnitude']:>10.2f} {row['max_magnitude']:>10.2f} {row['avg_depth']:>12.1f}")

def main():
    print("="*80)
    print("PROVINCE DATASET VISUALIZATION")
    print("="*80)
    print("Visualizing province features from province_features.csv")
    print("="*80)
    
    # Load data
    df = load_province_features()
    
    # Display top provinces
    display_top_provinces(df)
    
    # Create visualizations
    fig = create_dataset_visualizations(df)
    
    # Save the plot
    current_dir = os.path.dirname(__file__)
    output_path = os.path.join(current_dir, 'province_dataset_visualization.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"\n✓ Dataset visualization saved to: {output_path}")
    
    print(f"\n{'='*80}")
    print("DATASET VISUALIZATION COMPLETE")
    print(f"{'='*80}")
    print(f"✓ {len(df)} provinces visualized")
    print(f"✓ Multiple charts showing data distribution and relationships")
    print(f"✓ Summary statistics and top provinces displayed")
    
    plt.show()

if __name__ == "__main__":
    main()