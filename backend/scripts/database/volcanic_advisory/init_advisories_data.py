from datetime import datetime
import sys
import os

# Add the app directory to the path so we can import from app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))

# Import the supabase client
from app.core.database import get_supabase_client

def seed_volcanic_advisories():
    """
    Seeds the volcanic_advisories table with initial data.
    Each volcano (IDs 1-24) will have an entry with alert_level=0 and other fields as null.
    """
    try:
        # Get the Supabase client
        supabase = get_supabase_client()
        
        print("Starting volcanic advisories data seeding...")
        
        # Create data for volcanic_advisories table
        advisories_data = []
        for volcano_id in range(1, 25):  # Volcano IDs 1-24
            advisory = {
                "volcano_id": volcano_id,
                "alert_level": 0,
                # Leaving other fields as null:
                # - issuance_time: will default to now()
                # - details: null
                # - bulletin_link: null
                # - created_at: will default to now()
                # - updated_at: will default to now()
            }
            advisories_data.append(advisory)
        
        # Insert data into the volcanic_advisories table
        result = supabase.table('volcanic_advisories').insert(advisories_data).execute()
        
        # Count inserted rows
        inserted_count = len(result.data) if hasattr(result, 'data') else 0
        print(f"✅ Successfully inserted {inserted_count} volcanic advisory records")
        
        return True
        
    except Exception as e:
        print(f"❌ Error seeding volcanic advisories data: {str(e)}")
        return False

if __name__ == "__main__":
    # Run the seeding function
    success = seed_volcanic_advisories()
    
    if success:
        print("✅ Volcanic advisories data seeding completed successfully")
    else:
        print("❌ Volcanic advisories data seeding failed")
