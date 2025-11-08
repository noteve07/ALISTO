import pandas as pd
import matplotlib.pyplot as plt
import os
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

def create_simple_table(df, rows_per_page=30):
    """Create simple matplotlib table for screenshots"""
    print(f"\nCreating simple table for screenshots...")
    
    # Round numeric columns
    df_display = df.copy()
    numeric_columns = ['avg_magnitude', 'max_magnitude', 'min_magnitude', 'avg_depth', 'max_depth']
    for col in numeric_columns:
        if col in df_display.columns:
            df_display[col] = df_display[col].round(2)
    
    # Calculate pages
    total_rows = len(df_display)
    total_pages = (total_rows + rows_per_page - 1) // rows_per_page
    
    print(f"Creating {total_pages} pages ({rows_per_page} rows per page)")
    
    figures = []
    
    for page in range(total_pages):
        start_idx = page * rows_per_page
        end_idx = min(start_idx + rows_per_page, total_rows)
        page_data = df_display.iloc[start_idx:end_idx]
        
        # Create figure
        fig = plt.figure(figsize=(16, 10))
        fig.suptitle(f'Province Earthquake Features Dataset - Page {page + 1} of {total_pages}', 
                     fontsize=16, fontweight='bold', y=0.95)
        
        # Create table
        ax = fig.add_subplot(1, 1, 1)
        ax.axis('tight')
        ax.axis('off')
        
        # Prepare table data
        table_data = []
        for idx, row in page_data.iterrows():
            table_row = [
                start_idx + len(table_data) + 1,  # Rank
                row['province'],
                f"{int(row['total_quakes']):,}",
                f"{int(row['major_quakes_m3plus']):,}",
                f"{row['avg_magnitude']:.2f}",
                f"{row['max_magnitude']:.2f}",
                f"{row['min_magnitude']:.2f}",
                f"{row['avg_depth']:.1f}",
                f"{row['max_depth']:.1f}"
            ]
            table_data.append(table_row)
        
        # Simple headers
        headers = [
            'Rank',
            'Province',
            'Total Earthquakes',
            'Major Earthquakes (M≥3.0)',
            'Avg Magnitude',
            'Max Magnitude',
            'Min Magnitude',
            'Avg Depth (km)',
            'Max Depth (km)'
        ]
        
        # Create the table
        table = ax.table(cellText=table_data,
                        colLabels=headers,
                        cellLoc='center',
                        loc='center',
                        colWidths=[0.08, 0.25, 0.12, 0.14, 0.10, 0.10, 0.10, 0.11, 0.11])
        
        table.auto_set_font_size(False)
        table.set_fontsize(10)
        table.scale(1, 1.8)
        
        # Simple styling - just black and white
        # Header styling
        for i in range(len(headers)):
            table[(0, i)].set_facecolor('#333333')
            table[(0, i)].set_text_props(weight='bold', color='white')
        
        # Alternate row colors - very subtle
        for i in range(1, len(table_data) + 1):
            for j in range(len(headers)):
                if i % 2 == 0:
                    table[(i, j)].set_facecolor('#f8f8f8')
                else:
                    table[(i, j)].set_facecolor('#ffffff')
                
                # Make province names left-aligned
                if j == 1:  # Province column
                    table[(i, j)].set_text_props(ha='left')
        
        plt.tight_layout()
        figures.append(fig)
    
    return figures

def save_simple_html(df):
    """Create ultra-simple HTML table for screenshots"""
    current_dir = os.path.dirname(__file__)
    html_file = os.path.join(current_dir, 'province_features_simple.html')
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Province Features Dataset</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                margin: 20px;
                background: white;
            }}
            
            h1 {{
                color: #333;
                font-size: 24px;
                margin-bottom: 20px;
                text-align: center;
            }}
            
            table {{
                width: 100%;
                border-collapse: collapse;
                margin: 0 auto;
                background: white;
                font-size: 13px;
            }}
            
            th {{
                background-color: #333;
                color: white;
                font-weight: bold;
                padding: 12px 8px;
                text-align: center;
                border: 1px solid #ddd;
            }}
            
            td {{
                padding: 8px;
                text-align: center;
                border: 1px solid #ddd;
            }}
            
            tr:nth-child(even) {{
                background-color: #f8f8f8;
            }}
            
            .province {{
                text-align: left !important;
                font-weight: 500;
            }}
            
            .number {{
                text-align: right !important;
                font-family: monospace;
            }}
        </style>
    </head>
    <body>
        <h1>Province Earthquake Features Dataset</h1>
        <p><strong>Total Provinces:</strong> {len(df)} | <strong>Total Earthquakes:</strong> {df['total_quakes'].sum():,} | <strong>Major Earthquakes:</strong> {df['major_quakes_m3plus'].sum():,}</p>
        
        <table>
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Province</th>
                    <th>Total Earthquakes</th>
                    <th>Major Earthquakes (M≥3.0)</th>
                    <th>Avg Magnitude</th>
                    <th>Max Magnitude</th>
                    <th>Min Magnitude</th>
                    <th>Avg Depth (km)</th>
                    <th>Max Depth (km)</th>
                </tr>
            </thead>
            <tbody>
    """
    
    # Add simple table rows
    for rank, (_, row) in enumerate(df.iterrows(), 1):
        html_content += f"""
                <tr>
                    <td class="number">{rank}</td>
                    <td class="province">{row['province']}</td>
                    <td class="number">{int(row['total_quakes']):,}</td>
                    <td class="number">{int(row['major_quakes_m3plus']):,}</td>
                    <td class="number">{row['avg_magnitude']:.2f}</td>
                    <td class="number">{row['max_magnitude']:.2f}</td>
                    <td class="number">{row['min_magnitude']:.2f}</td>
                    <td class="number">{row['avg_depth']:.1f}</td>
                    <td class="number">{row['max_depth']:.1f}</td>
                </tr>
        """
    
    html_content += """
            </tbody>
        </table>
    </body>
    </html>
    """
    
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✓ Simple HTML table saved to: {html_file}")
    return html_file

def main():
    print("="*80)
    print("SIMPLE PROVINCE DATASET TABLE (FOR SCREENSHOTS)")
    print("="*80)
    
    # Load data
    df = load_province_features()
    
    # Create simple matplotlib tables
    figures = create_simple_table(df, rows_per_page=30)
    
    # Create simple HTML
    html_file = save_simple_html(df)
    
    # Save matplotlib figures
    current_dir = os.path.dirname(__file__)
    
    for i, fig in enumerate(figures):
        output_path = os.path.join(current_dir, f'province_dataset_page_{i+1}.png')
        fig.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
        print(f"✓ Page {i+1} saved to: {os.path.basename(output_path)}")
    
    print(f"\n✓ {len(figures)} clean table images created")
    print(f"✓ Simple HTML table: {os.path.basename(html_file)}")
    print(f"✓ Perfect for screenshots - clean, simple, professional")
    
    plt.show()

if __name__ == "__main__":
    main()