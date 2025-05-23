-- Drop existing views if they exist
DROP VIEW IF EXISTS v_observation_list CASCADE;
DROP VIEW IF EXISTS v_observation_stats CASCADE;
DROP VIEW IF EXISTS v_observation_details CASCADE;
DROP VIEW IF EXISTS v_division_observation_summary CASCADE;
DROP VIEW IF EXISTS v_range_observation_summary CASCADE;
DROP VIEW IF EXISTS v_observation_type_summary CASCADE;

-- Create view for the main observation list with essential information
CREATE OR REPLACE VIEW v_observation_list AS
SELECT 
    ao.id,
    ao.activity_date,
    ao.activity_time,
    ao.observation_type,
    ao.total_elephants,
    ao.latitude,
    ao.longitude,
    ao.associated_division,
    ao.associated_range,
    ao.associated_beat,
    ao.photo_url,
    u.email as observer_email,
    ao.created_at,
    ao.user_id,
    ao.activity_report_id
FROM 
    activity_observation ao
    LEFT JOIN auth.users u ON ao.user_id = u.id
ORDER BY 
    ao.created_at DESC;

-- Create view for observation statistics
CREATE OR REPLACE VIEW v_observation_stats AS
SELECT
    COUNT(*) as total_observations,
    COUNT(CASE WHEN observation_type = 'direct' THEN 1 END) as direct_sightings,
    COUNT(CASE WHEN observation_type = 'indirect' THEN 1 END) as indirect_signs,
    COUNT(CASE WHEN observation_type = 'loss' THEN 1 END) as loss_reports,
    COUNT(DISTINCT user_id) as total_observers,
    COUNT(DISTINCT associated_division) as total_divisions,
    SUM(total_elephants) as total_elephants_sighted,
    SUM(male_elephants) as total_male_elephants,
    SUM(female_elephants) as total_female_elephants,
    SUM(calves) as total_calves,
    SUM(unknown_elephants) as total_unknown_elephants,
    MAX(activity_date) as latest_observation_date,
    COUNT(CASE WHEN activity_date = CURRENT_DATE THEN 1 END) as today_observations,
    COUNT(CASE WHEN activity_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as week_observations
FROM 
    activity_observation;

-- Create view for detailed observation information
CREATE OR REPLACE VIEW v_observation_details AS
SELECT 
    ao.id,
    ao.activity_report_id,
    ao.activity_date,
    ao.activity_time,
    ao.observation_type,
    ao.total_elephants,
    ao.male_elephants,
    ao.female_elephants,
    ao.unknown_elephants,
    ao.calves,
    ao.indirect_sighting_type,
    ao.loss_type,
    ao.latitude,
    ao.longitude,
    ao.compass_bearing,
    ao.photo_url,
    ao.associated_division,
    ao.associated_range,
    ao.associated_beat,
    ao.associated_division_id,
    ao.associated_range_id,
    ao.associated_beat_id,
    u.email as observer_email,
    ao.created_at,
    ao.updated_at,
    ao.user_id
FROM 
    activity_observation ao
    LEFT JOIN auth.users u ON ao.user_id = u.id;

-- Create view for division-wise observation summary
CREATE OR REPLACE VIEW v_division_observation_summary AS
SELECT 
    associated_division,
    associated_division_id,
    COUNT(*) as total_observations,
    COUNT(CASE WHEN observation_type = 'direct' THEN 1 END) as direct_sightings,
    COUNT(CASE WHEN observation_type = 'indirect' THEN 1 END) as indirect_signs,
    COUNT(CASE WHEN observation_type = 'loss' THEN 1 END) as loss_reports,
    SUM(total_elephants) as total_elephants,
    SUM(male_elephants) as male_elephants,
    SUM(female_elephants) as female_elephants,
    SUM(calves) as calves,
    SUM(unknown_elephants) as unknown_elephants,
    COUNT(DISTINCT user_id) as unique_observers,
    MAX(activity_date) as latest_observation_date
FROM 
    activity_observation
WHERE 
    associated_division IS NOT NULL
GROUP BY 
    associated_division,
    associated_division_id
ORDER BY 
    total_observations DESC;

-- Create view for range-wise observation summary
CREATE OR REPLACE VIEW v_range_observation_summary AS
SELECT 
    associated_division,
    associated_range,
    associated_range_id,
    COUNT(*) as total_observations,
    COUNT(CASE WHEN observation_type = 'direct' THEN 1 END) as direct_sightings,
    COUNT(CASE WHEN observation_type = 'indirect' THEN 1 END) as indirect_signs,
    COUNT(CASE WHEN observation_type = 'loss' THEN 1 END) as loss_reports,
    SUM(total_elephants) as total_elephants,
    COUNT(DISTINCT user_id) as unique_observers,
    MAX(activity_date) as latest_observation_date
FROM 
    activity_observation
WHERE 
    associated_range IS NOT NULL
GROUP BY 
    associated_division,
    associated_range,
    associated_range_id
ORDER BY 
    associated_division,
    total_observations DESC;

-- Create view for observation type summary
CREATE OR REPLACE VIEW v_observation_type_summary AS
SELECT
    observation_type,
    COUNT(*) as total_count,
    COUNT(DISTINCT associated_division) as divisions_count,
    COUNT(DISTINCT associated_range) as ranges_count,
    COUNT(DISTINCT associated_beat) as beats_count,
    COUNT(DISTINCT user_id) as observers_count,
    SUM(total_elephants) as total_elephants,
    MAX(activity_date) as latest_observation_date
FROM
    activity_observation
GROUP BY
    observation_type;

-- Grant access to authenticated users
GRANT SELECT ON v_observation_list TO authenticated;
GRANT SELECT ON v_observation_stats TO authenticated;
GRANT SELECT ON v_observation_details TO authenticated;
GRANT SELECT ON v_division_observation_summary TO authenticated;
GRANT SELECT ON v_range_observation_summary TO authenticated;
GRANT SELECT ON v_observation_type_summary TO authenticated; 