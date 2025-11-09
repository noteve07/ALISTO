import json
import os
from datetime import datetime
from supabase import create_client
from dotenv import load_dotenv

# load env
load_dotenv()
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
CLUSTER_FILE = os.path.join(THIS_DIR, 'cluster_results.json')
PROVINCE_ID_FILE = os.path.join(THIS_DIR, 'provinces_id.json')


def main():
    # load clustering results
    with open(CLUSTER_FILE, 'r') as f:
        cluster_data = json.load(f)
    
    # convert to dict for easy lookup
    cluster_dict = {item['province'].lower(): item['risk_level'] for item in cluster_data}

    # load province_id lookup
    with open(PROVINCE_ID_FILE, 'r') as f:
        province_ids = {k.lower(): v for k, v in json.load(f).items()}

    # get all provinces, sort alphabetically
    all_provinces = sorted(cluster_dict.keys())

    print(f"{'Province':30} | {'Province ID':10} | {'Risk Level'}")
    print("-" * 60)

    for prov in all_provinces:
        prov_id = province_ids.get(prov)
        risk_level = cluster_dict.get(prov, "N/A")

        print(f"{prov.title():30} | {prov_id!s:10} | {risk_level}")

        if prov_id is None:
            continue  # skip if no id

        # prepare data for upsert
        record = {
            "province_id": prov_id,
            "risk_level": risk_level,
            "calculated_at": datetime.utcnow().isoformat()
        }

        # upsert into risk_evaluations table
        try:
            response = supabase.table("risk_evaluations").upsert(record, on_conflict="province_id").execute()

        except Exception as error:
            print(f"  ! Failed to update province_id {prov_id}: {error}")

if __name__ == "__main__":
    main()
