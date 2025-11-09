import os
import pandas as pd
from supabase import create_client
from dotenv import load_dotenv

# load .env
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

# connect to supabase
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# load CSV
CSV_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'province_features_v3.csv')
df_csv = pd.read_csv(CSV_FILE)
csv_provinces = set(df_csv['province'].str.lower())

# fetch provinces from supabase
try: 
    response = supabase.table("provinces").select("province_id, name").execute()
except Exception as e:
    print(f"Error fetching provinces from supabase: {e}")
    exit(1)

supabase_provinces = response.data
supabase_names = set([prov['name'].lower() for prov in supabase_provinces])

# find provinces not in CSV
missing_provinces = supabase_names - csv_provinces

print("Provinces in supabase but missing in province_features_v3.csv:")
for prov in sorted(missing_provinces):
    print(f"- {prov.title()}")
