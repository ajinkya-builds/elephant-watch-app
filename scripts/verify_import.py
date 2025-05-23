import os
from supabase import create_client
from dotenv import load_dotenv
import logging
import geopandas as gpd
from typing import Dict, Set, List
import pandas as pd

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('verification.log'),
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

def read_shapefile(file_path: str) -> gpd.GeoDataFrame:
    """Read a shapefile and return a GeoDataFrame."""
    try:
        gdf = gpd.read_file(file_path)
        logger.info(f"Successfully read {file_path}")
        return gdf
    except Exception as e:
        logger.error(f"Error reading {file_path}: {str(e)}")
        raise

def get_supabase_records(table: str) -> List[Dict]:
    """Get all records from a Supabase table."""
    try:
        response = supabase.table(table).select("*").execute()
        return response.data
    except Exception as e:
        logger.error(f"Error fetching records from {table}: {str(e)}")
        return []

def verify_divisions(divisions_gdf: gpd.GeoDataFrame) -> bool:
    """Verify divisions data integrity."""
    logger.info("Verifying divisions...")
    supabase_divisions = get_supabase_records('divisions')
    
    # Check for duplicates
    division_ids = [str(d['associated_division_id']) for d in supabase_divisions]
    if len(division_ids) != len(set(division_ids)):
        logger.error("Duplicate associated_division_ids found in Supabase!")
        return False
    
    # Check if all shapefile divisions are in Supabase
    shapefile_divisions = set(divisions_gdf['DID'].astype(str))
    supabase_divisions_set = set(division_ids)
    
    missing_divisions = shapefile_divisions - supabase_divisions_set
    if missing_divisions:
        logger.error(f"Missing divisions in Supabase: {missing_divisions}")
        return False
    
    logger.info("Divisions verification passed!")
    return True

def verify_ranges(ranges_gdf: gpd.GeoDataFrame) -> bool:
    """Verify ranges data integrity."""
    logger.info("Verifying ranges...")
    supabase_ranges = get_supabase_records('ranges')
    
    # Check for duplicates
    range_ids = [str(r['associated_range_id']) for r in supabase_ranges]
    if len(range_ids) != len(set(range_ids)):
        logger.error("Duplicate associated_range_ids found in Supabase!")
        return False
    
    # Check if all shapefile ranges are in Supabase
    shapefile_ranges = set(ranges_gdf['RID'].astype(str))
    supabase_ranges_set = set(range_ids)
    
    missing_ranges = shapefile_ranges - supabase_ranges_set
    if missing_ranges:
        logger.error(f"Missing ranges in Supabase: {missing_ranges}")
        return False
    
    # Verify division relationships
    supabase_divisions = set(str(d['associated_division_id']) for d in get_supabase_records('divisions'))
    invalid_divisions = set(str(r['associated_division_id']) for r in supabase_ranges) - supabase_divisions
    if invalid_divisions:
        logger.error(f"Ranges with invalid division references: {invalid_divisions}")
        return False
    
    logger.info("Ranges verification passed!")
    return True

def verify_beats(beats_gdf: gpd.GeoDataFrame) -> bool:
    """Verify beats data integrity."""
    logger.info("Verifying beats...")
    supabase_beats = get_supabase_records('beats')
    
    # Check for duplicates
    beat_ids = [str(b['associated_beat_id']) for b in supabase_beats]
    if len(beat_ids) != len(set(beat_ids)):
        logger.error("Duplicate associated_beat_ids found in Supabase!")
        return False
    
    # Check if all shapefile beats are in Supabase
    shapefile_beats = set(beats_gdf['BID'].astype(str))
    supabase_beats_set = set(beat_ids)
    
    missing_beats = shapefile_beats - supabase_beats_set
    if missing_beats:
        logger.error(f"Missing beats in Supabase: {missing_beats}")
        return False
    
    # Verify range relationships
    supabase_ranges = set(str(r['associated_range_id']) for r in get_supabase_records('ranges'))
    invalid_ranges = set(str(b['associated_range_id']) for b in supabase_beats) - supabase_ranges
    if invalid_ranges:
        logger.error(f"Beats with invalid range references: {invalid_ranges}")
        return False
    
    logger.info("Beats verification passed!")
    return True

def verify_beat_polygons(beats_gdf: gpd.GeoDataFrame) -> bool:
    """Verify beat polygons data integrity."""
    logger.info("Verifying beat polygons...")
    supabase_polygons = get_supabase_records('beat_polygons')
    
    # Check for duplicates
    beat_ids = [str(p['associated_beat_id']) for p in supabase_polygons]
    if len(beat_ids) != len(set(beat_ids)):
        logger.error("Duplicate associated_beat_ids found in beat_polygons!")
        return False
    
    # Check if all beats have polygons
    supabase_beats = set(str(b['associated_beat_id']) for b in get_supabase_records('beats'))
    missing_polygons = supabase_beats - set(beat_ids)
    if missing_polygons:
        logger.error(f"Beats missing polygons: {missing_polygons}")
        return False
    
    # Verify beat relationships
    invalid_beats = set(beat_ids) - supabase_beats
    if invalid_beats:
        logger.error(f"Polygons with invalid beat references: {invalid_beats}")
        return False
    
    logger.info("Beat polygons verification passed!")
    return True

def main():
    base_path = "data/ELE_layers"
    try:
        logger.info("Starting data verification...")
        
        # Read shapefiles
        divisions_gdf = read_shapefile(os.path.join(base_path, "Division.shp"))
        ranges_gdf = read_shapefile(os.path.join(base_path, "Range.shp"))
        beats_gdf = read_shapefile(os.path.join(base_path, "Beat.shp"))
        
        # Verify each table
        divisions_ok = verify_divisions(divisions_gdf)
        ranges_ok = verify_ranges(ranges_gdf)
        beats_ok = verify_beats(beats_gdf)
        polygons_ok = verify_beat_polygons(beats_gdf)
        
        if all([divisions_ok, ranges_ok, beats_ok, polygons_ok]):
            logger.info("All verifications passed successfully!")
        else:
            logger.error("Some verifications failed. Please check the log for details.")
            
    except Exception as e:
        logger.error(f"Error during verification: {str(e)}")
        raise

if __name__ == "__main__":
    main() 