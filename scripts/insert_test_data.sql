-- Insert test data for activity reports
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
    compass_bearing,
    user_id,
    created_at
) VALUES
-- March 20, 2024 - Direct sightings (morning)
('2024-03-20', '06:30:00', '23.5622', '81.01421', 'direct', 5, 2, 2, 0, 1, NULL, NULL, 45, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '07:15:00', '23.5721', '81.113948', 'direct', 3, 1, 1, 0, 1, NULL, NULL, 90, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '08:00:00', '23.6047', '80.99350', 'direct', 7, 3, 3, 0, 1, NULL, NULL, 180, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '08:45:00', '23.6561', '80.968075', 'direct', 4, 1, 2, 0, 1, NULL, NULL, 270, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '09:30:00', '23.7199', '80.9180', 'direct', 6, 2, 3, 0, 1, NULL, NULL, 135, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),

-- March 20, 2024 - Indirect sightings (morning)
('2024-03-20', '06:45:00', '23.5622', '81.01421', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Pugmark', NULL, 45, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '07:30:00', '23.5721', '81.113948', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Dung', NULL, 90, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '08:15:00', '23.6047', '80.99350', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Broken Branches', NULL, 180, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '09:00:00', '23.6561', '80.968075', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Sound', NULL, 270, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '09:45:00', '23.7199', '80.9180', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Eyewitness', NULL, 135, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),

-- March 20, 2024 - Loss reports (morning)
('2024-03-20', '07:00:00', '23.5622', '81.01421', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'crop', 45, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '07:45:00', '23.5721', '81.113948', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'property', 90, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '08:30:00', '23.6047', '80.99350', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'fencing', 180, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '09:15:00', '23.6561', '80.968075', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'solar panels', 270, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '10:00:00', '23.7199', '80.9180', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'FD establishment', 135, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),

-- March 20, 2024 - Direct sightings (afternoon)
('2024-03-20', '12:30:00', '23.5622', '81.01421', 'direct', 8, 3, 4, 0, 1, NULL, NULL, 45, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '13:15:00', '23.5721', '81.113948', 'direct', 4, 1, 2, 0, 1, NULL, NULL, 90, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '14:00:00', '23.6047', '80.99350', 'direct', 6, 2, 3, 0, 1, NULL, NULL, 180, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '14:45:00', '23.6561', '80.968075', 'direct', 5, 2, 2, 0, 1, NULL, NULL, 270, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '15:30:00', '23.7199', '80.9180', 'direct', 7, 3, 3, 0, 1, NULL, NULL, 135, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),

-- March 20, 2024 - Indirect sightings (afternoon)
('2024-03-20', '12:45:00', '23.5622', '81.01421', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Pugmark', NULL, 45, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '13:30:00', '23.5721', '81.113948', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Dung', NULL, 90, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '14:15:00', '23.6047', '80.99350', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Broken Branches', NULL, 180, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '15:00:00', '23.6561', '80.968075', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Sound', NULL, 270, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '15:45:00', '23.7199', '80.9180', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Eyewitness', NULL, 135, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),

-- March 20, 2024 - Loss reports (afternoon)
('2024-03-20', '13:00:00', '23.5622', '81.01421', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'crop', 45, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '13:45:00', '23.5721', '81.113948', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'property', 90, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '14:30:00', '23.6047', '80.99350', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'fencing', 180, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '15:15:00', '23.6561', '80.968075', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'solar panels', 270, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '16:00:00', '23.7199', '80.9180', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'FD establishment', 135, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),

-- March 20, 2024 - Direct sightings (evening)
('2024-03-20', '17:30:00', '23.5622', '81.01421', 'direct', 9, 4, 4, 0, 1, NULL, NULL, 45, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '18:15:00', '23.5721', '81.113948', 'direct', 5, 2, 2, 0, 1, NULL, NULL, 90, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '19:00:00', '23.6047', '80.99350', 'direct', 7, 3, 3, 0, 1, NULL, NULL, 180, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '19:45:00', '23.6561', '80.968075', 'direct', 6, 2, 3, 0, 1, NULL, NULL, 270, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '20:30:00', '23.7199', '80.9180', 'direct', 8, 3, 4, 0, 1, NULL, NULL, 135, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),

-- March 20, 2024 - Indirect sightings (evening)
('2024-03-20', '17:45:00', '23.5622', '81.01421', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Pugmark', NULL, 45, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '18:30:00', '23.5721', '81.113948', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Dung', NULL, 90, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '19:15:00', '23.6047', '80.99350', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Broken Branches', NULL, 180, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '20:00:00', '23.6561', '80.968075', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Sound', NULL, 270, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '20:45:00', '23.7199', '80.9180', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Eyewitness', NULL, 135, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),

-- March 20, 2024 - Loss reports (evening)
('2024-03-20', '18:00:00', '23.5622', '81.01421', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'crop', 45, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '18:45:00', '23.5721', '81.113948', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'property', 90, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '19:30:00', '23.6047', '80.99350', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'fencing', 180, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '20:15:00', '23.6561', '80.968075', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'solar panels', 270, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-20', '21:00:00', '23.7199', '80.9180', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'FD establishment', 135, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),

-- March 21, 2024 - Direct sightings (morning)
('2024-03-21', '06:30:00', '23.5622', '81.01421', 'direct', 6, 2, 3, 0, 1, NULL, NULL, 45, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '07:15:00', '23.5721', '81.113948', 'direct', 4, 1, 2, 0, 1, NULL, NULL, 90, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '08:00:00', '23.6047', '80.99350', 'direct', 8, 3, 4, 0, 1, NULL, NULL, 180, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '08:45:00', '23.6561', '80.968075', 'direct', 5, 2, 2, 0, 1, NULL, NULL, 270, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '09:30:00', '23.7199', '80.9180', 'direct', 7, 3, 3, 0, 1, NULL, NULL, 135, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),

-- March 21, 2024 - Indirect sightings (morning)
('2024-03-21', '06:45:00', '23.5622', '81.01421', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Pugmark', NULL, 45, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '07:30:00', '23.5721', '81.113948', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Dung', NULL, 90, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '08:15:00', '23.6047', '80.99350', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Broken Branches', NULL, 180, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '09:00:00', '23.6561', '80.968075', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Sound', NULL, 270, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '09:45:00', '23.7199', '80.9180', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Eyewitness', NULL, 135, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),

-- March 21, 2024 - Loss reports (morning)
('2024-03-21', '07:00:00', '23.5622', '81.01421', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'crop', 45, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '07:45:00', '23.5721', '81.113948', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'property', 90, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '08:30:00', '23.6047', '80.99350', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'fencing', 180, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '09:15:00', '23.6561', '80.968075', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'solar panels', 270, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '10:00:00', '23.7199', '80.9180', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'FD establishment', 135, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),

-- March 21, 2024 - Direct sightings (afternoon)
('2024-03-21', '12:30:00', '23.5622', '81.01421', 'direct', 7, 3, 3, 0, 1, NULL, NULL, 45, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '13:15:00', '23.5721', '81.113948', 'direct', 5, 2, 2, 0, 1, NULL, NULL, 90, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '14:00:00', '23.6047', '80.99350', 'direct', 9, 4, 4, 0, 1, NULL, NULL, 180, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '14:45:00', '23.6561', '80.968075', 'direct', 6, 2, 3, 0, 1, NULL, NULL, 270, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '15:30:00', '23.7199', '80.9180', 'direct', 8, 3, 4, 0, 1, NULL, NULL, 135, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),

-- March 21, 2024 - Indirect sightings (afternoon)
('2024-03-21', '12:45:00', '23.5622', '81.01421', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Pugmark', NULL, 45, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '13:30:00', '23.5721', '81.113948', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Dung', NULL, 90, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '14:15:00', '23.6047', '80.99350', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Broken Branches', NULL, 180, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '15:00:00', '23.6561', '80.968075', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Sound', NULL, 270, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '15:45:00', '23.7199', '80.9180', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Eyewitness', NULL, 135, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),

-- March 21, 2024 - Loss reports (afternoon)
('2024-03-21', '13:00:00', '23.5622', '81.01421', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'crop', 45, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '13:45:00', '23.5721', '81.113948', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'property', 90, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '14:30:00', '23.6047', '80.99350', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'fencing', 180, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '15:15:00', '23.6561', '80.968075', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'solar panels', 270, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '16:00:00', '23.7199', '80.9180', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'FD establishment', 135, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),

-- March 21, 2024 - Direct sightings (evening)
('2024-03-21', '17:30:00', '23.5622', '81.01421', 'direct', 8, 3, 4, 0, 1, NULL, NULL, 45, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '18:15:00', '23.5721', '81.113948', 'direct', 6, 2, 3, 0, 1, NULL, NULL, 90, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '19:00:00', '23.6047', '80.99350', 'direct', 10, 4, 5, 0, 1, NULL, NULL, 180, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '19:45:00', '23.6561', '80.968075', 'direct', 7, 3, 3, 0, 1, NULL, NULL, 270, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '20:30:00', '23.7199', '80.9180', 'direct', 9, 4, 4, 0, 1, NULL, NULL, 135, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),

-- March 21, 2024 - Indirect sightings (evening)
('2024-03-21', '17:45:00', '23.5622', '81.01421', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Pugmark', NULL, 45, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '18:30:00', '23.5721', '81.113948', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Dung', NULL, 90, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '19:15:00', '23.6047', '80.99350', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Broken Branches', NULL, 180, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '20:00:00', '23.6561', '80.968075', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Sound', NULL, 270, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '20:45:00', '23.7199', '80.9180', 'indirect', NULL, NULL, NULL, NULL, NULL, 'Eyewitness', NULL, 135, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),

-- March 21, 2024 - Loss reports (evening)
('2024-03-21', '18:00:00', '23.5622', '81.01421', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'crop', 45, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '18:45:00', '23.5721', '81.113948', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'property', 90, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '19:30:00', '23.6047', '80.99350', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'fencing', 180, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '20:15:00', '23.6561', '80.968075', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'solar panels', 270, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()),
('2024-03-21', '21:00:00', '23.7199', '80.9180', 'loss', NULL, NULL, NULL, NULL, NULL, NULL, 'FD establishment', 135, '57159f62-d5d4-4ae8-bced-52424e588d87', NOW()); 