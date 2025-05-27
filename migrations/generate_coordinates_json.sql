-- Create a temporary table to store unique combinations with UUIDs
CREATE TEMPORARY TABLE beat_uuids AS
WITH unique_combinations AS (
    SELECT DISTINCT 
        "BID",
        "SID",
        "RID",
        "DID",
        "Beat_Name",
        "Range_Name",
        "Division_Name"
    FROM coordinates
),
uuid_mapping AS (
    SELECT 
        *,
        gen_random_uuid() as beat_uuid
    FROM unique_combinations
)
SELECT * FROM uuid_mapping;

-- Generate JSON output with UUIDs
SELECT json_agg(
    json_build_object(
        'id', beat_uuid,
        'bid', c."BID",
        'sid', c."SID",
        'rid', c."RID",
        'did', c."DID",
        'beat_name', c."Beat_Name",
        'range_name', c."Range_Name",
        'division_name', c."Division_Name",
        'state', c."State",
        'beat_area', c."Beat_Ar",
        'beat_lat', c.beat_lat,
        'beat_lon', c.beat_lon,
        'range_lat', c.range_lat,
        'range_lon', c.range_lon,
        'division_lat', c.division_lat,
        'division_lon', c.division_lon,
        'created_at', NOW()
    )
) as coordinates_json
FROM coordinates c
JOIN beat_uuids u ON 
    c."BID" = u."BID" AND 
    c."SID" = u."SID" AND 
    c."RID" = u."RID" AND 
    c."DID" = u."DID";

-- Clean up temporary table
DROP TABLE beat_uuids; 