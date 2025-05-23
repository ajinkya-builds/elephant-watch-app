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
    """Generate next available code for a range."""
    if not existing_codes:
        return f"{prefix}001"
    
    # Extract numeric parts and find max
    max_num = max([int(code[3:]) for code in existing_codes if code.startswith(prefix)])
    return f"{prefix}{str(max_num + 1).zfill(3)}"

def fetch_existing_codes():
    """Fetch existing range codes from the database."""
    response = requests.get(f"{SUPABASE_URL}/rest/v1/ranges?select=code", headers=headers)
    if response.status_code == 200:
        return set([row['code'] for row in response.json() if row.get('code')])
    return set()

def fetch_division_id(sid, did):
    """Fetch division ID based on SID and DID."""
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/divisions?sid=eq.{sid}&did=eq.{did}&select=id",
        headers=headers
    )
    if response.status_code == 200 and response.json():
        return response.json()[0]['id']
    return None

def insert_range(range_data):
    """Insert a range record into the database."""
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/ranges",
        headers=headers,
        json=range_data
    )
    if response.status_code >= 200 and response.status_code < 300:
        return response.json()[0]['id']
    else:
        logger.error(f"Error inserting range: {response.text}")
        return None

def insert_range_polygon(polygon_data):
    """Insert a range polygon record into the database."""
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/range_polygons",
        headers=headers,
        json=polygon_data
    )
    if response.status_code >= 200 and response.status_code < 300:
        return response.json()[0]['id']
    else:
        logger.error(f"Error inserting range polygon: {response.text}")
        return None

def import_ranges():
    """Import ranges from shapefile."""
    try:
        # Read the shapefile
        shapefile_path = "/Users/ajinkyapatil/Documents/Biz Folder/Elephant Watch/ELE_layers/Range.shp"
        logger.info(f"Reading shapefile from {shapefile_path}")
        gdf = gpd.read_file(shapefile_path)
        
        # Convert to WGS84 if needed
        if gdf.crs is None or gdf.crs.to_epsg() != 4326:
            logger.info("Converting to WGS84 (EPSG:4326)")
            gdf = gdf.to_crs(epsg=4326)
        
        # Get existing codes
        existing_codes = fetch_existing_codes()
        
        # Process each range
        for idx, row in gdf.iterrows():
            try:
                # Get division ID
                division_id = fetch_division_id(str(row['SID']), str(row['DID']))
                if not division_id:
                    logger.error(f"Division not found for SID: {row['SID']}, DID: {row['DID']}")
                    continue
                
                # Generate range code
                code = get_next_code('RNG', existing_codes)
                existing_codes.add(code)
                
                # Prepare range data
                range_data = {
                    'sid': str(row['SID']),
                    'did': str(row['DID']),
                    'rid': str(row['RID']),
                    'state': str(row['State']),
                    'division_name': str(row['Division']),
                    'name': str(row['Range']),
                    'code': code,
                    'associated_division_id': division_id
                }
                
                # Insert range
                range_id = insert_range(range_data)
                if not range_id:
                    logger.error(f"Failed to insert range: {range_data['name']}")
                    continue
                
                # Process geometry
                geometry = convert_to_single_polygon(row.geometry)
                
                # Prepare polygon data
                polygon_data = {
                    'range_id': range_id,
                    'polygon': f"SRID=4326;{geometry.wkt}",
                    'area': float(geometry.area) if hasattr(geometry, 'area') else None,
                    'perimeter': float(geometry.length) if hasattr(geometry, 'length') else None
                }
                
                # Insert polygon
                polygon_id = insert_range_polygon(polygon_data)
                if polygon_id:
                    logger.info(f"Successfully imported range: {range_data['name']} (Code: {code}, Division: {range_data['division_name']})")
                else:
                    logger.error(f"Failed to insert polygon for range: {range_data['name']}")
                
            except Exception as e:
                logger.error(f"Error processing range at index {idx}: {str(e)}")
                continue
                
    except Exception as e:
        logger.error(f"Error importing ranges: {str(e)}")
        raise

if __name__ == "__main__":
    logger.info("Starting range import...")
    import_ranges()
    logger.info("Range import completed!") 