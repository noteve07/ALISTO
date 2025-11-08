import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import os
from tabulate import tabulate
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
    
    return df

def create_matplotlib_table(df, title="Province Features Dataset", rows_per_page=20):
    """Create a matplotlib table display with pagination"""
    print(f"\nCreating matplotlib table display...")
    
    # Round numeric columns for better display
    df_display = df.copy()
    numeric_columns = ['avg_magnitude', 'max_magnitude', 'min_magnitude', 'avg_depth', 'max_depth']
    for col in numeric_columns:
        if col in df_display.columns:
            df_display[col] = df_display[col].round(2)
    
    # Calculate number of pages needed
    total_rows = len(df_display)
    total_pages = (total_rows + rows_per_page - 1) // rows_per_page
    
    print(f"Dataset has {total_rows} provinces, creating {total_pages} pages ({rows_per_page} rows per page)")
    
    figures = []
    
    for page in range(total_pages):
        start_idx = page * rows_per_page
        end_idx = min(start_idx + rows_per_page, total_rows)
        page_data = df_display.iloc[start_idx:end_idx]
        
        # Create figure
        fig = plt.figure(figsize=(16, 12))
        fig.suptitle(f'{title}\nPage {page + 1} of {total_pages} (Provinces {start_idx + 1}-{end_idx})', 
                     fontsize=16, fontweight='bold', y=0.95)
        
        # Create main table
        ax_main = fig.add_subplot(2, 1, 1)
        ax_main.axis('tight')
        ax_main.axis('off')
        
        # Prepare table data
        table_data = []
        for idx, row in page_data.iterrows():
            table_row = [
                row['province'][:25] + '...' if len(row['province']) > 25 else row['province'],  # Truncate long names
                f"{int(row['total_quakes']):,}",
                f"{int(row['major_quakes_m3plus']):,}",
                f"{row['avg_magnitude']:.2f}",
                f"{row['max_magnitude']:.2f}",
                f"{row['min_magnitude']:.2f}",
                f"{row['avg_depth']:.1f}",
                f"{row['max_depth']:.1f}"
            ]
            table_data.append(table_row)
        
        # Create table headers
        headers = [
            'Province',
            'Total\nEarthquakes',
            'Major EQ\n(M≥3.0)',
            'Avg\nMagnitude',
            'Max\nMagnitude',
            'Min\nMagnitude',
            'Avg Depth\n(km)',
            'Max Depth\n(km)'
        ]
        
        # Create the table
        table = ax_main.table(cellText=table_data,
                             colLabels=headers,
                             cellLoc='center',
                             loc='center',
                             colWidths=[0.25, 0.12, 0.12, 0.10, 0.10, 0.10, 0.11, 0.11])
        
        table.auto_set_font_size(False)
        table.set_fontsize(9)
        table.scale(1, 2.5)
        
        # Style the table
        # Header styling
        for i in range(len(headers)):
            table[(0, i)].set_facecolor('#4CAF50')
            table[(0, i)].set_text_props(weight='bold', color='white')
            table[(0, i)].set_height(0.08)
        
        # Alternate row colors
        for i in range(1, len(table_data) + 1):
            for j in range(len(headers)):
                if i % 2 == 0:
                    table[(i, j)].set_facecolor('#f0f0f0')
                else:
                    table[(i, j)].set_facecolor('#ffffff')
                table[(i, j)].set_height(0.06)
        
        # Add summary statistics subplot
        ax_summary = fig.add_subplot(2, 2, 3)
        ax_summary.axis('off')
        
        # Calculate page statistics
        page_total_eq = page_data['total_quakes'].sum()
        page_major_eq = page_data['major_quakes_m3plus'].sum()
        page_avg_mag = page_data['avg_magnitude'].mean()
        page_max_mag = page_data['max_magnitude'].max()
        
        summary_text = f"""
PAGE {page + 1} SUMMARY:
Provinces: {len(page_data)}
Total Earthquakes: {page_total_eq:,}
Major Earthquakes: {page_major_eq:,}
Avg Magnitude: {page_avg_mag:.2f}
Max Magnitude: {page_max_mag:.2f}

DATASET SUMMARY:
Total Provinces: {len(df):,}
Total Earthquakes: {df['total_quakes'].sum():,}
Major Earthquakes: {df['major_quakes_m3plus'].sum():,}
        """
        
        ax_summary.text(0.1, 0.9, summary_text, fontsize=10, verticalalignment='top',
                       bbox=dict(boxstyle="round,pad=0.5", facecolor="lightblue", alpha=0.8))
        ax_summary.set_title("Statistics", fontweight='bold')
        
        # Add top 5 in this page subplot
        ax_top5 = fig.add_subplot(2, 2, 4)
        ax_top5.axis('off')
        
        top_5_page = page_data.nlargest(5, 'total_quakes')
        top5_text = "TOP 5 IN THIS PAGE:\n\n"
        for i, (_, row) in enumerate(top_5_page.iterrows(), 1):
            province_name = row['province'][:20] + '...' if len(row['province']) > 20 else row['province']
            top5_text += f"{i}. {province_name}\n   {int(row['total_quakes']):,} earthquakes\n\n"
        
        ax_top5.text(0.1, 0.9, top5_text, fontsize=9, verticalalignment='top',
                    bbox=dict(boxstyle="round,pad=0.5", facecolor="lightyellow", alpha=0.8))
        ax_top5.set_title("Most Active (This Page)", fontweight='bold')
        
        plt.tight_layout()
        figures.append(fig)
    
    return figures

