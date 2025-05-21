import json
import requests
import os
from shapely.geometry import shape
from shapely import wkt
import uuid
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

SUPABASE_URL = os.environ.get('VITE_SUPABASE_URL') or 'https://your-project.supabase.co'
SUPABASE_KEY = os.environ.get('VITE_SUPABASE_SERVICE_ROLE_KEY') or 'your-service-role-key'

print(f"Using Supabase URL: {SUPABASE_URL}")
print(f"Service key length: {len(SUPABASE_KEY) if SUPABASE_KEY else 0}")

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

def create_beat(name, properties):
    """Create a beat record and return its ID"""
    beat_id = str(uuid.uuid4())
    range_id = properties.get('Range_ID') or properties.get('range_id')
    division_id = properties.get('Division_ID') or properties.get('division_id')
    if not range_id:
        print(f"WARNING: No range_id for beat '{name}'. This beat will likely fail to insert due to missing foreign key.")
    payload = {
        'beat_id': beat_id,
        'name': name,
        'description': properties.get('description'),
        'range_id': range_id,
        'division_id': division_id,
        'forest_type': properties.get('Forest_Type') or properties.get('forest_type'),
        'area': properties.get('Area') or properties.get('area'),
        'perimeter': properties.get('Perimeter') or properties.get('perimeter'),
        'state': properties.get('State') or properties.get('state'),
        'district': properties.get('District') or properties.get('district'),
        'block': properties.get('Block') or properties.get('block'),
        'village': properties.get('Village') or properties.get('village')
    }
    
    # Remove None values
    payload = {k: v for k, v in payload.items() if v is not None}
    
    try:
        print(f"\nAttempting to create beat: {name}")
        print(f"Request URL: {SUPABASE_URL}/rest/v1/beats")
        print(f"Headers: {json.dumps(headers, indent=2)}")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(
            f'{SUPABASE_URL}/rest/v1/beats',
            headers=headers,
            json=payload
        )
        
        print(f"Response status code: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        print(f"Response text: {response.text}")
        
        if response.status_code in (200, 201):
            try:
                response_data = response.json()
                print(f"Response data: {json.dumps(response_data, indent=2)}")
                return response_data[0]['beat_id'] if 'beat_id' in response_data[0] else response_data[0].get('id', beat_id)
            except json.JSONDecodeError as e:
                print(f"Failed to parse JSON response: {str(e)}")
                return beat_id
        else:
            print(f'Error creating beat {name}:')
            print(f'Status code: {response.status_code}')
            print(f'Response: {response.text}')
            return None
    except Exception as e:
        print(f'Exception creating beat {name}:')
        print(f'Error: {str(e)}')
        return None

def create_polygon(beat_id, name, polygon_wkt, properties):
    """Create a polygon record for a beat"""
    payload = {
        'beat_id': beat_id,
        'name': name,
        'description': properties.get('description'),
        'polygon': polygon_wkt,
        'area': properties.get('Area') or properties.get('area'),
        'perimeter': properties.get('Perimeter') or properties.get('perimeter'),
        'forest_type': properties.get('Forest_Type') or properties.get('forest_type')
    }
    
    # Remove None values
    payload = {k: v for k, v in payload.items() if v is not None}
    
    try:
        print(f"\nAttempting to create polygon for beat: {name}")
        print(f"Request URL: {SUPABASE_URL}/rest/v1/beat_polygons")
        print(f"Headers: {json.dumps(headers, indent=2)}")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(
            f'{SUPABASE_URL}/rest/v1/beat_polygons',
            headers=headers,
            json=payload
        )
        
        print(f"Response status code: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        print(f"Response text: {response.text}")
        
        if response.status_code not in (200, 201):
            print(f'Error inserting polygon for beat {name}:')
            print(f'Status code: {response.status_code}')
            print(f'Response: {response.text}')
            print(f'Payload: {json.dumps(payload, indent=2)}')
            return False
        else:
            print(f'Successfully inserted polygon for beat: {name}')
            return True
    except Exception as e:
        print(f'Exception occurred while inserting polygon for beat {name}:')
        print(f'Error: {str(e)}')
        print(f'Payload: {json.dumps(payload, indent=2)}')
        return False

def main():
    print("\nStarting import process...")
    with open('beat_polygons.geojson', 'r') as f:
        geojson = json.load(f)

    features = geojson['features'] if 'features' in geojson else geojson
    print(f"Found {len(features)} features to process")
    
    # Print available properties from first feature
    if features:
        print("\nAvailable properties in GeoJSON:")
        print(json.dumps(features[0]['properties'], indent=2))
    
    for feature in features:
        properties = feature['properties']
        geometry = feature['geometry']
        
        # Get beat name
        beat_name = properties.get('Beat') or properties.get('name')
        if not beat_name:
            print("Skipping feature with no beat name")
            continue

        # Create beat record first
        beat_id = create_beat(beat_name, properties)
        if not beat_id:
            print(f"Failed to create beat for {beat_name}, skipping polygon")
            continue

        # Convert geometry to WKT
        geom_obj = shape(geometry)
        geom_wkt = geom_obj.wkt

        # Create polygon record
        create_polygon(beat_id, beat_name, geom_wkt, properties)

if __name__ == '__main__':
    main() 