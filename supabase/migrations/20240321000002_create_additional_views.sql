-- Create view for observation type counts
CREATE OR REPLACE VIEW v_observation_type_counts AS
SELECT 
    observation_type,
    COUNT(*) as count
FROM activity_reports
WHERE observation_type IS NOT NULL
GROUP BY observation_type;

-- Create view for indirect sighting counts
CREATE OR REPLACE VIEW v_indirect_sighting_counts AS
SELECT 
    indirect_sighting_type,
    COUNT(*) as count
FROM activity_reports
WHERE indirect_sighting_type IS NOT NULL
GROUP BY indirect_sighting_type;

-- Create view for loss type counts
CREATE OR REPLACE VIEW v_loss_type_counts AS
SELECT 
    loss_type,
    COUNT(*) as count
FROM activity_reports
WHERE loss_type IS NOT NULL
GROUP BY loss_type;

-- Create view for today's reports
CREATE OR REPLACE VIEW v_today_reports AS
SELECT 
    COUNT(*) as count,
    COUNT(DISTINCT user_id) as unique_users
FROM activity_reports
WHERE activity_date = CURRENT_DATE;

-- Create view for yesterday's reports
CREATE OR REPLACE VIEW v_yesterday_reports AS
SELECT 
    COUNT(*) as count,
    COUNT(DISTINCT user_id) as unique_users
FROM activity_reports
WHERE activity_date = CURRENT_DATE - INTERVAL '1 day';

-- Create view for active elephants (seen in last 7 days)
CREATE OR REPLACE VIEW v_active_elephants AS
SELECT 
    SUM(total_elephants) as count
FROM activity_reports
WHERE activity_date >= CURRENT_DATE - INTERVAL '7 days';

-- Create view for user activity trends
CREATE OR REPLACE VIEW v_user_activity_trends AS
SELECT 
    COUNT(DISTINCT user_id) as current_week_users,
    (
        SELECT COUNT(DISTINCT user_id)
        FROM activity_reports
        WHERE activity_date >= CURRENT_DATE - INTERVAL '14 days'
        AND activity_date < CURRENT_DATE - INTERVAL '7 days'
    ) as previous_week_users
FROM activity_reports
WHERE activity_date >= CURRENT_DATE - INTERVAL '7 days';

-- Create view for report trends
CREATE OR REPLACE VIEW v_report_trends AS
SELECT 
    COUNT(*) as current_week_reports,
    (
        SELECT COUNT(*)
        FROM activity_reports
        WHERE activity_date >= CURRENT_DATE - INTERVAL '14 days'
        AND activity_date < CURRENT_DATE - INTERVAL '7 days'
    ) as previous_week_reports
FROM activity_reports
WHERE activity_date >= CURRENT_DATE - INTERVAL '7 days'; 