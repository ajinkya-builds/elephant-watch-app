-- First drop dependent views
DROP VIEW IF EXISTS v_unknown_elephants CASCADE;
DROP VIEW IF EXISTS v_total_loss CASCADE;
DROP VIEW IF EXISTS v_total_elephants CASCADE;
DROP VIEW IF EXISTS v_male_elephant_counts CASCADE;
DROP VIEW IF EXISTS v_female_elephant_counts CASCADE;
DROP VIEW IF EXISTS v_calve_count CASCADE;
DROP VIEW IF EXISTS v_division_statistics CASCADE;
DROP VIEW IF EXISTS v_activity_heatmap CASCADE;
DROP VIEW IF EXISTS v_recent_observations CASCADE;
DROP VIEW IF EXISTS v_total_observations CASCADE;

-- Drop existing table
DROP TABLE IF EXISTS activity_reports CASCADE;

-- Create the new activity_reports table
CREATE TABLE activity_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Step 1: Date/Time and Location
  activity_date DATE NOT NULL,
  activity_time TIME NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  
  -- Step 2: Type of Observation
  observation_type TEXT CHECK (observation_type IN ('direct', 'indirect', 'loss')),
  total_elephants INTEGER,
  male_elephants INTEGER,
  female_elephants INTEGER,
  unknown_elephants INTEGER,
  calves INTEGER,
  
  -- Indirect Sighting
  indirect_sighting_type TEXT CHECK (
    indirect_sighting_type IN ('Pugmark', 'Dung', 'Broken Branches', 'Sound', 'Eyewitness')
  ),
  
  -- Loss Report
  loss_type TEXT CHECK (
    loss_type IN ('No loss', 'crop', 'livestock', 'property', 'fencing', 'solar panels', 'FD establishment', 'Other')
  ),
  
  -- Step 3: Direction
  compass_bearing NUMERIC,
  
  -- Step 4: Photo
  photo_url TEXT,
  
  -- Metadata
  user_id UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Validation constraints
  CONSTRAINT valid_elephant_counts CHECK (
    (observation_type != 'direct') OR 
    (observation_type = 'direct' AND total_elephants = COALESCE(male_elephants, 0) + COALESCE(female_elephants, 0) + COALESCE(unknown_elephants, 0) + COALESCE(calves, 0))
  ),
  CONSTRAINT valid_observation_type CHECK (
    (observation_type = 'direct' AND total_elephants IS NOT NULL) OR
    (observation_type = 'indirect' AND indirect_sighting_type IS NOT NULL) OR
    (observation_type = 'loss' AND loss_type IS NOT NULL) OR
    (observation_type IS NULL)
  )
);

-- Recreate views
CREATE OR REPLACE VIEW v_unknown_elephants AS
SELECT 
  activity_date,
  SUM(unknown_elephants) as total_unknown
FROM activity_reports
WHERE observation_type = 'direct'
GROUP BY activity_date
ORDER BY activity_date DESC;

CREATE OR REPLACE VIEW v_total_loss AS
SELECT 
  loss_type,
  COUNT(*) as count
FROM activity_reports
WHERE observation_type = 'loss'
GROUP BY loss_type;

CREATE OR REPLACE VIEW v_total_elephants AS
SELECT 
  activity_date,
  SUM(total_elephants) as total_count
FROM activity_reports
WHERE observation_type = 'direct'
GROUP BY activity_date
ORDER BY activity_date DESC;

CREATE OR REPLACE VIEW v_male_elephant_counts AS
SELECT 
  activity_date,
  SUM(male_elephants) as total_males
FROM activity_reports
WHERE observation_type = 'direct'
GROUP BY activity_date
ORDER BY activity_date DESC;

CREATE OR REPLACE VIEW v_female_elephant_counts AS
SELECT 
  activity_date,
  SUM(female_elephants) as total_females
FROM activity_reports
WHERE observation_type = 'direct'
GROUP BY activity_date
ORDER BY activity_date DESC;

CREATE OR REPLACE VIEW v_calve_count AS
SELECT 
  activity_date,
  SUM(calves) as total_calves
FROM activity_reports
WHERE observation_type = 'direct'
GROUP BY activity_date
ORDER BY activity_date DESC;

CREATE OR REPLACE VIEW v_division_statistics AS
SELECT 
  observation_type,
  COUNT(*) as count,
  DATE_TRUNC('month', activity_date) as month
FROM activity_reports
GROUP BY observation_type, DATE_TRUNC('month', activity_date)
ORDER BY month DESC;

CREATE OR REPLACE VIEW v_activity_heatmap AS
SELECT 
  latitude,
  longitude,
  COUNT(*) as activity_count
FROM activity_reports
GROUP BY latitude, longitude;

CREATE OR REPLACE VIEW v_recent_observations AS
SELECT 
  id,
  activity_date,
  activity_time,
  observation_type,
  total_elephants,
  indirect_sighting_type,
  loss_type,
  created_at
FROM activity_reports
ORDER BY created_at DESC
LIMIT 10;

CREATE OR REPLACE VIEW v_total_observations AS
SELECT 
  observation_type,
  COUNT(*) as count
FROM activity_reports
GROUP BY observation_type;

-- Enhanced analytics views
CREATE OR REPLACE VIEW v_elephant_movement_patterns AS
SELECT 
  activity_date,
  activity_time,
  latitude,
  longitude,
  heading_towards,
  total_elephants,
  division_name,
  range_name,
  beat_name
FROM activity_reports
WHERE observation_type = 'direct'
ORDER BY activity_date DESC, activity_time DESC;

