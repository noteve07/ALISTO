# scripts/database/init_province_data.py
"""
Script to populate provinces table with all Philippine provinces from GeoJSON data
Includes geometry boundaries, centroids, and risk scores
"""

import asyncio
import json
from typing import List, Dict, Tuple
from pathlib import Path
import sys

# Add backend to path
backend_path = Path(__file__).parent.parent.parent.parent
sys.path.append(str(backend_path))

from app.core.database import supabase

class ProvinceSeeder:
    def __init__(self):
        self.table_name = "provinces"
        
    def load_provinces_geojson(self) -> Dict:
        """Load provinces data from the GeoJSON file"""
        try:
            # Path to your provinces.json file (now in backend/src/)
            json_path = Path(__file__).parent.parent.parent.parent / "src" / "provinces.json"
            
            with open(json_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"❌ Error loading provinces.json: {e}")
            return None

    def calculate_centroid_from_geometry(self, geometry: Dict) -> Tuple[float, float]:
        """Calculate centroid from polygon coordinates"""
        try:
            if geometry["type"] == "Polygon":
                coordinates = geometry["coordinates"][0]  # Exterior ring
            elif geometry["type"] == "MultiPolygon":
                # Use the largest polygon for centroid calculation
                coordinates = geometry["coordinates"][0][0]
            else:
                return None, None
            
            # Simple centroid calculation (average of coordinates)
            x_coords = [coord[0] for coord in coordinates]
            y_coords = [coord[1] for coord in coordinates]
            
            centroid_lng = sum(x_coords) / len(x_coords)
            centroid_lat = sum(y_coords) / len(y_coords)
            
            return centroid_lat, centroid_lng
        except Exception as e:
            print(f"⚠️ Error calculating centroid: {e}")
            return None, None

    def geometry_to_wkt(self, geometry: Dict) -> str:
        """Convert GeoJSON geometry to WKT format"""
        try:
            if geometry['type'] == 'Polygon':
                # Convert Polygon coordinates to WKT  
                exterior_ring = geometry['coordinates'][0]
                coords_str = ', '.join([f"{lon} {lat}" for lon, lat in exterior_ring])
                return f"POLYGON(({coords_str}))"
            
            elif geometry['type'] == 'MultiPolygon':
                # Convert MultiPolygon coordinates to WKT
                polygons = []
                for polygon in geometry['coordinates']:
                    exterior_ring = polygon[0]  # Only exterior ring for now
                    coords_str = ', '.join([f"{lon} {lat}" for lon, lat in exterior_ring])
                    polygons.append(f"(({coords_str}))")
                return f"MULTIPOLYGON({', '.join(polygons)})"
            
            else:
                return None
        except Exception as e:
            print(f"⚠️ Error converting geometry to WKT: {e}")
            return None

    def get_philippine_provinces_data(self) -> List[Dict]:
        """
        Process GeoJSON data and return province information
        """
        geojson_data = self.load_provinces_geojson()
        if not geojson_data:
            print("❌ Failed to load GeoJSON data")
            return []
        
        provinces_data = []
        
        print(f"📊 Processing {len(geojson_data.get('features', []))} provinces from GeoJSON...")
        
        for feature in geojson_data.get("features", []):
            try:
                properties = feature.get("properties", {})
                geometry = feature.get("geometry", {})
                
                # Extract province name from NAME_1 field
                province_name = properties.get("NAME_1", "").strip()
                if not province_name:
                    continue
                
                # Calculate centroid from geometry
                centroid_lat, centroid_lng = self.calculate_centroid_from_geometry(geometry)
                if centroid_lat is None or centroid_lng is None:
                    print(f"⚠️ Could not calculate centroid for {province_name}")
                    continue
                
                province_data = {
                    "name": province_name,
                    "latitude": centroid_lat,
                    "longitude": centroid_lng,
                    "geometry": geometry
                }
                
                provinces_data.append(province_data)
                print(f"✅ Processed: {province_name}")
                
            except Exception as e:
                province_name = properties.get("NAME_1", "Unknown")
                print(f"❌ Error processing {province_name}: {e}")
                continue
        
        print(f"🎉 Successfully processed {len(provinces_data)} provinces")
        return provinces_data
    

    
    async def clear_existing_data(self):
        """Clear existing province data"""
        try:
            result = supabase.table(self.table_name).delete().neq('province_id', 0).execute()
            print(f"🗑️ Cleared existing province data")
            return True
        except Exception as e:
            print(f"❌ Error clearing data: {e}")
            return False
    
    async def seed_provinces(self, clear_first: bool = False):
        """Seed provinces table with Philippine provinces data"""
        try:
            if clear_first:
                await self.clear_existing_data()
            
            provinces_data = self.get_philippine_provinces_data()
            
            if not provinces_data:
                print("❌ No province data available to seed")
                return False
            
            print(f"🌍 Seeding {len(provinces_data)} Philippine provinces...")
            
            total_inserted = 0
            
            for province in provinces_data:
                try:
                    # Convert geometry to WKT format using the helper method
                    boundaries_wkt = self.geometry_to_wkt(province['geometry'])
                    centroid_wkt = f"POINT({province['longitude']} {province['latitude']})"
                    
                    result = supabase.table(self.table_name).insert({
                        "name": province['name'],
                        "boundaries": boundaries_wkt,
                        "centroid": centroid_wkt
                    }).execute()
                    
                    if result.data:
                        print(f"✅ Inserted {province['name']}")
                        total_inserted += 1
                        
                except Exception as province_error:
                    print(f"❌ Error processing {province['name']}: {province_error}")
                    continue
            
            print(f"🎉 Successfully inserted {total_inserted} provinces!")
            return True
            
        except Exception as e:
            print(f"❌ Error seeding provinces: {e}")
            return False
    

    
    async def get_stats(self):
        """Get seeding statistics"""
        try:
            result = supabase.table(self.table_name).select("*", count='exact').execute()
            print(f"📊 Total provinces in database: {result.count}")
            
            # Show sample data
            if result.data:
                print("📋 Sample provinces:")
                for province in result.data[:5]:
                    print(f"   - {province['name']}")
            
        except Exception as e:
            print(f"❌ Error getting stats: {e}")

async def main():
    """Main seeding function"""
    print("🚀 Starting Philippine Provinces Data Seeding...")
    
    seeder = ProvinceSeeder()
    
    # Show current stats
    print("\n📊 Current database state:")
    await seeder.get_stats()
    
    # Ask for confirmation
    user_input = input("\n❓ Do you want to seed provinces data? (clear existing data) [y/N]: ")
    
    if user_input.lower() in ['y', 'yes']:
        success = await seeder.seed_provinces(clear_first=True)
        
        if success:
            print("\n✅ Seeding completed successfully!")
            await seeder.get_stats()
        else:
            print("\n❌ Seeding failed!")
    else:
        print("⏭️ Seeding cancelled.")

if __name__ == "__main__":
    asyncio.run(main())
