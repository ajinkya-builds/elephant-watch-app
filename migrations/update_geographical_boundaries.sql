-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS identify_geographical_boundaries(numeric, numeric);

-- Create the updated function
CREATE OR REPLACE FUNCTION identify_geographical_boundaries(
    p_latitude numeric,
    p_longitude numeric
)
RETURNS TABLE (
    division_name character varying(255),
    division_id uuid,
    range_name character varying(255),
    range_id uuid,
    beat_name character varying(255),
    beat_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH point AS (
        SELECT ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326) AS geom
    )
    SELECT 
        d.name as division_name,
        d.id as division_id,
        r.name as range_name,
        r.id as range_id,
        b.name as beat_name,
        b.id as beat_id
    FROM 
        point p
        LEFT JOIN division_polygons dp ON ST_Contains(dp.polygon, p.geom)
        LEFT JOIN divisions d ON dp.new_division_id = d.id
        LEFT JOIN range_polygons rp ON ST_Contains(rp.polygon, p.geom)
        LEFT JOIN ranges r ON rp.range_id = r.id
        LEFT JOIN beat_polygons bp ON ST_Contains(bp.geometry, p.geom)
        LEFT JOIN beats b ON bp.associated_beat_id = b.id
    LIMIT 1;
END;
$$; 