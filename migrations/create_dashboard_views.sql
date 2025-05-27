-- Drop existing views if they exist
DROP VIEW IF EXISTS v_dashboard_kpi_summary;
DROP VIEW IF EXISTS v_dashboard_division_stats;
DROP VIEW IF EXISTS v_dashboard_range_stats;
DROP VIEW IF EXISTS v_dashboard_beat_stats;
DROP VIEW IF EXISTS v_dashboard_activity_heatmap;
DROP VIEW IF EXISTS v_dashboard_recent_activities;
DROP VIEW IF EXISTS v_dashboard_monthly_trends;
DROP VIEW IF EXISTS v_dashboard_user_stats;
DROP VIEW IF EXISTS v_dashboard_elephant_stats;
DROP VIEW IF EXISTS v_dashboard_observations_by_type;

-- Main KPI Summary View
CREATE VIEW v_dashboard_kpi_summary AS
SELECT 
    count(*) FILTER (WHERE user_id IS NOT NULL) AS total_activities,
    count(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) AS total_users,
    count(DISTINCT activity_date) FILTER (WHERE activity_date IS NOT NULL) AS total_days,
    sum(total_elephants) FILTER (WHERE observation_type = 'direct' AND total_elephants IS NOT NULL) AS total_elephants_sighted,
    count(*) FILTER (WHERE activity_date = CURRENT_DATE AND user_id IS NOT NULL) AS today_activities,
    count(DISTINCT user_id) FILTER (WHERE activity_date = CURRENT_DATE AND user_id IS NOT NULL) AS today_active_users,
    count(*) FILTER (WHERE activity_date >= CURRENT_DATE - '7 days'::interval AND user_id IS NOT NULL) AS weekly_activities,
    count(DISTINCT user_id) FILTER (WHERE activity_date >= CURRENT_DATE - '7 days'::interval AND user_id IS NOT NULL) AS weekly_active_users,
    count(DISTINCT associated_division) FILTER (WHERE associated_division IS NOT NULL) AS total_divisions,
    count(DISTINCT associated_range) FILTER (WHERE associated_range IS NOT NULL) AS total_ranges,
    count(DISTINCT associated_beat) FILTER (WHERE associated_beat IS NOT NULL) AS total_beats
FROM activity_observation
WHERE user_id IS NOT NULL;

-- Division Level Statistics
CREATE VIEW v_dashboard_division_stats AS
SELECT 
    associated_division_id AS division_id,
    associated_division AS division_name,
    count(*) FILTER (WHERE user_id IS NOT NULL) AS total_observations,
    count(*) FILTER (WHERE observation_type = 'direct' AND user_id IS NOT NULL) AS direct_sightings,
    count(*) FILTER (WHERE observation_type = 'indirect' AND user_id IS NOT NULL) AS indirect_signs,
    count(*) FILTER (WHERE observation_type = 'loss' AND user_id IS NOT NULL) AS loss_reports,
    sum(total_elephants) FILTER (WHERE observation_type = 'direct' AND total_elephants IS NOT NULL) AS total_elephants,
    count(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) AS unique_observers,
    count(DISTINCT activity_date) FILTER (WHERE activity_date IS NOT NULL) AS days_with_activity,
    max(activity_date) FILTER (WHERE activity_date IS NOT NULL) AS last_activity_date
FROM activity_observation
WHERE associated_division_id IS NOT NULL 
  AND associated_division IS NOT NULL
  AND user_id IS NOT NULL
GROUP BY associated_division_id, associated_division
ORDER BY total_observations DESC;

