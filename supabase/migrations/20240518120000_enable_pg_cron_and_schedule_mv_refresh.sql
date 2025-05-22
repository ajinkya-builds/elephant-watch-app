-- Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the materialized view refresh every 5 minutes
SELECT cron.schedule(
  'refresh_mv_activity_reports_with_divisions',
  '*/5 * * * *',
  'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_activity_reports_with_divisions;'
); 