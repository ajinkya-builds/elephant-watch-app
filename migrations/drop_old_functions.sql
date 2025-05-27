-- Drop triggers first
DROP TRIGGER IF EXISTS set_observation_boundaries_trigger ON activity_observation;
DROP TRIGGER IF EXISTS process_new_activity_report_trigger ON activity_reports;

-- Drop old functions
DROP FUNCTION IF EXISTS identify_geographical_boundaries(numeric, numeric);
DROP FUNCTION IF EXISTS set_observation_boundaries();
DROP FUNCTION IF EXISTS process_new_activity_report(); 