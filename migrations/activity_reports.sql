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
  latitude TEXT NOT NULL,
  longitude TEXT NOT NULL,
  
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