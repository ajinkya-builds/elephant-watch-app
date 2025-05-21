import os
import geopandas as gpd
from shapely.geometry import mapping
from supabase import create_client
import logging
from typing import Dict, Any, Optional, Set, Tuple
import json
import itertools
from dotenv import load_dotenv
import requests

# Configure logging
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

# Supabase configuration
SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_KEY = os.getenv('VITE_SUPABASE_SERVICE_ROLE_KEY')

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Please set SUPABASE_URL and SUPABASE_KEY environment variables")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def ensure_multipolygon(geometry):
    """Convert any polygon to multipolygon if needed."""
    if geometry.geom_type == 'Polygon':
        return geometry
    elif geometry.geom_type == 'MultiPolygon':
        return geometry
    else:
        raise ValueError(f"Unsupported geometry type: {geometry.geom_type}")

def get_existing_beats() -> Set[Tuple[str, str, str, str]]:
    """Get set of existing beat combinations (bid, rid, did, name) from Supabase."""
    try:
        response = supabase.table('beats').select('bid, rid, did, name').execute()
        return {
            (str(record['bid']), str(record['rid']), str(record['did']), str(record['name']))
            for record in response.data
        }
    except Exception as e:
        logger.error(f"Error fetching existing beats: {str(e)}")
        return set()

def get_existing_polygons() -> Set[str]:
    """Get set of existing beat IDs that have polygons."""
    try:
        response = supabase.table('beat_polygons').select('beat_id').execute()
        return {str(record['beat_id']) for record in response.data}
    except Exception as e:
        logger.error(f"Error fetching existing polygons: {str(e)}")
        return set()

def insert_record(table: str, data: Dict[str, Any], id_column: str) -> Optional[str]:
    """Insert a record into Supabase and return its ID."""
    try:
        response = supabase.table(table).insert(data).execute()
        if response.data:
            return response.data[0][id_column]
        return None
    except Exception as e:
        logger.error(f"Error inserting record into {table}: {str(e)}")
        return None

def import_beats(shapefile_path: str) -> None:
    """Import beats data from shapefile to Supabase."""
    try:
        # Read shapefile
        logger.info(f"Reading shapefile from {shapefile_path}")
        beats_gdf = gpd.read_file(shapefile_path)
        
        # Convert to WGS84 if needed
        if beats_gdf.crs is None or beats_gdf.crs.to_epsg() != 4326:
            logger.info("Converting to WGS84 (EPSG:4326)")
            beats_gdf = beats_gdf.to_crs(epsg=4326)
        
        # Get existing records for deduplication
        existing_beats = get_existing_beats()
        existing_polygons = get_existing_polygons()
        
        # Process each beat
        for _, row in beats_gdf.iterrows():
            bid = str(row['BID']).zfill(3)  # business key from shapefile, 3 chars with leading zeros
            rid = str(row['RID']).zfill(3)  # 3 chars with leading zeros
            did = str(row['DID']).zfill(3)  # 3 chars with leading zeros
            sid = str(row['SID']).zfill(3)  # 3 chars with leading zeros
            beat_name = str(row['Beat'])
            
            # Generate unique code for the beat
            beat_code = f"BEAT{sid}{did}{rid}{bid}"
            
            # Create composite key
            beat_key = (bid, rid, did)  # Composite unique key
            
            # Skip if beat combination already exists
            if beat_key in existing_beats:
                logger.info(f"Skipping existing beat combination: {beat_key}")
                continue
            
            # Prepare beat metadata
            beat_data = {
                'sid': sid,
                'bid': bid,
                'rid': rid,
                'did': did,
                'name': beat_name,
                'code': beat_code,
                'area': float(row['Beat_Ar']) if row['Beat_Ar'] is not None else None,
                'state': str(row['State']) if 'State' in row else None,
                'division_name': str(row['Division']) if 'Division' in row else None,
                'range_name': str(row['Range']) if 'Range' in row else None
            }
            
            # Insert beat record
            inserted_beat_id = insert_record('beats', beat_data, 'id')
            if not inserted_beat_id:
                logger.error(f"Failed to insert beat: {beat_key}")
                continue
            
            # Prepare polygon data
            try:
                geometry = ensure_multipolygon(row.geometry)
                polygon_data = {
                    'beat_id': inserted_beat_id,
                    'polygon': f"SRID=4326;{geometry.wkt}",
                    'area': float(row['Beat_Ar']) if row['Beat_Ar'] is not None else None,
                    'perimeter': float(geometry.length) if hasattr(geometry, 'length') else None,
                    'code': beat_code  # Add code for traceability
                }
                
                # Insert polygon record
                if inserted_beat_id not in existing_polygons:
                    polygon_id = insert_record('beat_polygons', polygon_data, 'id')
                    if polygon_id:
                        logger.info(f"Successfully imported beat: {beat_name} (BID: {bid}, RID: {rid}, DID: {did}, CODE: {beat_code})")
                    else:
                        logger.error(f"Failed to insert polygon for beat: {beat_key}")
                else:
                    logger.info(f"Skipping existing polygon for beat: {beat_key}")
                
            except Exception as e:
                logger.error(f"Error processing geometry for beat {beat_key}: {str(e)}")
                continue
            
    except Exception as e:
        logger.error(f"Error importing beats: {str(e)}")
        raise

def main():
    """Main function to run the import."""
    shapefile_path = "/Users/ajinkyapatil/Documents/Biz Folder/Elephant Watch/ELE_layers/Beat.shp"
    
    if not os.path.exists(shapefile_path):
        raise FileNotFoundError(f"Shapefile not found at {shapefile_path}")
    
    logger.info("Starting beats import...")
    import_beats(shapefile_path)
    logger.info("Beats import completed!")

if __name__ == "__main__":
    main() 