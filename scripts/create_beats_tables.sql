-- Create beats table
CREATE TABLE IF NOT EXISTS beats (
    id SERIAL PRIMARY KEY,
    bid VARCHAR(10) NOT NULL,  -- Beat ID
    rid VARCHAR(10) NOT NULL,  -- Range ID
    did VARCHAR(10) NOT NULL,  -- Division ID
    name VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    division_name VARCHAR(255) NOT NULL,
    range_name VARCHAR(255) NOT NULL,
    area FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(bid, rid, did)
);

-- Create beat_polygons table
CREATE TABLE IF NOT EXISTS beat_polygons (
    id SERIAL PRIMARY KEY,
    beat_id INTEGER REFERENCES beats(id) ON DELETE CASCADE,
    polygon GEOMETRY(Polygon, 4326) NOT NULL,
    area FLOAT,
    perimeter FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create triggers for beats and beat_polygons
DROP TRIGGER IF EXISTS update_beats_updated_at ON beats;
DROP TRIGGER IF EXISTS update_beat_polygons_updated_at ON beat_polygons;

CREATE TRIGGER update_beats_updated_at
    BEFORE UPDATE ON beats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beat_polygons_updated_at
    BEFORE UPDATE ON beat_polygons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 