-- Create view for daily activity summary
CREATE OR REPLACE VIEW v_daily_activity_summary AS
SELECT 
    activity_date,
    COUNT(*) as total_activities,
    COUNT(DISTINCT user_id) as unique_users,
    SUM(total_elephants) as total_elephants_sighted,
    SUM(female_elephants) as female_elephants_sighted,
    SUM(male_elephants) as male_elephants_sighted,
    SUM(calves) as calves_sighted,
    SUM(unknown_elephants) as unknown_elephants_sighted
FROM activity_reports
GROUP BY activity_date
ORDER BY activity_date DESC;

-- Create view for user performance metrics
CREATE OR REPLACE VIEW v_user_performance AS
SELECT 
    user_id,
    COUNT(*) as total_activities,
    COUNT(DISTINCT activity_date) as days_active,
    SUM(total_elephants) as total_elephants_sighted,
    AVG(total_elephants) as avg_elephants_per_activity,
    MAX(activity_date) as last_activity_date
FROM activity_reports
GROUP BY user_id;

-- Create view for observation type distribution
CREATE OR REPLACE VIEW v_observation_type_stats AS
SELECT 
    observation_type,
    COUNT(*) as count,
    ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM activity_reports) * 100, 2) as percentage
FROM activity_reports
WHERE observation_type IS NOT NULL
GROUP BY observation_type
ORDER BY count DESC;

-- Create view for recent activity trends (last 7 days)
CREATE OR REPLACE VIEW v_recent_activity_trends AS
SELECT 
    activity_date,
    COUNT(*) as daily_activities,
    SUM(total_elephants) as daily_elephants_sighted,
    COUNT(DISTINCT user_id) as daily_active_users
FROM activity_reports
WHERE activity_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY activity_date
ORDER BY activity_date DESC;

-- Create view for elephant population distribution
CREATE OR REPLACE VIEW v_elephant_population_stats AS
SELECT 
    SUM(female_elephants) as total_females,
    SUM(male_elephants) as total_males,
    SUM(calves) as total_calves,
    SUM(unknown_elephants) as total_unknown,
    SUM(total_elephants) as grand_total,
    ROUND(AVG(total_elephants), 2) as avg_elephants_per_sighting
FROM activity_reports;

-- Create view for hourly activity distribution
CREATE OR REPLACE VIEW v_hourly_activity_distribution AS
SELECT 
    EXTRACT(HOUR FROM activity_time) as hour_of_day,
    COUNT(*) as activity_count,
    SUM(total_elephants) as elephants_sighted
FROM activity_reports
GROUP BY hour_of_day
ORDER BY hour_of_day;

-- Create view for loss type statistics
CREATE OR REPLACE VIEW v_loss_type_stats AS
SELECT 
    loss_type,
    COUNT(*) as count,
    ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM activity_reports WHERE loss_type IS NOT NULL) * 100, 2) as percentage
FROM activity_reports
WHERE loss_type IS NOT NULL
GROUP BY loss_type
ORDER BY count DESC;

-- Create view for indirect sighting statistics
CREATE OR REPLACE VIEW v_indirect_sighting_stats AS
SELECT 
    indirect_sighting_type,
    COUNT(*) as count,
    ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM activity_reports WHERE indirect_sighting_type IS NOT NULL) * 100, 2) as percentage
FROM activity_reports
WHERE indirect_sighting_type IS NOT NULL
GROUP BY indirect_sighting_type
ORDER BY count DESC;

-- Create view for overall KPI summary
CREATE OR REPLACE VIEW v_dashboard_kpi_summary AS
SELECT 
    (SELECT COUNT(*) FROM activity_reports) as total_activities,
    (SELECT COUNT(DISTINCT user_id) FROM activity_reports) as total_users,
    (SELECT COUNT(DISTINCT activity_date) FROM activity_reports) as total_days,
    (SELECT SUM(total_elephants) FROM activity_reports) as total_elephants_sighted,
    (SELECT COUNT(*) FROM activity_reports WHERE activity_date = CURRENT_DATE) as today_activities,
    (SELECT COUNT(DISTINCT user_id) FROM activity_reports WHERE activity_date = CURRENT_DATE) as today_active_users,
    (SELECT COUNT(*) FROM activity_reports WHERE activity_date >= CURRENT_DATE - INTERVAL '7 days') as weekly_activities,
    (SELECT COUNT(DISTINCT user_id) FROM activity_reports WHERE activity_date >= CURRENT_DATE - INTERVAL '7 days') as weekly_active_users; 