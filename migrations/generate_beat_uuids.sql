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

-- Create a table to store duplicates
CREATE TEMPORARY TABLE beat_duplicates AS
SELECT 
    "BID",
    "SID",
    "RID",
    "DID",
    COUNT(*) as count
FROM coordinates
GROUP BY "BID", "SID", "RID", "DID"
HAVING COUNT(*) > 1;

-- Show duplicates with their UUIDs
SELECT 
    d.*,
    u.beat_uuid,
    u."Beat_Name",
    u."Range_Name",
    u."Division_Name"
FROM beat_duplicates d
LEFT JOIN beat_uuids u ON 
    d."BID" = u."BID" AND 
    d."SID" = u."SID" AND 
    d."RID" = u."RID" AND 
    d."DID" = u."DID"
ORDER BY count DESC;

-- Create a new table for beats with UUIDs
CREATE TABLE IF NOT EXISTS beats (
    id UUID PRIMARY KEY,
    bid BIGINT NOT NULL,
    sid BIGINT NOT NULL,
    rid BIGINT NOT NULL,
    did BIGINT NOT NULL,
    name TEXT NOT NULL,
    range_name TEXT NOT NULL,
    division_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(bid, sid, rid, did)
);

-- Insert unique combinations into the beats table
INSERT INTO beats (id, bid, sid, rid, did, name, range_name, division_name)
SELECT 
    beat_uuid,
    "BID",
    "SID",
    "RID",
    "DID",
    "Beat_Name",
    "Range_Name",
    "Division_Name"
FROM beat_uuids
ON CONFLICT (bid, sid, rid, did) DO NOTHING;

-- Clean up temporary tables
DROP TABLE beat_uuids;
DROP TABLE beat_duplicates; 