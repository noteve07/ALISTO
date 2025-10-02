#!/usr/bin/env python
# province_centroids_export.py
"""
Export a JSON file of province centroids and names from the database
Proper parsing of the binary WKB data from PostGIS
"""

import asyncio
import json
from pathlib import Path
import sys
from typing import Dict, List, Optional, Tuple

# Add backend to path
backend_path = Path(__file__).parent.parent.parent.parent
sys.path.append(str(backend_path))

try:
    from app.core.database import supabase
    from shapely import wkb
    import binascii
    
except ImportError as e:
    print(f"Error importing dependencies: {e}")
    print("Please install required dependencies:")
    print("  pip install shapely")
    sys.exit(1)

class ProvinceCentroidExporter:
    def __init__(self):
        self.output_file = Path(__file__).parent / "province_centroids.json"
        
    async def export_province_centroids(self):
        """
        Export province centroids to a JSON file
        """
        try:
            print("📍 Fetching province data from database...")
            
            # Fetch all provinces with their centroids
            response = supabase.table("provinces").select("province_id, name, region, centroid").execute()
            
            if not response.data:
                print("❌ No provinces found in database")
                return False
                
            province_centroids = []
            success_count = 0
            fail_count = 0
            
            print(f"Processing {len(response.data)} provinces...")
            
            for province in response.data:
                try:
                    province_id = province['province_id']
                    province_name = province['name']
                    region = province['region']
                    centroid_data = province.get('centroid')
                    
                    if not centroid_data:
                        print(f"   ⚠️  No centroid data for province {province_name} (ID: {province_id})")
                        fail_count += 1
                        continue
                    
                    # Parse centroid data
                    centroid_coords = self.parse_centroid(centroid_data)
                    
                    if not centroid_coords:
                        print(f"   ⚠️  Failed to parse centroid for province {province_name} (ID: {province_id})")
                        fail_count += 1
                        continue
                    
                    lat, lon = centroid_coords
                    
                    # Add to result
                    province_centroids.append({
                        "province_id": province_id,
                        "name": province_name,
                        "region": region,
                        "centroid": {
                            "latitude": lat,
                            "longitude": lon
                        }
                    })
                    
                    success_count += 1
                    print(f"   ✅ Processed province {province_name} - centroid: ({lat}, {lon})")
                    
                except Exception as e:
                    print(f"   ❌ Error processing province {province.get('name', 'Unknown')}: {e}")
                    fail_count += 1
            
            # Write to JSON file
            with open(self.output_file, "w", encoding="utf-8") as f:
                json.dump(province_centroids, f, indent=2, ensure_ascii=False)
                
            print(f"\n✅ Exported {success_count} province centroids to {self.output_file}")
            
            if fail_count > 0:
                print(f"⚠️  Failed to process {fail_count} provinces")
                
            return True
                
        except Exception as e:
            print(f"❌ Error exporting province centroids: {e}")
            import traceback
            traceback.print_exc()
            return False
            
    def parse_centroid(self, centroid_data) -> Optional[Tuple[float, float]]:
        """
        Parse centroid data from database
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
                        return (lat, lon)
                
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
                        
                        # Validate the coordinates
                        if -90 <= lat <= 90 and -180 <= lon <= 180:
                            return (lat, lon)
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
                                return None
                                
                            # Extract coordinates (8 bytes each for X and Y)
                            lon = struct.unpack(f"{endianness}d", binary_wkb[5:13])[0]  # Longitude
                            lat = struct.unpack(f"{endianness}d", binary_wkb[13:21])[0]  # Latitude
                            
                            return (lat, lon)
                        except Exception as manual_error:
                            print(f"   ⚠️  Error in manual WKB parsing: {manual_error}")
            
            # If we're dealing with binary data
            elif isinstance(centroid_data, bytes):
                try:
                    # Use shapely to parse
                    point = wkb.loads(centroid_data)
                    
                    # Extract coordinates (note: shapely returns (lon, lat))
                    lon, lat = point.x, point.y
                    
                    return (lat, lon)
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
                            return None
                            
                        # Extract coordinates (8 bytes each for X and Y)
                        lon = struct.unpack(f"{endianness}d", centroid_data[5:13])[0]  # Longitude
                        lat = struct.unpack(f"{endianness}d", centroid_data[13:21])[0]  # Latitude
                        
                        return (lat, lon)
                    except Exception as manual_bin_error:
                        print(f"   ⚠️  Error in manual binary parsing: {manual_bin_error}")
            
            print(f"   ⚠️  Could not parse centroid of type {type(centroid_data)}")
            return None
            
        except Exception as e:
            print(f"   ❌ Error parsing centroid: {e}")
            import traceback
            traceback.print_exc()
            return None

async def main():
    exporter = ProvinceCentroidExporter()
    await exporter.export_province_centroids()

if __name__ == "__main__":
    asyncio.run(main())