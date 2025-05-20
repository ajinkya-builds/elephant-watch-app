-- Create view for recent observations
CREATE OR REPLACE VIEW v_recent_observations AS
SELECT 
    ar.id,
    ar.created_at,
    ar.activity_date,
    ar.activity_time,
    ar.division_name,
    ar.range_name,
    ar.beat_name,
    ar.total_elephants,
    ar.female_elephants,
    ar.male_elephants,
    ar.calves,
    ar.unknown_elephants,
    ar.observation_type,
    ar.loss_type,
    ar.indirect_sighting_type,
    ar.photo_url,
    ar.latitude,
    ar.longitude,
    ar.compass_bearing
FROM activity_reports ar
ORDER BY ar.activity_date DESC, ar.activity_time DESC;

-- Create view for activity heatmap
CREATE OR REPLACE VIEW v_activity_heatmap AS
SELECT 
    ar.latitude::float as lat,
    ar.longitude::float as lng,
    ar.total_elephants as intensity,
    ar.activity_date,
    ar.division_name,
    ar.range_name,
    ar.beat_name
FROM activity_reports ar
WHERE ar.latitude IS NOT NULL 
    AND ar.longitude IS NOT NULL
    AND ar.latitude != ''
    AND ar.longitude != '';

-- Create view for total observations
CREATE OR REPLACE VIEW v_total_observations AS
SELECT 
    COUNT(*) as total_count,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT activity_date) as total_days,
    SUM(total_elephants) as total_elephants,
    SUM(CASE WHEN loss_type IS NOT NULL THEN 1 ELSE 0 END) as total_loss_reports,
    SUM(female_elephants) as total_female_elephants,
    SUM(male_elephants) as total_male_elephants,
    SUM(calves) as total_calves,
    SUM(unknown_elephants) as total_unknown_elephants
FROM activity_reports;

-- Create view for division statistics
CREATE OR REPLACE VIEW v_division_stats AS
SELECT 
    division_name,
    COUNT(*) as total_observations,
    SUM(total_elephants) as elephants,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT activity_date) as active_days
FROM activity_reports
WHERE division_name IS NOT NULL
GROUP BY division_name
ORDER BY elephants DESC; 