def create_summary_table(df):
    """Create a summary statistics table using matplotlib"""
    print("\nCreating summary statistics table...")
    
    fig = plt.figure(figsize=(14, 10))
    fig.suptitle('Province Features Dataset - Summary Statistics', 
                 fontsize=16, fontweight='bold', y=0.95)
    
    # Main summary table
    ax1 = fig.add_subplot(2, 2, 1)
    ax1.axis('tight')
    ax1.axis('off')
    ax1.set_title('Descriptive Statistics', fontweight='bold', pad=20)
    
    # Calculate summary statistics
    stats_df = df.describe()
    
    # Prepare data for table
    stats_data = []
    for stat_name in ['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max']:
        row = [stat_name]
        for col in stats_df.columns:
            if stat_name == 'count':
                row.append(f"{int(stats_df.loc[stat_name, col])}")
            else:
                row.append(f"{stats_df.loc[stat_name, col]:.2f}")
        stats_data.append(row)
    
    headers = ['Statistic'] + list(stats_df.columns)
    
    table1 = ax1.table(cellText=stats_data,
                      colLabels=headers,
                      cellLoc='center',
                      loc='center',
                      colWidths=[0.15] + [0.12] * (len(headers) - 1))
    
    table1.auto_set_font_size(False)
    table1.set_fontsize(8)
    table1.scale(1, 1.8)
    
    # Style the table
    for i in range(len(headers)):
        table1[(0, i)].set_facecolor('#FF9800')
        table1[(0, i)].set_text_props(weight='bold', color='white')
    
    # Top 10 provinces table
    ax2 = fig.add_subplot(2, 2, 2)
    ax2.axis('tight')
    ax2.axis('off')
    ax2.set_title('Top 10 Most Active Provinces', fontweight='bold', pad=20)
    
    top_10 = df.head(10)
    top10_data = []
    for i, (_, row) in enumerate(top_10.iterrows(), 1):
        province_name = row['province'][:20] + '...' if len(row['province']) > 20 else row['province']
        top10_data.append([
            str(i),
            province_name,
            f"{int(row['total_quakes']):,}",
            f"{int(row['major_quakes_m3plus']):,}",
            f"{row['max_magnitude']:.1f}"
        ])
    
    top10_headers = ['Rank', 'Province', 'Total EQ', 'Major EQ', 'Max Mag']
    
    table2 = ax2.table(cellText=top10_data,
                      colLabels=top10_headers,
                      cellLoc='center',
                      loc='center',
                      colWidths=[0.1, 0.4, 0.2, 0.2, 0.1])
    
    table2.auto_set_font_size(False)
    table2.set_fontsize(9)
    table2.scale(1, 1.8)
    
    # Style the table
    for i in range(len(top10_headers)):
        table2[(0, i)].set_facecolor('#4CAF50')
        table2[(0, i)].set_text_props(weight='bold', color='white')
    
    # Activity level distribution
    ax3 = fig.add_subplot(2, 2, 3)
    ax3.axis('tight')
    ax3.axis('off')
    ax3.set_title('Activity Level Distribution', fontweight='bold', pad=20)
    
    # Define activity level bins
    bins = [0, 100, 500, 1000, 2000, 5000, float('inf')]
    labels = ['<100', '100-500', '500-1K', '1K-2K', '2K-5K', '>5K']
    df['activity_level'] = pd.cut(df['total_quakes'], bins=bins, labels=labels, right=False)
    
    activity_counts = df['activity_level'].value_counts().sort_index()
    
    activity_data = []
    for level, count in activity_counts.items():
        percentage = (count / len(df)) * 100
        activity_data.append([level, str(count), f"{percentage:.1f}%"])
    
    activity_headers = ['Activity Level', 'Provinces', 'Percentage']
    
    table3 = ax3.table(cellText=activity_data,
                      colLabels=activity_headers,
                      cellLoc='center',
                      loc='center',
                      colWidths=[0.4, 0.3, 0.3])
    
    table3.auto_set_font_size(False)
    table3.set_fontsize(10)
    table3.scale(1, 1.8)
    
    # Style the table
    for i in range(len(activity_headers)):
        table3[(0, i)].set_facecolor('#9C27B0')
        table3[(0, i)].set_text_props(weight='bold', color='white')
    
    # Dataset overview
    ax4 = fig.add_subplot(2, 2, 4)
    ax4.axis('off')
    
    overview_text = f"""
DATASET OVERVIEW

📊 Total Provinces: {len(df):,}
🌍 Total Earthquakes: {df['total_quakes'].sum():,}
⚡ Major Earthquakes (M≥3.0): {df['major_quakes_m3plus'].sum():,}
📈 Average per Province: {df['total_quakes'].mean():.1f}

🏆 Most Active: {df.iloc[0]['province']}
   ({df.iloc[0]['total_quakes']:,} earthquakes)

💪 Highest Max Magnitude: {df['max_magnitude'].max():.1f}
🌊 Deepest Earthquake: {df['max_depth'].max():.0f} km
📊 Avg Province Magnitude: {df['avg_magnitude'].mean():.2f}
    """
    
    ax4.text(0.1, 0.9, overview_text, fontsize=12, verticalalignment='top',
            bbox=dict(boxstyle="round,pad=0.8", facecolor="lightgreen", alpha=0.8),
            fontfamily='monospace')
    
    plt.tight_layout()
    
    return fig
    """Display the full dataset in tabular format"""
    print(f"\n{'='*120}")
    print("COMPLETE PROVINCE FEATURES DATASET")
    print(f"{'='*120}")
    
    # Round numeric columns for better display
    df_display = df.copy()
    numeric_columns = ['avg_magnitude', 'max_magnitude', 'min_magnitude', 'avg_depth', 'max_depth']
    for col in numeric_columns:
        if col in df_display.columns:
            df_display[col] = df_display[col].round(2)
    
    # Display full table using tabulate
    table = tabulate(
        df_display.values,
        headers=df_display.columns,
        tablefmt='grid',
        showindex=True,
        numalign='right',
        stralign='left'
    )
    
    print(table)

