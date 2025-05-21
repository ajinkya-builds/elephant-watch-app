-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create table for beat polygons
CREATE TABLE beat_polygons (
    id SERIAL PRIMARY KEY,
    beat_name TEXT NOT NULL,
    range_name TEXT NOT NULL,
    division_name TEXT NOT NULL,
    geometry GEOMETRY(Polygon, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(beat_name, range_name, division_name)
);

-- Create spatial index for faster polygon lookups
CREATE INDEX beat_polygons_geometry_idx ON beat_polygons USING GIST (geometry);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_beat_polygons_updated_at
    BEFORE UPDATE ON beat_polygons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to find beat for given coordinates
CREATE OR REPLACE FUNCTION find_beat_for_coordinates(
    lat DOUBLE PRECISION,
    lon DOUBLE PRECISION
) RETURNS TABLE (
    beat_name TEXT,
    range_name TEXT,
    division_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bp.beat_name,
        bp.range_name,
        bp.division_name
    FROM beat_polygons bp
    WHERE ST_Contains(
        bp.geometry,
        ST_SetSRID(ST_MakePoint(lon, lat), 4326)
    )
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies
ALTER TABLE beat_polygons ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view beat polygons
CREATE POLICY "Authenticated users can view beat polygons"
ON beat_polygons FOR SELECT
TO authenticated
USING (true);

-- Allow admins to manage beat polygons
CREATE POLICY "Admins can manage beat polygons"
ON beat_polygons FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
); 