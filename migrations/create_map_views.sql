-- Create materialized view for division polygons with activity data
CREATE MATERIALIZED VIEW mv_division_polygons AS
SELECT 
    d.id as division_id,
    d.name as division_name,
    dp.polygon as geometry,
    COUNT(DISTINCT ao.id) as observation_count,
    COUNT(DISTINCT CASE WHEN ao.observation_type = 'direct' THEN ao.id END) as direct_sightings,
    COUNT(DISTINCT CASE WHEN ao.observation_type = 'indirect' THEN ao.id END) as indirect_sightings
FROM 
    divisions d
    INNER JOIN division_polygons dp ON d.id = dp.new_division_id
    LEFT JOIN activity_observation ao ON ao.associated_division_id = d.id
GROUP BY 
    d.id, d.name, dp.polygon;

CREATE UNIQUE INDEX idx_mv_division_polygons_id ON mv_division_polygons(division_id);

-- Create materialized view for range polygons with activity data
CREATE MATERIALIZED VIEW mv_range_polygons AS
SELECT 
    r.id as range_id,
    r.name as range_name,
    r.division_id,
    d.name as division_name,
    rp.polygon as geometry,
    COUNT(DISTINCT ao.id) as observation_count,
    COUNT(DISTINCT CASE WHEN ao.observation_type = 'direct' THEN ao.id END) as direct_sightings,
    COUNT(DISTINCT CASE WHEN ao.observation_type = 'indirect' THEN ao.id END) as indirect_sightings
FROM 
    ranges r
    INNER JOIN range_polygons rp ON r.new_id = rp.new_range_id
    INNER JOIN divisions d ON r.division_id = d.id
    LEFT JOIN activity_observation ao ON ao.associated_range_id = r.id
GROUP BY 
    r.id, r.name, r.division_id, d.name, rp.polygon;

CREATE UNIQUE INDEX idx_mv_range_polygons_id ON mv_range_polygons(range_id);

-- Create materialized view for beat polygons with activity data
CREATE MATERIALIZED VIEW mv_beat_polygons AS
SELECT 
    b.id as beat_id,
    b.name as beat_name,
    b.range_id,
    r.name as range_name,
    r.division_id,
    d.name as division_name,
    bp.polygon as geometry,
    COUNT(DISTINCT ao.id) as observation_count,
    COUNT(DISTINCT CASE WHEN ao.observation_type = 'direct' THEN ao.id END) as direct_sightings,
    COUNT(DISTINCT CASE WHEN ao.observation_type = 'indirect' THEN ao.id END) as indirect_sightings
FROM 
    beats b
    INNER JOIN beat_polygons bp ON b.new_beat_id = bp.new_beat_id
    INNER JOIN ranges r ON b.range_id = r.id
    INNER JOIN divisions d ON r.division_id = d.id
    LEFT JOIN activity_observation ao ON ao.associated_beat_id = b.id
GROUP BY 
    b.id, b.name, b.range_id, r.name, r.division_id, d.name, bp.polygon;

CREATE UNIQUE INDEX idx_mv_beat_polygons_id ON mv_beat_polygons(beat_id);

-- Create function to refresh all map views
CREATE OR REPLACE FUNCTION refresh_map_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_division_polygons;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_range_polygons;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_beat_polygons;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT ON mv_division_polygons TO authenticated;
GRANT SELECT ON mv_range_polygons TO authenticated;
GRANT SELECT ON mv_beat_polygons TO authenticated; 