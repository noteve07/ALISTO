# scripts/database/init_volcanoes_data.py
"""
Script to populate volcanoes table with Philippine volcanoes data
Includes coordinates and province mapping
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

class VolcanoSeeder:
    def __init__(self):
        self.table_name = "volcanoes"
        
    def get_philippine_volcanoes_data(self) -> List[Dict]:
        """
        Return Philippine volcanoes data with coordinates and province names
        """
        volcanoes_data = [
            ('Babuyan Claro', 19.52408, 121.95005, 'Cagayan'),
            ('Banahaw', 14.06038, 121.48803, 'Laguna'),
            ('Biliran (Anas)', 11.63268, 124.47162, 'Leyte'),
            ('Bud Dajo', 6.01295, 121.05772, 'Sulu'),
            ('Bulusan', 12.76853, 124.05445, 'Sorsogon'),
            ('Cabalian', 10.27986, 125.21598, 'Southern Leyte'),
            ('Cagua', 18.22116, 122.1163, 'Cagayan'),
            ('Camiguin de Babuyanes', 18.83037, 121.86280, 'Cagayan'),
            ('Didicas', 19.07533, 122.20147, 'Cagayan'),
            ('Hibok-hibok', 9.20427, 124.67115, 'Camiguin'),
            ('Iraya', 20.46669, 122.01078, 'Batanes'),
            ('Iriga', 13.45606, 123.45479, 'Camarines Sur'),
            ('Isarog', 13.65685, 123.38087, 'Camarines Sur'),
            ('Kanlaon', 10.41129, 123.13243, 'Negros Oriental'),
            ('Leonard Kniaseff', 7.39359, 126.06418, 'Davao del Norte'),
            ('Makaturing', 7.64371, 124.31718, 'Lanao del Sur'),
            ('Matutum', 6.36111, 125.07603, 'Cotabato'),
            ('Mayon', 13.25519, 123.68615, 'Albay'),
            ('Musuan (Calayo)', 7.87680, 125.06985, 'Bukidnon'),
            ('Parker', 6.10274, 124.88879, 'South Cotabato'),
            ('Pinatubo', 15.14162, 120.35084, 'Pampanga'),
            ('Ragang', 7.69066, 124.50639, 'Lanao del Sur'),
            ('Smith', 19.53915, 121.91367, 'Cagayan'),
            ('Taal', 14.01024, 120.99812, 'Batangas')
        ]
        
        processed_volcanoes = []
        
        print(f"📊 Processing {len(volcanoes_data)} volcanoes...")
        
        for name, lat, lon, province_name in volcanoes_data:
            volcano_data = {
                "name": name,
                "latitude": lat,
                "longitude": lon,
                "province_name": province_name,
                "coordinates": f"POINT({lon} {lat})"
            }
            
            processed_volcanoes.append(volcano_data)
            print(f"✅ Processed: {name} in {province_name}")
        
        print(f"🎉 Successfully processed {len(processed_volcanoes)} volcanoes")
        return processed_volcanoes

    async def get_province_mapping(self) -> Dict[str, int]:
        """Get province name to ID mapping"""
        try:
            result = supabase.table('provinces').select('province_id, name').execute()
            province_map = {p['name']: p['province_id'] for p in result.data}
            print(f"📍 Loaded {len(province_map)} provinces for mapping")
            return province_map
        except Exception as e:
            print(f"❌ Error loading provinces: {e}")
            return {}

    async def clear_existing_data(self):
        """Clear existing volcano data"""
        try:
            result = supabase.table(self.table_name).delete().neq('volcano_id', 0).execute()
            print(f"🗑️ Cleared existing volcano data")
            return True
        except Exception as e:
            print(f"❌ Error clearing data: {e}")
            return False

    async def seed_volcanoes(self, clear_first: bool = False):
        """Seed volcanoes table with Philippine volcanoes data"""
        try:
            if clear_first:
                await self.clear_existing_data()
            
            # Get province mapping
            province_map = await self.get_province_mapping()
            if not province_map:
                print("❌ Could not load province mapping")
                return False
            
            volcanoes_data = self.get_philippine_volcanoes_data()
            
            if not volcanoes_data:
                print("❌ No volcano data available to seed")
                return False
            
            print(f"🌋 Seeding {len(volcanoes_data)} Philippine volcanoes...")
            
            total_inserted = 0
            failed_provinces = []
            
            for volcano in volcanoes_data:
                try:
                    # Find province_id
                    province_id = province_map.get(volcano['province_name'])
                    
                    if not province_id:
                        print(f"⚠️ Province not found: {volcano['province_name']} for {volcano['name']}")
                        failed_provinces.append(volcano['province_name'])
                        continue
                    
                    # Insert volcano with coordinates and province_id
                    data = {
                        'name': volcano['name'],
                        'latitude': volcano['latitude'],
                        'longitude': volcano['longitude'],
                        'coordinates': volcano['coordinates'],
                        'province_id': province_id
                    }
                    
                    result = supabase.table(self.table_name).insert(data).execute()
                    
                    if result.data:
                        total_inserted += 1
                        print(f"✅ Inserted {volcano['name']} in {volcano['province_name']}")
                    else:
                        print(f"❌ Failed to insert {volcano['name']}: {result.error}")
                        
                except Exception as volcano_error:
                    print(f"❌ Error processing {volcano['name']}: {volcano_error}")
                    continue
            
            if failed_provinces:
                print(f"⚠️ Failed to find provinces: {set(failed_provinces)}")
            
            print(f"🎉 Successfully inserted {total_inserted}/{len(volcanoes_data)} volcanoes!")
            return True
            
        except Exception as e:
            print(f"❌ Error seeding volcanoes: {e}")
            return False

    async def get_stats(self):
        """Get seeding statistics"""
        try:
            result = supabase.table(self.table_name).select("*", count='exact').execute()
            print(f"📊 Total volcanoes in database: {result.count}")
            
            # Show sample data
            if result.data:
                print("📋 Sample volcanoes:")
                for volcano in result.data[:5]:
                    print(f"   - {volcano['name']}")
            
        except Exception as e:
            print(f"❌ Error getting stats: {e}")

async def main():
    """Main seeding function"""
    print("🚀 Starting Philippine Volcanoes Data Seeding...")
    
    seeder = VolcanoSeeder()
    
    # Show current stats
    print("\n📊 Current database state:")
    await seeder.get_stats()
    
    # Ask for confirmation
    user_input = input("\n❓ Do you want to seed volcanoes data? (clear existing data) [y/N]: ")
    
    if user_input.lower() in ['y', 'yes']:
        success = await seeder.seed_volcanoes(clear_first=True)
        
        if success:
            print("\n✅ Seeding completed successfully!")
            await seeder.get_stats()
        else:
            print("\n❌ Seeding failed!")
    else:
        print("⏭️ Seeding cancelled.")

if __name__ == "__main__":
    asyncio.run(main())