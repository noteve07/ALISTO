from supabase import create_client, Client
from dotenv import load_dotenv
import os

# load environment variables from .env file
load_dotenv()

# get supabase credentials
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

# initialize supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# fetch provinces data
def fetch_provinces():
    try:
        response = supabase.table("provinces").select("name").execute()
        if response.data:
            print("Provinces:")
            for row in response.data:
                print(row["name"])
        else:
            print("No data found.")
    except Exception as e:
        print("Error fetching provinces:", e)

if __name__ == "__main__":
    fetch_provinces()
