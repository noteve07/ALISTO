#!/usr/bin/env python3
"""
Script to generate provinces_id.json from provinces table using .env
"""

import json
import os
from supabase import create_client
from dotenv import load_dotenv

def generate_provinces_json():
    """Fetch provinces from database and generate JSON file"""
    
    # Load environment variables
    load_dotenv()
    
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Missing Supabase credentials in .env file")
        return
    
    try:
        # Initialize Supabase client
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Fetch all provinces
        print("📡 Fetching provinces from database...")
        result = supabase.table("provinces_duplicate")\
            .select("province_id, name")\
            .execute()
        
        if not result.data:
            print("❌ No provinces found in database")
            return
        
        # Create mapping (keep original casing, just lowercase for keys)
        provinces_map = {}
        for province in result.data:
            province_id = province["province_id"]
            province_name = province["name"]
            
            # Use lowercase as key
            key = province_name.lower()
            provinces_map[key] = province_id
        
        # Create data directory if it doesn't exist
        os.makedirs("app/data", exist_ok=True)
        
        # Write to JSON file
        output_path = "app/data/provinces_id.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(provinces_map, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Generated {output_path} with {len(provinces_map)} provinces")
        print("📊 Sample entries:")
        for i, (key, value) in enumerate(list(provinces_map.items())[:5]):
            print(f"   '{key}': {value}")
        
    except Exception as e:
        print(f"❌ Error generating JSON: {e}")

if __name__ == "__main__":
    generate_provinces_json()