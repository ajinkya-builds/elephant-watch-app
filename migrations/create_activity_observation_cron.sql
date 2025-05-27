-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Function to process new activity reports and create activity observations
CREATE OR REPLACE FUNCTION process_new_activity_reports()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    report RECORD;
    boundary RECORD;
BEGIN
    -- Get all activity reports that don't have corresponding activity observations
    FOR report IN 
        SELECT ar.* 
        FROM activity_reports ar
        LEFT JOIN activity_observation ao ON ar.id = ao.activity_report_id
        WHERE ao.id IS NULL
    LOOP
        -- Get geographical boundaries for the coordinates
        SELECT * INTO boundary
        FROM identify_geographical_boundaries(
            report.latitude::numeric,
            report.longitude::numeric
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
    END LOOP;
END;
$$;

-- Create a cron job to run every minute
SELECT cron.schedule(
    'process-new-activity-reports',  -- job name
    '* * * * *',                    -- every minute
    $$SELECT process_new_activity_reports()$$
);

-- Add comment to the function
COMMENT ON FUNCTION process_new_activity_reports() IS 'Processes new activity reports and creates corresponding activity observations with geographical boundaries'; 