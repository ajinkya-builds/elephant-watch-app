import geopandas as gpd
import pandas as pd

# Read the shapefile
shapefile_path = "/Users/ajinkyapatil/Documents/Biz Folder/Elephant Watch/Division_projected/Division_projected.shp"
gdf = gpd.read_file(shapefile_path)

# Convert geometry to WKT format
gdf['geometry'] = gdf['geometry'].apply(lambda x: x.wkt)

# Save to CSV
output_csv = "division_boundaries.csv"
gdf.to_csv(output_csv, index=False)

print(f"Successfully converted shapefile to CSV: {output_csv}") 