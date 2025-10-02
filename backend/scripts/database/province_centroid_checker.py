#!/usr/bin/env python3
"""
Script to extract province data from database and decode centroids from WKB format
"""

import sys
import os
import asyncio
import json
from pathlib import Path
from typing import List, Dict, Optional, Tuple
import binascii
import struct

# Add backend to path
backend_path = Path(__file__).parent.parent.parent
sys.path.append(str(backend_path))

from app.core.database import supabase

try:
    import shapely
    from shapely import wkb
    HAS_SHAPELY = True
except ImportError:
    print("Shapely not installed, falling back to manual WKB parsing")
    HAS_SHAPELY = False

def decode_hex_wkb(hex_wkb: str) -> Tuple[float, float]:
    """
    Decode a hex-encoded Well-Known Binary (WKB) string to get longitude and latitude
    """
    if HAS_SHAPELY:
        # Use shapely for easier parsing if available
        try:
            # Convert hex string to binary
            binary_wkb = binascii.unhexlify(hex_wkb)
            # Parse with shapely
            point = shapely.wkb.loads(binary_wkb)
            # Return as (longitude, latitude)
            return (point.x, point.y)
        except Exception as e:
            print(f"Error parsing with shapely: {e}")
            # Fall back to manual parsing
            
    # Manual parsing of WKB (basic support for POINT)
    try:
        # Remove '0x' prefix if present
        if hex_wkb.startswith('0x'):
            hex_wkb = hex_wkb[2:]
            
        binary_wkb = binascii.unhexlify(hex_wkb)
        
        # Parse the WKB format
        # Byte order (1 byte) - 1 is little endian
        byte_order = binary_wkb[0]
        endianness = '<' if byte_order == 1 else '>'
        
        # Geometry type (4 bytes) - 1 is POINT
        geom_type = struct.unpack(f"{endianness}I", binary_wkb[1:5])[0]
        
        if geom_type != 1:  # Not a POINT
            raise ValueError(f"Not a POINT geometry (type {geom_type})")
        
        # Extract coordinates (8 bytes each for X and Y)
        x = struct.unpack(f"{endianness}d", binary_wkb[5:13])[0]  # Longitude
        y = struct.unpack(f"{endianness}d", binary_wkb[13:21])[0]  # Latitude
        
        return (x, y)
        
    except Exception as e:
        print(f"Error manually parsing WKB: {e}")
        return None

def parse_wkb_or_wkt(centroid_data):
    """
    Try to parse centroid data in different formats (WKB hex, WKT, etc)
    """
    # If it's already a string and in WKT format
    if isinstance(centroid_data, str) and centroid_data.startswith('POINT'):
        try:
            # Extract from POINT(lon lat)
            coords = centroid_data.replace('POINT(', '').replace(')', '').split()
            return (float(coords[0]), float(coords[1]))  # (lon, lat)
        except Exception as e:
            print(f"Error parsing WKT: {e}")
    
    # If it's a hex string (WKB)
    if isinstance(centroid_data, str) and all(c in '0123456789ABCDEFabcdef' for c in centroid_data):
        return decode_hex_wkb(centroid_data)
    
    # If it's binary data
    if isinstance(centroid_data, bytes):
        try:
            return decode_hex_wkb(centroid_data.hex())
        except Exception as e:
            print(f"Error parsing binary WKB: {e}")
    
    # If it's a GeoJSON dictionary (PostGIS can return GeoJSON format)
    if isinstance(centroid_data, dict):
        try:
            if centroid_data.get('type') == 'Point' and 'coordinates' in centroid_data:
                coords = centroid_data['coordinates']
                if len(coords) >= 2:
                    # GeoJSON uses [longitude, latitude] order
                    lon, lat = coords[0], coords[1]
                    return (lon, lat)
        except Exception as e:
            print(f"Error parsing GeoJSON: {e}")
    
    print(f"Unknown centroid format: {type(centroid_data)} - {centroid_data}")
    return None

def format_lat_lon(lat_lon):
    """Format latitude and longitude in a readable way"""
    if not lat_lon:
        return "N/A"
        
    lon, lat = lat_lon  # WKB gives (lon, lat)
    
    # Format to 6 decimal places and with proper direction
    lat_dir = "N" if lat >= 0 else "S"
    lon_dir = "E" if lon >= 0 else "W"
    
    return f"{abs(lat):.6f}° {lat_dir}, {abs(lon):.6f}° {lon_dir}"

async def fetch_and_parse_provinces():
    """Fetch all provinces and parse their centroids"""
    try:
        print("🌏 Fetching provinces from database...")
        
        # Get all provinces
        response = supabase.table("provinces").select("province_id, name, centroid").order("province_id").execute()
        
        if not response.data:
            print("❌ No provinces found in database!")
            return
            
        provinces = response.data
        print(f"✅ Found {len(provinces)} provinces\n")
        
        # Print header
        print("-" * 100)
        print(f"{'ID':^5} | {'Province Name':^30} | {'Raw Centroid':^30} | {'Parsed Coordinates':^30}")
        print("-" * 100)
        
        # Prepare data for JSON export
        provinces_data = []
        
        for province in provinces:
            province_id = province.get('province_id', 'N/A')
            name = province.get('name', 'N/A')
            region = None
            centroid = province.get('centroid')
            
            # Check centroid data type and try to parse
            centroid_type = type(centroid).__name__
            
            # Try to parse the coordinates
            parsed_coords = parse_wkb_or_wkt(centroid) if centroid else None
            
            # Create a short preview of the raw centroid
            raw_preview = str(centroid)[:28] + "..." if centroid and len(str(centroid)) > 30 else str(centroid)
            
            # Format for display
            formatted_coords = format_lat_lon(parsed_coords) if parsed_coords else "No coordinates"
            
            print(f"{province_id:5} | {name[:30]:<30} | {raw_preview[:30]:<30} | {formatted_coords:<30}")
            
            # Add to provinces data for JSON export
            if parsed_coords:
                lon, lat = parsed_coords
                provinces_data.append({
                    "province_id": province_id,
                    "name": name,
                    "region": region,
                    "centroid": {
                        "latitude": lat,
                        "longitude": lon
                    }
                })
            else:
                provinces_data.append({
                    "province_id": province_id,
                    "name": name,
                    "region": region,
                    "centroid": None
                })
        
        print("-" * 100)
        
        # Summary statistics
        parsed_count = sum(1 for p in provinces_data if p.get('centroid'))
        print(f"✅ Successfully parsed coordinates: {parsed_count}/{len(provinces)} provinces")
        
        if parsed_count < len(provinces):
            print(f"⚠️ {len(provinces) - parsed_count} provinces have missing or unparseable centroids")
        
        # Save to JSON file
        output_file = Path(__file__).parent / "province_centroids.json"
        try:
            import json
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(provinces_data, f, indent=2, ensure_ascii=False)
            print(f"\n✅ Saved province centroids data to {output_file}")
        except Exception as json_error:
            print(f"❌ Error saving JSON data: {json_error}")
        
    except Exception as e:
        print(f"❌ Error fetching province data: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("\n📊 PROVINCE CENTROID CHECKER")
    print("=" * 50)
    
    # Check if shapely is available
    if HAS_SHAPELY:
        print("✅ Using Shapely for WKB parsing")
    else:
        print("⚠️ Shapely not available - using manual WKB parsing")
        print("   For better results, install shapely: pip install shapely")
    
    # Run the async function
    asyncio.run(fetch_and_parse_provinces())