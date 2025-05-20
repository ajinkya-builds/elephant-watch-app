-- Create view for total elephants over time
CREATE OR REPLACE VIEW dashboard_total_elephants AS
SELECT 
    DATE_TRUNC('month', activity_date) as month,
    SUM(total_elephants) as total_elephants
FROM activity_reports
WHERE total_elephants IS NOT NULL
GROUP BY DATE_TRUNC('month', activity_date)
ORDER BY month;

-- Create view for elephant demographics
CREATE OR REPLACE VIEW dashboard_elephant_demographics AS
SELECT 
    SUM(male_elephants) as total_males,
    SUM(female_elephants) as total_females,
    SUM(calves) as total_calves,
    SUM(unknown_elephants) as total_unknown
FROM activity_reports
WHERE activity_date >= CURRENT_DATE - INTERVAL '1 year';

-- Create view for observation types distribution
CREATE OR REPLACE VIEW dashboard_observation_types AS
SELECT 
    observation_type,
    COUNT(*) as count
FROM activity_reports
WHERE observation_type IS NOT NULL
    AND activity_date >= CURRENT_DATE - INTERVAL '1 year'
GROUP BY observation_type;

-- Create view for recent activities
CREATE OR REPLACE VIEW dashboard_recent_activities AS
SELECT 
    activity_date,
    activity_time,
    observation_type,
    total_elephants,
    latitude,
    longitude
FROM activity_reports
WHERE activity_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY activity_date DESC, activity_time DESC
LIMIT 10;

-- Create view for monthly activity trends
CREATE OR REPLACE VIEW dashboard_monthly_trends AS
SELECT 
    DATE_TRUNC('month', activity_date) as month,
    COUNT(*) as total_observations,
    SUM(total_elephants) as total_elephants_seen,
    COUNT(DISTINCT DATE(activity_date)) as days_with_activity
FROM activity_reports
WHERE activity_date >= CURRENT_DATE - INTERVAL '1 year'
GROUP BY DATE_TRUNC('month', activity_date)
ORDER BY month; 