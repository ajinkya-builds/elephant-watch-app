-- Drop tables in the correct order to avoid foreign key constraint issues
DROP TABLE IF EXISTS beat_polygons;
DROP TABLE IF EXISTS beats;
DROP TABLE IF EXISTS ranges;
DROP TABLE IF EXISTS divisions; 