def display_summary_stats(df):
    """Display summary statistics"""
    print(f"\n{'='*80}")
    print("DATASET SUMMARY STATISTICS")
    print(f"{'='*80}")
    
    # Basic info
    print(f"Total Provinces: {len(df)}")
    print(f"Total Earthquakes: {df['total_quakes'].sum():,}")
    print(f"Total Major Earthquakes (M≥3.0): {df['major_quakes_m3plus'].sum():,}")
    
    # Create summary statistics table
    summary_stats = df.describe()
    summary_stats_rounded = summary_stats.round(2)
    
    print(f"\nDESCRIPTIVE STATISTICS:")
    print("-" * 80)
    
    summary_table = tabulate(
        summary_stats_rounded.values,
        headers=summary_stats_rounded.columns,
        tablefmt='grid',
        showindex=True,
        numalign='right'
    )
    
    print(summary_table)

def display_top_bottom_provinces(df, n=10):
    """Display top and bottom N provinces"""
    print(f"\n{'='*80}")
    print(f"TOP {n} MOST ACTIVE PROVINCES")
    print(f"{'='*80}")
    
    top_n = df.head(n)
    top_table = tabulate(
        top_n.values,
        headers=top_n.columns,
        tablefmt='grid',
        showindex=False,
        numalign='right',
        stralign='left'
    )
    print(top_table)
    
    print(f"\n{'='*80}")
    print(f"BOTTOM {n} LEAST ACTIVE PROVINCES")
    print(f"{'='*80}")
    
    bottom_n = df.tail(n)
    bottom_table = tabulate(
        bottom_n.values,
        headers=bottom_n.columns,
        tablefmt='grid',
        showindex=False,
        numalign='right',
        stralign='left'
    )
    print(bottom_table)

