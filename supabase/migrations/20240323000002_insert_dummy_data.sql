-- Insert dummy data into activity_reports
INSERT INTO activity_reports (
    activity_date,
    activity_time,
    latitude,
    longitude,
    observation_type,
    total_elephants,
    male_elephants,
    female_elephants,
    unknown_elephants,
    calves,
    indirect_sighting_type,
    loss_type,
    user_id,
    created_at
) VALUES
-- Direct sightings
('2024-03-20', '08:30:00', 11.1234, 76.5678, 'direct', 5, 2, 2, 1, 1, NULL, NULL, 'user1', NOW()),
('2024-03-20', '09:15:00', 11.2345, 76.6789, 'direct', 3, 1, 1, 1, 0, NULL, NULL, 'user2', NOW()),
('2024-03-21', '10:00:00', 11.3456, 76.7890, 'direct', 7, 3, 3, 1, 2, NULL, NULL, 'user1', NOW()),
('2024-03-21', '11:30:00', 11.4567, 76.8901, 'direct', 4, 2, 1, 1, 1, NULL, NULL, 'user3', NOW()),
('2024-03-22', '08:45:00', 11.5678, 76.9012, 'direct', 6, 2, 3, 1, 2, NULL, NULL, 'user2', NOW()),

-- Indirect sightings
('2024-03-20', '14:20:00', 11.6789, 76.0123, 'indirect', NULL, NULL, NULL, NULL, NULL, 'footprints', NULL, 'user1', NOW()),
('2024-03-20', '15:45:00', 11.7890, 76.1234, 'indirect', NULL, NULL, NULL, NULL, NULL, 'dung', NULL, 'user3', NOW()),
('2024-03-21', '13:30:00', 11.8901, 76.2345, 'indirect', NULL, NULL, NULL, NULL, NULL, 'feeding_signs', NULL, 'user2', NOW()),
('2024-03-21', '16:00:00', 11.9012, 76.3456, 'indirect', NULL, NULL, NULL, NULL, NULL, 'footprints', NULL, 'user1', NOW()),
('2024-03-22', '14:15:00', 11.0123, 76.4567, 'indirect', NULL, NULL, NULL, NULL, NULL, 'dung', NULL, 'user3', NOW()),

-- Loss reports
('2024-03-20', '17:30:00', 11.1234, 76.5678, 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'crop_damage', 'user2', NOW()),
('2024-03-20', '18:45:00', 11.2345, 76.6789, 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'property_damage', 'user1', NOW()),
('2024-03-21', '17:00:00', 11.3456, 76.7890, 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'crop_damage', 'user3', NOW()),
('2024-03-21', '19:15:00', 11.4567, 76.8901, 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'property_damage', 'user2', NOW()),
('2024-03-22', '17:45:00', 11.5678, 76.9012, 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'crop_damage', 'user1', NOW()),

-- More direct sightings with different locations
('2024-03-22', '09:30:00', 11.6789, 76.0123, 'direct', 8, 3, 4, 1, 2, NULL, NULL, 'user3', NOW()),
('2024-03-22', '10:45:00', 11.7890, 76.1234, 'direct', 5, 2, 2, 1, 1, NULL, NULL, 'user2', NOW()),
('2024-03-22', '11:30:00', 11.8901, 76.2345, 'direct', 4, 1, 2, 1, 1, NULL, NULL, 'user1', NOW()),

-- More indirect sightings
('2024-03-22', '13:45:00', 11.9012, 76.3456, 'indirect', NULL, NULL, NULL, NULL, NULL, 'feeding_signs', NULL, 'user3', NOW()),
('2024-03-22', '15:00:00', 11.0123, 76.4567, 'indirect', NULL, NULL, NULL, NULL, NULL, 'footprints', NULL, 'user2', NOW()),

-- More loss reports
('2024-03-22', '16:30:00', 11.1234, 76.5678, 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'property_damage', 'user1', NOW()),
('2024-03-22', '18:00:00', 11.2345, 76.6789, 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'crop_damage', 'user3', NOW());

-- Refresh the materialized view to include the new data
REFRESH MATERIALIZED VIEW mv_activity_reports_with_divisions; 