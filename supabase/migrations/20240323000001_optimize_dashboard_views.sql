-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_activity_reports_date ON activity_reports(activity_date);
CREATE INDEX IF NOT EXISTS idx_activity_reports_user ON activity_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_reports_coords ON activity_reports(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_activity_reports_type ON activity_reports(observation_type);

-- Create materialized view for activity reports with divisions to improve performance
CREATE MATERIALIZED VIEW mv_activity_reports_with_divisions AS
SELECT 
    ar.id,
    ar.activity_date,
    ar.activity_time,
    ar.latitude::float as lat,
    ar.longitude::float as lng,
    ar.observation_type,
    ar.total_elephants,
    ar.male_elephants,
    ar.female_elephants,
    ar.unknown_elephants,
    ar.calves,
    ar.indirect_sighting_type,
    ar.loss_type,
    ar.user_id,
    ar.created_at,
    d.id as division_id,
    COALESCE(d.name, 'Unknown Division') as division_name,
    r.id as range_id,
    COALESCE(r.name, 'Unknown Range') as range_name,
    b.id as beat_id,
    COALESCE(b.name, 'Unknown Beat') as beat_name
FROM activity_reports ar
LEFT JOIN division_polygons dp ON is_point_in_polygon(ar.latitude::float, ar.longitude::float, dp.polygon::text)
LEFT JOIN divisions d ON dp.division_id = d.id
LEFT JOIN range_polygons rp ON is_point_in_polygon(ar.latitude::float, ar.longitude::float, rp.polygon::text)
LEFT JOIN ranges r ON rp.range_id = r.id AND r.division_id = d.id
LEFT JOIN beat_polygons bp ON is_point_in_polygon(ar.latitude::float, ar.longitude::float, bp.polygon::text)
LEFT JOIN beats b ON bp.beat_id = b.id AND b.range_id = r.id;

-- Create indexes on the materialized view
CREATE INDEX IF NOT EXISTS idx_mv_activity_reports_date ON mv_activity_reports_with_divisions(activity_date);
CREATE INDEX IF NOT EXISTS idx_mv_activity_reports_user ON mv_activity_reports_with_divisions(user_id);
CREATE INDEX IF NOT EXISTS idx_mv_activity_reports_division ON mv_activity_reports_with_divisions(division_id);
CREATE INDEX IF NOT EXISTS idx_mv_activity_reports_range ON mv_activity_reports_with_divisions(range_id);
CREATE INDEX IF NOT EXISTS idx_mv_activity_reports_beat ON mv_activity_reports_with_divisions(beat_id);

-- Create a function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_activity_reports_mv()
RETURNS trigger AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_activity_reports_with_divisions;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to refresh the materialized view when activity_reports changes
CREATE TRIGGER refresh_activity_reports_mv_trigger
AFTER INSERT OR UPDATE OR DELETE ON activity_reports
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_activity_reports_mv();

-- Update the dashboard views to use the materialized view
CREATE OR REPLACE VIEW v_dashboard_kpi_summary AS
SELECT 
    COUNT(*) as total_activities,
    COUNT(DISTINCT user_id) as total_users,
    COUNT(DISTINCT activity_date) as total_days,
    COALESCE(SUM(total_elephants), 0) as total_elephants_sighted,
    COUNT(CASE WHEN activity_date = CURRENT_DATE THEN 1 END) as today_activities,
    COUNT(DISTINCT CASE WHEN activity_date = CURRENT_DATE THEN user_id END) as today_active_users,
    COUNT(CASE WHEN activity_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as weekly_activities,
    COUNT(DISTINCT CASE WHEN activity_date >= CURRENT_DATE - INTERVAL '7 days' THEN user_id END) as weekly_active_users,
    COUNT(DISTINCT division_id) FILTER (WHERE division_id IS NOT NULL) as total_divisions,
    COUNT(DISTINCT range_id) FILTER (WHERE range_id IS NOT NULL) as total_ranges,
    COUNT(DISTINCT beat_id) FILTER (WHERE beat_id IS NOT NULL) as total_beats
FROM mv_activity_reports_with_divisions;

CREATE OR REPLACE VIEW v_division_statistics AS
SELECT 
    division_id,
    division_name,
    COUNT(*) as total_observations,
    COUNT(CASE WHEN observation_type = 'direct' THEN 1 END) as direct_sightings,
    COUNT(CASE WHEN observation_type = 'indirect' THEN 1 END) as indirect_signs,
    COUNT(CASE WHEN observation_type = 'loss' THEN 1 END) as loss_reports,
    COALESCE(SUM(total_elephants), 0) as total_elephants,
    COUNT(DISTINCT user_id) as unique_observers,
    COUNT(DISTINCT activity_date) as days_with_activity
FROM mv_activity_reports_with_divisions
GROUP BY division_id, division_name
ORDER BY total_observations DESC;

CREATE OR REPLACE VIEW v_range_statistics AS
SELECT 
    range_id,
    range_name,
    division_id,
    division_name,
    COUNT(*) as total_observations,
    COUNT(CASE WHEN observation_type = 'direct' THEN 1 END) as direct_sightings,
    COUNT(CASE WHEN observation_type = 'indirect' THEN 1 END) as indirect_signs,
    COUNT(CASE WHEN observation_type = 'loss' THEN 1 END) as loss_reports,
    COALESCE(SUM(total_elephants), 0) as total_elephants,
    COUNT(DISTINCT user_id) as unique_observers,
    COUNT(DISTINCT activity_date) as days_with_activity
FROM mv_activity_reports_with_divisions
GROUP BY range_id, range_name, division_id, division_name
ORDER BY total_observations DESC;

CREATE OR REPLACE VIEW v_beat_statistics AS
SELECT 
    beat_id,
    beat_name,
    range_id,
    range_name,
    division_id,
    division_name,
    COUNT(*) as total_observations,
    COUNT(CASE WHEN observation_type = 'direct' THEN 1 END) as direct_sightings,
    COUNT(CASE WHEN observation_type = 'indirect' THEN 1 END) as indirect_signs,
    COUNT(CASE WHEN observation_type = 'loss' THEN 1 END) as loss_reports,
    COALESCE(SUM(total_elephants), 0) as total_elephants,
    COUNT(DISTINCT user_id) as unique_observers,
    COUNT(DISTINCT activity_date) as days_with_activity
FROM mv_activity_reports_with_divisions
GROUP BY beat_id, beat_name, range_id, range_name, division_id, division_name
ORDER BY total_observations DESC;

CREATE OR REPLACE VIEW v_activity_heatmap AS
SELECT 
    lat,
    lng,
    COUNT(*) as observation_count,
    COALESCE(SUM(total_elephants), 0) as total_elephants_seen,
    MAX(activity_date) as last_observation_date,
    division_id,
    division_name,
    range_id,
    range_name,
    beat_id,
    beat_name
FROM mv_activity_reports_with_divisions
WHERE lat IS NOT NULL AND lng IS NOT NULL
GROUP BY lat, lng, division_id, division_name, range_id, range_name, beat_id, beat_name
ORDER BY observation_count DESC;

-- Initial refresh of the materialized view
REFRESH MATERIALIZED VIEW mv_activity_reports_with_divisions; 