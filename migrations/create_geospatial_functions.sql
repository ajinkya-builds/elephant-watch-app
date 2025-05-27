-- Create function to identify the associated division, range, and beat for given coordinates
CREATE OR REPLACE FUNCTION public.identify_geographical_boundaries(
    p_latitude DECIMAL,
    p_longitude DECIMAL
)
RETURNS TABLE (
    division_name TEXT,
    division_id UUID,
    range_name TEXT,
    range_id UUID,
    beat_name TEXT,
    beat_id UUID
) AS $$
BEGIN
    RETURN QUERY
    WITH point AS (
        SELECT ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326) AS geom
    )
    SELECT 
        d.name AS division_name,
        d.id AS division_id,
        r.name AS range_name,
        r.id AS range_id,
        b.name AS beat_name,
        b.id AS beat_id
    FROM point p
    LEFT JOIN public.division_polygons dp ON ST_Contains(dp.polygon, p.geom)
    LEFT JOIN public.divisions d ON dp.new_division_id = d.id
    LEFT JOIN public.range_polygons rp ON ST_Contains(rp.polygon, p.geom)
    LEFT JOIN public.ranges r ON rp.range_id = r.id AND r.division_id = d.id
    LEFT JOIN public.beat_polygons bp ON ST_Contains(bp.geometry, p.geom)
    LEFT JOIN public.beats b ON bp.associated_beat_id = b.id AND b.range_id = r.id
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to automatically set geographical boundaries
CREATE OR REPLACE FUNCTION public.set_activity_report_boundaries()
RETURNS TRIGGER AS $$
DECLARE
    v_boundaries RECORD;
BEGIN
    -- Get the geographical boundaries for the coordinates
    SELECT * INTO v_boundaries
    FROM public.identify_geographical_boundaries(NEW.latitude, NEW.longitude);

    -- Set the values in the new record
    NEW.associated_division := v_boundaries.division_name;
    NEW.associated_division_id := v_boundaries.division_id;
    NEW.associated_range := v_boundaries.range_name;
    NEW.associated_range_id := v_boundaries.range_id;
    NEW.associated_beat := v_boundaries.beat_name;
    NEW.associated_beat_id := v_boundaries.beat_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set geographical boundaries on insert
CREATE TRIGGER set_activity_report_boundaries_trigger
    BEFORE INSERT ON public.activity_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.set_activity_report_boundaries();

-- Add helpful comments
COMMENT ON FUNCTION public.identify_geographical_boundaries(DECIMAL, DECIMAL) IS 'Identifies geographical boundaries (division, range, beat) based on latitude and longitude coordinates';
COMMENT ON FUNCTION public.set_activity_report_boundaries() IS 'Trigger function to automatically set geographical boundaries for new activity reports'; 