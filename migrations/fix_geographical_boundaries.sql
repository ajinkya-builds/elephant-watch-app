-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Update boundary columns in activity_observation table to use UUIDs
ALTER TABLE public.activity_observation
    DROP COLUMN IF EXISTS associated_division_id,
    DROP COLUMN IF EXISTS associated_range_id,
    DROP COLUMN IF EXISTS associated_beat_id;

ALTER TABLE public.activity_observation
    ADD COLUMN associated_division_id UUID,
    ADD COLUMN associated_range_id UUID,
    ADD COLUMN associated_beat_id UUID;

-- Function to identify geographical boundaries based on coordinates
DROP FUNCTION IF EXISTS identify_geographical_boundaries(numeric, numeric);

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

-- Function to process new activity reports and create observations
CREATE OR REPLACE FUNCTION process_new_activity_reports(p_report_id UUID DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    report RECORD;
    boundary RECORD;
    v_result jsonb;
BEGIN
    -- Initialize result object
    v_result := jsonb_build_object(
        'status', 'processing',
        'report_id', p_report_id,
        'message', 'Starting report processing'
    );

    -- Get activity reports that don't have corresponding activity observations
    FOR report IN 
        SELECT ar.* 
        FROM activity_reports ar
        LEFT JOIN activity_observation ao ON ar.id = ao.activity_report_id
        WHERE ao.id IS NULL
        AND (p_report_id IS NULL OR ar.id = p_report_id)
    LOOP
        BEGIN
            -- Get geographical boundaries for the coordinates
            SELECT * INTO boundary
            FROM identify_geographical_boundaries(
                report.latitude::numeric,
                report.longitude::numeric
            );

            -- Log the boundary data
            v_result := jsonb_build_object(
                'status', 'processing',
                'report_id', report.id,
                'boundaries', jsonb_build_object(
                    'division', boundary.division_name,
                    'range', boundary.range_name,
                    'beat', boundary.beat_name
                )
            );

            -- Insert activity observation with identified boundaries
            INSERT INTO activity_observation (
                activity_report_id,
                latitude,
                longitude,
                activity_date,
                activity_time,
                observation_type,
                total_elephants,
                male_elephants,
                female_elephants,
                unknown_elephants,
                calves,
                indirect_sighting_type,
                loss_type,
                compass_bearing,
                photo_url,
                user_id,
                associated_division,
                associated_division_id,
                associated_range,
                associated_range_id,
                associated_beat,
                associated_beat_id
            )
            VALUES (
                report.id,
                report.latitude::numeric,
                report.longitude::numeric,
                report.activity_date,
                report.activity_time,
                report.observation_type,
                report.total_elephants,
                report.male_elephants,
                report.female_elephants,
                report.unknown_elephants,
                report.calves,
                report.indirect_sighting_type,
                report.loss_type,
                report.compass_bearing,
                report.photo_url,
                report.user_id,
                boundary.division_name,
                boundary.division_id,
                boundary.range_name,
                boundary.range_id,
                boundary.beat_name,
                boundary.beat_id
            );

            -- Update result with success
            v_result := jsonb_build_object(
                'status', 'success',
                'report_id', report.id,
                'message', 'Successfully created observation'
            );

        EXCEPTION WHEN OTHERS THEN
            -- Update result with error
            v_result := jsonb_build_object(
                'status', 'error',
                'report_id', report.id,
                'error', SQLERRM,
                'detail', SQLSTATE
            );
            RAISE;
        END;
    END LOOP;

    -- If no reports were processed, return appropriate message
    IF v_result->>'status' = 'processing' THEN
        v_result := jsonb_build_object(
            'status', 'error',
            'message', 'No reports found to process'
        );
    END IF;

    RETURN v_result;
END;
$$;

-- Create trigger function to automatically set geographical boundaries
CREATE OR REPLACE FUNCTION set_observation_boundaries()
RETURNS TRIGGER AS $$
DECLARE
    boundary RECORD;
BEGIN
    -- Get geographical boundaries for the coordinates
    SELECT * INTO boundary
    FROM identify_geographical_boundaries(
        NEW.latitude::numeric,
        NEW.longitude::numeric
    );

    -- Set the boundary information
    NEW.associated_division := boundary.division_name;
    NEW.associated_division_id := boundary.division_id;
    NEW.associated_range := boundary.range_name;
    NEW.associated_range_id := boundary.range_id;
    NEW.associated_beat := boundary.beat_name;
    NEW.associated_beat_id := boundary.beat_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set geographical boundaries
DROP TRIGGER IF EXISTS set_observation_boundaries_trigger ON public.activity_observation;
CREATE TRIGGER set_observation_boundaries_trigger
    BEFORE INSERT OR UPDATE ON public.activity_observation
    FOR EACH ROW
    EXECUTE FUNCTION set_observation_boundaries();

-- Create trigger function to automatically process new activity reports
CREATE OR REPLACE FUNCTION trigger_process_new_activity_report()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result jsonb;
BEGIN
    -- Process the newly inserted report
    v_result := process_new_activity_reports(NEW.id);
    
    -- Log the result
    INSERT INTO public.debug_logs (operation, auth_uid, user_id, details)
    VALUES (
        'process_new_activity_report',
        auth.uid(),
        NEW.user_id,
        v_result
    );
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log any errors
    INSERT INTO public.debug_logs (operation, auth_uid, user_id, details)
    VALUES (
        'process_new_activity_report_error',
        auth.uid(),
        NEW.user_id,
        jsonb_build_object(
            'error', SQLERRM,
            'state', SQLSTATE,
            'report_id', NEW.id
        )
    );
    
    -- Re-raise the error
    RAISE;
END;
$$;

-- Create trigger on activity_reports table
DROP TRIGGER IF EXISTS process_new_activity_report_trigger ON activity_reports;
CREATE TRIGGER process_new_activity_report_trigger
    AFTER INSERT ON activity_reports
    FOR EACH ROW
    EXECUTE FUNCTION trigger_process_new_activity_report();

-- Add comments to functions
COMMENT ON FUNCTION identify_geographical_boundaries(numeric, numeric) IS 'Identifies geographical boundaries (division, range, beat) based on latitude and longitude coordinates';
COMMENT ON FUNCTION set_observation_boundaries() IS 'Trigger function to automatically set geographical boundaries for new or updated activity observations'; 