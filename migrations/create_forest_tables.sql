-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create audit function
CREATE OR REPLACE FUNCTION set_audit_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.created_at = CURRENT_TIMESTAMP;
        NEW.updated_at = CURRENT_TIMESTAMP;
    ELSIF TG_OP = 'UPDATE' THEN
        NEW.updated_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create divisions table
CREATE TABLE divisions (
    id SERIAL PRIMARY KEY,
    division_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(100),
    district VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create ranges table
CREATE TABLE ranges (
    id SERIAL PRIMARY KEY,
    range_id VARCHAR(50) UNIQUE NOT NULL,
    division_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(100),
    district VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (division_id) REFERENCES divisions(division_id) ON DELETE CASCADE
);

-- Create beats table
CREATE TABLE beats (
    id SERIAL PRIMARY KEY,
    beat_id VARCHAR(50) UNIQUE NOT NULL,
    range_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    forest_type VARCHAR(100),
    state VARCHAR(100),
    district VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (range_id) REFERENCES ranges(range_id) ON DELETE CASCADE
);

-- Create beat_polygons table
CREATE TABLE beat_polygons (
    id SERIAL PRIMARY KEY,
    beat_id VARCHAR(50) NOT NULL,
    polygon GEOMETRY(Polygon, 4326) NOT NULL,
    forest_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (beat_id) REFERENCES beats(beat_id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_divisions_division_id ON divisions(division_id);
CREATE INDEX idx_divisions_state ON divisions(state);
CREATE INDEX idx_divisions_district ON divisions(district);

CREATE INDEX idx_ranges_range_id ON ranges(range_id);
CREATE INDEX idx_ranges_division_id ON ranges(division_id);
CREATE INDEX idx_ranges_state ON ranges(state);
CREATE INDEX idx_ranges_district ON ranges(district);

CREATE INDEX idx_beats_beat_id ON beats(beat_id);
CREATE INDEX idx_beats_range_id ON beats(range_id);
CREATE INDEX idx_beats_forest_type ON beats(forest_type);
CREATE INDEX idx_beats_state ON beats(state);
CREATE INDEX idx_beats_district ON beats(district);

CREATE INDEX idx_beat_polygons_beat_id ON beat_polygons(beat_id);
CREATE INDEX idx_beat_polygons_polygon ON beat_polygons USING GIST(polygon);
CREATE INDEX idx_beat_polygons_forest_type ON beat_polygons(forest_type);

-- Create audit triggers
CREATE TRIGGER set_divisions_audit
    BEFORE INSERT OR UPDATE ON divisions
    FOR EACH ROW
    EXECUTE FUNCTION set_audit_fields();

CREATE TRIGGER set_ranges_audit
    BEFORE INSERT OR UPDATE ON ranges
    FOR EACH ROW
    EXECUTE FUNCTION set_audit_fields();

CREATE TRIGGER set_beats_audit
    BEFORE INSERT OR UPDATE ON beats
    FOR EACH ROW
    EXECUTE FUNCTION set_audit_fields();

CREATE TRIGGER set_beat_polygons_audit
    BEFORE INSERT OR UPDATE ON beat_polygons
    FOR EACH ROW
    EXECUTE FUNCTION set_audit_fields();

-- Enable Row Level Security
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE beats ENABLE ROW LEVEL SECURITY;
ALTER TABLE beat_polygons ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Users can view forest data" ON divisions
    FOR SELECT
    USING (true);

CREATE POLICY "Users can view forest data" ON ranges
    FOR SELECT
    USING (true);

CREATE POLICY "Users can view forest data" ON beats
    FOR SELECT
    USING (true);

CREATE POLICY "Users can view forest data" ON beat_polygons
    FOR SELECT
    USING (true);

-- Add comments
COMMENT ON TABLE divisions IS 'Forest divisions with their administrative boundaries';
COMMENT ON TABLE ranges IS 'Forest ranges within divisions';
COMMENT ON TABLE beats IS 'Forest beats within ranges';
COMMENT ON TABLE beat_polygons IS 'Polygon shapes for beats with geographic coordinates'; 