-- Drop all existing triggers
DROP TRIGGER IF EXISTS update_activity_reports_updated_at_trigger ON public.activity_reports;
DROP TRIGGER IF EXISTS set_activity_report_boundaries_trigger ON public.activity_reports;
DROP TRIGGER IF EXISTS process_new_activity_report_trigger ON public.activity_reports;
DROP TRIGGER IF EXISTS debug_rls_trigger ON public.activity_reports;
DROP TRIGGER IF EXISTS refresh_activity_reports_mv_trigger ON public.activity_reports;
DROP TRIGGER IF EXISTS update_activity_observation_updated_at_trigger ON public.activity_observation;
DROP TRIGGER IF EXISTS set_observation_boundaries_trigger ON public.activity_observation;

-- Create consolidated trigger function for activity_reports
CREATE OR REPLACE FUNCTION process_activity_report()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_boundary RECORD;
    v_result jsonb;
BEGIN
    -- Update timestamp
    NEW.updated_at = NOW();
    
    -- Get geographical boundaries
    SELECT * INTO v_boundary
    FROM identify_geographical_boundaries(
        NEW.latitude::numeric,
        NEW.longitude::numeric
    );
    
    -- Set boundary information
    NEW.associated_division := v_boundary.division_name;
    NEW.associated_division_id := v_boundary.division_id;
    NEW.associated_range := v_boundary.range_name;
    NEW.associated_range_id := v_boundary.range_id;
    NEW.associated_beat := v_boundary.beat_name;
    NEW.associated_beat_id := v_boundary.beat_id;
    
    -- Log the operation
    INSERT INTO public.debug_logs (operation, auth_uid, user_id, details)
    VALUES (
        TG_OP,
        auth.uid(),
        NEW.user_id,
        jsonb_build_object(
            'report_id', NEW.id,
            'boundaries', jsonb_build_object(
                'division', v_boundary.division_name,
                'range', v_boundary.range_name,
                'beat', v_boundary.beat_name
            )
        )
    );
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log any errors
    INSERT INTO public.debug_logs (operation, auth_uid, user_id, details)
    VALUES (
        TG_OP || '_error',
        auth.uid(),
        NEW.user_id,
        jsonb_build_object(
            'error', SQLERRM,
            'state', SQLSTATE,
            'report_id', NEW.id
        )
    );
    RAISE;
END;
$$;

-- Create consolidated trigger function for activity_observation
CREATE OR REPLACE FUNCTION process_activity_observation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update timestamp
    NEW.updated_at = NOW();
    
    -- Process the activity report
    PERFORM process_new_activity_reports(NEW.activity_report_id);
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log any errors
    INSERT INTO public.debug_logs (operation, auth_uid, user_id, details)
    VALUES (
        TG_OP || '_error',
        auth.uid(),
        NEW.user_id,
        jsonb_build_object(
            'error', SQLERRM,
            'state', SQLSTATE,
            'observation_id', NEW.id
        )
    );
    RAISE;
END;
$$;

-- Create triggers
CREATE TRIGGER process_activity_report_trigger
    BEFORE INSERT OR UPDATE ON public.activity_reports
    FOR EACH ROW
    EXECUTE FUNCTION process_activity_report();

CREATE TRIGGER process_activity_observation_trigger
    AFTER INSERT ON public.activity_observation
    FOR EACH ROW
    EXECUTE FUNCTION process_activity_observation();

-- Add comments
COMMENT ON FUNCTION process_activity_report() IS 'Consolidated trigger function for activity reports that handles timestamps, boundaries, and logging';
COMMENT ON FUNCTION process_activity_observation() IS 'Consolidated trigger function for activity observations that handles timestamps and report processing'; 