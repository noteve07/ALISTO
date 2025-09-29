import asyncio
import json
import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent.parent.parent
sys.path.append(str(backend_dir))

from app.core.database import get_supabase_client

async def fetch_municities_data():
    """Fetch all municipalities and cities data from Supabase and save to JSON file"""
    try:
        print("🔄 Connecting to Supabase...")
        supabase = get_supabase_client()
        
        print("📊 Fetching municities data...")
        
        # Handle pagination to get all records
        page_size = 1000
        start = 0
        all_municities = []
        
        while True:
            print(f"  Fetching records {start} to {start + page_size}...")
            response = supabase.table('municities').select('*').range(start, start + page_size - 1).execute()
            
            if not response.data:
                if start == 0:
                    print("❌ No municities data found!")
                    return
                break  # No more data to fetch
            
            batch_size = len(response.data)
            all_municities.extend(response.data)
            print(f"  ✅ Retrieved {batch_size} records")
            
            if batch_size < page_size:
                break  # Last page
            
            start += page_size
        
        municities_data = all_municities
        print(f"✅ Found {len(municities_data)} municipalities and cities total")
        
        # Save to JSON file
        output_file = Path(__file__).parent / "municities_table_test.json"
        
        print(f"💾 Saving data to {output_file}")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(municities_data, f, indent=2, ensure_ascii=False, default=str)
        
        print("✅ Successfully saved municities data to municities_table_test.json")
        
        # Print some stats
        polygon_count = sum(1 for m in municities_data if m.get('boundaries') and m['boundaries'].get('type') == 'Polygon')
        multipolygon_count = sum(1 for m in municities_data if m.get('boundaries') and m['boundaries'].get('type') == 'MultiPolygon')
        centroid_count = sum(1 for m in municities_data if m.get('centroid'))
        
        # Get unique provinces count
        unique_provinces = set(m.get('province_id') for m in municities_data if m.get('province_id'))
        
        print(f"""
📈 Data Summary:
   Total Municipalities/Cities: {len(municities_data)}
   Polygons: {polygon_count}
   MultiPolygons: {multipolygon_count}
   With Centroids: {centroid_count}
   Across {len(unique_provinces)} provinces
   
🎯 File saved: {output_file}
        """)
        
    except Exception as e:
        print(f"❌ Error fetching municities data: {e}")
        return

if __name__ == "__main__":
    asyncio.run(fetch_municities_data())