CREATE OR REPLACE VIEW v_elephant_population_trends AS
SELECT 
  DATE_TRUNC('month', activity_date) as month,
  SUM(total_elephants) as total_elephants,
  SUM(male_elephants) as male_elephants,
  SUM(female_elephants) as female_elephants,
  SUM(unknown_elephants) as unknown_elephants,
  COUNT(DISTINCT activity_date) as observation_days
FROM activity_reports
WHERE observation_type = 'direct'
GROUP BY DATE_TRUNC('month', activity_date)
ORDER BY month DESC;

CREATE OR REPLACE VIEW v_elephant_activity_by_time AS
SELECT 
  EXTRACT(HOUR FROM activity_time::time) as hour_of_day,
  COUNT(*) as observation_count,
  SUM(total_elephants) as total_elephants_seen
FROM activity_reports
WHERE observation_type = 'direct'
GROUP BY EXTRACT(HOUR FROM activity_time::time)
ORDER BY hour_of_day;

CREATE OR REPLACE VIEW v_elephant_activity_by_season AS
SELECT 
  EXTRACT(MONTH FROM activity_date) as month,
  COUNT(*) as observation_count,
  SUM(total_elephants) as total_elephants_seen,
  CASE 
    WHEN EXTRACT(MONTH FROM activity_date) BETWEEN 3 AND 5 THEN 'Summer'
    WHEN EXTRACT(MONTH FROM activity_date) BETWEEN 6 AND 9 THEN 'Monsoon'
    WHEN EXTRACT(MONTH FROM activity_date) BETWEEN 10 AND 11 THEN 'Post-Monsoon'
    ELSE 'Winter'
  END as season
FROM activity_reports
WHERE observation_type = 'direct'
GROUP BY EXTRACT(MONTH FROM activity_date)
ORDER BY month;

CREATE OR REPLACE VIEW v_elephant_activity_by_land_type AS
SELECT 
  land_type,
  COUNT(*) as observation_count,
  SUM(total_elephants) as total_elephants_seen,
  COUNT(DISTINCT activity_date) as days_with_activity
FROM activity_reports
WHERE observation_type = 'direct'
GROUP BY land_type
ORDER BY observation_count DESC;

CREATE OR REPLACE VIEW v_elephant_activity_by_division AS
SELECT 
  division_name,
  COUNT(*) as observation_count,
  SUM(total_elephants) as total_elephants_seen,
  COUNT(DISTINCT activity_date) as days_with_activity,
  COUNT(DISTINCT range_name) as ranges_covered,
  COUNT(DISTINCT beat_name) as beats_covered
FROM activity_reports
WHERE observation_type = 'direct'
GROUP BY division_name
ORDER BY observation_count DESC;

CREATE OR REPLACE VIEW v_elephant_activity_by_range AS
SELECT 
  division_name,
  range_name,
  COUNT(*) as observation_count,
  SUM(total_elephants) as total_elephants_seen,
  COUNT(DISTINCT activity_date) as days_with_activity,
  COUNT(DISTINCT beat_name) as beats_covered
FROM activity_reports
WHERE observation_type = 'direct'
GROUP BY division_name, range_name
ORDER BY division_name, observation_count DESC;

CREATE OR REPLACE VIEW v_elephant_activity_by_beat AS
SELECT 
  division_name,
  range_name,
  beat_name,
  COUNT(*) as observation_count,
  SUM(total_elephants) as total_elephants_seen,
  COUNT(DISTINCT activity_date) as days_with_activity
FROM activity_reports
WHERE observation_type = 'direct'
GROUP BY division_name, range_name, beat_name
ORDER BY division_name, range_name, observation_count DESC;

CREATE OR REPLACE VIEW v_elephant_activity_timeline AS
SELECT 
  activity_date,
  activity_time,
  division_name,
  range_name,
  beat_name,
  total_elephants,
  male_elephants,
  female_elephants,
  unknown_elephants,
  land_type,
  heading_towards,
  latitude,
  longitude
FROM activity_reports
WHERE observation_type = 'direct'
ORDER BY activity_date DESC, activity_time DESC;

CREATE OR REPLACE VIEW v_elephant_activity_heatmap AS
SELECT 
  latitude,
  longitude,
  COUNT(*) as observation_count,
  SUM(total_elephants) as total_elephants_seen,
  MAX(activity_date) as last_observation_date,
  division_name,
  range_name,
  beat_name
FROM activity_reports
WHERE observation_type = 'direct'
GROUP BY latitude, longitude, division_name, range_name, beat_name
ORDER BY observation_count DESC;

CREATE OR REPLACE VIEW v_elephant_activity_observations_by_type AS
SELECT 
  observation_type as type,
  COUNT(*) as count
FROM activity_reports
GROUP BY observation_type
ORDER BY count DESC;

CREATE OR REPLACE VIEW v_elephant_activity_loss_reports AS
SELECT 
  loss_type,
  COUNT(*) as count
FROM activity_reports
WHERE observation_type = 'loss'
GROUP BY loss_type
ORDER BY count DESC;

CREATE OR REPLACE VIEW v_elephant_activity_summary AS
SELECT 
  DATE_TRUNC('day', activity_date) as date,
  COUNT(*) as total_observations,
  COUNT(CASE WHEN observation_type = 'direct' THEN 1 END) as direct_sightings,
  COUNT(CASE WHEN observation_type = 'indirect' THEN 1 END) as indirect_signs,
  COUNT(CASE WHEN observation_type = 'loss' THEN 1 END) as loss_reports,
  COUNT(DISTINCT division_name) as divisions_covered,
  COUNT(DISTINCT range_name) as ranges_covered,
  COUNT(DISTINCT beat_name) as beats_covered,
  COUNT(DISTINCT user_id) as unique_observers
FROM activity_reports
GROUP BY DATE_TRUNC('day', activity_date)
ORDER BY date DESC; 