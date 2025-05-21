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

def ensure_multipolygon(geometry) -> MultiPolygon:
    """Convert geometry to MultiPolygon if it's not already."""
    if isinstance(geometry, MultiPolygon):
        return geometry
    elif isinstance(geometry, Polygon):
        return MultiPolygon([geometry])
    else:
        raise ValueError(f"Unsupported geometry type: {type(geometry)}")

def import_failed_beats(beats_gdf: gpd.GeoDataFrame) -> None:
    """Import only failed beats and their polygons."""
    for _, row in beats_gdf.iterrows():
        beat_name = str(row['Beat'])
        if beat_name in FAILED_BEATS:
            try:
                # Get the beat record from the database
                beat_response = supabase.table('beats').select('id').eq('name', beat_name).execute()
                
                if not beat_response.data:
                    logger.error(f"Beat {beat_name} not found in database")
                    continue
                
                beat_id = beat_response.data[0]['id']
                
                # Convert geometry to MultiPolygon
                geometry = ensure_multipolygon(row.geometry)
                
                # Create polygon data
                polygon_data = {
                    'beat_id': beat_id,
                    'polygon': f"SRID=4326;{geometry.wkt}",
                    'area': float(row['Beat_Ar']) if row['Beat_Ar'] is not None else None,
                    'perimeter': float(geometry.length) if hasattr(geometry, 'length') else None
                }
                
                # Insert polygon record
                result = supabase.table('beat_polygons').upsert(polygon_data).execute()
                
                if result.data:
                    logger.info(f"Successfully imported polygon for beat: {beat_name}")
                else:
                    logger.error(f"Failed to import polygon for beat: {beat_name}")
                
            except Exception as e:
                logger.error(f"Error processing beat {beat_name}: {str(e)}")
                continue

def main():
    base_path = "/Users/ajinkyapatil/Documents/Biz Folder/Elephant Watch/ELE_layers"
    try:
        logger.info("Starting import of failed records...")
        
        # Read shapefile
        beats_gdf = read_shapefile(os.path.join(base_path, "Beat.shp"))
        
        # Convert to WGS84 if needed
        if beats_gdf.crs is None or beats_gdf.crs.to_epsg() != 4326:
            logger.info("Converting to WGS84 (EPSG:4326)")
            beats_gdf = beats_gdf.to_crs(epsg=4326)
        
        # Import failed beats
        logger.info("Importing failed beats...")
        import_failed_beats(beats_gdf)
        
        logger.info("Import of failed records completed!")
    except Exception as e:
        logger.error(f"Error during data import: {str(e)}")
        raise

if __name__ == "__main__":
    main() 