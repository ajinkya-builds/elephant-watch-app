-- 1. Drop dependent views and materialized views
DROP MATERIALIZED VIEW IF EXISTS mv_realtime_metrics;
DROP VIEW IF EXISTS v_daily_activity_summary;
DROP VIEW IF EXISTS v_user_performance;
DROP VIEW IF EXISTS v_recent_activity_trends;

-- 2. Alter the column and fix RLS
ALTER TABLE public.activity_reports
    ALTER COLUMN user_id SET DATA TYPE uuid USING user_id::uuid,
    ALTER COLUMN user_id SET NOT NULL;

-- Enable RLS and drop all policies
ALTER TABLE public.activity_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.activity_reports;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.activity_reports;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.activity_reports;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.activity_reports;

-- Create correct policies
CREATE POLICY "Enable read access for authenticated users"
ON public.activity_reports FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON public.activity_reports FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid()::uuid = user_id
);

CREATE POLICY "Enable update for users based on user_id"
ON public.activity_reports FOR UPDATE
TO authenticated
USING (
    auth.uid()::uuid = user_id
)
WITH CHECK (
    auth.uid()::uuid = user_id
);

CREATE POLICY "Enable delete for users based on user_id"
ON public.activity_reports FOR DELETE
TO authenticated
USING (
    auth.uid()::uuid = user_id
);

-- Grant permissions
GRANT ALL ON public.activity_reports TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 3. Recreate the views

CREATE VIEW v_daily_activity_summary AS
 SELECT count(*) AS total_observations,
    count(DISTINCT activity_reports.user_id) AS total_users,
    count(DISTINCT activity_reports.activity_date) AS total_days,
    count(*) FILTER (WHERE (activity_reports.activity_date = CURRENT_DATE)) AS today_observations,
    count(DISTINCT activity_reports.user_id) FILTER (WHERE (activity_reports.activity_date = CURRENT_DATE)) AS today_users,
    count(*) FILTER (WHERE (activity_reports.activity_date >= (CURRENT_DATE - '7 days'::interval))) AS weekly_observations,
    count(DISTINCT activity_reports.user_id) FILTER (WHERE (activity_reports.activity_date >= (CURRENT_DATE - '7 days'::interval))) AS weekly_users,
    sum(activity_reports.total_elephants) FILTER (WHERE (activity_reports.observation_type = 'direct'::text)) AS total_elephants_seen,
    sum(activity_reports.male_elephants) FILTER (WHERE (activity_reports.observation_type = 'direct'::text)) AS total_male_elephants,
    sum(activity_reports.female_elephants) FILTER (WHERE (activity_reports.observation_type = 'direct'::text)) AS total_female_elephants,
    sum(activity_reports.calves) FILTER (WHERE (activity_reports.observation_type = 'direct'::text)) AS total_calves,
    sum(activity_reports.unknown_elephants) FILTER (WHERE (activity_reports.observation_type = 'direct'::text)) AS total_unknown_elephants,
    count(*) FILTER (WHERE (activity_reports.observation_type = 'direct'::text)) AS direct_sightings,
    count(*) FILTER (WHERE (activity_reports.observation_type = 'indirect'::text)) AS indirect_signs,
    count(*) FILTER (WHERE (activity_reports.observation_type = 'loss'::text)) AS loss_reports,
    now() AS last_updated
   FROM activity_reports;

CREATE VIEW v_user_performance AS
 SELECT activity_reports.user_id,
    count(*) AS total_activities,
    count(DISTINCT activity_reports.activity_date) AS days_active,
    sum(activity_reports.total_elephants) AS total_elephants_sighted,
    avg(activity_reports.total_elephants) AS avg_elephants_per_activity,
    max(activity_reports.activity_date) AS last_activity_date
   FROM activity_reports
  GROUP BY activity_reports.user_id;

CREATE VIEW v_recent_activity_trends AS
 SELECT activity_reports.activity_date,
    count(*) AS daily_activities,
    sum(activity_reports.total_elephants) AS daily_elephants_sighted,
    count(DISTINCT activity_reports.user_id) AS daily_active_users
   FROM activity_reports
  WHERE (activity_reports.activity_date >= (CURRENT_DATE - '7 days'::interval))
  GROUP BY activity_reports.activity_date
  ORDER BY activity_reports.activity_date DESC;

CREATE MATERIALIZED VIEW mv_realtime_metrics AS
 SELECT count(*) AS total_observations,
    count(DISTINCT activity_reports.user_id) AS total_users,
    count(DISTINCT activity_reports.activity_date) AS total_days,
    count(*) FILTER (WHERE (activity_reports.activity_date = CURRENT_DATE)) AS today_observations,
    count(DISTINCT activity_reports.user_id) FILTER (WHERE (activity_reports.activity_date = CURRENT_DATE)) AS today_users,
    count(*) FILTER (WHERE (activity_reports.activity_date >= (CURRENT_DATE - '7 days'::interval))) AS weekly_observations,
    count(DISTINCT activity_reports.user_id) FILTER (WHERE (activity_reports.activity_date >= (CURRENT_DATE - '7 days'::interval))) AS weekly_users,
    sum(activity_reports.total_elephants) FILTER (WHERE (activity_reports.observation_type = 'direct'::text)) AS total_elephants_seen,
    sum(activity_reports.male_elephants) FILTER (WHERE (activity_reports.observation_type = 'direct'::text)) AS total_male_elephants,
    sum(activity_reports.female_elephants) FILTER (WHERE (activity_reports.observation_type = 'direct'::text)) AS total_female_elephants,
    sum(activity_reports.calves) FILTER (WHERE (activity_reports.observation_type = 'direct'::text)) AS total_calves,
    sum(activity_reports.unknown_elephants) FILTER (WHERE (activity_reports.observation_type = 'direct'::text)) AS total_unknown_elephants,
    count(*) FILTER (WHERE (activity_reports.observation_type = 'direct'::text)) AS direct_sightings,
    count(*) FILTER (WHERE (activity_reports.observation_type = 'indirect'::text)) AS indirect_signs,
    count(*) FILTER (WHERE (activity_reports.observation_type = 'loss'::text)) AS loss_reports,
    now() AS last_updated
   FROM activity_reports; 