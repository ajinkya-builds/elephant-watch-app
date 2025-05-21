-- Insert test division
INSERT INTO divisions (division_id, name, state, district)
VALUES 
    ('DIV001', 'Test Division', 'Maharashtra', 'Pune');

-- Insert test range
INSERT INTO ranges (range_id, division_id, name, state, district)
VALUES 
    ('RNG001', 'DIV001', 'Test Range', 'Maharashtra', 'Pune');

-- Insert test beat
INSERT INTO beats (beat_id, range_id, name, forest_type, state, district)
VALUES 
    ('BEAT001', 'RNG001', 'Test Beat', 'Reserved Forest', 'Maharashtra', 'Pune');

-- Insert test beat polygon (a simple square around Pune)
INSERT INTO beat_polygons (beat_id, polygon, forest_type)
VALUES 
    ('BEAT001', 
     ST_GeomFromText('POLYGON((73.8567 18.5204, 73.8567 18.5304, 73.8667 18.5304, 73.8667 18.5204, 73.8567 18.5204))', 4326),
     'Reserved Forest');

-- Verify the data with some test queries
-- 1. Check division
SELECT * FROM divisions;

-- 2. Check range and its division
SELECT r.*, d.name as division_name 
FROM ranges r 
JOIN divisions d ON r.division_id = d.division_id;

-- 3. Check beat and its range
SELECT b.*, r.name as range_name, d.name as division_name
FROM beats b 
JOIN ranges r ON b.range_id = r.range_id
JOIN divisions d ON r.division_id = d.division_id;

-- 4. Check beat polygon and its beat
SELECT bp.*, b.name as beat_name, r.name as range_name, d.name as division_name
FROM beat_polygons bp
JOIN beats b ON bp.beat_id = b.beat_id
JOIN ranges r ON b.range_id = r.range_id
JOIN divisions d ON r.division_id = d.division_id;

-- 5. Test spatial query - find beat containing a point
SELECT b.name as beat_name, r.name as range_name, d.name as division_name
FROM beat_polygons bp
JOIN beats b ON bp.beat_id = b.beat_id
JOIN ranges r ON b.range_id = r.range_id
JOIN divisions d ON r.division_id = d.division_id
WHERE ST_Contains(bp.polygon, ST_SetSRID(ST_MakePoint(73.8617, 18.5254), 4326)); 