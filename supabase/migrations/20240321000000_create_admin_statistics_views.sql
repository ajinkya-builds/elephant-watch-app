-- Admin Statistics Views

-- User Statistics View
CREATE OR REPLACE VIEW v_admin_user_stats AS
SELECT 
    COUNT(DISTINCT u.id) as total_users,
    COUNT(DISTINCT u.id) FILTER (WHERE u.status = 'active') as active_users,
    COUNT(DISTINCT u.id) FILTER (WHERE au.last_sign_in_at >= NOW() - INTERVAL '24 hours') as daily_active_users,
    COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'admin') as total_admins,
    COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'moderator') as total_moderators,
    COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'user') as total_regular_users,
    COUNT(DISTINCT u.id) FILTER (WHERE u.created_at >= NOW() - INTERVAL '7 days') as new_users_7d,
    COUNT(DISTINCT u.id) FILTER (WHERE u.created_at >= NOW() - INTERVAL '30 days') as new_users_30d
FROM public.users u
JOIN auth.users au ON u.auth_id = au.id
WHERE au.deleted_at IS NULL;

-- Activity Statistics View
CREATE OR REPLACE VIEW v_admin_activity_stats AS
SELECT 
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as records_24h,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as records_7d,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as records_30d,
    COUNT(DISTINCT user_id) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as active_users_24h,
    COUNT(DISTINCT user_id) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as active_users_7d,
    COUNT(DISTINCT user_id) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as active_users_30d
FROM activity_reports;

-- System Health View
CREATE OR REPLACE VIEW v_admin_system_health AS
SELECT 
    (SELECT COUNT(*) FROM error_logs WHERE time >= NOW() - INTERVAL '24 hours') as errors_24h,
    (SELECT COUNT(*) FROM error_logs WHERE time >= NOW() - INTERVAL '7 days') as errors_7d,
    (SELECT COUNT(*) FROM login_logs WHERE status = 'Failed' AND time >= NOW() - INTERVAL '24 hours') as failed_logins_24h,
    (SELECT COUNT(*) FROM login_logs WHERE status = 'Failed' AND time >= NOW() - INTERVAL '7 days') as failed_logins_7d,
    (SELECT COUNT(*) FROM system_logs WHERE status = 'Failed' AND time >= NOW() - INTERVAL '24 hours') as system_failures_24h,
    (SELECT COUNT(*) FROM system_logs WHERE status = 'Failed' AND time >= NOW() - INTERVAL '7 days') as system_failures_7d;

-- User Activity Timeline View
CREATE OR REPLACE VIEW v_admin_user_activity_timeline AS
SELECT 
    date_trunc('hour', time) as hour,
    COUNT(*) as activity_count,
    COUNT(DISTINCT email) as unique_users
FROM login_logs
WHERE time >= NOW() - INTERVAL '7 days'
GROUP BY hour
ORDER BY hour ASC;

-- Record Creation Timeline View
CREATE OR REPLACE VIEW v_admin_record_creation_timeline AS
SELECT 
    date_trunc('day', created_at) as day,
    COUNT(*) as record_count,
    COUNT(DISTINCT user_id) as unique_users
FROM activity_reports
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY day
ORDER BY day DESC;

-- Resource Utilization View
CREATE OR REPLACE VIEW v_admin_resource_utilization AS
SELECT 
    date_trunc('hour', time) as hour,
    COUNT(*) as request_count,
    COUNT(*) FILTER (WHERE status = 'Failed') as error_count
FROM system_logs
WHERE time >= NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;

-- Recent Activity Feed View
CREATE OR REPLACE VIEW v_admin_recent_activity AS
SELECT 
    'login' as event_type,
    COALESCE(u.email, au.email) as user,
    ll.time as event_time,
    ll.status as details
FROM login_logs ll
LEFT JOIN auth.users au ON ll.email = au.email
LEFT JOIN public.users u ON au.id = u.auth_id
WHERE ll.time >= NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
    'error' as event_type,
    'System' as user,
    time as event_time,
    message as details
FROM error_logs
WHERE time >= NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
    'system' as event_type,
    'System' as user,
    time as event_time,
    job as details
FROM system_logs
WHERE time >= NOW() - INTERVAL '24 hours'
ORDER BY event_time DESC
LIMIT 50;

-- Map Observations View
CREATE OR REPLACE VIEW v_map_observations AS
SELECT 
    ao.id,
    ao.latitude,
    ao.longitude,
    ao.activity_date,
    ao.activity_time,
    ao.observation_type,
    ao.total_elephants,
    ao.male_elephants,
    ao.female_elephants,
    ao.unknown_elephants,
    ao.calves,
    ao.indirect_sighting_type,
    ao.loss_type,
    ao.compass_bearing,
    ao.photo_url,
    ao.associated_division,
    ao.associated_range,
    ao.associated_beat,
    u.email as observer_email,
    CONCAT(u.first_name, ' ', u.last_name) as observer_name,
    ao.created_at
FROM activity_observation ao
LEFT JOIN users u ON ao.user_id = u.id
WHERE ao.latitude IS NOT NULL 
  AND ao.longitude IS NOT NULL
ORDER BY ao.created_at DESC; 