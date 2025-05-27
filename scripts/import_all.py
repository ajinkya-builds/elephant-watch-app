import geopandas as gpd
import requests
from shapely.geometry import MultiPolygon, Polygon, mapping
import os
from dotenv import load_dotenv
from pathlib import Path

# Force load .env from project root
env_path = Path(__file__).parent.parent / ".env"
print("Loading .env from:", env_path.resolve())
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

# Debug: print loaded environment variables
print("SUPABASE_URL:", SUPABASE_URL)
print("SUPABASE_SERVICE_KEY:", SUPABASE_KEY)

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

def upsert_row(table, payload, key_column):
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers=headers,
        params={f"{key_column}": f"eq.{payload[key_column]}"}
    )
    if response.status_code == 200:
        existing = response.json()
        if existing:
            response = requests.patch(
                f"{SUPABASE_URL}/rest/v1/{table}",
                headers=headers,
                params={f"{key_column}": f"eq.{payload[key_column]}"},
                json=payload
            )
        else:
            response = requests.post(
                f"{SUPABASE_URL}/rest/v1/{table}",
                headers=headers,
                json=payload
            )
    else:
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/{table}",
            headers=headers,
            json=payload
        )
    if response.status_code not in (200, 201):
        print(f"Error upserting into {table}: {response.text}")
        return None
    return response.json()[0] if isinstance(response.json(), list) else response.json()

def import_divisions():
    gdf = gpd.read_file(f"{base_path}/Division.shp").to_crs(epsg=4326)
    did_to_id = {}
    for _, row in gdf.iterrows():
        meta = {
            "did": str(row["DID"]),
            "name": str(row["Division"])
        }
        meta_row = upsert_row("divisions", meta, "did")
        if not meta_row: continue
        division_id = meta_row["division_id"]
        did_to_id[row["DID"]] = division_id
        poly = {
            "associated_division_id": division_id,
            "geometry": mapping(ensure_multipolygon(row.geometry))
        }
        upsert_row("division_polygons", poly, "associated_division_id")
    return did_to_id

def import_ranges(did_to_id):
    gdf = gpd.read_file(f"{base_path}/Range.shp").to_crs(epsg=4326)
    rid_to_id = {}
    for _, row in gdf.iterrows():
        meta = {
            "rid": str(row["RID"]),
            "associated_division_id": did_to_id.get(row["DID"]),
            "name": str(row["Range"])
        }
        meta_row = upsert_row("ranges", meta, "rid")
        if not meta_row: continue
        range_id = meta_row["range_id"]
        rid_to_id[row["RID"]] = range_id
        poly = {
            "associated_range_id": range_id,
            "geometry": mapping(ensure_multipolygon(row.geometry))
        }
        upsert_row("range_polygons", poly, "associated_range_id")
    return rid_to_id

def import_beats(rid_to_id, did_to_id):
    gdf = gpd.read_file(f"{base_path}/Beat.shp").to_crs(epsg=4326)
    for _, row in gdf.iterrows():
        bid = str(row["BID"])
        meta = {
            "bid": bid,
            "name": str(row["Beat"]),
            "associated_range_id": rid_to_id.get(row["RID"]),
            "associated_division_id": did_to_id.get(row["DID"]),
            "area": float(row["Beat_Ar"]) if row["Beat_Ar"] is not None else None
        }
        meta_row = upsert_row("beats", meta, "bid")
        if not meta_row: continue
        beat_id = meta_row["beat_id"]
        poly = {
            "associated_beat_id": beat_id,
            "geometry": mapping(ensure_multipolygon(row.geometry))
        }
        upsert_row("beat_polygons", poly, "associated_beat_id")

def main():
    print("Importing divisions...")
    did_to_id = import_divisions()
    print("Importing ranges...")
    rid_to_id = import_ranges(did_to_id)
    print("Importing beats...")
    import_beats(rid_to_id, did_to_id)
    print("Import completed!")

if __name__ == "__main__":
    main() 