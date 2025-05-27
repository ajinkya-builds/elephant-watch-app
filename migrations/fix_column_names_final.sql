-- Drop all existing triggers first
DROP TRIGGER IF EXISTS set_activity_report_boundaries_trigger ON public.activity_reports;
DROP TRIGGER IF EXISTS set_observation_boundaries_trigger ON public.activity_observation;

-- Drop all existing functions
DROP FUNCTION IF EXISTS public.identify_geographical_boundaries(DECIMAL, DECIMAL);
DROP FUNCTION IF EXISTS public.identify_geographical_boundaries(numeric, numeric);
DROP FUNCTION IF EXISTS public.identify_geographical_boundaries(double precision, double precision);
DROP FUNCTION IF EXISTS public.set_activity_report_boundaries();
DROP FUNCTION IF EXISTS public.set_observation_boundaries();

-- Create the function to identify geographical boundaries
CREATE OR REPLACE FUNCTION public.identify_geographical_boundaries(
    p_latitude DECIMAL,
    p_longitude DECIMAL
)
RETURNS TABLE (
    division_name character varying(255),
    division_id UUID,
    range_name character varying(255),
    range_id UUID,
    beat_name character varying(255),
    beat_id UUID
) AS $$
BEGIN
    RETURN QUERY
    WITH point AS (
        SELECT ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326) AS geom
    )
    SELECT 
        d.name::character varying(255) AS division_name,
        d.id AS division_id,
        r.name::character varying(255) AS range_name,
        r.new_id AS range_id,
        b.name::character varying(255) AS beat_name,
        b.new_id AS beat_id
    FROM point p
    LEFT JOIN public.division_polygons dp ON ST_Contains(dp.polygon, p.geom)
    LEFT JOIN public.divisions d ON dp.new_division_id = d.id
    LEFT JOIN public.range_polygons rp ON ST_Contains(rp.polygon, p.geom)
    LEFT JOIN public.ranges r ON rp.new_range_id = r.new_id AND r.did = d.did
    LEFT JOIN public.beat_polygons bp ON ST_Contains(bp.polygon, p.geom)
    LEFT JOIN public.beats b ON bp.new_beat_id = b.new_id AND b.rid = r.rid
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger function for activity reports
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

-- Create the trigger function for observations
CREATE OR REPLACE FUNCTION public.set_observation_boundaries()
RETURNS TRIGGER AS $$
DECLARE
    v_boundaries RECORD;
BEGIN
    -- Get the geographical boundaries for the coordinates
    SELECT * INTO v_boundaries
    FROM public.identify_geographical_boundaries(NEW.latitude, NEW.longitude);

    -- Set the values in the new record
    NEW.associated_division := v_boundaries.division_name;
    NEW.associated_range := v_boundaries.range_name;
    NEW.associated_range_id := v_boundaries.range_id;
    NEW.associated_beat := v_boundaries.beat_name;
    NEW.associated_beat_id := v_boundaries.beat_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER set_activity_report_boundaries_trigger
    BEFORE INSERT ON public.activity_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.set_activity_report_boundaries();

CREATE TRIGGER set_observation_boundaries_trigger
    BEFORE INSERT ON public.activity_observation
    FOR EACH ROW
    EXECUTE FUNCTION public.set_observation_boundaries();

-- Add helpful comments
COMMENT ON FUNCTION public.identify_geographical_boundaries(DECIMAL, DECIMAL) IS 'Identifies geographical boundaries (division, range, beat) based on latitude and longitude coordinates';
COMMENT ON FUNCTION public.set_activity_report_boundaries() IS 'Trigger function to automatically set geographical boundaries for new activity reports';
COMMENT ON FUNCTION public.set_observation_boundaries() IS 'Trigger function to automatically set geographical boundaries for new activity observations'; 