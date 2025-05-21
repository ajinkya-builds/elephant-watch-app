import geopandas as gpd
import os
from dotenv import load_dotenv
import requests
import json
from shapely.geometry import Polygon, MultiPolygon, shape, mapping
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('import_errors.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

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
    if isinstance(geometry, MultiPolygon):
        largest_poly = max(geometry.geoms, key=lambda p: p.area)
        return largest_poly
    return geometry

def get_next_code(prefix, existing_codes):
    """Generate next available code for a division."""
    if not existing_codes:
        return f"{prefix}001"
    
    # Extract numeric parts and find max
    max_num = max([int(code[3:]) for code in existing_codes if code.startswith(prefix)])
    return f"{prefix}{str(max_num + 1).zfill(3)}"

def fetch_existing_codes():
    """Fetch existing division codes from the database."""
    response = requests.get(f"{SUPABASE_URL}/rest/v1/divisions?select=code", headers=headers)
    if response.status_code == 200:
        return set([row['code'] for row in response.json() if row.get('code')])
    return set()

def insert_division(division_data):
    """Insert a division record into the database."""
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/divisions",
        headers=headers,
        json=division_data
    )
    if response.status_code >= 200 and response.status_code < 300:
        return response.json()[0]['id']
    else:
        logger.error(f"Error inserting division: {response.text}")
        return None

def insert_division_polygon(polygon_data):
    """Insert a division polygon record into the database."""
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/division_polygons",
        headers=headers,
        json=polygon_data
    )
    if response.status_code >= 200 and response.status_code < 300:
        return response.json()[0]['id']
    else:
        logger.error(f"Error inserting division polygon: {response.text}")
        return None

def import_divisions():
    """Import divisions from shapefile."""
    try:
        # Read the shapefile
        shapefile_path = "/Users/ajinkyapatil/Documents/Biz Folder/Elephant Watch/ELE_layers/Division.shp"
        logger.info(f"Reading shapefile from {shapefile_path}")
        gdf = gpd.read_file(shapefile_path)
        
        # Convert to WGS84 if needed
        if gdf.crs is None or gdf.crs.to_epsg() != 4326:
            logger.info("Converting to WGS84 (EPSG:4326)")
            gdf = gdf.to_crs(epsg=4326)
        
        # Get existing codes
        existing_codes = fetch_existing_codes()
        
        # Process each division
        for idx, row in gdf.iterrows():
            try:
                # Generate division code
                code = get_next_code('DIV', existing_codes)
                existing_codes.add(code)
                
                # Prepare division data
                division_data = {
                    'sid': str(row['SID']),
                    'did': str(row['DID']),
                    'state': str(row['State']),
                    'name': str(row['Division']),
                    'code': code
                }
                
                # Insert division
                division_id = insert_division(division_data)
                if not division_id:
                    logger.error(f"Failed to insert division: {division_data['name']}")
                    continue
                
                # Process geometry
                geometry = convert_to_single_polygon(row.geometry)
                
                # Prepare polygon data
                polygon_data = {
                    'division_id': division_id,
                    'polygon': f"SRID=4326;{geometry.wkt}",
                    'area': float(geometry.area) if hasattr(geometry, 'area') else None,
                    'perimeter': float(geometry.length) if hasattr(geometry, 'length') else None
                }
                
                # Insert polygon
                polygon_id = insert_division_polygon(polygon_data)
                if polygon_id:
                    logger.info(f"Successfully imported division: {division_data['name']} (Code: {code}, State: {division_data['state']})")
                else:
                    logger.error(f"Failed to insert polygon for division: {division_data['name']}")
                
            except Exception as e:
                logger.error(f"Error processing division at index {idx}: {str(e)}")
                continue
                
    except Exception as e:
        logger.error(f"Error importing divisions: {str(e)}")
        raise

if __name__ == "__main__":
    logger.info("Starting division import...")
    import_divisions()
    logger.info("Division import completed!") 