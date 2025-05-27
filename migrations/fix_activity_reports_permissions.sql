-- Grant permissions on the activity_reports table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_reports TO authenticated;

-- Grant permissions on the activity_observation table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_observation TO authenticated;

-- Grant usage on the sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Ensure RLS policies are properly set
ALTER TABLE public.activity_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_observation ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies first
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.activity_reports;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON public.activity_reports;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.activity_reports;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.activity_reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON public.activity_reports;
DROP POLICY IF EXISTS "Users can create their own reports" ON public.activity_reports;
DROP POLICY IF EXISTS "Users can update their own reports" ON public.activity_reports;
DROP POLICY IF EXISTS "Users can delete their own reports" ON public.activity_reports;

-- Create new policies for activity_reports
CREATE POLICY "Users can view their own reports"
ON public.activity_reports FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = activity_reports.user_id
        AND users.auth_id = auth.uid()
    )
);

CREATE POLICY "Users can create their own reports"
ON public.activity_reports FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = activity_reports.user_id
        AND users.auth_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own reports"
ON public.activity_reports FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = activity_reports.user_id
        AND users.auth_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their own reports"
ON public.activity_reports FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = activity_reports.user_id
        AND users.auth_id = auth.uid()
    )
);

-- Create new policies for activity_observation
CREATE POLICY "Users can view their own observations"
ON public.activity_observation FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = activity_observation.user_id
        AND users.auth_id = auth.uid()
    )
);

CREATE POLICY "Users can create their own observations"
ON public.activity_observation FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = activity_observation.user_id
        AND users.auth_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own observations"
ON public.activity_observation FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = activity_observation.user_id
        AND users.auth_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their own observations"
ON public.activity_observation FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = activity_observation.user_id
        AND users.auth_id = auth.uid()
    )
); 