import psycopg2
import json
from datetime import datetime

# Database connection parameters
db_params = {
    'dbname': 'elephant_watch',
    'user': 'ajinkyapatil',
    'host': 'localhost',
    'port': '5432'
}

def generate_coordinates_json():
    try:
        # Connect to the database
        conn = psycopg2.connect(**db_params)
        cur = conn.cursor()

        # Create temporary table for UUIDs
        cur.execute("""
            CREATE TEMPORARY TABLE beat_uuids AS
            WITH unique_combinations AS (
                SELECT DISTINCT 
                    "BID",
                    "SID",
                    "RID",
                    "DID",
                    "Beat_Name",
                    "Range_Name",
                    "Division_Name"
                FROM coordinates
            ),
            uuid_mapping AS (
                SELECT 
                    *,
                    gen_random_uuid() as beat_uuid
                FROM unique_combinations
            )
            SELECT * FROM uuid_mapping;
        """)

        # Get coordinates data with UUIDs
        cur.execute("""
            SELECT 
                beat_uuid,
                c."BID",
                c."SID",
                c."RID",
                c."DID",
                c."Beat_Name",
                c."Range_Name",
                c."Division_Name",
                c."State",
                c."Beat_Ar",
                c.beat_lat,
                c.beat_lon,
                c.range_lat,
                c.range_lon,
                c.division_lat,
                c.division_lon
            FROM coordinates c
            JOIN beat_uuids u ON 
                c."BID" = u."BID" AND 
                c."SID" = u."SID" AND 
                c."RID" = u."RID" AND 
                c."DID" = u."DID";
        """)

        # Fetch all results
        rows = cur.fetchall()
        
        # Convert to list of dictionaries
        coordinates = []
        for row in rows:
            coordinate = {
                'id': str(row[0]),  # Convert UUID to string
                'bid': row[1],
                'sid': row[2],
                'rid': row[3],
                'did': row[4],
                'beat_name': row[5],
                'range_name': row[6],
                'division_name': row[7],
                'state': row[8],
                'beat_area': float(row[9]) if row[9] is not None else None,
                'beat_lat': float(row[10]) if row[10] is not None else None,
                'beat_lon': float(row[11]) if row[11] is not None else None,
                'range_lat': float(row[12]) if row[12] is not None else None,
                'range_lon': float(row[13]) if row[13] is not None else None,
                'division_lat': float(row[14]) if row[14] is not None else None,
                'division_lon': float(row[15]) if row[15] is not None else None,
                'created_at': datetime.now().isoformat()
            }
            coordinates.append(coordinate)

        # Write to JSON file
        with open('coordinates_with_uuids.json', 'w') as f:
            json.dump(coordinates, f, indent=2)

        # Clean up
        cur.execute("DROP TABLE beat_uuids;")
        conn.commit()

    except Exception as e:
        print(f"Error: {e}")
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    generate_coordinates_json() 