def display_activity_level_groups(df):
    """Display provinces grouped by activity level"""
    print(f"\n{'='*80}")
    print("PROVINCES GROUPED BY ACTIVITY LEVEL")
    print(f"{'='*80}")
    
    # Define activity level bins
    bins = [0, 100, 500, 1000, 2000, 5000, float('inf')]
    labels = ['Very Low (<100)', 'Low (100-500)', 'Medium (500-1K)', 
              'High (1K-2K)', 'Very High (2K-5K)', 'Extreme (>5K)']
    
    df['activity_level'] = pd.cut(df['total_quakes'], bins=bins, labels=labels, right=False)
    
    for level in labels:
        group_data = df[df['activity_level'] == level]
        if len(group_data) > 0:
            print(f"\n{level.upper()} ACTIVITY LEVEL ({len(group_data)} provinces):")
            print("-" * 60)
            
            # Show only essential columns for cleaner display
            display_cols = ['province', 'total_quakes', 'major_quakes_m3plus', 'max_magnitude']
            group_display = group_data[display_cols].copy()
            
            group_table = tabulate(
                group_display.values,
                headers=group_display.columns,
                tablefmt='simple',
                showindex=False,
                numalign='right',
                stralign='left'
            )
            print(group_table)

def display_magnitude_analysis(df):
    """Display analysis focused on magnitude patterns"""
    print(f"\n{'='*80}")
    print("MAGNITUDE ANALYSIS BY PROVINCE")
    print(f"{'='*80}")
    
    # Provinces with highest max magnitude
    print("\nPROVINCES WITH HIGHEST MAXIMUM MAGNITUDE:")
    print("-" * 50)
    
    highest_mag = df.nlargest(10, 'max_magnitude')[['province', 'max_magnitude', 'total_quakes', 'major_quakes_m3plus']]
    mag_table = tabulate(
        highest_mag.values,
        headers=highest_mag.columns,
        tablefmt='simple',
        showindex=False,
        numalign='right',
        stralign='left'
    )
    print(mag_table)
    
    # Provinces with highest average magnitude
    print("\nPROVINCES WITH HIGHEST AVERAGE MAGNITUDE:")
    print("-" * 50)
    
    highest_avg_mag = df.nlargest(10, 'avg_magnitude')[['province', 'avg_magnitude', 'total_quakes', 'max_magnitude']]
    avg_mag_table = tabulate(
        highest_avg_mag.values,
        headers=highest_avg_mag.columns,
        tablefmt='simple',
        showindex=False,
        numalign='right',
        stralign='left'
    )
    print(avg_mag_table)

