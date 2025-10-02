#!/usr/bin/env python
# fetch_provinces.py
"""
Script to extract all provinces from the database and show their centroids with lat/lon equivalents
"""

import asyncio
import json
import sys
from pathlib import Path
import binascii

# Add backend to path
backend_path = Path(__file__).parent.parent.parent.parent
sys.path.append(str(backend_path))

from app.core.database import supabase

try:
    from shapely import wkb
except ImportError:
    print("Installing required dependency: shapely")
    import pip
    pip.main(['install', 'shapely'])
    from shapely import wkb


class ProvinceFetcher:
    def __init__(self):
        self.provinces = {}
        self.output_file = Path(__file__).parent / "province_data.json"

    def parse_centroid(self, centroid_data):
        """
        Parse centroid data from database into latitude and longitude
        Supports multiple formats:
        - WKT format (string starting with 'POINT')
        - WKB hex string
        - Binary WKB data
        """
        try:
            # Debug the data format
            print(f"   🔍 Centroid data type: {type(centroid_data)}")
            
            # Handle string WKT or hexadecimal WKB
            if isinstance(centroid_data, str):
                # Check if it's in WKT format
                if centroid_data.upper().startswith('POINT'):
                    coords = centroid_data.replace('POINT(', '').replace(')', '').strip().split()
                    if len(coords) >= 2:
                        lon = float(coords[0])
                        lat = float(coords[1])
                        return {"latitude": lat, "longitude": lon, "format": "WKT"}
                
                # Check if it's a hexadecimal WKB string
                if all(c in '0123456789ABCDEFabcdef' for c in centroid_data):
                    # Use shapely to parse WKB
                    try:
                        # Convert hex to binary
                        binary_wkb = binascii.unhexlify(centroid_data)
                        
                        # Use shapely to parse
                        point = wkb.loads(binary_wkb)
                        
                        # Extract coordinates (note: shapely returns (lon, lat))
                        lon, lat = point.x, point.y
                        
                        return {"latitude": lat, "longitude": lon, "format": "WKB hex", "raw": centroid_data}
                    except Exception as wkb_error:
                        print(f"   ⚠️  Error parsing WKB with shapely: {wkb_error}")
                        
                        # Fallback to manual parsing
                        try:
                            import struct
                            
                            # Remove '0x' prefix if present
                            if centroid_data.startswith('0x'):
                                centroid_data = centroid_data[2:]
                                
                            binary_wkb = binascii.unhexlify(centroid_data)
                            
                            # Basic WKB parsing
                            byte_order = binary_wkb[0]
                            endianness = '<' if byte_order == 1 else '>'
                            
                            # Geometry type (4 bytes) - 1 is POINT
                            geom_type = struct.unpack(f"{endianness}I", binary_wkb[1:5])[0]
                            
                            if geom_type != 1:  # Not a POINT
                                print(f"   ⚠️ Not a POINT geometry (type {geom_type})")
                                return {"error": f"Not a POINT geometry (type {geom_type})", "raw": centroid_data}
                                
                            # Extract coordinates (8 bytes each for X and Y)
                            lon = struct.unpack(f"{endianness}d", binary_wkb[5:13])[0]  # Longitude
                            lat = struct.unpack(f"{endianness}d", binary_wkb[13:21])[0]  # Latitude
                            
                            return {"latitude": lat, "longitude": lon, "format": "WKB hex (manual)", "raw": centroid_data}
                        except Exception as manual_error:
                            print(f"   ⚠️  Error in manual WKB parsing: {manual_error}")
                            return {"error": str(manual_error), "raw": centroid_data}
            
            # If we're dealing with binary data
            elif isinstance(centroid_data, bytes):
                try:
                    # Use shapely to parse
                    point = wkb.loads(centroid_data)
                    
                    # Extract coordinates (note: shapely returns (lon, lat))
                    lon, lat = point.x, point.y
                    
                    return {"latitude": lat, "longitude": lon, "format": "WKB binary"}
                except Exception as bin_error:
                    print(f"   ⚠️  Error parsing binary with shapely: {bin_error}")
                    
                    # Fallback to manual parsing
                    try:
                        import struct
                        
                        byte_order = centroid_data[0]
                        endianness = '<' if byte_order == 1 else '>'
                        
                        # Geometry type (4 bytes) - 1 is POINT
                        geom_type = struct.unpack(f"{endianness}I", centroid_data[1:5])[0]
                        
                        if geom_type != 1:  # Not a POINT
                            print(f"   ⚠️ Not a POINT geometry (type {geom_type})")
                            return {"error": f"Not a POINT geometry (type {geom_type})"}
                            
                        # Extract coordinates (8 bytes each for X and Y)
                        lon = struct.unpack(f"{endianness}d", centroid_data[5:13])[0]  # Longitude
                        lat = struct.unpack(f"{endianness}d", centroid_data[13:21])[0]  # Latitude
                        
                        return {"latitude": lat, "longitude": lon, "format": "WKB binary (manual)"}
                    except Exception as manual_bin_error:
                        print(f"   ⚠️  Error in manual binary parsing: {manual_bin_error}")
                        return {"error": str(manual_bin_error)}
            
            print(f"   ⚠️  Could not parse centroid of type {type(centroid_data)}")
            return {"error": f"Unknown centroid format: {type(centroid_data)}"}
            
        except Exception as e:
            print(f"   ❌ Error parsing centroid: {e}")
            import traceback
            traceback.print_exc()
            return {"error": str(e)}

    async def fetch_provinces(self):
        """
        Fetch all provinces from the database (IDs 1-82) and extract centroid data
        """
        try:
            print("📍 Fetching all provinces from database...")
            
            # Fetch all provinces
            response = supabase.table("provinces").select("*").order("province_id").execute()
            
            if not response.data:
                print("❌ No provinces found in database")
                return False
                
            provinces_data = []
            
            for province in response.data:
                province_id = province['province_id']
                name = province['name']
                centroid_data = province.get('centroid')
                region = province.get('region')
                
                # Parse centroid if available
                centroid_parsed = None
                if centroid_data:
                    centroid_parsed = self.parse_centroid(centroid_data)
                    print(f"   ✅ Province {name} (ID: {province_id}): {centroid_parsed}")
                else:
                    print(f"   ⚠️ Province {name} (ID: {province_id}): No centroid data")
                
                # Add to list
                provinces_data.append({
                    "province_id": province_id,
                    "name": name,
                    "region": region,
                    "centroid_raw": str(centroid_data)[:100] + "..." if isinstance(centroid_data, str) and len(str(centroid_data)) > 100 else str(centroid_data),
                    "centroid_parsed": centroid_parsed
                })
            
            # Save to file
            with open(self.output_file, 'w', encoding='utf-8') as f:
                json.dump(provinces_data, f, indent=2, ensure_ascii=False)
            
            print(f"\n✅ Fetched {len(provinces_data)} provinces")
            print(f"📄 Data saved to: {self.output_file}")
            
            return True
        
        except Exception as e:
            print(f"❌ Error fetching provinces: {e}")
            import traceback
            traceback.print_exc()
            return False

    def display_results(self):
        """
        Display results in a formatted table
        """
        try:
            if not self.output_file.exists():
                print("❌ No results file found")
                return
            
            with open(self.output_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if not data:
                print("❌ No province data found")
                return
            
            print("\n📊 PROVINCES TABLE")
            print("=" * 100)
            print(f"{'ID':^5} | {'Name':<25} | {'Region':<20} | {'Latitude':^10} | {'Longitude':^10} | {'Format':<15}")
            print("-" * 100)
            
            for province in data:
                province_id = province['province_id']
                name = province['name']
                region = province['region'] or "N/A"
                
                centroid_parsed = province.get('centroid_parsed', {})
                lat = centroid_parsed.get('latitude', 'N/A')
                lon = centroid_parsed.get('longitude', 'N/A')
                format = centroid_parsed.get('format', 'N/A')
                
                lat_str = f"{lat:.6f}" if isinstance(lat, float) else lat
                lon_str = f"{lon:.6f}" if isinstance(lon, float) else lon
                
                print(f"{province_id:^5} | {name:<25} | {region:<20} | {lat_str:^10} | {lon_str:^10} | {format:<15}")
            
            print("=" * 100)
            
        except Exception as e:
            print(f"❌ Error displaying results: {e}")
            import traceback
            traceback.print_exc()


async def main():
    fetcher = ProvinceFetcher()
    success = await fetcher.fetch_provinces()
    if success:
        fetcher.display_results()

if __name__ == "__main__":
    asyncio.run(main())