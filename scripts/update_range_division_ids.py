import os
import csv
from supabase import create_client
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Please set SUPABASE_URL and SUPABASE_KEY environment variables")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

CSV_PATH = "/Users/ajinkyapatil/Documents/Biz Folder/Elephant Watch/ELE_layers/beat_data.csv"

def build_range_division_map(csv_path):
    mapping = {}
    with open(csv_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            range_name = row['Range']
            rid = str(int(row['RID']))  # Remove leading zeros
            new_div_id = str(int(row['DID']))  # Remove leading zeros
            mapping[(range_name, rid)] = new_div_id
    return mapping

def update_ranges(mapping):
    for (range_name, rid), new_div_id in mapping.items():
        logger.info(f"Updating range '{range_name}' (rid {rid}) to division_id {new_div_id}")
        try:
            response = supabase.table('ranges').select('rid, name, associated_division_id').eq('name', range_name).eq('rid', rid).execute()
            for record in response.data:
                range_rid = record['rid']
                supabase.table('ranges').update({'associated_division_id': new_div_id}).eq('rid', range_rid).execute()
                logger.info(f"Updated range rid {range_rid}: division_id set to {new_div_id}")
        except Exception as e:
            logger.error(f"Error updating range '{range_name}' (rid {rid}): {e}")

def main():
    mapping = build_range_division_map(CSV_PATH)
    update_ranges(mapping)
    logger.info("Range division_id update completed.")

if __name__ == "__main__":
    main() 