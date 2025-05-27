-- Add metadata columns to beats table
ALTER TABLE beats
ADD COLUMN IF NOT EXISTS range_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS division_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS forest_type VARCHAR(255),
ADD COLUMN IF NOT EXISTS area NUMERIC,
ADD COLUMN IF NOT EXISTS perimeter NUMERIC,
ADD COLUMN IF NOT EXISTS state VARCHAR(255),
ADD COLUMN IF NOT EXISTS district VARCHAR(255),
ADD COLUMN IF NOT EXISTS block VARCHAR(255),
ADD COLUMN IF NOT EXISTS village VARCHAR(255);

-- Add metadata columns to beat_polygons table
ALTER TABLE beat_polygons
ADD COLUMN IF NOT EXISTS area NUMERIC,
ADD COLUMN IF NOT EXISTS perimeter NUMERIC,
ADD COLUMN IF NOT EXISTS forest_type VARCHAR(255);

-- Add indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_beats_range_id ON beats(range_id);
CREATE INDEX IF NOT EXISTS idx_beats_division_id ON beats(division_id);
CREATE INDEX IF NOT EXISTS idx_beats_forest_type ON beats(forest_type);
CREATE INDEX IF NOT EXISTS idx_beats_state ON beats(state);
CREATE INDEX IF NOT EXISTS idx_beats_district ON beats(district);

-- Add comments
COMMENT ON COLUMN beats.range_id IS 'ID of the forest range this beat belongs to';
COMMENT ON COLUMN beats.division_id IS 'ID of the forest division this beat belongs to';
COMMENT ON COLUMN beats.forest_type IS 'Type of forest in this beat';
COMMENT ON COLUMN beats.area IS 'Area of the beat in square units';
COMMENT ON COLUMN beats.perimeter IS 'Perimeter of the beat in units';
COMMENT ON COLUMN beats.state IS 'State where the beat is located';
COMMENT ON COLUMN beats.district IS 'District where the beat is located';
COMMENT ON COLUMN beats.block IS 'Block where the beat is located';
COMMENT ON COLUMN beats.village IS 'Village where the beat is located';

COMMENT ON COLUMN beat_polygons.area IS 'Area of the polygon in square units';
COMMENT ON COLUMN beat_polygons.perimeter IS 'Perimeter of the polygon in units';
COMMENT ON COLUMN beat_polygons.forest_type IS 'Type of forest in this polygon'; 