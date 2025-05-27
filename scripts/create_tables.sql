-- Create tables for beats, divisions, ranges, and polygons

-- Create divisions table
CREATE TABLE IF NOT EXISTS divisions (
    division_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- Create ranges table
CREATE TABLE IF NOT EXISTS ranges (
    range_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    division_id INTEGER REFERENCES divisions(division_id),
    description TEXT
);

-- Create beats table
CREATE TABLE IF NOT EXISTS beats (
    beat_id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    range_id INTEGER REFERENCES ranges(range_id),
    division_id INTEGER REFERENCES divisions(division_id),
    description TEXT,
    forest_type VARCHAR(255),
    area FLOAT,
    perimeter FLOAT,
    state VARCHAR(255),
    district VARCHAR(255),
    block VARCHAR(255),
    village VARCHAR(255)
);

-- Create beat_polygons table
CREATE TABLE IF NOT EXISTS beat_polygons (
    polygon_id SERIAL PRIMARY KEY,
    beat_id UUID REFERENCES beats(beat_id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    polygon GEOMETRY(Polygon, 4326),
    area FLOAT,
    perimeter FLOAT,
    forest_type VARCHAR(255)
); 