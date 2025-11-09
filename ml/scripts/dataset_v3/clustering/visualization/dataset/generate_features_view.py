import os
import pandas as pd

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_FILE = os.path.join(THIS_DIR, "province_features_v3.csv")
OUTPUT_HTML = os.path.join(THIS_DIR, "province_features_dataset.html")

def main():
    # load csv
    df = pd.read_csv(CSV_FILE)

    # check column names and expected ones
    expected_cols = [
        "province", "total_quakes", "major_quakes_m3plus",
        "avg_magnitude", "max_magnitude", "min_magnitude",
        "avg_depth", "max_depth", "nearest_fault_km"
    ]
    
    for col in expected_cols:
        if col not in df.columns:
            raise ValueError(f"Missing expected column: {col}")

    # sort alphabetically by province
    df = df.sort_values("province")

    # add rank
    df.insert(0, "rank", range(1, len(df) + 1))

    # start HTML
    html = f"""<!DOCTYPE html>
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
                <th>Nearest Fault Line Distance (km)</th>
            </tr>
        </thead>
        <tbody>
"""

    # add rows
    for _, row in df.iterrows():
        html += f"""            <tr>
                <td class="number">{row['rank']}</td>
                <td class="province">{row['province']}</td>
                <td class="number">{int(row['total_quakes']):,}</td>
                <td class="number">{int(row['major_quakes_m3plus']):,}</td>
                <td class="number">{row['avg_magnitude']:.2f}</td>
                <td class="number">{row['max_magnitude']:.2f}</td>
                <td class="number">{row['min_magnitude']:.2f}</td>
                <td class="number">{row['avg_depth']:.1f}</td>
                <td class="number">{row['max_depth']:.1f}</td>
                <td class="number">{row['nearest_fault_km']:.1f}</td>
            </tr>
"""

    # end html
    html += """        </tbody>
    </table>
</body>
</html>
"""

    # write to file
    with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"HTML table generated: {OUTPUT_HTML}")

if __name__ == "__main__":
    main()
