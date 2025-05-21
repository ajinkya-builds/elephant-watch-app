import geopandas as gpd
import json
import sys
from pathlib import Path
import re

def is_valid_uuid(val):
    uuid_regex = re.compile(r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$')
    return bool(uuid_regex.match(str(val)))

def convert_shapefile_to_json(shapefile_path, output_path=None):
    """
    Convert a Shapefile to JSON format compatible with our database.
    The Shapefile should have a column containing the beat UUID.
    
    Args:
        shapefile_path (str): Path to the .shp file
        output_path (str, optional): Path to save the JSON file. If None, prints to stdout
    """
    try:
        # Read the shapefile
        gdf = gpd.read_file(shapefile_path)
        
        # Print available columns to help identify the UUID column
        print("\nAvailable columns in the Shapefile:")
        for col in gdf.columns:
            print(f"- {col}")
        
        # Convert to WGS84 (EPSG:4326) if not already
        if gdf.crs != 'EPSG:4326':
            gdf = gdf.to_crs('EPSG:4326')
        
        # Prepare the output data
        output_data = []
        ignored_count = 0
        
        # Process each polygon
        for idx, row in gdf.iterrows():
            # Get the polygon coordinates
            if row.geometry.geom_type == 'Polygon':
                # Convert polygon to list of coordinates
                coords = list(row.geometry.exterior.coords)
                
                # Print row data to help identify the UUID
                print(f"\nRow {idx + 1} data:")
                for col in gdf.columns:
                    print(f"{col}: {row[col]}")
                
                # Try different possible column names for UUID
                beat_id = row.get('beat_id', row.get('BEAT_ID', row.get('id', row.get('ID', ''))))
                if not is_valid_uuid(beat_id):
                    ignored_count += 1
                    continue
                
                # Create the polygon record
                polygon_record = {
                    "beat_id": str(beat_id),
                    "name": row.get('name', row.get('NAME', f'Polygon {idx + 1}')),
                    "coordinates": [[float(coord[0]), float(coord[1])] for coord in coords]
                }
                output_data.append(polygon_record)
            else:
                print(f"Warning: Skipping non-polygon geometry at index {idx}")
        
        # Convert to JSON
        json_data = json.dumps(output_data, indent=2)
        
        # Save or print the output
        if output_path:
            with open(output_path, 'w') as f:
                f.write(json_data)
            print(f"\nJSON data saved to {output_path}")
        else:
            print("\nJSON output:")
            print(json_data)
        
        print(f"\nNumber of ignored rows (no valid UUID): {ignored_count}")
        return output_data
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python convert_shapefile.py <shapefile_path> [output_json_path]")
        sys.exit(1)
        
    shapefile_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None
    
    convert_shapefile_to_json(shapefile_path, output_path) 