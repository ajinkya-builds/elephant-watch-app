-- Function to import polygon data from a JSON file
CREATE OR REPLACE FUNCTION import_beat_polygons(json_data JSONB)
RETURNS TABLE (
    beat_id UUID,
    name VARCHAR,
    status TEXT
) AS $$
DECLARE
    polygon_record JSONB;
    beat_id UUID;
    polygon_geom GEOMETRY;
BEGIN
    -- Loop through each polygon in the JSON data
    FOR polygon_record IN SELECT * FROM jsonb_array_elements(json_data)
    LOOP
        BEGIN
            -- Extract beat_id and name
            beat_id := (polygon_record->>'beat_id')::UUID;
            
            -- Convert coordinates to PostGIS polygon
            -- Assuming the JSON has a 'coordinates' array of [longitude, latitude] pairs
            polygon_geom := ST_SetSRID(
                ST_MakePolygon(
                    ST_MakeLine(
                        ARRAY(
                            SELECT ST_MakePoint(
                                (coord->>0)::float8,
                                (coord->>1)::float8
                            )
                            FROM jsonb_array_elements(polygon_record->'coordinates') AS coord
                        )
                    )
                ),
                4326
            );

            -- Insert the polygon
            INSERT INTO beat_polygons (beat_id, name, polygon)
            VALUES (
                beat_id,
                polygon_record->>'name',
                polygon_geom
            );

            -- Return success status
            beat_id := beat_id;
            name := polygon_record->>'name';
            status := 'Success';
            RETURN NEXT;
            
        EXCEPTION WHEN OTHERS THEN
            -- Return error status
            beat_id := (polygon_record->>'beat_id')::UUID;
            name := polygon_record->>'name';
            status := 'Error: ' || SQLERRM;
            RETURN NEXT;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to find beat based on coordinates
CREATE OR REPLACE FUNCTION find_beat_by_coordinates(
    longitude DOUBLE PRECISION,
    latitude DOUBLE PRECISION
)
RETURNS TABLE (
    beat_id UUID,
    beat_name VARCHAR,
    polygon_name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bp.beat_id,
        b.name as beat_name,
        bp.name as polygon_name
    FROM beat_polygons bp
    JOIN beats b ON b.id = bp.beat_id
    WHERE ST_Contains(
        bp.polygon,
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 