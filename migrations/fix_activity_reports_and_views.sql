-- 1. Drop dependent views
DROP VIEW IF EXISTS v_daily_activity_summary;
DROP VIEW IF EXISTS v_user_performance;

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

-- TODO: Replace the following with your actual v_daily_activity_summary definition!
-- Example placeholder (replace with your real definition):
CREATE VIEW v_daily_activity_summary AS
SELECT 1 AS dummy_column;

-- Provided definition for v_user_performance:
CREATE VIEW v_user_performance AS
 SELECT activity_reports.user_id,
    count(*) AS total_activities,
    count(DISTINCT activity_reports.activity_date) AS days_active,
    sum(activity_reports.total_elephants) AS total_elephants_sighted,
    avg(activity_reports.total_elephants) AS avg_elephants_per_activity,
    max(activity_reports.activity_date) AS last_activity_date
   FROM activity_reports
  GROUP BY activity_reports.user_id; 