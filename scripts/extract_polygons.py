import geopandas as gpd
import json

# Path to the shapefile
shapefile_path = '/Users/ajinkyapatil/Documents/Biz Folder/Elephant Watch/ELE_layers/Beat.shp'

# Read the shapefile
gdf = gpd.read_file(shapefile_path)

# Convert to GeoJSON
geojson_data = gdf.to_json()

# Save to a file
with open('beat_polygons.geojson', 'w') as f:
    f.write(geojson_data)

print("Polygons extracted and saved to beat_polygons.geojson") 