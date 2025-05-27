import geopandas as gpd
import requests
from shapely.geometry import MultiPolygon, Polygon, mapping
import os
from dotenv import load_dotenv
from pathlib import Path
import time

# Load .env
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

base_path = "/Users/ajinkyapatil/Documents/Biz Folder/Elephant Watch/ELE_layers"

def ensure_multipolygon(geom):
    if geom.geom_type == 'Polygon':
        return MultiPolygon([geom])
    elif geom.geom_type == 'MultiPolygon':
        return geom
    else:
        raise ValueError("Unsupported geometry type: " + geom.geom_type)

def insert_row(table, payload):
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers=headers,
        json=payload
    )
    if response.status_code not in (200, 201):
        print(f"Error inserting into {table}: {response.text}")
        return None
    time.sleep(0.1)
    print(f"Inserted into {table}: {response.json()}")
    return response.json()[0] if isinstance(response.json(), list) else response.json()

def import_ranges_only():
    gdf = gpd.read_file(f"{base_path}/Range.shp").to_crs(epsg=4326)
    print(f"Importing {len(gdf)} ranges (skip if rid+did+name exists)...")
    # Get all existing (rid, did, name) from the database
    response = requests.get(f"{SUPABASE_URL}/rest/v1/ranges", headers=headers)
    existing_keys = set()
    if response.status_code == 200:
        for row in response.json():
            key = (str(row["rid"]).strip(), str(row["division_id"]), str(row["name"]).strip())
            existing_keys.add(key)
    inserted = 0
    skipped = 0
    inserted_keys = []
    skipped_keys = []
    # Get division mapping
    div_response = requests.get(f"{SUPABASE_URL}/rest/v1/divisions", headers=headers)
    did_to_id = {}
    if div_response.status_code == 200:
        for row in div_response.json():
            did_to_id[row["did"]] = row["division_id"]
    for _, row in gdf.iterrows():
        rid = str(row["RID"]).strip()
        did = str(row["DID"]).strip()
        name = str(row["Range"]).strip()
        division_id = did_to_id.get(row["DID"])
        key = (rid, str(division_id), name)
        if key in existing_keys:
            skipped += 1
            skipped_keys.append(key)
            continue
        meta = {
            "rid": rid,
            "division_id": division_id,
            "name": name
        }
        meta_row = insert_row("ranges", meta)
        if not meta_row:
            print(f"Failed to insert range with RID {rid}, DID {did}, NAME {name}")
            continue
        range_id = meta_row["range_id"]
        poly = {
            "range_id": range_id,
            "geometry": mapping(ensure_multipolygon(row.geometry))
        }
        insert_row("range_polygons", poly)
        inserted += 1
        inserted_keys.append(key)
    print(f"Ranges import complete. Inserted: {inserted}, Skipped (duplicates): {skipped}")
    print(f"Inserted (rid, division_id, name): {inserted_keys}")
    print(f"Skipped (rid, division_id, name): {skipped_keys}")

if __name__ == "__main__":
    import_ranges_only() 