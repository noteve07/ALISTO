from supabase import create_client, Client
from dotenv import load_dotenv
import os
import pandas as pd
import json

# load .env
load_dotenv()

# get supabase credentials
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

# init client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# fetch provinces from supabase
def fetch_provinces_from_supabase():
    response = supabase.table("provinces").select("name").execute()
    if response.data:
        return [row["name"].strip() for row in response.data if row.get("name")]
    return []

# fetch provinces from local dataset
def fetch_provinces_from_dataset(csv_path="dataset_v3.csv"):
    df = pd.read_csv(csv_path)
    if "province" not in df.columns:
        raise KeyError("Column 'province' not found in dataset.")
    provinces = df["province"].dropna().unique()
    return [p.strip() for p in provinces]

# main process
def main():
    provinces_from_supabase = fetch_provinces_from_supabase()
    provinces_from_dataset = fetch_provinces_from_dataset()

    print("=== Provinces from Supabase ===")
    for p in sorted(provinces_from_supabase):
        print("-", p)
    print("Total:", len(provinces_from_supabase))
    print()

    print("=== Provinces from Dataset ===")
    for p in sorted(provinces_from_dataset):
        print("-", p)
    print("Total:", len(provinces_from_dataset))
    print()

    # find provinces in dataset not in supabase (case-sensitive)
    not_in_database = sorted(list(set(provinces_from_dataset) - set(provinces_from_supabase)))

    print("=== Provinces in dataset but not in database (case-sensitive) ===")
    if not not_in_database:
        print("All provinces are already in the database.")
    else:
        for p in not_in_database:
            print("-", p)
        print("Total:", len(not_in_database))

        # save to json
        with open("provinces_not_in_database.json", "w", encoding="utf-8") as f:
            json.dump(not_in_database, f, ensure_ascii=False, indent=4)
        print("\nSaved to provinces_not_in_database_2.json")

if __name__ == "__main__":
    main()
