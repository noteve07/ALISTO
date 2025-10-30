import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

# Initialize Supabase
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

def get_location_from_coords(lat: float, lon: float):
    """
    Get municipality and province from coordinates using SQL function
    """
    try:
        print(f"📍 Searching for location: {lat}, {lon}")
        
        # Call the SQL function via Supabase RPC
        result = supabase.rpc(
            'find_location_from_coords',
            {'input_lat': lat, 'input_lon': lon}
        ).execute()
        
        if result.data and len(result.data) > 0:
            location = result.data[0]
            print("✅ FOUND EXACT LOCATION:")
            print(f"   Municipality: {location['municity_name']}")
            print(f"   Province: {location['province_name']}")
            print(f"   Municity ID: {location['municity_id']}")
            print(f"   Province ID: {location['province_id']}")
            return location
        else:
            print("❌ No municipality found for these coordinates")
            print("💡 Using Balanga City as fallback")
            return {
                "municity_id": 1,
                "municity_name": "Balanga City",
                "province_id": 1, 
                "province_name": "Bataan",
                "is_fallback": True
            }
            
    except Exception as e:
        print(f"🚨 ERROR: {e}")
        return {
            "municity_id": 1,
            "municity_name": "Balanga City",
            "province_id": 1,
            "province_name": "Bataan", 
            "is_fallback": True,
            "error": str(e)
        }

# TEST FUNCTION (Simulate endpoint)
def test_endpoint(lat: float, lon: float):
    """
    Simulate your FastAPI endpoint
    """
    print("🚀 SIMULATING ENDPOINT CALL")
    print("=" * 50)
    
    # This is what your endpoint would do
    user_location = get_location_from_coords(lat, lon)
    
    print("\n" + "=" * 50)
    print("🎯 ENDPOINT RESPONSE:")
    return {
        "user_location": user_location,
        "personalized_data": {
            "nearby_earthquakes": "Would be calculated based on location",
            "risk_level": "Would be calculated based on location", 
            "evacuation_sites": "Would be fetched based on location"
        }
    }

# RUN TESTS
if __name__ == "__main__":
    # Test with your coordinates
    print("🧪 TEST 1: Your coordinates (14.6939, 120.559)")
    result1 = test_endpoint(14.6939, 120.559)
    print(result1)
    
    print("\n" + "=" * 80)
    
    # Test with Manila coordinates (should return Manila if in boundaries)
    print("🧪 TEST 2: Manila coordinates (14.5995, 120.9842)")
    result2 = test_endpoint(14.5995, 120.9842)
    print(result2)
    
    print("\n" + "=" * 80)
    
    # Test with invalid coordinates
    print("🧪 TEST 3: Invalid coordinates (100, 200)")
    result3 = test_endpoint(100, 200)
    print(result3)
