import geopandas as gpd
import os
from supabase import create_client
from dotenv import load_dotenv
import logging
from shapely.geometry import mapping, Polygon, MultiPolygon
import json
from typing import List, Dict, Any

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

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

# Debug logging
logger.info(f"Supabase URL: {supabase_url}")
logger.info(f"Supabase key length: {len(supabase_key) if supabase_key else 0}")

if not supabase_url or not supabase_key:
    raise ValueError("Missing required environment variables. Please check your .env file.")

supabase = create_client(supabase_url, supabase_key)

# List of beats that failed in previous import
FAILED_BEATS = [
    'Barouda', 'Barhi', 'Chandia', 'Jogin', 'Majhouli_Kala', 'Majhouli_Khurd',
    'Baghwara', 'Barhaikhudri', 'Bhanpura', 'Kathotiya', 'Singhpur', 'Atariya',
    'Kohka', 'Lalpur', 'Akhadar', 'Amadra', 'Badkhera', 'Ghoghari', 'Harwah',
    'Kathai', 'Kaudia', 'Majhaganwa', 'Manikpur', 'Salliya', 'Balbai', 'Chauri',
    'Malachuwa', 'Rogarh', 'Barhaikudri', 'Beladdadar', 'Belsara', 'Changera_Wast',
    'Dulehari', 'Ghulghuli', 'Karri', 'Kathautia', 'Manari', 'Rahtha', 'Sajania',
    'Sastra', 'Tikaria', 'Amaha', 'Bannauda', 'Baramtola', 'Barbaspur', 'Beli',
    'Jamuhai_Nourth', 'Karkati', 'Pali'
]

def read_shapefile(file_path: str) -> gpd.GeoDataFrame:
    """Read a shapefile and return a GeoDataFrame."""
    try:
        gdf = gpd.read_file(file_path)
        logger.info(f"Successfully read {file_path}")
        return gdf
    except Exception as e:
        logger.error(f"Error reading {file_path}: {str(e)}")
        raise

def get_existing_records(table: str, id_field: str) -> List[str]:
    """Get list of existing record IDs from a table."""
    try:
        response = supabase.table(table).select(id_field).execute()
        return [record[id_field] for record in response.data]
    except Exception as e:
        logger.error(f"Error fetching existing records from {table}: {str(e)}")
        return []

def import_divisions(divisions_gdf: gpd.GeoDataFrame) -> None:
    """Import only missing divisions data using upsert."""
    existing_ids = get_existing_records('divisions', 'associated_division_id')
    for _, row in divisions_gdf.iterrows():
        division_id = str(row['DID'])
        if division_id not in existing_ids:
            try:
                data = {
                    'associated_division_id': division_id,
                    'name': str(row['Division']),
                    'state': str(row['State']),
                    'district': None
                }
                result = supabase.table('divisions').upsert(data, on_conflict=['associated_division_id']).execute()
                logger.info(f"Upserted division: {data['name']}")
            except Exception as e:
                logger.error(f"Error upserting division {row['Division']}: {str(e)}")

def import_ranges(ranges_gdf: gpd.GeoDataFrame) -> None:
    """Import only missing ranges data using upsert."""
    existing_ids = get_existing_records('ranges', 'associated_range_id')
    for _, row in ranges_gdf.iterrows():
        range_id = str(row['RID'])
        if range_id not in existing_ids:
            try:
                data = {
                    'associated_range_id': range_id,
                    'associated_division_id': str(row['DID']),
                    'name': str(row['Range']),
                    'state': str(row['State']),
                    'district': None
                }
                result = supabase.table('ranges').upsert(data, on_conflict=['associated_range_id']).execute()
                logger.info(f"Upserted range: {data['name']}")
            except Exception as e:
                logger.error(f"Error upserting range {row['Range']}: {str(e)}")

def import_beats(beats_gdf: gpd.GeoDataFrame) -> None:
    """Import only missing beats data using upsert."""
    existing_ids = get_existing_records('beats', 'associated_beat_id')
    for _, row in beats_gdf.iterrows():
        beat_id = str(row['BID'])
        if beat_id not in existing_ids:
            try:
                data = {
                    'associated_beat_id': beat_id,
                    'associated_range_id': str(row['RID']),
                    'name': str(row['Beat']),
                    'forest_type': None,
                    'state': str(row['State']),
                    'district': None
                }
                result = supabase.table('beats').upsert(data, on_conflict=['associated_beat_id']).execute()
                logger.info(f"Upserted beat: {data['name']}")
            except Exception as e:
                logger.error(f"Error upserting beat {row['Beat']}: {str(e)}")

def convert_to_polygon(geometry):
    """Convert MultiPolygon to Polygon by taking the largest polygon."""
    if isinstance(geometry, MultiPolygon):
        # Get the largest polygon from the MultiPolygon
        largest_polygon = max(geometry.geoms, key=lambda p: p.area)
        return largest_polygon
    return geometry

def import_beat_polygons(beats_gdf: gpd.GeoDataFrame) -> None:
    """Import only failed beat polygons data using upsert."""
    for _, row in beats_gdf.iterrows():
        beat_name = str(row['Beat'])
        if beat_name in FAILED_BEATS:
            try:
                # Convert geometry to Polygon if it's a MultiPolygon
                geometry = convert_to_polygon(row.geometry)
                geometry_dict = mapping(geometry)
                data = {
                    'associated_beat_id': str(row['BID']),
                    'polygon': json.dumps(geometry_dict),
                    'forest_type': None
                }
                result = supabase.table('beat_polygons').upsert(data, on_conflict=['associated_beat_id']).execute()
                logger.info(f"Successfully upserted polygon for beat: {beat_name}")
            except Exception as e:
                logger.error(f"Error upserting polygon for beat {beat_name}: {str(e)}")

def reimport_single_beat_polygon(beat_id: str):
    base_path = "data/ELE_layers"
    beats_gdf = gpd.read_file(os.path.join(base_path, "Beat.shp"))
    row = beats_gdf[beats_gdf['BID'].astype(str) == beat_id]
    if row.empty:
        logger.error(f"Beat with ID {beat_id} not found in shapefile.")
        return
    row = row.iloc[0]
    try:
        geometry = row.geometry
        if isinstance(geometry, MultiPolygon):
            geometry = max(geometry.geoms, key=lambda p: p.area)
        geometry_dict = mapping(geometry)
        data = {
            'associated_beat_id': str(row['BID']),
            'polygon': json.dumps(geometry_dict),
            'forest_type': None
        }
        result = supabase.table('beat_polygons').upsert(data, on_conflict=['associated_beat_id']).execute()
        logger.info(f"Successfully reimported polygon for beat: {row['Beat']} (ID: {beat_id})")
    except Exception as e:
        logger.error(f"Error reimporting polygon for beat {beat_id}: {str(e)}")

def main():
    base_path = "data/ELE_layers"
    try:
        logger.info("Starting import of failed records...")
        
        # Read shapefile
        beats_gdf = read_shapefile(os.path.join(base_path, "Beat.shp"))
        
        # Import only failed beat polygons
        logger.info("Importing failed beat polygons...")
        import_beat_polygons(beats_gdf)
        
        logger.info("Import of failed records completed!")
    except Exception as e:
        logger.error(f"Error during data import: {str(e)}")
        raise

if __name__ == "__main__":
    reimport_single_beat_polygon('031') 