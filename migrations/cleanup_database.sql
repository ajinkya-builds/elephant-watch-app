-- Drop any existing policies first
DO $$ 
BEGIN
    -- Drop policies if they exist
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'beat_polygons') THEN
        DROP POLICY IF EXISTS "Users can view forest data" ON beat_polygons;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'beats') THEN
        DROP POLICY IF EXISTS "Users can view forest data" ON beats;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ranges') THEN
        DROP POLICY IF EXISTS "Users can view forest data" ON ranges;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'divisions') THEN
        DROP POLICY IF EXISTS "Users can view forest data" ON divisions;
    END IF;
END $$;

-- Drop triggers if they exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_beat_polygons_audit') THEN
        DROP TRIGGER IF EXISTS set_beat_polygons_audit ON beat_polygons;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_beats_audit') THEN
        DROP TRIGGER IF EXISTS set_beats_audit ON beats;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_ranges_audit') THEN
        DROP TRIGGER IF EXISTS set_ranges_audit ON ranges;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_divisions_audit') THEN
        DROP TRIGGER IF EXISTS set_divisions_audit ON divisions;
    END IF;
END $$;

-- Drop the audit function if it exists
DROP FUNCTION IF EXISTS set_audit_fields();

-- Drop indexes if they exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_beat_polygons_beat_id') THEN
        DROP INDEX IF EXISTS idx_beat_polygons_beat_id;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_beat_polygons_polygon') THEN
        DROP INDEX IF EXISTS idx_beat_polygons_polygon;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_beat_polygons_forest_type') THEN
        DROP INDEX IF EXISTS idx_beat_polygons_forest_type;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_beats_beat_id') THEN
        DROP INDEX IF EXISTS idx_beats_beat_id;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_beats_range_id') THEN
        DROP INDEX IF EXISTS idx_beats_range_id;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_beats_forest_type') THEN
        DROP INDEX IF EXISTS idx_beats_forest_type;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_beats_state') THEN
        DROP INDEX IF EXISTS idx_beats_state;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_beats_district') THEN
        DROP INDEX IF EXISTS idx_beats_district;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ranges_range_id') THEN
        DROP INDEX IF EXISTS idx_ranges_range_id;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ranges_division_id') THEN
        DROP INDEX IF EXISTS idx_ranges_division_id;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ranges_state') THEN
        DROP INDEX IF EXISTS idx_ranges_state;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ranges_district') THEN
        DROP INDEX IF EXISTS idx_ranges_district;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_divisions_division_id') THEN
        DROP INDEX IF EXISTS idx_divisions_division_id;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_divisions_state') THEN
        DROP INDEX IF EXISTS idx_divisions_state;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_divisions_district') THEN
        DROP INDEX IF EXISTS idx_divisions_district;
    END IF;
END $$;

-- Drop tables if they exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'beat_polygons') THEN
        DROP TABLE IF EXISTS beat_polygons CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'beats') THEN
        DROP TABLE IF EXISTS beats CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'ranges') THEN
        DROP TABLE IF EXISTS ranges CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'divisions') THEN
        DROP TABLE IF EXISTS divisions CASCADE;
    END IF;
END $$;

-- Disable RLS on any remaining tables
ALTER TABLE IF EXISTS beat_polygons DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS beats DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ranges DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS divisions DISABLE ROW LEVEL SECURITY; 