"""
Simple test to verify the location functionality works.
"""
from app.core.database import get_supabase_client
from app.utils.location import get_location_from_coords

def test_location():
    """Test the location function with coordinates."""
    
    print("🧪 Testing Location Function")
    print("=" * 50)
    
    try:
        # Get Supabase client
        supabase = get_supabase_client()
        
        # Test coordinates
        test_cases = [
            {"name": "Your coordinates", "lat": 14.6939, "lon": 120.559},
            {"name": "Manila coordinates", "lat": 14.5995, "lon": 120.9842},
            {"name": "Balanga City coordinates", "lat": 14.6760, "lon": 120.5361},
        ]
        
        for test_case in test_cases:
            print(f"\n📍 Testing: {test_case['name']}")
            print(f"   Coordinates: ({test_case['lat']}, {test_case['lon']})")
            
            result = get_location_from_coords(supabase, test_case['lat'], test_case['lon'])
            
            if result:
                print(f"   ✅ Found: {result['municipality_name']}, {result['province_name']}")
                print(f"   🆔 Municipality ID: {result['municipality_id']}")
                print(f"   🆔 Province ID: {result['province_id']}")
                print(f"   🔍 Method: {result['found_by']}")
                
                if result.get('is_fallback'):
                    print(f"   ⚠️  Using fallback location")
                if result.get('error'):
                    print(f"   🚨 Error: {result['error']}")
            else:
                print(f"   ❌ No result")
        
        print("\n" + "=" * 50)
        print("✅ Test completed!")
        
    except Exception as e:
        print(f"💥 Test failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_location()
