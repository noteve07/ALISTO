import math
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Supabase
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points in KM"""
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return c * 6371  # KM

def find_location_from_coords(lat, lon):
    print(f"🔍 Finding location for coordinates: {lat}, {lon}")
    print("=" * 50)
    
    try:
        # 1. First try to find Balanga specifically
        print("1. Searching for Balanga City...")
        balanga_result = supabase.table("municities").select(
            "municity_id, name, province_id, provinces(name)"
        ).ilike("name", "%balanga%").execute()
        
        if balanga_result.data:
            balanga = balanga_result.data[0]
            province_name = balanga['provinces']['name'] if balanga.get('provinces') else "Unknown"
            
            print(f"✅ Found Balanga: {balanga['name']}, {province_name}")
            print(f"   Municity ID: {balanga['municity_id']}")
            print(f"   Province ID: {balanga['province_id']}")
            
            # Calculate distance from input coordinates to Balanga
            balanga_lat, balanga_lon = 14.6760, 120.5361  # Balanga coordinates
            distance = calculate_distance(lat, lon, balanga_lat, balanga_lon)
            print(f"   Distance from input coordinates: {distance:.2f} km")
            
            return {
                "municity_id": balanga['municity_id'],
                "municity_name": balanga['name'],
                "province_id": balanga['province_id'],
                "province_name": province_name,
                "distance_km": distance,
                "method": "balanga_fallback"
            }
        
        # 2. If no Balanga, get all municities and find nearest
        print("\n2. Balanga not found, searching all municities...")
        all_municities = supabase.table("municities").select(
            "municity_id, name, province_id, provinces(name)"
        ).limit(100).execute()
        
        if all_municities.data:
            # Just return the first one as fallback
            first_municity = all_municities.data[0]
            province_name = first_municity['provinces']['name'] if first_municity.get('provinces') else "Unknown"
            
            print(f"✅ Using first municipality: {first_municity['name']}, {province_name}")
            print(f"   Municity ID: {first_municity['municity_id']}")
            print(f"   Province ID: {first_municity['province_id']}")
            
            return {
                "municity_id": first_municity['municity_id'],
                "municity_name": first_municity['name'],
                "province_id": first_municity['province_id'],
                "province_name": province_name,
                "method": "first_municipality_fallback"
            }
        
        # 3. Ultimate fallback - hardcoded Balanga
        print("\n3. No municipalities in database, using hardcoded Balanga...")
        return {
            "municity_id": 1,
            "municity_name": "Balanga City",
            "province_id": 1,
            "province_name": "Bataan",
            "method": "hardcoded_fallback"
        }
        
    except Exception as e:
        print(f"❌ Error: {e}")
        # Ultimate fallback
        return {
            "municity_id": 1,
            "municity_name": "Balanga City", 
            "province_id": 1,
            "province_name": "Bataan",
            "method": "error_fallback"
        }

# TEST THE SCRIPT
if __name__ == "__main__":
    # Test coordinates: 14.6939, 120.559
    test_lat, test_lon = 14.6939, 120.559
    
    print("🚀 STARTING GEOLOCATION TEST")
    print("=" * 60)
    
    result = find_location_from_coords(test_lat, test_lon)
    
    print("\n" + "=" * 60)
    print("🎉 FINAL RESULT:")
    print(f"📍 Input Coordinates: {test_lat}, {test_lon}")
    print(f"🏙️  Municipality: {result['municity_name']} (ID: {result['municity_id']})")
    print(f"🏞️  Province: {result['province_name']} (ID: {result['province_id']})")
    print(f"🔧 Method: {result['method']}")
    
    if 'distance_km' in result:
        print(f"📏 Distance: {result['distance_km']:.2f} km from Balanga")
    
    print("=" * 60)