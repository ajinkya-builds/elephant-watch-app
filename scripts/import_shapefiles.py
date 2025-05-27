import geopandas as gpd
import os
from dotenv import load_dotenv
import requests
import json
from shapely.geometry import Polygon, MultiPolygon, shape, mapping

# Load environment variables
load_dotenv()

# Get Supabase connection details
SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_KEY = os.getenv('VITE_SUPABASE_SERVICE_ROLE_KEY')

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

def convert_to_single_polygon(geometry):
    """Convert MultiPolygon to single Polygon by taking the largest polygon."""
    if geometry.geom_type == 'MultiPolygon':
        largest_poly = max(geometry.geoms, key=lambda p: p.area)
        return largest_poly
    return geometry

def get_next_code(prefix, existing_codes):
    idx = 1
    while True:
        code = f"{prefix}-{idx:03d}"
        if code not in existing_codes:
            return code
        idx += 1

def fetch_existing_codes(table, code_field):
    response = requests.get(f"{SUPABASE_URL}/rest/v1/{table}?select={code_field}", headers=headers)
    if response.status_code == 200:
        return set([row[code_field] for row in response.json() if row.get(code_field)])
    return set()

def insert_record(table, payload, unique_field):
    # Check for duplicate
    query = f"{SUPABASE_URL}/rest/v1/{table}?{unique_field}=eq.{payload[unique_field]}"
    response = requests.get(query, headers=headers)
    if response.status_code == 200 and response.json():
        print(f"Skipping duplicate in {table}: {payload[unique_field]}")
        return response.json()[0]['id'] if 'id' in response.json()[0] else None
    # Insert
    response = requests.post(f"{SUPABASE_URL}/rest/v1/{table}", headers=headers, json=payload)
    if response.status_code >= 200 and response.status_code < 300:
        print(f"Inserted into {table}: {payload[unique_field]}")
        return response.json()[0]['id'] if response.json() and 'id' in response.json()[0] else None
    else:
        print(f"Error inserting into {table}: {response.text}")
        return None

def import_all():
    base_path = "/Users/ajinkyapatil/Documents/Biz Folder/Elephant Watch/ELE_layers"
    # 1. Import Divisions
    div_gdf = gpd.read_file(os.path.join(base_path, "Division.shp"))
    if div_gdf.crs is None or div_gdf.crs.to_epsg() != 4326:
        div_gdf = div_gdf.to_crs(epsg=4326)
    div_codes = fetch_existing_codes('divisions', 'code')
    division_id_map = {}
    div_gdf['code'] = None  # Add code column for lookup
    for idx, row in div_gdf.iterrows():
        code = get_next_code('DIV', div_codes)
        div_codes.add(code)
        div_gdf.at[idx, 'code'] = code
        payload = {
            'code': code,
            'name': row.get('name', row.get('NAME', f'Division {idx+1}')),
            'description': row.get('description', None),
            'geometry': mapping(row.geometry)
        }
        division_id = insert_record('divisions', payload, 'code')
        division_id_map[code] = division_id
    # 2. Import Ranges
    rng_gdf = gpd.read_file(os.path.join(base_path, "Range.shp"))
    if rng_gdf.crs is None or rng_gdf.crs.to_epsg() != 4326:
        rng_gdf = rng_gdf.to_crs(epsg=4326)
    rng_codes = fetch_existing_codes('ranges', 'code')
    range_id_map = {}
    rng_gdf['code'] = None
    rng_gdf['division_code'] = None
    for idx, row in rng_gdf.iterrows():
        code = get_next_code('RNG', rng_codes)
        rng_codes.add(code)
        rng_gdf.at[idx, 'code'] = code
        # Spatially assign division
        centroid = row.geometry.centroid
        assigned_div_code = None
        for d_idx, d_row in div_gdf.iterrows():
            if d_row.geometry.contains(centroid):
                assigned_div_code = d_row['code']
                break
        rng_gdf.at[idx, 'division_code'] = assigned_div_code
        payload = {
            'code': code,
            'name': row.get('name', row.get('NAME', f'Range {idx+1}')),
            'division_id': division_id_map.get(assigned_div_code),
            'description': row.get('description', None),
            'geometry': mapping(row.geometry)
        }
        range_id = insert_record('ranges', payload, 'code')
        range_id_map[code] = range_id
    # 3. Import Beats (metadata)
    beat_gdf = gpd.read_file(os.path.join(base_path, "Beat.shp"))
    if beat_gdf.crs is None or beat_gdf.crs.to_epsg() != 4326:
        beat_gdf = beat_gdf.to_crs(epsg=4326)
    beat_codes = fetch_existing_codes('beats', 'code')
    beat_id_map = {}
    beat_gdf['code'] = None
    beat_gdf['range_code'] = None
    for idx, row in beat_gdf.iterrows():
        code = get_next_code('BEAT', beat_codes)
        beat_codes.add(code)
        beat_gdf.at[idx, 'code'] = code
        # Spatially assign range
        centroid = row.geometry.centroid
        assigned_rng_code = None
        for r_idx, r_row in rng_gdf.iterrows():
            if r_row.geometry.contains(centroid):
                assigned_rng_code = r_row['code']
                break
        beat_gdf.at[idx, 'range_code'] = assigned_rng_code
        payload = {
            'code': code,
            'name': row.get('name', row.get('NAME', f'Beat {idx+1}')),
            'range_id': range_id_map.get(assigned_rng_code),
            'division_id': division_id_map.get(rng_gdf.loc[rng_gdf['code'] == assigned_rng_code, 'division_code'].values[0]) if assigned_rng_code else None,
            'description': row.get('description', None),
            'forest_type': row.get('forest_type', None),
            'area': row.get('area', None),
            'perimeter': row.get('perimeter', None),
            'state': row.get('state', None),
            'district': row.get('district', None),
            'block': row.get('block', None),
            'village': row.get('village', None),
            'geometry': mapping(row.geometry)
        }
        beat_id = insert_record('beats', payload, 'code')
        beat_id_map[code] = beat_id
    # 4. Import Beat Polygons
    for idx, row in beat_gdf.iterrows():
        code = row['code']
        beat_id = beat_id_map[code]
        geometry = row.geometry
        if geometry.geom_type == 'MultiPolygon':
            geometry = convert_to_single_polygon(geometry)
        payload = {
            'beat_id': beat_id,
            'name': row.get('name', f'Beat {idx+1}'),
            'description': row.get('description', f'Beat polygon {idx+1}'),
            'polygon': geometry.wkt,
            'area': row.get('area', None),
            'perimeter': row.get('perimeter', None),
            'forest_type': row.get('forest_type', None)
        }
        insert_record('beat_polygons', payload, 'beat_id')
    print("\nImport completed for Division, Range, Beat, and Beat Polygon!")

def main():
    import_all()

if __name__ == "__main__":
    main() 