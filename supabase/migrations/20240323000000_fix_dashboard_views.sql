-- Drop all dependent views first
DROP VIEW IF EXISTS v_dashboard_kpi_summary;
DROP VIEW IF EXISTS v_division_statistics;
DROP VIEW IF EXISTS v_range_statistics;
DROP VIEW IF EXISTS v_beat_statistics;
DROP VIEW IF EXISTS v_activity_heatmap;
DROP VIEW IF EXISTS v_activity_reports_with_divisions;

-- Recreate the is_point_in_polygon function with better error handling
CREATE OR REPLACE FUNCTION is_point_in_polygon(
    point_lat double precision,
    point_lng double precision,
    polygon_coords text
) RETURNS boolean AS $$
DECLARE
    polygon geometry;
    point geometry;
BEGIN
    -- Handle NULL inputs
    IF point_lat IS NULL OR point_lng IS NULL OR polygon_coords IS NULL THEN
        RETURN false;
    END IF;

    -- Convert the polygon coordinates string to a geometry
    BEGIN
        polygon := ST_GeomFromText('POLYGON((' || polygon_coords || '))', 4326);
    EXCEPTION WHEN OTHERS THEN
        RETURN false;
    END;

    -- Create a point geometry from the coordinates
    BEGIN
        point := ST_SetSRID(ST_MakePoint(point_lng, point_lat), 4326);
    EXCEPTION WHEN OTHERS THEN
        RETURN false;
    END;

    -- Check if the point is within the polygon
    RETURN ST_Contains(polygon, point);
END;
$$ LANGUAGE plpgsql;

-- Create a simpler version of the activity reports with divisions view
CREATE OR REPLACE VIEW v_activity_reports_with_divisions AS
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
LEFT JOIN divisions d ON dp.new_division_id = d.id
LEFT JOIN range_polygons rp ON is_point_in_polygon(ar.latitude::float, ar.longitude::float, rp.polygon::text)
LEFT JOIN ranges r ON rp.range_id = r.id AND r.division_id = d.id
LEFT JOIN beat_polygons bp ON is_point_in_polygon(ar.latitude::float, ar.longitude::float, bp.polygon::text)
LEFT JOIN beats b ON bp.associated_beat_id = b.id AND b.range_id = r.id;

-- Create a simpler version of the dashboard KPI summary view
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
FROM v_activity_reports_with_divisions;

-- Recreate the dependent views
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
FROM v_activity_reports_with_divisions
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
FROM v_activity_reports_with_divisions
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
FROM v_activity_reports_with_divisions
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
FROM v_activity_reports_with_divisions
WHERE lat IS NOT NULL AND lng IS NOT NULL
GROUP BY lat, lng, division_id, division_name, range_id, range_name, beat_id, beat_name
ORDER BY observation_count DESC; 