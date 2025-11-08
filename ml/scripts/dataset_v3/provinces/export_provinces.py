from supabase import create_client, Client
from dotenv import load_dotenv
import os
import pandas as pd
import json

# load environment variables from .env
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

# initialize supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_provinces():
    """fetch all provinces from supabase"""
    response = supabase.table("provinces").select("name").execute()
    if response.data:
        return [row["name"].strip() for row in response.data if row.get("name")]
    return []

def export_provinces(provinces):
    """export provinces to json, csv, and python list"""
    # json
    with open("provinces_database.json", "w", encoding="utf-8") as f:
        json.dump(provinces, f, ensure_ascii=False, indent=4)

    # csv
    df = pd.DataFrame(provinces, columns=["province"])
    df.to_csv("provinces_database.csv", index=False, encoding="utf-8")

    # python list
    with open("provinces_list.py", "w", encoding="utf-8") as f:
        f.write(f"provinces = {provinces}")

if __name__ == "__main__":
    provinces = fetch_provinces()
    if provinces:
        export_provinces(provinces)
        print(f"Exported {len(provinces)} provinces to JSON, CSV, and Python list.")
    else:
        print("No provinces found in Supabase.")
