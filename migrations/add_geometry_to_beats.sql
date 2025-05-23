-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geometry column to beats table
ALTER TABLE beats ADD COLUMN IF NOT EXISTS geom geometry(Polygon, 4326);

-- Add spatial index for better performance
CREATE INDEX IF NOT EXISTS beats_geom_idx ON beats USING GIST (geom);

-- Add comment to explain the column
COMMENT ON COLUMN beats.geom IS 'PostGIS geometry column for beat boundaries in WGS84 (EPSG:4326)'; 