import asyncio
import json
import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent.parent.parent
sys.path.append(str(backend_dir))

from app.core.database import get_supabase_client

class MunicipalityCitySeeder:
    """Class to handle seeding of municipalities and cities data."""

    def __init__(self):
        """Initialize the seeder."""
        self.supabase = get_supabase_client()
        self.provinces_map = {}  # Will store province_name -> province_id mapping
        self.municities_path = Path(__file__).parent.parent.parent.parent / "src" / "municities.json"

    async def load_provinces_mapping(self):
        """Load provinces data to create a mapping of province_name -> province_id."""
        print("🔄 Loading provinces mapping...")
        
        response = self.supabase.table("provinces").select("province_id, name").execute()
        
        if not response.data:
            raise Exception("❌ No provinces found in the database. Please run init_province_data.py first.")
        
        # Create mapping of province_name -> province_id
        for province in response.data:
            self.provinces_map[province['name']] = province['province_id']
        
        print(f"✅ Loaded {len(self.provinces_map)} provinces for mapping")

    def load_municities_geojson(self):
        """Load the municities GeoJSON data."""
        print(f"📂 Loading municities data from: {self.municities_path}")
        
        # Try different encodings since we're encountering encoding issues
        encodings_to_try = ["utf-8", "latin-1", "cp1252", "iso-8859-1"]
        
        for encoding in encodings_to_try:
            try:
                print(f"  Trying encoding: {encoding}...")
                with open(self.municities_path, "r", encoding=encoding) as f:
                    data = json.load(f)
                
                if not data or "features" not in data:
                    print("  ❌ Invalid municities GeoJSON data structure")
                    continue
                
                print(f"  ✅ Successfully loaded with {encoding} encoding")
                return data["features"]
            except UnicodeDecodeError:
                print(f"  ❌ Failed with {encoding} encoding")
            except json.JSONDecodeError:
                print(f"  ❌ Invalid JSON with {encoding} encoding")
            except Exception as e:
                print(f"  ❌ Error with {encoding} encoding: {str(e)}")
        
        raise Exception("❌ Failed to load municities data with any encoding")

    def geometry_to_geojson(self, geometry):
        """Convert geometry to GeoJSON format."""
        return geometry

    def calculate_centroid_from_geometry(self, geometry):
        """Calculate centroid from a geometry object."""
        if not geometry or "type" not in geometry:
            return None
        
        if geometry["type"] == "Polygon":
            # For simple polygon, calculate centroid from first ring
            coordinates = geometry["coordinates"][0]
            x_sum = sum(point[0] for point in coordinates)
            y_sum = sum(point[1] for point in coordinates)
            count = len(coordinates)
            return {"type": "Point", "coordinates": [x_sum / count, y_sum / count]}
            
        elif geometry["type"] == "MultiPolygon":
            # For multi-polygon, calculate weighted centroid based on polygon areas
            # This is a simplified approach - just using the first polygon's centroid
            coordinates = geometry["coordinates"][0][0]
            x_sum = sum(point[0] for point in coordinates)
            y_sum = sum(point[1] for point in coordinates)
            count = len(coordinates)
            return {"type": "Point", "coordinates": [x_sum / count, y_sum / count]}
        
        return None

    async def seed_municities(self):
        """Seed the municities data to the database."""
        print("🌱 Starting municities data seeding...")
        
        # First load provinces mapping
        await self.load_provinces_mapping()
        
        # Then load municities data
        features = self.load_municities_geojson()
        print(f"📊 Loaded {len(features)} municities from GeoJSON")
        
        # Check existing municities to avoid duplicates
        response = self.supabase.table("municities").select("name").execute()
        existing_municities = {m["name"] for m in response.data} if response.data else set()
        
        if existing_municities:
            print(f"ℹ️ Found {len(existing_municities)} existing municities in the database")
        
        # Prepare data for insertion
        municities_to_insert = []
        skipped_count = 0
        province_not_found_count = 0
        
        for feature in features:
            props = feature["properties"]
            geometry = feature["geometry"]
            
            name = props["NAME_2"]
            province_name = props["PROVINCE"]
            
            # Skip if already exists
            if name in existing_municities:
                skipped_count += 1
                continue
            
            # Find province_id
            if province_name not in self.provinces_map:
                print(f"⚠️ Province not found: {province_name} for {name}")
                province_not_found_count += 1
                continue
            
            province_id = self.provinces_map[province_name]
            
            # Calculate centroid
            centroid = self.calculate_centroid_from_geometry(geometry)
            
            # Prepare data for insertion
            # Extract ID from properties or generate a unique ID
            municity_id = props.get("ID_2")  # Use the ID_2 from the GeoJSON properties
            
            # Make sure municity_id is an integer
            try:
                municity_id = int(municity_id)
            except (TypeError, ValueError):
                print(f"⚠️ Invalid municity_id for {name}: {municity_id}")
                continue  # Skip this one as it doesn't have a valid ID
            
            municity_data = {
                "municity_id": municity_id,
                "name": name,
                "province_id": province_id,
                "boundaries": geometry,
                "centroid": centroid
            }
            
            municities_to_insert.append(municity_data)
        
        # Insert data in batches to avoid request size limits
        batch_size = 50
        for i in range(0, len(municities_to_insert), batch_size):
            batch = municities_to_insert[i:i+batch_size]
            print(f"🔄 Inserting batch {i//batch_size + 1}/{(len(municities_to_insert)-1)//batch_size + 1} ({len(batch)} municities)")
            
            response = self.supabase.table("municities").insert(batch).execute()
            
            if hasattr(response, "error") and response.error:
                print(f"❌ Error inserting batch: {response.error}")
            else:
                print(f"✅ Inserted batch {i//batch_size + 1}")
        
        print(f"""
📈 Municities Seeding Summary:
   Total Municities in GeoJSON: {len(features)}
   Successfully Inserted: {len(municities_to_insert)}
   Skipped (Already Exist): {skipped_count}
   Province Not Found: {province_not_found_count}
        """)

async def main():
    """Main function to seed municities data."""
    try:
        seeder = MunicipalityCitySeeder()
        await seeder.seed_municities()
        print("✅ Municities data seeding completed successfully!")
    except Exception as e:
        print(f"❌ Error seeding municities data: {e}")
        
        # Provide more helpful information about encoding issues
        if "codec can't decode" in str(e) or "invalid continuation byte" in str(e):
            print("\n🔍 SUGGESTION: The municities.json file appears to have encoding issues.")
            print("Try manually opening the file in VS Code or another text editor that")
            print("can detect and fix encoding issues. Save it with UTF-8 encoding and try again.")
            print("\nAlternatively, you can try running this command to convert the file:")
            print("python -c \"import io; open('path_to_fixed_file', 'w', encoding='utf-8').write(open(r'" + str(Path(__file__).parent.parent.parent / "src" / "municities.json") + "', 'r', encoding='latin-1').read())\"")
        
        # If it's a JSON parsing error, suggest checking the file format
        if "JSONDecodeError" in str(e) or "Expecting" in str(e):
            print("\n🔍 SUGGESTION: The municities.json file appears to have invalid JSON format.")
            print("Check that the file is valid JSON, possibly using a JSON validator tool.")

if __name__ == "__main__":
    asyncio.run(main())
