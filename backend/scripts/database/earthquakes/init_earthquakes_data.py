# scripts/database/earthquakes/init_earthquakes_data.py
"""
Script to populate earthquakes table with historical earthquake data from CSV
Processes data from oldest (bottom) to newest (top)
"""

import asyncio
import csv
import hashlib
import json
import math
from typing import List, Dict, Optional, Tuple
from pathlib import Path
import sys

# Add backend to path
backend_path = Path(__file__).parent.parent.parent.parent
sys.path.append(str(backend_path))

from app.core.database import supabase


class EarthquakeSeeder:
    def __init__(self):
        self.table_name = "earthquakes"
        self.csv_file = Path(__file__).parent / "cleaned_v2_eq_data.csv"
        self.province_map = {}
        self.province_centroids = {}
        self.used_hashes = set()
        self.province_substitutions = {}
        self.province_centroid_cache_file = Path(__file__).parent.parent / "province" / "province_centroids.json"
        
    def calculate_eq_hash(self, timestamp: str, magnitude: float, location: str, salt: str = "") -> str:
        """
        Calculate unique hash for earthquake using timestamp, magnitude, and location
        Optional salt for handling duplicates
        """
        hash_input = f"{timestamp}|{magnitude}|{location}|{salt}"
        return hashlib.sha256(hash_input.encode()).hexdigest()
    
    def ensure_unique_hash(self, timestamp: str, magnitude: float, location: str) -> str:
        """
        Ensure hash is unique by adding salt if necessary
        """
        eq_hash = self.calculate_eq_hash(timestamp, magnitude, location)
        salt_counter = 0
        
        while eq_hash in self.used_hashes:
            salt_counter += 1
            eq_hash = self.calculate_eq_hash(timestamp, magnitude, location, str(salt_counter))
            if salt_counter == 1:
                print(f"   ⚠️  Duplicate hash detected, rehashing with salt: {timestamp} - {location}")
        
        self.used_hashes.add(eq_hash)
        return eq_hash
    
    async def load_province_mapping(self) -> bool:
        """
        Load province mapping from database
        Maps province names to province_id and stores centroid data
        """
        try:
            print("📍 Loading province data from database...")
            
            # Try to load province centroids from cache file first
            if await self.load_province_centroids_from_cache():
                print("✅ Loaded province centroids from cache file")
            else:
                print("⚠️  Could not load province centroids from cache file, trying database...")
                
                # Fetch provinces with their centroids from database
                response = supabase.table("provinces").select("province_id, name, centroid").execute()
                
                if not response.data:
                    print("❌ No provinces found in database")
                    return False
                
                centroids_loaded = 0
                province_count = 0
                
                for province in response.data:
                    province_name = province['name']
                    province_id = province['province_id']
                    province_count += 1
                    
                    # Store mapping
                    self.province_map[province_name] = province_id
                    
                    # Store centroid for distance calculations
                    centroid_wkt = province.get('centroid')
                    if centroid_wkt:
                        coords = self.extract_coords_from_centroid(centroid_wkt)
                        if coords:
                            self.province_centroids[province_id] = coords
                            centroids_loaded += 1
                
                print(f"✅ Loaded {province_count} provinces ({centroids_loaded} with centroids) from database")
            
            # Warning if no provinces have centroids
            if len(self.province_centroids) == 0:
                print("\n⚠️  WARNING: No provinces have centroid data!")
                print("   Nearest province matching will not work without centroids.")
                print("   Run the province_centroids_export.py script to create the centroids cache file.\n")
            else:
                print(f"✅ Successfully loaded {len(self.province_centroids)} province centroids")
            
            return True
            
        except Exception as e:
            print(f"❌ Error loading province mapping: {e}")
            import traceback
            traceback.print_exc()
            return False
            
    async def load_province_centroids_from_cache(self) -> bool:
        """
        Load province centroids from JSON cache file
        This file is created by the province_centroids_export.py script
        """
        try:
            if not self.province_centroid_cache_file.exists():
                print(f"⚠️  Province centroid cache file not found: {self.province_centroid_cache_file}")
                return False
                
            # Load JSON data
            with open(self.province_centroid_cache_file, 'r', encoding='utf-8') as f:
                province_data = json.load(f)
                
            if not province_data or not isinstance(province_data, list):
                print(f"⚠️  Invalid province centroid data format in cache file")
                return False
                
            provinces_loaded = 0
            centroids_loaded = 0
                
            for province in province_data:
                try:
                    province_id = province.get('province_id')
                    province_name = province.get('name')
                    centroid = province.get('centroid')
                    
                    if not province_id or not province_name:
                        continue
                        
                    # Store province name to ID mapping
                    self.province_map[province_name] = province_id
                    provinces_loaded += 1
                    
                    # Store centroid coordinates if available
                    if centroid and 'latitude' in centroid and 'longitude' in centroid:
                        lat = centroid['latitude']
                        lon = centroid['longitude']
                        
                        # Validate coordinates
                        if -90 <= lat <= 90 and -180 <= lon <= 180:
                            self.province_centroids[province_id] = (lat, lon)
                            centroids_loaded += 1
                            
                except Exception as province_error:
                    print(f"⚠️  Error processing province in cache: {province_error}")
                    continue
                    
            print(f"✅ Loaded {provinces_loaded} provinces ({centroids_loaded} with centroids) from cache file")
            return centroids_loaded > 0
                
        except Exception as e:
            print(f"⚠️  Error loading province centroids from cache: {e}")
            return False
    
    def find_province_by_name(self, province_name: str) -> Optional[int]:
        """
        Find province_id by matching province name
        """
        if not province_name or province_name.strip() == "":
            return None
        
        # Direct match
        if province_name in self.province_map:
            return self.province_map[province_name]
        
        # Try case-insensitive match
        province_name_lower = province_name.lower()
        for name, pid in self.province_map.items():
            if name.lower() == province_name_lower:
                return pid
        
        return None
    
    def calculate_haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate the Haversine distance between two points in kilometers
        """
        # Convert to radians
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)
        
        # Haversine formula
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        
        a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        # Earth's radius in kilometers
        r = 6371
        
        return c * r
    
    def extract_coords_from_centroid(self, centroid_data) -> Optional[Tuple[float, float]]:
        """
        Extract latitude and longitude from centroid data
        Supports multiple formats:
        - PostGIS WKT format: 'POINT(longitude latitude)'
        - WKB hex string: '0101000000...'
        - Binary WKB data
        """
        try:
            if not centroid_data:
                print(f"   ⚠️  Empty centroid data")
                return None
            
            # Debug the centroid format we're getting
            print(f"   🔍 Centroid data type: {type(centroid_data)}")
            
            # Handle WKT format (string representation)
            if isinstance(centroid_data, str):
                # Check if it's in WKT format
                if centroid_data.upper().startswith('POINT'):
                    # Remove 'POINT(' and ')' and split
                    coords = centroid_data.replace('POINT(', '').replace(')', '').strip().split()
                    if len(coords) >= 2:
                        lon = float(coords[0])
                        lat = float(coords[1])
                        print(f"   ✅ Parsed WKT centroid: ({lat}, {lon})")
                        return (lat, lon)
                
                # Check if it might be a hex WKB string
                if all(c in '0123456789ABCDEFabcdef' for c in centroid_data):
                    try:
                        # Import locally to avoid dependency issues
                        import binascii
                        import struct
                        
                        # Remove '0x' prefix if present
                        if centroid_data.startswith('0x'):
                            centroid_data = centroid_data[2:]
                        
                        # Convert hex to binary
                        binary_wkb = binascii.unhexlify(centroid_data)
                        
                        # Basic WKB parsing
                        byte_order = binary_wkb[0]
                        endianness = '<' if byte_order == 1 else '>'
                        
                        # Geometry type (4 bytes) - 1 is POINT
                        geom_type = struct.unpack(f"{endianness}I", binary_wkb[1:5])[0]
                        
                        if geom_type != 1:  # Not a POINT
                            print(f"   ⚠️ Not a POINT geometry (type {geom_type})")
                            return None
                        
                        # Extract coordinates (8 bytes each for X and Y)
                        lon = struct.unpack(f"{endianness}d", binary_wkb[5:13])[0]  # Longitude
                        lat = struct.unpack(f"{endianness}d", binary_wkb[13:21])[0]  # Latitude
                        
                        print(f"   ✅ Parsed WKB centroid: ({lat}, {lon})")
                        return (lat, lon)
                    except Exception as wkb_error:
                        print(f"   ⚠️  Error parsing WKB centroid: {str(wkb_error)}")
            
            # If we're dealing with binary data
            elif isinstance(centroid_data, bytes):
                try:
                    # Try to parse it as WKB
                    import struct
                    
                    byte_order = centroid_data[0]
                    endianness = '<' if byte_order == 1 else '>'
                    
                    # Geometry type (4 bytes) - 1 is POINT
                    geom_type = struct.unpack(f"{endianness}I", centroid_data[1:5])[0]
                    
                    if geom_type != 1:  # Not a POINT
                        print(f"   ⚠️ Not a POINT geometry (type {geom_type})")
                        return None
                    
                    # Extract coordinates (8 bytes each for X and Y)
                    lon = struct.unpack(f"{endianness}d", centroid_data[5:13])[0]  # Longitude
                    lat = struct.unpack(f"{endianness}d", centroid_data[13:21])[0]  # Latitude
                    
                    print(f"   ✅ Parsed binary WKB centroid: ({lat}, {lon})")
                    return (lat, lon)
                except Exception as bin_error:
                    print(f"   ⚠️  Error parsing binary centroid: {str(bin_error)}")
            
            print(f"   ⚠️  Could not parse centroid: {centroid_data}")
            return None
        except Exception as e:
            print(f"   ⚠️  Error parsing centroid: {str(e)}")
            import traceback
            traceback.print_exc()
            return None
    
    async def find_nearest_province(self, latitude: float, longitude: float) -> Optional[int]:
        """
        Find nearest province using simple Haversine distance calculation
        Uses cached centroid data for performance
        """
        try:
            if not self.province_centroids:
                print("   ⚠️  No province centroids available - cannot find nearest province")
                return None
            
            nearest_province_id = None
            min_distance = float('inf')
            nearest_province_name = None
            
            # Create a direct list of province names by ID for lookup
            id_to_name = {}
            for name, pid in self.province_map.items():
                id_to_name[pid] = name
            
            # Debug - print how many provinces we're checking
            print(f"   🔍 Checking distances to {len(self.province_centroids)} provinces with centroids...")
            
            for province_id, coords in self.province_centroids.items():
                prov_lat, prov_lon = coords
                
                # Calculate distance
                distance = self.calculate_haversine_distance(latitude, longitude, prov_lat, prov_lon)
                
                if distance < min_distance:
                    min_distance = distance
                    nearest_province_id = province_id
                    nearest_province_name = id_to_name.get(province_id, f"Unknown (ID:{province_id})")
            
            if nearest_province_id:
                # Print result in a highly visible format
                print("\n   ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓")
                print(f"   ┃ 📍 NEAREST PROVINCE: {nearest_province_name}")
                print(f"   ┃ 📏 Distance: {min_distance:.2f} km")
                print(f"   ┃ 🔑 Province ID: {nearest_province_id}")
                print("   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n")
                return nearest_province_id
            else:
                print("\n   ⚠️  NO NEARBY PROVINCE FOUND - All provinces may be missing centroid data\n")
                return None
            
        except Exception as e:
            print(f"\n   ❌ ERROR finding nearest province for ({latitude}, {longitude}): {e}\n")
            import traceback
            traceback.print_exc()
            return None
    
    def read_csv_reversed(self) -> List[Dict]:
        """
        Read CSV file from bottom to top (oldest to newest)
        Returns list of earthquake records
        """
        print(f"📂 Reading CSV file: {self.csv_file}")
        
        if not self.csv_file.exists():
            print(f"❌ CSV file not found: {self.csv_file}")
            return []
        
        all_rows = []
        
        with open(self.csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            all_rows = list(reader)
        
        # Reverse to process from oldest to newest
        all_rows.reverse()
        
        print(f"✅ Loaded {len(all_rows)} earthquake records (oldest to newest)")
        return all_rows
    
    async def prepare_earthquake_record(self, row: Dict, eq_id: int) -> Optional[Dict]:
        """
        Prepare a single earthquake record for insertion
        """
        try:
            # Parse data from CSV
            timestamp = row['date_time']
            latitude = float(row['latitude'])
            longitude = float(row['longitude'])
            depth = int(row['depth']) if row['depth'] and row['depth'].strip() else None
            magnitude = float(row['magnitude'])
            location = row['location']
            province_name = row.get('province', '').strip()
            
            # Calculate unique hash
            eq_hash = self.ensure_unique_hash(timestamp, magnitude, location)
            
            # Find province_id
            province_id = None
            
            if province_name:
                province_id = self.find_province_by_name(province_name)
                
                if province_id is None:
                    # Province name not found, try to find nearest
                    print(f"   ⚠️  Province '{province_name}' not in database, finding nearest for: {timestamp} - {location}")
                    province_id = await self.find_nearest_province(latitude, longitude)
                    
                    # Track this substitution for reporting
                    if province_id:
                        # Get name of the province we're using instead
                        substitute_name = None
                        for name, pid in self.province_map.items():
                            if pid == province_id:
                                substitute_name = name
                                break
                        
                        # Print direct confirmation of the substitution
                        if substitute_name:
                            print(f"   ✅ Will use '{substitute_name}' instead of '{province_name}'")
                            
                            # Track substitution for summary report
                            if not hasattr(self, 'province_substitutions'):
                                self.province_substitutions = {}
                                
                            if province_name not in self.province_substitutions:
                                self.province_substitutions[province_name] = {}
                            
                            if substitute_name not in self.province_substitutions[province_name]:
                                self.province_substitutions[province_name][substitute_name] = 0
                            
                            self.province_substitutions[province_name][substitute_name] += 1
                    else:
                        print(f"   ❌ COULDN'T FIND ANY SUBSTITUTE PROVINCE - this record will be skipped")
            
            # Prepare record
            record = {
                'eq_id': eq_id,
                'datetime': timestamp,
                'latitude': latitude,
                'longitude': longitude,
                'coordinates': f'POINT({longitude} {latitude})',  # PostGIS format
                'magnitude': magnitude,
                'depth': depth,
                'location': location,
                'eq_hash': eq_hash,
                'province_id': province_id
            }
            
            return record
            
        except Exception as e:
            print(f"   ❌ Error preparing record: {e}")
            print(f"      Row data: {row}")
            return None
    
    async def insert_batch(self, records: List[Dict]) -> Tuple[int, int]:
        """
        Insert a batch of earthquake records
        Returns (success_count, error_count)
        """
        if not records:
            return 0, 0
        
        try:
            response = supabase.table(self.table_name).insert(records).execute()
            
            if response.data:
                return len(records), 0
            else:
                return 0, len(records)
                
        except Exception as e:
            print(f"   ❌ Batch insert error: {e}")
            return 0, len(records)
    
    def save_skipped_records(self, skipped_records: List[Dict]) -> None:
        """
        Save skipped records to a JSON file for later analysis
        """
        if not skipped_records:
            return
            
        try:
            output_file = Path(__file__).parent / "skipped_earthquake_records.json"
            
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(skipped_records, f, indent=2, ensure_ascii=False)
                
            print(f"\n✅ Saved {len(skipped_records)} skipped records to {output_file}")
            
        except Exception as e:
            print(f"❌ Error saving skipped records: {e}")
            
    async def seed_earthquakes(self, batch_size: int = 100):
        """
        Main seeding function - processes CSV and inserts into database
        """
        try:
            print("\n🌍 Starting Earthquake Data Seeding...")
            print("=" * 60)
            
            # Load province mapping
            if not await self.load_province_mapping():
                print("❌ Cannot proceed without province mapping")
                return False
            
            # Read CSV data (reversed, oldest first)
            csv_rows = self.read_csv_reversed()
            
            if not csv_rows:
                print("❌ No data to seed")
                return False
            
            total_records = len(csv_rows)
            print(f"\n📊 Total records to process: {total_records}")
            print(f"📦 Batch size: {batch_size}")
            print(f"🔢 Starting eq_id: 1 (oldest earthquake)")
            print("=" * 60)
            
            # Process in batches
            batch = []
            eq_id = 1
            total_inserted = 0
            total_errors = 0
            batch_num = 0
            missing_province_count = 0
            nearest_province_count = 0
            skipped_records = []
            
            # Track province substitutions for reporting
            province_substitutions = {}
            
            for idx, row in enumerate(csv_rows, start=1):
                record = await self.prepare_earthquake_record(row, eq_id)
                
                if record:
                    # Skip records with missing province ID
                    if record['province_id'] is None and row.get('province', '').strip():
                        missing_province_count += 1
                        skipped_records.append({
                            "index": idx,
                            "data": row,
                            "prepared_record": {k: v for k, v in record.items() if k != 'coordinates'},
                            "reason": "No matching province found"
                        })
                        total_errors += 1
                    else:
                        batch.append(record)
                        eq_id += 1
                else:
                    skipped_records.append({
                        "index": idx,
                        "data": row,
                        "reason": "Failed to prepare record"
                    })
                    total_errors += 1
                
                # Insert batch when full or at end
                if len(batch) >= batch_size or idx == total_records:
                    if batch:
                        batch_num += 1
                        success, errors = await self.insert_batch(batch)
                        total_inserted += success
                        total_errors += errors
                        
                        print(f"✅ Batch {batch_num:4d}: Inserted {success:3d} records | "
                              f"Total: {total_inserted:6d}/{total_records} "
                              f"({total_inserted*100/total_records:5.2f}%)")
                        
                        batch = []
            
            # Save any skipped records for later analysis
            if skipped_records:
                self.save_skipped_records(skipped_records)
                
            print("\n" + "=" * 60)
            print("🎉 SEEDING COMPLETED!")
            print("=" * 60)
            print(f"✅ Total inserted: {total_inserted}")
            print(f"❌ Total errors: {total_errors}")
            print(f"⚠️  Provinces not found in DB: {missing_province_count}")
            print(f"📝 Skipped records saved: {len(skipped_records)}")
            
            # Print province substitution summary
            if hasattr(self, 'province_substitutions') and self.province_substitutions:
                print("\n📊 PROVINCE SUBSTITUTION SUMMARY:")
                print("=" * 70)
                print("| {:<25} | {:<25} | {:>8} |".format("Missing Province", "Substituted With", "Count"))
                print("|" + "-" * 27 + "|" + "-" * 27 + "|" + "-" * 10 + "|")
                
                # Sort by most frequent substitutions
                sorted_provinces = sorted(
                    self.province_substitutions.items(),
                    key=lambda x: sum(x[1].values()),
                    reverse=True
                )
                
                for orig_province, substitutions in sorted_provinces:
                    sorted_subs = sorted(substitutions.items(), key=lambda x: x[1], reverse=True)
                    
                    for i, (sub_province, count) in enumerate(sorted_subs):
                        if i == 0:
                            orig_display = orig_province[:25]
                        else:
                            orig_display = "↳" # Show arrow for additional substitutions
                            
                        print("| {:<25} | {:<25} | {:8d} |".format(
                            orig_display, sub_province[:25], count))
                
                print("=" * 70)
            
            print("=" * 60)
            
            return True
            
        except Exception as e:
            print(f"\n❌ Fatal error during seeding: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    async def get_stats(self):
        """Get current database statistics"""
        try:
            # Count earthquakes
            response = supabase.table(self.table_name).select("eq_id", count="exact").execute()
            count = response.count if response.count is not None else 0
            
            print(f"📊 Current earthquakes in database: {count}")
            
            # Get date range if there's data
            if count > 0:
                # Get oldest
                oldest = supabase.table(self.table_name).select("datetime").order("datetime", desc=False).limit(1).execute()
                # Get newest
                newest = supabase.table(self.table_name).select("datetime").order("datetime", desc=True).limit(1).execute()
                
                if oldest.data and newest.data:
                    print(f"📅 Date range: {oldest.data[0]['datetime']} to {newest.data[0]['datetime']}")
            
        except Exception as e:
            print(f"❌ Error getting stats: {e}")
    
    async def clear_existing_data(self):
        """Clear all existing earthquake data (use with caution!)"""
        try:
            print("🗑️  Clearing existing earthquake data...")
            
            # Delete all records
            response = supabase.table(self.table_name).delete().neq('eq_id', 0).execute()
            
            print("✅ Existing data cleared")
            return True
            
        except Exception as e:
            print(f"❌ Error clearing data: {e}")
            return False


async def main():
    """Main function"""
    print("\n" + "=" * 60)
    print("🚀 EARTHQUAKE DATA SEEDING SCRIPT")
    print("=" * 60)
    
    seeder = EarthquakeSeeder()
    
    # Show current stats
    print("\n📊 Current database state:")
    await seeder.get_stats()
    
    # Ask for confirmation
    print("\n" + "=" * 60)
    user_input = input("❓ Do you want to seed earthquake data? (this will CLEAR existing data) [y/N]: ")
    print("=" * 60)
    
    if user_input.lower() in ['y', 'yes']:
        # Clear existing data first
        await seeder.clear_existing_data()
        
        # Start seeding
        success = await seeder.seed_earthquakes(batch_size=100)
        
        if success:
            print("\n✅ SEEDING COMPLETED SUCCESSFULLY!")
            await seeder.get_stats()
        else:
            print("\n❌ SEEDING FAILED!")
    else:
        print("⏭️  Seeding cancelled.")


if __name__ == "__main__":
    asyncio.run(main())

