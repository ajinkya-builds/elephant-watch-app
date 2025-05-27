import json
import requests
import os

SUPABASE_URL = os.environ.get('SUPABASE_URL') or 'https://your-project.supabase.co'
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY') or 'your-service-role-key'
TABLE_NAME = 'beat_points'

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
}

def main():
    with open('coordinates_with_uuids.json', 'r') as f:
        data = json.load(f)

    rows = []
    for item in data:
        row = {
            'id': item['id'],
            'beat_name': item['beat_name'],
            'range_name': item['range_name'],
            'division_name': item['division_name'],
            'state': item['state'],
            'beat_area': item['beat_area'],
            'geom': f'POINT({item["beat_lon"]} {item["beat_lat"]})',
            'created_at': item['created_at']
        }
        rows.append(row)

    # Insert in batches
    batch_size = 50
    for i in range(0, len(rows), batch_size):
        batch = rows[i:i+batch_size]
        # Supabase expects geometry as WKT string, but you may need to use a PostgREST RPC for geometry
        for r in batch:
            # Insert each row individually to handle geometry
            payload = r.copy()
            # Remove 'geom' for now, will update via SQL after insert
            geom_wkt = payload.pop('geom')
            response = requests.post(
                f'{SUPABASE_URL}/rest/v1/{TABLE_NAME}',
                headers=headers,
                json=payload
            )
            if response.status_code not in (200, 201):
                print(f'Error inserting row: {response.text}')
            else:
                print(f'Inserted row {payload["id"]}')
                # Now update geometry using RPC or SQL (if needed)
                # You may need to run a SQL update in Supabase to set the geometry from WKT

if __name__ == '__main__':
    main() 