def save_compact_html(df):
    """Save a compact HTML table that fits within 100vh"""
    current_dir = os.path.dirname(__file__)
    html_file = os.path.join(current_dir, 'province_features_compact.html')
    
    # Create a compact styled HTML table
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Province Features Dataset</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }}
            
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                max-height: 100vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }}
            
            .header {{
                background: rgba(255, 255, 255, 0.95);
                padding: 15px 20px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                backdrop-filter: blur(10px);
            }}
            
            .header h1 {{
                color: #333;
                font-size: 24px;
                margin-bottom: 5px;
            }}
            
            .stats {{
                display: flex;
                gap: 20px;
                font-size: 14px;
                color: #666;
            }}
            
            .stats span {{
                background: #e3f2fd;
                padding: 4px 8px;
                border-radius: 4px;
                font-weight: 500;
            }}
            
            .table-container {{
                flex: 1;
                overflow: auto;
                margin: 10px;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                backdrop-filter: blur(10px);
            }}
            
            table {{
                width: 100%;
                border-collapse: collapse;
                font-size: 13px;
            }}
            
            thead {{
                position: sticky;
                top: 0;
                background: linear-gradient(135deg, #4CAF50, #45a049);
                z-index: 10;
            }}
            
            th {{
                color: white;
                font-weight: 600;
                padding: 12px 8px;
                text-align: center;
                border-bottom: 2px solid #45a049;
                white-space: nowrap;
                font-size: 12px;
            }}
            
            td {{
                padding: 8px;
                text-align: center;
                border-bottom: 1px solid #e0e0e0;
                transition: background-color 0.2s;
            }}
            
            tr:nth-child(even) {{
                background-color: #f8f9fa;
            }}
            
            tr:hover {{
                background-color: #e8f5e8 !important;
                transform: scale(1.01);
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }}
            
            .province {{
                text-align: left !important;
                font-weight: 500;
                color: #2c3e50;
                max-width: 200px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }}
            
            .number {{
                font-family: 'Courier New', monospace;
                font-weight: 500;
            }}
            
            .high-activity {{
                background: linear-gradient(45deg, #ff6b6b, #ee5a52) !important;
                color: white;
            }}
            
            .medium-activity {{
                background: linear-gradient(45deg, #feca57, #ff9ff3) !important;
                color: white;
            }}
            
            .low-activity {{
                background: linear-gradient(45deg, #48dbfb, #0abde3) !important;
                color: white;
            }}
            
            .magnitude-high {{
                color: #d32f2f;
                font-weight: bold;
            }}
            
            .magnitude-medium {{
                color: #f57c00;
                font-weight: bold;
            }}
            
            .magnitude-low {{
                color: #388e3c;
                font-weight: bold;
            }}
            
            ::-webkit-scrollbar {{
                width: 8px;
                height: 8px;
            }}
            
            ::-webkit-scrollbar-track {{
                background: #f1f1f1;
                border-radius: 4px;
            }}
            
            ::-webkit-scrollbar-thumb {{
                background: linear-gradient(45deg, #667eea, #764ba2);
                border-radius: 4px;
            }}
            
            ::-webkit-scrollbar-thumb:hover {{
                background: linear-gradient(45deg, #5a67d8, #6b46c1);
            }}
            
            @media (max-width: 768px) {{
                .stats {{
                    flex-direction: column;
                    gap: 5px;
                }}
                
                th, td {{
                    padding: 6px 4px;
                    font-size: 11px;
                }}
                
                .header h1 {{
                    font-size: 20px;
                }}
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🌍 Province Earthquake Features</h1>
            <div class="stats">
                <span>📊 {len(df)} Provinces</span>
                <span>🌍 {df['total_quakes'].sum():,} Total Earthquakes</span>
                <span>⚡ {df['major_quakes_m3plus'].sum():,} Major (M≥3.0)</span>
                <span>📈 Avg: {df['total_quakes'].mean():.0f}/province</span>
                <span>💪 Max Mag: {df['max_magnitude'].max():.1f}</span>
            </div>
        </div>
        
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>🏆 Rank</th>
                        <th>📍 Province</th>
                        <th>🌍 Total<br>Earthquakes</th>
                        <th>⚡ Major EQ<br>(M≥3.0)</th>
                        <th>📊 Avg<br>Magnitude</th>
                        <th>💪 Max<br>Magnitude</th>
                        <th>📉 Min<br>Magnitude</th>
                        <th>🌊 Avg Depth<br>(km)</th>
                        <th>🏔️ Max Depth<br>(km)</th>
                    </tr>
                </thead>
                <tbody>
    """
    
    # Add table rows with conditional styling
    for rank, (_, row) in enumerate(df.iterrows(), 1):
        # Determine activity level class
        total_eq = int(row['total_quakes'])
        if total_eq >= 2000:
            activity_class = 'high-activity'
        elif total_eq >= 500:
            activity_class = 'medium-activity'
        else:
            activity_class = 'low-activity'
        
        # Determine magnitude class
        max_mag = float(row['max_magnitude'])
        if max_mag >= 6.0:
            mag_class = 'magnitude-high'
        elif max_mag >= 4.0:
            mag_class = 'magnitude-medium'
        else:
            mag_class = 'magnitude-low'
        
        html_content += f"""
                    <tr class="{activity_class if rank <= 10 else ''}">
                        <td class="number"><strong>{rank}</strong></td>
                        <td class="province" title="{row['province']}">{row['province']}</td>
                        <td class="number">{total_eq:,}</td>
                        <td class="number">{int(row['major_quakes_m3plus']):,}</td>
                        <td class="number">{row['avg_magnitude']:.2f}</td>
                        <td class="number {mag_class}">{row['max_magnitude']:.2f}</td>
                        <td class="number">{row['min_magnitude']:.2f}</td>
                        <td class="number">{row['avg_depth']:.1f}</td>
                        <td class="number">{row['max_depth']:.1f}</td>
                    </tr>
        """
    
    html_content += """
                </tbody>
            </table>
        </div>
        
        <script>
            // Add smooth scrolling and dynamic highlighting
            document.addEventListener('DOMContentLoaded', function() {
                const rows = document.querySelectorAll('tbody tr');
                
                // Highlight top performers
                rows.forEach((row, index) => {
                    if (index < 3) {
                        const rankCell = row.querySelector('td:first-child');
                        rankCell.innerHTML = `�${index === 0 ? '🏅' : index === 1 ? '🥈' : '🥉'} <strong>${index + 1}</strong>`;
                    }
                });
                
                // Add click to highlight functionality
                rows.forEach(row => {
                    row.addEventListener('click', function() {
                        rows.forEach(r => r.style.outline = 'none');
                        this.style.outline = '3px solid #4CAF50';
                        this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    });
                });
            });
        </script>
    </body>
    </html>
    """
    
    # Save HTML file
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"\n✓ Compact HTML table saved to: {html_file}")
    return html_file
    """Save the table as an HTML file for better viewing"""
    current_dir = os.path.dirname(__file__)
    html_file = os.path.join(current_dir, 'province_features_table.html')
    
    # Create a styled HTML table
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Province Features Dataset</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                margin: 20px;
                background-color: #f5f5f5;
            }}
            h1 {{
                color: #333;
                text-align: center;
            }}
            table {{
                border-collapse: collapse;
                width: 100%;
                margin: 20px 0;
                background-color: white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }}
            th, td {{
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
            }}
            th {{
                background-color: #4CAF50;
                color: white;
                font-weight: bold;
            }}
            tr:nth-child(even) {{
                background-color: #f2f2f2;
            }}
            tr:hover {{
                background-color: #e8f5e8;
            }}
            .number {{
                text-align: right;
            }}
            .summary {{
                background-color: #e7f3ff;
                padding: 10px;
                border-radius: 5px;
                margin: 20px 0;
            }}
        </style>
    </head>
    <body>
        <h1>Province Earthquake Features Dataset</h1>
        
        <div class="summary">
            <h2>Dataset Summary</h2>
            <p><strong>Total Provinces:</strong> {len(df)}</p>
            <p><strong>Total Earthquakes:</strong> {df['total_quakes'].sum():,}</p>
            <p><strong>Total Major Earthquakes (M≥3.0):</strong> {df['major_quakes_m3plus'].sum():,}</p>
            <p><strong>Date Generated:</strong> {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
        </div>
    """
    
    # Convert DataFrame to HTML
    df_html = df.to_html(classes='table', escape=False, index=False, 
                        float_format=lambda x: f'{x:.2f}' if pd.notnull(x) else '')
    
    html_content += df_html + """
    </body>
    </html>
    """
    
    # Save HTML file
    with open(html_file, 'w') as f:
        f.write(html_content)
    
    print(f"\n✓ HTML table saved to: {html_file}")
    return html_file

def main():
    print("="*120)
    print("PROVINCE FEATURES DATASET - COMPACT HTML TABLE")
    print("="*120)
    print("Creating compact HTML table that fits within 100vh")
    print("="*120)
    
    try:
        # Load data
        df = load_province_features()
        
        # Display basic info in console
        print(f"\n📊 Dataset Overview:")
        print(f"   Provinces: {len(df)}")
        print(f"   Total Earthquakes: {df['total_quakes'].sum():,}")
        print(f"   Major Earthquakes (M≥3.0): {df['major_quakes_m3plus'].sum():,}")
        print(f"   Average per Province: {df['total_quakes'].mean():.1f}")
        print(f"   Highest Max Magnitude: {df['max_magnitude'].max():.1f}")
        
        # Show top 5 provinces in console
        print(f"\n🏆 Top 5 Most Active Provinces:")
        print("-" * 60)
        for i, (_, row) in enumerate(df.head(5).iterrows(), 1):
            print(f"   {i}. {row['province']:<25} {int(row['total_quakes']):>6,} earthquakes")
        
        # Create compact HTML
        html_file = save_compact_html(df)
        
        print(f"\n{'='*120}")
        print("COMPACT HTML TABLE COMPLETE")
        print(f"{'='*120}")
        print(f"✓ Compact HTML table created: {os.path.basename(html_file)}")
        print(f"✓ Table fits within 100vh viewport")
        print(f"✓ Features:")
        print(f"   - Sticky header with gradient background")
        print(f"   - Smooth scrolling and hover effects")
        print(f"   - Color-coded activity levels and magnitudes")
        print(f"   - Responsive design for mobile/desktop")
        print(f"   - Interactive row highlighting")
        print(f"   - Top 3 provinces get medal emojis 🏅🥈🥉")
        print(f"\n💡 Open {os.path.basename(html_file)} in your browser to view!")
        
    except Exception as e:
        print(f"Error: {e}")
        # Fallback
        print("Creating simple HTML fallback...")
        df = load_province_features()
        simple_html = df.to_html(classes='table table-striped', escape=False)
        with open('simple_table.html', 'w') as f:
            f.write(f"<html><head><title>Province Data</title></head><body>{simple_html}</body></html>")
        print("✓ Simple HTML table created as fallback")

if __name__ == "__main__":
    main()