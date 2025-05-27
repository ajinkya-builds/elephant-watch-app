import geopandas as gpd
import os

def check_columns(file_path):
    print(f"\nChecking columns in {file_path}:")
    gdf = gpd.read_file(file_path)
    print("Columns:", gdf.columns.tolist())
    print("First row:", gdf.iloc[0].to_dict())

# Check all shapefiles
base_path = "data/ELE_layers"
check_columns(os.path.join(base_path, "Division.shp"))
check_columns(os.path.join(base_path, "Range.shp"))
check_columns(os.path.join(base_path, "Beat.shp")) 