-- Range Level Statistics
CREATE VIEW v_dashboard_range_stats AS
SELECT 
    associated_range_id AS range_id,
    associated_range AS range_name,
    associated_division_id AS division_id,
    associated_division AS division_name,
    count(*) FILTER (WHERE user_id IS NOT NULL) AS total_observations,
    count(*) FILTER (WHERE observation_type = 'direct' AND user_id IS NOT NULL) AS direct_sightings,
    count(*) FILTER (WHERE observation_type = 'indirect' AND user_id IS NOT NULL) AS indirect_signs,
    count(*) FILTER (WHERE observation_type = 'loss' AND user_id IS NOT NULL) AS loss_reports,
    sum(total_elephants) FILTER (WHERE observation_type = 'direct' AND total_elephants IS NOT NULL) AS total_elephants,
    count(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) AS unique_observers,
    count(DISTINCT activity_date) FILTER (WHERE activity_date IS NOT NULL) AS days_with_activity,
    max(activity_date) FILTER (WHERE activity_date IS NOT NULL) AS last_activity_date
FROM activity_observation
WHERE associated_range_id IS NOT NULL 
  AND associated_range IS NOT NULL
  AND associated_division_id IS NOT NULL
  AND associated_division IS NOT NULL
  AND user_id IS NOT NULL
GROUP BY associated_range_id, associated_range, associated_division_id, associated_division
ORDER BY total_observations DESC;

-- Beat Level Statistics
CREATE VIEW v_dashboard_beat_stats AS
SELECT 
    associated_beat_id AS beat_id,
    associated_beat AS beat_name,
    associated_range_id AS range_id,
    associated_range AS range_name,
    associated_division_id AS division_id,
    associated_division AS division_name,
    count(*) FILTER (WHERE user_id IS NOT NULL) AS total_observations,
    count(*) FILTER (WHERE observation_type = 'direct' AND user_id IS NOT NULL) AS direct_sightings,
    count(*) FILTER (WHERE observation_type = 'indirect' AND user_id IS NOT NULL) AS indirect_signs,
    count(*) FILTER (WHERE observation_type = 'loss' AND user_id IS NOT NULL) AS loss_reports,
    sum(total_elephants) FILTER (WHERE observation_type = 'direct' AND total_elephants IS NOT NULL) AS total_elephants,
    count(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) AS unique_observers,
    count(DISTINCT activity_date) FILTER (WHERE activity_date IS NOT NULL) AS days_with_activity,
    max(activity_date) FILTER (WHERE activity_date IS NOT NULL) AS last_activity_date
FROM activity_observation
WHERE associated_beat_id IS NOT NULL 
  AND associated_beat IS NOT NULL
  AND associated_range_id IS NOT NULL
  AND associated_range IS NOT NULL
  AND associated_division_id IS NOT NULL
  AND associated_division IS NOT NULL
  AND user_id IS NOT NULL
GROUP BY associated_beat_id, associated_beat, associated_range_id, associated_range, associated_division_id, associated_division
ORDER BY total_observations DESC;

-- Activity Heatmap Data
CREATE VIEW v_dashboard_activity_heatmap AS
SELECT 
    latitude,
    longitude,
    count(*) FILTER (WHERE user_id IS NOT NULL) AS observation_count,
    sum(total_elephants) FILTER (WHERE observation_type = 'direct' AND total_elephants IS NOT NULL) AS total_elephants_seen,
    max(activity_date) FILTER (WHERE activity_date IS NOT NULL) AS last_observation_date,
    associated_division_id AS division_id,
    associated_division AS division_name,
    associated_range_id AS range_id,
    associated_range AS range_name,
    associated_beat_id AS beat_id,
    associated_beat AS beat_name
FROM activity_observation
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL
  AND user_id IS NOT NULL
GROUP BY 
    latitude, 
    longitude,
    associated_division_id,
    associated_division,
    associated_range_id,
    associated_range,
    associated_beat_id,
    associated_beat;

-- Recent Activities View
CREATE VIEW v_dashboard_recent_activities AS
SELECT 
    ao.*,
    u.email,
    CONCAT(u.first_name, ' ', u.last_name) AS full_name,
    u.phone,
    u.position,
    u.role,
    u.status
FROM activity_observation ao
LEFT JOIN users u ON ao.user_id = u.id
WHERE ao.user_id IS NOT NULL
  AND ao.activity_date IS NOT NULL
