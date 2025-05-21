-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create beat_polygons table
CREATE TABLE IF NOT EXISTS beat_polygons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beat_id UUID NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    polygon GEOMETRY(Polygon, 4326) NOT NULL, -- Using SRID 4326 (WGS84) for GPS coordinates
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_beat_polygons_beat_id ON beat_polygons(beat_id);
CREATE INDEX IF NOT EXISTS idx_beat_polygons_polygon ON beat_polygons USING GIST(polygon);
CREATE INDEX IF NOT EXISTS idx_beat_polygons_created_by ON beat_polygons(created_by);
CREATE INDEX IF NOT EXISTS idx_beat_polygons_updated_by ON beat_polygons(updated_by);

-- Add comments
COMMENT ON TABLE beat_polygons IS 'Stores polygon shapes for beats with geographic coordinates';
COMMENT ON COLUMN beat_polygons.polygon IS 'PostGIS polygon geometry in WGS84 (SRID 4326) format';
COMMENT ON COLUMN beat_polygons.beat_id IS 'Reference to the beat this polygon belongs to';

-- Enable Row Level Security
ALTER TABLE beat_polygons ENABLE ROW LEVEL SECURITY;

-- Create policies for access control
CREATE POLICY "Users can view beat polygons"
ON beat_polygons FOR SELECT
USING (
    auth.role() = 'service_role'
    OR auth.jwt() ->> 'role' = 'admin'
    OR auth.jwt() ->> 'role' = 'manager'
);

CREATE POLICY "Admins and managers can create beat polygons"
ON beat_polygons FOR INSERT
WITH CHECK (
    auth.role() = 'service_role'
    OR auth.jwt() ->> 'role' = 'admin'
    OR auth.jwt() ->> 'role' = 'manager'
);

CREATE POLICY "Admins and managers can update beat polygons"
ON beat_polygons FOR UPDATE
USING (
    auth.role() = 'service_role'
    OR auth.jwt() ->> 'role' = 'admin'
    OR auth.jwt() ->> 'role' = 'manager'
)
WITH CHECK (
    auth.role() = 'service_role'
    OR auth.jwt() ->> 'role' = 'admin'
    OR auth.jwt() ->> 'role' = 'manager'
);

CREATE POLICY "Admins and managers can delete beat polygons"
ON beat_polygons FOR DELETE
USING (
    auth.role() = 'service_role'
    OR auth.jwt() ->> 'role' = 'admin'
    OR auth.jwt() ->> 'role' = 'manager'
);

-- Add trigger to automatically set created_by and updated_by
CREATE OR REPLACE FUNCTION set_beat_polygon_audit()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.created_by := auth.uid();
        NEW.updated_by := auth.uid();
    ELSIF TG_OP = 'UPDATE' THEN
        NEW.updated_by := auth.uid();
        NEW.updated_at := NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_beat_polygon_audit_trigger
    BEFORE INSERT OR UPDATE ON beat_polygons
    FOR EACH ROW
    EXECUTE FUNCTION set_beat_polygon_audit(); 