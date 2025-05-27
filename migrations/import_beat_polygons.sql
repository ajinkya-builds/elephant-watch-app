-- Import beat polygons from JSON file
DO $$
DECLARE
    json_data JSONB;
BEGIN
    -- Read the JSON file
    json_data := pg_read_file('/Users/ajinkyapatil/Documents/Cursor Projects/elephant-watch-app/output.json')::JSONB;
    
    -- Import the polygons
    PERFORM import_beat_polygons(json_data);
END $$; 