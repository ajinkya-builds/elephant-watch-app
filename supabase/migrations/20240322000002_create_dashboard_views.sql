-- Drop existing views if they exist
DROP VIEW IF EXISTS v_dashboard_kpi_summary CASCADE;
DROP VIEW IF EXISTS v_dashboard_monthly_trends CASCADE;
DROP VIEW IF EXISTS v_dashboard_division_stats CASCADE;

-- Create view for KPI summary
CREATE OR REPLACE VIEW v_dashboard_kpi_summary AS
WITH observation_counts AS (
  SELECT
    -- Overall counts
    COUNT(*) as total_observations,
    COUNT(*) FILTER (WHERE observation_type = 'Direct Sighting') as direct_sightings,
    COUNT(*) FILTER (WHERE observation_type = 'Indirect Signs') as indirect_sightings,
    COUNT(*) FILTER (WHERE loss_type IS NOT NULL) as total_loss,
    
    -- Today's counts
    COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as today_observations,
    COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE AND observation_type = 'Direct Sighting') as today_direct_sightings,
    COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE AND observation_type = 'Indirect Signs') as today_indirect_sightings,
    COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE AND loss_type IS NOT NULL) as today_loss,
    
    -- Elephant counts
    SUM(total_elephants) as total_elephants,
    SUM(male_elephants) as male_elephants,
    SUM(female_elephants) as female_elephants,
    SUM(calves) as calves,
    SUM(unknown_elephants) as unknown_elephants,
    
    -- User counts
    COUNT(DISTINCT user_id) as total_users,
    COUNT(DISTINCT CASE WHEN DATE(created_at) = CURRENT_DATE THEN user_id END) as today_users,
    COUNT(DISTINCT CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN user_id END) as weekly_users
  FROM activity_observation
)
SELECT
  total_observations,
  direct_sightings,
  indirect_sightings,
  total_loss,
  today_observations,
  today_direct_sightings,
  today_indirect_sightings,
  today_loss,
  total_elephants,
  male_elephants,
  female_elephants,
  calves,
  unknown_elephants,
  total_users,
  today_users,
  weekly_users,
  CURRENT_TIMESTAMP as last_updated
FROM observation_counts;

-- Create view for monthly trends
CREATE OR REPLACE VIEW v_dashboard_monthly_trends AS
SELECT
  DATE_TRUNC('month', activity_date) as month,
  COUNT(*) as total_observations,
  SUM(total_elephants) as total_elephants,
  COUNT(*) FILTER (WHERE observation_type = 'Direct Sighting') as direct_sightings,
  COUNT(*) FILTER (WHERE observation_type = 'Indirect Signs') as indirect_sightings,
  COUNT(*) FILTER (WHERE loss_type IS NOT NULL) as loss_reports
FROM activity_observation
WHERE activity_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', activity_date)
ORDER BY month DESC;

-- Create view for division statistics
CREATE OR REPLACE VIEW v_dashboard_division_stats AS
SELECT
  associated_division,
  COUNT(*) as total_observations,
  COUNT(*) FILTER (WHERE observation_type = 'Direct Sighting') as direct_sightings,
  COUNT(*) FILTER (WHERE observation_type = 'Indirect Signs') as indirect_sightings,
  COUNT(*) FILTER (WHERE loss_type IS NOT NULL) as loss_reports,
  SUM(total_elephants) as total_elephants
FROM activity_observation
GROUP BY associated_division
ORDER BY total_observations DESC;

-- Grant access to authenticated users
GRANT SELECT ON v_dashboard_kpi_summary TO authenticated;
GRANT SELECT ON v_dashboard_monthly_trends TO authenticated;
GRANT SELECT ON v_dashboard_division_stats TO authenticated; 