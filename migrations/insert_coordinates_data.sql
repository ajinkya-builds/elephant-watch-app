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

-- Insert sample data
INSERT INTO coordinates (uid, "DID", "Division_Name", "SID", "State", division_lat, division_lon, "Division_range", "RID", "Range_Name", "State_range", range_lat, range_lon, "BID", "Beat_Name", "Beat_Ar", "Division_beat", "Range", "State_beat", beat_lat, beat_lon) VALUES
(1, 48, 'Rewa', 14, 'Madhya_Pradesh', 2521366.732, 1955691.018, 'Rewa', 1, 'Atraila', 'Madhya_Pradesh', 2539468.811, 1930842.022, 1, 'Atraila', 13.26702506, 'Rewa', 'Atraila', 'Madhya_Pradesh', 2539906.371, 1936643.871),
(2, 48, 'Rewa', 14, 'Madhya_Pradesh', 2521366.732, 1955691.018, 'Rewa', 1, 'Atraila', 'Madhya_Pradesh', 2539468.811, 1930842.022, 2, 'Chand', 11.48837016, 'Rewa', 'Atraila', 'Madhya_Pradesh', 2532075.623, 1931021.753),
(3, 48, 'Rewa', 14, 'Madhya_Pradesh', 2521366.732, 1955691.018, 'Rewa', 1, 'Atraila', 'Madhya_Pradesh', 2539468.811, 1930842.022, 3, 'Choukhandi', 3.78297592, 'Rewa', 'Atraila', 'Madhya_Pradesh', 2544210.777, 1939807.886),
(4, 48, 'Rewa', 14, 'Madhya_Pradesh', 2521366.732, 1955691.018, 'Rewa', 1, 'Atraila', 'Madhya_Pradesh', 2539468.811, 1930842.022, 4, 'Deokhar', 13.27793467, 'Rewa', 'Atraila', 'Madhya_Pradesh', 2537468.351, 1933957.581),
(5, 48, 'Rewa', 14, 'Madhya_Pradesh', 2521366.732, 1955691.018, 'Rewa', 1, 'Atraila', 'Madhya_Pradesh', 2539468.811, 1930842.022, 12, 'Gurdari_East', 12.31977822, 'Rewa', 'Atraila', 'Madhya_Pradesh', 2544176.523, 1928701.652),
(6, 48, 'Rewa', 14, 'Madhya_Pradesh', 2521366.732, 1955691.018, 'Rewa', 1, 'Atraila', 'Madhya_Pradesh', 2539468.811, 1930842.022, 6, 'Gurdari_West', 8.891673624, 'Rewa', 'Atraila', 'Madhya_Pradesh', 2544160.021, 1925318.168),
(7, 48, 'Rewa', 14, 'Madhya_Pradesh', 2521366.732, 1955691.018, 'Rewa', 1, 'Atraila', 'Madhya_Pradesh', 2539468.811, 1930842.022, 7, 'Gurguda', 11.31206393, 'Rewa', 'Atraila', 'Madhya_Pradesh', 2532791.519, 1928457.473),
(8, 48, 'Rewa', 14, 'Madhya_Pradesh', 2521366.732, 1955691.018, 'Rewa', 1, 'Atraila', 'Madhya_Pradesh', 2539468.811, 1930842.022, 8, 'Harahai', 9.312000983, 'Rewa', 'Atraila', 'Madhya_Pradesh', 2542530.202, 1933944.979),
(9, 48, 'Rewa', 14, 'Madhya_Pradesh', 2521366.732, 1955691.018, 'Rewa', 1, 'Atraila', 'Madhya_Pradesh', 2539468.811, 1930842.022, 9, 'Khamaria', 10.21211589, 'Rewa', 'Atraila', 'Madhya_Pradesh', 2542530.202, 1933944.979),
(10, 48, 'Rewa', 14, 'Madhya_Pradesh', 2521366.732, 1955691.018, 'Rewa', 1, 'Atraila', 'Madhya_Pradesh', 2539468.811, 1930842.022, 10, 'Khamaria', 10.21211589, 'Rewa', 'Atraila', 'Madhya_Pradesh', 2542530.202, 1933944.979); 