ORDER BY ao.activity_date DESC, ao.created_at DESC
LIMIT 100;

-- Monthly Trends View
CREATE VIEW v_dashboard_monthly_trends AS
SELECT 
    date_trunc('month', activity_date) AS month,
    count(*) FILTER (WHERE user_id IS NOT NULL) AS total_activities,
    count(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) AS unique_users,
    sum(total_elephants) FILTER (WHERE observation_type = 'direct' AND total_elephants IS NOT NULL) AS elephants_sighted,
    count(*) FILTER (WHERE observation_type = 'direct' AND user_id IS NOT NULL) AS direct_sightings,
    count(*) FILTER (WHERE observation_type = 'indirect' AND user_id IS NOT NULL) AS indirect_signs,
    count(*) FILTER (WHERE observation_type = 'loss' AND user_id IS NOT NULL) AS loss_reports
FROM activity_observation
WHERE activity_date IS NOT NULL
  AND user_id IS NOT NULL
GROUP BY date_trunc('month', activity_date)
ORDER BY month DESC;

-- User Statistics View
CREATE VIEW v_dashboard_user_stats AS
SELECT 
    u.id AS user_id,
    u.email,
    CONCAT(u.first_name, ' ', u.last_name) AS full_name,
    u.phone,
    u.position,
    u.role,
    u.status,
    count(ao.id) FILTER (WHERE ao.id IS NOT NULL) AS total_activities,
    count(DISTINCT ao.activity_date) FILTER (WHERE ao.activity_date IS NOT NULL) AS days_active,
    sum(ao.total_elephants) FILTER (WHERE ao.observation_type = 'direct' AND ao.total_elephants IS NOT NULL) AS elephants_sighted,
    max(ao.activity_date) FILTER (WHERE ao.activity_date IS NOT NULL) AS last_activity_date,
    count(DISTINCT ao.associated_division) FILTER (WHERE ao.associated_division IS NOT NULL) AS divisions_covered,
    count(DISTINCT ao.associated_range) FILTER (WHERE ao.associated_range IS NOT NULL) AS ranges_covered,
    count(DISTINCT ao.associated_beat) FILTER (WHERE ao.associated_beat IS NOT NULL) AS beats_covered
FROM users u
LEFT JOIN activity_observation ao ON u.id = ao.user_id
WHERE u.id IS NOT NULL
GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone, u.position, u.role, u.status
ORDER BY total_activities DESC;

-- Elephant Statistics View
CREATE VIEW v_dashboard_elephant_stats AS
SELECT 
    date_trunc('month', activity_date) AS month,
    sum(total_elephants) FILTER (WHERE observation_type = 'direct' AND total_elephants IS NOT NULL) AS total_elephants,
    sum(male_elephants) FILTER (WHERE observation_type = 'direct' AND male_elephants IS NOT NULL) AS male_elephants,
    sum(female_elephants) FILTER (WHERE observation_type = 'direct' AND female_elephants IS NOT NULL) AS female_elephants,
    sum(calves) FILTER (WHERE observation_type = 'direct' AND calves IS NOT NULL) AS calves,
    sum(unknown_elephants) FILTER (WHERE observation_type = 'direct' AND unknown_elephants IS NOT NULL) AS unknown_elephants,
    count(DISTINCT activity_date) FILTER (WHERE activity_date IS NOT NULL) AS days_with_sightings
FROM activity_observation
WHERE activity_date IS NOT NULL
  AND user_id IS NOT NULL
GROUP BY date_trunc('month', activity_date)
ORDER BY month DESC;

-- Observations by Type View
CREATE VIEW v_dashboard_observations_by_type AS
SELECT 
    observation_type,
    count(*) FILTER (WHERE user_id IS NOT NULL) AS count
FROM activity_observation
WHERE user_id IS NOT NULL
  AND observation_type IN ('direct', 'indirect')
GROUP BY observation_type
ORDER BY observation_type; 