import asyncio
import json
import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent.parent.parent
sys.path.append(str(backend_dir))

from app.core.database import get_supabase_client

async def fetch_province_data():
    """Fetch all provinces data from Supabase and save to JSON file"""
    try:
        print("🔄 Connecting to Supabase...")
        supabase = get_supabase_client()
        
        print("📊 Fetching provinces data...")
        response = supabase.table('provinces').select('*').execute()
        
        if not response.data:
            print("❌ No provinces data found!")
            return
        
        provinces_data = response.data
        print(f"✅ Found {len(provinces_data)} provinces")
        
        # Save to JSON file
        output_file = Path(__file__).parent / "province_table_test.json"
        
        print(f"💾 Saving data to {output_file}")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(provinces_data, f, indent=2, ensure_ascii=False, default=str)
        
        print("✅ Successfully saved provinces data to province_table_test.json")
        
        # Print some stats
        polygon_count = sum(1 for p in provinces_data if p.get('boundaries') and p['boundaries'].startswith('POLYGON'))
        multipolygon_count = sum(1 for p in provinces_data if p.get('boundaries') and p['boundaries'].startswith('MULTIPOLYGON'))
        centroid_count = sum(1 for p in provinces_data if p.get('centroid'))
        
        print(f"""
📈 Data Summary:
   Total Provinces: {len(provinces_data)}
   Polygons: {polygon_count}
   MultiPolygons: {multipolygon_count}
   With Centroids: {centroid_count}
   
🎯 File saved: {output_file}
        """)
        
    except Exception as e:
        print(f"❌ Error fetching province data: {e}")
        return

if __name__ == "__main__":
    asyncio.run(fetch_province_data())