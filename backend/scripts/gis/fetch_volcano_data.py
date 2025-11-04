import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv

def get_data_from_table(supabase, table_name):
    """get all data from a given table"""
    response = supabase.table(table_name).select("*").execute()
    return response.data or []

def get_volcano_data():
    """fetch volcano data and map province names"""
    try:
        # load environment variables
        load_dotenv()

        SUPABASE_URL = os.environ.get("SUPABASE_URL")
        SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

        if not SUPABASE_URL or not SUPABASE_KEY:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")

        # initialize supabase client
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

        # get volcanoes and provinces separately
        volcanoes = get_data_from_table(supabase, "volcanoes")
        provinces = get_data_from_table(supabase, "provinces")

        # make province_id -> name mapping
        province_map = {p["province_id"]: p["name"] for p in provinces}

        # attach province name to each volcano
        for v in volcanoes:
            province_id = v.get("province_id")
            v["province_name"] = province_map.get(province_id, "Unknown Province")

        return volcanoes

    except Exception as e:
        print(f"Error fetching data: {e}")
        return []

def save_to_json(volcano_data, filename="volcanoes.json"):
    """save formatted volcano data to json"""
    try:
        formatted_data = []
        for v in volcano_data:
            formatted_data.append({
                "id": v["volcano_id"],
                "name": v["name"],
                "latitude": float(v["latitude"]),
                "longitude": float(v["longitude"]),
                "province": v.get("province_name", "Unknown Province"),
                "coordinates": v.get("coordinates")
            })

        with open(filename, "w", encoding="utf-8") as f:
            json.dump(formatted_data, f, indent=2, ensure_ascii=False)

        print(f"Data saved to {filename}")
        return True

    except Exception as e:
        print(f"Error saving to JSON: {e}")
        return False

def main():
    """main function"""
    print("Fetching volcano data from Supabase...")
    volcano_data = get_volcano_data()

    if volcano_data:
        print(f"Found {len(volcano_data)} volcanoes")

        success = save_to_json(volcano_data)
        if success:
            print("\nVolcanoes saved to JSON:")
            for v in volcano_data:
                print(f"- {v['name']} ({v['province_name']})")
        else:
            print("Failed to save data to JSON")
    else:
        print("No volcano data found")

if __name__ == "__main__":
    main()
