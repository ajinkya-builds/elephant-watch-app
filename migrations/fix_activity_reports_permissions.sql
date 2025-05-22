-- Grant permissions on the materialized view to authenticated users
GRANT SELECT ON public.mv_activity_reports_with_divisions TO authenticated;

-- Grant permissions on the activity_reports table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_reports TO authenticated;

-- Grant permissions on the activity_observation table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_observation TO authenticated;

-- Grant usage on the sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Ensure RLS policies are properly set
ALTER TABLE public.activity_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_observation ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own reports" ON public.activity_reports;
DROP POLICY IF EXISTS "Users can create their own reports" ON public.activity_reports;
DROP POLICY IF EXISTS "Users can update their own reports" ON public.activity_reports;
DROP POLICY IF EXISTS "Users can delete their own reports" ON public.activity_reports;

DROP POLICY IF EXISTS "Users can view their own observations" ON public.activity_observation;
DROP POLICY IF EXISTS "Users can create their own observations" ON public.activity_observation;
DROP POLICY IF EXISTS "Users can update their own observations" ON public.activity_observation;
DROP POLICY IF EXISTS "Users can delete their own observations" ON public.activity_observation;

-- Create new policies for activity_reports
CREATE POLICY "Users can view their own reports"
ON public.activity_reports FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports"
ON public.activity_reports FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
ON public.activity_reports FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
ON public.activity_reports FOR DELETE
USING (auth.uid() = user_id);

-- Create new policies for activity_observation
CREATE POLICY "Users can view their own observations"
ON public.activity_observation FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own observations"
ON public.activity_observation FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own observations"
ON public.activity_observation FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own observations"
ON public.activity_observation FOR DELETE
USING (auth.uid() = user_id); 