-- Function to get division polygon as GeoJSON
CREATE OR REPLACE FUNCTION get_division_polygon(division_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  geojson TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dp.id,
    d.name,
    ST_AsGeoJSON(dp.polygon)::TEXT as geojson
  FROM division_polygons dp
  JOIN divisions d ON d.id = dp.division_id
  WHERE dp.division_id = division_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get range polygon as GeoJSON
CREATE OR REPLACE FUNCTION get_range_polygon(range_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  geojson TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rp.id,
    r.name,
    ST_AsGeoJSON(rp.polygon)::TEXT as geojson
  FROM range_polygons rp
  JOIN ranges r ON r.id = rp.range_id
  WHERE rp.range_id = range_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get beat polygon as GeoJSON
CREATE OR REPLACE FUNCTION get_beat_polygon(beat_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  geojson TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bp.id,
    b.name,
    ST_AsGeoJSON(bp.polygon)::TEXT as geojson
  FROM beat_polygons bp
  JOIN beats b ON b.id = bp.beat_id
  WHERE bp.beat_id = beat_id;
END;
$$ LANGUAGE plpgsql; 