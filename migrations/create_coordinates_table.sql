-- Create coordinates table
CREATE TABLE IF NOT EXISTS coordinates (
    uid bigint NOT NULL,
    "DID" bigint,
    "Division_Name" text,
    "SID" bigint,
    "State" text,
    division_lat double precision,
    division_lon double precision,
    "Division_range" text,
    "RID" bigint,
    "Range_Name" text,
    "State_range" text,
    range_lat double precision,
    range_lon double precision,
    "BID" bigint,
    "Beat_Name" text,
    "Beat_Ar" double precision,
    "Division_beat" text,
    "Range" text,
    "State_beat" text,
    beat_lat double precision,
    beat_lon double precision,
    PRIMARY KEY (uid)
);

-- Copy data from backup
\copy coordinates FROM 'backup_before_migration.sql' WITH (FORMAT text, DELIMITER E'\t', QUOTE '"', ESCAPE '\\', NULL 'NULL'); 