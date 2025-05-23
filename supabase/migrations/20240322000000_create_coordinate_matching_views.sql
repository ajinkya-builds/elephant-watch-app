-- Function to check if a point is within a polygon
CREATE OR REPLACE FUNCTION is_point_in_polygon(
    point_lat double precision,
    point_lng double precision,
    polygon_coords text
) RETURNS boolean AS $$
DECLARE
    polygon geometry;
    point geometry;
BEGIN
    -- Convert the polygon coordinates string to a geometry
    polygon := ST_GeomFromText('POLYGON((' || polygon_coords || '))', 4326);
    -- Create a point geometry from the coordinates
    point := ST_SetSRID(ST_MakePoint(point_lng, point_lat), 4326);
    -- Check if the point is within the polygon
    RETURN ST_Contains(polygon, point);
END;
$$ LANGUAGE plpgsql;

-- View to match activity reports with divisions based on coordinates
CREATE OR REPLACE VIEW v_activity_reports_with_divisions AS
WITH matched_divisions AS (
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
        d.name as division_name,
        r.id as range_id,
        r.name as range_name,
        b.id as beat_id,
        b.name as beat_name
    FROM activity_reports ar
    CROSS JOIN division_polygons dp
    CROSS JOIN divisions d
    CROSS JOIN range_polygons rp
    CROSS JOIN ranges r
    CROSS JOIN beat_polygons bp
    CROSS JOIN beats b
    WHERE is_point_in_polygon(
        ar.latitude::float,
        ar.longitude::float,
        dp.polygon::text
    )
    AND dp.associated_division_id = d.id
    AND is_point_in_polygon(
        ar.latitude::float,
        ar.longitude::float,
        rp.polygon::text
    )
    AND rp.range_id = r.id
    AND r.division_id = d.id
    AND is_point_in_polygon(
        ar.latitude::float,
        ar.longitude::float,
        bp.polygon::text
    )
    AND bp.associated_beat_id = b.id
    AND b.range_id = r.id
)
SELECT DISTINCT ON (id) * FROM matched_divisions;

-- Updated KPI views using the new coordinate-matched data
CREATE OR REPLACE VIEW v_dashboard_kpi_summary AS
SELECT 
    COUNT(*) as total_activities,
    COUNT(DISTINCT user_id) as total_users,
    COUNT(DISTINCT activity_date) as total_days,
    SUM(total_elephants) as total_elephants_sighted,
    COUNT(CASE WHEN activity_date = CURRENT_DATE THEN 1 END) as today_activities,
    COUNT(DISTINCT CASE WHEN activity_date = CURRENT_DATE THEN user_id END) as today_active_users,
    COUNT(CASE WHEN activity_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as weekly_activities,
    COUNT(DISTINCT CASE WHEN activity_date >= CURRENT_DATE - INTERVAL '7 days' THEN user_id END) as weekly_active_users,
    COUNT(DISTINCT division_id) as total_divisions,
    COUNT(DISTINCT range_id) as total_ranges,
    COUNT(DISTINCT beat_id) as total_beats
FROM v_activity_reports_with_divisions;

-- Updated division statistics view
CREATE OR REPLACE VIEW v_division_statistics AS
SELECT 
    division_id,
    division_name,
    COUNT(*) as total_observations,
    COUNT(CASE WHEN observation_type = 'direct' THEN 1 END) as direct_sightings,
    COUNT(CASE WHEN observation_type = 'indirect' THEN 1 END) as indirect_signs,
    COUNT(CASE WHEN observation_type = 'loss' THEN 1 END) as loss_reports,
    SUM(total_elephants) as total_elephants,
    COUNT(DISTINCT user_id) as unique_observers,
    COUNT(DISTINCT activity_date) as days_with_activity
FROM v_activity_reports_with_divisions
GROUP BY division_id, division_name
ORDER BY total_observations DESC;

-- Updated range statistics view
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
    SUM(total_elephants) as total_elephants,
    COUNT(DISTINCT user_id) as unique_observers,
    COUNT(DISTINCT activity_date) as days_with_activity
FROM v_activity_reports_with_divisions
GROUP BY range_id, range_name, division_id, division_name
ORDER BY total_observations DESC;

-- Updated beat statistics view
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
    SUM(total_elephants) as total_elephants,
    COUNT(DISTINCT user_id) as unique_observers,
    COUNT(DISTINCT activity_date) as days_with_activity
FROM v_activity_reports_with_divisions
GROUP BY beat_id, beat_name, range_id, range_name, division_id, division_name
ORDER BY total_observations DESC;

-- Updated activity heatmap view
CREATE OR REPLACE VIEW v_activity_heatmap AS
SELECT 
    lat,
    lng,
    COUNT(*) as observation_count,
    SUM(total_elephants) as total_elephants_seen,
    MAX(activity_date) as last_observation_date,
    division_id,
    division_name,
    range_id,
    range_name,
    beat_id,
    beat_name
FROM v_activity_reports_with_divisions
GROUP BY lat, lng, division_id, division_name, range_id, range_name, beat_id, beat_name
ORDER BY observation_count DESC; 